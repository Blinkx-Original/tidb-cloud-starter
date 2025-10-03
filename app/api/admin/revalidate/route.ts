import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/sync/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const secretParam = searchParams.get('secret');
  const secretEnv = process.env.REVALIDATE_SECRET?.trim();
  if (secretEnv) {
    if (secretParam !== secretEnv) {
      return NextResponse.json({ error: 'Invalid secret' }, { status: 401 });
    }
  } else {
    const unauthorized = requireAdmin(req);
    if (unauthorized) return unauthorized;
  }
  const path = searchParams.get('path') || '/';
  revalidatePath(path);
  return NextResponse.json({ revalidated: true, path });
}
