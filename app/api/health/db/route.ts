import { NextResponse } from 'next/server';
import { pingDb } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET() {
  try {
    await pingDb();
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
