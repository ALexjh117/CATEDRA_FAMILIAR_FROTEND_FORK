import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import AcudienteLayout from '../components/AcudienteLayout';
import { getSession } from '../api/endpoints';
import httpService from '../api/httpService';
import { getGradosPublic } from '../api/endpointsDocente-orinetador';
import Button from '../components/ui/Button';

export default function DashboardAcudientePage() {
  const session = getSession();
  const [loading, setLoading] = useState(true);
  const [loadingAcudiente, setLoadingAcudiente] = useState(true);
  const [acudienteData, setAcudienteData] = useState<any>(null);
  const [estudiantes, setEstudiantes] = useState<any[]>(
    ((session as any)?.context?.estudiantes as Array<any>) || []
  );
  const [asignaciones, setAsignaciones] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [cursos, setCursos] = useState<Record<number, string>>({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const limpiarCurso = (nombre?: string) => {
    if (!nombre) return '';
    return String(nombre).replace(/^\d+_/, '');
  };

  const deriveCursoFromEstudiante = (e: any): string => {
    const byNombre = limpiarCurso(e?.cursoNombre || e?.curso?.nombre || e?.curso?.name || e?.curso || '');
    if (byNombre) return byNombre;
    const grado = e?.grado?.nombre || e?.gradoNombre || e?.grado_nombre || e?.gradoDescripcion || e?.grado?.descripcion || e?.grado;
    const grupo = e?.grupo?.nombre || e?.grupoNombre || e?.grupo || e?.letra || e?.paralelo || e?.seccion;
    const nombreDerivado = [grado, grupo].filter(Boolean).join(' ');
    return nombreDerivado || '';
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        console.log('[DASHBOARD_ACUDIENTE] Iniciando carga de datos...');
        setLoading(true);
        setError(null);
        
        console.log('[DASHBOARD_ACUDIENTE] Haciendo petición a /acudientes/mis-tareas');
        const res = await httpService.get<any>('/acudientes/mis-tareas');
        console.log('[DASHBOARD_ACUDIENTE] Respuesta recibida:', res);
        
        if (mounted) {
          const data = res?.data || {};
          console.log('[DASHBOARD_ACUDIENTE] Datos extraídos:', data);
          
          setEstudiantes(Array.isArray(data.estudiantes) ? data.estudiantes : estudiantes);
          setAsignaciones(Array.isArray(data.asignaciones) ? data.asignaciones : []);
          
          // Extraer nombres de cursos para mostrarlos (preferir nombre limpio)
          const cursosMap: Record<number, string> = {};
          if (Array.isArray(data.estudiantes)) {
            data.estudiantes.forEach((e: any) => {
              const id = e?.cursoId ?? e?.curso_id;
              const nombre = deriveCursoFromEstudiante(e);
              if (id != null) cursosMap[Number(id)] = nombre || `Curso ${id}`;
            });
          }
          setCursos(cursosMap);
          console.log('[DASHBOARD_ACUDIENTE] Cursos mapeados:', cursosMap);
        }
      } catch (e: any) {
        console.error('[DASHBOARD_ACUDIENTE] Error cargando datos:', e);
        // Si el endpoint no existe aún, usar contexto de sesión como fallback
        if (mounted) {
          console.log('[DASHBOARD_ACUDIENTE] Usando fallback de sesión');
          const sessionEstudiantes = ((session as any)?.context?.estudiantes as Array<any>) || [];
          console.log('[DASHBOARD_ACUDIENTE] Estudiantes de sesión:', sessionEstudiantes);
          
          setEstudiantes(sessionEstudiantes);
          setAsignaciones([]); // Sin asignaciones si falla el endpoint
          
          // Extraer cursos de los estudiantes de sesión
          const cursosMap: Record<number, string> = {};
          sessionEstudiantes.forEach((e: any) => {
            const id = e?.cursoId ?? e?.curso_id;
            const nombre = deriveCursoFromEstudiante(e);
            if (id != null) cursosMap[Number(id)] = nombre || `Curso ${id}`;
          });
          setCursos(cursosMap);
          setError(null);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Resolver nombres de curso desde /grados si aún faltan (rol acudiente tiene público)
  useEffect(() => {
    (async () => {
      try {
        // IDs a resolver: presentes en estudiantes/asignaciones pero sin nombre confiable
        const idsEst = (Array.isArray(estudiantes) ? estudiantes : [])
          .map((e: any) => e?.cursoId ?? e?.curso_id)
          .filter((v: any) => v != null) as number[];
        const idsAsig = (Array.isArray(asignaciones) ? asignaciones : [])
          .map((a: any) => a?.cursoId ?? a?.curso_id ?? (Array.isArray(a?.cursos) && a.cursos[0]?.id))
          .filter((v: any) => v != null) as number[];
        const ids = Array.from(new Set([...idsEst, ...idsAsig]));

        const faltan = ids.filter((id) => {
          const n = cursos[id];
          return !n || /^Curso\s+\d+$/.test(n);
        });
        if (faltan.length === 0) return;

        const res = await getGradosPublic();
        if (!res.success || !Array.isArray(res.data)) return;
        const nuevos: Record<number, string> = {};
        for (const g of res.data) {
          const arr = Array.isArray(g?.cursos) ? g.cursos : [];
          for (const c of arr) {
            const id = Number(c?.id ?? c?.cursoId ?? c?.curso_id);
            const nombre = limpiarCurso(c?.name ?? c?.nombre ?? '');
            if (id && nombre) nuevos[id] = nombre;
          }
        }
        // Fusionar solo si hay mejoras
        const improved: Record<number, string> = { ...cursos };
        let changed = false;
        for (const id of faltan) {
          if (nuevos[id]) { improved[id] = nuevos[id]; changed = true; }
        }
        if (changed) setCursos(improved);
      } catch {}
    })();
  }, [estudiantes, asignaciones, cursos]);

  // Cargar datos del acudiente para obtener el nombre real
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        console.log('[DASHBOARD_ACUDIENTE] Cargando datos del acudiente...');
        setLoadingAcudiente(true);
        
        const res = await httpService.get<any>('/acudientes/me');
        console.log('[DASHBOARD_ACUDIENTE] Datos del acudiente:', res?.data);
        
        if (mounted && res?.data) {
          setAcudienteData(res.data);
        }
      } catch (e: any) {
        console.error('[DASHBOARD_ACUDIENTE] Error cargando datos del acudiente:', e);
      } finally {
        if (mounted) setLoadingAcudiente(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const tareasPlano = useMemo(() => {
    // Aplanar asignaciones con su cursoId para tabla
    return (Array.isArray(asignaciones) ? asignaciones : []).map((a: any) => ({
      id: a.id,
      titulo: a.titulo || a.nombre || 'Tarea',
      tema: a.tema,
      fechaVencimiento: a.fechaVencimiento || a.fecha_vencimiento || '-',
      frecuencia: a.frecuencia || '-',
      // Add parens to avoid mixing ?? with || without precedence
      cursoId: a.cursoId ?? a.curso_id ?? ((Array.isArray(a.cursos) && a.cursos[0]?.id) || null),
      cursoNombreDirecto: a.cursoNombre || (Array.isArray(a.cursos) && (a.cursos[0]?.nombre || a.cursos[0]?.name)) || undefined,
    }));
  }, [asignaciones]);

  // Resetear página cuando cambian datos o tamaño de página
  useEffect(() => { setPage(1); }, [pageSize, tareasPlano.length]);

  const totalPages = Math.max(1, Math.ceil((tareasPlano.length || 0) / pageSize));
  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return tareasPlano.slice(start, start + pageSize);
  }, [tareasPlano, page, pageSize]);

  // Obtener nombre del acudiente para el título
  const acudienteNombre = useMemo(() => {
    // Primero intentar con los datos del acudiente cargados
    if (acudienteData?.nombres) {
      const nombreCompleto = acudienteData.apellidos 
        ? `${acudienteData.nombres} ${acudienteData.apellidos}`
        : acudienteData.nombres;
      console.log('[DASHBOARD_ACUDIENTE] Nombre real encontrado:', nombreCompleto);
      return nombreCompleto;
    }
    
    // Fallback a datos de sesión
    console.log('[DASHBOARD_ACUDIENTE] Session:', session);
    const user = session?.user;
    console.log('[DASHBOARD_ACUDIENTE] User:', user);
    
    // Intentar diferentes campos donde podría estar el nombre
    const nombre = user?.nombre || user?.nombres || user?.name;
    const correo = user?.correo || user?.email;
    
    console.log('[DASHBOARD_ACUDIENTE] Nombre encontrado (sesión):', nombre);
    console.log('[DASHBOARD_ACUDIENTE] Correo encontrado (sesión):', correo);
    
    if (nombre && nombre !== 'usuario' && nombre !== 'Usuario') {
      return nombre;
    }
    return correo || 'Acudiente';
  }, [session, acudienteData]);

  // Obtener el estudiante asociado a un curso
  const getEstudianteByCursoId = (cursoId: string | number) => {
    console.log('[DASHBOARD_ACUDIENTE] Buscando estudiante para cursoId:', cursoId);
    console.log('[DASHBOARD_ACUDIENTE] Estudiantes disponibles:', estudiantes);
    
    const estudiante = estudiantes.find(e => 
      Number(e.cursoId) === Number(cursoId) || 
      Number(e.curso_id) === Number(cursoId)
    );
    
    console.log('[DASHBOARD_ACUDIENTE] Estudiante encontrado:', estudiante);
    return estudiante;
  };

  // Loading combinado
  const isLoading = loading || loadingAcudiente;

  return (
    <AcudienteLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-teal-50/40 to-emerald-50/30 rounded-2xl p-6 border border-teal-100/50">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-teal-200/20 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative">
            <h1 className="text-2xl md:text-3xl font-display font-bold text-slate-800">Mi Panel ({acudienteNombre})</h1>
            <p className="text-slate-600 mt-1 text-sm">Consulta la información de tus estudiantes asociados.</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Mis Estudiantes</h2>
          {isLoading ? (
            <div className="text-slate-600">Cargando...</div>
          ) : !estudiantes || estudiantes.length === 0 ? (
            <div className="text-slate-600">
              <p className="mb-2">No se encontraron estudiantes asociados.</p>
              {error && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-2">
                  <p className="text-sm text-yellow-800">
                    ⚠️ Error al cargar tareas desde el servidor. 
                    Por favor, contacta al administrador o intenta más tarde.
                  </p>
                </div>
              )}
            </div>
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
                    {(() => {
                      const id = e?.cursoId ?? e?.curso_id;
                      const nombre = cursos[id] || deriveCursoFromEstudiante(e) || '—';
                      return <>Curso: {nombre}</>;
                    })()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Tareas asignadas</h2>
          {isLoading ? (
            <div className="text-slate-600">Cargando...</div>
          ) : tareasPlano.length === 0 ? (
            <div className="text-slate-600">
              <p>No hay tareas asignadas actualmente.</p>
              {error && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-2">
                  <p className="text-sm text-yellow-800">⚠️ No se pudieron cargar las tareas. Es posible que el endpoint no esté disponible.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left py-3.5 px-5 font-semibold text-slate-600">Curso</th>
                    <th className="text-left py-3.5 px-4 font-semibold text-slate-600">Tarea</th>
                    <th className="text-left py-3.5 px-4 font-semibold text-slate-600">Vence</th>
                    <th className="text-left py-3.5 px-4 font-semibold text-slate-600">Frecuencia</th>
                    <th className="text-center py-3.5 px-4 font-semibold text-slate-600">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((t) => {
                    // Resolver nombre de curso priorizando: mapa -> dato directo de asignación -> fallback
                    let cursoNombre = 'Varios';
                    if (t.cursoId != null) {
                      const est = getEstudianteByCursoId(t.cursoId);
                      cursoNombre = cursos[t.cursoId]
                        || (t.cursoNombreDirecto ? limpiarCurso(String(t.cursoNombreDirecto)) : '')
                        || (est ? deriveCursoFromEstudiante(est) : '')
                        || '—';
                    }
                    const estudiante = t.cursoId != null ? getEstudianteByCursoId(t.cursoId) : null;
                    return (
                      <tr key={t.id} className="border-b border-slate-100 hover:bg-slate-50/60">
                        <td className="py-3.5 px-5 text-slate-700"><span className="inline-block max-w-[80px] truncate">{cursoNombre}</span></td>
                        <td className="py-3.5 px-4 text-slate-800">{t.titulo}{t.tema ? <span className="ml-2 text-xs text-teal-700 bg-teal-50 px-2 py-0.5 rounded">{t.tema}</span> : null}</td>
                        <td className="py-3.5 px-4 text-slate-700">{t.fechaVencimiento}</td>
                        <td className="py-3.5 px-4 text-slate-700">{t.frecuencia}</td>
                        <td className="py-3.5 px-4 text-center">
                          {estudiante ? (
                            <Link
                              to={`/acudiente/estudiantes/${estudiante.id}/tareas`}
                              onClick={() => {
                                try { localStorage.setItem('acudiente_estudiante_id', String(estudiante.id)); } catch {}
                              }}
                            >
                              <Button size="sm">Entregar</Button>
                            </Link>
                          ) : (
                            <Button size="sm" disabled>Sin estudiante</Button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              <div className="flex items-center justify-between gap-3 py-3">
                <div className="text-sm text-slate-600 px-1">Página {page} de {totalPages} · {tareasPlano.length} tareas</div>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-slate-600">Mostrar</label>
                  <select
                    className="border border-slate-300 rounded-lg px-2 py-1 text-sm"
                    value={pageSize}
                    onChange={(e)=> setPageSize(Number(e.target.value))}
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                  <div className="flex items-center gap-1">
                    <Button size="sm" variant="ghost" onClick={()=> setPage(1)} disabled={page===1}>«</Button>
                    <Button size="sm" variant="ghost" onClick={()=> setPage(p=> Math.max(1, p-1))} disabled={page===1}>Anterior</Button>
                    <Button size="sm" variant="ghost" onClick={()=> setPage(p=> Math.min(totalPages, p+1))} disabled={page===totalPages}>Siguiente</Button>
                    <Button size="sm" variant="ghost" onClick={()=> setPage(totalPages)} disabled={page===totalPages}>»</Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AcudienteLayout>
  );
}
