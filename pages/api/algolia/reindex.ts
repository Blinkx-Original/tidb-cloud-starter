// pages/api/algolia/reindex.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { itemsIndex, itemsIndexAsc, itemsIndexDesc, itemsIndexName } from '@/lib/algoliaAdmin';

const prisma = new PrismaClient();

function mapToAlgolia(o: any) {
  // Ajusta estos mapeos a tu esquema real
  const id = o.id ?? o.productId ?? o.slug ?? String(Math.random());
  const title = o.title ?? o.name ?? o.productName ?? '';
  const description = o.description ?? o.summary ?? '';
  const brand = o.brand ?? o.maker ?? '';
  const category = o.category?.name ?? o.category ?? '';
  const tags = o.tags ?? o.labels ?? [];
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
    url: `/product/${slug}`,
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // seguridad
    if (req.query.secret !== process.env.ALGOLIA_WEBHOOK_SECRET) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // ⚠️ Ajusta la tabla/relaciones a tu esquema real
    // Ejemplo genérico: tabla Product con Category y Tags
    const products = await prisma.product.findMany({
      include: {
        category: true,
        // si tienes relación many-to-many tags:
        // tags: true,
      },
    });

    const objects = products.map(mapToAlgolia);

    // Configuración del índice (idempotente)
    await itemsIndex.setSettings({
      searchableAttributes: ['title', 'unordered(description)', 'brand', 'category', 'tags'],
      attributesForFaceting: ['searchable(category)', 'searchable(brand)', 'searchable(tags)'],
      queryType: 'prefixAll',
      ignorePlurals: true,
      removeStopWords: true,
      typoTolerance: 'min',
      replicas: [`${itemsIndexName}_price_asc`, `${itemsIndexName}_price_desc`],
      customRanking: ['desc(rating)', 'asc(price)'],
    });

    await itemsIndexAsc.setSettings({
      ranking: ['asc(price)', 'typo', 'geo', 'words', 'filters', 'proximity', 'attribute', 'exact', 'custom'],
    });
    await itemsIndexDesc.setSettings({
      ranking: ['desc(price)', 'typo', 'geo', 'words', 'filters', 'proximity', 'attribute', 'exact', 'custom'],
    });

    // Indexado (chunked automáticamente por SDK)
    const r = await itemsIndex.saveObjects(objects, { autoGenerateObjectIDIfNotExist: true });

    return res.status(200).json({ ok: true, indexed: objects.length, taskIDs: r.taskIDs });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: err?.message || 'Index error' });
  }
}

// Desactiva el body parser si subes archivos grandes (opcional)
// export const config = { api: { bodyParser: false } };
