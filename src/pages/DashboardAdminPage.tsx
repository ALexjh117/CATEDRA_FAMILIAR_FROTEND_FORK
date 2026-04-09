import { useState, useEffect } from 'react';

import Swal from 'sweetalert2';

import { useLocation } from 'react-router-dom';

import { getSession } from '../api/endpoints';

import { 
  getInstituciones, 
  getCursos, 
  getTareas,
  createInstitucion,
  createInstitucionCompleta,
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
  getMunicipios,
  crearDocente
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

// Icono de lupa reutilizable
const IconSearch = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 0 5 11a6 6 0 0 0 12 0z" />
  </svg>
);

const IconX = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

export default function DashboardAdminPage() {
  getSession();

  const tieneRector = (institucionId: number) => {
    return usuarios.some(u => u.rol === 'rector' && u.institucionId === institucionId);
  };

  const [loading, setLoading] = useState(true);
  const [instituciones, setInstituciones] = useState<Institucion[]>([]);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [periodos, setPeriodos] = useState<Periodo[]>([]);
  const [grados, setGrados] = useState<Grado[]>([]);
  const [activeTab, setActiveTab] = useState<'instituciones' | 'usuarios' | 'reportes' | 'configuracion'>('instituciones');

  const [expandedInstitucion, setExpandedInstitucion] = useState<number | null>(null);

  // Estados de filtros
  const [filtroDepartamentoInst, setFiltroDepartamentoInst] = useState<number | 'todos'>('todos');
  const [filtroDepartamentoUsers, setFiltroDepartamentoUsers] = useState<number | 'todos'>('todos');
  const [filtroRolUsers, setFiltroRolUsers] = useState<string>('todos');

  // ✅ NUEVOS: Estados de búsqueda por texto
  const [busquedaInst, setBusquedaInst] = useState('');
  const [busquedaUsers, setBusquedaUsers] = useState('');

  const [tipoReporte, setTipoReporte] = useState<'general' | 'instituciones' | 'usuarios' | 'actividad'>('general');
  const [loadingReport, setLoadingReport] = useState(false);

  const [modalInstitucion, setModalInstitucion] = useState(false);
  const [modalInstitucionCompleta, setModalInstitucionCompleta] = useState(false);
  const [modalUsuario, setModalUsuario] = useState(false);
  const [modalPeriodo, setModalPeriodo] = useState(false);
  const [modalGrado, setModalGrado] = useState(false);
  const [modalCurso, setModalCurso] = useState(false);

  const [catalogos, setCatalogos] = useState({
    municipios: [],
    nivelesEducativos: {
      predeterminados: [],
      personalizados: []
    },
    modalidades: [],
    jornadas: [],
    naturaleza: []
  });
  const [nivelesEducativosCombinados, setNivelesEducativosCombinados] = useState([]);
  const [loadingCatalogos, setLoadingCatalogos] = useState(false);
  const [pasoActualFormulario, setPasoActualFormulario] = useState(1);

  const [estructuraAcademica, setEstructuraAcademica] = useState({
    nivelesSeleccionados: [],
    gradosGenerados: [],
    cursosPorGrado: {},
    loadingGrados: false,
    loadingCursos: false,
    cursosExistentes: null as any
  });

  const [modalNivelEducativo, setModalNivelEducativo] = useState(false);
  const [formNivelEducativo, setFormNivelEducativo] = useState({
    nombre: '',
    descripcion: '',
    abreviatura: '',
    orden: 1,
    institucionId: 1
  });

  const [formInstitucion, setFormInstitucion] = useState({ 
    nombre: '', 
    naturaleza: 'publica' as 'publica' | 'privada',
    municipioId: 1,
    telefono: '',
    correo: '',
    direccion: '',
    codigoDane: '',
    nit: '',
    telefonoPrincipal: '',
    telefonoSecretaria: '',
    correoInstitucional: '',
    correoRectoria: '',
    sitioWeb: '',
    direccionCompleta: '',
    barrio: '',
    estrato: 3,
    coordenadasGps: '',
    capacidadEstudiantes: 0,
    anoFundacion: new Date().getFullYear(),
    enfoquePedagogico: '',
    confesional: false,
    religion: '',
    rectorNombre: '',
    rectorDocumento: '',
    rectorTelefono: '',
    rectorCorreo: '',
    nivelesEducativos: [] as string[],
    modalidad: 'academica' as string,
    jornadas: [] as string[],
    resolucionAprobacion: '',
    nivelesEducativosBackend: [] as unknown[],
    modalidadBackend: null as string | null,
    jornadasBackend: [] as string[]
  });

  const [formUsuario, setFormUsuario] = useState<{ nombre: string; apellidos: string; correo: string; telefono: string; documento: string; tipoDocumento: string; contrasena: string; rol: 'admin' | 'rector' | 'coordinador' | 'orientador' | 'docente_aula' | 'acudiente'; institucionId: number; telefonoEmergencia?: string; personaEmergencia?: string; direccion?: string; esDirectorGrado?: boolean; gradoAsignado?: string; areaQueOrienta?: string; centroInteres?: string }>({ nombre: '', apellidos: '', correo: '', telefono: '', documento: '', tipoDocumento: 'cc', contrasena: '', rol: 'docente_aula', institucionId: 1, telefonoEmergencia: '', personaEmergencia: '', direccion: '', esDirectorGrado: false, gradoAsignado: '', areaQueOrienta: '', centroInteres: '' });
  const [formPeriodo, setFormPeriodo] = useState<{ nombre: string; fechaInicio: string; fechaFin: string; institucionId: number; anio: number; estado: 'planificado' | 'activo' | 'cerrado' }>({ nombre: '', fechaInicio: '', fechaFin: '', institucionId: 1, anio: new Date().getFullYear(), estado: 'planificado' });
  const [formGrado, setFormGrado] = useState({ nombre: '', orden: 0, institucionId: 1 });
  const [formCurso, setFormCurso] = useState<{ nombre: string; gradoId: number; jornada: 'mañana' | 'tarde' | 'completa'; institucionId: number; docenteDirectorId: number | undefined }>({ nombre: '', gradoId: 1, jornada: 'mañana', institucionId: 1, docenteDirectorId: undefined });

  const [editingInstitucion, setEditingInstitucion] = useState<Institucion | null>(null);
  const [editingUsuario, setEditingUsuario] = useState<Usuario | null>(null);
  const [editingPeriodo, setEditingPeriodo] = useState<Periodo | null>(null);
  const [editingGrado, setEditingGrado] = useState<Grado | null>(null);
  const [editingCurso, setEditingCurso] = useState<Curso | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const bypassValidations = isBypassValidationsEnabled();
  const location = useLocation();

  useEffect(() => {
    try {
      const params = new URLSearchParams(location.search);
      const tab = params.get('tab');
      if (tab === 'instituciones' || tab === 'usuarios' || tab === 'reportes' || tab === 'configuracion') {
        setActiveTab(tab as any);
      }
    } catch (e) {}
  }, [location.search]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [institucionesData, cursosData, tareasData, usuariosData, periodosData, gradosData] = await Promise.all([
        getInstituciones(),
        getCursos(),
        getTareas(),
        getUsuarios(),
        getPeriodos(),
        getGrados()
      ]);

      console.log('📊 [DashboardAdminPage] Datos cargados:', {
        instituciones: institucionesData.length,
        cursos: cursosData.length,
        tareas: tareasData.length,
        usuarios: usuariosData.length,
        periodos: periodosData.length,
        grados: gradosData.length
      });

      setInstituciones(Array.isArray(institucionesData) ? institucionesData : []);
      setCursos(Array.isArray(cursosData) ? cursosData : []);
      setTareas(Array.isArray(tareasData) ? tareasData : []);
      setUsuarios(Array.isArray(usuariosData) ? usuariosData : []);
      setPeriodos(Array.isArray(periodosData) ? periodosData : []);
      setGrados(Array.isArray(gradosData) ? gradosData : []);
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
        exportEstadisticasToPDF(estadisticas, 'Reporte_General_Sistema', 'Reporte General del Sistema - Cátedra de Familia');
      } else {
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

  const [creatingInstitucion, setCreatingInstitucion] = useState(false);

  const [formInstitucionCompleta, setFormInstitucionCompleta] = useState({
    institucion: {
      nombre: '',
      naturaleza: 'privada',
      municipioId: 1,
      codigoDane: '',
      nit: '',
      telefono: '',
      correo: '',
      direccion: '',
      telefonoPrincipal: '',
      telefonoSecretaria: '',
      correoInstitucional: '',
      correoRectoria: '',
      sitioWeb: '',
      direccionCompleta: '',
      barrio: '',
      estrato: 4,
      coordenadasGps: '',
      capacidadEstudiantes: 300,
      anoFundacion: new Date().getFullYear(),
      enfoquePedagogico: '',
      confesional: false,
      religion: '',
      rectorNombre: '',
      rectorDocumento: '',
      rectorTelefono: '',
      rectorCorreo: '',
      rectorContrasena: '',
      jornadas: [] as string[],
      modalidad: 'academica',
      nivelesEducativos: [] as string[]
    },
    grados: [] as Array<{
      nombre: string;
      orden: number;
      cursos: Array<{ nombre: string; jornada: string; }>;
    }>
  });

  const handleCreateInstitucionCompleta = async () => {
    setCreatingInstitucion(true);
    try {
      const result = await createInstitucionCompleta(formInstitucionCompleta);
      if (result.success) {
        await Swal.fire({ icon: 'success', title: '¡Institución Creada!', text: 'La institución, sus grados y cursos han sido creados exitosamente.', confirmButtonText: '¡Perfecto!' });
        try {
          const rectorCorreo = (result as any)?.data?.data?.rector?.correo || (result as any)?.data?.rector?.correo;
          const contrasenaUsada = formInstitucionCompleta.institucion.rectorContrasena?.trim() || 'Temp123456';
          if (rectorCorreo) {
            await Swal.fire({ icon: 'info', title: 'Credenciales del Rector', html: `<div style="text-align:left"><p><b>Correo:</b> ${rectorCorreo}</p><p><b>Contraseña:</b> ${contrasenaUsada}</p></div>`, confirmButtonText: 'Entendido' });
          }
        } catch (e) {}
        setFormInstitucionCompleta({ institucion: { nombre: '', naturaleza: 'privada', municipioId: 1, codigoDane: '', nit: '', telefono: '', correo: '', direccion: '', telefonoPrincipal: '', telefonoSecretaria: '', correoInstitucional: '', correoRectoria: '', sitioWeb: '', direccionCompleta: '', barrio: '', estrato: 4, coordenadasGps: '', capacidadEstudiantes: 300, anoFundacion: new Date().getFullYear(), enfoquePedagogico: '', confesional: false, religion: '', rectorNombre: '', rectorDocumento: '', rectorTelefono: '', rectorCorreo: '', rectorContrasena: '', jornadas: [], modalidad: 'academica', nivelesEducativos: [] }, grados: [] });
        await loadData();
      } else {
        await Swal.fire({ icon: 'error', title: 'Error', text: result.error || 'No se pudo crear la institución completa', confirmButtonText: 'Entendido' });
      }
    } catch (error: any) {
      await Swal.fire({ icon: 'error', title: 'Error de Conexión', text: 'No se pudo conectar con el servidor', confirmButtonText: 'Entendido' });
    } finally {
      setCreatingInstitucion(false);
    }
  };

  const agregarGradoCompleto = () => {
    setFormInstitucionCompleta(prev => ({ ...prev, grados: [...prev.grados, { nombre: '', orden: prev.grados.length + 1, cursos: [] }] }));
  };
  const eliminarGradoCompleto = (index: number) => {
    setFormInstitucionCompleta(prev => ({ ...prev, grados: prev.grados.filter((_, i) => i !== index) }));
  };
  const actualizarGradoCompleto = (index: number, campo: string, valor: any) => {
    setFormInstitucionCompleta(prev => ({ ...prev, grados: prev.grados.map((grado, i) => i === index ? { ...grado, [campo]: valor } : grado) }));
  };
  const agregarCursoCompleto = (gradoIndex: number) => {
    setFormInstitucionCompleta(prev => ({ ...prev, grados: prev.grados.map((grado, i) => i === gradoIndex ? { ...grado, cursos: [...grado.cursos, { nombre: '', jornada: 'manana' }] } : grado) }));
  };
  const eliminarCursoCompleto = (gradoIndex: number, cursoIndex: number) => {
    setFormInstitucionCompleta(prev => ({ ...prev, grados: prev.grados.map((grado, i) => i === gradoIndex ? { ...grado, cursos: grado.cursos.filter((_, j) => j !== cursoIndex) } : grado) }));
  };
  const actualizarCursoCompleto = (gradoIndex: number, cursoIndex: number, campo: string, valor: any) => {
    setFormInstitucionCompleta(prev => ({ ...prev, grados: prev.grados.map((grado, i) => i === gradoIndex ? { ...grado, cursos: grado.cursos.map((curso, j) => j === cursoIndex ? { ...curso, [campo]: valor } : curso) } : grado) }));
  };
  const actualizarInstitucion = (campo: string, valor: any) => {
    setFormInstitucionCompleta(prev => ({ ...prev, institucion: { ...prev.institucion, [campo]: valor } }));
  };
  const toggleJornada = (jornada: string) => {
    setFormInstitucionCompleta(prev => ({ ...prev, institucion: { ...prev.institucion, jornadas: prev.institucion.jornadas.includes(jornada) ? prev.institucion.jornadas.filter(j => j !== jornada) : [...prev.institucion.jornadas, jornada] } }));
  };
  const toggleNivelEducativo = (nivel: string) => {
    setFormInstitucionCompleta(prev => ({ ...prev, institucion: { ...prev.institucion, nivelesEducativos: prev.institucion.nivelesEducativos.includes(nivel) ? prev.institucion.nivelesEducativos.filter(n => n !== nivel) : [...prev.institucion.nivelesEducativos, nivel] } }));
  };

  const loadCatalogos = async () => {
    setLoadingCatalogos(true);
    try {
      const session = getSession();
      try {
        const municipiosResponse = await fetch(`/api/municipios`, { headers: { 'Authorization': `Bearer ${session?.token}`, 'Content-Type': 'application/json' } });
        if (municipiosResponse.ok) {
          const result = await municipiosResponse.json();
          let municipiosData = [];
          if (result.data) {
            if (Array.isArray(result.data)) municipiosData = result.data;
            else if (result.data.data && Array.isArray(result.data.data)) municipiosData = result.data.data;
            else if (result.data.municipios && Array.isArray(result.data.municipios)) municipiosData = result.data.municipios;
          }
          if (municipiosData.length > 0) {
            setCatalogos(prev => ({ ...prev, municipios: municipiosData }));
          } else {
            setCatalogos(prev => ({ ...prev, municipios: [{ id: 1, nombre: "Bogotá D.C." }, { id: 2, nombre: "Medellín" }, { id: 3, nombre: "Cali" }, { id: 4, nombre: "Barranquilla" }, { id: 5, nombre: "Bucaramanga" }] }));
          }
        } else {
          setCatalogos(prev => ({ ...prev, municipios: [{ id: 1, nombre: "Bogotá D.C." }, { id: 2, nombre: "Medellín" }, { id: 3, nombre: "Cali" }, { id: 4, nombre: "Barranquilla" }, { id: 5, nombre: "Bucaramanga" }] }));
        }
      } catch (error) {
        setCatalogos(prev => ({ ...prev, municipios: [{ id: 1, nombre: "Bogotá D.C." }, { id: 2, nombre: "Medellín" }, { id: 3, nombre: "Cali" }, { id: 4, nombre: "Barranquilla" }, { id: 5, nombre: "Bucaramanga" }] }));
      }

      const mockNiveles = {
        predeterminados: [
          { id: 0, nombre: "Preescolar", descripcion: "Transición y jardín", abreviatura: "PRE", orden: 1, esPredeterminado: true },
          { id: 0, nombre: "Primaria", descripcion: "Básica Primaria (1°-5°)", abreviatura: "PRI", orden: 2, esPredeterminado: true },
          { id: 0, nombre: "Secundaria", descripcion: "Básica Secundaria (6°-9°)", abreviatura: "SEC", orden: 3, esPredeterminado: true },
          { id: 0, nombre: "Media Técnica", descripcion: "Educación Media (10°-11°)", abreviatura: "MED", orden: 4, esPredeterminado: true }
        ],
        personalizados: []
      };

      setCatalogos(prev => ({
        ...prev,
        nivelesEducativos: mockNiveles,
        modalidades: [{ id: "academica", nombre: "Académica" }, { id: "tecnica", nombre: "Técnica" }, { id: "artistica", nombre: "Artística" }, { id: "deportiva", nombre: "Deportiva" }, { id: "rural", nombre: "Rural" }, { id: "bilingue", nombre: "Bilingüe" }, { id: "integral", nombre: "Integral" }],
        jornadas: [{ id: "manana", nombre: "Mañana" }, { id: "tarde", nombre: "Tarde" }, { id: "noche", nombre: "Noche" }, { id: "unica", nombre: "Única" }, { id: "completa", nombre: "Completa" }, { id: "fin_semana", nombre: "Fin de Semana" }],
        naturaleza: [{ id: "publica", nombre: "Pública" }, { id: "privada", nombre: "Privada" }]
      }));

      const combinados = mockNiveles.predeterminados.map(n => ({ ...n, tipo: 'predeterminado' }));
      setNivelesEducativosCombinados(combinados);
    } catch (error) {
      console.error('[DEBUG][Catalogos] Error general:', error);
    } finally {
      setLoadingCatalogos(false);
    }
  };

  const handleCreateNivelEducativo = async () => {
    try {
      const session = getSession();
      const response = await fetch(`/api/grados`, { method: 'POST', headers: { 'Authorization': `Bearer ${session?.token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ institucionId: 1, ...formNivelEducativo }) });
      const result = await response.json();
      if (result.success) {
        await loadCatalogos();
        setModalNivelEducativo(false);
        setFormNivelEducativo({ nombre: '', descripcion: '', abreviatura: '', orden: 1, institucionId: 1 });
      }
    } catch (error) { console.error('[DEBUG][NivelEducativo] Error:', error); }
  };

  const handleOpenCreateNivel = () => {
    setFormNivelEducativo({ nombre: '', descripcion: '', abreviatura: '', orden: (nivelesEducativosCombinados.length || 0) + 1, institucionId: 1 });
    setModalNivelEducativo(true);
  };

  const generarGradosParaNiveles = async () => {
    setEstructuraAcademica(prev => ({ ...prev, loadingGrados: true }));
    try {
      const session = getSession();
      const nivelesIds = formInstitucion.nivelesEducativos || [];
      const gradosPromises = nivelesIds.map(async (nivelId) => {
        const response = await fetch(`/api/estructura-academica/generar-grados`, { method: 'POST', headers: { 'Authorization': `Bearer ${session?.token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ nivelEducativoId: nivelId, institucionId: 1 }) });
        const result = await response.json();
        return { nivelId, nivel: nivelesEducativosCombinados.find(n => (n.id || n.nombre) === nivelId)?.nombre || nivelId, grados: result.success ? result.data.gradosCreados : [] };
      });
      const resultados = await Promise.all(gradosPromises);
      setEstructuraAcademica(prev => ({ ...prev, gradosGenerados: resultados, loadingGrados: false }));
    } catch (error) {
      setEstructuraAcademica(prev => ({ ...prev, loadingGrados: false }));
    }
  };

  const obtenerSugerenciasCursos = async (gradoId: number) => {
    try {
      const session = getSession();
      const response = await fetch(`/api/estructura-academica/sugerir-cursos/${gradoId}`, { headers: { 'Authorization': `Bearer ${session?.token}`, 'Content-Type': 'application/json' } });
      const result = await response.json();
      if (result.success) {
        setEstructuraAcademica(prev => ({ ...prev, cursosPorGrado: { ...prev.cursosPorGrado, [gradoId]: { sugerencias: result.data.sugerencias, seleccionados: result.data.sugerencias.slice(0, 2) } } }));
      }
    } catch (error) { console.error('[DEBUG][Estructura] Error:', error); }
  };

  const generarGradosParaNivel = async (nivelId: string | number) => {
    try {
      const session = getSession();
      const institucionIdReal = session?.user?.institucionId || 1;
      const nivelGradosMap: Record<string, string[]> = { 'PRE': ['Transición', 'Jardín'], 'PRI': ['1°', '2°', '3°', '4°', '5°'], 'SEC': ['6°', '7°', '8°', '9°'], 'MED': ['10°', '11°'], 'Preescolar': ['Transición', 'Jardín'], 'Primaria': ['1°', '2°', '3°', '4°', '5°'], 'Secundaria': ['6°', '7°', '8°', '9°'], 'Media Técnica': ['10°', '11°'] };
      const nivel = nivelesEducativosCombinados.find(n => (n.id || n.nombre) === nivelId);
      const nivelKey = nivel?.abreviatura || nivel?.nombre || String(nivelId);
      const gradosParaGenerar = nivelGradosMap[nivelKey] || [];
      if (gradosParaGenerar.length === 0) return;
      const gradosCreadosBD = [];
      for (const [index, nombreGrado] of gradosParaGenerar.entries()) {
        try {
          const response = await fetch(`/api/grados`, { method: 'POST', headers: { 'Authorization': `Bearer ${session?.token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ nombre: nombreGrado, orden: index + 1, institucionId: institucionIdReal }) });
          const result = await response.json();
          if (result.success && result.data) gradosCreadosBD.push({ id: result.data.id, nombre: result.data.nombre, orden: result.data.orden });
        } catch (error) { console.error('[ERROR] Error creando grado:', nombreGrado, error); }
      }
      const gradosCreados = gradosCreadosBD.length > 0 ? gradosCreadosBD : gradosParaGenerar.map((nombreGrado, index) => ({ id: index + 1, nombre: nombreGrado, orden: index + 1 }));
      const nuevoGrado = { nivelId, nivel: nivel?.nombre || nivelId, grados: gradosCreados };
      setEstructuraAcademica(prev => ({ ...prev, gradosGenerados: [...prev.gradosGenerados.filter(g => g.nivelId !== nivelId), nuevoGrado] }));
      if (gradosCreadosBD.length > 0) {
        await Swal.fire({ icon: 'success', title: 'Grados Creados', text: `Se han creado ${gradosCreadosBD.length} grados en la base de datos`, confirmButtonText: '¡Perfecto!' });
      }
    } catch (error) {
      await Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudieron crear los grados.', confirmButtonText: 'Entendido' });
    }
  };

  const agregarCursoSugerido = (gradoId: number) => {
    const current = estructuraAcademica.cursosPorGrado[gradoId];
    if (current) {
      setEstructuraAcademica(prev => ({ ...prev, cursosPorGrado: { ...prev.cursosPorGrado, [gradoId]: { ...current, seleccionados: [...current.seleccionados, { nombre: `${current.seleccionados.length + 1}A`, jornada: 'mañana' }] } } }));
    }
  };

  const agregarCursoDesdeSugerencia = (gradoId: number, sugerencia: any) => {
    const current = estructuraAcademica.cursosPorGrado[gradoId];
    if (current && !current.seleccionados.some(c => c.nombre === sugerencia.nombre)) {
      setEstructuraAcademica(prev => ({ ...prev, cursosPorGrado: { ...prev.cursosPorGrado, [gradoId]: { ...current, seleccionados: [...current.seleccionados, sugerencia] } } }));
    }
  };

  const actualizarNombreCurso = (gradoId: number, cursoIndex: number, nuevoNombre: string) => {
    const current = estructuraAcademica.cursosPorGrado[gradoId];
    if (current) {
      const actualizados = [...current.seleccionados];
      actualizados[cursoIndex] = { ...actualizados[cursoIndex], nombre: nuevoNombre };
      setEstructuraAcademica(prev => ({ ...prev, cursosPorGrado: { ...prev.cursosPorGrado, [gradoId]: { ...current, seleccionados: actualizados } } }));
    }
  };

  const actualizarJornadaCurso = (gradoId: number, cursoIndex: number, nuevaJornada: string) => {
    const current = estructuraAcademica.cursosPorGrado[gradoId];
    if (current) {
      const actualizados = [...current.seleccionados];
      actualizados[cursoIndex] = { ...actualizados[cursoIndex], jornada: nuevaJornada };
      setEstructuraAcademica(prev => ({ ...prev, cursosPorGrado: { ...prev.cursosPorGrado, [gradoId]: { ...current, seleccionados: actualizados } } }));
    }
  };

  const eliminarCurso = (gradoId: number, cursoIndex: number) => {
    const current = estructuraAcademica.cursosPorGrado[gradoId];
    if (current) {
      setEstructuraAcademica(prev => ({ ...prev, cursosPorGrado: { ...prev.cursosPorGrado, [gradoId]: { ...current, seleccionados: current.seleccionados.filter((_, index) => index !== cursoIndex) } } }));
    }
  };

  const cargarCursosExistentes = async () => {
    try {
      const session = getSession();
      const institucionIdReal = session?.user?.institucionId || 1;
      const datos = await cargarCursosPorGrado(institucionIdReal);
      if (datos) setEstructuraAcademica(prev => ({ ...prev, cursosExistentes: datos }));
    } catch (error) { console.error('[ERROR] Error cargando cursos existentes:', error); }
  };

  const cargarCursosPorGrado = async (institucionId: number) => {
    try {
      const session = getSession();
      const response = await fetch(`/api/estructura-academica/cursos-por-grado/${institucionId}`, { headers: { 'Authorization': `Bearer ${session?.token}`, 'Content-Type': 'application/json' } });
      const result = await response.json();
      return result.success ? result.data : null;
    } catch (error) { return null; }
  };

  const crearCursoParaGrado = async (gradoId: number, nombreCurso: string, jornada: string) => {
    try {
      const session = getSession();
      const institucionIdReal = session?.user?.institucionId || 1;
      const response = await fetch(`/api/estructura-academica/generar-cursos`, { method: 'POST', headers: { 'Authorization': `Bearer ${session?.token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ gradoId, institucionId: institucionIdReal, cursos: [{ nombre: nombreCurso, jornada }] }) });
      const result = await response.json();
      if (result.success) { await cargarCursosExistentes(); return true; }
      return false;
    } catch (error) { return false; }
  };

  const crearCursosParaGrados = async () => {
    setEstructuraAcademica(prev => ({ ...prev, loadingCursos: true }));
    try {
      const session = getSession();
      const institucionIdReal = session?.user?.institucionId || 1;
      const cursosPromises = Object.entries(estructuraAcademica.cursosPorGrado).map(async ([gradoId, config]) => {
        if (config.seleccionados && config.seleccionados.length > 0) {
          const response = await fetch(`/api/estructura-academica/generar-cursos`, { method: 'POST', headers: { 'Authorization': `Bearer ${session?.token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ gradoId: parseInt(gradoId), institucionId: institucionIdReal, cursos: config.seleccionados }) });
          return response.json();
        }
        return null;
      });
      await Promise.all(cursosPromises);
    } catch (error) { console.error('[DEBUG][Estructura] Error creando cursos:', error); }
    finally { setEstructuraAcademica(prev => ({ ...prev, loadingCursos: false })); }
  };

  const handleCreateInstitucion = async () => {
    setCreatingInstitucion(true);
    setError(null);
    const result = await createInstitucion(formInstitucion);
    if (result.success) {
      if (estructuraAcademica.cursosPorGrado && Object.keys(estructuraAcademica.cursosPorGrado).length > 0) await crearCursosParaGrados();
      await loadData();
      setModalInstitucion(false);
      setFormInstitucion({ nombre: '', naturaleza: 'publica', municipioId: 1, telefono: '', correo: '', direccion: '', codigoDane: '', nit: '', telefonoPrincipal: '', telefonoSecretaria: '', correoInstitucional: '', correoRectoria: '', sitioWeb: '', direccionCompleta: '', barrio: '', estrato: 3, coordenadasGps: '', capacidadEstudiantes: 0, anoFundacion: new Date().getFullYear(), enfoquePedagogico: '', confesional: false, religion: '', rectorNombre: '', rectorDocumento: '', rectorTelefono: '', rectorCorreo: '', nivelesEducativos: [], modalidad: 'academica', jornadas: [], resolucionAprobacion: '', nivelesEducativosBackend: [], modalidadBackend: null, jornadasBackend: [] });
      setSuccess('Institución creada exitosamente');
    } else { setError(result.error || 'Error al crear institución'); }
    setCreatingInstitucion(false);
  };

  const handleUpdateInstitucion = async () => {
    if (!editingInstitucion) return;
    setError(null);
    const result = await updateInstitucion(editingInstitucion.id, formInstitucion);
    if (result.success) {
      await loadData();
      setModalInstitucion(false);
      setEditingInstitucion(null);
    } else { setError(result.error || 'Error al actualizar institución'); }
  };

  const handleDeleteInstitucion = async (id: number) => {
    if (!confirm('¿Está seguro de eliminar esta institución?')) return;
    const result = await deleteInstitucion(id);
    if (result.success) await loadData();
    else setError(result.error || 'Error al eliminar institución');
  };

  const siguientePaso = () => {
    if (pasoActualFormulario < 5) {
      const nuevoPaso = pasoActualFormulario + 1;
      setPasoActualFormulario(nuevoPaso);
      if (nuevoPaso === 5) cargarCursosExistentes();
    }
  };
  const pasoAnterior = () => { if (pasoActualFormulario > 1) setPasoActualFormulario(pasoActualFormulario - 1); };
  const irAPaso = (paso: number) => { if (paso >= 1 && paso <= 5) { setPasoActualFormulario(paso); if (paso === 5) cargarCursosExistentes(); } };

  const openEditInstitucion = (inst: Institucion) => {
    setEditingInstitucion(inst);
    setFormInstitucion({ nombre: inst.nombre, codigo_dane: inst.codigo_dane || '', nit: inst.nit || '', naturaleza: inst.naturaleza, municipio_id: inst.municipio_id, telefono_principal: inst.telefono_principal, correo_institucional: inst.correo_institucional, direccion_completa: inst.direccion_completa || '', rector_nombre: inst.rector_nombre || '', rector_documento: inst.rector_documento || '', rector_telefono: inst.rector_telefono || '' });
    setModalInstitucion(true);
  };

  const handleCreateUsuario = async () => {
    setError(null);
    if (["coordinador", "orientador", "docente_aula", "acudiente"].includes(formUsuario.rol)) {
      if (!tieneRector(formUsuario.institucionId)) {
        setError("Debe crear primero un rector para la institución antes de asignar coordinadores, orientadores, docentes o acudientes.");
        return;
      }
    }
    if (formUsuario.rol === 'rector') {
      if (!formUsuario.nombre || !formUsuario.apellidos || !formUsuario.correo || !formUsuario.telefono || !formUsuario.contrasena || !formUsuario.institucionId) { setError('Todos los campos son requeridos para crear un rector'); return; }
      const telefonoLimpio = formUsuario.telefono.replace(/\D/g, '');
      if (telefonoLimpio.length !== 10) { setError('El teléfono debe tener exactamente 10 dígitos'); return; }
      if (!formUsuario.correo.includes('@') || !formUsuario.correo.includes('.')) { setError('El correo electrónico no es válido'); return; }
      if (formUsuario.contrasena.length < 8) { setError('La contraseña debe tener al menos 8 caracteres'); return; }
      if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/.test(formUsuario.contrasena)) { setError('La contraseña debe tener al menos: 1 minúscula, 1 mayúscula, 1 número y 1 carácter especial (!@#$%^&*)'); return; }
      const result = await crearRector({ correo: formUsuario.correo, contrasena: formUsuario.contrasena, nombre: formUsuario.nombre, apellido: formUsuario.apellidos, telefono: telefonoLimpio, institucionId: formUsuario.institucionId });
      if (result.success) { await loadData(); setModalUsuario(false); setFormUsuario({ nombre: '', apellidos: '', correo: '', telefono: '', documento: '', tipoDocumento: 'cc', contrasena: '', rol: 'docente_aula', institucionId: 1, telefonoEmergencia: '', personaEmergencia: '', direccion: '', esDirectorGrado: false, gradoAsignado: '', areaQueOrienta: '', centroInteres: '' }); alert(`Rector creado exitosamente.`); }
      else { setError(result.error || 'Error al crear rector'); }
      return;
    }
    if (formUsuario.rol === 'coordinador') {
      if (!formUsuario.nombre || !formUsuario.apellidos || !formUsuario.correo || !formUsuario.telefono || !formUsuario.contrasena || !formUsuario.institucionId) { setError('Todos los campos son requeridos para crear un coordinador'); return; }
      const telefonoLimpio = formUsuario.telefono.replace(/\D/g, '');
      if (telefonoLimpio.length !== 10) { setError('El teléfono debe tener exactamente 10 dígitos'); return; }
      if (!formUsuario.correo.includes('@') || !formUsuario.correo.includes('.')) { setError('El correo electrónico no es válido'); return; }
      if (formUsuario.contrasena.length < 8) { setError('La contraseña debe tener al menos 8 caracteres'); return; }
      if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/.test(formUsuario.contrasena)) { setError('La contraseña debe tener al menos: 1 minúscula, 1 mayúscula, 1 número y 1 carácter especial (!@#$%^&*)'); return; }
      const result = await crearCoordinador({ correo: formUsuario.correo, contrasena: formUsuario.contrasena, nombre: formUsuario.nombre, apellido: formUsuario.apellidos, telefono: formUsuario.telefono.replace(/\D/g, ''), institucionId: formUsuario.institucionId });
      if (result.success) { await loadData(); setModalUsuario(false); setFormUsuario({ nombre: '', apellidos: '', correo: '', telefono: '', documento: '', tipoDocumento: 'cc', contrasena: '', rol: 'docente_aula', institucionId: 1 }); alert(`Coordinador creado exitosamente.`); }
      else { setError(result.error || 'Error al crear coordinador'); }
      return;
    }
    if (formUsuario.rol === 'docente_aula') {
      if (!formUsuario.nombre || !formUsuario.apellidos || !formUsuario.correo || !formUsuario.documento || !formUsuario.institucionId) { setError('Nombre, apellidos, correo, documento e institución son obligatorios'); return; }
      const payload: any = { correo: formUsuario.correo, telefono: formUsuario.telefono || undefined, numeroDocumento: formUsuario.documento, contrasena: formUsuario.contrasena || undefined, nombres: formUsuario.nombre, apellidos: formUsuario.apellidos, tipoDocumento: (formUsuario.tipoDocumento || 'cc').toUpperCase(), telefonoEmergencia: formUsuario.telefonoEmergencia || undefined, personaEmergencia: formUsuario.personaEmergencia || undefined, direccion: formUsuario.direccion || undefined, esDirectorGrado: formUsuario.esDirectorGrado || undefined, gradoAsignado: formUsuario.gradoAsignado || undefined, areaQueOrienta: formUsuario.areaQueOrienta || undefined, centroInteres: formUsuario.centroInteres || undefined, institucionId: Number(formUsuario.institucionId) };
      const result = await crearDocente(payload);
      if (result.success) { await loadData(); setModalUsuario(false); setFormUsuario({ nombre: '', apellidos: '', correo: '', telefono: '', documento: '', tipoDocumento: 'cc', contrasena: '', rol: 'docente_aula', institucionId: 1, telefonoEmergencia: '', personaEmergencia: '', direccion: '', esDirectorGrado: false, gradoAsignado: '', areaQueOrienta: '', centroInteres: '' }); setSuccess('Docente creado correctamente'); }
      else { setError(result.error || 'Error al crear docente'); }
      return;
    }
    const result = await createUsuario(formUsuario);
    if (result.success) { await loadData(); setModalUsuario(false); setFormUsuario({ nombre: '', apellidos: '', correo: '', telefono: '', documento: '', tipoDocumento: 'cc', contrasena: '', rol: 'docente_aula', institucionId: 1 }); }
    else { setError(result.error || 'Error al crear usuario'); }
  };

  const handleUpdateUsuario = async () => {
    if (!editingUsuario) return;
    setError(null);
    const dataToUpdate: Record<string, any> = {};
    if (formUsuario.nombre) dataToUpdate.nombre = formUsuario.nombre;
    if (formUsuario.apellidos) dataToUpdate.apellido = formUsuario.apellidos;
    if (formUsuario.telefono) dataToUpdate.telefono = formUsuario.telefono;
    if (formUsuario.correo) dataToUpdate.correo = formUsuario.correo;
    if (typeof formUsuario.institucionId === 'number' && formUsuario.institucionId > 0) dataToUpdate.institucionId = formUsuario.institucionId;
    if (formUsuario.rol) dataToUpdate.rol = formUsuario.rol;
    const result = await updateUsuario(editingUsuario.id, dataToUpdate);
    if (result.success) {
      await Swal.fire({ icon: 'success', title: 'Usuario actualizado', text: 'Los cambios se guardaron correctamente.', confirmButtonText: 'OK', confirmButtonColor: '#14b8a6' });
      await loadData(); setModalUsuario(false); setEditingUsuario(null); setFormUsuario({ nombre: '', apellidos: '', correo: '', telefono: '', documento: '', tipoDocumento: 'cc', contrasena: '', rol: 'docente_aula', institucionId: 1 });
    } else {
      const msg = result.error || 'Error al actualizar usuario';
      setError(msg);
      await Swal.fire({ icon: 'error', title: 'No se pudo actualizar', text: msg, confirmButtonText: 'Entendido', confirmButtonColor: '#ef4444' });
    }
  };

  const handleDeleteUsuario = async (id: number) => {
    if (!confirm('¿Está seguro de eliminar este usuario permanentemente?')) return;
    const result = await deleteUsuario(id);
    if (result.success) { await loadData(); alert('Usuario eliminado correctamente'); }
    else { const errorMsg = result.error || 'Error al eliminar usuario'; alert(errorMsg); setError(errorMsg); }
  };

  const openEditUsuario = (user: Usuario) => {
    setEditingUsuario(user);
    setFormUsuario({ nombre: user.nombre, apellidos: user.apellidos || '', correo: user.correo || '', telefono: user.telefono || '', documento: user.documento || '', tipoDocumento: user.tipoDocumento || 'cc', rol: user.rol, institucionId: user.institucionId || 1 });
    setModalUsuario(true);
  };

  const handleCreatePeriodo = async () => {
    setError(null);
    const result = await createPeriodo(formPeriodo);
    if (result.success) { await loadData(); setModalPeriodo(false); setFormPeriodo({ nombre: '', fechaInicio: '', fechaFin: '', institucionId: 1, anio: new Date().getFullYear(), estado: 'planificado' }); }
    else { setError(result.error || 'Error al crear período'); }
  };

  const handleUpdatePeriodo = async () => {
    if (!editingPeriodo) return;
    setError(null);
    const result = await updatePeriodo(editingPeriodo.id, formPeriodo);
    if (result.success) { await loadData(); setModalPeriodo(false); setEditingPeriodo(null); setFormPeriodo({ nombre: '', fechaInicio: '', fechaFin: '', institucionId: 1, anio: new Date().getFullYear(), estado: 'planificado' }); }
    else { setError(result.error || 'Error al actualizar período'); }
  };

  const handleDeletePeriodo = async (id: number) => {
    if (!confirm('¿Está seguro de eliminar este período?')) return;
    const result = await deletePeriodo(id);
    if (result.success) await loadData();
    else setError(result.error || 'Error al eliminar período');
  };

  const openEditPeriodo = (periodo: Periodo) => {
    setEditingPeriodo(periodo);
    setFormPeriodo({ nombre: periodo.nombre, fechaInicio: periodo.fechaInicio, fechaFin: periodo.fechaFin, institucionId: periodo.institucionId, anio: periodo.anio, estado: periodo.estado });
    setModalPeriodo(true);
  };

  const handleCreateGrado = async () => {
    setError(null); setSuccess(null);
    const result = await createGrado(formGrado);
    if (result.success) { setSuccess('Grado creado exitosamente'); setModalGrado(false); setFormGrado({ nombre: '', orden: 0, institucionId: 1 }); await loadData(); setTimeout(() => setSuccess(null), 3000); }
    else { setError(result.error || 'Error al crear grado'); }
  };

  const handleUpdateGrado = async () => {
    if (!editingGrado) return;
    setError(null); setSuccess(null);
    const result = await updateGrado(editingGrado.id, formGrado);
    if (result.success) { setSuccess('Grado actualizado exitosamente'); setModalGrado(false); setEditingGrado(null); setFormGrado({ nombre: '', orden: 0, institucionId: 1 }); await loadData(); setTimeout(() => setSuccess(null), 3000); }
    else { setError(result.error || 'Error al actualizar grado'); }
  };

  const handleDeleteGrado = async (id: number) => {
    if (!confirm('¿Está seguro de eliminar este grado?')) return;
    setError(null); setSuccess(null);
    const result = await deleteGrado(id);
    if (result.success) { setSuccess('Grado eliminado exitosamente'); await loadData(); setTimeout(() => setSuccess(null), 3000); }
    else { setError(result.error || 'Error al eliminar grado'); }
  };

  const openEditGrado = (grado: Grado) => {
    setEditingGrado(grado);
    setFormGrado({ nombre: grado.nombre, orden: grado.orden, institucionId: grado.institucionId });
    setModalGrado(true);
  };

  const handleCreateCurso = async () => {
    setError(null);
    const result = await createCurso(formCurso);
    if (result.success) { await loadData(); setModalCurso(false); setFormCurso({ nombre: '', gradoId: 1, jornada: 'mañana', institucionId: 1, docenteDirectorId: undefined }); }
    else { setError(result.error || 'Error al crear curso'); }
  };

  const handleUpdateCurso = async () => {
    if (!editingCurso) return;
    setError(null);
    const result = await updateCurso(editingCurso.id, formCurso);
    if (result.success) { await loadData(); setModalCurso(false); setEditingCurso(null); setFormCurso({ nombre: '', gradoId: 1, jornada: 'mañana', institucionId: 1, docenteDirectorId: undefined }); }
    else { setError(result.error || 'Error al actualizar curso'); }
  };

  const handleDeleteCurso = async (id: number) => {
    if (!confirm('¿Está seguro de eliminar este curso?')) return;
    const result = await deleteCurso(id);
    if (result.success) await loadData();
    else setError(result.error || 'Error al eliminar curso');
  };

  const openEditCurso = (curso: Curso) => {
    setEditingCurso(curso);
    setFormCurso({ nombre: curso.nombre, gradoId: curso.gradoId, jornada: curso.jornada, institucionId: curso.institucionId, docenteDirectorId: curso.docenteDirectorId });
    setModalCurso(true);
  };

  const getUsuariosInstitucion = (institucionId: number) => usuarios.filter(u => u.institucionId === institucionId);
  const getRectorInstitucion = (institucionId: number) => usuarios.find(u => u.institucionId === institucionId && u.rol === 'rector');
  const getCoordinadoresInstitucion = (institucionId: number) => usuarios.filter(u => u.institucionId === institucionId && u.rol === 'coordinador');
  const getOrientadoresInstitucion = (institucionId: number) => usuarios.filter(u => u.institucionId === institucionId && u.rol === 'orientador');
  const getDocentesInstitucion = (institucionId: number) => usuarios.filter(u => u.institucionId === institucionId && u.rol === 'docente_aula');

  const getDepartamentoInstitucion = (inst: Institucion) => {
    const municipio = municipiosMock.find(m => m.id === inst.municipio_id);
    return municipio ? departamentosMock.find(d => d.id === municipio.departamento_id) : null;
  };

  // ✅ MODIFICADO: incluye búsqueda por texto
  const institucionesFiltradas = instituciones.filter(inst => {
    if (filtroDepartamentoInst !== 'todos') {
      const depto = getDepartamentoInstitucion(inst);
      if (depto?.id !== filtroDepartamentoInst) return false;
    }
    if (busquedaInst.trim()) {
      const texto = busquedaInst.toLowerCase();
      return (
        inst.nombre?.toLowerCase().includes(texto) ||
        inst.codigo_dane?.toLowerCase().includes(texto) ||
        inst.nit?.toLowerCase().includes(texto) ||
        inst.direccion_completa?.toLowerCase().includes(texto)
      );
    }
    return true;
  });

  // ✅ MODIFICADO: incluye búsqueda por texto
  const usuariosFiltrados = usuarios.filter(user => {
    if (filtroRolUsers !== 'todos' && user.rol !== filtroRolUsers) return false;
    if (filtroDepartamentoUsers !== 'todos') {
      const inst = instituciones.find(i => i.id === user.institucionId);
      if (!inst) return false;
      const depto = getDepartamentoInstitucion(inst);
      if (!depto || depto.id !== filtroDepartamentoUsers) return false;
    }
    if (busquedaUsers.trim()) {
      const texto = busquedaUsers.toLowerCase();
      return (
        user.nombre?.toLowerCase().includes(texto) ||
        user.apellidos?.toLowerCase().includes(texto) ||
        user.correo?.toLowerCase().includes(texto) ||
        user.email?.toLowerCase().includes(texto) ||
        user.documento?.toLowerCase().includes(texto)
      );
    }
    return true;
  });

  const departamentosConInstituciones = [...new Set(
    instituciones.map(inst => getDepartamentoInstitucion(inst)).filter(Boolean).map(d => d!.id)
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

  const totalUsuarios = usuarios.length;
  const usuariosActivos = usuarios.filter(u => u.activo).length;
  const totalDocentes = usuarios.filter(u => u.rol === 'docente_aula').length;
  const totalRectores = usuarios.filter(u => u.rol === 'rector').length;

  return (
    <DashboardLayout>
      {error && (
        <div style={{background:'#ffe0e0',color:'#b00',padding:'8px',borderRadius:'4px',margin:'8px 0',fontWeight:'bold'}}>
          {error}
        </div>
      )}
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-8 text-white shadow-xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-teal-500/20 to-transparent rounded-full -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-violet-500/15 to-transparent rounded-full translate-y-1/2 -translate-x-1/3" />
          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center shadow-lg shadow-teal-500/40 ring-4 ring-white/10">
                <IconGear className="text-white" size={32} />
              </div>
              <div>
                <p className="text-teal-400 text-sm font-semibold uppercase tracking-wider mb-1">Sistema Cátedra de Familia</p>
                <h1 className="text-2xl md:text-3xl font-display font-bold">Panel de Administración</h1>
                <p className="text-slate-400 mt-1">Gestión integral de instituciones, usuarios y configuración</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="group bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 p-6 border border-slate-100 hover:border-teal-300 cursor-pointer" onClick={() => setActiveTab('instituciones')}>
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center shadow-lg shadow-teal-200/50 group-hover:scale-110 transition-transform">
                <IconInstitution className="text-white" size={22} />
              </div>
              <span className="text-xs font-semibold text-teal-600 bg-teal-50 px-2 py-1 rounded-full">{instituciones.filter(i => i.activo).length} activas</span>
            </div>
            <div className="text-3xl font-bold text-slate-800 mb-1">{instituciones.length}</div>
            <div className="text-sm text-slate-500 font-medium">Instituciones Educativas</div>
          </div>
          <div className="group bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 p-6 border border-slate-100 hover:border-blue-300 cursor-pointer" onClick={() => setActiveTab('usuarios')}>
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-200/50 group-hover:scale-110 transition-transform">
                <IconUsers className="text-white" size={22} />
              </div>
              <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">{usuariosActivos} activos</span>
            </div>
            <div className="text-3xl font-bold text-slate-800 mb-1">{totalUsuarios}</div>
            <div className="text-sm text-slate-500 font-medium">Usuarios Registrados</div>
          </div>
          <div className="group bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 p-6 border border-slate-100 hover:border-emerald-300">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-200/50 group-hover:scale-110 transition-transform">
                <IconBook className="text-white" size={22} />
              </div>
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">{totalDocentes} docentes</span>
            </div>
            <div className="text-3xl font-bold text-slate-800 mb-1">{cursos.length}</div>
            <div className="text-sm text-slate-500 font-medium">Cursos Activos</div>
          </div>
          <div className="group bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 p-6 border border-slate-100 hover:border-violet-300">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-200/50 group-hover:scale-110 transition-transform">
                <IconClipboard className="text-white" size={22} />
              </div>
              <span className="text-xs font-semibold text-violet-600 bg-violet-50 px-2 py-1 rounded-full">{totalRectores} rectores</span>
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
                  className={`flex items-center gap-2.5 px-5 py-3 rounded-xl font-medium transition-all duration-200 whitespace-nowrap ${activeTab === tab.id ? 'bg-teal-600 text-white shadow-md shadow-teal-200' : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100'}`}
                >
                  <tab.Icon size={18} />
                  {tab.label}
                  {tab.count !== undefined && (
                    <span className={`text-xs px-2 py-0.5 rounded-full ${activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'}`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {error && (
              <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5"><svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg></div>
                <div className="flex-1"><p className="text-sm font-medium text-red-800">{error}</p></div>
                <button onClick={() => setError(null)} className="flex-shrink-0 text-red-400 hover:text-red-600"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg></button>
              </div>
            )}
            {success && (
              <div className="mb-5 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5"><svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg></div>
                <div className="flex-1"><p className="text-sm font-medium text-green-800">{success}</p></div>
                <button onClick={() => setSuccess(null)} className="flex-shrink-0 text-green-400 hover:text-green-600"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg></button>
              </div>
            )}

            {/* ==================== TAB INSTITUCIONES ==================== */}
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
                    <Button
                      onClick={async () => { if (catalogos.municipios.length === 0) await loadCatalogos(); setModalInstitucionCompleta(true); }}
                      variant="outline"
                      className="flex items-center gap-2 shadow-md border-teal-600 text-teal-600 hover:bg-teal-50"
                    >
                      <IconPlus size={16} /> Institución Completa
                    </Button>
                  </div>
                </div>

                {/* ✅ BUSCADOR INSTITUCIONES */}
                <div className="relative w-full">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    <IconSearch />
                  </div>
                  <input
                    type="text"
                    value={busquedaInst}
                    onChange={(e) => setBusquedaInst(e.target.value)}
                    placeholder="Buscar institución por nombre, DANE, NIT..."
                    className="w-full pl-9 pr-9 py-2.5 border border-slate-200 rounded-xl bg-white text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 transition-all shadow-sm"
                  />
                  {busquedaInst && (
                    <button
                      onClick={() => setBusquedaInst('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      <IconX />
                    </button>
                  )}
                </div>

                {/* Indicador de filtro activo */}
                {(filtroDepartamentoInst !== 'todos' || busquedaInst) && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-teal-50 border border-teal-200 rounded-xl flex-wrap">
                    <svg className="w-4 h-4 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
                    <span className="text-sm text-teal-700 font-medium">
                      Mostrando {institucionesFiltradas.length} {institucionesFiltradas.length === 1 ? 'institución' : 'instituciones'}
                      {busquedaInst && ` para "${busquedaInst}"`}
                    </span>
                    <button onClick={() => { setFiltroDepartamentoInst('todos'); setBusquedaInst(''); }} className="ml-auto text-teal-600 hover:text-teal-800 text-sm font-medium flex items-center gap-1">
                      <IconX /> Quitar filtros
                    </button>
                  </div>
                )}

                {institucionesFiltradas.length === 0 ? (
                  <div className="text-center py-16 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                    <IconInstitution className="mx-auto text-slate-300 mb-4" size={48} />
                    <h4 className="font-semibold text-slate-600 mb-2">
                      {busquedaInst ? `No se encontraron instituciones para "${busquedaInst}"` : 'No hay instituciones registradas'}
                    </h4>
                    <p className="text-sm text-slate-500 mb-4">
                      {busquedaInst ? 'Intenta con otro término de búsqueda' : 'Comienza agregando la primera institución educativa'}
                    </p>
                    {busquedaInst && (
                      <button onClick={() => setBusquedaInst('')} className="text-teal-600 hover:text-teal-800 text-sm font-medium underline">
                        Limpiar búsqueda
                      </button>
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
                        <div key={inst.id} className={`rounded-xl border-2 overflow-hidden transition-all duration-300 ${isExpanded ? 'border-teal-300 shadow-lg shadow-teal-100' : 'border-slate-200 hover:border-slate-300'}`}>
                          <div className={`p-5 cursor-pointer transition-colors ${isExpanded ? 'bg-gradient-to-r from-teal-50 to-emerald-50' : 'bg-white hover:bg-slate-50'}`} onClick={() => setExpandedInstitucion(isExpanded ? null : inst.id)}>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center shadow-lg flex-shrink-0">
                                  <IconInstitution className="text-white" size={26} />
                                </div>
                                <div className="min-w-0">
                                  <div className="font-bold text-lg text-slate-800">{inst.nombre}</div>
                                  <div className="text-sm text-slate-500">{inst.direccion_completa || inst.direccion || 'Sin dirección'}</div>
                                  <div className="flex items-center gap-3 mt-1.5">
                                    {inst.codigo_dane && <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded">DANE: {inst.codigo_dane}</span>}
                                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${inst.naturaleza === 'publica' ? 'bg-emerald-100 text-emerald-700' : inst.naturaleza === 'privada' ? 'bg-violet-100 text-violet-700' : 'bg-amber-100 text-amber-700'}`}>
                                      {inst.naturaleza === 'publica' ? 'Pública' : inst.naturaleza === 'privada' ? 'Privada' : 'Mixta'}
                                    </span>
                                    <span className={`px-2 py-0.5 rounded text-xs font-semibold inline-flex items-center gap-1 ${inst.activo ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                                      <span className={`w-1.5 h-1.5 rounded-full ${inst.activo ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                                      {inst.activo ? 'Activa' : 'Inactiva'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-4">
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
                                <div className="flex items-center gap-1">
                                  <button onClick={(e) => { e.stopPropagation(); openEditInstitucion(inst); }} className="p-2.5 text-slate-400 hover:text-teal-600 hover:bg-teal-100 rounded-lg transition-all" title="Editar institución"><IconEdit size={18} /></button>
                                  <button onClick={(e) => { e.stopPropagation(); handleDeleteInstitucion(inst.id); }} className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-100 rounded-lg transition-all" title="Eliminar institución"><IconTrash size={18} /></button>
                                  <button className={`p-2.5 rounded-lg transition-all ${isExpanded ? 'text-teal-600 bg-teal-100' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}>
                                    <svg className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                          {isExpanded && (
                            <div className="border-t border-teal-200 bg-gradient-to-b from-slate-50 to-white p-5">
                              <h4 className="font-semibold text-slate-700 mb-4 flex items-center gap-2"><IconUsers size={18} className="text-slate-500" />Personal de la Institución</h4>
                              {totalUsuariosInst === 0 ? (
                                <div className="text-center py-8 bg-white rounded-xl border-2 border-dashed border-slate-200">
                                  <IconUsers className="mx-auto text-slate-300 mb-2" size={36} />
                                  <p className="text-slate-500 text-sm">No hay usuarios registrados en esta institución</p>
                                  <Button size="sm" className="mt-3" onClick={() => { setFormUsuario({ ...formUsuario, institucionId: inst.id }); setModalUsuario(true); }}><IconPlus size={14} />Agregar Usuario</Button>
                                </div>
                              ) : (
                                <div className="grid gap-4">
                                  {/* Rector */}
                                  <div className="bg-white rounded-xl border border-rose-200 p-4">
                                    <div className="flex items-center gap-2 mb-3">
                                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-400 to-red-600 flex items-center justify-center"><span className="text-white text-xs font-bold">R</span></div>
                                      <h5 className="font-semibold text-slate-700">Rector</h5>
                                      <span className="text-xs bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full ml-auto">{rector ? '1 asignado' : 'Sin asignar'}</span>
                                    </div>
                                    {rector ? (
                                      <div className="flex items-center gap-3 p-3 bg-rose-50 rounded-lg">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-400 to-red-600 flex items-center justify-center text-white font-bold">{rector.nombre[0]}{rector.apellidos?.[0] || ''}</div>
                                        <div className="flex-1 min-w-0">
                                          <div className="font-medium text-slate-800">{rector.nombre} {rector.apellidos}</div>
                                          <div className="text-sm text-slate-500 truncate">{rector.correo || rector.email}</div>
                                        </div>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${rector.activo ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{rector.activo ? 'Activo' : 'Inactivo'}</span>
                                      </div>
                                    ) : <div className="text-center py-4 text-slate-400 text-sm">No hay rector asignado</div>}
                                  </div>
                                  {/* Coordinadores */}
                                  <div className="bg-white rounded-xl border border-amber-200 p-4">
                                    <div className="flex items-center gap-2 mb-3">
                                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center"><span className="text-white text-xs font-bold">C</span></div>
                                      <h5 className="font-semibold text-slate-700">Coordinadores</h5>
                                      <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full ml-auto">{coordinadores.length} {coordinadores.length === 1 ? 'registrado' : 'registrados'}</span>
                                    </div>
                                    {coordinadores.length > 0 ? (
                                      <div className="space-y-2">{coordinadores.map(coord => (
                                        <div key={coord.id} className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg">
                                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center text-white font-bold text-sm">{coord.nombre[0]}{coord.apellidos?.[0] || ''}</div>
                                          <div className="flex-1 min-w-0"><div className="font-medium text-slate-800">{coord.nombre} {coord.apellidos}</div><div className="text-sm text-slate-500 truncate">{coord.correo || coord.email}</div></div>
                                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${coord.activo ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{coord.activo ? 'Activo' : 'Inactivo'}</span>
                                        </div>
                                      ))}</div>
                                    ) : <div className="text-center py-4 text-slate-400 text-sm">No hay coordinadores registrados</div>}
                                  </div>
                                  {/* Docentes */}
                                  <div className="bg-white rounded-xl border border-blue-200 p-4">
                                    <div className="flex items-center gap-2 mb-3">
                                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center"><span className="text-white text-xs font-bold">D</span></div>
                                      <h5 className="font-semibold text-slate-700">Docentes</h5>
                                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full ml-auto">{docentes.length} {docentes.length === 1 ? 'registrado' : 'registrados'}</span>
                                    </div>
                                    {docentes.length > 0 ? (
                                      <div className="grid sm:grid-cols-2 gap-2">{docentes.slice(0, 6).map(doc => (
                                        <div key={doc.id} className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white font-bold text-xs">{doc.nombre[0]}{doc.apellidos?.[0] || ''}</div>
                                          <div className="flex-1 min-w-0"><div className="font-medium text-slate-800 text-sm">{doc.nombre} {doc.apellidos}</div><div className="text-xs text-slate-500 truncate">{doc.correo || doc.email}</div></div>
                                        </div>
                                      ))}</div>
                                    ) : <div className="text-center py-4 text-slate-400 text-sm">No hay docentes registrados</div>}
                                    {docentes.length > 6 && <div className="mt-3 text-center"><span className="text-sm text-blue-600 font-medium">+{docentes.length - 6} docentes más</span></div>}
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

            {/* ==================== TAB USUARIOS ==================== */}
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
                      {departamentosMock.map(depto => (<option key={depto.id} value={depto.id}>{depto.nombre}</option>))}
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
                    <Button onClick={() => { setEditingUsuario(null); const primeraInstitucion = instituciones.length > 0 ? instituciones[0].id : 1; setFormUsuario({ nombre: '', apellidos: '', correo: '', telefono: '', documento: '', tipoDocumento: 'cc', contrasena: '', rol: 'docente_aula', institucionId: primeraInstitucion }); setModalUsuario(true); }} className="flex items-center gap-2 shadow-md">
                      <IconPlus size={16} /> Nuevo Usuario
                    </Button>
                  </div>
                </div>

                {/* ✅ BUSCADOR USUARIOS */}
                <div className="relative w-full">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    <IconSearch />
                  </div>
                  <input
                    type="text"
                    value={busquedaUsers}
                    onChange={(e) => setBusquedaUsers(e.target.value)}
                    placeholder="Buscar por nombre, correo, documento..."
                    className="w-full pl-9 pr-9 py-2.5 border border-slate-200 rounded-xl bg-white text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 transition-all shadow-sm"
                  />
                  {busquedaUsers && (
                    <button onClick={() => setBusquedaUsers('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                      <IconX />
                    </button>
                  )}
                </div>

                {/* Indicador de filtros activos */}
                {(filtroDepartamentoUsers !== 'todos' || filtroRolUsers !== 'todos' || busquedaUsers) && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-xl flex-wrap">
                    <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
                    <span className="text-sm text-blue-700 font-medium">
                      Mostrando {usuariosFiltrados.length} {usuariosFiltrados.length === 1 ? 'usuario' : 'usuarios'}
                      {busquedaUsers && ` para "${busquedaUsers}"`}
                    </span>
                    <button onClick={() => { setFiltroDepartamentoUsers('todos'); setFiltroRolUsers('todos'); setBusquedaUsers(''); }} className="ml-auto text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1">
                      <IconX /> Quitar filtros
                    </button>
                  </div>
                )}

                {usuariosFiltrados.length === 0 ? (
                  <div className="text-center py-16 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                    <IconUsers className="mx-auto text-slate-300 mb-4" size={48} />
                    <h4 className="font-semibold text-slate-600 mb-2">
                      {busquedaUsers ? `No se encontraron usuarios para "${busquedaUsers}"` : 'No hay usuarios registrados'}
                    </h4>
                    <p className="text-sm text-slate-500 mb-4">
                      {busquedaUsers ? 'Intenta con otro término de búsqueda' : 'Comienza agregando el primer usuario'}
                    </p>
                    {busquedaUsers && (
                      <button onClick={() => setBusquedaUsers('')} className="text-blue-600 hover:text-blue-800 text-sm font-medium underline">Limpiar búsqueda</button>
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
                                  <div className={`w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md ring-2 ring-white ${usuario.rol === 'docente_aula' ? 'bg-gradient-to-br from-blue-400 to-indigo-600' : usuario.rol === 'orientador' ? 'bg-gradient-to-br from-violet-400 to-purple-600' : usuario.rol === 'coordinador' ? 'bg-gradient-to-br from-amber-400 to-orange-600' : usuario.rol === 'rector' ? 'bg-gradient-to-br from-rose-400 to-red-600' : 'bg-gradient-to-br from-teal-400 to-teal-600'}`}>
                                    {usuario.nombre[0]}{usuario.apellidos?.[0] || ''}
                                  </div>
                                  <div className="min-w-0">
                                    <div className="font-semibold text-slate-800">{usuario.nombre} {usuario.apellidos}</div>
                                    <div className="text-sm text-slate-500 truncate">{usuario.correo || usuario.email}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="text-center py-4 px-4">
                                <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${usuario.rol === 'docente_aula' ? 'bg-blue-100 text-blue-700' : usuario.rol === 'orientador' ? 'bg-violet-100 text-violet-700' : usuario.rol === 'coordinador' ? 'bg-amber-100 text-amber-700' : usuario.rol === 'rector' ? 'bg-rose-100 text-rose-700' : usuario.rol === 'acudiente' ? 'bg-cyan-100 text-cyan-700' : 'bg-slate-100 text-slate-700'}`}>
                                  {usuario.rol === 'docente_aula' ? 'Docente' : usuario.rol === 'orientador' ? 'Orientador' : usuario.rol === 'coordinador' ? 'Coordinador' : usuario.rol === 'rector' ? 'Rector' : usuario.rol === 'acudiente' ? 'Acudiente' : usuario.rol}
                                </span>
                              </td>
                              <td className="text-center py-4 px-4 text-slate-600">
                                <span className="text-sm font-medium">{instUsuario?.nombre?.slice(0, 20) || 'Sin asignar'}{(instUsuario?.nombre?.length || 0) > 20 ? '...' : ''}</span>
                              </td>
                              <td className="text-center py-4 px-4">
                                {deptoUsuario ? <span className="text-sm font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">{deptoUsuario.nombre}</span> : <span className="text-xs text-slate-400">-</span>}
                              </td>
                              <td className="text-center py-4 px-4">
                                <span className={`px-3 py-1.5 rounded-full text-xs font-semibold inline-flex items-center gap-1.5 ${usuario.activo ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                                  <span className={`w-2 h-2 rounded-full ${usuario.activo ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                                  {usuario.activo ? 'Activo' : 'Inactivo'}
                                </span>
                              </td>
                              <td className="text-center py-4 px-4">
                                <div className="flex justify-center gap-1">
                                  <button onClick={() => openEditUsuario(usuario)} className="p-2.5 text-slate-400 hover:text-teal-600 hover:bg-teal-100 rounded-lg transition-all hover:scale-105" title="Editar usuario"><IconEdit size={18} /></button>
                                  <button onClick={() => handleDeleteUsuario(usuario.id)} className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-100 rounded-lg transition-all hover:scale-105" title="Eliminar usuario"><IconTrash size={18} /></button>
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

            {/* ==================== TAB REPORTES ==================== */}
            {activeTab === 'reportes' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-800">Exportar Reportes</h3>
                  <p className="text-sm text-slate-500 mt-1">Descarga reportes en formato Excel o PDF</p>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-6 border border-blue-200">
                    <div className="flex items-center gap-3 mb-4"><div className="p-2 bg-blue-500 rounded-lg"><IconInstitution className="text-white" size={20} /></div><h4 className="font-bold text-gray-800">Instituciones</h4></div>
                    <p className="text-sm text-gray-600 mb-4">Listado completo de instituciones registradas</p>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => { const data = instituciones.map(inst => { const municipio = municipiosMock.find(m => m.id === inst.municipio_id); const departamento = departamentosMock.find(d => d.id === municipio?.departamento_id); return { ID: inst.id, Nombre: inst.nombre, 'Código DANE': inst.codigo_dane || '-', NIT: inst.nit || '-', Municipio: municipio?.nombre || '-', Departamento: departamento?.nombre || '-', Naturaleza: inst.naturaleza, Estado: inst.activo ? 'Activa' : 'Inactiva' }; }); exportToExcel(data, 'Instituciones', 'Instituciones'); }}><IconDownload size={14} />Excel</Button>
                      <Button size="sm" variant="outline" onClick={() => { const data = instituciones.map(inst => { const municipio = municipiosMock.find(m => m.id === inst.municipio_id); const departamento = departamentosMock.find(d => d.id === municipio?.departamento_id); return { id: inst.id, nombre: inst.nombre, municipio: municipio?.nombre || '-', departamento: departamento?.nombre || '-', naturaleza: inst.naturaleza, estado: inst.activo ? 'Activa' : 'Inactiva' }; }); exportToPDF(data, 'Instituciones', 'Reporte de Instituciones', [{ header: 'ID', dataKey: 'id' }, { header: 'Nombre', dataKey: 'nombre' }, { header: 'Municipio', dataKey: 'municipio' }, { header: 'Departamento', dataKey: 'departamento' }, { header: 'Naturaleza', dataKey: 'naturaleza' }, { header: 'Estado', dataKey: 'estado' }]); }}><IconDownload size={14} />PDF</Button>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl p-6 border border-purple-200">
                    <div className="flex items-center gap-3 mb-4"><div className="p-2 bg-purple-500 rounded-lg"><IconUsers className="text-white" size={20} /></div><h4 className="font-bold text-gray-800">Usuarios</h4></div>
                    <p className="text-sm text-gray-600 mb-4">Listado de usuarios por rol y estado</p>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => { const data = usuarios.map(user => ({ ID: user.id, Nombre: user.nombre, Email: user.email, Rol: user.rol, Institución: instituciones.find(i => i.id === user.institucionId)?.nombre || '-', Estado: user.activo ? 'Activo' : 'Inactivo' })); exportToExcel(data, 'Usuarios', 'Usuarios'); }}><IconDownload size={14} />Excel</Button>
                      <Button size="sm" variant="outline" onClick={() => { const data = usuarios.map(user => ({ id: user.id, nombre: user.nombre, email: user.email, rol: user.rol, estado: user.activo ? 'Activo' : 'Inactivo' })); exportToPDF(data, 'Usuarios', 'Reporte de Usuarios', [{ header: 'ID', dataKey: 'id' }, { header: 'Nombre', dataKey: 'nombre' }, { header: 'Email', dataKey: 'email' }, { header: 'Rol', dataKey: 'rol' }, { header: 'Estado', dataKey: 'estado' }]); }}><IconDownload size={14} />PDF</Button>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-teal-50 to-teal-100/50 rounded-xl p-6 border border-teal-200">
                    <div className="flex items-center gap-3 mb-4"><div className="p-2 bg-teal-500 rounded-lg"><IconClipboard className="text-white" size={20} /></div><h4 className="font-bold text-gray-800">Tareas</h4></div>
                    <p className="text-sm text-gray-600 mb-4">Listado de tareas creadas y su estado</p>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => { const data = tareas.map(tarea => ({ ID: tarea.id, Título: tarea.titulo, Categoría: tarea.categoria?.nombre || '-', 'Fecha Límite': tarea.fechaLimite, Estado: tarea.estado })); exportToExcel(data, 'Tareas', 'Tareas'); }}><IconDownload size={14} />Excel</Button>
                      <Button size="sm" variant="outline" onClick={() => { const data = tareas.map(tarea => ({ id: tarea.id, titulo: tarea.titulo, categoria: tarea.categoria?.nombre || '-', fechaLimite: tarea.fechaLimite, estado: tarea.estado })); exportToPDF(data, 'Tareas', 'Reporte de Tareas', [{ header: 'ID', dataKey: 'id' }, { header: 'Título', dataKey: 'titulo' }, { header: 'Categoría', dataKey: 'categoria' }, { header: 'Fecha Límite', dataKey: 'fechaLimite' }, { header: 'Estado', dataKey: 'estado' }]); }}><IconDownload size={14} />PDF</Button>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-xl p-6 border border-amber-200">
                    <div className="flex items-center gap-3 mb-4"><div className="p-2 bg-amber-500 rounded-lg"><IconBook className="text-white" size={20} /></div><h4 className="font-bold text-gray-800">Cursos</h4></div>
                    <p className="text-sm text-gray-600 mb-4">Listado de cursos por institución</p>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => { const data = cursos.map(curso => ({ ID: curso.id, Nombre: curso.nombre, Jornada: curso.jornada, Institución: instituciones.find(i => i.id === curso.institucionId)?.nombre || '-', Estado: curso.activo ? 'Activo' : 'Inactivo' })); exportToExcel(data, 'Cursos', 'Cursos'); }}><IconDownload size={14} />Excel</Button>
                      <Button size="sm" variant="outline" onClick={() => { const data = cursos.map(curso => ({ id: curso.id, nombre: curso.nombre, jornada: curso.jornada, estado: curso.activo ? 'Activo' : 'Inactivo' })); exportToPDF(data, 'Cursos', 'Reporte de Cursos', [{ header: 'ID', dataKey: 'id' }, { header: 'Nombre', dataKey: 'nombre' }, { header: 'Jornada', dataKey: 'jornada' }, { header: 'Estado', dataKey: 'estado' }]); }}><IconDownload size={14} />PDF</Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ==================== TAB CONFIGURACIÓN ==================== */}
            {activeTab === 'configuracion' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-800">Configuración del Sistema</h3>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                      <h4 className="font-semibold text-slate-800 flex items-center gap-2"><IconCalendar className="text-slate-500" size={18} />Períodos Académicos</h4>
                      <Button onClick={() => { setEditingPeriodo(null); setFormPeriodo({ nombre: '', fechaInicio: '', fechaFin: '', institucionId: 1, anio: new Date().getFullYear(), estado: 'planificado' }); setModalPeriodo(true); }} size="sm" variant="ghost" className="flex items-center gap-1.5"><IconPlus size={14} />Nuevo</Button>
                    </div>
                    <div className="p-4 space-y-3 max-h-80 overflow-y-auto">
                      {periodos.length === 0 ? (
                        <div className="text-center py-8 text-slate-500"><IconCalendar className="mx-auto mb-2 text-slate-400" size={32} /><p className="text-sm">No hay períodos registrados</p></div>
                      ) : periodos.slice(0, 5).map(periodo => (
                        <div key={periodo.id} className={`flex items-center justify-between p-4 rounded-xl border ${periodo.estado === 'activo' ? 'bg-gradient-to-r from-teal-50 to-emerald-50/30 border-teal-200/60' : 'bg-slate-50 border-slate-100'}`}>
                          <div className="flex-1">
                            <div className={`font-semibold ${periodo.estado === 'activo' ? 'text-teal-800' : 'text-slate-700'}`}>{periodo.nombre}</div>
                            <div className={`text-sm ${periodo.estado === 'activo' ? 'text-teal-600/80' : 'text-slate-500'}`}>{periodo.fechaInicio} - {periodo.fechaFin}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${periodo.estado === 'activo' ? 'bg-teal-100 text-teal-700' : periodo.estado === 'cerrado' ? 'bg-slate-100 text-slate-500' : 'bg-blue-100 text-blue-700'}`}>{periodo.estado === 'activo' ? 'Activo' : periodo.estado === 'cerrado' ? 'Cerrado' : 'Planificado'}</span>
                            <button onClick={() => openEditPeriodo(periodo)} className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"><IconEdit size={16} /></button>
                            <button onClick={() => handleDeletePeriodo(periodo.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><IconTrash size={16} /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-6 mt-6">
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                      <h4 className="font-semibold text-slate-800 flex items-center gap-2"><IconBook className="text-slate-500" size={18} />Grados</h4>
                      <Button onClick={() => { setEditingGrado(null); setFormGrado({ nombre: '', orden: grados.length, institucionId: 1 }); setModalGrado(true); }} size="sm" variant="ghost" className="flex items-center gap-1.5"><IconPlus size={14} />Nuevo</Button>
                    </div>
                    <div className="p-4 space-y-2 max-h-80 overflow-y-auto">
                      {grados.length === 0 ? (
                        <div className="text-center py-8 text-slate-500"><IconBook className="mx-auto mb-2 text-slate-400" size={32} /><p className="text-sm">No hay grados registrados</p></div>
                      ) : grados.map(grado => (
                        <div key={grado.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white font-bold text-xs">{grado.orden}</div>
                            <span className="font-medium text-slate-700">{grado.nombre}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <button onClick={() => openEditGrado(grado)} className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"><IconEdit size={16} /></button>
                            <button onClick={() => handleDeleteGrado(grado.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><IconTrash size={16} /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                      <h4 className="font-semibold text-slate-800 flex items-center gap-2"><IconUsers className="text-slate-500" size={18} />Cursos</h4>
                      <Button onClick={() => { setEditingCurso(null); setFormCurso({ nombre: '', gradoId: grados[0]?.id || 1, jornada: 'mañana', institucionId: 1, docenteDirectorId: undefined }); setModalCurso(true); }} size="sm" variant="ghost" className="flex items-center gap-1.5"><IconPlus size={14} />Nuevo</Button>
                    </div>
                    <div className="p-4 space-y-2 max-h-80 overflow-y-auto">
                      {cursos.length === 0 ? (
                        <div className="text-center py-8 text-slate-500"><IconUsers className="mx-auto mb-2 text-slate-400" size={32} /><p className="text-sm">No hay cursos registrados</p></div>
                      ) : cursos.slice(0, 10).map(curso => {
                        const grado = grados.find(g => g.id === curso.gradoId);
                        return (
                          <div key={curso.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors">
                            <div><div className="font-medium text-slate-700">{curso.nombre}</div><div className="text-xs text-slate-500">{grado?.nombre} - {curso.jornada}</div></div>
                            <div className="flex items-center gap-1">
                              <button onClick={() => openEditCurso(curso)} className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"><IconEdit size={16} /></button>
                              <button onClick={() => handleDeleteCurso(curso.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><IconTrash size={16} /></button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ==================== MODALES ==================== */}

      {/* Modal Nueva Institución */}
      <Modal isOpen={modalInstitucion} onClose={() => { setModalInstitucion(false); setEditingInstitucion(null); setPasoActualFormulario(1); setError(null); }} title={editingInstitucion ? 'Editar Institución' : 'Nueva Institución'} size="xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            {[1, 2, 3, 4, 5].map((paso) => (
              <button key={paso} onClick={() => irAPaso(paso)} className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${paso === pasoActualFormulario ? 'bg-teal-600 text-white' : paso < pasoActualFormulario ? 'bg-teal-100 text-teal-600 hover:bg-teal-200' : 'bg-gray-200 text-gray-500 hover:bg-gray-300'}`}>{paso}</button>
            ))}
          </div>
          <div className="text-sm text-gray-600">Paso {pasoActualFormulario} de 5</div>
        </div>
        <div className="min-h-[400px]">
          {pasoActualFormulario === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Información Básica</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <FormFieldInput name="nombre" label="Nombre de la institución *" placeholder="I.E. Nombre" value={formInstitucion.nombre} onChange={(e) => setFormInstitucion({ ...formInstitucion, nombre: e.target.value })} required />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Naturaleza *</label>
                  <select value={formInstitucion.naturaleza} onChange={(e) => setFormInstitucion({ ...formInstitucion, naturaleza: e.target.value as 'publica' | 'privada' })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500">
                    <option value="publica">Pública</option><option value="privada">Privada</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Municipio *</label>
                <select value={formInstitucion.municipioId} onChange={(e) => setFormInstitucion({ ...formInstitucion, municipioId: parseInt(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500">
                  {catalogos.municipios.length > 0 ? catalogos.municipios.map((municipio) => (<option key={municipio.id} value={municipio.id}>{municipio.nombre}{municipio.departamento ? ` - ${municipio.departamento.nombre}` : ''}</option>)) : <option value={1}>Cargando municipios...</option>}
                </select>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <FormFieldInput name="codigoDane" label="Código DANE" placeholder="Ej: 119001000123" value={formInstitucion.codigoDane} onChange={(e) => setFormInstitucion({ ...formInstitucion, codigoDane: e.target.value })} />
                <FormFieldInput name="nit" label="NIT" placeholder="Ej: 800123456-7" value={formInstitucion.nit} onChange={(e) => setFormInstitucion({ ...formInstitucion, nit: e.target.value })} />
              </div>
            </div>
          )}
          {pasoActualFormulario === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Información Educativa</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Niveles Educativos</label>
                <div className="grid md:grid-cols-2 gap-3">
                  {(nivelesEducativosCombinados || []).map((nivel) => (
                    <label key={nivel.id || nivel.nombre} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input type="checkbox" checked={(formInstitucion.nivelesEducativos || []).includes(nivel.id || nivel.nombre)} onChange={(e) => { const nivelesActuales = formInstitucion.nivelesEducativos || []; const nivelId = nivel.id || nivel.nombre; setFormInstitucion({ ...formInstitucion, nivelesEducativos: e.target.checked ? [...nivelesActuales, nivelId] : nivelesActuales.filter(id => id !== nivelId) }); }} className="rounded border-gray-300 text-teal-600 mt-1" />
                      <div className="flex-1"><div className="font-medium text-gray-800">{nivel.nombre}</div>{nivel.descripcion && <div className="text-xs text-gray-500 mt-1">{nivel.descripcion}</div>}</div>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Modalidad</label>
                <select value={formInstitucion.modalidad} onChange={(e) => setFormInstitucion({ ...formInstitucion, modalidad: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500">
                  {catalogos.modalidades.length > 0 ? catalogos.modalidades.map((m) => (<option key={m.id} value={m.id}>{m.nombre}</option>)) : <option value="academica">Académica</option>}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Jornadas</label>
                <div className="grid md:grid-cols-3 gap-2">
                  {(catalogos.jornadas || []).map((jornada) => (
                    <label key={jornada.id} className="flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={(formInstitucion.jornadas || []).includes(jornada.id)} onChange={(e) => { const jornadasActuales = formInstitucion.jornadas || []; setFormInstitucion({ ...formInstitucion, jornadas: e.target.checked ? [...jornadasActuales, jornada.id] : jornadasActuales.filter(id => id !== jornada.id) }); }} className="rounded border-gray-300 text-teal-600" />
                      {jornada.nombre}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}
          {pasoActualFormulario === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Información de Contacto</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <FormFieldInput name="telefono" label="Teléfono" placeholder="3001234567" value={formInstitucion.telefono} onChange={(e) => setFormInstitucion({ ...formInstitucion, telefono: e.target.value })} />
                <FormFieldInput name="correo" label="Correo electrónico" placeholder="institucion@correo.com" type="email" value={formInstitucion.correo} onChange={(e) => setFormInstitucion({ ...formInstitucion, correo: e.target.value })} />
              </div>
              <FormFieldInput name="direccion" label="Dirección" placeholder="Calle 123 #45-67" value={formInstitucion.direccion} onChange={(e) => setFormInstitucion({ ...formInstitucion, direccion: e.target.value })} />
              <div className="grid md:grid-cols-2 gap-4">
                <FormFieldInput name="correoInstitucional" label="Correo Institucional" placeholder="contacto@institucion.edu.co" type="email" value={formInstitucion.correoInstitucional} onChange={(e) => setFormInstitucion({ ...formInstitucion, correoInstitucional: e.target.value })} />
                <FormFieldInput name="correoRectoria" label="Correo Rectoría" placeholder="rector@institucion.edu.co" type="email" value={formInstitucion.correoRectoria} onChange={(e) => setFormInstitucion({ ...formInstitucion, correoRectoria: e.target.value })} />
              </div>
            </div>
          )}
          {pasoActualFormulario === 4 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Información del Rector</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <FormFieldInput name="rectorNombre" label="Nombre Completo del Rector" placeholder="Juan Pérez" value={formInstitucion.rectorNombre} onChange={(e) => setFormInstitucion({ ...formInstitucion, rectorNombre: e.target.value })} />
                <FormFieldInput name="rectorDocumento" label="Documento del Rector" placeholder="12345678" value={formInstitucion.rectorDocumento} onChange={(e) => setFormInstitucion({ ...formInstitucion, rectorDocumento: e.target.value })} />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <FormFieldInput name="rectorTelefono" label="Teléfono del Rector" placeholder="3009876543" value={formInstitucion.rectorTelefono} onChange={(e) => setFormInstitucion({ ...formInstitucion, rectorTelefono: e.target.value })} />
                <FormFieldInput name="rectorCorreo" label="Correo del Rector" placeholder="rector@institucion.edu.co" type="email" value={formInstitucion.rectorCorreo} onChange={(e) => setFormInstitucion({ ...formInstitucion, rectorCorreo: e.target.value })} />
              </div>
            </div>
          )}
          {pasoActualFormulario === 5 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Configuración de Grados y Cursos</h3>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">Genera los grados según los niveles educativos seleccionados y asigna cursos a cada grado.</p>
              </div>
              <div className="space-y-4">
                {nivelesEducativosCombinados.filter(nivel => (formInstitucion.nivelesEducativos || []).includes(nivel.id || nivel.nombre)).map((nivel) => (
                  <div key={nivel.id || nivel.nombre} className="border rounded-lg p-4 bg-white">
                    <div className="flex items-center gap-3 mb-4">
                      <h4 className="font-semibold text-gray-800 text-lg">{nivel.nombre}</h4>
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">{nivel.abreviatura}</span>
                    </div>
                    <Button onClick={() => generarGradosParaNivel(nivel.id || nivel.nombre)} disabled={estructuraAcademica.loadingGrados} variant="outline" size="sm">
                      {estructuraAcademica.loadingGrados ? 'Generando...' : `Generar grados para ${nivel.nombre}`}
                    </Button>
                    {estructuraAcademica.gradosGenerados.find(g => g.nivelId === (nivel.id || nivel.nombre)) && <span className="ml-3 text-sm text-green-600">✓ Grados generados</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="flex justify-between items-center pt-6 border-t">
            <div>{pasoActualFormulario > 1 && <Button variant="ghost" onClick={pasoAnterior}>← Anterior</Button>}</div>
            <div className="flex gap-2">
              {pasoActualFormulario < 5 ? (
                <Button onClick={siguientePaso}>Siguiente →</Button>
              ) : (
                <Button onClick={editingInstitucion ? handleUpdateInstitucion : handleCreateInstitucion} disabled={creatingInstitucion}>
                  {creatingInstitucion ? 'Creando...' : editingInstitucion ? 'Actualizar' : 'Crear'} Institución
                </Button>
              )}
            </div>
          </div>
        </div>
      </Modal>

      {/* Modal Nuevo Usuario */}
      <Modal isOpen={modalUsuario} onClose={() => { setModalUsuario(false); setEditingUsuario(null); setFormUsuario({ nombre: '', apellidos: '', correo: '', telefono: '', documento: '', tipoDocumento: 'cc', contrasena: '', rol: 'docente_aula', institucionId: 1, telefonoEmergencia: '', personaEmergencia: '', direccion: '', esDirectorGrado: false, gradoAsignado: '', areaQueOrienta: '', centroInteres: '' }); setError(null); }} title={editingUsuario ? 'Editar Usuario' : 'Nuevo Usuario'} size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormFieldInput name="nombre" label="Nombre" placeholder="Nombre" value={formUsuario.nombre} onChange={(e) => setFormUsuario({ ...formUsuario, nombre: e.target.value })} required />
            <FormFieldInput name="apellidos" label="Apellidos" placeholder="Apellidos" value={formUsuario.apellidos} onChange={(e) => setFormUsuario({ ...formUsuario, apellidos: e.target.value })} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Tipo de Documento</label>
              <select className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 transition-all" value={formUsuario.tipoDocumento} onChange={(e) => setFormUsuario({ ...formUsuario, tipoDocumento: e.target.value as any })}>
                <option value="cc">Cédula</option><option value="ti">Tarjeta de Identidad</option><option value="ce">Cédula de Extranjería</option><option value="pasaporte">Pasaporte</option>
              </select>
            </div>
            <FormFieldInput name="documento" label="Número de Documento" placeholder="1234567890" value={formUsuario.documento} onChange={(e) => setFormUsuario({ ...formUsuario, documento: e.target.value })} required />
          </div>
          {(formUsuario.rol === 'rector' || formUsuario.rol === 'coordinador') && (
            <FormFieldInput name="contrasena" label="Contraseña" type="password" placeholder="Mínimo 8 caracteres" value={formUsuario.contrasena} onChange={(e) => setFormUsuario({ ...formUsuario, contrasena: e.target.value })} required />
          )}
          <FormFieldInput name="correo" label="Correo electrónico" type="email" placeholder="usuario@correo.com" value={formUsuario.correo} onChange={(e) => setFormUsuario({ ...formUsuario, correo: e.target.value })} required />
          <FormFieldInput name="telefono" label="Teléfono" placeholder="3001234567" value={formUsuario.telefono} onChange={(e) => setFormUsuario({ ...formUsuario, telefono: e.target.value })} />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Rol</label>
              <select className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 transition-all" value={formUsuario.rol} onChange={(e) => setFormUsuario({ ...formUsuario, rol: e.target.value as any })}>
                <option value="docente_aula">Docente de Aula</option><option value="orientador">Orientador</option><option value="coordinador">Coordinador</option><option value="rector">Rector</option><option value="acudiente">Acudiente</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Institución</label>
              <select className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 transition-all" value={formUsuario.institucionId} onChange={(e) => setFormUsuario({ ...formUsuario, institucionId: parseInt(e.target.value) })}>
                {instituciones.length === 0 ? <option value="">No hay instituciones</option> : instituciones.map(inst => (<option key={inst.id} value={inst.id}>{inst.nombre}</option>))}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" onClick={() => { setModalUsuario(false); setEditingUsuario(null); setError(null); }}>Cancelar</Button>
            <Button onClick={editingUsuario ? handleUpdateUsuario : handleCreateUsuario}>{editingUsuario ? 'Actualizar' : 'Crear'} Usuario</Button>
          </div>
        </div>
      </Modal>

      {/* Modal Período */}
      <Modal isOpen={modalPeriodo} onClose={() => { setModalPeriodo(false); setEditingPeriodo(null); setError(null); }} title={editingPeriodo ? 'Editar Período' : 'Nuevo Período'} size="lg">
        <div className="space-y-4">
          <FormFieldInput name="nombre" label="Nombre del período" placeholder="Ej: Período 1 - 2024" value={formPeriodo.nombre} onChange={(e) => setFormPeriodo({ ...formPeriodo, nombre: e.target.value })} required />
          <div className="grid grid-cols-3 gap-4">
            <FormFieldInput name="fechaInicio" label="Fecha de inicio" type="date" value={formPeriodo.fechaInicio} onChange={(e) => setFormPeriodo({ ...formPeriodo, fechaInicio: e.target.value })} required />
            <FormFieldInput name="fechaFin" label="Fecha de fin" type="date" value={formPeriodo.fechaFin} onChange={(e) => setFormPeriodo({ ...formPeriodo, fechaFin: e.target.value })} required />
            <FormFieldInput name="anio" label="Año" type="number" value={formPeriodo.anio.toString()} onChange={(e) => setFormPeriodo({ ...formPeriodo, anio: parseInt(e.target.value) })} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Estado</label>
              <select className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 transition-all" value={formPeriodo.estado} onChange={(e) => setFormPeriodo({ ...formPeriodo, estado: e.target.value as any })}>
                <option value="planificado">Planificado</option><option value="activo">Activo</option><option value="cerrado">Cerrado</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Institución</label>
              <select className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 transition-all" value={formPeriodo.institucionId} onChange={(e) => setFormPeriodo({ ...formPeriodo, institucionId: parseInt(e.target.value) })}>
                {instituciones.map(inst => (<option key={inst.id} value={inst.id}>{inst.nombre}</option>))}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" onClick={() => { setModalPeriodo(false); setEditingPeriodo(null); setError(null); }}>Cancelar</Button>
            <Button onClick={editingPeriodo ? handleUpdatePeriodo : handleCreatePeriodo}>{editingPeriodo ? 'Actualizar' : 'Crear'} Período</Button>
          </div>
        </div>
      </Modal>

      {/* Modal Grado */}
      <Modal isOpen={modalGrado} onClose={() => { setModalGrado(false); setEditingGrado(null); setError(null); }} title={editingGrado ? 'Editar Grado' : 'Nuevo Grado'} size="md">
        <div className="space-y-4">
          <FormFieldInput name="nombre" label="Nombre del grado" placeholder="Ej: 1° Primaria" value={formGrado.nombre} onChange={(e) => setFormGrado({ ...formGrado, nombre: e.target.value })} required />
          <div className="grid grid-cols-2 gap-4">
            <FormFieldInput name="orden" label="Orden" type="number" placeholder="1" value={formGrado.orden.toString()} onChange={(e) => setFormGrado({ ...formGrado, orden: parseInt(e.target.value) || 0 })} required />
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Institución</label>
              <select className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 transition-all" value={formGrado.institucionId} onChange={(e) => setFormGrado({ ...formGrado, institucionId: parseInt(e.target.value) })}>
                {instituciones.map(inst => (<option key={inst.id} value={inst.id}>{inst.nombre}</option>))}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" onClick={() => { setModalGrado(false); setEditingGrado(null); setError(null); }}>Cancelar</Button>
            <Button onClick={editingGrado ? handleUpdateGrado : handleCreateGrado}>{editingGrado ? 'Actualizar' : 'Crear'} Grado</Button>
          </div>
        </div>
      </Modal>

      {/* Modal Curso */}
      <Modal isOpen={modalCurso} onClose={() => { setModalCurso(false); setEditingCurso(null); setError(null); }} title={editingCurso ? 'Editar Curso' : 'Nuevo Curso'} size="lg">
        <div className="space-y-4">
          <FormFieldInput name="nombre" label="Nombre del curso" placeholder="Ej: 6-A" value={formCurso.nombre} onChange={(e) => setFormCurso({ ...formCurso, nombre: e.target.value })} required />
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Grado</label>
              <select className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 transition-all" value={formCurso.gradoId} onChange={(e) => setFormCurso({ ...formCurso, gradoId: parseInt(e.target.value) })}>
                {grados.map(grado => (<option key={grado.id} value={grado.id}>{grado.nombre}</option>))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Jornada</label>
              <select className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 transition-all" value={formCurso.jornada} onChange={(e) => setFormCurso({ ...formCurso, jornada: e.target.value as any })}>
                <option value="mañana">Mañana</option><option value="tarde">Tarde</option><option value="completa">Completa</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Institución</label>
              <select className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 transition-all" value={formCurso.institucionId} onChange={(e) => setFormCurso({ ...formCurso, institucionId: parseInt(e.target.value) })}>
                {instituciones.map(inst => (<option key={inst.id} value={inst.id}>{inst.nombre}</option>))}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" onClick={() => { setModalCurso(false); setEditingCurso(null); setError(null); }}>Cancelar</Button>
            <Button onClick={editingCurso ? handleUpdateCurso : handleCreateCurso}>{editingCurso ? 'Actualizar' : 'Crear'} Curso</Button>
          </div>
        </div>
      </Modal>

      {/* Modal Institución Completa */}
      <Modal isOpen={modalInstitucionCompleta} onClose={() => setModalInstitucionCompleta(false)} title="Nueva Institución Completa" size="full">
        <div className="max-h-[80vh] overflow-y-auto">
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b">Datos Básicos de la Institución</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-2">Nombre *</label><input type="text" value={formInstitucionCompleta.institucion.nombre} onChange={(e) => actualizarInstitucion('nombre', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="Colegio Ejemplo" required /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-2">Naturaleza *</label><select value={formInstitucionCompleta.institucion.naturaleza} onChange={(e) => actualizarInstitucion('naturaleza', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"><option value="publica">Pública</option><option value="privada">Privada</option></select></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-2">Municipio *</label><select value={formInstitucionCompleta.institucion.municipioId} onChange={(e) => actualizarInstitucion('municipioId', parseInt(e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"><option value="">Seleccionar municipio</option>{catalogos.municipios.map(municipio => (<option key={municipio.id} value={municipio.id}>{municipio.nombre}</option>))}</select></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-2">Código DANE</label><input type="text" value={formInstitucionCompleta.institucion.codigoDane} onChange={(e) => actualizarInstitucion('codigoDane', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="119000001" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-2">NIT</label><input type="text" value={formInstitucionCompleta.institucion.nit} onChange={(e) => actualizarInstitucion('nit', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="8000001-8" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-2">Teléfono</label><input type="tel" value={formInstitucionCompleta.institucion.telefono} onChange={(e) => actualizarInstitucion('telefono', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="3001234567" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-2">Correo</label><input type="email" value={formInstitucionCompleta.institucion.correo} onChange={(e) => actualizarInstitucion('correo', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="colegio@ejemplo.com" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-2">Dirección</label><input type="text" value={formInstitucionCompleta.institucion.direccion} onChange={(e) => actualizarInstitucion('direccion', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="Calle 5 # 10-20" /></div>
            </div>
          </div>
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b">Datos del Rector</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-2">Nombre del Rector *</label><input type="text" value={formInstitucionCompleta.institucion.rectorNombre} onChange={(e) => actualizarInstitucion('rectorNombre', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="Juan Pérez" required /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-2">Documento del Rector *</label><input type="text" value={formInstitucionCompleta.institucion.rectorDocumento} onChange={(e) => actualizarInstitucion('rectorDocumento', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="12345678" required /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-2">Teléfono del Rector *</label><input type="tel" value={formInstitucionCompleta.institucion.rectorTelefono} onChange={(e) => actualizarInstitucion('rectorTelefono', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="3001234567" required /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-2">Correo del Rector *</label><input type="email" value={formInstitucionCompleta.institucion.rectorCorreo} onChange={(e) => actualizarInstitucion('rectorCorreo', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="rector@colegio.edu" required /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-2">Contraseña inicial del Rector (opcional)</label><input type="password" value={formInstitucionCompleta.institucion.rectorContrasena} onChange={(e) => actualizarInstitucion('rectorContrasena', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="Ej: Temp123456" /><div className="text-xs text-gray-500 mt-1">Si no se establece, se usará una contraseña temporal.</div></div>
            </div>
          </div>
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b">Configuración Académica</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Jornadas *</label>
                <div className="space-y-2">{catalogos.jornadas.map(jornada => (<label key={jornada.id} className="flex items-center"><input type="checkbox" checked={formInstitucionCompleta.institucion.jornadas.includes(jornada.id)} onChange={() => toggleJornada(jornada.id)} className="mr-2" />{jornada.nombre}</label>))}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Niveles Educativos *</label>
                <div className="space-y-2">{nivelesEducativosCombinados.map(nivel => (<label key={nivel.id || nivel.nombre} className="flex items-center"><input type="checkbox" checked={formInstitucionCompleta.institucion.nivelesEducativos.includes(nivel.nombre)} onChange={() => toggleNivelEducativo(nivel.nombre)} className="mr-2" />{nivel.nombre}</label>))}</div>
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Modalidad *</label>
              <select value={formInstitucionCompleta.institucion.modalidad} onChange={(e) => actualizarInstitucion('modalidad', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500">
                <option value="academica">Académica</option><option value="tecnica">Técnica</option><option value="artistica">Artística</option>
              </select>
            </div>
          </div>
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4 pb-2 border-b">
              <h3 className="text-xl font-semibold text-gray-800">Grados y Cursos</h3>
              <button onClick={agregarGradoCompleto} className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors">+ Agregar Grado</button>
            </div>
            {formInstitucionCompleta.grados.map((grado, gradoIndex) => (
              <div key={gradoIndex} className="mb-6 p-4 border border-gray-200 rounded-lg">
                <div className="flex justify-between items-start mb-4">
                  <h4 className="text-lg font-medium text-gray-700">Grado {gradoIndex + 1}</h4>
                  <button onClick={() => eliminarGradoCompleto(gradoIndex)} className="text-red-600 hover:text-red-800">Eliminar Grado</button>
                </div>
                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  <div><label className="block text-sm font-medium text-gray-700 mb-2">Nombre del Grado *</label><input type="text" value={grado.nombre} onChange={(e) => actualizarGradoCompleto(gradoIndex, 'nombre', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="10°" required /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-2">Orden *</label><input type="number" value={grado.orden} onChange={(e) => actualizarGradoCompleto(gradoIndex, 'orden', parseInt(e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="10" required /></div>
                  <div className="flex items-end"><button onClick={() => agregarCursoCompleto(gradoIndex)} className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">+ Agregar Curso</button></div>
                </div>
                <div className="space-y-2">
                  <h5 className="text-sm font-medium text-gray-600">Cursos:</h5>
                  {grado.cursos.map((curso, cursoIndex) => (
                    <div key={cursoIndex} className="flex gap-2 items-center p-2 bg-gray-50 rounded">
                      <input type="text" value={curso.nombre} onChange={(e) => actualizarCursoCompleto(gradoIndex, cursoIndex, 'nombre', e.target.value)} className="flex-1 px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="10A" required />
                      <select value={curso.jornada} onChange={(e) => actualizarCursoCompleto(gradoIndex, cursoIndex, 'jornada', e.target.value)} className="px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-500">
                        <option value="manana">Mañana</option><option value="tarde">Tarde</option><option value="noche">Noche</option><option value="completa">Completa</option>
                      </select>
                      <button onClick={() => eliminarCursoCompleto(gradoIndex, cursoIndex)} className="text-red-600 hover:text-red-800">Eliminar</button>
                    </div>
                  ))}
                  {grado.cursos.length === 0 && <p className="text-gray-500 text-sm">No hay cursos configurados</p>}
                </div>
              </div>
            ))}
            {formInstitucionCompleta.grados.length === 0 && <p className="text-gray-500 text-center py-4">No hay grados configurados. Agrega al menos un grado.</p>}
          </div>
          <div className="flex justify-end gap-4 pt-6 border-t">
            <button onClick={() => setModalInstitucionCompleta(false)} className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors">Cancelar</button>
            <button onClick={handleCreateInstitucionCompleta} disabled={creatingInstitucion || !formInstitucionCompleta.institucion.nombre || !formInstitucionCompleta.institucion.rectorNombre || formInstitucionCompleta.grados.length === 0} className="px-6 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              {creatingInstitucion ? 'Creando...' : 'Crear Institución Completa'}
            </button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}