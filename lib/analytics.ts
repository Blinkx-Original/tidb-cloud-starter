// lib/analytics.ts
// Small safe wrapper for Vercel Analytics track
// Works on client only, avoids SSR errors.

let trackFn: ((name: string, props?: Record<string, any>) => void) | null = null;

async function ensureTrack() {
  if (!trackFn) {
    const mod = await import('@vercel/analytics/react');
    trackFn = mod.track;
  }
}

export async function safeTrack(
  name: string,
  props?: Record<string, any>
): Promise<void> {
  try {
    if (typeof window === 'undefined') return;
    await ensureTrack();
    trackFn?.(name, props);
  } catch {
    // no-op
  }
}

