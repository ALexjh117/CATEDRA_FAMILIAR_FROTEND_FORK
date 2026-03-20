import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { listarAcudientesDocente } from '../api/docentes';
import { getSession } from '../api/endpoints';
import TeacherLayout from '../components/TeacherLayout';
import Button from '../components/ui/Button';
import EmptyState404 from '../components/ui/EmptyState404';

interface EstudianteAsociado {
  id: number;
  nombres: string;
  apellidos: string;
  nombreCompleto: string;
  numeroDocumento: string;
  cursoNombre: string;
  gradoId: number;
  esPrincipal: boolean;
}

interface Acudiente {
  id: number;
  nombres: string;
  apellidos: string;
  nombreCompleto: string;
  tipoDocumento: string;
  numeroDocumento: string;
  telefono: string;
  correo: string;
  parentesco: string;
  ocupacion: string;
  direccion: string;
  usuarioId: number;
  createdAt: string;
  updatedAt: string;
  estudiantes: EstudianteAsociado[];
  totalEstudiantes: number;
}

export default function MisAcudientesPage() {
  const navigate = useNavigate();
  const session = getSession();
  
  const [acudientes, setAcudientes] = useState<Acudiente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [acudienteSeleccionado, setAcudienteSeleccionado] = useState<Acudiente | null>(null);
  const [hasError, setHasError] = useState(false);

  const loadAcudientes = async () => {
    setLoading(true);
    setError('');
    setHasError(false);
    
    try {
      console.log('MisAcudientesPage - Cargando acudientes...');
      const response = await listarAcudientesDocente();
      const acudientesData = response?.data || [];
      console.log('MisAcudientesPage - Se cargaron', acudientesData.length, 'acudientes');
      
      setAcudientes(acudientesData);
      
    } catch (err: any) {
      console.error('MisAcudientesPage - Error:', err);
      setError(err?.message || 'Error al cargar acudientes');
      setHasError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('MisAcudientesPage - useEffect ejecutado, user ID:', session?.user?.id);
    if (!session?.user) {
      navigate('/login');
      return;
    }
    
    loadAcudientes();
  }, [session?.user?.id]);

  // Si hay un error crítico, mostrar pantalla de error
  if (hasError) {
    return (
      <TeacherLayout title="Acudientes de Mis Estudiantes">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-red-600 mb-2">Error inesperado</h2>
            <p className="text-slate-600 mb-4">{error}</p>
            <Button onClick={loadAcudientes} className="bg-red-600 hover:bg-red-700">
              Reintentar
            </Button>
          </div>
        </div>
      </TeacherLayout>
    );
  }

  // Filtrar acudientes
  const acudientesFiltrados = acudientes.filter(acudiente => {
    const coincideBusqueda = busqueda === '' || 
      acudiente.nombreCompleto.toLowerCase().includes(busqueda.toLowerCase()) ||
      acudiente.numeroDocumento.includes(busqueda) ||
      (acudiente.correo && acudiente.correo.toLowerCase().includes(busqueda.toLowerCase())) ||
      acudiente.parentesco.toLowerCase().includes(busqueda.toLowerCase());
    
    return coincideBusqueda;
  });

  const getTipoDocumentoColor = (tipo: string) => {
    switch (tipo) {
      case 'TI': return 'bg-blue-100 text-blue-800';
      case 'CC': return 'bg-green-100 text-green-800';
      case 'CE': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getParentescoIcon = (parentesco: string) => {
    const icons: { [key: string]: string } = {
      'MADRE': '👩',
      'PADRE': '👨',
      'ABUELA': '👵',
      'ABUELO': '👴',
      'TÍA': '👱‍♀️',
      'TÍO': '👱‍♂️',
      'HERMANA': '👧',
      'HERMANO': '👦',
    };
    return icons[parentesco.toUpperCase()] || '👤';
  };

  // Error boundary para capturar errores de renderizado
  try {
    if (loading) {
      return (
        <TeacherLayout title="Acudientes de Mis Estudiantes">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
              <p className="text-slate-600">Cargando acudientes...</p>
            </div>
          </div>
        </TeacherLayout>
      );
    }

    if (error) {
      return (
        <TeacherLayout title="Acudientes de Mis Estudiantes">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <div className="text-red-600 mb-2">❌ Error</div>
            <p className="text-red-800">{error}</p>
            <Button 
              onClick={loadAcudientes} 
              className="mt-4 bg-red-600 hover:bg-red-700"
            >
              Reintentar
            </Button>
          </div>
        </TeacherLayout>
      );
    }

    return (
      <TeacherLayout title="Acudientes de Mis Estudiantes">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Acudientes de Mis Estudiantes</h1>
              <p className="text-slate-600 mt-1">
                Total: <span className="font-semibold">{acudientes.length}</span> acudientes
              </p>
            </div>
          </div>

          {/* Filtros */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Buscar acudiente
                </label>
                <input
                  type="text"
                  placeholder="Nombre, documento, correo o parentesco..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>
              
              <div className="flex items-end">
                <Button 
                  onClick={loadAcudientes}
                  className="w-full"
                  variant="outline"
                >
                  🔄 Actualizar
                </Button>
              </div>
            </div>
          </div>

          {/* Lista de acudientes */}
          {acudientesFiltrados.length === 0 ? (
            <EmptyState404 
              title="No se encontraron acudientes"
              description={
                busqueda 
                  ? "Intenta ajustar los filtros de búsqueda"
                  : "No tienes acudientes asignados"
              }
              actionLabel={busqueda ? "Limpiar filtros" : undefined}
              onAction={() => setBusqueda('')}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {acudientesFiltrados.map(acudiente => (
                <div 
                  key={acudiente.id}
                  className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => setAcudienteSeleccionado(acudiente)}
                >
                  {/* Header de la tarjeta */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">{getParentescoIcon(acudiente.parentesco)}</div>
                      <div>
                        <h3 className="font-semibold text-slate-900">{acudiente.nombreCompleto}</h3>
                        <p className="text-sm text-slate-600">{acudiente.parentesco}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTipoDocumentoColor(acudiente.tipoDocumento)}`}>
                      {acudiente.tipoDocumento}
                    </span>
                  </div>

                  {/* Información básica */}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Documento:</span>
                      <span className="font-medium">{acudiente.numeroDocumento}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Teléfono:</span>
                      <span className="font-medium">{acudiente.telefono}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Correo:</span>
                      <span className="font-medium text-blue-600 text-xs truncate">{acudiente.correo}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Ocupación:</span>
                      <span className="font-medium">{acudiente.ocupacion || 'N/A'}</span>
                    </div>
                  </div>

                  {/* Estudiantes asociados */}
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <p className="text-xs font-medium text-slate-600 mb-2">
                      Estudiantes ({acudiente.totalEstudiantes})
                    </p>
                    <div className="space-y-1">
                      {acudiente.estudiantes.slice(0, 2).map((estudiante) => (
                        <div key={estudiante.id} className="text-xs">
                          <span className="font-medium">{estudiante.nombreCompleto}</span>
                          <span className="text-slate-500 ml-1">({estudiante.cursoNombre})</span>
                          {estudiante.esPrincipal && (
                            <span className="ml-1 px-1 py-0.5 bg-amber-100 text-amber-800 rounded text-xs">Principal</span>
                          )}
                        </div>
                      ))}
                      {acudiente.estudiantes.length > 2 && (
                        <p className="text-xs text-slate-500">+{acudiente.estudiantes.length - 2} más</p>
                      )}
                    </div>
                  </div>

                  {/* Botón ver detalles */}
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="w-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        setAcudienteSeleccionado(acudiente);
                      }}
                    >
                      Ver detalles
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Modal de detalles */}
          {acudienteSeleccionado && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="text-4xl">{getParentescoIcon(acudienteSeleccionado.parentesco)}</div>
                      <div>
                        <h2 className="text-xl font-bold text-slate-900">{acudienteSeleccionado.nombreCompleto}</h2>
                        <p className="text-slate-600">{acudienteSeleccionado.parentesco}</p>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setAcudienteSeleccionado(null)}
                    >
                      ✕
                    </Button>
                  </div>

                  {/* Información personal */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="space-y-3">
                      <h3 className="font-semibold text-slate-900 border-b border-slate-200 pb-2">Información Personal</h3>
                      
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <span className="text-slate-600">Tipo Documento:</span>
                        <span className="font-medium">{acudienteSeleccionado.tipoDocumento}</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <span className="text-slate-600">Número Documento:</span>
                        <span className="font-medium">{acudienteSeleccionado.numeroDocumento}</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <span className="text-slate-600">Parentesco:</span>
                        <span className="font-medium">{acudienteSeleccionado.parentesco}</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <span className="text-slate-600">Ocupación:</span>
                        <span className="font-medium">{acudienteSeleccionado.ocupacion || 'N/A'}</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h3 className="font-semibold text-slate-900 border-b border-slate-200 pb-2">Información de Contacto</h3>
                      
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <span className="text-slate-600">Teléfono:</span>
                        <span className="font-medium">{acudienteSeleccionado.telefono}</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <span className="text-slate-600">Correo:</span>
                        <span className="font-medium text-blue-600">{acudienteSeleccionado.correo}</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <span className="text-slate-600">Dirección:</span>
                        <span className="font-medium">{acudienteSeleccionado.direccion || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Estudiantes asociados */}
                  <div className="mb-6">
                    <h3 className="font-semibold text-slate-900 border-b border-slate-200 pb-2 mb-4">
                      Estudiantes Asociados ({acudienteSeleccionado.totalEstudiantes})
                    </h3>
                    <div className="space-y-3">
                      {acudienteSeleccionado.estudiantes.map(estudiante => (
                        <div key={estudiante.id} className="bg-slate-50 rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-medium text-slate-900">{estudiante.nombreCompleto}</h4>
                              <p className="text-sm text-slate-600">Documento: {estudiante.numeroDocumento}</p>
                              <div className="mt-2 space-y-1 text-sm">
                                <p className="text-slate-600">📚 Curso: {estudiante.cursoNombre}</p>
                                <p className="text-slate-600">📖 Grado: {estudiante.gradoId}</p>
                              </div>
                            </div>
                            {estudiante.esPrincipal && (
                              <span className="px-2 py-1 bg-amber-100 text-amber-800 rounded text-xs font-medium">
                                Principal
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                    <Button 
                      variant="outline"
                      onClick={() => setAcudienteSeleccionado(null)}
                    >
                      Cerrar
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </TeacherLayout>
    );
  } catch (renderError) {
    console.error('Error de renderizado en MisAcudientesPage:', renderError);
    return (
      <TeacherLayout title="Acudientes de Mis Estudiantes">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-6xl mb-4">💥</div>
            <h2 className="text-xl font-bold text-red-600 mb-2">Error de renderizado</h2>
            <p className="text-slate-600 mb-4">Ocurrió un error al mostrar la página</p>
            <Button onClick={() => window.location.reload()} className="bg-red-600 hover:bg-red-700">
              Recargar página
            </Button>
          </div>
        </div>
      </TeacherLayout>
    );
  }
}
