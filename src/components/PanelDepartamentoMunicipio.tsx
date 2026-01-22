import { useState, useEffect } from 'react';
import { getDepartamentos, getMunicipios, createDepartamento, createMunicipio, updateDepartamento, updateMunicipio, deleteDepartamento, deleteMunicipio } from '../api/endpoints';
import { type Departamento, type Municipio } from '../mocks/data';
import DashboardLayout from '../components/DashboardLayout';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import FormField from '../components/FormField';
import Toast from '../components/Toast';
import { 
  IconLocation,
  IconPlus,
  IconEdit,
  IconTrash,
  IconSearch,
  IconMapPin
} from '../components/ui/Icons';

export default function PanelDepartamentoMunicipio() {
  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
  const [municipios, setMunicipios] = useState<Municipio[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartamento, setSelectedDepartamento] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'departamentos' | 'municipios'>('departamentos');

  // Modals
  const [modalDepartamento, setModalDepartamento] = useState<{
    open: boolean;
    departamento: Departamento | null;
    mode: 'create' | 'edit';
  }>({ open: false, departamento: null, mode: 'create' });

  const [modalMunicipio, setModalMunicipio] = useState<{
    open: boolean;
    municipio: Municipio | null;
    mode: 'create' | 'edit';
  }>({ open: false, municipio: null, mode: 'create' });

  // Forms
  const [formDepartamento, setFormDepartamento] = useState({
    nombre: '',
    codigo: ''
  });

  const [formMunicipio, setFormMunicipio] = useState({
    nombre: '',
    codigo: '',
    departamento_id: 0
  });

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [deptosData, municData] = await Promise.all([
        getDepartamentos(),
        getMunicipios()
      ]);
      setDepartamentos(Array.isArray(deptosData) ? deptosData : []);
      setMunicipios(Array.isArray(municData) ? municData : []);
    } catch (error) {
      console.error('Error loading data:', error);
      setToast({ message: 'Error al cargar datos', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const filteredDepartamentos = departamentos.filter(dept =>
    dept.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dept.codigo.includes(searchTerm)
  );

  const filteredMunicipios = municipios.filter(mun => {
    const matchesSearch = mun.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mun.codigo?.includes(searchTerm);
    const matchesDepartamento = selectedDepartamento === null || mun.departamento_id === selectedDepartamento;
    return matchesSearch && matchesDepartamento;
  });

  // CRUD Departamentos
  const handleCreateDepartamento = async () => {
    try {
      const newDept = await createDepartamento(formDepartamento);
      setDepartamentos(prev => [...prev, newDept]);
      setModalDepartamento({ open: false, departamento: null, mode: 'create' });
      setFormDepartamento({ nombre: '', codigo: '' });
      setToast({ message: 'Departamento creado exitosamente', type: 'success' });
    } catch (error) {
      setToast({ message: 'Error al crear departamento', type: 'error' });
    }
  };

  const handleUpdateDepartamento = async () => {
    if (!modalDepartamento.departamento) return;
    try {
      const updated = await updateDepartamento(modalDepartamento.departamento.id, formDepartamento);
      setDepartamentos(prev => prev.map(d => d.id === updated.id ? updated : d));
      setModalDepartamento({ open: false, departamento: null, mode: 'create' });
      setFormDepartamento({ nombre: '', codigo: '' });
      setToast({ message: 'Departamento actualizado exitosamente', type: 'success' });
    } catch (error) {
      setToast({ message: 'Error al actualizar departamento', type: 'error' });
    }
  };

  const handleDeleteDepartamento = async (id: number) => {
    if (!confirm('¿Está seguro de eliminar este departamento?')) return;
    try {
      await deleteDepartamento(id);
      setDepartamentos(prev => prev.filter(d => d.id !== id));
      setToast({ message: 'Departamento eliminado exitosamente', type: 'success' });
    } catch (error) {
      setToast({ message: 'Error al eliminar departamento', type: 'error' });
    }
  };

  // CRUD Municipios
  const handleCreateMunicipio = async () => {
    try {
      const newMun = await createMunicipio(formMunicipio);
      setMunicipios(prev => [...prev, newMun]);
      setModalMunicipio({ open: false, municipio: null, mode: 'create' });
      setFormMunicipio({ nombre: '', codigo: '', departamento_id: 0 });
      setToast({ message: 'Municipio creado exitosamente', type: 'success' });
    } catch (error) {
      setToast({ message: 'Error al crear municipio', type: 'error' });
    }
  };

  const handleUpdateMunicipio = async () => {
    if (!modalMunicipio.municipio) return;
    try {
      const updated = await updateMunicipio(modalMunicipio.municipio.id, formMunicipio);
      setMunicipios(prev => prev.map(m => m.id === updated.id ? updated : m));
      setModalMunicipio({ open: false, municipio: null, mode: 'create' });
      setFormMunicipio({ nombre: '', codigo: '', departamento_id: 0 });
      setToast({ message: 'Municipio actualizado exitosamente', type: 'success' });
    } catch (error) {
      setToast({ message: 'Error al actualizar municipio', type: 'error' });
    }
  };

  const handleDeleteMunicipio = async (id: number) => {
    if (!confirm('¿Está seguro de eliminar este municipio?')) return;
    try {
      await deleteMunicipio(id);
      setMunicipios(prev => prev.filter(m => m.id !== id));
      setToast({ message: 'Municipio eliminado exitosamente', type: 'success' });
    } catch (error) {
      setToast({ message: 'Error al eliminar municipio', type: 'error' });
    }
  };

  const openEditDepartamento = (departamento: Departamento) => {
    setFormDepartamento({
      nombre: departamento.nombre,
      codigo: departamento.codigo
    });
    setModalDepartamento({ open: true, departamento, mode: 'edit' });
  };

  const openEditMunicipio = (municipio: Municipio) => {
    setFormMunicipio({
      nombre: municipio.nombre,
      codigo: municipio.codigo || '',
      departamento_id: municipio.departamento_id
    });
    setModalMunicipio({ open: true, municipio, mode: 'edit' });
  };

  const getDepartamentoNombre = (id: number) => {
    return departamentos.find(d => d.id === id)?.nombre || 'N/A';
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
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-2xl p-8 text-white">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-display font-bold">Gestión Geográfica</h1>
              <p className="text-indigo-100 mt-1">
                Administración de departamentos y municipios
              </p>
            </div>
            
            <div className="flex items-center gap-4 mt-4 md:mt-0 text-indigo-100">
              <div className="text-center">
                <div className="text-xl font-bold">{departamentos.length}</div>
                <div className="text-xs">Departamentos</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold">{municipios.length}</div>
                <div className="text-xs">Municipios</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs y controles */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            {/* Tabs */}
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('departamentos')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  activeTab === 'departamentos'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <IconLocation className="inline-block mr-2" size={16} />
                Departamentos
              </button>
              <button
                onClick={() => setActiveTab('municipios')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  activeTab === 'municipios'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <IconMapPin className="inline-block mr-2" size={16} />
                Municipios
              </button>
            </div>

            {/* Controles */}
            <div className="flex gap-3">
              <div className="relative">
                <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              {activeTab === 'municipios' && (
                <select
                  value={selectedDepartamento || ''}
                  onChange={(e) => setSelectedDepartamento(e.target.value ? parseInt(e.target.value) : null)}
                  className="border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">Todos los departamentos</option>
                  {departamentos.map(dept => (
                    <option key={dept.id} value={dept.id}>{dept.nombre}</option>
                  ))}
                </select>
              )}

              <Button
                onClick={() => {
                  if (activeTab === 'departamentos') {
                    setFormDepartamento({ nombre: '', codigo: '' });
                    setModalDepartamento({ open: true, departamento: null, mode: 'create' });
                  } else {
                    setFormMunicipio({ nombre: '', codigo: '', departamento_id: 0 });
                    setModalMunicipio({ open: true, municipio: null, mode: 'create' });
                  }
                }}
                className="flex items-center gap-2"
              >
                <IconPlus size={16} />
                Nuevo {activeTab === 'departamentos' ? 'Departamento' : 'Municipio'}
              </Button>
            </div>
          </div>

          {/* Contenido de tabs */}
          {activeTab === 'departamentos' ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDepartamentos.map(departamento => (
                <div key={departamento.id} className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-200 rounded-xl p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-800">{departamento.nombre}</h4>
                      <p className="text-sm text-gray-600">Código: {departamento.codigo}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditDepartamento(departamento)}
                        className="p-2 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <IconEdit size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteDepartamento(departamento.id)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                        title="Eliminar"
                      >
                        <IconTrash size={14} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">
                      {municipios.filter(m => m.departamento_id === departamento.id).length}
                    </span> municipios
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMunicipios.map(municipio => (
                <div key={municipio.id} className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-800">{municipio.nombre}</h4>
                      <p className="text-sm text-gray-600">Código: {municipio.codigo || 'N/A'}</p>
                      <p className="text-xs text-blue-600 font-medium mt-1">
                        {getDepartamentoNombre(municipio.departamento_id)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditMunicipio(municipio)}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <IconEdit size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteMunicipio(municipio.id)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                        title="Eliminar"
                      >
                        <IconTrash size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Departamento */}
        <Modal
          isOpen={modalDepartamento.open}
          onClose={() => setModalDepartamento({ open: false, departamento: null, mode: 'create' })}
          title={modalDepartamento.mode === 'create' ? 'Nuevo Departamento' : 'Editar Departamento'}
        >
          <div className="space-y-4">
            <FormField
              id="nombre"
              label="Nombre del departamento"
            >
              <input
                type="text"
                name="nombre"
                value={formDepartamento.nombre}
                onChange={(e) => setFormDepartamento(prev => ({ ...prev, nombre: e.target.value }))}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                required
              />
            </FormField>
            
            <FormField
              id="codigo"
              label="Código"
            >
              <input
                type="text"
                name="codigo"
                value={formDepartamento.codigo}
                onChange={(e) => setFormDepartamento(prev => ({ ...prev, codigo: e.target.value }))}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                required
              />
            </FormField>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setModalDepartamento({ open: false, departamento: null, mode: 'create' })}
              >
                Cancelar
              </Button>
              <Button
                onClick={modalDepartamento.mode === 'create' ? handleCreateDepartamento : handleUpdateDepartamento}
              >
                {modalDepartamento.mode === 'create' ? 'Crear' : 'Actualizar'}
              </Button>
            </div>
          </div>
        </Modal>

        {/* Modal Municipio */}
        <Modal
          isOpen={modalMunicipio.open}
          onClose={() => setModalMunicipio({ open: false, municipio: null, mode: 'create' })}
          title={modalMunicipio.mode === 'create' ? 'Nuevo Municipio' : 'Editar Municipio'}
        >
          <div className="space-y-4">
            <FormField
              id="nombreMunicipio"
              label="Nombre del municipio"
            >
              <input
                type="text"
                name="nombre"
                value={formMunicipio.nombre}
                onChange={(e) => setFormMunicipio(prev => ({ ...prev, nombre: e.target.value }))}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                required
              />
            </FormField>
            
            <FormField
              id="codigoMunicipio"
              label="Código"
            >
              <input
                type="text"
                name="codigo"
                value={formMunicipio.codigo}
                onChange={(e) => setFormMunicipio(prev => ({ ...prev, codigo: e.target.value }))}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
              />
            </FormField>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Departamento *
              </label>
              <select
                value={formMunicipio.departamento_id}
                onChange={(e) => setFormMunicipio(prev => ({ ...prev, departamento_id: parseInt(e.target.value) }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              >
                <option value={0}>Seleccionar departamento</option>
                {departamentos.map(dept => (
                  <option key={dept.id} value={dept.id}>{dept.nombre}</option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setModalMunicipio({ open: false, municipio: null, mode: 'create' })}
              >
                Cancelar
              </Button>
              <Button
                onClick={modalMunicipio.mode === 'create' ? handleCreateMunicipio : handleUpdateMunicipio}
              >
                {modalMunicipio.mode === 'create' ? 'Crear' : 'Actualizar'}
              </Button>
            </div>
          </div>
        </Modal>

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