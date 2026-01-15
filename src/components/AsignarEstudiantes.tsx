import { useState, useEffect } from 'react';
import { getCursos, getEstudiantes, updateCurso } from '../api/endpoints';
import { type Curso, type Estudiante } from '../mocks/data';
import DashboardLayout from '../components/DashboardLayout';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Toast from '../components/Toast';
import { 
  IconUsers,
  IconBook,
  IconSearch,
  IconPlus,
  IconX,
  IconCheck,
  IconArrowRight
} from '../components/ui/Icons';

interface DraggedStudent {
  id: number;
  nombre: string;
  apellidos: string;
  documento: string;
}

export default function AsignarEstudiantes() {
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [draggedStudent, setDraggedStudent] = useState<DraggedStudent | null>(null);
  const [dragOverCurso, setDragOverCurso] = useState<number | null>(null);
  const [filteredEstudiantes, setFilteredEstudiantes] = useState<Estudiante[]>([]);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterEstudiantes();
  }, [estudiantes, searchTerm]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [cursosData, estudiantesData] = await Promise.all([
        getCursos(),
        getEstudiantes()
      ]);
      setCursos(cursosData);
      setEstudiantes(estudiantesData);
    } catch (error) {
      console.error('Error loading data:', error);
      setToast({ message: 'Error al cargar datos', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const filterEstudiantes = () => {
    let filtered = estudiantes;
    
    if (searchTerm) {
      filtered = filtered.filter(est => 
        `${est.nombre} ${est.apellidos}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        est.documento.includes(searchTerm)
      );
    }
    
    setFilteredEstudiantes(filtered);
  };

  const handleDragStart = (e: React.DragEvent, estudiante: Estudiante) => {
    const dragData: DraggedStudent = {
      id: estudiante.id,
      nombre: estudiante.nombre,
      apellidos: estudiante.apellidos,
      documento: estudiante.documento
    };
    
    setDraggedStudent(dragData);
    e.dataTransfer.setData('application/json', JSON.stringify(dragData));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, cursoId: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverCurso(cursoId);
  };

  const handleDragLeave = () => {
    setDragOverCurso(null);
  };

  const handleDrop = async (e: React.DragEvent, cursoId: number) => {
    e.preventDefault();
    setDragOverCurso(null);
    
    try {
      const dragDataStr = e.dataTransfer.getData('application/json');
      const dragData: DraggedStudent = JSON.parse(dragDataStr);
      
      // Verificar si el estudiante ya está en este curso
      const curso = cursos.find(c => c.id === cursoId);
      if (curso?.estudiantes?.some(est => est.id === dragData.id)) {
        setToast({ message: 'El estudiante ya está asignado a este curso', type: 'error' });
        return;
      }

      // Simular actualización del curso
      const estudianteCompleto = estudiantes.find(est => est.id === dragData.id);
      if (estudianteCompleto) {
        await updateCurso(cursoId, {
          estudiantes: [...(curso?.estudiantes || []), estudianteCompleto]
        });

        // Actualizar estado local
        setCursos(prev => prev.map(c => 
          c.id === cursoId 
            ? { ...c, estudiantes: [...(c.estudiantes || []), estudianteCompleto] }
            : c
        ));

        setToast({ 
          message: `${dragData.nombre} ${dragData.apellidos} asignado al curso ${curso?.nombre}`, 
          type: 'success' 
        });
      }
    } catch (error) {
      console.error('Error asignando estudiante:', error);
      setToast({ message: 'Error al asignar estudiante', type: 'error' });
    }
    
    setDraggedStudent(null);
  };

  const removeStudentFromCourse = async (cursoId: number, estudianteId: number) => {
    try {
      const curso = cursos.find(c => c.id === cursoId);
      const nuevosEstudiantes = curso?.estudiantes?.filter(est => est.id !== estudianteId) || [];
      
      await updateCurso(cursoId, {
        estudiantes: nuevosEstudiantes
      });

      setCursos(prev => prev.map(c => 
        c.id === cursoId 
          ? { ...c, estudiantes: nuevosEstudiantes }
          : c
      ));

      const estudiante = curso?.estudiantes?.find(est => est.id === estudianteId);
      setToast({ 
        message: `${estudiante?.nombre} removido del curso`, 
        type: 'success' 
      });
    } catch (error) {
      console.error('Error removiendo estudiante:', error);
      setToast({ message: 'Error al remover estudiante', type: 'error' });
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-white">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-display font-bold">Asignar Estudiantes</h1>
              <p className="text-purple-100 mt-1">
                Arrastra estudiantes a los cursos para asignarlos
              </p>
            </div>
            
            <div className="flex items-center gap-4 mt-4 md:mt-0 text-purple-100">
              <div className="text-center">
                <div className="text-xl font-bold">{filteredEstudiantes.length}</div>
                <div className="text-xs">Estudiantes</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold">{cursos.length}</div>
                <div className="text-xs">Cursos</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Lista de estudiantes */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <IconUsers size={20} />
                  Estudiantes Disponibles
                </h3>
                <div className="text-sm text-gray-500">
                  {filteredEstudiantes.length} estudiantes
                </div>
              </div>

              {/* Búsqueda */}
              <div className="relative mb-4">
                <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Buscar estudiantes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {/* Lista de estudiantes */}
              <div className="max-h-96 overflow-y-auto space-y-2">
                {filteredEstudiantes.map(estudiante => (
                  <div
                    key={estudiante.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, estudiante)}
                    className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg cursor-move hover:shadow-md transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800 text-sm">
                          {estudiante.nombre} {estudiante.apellidos}
                        </h4>
                        <p className="text-xs text-gray-600">Doc: {estudiante.documento}</p>
                      </div>
                      <IconArrowRight className="text-purple-400 group-hover:text-purple-600 transition-colors" size={16} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <IconPlus className="text-purple-600 mt-0.5" size={16} />
                  <div className="text-sm text-purple-700">
                    <strong>Tip:</strong> Arrastra un estudiante hacia un curso para asignarlo.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Lista de cursos */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                <IconBook size={20} />
                Cursos Disponibles
              </h3>

              <div className="grid md:grid-cols-2 gap-4">
                {cursos.map(curso => (
                  <div
                    key={curso.id}
                    onDragOver={(e) => handleDragOver(e, curso.id)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, curso.id)}
                    className={`border-2 border-dashed rounded-xl p-4 transition-all ${
                      dragOverCurso === curso.id
                        ? 'border-purple-400 bg-purple-50 scale-105'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="mb-3">
                      <h4 className="font-bold text-gray-800">{curso.nombre}</h4>
                      <p className="text-sm text-gray-600">
                        Grado: {curso.grado} • {curso.estudiantes?.length || 0} estudiantes
                      </p>
                    </div>

                    {/* Estudiantes asignados */}
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {curso.estudiantes?.map(estudiante => (
                        <div
                          key={estudiante.id}
                          className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-2"
                        >
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-800">
                              {estudiante.nombre} {estudiante.apellidos}
                            </div>
                            <div className="text-xs text-gray-600">
                              {estudiante.documento}
                            </div>
                          </div>
                          <button
                            onClick={() => removeStudentFromCourse(curso.id, estudiante.id)}
                            className="p-1 text-red-500 hover:text-red-700 hover:bg-red-100 rounded transition-colors"
                            title="Remover del curso"
                          >
                            <IconX size={14} />
                          </button>
                        </div>
                      )) || (
                        <div className="text-center py-8 text-gray-500">
                          <IconUsers className="mx-auto mb-2" size={32} />
                          <p className="text-sm">Arrastra estudiantes aquí</p>
                        </div>
                      )}
                    </div>

                    {dragOverCurso === curso.id && (
                      <div className="mt-3 p-2 bg-purple-100 border border-purple-300 rounded-lg text-center">
                        <IconCheck className="mx-auto text-purple-600 mb-1" size={20} />
                        <p className="text-sm text-purple-700 font-medium">
                          Soltar para asignar al curso
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Toast */}
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </div>
    </DashboardLayout>
  );
}