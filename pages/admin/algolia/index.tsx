import { useState } from 'react'
import Head from 'next/head'

export default function AlgoliaAdmin() {
  const [token, setToken] = useState('')
  const [profiles, setProfiles] = useState<any[]>([])
  const [form, setForm] = useState<any>({})
  const [message, setMessage] = useState<string | null>(null)

  const fetchProfiles = async () => {
    if (!token) {
      setMessage('Ingresa tu Admin Token')
      return
    }
    try {
      const res = await fetch('/api/admin/algolia/profiles', {
        headers: { 'X-Admin-Token': token },
      })
      if (!res.ok) throw new Error(await res.text())
      const data = await res.json()
      setProfiles(data.profiles)
      setMessage(null)
    } catch (err: any) {
      setMessage(err.message)
    }
  }

  const saveProfile = async () => {
    if (!token) {
      setMessage('Ingresa tu Admin Token')
      return
    }
    try {
      const res = await fetch('/api/admin/algolia/profiles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Token': token,
        },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error(await res.text())
      setMessage('Perfil guardado.')
      setForm({})
      fetchProfiles()
    } catch (err: any) {
      setMessage(err.message)
    }
  }

  const handleInput = (key: string, value: string) => {
    setForm((prev: any) => ({ ...prev, [key]: value }))
  }

  const previewProfile = async (p: any) => {
    try {
      const res = await fetch('/api/admin/algolia/preview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Token': token,
        },
        body: JSON.stringify({
          database_name: p.database_name,
          table_name: p.table_name,
          sql_filter: p.sql_filter,
          limit: 3,
        }),
      })
      const data = await res.json()
      alert(JSON.stringify(data.rows, null, 2))
    } catch (err: any) {
      alert(err.message)
    }
  }

  const pushProfile = async (p: any) => {
    try {
      const res = await fetch('/api/admin/algolia/push', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Token': token,
        },
        body: JSON.stringify({ profile_key: p.profile_key }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      alert(`Empujados ${data.count} objetos a Algolia.`)
    } catch (err: any) {
      alert(err.message)
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Head>
        <title>Admin Algolia</title>
      </Head>
      <h1 className="text-2xl font-bold mb-4">Admin Algolia</h1>
      <div className="mb-4">
        <label className="block font-medium">Admin Token</label>
        <input
          type="password"
          className="border p-2 w-full"
          placeholder="Ingresa tu INDEX_ADMIN_TOKEN"
          value={token}
          onChange={(e) => setToken(e.target.value)}
        />
      </div>
      <div className="mb-4 p-4 border rounded">
        <h2 className="text-lg font-semibold mb-2">Nuevo Perfil</h2>
        <div className="space-y-2">
          <div>
            <label className="block text-sm">Clave del Perfil *</label>
            <input className="border p-2 w-full" value={form.profile_key || ''} onChange={(e) => handleInput('profile_key', e.target.value)} />
            <small>Identificador único (no cambies después).</small>
          </div>
          <div>
            <label className="block text-sm">Nombre</label>
            <input className="border p-2 w-full" value={form.name || ''} onChange={(e) => handleInput('name', e.target.value)} />
            <small>Etiqueta para mostrar.</small>
          </div>
          <div>
            <label className="block text-sm">Base de datos</label>
            <input className="border p-2 w-full" value={form.database_name || ''} onChange={(e) => handleInput('database_name', e.target.value)} />
            <small>Nombre de la DB (vacío usa TIDB_DB por defecto).</small>
          </div>
          <div>
            <label className="block text-sm">Nombre de tabla *</label>
            <input className="border p-2 w-full" value={form.table_name || ''} onChange={(e) => handleInput('table_name', e.target.value)} />
            <small>Tabla de donde se extraen los datos.</small>
          </div>
          <div>
            <label className="block text-sm">Clave primaria *</label>
            <input className="border p-2 w-full" value={form.primary_key || ''} onChange={(e) => handleInput('primary_key', e.target.value)} />
            <small>Columna que identifica univocamente.</small>
          </div>
          <div>
            <label className="block text-sm">Columna updated_at</label>
            <input className="border p-2 w-full" value={form.updated_at_col || ''} onChange={(e) => handleInput('updated_at_col', e.target.value)} />
            <small>Opcional, para sincronizacion incremental.</small>
          </div>
          <div>
            <label className="block text-sm">Índice de Algolia *</label>
            <input className="border p-2 w-full" value={form.algolia_index || ''} onChange={(e) => handleInput('algolia_index', e.target.value)} />
            <small>Nombre del índice destino en Algolia.</small>
          </div>
          <div>
            <label className="block text-sm">Prefijo ObjectID</label>
            <input className="border p-2 w-full" value={form.object_id_prefix || ''} onChange={(e) => handleInput('object_id_prefix', e.target.value)} />
            <small>Se antepone al primary key (opcional).</small>
          </div>
          <div>
            <label className="block text-sm">Filtro SQL</label>
            <input className="border p-2 w-full" value={form.sql_filter || ''} onChange={(e) => handleInput('sql_filter', e.target.value)} />
            <small>WHERE opcional, ej: field=&apos;valor&apos;</small>
          </div>
          <div>
            <label className="block text-sm">Plantilla de URL</label>
            <input className="border p-2 w-full" value={form.base_url_template || ''} onChange={(e) => handleInput('base_url_template', e.target.value)} />
            <small>Ej: /product/&#123;&#123;slug&#125;&#125; o /blog/&#123;&#123;slug&#125;&#125;</small>
          </div>
          <button className="mt-2 px-4 py-2 bg-blue-600 text-white rounded" onClick={saveProfile}>Guardar perfil</button>
          {message && <p className="mt-2 text-red-600 text-sm">{message}</p>}
        </div>
      </div>
      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-2">Perfiles existentes</h2>
        <button className="px-4 py-2 bg-gray-200 rounded" onClick={fetchProfiles}>Actualizar lista</button>
        <ul className="mt-4 space-y-2">
          {profiles.map((p) => (
            <li key={p.profile_key} className="border p-3 rounded flex flex-col gap-1">
              <span className="font-medium">{p.name || p.profile_key}</span>
              <span className="text-sm text-gray-600">
                Tabla: {p.database_name || process.env.NEXT_PUBLIC_TIDB_DB || ''}.{p.table_name} | Índice: {p.algolia_index}
              </span>
              <div className="flex gap-2 mt-2">
                <button className="px-3 py-1 bg-green-600 text-white rounded text-sm" onClick={() => previewProfile(p)}>Preview</button>
                <button className="px-3 py-1 bg-indigo-600 text-white rounded text-sm" onClick={() => pushProfile(p)}>Push</button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
