import { useState, useEffect } from 'react';
import { getSession, getEstadisticasRector, getInstituciones, getUsuarios, getCursos, getTareas } from '../api/endpoints';
import { type Usuario, type Institucion } from '../mocks/data';
import DashboardLayout from '../components/DashboardLayout';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { exportToExcel, exportToPDF, exportEstadisticasToPDF } from '../utils/exportUtils';
import {
  IconUsers,
  IconClipboard,
  IconBook,
  IconCheckCircle,
  IconClock,
  IconTrendingUp,
  IconDownload,
  IconEye,
  IconInstitution
} from '../components/ui/Icons';

export default function DashboardRectorPage() {
  const session = getSession();
  const user = session?.user;
  
  const [loading, setLoading] = useState(true);
  const [estadisticas, setEstadisticas] = useState<any>(null);
  const [instituciones, setInstituciones] = useState<Institucion[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [cursos, setCursos] = useState<any[]>([]);
  const [tareas, setTareas] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'instituciones' | 'usuarios' | 'reportes'>('overview');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [estadisticasData, institucionesData, usuariosData, cursosData, tareasData] = await Promise.all([
        getEstadisticasRector(),
        getInstituciones(),
        getUsuarios(),
        getCursos(),
        getTareas()
      ]);

      setEstadisticas(estadisticasData);
      setInstituciones(institucionesData);
      setUsuarios(usuariosData);
      setCursos(cursosData);
      setTareas(tareasData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
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

  const stats = {
    totalInstituciones: instituciones.length,
    totalUsuarios: usuarios.length,
    totalDocentes: usuarios.filter(u => u.rol === 'docente_aula').length,
    totalAcudientes: usuarios.filter(u => u.rol === 'acudiente').length,
    totalCursos: cursos.length,
    totalTareas: tareas.length,
    tareasCompletadas: tareas.filter(t => t.estado === 'completada').length,
    participacionPromedio: Math.round((tareas.filter(t => t.estado === 'completada').length / Math.max(tareas.length, 1)) * 100)
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-display font-bold">
                Bienvenido, <span className="text-indigo-200">Rector {user?.nombre}</span>
              </h1>
              <p className="text-indigo-100 mt-1">
                Panel de control global del sistema educativo
              </p>
            </div>
            
            <div className="flex gap-2 mt-4 md:mt-0">
              <button
                onClick={() => exportEstadisticasToPDF(
                  stats,
                  `Estadisticas_Sistema_${new Date().toISOString().split('T')[0]}`,
                  'Estadísticas Globales del Sistema'
                )}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors flex items-center gap-2"
              >
                <IconDownload size={16} />
                Exportar PDF
              </button>
            </div>
          </div>
        </div>

        {/* Estadísticas principales */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl shadow-sm p-5 border border-slate-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                <IconInstitution className="text-white" size={22} />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-800">{stats.totalInstituciones}</div>
                <div className="text-sm text-slate-500 font-medium">Instituciones</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-5 border border-slate-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
                <IconUsers className="text-white" size={22} />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-800">{stats.totalUsuarios}</div>
                <div className="text-sm text-slate-500 font-medium">Usuarios Total</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-5 border border-slate-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
                <IconBook className="text-white" size={22} />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-800">{stats.totalCursos}</div>
                <div className="text-sm text-slate-500 font-medium">Cursos Activos</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-5 border border-slate-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                <IconTrendingUp className="text-white" size={22} />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-800">{stats.participacionPromedio}%</div>
                <div className="text-sm text-slate-500 font-medium">Participación</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="border-b border-slate-100 bg-slate-50/50">
            <nav className="flex gap-1 p-1.5">
              {[
                { id: 'overview', label: 'Resumen', Icon: IconTrendingUp },
                { id: 'instituciones', label: 'Instituciones', Icon: IconInstitution },
                { id: 'usuarios', label: 'Usuarios', Icon: IconUsers },
                { id: 'reportes', label: 'Reportes', Icon: IconDownload },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-white text-indigo-700 shadow-sm'
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
            {/* Tab: Overview */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-slate-800">Resumen del Sistema</h3>
                
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Distribución por rol */}
                  <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-xl p-6 border border-slate-200">
                    <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <IconUsers size={18} />
                      Distribución de Usuarios
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Docentes</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-gray-200 rounded-full">
                            <div 
                              className="h-2 bg-blue-500 rounded-full" 
                              style={{ width: `${(stats.totalDocentes / stats.totalUsuarios) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium w-8">{stats.totalDocentes}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Acudientes</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-gray-200 rounded-full">
                            <div 
                              className="h-2 bg-green-500 rounded-full" 
                              style={{ width: `${(stats.totalAcudientes / stats.totalUsuarios) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium w-8">{stats.totalAcudientes}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Estado de tareas */}
                  <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-xl p-6 border border-emerald-200">
                    <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <IconClipboard size={18} />
                      Estado de Tareas
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Completadas</span>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-emerald-600">{stats.tareasCompletadas}</span>
                          <IconCheckCircle className="text-emerald-500" size={16} />
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Pendientes</span>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-amber-600">{stats.totalTareas - stats.tareasCompletadas}</span>
                          <IconClock className="text-amber-500" size={16} />
                        </div>
                      </div>
                      <div className="pt-2 border-t border-emerald-200">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700">Total</span>
                          <span className="text-xl font-bold text-gray-800">{stats.totalTareas}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Instituciones */}
            {activeTab === 'instituciones' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-800">Instituciones Registradas</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        const data = instituciones.map(inst => ({
                          ID: inst.id,
                          Nombre: inst.nombre,
                          'Código DANE': inst.codigo_dane || '-',
                          Naturaleza: inst.naturaleza,
                          'Teléfono Principal': inst.telefono_principal,
                          Estado: inst.activo ? 'Activa' : 'Inactiva'
                        }));
                        exportToExcel(data, 'Instituciones_Sistema', 'Instituciones');
                      }}
                      className="px-3 py-2 text-sm bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors flex items-center gap-2"
                    >
                      <IconDownload size={14} />
                      Excel
                    </button>
                  </div>
                </div>
                
                <div className="grid gap-4">
                  {instituciones.map(inst => (
                    <div key={inst.id} className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-800">{inst.nombre}</h4>
                          <div className="text-sm text-gray-600 mt-1">
                            <p>Código DANE: {inst.codigo_dane || 'N/A'}</p>
                            <p>NIT: {inst.nit || 'N/A'}</p>
                            <p>Teléfono: {inst.telefono_principal}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                            inst.naturaleza === 'publica' ? 'bg-blue-100 text-blue-700' :
                            inst.naturaleza === 'privada' ? 'bg-purple-100 text-purple-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {inst.naturaleza}
                          </span>
                          <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                            inst.activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {inst.activo ? 'Activa' : 'Inactiva'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab: Usuarios */}
            {activeTab === 'usuarios' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-800">Gestión de Usuarios</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        const data = usuarios.map(user => ({
                          ID: user.id,
                          Nombre: `${user.nombre} ${user.apellidos}`,
                          Rol: user.rol,
                          Teléfono: user.telefono || '-',
                          Estado: user.activo ? 'Activo' : 'Inactivo'
                        }));
                        exportToExcel(data, 'Usuarios_Sistema', 'Usuarios');
                      }}
                      className="px-3 py-2 text-sm bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors flex items-center gap-2"
                    >
                      <IconDownload size={14} />
                      Exportar
                    </button>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {['admin_sistema', 'docente_aula', 'acudiente', 'coordinador'].map(rol => {
                    const usuariosRol = usuarios.filter(u => u.rol === rol);
                    const activos = usuariosRol.filter(u => u.activo).length;
                    
                    return (
                      <div key={rol} className="bg-gradient-to-br from-white to-slate-50 rounded-xl p-5 border border-slate-200">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold text-gray-800 capitalize">{rol.replace('_', ' ')}</h4>
                          <IconEye size={18} className="text-gray-400" />
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Total</span>
                            <span className="text-xl font-bold text-gray-800">{usuariosRol.length}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Activos</span>
                            <span className="text-lg font-semibold text-green-600">{activos}</span>
                          </div>
                          <div className="w-full h-2 bg-gray-200 rounded-full">
                            <div 
                              className="h-2 bg-green-500 rounded-full transition-all duration-300" 
                              style={{ width: `${usuariosRol.length ? (activos / usuariosRol.length) * 100 : 0}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tab: Reportes */}
            {activeTab === 'reportes' && (
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-slate-800">Centro de Reportes</h3>
                
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Reporte de Participación Detallado */}
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-6 border border-blue-200">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-blue-500 rounded-lg">
                        <IconTrendingUp className="text-white" size={20} />
                      </div>
                      <h4 className="font-bold text-gray-800">Estadísticas de Participación</h4>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">Análisis completo de participación con métricas avanzadas</p>
                    
                    {/* Métricas de participación */}
                    <div className="space-y-3 mb-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Promedio Global</span>
                        <span className="text-lg font-bold text-blue-600">{stats.participacionPromedio}%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full">
                        <div 
                          className="h-2 bg-blue-500 rounded-full transition-all duration-500"
                          style={{ width: `${stats.participacionPromedio}%` }}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="bg-white/50 rounded-lg p-2 text-center">
                          <div className="font-bold text-green-600">{stats.tareasCompletadas}</div>
                          <div className="text-gray-600">Completadas</div>
                        </div>
                        <div className="bg-white/50 rounded-lg p-2 text-center">
                          <div className="font-bold text-amber-600">{stats.totalTareas - stats.tareasCompletadas}</div>
                          <div className="text-gray-600">Pendientes</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => exportEstadisticasToPDF(
                          {
                            'Participación Global': {
                              'Promedio General': `${stats.participacionPromedio}%`,
                              'Tareas Completadas': stats.tareasCompletadas,
                              'Tareas Pendientes': stats.totalTareas - stats.tareasCompletadas,
                              'Total Tareas': stats.totalTareas
                            },
                            'Distribución Institucional': {
                              'Total Instituciones': stats.totalInstituciones,
                              'Usuarios Activos': usuarios.filter(u => u.activo).length,
                              'Cursos Activos': stats.totalCursos
                            },
                            'Análisis por Rol': {
                              'Docentes Activos': stats.totalDocentes,
                              'Acudientes Registrados': stats.totalAcudientes,
                              'Coordinadores': usuarios.filter(u => u.rol === 'coordinador').length,
                              'Administradores': usuarios.filter(u => u.rol === 'admin_sistema').length
                            },
                            'Métricas de Calidad': {
                              'Tasa de Completitud': `${stats.participacionPromedio}%`,
                              'Instituciones con Alta Participación': instituciones.filter(i => i.activo).length,
                              'Tendencia': stats.participacionPromedio > 70 ? 'Positiva' : 'Requiere Atención',
                              'Recomendación': stats.participacionPromedio > 80 ? 'Mantener estrategias actuales' : 'Implementar incentivos adicionales'
                            }
                          },
                          'Estadisticas_Participacion_Rector_Detallado',
                          'Estadísticas Avanzadas de Participación - Sistema Cátedra de Familia'
                        )}
                        className="flex-1 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 text-sm"
                      >
                        <IconDownload size={14} />
                        PDF Avanzado
                      </button>
                      <button
                        onClick={() => {
                          const participacionDetallada = instituciones.map(inst => {
                            const usuariosInst = usuarios.filter(u => u.institucionId === inst.id);
                            const tareasInst = tareas.filter(t => usuariosInst.some(u => u.id === t.docenteId));
                            const completadasInst = tareasInst.filter(t => t.estado === 'completada').length;
                            const participacionInst = tareasInst.length > 0 ? Math.round((completadasInst / tareasInst.length) * 100) : 0;
                            
                            return {
                              'Institución': inst.nombre,
                              'Código DANE': inst.codigo_dane || 'N/A',
                              'Naturaleza': inst.naturaleza,
                              'Total Usuarios': usuariosInst.length,
                              'Docentes': usuariosInst.filter(u => u.rol === 'docente_aula').length,
                              'Acudientes': usuariosInst.filter(u => u.rol === 'acudiente').length,
                              'Tareas Totales': tareasInst.length,
                              'Tareas Completadas': completadasInst,
                              'Participación %': `${participacionInst}%`,
                              'Estado': participacionInst > 80 ? 'Excelente' : participacionInst > 60 ? 'Bueno' : 'Requiere Atención'
                            };
                          });
                          exportToExcel(participacionDetallada, 'Participacion_Por_Institucion', 'Participación');
                        }}
                        className="flex-1 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2 text-sm"
                      >
                        <IconDownload size={14} />
                        Excel Detallado
                      </button>
                    </div>
                  </div>

                  {/* Reporte de Instituciones Avanzado */}
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl p-6 border border-purple-200">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-purple-500 rounded-lg">
                        <IconInstitution className="text-white" size={20} />
                      </div>
                      <h4 className="font-bold text-gray-800">Análisis Institucional</h4>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">Reporte completo del desempeño institucional</p>
                    
                    {/* Distribución por naturaleza */}
                    <div className="space-y-2 mb-4">
                      {['publica', 'privada', 'mixta'].map(naturaleza => {
                        const count = instituciones.filter(i => i.naturaleza === naturaleza).length;
                        const percentage = instituciones.length > 0 ? (count / instituciones.length) * 100 : 0;
                        
                        return (
                          <div key={naturaleza} className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700 capitalize">{naturaleza}</span>
                            <div className="flex items-center gap-3">
                              <div className="w-16 h-2 bg-gray-200 rounded-full">
                                <div 
                                  className={`h-2 rounded-full ${
                                    naturaleza === 'publica' ? 'bg-blue-500' :
                                    naturaleza === 'privada' ? 'bg-purple-500' : 'bg-green-500'
                                  }`}
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                              <span className="text-sm font-bold text-gray-800 w-6">{count}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          const analisisInstitucional = instituciones.map(inst => {
                            const usuariosInst = usuarios.filter(u => u.institucionId === inst.id);
                            const cursosInst = cursos.filter(c => c.institucionId === inst.id);
                            
                            return {
                              'Código DANE': inst.codigo_dane || '-',
                              'Institución': inst.nombre,
                              'NIT': inst.nit || '-',
                              'Naturaleza': inst.naturaleza,
                              'Teléfono': inst.telefono_principal,
                              'Email': inst.correo_institucional,
                              'Rector': inst.rector_nombre || '-',
                              'Tel. Rector': inst.rector_telefono || '-',
                              'Total Usuarios': usuariosInst.length,
                              'Docentes': usuariosInst.filter(u => u.rol === 'docente_aula').length,
                              'Coordinadores': usuariosInst.filter(u => u.rol === 'coordinador').length,
                              'Acudientes': usuariosInst.filter(u => u.rol === 'acudiente').length,
                              'Cursos': cursosInst.length,
                              'Estado': inst.activo ? 'Activa' : 'Inactiva',
                              'Nivel Implementación': usuariosInst.length > 50 ? 'Alto' : usuariosInst.length > 20 ? 'Medio' : 'Básico'
                            };
                          });
                          exportToPDF(
                            analisisInstitucional,
                            'Analisis_Institucional_Completo',
                            'Análisis Institucional Completo - Sistema Educativo',
                            [
                              { header: 'Institución', dataKey: 'Institución' },
                              { header: 'Código DANE', dataKey: 'Código DANE' },
                              { header: 'Naturaleza', dataKey: 'Naturaleza' },
                              { header: 'Usuarios', dataKey: 'Total Usuarios' },
                              { header: 'Estado', dataKey: 'Estado' }
                            ]
                          );
                        }}
                        className="flex-1 px-3 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors flex items-center justify-center gap-2 text-sm"
                      >
                        <IconDownload size={14} />
                        PDF Completo
                      </button>
                      <button
                        onClick={() => {
                          const resumenEjecutivo = {
                            'Resumen Ejecutivo': {
                              'Total Instituciones': stats.totalInstituciones,
                              'Promedio Usuarios por Institución': Math.round(stats.totalUsuarios / stats.totalInstituciones),
                              'Instituciones Públicas': instituciones.filter(i => i.naturaleza === 'publica').length,
                              'Instituciones Privadas': instituciones.filter(i => i.naturaleza === 'privada').length,
                              'Cobertura Geográfica': 'Colombia - Múltiples Departamentos',
                              'Estado General': 'Operativo'
                            }
                          };
                          exportEstadisticasToPDF(
                            resumenEjecutivo,
                            'Resumen_Ejecutivo_Rector',
                            'Resumen Ejecutivo - Gestión Rectoral'
                          );
                        }}
                        className="flex-1 px-3 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors flex items-center justify-center gap-2 text-sm"
                      >
                        <IconDownload size={14} />
                        Ejecutivo
                      </button>
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