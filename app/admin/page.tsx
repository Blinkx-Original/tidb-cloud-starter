import { cookies } from 'next/headers';
import AdminLoginForm from '@/components/AdminLoginForm';
import AdminCard from '@/components/AdminCard';
import SyncButton from '@/components/SyncButton';
import { expectedCookieToken } from '@/lib/sync/auth';
import { getDashboardData } from '@/lib/sync/dashboard';
import { getTiDBConfigStatus } from '@/lib/sync/tidb';

export const dynamic = 'force-dynamic';

function formatDate(value?: string | null) {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

function getSummary(summary: any | null) {
  if (!summary) return null;
  return {
    startedAt: summary.startedAt as string,
    finishedAt: summary.finishedAt as string,
    ok: Number(summary.ok || 0),
    failed: Number(summary.failed || 0),
    checkpoint: summary.checkpoint as string | undefined,
  };
}

function SummaryRow({ summary }: { summary: ReturnType<typeof getSummary> }) {
  if (!summary) {
    return <div className="text-sm text-gray-500">Sin ejecuciones registradas todavía.</div>;
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

export default async function AdminPage() {
  const cookieStore = cookies();
  let authorized = false;
  let authError: string | null = null;

  try {
    const token = cookieStore.get('admin-auth')?.value;
    authorized = token === expectedCookieToken();
  } catch (error: any) {
    authError = error?.message || 'Configuración incompleta';
  }

  if (!authorized) {
    return authError ? (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="mx-auto max-w-xl rounded-2xl border border-red-200 bg-white p-6 text-center shadow">
          <h1 className="text-lg font-semibold text-red-600">Error de configuración</h1>
          <p className="mt-2 text-sm text-gray-600">{authError}</p>
        </div>
      </div>
    ) : (
      <AdminLoginForm />
    );
  }

  let data: Awaited<ReturnType<typeof getDashboardData>> | null = null;
  let loadError: string | null = null;
  const tidbStatus = getTiDBConfigStatus();

  if (!tidbStatus.ok) {
    loadError =
      tidbStatus.details ||
      'Variables de entorno de TiDB incompletas. Revisa la configuración.';
  } else {
    try {
      data = await getDashboardData();
    } catch (error) {
      console.error('Failed to load dashboard data', error);
      loadError =
        error instanceof Error
          ? error.message
          : 'No se pudo cargar la información desde la base de datos.';
    }
  }

  const algoliaSummary = data ? getSummary(data.summary.algolia) : null;
  const logs = data?.logs ?? [];

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="mx-auto max-w-6xl space-y-8 px-6">
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold text-gray-900">Panel de sincronización</h1>
          <p className="text-sm text-gray-600">
            Ejecuta sincronizaciones manuales, revisa los checkpoints y audita los últimos registros.
          </p>
        </header>

        <div className="grid gap-6">
          <AdminCard title="Algolia" subtitle="Sincronización con el índice de búsqueda">
            <SummaryRow summary={algoliaSummary} />
            <div className="pt-4">
              <SyncButton endpoint="/api/admin/sync-algolia" label="Sincronizar Algolia" refreshOnSuccess />
            </div>
          </AdminCard>
        </div>

        {loadError && (
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
            <p className="font-medium">No se pudo conectar con TiDB</p>
            <p className="mt-1 text-yellow-700">{loadError}</p>
            <p className="mt-2 text-yellow-700">
              Verifica las variables de entorno de TiDB y que las tablas <code>sync_log</code> y <code>sync_checkpoint</code>
              existan. Se crearán automáticamente en el próximo intento si la conexión es exitosa.
            </p>
          </div>
        )}

        <AdminCard title="Historial de ejecuciones" subtitle="Últimos 50 registros">
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
                    <td colSpan={7} className="px-3 py-6 text-center text-gray-500">
                      Sin ejecuciones registradas todavía.
                    </td>
                  </tr>
                )}
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 font-mono text-xs text-gray-500">{log.id}</td>
                    <td className="px-3 py-2 capitalize">{log.target}</td>
                    <td className="px-3 py-2">{formatDate(log.startedAt)}</td>
                    <td className="px-3 py-2">{formatDate(log.finishedAt)}</td>
                    <td className="px-3 py-2 text-green-600">{log.ok}</td>
                    <td className="px-3 py-2 text-red-600">{log.failed}</td>
                    <td className="px-3 py-2 text-xs text-gray-500">{log.notes ? JSON.stringify(log.notes) : '—'}</td>
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
