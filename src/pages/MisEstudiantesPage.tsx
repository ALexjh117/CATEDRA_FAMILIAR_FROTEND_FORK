import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { listarEstudiantesDocente } from '../api/docentes';
import { getSession } from '../api/endpoints';
import TeacherLayout from '../components/TeacherLayout';
import Button from '../components/ui/Button';
import EmptyState404 from '../components/ui/EmptyState404';
import { HiOutlineArrowPath, HiOutlineExclamationTriangle, HiOutlineXMark, HiOutlinePhone, HiOutlineEnvelope, HiOutlineXCircle } from 'react-icons/hi2';
import { PiGenderMaleBold, PiGenderFemaleBold } from 'react-icons/pi';

interface Estudiante {
  id: number;
  nombres: string;
  apellidos: string;
  nombreCompleto: string;
  tipoDocumento: string;
  numeroDocumento: string;
  fechaNacimiento: string;
  sexo: string;
  telefono: string;
  correoElectronico: string;
  direccion: string;
  barrio: string;
  eps: string;
  grupoSanguineo: string;
  rh: string;
  curso: {
    id: number;
    nombre: string;
    gradoId: number;
    jornada: string;
  };
  acudientes: Array<{
    id: number;
    nombres: string;
    apellidos: string;
    parentesco: string;
    telefono: string;
    correo: string;
    esPrincipal: boolean;
  }>;
  createdAt: string;
  updatedAt: string;
}

export default function MisEstudiantesPage() {
  const navigate = useNavigate();
  const session = getSession();
  
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [cursoSeleccionado, setCursoSeleccionado] = useState<string>('');
  const [cursosUnicos, setCursosUnicos] = useState<string[]>([]);
  const [estudianteSeleccionado, setEstudianteSeleccionado] = useState<Estudiante | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Agregar un error boundary para capturar errores
  const [hasError, setHasError] = useState(false);

  const loadEstudiantes = async () => {
    setLoading(true);
    setError('');
    setHasError(false);
    
    try {
      const response = await listarEstudiantesDocente();
      const estudiantesData = response?.data || [];
      // Filtrar por institución a partir del prefijo en el nombre del curso (p.ej. "58_")
      const institucionId = (session as any)?.context?.institucionId || (session as any)?.user?.institucionId || (session as any)?.user?.institucion;
      const prefijo = institucionId ? `${String(institucionId)}_` : '';
      const estudiantesFiltradosPorInst = prefijo
        ? (estudiantesData as Estudiante[]).filter(e => e?.curso?.nombre?.startsWith(prefijo))
        : (estudiantesData as Estudiante[]);
      
      setEstudiantes(estudiantesFiltradosPorInst);
      
      // Extraer cursos únicos - manejar casos donde curso sea null/undefined
      const cursos = Array.from(new Set(
        (estudiantesFiltradosPorInst as Estudiante[])
          .filter((e: Estudiante) => e.curso && e.curso.nombre)
          .map((e: Estudiante) => e.curso.nombre)
      )) as string[];
      setCursosUnicos(cursos);
      
    } catch (err: any) {
      console.error('MisEstudiantesPage - Error:', err);
      setError(err?.message || 'Error al cargar estudiantes');
      setHasError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!session?.user) {
      navigate('/login');
      return;
    }
    
    loadEstudiantes();
  }, [session?.user?.id]); // Solo recargar si cambia el usuario (no en cada render)

  // Resetear página al cambiar filtros o datos
  useEffect(() => {
    setPage(1);
  }, [busqueda, cursoSeleccionado, estudiantes.length]);

  // Si hay un error crítico, mostrar pantalla de error
  if (hasError) {
    return (
      <TeacherLayout title="Mis Estudiantes">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-6xl mb-4 text-amber-500 flex items-center justify-center"><HiOutlineExclamationTriangle /></div>
            <h2 className="text-xl font-bold text-red-600 mb-2">Error inesperado</h2>
            <p className="text-slate-600 mb-4">{error}</p>
            <Button onClick={loadEstudiantes} className="bg-red-600 hover:bg-red-700">
              Reintentar
            </Button>
          </div>
        </div>
      </TeacherLayout>
    );
  }

  // Error boundary para capturar errores de renderizado
  try {

  // Filtrar estudiantes
  const estudiantesFiltrados = estudiantes.filter(estudiante => {
    const coincideBusqueda = busqueda === '' || 
      estudiante.nombreCompleto.toLowerCase().includes(busqueda.toLowerCase()) ||
      estudiante.numeroDocumento.includes(busqueda) ||
      (estudiante.correoElectronico && estudiante.correoElectronico.toLowerCase().includes(busqueda.toLowerCase()));
    
    const coincideCurso = cursoSeleccionado === '' || 
      (estudiante.curso && estudiante.curso.nombre === cursoSeleccionado);
    
    return coincideBusqueda && coincideCurso;
  });

  const totalPages = Math.max(1, Math.ceil(estudiantesFiltrados.length / pageSize));
  const estudiantesPaginados = estudiantesFiltrados.slice((page - 1) * pageSize, page * pageSize);

  const getEdad = (fechaNacimiento: string) => {
    try {
      if (!fechaNacimiento) return 'N/A';
      const fecha = new Date(fechaNacimiento);
      if (isNaN(fecha.getTime())) return 'N/A';
      
      const hoy = new Date();
      const edad = hoy.getFullYear() - fecha.getFullYear();
      const mes = hoy.getMonth() - fecha.getMonth();
      
      if (mes < 0 || (mes === 0 && hoy.getDate() < fecha.getDate())) {
        return Math.max(0, edad - 1);
      }
      
      return Math.max(0, edad);
    } catch {
      return 'N/A';
    }
  };

  const getSexoIcon = (sexo: string) => {
    return sexo === 'M'
      ? <PiGenderMaleBold className="text-teal-600" size={26} />
      : <PiGenderFemaleBold className="text-pink-600" size={26} />;
  };

  const getTipoDocumentoColor = (tipo: string) => {
    switch (tipo) {
      case 'TI': return 'bg-blue-100 text-blue-800';
      case 'CC': return 'bg-green-100 text-green-800';
      case 'CE': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const limpiarCurso = (nombre?: string) => {
    if (!nombre) return '';
    return nombre.replace(/^\d+_/, '');
  };

  if (loading) {
    return (
      <TeacherLayout title="Mis Estudiantes">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
            <p className="text-slate-600">Cargando estudiantes...</p>
          </div>
        </div>
      </TeacherLayout>
    );
  }

  if (error) {
    return (
      <TeacherLayout title="Mis Estudiantes">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <div className="text-red-600 mb-2 flex items-center justify-center gap-2"><HiOutlineXCircle /><span>Error</span></div>
          <p className="text-red-800">{error}</p>
          <Button 
            onClick={loadEstudiantes} 
            className="mt-4 bg-red-600 hover:bg-red-700"
          >
            Reintentar
          </Button>
        </div>
      </TeacherLayout>
    );
  }

  return (
    <TeacherLayout title="Mis Estudiantes">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Mis Estudiantes</h1>
            <p className="text-slate-600 mt-1">
              Total: <span className="font-semibold">{estudiantes.length}</span> estudiantes en {cursosUnicos.length} cursos
            </p>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Buscar estudiante
              </label>
              <input
                type="text"
                placeholder="Nombre, documento o correo..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Filtrar por curso
              </label>
              <select
                value={cursoSeleccionado}
                onChange={(e) => setCursoSeleccionado(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              >
                <option value="">Todos los cursos</option>
                {cursosUnicos.map(curso => (
                  <option key={curso} value={curso}>{limpiarCurso(curso)}</option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <Button 
                onClick={loadEstudiantes}
                className="w-full"
                variant="outline"
              >
                <span className="inline-flex items-center gap-2"><HiOutlineArrowPath /><span>Actualizar</span></span>
              </Button>
            </div>
          </div>
        </div>

        {/* Lista de estudiantes como tabla */}
        {estudiantesFiltrados.length === 0 ? (
          <EmptyState404 
            title="No se encontraron estudiantes"
            description={
              busqueda || cursoSeleccionado 
                ? "Intenta ajustar los filtros de búsqueda"
                : "No tienes estudiantes asignados"
            }
            actionLabel={busqueda || cursoSeleccionado ? "Limpiar filtros" : undefined}
            onAction={() => {
              setBusqueda('');
              setCursoSeleccionado('');
            }}
          />
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-600">Estudiante</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-600">Documento</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-600">Edad</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-600">Teléfono</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-600">EPS</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-600">Grupo</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-600">Curso</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-600">Tipo</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-slate-600">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {estudiantesPaginados.map((estudiante) => (
                    <tr key={estudiante.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-600">
                            {getSexoIcon(estudiante.sexo)}
                          </span>
                          <div className="min-w-0">
                            <div className="text-sm font-semibold text-slate-900 truncate">{estudiante.nombreCompleto}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700">{estudiante.numeroDocumento}</td>
                      <td className="px-4 py-3 text-sm text-slate-700">{getEdad(estudiante.fechaNacimiento)} años</td>
                      <td className="px-4 py-3 text-sm text-slate-700"><span className="inline-flex items-center gap-1"><HiOutlinePhone />{estudiante.telefono}</span></td>
                      <td className="px-4 py-3 text-sm text-slate-700">{estudiante.eps}</td>
                      <td className="px-4 py-3 text-sm text-slate-700">{estudiante.grupoSanguineo}{estudiante.rh}</td>
                      <td className="px-4 py-3 text-sm text-slate-700">{limpiarCurso(estudiante.curso?.nombre)}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTipoDocumentoColor(estudiante.tipoDocumento)}`}>{estudiante.tipoDocumento}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setEstudianteSeleccionado(estudiante)}
                          >
                            Ver detalles
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Controles de paginación */}
        {estudiantesFiltrados.length > 0 && (
          <div className="flex items-center justify-between gap-3 bg-white border border-slate-200 rounded-xl px-4 py-3">
            <div className="text-sm text-slate-600">
              Mostrando <span className="font-medium">{Math.min((page - 1) * pageSize + 1, estudiantesFiltrados.length)}</span>
              -<span className="font-medium">{Math.min(page * pageSize, estudiantesFiltrados.length)}</span>
              
              
 de <span className="font-medium">{estudiantesFiltrados.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Anterior</Button>
              <span className="text-sm text-slate-700">Página {page} de {totalPages}</span>
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Siguiente</Button>
            </div>
          </div>
        )}

        {/* Modal de detalles */}
        {estudianteSeleccionado && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="text-4xl">{getSexoIcon(estudianteSeleccionado.sexo)}</div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">{estudianteSeleccionado.nombreCompleto}</h2>
                      <p className="text-slate-600">{limpiarCurso(estudianteSeleccionado.curso.nombre)}</p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setEstudianteSeleccionado(null)}
                  >
                    <HiOutlineXMark />
                  </Button>
                </div>

                {/* Información personal */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-3">
                    <h3 className="font-semibold text-slate-900 border-b border-slate-200 pb-2">Información Personal</h3>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <span className="text-slate-600">Tipo Documento:</span>
                      <span className="font-medium">{estudianteSeleccionado.tipoDocumento}</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <span className="text-slate-600">Número Documento:</span>
                      <span className="font-medium">{estudianteSeleccionado.numeroDocumento}</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <span className="text-slate-600">Fecha Nacimiento:</span>
                      <span className="font-medium">{new Date(estudianteSeleccionado.fechaNacimiento).toLocaleDateString()}</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <span className="text-slate-600">Edad:</span>
                      <span className="font-medium">{getEdad(estudianteSeleccionado.fechaNacimiento)} años</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <span className="text-slate-600">Sexo:</span>
                      <span className="font-medium">{estudianteSeleccionado.sexo === 'M' ? 'Masculino' : 'Femenino'}</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <span className="text-slate-600">Teléfono:</span>
                      <span className="font-medium">{estudianteSeleccionado.telefono}</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <span className="text-slate-600">Correo:</span>
                      <span className="font-medium text-blue-600">{estudianteSeleccionado.correoElectronico}</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="font-semibold text-slate-900 border-b border-slate-200 pb-2">Información Médica</h3>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <span className="text-slate-600">EPS:</span>
                      <span className="font-medium">{estudianteSeleccionado.eps}</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <span className="text-slate-600">Grupo Sanguíneo:</span>
                      <span className="font-medium">{estudianteSeleccionado.grupoSanguineo}{estudianteSeleccionado.rh}</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <span className="text-slate-600">Dirección:</span>
                      <span className="font-medium">{estudianteSeleccionado.direccion}</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <span className="text-slate-600">Barrio:</span>
                      <span className="font-medium">{estudianteSeleccionado.barrio}</span>
                    </div>
                  </div>
                </div>

                {/* Acudientes */}
                <div className="mb-6">
                  <h3 className="font-semibold text-slate-900 border-b border-slate-200 pb-2 mb-4">Acudientes</h3>
                  <div className="space-y-3">
                    {estudianteSeleccionado.acudientes.map(acudiente => (
                      <div key={acudiente.id} className="bg-slate-50 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium text-slate-900">{acudiente.nombres} {acudiente.apellidos}</h4>
                            <p className="text-sm text-slate-600">{acudiente.parentesco}</p>
                            <div className="mt-2 space-y-1 text-sm">
                              <p className="text-slate-600 flex items-center gap-1"><HiOutlinePhone /> {acudiente.telefono}</p>
                              <p className="text-slate-600 flex items-center gap-1"><HiOutlineEnvelope /> {acudiente.correo}</p>
                            </div>
                          </div>
                          {acudiente.esPrincipal && (
                            <span className="px-2 py-1 bg-amber-100 text-amber-800 rounded text-xs font-medium">
                              Principal
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Información del curso */}
                <div className="mb-6">
                  <h3 className="font-semibold text-slate-900 border-b border-slate-200 pb-2 mb-4">Información del Curso</h3>
                  <div className="bg-slate-50 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-slate-600">Curso: </span>
                        <span className="font-medium">{limpiarCurso(estudianteSeleccionado.curso.nombre)}</span>
                      </div>
                      <div>
                        <span className="text-slate-600">Jornada: </span>
                        <span className="font-medium">{estudianteSeleccionado.curso.jornada}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                  <Button 
                    variant="outline"
                    onClick={() => setEstudianteSeleccionado(null)}
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
    console.error('Error de renderizado en MisEstudiantesPage:', renderError);
    return (
      <TeacherLayout title="Mis Estudiantes">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-6xl mb-4 text-amber-500 flex items-center justify-center"><HiOutlineExclamationTriangle /></div>
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
