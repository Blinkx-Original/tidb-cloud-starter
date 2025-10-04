'use client';

import React from 'react';

type Props = {
  authKey: string;
  onCompleted: () => void;
};

type StatusState = {
  type: 'success' | 'error';
  message: string;
};

const DEFAULT_CHUNK_SIZE = 300;

function parseChunkSize(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return DEFAULT_CHUNK_SIZE;
  const parsed = Number.parseInt(trimmed, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }
  return parsed;
}

export default function ProductPushControls({ authKey, onCompleted }: Props) {
  const [chunkSize, setChunkSize] = React.useState(String(DEFAULT_CHUNK_SIZE));
  const [identifiers, setIdentifiers] = React.useState('');
  const [status, setStatus] = React.useState<StatusState | null>(null);
  const [loading, setLoading] = React.useState<'selected' | 'all' | null>(null);

  const runAction = React.useCallback(
    async (mode: 'selected' | 'all') => {
      const parsedChunk = parseChunkSize(chunkSize);
      if (parsedChunk === null) {
        setStatus({
          type: 'error',
          message: 'Chunk size must be a positive integer.',
        });
        return;
      }

      if (mode === 'selected' && identifiers.trim().length === 0) {
        setStatus({
          type: 'error',
          message: 'Provide at least one ID or slug separated by commas.',
        });
        return;
      }

      setLoading(mode);
      setStatus(null);
      try {
        const res = await fetch('/api/admin/push-product-pages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-admin-key': authKey,
          },
          body: JSON.stringify({
            mode,
            chunkSize: parsedChunk,
            identifiers: identifiers.trim(),
          }),
        });

        if (res.status === 401) {
          throw new Error('Unauthorized. Please log in again.');
        }

        const json = await res.json().catch(() => ({}));
        if (!res.ok) {
          const message = typeof json?.error === 'string' ? json.error : 'Failed to run push action.';
          throw new Error(message);
        }

        const message = typeof json?.message === 'string'
          ? json.message
          : 'Product pages push completed.';
        setStatus({ type: 'success', message });
        onCompleted();
      } catch (error: any) {
        setStatus({
          type: 'error',
          message: error instanceof Error ? error.message : String(error),
        });
      } finally {
        setLoading(null);
      }
    },
    [authKey, chunkSize, identifiers, onCompleted],
  );

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700" htmlFor="chunk-size-input">
          Chunk size
        </label>
        <input
          id="chunk-size-input"
          type="number"
          min={1}
          value={chunkSize}
          onChange={(event) => setChunkSize(event.target.value)}
          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
        />
        <p className="mt-1 text-xs text-gray-500">
          Default is 300. Adjust if you need smaller or larger batches when publishing.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700" htmlFor="identifier-input">
          IDs or slugs (comma-separated)
        </label>
        <textarea
          id="identifier-input"
          rows={3}
          value={identifiers}
          onChange={(event) => setIdentifiers(event.target.value)}
          placeholder="e.g. 60001, siemens-s7-1200-60001"
          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
        />
        <p className="mt-1 text-xs text-gray-500">
          Leave empty if you want to run a full reindex.
        </p>
      </div>

      {status && (
        <div
          className={`rounded-lg border px-3 py-2 text-sm ${
            status.type === 'success'
              ? 'border-green-200 bg-green-50 text-green-700'
              : 'border-red-200 bg-red-50 text-red-700'
          }`}
        >
          {status.message}
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={() => runAction('selected')}
          disabled={loading !== null}
          className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
        >
          {loading === 'selected' ? 'Publishing…' : 'Push Selected'}
        </button>
        <button
          type="button"
          onClick={() => runAction('all')}
          disabled={loading !== null}
          className="inline-flex items-center justify-center rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-black disabled:cursor-not-allowed disabled:bg-gray-400"
        >
          {loading === 'all' ? 'Reindexing…' : 'Push All'}
        </button>
      </div>
    </div>
  );
}
