'use client';

import React from 'react';

export type SyncButtonProps = {
  endpoint: string;
  label: string;
  onSuccess?: () => void;
  refreshOnSuccess?: boolean;
};

export default function SyncButton({ endpoint, label, onSuccess, refreshOnSuccess }: SyncButtonProps) {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [lastRun, setLastRun] = React.useState<string | null>(null);

  async function trigger() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(endpoint, { method: 'POST', credentials: 'include' });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        const message = body?.error || res.statusText;
        setError(message);
      } else {
        const data = await res.json().catch(() => ({}));
        const finished = data?.summary?.finishedAt;
        if (finished) {
          setLastRun(new Date(finished).toLocaleString());
        } else {
          setLastRun(new Date().toLocaleString());
        }
        onSuccess?.();
        if (refreshOnSuccess) {
          window.location.reload();
        }
      }
    } catch (err: any) {
      setError(err?.message || 'Network error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={trigger}
        disabled={loading}
        className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-blue-300"
      >
        {loading ? 'Ejecutando…' : label}
      </button>
      {lastRun && <p className="text-xs text-gray-500">Última ejecución: {lastRun}</p>}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
