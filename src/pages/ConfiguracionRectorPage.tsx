import { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Button from '../components/ui/Button';
import Toast from '../components/Toast';
import apiClient from '../api/apiClient';
import { getGrados } from '../api/endpoints';
import {
  IconSettings,
  IconBuilding,
  IconCalendar,
  IconEdit,
  IconCheck,
  IconPlus,
  IconTrash,
  IconBook
} from '../components/ui/Icons';

interface Institucion {
  id: number;
  nombre: string;
  codigoDane?: string;
  nit?: string;
  telefono: string;
  correo: string;
  direccion: string;
  naturaleza: string;
  municipio?: {
    id: number;
    nombre: string;
    departamento?: {
      id: number;
      nombre: string;
    };
  };
  rectorNombre?: string;
  rectorDocumento?: string;
  rectorCorreo?: string;
  rectorTelefono?: string;
}

interface Periodo {
  id: number;
  nombre: string;
  fechaInicio: string;
  fechaFin: string;
  anio: number;
  estado: 'activo' | 'inactivo' | 'finalizado';
}

interface Grado {
  id: number;
  nombre: string;
}

export default function ConfiguracionRectorPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [institucion, setInstitucion] = useState<Institucion | null>(null);
  const [periodos, setPeriodos] = useState<Periodo[]>([]);
  const [grados, setGrados] = useState<Grado[]>([]);
  const [activeTab, setActiveTab] = useState<'institucion' | 'periodos' | 'grados'>('institucion');
  const [editMode, setEditMode] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  
  // Form state para institución
  const [formInstitucion, setFormInstitucion] = useState({
    telefono: '',
    correo: '',
    direccion: '',
    rectorNombre: '',
    rectorDocumento: '',
    rectorCorreo: '',
    rectorTelefono: ''
  });

  // Form state para nuevo período
  const [showPeriodoModal, setShowPeriodoModal] = useState(false);
  const [editingPeriodo, setEditingPeriodo] = useState<Periodo | null>(null);
  const [formPeriodo, setFormPeriodo] = useState({
    nombre: '',
    fechaInicio: '',
    fechaFin: '',
    anio: new Date().getFullYear(),
    estado: 'activo' as 'activo' | 'inactivo' | 'finalizado'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [institucionRes, periodosRes, gradosData] = await Promise.all([
        apiClient.getMiInstitucionRector(),
        apiClient.getPeriodosRector(),
        getGrados()
      ]);

      if (institucionRes.success && institucionRes.data) {
        setInstitucion(institucionRes.data);
        setFormInstitucion({
          telefono: institucionRes.data.telefono || '',
          correo: institucionRes.data.correo || '',
          direccion: institucionRes.data.direccion || '',
          rectorNombre: institucionRes.data.rectorNombre || '',
          rectorDocumento: institucionRes.data.rectorDocumento || '',
          rectorCorreo: institucionRes.data.rectorCorreo || '',
          rectorTelefono: institucionRes.data.rectorTelefono || ''
        });
      }

      if (periodosRes.success && periodosRes.data) {
        setPeriodos(periodosRes.data);
      }

      setGrados(Array.isArray(gradosData) ? gradosData : []);
    } catch (error) {
      console.error('Error loading data:', error);
      setToast({ message: 'Error al cargar datos', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveInstitucion = async () => {
    setSaving(true);
    try {
      const res = await apiClient.updateMiInstitucionRector(formInstitucion);
      if (res.success) {
        setToast({ message: 'Institución actualizada correctamente', type: 'success' });
        setEditMode(false);
        loadData();
      } else {
        setToast({ message: res.message || 'Error al actualizar', type: 'error' });
      }
    } catch (error) {
      setToast({ message: 'Error al guardar cambios', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleSavePeriodo = async () => {
    setSaving(true);
    try {
      let res;
      if (editingPeriodo) {
        // Asegurar que todos los campos necesarios estén presentes
        const dataToUpdate = {
          nombre: formPeriodo.nombre,
          fechaInicio: formPeriodo.fechaInicio,
          fechaFin: formPeriodo.fechaFin,
          anio: formPeriodo.anio || new Date().getFullYear(),
          estado: formPeriodo.estado || 'activo'
        };
        console.log('📤 Datos a enviar para actualización:', dataToUpdate);
        res = await apiClient.updatePeriodoRector(editingPeriodo.id, dataToUpdate);
      } else {
        res = await apiClient.createPeriodoRector(formPeriodo);
      }

      if (res.success) {
        setToast({ message: editingPeriodo ? 'Período actualizado' : 'Período creado', type: 'success' });
        setShowPeriodoModal(false);
        setEditingPeriodo(null);
        resetFormPeriodo();
        loadData();
      } else {
        setToast({ message: res.message || 'Error al guardar período', type: 'error' });
      }
    } catch (error) {
      setToast({ message: 'Error al guardar período', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePeriodo = async (id: number) => {
    if (!confirm('¿Está seguro de eliminar este período?')) return;
    
    try {
      const res = await apiClient.deletePeriodoRector(id);
      if (res.success) {
        setToast({ message: 'Período eliminado', type: 'success' });
        loadData();
      } else {
        setToast({ message: res.message || 'Error al eliminar', type: 'error' });
      }
    } catch (error) {
      setToast({ message: 'Error al eliminar período', type: 'error' });
    }
  };

  const openEditPeriodo = (periodo: Periodo) => {
    setEditingPeriodo(periodo);
    setFormPeriodo({
      nombre: periodo.nombre,
      fechaInicio: periodo.fechaInicio.split('T')[0],
      fechaFin: periodo.fechaFin.split('T')[0],
      anio: periodo.anio,
      estado: periodo.estado
    });
    setShowPeriodoModal(true);
  };

  const resetFormPeriodo = () => {
    setFormPeriodo({
      nombre: '',
      fechaInicio: '',
      fechaFin: '',
      anio: new Date().getFullYear(),
      estado: 'activo'
    });
  };

  const getEstadoBadge = (estado?: string) => {
    const estadoNormalizado = estado || 'inactivo';
    const styles: Record<string, string> = {
      activo: 'bg-green-100 text-green-700',
      inactivo: 'bg-gray-100 text-gray-700',
      finalizado: 'bg-blue-100 text-blue-700'
    };
    return (
      <span className={`px-2 py-1 text-xs rounded-full font-medium ${styles[estadoNormalizado] || styles.inactivo}`}>
        {estadoNormalizado.charAt(0).toUpperCase() + estadoNormalizado.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center min-h-96">
          <LoadingSpinner />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-8 text-white">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center">
              <IconSettings className="text-white" size={28} />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-display font-bold">Configuración</h1>
              <p className="text-purple-100 mt-1">
                Gestiona la información de tu institución y períodos académicos
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="border-b border-slate-100 bg-slate-50/50">
            <nav className="flex gap-1 p-1.5">
              <button
                onClick={() => setActiveTab('institucion')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${
                  activeTab === 'institucion'
                    ? 'bg-white text-purple-600 shadow-sm'
                    : 'text-slate-600 hover:bg-white/50'
                }`}
              >
                <IconBuilding size={18} />
                Mi Institución
              </button>
              <button
                onClick={() => setActiveTab('periodos')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${
                  activeTab === 'periodos'
                    ? 'bg-white text-purple-600 shadow-sm'
                    : 'text-slate-600 hover:bg-white/50'
                }`}
              >
                <IconCalendar size={18} />
                Períodos Académicos
              </button>
              <button
                onClick={() => setActiveTab('grados')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${
                  activeTab === 'grados'
                    ? 'bg-white text-purple-600 shadow-sm'
                    : 'text-slate-600 hover:bg-white/50'
                }`}
              >
                <IconBook size={18} />
                Grados
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Tab: Institución */}
            {activeTab === 'institucion' && institucion && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-slate-800">Datos de la Institución</h2>
                  {!editMode ? (
                    <Button onClick={() => setEditMode(true)} variant="outline" size="sm">
                      <IconEdit size={16} className="mr-2" />
                      Editar
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button onClick={() => setEditMode(false)} variant="outline" size="sm">
                        Cancelar
                      </Button>
                      <Button onClick={handleSaveInstitucion} disabled={saving} size="sm">
                        <IconCheck size={16} className="mr-2" />
                        {saving ? 'Guardando...' : 'Guardar'}
                      </Button>
                    </div>
                  )}
                </div>

                {/* Datos no editables */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <p className="text-sm text-slate-500 mb-3">Información oficial (solo lectura)</p>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs text-slate-500 uppercase tracking-wide">Nombre</label>
                      <p className="font-medium text-slate-800">{institucion.nombre}</p>
                    </div>
                    <div>
                      <label className="text-xs text-slate-500 uppercase tracking-wide">Código DANE</label>
                      <p className="font-medium text-slate-800">{institucion.codigoDane || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-xs text-slate-500 uppercase tracking-wide">NIT</label>
                      <p className="font-medium text-slate-800">{institucion.nit || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-xs text-slate-500 uppercase tracking-wide">Naturaleza</label>
                      <p className="font-medium text-slate-800">{institucion.naturaleza}</p>
                    </div>
                    <div>
                      <label className="text-xs text-slate-500 uppercase tracking-wide">Municipio</label>
                      <p className="font-medium text-slate-800">{institucion.municipio?.nombre || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-xs text-slate-500 uppercase tracking-wide">Departamento</label>
                      <p className="font-medium text-slate-800">{institucion.municipio?.departamento?.nombre || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Datos editables */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-slate-700">Contacto de la Institución</h3>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Teléfono</label>
                      <input
                        type="tel"
                        value={formInstitucion.telefono}
                        onChange={(e) => setFormInstitucion({ ...formInstitucion, telefono: e.target.value })}
                        disabled={!editMode}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-slate-50 disabled:text-slate-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Correo</label>
                      <input
                        type="email"
                        value={formInstitucion.correo}
                        onChange={(e) => setFormInstitucion({ ...formInstitucion, correo: e.target.value })}
                        disabled={!editMode}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-slate-50 disabled:text-slate-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Dirección</label>
                      <input
                        type="text"
                        value={formInstitucion.direccion}
                        onChange={(e) => setFormInstitucion({ ...formInstitucion, direccion: e.target.value })}
                        disabled={!editMode}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-slate-50 disabled:text-slate-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-slate-700">Datos del Rector</h3>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Nombre completo</label>
                      <input
                        type="text"
                        value={formInstitucion.rectorNombre}
                        onChange={(e) => setFormInstitucion({ ...formInstitucion, rectorNombre: e.target.value })}
                        disabled={!editMode}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-slate-50 disabled:text-slate-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Documento</label>
                      <input
                        type="text"
                        value={formInstitucion.rectorDocumento}
                        onChange={(e) => setFormInstitucion({ ...formInstitucion, rectorDocumento: e.target.value })}
                        disabled={!editMode}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-slate-50 disabled:text-slate-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Correo del Rector</label>
                      <input
                        type="email"
                        value={formInstitucion.rectorCorreo}
                        onChange={(e) => setFormInstitucion({ ...formInstitucion, rectorCorreo: e.target.value })}
                        disabled={!editMode}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-slate-50 disabled:text-slate-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Teléfono del Rector</label>
                      <input
                        type="tel"
                        value={formInstitucion.rectorTelefono}
                        onChange={(e) => setFormInstitucion({ ...formInstitucion, rectorTelefono: e.target.value })}
                        disabled={!editMode}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-slate-50 disabled:text-slate-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Períodos */}
            {activeTab === 'periodos' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-slate-800">Períodos Académicos</h2>
                  <Button onClick={() => { resetFormPeriodo(); setShowPeriodoModal(true); }} size="sm">
                    <IconPlus size={16} className="mr-2" />
                    Nuevo Período
                  </Button>
                </div>

                {periodos.length === 0 ? (
                  <div className="text-center py-12">
                    <IconCalendar className="mx-auto text-slate-300 mb-4" size={48} />
                    <h3 className="text-lg font-medium text-slate-500">No hay períodos configurados</h3>
                    <p className="text-slate-400 mt-1">Crea tu primer período académico</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {periodos.map((periodo) => (
                      <div
                        key={periodo.id}
                        className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200 hover:border-purple-200 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                            <IconCalendar className="text-purple-600" size={20} />
                          </div>
                          <div>
                            <h4 className="font-semibold text-slate-800">{periodo.nombre}</h4>
                            <p className="text-sm text-slate-500">
                              {new Date(periodo.fechaInicio).toLocaleDateString()} - {new Date(periodo.fechaFin).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {getEstadoBadge(periodo.estado)}
                          <button
                            onClick={() => openEditPeriodo(periodo)}
                            className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                          >
                            <IconEdit size={18} />
                          </button>
                          <button
                            onClick={() => handleDeletePeriodo(periodo.id)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <IconTrash size={18} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab: Grados */}
            {activeTab === 'grados' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-slate-800">Grados Disponibles</h2>
                  <span className="text-sm text-slate-500">Solo lectura - Configurado por el administrador</span>
                </div>

                {grados.length === 0 ? (
                  <div className="text-center py-12">
                    <IconBook className="mx-auto text-slate-300 mb-4" size={48} />
                    <h3 className="text-lg font-medium text-slate-500">No hay grados configurados</h3>
                    <p className="text-slate-400 mt-1">Contacta al administrador del sistema</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {grados.map((grado) => (
                      <div
                        key={grado.id}
                        className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center"
                      >
                        <div className="w-10 h-10 mx-auto rounded-lg bg-indigo-100 flex items-center justify-center mb-2">
                          <IconBook className="text-indigo-600" size={20} />
                        </div>
                        <p className="font-medium text-slate-800">{grado.nombre}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Modal Período */}
        {showPeriodoModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-4">
                {editingPeriodo ? 'Editar Período' : 'Nuevo Período'}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nombre</label>
                  <input
                    type="text"
                    value={formPeriodo.nombre}
                    onChange={(e) => setFormPeriodo({ ...formPeriodo, nombre: e.target.value })}
                    placeholder="Ej: Primer Semestre 2026"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Fecha Inicio</label>
                    <input
                      type="date"
                      value={formPeriodo.fechaInicio}
                      onChange={(e) => setFormPeriodo({ ...formPeriodo, fechaInicio: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Fecha Fin</label>
                    <input
                      type="date"
                      value={formPeriodo.fechaFin}
                      onChange={(e) => setFormPeriodo({ ...formPeriodo, fechaFin: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Año</label>
                    <input
                      type="number"
                      value={formPeriodo.anio}
                      onChange={(e) => setFormPeriodo({ ...formPeriodo, anio: parseInt(e.target.value) })}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Estado</label>
                    <select
                      value={formPeriodo.estado}
                      onChange={(e) => setFormPeriodo({ ...formPeriodo, estado: e.target.value as any })}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="activo">Activo</option>
                      <option value="inactivo">Inactivo</option>
                      <option value="finalizado">Finalizado</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => { setShowPeriodoModal(false); setEditingPeriodo(null); }}
                >
                  Cancelar
                </Button>
                <Button onClick={handleSavePeriodo} disabled={saving || !formPeriodo.nombre || !formPeriodo.fechaInicio || !formPeriodo.fechaFin}>
                  {saving ? 'Guardando...' : (editingPeriodo ? 'Actualizar' : 'Crear')}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Toast */}
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
