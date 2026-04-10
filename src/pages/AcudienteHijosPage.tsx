import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AcudienteLayout from '../components/AcudienteLayout';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { getMisTareasAcudiente } from '../api/acudiente';

export default function AcudienteHijosPage(){
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [estudiantes, setEstudiantes] = useState<any[]>([]);
  const [selectedEstudianteId, setSelectedEstudianteId] = useState<string>(() => {
    try { return localStorage.getItem('acudiente_estudiante_id') || ''; } catch { return ''; }
  });

  useEffect(() => {
    const loadEstudiantes = async () => {
      try {
        const response = await getMisTareasAcudiente();
        const estudiantesData = Array.isArray(response?.estudiantes) ? response.estudiantes : [];
        setEstudiantes(estudiantesData);
      } catch (error) {
        console.error('[ACUDIENTE_HIJOS][ERROR]', error);
      } finally {
        setLoading(false);
      }
    };

    loadEstudiantes();
  }, []);

  const seleccionarEstudiante = (estudiante: any) => {
    const estudianteId = String(estudiante.id);
    setSelectedEstudianteId(estudianteId);
    try { 
      localStorage.setItem('acudiente_estudiante_id', estudianteId); 
    } catch {}
    
    // Navegar usando el ID numérico (seguro)
    navigate(`/acudiente/estudiantes/${estudiante.id}/tareas`);
  };

  if (loading) {
    return (
      <AcudienteLayout>
        <div className="max-w-lg space-y-4">
          <h1 className="text-xl font-semibold text-slate-800">Mis hijos</h1>
          <div className="flex justify-center py-8">
            <LoadingSpinner size="lg" text="Cargando estudiantes..." />
          </div>
        </div>
      </AcudienteLayout>
    );
  }

  return (
    <AcudienteLayout>
      <div className="max-w-2xl space-y-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">Mis hijos</h1>
          <p className="text-sm text-slate-600 mt-1">
            Selecciona un estudiante para ver sus tareas y progreso académico.
          </p>
        </div>

        {estudiantes.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
            <div className="text-slate-400 mb-2">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-slate-600 mb-1">No se encontraron estudiantes</h3>
            <p className="text-sm text-slate-500">
              No tienes estudiantes asociados a tu cuenta de acudiente.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {estudiantes.map((estudiante) => (
              <div
                key={estudiante.id}
                className={`bg-white rounded-2xl border p-4 cursor-pointer transition-all hover:shadow-md hover:border-purple-200 ${
                  selectedEstudianteId === String(estudiante.id)
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-slate-200'
                }`}
                onClick={() => seleccionarEstudiante(estudiante)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                      <span className="text-purple-600 font-semibold text-lg">
                        {estudiante.nombres?.charAt(0) || 'E'}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800">
                        {estudiante.nombres} {estudiante.apellidos}
                      </h3>
                      <p className="text-sm text-slate-500">
                        {estudiante.curso?.nombre || `Estudiante #${estudiante.id}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {selectedEstudianteId === String(estudiante.id) && (
                      <div className="w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="bg-green-50 rounded-xl p-4 border border-green-200">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-green-900">Privacidad protegida</h4>
              <p className="text-xs text-green-700 mt-1">
                Las URLs usan IDs numéricos para proteger la privacidad de los estudiantes. 
                El nombre solo se muestra en el título de la página para tu referencia.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AcudienteLayout>
  );
}
