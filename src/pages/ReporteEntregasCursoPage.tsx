import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import TeacherLayout from '../components/TeacherLayout';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { httpService } from '../api/httpService';
import { listarPeriodos, type PeriodoBackend, getReporteEntregasCurso, type ReporteEntregasCurso, listarCursos, type CursoBackend } from '../api/docentes';

export default function ReporteEntregasCursoPage(){
  const { id } = useParams();
  const initialCursoId = id ? Number(id) : NaN;
  const [cursos, setCursos] = useState<CursoBackend[]>([]);
  const [cursoId, setCursoId] = useState<number | ''>(!isNaN(initialCursoId) ? initialCursoId : '');
  const [periodos, setPeriodos] = useState<PeriodoBackend[]>([]);
  const [periodoId, setPeriodoId] = useState<number | ''>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string|null>(null);
  const [data, setData] = useState<ReporteEntregasCurso | null>(null);

  useEffect(() => {
    listarPeriodos().then(setPeriodos).catch(()=>{});
    listarCursos().then(setCursos).catch(()=>{});
  }, []);

  const load = async () => {
    if (!cursoId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await getReporteEntregasCurso(cursoId, { periodoId: periodoId ? Number(periodoId) : undefined });
      setData(res);
    } catch (e: any) {
      setError(e?.message || 'Error al cargar el reporte');
    } finally {
      setLoading(false);
    }
  };
  const descargarCSV = async () => {
    try {
      let endpoint = `/reportes/cursos/${cursoId}/entregas?download=1&format=csv`;
      if (periodoId) endpoint += `&periodo=${periodoId}`;
      const response = await httpService.get(endpoint);
      if (response.status !== 200) throw new Error('No se pudo descargar el CSV');
      const blob = new Blob([response.data], { type: 'text/csv' });
      const a = document.createElement('a');
      const href = URL.createObjectURL(blob);
      a.href = href;
      const pid = periodoId ? `periodo${periodoId}` : '';
      a.download = `reporte_entregas_curso_${cursoId}${pid ? '_' + pid : ''}.csv`;
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
        <h1 className="text-xl font-semibold text-slate-800">Reporte de Entregas por Curso</h1>
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

        {!cursoId ? (
          <div className="p-4 bg-amber-50 text-amber-700 rounded-xl">Seleccione un curso y luego pulse Actualizar.</div>
        ) : loading ? (
          <div className="flex items-center justify-center h-48"><LoadingSpinner size="lg" text="Cargando..."/></div>
        ) : error ? (
          <div className="p-4 bg-red-50 text-red-700 rounded-xl">{error}</div>
        ) : data ? (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-2xl border">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                <div><span className="text-slate-500">Total Tareas:</span> <span className="font-semibold">{data?.resumen?.totalTareas ?? 0}</span></div>
                <div><span className="text-slate-500">Promedio Entregas:</span> <span className="font-semibold">{data?.resumen?.promedioEntregas ?? 0}</span></div>
                <div><span className="text-slate-500">Promedio Curso:</span> <span className="font-semibold">{data?.resumen?.promedioCurso ?? 0}</span></div>
              </div>
            </div>
            <div className="bg-white rounded-2xl border overflow-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-700">
                    <th className="px-4 py-2 text-left">Estudiante</th>
                    <th className="px-4 py-2 text-right">Tareas Asignadas</th>
                    <th className="px-4 py-2 text-right">Tareas Entregadas</th>
                    <th className="px-4 py-2 text-right">Promedio</th>
                    <th className="px-4 py-2 text-right">% Cumplimiento</th>
                  </tr>
                </thead>
                <tbody>
                  {(data?.estudiantes ?? []).map(e => (
                    <tr key={e.id} className="border-t">
                      <td className="px-4 py-2">{e.nombre ?? '-'}</td>
                      <td className="px-4 py-2 text-right">{e.tareasAsignadas ?? 0}</td>
                      <td className="px-4 py-2 text-right">{e.tareasEntregadas ?? 0}</td>
                      <td className="px-4 py-2 text-right">{e.promedio ?? 0}</td>
                      <td className="px-4 py-2 text-right">{e.porcentajeCumplimiento ?? 0}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="text-slate-500">Selecciona curso y período y pulsa Actualizar.</div>
        )}
      </div>
    </TeacherLayout>
  );
}
