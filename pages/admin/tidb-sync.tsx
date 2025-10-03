
import { useEffect, useMemo, useState } from 'react';

type Mapping = { column: string; attr?: string; include?: boolean; jsonArray?: boolean };
type ProfileRecord = {
  profile_key: string; name: string; table_name: string; primary_key: string;
  updated_at_col?: string | null; sql_filter?: string | null; algolia_index: string;
  object_id_prefix?: string | null; url_template?: string | null; mappings_json: Mapping[];
};

async function apiGet(path: string) {
  const token = localStorage.getItem('INDEX_ADMIN_TOKEN') || '';
  const res = await fetch(path, { headers: { 'x-admin-token': token } });
  const json = await res.json(); if (!res.ok) throw new Error(json?.error || 'HTTP '+res.status); return json;
}
async function apiPost(path: string, body: any) {
  const token = localStorage.getItem('INDEX_ADMIN_TOKEN') || '';
  const res = await fetch(path, { method:'POST', headers: { 'content-type':'application/json', 'x-admin-token': token }, body: JSON.stringify(body) });
  const json = await res.json(); if (!res.ok) throw new Error(json?.error || 'HTTP '+res.status); return json;
}

function MappingRow({ row, onChange, onDelete, columns }:{ row: Mapping; onChange:(m:Mapping)=>void; onDelete:()=>void; columns:string[] }){
  return (
    <div className="grid grid-cols-12 gap-2 items-center">
      <select className="border rounded px-2 py-1 col-span-3" value={row.column} onChange={e=>onChange({...row, column:e.target.value})}>
        <option value="">(select column)</option>
        {columns.map(c=> <option key={c} value={c}>{c}</option>)}
      </select>
      <input className="border rounded px-2 py-1 col-span-3" placeholder="Algolia attr (default=column)" value={row.attr || ''} onChange={e=>onChange({...row, attr:e.target.value})} />
      <label className="col-span-2 flex items-center gap-2">
        <input type="checkbox" checked={!!row.include} onChange={e=>onChange({...row, include:e.target.checked})}/>
        <span>Include</span>
      </label>
      <label className="col-span-2 flex items-center gap-2">
        <input type="checkbox" checked={!!row.jsonArray} onChange={e=>onChange({...row, jsonArray:e.target.checked})}/>
        <span>JSON array</span>
      </label>
      <button className="col-span-2 px-3 py-1 border rounded" onClick={onDelete}>Delete</button>
    </div>
  );
}

export default function TidbMapping() {
  const [token, setToken] = useState('');
  const [list, setList] = useState<any[]>([]);
  const [editingKey, setEditingKey] = useState<string>('');
  const [profile, setProfile] = useState<ProfileRecord | null>(null);
  const [columns, setColumns] = useState<string[]>([]);
  const [previewId, setPreviewId] = useState('1');
  const [out, setOut] = useState<any>(null);

  useEffect(()=>{ setToken(localStorage.getItem('INDEX_ADMIN_TOKEN') || ''); }, []);

  async function refreshList(){
    const { items } = await apiGet('/api/tidb-sync/profile/list');
    setList(items || []);
  }
  useEffect(()=>{ refreshList().catch(()=>{}); }, []);

  async function loadProfile(key: string){
    const { item } = await apiGet('/api/tidb-sync/profile/get?key='+encodeURIComponent(key));
    setProfile(item);
    setEditingKey(key);
    if (item?.table_name) {
      try {
        const { columns } = await apiGet('/api/tidb-sync/profile/columns?table='+encodeURIComponent(item.table_name));
        setColumns(columns || []);
      } catch {}
    }
  }

  const emptyProfile: ProfileRecord = useMemo(()=> ({
    profile_key: '', name: '', table_name: '', primary_key: '',
    updated_at_col: '', sql_filter: '', algolia_index: '',
    object_id_prefix: '', url_template: '/product/{{slug}}',
    mappings_json: []
  }), []);

  function newProfile(){ setProfile({...emptyProfile}); setEditingKey(''); setColumns([]); }

  async function fetchColumns(){
    if (!profile?.table_name) return;
    const { columns } = await apiGet('/api/tidb-sync/profile/columns?table='+encodeURIComponent(profile.table_name));
    setColumns(columns || []);
  }

  async function saveProfile(){
    if (!profile) return;
    const body = {...profile};
    body.mappings_json = (profile.mappings_json || []).map((m:any)=>({ column:m.column, attr:m.attr || undefined, include:!!m.include, jsonArray:!!m.jsonArray }));
    await apiPost('/api/tidb-sync/profile/save', body);
    await refreshList();
    if (profile.profile_key) setEditingKey(profile.profile_key);
  }

  async function delProfile(){
    if (!editingKey) return;
    await apiPost('/api/tidb-sync/profile/delete', { key: editingKey });
    setProfile(null); setEditingKey(''); await refreshList();
  }

  async function copyProfile(fromKey: string, toKey: string, toName: string){
    await apiPost('/api/tidb-sync/profile/copy', { fromKey, toKey, toName });
    await refreshList();
  }

  async function previewRow(){
    if (!editingKey) return;
    const res = await apiGet('/api/tidb-sync/profile/preview?profile='+encodeURIComponent(editingKey)+'&id='+encodeURIComponent(previewId));
    setOut(res);
  }

  async function runFull(){
    if (!editingKey) return;
    const res = await apiPost('/api/tidb-sync/run', { profile: editingKey, chunkSize: 500, clear: false });
    setOut(res);
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">TiDB ↔ Algolia — Profiles & Field Mapping</h1>

      <section className="border rounded-2xl p-4 space-y-2">
        <h2 className="font-semibold">Admin Token</h2>
        <input className="border rounded px-2 py-1 w-full" placeholder="INDEX_ADMIN_TOKEN"
               value={token} onChange={e=>{ setToken(e.target.value); localStorage.setItem('INDEX_ADMIN_TOKEN', e.target.value); }} />
      </section>

      <section className="border rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Profiles</h2>
          <button className="px-3 py-1 border rounded" onClick={newProfile}>New profile</button>
        </div>
        <div className="space-y-1">
          {(list||[]).map((it:any)=> (
            <div key={it.profile_key} className="flex items-center justify-between border rounded px-3 py-2">
              <div className="text-sm">
                <div className="font-medium">{it.name}</div>
                <div className="text-gray-500">key: {it.profile_key} — table: {it.table_name} — index: {it.algolia_index}</div>
              </div>
              <div className="flex gap-2">
                <button className="px-3 py-1 border rounded" onClick={()=>loadProfile(it.profile_key)}>Edit</button>
                <button className="px-3 py-1 border rounded" onClick={()=>copyProfile(it.profile_key, it.profile_key+'-copy', it.name+' (copy)')}>Copy</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {profile && (
        <section className="border rounded-2xl p-4 space-y-3">
          <h2 className="font-semibold">Profile: {editingKey || '(new)'} </h2>

          <div className="grid grid-cols-2 gap-3">
            <input className="border rounded px-2 py-1" placeholder="profile_key" value={profile.profile_key} onChange={e=>setProfile({...profile, profile_key:e.target.value})} />
            <input className="border rounded px-2 py-1" placeholder="name" value={profile.name} onChange={e=>setProfile({...profile, name:e.target.value})} />
            <input className="border rounded px-2 py-1" placeholder="table_name" value={profile.table_name} onChange={e=>setProfile({...profile, table_name:e.target.value})} />
            <input className="border rounded px-2 py-1" placeholder="primary_key" value={profile.primary_key} onChange={e=>setProfile({...profile, primary_key:e.target.value})} />
            <input className="border rounded px-2 py-1" placeholder="updated_at_col (optional)" value={profile.updated_at_col || ''} onChange={e=>setProfile({...profile, updated_at_col:e.target.value})} />
            <input className="border rounded px-2 py-1" placeholder="algolia_index (base)" value={profile.algolia_index} onChange={e=>setProfile({...profile, algolia_index:e.target.value})} />
            <input className="border rounded px-2 py-1" placeholder="object_id_prefix (optional)" value={profile.object_id_prefix || ''} onChange={e=>setProfile({...profile, object_id_prefix:e.target.value})} />
            <input className="border rounded px-2 py-1" placeholder="url_template e.g. /product/{{slug}}" value={profile.url_template || ''} onChange={e=>setProfile({...profile, url_template:e.target.value})} />
            <input className="border rounded px-2 py-1 col-span-2" placeholder="sql_filter (optional) e.g. category='Tractors'"
                   value={profile.sql_filter || ''} onChange={e=>setProfile({...profile, sql_filter:e.target.value})} />
          </div>

          <div className="flex gap-2">
            <button className="px-3 py-1 border rounded" onClick={fetchColumns}>Fetch columns</button>
            <button className="px-3 py-1 border rounded" onClick={saveProfile}>Save</button>
            {editingKey && <button className="px-3 py-1 border rounded" onClick={delProfile}>Delete</button>}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Field Mapping</h3>
              <button className="px-3 py-1 border rounded"
                onClick={()=> setProfile({...profile, mappings_json: [...(profile.mappings_json || []), { column:'', include:true }]})}>
                + Add mapping
              </button>
            </div>
            <div className="space-y-2">
              {(profile.mappings_json || []).map((m, idx)=> (
                <MappingRow key={idx} row={m} columns={columns}
                  onChange={(nm)=>{
                    const arr = [...(profile.mappings_json||[])]; arr[idx]=nm;
                    setProfile({...profile, mappings_json:arr});
                  }}
                  onDelete={()=>{
                    const arr = [...(profile.mappings_json||[])]; arr.splice(idx,1);
                    setProfile({...profile, mappings_json:arr});
                  }}
                />
              ))}
            </div>
          </div>

          <div className="border-t pt-3 space-y-2">
            <h3 className="font-medium">Preview & Run</h3>
            <div className="flex items-center gap-2">
              <input className="border rounded px-2 py-1 w-40" value={previewId} onChange={e=>setPreviewId(e.target.value)} />
              <a className="px-3 py-1 border rounded"
                href={`/api/tidb-sync/profile/preview?profile=${encodeURIComponent(editingKey)}&id=${encodeURIComponent(previewId)}&key=${encodeURIComponent(token)}`}
                target="_blank" rel="noopener noreferrer">
                Preview JSON (row)
              </a>
              <button className="px-3 py-1 border rounded" onClick={runFull}>Run Full Reindex</button>
            </div>
            <pre className="bg-gray-50 border rounded p-3 text-xs overflow-x-auto">{out ? JSON.stringify(out, null, 2) : '—'}</pre>
          </div>
        </section>
      )}
    </div>
  );
}
