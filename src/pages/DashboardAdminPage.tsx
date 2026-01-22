import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
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
  crearRector,
  crearCoordinador,
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
  getDepartamentos,
  getMunicipios
} from '../api/endpoints';
import { type Institucion, type Curso, type Tarea, type Usuario, type Periodo, type Grado, type Departamento, type Municipio } from '../mocks/data';
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
import { isBypassValidationsEnabled } from '../utils/dev';

export default function DashboardAdminPage() {
  getSession(); // Verificar sesión activa
  
  const [loading, setLoading] = useState(true);
  const [instituciones, setInstituciones] = useState<Institucion[]>([]);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [periodos, setPeriodos] = useState<Periodo[]>([]);
  const [grados, setGrados] = useState<Grado[]>([]);
  const [activeTab, setActiveTab] = useState<'instituciones' | 'usuarios' | 'reportes' | 'configuracion'>('instituciones');
  
  // Estado para institución expandida (ver usuarios)
  const [expandedInstitucion, setExpandedInstitucion] = useState<number | null>(null);
  
  // Estados de filtros por departamento
  const [filtroDepartamentoInst, setFiltroDepartamentoInst] = useState<number | 'todos'>('todos');
  const [filtroDepartamentoUsers, setFiltroDepartamentoUsers] = useState<number | 'todos'>('todos');
  const [filtroRolUsers, setFiltroRolUsers] = useState<string>('todos');
  
  // Estados para reportes globales
  const [tipoReporte, setTipoReporte] = useState<'general' | 'instituciones' | 'usuarios' | 'actividad'>('general');
  const [loadingReport, setLoadingReport] = useState(false);
  
  // Estados de modales
  const [modalInstitucion, setModalInstitucion] = useState(false);
  const [modalUsuario, setModalUsuario] = useState(false);
  const [modalPeriodo, setModalPeriodo] = useState(false);
  const [modalGrado, setModalGrado] = useState(false);
  const [modalCurso, setModalCurso] = useState(false);
  
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
  const [formUsuario, setFormUsuario] = useState<{ nombre: string; apellidos: string; correo: string; telefono: string; documento: string; tipoDocumento: string; contrasena: string; rol: 'admin' | 'rector' | 'coordinador' | 'orientador' | 'docente_aula' | 'acudiente'; institucionId: number }>({ nombre: '', apellidos: '', correo: '', telefono: '', documento: '', tipoDocumento: 'cc', contrasena: '', rol: 'docente_aula', institucionId: 1 });
  const [formPeriodo, setFormPeriodo] = useState<{ nombre: string; fechaInicio: string; fechaFin: string; institucionId: number; anio: number; estado: 'planificado' | 'activo' | 'cerrado' }>({ nombre: '', fechaInicio: '', fechaFin: '', institucionId: 1, anio: new Date().getFullYear(), estado: 'planificado' });
  const [formGrado, setFormGrado] = useState({ nombre: '', orden: 0, institucionId: 1 });
  const [formCurso, setFormCurso] = useState<{ nombre: string; gradoId: number; jornada: 'mañana' | 'tarde' | 'completa'; institucionId: number; docenteDirectorId: number | undefined }>({ nombre: '', gradoId: 1, jornada: 'mañana', institucionId: 1, docenteDirectorId: undefined });
  
  // Estados de edición
  const [editingInstitucion, setEditingInstitucion] = useState<Institucion | null>(null);
  const [editingUsuario, setEditingUsuario] = useState<Usuario | null>(null);
  const [editingPeriodo, setEditingPeriodo] = useState<Periodo | null>(null);
  const [editingGrado, setEditingGrado] = useState<Grado | null>(null);
  const [editingCurso, setEditingCurso] = useState<Curso | null>(null);
  
  // Estados de error
  const [error, setError] = useState<string | null>(null);
  const bypassValidations = isBypassValidationsEnabled();
  const location = useLocation();

  // Leer query param ?tab= para seleccionar pestaña desde la URL
  useEffect(() => {
    try {
      const params = new URLSearchParams(location.search);
      const tab = params.get('tab');
      if (tab === 'instituciones' || tab === 'usuarios' || tab === 'reportes' || tab === 'configuracion') {
        setActiveTab(tab as any);
      }
    } catch (e) {
      // ignore
    }
  }, [location.search]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Solo cargar instituciones que es lo que el backend soporta actualmente
      // Los demás endpoints retornan arrays vacíos porque aún no existen en el backend
      const [institucionesData, cursosData, tareasData, usuariosData, periodosData, gradosData] = await Promise.all([
        getInstituciones(),
        getCursos(),
        getTareas(),
        getUsuarios(),
        getPeriodos(),
        getGrados()
      ]);

      setInstituciones(Array.isArray(institucionesData) ? institucionesData : []);
      setCursos(Array.isArray(cursosData) ? cursosData : []);
      setTareas(Array.isArray(tareasData) ? tareasData : []);
      setUsuarios(Array.isArray(usuariosData) ? usuariosData : []);
      setPeriodos(Array.isArray(periodosData) ? periodosData : []);
      setGrados(Array.isArray(gradosData) ? gradosData : []);
      
      // Si no hay instituciones, mostrar mensaje
      if (!Array.isArray(institucionesData) || institucionesData.length === 0) {
        console.log('No hay instituciones registradas en el sistema');
      }
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
    
    // Si es rector o coordinador, usar los endpoints específicos del backend
    if (formUsuario.rol === 'rector') {
      // Validar campos requeridos para rector
      if (!formUsuario.nombre || !formUsuario.apellidos || !formUsuario.correo || !formUsuario.telefono || !formUsuario.contrasena || !formUsuario.institucionId) {
        setError('Todos los campos son requeridos para crear un rector');
        return;
      }
      
      // Validar teléfono (10 dígitos)
      const telefonoLimpio = formUsuario.telefono.replace(/\D/g, '');
      if (telefonoLimpio.length !== 10) {
        setError('El teléfono debe tener exactamente 10 dígitos');
        return;
      }
      
      // Validar email
      if (!formUsuario.correo.includes('@') || !formUsuario.correo.includes('.')) {
        setError('El correo electrónico no es válido');
        return;
      }
      
      // Validar contraseña
      if (formUsuario.contrasena.length < 8) {
        setError('La contraseña debe tener al menos 8 caracteres');
        return;
      }
      if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/.test(formUsuario.contrasena)) {
        setError('La contraseña debe tener al menos: 1 minúscula, 1 mayúscula, 1 número y 1 carácter especial (!@#$%^&*)');
        return;
      }
      
      console.log('Creando rector con datos:', {
        correo: formUsuario.correo,
        nombre: formUsuario.nombre,
        apellido: formUsuario.apellidos,
        telefono: telefonoLimpio,
        institucionId: formUsuario.institucionId
      });
      
      const result = await crearRector({
        correo: formUsuario.correo,
        contrasena: formUsuario.contrasena,
        nombre: formUsuario.nombre,
        apellido: formUsuario.apellidos,
        telefono: telefonoLimpio,
        institucionId: formUsuario.institucionId
      });
      
      console.log('Resultado crear rector:', result);
      
      if (result.success) {
        await loadData();
        setModalUsuario(false);
        setFormUsuario({ nombre: '', apellidos: '', correo: '', telefono: '', documento: '', tipoDocumento: 'cc', contrasena: '', rol: 'docente_aula', institucionId: 1 });
        alert(`Rector creado exitosamente. Contraseña asignada: ${formUsuario.contrasena} (debe cambiarla en el primer inicio de sesión)`);
      } else {
        setError(result.error || 'Error al crear rector');
      }
      return;
    }
    
    if (formUsuario.rol === 'coordinador') {
      // Validar campos requeridos para coordinador
      if (!formUsuario.nombre || !formUsuario.apellidos || !formUsuario.correo || !formUsuario.telefono || !formUsuario.contrasena || !formUsuario.institucionId) {
        setError('Todos los campos son requeridos para crear un coordinador');
        return;
      }
      
      // Validar teléfono (10 dígitos)
      const telefonoLimpio = formUsuario.telefono.replace(/\D/g, '');
      if (telefonoLimpio.length !== 10) {
        setError('El teléfono debe tener exactamente 10 dígitos');
        return;
      }
      
      // Validar email
      if (!formUsuario.correo.includes('@') || !formUsuario.correo.includes('.')) {
        setError('El correo electrónico no es válido');
        return;
      }
      
      // Validar contraseña
      if (formUsuario.contrasena.length < 8) {
        setError('La contraseña debe tener al menos 8 caracteres');
        return;
      }
      if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/.test(formUsuario.contrasena)) {
        setError('La contraseña debe tener al menos: 1 minúscula, 1 mayúscula, 1 número y 1 carácter especial (!@#$%^&*)');
        return;
      }
      
      console.log('Creando coordinador con datos:', {
        correo: formUsuario.correo,
        nombre: formUsuario.nombre,
        apellido: formUsuario.apellidos,
        telefono: telefonoLimpio,
        institucionId: formUsuario.institucionId
      });
      
      const result = await crearCoordinador({
        correo: formUsuario.correo,
        contrasena: formUsuario.contrasena,
        nombre: formUsuario.nombre,
        apellido: formUsuario.apellidos,
        telefono: telefonoLimpio,
        institucionId: formUsuario.institucionId
      });
      
      console.log('Resultado crear coordinador:', result);
      
      if (result.success) {
        await loadData();
        setModalUsuario(false);
        setFormUsuario({ nombre: '', apellidos: '', correo: '', telefono: '', documento: '', tipoDocumento: 'cc', contrasena: '', rol: 'docente_aula', institucionId: 1 });
        alert(`Coordinador creado exitosamente. Contraseña asignada: ${formUsuario.contrasena} (debe cambiarla en el primer inicio de sesión)`);
      } else {
        setError(result.error || 'Error al crear coordinador');
      }
      return;
    }
    
    // Para otros roles, usar createUsuario genérico (solo funcionará con mock por ahora)
    const result = await createUsuario(formUsuario);
    
    if (result.success) {
      await loadData();
      setModalUsuario(false);
      setFormUsuario({ nombre: '', apellidos: '', correo: '', telefono: '', documento: '', tipoDocumento: 'cc', contrasena: '', rol: 'docente_aula', institucionId: 1 });
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
      setFormUsuario({ nombre: '', apellidos: '', correo: '', telefono: '', documento: '', tipoDocumento: 'cc', contrasena: '', rol: 'docente_aula', institucionId: 1 });
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

  // Helper para obtener usuarios de una institución
  const getUsuariosInstitucion = (institucionId: number) => {
    return usuarios.filter(u => u.institucionId === institucionId);
  };

  // Helper para obtener el rector de una institución
  const getRectorInstitucion = (institucionId: number) => {
    return usuarios.find(u => u.institucionId === institucionId && u.rol === 'rector');
  };

  // Helper para obtener coordinadores de una institución
  const getCoordinadoresInstitucion = (institucionId: number) => {
    return usuarios.filter(u => u.institucionId === institucionId && u.rol === 'coordinador');
  };

  // Helper para obtener orientadores de una institución
  const getOrientadoresInstitucion = (institucionId: number) => {
    return usuarios.filter(u => u.institucionId === institucionId && u.rol === 'orientador');
  };

  // Helper para obtener docentes de una institución
  const getDocentesInstitucion = (institucionId: number) => {
    return usuarios.filter(u => u.institucionId === institucionId && u.rol === 'docente_aula');
  };

  // Helper para obtener departamento de una institución
  const getDepartamentoInstitucion = (inst: Institucion) => {
    const municipio = municipiosMock.find(m => m.id === inst.municipio_id);
    return municipio ? departamentosMock.find(d => d.id === municipio.departamento_id) : null;
  };

  // Filtrar instituciones por departamento
  const institucionesFiltradas = filtroDepartamentoInst === 'todos' 
    ? instituciones 
    : instituciones.filter(inst => {
        const depto = getDepartamentoInstitucion(inst);
        return depto?.id === filtroDepartamentoInst;
      });

  // Filtrar usuarios por departamento y rol
  const usuariosFiltrados = usuarios.filter(user => {
    // Filtro por rol
    if (filtroRolUsers !== 'todos' && user.rol !== filtroRolUsers) return false;
    
    // Filtro por departamento
    if (filtroDepartamentoUsers !== 'todos') {
      const inst = instituciones.find(i => i.id === user.institucionId);
      if (!inst) return false;
      const depto = getDepartamentoInstitucion(inst);
      if (!depto || depto.id !== filtroDepartamentoUsers) return false;
    }
    
    return true;
  });

  // Obtener departamentos únicos que tienen instituciones
  const departamentosConInstituciones = [...new Set(
    instituciones
      .map(inst => getDepartamentoInstitucion(inst))
      .filter(Boolean)
      .map(d => d!.id)
  )].map(id => departamentosMock.find(d => d.id === id)!).filter(Boolean);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <LoadingSpinner size="lg" />
          <p className="text-slate-500 animate-pulse">Cargando panel administrativo...</p>
        </div>
      </DashboardLayout>
    );
  }

  // Calcular estadísticas reales
  const totalUsuarios = usuarios.length;
  const usuariosActivos = usuarios.filter(u => u.activo).length;
  const totalDocentes = usuarios.filter(u => u.rol === 'docente_aula').length;
  const totalRectores = usuarios.filter(u => u.rol === 'rector').length;

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header con diseño distintivo */}
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-8 text-white shadow-xl">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-teal-500/20 to-transparent rounded-full -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-violet-500/15 to-transparent rounded-full translate-y-1/2 -translate-x-1/3" />
          <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-gradient-to-tr from-emerald-500/10 to-transparent rounded-full -translate-x-1/2 -translate-y-1/2" />
          
          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center shadow-lg shadow-teal-500/40 ring-4 ring-white/10">
                <IconGear className="text-white" size={32} />
              </div>
              <div>
                <p className="text-teal-400 text-sm font-semibold uppercase tracking-wider mb-1">
                  Sistema Cátedra de Familia
                </p>
                <h1 className="text-2xl md:text-3xl font-display font-bold">
                  Panel de Administración
                </h1>
                <p className="text-slate-400 mt-1">
                  Gestión integral de instituciones, usuarios y configuración
                </p>
              </div>
            </div>
            
            {/* Quick actions */}
            <div className="flex gap-3">
              <button 
                onClick={() => setModalInstitucion(true)}
                className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-all flex items-center gap-2 backdrop-blur-sm border border-white/10"
              >
                <IconPlus size={18} />
                Nueva Institución
              </button>
            </div>
          </div>
        </div>

        {/* Stats globales mejorados */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="group bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 p-6 border border-slate-100 hover:border-teal-300 cursor-pointer" onClick={() => setActiveTab('instituciones')}>
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center shadow-lg shadow-teal-200/50 group-hover:scale-110 transition-transform">
                <IconInstitution className="text-white" size={22} />
              </div>
              <span className="text-xs font-semibold text-teal-600 bg-teal-50 px-2 py-1 rounded-full">
                {instituciones.filter(i => i.activo).length} activas
              </span>
            </div>
            <div className="text-3xl font-bold text-slate-800 mb-1">{instituciones.length}</div>
            <div className="text-sm text-slate-500 font-medium">Instituciones Educativas</div>
          </div>
          
          <div className="group bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 p-6 border border-slate-100 hover:border-blue-300 cursor-pointer" onClick={() => setActiveTab('usuarios')}>
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-200/50 group-hover:scale-110 transition-transform">
                <IconUsers className="text-white" size={22} />
              </div>
              <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                {usuariosActivos} activos
              </span>
            </div>
            <div className="text-3xl font-bold text-slate-800 mb-1">{totalUsuarios}</div>
            <div className="text-sm text-slate-500 font-medium">Usuarios Registrados</div>
          </div>
          
          <div className="group bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 p-6 border border-slate-100 hover:border-emerald-300">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-200/50 group-hover:scale-110 transition-transform">
                <IconBook className="text-white" size={22} />
              </div>
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                {totalDocentes} docentes
              </span>
            </div>
            <div className="text-3xl font-bold text-slate-800 mb-1">{cursos.length}</div>
            <div className="text-sm text-slate-500 font-medium">Cursos Activos</div>
          </div>
          
          <div className="group bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 p-6 border border-slate-100 hover:border-violet-300">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-200/50 group-hover:scale-110 transition-transform">
                <IconClipboard className="text-white" size={22} />
              </div>
              <span className="text-xs font-semibold text-violet-600 bg-violet-50 px-2 py-1 rounded-full">
                {totalRectores} rectores
              </span>
            </div>
            <div className="text-3xl font-bold text-slate-800 mb-1">{tareas.length}</div>
            <div className="text-sm text-slate-500 font-medium">Tareas del Sistema</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
            <nav className="flex gap-1 p-2 overflow-x-auto">
              {[
                { id: 'instituciones', label: 'Instituciones', Icon: IconInstitution, count: instituciones.length },
                { id: 'usuarios', label: 'Usuarios', Icon: IconUsers, count: usuarios.length },
                { id: 'reportes', label: 'Reportes', Icon: IconDownload },
                { id: 'configuracion', label: 'Configuración', Icon: IconGear },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`flex items-center gap-2.5 px-5 py-3 rounded-xl font-medium transition-all duration-200 whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-teal-600 text-white shadow-md shadow-teal-200'
                      : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100'
                  }`}
                >
                  <tab.Icon size={18} />
                  {tab.label}
                  {tab.count !== undefined && (
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      activeTab === tab.id 
                        ? 'bg-white/20 text-white' 
                        : 'bg-slate-200 text-slate-600'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Mensaje de error global */}
            {error && (
              <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 animate-shake">
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
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">Instituciones Registradas</h3>
                    <p className="text-sm text-slate-500 mt-1">Gestiona las instituciones educativas del sistema</p>
                  </div>
                  <div className="flex gap-3 flex-wrap">
                    <select 
                      value={filtroDepartamentoInst === 'todos' ? 'todos' : filtroDepartamentoInst}
                      onChange={(e) => setFiltroDepartamentoInst(e.target.value === 'todos' ? 'todos' : Number(e.target.value))}
                      className="px-4 py-2.5 border border-slate-200 rounded-xl bg-white text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 transition-all shadow-sm min-w-[180px]"
                    >
                      <option value="todos">Todos los departamentos</option>
                      {departamentosMock.map(depto => (
                        <option key={depto.id} value={depto.id}>{depto.nombre}</option>
                      ))}
                    </select>
                    <Button onClick={() => setModalInstitucion(true)} className="flex items-center gap-2 shadow-md">
                      <IconPlus size={16} />
                      Nueva Institución
                    </Button>
                  </div>
                </div>
                
                {/* Indicador de filtro activo */}
                {filtroDepartamentoInst !== 'todos' && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-teal-50 border border-teal-200 rounded-xl">
                    <svg className="w-4 h-4 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                    </svg>
                    <span className="text-sm text-teal-700 font-medium">
                      Mostrando {institucionesFiltradas.length} {institucionesFiltradas.length === 1 ? 'institución' : 'instituciones'} de {departamentosMock.find(d => d.id === filtroDepartamentoInst)?.nombre}
                    </span>
                    <button 
                      onClick={() => setFiltroDepartamentoInst('todos')}
                      className="ml-auto text-teal-600 hover:text-teal-800 text-sm font-medium flex items-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Quitar filtro
                    </button>
                  </div>
                )}
                
                {institucionesFiltradas.length === 0 ? (
                  <div className="text-center py-16 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                    <IconInstitution className="mx-auto text-slate-300 mb-4" size={48} />
                    <h4 className="font-semibold text-slate-600 mb-2">
                      {filtroDepartamentoInst !== 'todos' 
                        ? `No hay instituciones en ${departamentosMock.find(d => d.id === filtroDepartamentoInst)?.nombre}`
                        : 'No hay instituciones registradas'
                      }
                    </h4>
                    <p className="text-sm text-slate-500 mb-4">
                      {filtroDepartamentoInst !== 'todos'
                        ? 'Prueba con otro departamento o quita el filtro'
                        : 'Comienza agregando la primera institución educativa'
                      }
                    </p>
                    {filtroDepartamentoInst === 'todos' && (
                      <Button onClick={() => setModalInstitucion(true)} className="flex items-center gap-2 mx-auto">
                        <IconPlus size={16} />
                        Agregar Institución
                      </Button>
                    )}
                  </div>
                ) : (
                <div className="space-y-4">
                  {institucionesFiltradas.map((inst) => {
                    const rector = getRectorInstitucion(inst.id);
                    const coordinadores = getCoordinadoresInstitucion(inst.id);
                    const orientadores = getOrientadoresInstitucion(inst.id);
                    const docentes = getDocentesInstitucion(inst.id);
                    const totalUsuariosInst = getUsuariosInstitucion(inst.id).length;
                    const isExpanded = expandedInstitucion === inst.id;
                    
                    return (
                      <div 
                        key={inst.id} 
                        className={`rounded-xl border-2 overflow-hidden transition-all duration-300 ${
                          isExpanded 
                            ? 'border-teal-300 shadow-lg shadow-teal-100' 
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {/* Card Header - Institución */}
                        <div 
                          className={`p-5 cursor-pointer transition-colors ${
                            isExpanded 
                              ? 'bg-gradient-to-r from-teal-50 to-emerald-50' 
                              : 'bg-white hover:bg-slate-50'
                          }`}
                          onClick={() => setExpandedInstitucion(isExpanded ? null : inst.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center shadow-lg flex-shrink-0">
                                <IconInstitution className="text-white" size={26} />
                              </div>
                              <div className="min-w-0">
                                <div className="font-bold text-lg text-slate-800">{inst.nombre}</div>
                                <div className="text-sm text-slate-500">{inst.direccion_completa || inst.direccion || 'Sin dirección'}</div>
                                <div className="flex items-center gap-3 mt-1.5">
                                  {inst.codigo_dane && (
                                    <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded">DANE: {inst.codigo_dane}</span>
                                  )}
                                  <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                                    inst.naturaleza === 'publica' ? 'bg-emerald-100 text-emerald-700' :
                                    inst.naturaleza === 'privada' ? 'bg-violet-100 text-violet-700' :
                                    'bg-amber-100 text-amber-700'
                                  }`}>
                                    {inst.naturaleza === 'publica' ? 'Pública' : inst.naturaleza === 'privada' ? 'Privada' : 'Mixta'}
                                  </span>
                                  <span className={`px-2 py-0.5 rounded text-xs font-semibold inline-flex items-center gap-1 ${
                                    inst.activo ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                                  }`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${inst.activo ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                                    {inst.activo ? 'Activa' : 'Inactiva'}
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-4">
                              {/* Badges de conteo */}
                              <div className="hidden sm:flex items-center gap-2">
                                <div className="text-center px-3 py-1.5 bg-blue-50 rounded-lg">
                                  <div className="text-lg font-bold text-blue-700">{cursos.filter(c => c.institucionId === inst.id).length}</div>
                                  <div className="text-xs text-blue-600">Cursos</div>
                                </div>
                                <div className="text-center px-3 py-1.5 bg-violet-50 rounded-lg">
                                  <div className="text-lg font-bold text-violet-700">{totalUsuariosInst}</div>
                                  <div className="text-xs text-violet-600">Usuarios</div>
                                </div>
                              </div>
                              
                              {/* Acciones */}
                              <div className="flex items-center gap-1">
                                <button 
                                  onClick={(e) => { e.stopPropagation(); openEditInstitucion(inst); }}
                                  className="p-2.5 text-slate-400 hover:text-teal-600 hover:bg-teal-100 rounded-lg transition-all"
                                  title="Editar institución"
                                >
                                  <IconEdit size={18} />
                                </button>
                                <button 
                                  onClick={(e) => { e.stopPropagation(); handleDeleteInstitucion(inst.id); }}
                                  className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-100 rounded-lg transition-all"
                                  title="Eliminar institución"
                                >
                                  <IconTrash size={18} />
                                </button>
                                <button 
                                  className={`p-2.5 rounded-lg transition-all ${
                                    isExpanded 
                                      ? 'text-teal-600 bg-teal-100' 
                                      : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                                  }`}
                                  title={isExpanded ? 'Cerrar' : 'Ver usuarios'}
                                >
                                  <svg className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Expanded Panel - Usuarios de la institución */}
                        {isExpanded && (
                          <div className="border-t border-teal-200 bg-gradient-to-b from-slate-50 to-white p-5 animate-in slide-in-from-top-2 duration-300">
                            <h4 className="font-semibold text-slate-700 mb-4 flex items-center gap-2">
                              <IconUsers size={18} className="text-slate-500" />
                              Personal de la Institución
                            </h4>
                            
                            {totalUsuariosInst === 0 ? (
                              <div className="text-center py-8 bg-white rounded-xl border-2 border-dashed border-slate-200">
                                <IconUsers className="mx-auto text-slate-300 mb-2" size={36} />
                                <p className="text-slate-500 text-sm">No hay usuarios registrados en esta institución</p>
                                <Button 
                                  size="sm" 
                                  className="mt-3"
                                  onClick={() => {
                                    setFormUsuario({ ...formUsuario, institucionId: inst.id });
                                    setModalUsuario(true);
                                  }}
                                >
                                  <IconPlus size={14} />
                                  Agregar Usuario
                                </Button>
                              </div>
                            ) : (
                              <div className="grid gap-4">
                                {/* Rector */}
                                <div className="bg-white rounded-xl border border-rose-200 p-4">
                                  <div className="flex items-center gap-2 mb-3">
                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-400 to-red-600 flex items-center justify-center">
                                      <span className="text-white text-xs font-bold">R</span>
                                    </div>
                                    <h5 className="font-semibold text-slate-700">Rector</h5>
                                    <span className="text-xs bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full ml-auto">
                                      {rector ? '1 asignado' : 'Sin asignar'}
                                    </span>
                                  </div>
                                  {rector ? (
                                    <div className="flex items-center gap-3 p-3 bg-rose-50 rounded-lg">
                                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-400 to-red-600 flex items-center justify-center text-white font-bold">
                                        {rector.nombre[0]}{rector.apellidos?.[0] || ''}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="font-medium text-slate-800">{rector.nombre} {rector.apellidos}</div>
                                        <div className="text-sm text-slate-500 truncate">{rector.correo || rector.email}</div>
                                      </div>
                                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                        rector.activo ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                                      }`}>
                                        {rector.activo ? 'Activo' : 'Inactivo'}
                                      </span>
                                    </div>
                                  ) : (
                                    <div className="text-center py-4 text-slate-400 text-sm">
                                      No hay rector asignado
                                    </div>
                                  )}
                                </div>
                                
                                {/* Coordinadores */}
                                <div className="bg-white rounded-xl border border-amber-200 p-4">
                                  <div className="flex items-center gap-2 mb-3">
                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center">
                                      <span className="text-white text-xs font-bold">C</span>
                                    </div>
                                    <h5 className="font-semibold text-slate-700">Coordinadores</h5>
                                    <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full ml-auto">
                                      {coordinadores.length} {coordinadores.length === 1 ? 'registrado' : 'registrados'}
                                    </span>
                                  </div>
                                  {coordinadores.length > 0 ? (
                                    <div className="space-y-2">
                                      {coordinadores.map(coord => (
                                        <div key={coord.id} className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg">
                                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center text-white font-bold text-sm">
                                            {coord.nombre[0]}{coord.apellidos?.[0] || ''}
                                          </div>
                                          <div className="flex-1 min-w-0">
                                            <div className="font-medium text-slate-800">{coord.nombre} {coord.apellidos}</div>
                                            <div className="text-sm text-slate-500 truncate">{coord.correo || coord.email}</div>
                                          </div>
                                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            coord.activo ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                                          }`}>
                                            {coord.activo ? 'Activo' : 'Inactivo'}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <div className="text-center py-4 text-slate-400 text-sm">
                                      No hay coordinadores registrados
                                    </div>
                                  )}
                                </div>
                                
                                {/* Orientadores */}
                                <div className="bg-white rounded-xl border border-violet-200 p-4">
                                  <div className="flex items-center gap-2 mb-3">
                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center">
                                      <span className="text-white text-xs font-bold">O</span>
                                    </div>
                                    <h5 className="font-semibold text-slate-700">Orientadores</h5>
                                    <span className="text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full ml-auto">
                                      {orientadores.length} {orientadores.length === 1 ? 'registrado' : 'registrados'}
                                    </span>
                                  </div>
                                  {orientadores.length > 0 ? (
                                    <div className="space-y-2">
                                      {orientadores.map(orient => (
                                        <div key={orient.id} className="flex items-center gap-3 p-3 bg-violet-50 rounded-lg">
                                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                                            {orient.nombre[0]}{orient.apellidos?.[0] || ''}
                                          </div>
                                          <div className="flex-1 min-w-0">
                                            <div className="font-medium text-slate-800">{orient.nombre} {orient.apellidos}</div>
                                            <div className="text-sm text-slate-500 truncate">{orient.correo || orient.email}</div>
                                          </div>
                                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            orient.activo ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                                          }`}>
                                            {orient.activo ? 'Activo' : 'Inactivo'}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <div className="text-center py-4 text-slate-400 text-sm">
                                      No hay orientadores registrados
                                    </div>
                                  )}
                                </div>
                                
                                {/* Docentes */}
                                <div className="bg-white rounded-xl border border-blue-200 p-4">
                                  <div className="flex items-center gap-2 mb-3">
                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center">
                                      <span className="text-white text-xs font-bold">D</span>
                                    </div>
                                    <h5 className="font-semibold text-slate-700">Docentes</h5>
                                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full ml-auto">
                                      {docentes.length} {docentes.length === 1 ? 'registrado' : 'registrados'}
                                    </span>
                                  </div>
                                  {docentes.length > 0 ? (
                                    <div className="grid sm:grid-cols-2 gap-2">
                                      {docentes.slice(0, 6).map(doc => (
                                        <div key={doc.id} className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white font-bold text-xs">
                                            {doc.nombre[0]}{doc.apellidos?.[0] || ''}
                                          </div>
                                          <div className="flex-1 min-w-0">
                                            <div className="font-medium text-slate-800 text-sm">{doc.nombre} {doc.apellidos}</div>
                                            <div className="text-xs text-slate-500 truncate">{doc.correo || doc.email}</div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <div className="text-center py-4 text-slate-400 text-sm">
                                      No hay docentes registrados
                                    </div>
                                  )}
                                  {docentes.length > 6 && (
                                    <div className="mt-3 text-center">
                                      <span className="text-sm text-blue-600 font-medium">
                                        +{docentes.length - 6} docentes más
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                )}
              </div>
            )}

            {/* Tab: Usuarios */}
            {activeTab === 'usuarios' && (
              <div className="space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">Gestión de Usuarios</h3>
                    <p className="text-sm text-slate-500 mt-1">Administra los usuarios del sistema</p>
                  </div>
                  <div className="flex gap-3 flex-wrap">
                    <select 
                      value={filtroDepartamentoUsers === 'todos' ? 'todos' : filtroDepartamentoUsers}
                      onChange={(e) => setFiltroDepartamentoUsers(e.target.value === 'todos' ? 'todos' : Number(e.target.value))}
                      className="px-4 py-2.5 border border-slate-200 rounded-xl bg-white text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 transition-all shadow-sm min-w-[180px]"
                    >
                      <option value="todos">Todos los departamentos</option>
                      {departamentosMock.map(depto => (
                        <option key={depto.id} value={depto.id}>{depto.nombre}</option>
                      ))}
                    </select>
                    <select 
                      value={filtroRolUsers}
                      onChange={(e) => setFiltroRolUsers(e.target.value)}
                      className="px-4 py-2.5 border border-slate-200 rounded-xl bg-white text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 transition-all shadow-sm"
                    >
                      <option value="todos">Todos los roles</option>
                      <option value="rector">Rectores</option>
                      <option value="coordinador">Coordinadores</option>
                      <option value="orientador">Orientadores</option>
                      <option value="docente_aula">Docentes</option>
                      <option value="acudiente">Acudientes</option>
                    </select>
                    <Button onClick={() => {
                      setEditingUsuario(null);
                      // Inicializar con la primera institución disponible
                      const primeraInstitucion = instituciones.length > 0 ? instituciones[0].id : 1;
                      setFormUsuario({ nombre: '', apellidos: '', correo: '', telefono: '', documento: '', tipoDocumento: 'cc', contrasena: '', rol: 'docente_aula', institucionId: primeraInstitucion });
                      setModalUsuario(true);
                    }} className="flex items-center gap-2 shadow-md">
                      <IconPlus size={16} />
                      Nuevo Usuario
                    </Button>
                  </div>
                </div>
                
                {/* Indicador de filtros activos */}
                {(filtroDepartamentoUsers !== 'todos' || filtroRolUsers !== 'todos') && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-xl flex-wrap">
                    <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                    </svg>
                    <span className="text-sm text-blue-700 font-medium">
                      Mostrando {usuariosFiltrados.length} {usuariosFiltrados.length === 1 ? 'usuario' : 'usuarios'}
                      {filtroDepartamentoUsers !== 'todos' && ` de ${departamentosMock.find(d => d.id === filtroDepartamentoUsers)?.nombre}`}
                      {filtroRolUsers !== 'todos' && ` - ${filtroRolUsers === 'docente_aula' ? 'Docentes' : filtroRolUsers.charAt(0).toUpperCase() + filtroRolUsers.slice(1)}${filtroRolUsers !== 'acudiente' ? 'es' : 's'}`}
                    </span>
                    <button 
                      onClick={() => { setFiltroDepartamentoUsers('todos'); setFiltroRolUsers('todos'); }}
                      className="ml-auto text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Quitar filtros
                    </button>
                  </div>
                )}
                
                {usuariosFiltrados.length === 0 ? (
                  <div className="text-center py-16 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                    <IconUsers className="mx-auto text-slate-300 mb-4" size={48} />
                    <h4 className="font-semibold text-slate-600 mb-2">
                      {(filtroDepartamentoUsers !== 'todos' || filtroRolUsers !== 'todos')
                        ? 'No se encontraron usuarios con los filtros seleccionados'
                        : 'No hay usuarios registrados'
                      }
                    </h4>
                    <p className="text-sm text-slate-500 mb-4">
                      {(filtroDepartamentoUsers !== 'todos' || filtroRolUsers !== 'todos')
                        ? 'Prueba con otros filtros o quítalos para ver todos'
                        : 'Comienza agregando el primer usuario'
                      }
                    </p>
                    {filtroDepartamentoUsers === 'todos' && filtroRolUsers === 'todos' && (
                      <Button onClick={() => {
                        const primeraInstitucion = instituciones.length > 0 ? instituciones[0].id : 1;
                        setFormUsuario({ nombre: '', apellidos: '', correo: '', telefono: '', documento: '', tipoDocumento: 'cc', contrasena: '', rol: 'docente_aula', institucionId: primeraInstitucion });
                        setModalUsuario(true);
                      }} className="flex items-center gap-2 mx-auto">
                        <IconPlus size={16} />
                        Agregar Usuario
                      </Button>
                    )}
                  </div>
                ) : (
                <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100/50">
                        <th className="text-left py-4 px-5 font-semibold text-slate-700 text-sm uppercase tracking-wider">Usuario</th>
                        <th className="text-center py-4 px-4 font-semibold text-slate-700 text-sm uppercase tracking-wider">Rol</th>
                        <th className="text-center py-4 px-4 font-semibold text-slate-700 text-sm uppercase tracking-wider">Institución</th>
                        <th className="text-center py-4 px-4 font-semibold text-slate-700 text-sm uppercase tracking-wider">Departamento</th>
                        <th className="text-center py-4 px-4 font-semibold text-slate-700 text-sm uppercase tracking-wider">Estado</th>
                        <th className="text-center py-4 px-4 font-semibold text-slate-700 text-sm uppercase tracking-wider">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {usuariosFiltrados.map((usuario, index) => {
                        const instUsuario = instituciones.find(i => i.id === usuario.institucionId);
                        const deptoUsuario = instUsuario ? getDepartamentoInstitucion(instUsuario) : null;
                        
                        return (
                        <tr key={usuario.id} className={`hover:bg-blue-50/30 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}>
                          <td className="py-4 px-5">
                            <div className="flex items-center gap-4">
                              <div className={`w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md ring-2 ring-white ${
                                usuario.rol === 'docente_aula' ? 'bg-gradient-to-br from-blue-400 to-indigo-600' :
                                usuario.rol === 'orientador' ? 'bg-gradient-to-br from-violet-400 to-purple-600' :
                                usuario.rol === 'coordinador' ? 'bg-gradient-to-br from-amber-400 to-orange-600' :
                                usuario.rol === 'rector' ? 'bg-gradient-to-br from-rose-400 to-red-600' :
                                'bg-gradient-to-br from-teal-400 to-teal-600'
                              }`}>
                                {usuario.nombre[0]}{usuario.apellidos?.[0] || ''}
                              </div>
                              <div className="min-w-0">
                                <div className="font-semibold text-slate-800">{usuario.nombre} {usuario.apellidos}</div>
                                <div className="text-sm text-slate-500 truncate">{usuario.correo || usuario.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="text-center py-4 px-4">
                            <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                              usuario.rol === 'docente_aula' ? 'bg-blue-100 text-blue-700' :
                              usuario.rol === 'orientador' ? 'bg-violet-100 text-violet-700' :
                              usuario.rol === 'coordinador' ? 'bg-amber-100 text-amber-700' :
                              usuario.rol === 'rector' ? 'bg-rose-100 text-rose-700' :
                              usuario.rol === 'acudiente' ? 'bg-cyan-100 text-cyan-700' :
                              'bg-slate-100 text-slate-700'
                            }`}>
                              {usuario.rol === 'docente_aula' ? 'Docente' : 
                               usuario.rol === 'orientador' ? 'Orientador' :
                               usuario.rol === 'coordinador' ? 'Coordinador' :
                               usuario.rol === 'rector' ? 'Rector' : 
                               usuario.rol === 'acudiente' ? 'Acudiente' : usuario.rol}
                            </span>
                          </td>
                          <td className="text-center py-4 px-4 text-slate-600">
                            <span className="text-sm font-medium">
                              {instUsuario?.nombre?.slice(0, 20) || 'Sin asignar'}
                              {(instUsuario?.nombre?.length || 0) > 20 ? '...' : ''}
                            </span>
                          </td>
                          <td className="text-center py-4 px-4">
                            {deptoUsuario ? (
                              <span className="text-sm font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                                {deptoUsuario.nombre}
                              </span>
                            ) : (
                              <span className="text-xs text-slate-400">-</span>
                            )}
                          </td>
                          <td className="text-center py-4 px-4">
                            <span className={`px-3 py-1.5 rounded-full text-xs font-semibold inline-flex items-center gap-1.5 ${
                              usuario.activo ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                            }`}>
                              <span className={`w-2 h-2 rounded-full ${usuario.activo ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                              {usuario.activo ? 'Activo' : 'Inactivo'}
                            </span>
                          </td>
                          <td className="text-center py-4 px-4">
                            <div className="flex justify-center gap-1">
                              <button 
                                onClick={() => openEditUsuario(usuario)}
                                className="p-2.5 text-slate-400 hover:text-teal-600 hover:bg-teal-100 rounded-lg transition-all hover:scale-105"
                                title="Editar usuario"
                              >
                                <IconEdit size={18} />
                              </button>
                              <button 
                                onClick={() => handleDeleteUsuario(usuario.id)}
                                className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-100 rounded-lg transition-all hover:scale-105"
                                title="Eliminar usuario"
                              >
                                <IconTrash size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                )}
              </div>
            )}

            {/* Tab: Reportes */}
            {activeTab === 'reportes' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-800">Exportar Reportes</h3>
                  <p className="text-sm text-slate-500 mt-1">Descarga reportes en formato Excel o PDF</p>
                </div>
                
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
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-800">Configuración del Sistema</h3>
                </div>
                
                {/* Período académico y Grados en la primera fila */}
                <div className="grid md:grid-cols-2 gap-6">
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
          setFormUsuario({ nombre: '', apellidos: '', correo: '', telefono: '', documento: '', tipoDocumento: 'cc', contrasena: '', rol: 'docente_aula', institucionId: 1 });
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

          {(formUsuario.rol === 'rector' || formUsuario.rol === 'coordinador') && (
            <FormFieldInput
              name="contrasena"
              label="Contraseña"
              type="password"
              placeholder="Mínimo 8 caracteres, mayúscula, minúscula, número y símbolo"
              value={formUsuario.contrasena}
              onChange={(e) => setFormUsuario({ ...formUsuario, contrasena: e.target.value })}
              required
            />
          )}

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
            label={`Teléfono${(formUsuario.rol === 'rector' || formUsuario.rol === 'coordinador') ? ' (requerido, 10 dígitos)' : ''}`}
            placeholder="3001234567"
            value={formUsuario.telefono}
            onChange={(e) => setFormUsuario({ ...formUsuario, telefono: e.target.value })}
            required={formUsuario.rol === 'rector' || formUsuario.rol === 'coordinador'}
          />
          
          {/* Campo de contraseña - solo visible para rector y coordinador */}
          {(formUsuario.rol === 'rector' || formUsuario.rol === 'coordinador') && (
            <FormFieldInput
              name="contrasena"
              label="Contraseña inicial"
              type="password"
              placeholder="Mínimo 8 caracteres, incluir mayúscula, minúscula, número y símbolo"
              value={formUsuario.contrasena}
              onChange={(e) => setFormUsuario({ ...formUsuario, contrasena: e.target.value })}
              required
            />
          )}
          
          {/* Mensaje informativo sobre contraseña */}
          {(formUsuario.rol === 'rector' || formUsuario.rol === 'coordinador') && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
              <div className="flex items-start gap-2">
                <svg className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-amber-800">Requisitos de contraseña:</p>
                  <ul className="text-xs text-amber-700 mt-1 space-y-0.5">
                    <li>• Mínimo 8 caracteres</li>
                    <li>• Al menos 1 letra minúscula</li>
                    <li>• Al menos 1 letra mayúscula</li>
                    <li>• Al menos 1 número</li>
                    <li>• Al menos 1 carácter especial (!@#$%^&*)</li>
                  </ul>
                  <p className="text-xs text-amber-600 mt-2 font-medium">El usuario deberá cambiar esta contraseña en su primer inicio de sesión.</p>
                </div>
              </div>
            </div>
          )}

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
                {/* Mostrar todas las instituciones - el filtro de rectores se habilitará cuando el backend tenga /usuarios */}
                {instituciones.length === 0 ? (
                  <option value="">No hay instituciones disponibles</option>
                ) : (
                  instituciones.map(inst => (
                    <option key={inst.id} value={inst.id}>{inst.nombre}</option>
                  ))
                )}
              </select>
              {(formUsuario.rol === 'rector' || formUsuario.rol === 'coordinador') && (
                <p className="text-xs text-teal-600 mt-1">
                  ℹ️ Se creará con contraseña temporal que deberá cambiar en su primer inicio de sesión
                </p>
              )}
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" onClick={() => {
              setModalUsuario(false);
              setEditingUsuario(null);
              setFormUsuario({ nombre: '', apellidos: '', correo: '', telefono: '', documento: '', tipoDocumento: 'cc', contrasena: '', rol: 'docente_aula', institucionId: 1 });
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
    </DashboardLayout>
  );
}
