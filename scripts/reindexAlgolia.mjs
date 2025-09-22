/* eslint-disable no-console */
import fs from 'node:fs';
import path from 'node:path';
import algoliasearch from 'algoliasearch';

const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID;
const adminKey = process.env.ALGOLIA_ADMIN_KEY;
const prefix = process.env.ALGOLIA_INDEX_PREFIX || 'catalog';

if (!appId || !adminKey) {
  console.error('Missing Algolia env vars. Check NEXT_PUBLIC_ALGOLIA_APP_ID and ALGOLIA_ADMIN_KEY.');
  process.exit(1);
}

const client = algoliasearch(appId, adminKey);
const indexBase = `${prefix}__items`;

function readSettings() {
  const p = path.join(process.cwd(), 'algolia', 'indexSettings.json');
  return JSON.parse(fs.readFileSync(p, 'utf-8'));
}

function readDemoData() {
  const p = path.join(process.cwd(), 'public', 'demo-catalog.json');
  if (!fs.existsSync(p)) return [];
  return JSON.parse(fs.readFileSync(p, 'utf-8'));
}

function toRecords(arr) {
  return arr.map((r, i) => ({
    objectID: String(r.id ?? i + 1),
    title: r.title,
    description: r.description,
    url: r.url,
    image: r.image,
    category: r.category,
    tags: r.tags,
    brand: r.brand,
    price: r.price,
    rating: r.rating,
    city: r.city,
    state: r.state,
    country: r.country
  }));
}

async function ensureSortReplicas(settings) {
  const priceAsc = `${indexBase}_price_asc`;
  const priceDesc = `${indexBase}_price_desc`;

  await client.copyIndex(indexBase, priceAsc, { scope: ['settings', 'synonyms', 'rules'] }).catch(() => {});
  await client.copyIndex(indexBase, priceDesc, { scope: ['settings', 'synonyms', 'rules'] }).catch(() => {});

  await client.initIndex(priceAsc).setSettings({ ranking: ['asc(price)', ...settings.ranking] });
  await client.initIndex(priceDesc).setSettings({ ranking: ['desc(price)', ...settings.ranking] });
}

async function main() {
  const index = client.initIndex(indexBase);
  const settings = readSettings();

  console.log('Applying index settings to', indexBase);
  await index.setSettings(settings);

  console.log('Ensuring sort replicas…');
  await ensureSortReplicas(settings);

  const data = readDemoData();
  if (!data.length) {
    console.warn('No data found in public/demo-catalog.json');
  } else {
    const records = toRecords(data);
    console.log(`Uploading ${records.length} records…`);
    await index.replaceAllObjects(records, { autoGenerateObjectIDIfNotExist: false });
    console.log('Done.');
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
