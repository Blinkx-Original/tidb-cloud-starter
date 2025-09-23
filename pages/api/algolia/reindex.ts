// Reindexa tu BD en Algolia (protección por ?secret=...)
// No rompe el build aunque cambie tu esquema Prisma.
// Si no usas Prisma, podés enviar los objetos por POST.

import type { NextApiRequest, NextApiResponse } from 'next';
import { adminClient, getAdminIndexName } from '@/lib/algoliaAdmin';

// --- Helpers ---------------------------------------------------------------

function mapToAlgolia(o: any) {
  const id = o.id ?? o.objectID ?? o.slug ?? crypto.randomUUID?.() ?? String(Date.now());
  const title = o.title ?? o.name ?? o.productName ?? '';
  const description = o.description ?? o.summary ?? '';
  const brand = o.brand ?? '';
  const category = o.category?.name ?? o.category ?? '';
  const tags = Array.isArray(o.tags)
    ? o.tags
    : o.tags
    ? String(o.tags).split(',').map((s: string) => s.trim())
    : [];
  const price = Number(o.price ?? o.amount ?? 0);
  const rating = Number(o.rating ?? o.stars ?? 0);
  const slug = o.slug ?? id;

  return {
    objectID: String(id),
    title,
    description,
    brand,
    category,
    tags,
    price,
    rating,
    url: o.url ?? `/product/${slug}`,
  };
}

async function loadFromPrisma(): Promise<any[]> {
  try {
    // Import dinámico para no fallar en build si no hay Prisma
    const { PrismaClient } = await import('@prisma/client');
    const prisma: any = new (PrismaClient as any)();

    // Modelo configurable por ENV (por defecto 'product')
    const accessor = (process.env.ALGOLIA_PRISMA_MODEL || 'product').toString();

    // include básico; si no existe 'category', Prisma ignorará la clave
    const rows: any[] = await prisma[accessor]?.findMany?.({
      include: { category: true },
    });

    await prisma.$disconnect?.();
    return Array.isArray(rows) ? rows : [];
  } catch {
    return [];
  }
}

// --- Handler ---------------------------------------------------------------

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // seguridad
  if (req.query.secret !== process.env.ALGOLIA_WEBHOOK_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    let records: any[] = [];

    if (req.method === 'POST') {
      // Permite subir datos directamente si no querés/tenés Prisma
      if (!Array.isArray(req.body)) {
        return res.status(400).json({ error: 'POST body must be an array of objects' });
      }
      records = req.body;
    } else {
      // GET → intenta cargar desde Prisma
      records = await loadFromPrisma();
    }

    if (!records.length) {
      return res.status(200).json({
        ok: false,
        message:
          'No se obtuvieron registros. Enviá un POST con un array de objetos o configurá ALGOLIA_PRISMA_MODEL para leer desde Prisma.',
      });
    }

    const client = adminClient();
    const indexName = getAdminIndexName('items');
    const index = client.initIndex(indexName);

    // Settings idempotentes (prefixAll, facetas, etc.)
    await index.setSettings({
      searchableAttributes: ['title', 'unordered(description)', 'brand', 'category', 'tags'],
      attributesForFaceting: ['searchable(category)', 'searchable(brand)', 'searchable(tags)'],
      queryType: 'prefixAll',
      ignorePlurals: true,
      removeStopWords: true,
      typoTolerance: 'min',
      customRanking: ['desc(rating)', 'asc(price)'],
      replicas: [`${indexName}_price_asc`, `${indexName}_price_desc`],
    });

    await client.initIndex(`${indexName}_price_asc`).setSettings({
      ranking: ['asc(price)', 'typo', 'geo', 'words', 'filters', 'proximity', 'attribute', 'exact', 'custom'],
    });
    await client.initIndex(`${indexName}_price_desc`).setSettings({
      ranking: ['desc(price)', 'typo', 'geo', 'words', 'filters', 'proximity', 'attribute', 'exact', 'custom'],
    });

    const objects = records.map(mapToAlgolia);
    const r = await index.saveObjects(objects, { autoGenerateObjectIDIfNotExist: true });

    return res.status(200).json({ ok: true, indexed: objects.length, taskIDs: r.taskIDs });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: err?.message || 'Index
