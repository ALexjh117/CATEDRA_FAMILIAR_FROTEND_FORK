import { useState, useEffect } from 'react';
import { 
  getSession, 
  getEstudiantes, 
  createEstudiante, 
  updateEstudiante, 
  deleteEstudiante,
  getUsuarios,
  createUsuario,
  updateUsuario,
  getCursos,
  getGrados,
  vincularEstudianteAcudiente,
  getAcudientesDeEstudiante,
  desvincularEstudianteAcudiente
} from '../api/endpoints';
import { type Estudiante, type Usuario, type Curso, type Grado } from '../mocks/data';
import DashboardLayout from '../components/DashboardLayout';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import FormFieldInput from '../components/ui/FormFieldInput';
import BulkUploadWizard from '../components/BulkUploadWizard';
import {
  IconUsers,
  IconPlus,
  IconEdit,
  IconTrash,
  IconSearch,
  IconFileUpload,
  IconLink,
  IconBook,
  IconUserPlus,
  IconDownload,
  IconFilter
} from '../components/ui/Icons';

// Componente auxiliar para mostrar vínculos
function VinculosEstudiante({ estudianteId }: { estudianteId: number }) {
  const [vinculos, setVinculos] = useState<Array<{
    id: number;
    acudiente: Usuario;
    parentesco: string;
    esPrincipal: boolean;
  }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVinculos();
  }, [estudianteId]);

  const loadVinculos = async () => {
    setLoading(true);
    const result = await getAcudientesDeEstudiante(estudianteId);
    if (result.success) {
      setVinculos(result.vinculos || []);
    }
    setLoading(false);
  };

  const handleDesvincular = async (vinculoId: number, nombreAcudiente: string) => {
    if (!confirm(`¿Está seguro de desvincular a ${nombreAcudiente}?`)) return;
    
    const result = await desvincularEstudianteAcudiente(vinculoId);
    if (result.success) {
      await loadVinculos();
    }
  };

  if (loading) {
    return <LoadingSpinner size="sm" text="Cargando vínculos..." />;
  }

  if (vinculos.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500">
        <IconLink className="mx-auto mb-2 text-slate-400" size={32} />
        <p className="text-sm">No hay acudientes vinculados</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {vinculos.map(v => (
        <div key={v.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
              {v.acudiente.nombre[0]}{v.acudiente.apellidos?.[0] || ''}
            </div>
            <div>
              <div className="font-medium text-slate-800">
                {v.acudiente.nombre} {v.acudiente.apellidos}
                {v.esPrincipal && (
                  <span className="ml-2 px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs rounded-full font-semibold">
                    Principal
                  </span>
                )}
              </div>
              <div className="text-sm text-slate-500">
                {v.parentesco.charAt(0).toUpperCase() + v.parentesco.slice(1)} • {v.acudiente.documento}
              </div>
            </div>
          </div>
          <button
            onClick={() => handleDesvincular(v.id, `${v.acudiente.nombre} ${v.acudiente.apellidos}`)}
            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <IconTrash size={18} />
          </button>
        </div>
      ))}
    </div>
  );
}

export default function DashboardCoordinadorPage() {
  const session = getSession();
  const user = session?.user;
  
  const [loading, setLoading] = useState(true);
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [acudientes, setAcudientes] = useState<Usuario[]>([]);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [grados, setGrados] = useState<Grado[]>([]);
  const [activeTab, setActiveTab] = useState<'estudiantes' | 'acudientes' | 'vinculacion' | 'carga-masiva'>('estudiantes');
  
  // Filtros y búsqueda
  const [busqueda, setBusqueda] = useState('');
  const [filtroCurso, setFiltroCurso] = useState<number | ''>('');
  const [filtroGrado, setFiltroGrado] = useState<number | ''>('');
  
  // Modales
  const [modalEstudiante, setModalEstudiante] = useState(false);
  const [modalAcudiente, setModalAcudiente] = useState(false);
  const [modalVinculacion, setModalVinculacion] = useState(false);
  const [modalCargaMasiva, setModalCargaMasiva] = useState(false);
  
  // Estados de edición
  const [editingEstudiante, setEditingEstudiante] = useState<Estudiante | null>(null);
  const [editingAcudiente, setEditingAcudiente] = useState<Usuario | null>(null);
  const [estudianteVincular, setEstudianteVincular] = useState<Estudiante | null>(null);
  
  // Formularios
  const [formEstudiante, setFormEstudiante] = useState<{
    nombre: string;
    apellidos: string;
    documento: string;
    tipoDocumento: 'ti' | 'cc' | 'ce';
    fechaNacimiento: string;
    cursoId: number;
    institucionId: number;
  }>({
    nombre: '',
    apellidos: '',
    documento: '',
    tipoDocumento: 'ti',
    fechaNacimiento: '',
    cursoId: 1,
    institucionId: user?.institucionId || 1
  });
  
  const [formAcudiente, setFormAcudiente] = useState<{
    nombre: string;
    apellidos: string;
    documento: string;
    tipoDocumento: 'cc' | 'ce' | 'pasaporte';
    telefono: string;
    correo: string;
    institucionId: number;
  }>({
    nombre: '',
    apellidos: '',
    documento: '',
    tipoDocumento: 'cc',
    telefono: '',
    correo: '',
    institucionId: user?.institucionId || 1
  });
  
  const [formVinculacion, setFormVinculacion] = useState({
    acudienteId: 0,
    parentesco: 'padre' as const,
    esPrincipal: false
  });
  
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const institucionId = user?.institucionId;
      
      const [estudiantesData, acudientesData, cursosData, gradosData] = await Promise.all([
        getEstudiantes(institucionId),
        getUsuarios(institucionId, 'acudiente'),
        getCursos(institucionId),
        getGrados(institucionId)
      ]);

      setEstudiantes(estudiantesData);
      setAcudientes(acudientesData);
      setCursos(cursosData);
      setGrados(gradosData);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // HANDLERS ESTUDIANTES
  // ============================================
  
  const handleCreateEstudiante = async () => {
    setError(null);
    const result = await createEstudiante(formEstudiante);
    
    if (result.success) {
      setSuccess(`✅ Estudiante ${formEstudiante.nombre} creado correctamente`);
      await loadData();
      setModalEstudiante(false);
      resetFormEstudiante();
      setTimeout(() => setSuccess(null), 3000);
    } else {
      setError(result.error || 'Error al crear estudiante');
    }
  };

  const handleUpdateEstudiante = async () => {
    if (!editingEstudiante) return;
    setError(null);
    
    const result = await updateEstudiante(editingEstudiante.id, formEstudiante);
    
    if (result.success) {
      setSuccess(`✅ Estudiante actualizado correctamente`);
      await loadData();
      setModalEstudiante(false);
      setEditingEstudiante(null);
      resetFormEstudiante();
      setTimeout(() => setSuccess(null), 3000);
    } else {
      setError(result.error || 'Error al actualizar estudiante');
    }
  };

  const handleDeleteEstudiante = async (id: number, nombre: string) => {
    if (!confirm(`¿Está seguro de retirar al estudiante ${nombre}?`)) return;
    
    const result = await deleteEstudiante(id);
    if (result.success) {
      setSuccess(`✅ Estudiante retirado correctamente`);
      await loadData();
      setTimeout(() => setSuccess(null), 3000);
    } else {
      setError(result.error || 'Error al retirar estudiante');
    }
  };

  const openEditEstudiante = (est: Estudiante) => {
    setEditingEstudiante(est);
    setFormEstudiante({
      nombre: est.nombre,
      apellidos: est.apellidos || '',
      documento: est.documento,
      tipoDocumento: (est.tipoDocumento || 'ti') as 'ti' | 'cc' | 'ce',
      fechaNacimiento: est.fechaNacimiento || '',
      cursoId: est.cursoId,
      institucionId: est.institucionId
    });
    setModalEstudiante(true);
  };

  const resetFormEstudiante = () => {
    setFormEstudiante({
      nombre: '',
      apellidos: '',
      documento: '',
      tipoDocumento: 'ti',
      fechaNacimiento: '',
      cursoId: cursos[0]?.id || 1,
      institucionId: user?.institucionId || 1
    });
  };

  // ============================================
  // HANDLERS ACUDIENTES
  // ============================================
  
  const handleCreateAcudiente = async () => {
    setError(null);
    
    // Contraseña inicial = documento
    const result = await createUsuario({
      ...formAcudiente,
      rol: 'acudiente',
      password: formAcudiente.documento // Contraseña inicial
    });
    
    if (result.success) {
      setSuccess(`✅ Acudiente creado. Contraseña inicial: ${formAcudiente.documento}`);
      await loadData();
      setModalAcudiente(false);
      resetFormAcudiente();
      setTimeout(() => setSuccess(null), 5000);
    } else {
      setError(result.error || 'Error al crear acudiente');
    }
  };

  const handleUpdateAcudiente = async () => {
    if (!editingAcudiente) return;
    setError(null);
    
    const result = await updateUsuario(editingAcudiente.id, formAcudiente);
    
    if (result.success) {
      setSuccess(`✅ Acudiente actualizado correctamente`);
      await loadData();
      setModalAcudiente(false);
      setEditingAcudiente(null);
      resetFormAcudiente();
      setTimeout(() => setSuccess(null), 3000);
    } else {
      setError(result.error || 'Error al actualizar acudiente');
    }
  };

  const openEditAcudiente = (acu: Usuario) => {
    setEditingAcudiente(acu);
    setFormAcudiente({
      nombre: acu.nombre,
      apellidos: acu.apellidos || '',
      documento: acu.documento || '',
      tipoDocumento: (acu.tipoDocumento || 'cc') as 'cc' | 'ce' | 'pasaporte',
      telefono: acu.telefono || '',
      correo: acu.correo || '',
      institucionId: acu.institucionId || user?.institucionId || 1
    });
    setModalAcudiente(true);
  };

  const resetFormAcudiente = () => {
    setFormAcudiente({
      nombre: '',
      apellidos: '',
      documento: '',
      tipoDocumento: 'cc',
      telefono: '',
      correo: '',
      institucionId: user?.institucionId || 1
    });
  };

  // ============================================
  // HANDLERS VINCULACIÓN
  // ============================================
  
  const openVinculacion = (est: Estudiante) => {
    setEstudianteVincular(est);
    setFormVinculacion({
      acudienteId: 0,
      parentesco: 'padre',
      esPrincipal: false
    });
    setModalVinculacion(true);
  };

  const handleVincular = async () => {
    if (!estudianteVincular || !formVinculacion.acudienteId) {
      setError('Debe seleccionar un acudiente');
      return;
    }
    
    setError(null);
    const result = await vincularEstudianteAcudiente({
      estudianteId: estudianteVincular.id,
      acudienteId: formVinculacion.acudienteId,
      parentesco: formVinculacion.parentesco,
      esPrincipal: formVinculacion.esPrincipal
    });
    
    if (result.success) {
      setSuccess(`✅ Acudiente vinculado correctamente`);
      setModalVinculacion(false);
      setEstudianteVincular(null);
      setTimeout(() => setSuccess(null), 3000);
    } else {
      setError(result.error || 'Error al vincular');
    }
  };

  // ============================================
  // FILTROS
  // ============================================
  
  const estudiantesFiltrados = estudiantes.filter(est => {
    const matchBusqueda = busqueda === '' || 
      est.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      est.apellidos?.toLowerCase().includes(busqueda.toLowerCase()) ||
      est.documento.includes(busqueda);
    
    const matchCurso = filtroCurso === '' || est.cursoId === filtroCurso;
    
    const curso = cursos.find(c => c.id === est.cursoId);
    const matchGrado = filtroGrado === '' || curso?.gradoId === filtroGrado;
    
    return matchBusqueda && matchCurso && matchGrado;
  });

  const acudientesFiltrados = acudientes.filter(acu => {
    return busqueda === '' || 
      acu.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      acu.apellidos?.toLowerCase().includes(busqueda.toLowerCase()) ||
      acu.documento?.includes(busqueda);
  });

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" text="Cargando panel de coordinación..." />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="relative overflow-hidden bg-gradient-to-br from-indigo-800 via-indigo-700 to-violet-800 rounded-2xl p-6 text-white">
          <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-bl from-violet-500/10 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-400 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <IconUsers className="text-white" size={28} />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-display font-bold">
                  Panel de Coordinación
                </h1>
                <p className="text-indigo-200 mt-0.5">
                  Gestión académica y administrativa
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl shadow-sm p-5 border border-slate-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-200/50">
                <IconUsers className="text-white" size={22} />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-800">{estudiantes.length}</div>
                <div className="text-sm text-slate-500 font-medium">Estudiantes</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm p-5 border border-slate-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-200/50">
                <IconUserPlus className="text-white" size={22} />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-800">{acudientes.length}</div>
                <div className="text-sm text-slate-500 font-medium">Acudientes</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm p-5 border border-slate-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-200/50">
                <IconBook className="text-white" size={22} />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-800">{cursos.length}</div>
                <div className="text-sm text-slate-500 font-medium">Cursos</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm p-5 border border-slate-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-200/50">
                <IconFilter className="text-white" size={22} />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-800">{grados.length}</div>
                <div className="text-sm text-slate-500 font-medium">Grados</div>
              </div>
            </div>
          </div>
        </div>

        {/* Mensajes */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
            <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        )}

        {success && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3">
            <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <p className="text-sm font-medium text-green-800 flex-1">{success}</p>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="border-b border-slate-100 bg-slate-50/50">
            <nav className="flex gap-1 p-1.5">
              {[
                { id: 'estudiantes', label: 'Estudiantes', Icon: IconUsers },
                { id: 'acudientes', label: 'Acudientes', Icon: IconUserPlus },
                { id: 'vinculacion', label: 'Vinculación', Icon: IconLink },
                { id: 'carga-masiva', label: 'Carga Masiva', Icon: IconFileUpload },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-white text-indigo-700 shadow-sm'
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
            {/* Tab: Estudiantes */}
            {activeTab === 'estudiantes' && (
              <div className="space-y-5">
                {/* Toolbar */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex flex-col md:flex-row gap-3 flex-1">
                    <div className="relative flex-1 max-w-md">
                      <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                      <input
                        type="text"
                        placeholder="Buscar por nombre o documento..."
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
                      />
                    </div>
                    
                    <select
                      value={filtroGrado}
                      onChange={(e) => setFiltroGrado(e.target.value ? parseInt(e.target.value) : '')}
                      className="px-4 py-2.5 border border-slate-200 rounded-xl bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
                    >
                      <option value="">Todos los grados</option>
                      {grados.map(g => (
                        <option key={g.id} value={g.id}>{g.nombre}</option>
                      ))}
                    </select>
                    
                    <select
                      value={filtroCurso}
                      onChange={(e) => setFiltroCurso(e.target.value ? parseInt(e.target.value) : '')}
                      className="px-4 py-2.5 border border-slate-200 rounded-xl bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
                    >
                      <option value="">Todos los cursos</option>
                      {cursos.map(c => (
                        <option key={c.id} value={c.id}>{c.nombre}</option>
                      ))}
                    </select>
                  </div>
                  
                  <Button
                    onClick={() => {
                      setEditingEstudiante(null);
                      resetFormEstudiante();
                      setModalEstudiante(true);
                    }}
                    className="flex items-center gap-2"
                  >
                    <IconPlus size={16} />
                    Nuevo Estudiante
                  </Button>
                </div>

                {/* Tabla */}
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/80">
                        <th className="text-left py-3.5 px-5 font-semibold text-slate-600 text-sm">Estudiante</th>
                        <th className="text-center py-3.5 px-4 font-semibold text-slate-600 text-sm">Documento</th>
                        <th className="text-center py-3.5 px-4 font-semibold text-slate-600 text-sm">Curso</th>
                        <th className="text-center py-3.5 px-4 font-semibold text-slate-600 text-sm">Edad</th>
                        <th className="text-center py-3.5 px-4 font-semibold text-slate-600 text-sm">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {estudiantesFiltrados.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-12 text-center text-slate-500">
                            <IconUsers className="mx-auto mb-3 text-slate-400" size={48} />
                            <p className="font-medium">No se encontraron estudiantes</p>
                            <p className="text-sm">Intenta ajustar los filtros o crear uno nuevo</p>
                          </td>
                        </tr>
                      ) : (
                        estudiantesFiltrados.map(est => {
                          const curso = cursos.find(c => c.id === est.cursoId);
                          const edad = est.fechaNacimiento 
                            ? new Date().getFullYear() - new Date(est.fechaNacimiento).getFullYear()
                            : '-';
                          
                          return (
                            <tr key={est.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                              <td className="py-4 px-5">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                                    {est.nombre[0]}{est.apellidos?.[0] || ''}
                                  </div>
                                  <div>
                                    <div className="font-medium text-slate-800">{est.nombre} {est.apellidos}</div>
                                    <div className="text-sm text-slate-500">{est.tipoDocumento?.toUpperCase()}: {est.documento}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="text-center py-4 px-4 text-slate-600 font-medium">
                                {est.documento}
                              </td>
                              <td className="text-center py-4 px-4">
                                <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-semibold">
                                  {curso?.nombre || 'Sin curso'}
                                </span>
                              </td>
                              <td className="text-center py-4 px-4 text-slate-600 font-medium">
                                {edad} años
                              </td>
                              <td className="text-center py-4 px-4">
                                <div className="flex justify-center gap-1">
                                  <button
                                    onClick={() => openVinculacion(est)}
                                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                    title="Vincular acudiente"
                                  >
                                    <IconLink size={18} />
                                  </button>
                                  <button
                                    onClick={() => openEditEstudiante(est)}
                                    className="p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                                  >
                                    <IconEdit size={18} />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteEstudiante(est.id, `${est.nombre} ${est.apellidos}`)}
                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  >
                                    <IconTrash size={18} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Resumen */}
                <div className="text-sm text-slate-600">
                  Mostrando <span className="font-semibold text-indigo-600">{estudiantesFiltrados.length}</span> de <span className="font-semibold">{estudiantes.length}</span> estudiantes
                </div>
              </div>
            )}

            {/* Tab: Acudientes */}
            {activeTab === 'acudientes' && (
              <div className="space-y-5">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="relative flex-1 max-w-md">
                    <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                      type="text"
                      placeholder="Buscar acudiente..."
                      value={busqueda}
                      onChange={(e) => setBusqueda(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
                    />
                  </div>
                  
                  <Button
                    onClick={() => {
                      setEditingAcudiente(null);
                      resetFormAcudiente();
                      setModalAcudiente(true);
                    }}
                    className="flex items-center gap-2"
                  >
                    <IconPlus size={16} />
                    Nuevo Acudiente
                  </Button>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/80">
                        <th className="text-left py-3.5 px-5 font-semibold text-slate-600 text-sm">Acudiente</th>
                        <th className="text-center py-3.5 px-4 font-semibold text-slate-600 text-sm">Documento</th>
                        <th className="text-center py-3.5 px-4 font-semibold text-slate-600 text-sm">Teléfono</th>
                        <th className="text-center py-3.5 px-4 font-semibold text-slate-600 text-sm">Correo</th>
                        <th className="text-center py-3.5 px-4 font-semibold text-slate-600 text-sm">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {acudientesFiltrados.map(acu => (
                        <tr key={acu.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                          <td className="py-4 px-5">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                                {acu.nombre[0]}{acu.apellidos?.[0] || ''}
                              </div>
                              <div>
                                <div className="font-medium text-slate-800">{acu.nombre} {acu.apellidos}</div>
                              </div>
                            </div>
                          </td>
                          <td className="text-center py-4 px-4 text-slate-600">
                            {acu.tipoDocumento?.toUpperCase()}: {acu.documento}
                          </td>
                          <td className="text-center py-4 px-4 text-slate-600">
                            {acu.telefono || '-'}
                          </td>
                          <td className="text-center py-4 px-4 text-slate-600 text-sm">
                            {acu.correo || '-'}
                          </td>
                          <td className="text-center py-4 px-4">
                            <div className="flex justify-center gap-1">
                              <button
                                onClick={() => openEditAcudiente(acu)}
                                className="p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                              >
                                <IconEdit size={18} />
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

            {/* Tab: Vinculación */}
            {activeTab === 'vinculacion' && (
              <div className="space-y-5">
                {/* Selector de estudiante */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Seleccionar Estudiante
                  </label>
                  <select
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
                    value={estudianteVincular?.id || ''}
                    onChange={(e) => {
                      const est = estudiantes.find(s => s.id === parseInt(e.target.value));
                      setEstudianteVincular(est || null);
                    }}
                  >
                    <option value="">Seleccione un estudiante...</option>
                    {estudiantes.map(est => (
                      <option key={est.id} value={est.id}>
                        {est.nombre} {est.apellidos} - {est.documento}
                      </option>
                    ))}
                  </select>
                </div>

                {estudianteVincular && (
                  <div className="space-y-4">
                    {/* Info del estudiante */}
                    <div className="bg-gradient-to-r from-indigo-50 to-violet-50 border border-indigo-200 rounded-xl p-5">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg">
                          {estudianteVincular.nombre[0]}{estudianteVincular.apellidos?.[0] || ''}
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-slate-800">
                            {estudianteVincular.nombre} {estudianteVincular.apellidos}
                          </h3>
                          <p className="text-sm text-slate-600">
                            {estudianteVincular.tipoDocumento?.toUpperCase()}: {estudianteVincular.documento}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Acudientes vinculados */}
                    <div className="bg-white border border-slate-200 rounded-xl p-5">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-bold text-slate-800">Acudientes Vinculados</h4>
                        <Button
                          size="sm"
                          onClick={() => {
                            setFormVinculacion({
                              acudienteId: 0,
                              parentesco: 'padre',
                              esPrincipal: false
                            });
                            setModalVinculacion(true);
                          }}
                        >
                          <IconPlus size={14} className="mr-1" />
                          Vincular Nuevo
                        </Button>
                      </div>
                      
                      <VinculosEstudiante estudianteId={estudianteVincular.id} />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab: Carga Masiva */}
            {activeTab === 'carga-masiva' && (
              <div className="max-w-3xl mx-auto">
                <BulkUploadWizard 
                  institucionId={user?.institucionId || 1}
                  onClose={() => {
                    setModalCargaMasiva(false);
                    loadData(); // Recargar datos después de la carga masiva
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Nuevo/Editar Estudiante */}
      <Modal
        isOpen={modalEstudiante}
        onClose={() => {
          setModalEstudiante(false);
          setEditingEstudiante(null);
          resetFormEstudiante();
          setError(null);
        }}
        title={editingEstudiante ? 'Editar Estudiante' : 'Nuevo Estudiante'}
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormFieldInput
              name="nombre"
              label="Nombres"
              placeholder="Nombres del estudiante"
              value={formEstudiante.nombre}
              onChange={(e) => setFormEstudiante({ ...formEstudiante, nombre: e.target.value })}
              required
            />
            <FormFieldInput
              name="apellidos"
              label="Apellidos"
              placeholder="Apellidos del estudiante"
              value={formEstudiante.apellidos}
              onChange={(e) => setFormEstudiante({ ...formEstudiante, apellidos: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Tipo Doc.</label>
              <select
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
                value={formEstudiante.tipoDocumento}
                onChange={(e) => setFormEstudiante({ ...formEstudiante, tipoDocumento: e.target.value as any })}
              >
                <option value="ti">TI</option>
                <option value="cc">CC</option>
                <option value="ce">CE</option>
              </select>
            </div>
            <FormFieldInput
              name="documento"
              label="Número de Documento"
              placeholder="1234567890"
              value={formEstudiante.documento}
              onChange={(e) => setFormEstudiante({ ...formEstudiante, documento: e.target.value })}
              required
              className="col-span-2"
            />
          </div>

          <FormFieldInput
            name="fechaNacimiento"
            label="Fecha de Nacimiento"
            type="date"
            value={formEstudiante.fechaNacimiento}
            onChange={(e) => setFormEstudiante({ ...formEstudiante, fechaNacimiento: e.target.value })}
            required
          />

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Curso</label>
            <select
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
              value={formEstudiante.cursoId}
              onChange={(e) => setFormEstudiante({ ...formEstudiante, cursoId: parseInt(e.target.value) })}
            >
              {cursos.map(c => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="ghost"
              onClick={() => {
                setModalEstudiante(false);
                setEditingEstudiante(null);
                resetFormEstudiante();
                setError(null);
              }}
            >
              Cancelar
            </Button>
            <Button onClick={editingEstudiante ? handleUpdateEstudiante : handleCreateEstudiante}>
              {editingEstudiante ? 'Actualizar' : 'Crear'} Estudiante
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal Nuevo/Editar Acudiente */}
      <Modal
        isOpen={modalAcudiente}
        onClose={() => {
          setModalAcudiente(false);
          setEditingAcudiente(null);
          resetFormAcudiente();
          setError(null);
        }}
        title={editingAcudiente ? 'Editar Acudiente' : 'Nuevo Acudiente'}
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormFieldInput
              name="nombre"
              label="Nombres"
              placeholder="Nombres del acudiente"
              value={formAcudiente.nombre}
              onChange={(e) => setFormAcudiente({ ...formAcudiente, nombre: e.target.value })}
              required
            />
            <FormFieldInput
              name="apellidos"
              label="Apellidos"
              placeholder="Apellidos del acudiente"
              value={formAcudiente.apellidos}
              onChange={(e) => setFormAcudiente({ ...formAcudiente, apellidos: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Tipo Doc.</label>
              <select
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
                value={formAcudiente.tipoDocumento}
                onChange={(e) => setFormAcudiente({ ...formAcudiente, tipoDocumento: e.target.value as any })}
              >
                <option value="cc">CC</option>
                <option value="ce">CE</option>
                <option value="pasaporte">Pasaporte</option>
              </select>
            </div>
            <FormFieldInput
              name="documento"
              label="Número de Documento"
              placeholder="1234567890"
              value={formAcudiente.documento}
              onChange={(e) => setFormAcudiente({ ...formAcudiente, documento: e.target.value })}
              required
              className="col-span-2"
            />
          </div>

          <FormFieldInput
            name="telefono"
            label="Teléfono"
            placeholder="3001234567"
            value={formAcudiente.telefono}
            onChange={(e) => setFormAcudiente({ ...formAcudiente, telefono: e.target.value })}
            required
          />

          <FormFieldInput
            name="correo"
            label="Correo electrónico (opcional)"
            type="email"
            placeholder="acudiente@correo.com"
            value={formAcudiente.correo}
            onChange={(e) => setFormAcudiente({ ...formAcudiente, correo: e.target.value })}
          />

          {!editingAcudiente && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Nota:</strong> La contraseña inicial será el número de documento
              </p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="ghost"
              onClick={() => {
                setModalAcudiente(false);
                setEditingAcudiente(null);
                resetFormAcudiente();
                setError(null);
              }}
            >
              Cancelar
            </Button>
            <Button onClick={editingAcudiente ? handleUpdateAcudiente : handleCreateAcudiente}>
              {editingAcudiente ? 'Actualizar' : 'Crear'} Acudiente
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal Vincular Acudiente */}
      <Modal
        isOpen={modalVinculacion}
        onClose={() => {
          setModalVinculacion(false);
          setEstudianteVincular(null);
          setError(null);
        }}
        title={`Vincular Acudiente a ${estudianteVincular?.nombre || ''}`}
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Seleccionar Acudiente</label>
            <select
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
              value={formVinculacion.acudienteId}
              onChange={(e) => setFormVinculacion({ ...formVinculacion, acudienteId: parseInt(e.target.value) })}
            >
              <option value={0}>Seleccione un acudiente...</option>
              {acudientes.map(a => (
                <option key={a.id} value={a.id}>
                  {a.nombre} {a.apellidos} - {a.documento}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Parentesco</label>
            <select
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
              value={formVinculacion.parentesco}
              onChange={(e) => setFormVinculacion({ ...formVinculacion, parentesco: e.target.value as any })}
            >
              <option value="padre">Padre</option>
              <option value="madre">Madre</option>
              <option value="abuelo">Abuelo/a</option>
              <option value="tio">Tío/a</option>
              <option value="hermano">Hermano/a</option>
              <option value="otro">Otro</option>
            </select>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formVinculacion.esPrincipal}
              onChange={(e) => setFormVinculacion({ ...formVinculacion, esPrincipal: e.target.checked })}
              className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-sm text-slate-700">Marcar como acudiente principal</span>
          </label>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="ghost"
              onClick={() => {
                setModalVinculacion(false);
                setEstudianteVincular(null);
                setError(null);
              }}
            >
              Cancelar
            </Button>
            <Button onClick={handleVincular}>
              Vincular
            </Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
