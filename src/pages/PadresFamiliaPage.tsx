import { useState, useEffect } from 'react';
import { getSession, getAcudientesCoordinador, getAcudientesOrientador } from '../api/endpoints';
import DashboardLayout from '../components/DashboardLayout';
import OrientadorLayout from '../components/orientador-acudiente/OrientadorLayout';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { IconUsers, IconMail, IconFileText, IconUser } from '../components/ui/Icons';

export default function PadresFamiliaPage() {
  const session = getSession();
  const user = session?.user;
  const userRole = user?.rol;

  const Layout = userRole === 'orientador' ? OrientadorLayout : DashboardLayout;

  const [loading, setLoading] = useState(true);
  const [acudientes, setAcudientes] = useState<any[]>([]);
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      let data = [];
      
      // Llamar al endpoint correcto según el rol
      if (userRole === 'coordinador' || userRole === 'admin' || userRole === 'admin_sistema') {
        data = await getAcudientesCoordinador();
      } else if (userRole === 'orientador') {
        data = await getAcudientesOrientador();
      }
      // Filtrar por institución del usuario (por seguridad del lado cliente)
      const instId = (session as any)?.context?.institucionId || user?.institucionId || (user as any)?.institucion;
      const pref = instId ? `${String(instId)}_` : '';

      const filtrados = Array.isArray(data) ? (data as any[]).filter((a) => {
        // Si el acudiente tiene institucionId explícito
        const aInst = a?.institucionId ?? a?.institucion_id ?? a?.institucion?.id;
        if (aInst != null && instId != null) {
          return Number(aInst) === Number(instId);
        }
        // Si trae estudiantes vinculados con curso como '58_4A' o estructura similar
        const estudiantes = a?.estudiantes || a?.estudiantesVinculados || [];
        if (pref && Array.isArray(estudiantes) && estudiantes.length > 0) {
          return estudiantes.some((e: any) => {
            const cursoNombre = e?.cursoNombre || e?.curso || e?.curso_nombre || e?.curso?.nombre;
            return typeof cursoNombre === 'string' && cursoNombre.startsWith(pref);
          });
        }
        // Si no hay información, por defecto incluir (evitar vaciar en ambientes sin dato)
        return true;
      }) : [];

      // Además, normalizar totalEstudiantes si tenemos la lista filtrada
      const conTotales = filtrados.map((a: any) => {
        const estudiantes = a?.estudiantes || a?.estudiantesVinculados || [];
        const estudiantesOk = Array.isArray(estudiantes)
          ? estudiantes.filter((e: any) => {
              const cursoNombre = e?.cursoNombre || e?.curso || e?.curso_nombre || e?.curso?.nombre;
              return !pref || (typeof cursoNombre === 'string' ? cursoNombre.startsWith(pref) : true);
            })
          : [];
        return {
          ...a,
          estudiantesVinculados: estudiantesOk,
          totalEstudiantes: a?.totalEstudiantes != null ? a.totalEstudiantes : estudiantesOk.length,
        };
      });

      setAcudientes(conTotales);
    } catch (error) {
      console.error('Error al cargar acudientes:', error);
      setAcudientes([]);
    } finally {
      setLoading(false);
    }
  };

  const acudientesFiltrados = acudientes.filter(acudiente => {
    if (!busqueda) return true;
    const searchLower = busqueda.toLowerCase();
    const nombreCompleto = `${acudiente.nombres} ${acudiente.apellidos}`.toLowerCase();
    const documento = acudiente.numeroDocumento?.toLowerCase() || '';
    const correo = acudiente.correo?.toLowerCase() || '';
    return nombreCompleto.includes(searchLower) || documento.includes(searchLower) || correo.includes(searchLower);
  });

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" text="Cargando padres de familia..." />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Padres de Familia</h1>
          <p className="text-slate-600 mt-1">Listado de acudientes y padres de familia de la institución</p>
        </div>

        {/* Buscador */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <IconUsers className="text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Buscar por nombre, documento o correo..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-teal-100 text-sm font-medium">Total Acudientes</p>
                <p className="text-3xl font-bold mt-1">{acudientes.length}</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <IconUsers size={24} />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Estudiantes Vinculados</p>
                <p className="text-3xl font-bold mt-1">
                  {acudientes.reduce((sum, a) => sum + (a.totalEstudiantes || 0), 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <IconUser size={24} />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Resultados</p>
                <p className="text-3xl font-bold mt-1">{acudientesFiltrados.length}</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <IconFileText size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Tabla de Acudientes */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left py-3.5 px-5 font-semibold text-slate-600 text-sm">Acudiente</th>
                  <th className="text-center py-3.5 px-4 font-semibold text-slate-600 text-sm">Documento</th>
                  <th className="text-center py-3.5 px-4 font-semibold text-slate-600 text-sm">Contacto</th>
                  <th className="text-center py-3.5 px-4 font-semibold text-slate-600 text-sm">Parentesco</th>
                  <th className="text-center py-3.5 px-4 font-semibold text-slate-600 text-sm">Estudiantes</th>
                </tr>
              </thead>
              <tbody>
                {acudientesFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-500">
                      <IconUsers className="mx-auto mb-3 text-slate-400" size={48} />
                      <p className="font-medium">No hay acudientes registrados</p>
                      {busqueda && <p className="text-sm text-slate-400 mt-1">No se encontraron resultados para "{busqueda}"</p>}
                    </td>
                  </tr>
                ) : (
                  acudientesFiltrados.map((acudiente) => (
                    <tr key={acudiente.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-emerald-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                            {acudiente.nombres?.[0] || '?'}{acudiente.apellidos?.[0] || ''}
                          </div>
                          <div>
                            <div className="font-medium text-slate-800">
                              {acudiente.nombres} {acudiente.apellidos}
                            </div>
                            {acudiente.ocupacion && (
                              <div className="text-xs text-slate-500">{acudiente.ocupacion}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="text-center py-4 px-4">
                        <div className="text-sm text-slate-600">
                          {acudiente.tipoDocumento || 'CC'}: {acudiente.numeroDocumento || 'N/A'}
                        </div>
                      </td>
                      <td className="text-center py-4 px-4">
                        <div className="space-y-1">
                          {acudiente.telefono && (
                            <div className="text-sm text-slate-600">
                              📞 {acudiente.telefono}
                            </div>
                          )}
                          {acudiente.correo && (
                            <div className="flex items-center justify-center gap-1 text-sm text-slate-600">
                              <IconMail size={14} />
                              {acudiente.correo}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="text-center py-4 px-4">
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                          {acudiente.parentesco || 'N/A'}
                        </span>
                      </td>
                      <td className="text-center py-4 px-4">
                        <div className="space-y-1">
                          <div className="font-semibold text-teal-600">
                            {acudiente.totalEstudiantes || 0} estudiante(s)
                          </div>
                          {acudiente.estudiantesVinculados && acudiente.estudiantesVinculados.length > 0 && (
                            <div className="text-xs text-slate-500">
                              {acudiente.estudiantesVinculados.map((est: any) => (
                                <div key={est.id}>{est.nombres} {est.apellidos} - {est.curso}</div>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Resumen */}
        <div className="text-sm text-slate-600">
          Mostrando <span className="font-semibold text-teal-600">{acudientesFiltrados.length}</span> de{' '}
          <span className="font-semibold text-teal-600">{acudientes.length}</span> acudientes
        </div>
      </div>
    </Layout>
  );
}
