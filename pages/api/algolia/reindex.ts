// Reindexa tu BD (o payload POST) en Algolia. Protegido por ?secret=...
import type { NextApiRequest, NextApiResponse } from 'next';
import {
  adminClient,        // instancia del cliente (ya creada)
  itemsIndexName,     // string: catalog__items
  itemsIndex,         // instancia del índice principal
  itemsIndexAsc,      // instancia replica asc
  itemsIndexDesc,     // instancia replica desc
} from '@/lib/algoliaAdmin';

// ----------------- Helpers -----------------
function fallbackId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function mapToAlgolia(o: any) {
  const id = o?.id ?? o?.objectID ?? o?.slug ?? fallbackId();
  const title = o?.title ?? o?.name ?? o?.productName ?? '';
  const description = o?.description ?? o?.summary ?? '';
  const brand = o?.brand ?? '';
  const category = o?.category?.name ?? o?.category ?? '';
  const tags =
    Array.isArray(o?.tags)
      ? o.tags
      : o?.tags
      ? String(o.tags).split(',').map((s: string) => s.trim())
      : [];
  const price = Number(o?.price ?? o?.amount ?? 0);
  const rating = Number(o?.rating ?? o?.stars ?? 0);
  const slug = o?.slug ?? id;

  return {
    objectID: String(id),
    title,
    description,
    brand,
    category,
    tags,
    price,
    rating,
    url: o?.url ?? `/product/${slug}`,
  };
}

async function loadFromPrisma(): Promise<any[]> {
  try {
    const { PrismaClient } = await import('@prisma/client');
    const prisma: any = new (PrismaClient as any)();

    const accessor = (process.env.ALGOLIA_PRISMA_MODEL || 'product').toString();

    const rows: any[] = await prisma[accessor]?.findMany?.({
      include: { category: true },
    });

    await prisma.$disconnect?.();
    return Array.isArray(rows) ? rows : [];
  } catch {
    return [];
  }
}

// ----------------- Handler -----------------
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.query.secret !== process.env.ALGOLIA_WEBHOOK_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    let records: any[] = [];

    if (req.method === 'POST') {
      if (!Array.isArray(req.body)) {
        return res.status(400).json({ error: 'POST body must be an array of objects' });
      }
      records = req.body;
    } else {
      // GET → intenta leer desde Prisma
      records = await loadFromPrisma();
    }

    if (!records.length) {
      return res.status(200).json({
        ok: false,
        message:
          'Sin registros. Enviá un POST con array de objetos o define ALGOLIA_PRISMA_MODEL para leer desde Prisma.',
      });
    }

    // Settings idempotentes
    await itemsIndex.setSettings({
      searchableAttributes: ['title', 'unordered(description)', 'brand', 'category', 'tags'],
      attributesForFaceting: ['searchable(category)', 'searchable(brand)', 'searchable(tags)'],
      queryType: 'prefixAll',
      ignorePlurals: true,
      removeStopWords: true,
      typoTolerance: 'min',
      customRanking: ['desc(rating)', 'asc(price)'],
      replicas: [`${itemsIndexName}_price_asc`, `${itemsIndexName}_price_desc`],
    });

    await itemsIndexAsc.setSettings({
      ranking: ['asc(price)', 'typo', 'geo', 'words', 'filters', 'proximity', 'attribute', 'exact', 'custom'],
    });
    await itemsIndexDesc.setSettings({
      ranking: ['desc(price)', 'typo', 'geo', 'words', 'filters', 'proximity', 'attribute', 'exact', 'custom'],
    });

    const objects = records.map(mapToAlgolia);

    // Guarda en el índice principal
    const r = await itemsIndex.saveObjects(objects, { autoGenerateObjectIDIfNotExist: true });

    return res.status(200).json({ ok: true, indexed: objects.length, taskIDs: r.taskIDs });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: err?.message || 'Index error' });
  }
}
