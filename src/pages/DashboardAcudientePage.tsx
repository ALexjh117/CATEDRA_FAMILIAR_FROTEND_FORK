import DashboardLayout from '../components/DashboardLayout';
import { getSession } from '../api/endpoints';

export default function DashboardAcudientePage() {
  const session = getSession();
  const estudiantes = (session as any)?.context?.estudiantes as Array<any> | undefined;

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800">Dashboard Acudiente</h1>
          <p className="text-slate-600">Consulta la información de tus estudiantes asociados.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/70 p-5">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Mis Estudiantes</h2>

          {!estudiantes || estudiantes.length === 0 ? (
            <div className="text-slate-600">No se encontraron estudiantes asociados en tu sesión.</div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {estudiantes.map((e) => (
                <div
                  key={e.id}
                  className="rounded-xl border border-slate-200 p-4 bg-slate-50/50"
                >
                  <div className="font-semibold text-slate-800">
                    {e.nombres || e.nombre} {e.apellidos}
                  </div>
                  <div className="text-sm text-slate-600 mt-1">
                    Documento: {e.tipoDocumento} {e.numeroDocumento}
                  </div>
                  <div className="text-sm text-slate-600">
                    Curso ID: {e.cursoId}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
