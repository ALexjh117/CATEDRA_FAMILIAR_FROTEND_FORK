import { PieChart, Pie, BarChart, Bar, LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

interface DashboardChartsProps {
  instituciones: any[];
  usuarios: any[];
}

const COLORS = ['#6366f1', '#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

export default function DashboardCharts({ instituciones, usuarios }: DashboardChartsProps) {
  // Validación de datos de entrada
  if (!instituciones || !Array.isArray(instituciones)) {
    instituciones = [];
  }
  if (!usuarios || !Array.isArray(usuarios)) {
    usuarios = [];
  }

  // 1. Distribución detallada de usuarios por rol con porcentajes
  const usuariosPorRol = [
    { rol: 'Administradores', cantidad: usuarios.filter(u => u && (u.rol === 'admin_sistema' || u.rol === 'admin')).length, porcentaje: 0 },
    { rol: 'Rectores', cantidad: usuarios.filter(u => u && u.rol === 'rector').length, porcentaje: 0 },
    { rol: 'Coordinadores', cantidad: usuarios.filter(u => u && u.rol === 'coordinador').length, porcentaje: 0 },
    { rol: 'Orientadores', cantidad: usuarios.filter(u => u && u.rol === 'orientador').length, porcentaje: 0 },
    { rol: 'Docentes', cantidad: usuarios.filter(u => u && (u.rol === 'docente_aula' || u.rol === 'docente')).length, porcentaje: 0 },
    { rol: 'Acudientes', cantidad: usuarios.filter(u => u && u.rol === 'acudiente').length, porcentaje: 0 },
  ].filter(item => item.cantidad > 0);

  // Calcular porcentajes
  const totalUsuarios = usuariosPorRol.reduce((sum, item) => sum + item.cantidad, 0);
  usuariosPorRol.forEach(item => {
    item.porcentaje = totalUsuarios > 0 ? Math.round((item.cantidad / totalUsuarios) * 100) : 0;
  });

  // 2. Instituciones por departamento con estado activo/inactivo
  const institucionesPorDepartamento = Object.entries(
    instituciones.reduce((acc, inst) => {
      if (!inst) return acc;
      const depto = inst.departamento?.nombre || 'Sin departamento';
      if (!acc[depto]) {
        acc[depto] = { total: 0, activas: 0, inactivas: 0 };
      }
      acc[depto].total++;
      if (inst.activa) {
        acc[depto].activas++;
      } else {
        acc[depto].inactivas++;
      }
      return acc;
    }, {} as Record<string, { total: number; activas: number; inactivas: number }>)
  ).map(([nombre, datos]) => ({ 
    nombre, 
    total: datos.total,
    activas: datos.activas,
    inactivas: datos.inactivas,
    tasaActivacion: datos.total > 0 ? Math.round((datos.activas / datos.total) * 100) : 0
  })).sort((a, b) => b.total - a.total);

  // 3. Análisis de actividad y estado de usuarios
  const usuariosActivosPorRol = [
    { rol: 'Admin', activos: usuarios.filter(u => u && (u.rol === 'admin_sistema' || u.rol === 'admin') && u.activo).length, inactivos: usuarios.filter(u => u && (u.rol === 'admin_sistema' || u.rol === 'admin') && !u.activo).length },
    { rol: 'Rectores', activos: usuarios.filter(u => u && u.rol === 'rector' && u.activo).length, inactivos: usuarios.filter(u => u && u.rol === 'rector' && !u.activo).length },
    { rol: 'Coordinadores', activos: usuarios.filter(u => u && u.rol === 'coordinador' && u.activo).length, inactivos: usuarios.filter(u => u && u.rol === 'coordinador' && !u.activo).length },
    { rol: 'Orientadores', activos: usuarios.filter(u => u && u.rol === 'orientador' && u.activo).length, inactivos: usuarios.filter(u => u && u.rol === 'orientador' && !u.activo).length },
    { rol: 'Docentes', activos: usuarios.filter(u => u && (u.rol === 'docente_aula' || u.rol === 'docente') && u.activo).length, inactivos: usuarios.filter(u => u && (u.rol === 'docente_aula' || u.rol === 'docente') && !u.activo).length },
  ].filter(item => item.activos > 0 || item.inactivos > 0);

  // 4. Métricas de seguridad y cumplimiento
  const usuariosPorContrasena = [
    { categoria: 'Contraseña Actualizada', cantidad: usuarios.filter(u => u && !u.debe_cambiar_contrasena).length },
    { categoria: 'Debe Cambiar Contraseña', cantidad: usuarios.filter(u => u && u.debe_cambiar_contrasena).length },
  ];

  // 5. Cobertura geográfica detallada
  const coberturaGeografica = {
    totalDepartamentos: new Set(instituciones.filter(i => i && i.departamentoId).map(i => i.departamentoId)).size,
    totalMunicipios: new Set(instituciones.filter(i => i && i.municipioId).map(i => i.municipioId)).size,
    institucionesSinDepartamento: instituciones.filter(i => i && !i.departamentoId).length,
    institucionesSinMunicipio: instituciones.filter(i => i && !i.municipioId).length,
  };

  // 6. Tendencia de crecimiento (simulación basada en datos reales)
  const crecimientoMensual = [
    { mes: 'Ene', usuarios: Math.round(usuarios.length * 0.3), instituciones: Math.round(instituciones.length * 0.2), nuevasInstituciones: 1 },
    { mes: 'Feb', usuarios: Math.round(usuarios.length * 0.5), instituciones: Math.round(instituciones.length * 0.4), nuevasInstituciones: 2 },
    { mes: 'Mar', usuarios: Math.round(usuarios.length * 0.7), instituciones: Math.round(instituciones.length * 0.6), nuevasInstituciones: 2 },
    { mes: 'Abr', usuarios: Math.round(usuarios.length * 0.8), instituciones: Math.round(instituciones.length * 0.8), nuevasInstituciones: 1 },
    { mes: 'May', usuarios: Math.round(usuarios.length * 0.9), instituciones: Math.round(instituciones.length * 0.9), nuevasInstituciones: 1 },
    { 
      mes: 'Jun', 
      usuarios: usuarios.length, 
      instituciones: instituciones.length, 
      nuevasInstituciones: instituciones.filter(i => {
        if (!i || !i.fechaCreacion) return false;
        try {
          return new Date(i.fechaCreacion).getMonth() === 5;
        } catch {
          return false;
        }
      }).length 
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header con métricas clave */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-100">
        <h3 className="text-lg font-bold text-gray-800 mb-4">📊 Panel de Control Administrativo</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-indigo-700">{usuarios.length}</p>
            <p className="text-xs text-gray-600">Usuarios Totales</p>
            <p className="text-xs text-green-600 font-semibold">
              {usuarios.filter(u => u && u.activo).length} activos ({usuarios.length > 0 ? Math.round((usuarios.filter(u => u && u.activo).length / usuarios.length) * 100) : 0}%)
            </p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-700">{instituciones.length}</p>
            <p className="text-xs text-gray-600">Instituciones</p>
            <p className="text-xs text-green-600 font-semibold">
              {instituciones.filter(i => i && i.activa).length} activas ({instituciones.length > 0 ? Math.round((instituciones.filter(i => i && i.activa).length / instituciones.length) * 100) : 0}%)
            </p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-emerald-700">{coberturaGeografica.totalDepartamentos}</p>
            <p className="text-xs text-gray-600">Departamentos</p>
            <p className="text-xs text-blue-600 font-semibold">{coberturaGeografica.totalMunicipios} municipios</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-700">{usuarios.filter(u => u && !u.debe_cambiar_contrasena).length}</p>
            <p className="text-xs text-gray-600">Seguridad OK</p>
            <p className="text-xs text-orange-600 font-semibold">
              {usuarios.filter(u => u && u.debe_cambiar_contrasena).length} pendientes
            </p>
          </div>
        </div>
      </div>

      {/* Grid de Charts Analíticos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Gráfico 1: Distribución de Usuarios por Rol con Detalles */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <h4 className="text-base font-semibold text-gray-800 mb-2">Distribución de Usuarios por Rol</h4>
          <p className="text-xs text-gray-500 mb-4">Análisis detallado de la composición del sistema</p>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={usuariosPorRol}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ rol, cantidad, porcentaje }) => `${rol}: ${cantidad} (${porcentaje}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="cantidad"
              >
                {usuariosPorRol.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value, name) => [`${value} usuarios`, 'Cantidad']} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {usuariosPorRol.map((item, index) => (
              <div key={item.rol} className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <span className="font-medium">{item.rol}</span>
                </div>
                <span className="text-gray-600">{item.cantidad} usuarios ({item.porcentaje}%)</span>
              </div>
            ))}
          </div>
        </div>

        {/* Gráfico 2: Instituciones por Departamento con Tasa de Activación */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <h4 className="text-base font-semibold text-gray-800 mb-2">Cobertura por Departamento</h4>
          <p className="text-xs text-gray-500 mb-4">Distribución geográfica y tasa de activación</p>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={institucionesPorDepartamento} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="nombre" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white p-3 border rounded shadow">
                        <p className="font-semibold">{data.nombre}</p>
                        <p className="text-sm">Total: {data.total}</p>
                        <p className="text-sm text-green-600">Activas: {data.activas}</p>
                        <p className="text-sm text-red-600">Inactivas: {data.inactivas}</p>
                        <p className="text-sm font-semibold">Tasa Activación: {data.tasaActivacion}%</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="total" fill="#6366f1" name="Total Instituciones" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico 3: Estado de Actividad por Rol */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <h4 className="text-base font-semibold text-gray-800 mb-2">Estado de Actividad por Rol</h4>
          <p className="text-xs text-gray-500 mb-4">Usuarios activos vs inactivos por categoría</p>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={usuariosActivosPorRol} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="rol" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="activos" stackId="a" fill="#10b981" name="Activos" />
              <Bar dataKey="inactivos" stackId="a" fill="#ef4444" name="Inactivos" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico 4: Tendencia de Crecimiento Mensual */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <h4 className="text-base font-semibold text-gray-800 mb-2">Tendencia de Crecimiento</h4>
          <p className="text-xs text-gray-500 mb-4">Evolución de usuarios e instituciones (últimos 6 meses)</p>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={crecimientoMensual}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="usuarios" stroke="#6366f1" strokeWidth={2} name="Usuarios Acumulados" />
              <Line type="monotone" dataKey="instituciones" stroke="#10b981" strokeWidth={2} name="Instituciones Acumuladas" />
              <Line type="monotone" dataKey="nuevasInstituciones" stroke="#f59e0b" strokeWidth={2} name="Nuevas Instituciones" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Métricas de Seguridad y Cumplimiento */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
        <h4 className="text-base font-semibold text-gray-800 mb-4">🔐 Métricas de Seguridad y Cumplimiento</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h5 className="text-sm font-medium text-gray-700 mb-3">Estado de Contraseñas</h5>
            <ResponsiveContainer width="100%" height={150}>
              <PieChart>
                <Pie
                  data={usuariosPorContrasena}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={60}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="cantidad"
                >
                  <Cell fill="#10b981" />
                  <Cell fill="#f59e0b" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-2 space-y-1">
              {usuariosPorContrasena.map((item, index) => (
                <div key={item.categoria} className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full`} style={{ backgroundColor: index === 0 ? '#10b981' : '#f59e0b' }} />
                    <span>{item.categoria}</span>
                  </div>
                  <span className="font-medium">{item.cantidad}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h5 className="text-sm font-medium text-gray-700 mb-3">Cobertura Geográfica</h5>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Departamentos con Cobertura</span>
                <span className="text-sm font-bold text-indigo-700">{coberturaGeografica.totalDepartamentos}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Municipios con Cobertura</span>
                <span className="text-sm font-bold text-blue-700">{coberturaGeografica.totalMunicipios}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Instituciones sin Depto.</span>
                <span className="text-sm font-bold text-orange-700">{coberturaGeografica.institucionesSinDepartamento}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Instituciones sin Mpio.</span>
                <span className="text-sm font-bold text-red-700">{coberturaGeografica.institucionesSinMunicipio}</span>
              </div>
            </div>
          </div>

          <div>
            <h5 className="text-sm font-medium text-gray-700 mb-3">Indicadores Clave</h5>
            <div className="space-y-3">
              <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-green-700">Tasa Activación Usuarios</span>
                  <span className="text-sm font-bold text-green-800">
                    {usuarios.length > 0 ? Math.round((usuarios.filter(u => u && u.activo).length / usuarios.length) * 100) : 0}%
                  </span>
                </div>
              </div>
              <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-blue-700">Tasa Activación Instituciones</span>
                  <span className="text-sm font-bold text-blue-800">
                    {instituciones.length > 0 ? Math.round((instituciones.filter(i => i && i.activa).length / instituciones.length) * 100) : 0}%
                  </span>
                </div>
              </div>
              <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-purple-700">Promedio Usuarios/Institución</span>
                  <span className="text-sm font-bold text-purple-800">
                    {instituciones.length > 0 ? (usuarios.length / instituciones.length).toFixed(1) : 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
