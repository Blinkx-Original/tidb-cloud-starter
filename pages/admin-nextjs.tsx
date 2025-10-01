import { useState } from 'react';

/**
 * Catalog Sync Admin dashboard.
 *
 * This page replicates the core functionality of the WordPress sync plugin,
 * allowing you to choose a TiDB database/table, map it to an Algolia index
 * with a chosen objectID prefix, and push individual rows or perform a full
 * reindex. It also exposes a “Push & Revalidate” option that revalidates
 * the product page after saving to Algolia.
 *
 * The page makes calls to the API routes under /api/sync.
 */
export default function AdminNextjs() {
  const [db, setDb] = useState('');
  const [table, setTable] = useState('');
  const [indexName, setIndexName] = useState('');
  const [objectIdPrefix, setObjectIdPrefix] = useState('');
  const [columns, setColumns] = useState<any[]>([]);
  const [status, setStatus] = useState<string>('');
  const [rowId, setRowId] = useState('');
  const [chunkSize, setChunkSize] = useState('500');
  const [clearFirst, setClearFirst] = useState(false);

  async function fetchColumns() {
    if (!db || !table) {
      setStatus('Please provide both database and table names.');
      return;
    }
    setStatus('Loading columns…');
    try {
      const res = await fetch(
        `/api/sync/columns?db=${encodeURIComponent(db)}&table=${encodeURIComponent(
          table
        )}`
      );
      const data = await res.json();
      setColumns(data.columns || []);
      setStatus(`Loaded ${data.columns?.length || 0} columns.`);
    } catch (err) {
      console.error(err);
      setStatus('Failed to fetch columns.');
    }
  }

  async function pushOne() {
    if (!rowId) {
      setStatus('Please enter a Row ID.');
      return;
    }
    if (!db || !table || !indexName) {
      setStatus('Please fill database, table and index.');
      return;
    }
    setStatus('Pushing row to Algolia…');
    try {
      const res = await fetch('/api/sync/push-one', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          db,
          table,
          id: rowId,
          index: indexName,
          objectIdPrefix,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setStatus(`Pushed object ${data.objectID}.`);
      } else {
        setStatus(`Error: ${data.error || 'Failed'}`);
      }
    } catch (err) {
      console.error(err);
      setStatus('Failed to push row.');
    }
  }

  async function pushBoth() {
    if (!rowId) {
      setStatus('Please enter a Row ID.');
      return;
    }
    if (!db || !table || !indexName) {
      setStatus('Please fill database, table and index.');
      return;
    }
    setStatus('Pushing and revalidating…');
    try {
      const res = await fetch('/api/sync/push-both', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          db,
          table,
          id: rowId,
          index: indexName,
          objectIdPrefix,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setStatus(`Pushed row and revalidated slug ${data.slug}.`);
      } else {
        setStatus(`Error: ${data.error || 'Failed'}`);
      }
    } catch (err) {
      console.error(err);
      setStatus('Failed to push and revalidate.');
    }
  }

  async function fullReindex() {
    if (!db || !table || !indexName) {
      setStatus('Please fill database, table and index.');
      return;
    }
    setStatus('Starting full reindex…');
    try {
      const res = await fetch('/api/sync/full-reindex', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          db,
          table,
          index: indexName,
          objectIdPrefix,
          chunk: chunkSize,
          clear: clearFirst,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setStatus(
          `Reindex complete: processed ${data.pushed} of ${data.total} rows.`
        );
      } else {
        setStatus(`Error: ${data.error || 'Failed'}`);
      }
    } catch (err) {
      console.error(err);
      setStatus('Failed to reindex.');
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Catalog Sync Admin</h1>
      <p className="text-sm text-gray-600 mb-6">
        Configure your database and Algolia index, then sync rows or reindex the
        whole table. Use the ObjectID prefix to avoid collisions between
        multiple systems (e.g. <code>prod_</code>, <code>wp_</code>,{' '}
        <code>nx_</code>).
      </p>
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold">TiDB Database</label>
            <input
              type="text"
              value={db}
              onChange={(e) => setDb(e.target.value)}
              className="border rounded p-2 w-full"
              placeholder="e.g. bookshop"
            />
          </div>
          <div>
            <label className="block font-semibold">TiDB Table</label>
            <input
              type="text"
              value={table}
              onChange={(e) => setTable(e.target.value)}
              className="border rounded p-2 w-full"
              placeholder="e.g. products"
            />
          </div>
          <div>
            <label className="block font-semibold">Algolia Index</label>
            <input
              type="text"
              value={indexName}
              onChange={(e) => setIndexName(e.target.value)}
              className="border rounded p-2 w-full"
              placeholder="e.g. catalog_items"
            />
          </div>
          <div>
            <label className="block font-semibold">ObjectID Prefix</label>
            <input
              type="text"
              value={objectIdPrefix}
              onChange={(e) => setObjectIdPrefix(e.target.value)}
              className="border rounded p-2 w-full"
              placeholder="e.g. prod_"
            />
          </div>
        </div>
        <button
          onClick={fetchColumns}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Load Columns
        </button>
        {columns.length > 0 && (
          <div className="mt-4 overflow-x-auto">
            <h2 className="font-semibold mb-2">Columns</h2>
            <table className="min-w-full border-collapse border">
              <thead>
                <tr>
                  <th className="border px-2 py-1 text-left">Column</th>
                  <th className="border px-2 py-1 text-left">Type</th>
                </tr>
              </thead>
              <tbody>
                {columns.map((col) => (
                  <tr key={col.name}>
                    <td className="border px-2 py-1">{col.name}</td>
                    <td className="border px-2 py-1">{col.type}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="border-t pt-4 mt-4">
          <h2 className="font-semibold mb-2">Push Single Row</h2>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={rowId}
              onChange={(e) => setRowId(e.target.value)}
              className="border rounded p-2 flex-1"
              placeholder="Row ID (primary key)"
            />
            <button
              onClick={pushOne}
              className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded"
            >
              Push to Algolia
            </button>
            <button
              onClick={pushBoth}
              className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded"
            >
              Push &amp; Revalidate
            </button>
          </div>
        </div>
        <div className="border-t pt-4 mt-4">
          <h2 className="font-semibold mb-2">Full Reindex</h2>
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <label className="flex items-center">
              <span className="mr-2">Chunk size</span>
              <input
                type="number"
                value={chunkSize}
                min={1}
                onChange={(e) => setChunkSize(e.target.value)}
                className="border rounded p-2 w-24"
              />
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={clearFirst}
                onChange={(e) => setClearFirst(e.target.checked)}
              />
              <span>Clear index first</span>
            </label>
            <button
              onClick={fullReindex}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
            >
              Start Reindex
            </button>
          </div>
        </div>
        {status && (
          <div className="mt-4 p-3 bg-gray-100 border rounded">{status}</div>
        )}
      </div>
    </div>
  );
}