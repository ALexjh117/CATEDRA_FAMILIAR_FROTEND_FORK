import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import TeacherLayout from '../components/TeacherLayout';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { listarPeriodos, type PeriodoBackend, getReporteCalificacionesCurso, type ReporteCalificacionesCurso, listarCursos, type CursoBackend } from '../api/docentes';

export default function ReporteCalificacionesCursoPage(){
  const { id } = useParams();
  const initialCursoId = id ? Number(id) : NaN;
  const [cursos, setCursos] = useState<CursoBackend[]>([]);
  const [cursoId, setCursoId] = useState<number | ''>(!isNaN(initialCursoId) ? initialCursoId : '');
  const [periodos, setPeriodos] = useState<PeriodoBackend[]>([]);
  const [periodoId, setPeriodoId] = useState<number | ''>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string|null>(null);
  const [data, setData] = useState<ReporteCalificacionesCurso | null>(null);

  useEffect(() => { 
    listarPeriodos().then(setPeriodos).catch(()=>{});
    listarCursos().then(setCursos).catch(()=>{});
  }, []);

  const load = async () => {
    if (!cursoId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await getReporteCalificacionesCurso(cursoId, { periodoId: periodoId ? Number(periodoId) : undefined });
      setData(res);
    } catch (e: any) {
      setError(e?.message || 'Error al cargar el reporte');
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [cursoId, periodoId]);

  const tareasHeaders = useMemo(() => {
    const set = new Set<string>();
    data?.estudiantes.forEach(est => {
      est.calificaciones?.forEach(c => set.add(c.tarea));
    });
    return Array.from(set);
  }, [data]);

  const descargarCSV = async () => {
    try {
      const base = import.meta.env.VITE_API_URL || 'http://localhost:3333';
      const token = (() => { try { const s = localStorage.getItem('session'); return s ? JSON.parse(s).token : null; } catch { return null; } })();
      const url = new URL(`${base.replace(/\/$/, '')}/reportes/cursos/${cursoId}/calificaciones`);
      if (periodoId) url.searchParams.set('periodo', String(periodoId));
      url.searchParams.set('download', '1');
      url.searchParams.set('format', 'csv');
      const res = await fetch(url.toString(), { headers: token ? { Authorization: `Bearer ${token}` } : undefined });
      if (!res.ok) throw new Error('No se pudo descargar el CSV');
      const blob = await res.blob();
      const a = document.createElement('a');
      const href = URL.createObjectURL(blob);
      a.href = href;
      const pid = periodoId ? `periodo${periodoId}` : '';
      a.download = `reporte_calificaciones_curso_${cursoId}${pid ? '_' + pid : ''}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(href);
    } catch (e) {
      console.error(e);
      alert('Error al descargar CSV');
    }
  };

  return (
    <TeacherLayout>
      <div className="space-y-4">
        <h1 className="text-xl font-semibold text-slate-800">Reporte de Calificaciones por Curso</h1>
        <div className="bg-white p-4 rounded-2xl border">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Curso</label>
              <select className="w-full px-3 py-2 rounded-xl border-2 border-gray-200" value={cursoId} onChange={(e)=>setCursoId(e.target.value ? Number(e.target.value) : '')}>
                <option value="">Seleccione un curso</option>
                {cursos.map(c => (
                  <option key={c.id} value={c.id}>{c.nombre || `Curso #${c.id}`}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Período</label>
              <select className="w-full px-3 py-2 rounded-xl border-2 border-gray-200" value={periodoId} onChange={(e)=>setPeriodoId(e.target.value ? Number(e.target.value) : '')}>
                <option value="">Todos</option>
                {periodos.map(p => (
                  <option key={p.id} value={p.id}>{p.nombre}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end gap-2">
              <Button variant="secondary" onClick={load}>Actualizar</Button>
              <Button onClick={descargarCSV}>Descargar CSV</Button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48"><LoadingSpinner size="lg" text="Cargando..."/></div>
        ) : error ? (
          <div className="p-4 bg-red-50 text-red-700 rounded-xl">{error}</div>
        ) : data ? (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-2xl border">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-sm">
                <div><span className="text-slate-500">Superior:</span> <span className="font-semibold">{data.distribucion.superior}</span></div>
                <div><span className="text-slate-500">Alto:</span> <span className="font-semibold">{data.distribucion.alto}</span></div>
                <div><span className="text-slate-500">Básico:</span> <span className="font-semibold">{data.distribucion.basico}</span></div>
                <div><span className="text-slate-500">Bajo:</span> <span className="font-semibold">{data.distribucion.bajo}</span></div>
              </div>
            </div>
            <div className="bg-white rounded-2xl border overflow-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-700">
                    <th className="px-4 py-2 text-left">Estudiante</th>
                    {tareasHeaders.map(h => (
                      <th key={h} className="px-4 py-2 text-right">{h}</th>
                    ))}
                    <th className="px-4 py-2 text-right">Promedio</th>
                  </tr>
                </thead>
                <tbody>
                  {data.estudiantes.map(e => {
                    const notas = new Map<string, number>();
                    e.calificaciones?.forEach(c => notas.set(c.tarea, c.nota));
                    return (
                      <tr key={e.id} className="border-t">
                        <td className="px-4 py-2">{e.nombre}</td>
                        {tareasHeaders.map(h => (
                          <td key={h} className="px-4 py-2 text-right">{notas.get(h) ?? '-'}</td>
                        ))}
                        <td className="px-4 py-2 text-right">{e.promedio}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="text-slate-500">Selecciona filtros y pulsa Actualizar.</div>
        )}
      </div>
    </TeacherLayout>
  );
}
