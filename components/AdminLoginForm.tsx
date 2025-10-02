'use client';

import React from 'react';

export default function AdminLoginForm() {
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body?.error || 'Credenciales inválidas');
      } else {
        window.location.reload();
      }
    } catch (err: any) {
      setError(err?.message || 'Error de red');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="mx-auto mt-16 max-w-sm space-y-4 rounded-2xl border border-gray-200 bg-white p-6 shadow">
      <div className="space-y-1 text-center">
        <h1 className="text-xl font-semibold text-gray-900">Panel de sincronización</h1>
        <p className="text-sm text-gray-500">Introduce la contraseña de administrador</p>
      </div>
      <div className="space-y-2">
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Contraseña
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          placeholder="••••••"
          required
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-blue-600 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-blue-300"
      >
        {loading ? 'Accediendo…' : 'Entrar'}
      </button>
    </form>
  );
}
