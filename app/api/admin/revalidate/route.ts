import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/sync/auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: Request) {
  const secretEnv = process.env.REVALIDATE_SECRET?.trim();
  if (secretEnv) {
    const payload = await req.json().catch(() => null);
    if (!payload || payload.secret !== secretEnv) {
      return NextResponse.json({ error: 'Invalid secret' }, { status: 401 });
    }
    const slug = typeof payload.slug === 'string' ? payload.slug.trim() : '';
    if (!slug) {
      return NextResponse.json({ error: 'Missing slug' }, { status: 400 });
    }
    revalidatePath(`/p/${slug}`);
    return NextResponse.json({ revalidated: true, path: `/p/${slug}` });
  }

  const unauthorized = requireAdmin(req);
  if (unauthorized) return unauthorized;

  const body = await req.json().catch(() => null);
  const slug = typeof body?.slug === 'string' ? body.slug.trim() : '';
  if (!slug) {
    return NextResponse.json({ error: 'Missing slug' }, { status: 400 });
  }
  revalidatePath(`/p/${slug}`);
  return NextResponse.json({ revalidated: true, path: `/p/${slug}` });
}
