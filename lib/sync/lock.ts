import { SyncTarget } from './types';

const activeTargets = new Set<SyncTarget>();

export async function withSyncLock<T>(target: SyncTarget, fn: () => Promise<T>): Promise<T> {
  if (activeTargets.has(target)) {
    throw new Error(`Sync for ${target} is already running`);
  }
  activeTargets.add(target);
  try {
    return await fn();
  } finally {
    activeTargets.delete(target);
  }
}

export function isSyncRunning(target: SyncTarget): boolean {
  return activeTargets.has(target);
}
