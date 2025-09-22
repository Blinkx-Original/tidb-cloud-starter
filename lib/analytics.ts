// lib/analytics.ts
import type { EventAttributes } from '@vercel/analytics/react';

let trackFn:
  | ((name: string, props?: EventAttributes) => void)
  | null = null;

async function ensureTrack() {
  if (!trackFn) {
    const mod = await import('@vercel/analytics/react');
    trackFn = mod.track;
  }
}

export async function safeTrack(
  name: string,
  props?: EventAttributes
): Promise<void> {
  try {
    if (typeof window === 'undefined') return;
    await ensureTrack();
    trackFn?.(name, props);
  } catch {
    // no-op
  }
}
