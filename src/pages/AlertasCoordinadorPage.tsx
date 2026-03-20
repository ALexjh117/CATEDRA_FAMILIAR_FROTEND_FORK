import { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Button from '../components/ui/Button';
import AlertaDetalle from '../components/AlertaDetalle';
import { getAlertasCoordinador } from '../api/endpoints';

export default function AlertasCoordinadorPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [alertasData, setAlertasData] = useState<any>(null);

  const alertasLista = useMemo(() => {
    if (Array.isArray(alertasData?.alertas)) return alertasData.alertas;
    if (Array.isArray(alertasData?.data?.alertas)) return alertasData.data.alertas;
    return [];
  }, [alertasData]);

  const resumen = useMemo(() => {
    return alertasData?.resumen || alertasData?.data?.resumen || {
      criticas: 0,
      moderadas: 0,
      leves: 0,
    };
  }, [alertasData]);

  const loadAlertas = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getAlertasCoordinador();
      setAlertasData(response || null);
    } catch (e: any) {
      setError(e?.message || 'No se pudieron cargar las alertas');
      setAlertasData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlertas();
  }, []);

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="relative overflow-hidden rounded-2xl border border-amber-100/60 bg-gradient-to-br from-slate-50 via-amber-50/40 to-rose-50/30 p-6">
          <div className="absolute right-0 top-0 h-64 w-64 translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-bl from-amber-200/20 to-transparent" />
          <div className="relative flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">Seguimiento institucional</div>
              <h1 className="mt-1 text-2xl font-display font-bold text-slate-800 md:text-3xl">Alertas académicas</h1>
              <p className="mt-1 text-sm text-slate-600">Visualiza alertas específicas, prioridades y acciones sugeridas para intervenir a tiempo.</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="secondary" onClick={loadAlertas}>Recargar</Button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <LoadingSpinner size="lg" text="Cargando alertas..." />
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-700">{error}</div>
        ) : (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Total alertas</div>
                <div className="mt-2 text-3xl font-bold text-slate-900">{alertasLista.length}</div>
                <div className="mt-1 text-sm text-slate-600">Alertas activas listas para revisión.</div>
              </div>
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 shadow-sm">
                <div className="text-xs font-semibold uppercase tracking-wide text-rose-700">Críticas</div>
                <div className="mt-2 text-3xl font-bold text-rose-700">{resumen.criticas || 0}</div>
                <div className="mt-1 text-sm text-rose-600">Requieren acción inmediata.</div>
              </div>
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
                <div className="text-xs font-semibold uppercase tracking-wide text-amber-700">Moderadas</div>
                <div className="mt-2 text-3xl font-bold text-amber-700">{resumen.moderadas || 0}</div>
                <div className="mt-1 text-sm text-amber-600">Necesitan seguimiento esta semana.</div>
              </div>
              <div className="rounded-2xl border border-sky-200 bg-sky-50 p-4 shadow-sm">
                <div className="text-xs font-semibold uppercase tracking-wide text-sky-700">Leves</div>
                <div className="mt-2 text-3xl font-bold text-sky-700">{resumen.leves || 0}</div>
                <div className="mt-1 text-sm text-sky-600">Monitoreo preventivo.</div>
              </div>
            </div>

            {alertasLista.length === 0 ? (
              <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
                <div className="text-lg font-semibold text-slate-800">No hay alertas detalladas disponibles</div>
                <p className="mt-2 text-sm text-slate-500">Cuando el backend envíe alertas académicas o de calificación aparecerán aquí con su contexto completo.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {alertasLista.map((alerta: any, index: number) => (
                  <AlertaDetalle key={alerta?.id ?? `${alerta?.titulo || 'alerta'}-${index}`} alerta={alerta} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
