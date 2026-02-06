import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AcudienteLayout from '../components/AcudienteLayout';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { getMisTareasAcudiente } from '../api/acudiente';

export default function AcudienteTareasAutoPage(){
  const navigate = useNavigate();

  useEffect(() => {
    const run = async () => {
      // 1) preferir último usado en localStorage
      try {
        const v = localStorage.getItem('acudiente_estudiante_id');
        if (v) {
          const id = Number(v);
          if (id && !Number.isNaN(id)) {
            navigate(`/acudiente/estudiantes/${id}/tareas`, { replace: true });
            return;
          }
        }
      } catch {}
      // 2) pedir al backend lista de hijos y usar el primero
      try {
        const { estudiantes } = await getMisTareasAcudiente();
        if (Array.isArray(estudiantes) && estudiantes.length > 0) {
          const id = Number(estudiantes[0].id);
          try { localStorage.setItem('acudiente_estudiante_id', String(id)); } catch {}
          navigate(`/acudiente/estudiantes/${id}/tareas`, { replace: true });
          return;
        }
      } catch {}
      // 3) fallback a configuración manual
      navigate('/acudiente/hijos', { replace: true });
    };
    run();
  }, [navigate]);

  return (
    <AcudienteLayout>
      <div className="h-64 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Redirigiendo a tus tareas..." />
      </div>
    </AcudienteLayout>
  );
}
