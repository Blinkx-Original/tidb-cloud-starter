import algoliasearch, { SearchClient } from 'algoliasearch';
import { fetchProductsSince, readCheckpoint, writeCheckpoint } from './tidb';
import { transformRow } from './transform';
import { createLog, finalizeLog, fetchLatestLog, toSummary } from './log';
import { ProductDTO, SyncSummary } from './types';

const DEFAULT_BATCH_SIZE = 1000;
const DEFAULT_MAX_DURATION = 10 * 60 * 1000;

type RunOptions = {
  batchSize?: number;
  maxDurationMs?: number;
  triggeredBy?: 'manual' | 'cron';
};

type TargetInfo = {
  targetIndex: string;
};

function env(name: string): string {
  const value = process.env[name];
  if (!value || !value.trim()) {
    throw new Error(`Missing environment variable ${name}`);
  }
  return value.trim();
}

function getClient(): SearchClient {
  const appId = env('ALGOLIA_APP_ID');
  const apiKey = (process.env.ALGOLIA_ADMIN_API_KEY || process.env.ALGOLIA_ADMIN_KEY || '').trim();
  if (!apiKey) {
    throw new Error('Missing Algolia admin API key. Provide ALGOLIA_ADMIN_API_KEY.');
  }
  return algoliasearch(appId, apiKey);
}

function getIndexNames() {
  return {
    primary: env('ALGOLIA_INDEX_PRIMARY'),
    blue: env('ALGOLIA_INDEX_BLUE'),
    green: env('ALGOLIA_INDEX_GREEN'),
  };
}

async function resolveTargetIndex(): Promise<TargetInfo> {
  const { blue, green } = getIndexNames();
  const lastLog = await fetchLatestLog('algolia');
  const lastTarget = (lastLog?.notes?.targetIndex as string) || null;
  if (lastTarget === blue) {
    return { targetIndex: green };
  }
  if (lastTarget === green) {
    return { targetIndex: blue };
  }
  return { targetIndex: blue };
}

async function applySettings(client: SearchClient, indexName: string, primaryName: string) {
  const index = client.initIndex(indexName);
  const settingsTask = await index.setSettings({
    searchableAttributes: ['name', 'brand', 'categories', 'attributes'],
    attributesForFaceting: [
      'filterOnly(isPublished)',
      'searchable(categories)',
      'brand',
      'stockStatus',
    ],
    customRanking: ['desc(isPublished)', 'asc(price)'],
    attributesToRetrieve: [
      'objectID',
      'slug',
      'url',
      'name',
      'brand',
      'price',
      'currency',
      'images',
      'categories',
      'stockStatus',
    ],
    attributesToHighlight: ['name', 'brand'],
    replicas: [`${primaryName}_price_asc`, `${primaryName}_price_desc`],
  });
  await index.waitTask(settingsTask.taskID);

  const asc = client.initIndex(`${primaryName}_price_asc`);
  const ascTask = await asc.setSettings({
    ranking: ['asc(price)', 'typo', 'geo', 'words', 'filters', 'proximity', 'attribute', 'exact', 'custom'],
  });
  await asc.waitTask(ascTask.taskID);

  const desc = client.initIndex(`${primaryName}_price_desc`);
  const descTask = await desc.setSettings({
    ranking: ['desc(price)', 'typo', 'geo', 'words', 'filters', 'proximity', 'attribute', 'exact', 'custom'],
  });
  await desc.waitTask(descTask.taskID);
}

async function prepareTargetIndex(client: SearchClient, targetIndex: string, primaryIndex: string) {
  const target = client.initIndex(targetIndex);
  let cloned = false;
  try {
    const copyTask = await client.copyIndex(primaryIndex, targetIndex);
    await target.waitTask(copyTask.taskID);
    cloned = true;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!/index does not exist/i.test(message)) {
      throw error;
    }
  }
  if (!cloned) {
    const clearTask = await target.clearObjects();
    await target.waitTask(clearTask.taskID);
  }
}

async function copyToPrimary(client: SearchClient, fromIndex: string, primaryIndex: string) {
  const task = await client.copyIndex(fromIndex, primaryIndex);
  const primary = client.initIndex(primaryIndex);
  await primary.waitTask(task.taskID);
  await applySettings(client, primaryIndex, primaryIndex);
}

function filterForAlgolia(product: ProductDTO): ProductDTO | null {
  if (!product.isPublished) return null;
  return product;
}

export async function runAlgoliaSync(options: RunOptions = {}): Promise<SyncSummary> {
  const batchSize = options.batchSize ?? DEFAULT_BATCH_SIZE;
  const maxDuration = options.maxDurationMs ?? DEFAULT_MAX_DURATION;
  const client = getClient();
  const { primary } = getIndexNames();
  const { targetIndex } = await resolveTargetIndex();

  const logId = await createLog('algolia');
  const startedAt = new Date();
  let ok = 0;
  let failed = 0;
  const warnings: string[] = [];
  const checkpoint = await readCheckpoint('algolia');
  let cursor = checkpoint?.lastUpdatedAt ?? null;
  let lastProcessed: Date | null = null;

  try {
    await prepareTargetIndex(client, targetIndex, primary);
    await applySettings(client, targetIndex, primary);

    const target = client.initIndex(targetIndex);
    const startTime = Date.now();

    for (;;) {
      if (Date.now() - startTime > maxDuration) {
        warnings.push('Max duration reached, sync paused.');
        break;
      }
      const rows = await fetchProductsSince(cursor, batchSize);
      if (!rows.length) break;
      const objects: ProductDTO[] = [];
      for (const row of rows) {
        const { product, warnings: rowWarnings } = transformRow(row);
        warnings.push(...rowWarnings);
        const filtered = filterForAlgolia(product);
        if (filtered) {
          objects.push(filtered);
          ok += 1;
        } else {
          ok += 1;
        }
        lastProcessed = new Date(product.updatedAt);
      }
      if (objects.length) {
        await target.saveObjects(objects, { autoGenerateObjectIDIfNotExist: false });
      }
      if (rows.length < batchSize) {
        break;
      }
      cursor = lastProcessed;
    }

    if (lastProcessed) {
      await writeCheckpoint('algolia', lastProcessed);
    }

    await copyToPrimary(client, targetIndex, primary);

    const finishedAt = new Date();
    await finalizeLog(logId, {
      ok,
      failed,
      notes: {
        targetIndex,
        warnings,
        checkpoint: lastProcessed ? lastProcessed.toISOString() : null,
        triggeredBy: options.triggeredBy || 'manual',
      },
      error: null,
    });

    return {
      target: 'algolia',
      startedAt: startedAt.toISOString(),
      finishedAt: finishedAt.toISOString(),
      ok,
      failed,
      notes: {
        targetIndex,
        warnings,
      },
      checkpoint: lastProcessed ? lastProcessed.toISOString() : null,
    };
  } catch (error) {
    await finalizeLog(logId, { ok, failed: failed || 1, notes: { targetIndex, warnings }, error: error as Error });
    throw error;
  }
}

export async function getAlgoliaStatus(): Promise<SyncSummary | null> {
  const log = await fetchLatestLog('algolia');
  return toSummary('algolia', log);
}
