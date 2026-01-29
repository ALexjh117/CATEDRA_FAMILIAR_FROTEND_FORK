import { useState, useEffect } from 'react';
import { getCursos, getTareas, getEstudiantes, getEntregas, getDocentesCoordinador } from '../../api/endpoints';
import { type Curso, type Tarea, type Usuario, type Estudiante, type Entrega } from '../../mocks/data';
import DashboardLayout from '../DashboardLayout';
import LoadingSpinner from '../ui/LoadingSpinner';
import { exportToExcel, exportToPDF, exportEstadisticasToPDF } from '../../utils/exportUtils';
import { 
  IconBook,
  IconClipboard,
  IconUsers,
  IconDownload,
  IconTrendingUp,
  IconCheckCircle,
  IconClock,
  IconAlert,
  IconEye,
  IconBarChart
} from '../ui/Icons';

export default function ReportesCoordinador() {
  const [loading, setLoading] = useState(true);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [entregas, setEntregas] = useState<Entrega[]>([]);
  const [selectedPeriodo, setSelectedPeriodo] = useState<string>('2024-1');
  const [activeTab, setActiveTab] = useState<'rendimiento' | 'docentes' | 'estudiantes' | 'comparativo'>('rendimiento');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Usar getDocentesCoordinador en lugar de getUsuarios (evita 403)
      const [cursosData, tareasData, docentesData, estudiantesData, entregasData] = await Promise.all([
        getCursos(),
        getTareas(),
        getDocentesCoordinador(),
        getEstudiantes(),
        getEntregas()
      ]);

      setCursos(Array.isArray(cursosData) ? cursosData : []);
      setTareas(Array.isArray(tareasData) ? tareasData : []);
      // Mapear docentes al formato Usuario
      const docentesArray = Array.isArray(docentesData) ? docentesData : [];
      const usuariosMapped = docentesArray.map((d: any) => ({
        id: d.usuarioId || d.id,
        nombre: d.nombres || d.nombre || '',
        apellidos: d.apellidos || d.apellido || '',
        correo: d.correo || '',
        telefono: d.telefono || '',
        rol: 'docente_aula',
        activo: d.estaActivo ?? true
      } as Usuario));
      setUsuarios(usuariosMapped);
      setEstudiantes(Array.isArray(estudiantesData) ? estudiantesData : []);
      setEntregas(Array.isArray(entregasData) ? entregasData : []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const docentes = usuarios.filter(u => u.rol === 'docente_aula');
  
  // Estadísticas por curso
  const estadisticasCursos = cursos.map(curso => {
    const tareasCurso = tareas.filter(t => t.cursoId === curso.id);
    const entregasCurso = entregas.filter(e => tareasCurso.some(t => t.id === e.tareaId));
    const promedioCalificaciones = entregasCurso.length > 0 
      ? entregasCurso.reduce((sum, e) => sum + Number(e.calificacion || 0), 0) / entregasCurso.length 
      : 0;
    
    return {
      curso,
      totalTareas: tareasCurso.length,
      tareasCompletadas: tareasCurso.filter(t => t.estado === 'completada').length,
      totalEntregas: entregasCurso.length,
      promedioCalificaciones: Math.round(promedioCalificaciones * 10) / 10,
      participacion: tareasCurso.length > 0 ? Math.round((tareasCurso.filter(t => t.estado === 'completada').length / tareasCurso.length) * 100) : 0
    };
  });

  // Estadísticas por docente
  const estadisticasDocentes = docentes.map(docente => {
    const tareasDocente = tareas.filter(t => t.docenteId === docente.id);
    const entregasDocente = entregas.filter(e => tareasDocente.some(t => t.id === e.tareaId));
    
    return {
      docente,
      totalTareas: tareasDocente.length,
      tareasActivas: tareasDocente.filter(t => t.estado === 'activa').length,
      promedioCalificaciones: entregasDocente.length > 0 
        ? Math.round((entregasDocente.reduce((sum, e) => sum + Number(e.calificacion || 0), 0) / entregasDocente.length) * 10) / 10 
        : 0,
      estudiantesAtendidos: new Set(entregasDocente.map(e => e.estudianteId)).size
    };
  });

  const generateRendimientoReport = () => {
    const data = estadisticasCursos.map(stat => ({
      'Curso': stat.curso.nombre,
      'Grado': stat.curso.grado,
      'Total Tareas': stat.totalTareas,
      'Tareas Completadas': stat.tareasCompletadas,
      'Participación %': `${stat.participacion}%`,
      'Total Entregas': stat.totalEntregas,
      'Promedio Calificaciones': stat.promedioCalificaciones,
      'Estado': stat.participacion > 80 ? 'Excelente' : stat.participacion > 60 ? 'Bueno' : 'Requiere Atención'
    }));

    exportToExcel(data, `Reporte_Rendimiento_Academico_${selectedPeriodo}`, 'Rendimiento por Curso');
  };

  const generateDocentesReport = () => {
    const data = estadisticasDocentes.map(stat => ({
      'Docente': `${stat.docente.nombre} ${stat.docente.apellidos}`,
      'Teléfono': stat.docente.telefono,
      'Total Tareas Creadas': stat.totalTareas,
      'Tareas Activas': stat.tareasActivas,
      'Estudiantes Atendidos': stat.estudiantesAtendidos,
      'Promedio Calificaciones': stat.promedioCalificaciones,
      'Productividad': stat.totalTareas > 10 ? 'Alta' : stat.totalTareas > 5 ? 'Media' : 'Baja',
      'Estado': stat.tareasActivas > 0 ? 'Activo' : 'Inactivo'
    }));

    exportToPDF(
      data,
      `Reporte_Desempeno_Docentes_${selectedPeriodo}`,
      'Reporte de Desempeño Docente - Coordinación Académica',
      [
        { header: 'Docente', dataKey: 'Docente' },
        { header: 'Tareas Creadas', dataKey: 'Total Tareas Creadas' },
        { header: 'Estudiantes', dataKey: 'Estudiantes Atendidos' },
        { header: 'Promedio', dataKey: 'Promedio Calificaciones' },
        { header: 'Estado', dataKey: 'Estado' }
      ]
    );
  };

  const generateComparativoReport = () => {
    const estadisticas = {
      'Resumen Académico': {
        'Total Cursos': cursos.length,
        'Total Docentes': docentes.length,
        'Total Estudiantes': estudiantes.length,
        'Total Tareas': tareas.length,
        'Promedio Participación': `${Math.round(estadisticasCursos.reduce((sum, stat) => sum + stat.participacion, 0) / estadisticasCursos.length)}%`
      },
      'Rendimiento por Grado': {
        'Primaria': estadisticasCursos.filter(s => parseInt(s.curso.grado.replace('°', '')) <= 5).length,
        'Secundaria': estadisticasCursos.filter(s => parseInt(s.curso.grado.replace('°', '')) > 5 && parseInt(s.curso.grado.replace('°', '')) <= 9).length,
        'Media': estadisticasCursos.filter(s => parseInt(s.curso.grado.replace('°', '')) > 9).length
      },
      'Análisis de Calidad': {
        'Cursos Excelentes (>80%)': estadisticasCursos.filter(s => s.participacion > 80).length,
        'Cursos Buenos (60-80%)': estadisticasCursos.filter(s => s.participacion >= 60 && s.participacion <= 80).length,
        'Cursos Requieren Atención (<60%)': estadisticasCursos.filter(s => s.participacion < 60).length,
        'Promedio General Calificaciones': estadisticasCursos.length > 0 ? 
          Math.round((estadisticasCursos.reduce((sum, s) => sum + s.promedioCalificaciones, 0) / estadisticasCursos.length) * 10) / 10 : 0
      }
    };

    exportEstadisticasToPDF(
      estadisticas,
      `Reporte_Comparativo_Academico_${selectedPeriodo}`,
      'Reporte Comparativo Académico - Coordinación'
    );
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center min-h-96">
          <LoadingSpinner />
        </div>
      </DashboardLayout>
    );
  }

  const promedioGeneralParticipacion = Math.round(
    estadisticasCursos.reduce((sum, stat) => sum + stat.participacion, 0) / Math.max(estadisticasCursos.length, 1)
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-8 text-white">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-display font-bold">Reportes Académicos</h1>
              <p className="text-emerald-100 mt-1">
                Análisis y seguimiento del rendimiento académico
              </p>
            </div>
            
            <div className="flex items-center gap-4 mt-4 md:mt-0">
              <select
                value={selectedPeriodo}
                onChange={(e) => setSelectedPeriodo(e.target.value)}
                className="px-4 py-2 bg-white/20 backdrop-blur rounded-lg text-white border border-white/30 focus:ring-2 focus:ring-white/50 focus:border-transparent"
              >
                <option value="2024-1">Período 2024-1</option>
                <option value="2023-2">Período 2023-2</option>
                <option value="2023-1">Período 2023-1</option>
              </select>
              
              <div className="text-center text-emerald-100">
                <div className="text-xl font-bold">{promedioGeneralParticipacion}%</div>
                <div className="text-xs">Participación</div>
              </div>
            </div>
          </div>
        </div>

        {/* Estadísticas principales */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl shadow-sm p-5 border border-slate-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                <IconBook className="text-white" size={22} />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-800">{cursos.length}</div>
                <div className="text-sm text-slate-500 font-medium">Cursos</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-5 border border-slate-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
                <IconUsers className="text-white" size={22} />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-800">{docentes.length}</div>
                <div className="text-sm text-slate-500 font-medium">Docentes</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-5 border border-slate-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
                <IconClipboard className="text-white" size={22} />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-800">{tareas.length}</div>
                <div className="text-sm text-slate-500 font-medium">Tareas</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-5 border border-slate-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                <IconTrendingUp className="text-white" size={22} />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-800">{entregas.length}</div>
                <div className="text-sm text-slate-500 font-medium">Entregas</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs de reportes */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="border-b border-slate-100 bg-slate-50/50">
            <nav className="flex gap-1 p-1.5">
              {[
                { id: 'rendimiento', label: 'Rendimiento', Icon: IconTrendingUp },
                { id: 'docentes', label: 'Docentes', Icon: IconUsers },
                { id: 'estudiantes', label: 'Estudiantes', Icon: IconEye },
                { id: 'comparativo', label: 'Comparativo', Icon: IconBarChart },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-white text-emerald-700 shadow-sm'
                      : 'text-slate-600 hover:text-slate-800 hover:bg-white/50'
                  }`}
                >
                  <tab.Icon size={18} />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Tab: Rendimiento */}
            {activeTab === 'rendimiento' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-800">Rendimiento por Curso</h3>
                  <button
                    onClick={generateRendimientoReport}
                    className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors flex items-center gap-2"
                  >
                    <IconDownload size={16} />
                    Exportar Excel
                  </button>
                </div>

                <div className="grid gap-4">
                  {estadisticasCursos.map(stat => (
                    <div key={stat.curso.id} className="bg-gradient-to-r from-white to-slate-50 border border-slate-200 rounded-xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="font-bold text-gray-800 text-lg">{stat.curso.nombre}</h4>
                          <p className="text-gray-600">Grado: {stat.curso.grado}</p>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                          stat.participacion > 80 ? 'bg-green-100 text-green-700' :
                          stat.participacion > 60 ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {stat.participacion > 80 ? 'Excelente' :
                           stat.participacion > 60 ? 'Bueno' : 'Requiere Atención'}
                        </div>
                      </div>

                      <div className="grid md:grid-cols-4 gap-4">
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                          <div className="text-xl font-bold text-blue-600">{stat.totalTareas}</div>
                          <div className="text-sm text-blue-700">Tareas Total</div>
                        </div>
                        <div className="text-center p-3 bg-green-50 rounded-lg">
                          <div className="text-xl font-bold text-green-600">{stat.tareasCompletadas}</div>
                          <div className="text-sm text-green-700">Completadas</div>
                        </div>
                        <div className="text-center p-3 bg-purple-50 rounded-lg">
                          <div className="text-xl font-bold text-purple-600">{stat.participacion}%</div>
                          <div className="text-sm text-purple-700">Participación</div>
                        </div>
                        <div className="text-center p-3 bg-amber-50 rounded-lg">
                          <div className="text-xl font-bold text-amber-600">{stat.promedioCalificaciones}</div>
                          <div className="text-sm text-amber-700">Promedio</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab: Docentes */}
            {activeTab === 'docentes' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-800">Desempeño Docente</h3>
                  <button
                    onClick={generateDocentesReport}
                    className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors flex items-center gap-2"
                  >
                    <IconDownload size={16} />
                    Generar PDF
                  </button>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {estadisticasDocentes.map(stat => (
                    <div key={stat.docente.id} className="bg-white border border-slate-200 rounded-xl p-5">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-bold">
                          {stat.docente.nombre.charAt(0)}{stat.docente.apellidos.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-800">
                            {stat.docente.nombre} {stat.docente.apellidos}
                          </h4>
                          <p className="text-sm text-gray-600">{stat.docente.telefono}</p>
                        </div>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                          stat.totalTareas > 10 ? 'bg-green-100 text-green-700' :
                          stat.totalTareas > 5 ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {stat.totalTareas > 10 ? 'Alta' : stat.totalTareas > 5 ? 'Media' : 'Baja'}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="text-center p-2 bg-blue-50 rounded">
                          <div className="font-bold text-blue-600">{stat.totalTareas}</div>
                          <div className="text-xs text-blue-700">Tareas</div>
                        </div>
                        <div className="text-center p-2 bg-green-50 rounded">
                          <div className="font-bold text-green-600">{stat.tareasActivas}</div>
                          <div className="text-xs text-green-700">Activas</div>
                        </div>
                        <div className="text-center p-2 bg-purple-50 rounded">
                          <div className="font-bold text-purple-600">{stat.estudiantesAtendidos}</div>
                          <div className="text-xs text-purple-700">Estudiantes</div>
                        </div>
                        <div className="text-center p-2 bg-amber-50 rounded">
                          <div className="font-bold text-amber-600">{stat.promedioCalificaciones}</div>
                          <div className="text-xs text-amber-700">Promedio</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab: Estudiantes */}
            {activeTab === 'estudiantes' && (
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-slate-800">Análisis de Estudiantes</h3>
                
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6">
                    <h4 className="font-bold text-gray-800 mb-4">Participación</h4>
                    <div className="text-3xl font-bold text-blue-600 mb-2">{entregas.length}</div>
                    <div className="text-sm text-blue-700">Total entregas</div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6">
                    <h4 className="font-bold text-gray-800 mb-4">Calificaciones</h4>
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      {entregas.length > 0 ? Math.round((entregas.reduce((sum, e) => sum + Number(e.calificacion || 0), 0) / entregas.length) * 10) / 10 : 0}
                    </div>
                    <div className="text-sm text-green-700">Promedio general</div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6">
                    <h4 className="font-bold text-gray-800 mb-4">Estudiantes</h4>
                    <div className="text-3xl font-bold text-purple-600 mb-2">{estudiantes.length}</div>
                    <div className="text-sm text-purple-700">Total registrados</div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Comparativo */}
            {activeTab === 'comparativo' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-800">Análisis Comparativo</h3>
                  <button
                    onClick={generateComparativoReport}
                    className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors flex items-center gap-2"
                  >
                    <IconDownload size={16} />
                    Reporte PDF
                  </button>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white border border-slate-200 rounded-xl p-6">
                    <h4 className="font-bold text-gray-800 mb-4">Distribución de Calidad</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Cursos Excelentes (&gt;80%)</span>
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-gray-200 rounded-full">
                            <div 
                              className="h-2 bg-green-500 rounded-full"
                              style={{ width: `${(estadisticasCursos.filter(s => s.participacion > 80).length / estadisticasCursos.length) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm font-bold w-6">{estadisticasCursos.filter(s => s.participacion > 80).length}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Buenos (60-80%)</span>
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-gray-200 rounded-full">
                            <div 
                              className="h-2 bg-yellow-500 rounded-full"
                              style={{ width: `${(estadisticasCursos.filter(s => s.participacion >= 60 && s.participacion <= 80).length / estadisticasCursos.length) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm font-bold w-6">{estadisticasCursos.filter(s => s.participacion >= 60 && s.participacion <= 80).length}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Requieren Atención (&lt;60%)</span>
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-gray-200 rounded-full">
                            <div 
                              className="h-2 bg-red-500 rounded-full"
                              style={{ width: `${(estadisticasCursos.filter(s => s.participacion < 60).length / estadisticasCursos.length) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm font-bold w-6">{estadisticasCursos.filter(s => s.participacion < 60).length}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-xl p-6">
                    <h4 className="font-bold text-gray-800 mb-4">Métricas Generales</h4>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Participación Promedio</span>
                        <span className="text-lg font-bold text-emerald-600">{promedioGeneralParticipacion}%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Docentes Activos</span>
                        <span className="text-lg font-bold text-blue-600">{estadisticasDocentes.filter(s => s.tareasActivas > 0).length}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Calificación Promedio</span>
                        <span className="text-lg font-bold text-purple-600">
                          {estadisticasCursos.length > 0 ? 
                            Math.round((estadisticasCursos.reduce((sum, s) => sum + s.promedioCalificaciones, 0) / estadisticasCursos.length) * 10) / 10 : 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}