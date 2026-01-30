import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ToastProvider } from './components/ui/ToastGlobal'
import SessionTimeoutProvider from './components/SessionTimeoutProvider'
import { getSession } from './api/endpoints'

// Pages - Solo roles web (Admin, Rector, Coordinador, Orientador, Docente)
import Landing from './pages/Landing'
import LoginPage from './pages/LoginPage'
import DashboardDocentePage from './pages/DashboardDocentePage'
import DashboardSupervisorPage from './pages/DashboardSupervisorPage'
import DashboardRectorPage from './pages/DashboardRectorPage'
import DashboardAdminPage from './pages/DashboardAdminPage'
import DashboardAdminHome from './pages/DashboardAdminHome'
import DashboardCoordinadorPage from './pages/DashboardCoordinadorPage'
import DashboardAcudientePage from './pages/DashboardAcudientePage'
import DirectivosPage from './pages/DirectivosPage'
import ProfilePage from './pages/ProfilePage'
import ReportesRector from './components/reportes/ReportesRector'
import ReportesCoordinador from './components/reportes/ReportesCoordinador'
import ReportesOrientador from './components/reportes/ReportesOrientador'
import ReportesDocente from './components/reportes/ReportesDocente'
import ReportesAdmin from './components/reportes/ReportesAdmin'
import GestionOrientacionPage from './pages/GestionOrientacionPage'
import CursosPage from './pages/CursosPage'
import ConfiguracionRectorPage from './pages/ConfiguracionRectorPage'
import PadresFamiliaPage from './pages/PadresFamiliaPage'
import TareasPage from './pages/TareasPage'

// Legacy
import DashboardPage from './pages/DashboardPage'
import PagePlaceholder from './components/PagePlaceholder'

// Protected Route wrapper
function ProtectedRoute({ children, allowedRoles }: { children: React.ReactElement, allowedRoles?: string[] }) {
  const session = getSession();
  
  if (!session) {
    return <Navigate to="/login" replace />;
  }
  
  let currentRole = (session as any).isPreview && (session as any).previewRole 
    ? (session as any).previewRole 
    : session.user.rol;
  
  // Normalizar admin_sistema a admin para verificación de permisos
  const normalizedRole = currentRole === 'admin_sistema' ? 'admin' : currentRole;
  
  // Verificar permisos usando rol normalizado (admin_sistema cuenta como admin)
  if (allowedRoles && !allowedRoles.includes(currentRole) && !allowedRoles.includes(normalizedRole)) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
}

// Redirect based on role
function DashboardRedirect() {
  const session = getSession();
  
  if (!session) {
    return <Navigate to="/login" replace />;
  }
  
  const currentRole = (session as any).isPreview && (session as any).previewRole 
    ? (session as any).previewRole 
    : session.user.rol;
  
  switch (currentRole) {
    case 'docente':
    case 'docente_aula':
      return <Navigate to="/dashboard/docente" replace />;
    case 'orientador':
      return <Navigate to="/dashboard/orientador" replace />;
    case 'coordinador':
      return <Navigate to="/dashboard/coordinador" replace />;
    case 'rector':
      return <Navigate to="/dashboard/rector" replace />;
    case 'admin':
    case 'admin_sistema':
      return <Navigate to="/dashboard/admin" replace />;
    case 'acudiente':
      return <Navigate to="/dashboard/acudiente" replace />;
    default:
      // Si es acudiente u otro rol no permitido, redirigir a página de acceso denegado
      return <Navigate to="/acceso-denegado" replace />;
  }
}

// Página de acceso denegado para acudientes
function AccesoDenegado() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
        <div className="text-6xl mb-4">📱</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Acceso desde App Móvil
        </h1>
        <p className="text-gray-600 mb-6">
          Los acudientes y padres de familia deben acceder a través de la 
          <strong> aplicación móvil de Cátedra de Familia</strong>.
        </p>
        <p className="text-sm text-gray-500 mb-6">
          Descarga la app desde Google Play Store para ver las tareas de tus hijos, 
          enviar evidencias y recibir notificaciones.
        </p>
        <div className="space-y-3">
          <a 
            href="#" 
            className="block w-full px-6 py-3 bg-teal-600 text-white rounded-xl font-medium hover:bg-teal-700 transition-colors"
          >
            📲 Descargar App Android
          </a>
          <a 
            href="/" 
            className="block w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
          >
            Volver al inicio
          </a>
        </div>
      </div>
    </div>
  );
}

export default function App(){
  return (
    <ToastProvider>
      <BrowserRouter>
        <SessionTimeoutProvider>
          <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing/>} />
          <Route path="/login" element={<LoginPage/>} />
          <Route path="/acceso-denegado" element={<AccesoDenegado/>} />
          
          {/* Dashboard redirect based on role */}
          <Route path="/dashboard" element={<DashboardRedirect />} />
          
          {/* Protected Dashboard Routes - Solo roles web */}
          <Route path="/dashboard/docente" element={
            <ProtectedRoute allowedRoles={['docente', 'docente_aula', 'orientador', 'coordinador', 'rector', 'admin']}>
              <DashboardDocentePage />
            </ProtectedRoute>
          } />
          
          <Route path="/dashboard/orientador" element={
            <ProtectedRoute allowedRoles={['orientador', 'coordinador', 'rector', 'admin']}>
              <PagePlaceholder title="Dashboard Orientador" description="Panel de control para orientadores." />
            </ProtectedRoute>
          } />
          
          <Route path="/dashboard/coordinador" element={
            <ProtectedRoute allowedRoles={['coordinador', 'rector', 'admin']}>
              <DashboardCoordinadorPage />
            </ProtectedRoute>
          } />
          
          <Route path="/dashboard/rector" element={
            <ProtectedRoute allowedRoles={['rector', 'admin']}>
              <DashboardRectorPage />
            </ProtectedRoute>
          } />
          
          <Route path="/dashboard/acudiente" element={
            <ProtectedRoute allowedRoles={['acudiente']}>
              <DashboardAcudientePage />
            </ProtectedRoute>
          } />
          
          <Route path="/dashboard/admin" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <DashboardAdminHome />
            </ProtectedRoute>
          } />

          <Route path="/dashboard/admin/manage" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <DashboardAdminPage />
            </ProtectedRoute>
          } />

          {/* Placeholder routes for sidebar items to avoid redirect to / when missing */}
          <Route path="/tareas" element={<ProtectedRoute allowedRoles={['docente','docente_aula','orientador','coordinador','rector','admin']}><TareasPage /></ProtectedRoute>} />
          <Route path="/tareas/crear" element={<ProtectedRoute allowedRoles={['docente','docente_aula','orientador']}><PagePlaceholder title="Crear Tarea" description="Formulario temporal para crear tareas."/></ProtectedRoute>} />
          <Route path="/entregas" element={<ProtectedRoute allowedRoles={['docente','docente_aula']}><PagePlaceholder title="Entregas" description="Listado de entregas pendientes."/></ProtectedRoute>} />
          <Route path="/estudiantes" element={<ProtectedRoute allowedRoles={['docente','orientador','coordinador','rector','admin']}><PagePlaceholder title="Estudiantes" description="Listado y seguimiento de estudiantes."/></ProtectedRoute>} />
          <Route path="/gestion-orientacion" element={<ProtectedRoute allowedRoles={['coordinador','rector','admin']}><GestionOrientacionPage /></ProtectedRoute>} />
          <Route path="/directivos" element={<ProtectedRoute allowedRoles={['rector','admin']}><DirectivosPage /></ProtectedRoute>} />
          <Route path="/cursos" element={<ProtectedRoute allowedRoles={['orientador','coordinador','rector','admin']}><CursosPage /></ProtectedRoute>} />
          <Route path="/padres-familia" element={<ProtectedRoute allowedRoles={['orientador','coordinador','rector','admin']}><PadresFamiliaPage /></ProtectedRoute>} />
          <Route path="/reportes/rector" element={<ProtectedRoute allowedRoles={['rector']}><ReportesRector /></ProtectedRoute>} />
          <Route path="/reportes/coordinador" element={<ProtectedRoute allowedRoles={['coordinador']}><ReportesCoordinador /></ProtectedRoute>} />
          <Route path="/reportes/orientador" element={<ProtectedRoute allowedRoles={['orientador']}><ReportesOrientador /></ProtectedRoute>} />
          <Route path="/reportes/docente" element={<ProtectedRoute allowedRoles={['docente','docente_aula']}><ReportesDocente /></ProtectedRoute>} />
          <Route path="/reportes/admin" element={<ProtectedRoute allowedRoles={['admin']}><ReportesAdmin /></ProtectedRoute>} />
          <Route path="/configuracion" element={<ProtectedRoute allowedRoles={['rector','admin']}><ConfiguracionRectorPage /></ProtectedRoute>} />
          <Route path="/instituciones" element={<ProtectedRoute allowedRoles={['admin']}><PagePlaceholder title="Instituciones" description="Gestión de instituciones."/></ProtectedRoute>} />
          <Route path="/usuarios" element={<ProtectedRoute allowedRoles={['admin']}><PagePlaceholder title="Usuarios" description="Gestión de usuarios."/></ProtectedRoute>} />
          
          {/* Perfil de usuario - disponible para todos los roles autenticados */}
          <Route path="/perfil" element={
            <ProtectedRoute allowedRoles={['docente','docente_aula','orientador','coordinador','rector','admin','acudiente']}>
              <ProfilePage />
            </ProtectedRoute>
          } />
          
          {/* Legacy route */}
          <Route path="/dashboard-old" element={<DashboardPage/>} />
          
          {/* 404 fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </SessionTimeoutProvider>
      </BrowserRouter>
    </ToastProvider>
  )
}