import { NextResponse } from 'next/server';
import { createAuthCookieResponse, clearAuthCookieResponse } from '@/lib/sync/auth';

export const dynamic = 'force-dynamic';

function getPassword(): string {
  const password = process.env.ADMIN_DASH_PASSWORD;
  if (!password || !password.trim()) {
    throw new Error('ADMIN_DASH_PASSWORD environment variable is required');
  }
  return password.trim();
}

export async function POST(req: Request) {
  let payload: { password?: string } = {};
  try {
    payload = (await req.json()) ?? {};
  } catch {
    payload = {};
  }
  const provided = (payload.password || '').trim();
  if (!provided) {
    return NextResponse.json({ error: 'Password required' }, { status: 400 });
  }
  if (provided !== getPassword()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return createAuthCookieResponse({ ok: true });
}

export async function DELETE() {
  return clearAuthCookieResponse({ ok: true });
}
