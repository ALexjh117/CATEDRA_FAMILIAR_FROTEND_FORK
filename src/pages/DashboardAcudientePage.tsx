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

  // Genera iniciales para el avatar
  const getInitials = (e: any) => {
    const nombre = (e.nombres || e.nombre || '').charAt(0).toUpperCase();
    const apellido = (e.apellidos || '').charAt(0).toUpperCase();
    return `${nombre}${apellido}` || '?';
  };

  return (
    <AcudienteLayout>
      <div className="max-w-4xl mx-auto space-y-5 px-2 py-2">

        {/* ── HERO BANNER ── */}
        <div
          className="relative overflow-hidden rounded-2xl p-6"
          style={{ background: 'linear-gradient(135deg, #0F6E56 0%, #1D9E75 60%, #5DCAA5 100%)' }}
        >
          {/* Círculos decorativos */}
          <div
            className="absolute rounded-full"
            style={{
              width: 220, height: 220,
              background: 'rgba(255,255,255,0.08)',
              top: -60, right: -60,
            }}
          />
          <div
            className="absolute rounded-full"
            style={{
              width: 120, height: 120,
              background: 'rgba(255,255,255,0.06)',
              bottom: -30, left: 40,
            }}
          />
          <div className="relative z-10">
            {/* Badge */}
            <div
              className="inline-flex items-center gap-2 mb-3 px-3 py-1 rounded-full text-xs text-white"
              style={{ background: 'rgba(255,255,255,0.18)', border: '0.5px solid rgba(255,255,255,0.3)' }}
            >
              <span
                className="rounded-full"
                style={{ width: 7, height: 7, background: '#9FE1CB', display: 'inline-block' }}
              />
              Portal Acudiente
            </div>
            <h1 className="text-2xl md:text-3xl font-semibold text-white tracking-tight">
              Mi Panel
            </h1>
            <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.8)' }}>
              Consulta la información de tus estudiantes asociados.
            </p>
          </div>
        </div>

        {/* ── MIS ESTUDIANTES ── */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: '#fff', border: '0.5px solid rgba(29,158,117,0.15)' }}
        >
          {/* Header tarjeta */}
          <div
            className="flex items-center gap-3 px-5 py-4"
            style={{ borderBottom: '0.5px solid rgba(29,158,117,0.1)' }}
          >
            <div
              className="flex items-center justify-center rounded-lg flex-shrink-0"
              style={{ width: 32, height: 32, background: '#E1F5EE' }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#1D9E75" strokeWidth="1.5" strokeLinecap="round">
                <circle cx="8" cy="5" r="3" />
                <path d="M2 14c0-3.3 2.7-6 6-6s6 2.7 6 6" />
              </svg>
            </div>
            <span className="font-medium text-sm" style={{ color: '#0F6E56' }}>
              Mis Estudiantes
            </span>
            <span
              className="ml-auto text-xs font-medium px-2 py-0.5 rounded-full"
              style={{ background: '#E1F5EE', color: '#0F6E56' }}
            >
              {loading ? '…' : estudiantes.length}
            </span>
          </div>

          {/* Body */}
          <div className="p-5">
            {loading ? (
              <LoadingSkeleton />
            ) : !estudiantes || estudiantes.length === 0 ? (
              <EmptyState mensaje="No se encontraron estudiantes asociados." />
            ) : (
              <div className="flex flex-col gap-3">
                {estudiantes.map((e) => (
                  <div
                    key={e.id}
                    className="flex items-center gap-3 rounded-xl px-3 py-3 transition-colors"
                    style={{
                      background: '#F7FDFB',
                      border: '0.5px solid rgba(29,158,117,0.12)',
                    }}
                  >
                    {/* Avatar */}
                    <div
                      className="flex items-center justify-center rounded-full flex-shrink-0 text-white font-medium text-sm"
                      style={{
                        width: 40, height: 40,
                        background: 'linear-gradient(135deg, #1D9E75, #5DCAA5)',
                      }}
                    >
                      {getInitials(e)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate" style={{ color: '#085041' }}>
                        {e.nombres || e.nombre} {e.apellidos}
                      </div>
                      <div className="text-xs mt-0.5" style={{ color: '#0F6E56', opacity: 0.8 }}>
                        {(e.tipoDocumento ?? e.tipo_documento) || '—'} · {(e.numeroDocumento ?? e.numero_documento) || '—'}
                      </div>
                    </div>
                    {/* Pill curso */}
                    <div
                      className="text-xs font-medium px-2 py-1 rounded-full flex-shrink-0"
                      style={{ background: '#E1F5EE', color: '#085041' }}
                    >
                      {e.cursoNombre || `Curso ${e.cursoId ?? e.curso_id ?? '—'}`}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── TAREAS ASIGNADAS ── */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: '#fff', border: '0.5px solid rgba(29,158,117,0.15)' }}
        >
          {/* Header tarjeta */}
          <div
            className="flex items-center gap-3 px-5 py-4"
            style={{ borderBottom: '0.5px solid rgba(29,158,117,0.1)' }}
          >
            <div
              className="flex items-center justify-center rounded-lg flex-shrink-0"
              style={{ width: 32, height: 32, background: '#E1F5EE' }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#1D9E75" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="12" height="12" rx="2" />
                <path d="M5 8h6M5 11h4M5 5h6" />
              </svg>
            </div>
            <span className="font-medium text-sm" style={{ color: '#0F6E56' }}>
              Tareas asignadas
            </span>
            <span
              className="ml-auto text-xs font-medium px-2 py-0.5 rounded-full"
              style={{ background: '#E1F5EE', color: '#0F6E56' }}
            >
              {loading ? '…' : asignaciones.length}
            </span>
          </div>

          {/* Body */}
          <div className="p-5">
            {loading ? (
              <LoadingSkeleton />
            ) : asignaciones.length === 0 ? (
              <EmptyState mensaje="No hay tareas asignadas actualmente." />
            ) : (
              <div className="space-y-5">
                {Object.entries(tareasPorCurso).map(([cursoId, items]) => (
                  <div key={cursoId}>
                    {/* Etiqueta de curso */}
                    <div className="flex items-center gap-3 mb-3">
                      <span
                        className="text-xs font-semibold uppercase tracking-wide"
                        style={{ color: '#0F6E56', letterSpacing: '0.5px' }}
                      >
                        Curso {cursoId}
                      </span>
                      <div className="flex-1 h-px" style={{ background: 'rgba(29,158,117,0.15)' }} />
                    </div>

                    {/* Grid de tareas */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {items.map((t: any) => (
                        <div
                          key={t.id}
                          className="relative rounded-xl px-4 py-3 transition-all"
                          style={{
                            background: '#fff',
                            border: '0.5px solid rgba(29,158,117,0.15)',
                          }}
                        >
                          {/* Barra lateral verde */}
                          <div
                            className="absolute left-0 top-0 bottom-0 rounded-l-xl"
                            style={{
                              width: 3,
                              background: 'linear-gradient(to bottom, #1D9E75, #9FE1CB)',
                            }}
                          />
                          <div className="pl-1">
                            <div className="font-medium text-sm mb-2" style={{ color: '#085041' }}>
                              {t.titulo || t.nombre || 'Tarea'}
                            </div>

                            {t.tema && (
                              <div
                                className="inline-block text-xs px-2 py-0.5 rounded-full mb-2"
                                style={{ background: '#E1F5EE', color: '#085041' }}
                              >
                                {t.tema}
                              </div>
                            )}

                            <div className="flex items-center gap-1.5 text-xs" style={{ color: '#0F6E56', opacity: 0.85 }}>
                              <span
                                className="rounded-full flex-shrink-0"
                                style={{ width: 5, height: 5, background: '#1D9E75', display: 'inline-block' }}
                              />
                              Vence: {t.fechaVencimiento || t.fecha_vencimiento || '—'}
                            </div>

                            <div className="flex items-center gap-2 mt-2">
                              <span
                                className="text-xs font-medium px-2 py-0.5 rounded-full"
                                style={{ background: '#E1F5EE', color: '#085041' }}
                              >
                                {t.frecuencia || '—'}
                              </span>
                            </div>
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

      </div>
    </AcudienteLayout>
  );
}

/* ── Componentes auxiliares ── */

function LoadingSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      {[1, 2].map((i) => (
        <div
          key={i}
          className="h-14 rounded-xl"
          style={{ background: 'rgba(29,158,117,0.08)' }}
        />
      ))}
    </div>
  );
}

function EmptyState({ mensaje }: { mensaje: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 gap-2">
      <div
        className="flex items-center justify-center rounded-full mb-1"
        style={{ width: 40, height: 40, background: '#E1F5EE' }}
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#1D9E75" strokeWidth="1.5" strokeLinecap="round">
          <circle cx="10" cy="10" r="8" />
          <path d="M10 7v4M10 13h.01" />
        </svg>
      </div>
      <p className="text-sm text-center" style={{ color: '#0F6E56', opacity: 0.7 }}>
        {mensaje}
      </p>
    </div>
  );
}