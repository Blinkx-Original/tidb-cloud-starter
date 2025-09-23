// pages/api/algolia/sync.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { itemsIndex } from '@/lib/algoliaAdmin';

const prisma = new PrismaClient();

function mapToAlgolia(o: any) {
  const id = o.id ?? o.slug;
  return {
    objectID: String(id),
    title: o.title ?? o.name ?? '',
    description: o.description ?? '',
    brand: o.brand ?? '',
    category: o.category?.name ?? o.category ?? '',
    tags: o.tags ?? [],
    price: Number(o.price ?? 0),
    rating: Number(o.rating ?? 0),
    url: `/product/${o.slug ?? id}`,
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.query.secret !== process.env.ALGOLIA_WEBHOOK_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const id = req.query.id as string;
  if (!id) return res.status(400).json({ error: 'Missing id' });

  // Ajusta a tu entidad y clave primaria
  const item = await prisma.product.findUnique({
    where: { id: isNaN(Number(id)) ? (id as any) : Number(id) },
    include: { category: true },
  });
  if (!item) return res.status(404).json({ error: 'Not found' });

  const obj = mapToAlgolia(item);
  await itemsIndex.saveObject(obj);
  return res.status(200).json({ ok: true });
}
