"use client";

import React from "react";
import AdminCard from "@/components/AdminCard";
import AdminLoginForm from "@/components/AdminLoginForm";
import SyncButton from "@/components/SyncButton";

const STORAGE_KEY = "tidb-sync-admin-key";

type Summary = {
  startedAt: string | null;
  finishedAt: string | null;
  ok: number;
  failed: number;
  checkpoint?: string | null;
};

type DashboardLog = {
  id: number;
  target: string;
  startedAt: string | null;
  finishedAt: string | null;
  ok: number;
  failed: number;
  notes?: Record<string, unknown> | null;
};

type DashboardResponse = {
  ok: boolean;
  summary: { algolia: Summary | null };
  logs: DashboardLog[];
  tidbStatus: {
    ok: boolean;
    details?: string;
  };
};

function formatDate(value?: string | null) {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString();
  } catch (error) {
    console.warn("Failed to format date", error);
    return value;
  }
}

function SummaryRow({ summary }: { summary: Summary | null }) {
  if (!summary) {
    return (
      <div className="text-sm text-gray-500">
        Sin ejecuciones registradas todavía.
      </div>
    );
  }

  return (
    <dl className="grid grid-cols-2 gap-2 text-sm">
      <div>
        <dt className="font-medium text-gray-700">Último inicio</dt>
        <dd className="text-gray-900">{formatDate(summary.startedAt)}</dd>
      </div>
      <div>
        <dt className="font-medium text-gray-700">Finalizó</dt>
        <dd className="text-gray-900">{formatDate(summary.finishedAt)}</dd>
      </div>
      <div>
        <dt className="font-medium text-gray-700">Correctos</dt>
        <dd className="text-green-600">{summary.ok}</dd>
      </div>
      <div>
        <dt className="font-medium text-gray-700">Errores</dt>
        <dd className="text-red-600">{summary.failed}</dd>
      </div>
      <div className="col-span-2">
        <dt className="font-medium text-gray-700">Checkpoint</dt>
        <dd className="text-gray-900">{formatDate(summary.checkpoint)}</dd>
      </div>
    </dl>
  );
}

export default function AdminPage() {
  const [authKey, setAuthKey] = React.useState<string | null>(null);
  const [dashboard, setDashboard] = React.useState<DashboardResponse | null>(
    null,
  );
  const [loading, setLoading] = React.useState(false);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [authError, setAuthError] = React.useState<string | null>(null);
  const hasAttemptedRef = React.useRef(false);

  const saveAuthKey = React.useCallback((key: string | null) => {
    if (typeof window === "undefined") return;
    if (key) {
      window.localStorage.setItem(STORAGE_KEY, key);
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setAuthKey(stored);
    }
  }, []);

  const fetchDashboard = React.useCallback(
    async (key: string) => {
      setLoading(true);
      setLoadError(null);
      try {
        const res = await fetch("/api/admin/dashboard", {
          cache: "no-store",
          headers: {
            "x-admin-key": key,
          },
        });
        if (res.status === 401) {
          setAuthError("Credenciales inválidas.");
          setAuthKey(null);
          saveAuthKey(null);
          setDashboard(null);
          return;
        }
        const body = (await res.json().catch(() => ({}))) as
          | DashboardResponse
          | { error?: string };
        if (!res.ok) {
          const errorMessage =
            "error" in body && body.error
              ? body.error
              : "No se pudo cargar la información.";
          throw new Error(errorMessage);
        }
        setDashboard(body as DashboardResponse);
      } catch (error: any) {
        console.error("Failed to load dashboard", error);
        setLoadError(error?.message || "No se pudo cargar la información.");
      } finally {
        hasAttemptedRef.current = true;
        setLoading(false);
      }
    },
    [saveAuthKey],
  );

  React.useEffect(() => {
    if (!authKey) return;
    setAuthError(null);
    saveAuthKey(authKey);
    fetchDashboard(authKey).catch((error) => {
      console.error(error);
    });
  }, [authKey, fetchDashboard, saveAuthKey]);

  const handleAuthenticated = React.useCallback((password: string) => {
    setAuthError(null);
    hasAttemptedRef.current = false;
    setAuthKey(password);
  }, []);

  const handleLogout = React.useCallback(() => {
    hasAttemptedRef.current = false;
    setAuthKey(null);
    setDashboard(null);
    saveAuthKey(null);
    fetch("/api/admin/login", { method: "DELETE" }).catch(() => undefined);
  }, [saveAuthKey]);

  const tidbStatus = dashboard?.tidbStatus;
  const algoliaSummary = dashboard?.summary.algolia ?? null;
  const logs = dashboard?.logs ?? [];

  if (!authKey) {
    return (
      <AdminLoginForm
        onAuthenticated={handleAuthenticated}
        initialError={authError}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="mx-auto max-w-6xl space-y-8 px-6">
        <header className="space-y-2">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Panel de sincronización
              </h1>
              <p className="text-sm text-gray-600">
                Ejecuta sincronizaciones manuales, revisa los checkpoints y
                audita los últimos registros.
              </p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center rounded-lg border border-gray-300 px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100"
            >
              Cerrar sesión
            </button>
          </div>
        </header>

        <div className="grid gap-6">
          <AdminCard
            title="Algolia"
            subtitle="Sincronización con el índice de búsqueda"
          >
            {loading && !hasAttemptedRef.current ? (
              <div className="text-sm text-gray-500">Cargando…</div>
            ) : (
              <SummaryRow summary={algoliaSummary} />
            )}
            <div className="pt-4">
              <SyncButton
                endpoint="/api/admin/sync-algolia"
                label="Sincronizar Algolia"
                authKey={authKey}
                onSuccess={() => {
                  fetchDashboard(authKey).catch((error) =>
                    console.error(error),
                  );
                }}
              />
            </div>
          </AdminCard>
        </div>

        {tidbStatus && !tidbStatus.ok && (
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
            <p className="font-medium">No se pudo conectar con TiDB</p>
            <p className="mt-1 text-yellow-700">
              {tidbStatus.details ||
                "Revisa las variables de entorno de TiDB y vuelve a intentarlo."}
            </p>
          </div>
        )}

        {loadError && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <p className="font-medium">Error al cargar el tablero</p>
            <p className="mt-1 text-red-600">{loadError}</p>
          </div>
        )}

        <AdminCard
          title="Historial de ejecuciones"
          subtitle="Últimos 50 registros"
        >
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead>
                <tr className="bg-gray-100 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                  <th className="px-3 py-2">ID</th>
                  <th className="px-3 py-2">Destino</th>
                  <th className="px-3 py-2">Inicio</th>
                  <th className="px-3 py-2">Fin</th>
                  <th className="px-3 py-2">OK</th>
                  <th className="px-3 py-2">Errores</th>
                  <th className="px-3 py-2">Notas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {logs.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-3 py-6 text-center text-gray-500"
                    >
                      Sin ejecuciones registradas todavía.
                    </td>
                  </tr>
                )}
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 font-mono text-xs text-gray-500">
                      {log.id}
                    </td>
                    <td className="px-3 py-2 capitalize">{log.target}</td>
                    <td className="px-3 py-2">{formatDate(log.startedAt)}</td>
                    <td className="px-3 py-2">{formatDate(log.finishedAt)}</td>
                    <td className="px-3 py-2 text-green-600">{log.ok}</td>
                    <td className="px-3 py-2 text-red-600">{log.failed}</td>
                    <td className="px-3 py-2 text-xs text-gray-500">
                      {log.notes ? JSON.stringify(log.notes) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </AdminCard>
      </div>
    </div>
  );
}
