import { useEffect, useState } from 'react';

function useAdminToken() {
  const [token, setToken] = useState('');
  useEffect(() => { setToken(localStorage.getItem('INDEX_ADMIN_TOKEN') || ''); }, []);
  const save = (v: string) => { setToken(v); localStorage.setItem('INDEX_ADMIN_TOKEN', v); };
  return { token, save };
}

async function call(url: string, body?: any) {
  const token = localStorage.getItem('INDEX_ADMIN_TOKEN') || '';
  const init: RequestInit = {
    method: body ? 'POST' : 'GET',
    headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
    body: body ? JSON.stringify(body) : undefined,
  };
  const res = await fetch(url, init);
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.error || `HTTP ${res.status}`);
  return json;
}

export default function TidbSyncAdmin() {
  const { token, save } = useAdminToken();
  const [profile, setProfile] = useState('products');
  const [chunk, setChunk] = useState(500);
  const [clear, setClear] = useState(false);
  const [id, setId] = useState('1');
  const [out, setOut] = useState<any>(null);
  const [pong, setPong] = useState({ tidb: null as any, algolia: null as any });

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">TiDB → Algolia (No-terminal)</h1>

      <section className="border rounded-2xl p-4 space-y-2">
        <h2 className="font-semibold">Admin Token</h2>
        <input value={token} onChange={e=>save(e.target.value)}
              placeholder="INDEX_ADMIN_TOKEN"
              className="border px-2 py-1 rounded w-full" />
      </section>

      <section className="border rounded-2xl p-4 space-y-2">
        <h2 className="font-semibold">Connections</h2>
        <div className="flex gap-2">
          <button className="px-3 py-1 border rounded"
                  onClick={async()=> setPong(p => ({...p, tidb: await call('/api/tidb-sync/test-tidb')}))}>
            Test TiDB
          </button>
          <button className="px-3 py-1 border rounded"
                  onClick={async()=> setPong(p => ({...p, algolia: await call('/api/tidb-sync/test-algolia')}))}>
            Test Algolia
          </button>
        </div>
        <pre className="bg-gray-50 border rounded p-3 text-xs overflow-x-auto">
          {JSON.stringify(pong, null, 2)}
        </pre>
      </section>

      <section className="border rounded-2xl p-4 space-y-2">
        <h2 className="font-semibold">Full Reindex</h2>
        <div className="flex flex-wrap gap-2 items-center">
          <input value={profile} onChange={e=>setProfile(e.target.value)} className="border px-2 py-1 rounded" />
          <label className="flex items-center gap-2">
            <span>Chunk</span>
            <input type="number" value={chunk} onChange={e=>setChunk(Number(e.target.value))}
                  className="border px-2 py-1 rounded w-24" />
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={clear} onChange={e=>setClear(e.target.checked)} />
            <span>Clear index first</span>
          </label>
          <button className="px-3 py-1 border rounded"
                  onClick={async()=> setOut(await call('/api/tidb-sync/full', { profile, chunkSize: chunk, clear }))}>
            Start
          </button>
        </div>
      </section>

      <section className="border rounded-2xl p-4 space-y-2">
        <h2 className="font-semibold">Push one (ID)</h2>
        <div className="flex gap-2 items-center">
          <input value={id} onChange={e=>setId(e.target.value)} className="border px-2 py-1 rounded w-40" />
          <button className="px-3 py-1 border rounded"
                  onClick={async()=> setOut(await call('/api/tidb-sync/push-one', { profile, id }))}>
            Push
          </button>
          <a className="px-3 py-1 border rounded"
            href={`/api/tidb-sync/preview?profile=${profile}&id=${encodeURIComponent(id)}&key=${encodeURIComponent(token)}`}
            target="_blank" rel="noreferrer">Preview JSON</a>
        </div>
      </section>

      <pre className="bg-gray-50 border rounded p-3 text-xs overflow-x-auto">{out ? JSON.stringify(out, null, 2) : '—'}</pre>
    </div>
  );
}
