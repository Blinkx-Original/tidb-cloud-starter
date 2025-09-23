// Sincroniza UN ítem con Algolia (por id vía GET o enviando el objeto vía POST)
// Protegido con ?secret=...
import type { NextApiRequest, NextApiResponse } from 'next';
import { itemsIndex } from '@/lib/algoliaAdmin';

// ----- helpers -----
function fallbackId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function mapToAlgolia(o: any) {
  const id = o?.id ?? o?.objectID ?? o?.slug ?? fallbackId();
  const title = o?.title ?? o?.name ?? o?.productName ?? '';
  const description = o?.description ?? o?.summary ?? '';
  const brand = o?.brand ?? '';
  const category = o?.category?.name ?? o?.category ?? '';
  const tags = Array.isArray(o?.tags)
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

// ----- handler -----
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.query.secret !== process.env.ALGOLIA_WEBHOOK_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    if (req.method === 'POST') {
      // POST: sincroniza el objeto que mandes en el body
      const body = req.body;
      if (!body || typeof body !== 'object') {
        return res.status(400).json({ error: 'POST body must be a single object' });
      }
      const obj = mapToAlgolia(body);
      await itemsIndex.saveObject(obj);
      return res.status(200).json({ ok: true, mode: 'POST', objectID: obj.objectID });
    }

    // GET: busca en tu BD por id y sincroniza ese registro
    const id = (req.query.id as string) || '';
    if (!id) {
      return res.status(400).json({ error: 'Missing id (use /api/algolia/sync?id=...&secret=...)' });
    }

    // Import dinámico de Prisma para no romper el build si no existe
    const { PrismaClient } = await import('@prisma/client').catch(() => ({ PrismaClient: null as any }));
    if (!PrismaClient) {
      return res.status(200).json({ ok: false, message: 'Prisma not available. Use POST with the object.' });
    }

    const prisma: any = new PrismaClient() as any;
    // Usa el modelo que tengas en tu schema. Env var opcional para no hardcodear:
    const modelName = (process.env.ALGOLIA_PRISMA_MODEL || 'product').toString();
    const model: any = prisma[modelName];

    if (!model?.findUnique) {
      await prisma.$disconnect?.();
      return res.status(200).json({
        ok: false,
        message: `Modelo Prisma "${modelName}" no encontrado. Define ALGOLIA_PRISMA_MODEL o ajusta el código.`,
      });
    }

    // Ajusta la clave primaria si no se llama "id"
    const where = { id: isNaN(Number(id)) ? (id as any) : Number(id) };

    const item = await model.findUnique({
      where,
      include: { category: true }, // se ignora si no existe
    });

    await prisma.$disconnect?.();

    if (!item) {
      return res.status(404).json({ error: 'Not found' });
    }

    const obj = mapToAlgolia(item);
    await itemsIndex.saveObject(obj);

    return res.status(200).json({ ok: true, mode: 'GET', objectID: obj.objectID });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: err?.message || 'Sync error' });
  }
}

