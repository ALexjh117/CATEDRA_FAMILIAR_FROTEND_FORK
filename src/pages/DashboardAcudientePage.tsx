import { useEffect, useMemo, useState } from 'react';
import AcudienteLayout from '../components/AcudienteLayout';
import { getSession } from '../api/endpoints';
import httpService from '../api/httpService';

export default function DashboardAcudientePage() {
  const session = getSession();
  const [loading, setLoading] = useState(true);
  const [estudiantes, setEstudiantes] = useState<any[]>(
    ((session as any)?.context?.estudiantes as Array<any>) || []
  );
  const [asignaciones, setAsignaciones] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await httpService.get<any>('/acudientes/mis-tareas');
        if (mounted) {
          const data = res?.data || {};
          setEstudiantes(Array.isArray(data.estudiantes) ? data.estudiantes : estudiantes);
          setAsignaciones(Array.isArray(data.asignaciones) ? data.asignaciones : []);
        }
      } catch (e: any) {
        // Si el endpoint no existe aún, usar contexto de sesión como fallback
        if (mounted) setError(null);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const tareasPorCurso = useMemo(() => {
    const map: Record<string, any[]> = {};
    for (const a of asignaciones) {
      const cursoId = a.cursoId ?? a.curso_id ?? 'varios';
      if (!map[cursoId]) map[cursoId] = [];
      map[cursoId].push(a);
    }
    return map;
  }, [asignaciones]);

  return (
    <AcudienteLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        <div className="relative overflow-hidden rounded-3xl p-8 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 border border-emerald-100 shadow-lg">
        <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px]" />
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/10" />
          <div className="relative">
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Mi Panel (Acudiente)</h1>
            <p className="mt-2 text-sm md:text-base text-white/90">Consulta la información de tus estudiantes asociados.</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-800 mb-5">Mis Estudiantes</h2>
          {loading ? (
            <div className="text-slate-500 text-center py-6 bg-slate-50 rounded-2xl">Cargando...</div>
          ) : !estudiantes || estudiantes.length === 0 ? (
            <div className="text-slate-500 text-center py-6 bg-slate-50 rounded-2xl">No se encontraron estudiantes asociados.</div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {estudiantes.map((e) => (
                <div key={e.id} className="rounded-2xl border border-slate-200 p-5 bg-gradient-to-b from-white to-slate-50 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
                  <div className="text-lg font-semibold text-slate-800">
                    {e.nombres || e.nombre} {e.apellidos}
                  </div>
                  <div className="text-sm text-slate-600 mt-2">
                    Documento: {(e.tipoDocumento ?? e.tipo_documento) || '—'} {(e.numeroDocumento ?? e.numero_documento) || '—'}
                  </div>
                  <div className="text-sm text-slate-600 mt-1">
                    Curso: {e.cursoNombre || `ID ${e.cursoId ?? e.curso_id ?? '—'}`}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-800 mb-5">Tareas asignadas</h2>
          {loading ? (
            <div className="text-slate-500 text-center py-6 bg-slate-50 rounded-2xl">Cargando...</div>
          ) : asignaciones.length === 0 ? (
            <div className="text-slate-500 text-center py-6 bg-slate-50 rounded-2xl">No hay tareas asignadas actualmente.</div>
          ) : (
            <div className="space-y-8">
              {Object.entries(tareasPorCurso).map(([cursoId, items]) => (
                <div key={cursoId} className="space-y-4">
                  <div className="text-sm font-semibold text-slate-800">Curso: {cursoId}</div>
                  <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {items.map((t: any) => (
                      <div key={t.id} className="rounded-2xl border border-slate-200 p-5 bg-gradient-to-b from-white to-slate-50 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
                        <div className="font-semibold text-slate-800 text-base">{t.titulo || t.nombre || 'Tarea'}</div>
                        {t.tema && (
                          <div className="text-xs mt-2 text-teal-700 bg-teal-50 inline-block px-3 py-1 rounded-full font-medium">
                            {t.tema}
                          </div>
                        )}
                        <div className="text-sm text-slate-600 mt-3">
                          Vence: {t.fechaVencimiento || t.fecha_vencimiento || '—'}
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          Frecuencia: {t.frecuencia || '—'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AcudienteLayout>
  );
}
