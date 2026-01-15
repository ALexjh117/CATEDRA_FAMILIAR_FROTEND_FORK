import { useState, useEffect } from 'react';
import { 
  getSession, 
  getInstituciones, 
  getCursos, 
  getTareas,
  createInstitucion,
  updateInstitucion,
  deleteInstitucion,
  getUsuarios,
  createUsuario,
  updateUsuario,
  deleteUsuario,
  getPeriodos,
  createPeriodo,
  updatePeriodo,
  deletePeriodo,
  getGrados,
  createGrado,
  updateGrado,
  deleteGrado,
  createCurso,
  updateCurso,
  deleteCurso,
  getCategorias,
  createCategoria,
  updateCategoria,
  deleteCategoria,
  getDepartamentos,
  getMunicipios
} from '../api/endpoints';
import { type Institucion, type Curso, type Tarea, type Usuario, type Periodo, type Grado, type Categoria, type Departamento, type Municipio } from '../mocks/data';
import { departamentosMock, municipiosMock } from '../mocks/data';
import DashboardLayout from '../components/DashboardLayout';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import FormFieldInput from '../components/ui/FormFieldInput';
import { exportToExcel, exportToPDF, exportEstadisticasToPDF } from '../utils/exportUtils';
import {
  IconGear,
  IconInstitution,
  IconBook,
  IconUsers,
  IconClipboard,
  IconEdit,
  IconTrash,
  IconCalendar,
  IconPlus,
  IconDownload
} from '../components/ui/Icons';

export default function DashboardAdminPage() {
  getSession(); // Verificar sesión activa
  
  const [loading, setLoading] = useState(true);
  const [instituciones, setInstituciones] = useState<Institucion[]>([]);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [periodos, setPeriodos] = useState<Periodo[]>([]);
  const [grados, setGrados] = useState<Grado[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [activeTab, setActiveTab] = useState<'instituciones' | 'usuarios' | 'categorias' | 'reportes' | 'configuracion'>('instituciones');
  
  // Estados para reportes globales
  const [tipoReporte, setTipoReporte] = useState<'general' | 'instituciones' | 'usuarios' | 'actividad'>('general');
  const [loadingReport, setLoadingReport] = useState(false);
  
  // Estados de modales
  const [modalInstitucion, setModalInstitucion] = useState(false);
  const [modalUsuario, setModalUsuario] = useState(false);
  const [modalPeriodo, setModalPeriodo] = useState(false);
  const [modalGrado, setModalGrado] = useState(false);
  const [modalCurso, setModalCurso] = useState(false);
  const [modalCategoria, setModalCategoria] = useState(false);
  
  // Estados de formularios
  const [formInstitucion, setFormInstitucion] = useState({ 
    nombre: '', 
    codigo_dane: '',
    nit: '',
    naturaleza: 'publica' as 'publica' | 'privada' | 'mixta',
    municipio_id: 1,
    telefono_principal: '',
    correo_institucional: '',
    direccion_completa: '',
    rector_nombre: '',
    rector_documento: '',
    rector_telefono: ''
  });
  const [formUsuario, setFormUsuario] = useState<{ nombre: string; apellidos: string; correo: string; telefono: string; documento: string; tipoDocumento: string; rol: 'admin' | 'rector' | 'coordinador' | 'orientador' | 'docente_aula' | 'acudiente'; institucionId: number }>({ nombre: '', apellidos: '', correo: '', telefono: '', documento: '', tipoDocumento: 'cc', rol: 'docente_aula', institucionId: 1 });
  const [formPeriodo, setFormPeriodo] = useState<{ nombre: string; fechaInicio: string; fechaFin: string; institucionId: number; anio: number; estado: 'planificado' | 'activo' | 'cerrado' }>({ nombre: '', fechaInicio: '', fechaFin: '', institucionId: 1, anio: new Date().getFullYear(), estado: 'planificado' });
  const [formGrado, setFormGrado] = useState({ nombre: '', orden: 0, institucionId: 1 });
  const [formCurso, setFormCurso] = useState<{ nombre: string; gradoId: number; jornada: 'mañana' | 'tarde' | 'completa'; institucionId: number; docenteDirectorId: number | undefined }>({ nombre: '', gradoId: 1, jornada: 'mañana', institucionId: 1, docenteDirectorId: undefined });
  const [formCategoria, setFormCategoria] = useState({ nombre: '', color: '#3B82F6', icono: '📚' });
  
  // Estados de edición
  const [editingInstitucion, setEditingInstitucion] = useState<Institucion | null>(null);
  const [editingUsuario, setEditingUsuario] = useState<Usuario | null>(null);
  const [editingPeriodo, setEditingPeriodo] = useState<Periodo | null>(null);
  const [editingGrado, setEditingGrado] = useState<Grado | null>(null);
  const [editingCurso, setEditingCurso] = useState<Curso | null>(null);
  const [editingCategoria, setEditingCategoria] = useState<Categoria | null>(null);
  
  // Estados de error
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [institucionesData, cursosData, tareasData, usuariosData, periodosData, gradosData, categoriasData] = await Promise.all([
        getInstituciones(),
        getCursos(),
        getTareas(),
        getUsuarios(),
        getPeriodos(),
        getGrados(),
        getCategorias()
      ]);

      setInstituciones(institucionesData);
      setCursos(cursosData);
      setTareas(tareasData);
      setUsuarios(usuariosData);
      setPeriodos(periodosData);
      setGrados(gradosData);
      setCategorias(categoriasData);
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const generateGlobalReport = async () => {
    setLoadingReport(true);
    try {
      if (tipoReporte === 'general') {
        // Generar reporte PDF general
        const estadisticas = {
          'Resumen del Sistema': {
            'Total Instituciones': instituciones.length,
            'Instituciones Activas': instituciones.filter(i => i.activo).length,
            'Total Usuarios': usuarios.length,
            'Usuarios Activos': usuarios.filter(u => u.activo).length,
            'Total Cursos': cursos.length,
            'Total Tareas': tareas.length,
            'Tareas Completadas': tareas.filter(t => t.estado === 'completada').length
          }
        };
        
        exportEstadisticasToPDF(
          estadisticas,
          'Reporte_General_Sistema',
          'Reporte General del Sistema - Cátedra de Familia'
        );
      } else {
        // Generar reportes Excel específicos
        let data: any[] = [];
        let filename = '';
        let sheetName = '';
        
        if (tipoReporte === 'instituciones') {
          data = instituciones.map(inst => ({
            'Código DANE': inst.codigo_dane || '-',
            'Institución': inst.nombre,
            'NIT': inst.nit || '-',
            'Naturaleza': inst.naturaleza,
            'Estado': inst.activo ? 'Activa' : 'Inactiva'
          }));
          filename = 'Reporte_Instituciones_Sistema';
          sheetName = 'Instituciones';
        } else if (tipoReporte === 'usuarios') {
          data = usuarios.map(user => ({
            'Nombre': user.nombre,
            'Apellidos': user.apellidos,
            'Teléfono': user.telefono,
            'Rol': user.rol,
            'Estado': user.activo ? 'Activo' : 'Inactivo'
          }));
          filename = 'Reporte_Usuarios_Sistema';
          sheetName = 'Usuarios';
        }
        
        exportToExcel(data, filename, sheetName);
      }
    } catch (error) {
      console.error('Error generando reporte:', error);
    } finally {
      setLoadingReport(false);
    }
  };

  // ============================================
  // HANDLERS INSTITUCIONES
  // ============================================
  
  const handleCreateInstitucion = async () => {
    setError(null);
    const result = await createInstitucion(formInstitucion);
    
    if (result.success) {
      await loadData();
      setModalInstitucion(false);
      setFormInstitucion({ 
        nombre: '', 
        codigo_dane: '',
        nit: '',
        naturaleza: 'publica',
        municipio_id: 1,
        telefono_principal: '',
        correo_institucional: '',
        direccion_completa: '',
        rector_nombre: '',
        rector_documento: '',
        rector_telefono: ''
      });
    } else {
      setError(result.error || 'Error al crear institución');
    }
  };

  const handleUpdateInstitucion = async () => {
    if (!editingInstitucion) return;
    setError(null);
    
    const result = await updateInstitucion(editingInstitucion.id, formInstitucion);
    
    if (result.success) {
      await loadData();
      setModalInstitucion(false);
      setEditingInstitucion(null);
      setFormInstitucion({ 
        nombre: '', 
        codigo_dane: '',
        nit: '',
        naturaleza: 'publica',
        municipio_id: 1,
        telefono_principal: '',
        correo_institucional: '',
        direccion_completa: '',
        rector_nombre: '',
        rector_documento: '',
        rector_telefono: ''
      });
    } else {
      setError(result.error || 'Error al actualizar institución');
    }
  };

  const handleDeleteInstitucion = async (id: number) => {
    if (!confirm('¿Está seguro de eliminar esta institución?')) return;
    
    const result = await deleteInstitucion(id);
    if (result.success) {
      await loadData();
    } else {
      setError(result.error || 'Error al eliminar institución');
    }
  };

  const openEditInstitucion = (inst: Institucion) => {
    setEditingInstitucion(inst);
    setFormInstitucion({
      nombre: inst.nombre,
      codigo_dane: inst.codigo_dane || '',
      nit: inst.nit || '',
      naturaleza: inst.naturaleza,
      municipio_id: inst.municipio_id,
      telefono_principal: inst.telefono_principal,
      correo_institucional: inst.correo_institucional,
      direccion_completa: inst.direccion_completa || '',
      rector_nombre: inst.rector_nombre || '',
      rector_documento: inst.rector_documento || '',
      rector_telefono: inst.rector_telefono || ''
    });
    setModalInstitucion(true);
  };

  // ============================================
  // HANDLERS USUARIOS
  // ============================================
  
  const handleCreateUsuario = async () => {
    setError(null);
    const result = await createUsuario(formUsuario);
    
    if (result.success) {
      await loadData();
      setModalUsuario(false);
      setFormUsuario({ nombre: '', apellidos: '', correo: '', telefono: '', documento: '', tipoDocumento: 'cc', rol: 'docente_aula', institucionId: 1 });
    } else {
      setError(result.error || 'Error al crear usuario');
    }
  };

  const handleUpdateUsuario = async () => {
    if (!editingUsuario) return;
    setError(null);
    
    const result = await updateUsuario(editingUsuario.id, formUsuario);
    
    if (result.success) {
      await loadData();
      setModalUsuario(false);
      setEditingUsuario(null);
      setFormUsuario({ nombre: '', apellidos: '', correo: '', telefono: '', documento: '', tipoDocumento: 'cc', rol: 'docente_aula', institucionId: 1 });
    } else {
      setError(result.error || 'Error al actualizar usuario');
    }
  };

  const handleDeleteUsuario = async (id: number) => {
    if (!confirm('¿Está seguro de eliminar este usuario?')) return;
    
    const result = await deleteUsuario(id);
    if (result.success) {
      await loadData();
    } else {
      setError(result.error || 'Error al eliminar usuario');
    }
  };

  const openEditUsuario = (user: Usuario) => {
    setEditingUsuario(user);
    setFormUsuario({
      nombre: user.nombre,
      apellidos: user.apellidos || '',
      correo: user.correo || '',
      telefono: user.telefono || '',
      documento: user.documento || '',
      tipoDocumento: user.tipoDocumento || 'cc',
      // @ts-ignore
      rol: user.rol,
      institucionId: user.institucionId || 1
    });
    setModalUsuario(true);
  };

  // ============================================
  // HANDLERS PERIODOS
  // ============================================
  
  const handleCreatePeriodo = async () => {
    setError(null);
    const result = await createPeriodo(formPeriodo);
    
    if (result.success) {
      await loadData();
      setModalPeriodo(false);
      setFormPeriodo({ nombre: '', fechaInicio: '', fechaFin: '', institucionId: 1, anio: new Date().getFullYear(), estado: 'planificado' });
    } else {
      setError(result.error || 'Error al crear período');
    }
  };

  const handleUpdatePeriodo = async () => {
    if (!editingPeriodo) return;
    setError(null);
    
    const result = await updatePeriodo(editingPeriodo.id, formPeriodo);
    
    if (result.success) {
      await loadData();
      setModalPeriodo(false);
      setEditingPeriodo(null);
      setFormPeriodo({ nombre: '', fechaInicio: '', fechaFin: '', institucionId: 1, anio: new Date().getFullYear(), estado: 'planificado' });
    } else {
      setError(result.error || 'Error al actualizar período');
    }
  };

  const handleDeletePeriodo = async (id: number) => {
    if (!confirm('¿Está seguro de eliminar este período?')) return;
    
    const result = await deletePeriodo(id);
    if (result.success) {
      await loadData();
    } else {
      setError(result.error || 'Error al eliminar período');
    }
  };

  const openEditPeriodo = (periodo: Periodo) => {
    setEditingPeriodo(periodo);
    setFormPeriodo({
      nombre: periodo.nombre,
      fechaInicio: periodo.fechaInicio,
      fechaFin: periodo.fechaFin,
      institucionId: periodo.institucionId,
      anio: periodo.anio,
      estado: periodo.estado
    });
    setModalPeriodo(true);
  };

  // ============================================
  // HANDLERS GRADOS
  // ============================================
  
  const handleCreateGrado = async () => {
    setError(null);
    const result = await createGrado(formGrado);
    
    if (result.success) {
      await loadData();
      setModalGrado(false);
      setFormGrado({ nombre: '', orden: 0, institucionId: 1 });
    } else {
      setError(result.error || 'Error al crear grado');
    }
  };

  const handleUpdateGrado = async () => {
    if (!editingGrado) return;
    setError(null);
    
    const result = await updateGrado(editingGrado.id, formGrado);
    
    if (result.success) {
      await loadData();
      setModalGrado(false);
      setEditingGrado(null);
      setFormGrado({ nombre: '', orden: 0, institucionId: 1 });
    } else {
      setError(result.error || 'Error al actualizar grado');
    }
  };

  const handleDeleteGrado = async (id: number) => {
    if (!confirm('¿Está seguro de eliminar este grado?')) return;
    
    const result = await deleteGrado(id);
    if (result.success) {
      await loadData();
    } else {
      setError(result.error || 'Error al eliminar grado');
    }
  };

  const openEditGrado = (grado: Grado) => {
    setEditingGrado(grado);
    setFormGrado({
      nombre: grado.nombre,
      orden: grado.orden,
      institucionId: grado.institucionId
    });
    setModalGrado(true);
  };

  // ============================================
  // HANDLERS CURSOS
  // ============================================
  
  const handleCreateCurso = async () => {
    setError(null);
    const result = await createCurso(formCurso);
    
    if (result.success) {
      await loadData();
      setModalCurso(false);
      setFormCurso({ nombre: '', gradoId: 1, jornada: 'mañana', institucionId: 1, docenteDirectorId: undefined });
    } else {
      setError(result.error || 'Error al crear curso');
    }
  };

  const handleUpdateCurso = async () => {
    if (!editingCurso) return;
    setError(null);
    
    const result = await updateCurso(editingCurso.id, formCurso);
    
    if (result.success) {
      await loadData();
      setModalCurso(false);
      setEditingCurso(null);
      setFormCurso({ nombre: '', gradoId: 1, jornada: 'mañana', institucionId: 1, docenteDirectorId: undefined });
    } else {
      setError(result.error || 'Error al actualizar curso');
    }
  };

  const handleDeleteCurso = async (id: number) => {
    if (!confirm('¿Está seguro de eliminar este curso?')) return;
    
    const result = await deleteCurso(id);
    if (result.success) {
      await loadData();
    } else {
      setError(result.error || 'Error al eliminar curso');
    }
  };

  const openEditCurso = (curso: Curso) => {
    setEditingCurso(curso);
    setFormCurso({
      nombre: curso.nombre,
      gradoId: curso.gradoId,
      jornada: curso.jornada,
      institucionId: curso.institucionId,
      docenteDirectorId: curso.docenteDirectorId
    });
    setModalCurso(true);
  };

  // ============================================
  // HANDLERS CATEGORÍAS
  // ============================================
  
  const handleCreateCategoria = async () => {
    const result = await createCategoria(formCategoria);
    if (result.success) {
      await loadData();
      setModalCategoria(false);
      resetFormCategoria();
    } else {
      setError(result.error || 'Error al crear categoría');
    }
  };

  const handleUpdateCategoria = async () => {
    if (!editingCategoria) return;
    
    const result = await updateCategoria(editingCategoria.id, formCategoria);
    if (result.success) {
      await loadData();
      setModalCategoria(false);
      setEditingCategoria(null);
      resetFormCategoria();
    } else {
      setError(result.error || 'Error al actualizar categoría');
    }
  };

  const handleDeleteCategoria = async (id: number) => {
    if (!confirm('¿Está seguro de eliminar esta categoría?')) return;
    
    const result = await deleteCategoria(id);
    if (result.success) {
      await loadData();
    } else {
      setError(result.error || 'Error al eliminar categoría');
    }
  };

  const openEditCategoria = (categoria: Categoria) => {
    setEditingCategoria(categoria);
    setFormCategoria({
      nombre: categoria.nombre,
      color: categoria.color,
      icono: categoria.icono
    });
    setModalCategoria(true);
  };

  const resetFormCategoria = () => {
    setFormCategoria({ nombre: '', color: '#3B82F6', icono: '📚' });
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" text="Cargando panel administrativo..." />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header con diseño distintivo */}
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-800 via-slate-700 to-zinc-800 rounded-2xl p-6 text-white">
          <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-bl from-teal-500/10 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-violet-500/10 to-transparent rounded-full translate-y-1/2 -translate-x-1/2" />
          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center shadow-lg shadow-teal-500/30">
                <IconGear className="text-white" size={28} />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-display font-bold">
                  Panel de Administración
                </h1>
                <p className="text-slate-300 mt-0.5">
                  Gestión de instituciones, usuarios y configuración del sistema
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats globales */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="group bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 p-5 border border-slate-100 hover:border-teal-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center shadow-lg shadow-teal-200/50 group-hover:scale-105 transition-transform">
                <IconInstitution className="text-white" size={22} />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-800">{instituciones.length}</div>
                <div className="text-sm text-slate-500 font-medium">Instituciones</div>
              </div>
            </div>
          </div>
          
          <div className="group bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 p-5 border border-slate-100 hover:border-blue-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-200/50 group-hover:scale-105 transition-transform">
                <IconBook className="text-white" size={22} />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-800">{cursos.length}</div>
                <div className="text-sm text-slate-500 font-medium">Cursos</div>
              </div>
            </div>
          </div>
          
          <div className="group bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 p-5 border border-slate-100 hover:border-emerald-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-200/50 group-hover:scale-105 transition-transform">
                <IconUsers className="text-white" size={22} />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-800">156</div>
                <div className="text-sm text-slate-500 font-medium">Usuarios</div>
              </div>
            </div>
          </div>
          
          <div className="group bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 p-5 border border-slate-100 hover:border-violet-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-200/50 group-hover:scale-105 transition-transform">
                <IconClipboard className="text-white" size={22} />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-800">{tareas.length}</div>
                <div className="text-sm text-slate-500 font-medium">Tareas Creadas</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="border-b border-slate-100 bg-slate-50/50">
            <nav className="flex gap-1 p-1.5">
              {[
                { id: 'instituciones', label: 'Instituciones', Icon: IconInstitution },
                { id: 'usuarios', label: 'Usuarios', Icon: IconUsers },
                { id: 'categorias', label: 'Categorías', Icon: IconClipboard },
                { id: 'reportes', label: 'Reportes', Icon: IconDownload },
                { id: 'configuracion', label: 'Configuración', Icon: IconGear },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-white text-teal-700 shadow-sm'
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
            {/* Mensaje de error global */}
            {error && (
              <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-800">{error}</p>
                </div>
                <button onClick={() => setError(null)} className="flex-shrink-0 text-red-400 hover:text-red-600">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            )}

            {/* Tab: Instituciones */}
            {activeTab === 'instituciones' && (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-800">Instituciones Registradas</h3>
                  <Button onClick={() => setModalInstitucion(true)} className="flex items-center gap-2">
                    <IconPlus size={16} />
                    Nueva Institución
                  </Button>
                </div>
                
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/80">
                        <th className="text-left py-3.5 px-5 font-semibold text-slate-600 text-sm">Institución</th>
                        <th className="text-center py-3.5 px-4 font-semibold text-slate-600 text-sm">Cursos</th>
                        <th className="text-center py-3.5 px-4 font-semibold text-slate-600 text-sm">Familias</th>
                        <th className="text-center py-3.5 px-4 font-semibold text-slate-600 text-sm">Estado</th>
                        <th className="text-center py-3.5 px-4 font-semibold text-slate-600 text-sm">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {instituciones.map(inst => (
                        <tr key={inst.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                          <td className="py-4 px-5">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center shadow-md">
                                <IconInstitution className="text-white" size={18} />
                              </div>
                              <div>
                                <div className="font-medium text-slate-800">{inst.nombre}</div>
                                <div className="text-sm text-slate-500">{inst.direccion}</div>
                              </div>
                            </div>
                          </td>
                          <td className="text-center py-4 px-4 font-medium text-slate-700">
                            {cursos.filter(c => c.institucionId === inst.id).length}
                          </td>
                          <td className="text-center py-4 px-4 font-medium text-slate-700">
                            {Math.floor(50 + Math.random() * 200)}
                          </td>
                          <td className="text-center py-4 px-4">
                            <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-semibold">
                              Activa
                            </span>
                          </td>
                          <td className="text-center py-4 px-4">
                            <div className="flex justify-center gap-1">
                              <button 
                                onClick={() => openEditInstitucion(inst)}
                                className="p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                              >
                                <IconEdit size={18} />
                              </button>
                              <button 
                                onClick={() => handleDeleteInstitucion(inst.id)}
                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <IconTrash size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Tab: Usuarios */}
            {activeTab === 'usuarios' && (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-800">Gestión de Usuarios</h3>
                  <div className="flex gap-3">
                    <select className="px-4 py-2.5 border border-slate-200 rounded-xl bg-white text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 transition-all">
                      <option>Todos los roles</option>
                      <option>Docentes</option>
                      <option>Orientadores</option>
                      <option>Coordinadores</option>
                      <option>Rectores</option>
                    </select>
                    <Button onClick={() => {
                      setEditingUsuario(null);
                      setFormUsuario({ nombre: '', apellidos: '', correo: '', telefono: '', documento: '', tipoDocumento: 'cc', rol: 'docente_aula', institucionId: 1 });
                      setModalUsuario(true);
                    }} className="flex items-center gap-2">
                      <IconPlus size={16} />
                      Nuevo Usuario
                    </Button>
                  </div>
                </div>
                
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/80">
                        <th className="text-left py-3.5 px-5 font-semibold text-slate-600 text-sm">Usuario</th>
                        <th className="text-center py-3.5 px-4 font-semibold text-slate-600 text-sm">Rol</th>
                        <th className="text-center py-3.5 px-4 font-semibold text-slate-600 text-sm">Documento</th>
                        <th className="text-center py-3.5 px-4 font-semibold text-slate-600 text-sm">Estado</th>
                        <th className="text-center py-3.5 px-4 font-semibold text-slate-600 text-sm">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usuarios.map(usuario => (
                        <tr key={usuario.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                          <td className="py-4 px-5">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md ${
                                usuario.rol === 'docente_aula' ? 'bg-gradient-to-br from-blue-400 to-indigo-600' :
                                usuario.rol === 'orientador' ? 'bg-gradient-to-br from-violet-400 to-purple-600' :
                                usuario.rol === 'coordinador' ? 'bg-gradient-to-br from-amber-400 to-orange-600' :
                                usuario.rol === 'rector' ? 'bg-gradient-to-br from-rose-400 to-red-600' :
                                'bg-gradient-to-br from-teal-400 to-teal-600'
                              }`}>
                                {usuario.nombre[0]}{usuario.apellidos?.[0] || ''}
                              </div>
                              <div>
                                <div className="font-medium text-slate-800">{usuario.nombre} {usuario.apellidos}</div>
                                <div className="text-sm text-slate-500">{usuario.correo}</div>
                              </div>
                            </div>
                          </td>
                          <td className="text-center py-4 px-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              usuario.rol === 'docente_aula' ? 'bg-blue-100 text-blue-700' :
                              usuario.rol === 'orientador' ? 'bg-violet-100 text-violet-700' :
                              usuario.rol === 'coordinador' ? 'bg-amber-100 text-amber-700' :
                              usuario.rol === 'rector' ? 'bg-rose-100 text-rose-700' :
                              'bg-slate-100 text-slate-700'
                            }`}>
                              {usuario.rol === 'docente_aula' ? 'Docente' : 
                               usuario.rol === 'orientador' ? 'Orientador' :
                               usuario.rol === 'coordinador' ? 'Coordinador' :
                               usuario.rol === 'rector' ? 'Rector' : usuario.rol}
                            </span>
                          </td>
                          <td className="text-center py-4 px-4 text-slate-600 font-medium">
                            {usuario.documento || 'N/A'}
                          </td>
                          <td className="text-center py-4 px-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              usuario.activo ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                            }`}>
                              {usuario.activo ? 'Activo' : 'Inactivo'}
                            </span>
                          </td>
                          <td className="text-center py-4 px-4">
                            <div className="flex justify-center gap-1">
                              <button 
                                onClick={() => openEditUsuario(usuario)}
                                className="p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                              >
                                <IconEdit size={18} />
                              </button>
                              <button 
                                onClick={() => handleDeleteUsuario(usuario.id)}
                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <IconTrash size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Tab: Categorías */}
            {activeTab === 'categorias' && (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-800">Categorías de Tareas</h3>
                  <Button
                    onClick={() => {
                      setEditingCategoria(null);
                      resetFormCategoria();
                      setModalCategoria(true);
                    }}
                    className="flex items-center gap-2"
                  >
                    <IconPlus size={16} />
                    Nueva Categoría
                  </Button>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categorias.map(cat => (
                    <div 
                      key={cat.id} 
                      className="group bg-white border-2 rounded-xl p-5 hover:shadow-lg transition-all duration-300"
                      style={{ borderColor: cat.color + '40' }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-md"
                            style={{ backgroundColor: cat.color + '20' }}
                          >
                            {cat.icono}
                          </div>
                          <div>
                            <div className="font-bold text-slate-800">{cat.nombre}</div>
                            <div 
                              className="text-xs font-medium px-2 py-0.5 rounded-full mt-1 inline-block"
                              style={{ 
                                backgroundColor: cat.color + '20',
                                color: cat.color
                              }}
                            >
                              {cat.color}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => openEditCategoria(cat)}
                            className="p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                          >
                            <IconEdit size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteCategoria(cat.id)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <IconTrash size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab: Reportes */}
            {activeTab === 'reportes' && (
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-slate-800">Exportar Reportes</h3>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Reporte de Instituciones */}
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-6 border border-blue-200">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-blue-500 rounded-lg">
                        <IconInstitution className="text-white" size={20} />
                      </div>
                      <h4 className="font-bold text-gray-800">Instituciones</h4>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">Listado completo de instituciones registradas</p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => {
                          const data = instituciones.map(inst => {
                            const municipio = municipiosMock.find(m => m.id === inst.municipio_id);
                            const departamento = departamentosMock.find(d => d.id === municipio?.departamento_id);
                            return {
                              ID: inst.id,
                              Nombre: inst.nombre,
                              'Código DANE': inst.codigo_dane || '-',
                              NIT: inst.nit || '-',
                              Municipio: municipio?.nombre || '-',
                              Departamento: departamento?.nombre || '-',
                              Naturaleza: inst.naturaleza,
                              'Teléfono Principal': inst.telefono_principal,
                              'Correo Institucional': inst.correo_institucional,
                              Estado: inst.activo ? 'Activa' : 'Inactiva'
                            };
                          });
                          exportToExcel(data, 'Instituciones', 'Instituciones');
                        }}
                      >
                        <IconDownload size={14} />
                        Excel
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const data = instituciones.map(inst => {
                            const municipio = municipiosMock.find(m => m.id === inst.municipio_id);
                            const departamento = departamentosMock.find(d => d.id === municipio?.departamento_id);
                            return {
                              id: inst.id,
                              nombre: inst.nombre,
                              municipio: municipio?.nombre || '-',
                              departamento: departamento?.nombre || '-',
                              naturaleza: inst.naturaleza,
                              telefono: inst.telefono_principal,
                              estado: inst.activo ? 'Activa' : 'Inactiva'
                            };
                          });
                          exportToPDF(
                            data,
                            'Instituciones',
                            'Reporte de Instituciones',
                            [
                              { header: 'ID', dataKey: 'id' },
                              { header: 'Nombre', dataKey: 'nombre' },
                              { header: 'Municipio', dataKey: 'municipio' },
                              { header: 'Departamento', dataKey: 'departamento' },
                              { header: 'Naturaleza', dataKey: 'naturaleza' },
                              { header: 'Teléfono', dataKey: 'telefono' },
                              { header: 'Estado', dataKey: 'estado' }
                            ]
                          );
                        }}
                      >
                        <IconDownload size={14} />
                        PDF
                      </Button>
                    </div>
                  </div>

                  {/* Reporte de Usuarios */}
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl p-6 border border-purple-200">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-purple-500 rounded-lg">
                        <IconUsers className="text-white" size={20} />
                      </div>
                      <h4 className="font-bold text-gray-800">Usuarios</h4>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">Listado de usuarios por rol y estado</p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => {
                          const data = usuarios.map(user => ({
                            ID: user.id,
                            Nombre: user.nombre,
                            Email: user.email,
                            Rol: user.rol,
                            Institución: instituciones.find(i => i.id === user.institucionId)?.nombre || '-',
                            Estado: user.activo ? 'Activo' : 'Inactivo'
                          }));
                          exportToExcel(data, 'Usuarios', 'Usuarios');
                        }}
                      >
                        <IconDownload size={14} />
                        Excel
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const data = usuarios.map(user => ({
                            id: user.id,
                            nombre: user.nombre,
                            email: user.email,
                            rol: user.rol,
                            estado: user.activo ? 'Activo' : 'Inactivo'
                          }));
                          exportToPDF(
                            data,
                            'Usuarios',
                            'Reporte de Usuarios',
                            [
                              { header: 'ID', dataKey: 'id' },
                              { header: 'Nombre', dataKey: 'nombre' },
                              { header: 'Email', dataKey: 'email' },
                              { header: 'Rol', dataKey: 'rol' },
                              { header: 'Estado', dataKey: 'estado' }
                            ]
                          );
                        }}
                      >
                        <IconDownload size={14} />
                        PDF
                      </Button>
                    </div>
                  </div>

                  {/* Reporte de Tareas */}
                  <div className="bg-gradient-to-br from-teal-50 to-teal-100/50 rounded-xl p-6 border border-teal-200">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-teal-500 rounded-lg">
                        <IconClipboard className="text-white" size={20} />
                      </div>
                      <h4 className="font-bold text-gray-800">Tareas</h4>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">Listado de tareas creadas y su estado</p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => {
                          const data = tareas.map(tarea => ({
                            ID: tarea.id,
                            Título: tarea.titulo,
                            Categoría: tarea.categoria?.nombre || '-',
                            'Fecha Límite': tarea.fechaLimite,
                            Estado: tarea.estado
                          }));
                          exportToExcel(data, 'Tareas', 'Tareas');
                        }}
                      >
                        <IconDownload size={14} />
                        Excel
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const data = tareas.map(tarea => ({
                            id: tarea.id,
                            titulo: tarea.titulo,
                            categoria: tarea.categoria?.nombre || '-',
                            fechaLimite: tarea.fechaLimite,
                            estado: tarea.estado
                          }));
                          exportToPDF(
                            data,
                            'Tareas',
                            'Reporte de Tareas',
                            [
                              { header: 'ID', dataKey: 'id' },
                              { header: 'Título', dataKey: 'titulo' },
                              { header: 'Categoría', dataKey: 'categoria' },
                              { header: 'Fecha Límite', dataKey: 'fechaLimite' },
                              { header: 'Estado', dataKey: 'estado' }
                            ]
                          );
                        }}
                      >
                        <IconDownload size={14} />
                        PDF
                      </Button>
                    </div>
                  </div>

                  {/* Reporte de Cursos */}
                  <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-xl p-6 border border-amber-200">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-amber-500 rounded-lg">
                        <IconBook className="text-white" size={20} />
                      </div>
                      <h4 className="font-bold text-gray-800">Cursos</h4>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">Listado de cursos por institución</p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => {
                          const data = cursos.map(curso => ({
                            ID: curso.id,
                            Nombre: curso.nombre,
                            Jornada: curso.jornada,
                            Institución: instituciones.find(i => i.id === curso.institucionId)?.nombre || '-',
                            Estado: curso.activo ? 'Activo' : 'Inactivo'
                          }));
                          exportToExcel(data, 'Cursos', 'Cursos');
                        }}
                      >
                        <IconDownload size={14} />
                        Excel
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const data = cursos.map(curso => ({
                            id: curso.id,
                            nombre: curso.nombre,
                            jornada: curso.jornada,
                            estado: curso.activo ? 'Activo' : 'Inactivo'
                          }));
                          exportToPDF(
                            data,
                            'Cursos',
                            'Reporte de Cursos',
                            [
                              { header: 'ID', dataKey: 'id' },
                              { header: 'Nombre', dataKey: 'nombre' },
                              { header: 'Jornada', dataKey: 'jornada' },
                              { header: 'Estado', dataKey: 'estado' }
                            ]
                          );
                        }}
                      >
                        <IconDownload size={14} />
                        PDF
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Configuración */}
            {activeTab === 'configuracion' && (
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-slate-800">Configuración del Sistema</h3>
                
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Categorías */}
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
                      <h4 className="font-semibold text-slate-800 flex items-center gap-2">
                        <IconClipboard className="text-slate-500" size={18} />
                        Categorías de Tareas
                      </h4>
                    </div>
                    <div className="p-4 space-y-2">
                      {[
                        { nombre: 'Comunicación', color: '#3B82F6' },
                        { nombre: 'Tiempo en Familia', color: '#10B981' },
                        { nombre: 'Valores', color: '#F59E0B' },
                        { nombre: 'Responsabilidades', color: '#8B5CF6' },
                        { nombre: 'Bienestar', color: '#EC4899' },
                      ].map(cat => (
                        <div key={cat.nombre} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-4 h-4 rounded-full shadow-inner" style={{ backgroundColor: cat.color }} />
                            <span className="font-medium text-slate-700">{cat.nombre}</span>
                          </div>
                          <button className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors">
                            <IconEdit size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="px-4 pb-4">
                      <Button variant="ghost" size="sm" className="flex items-center gap-1.5">
                        <IconPlus size={14} />
                        Agregar categoría
                      </Button>
                    </div>
                  </div>
                  
                  {/* Período académico */}
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                      <h4 className="font-semibold text-slate-800 flex items-center gap-2">
                        <IconCalendar className="text-slate-500" size={18} />
                        Períodos Académicos
                      </h4>
                      <Button 
                        onClick={() => {
                          setEditingPeriodo(null);
                          setFormPeriodo({ nombre: '', fechaInicio: '', fechaFin: '', institucionId: 1, anio: new Date().getFullYear(), estado: 'planificado' });
                          setModalPeriodo(true);
                        }}
                        size="sm" 
                        variant="ghost"
                        className="flex items-center gap-1.5"
                      >
                        <IconPlus size={14} />
                        Nuevo
                      </Button>
                    </div>
                    <div className="p-4 space-y-3 max-h-80 overflow-y-auto">
                      {periodos.length === 0 ? (
                        <div className="text-center py-8 text-slate-500">
                          <IconCalendar className="mx-auto mb-2 text-slate-400" size={32} />
                          <p className="text-sm">No hay períodos registrados</p>
                        </div>
                      ) : (
                        periodos.slice(0, 5).map(periodo => (
                          <div key={periodo.id} className={`flex items-center justify-between p-4 rounded-xl border ${
                            periodo.estado === 'activo' 
                              ? 'bg-gradient-to-r from-teal-50 to-emerald-50/30 border-teal-200/60'
                              : 'bg-slate-50 border-slate-100'
                          }`}>
                            <div className="flex-1">
                              <div className={`font-semibold ${periodo.estado === 'activo' ? 'text-teal-800' : 'text-slate-700'}`}>
                                {periodo.nombre}
                              </div>
                              <div className={`text-sm ${periodo.estado === 'activo' ? 'text-teal-600/80' : 'text-slate-500'}`}>
                                {periodo.fechaInicio} - {periodo.fechaFin}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                periodo.estado === 'activo' ? 'bg-teal-100 text-teal-700' :
                                periodo.estado === 'cerrado' ? 'bg-slate-100 text-slate-500' :
                                'bg-blue-100 text-blue-700'
                              }`}>
                                {periodo.estado === 'activo' ? 'Activo' : periodo.estado === 'cerrado' ? 'Cerrado' : 'Planificado'}
                              </span>
                              <button 
                                onClick={() => openEditPeriodo(periodo)}
                                className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                              >
                                <IconEdit size={16} />
                              </button>
                              <button 
                                onClick={() => handleDeletePeriodo(periodo.id)}
                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <IconTrash size={16} />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* Grados y Cursos */}
                <div className="grid md:grid-cols-2 gap-6 mt-6">
                  {/* Grados */}
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                      <h4 className="font-semibold text-slate-800 flex items-center gap-2">
                        <IconBook className="text-slate-500" size={18} />
                        Grados
                      </h4>
                      <Button 
                        onClick={() => {
                          setEditingGrado(null);
                          setFormGrado({ nombre: '', orden: grados.length, institucionId: 1 });
                          setModalGrado(true);
                        }}
                        size="sm" 
                        variant="ghost"
                        className="flex items-center gap-1.5"
                      >
                        <IconPlus size={14} />
                        Nuevo
                      </Button>
                    </div>
                    <div className="p-4 space-y-2 max-h-80 overflow-y-auto">
                      {grados.length === 0 ? (
                        <div className="text-center py-8 text-slate-500">
                          <IconBook className="mx-auto mb-2 text-slate-400" size={32} />
                          <p className="text-sm">No hay grados registrados</p>
                        </div>
                      ) : (
                        grados.map(grado => (
                          <div key={grado.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white font-bold text-xs">
                                {grado.orden}
                              </div>
                              <span className="font-medium text-slate-700">{grado.nombre}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <button 
                                onClick={() => openEditGrado(grado)}
                                className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                              >
                                <IconEdit size={16} />
                              </button>
                              <button 
                                onClick={() => handleDeleteGrado(grado.id)}
                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <IconTrash size={16} />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Cursos */}
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                      <h4 className="font-semibold text-slate-800 flex items-center gap-2">
                        <IconUsers className="text-slate-500" size={18} />
                        Cursos
                      </h4>
                      <Button 
                        onClick={() => {
                          setEditingCurso(null);
                          setFormCurso({ nombre: '', gradoId: grados[0]?.id || 1, jornada: 'mañana', institucionId: 1, docenteDirectorId: undefined });
                          setModalCurso(true);
                        }}
                        size="sm" 
                        variant="ghost"
                        className="flex items-center gap-1.5"
                      >
                        <IconPlus size={14} />
                        Nuevo
                      </Button>
                    </div>
                    <div className="p-4 space-y-2 max-h-80 overflow-y-auto">
                      {cursos.length === 0 ? (
                        <div className="text-center py-8 text-slate-500">
                          <IconUsers className="mx-auto mb-2 text-slate-400" size={32} />
                          <p className="text-sm">No hay cursos registrados</p>
                        </div>
                      ) : (
                        cursos.slice(0, 10).map(curso => {
                          const grado = grados.find(g => g.id === curso.gradoId);
                          return (
                            <div key={curso.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors">
                              <div>
                                <div className="font-medium text-slate-700">{curso.nombre}</div>
                                <div className="text-xs text-slate-500">{grado?.nombre} - {curso.jornada}</div>
                              </div>
                              <div className="flex items-center gap-1">
                                <button 
                                  onClick={() => openEditCurso(curso)}
                                  className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                                >
                                  <IconEdit size={16} />
                                </button>
                                <button 
                                  onClick={() => handleDeleteCurso(curso.id)}
                                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                  <IconTrash size={16} />
                                </button>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Nueva Institución */}
      <Modal
        isOpen={modalInstitucion}
        onClose={() => {
          setModalInstitucion(false);
          setEditingInstitucion(null);
          setFormInstitucion({ 
            nombre: '', 
            codigo_dane: '',
            nit: '',
            naturaleza: 'publica',
            municipio_id: 1,
            telefono_principal: '',
            correo_institucional: '',
            direccion_completa: '',
            rector_nombre: '',
            rector_documento: '',
            rector_telefono: ''
          });
          setError(null);
        }}
        title={editingInstitucion ? 'Editar Institución' : 'Nueva Institución'}
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <FormFieldInput
              name="nombre"
              label="Nombre de la institución"
              placeholder="I.E. Nombre de la institución"
              value={formInstitucion.nombre}
              onChange={(e) => setFormInstitucion({ ...formInstitucion, nombre: e.target.value })}
            />
            
            <FormFieldInput
              name="codigo_dane"
              label="Código DANE"
              placeholder="Ej: 119001000123"
              value={formInstitucion.codigo_dane}
              onChange={(e) => setFormInstitucion({ ...formInstitucion, codigo_dane: e.target.value })}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <FormFieldInput
              name="nit"
              label="NIT"
              placeholder="Ej: 800123456-7"
              value={formInstitucion.nit}
              onChange={(e) => setFormInstitucion({ ...formInstitucion, nit: e.target.value })}
            />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Naturaleza</label>
              <select
                value={formInstitucion.naturaleza}
                onChange={(e) => setFormInstitucion({ ...formInstitucion, naturaleza: e.target.value as 'publica' | 'privada' | 'mixta' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="publica">Pública</option>
                <option value="privada">Privada</option>
                <option value="mixta">Mixta</option>
              </select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Municipio</label>
              <select
                value={formInstitucion.municipio_id}
                onChange={(e) => setFormInstitucion({ ...formInstitucion, municipio_id: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                {municipiosMock.map(municipio => (
                  <option key={municipio.id} value={municipio.id}>
                    {municipio.nombre} - {departamentosMock.find(d => d.id === municipio.departamento_id)?.nombre}
                  </option>
                ))}
              </select>
            </div>

            <FormFieldInput
              name="telefono_principal"
              label="Teléfono Principal"
              placeholder="(602) 123-4567"
              value={formInstitucion.telefono_principal}
              onChange={(e) => setFormInstitucion({ ...formInstitucion, telefono_principal: e.target.value })}
            />
          </div>

          <FormFieldInput
            name="correo_institucional"
            label="Correo Institucional"
            placeholder="contacto@institucion.edu.co"
            value={formInstitucion.correo_institucional}
            onChange={(e) => setFormInstitucion({ ...formInstitucion, correo_institucional: e.target.value })}
          />

          <FormFieldInput
            name="direccion_completa"
            label="Dirección Completa"
            placeholder="Carrera 15 # 8-45, Barrio Centro"
            value={formInstitucion.direccion_completa}
            onChange={(e) => setFormInstitucion({ ...formInstitucion, direccion_completa: e.target.value })}
          />

          <div className="border-t pt-4">
            <h4 className="font-medium text-gray-800 mb-3">Información del Rector</h4>
            <div className="grid md:grid-cols-3 gap-4">
              <FormFieldInput
                name="rector_nombre"
                label="Nombre Completo"
                placeholder="María Elena Rodríguez"
                value={formInstitucion.rector_nombre}
                onChange={(e) => setFormInstitucion({ ...formInstitucion, rector_nombre: e.target.value })}
              />
              
              <FormFieldInput
                name="rector_documento"
                label="Documento"
                placeholder="41234567"
                value={formInstitucion.rector_documento}
                onChange={(e) => setFormInstitucion({ ...formInstitucion, rector_documento: e.target.value })}
              />
              
              <FormFieldInput
                name="rector_telefono"
                label="Teléfono"
                placeholder="3001234567"
                value={formInstitucion.rector_telefono}
                onChange={(e) => setFormInstitucion({ ...formInstitucion, rector_telefono: e.target.value })}
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" onClick={() => {
              setModalInstitucion(false);
              setEditingInstitucion(null);
              setFormInstitucion({ 
                nombre: '', 
                codigo_dane: '',
                nit: '',
                naturaleza: 'publica',
                municipio_id: 1,
                telefono_principal: '',
                correo_institucional: '',
                direccion_completa: '',
                rector_nombre: '',
                rector_documento: '',
                rector_telefono: ''
              });
              setError(null);
            }}>
              Cancelar
            </Button>
            <Button onClick={editingInstitucion ? handleUpdateInstitucion : handleCreateInstitucion}>
              {editingInstitucion ? 'Actualizar' : 'Crear'} Institución
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal Nuevo Usuario */}
      <Modal
        isOpen={modalUsuario}
        onClose={() => {
          setModalUsuario(false);
          setEditingUsuario(null);
          setFormUsuario({ nombre: '', apellidos: '', correo: '', telefono: '', documento: '', tipoDocumento: 'cc', rol: 'docente_aula', institucionId: 1 });
          setError(null);
        }}
        title={editingUsuario ? 'Editar Usuario' : 'Nuevo Usuario'}
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormFieldInput
              name="nombre"
              label="Nombre"
              placeholder="Nombre"
              value={formUsuario.nombre}
              onChange={(e) => setFormUsuario({ ...formUsuario, nombre: e.target.value })}
              required
            />
            <FormFieldInput
              name="apellidos"
              label="Apellidos"
              placeholder="Apellidos"
              value={formUsuario.apellidos}
              onChange={(e) => setFormUsuario({ ...formUsuario, apellidos: e.target.value })}
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Tipo de Documento</label>
              <select 
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 transition-all"
                value={formUsuario.tipoDocumento}
                onChange={(e) => setFormUsuario({ ...formUsuario, tipoDocumento: e.target.value as any })}
              >
                <option value="cc">Cédula</option>
                <option value="ti">Tarjeta de Identidad</option>
                <option value="ce">Cédula de Extranjería</option>
                <option value="pasaporte">Pasaporte</option>
              </select>
            </div>
            <FormFieldInput
              name="documento"
              label="Número de Documento"
              placeholder="1234567890"
              value={formUsuario.documento}
              onChange={(e) => setFormUsuario({ ...formUsuario, documento: e.target.value })}
              required
            />
          </div>

          <FormFieldInput
            name="correo"
            label="Correo electrónico"
            type="email"
            placeholder="usuario@correo.com"
            value={formUsuario.correo}
            onChange={(e) => setFormUsuario({ ...formUsuario, correo: e.target.value })}
            required
          />
          
          <FormFieldInput
            name="telefono"
            label="Teléfono"
            placeholder="3001234567"
            value={formUsuario.telefono}
            onChange={(e) => setFormUsuario({ ...formUsuario, telefono: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Rol</label>
              <select 
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 transition-all"
                value={formUsuario.rol}
                onChange={(e) => setFormUsuario({ ...formUsuario, rol: e.target.value as any })}
              >
                <option value="docente_aula">Docente de Aula</option>
                <option value="orientador">Orientador</option>
                <option value="coordinador">Coordinador</option>
                <option value="rector">Rector</option>
                <option value="acudiente">Acudiente</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Institución</label>
              <select 
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 transition-all"
                value={formUsuario.institucionId}
                onChange={(e) => setFormUsuario({ ...formUsuario, institucionId: parseInt(e.target.value) })}
              >
                {instituciones.map(inst => (
                  <option key={inst.id} value={inst.id}>{inst.nombre}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" onClick={() => {
              setModalUsuario(false);
              setEditingUsuario(null);
              setFormUsuario({ nombre: '', apellidos: '', correo: '', telefono: '', documento: '', tipoDocumento: 'cc', rol: 'docente_aula', institucionId: 1 });
              setError(null);
            }}>
              Cancelar
            </Button>
            <Button onClick={editingUsuario ? handleUpdateUsuario : handleCreateUsuario}>
              {editingUsuario ? 'Actualizar' : 'Crear'} Usuario
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal Nuevo Período */}
      <Modal
        isOpen={modalPeriodo}
        onClose={() => {
          setModalPeriodo(false);
          setEditingPeriodo(null);
          setFormPeriodo({ nombre: '', fechaInicio: '', fechaFin: '', institucionId: 1, anio: new Date().getFullYear(), estado: 'planificado' });
          setError(null);
        }}
        title={editingPeriodo ? 'Editar Período' : 'Nuevo Período'}
        size="lg"
      >
        <div className="space-y-4">
          <FormFieldInput
            name="nombre"
            label="Nombre del período"
            placeholder="Ej: Período 1 - 2024"
            value={formPeriodo.nombre}
            onChange={(e) => setFormPeriodo({ ...formPeriodo, nombre: e.target.value })}
            required
          />
          
          <div className="grid grid-cols-3 gap-4">
            <FormFieldInput
              name="fechaInicio"
              label="Fecha de inicio"
              type="date"
              value={formPeriodo.fechaInicio}
              onChange={(e) => setFormPeriodo({ ...formPeriodo, fechaInicio: e.target.value })}
              required
            />
            <FormFieldInput
              name="fechaFin"
              label="Fecha de fin"
              type="date"
              value={formPeriodo.fechaFin}
              onChange={(e) => setFormPeriodo({ ...formPeriodo, fechaFin: e.target.value })}
              required
            />
            <FormFieldInput
              name="anio"
              label="Año"
              type="number"
              value={formPeriodo.anio.toString()}
              onChange={(e) => setFormPeriodo({ ...formPeriodo, anio: parseInt(e.target.value) })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Estado</label>
              <select 
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 transition-all"
                value={formPeriodo.estado}
                onChange={(e) => setFormPeriodo({ ...formPeriodo, estado: e.target.value as any })}
              >
                <option value="planificado">Planificado</option>
                <option value="activo">Activo</option>
                <option value="cerrado">Cerrado</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Institución</label>
              <select 
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 transition-all"
                value={formPeriodo.institucionId}
                onChange={(e) => setFormPeriodo({ ...formPeriodo, institucionId: parseInt(e.target.value) })}
              >
                {instituciones.map(inst => (
                  <option key={inst.id} value={inst.id}>{inst.nombre}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" onClick={() => {
              setModalPeriodo(false);
              setEditingPeriodo(null);
              setFormPeriodo({ nombre: '', fechaInicio: '', fechaFin: '', institucionId: 1, anio: new Date().getFullYear(), estado: 'planificado' });
              setError(null);
            }}>
              Cancelar
            </Button>
            <Button onClick={editingPeriodo ? handleUpdatePeriodo : handleCreatePeriodo}>
              {editingPeriodo ? 'Actualizar' : 'Crear'} Período
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal Nuevo Grado */}
      <Modal
        isOpen={modalGrado}
        onClose={() => {
          setModalGrado(false);
          setEditingGrado(null);
          setFormGrado({ nombre: '', orden: 0, institucionId: 1 });
          setError(null);
        }}
        title={editingGrado ? 'Editar Grado' : 'Nuevo Grado'}
        size="md"
      >
        <div className="space-y-4">
          <FormFieldInput
            name="nombre"
            label="Nombre del grado"
            placeholder="Ej: 1° Primaria, 6° Bachillerato"
            value={formGrado.nombre}
            onChange={(e) => setFormGrado({ ...formGrado, nombre: e.target.value })}
            required
          />
          
          <div className="grid grid-cols-2 gap-4">
            <FormFieldInput
              name="orden"
              label="Orden"
              type="number"
              placeholder="1"
              value={formGrado.orden.toString()}
              onChange={(e) => setFormGrado({ ...formGrado, orden: parseInt(e.target.value) || 0 })}
              required
            />
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Institución</label>
              <select 
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 transition-all"
                value={formGrado.institucionId}
                onChange={(e) => setFormGrado({ ...formGrado, institucionId: parseInt(e.target.value) })}
              >
                {instituciones.map(inst => (
                  <option key={inst.id} value={inst.id}>{inst.nombre}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" onClick={() => {
              setModalGrado(false);
              setEditingGrado(null);
              setFormGrado({ nombre: '', orden: 0, institucionId: 1 });
              setError(null);
            }}>
              Cancelar
            </Button>
            <Button onClick={editingGrado ? handleUpdateGrado : handleCreateGrado}>
              {editingGrado ? 'Actualizar' : 'Crear'} Grado
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal Nuevo Curso */}
      <Modal
        isOpen={modalCurso}
        onClose={() => {
          setModalCurso(false);
          setEditingCurso(null);
          setFormCurso({ nombre: '', gradoId: 1, jornada: 'mañana', institucionId: 1, docenteDirectorId: undefined });
          setError(null);
        }}
        title={editingCurso ? 'Editar Curso' : 'Nuevo Curso'}
        size="lg"
      >
        <div className="space-y-4">
          <FormFieldInput
            name="nombre"
            label="Nombre del curso"
            placeholder="Ej: 6-A, 10-B"
            value={formCurso.nombre}
            onChange={(e) => setFormCurso({ ...formCurso, nombre: e.target.value })}
            required
          />
          
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Grado</label>
              <select 
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 transition-all"
                value={formCurso.gradoId}
                onChange={(e) => setFormCurso({ ...formCurso, gradoId: parseInt(e.target.value) })}
              >
                {grados.map(grado => (
                  <option key={grado.id} value={grado.id}>{grado.nombre}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Jornada</label>
              <select 
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 transition-all"
                value={formCurso.jornada}
                onChange={(e) => setFormCurso({ ...formCurso, jornada: e.target.value as any })}
              >
                <option value="mañana">Mañana</option>
                <option value="tarde">Tarde</option>
                <option value="completa">Completa</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Institución</label>
              <select 
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 transition-all"
                value={formCurso.institucionId}
                onChange={(e) => setFormCurso({ ...formCurso, institucionId: parseInt(e.target.value) })}
              >
                {instituciones.map(inst => (
                  <option key={inst.id} value={inst.id}>{inst.nombre}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Director de Curso (Opcional)</label>
            <select 
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 transition-all"
              value={formCurso.docenteDirectorId || ''}
              onChange={(e) => setFormCurso({ ...formCurso, docenteDirectorId: e.target.value ? parseInt(e.target.value) : undefined })}
            >
              <option value="">Sin asignar</option>
              {usuarios.filter(u => u.rol === 'docente_aula' && u.institucionId === formCurso.institucionId).map(docente => (
                <option key={docente.id} value={docente.id}>{docente.nombre} {docente.apellidos}</option>
              ))}
            </select>
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" onClick={() => {
              setModalCurso(false);
              setEditingCurso(null);
              setFormCurso({ nombre: '', gradoId: 1, jornada: 'mañana', institucionId: 1, docenteDirectorId: undefined });
              setError(null);
            }}>
              Cancelar
            </Button>
            <Button onClick={editingCurso ? handleUpdateCurso : handleCreateCurso}>
              {editingCurso ? 'Actualizar' : 'Crear'} Curso
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal Nuevo/Editar Categoría */}
      <Modal isOpen={modalCategoria} onClose={() => { setModalCategoria(false); resetFormCategoria(); }}>
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {editingCategoria ? 'Editar Categoría' : 'Nueva Categoría'}
          </h2>
          <FormFieldInput
            label="Nombre de la Categoría"
            name="nombre"
            value={formCategoria.nombre}
            onChange={(e) => setFormCategoria({ ...formCategoria, nombre: e.target.value })}
            placeholder="Ej: Evaluaciones, Tareas, Proyectos"
          />
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Color</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={formCategoria.color}
                onChange={(e) => setFormCategoria({ ...formCategoria, color: e.target.value })}
                className="w-16 h-10 rounded border border-gray-300 cursor-pointer"
              />
              <span className="text-sm text-gray-600 font-mono">{formCategoria.color}</span>
            </div>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Icono</label>
            <div className="grid grid-cols-8 gap-2">
              {['📚', '✏️', '📝', '📊', '🎯', '💡', '🔬', '🎨', '📖', '🏆', '⭐', '✅', '📌', '🔔', '📅', '🎓'].map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setFormCategoria({ ...formCategoria, icono: icon })}
                  className={`text-2xl p-3 rounded-lg border-2 transition-all hover:scale-110 ${
                    formCategoria.icono === icon
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="ghost" onClick={() => { setModalCategoria(false); resetFormCategoria(); }}>
              Cancelar
            </Button>
            <Button onClick={editingCategoria ? handleUpdateCategoria : handleCreateCategoria}>
              {editingCategoria ? 'Actualizar' : 'Crear'} Categoría
            </Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
