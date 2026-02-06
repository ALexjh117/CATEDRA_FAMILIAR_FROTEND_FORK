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
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-teal-50/40 to-emerald-50/30 rounded-2xl p-6 border border-teal-100/50">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-teal-200/20 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative">
            <h1 className="text-2xl md:text-3xl font-display font-bold text-slate-800">Mi Panel (Acudiente)</h1>
            <p className="text-slate-600 mt-1 text-sm">Consulta la información de tus estudiantes asociados.</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Mis Estudiantes</h2>
          {loading ? (
            <div className="text-slate-600">Cargando...</div>
          ) : !estudiantes || estudiantes.length === 0 ? (
            <div className="text-slate-600">No se encontraron estudiantes asociados.</div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {estudiantes.map((e) => (
                <div key={e.id} className="rounded-xl border border-slate-200 p-4 bg-slate-50/50">
                  <div className="font-semibold text-slate-800">
                    {e.nombres || e.nombre} {e.apellidos}
                  </div>
                  <div className="text-sm text-slate-600 mt-1">
                    Documento: {(e.tipoDocumento ?? e.tipo_documento) || '—'} {(e.numeroDocumento ?? e.numero_documento) || '—'}
                  </div>
                  <div className="text-sm text-slate-600">
                    Curso: {e.cursoNombre || `ID ${e.cursoId ?? e.curso_id ?? '—'}`}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Tareas asignadas</h2>
          {loading ? (
            <div className="text-slate-600">Cargando...</div>
          ) : asignaciones.length === 0 ? (
            <div className="text-slate-600">No hay tareas asignadas actualmente.</div>
          ) : (
            <div className="space-y-6">
              {Object.entries(tareasPorCurso).map(([cursoId, items]) => (
                <div key={cursoId} className="space-y-3">
                  <div className="text-sm font-semibold text-slate-700">Curso: {cursoId}</div>
                  <div className="grid md:grid-cols-2 gap-4">
                    {items.map((t: any) => (
                      <div key={t.id} className="rounded-xl border border-slate-200 p-4 bg-slate-50/50">
                        <div className="font-semibold text-slate-800">{t.titulo || t.nombre || 'Tarea'}</div>
                        {t.tema && (
                          <div className="text-xs mt-1 text-teal-700 bg-teal-50 inline-block px-2 py-0.5 rounded">
                            {t.tema}
                          </div>
                        )}
                        <div className="text-sm text-slate-600 mt-2">
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
