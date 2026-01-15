import { useState, useEffect } from 'react';
import { getSession, getUsuarios, updateUsuario } from '../api/endpoints';
import { type Usuario } from '../mocks/data';
import DashboardLayout from '../components/DashboardLayout';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import Toast from '../components/Toast';
import { 
  IconUsers, 
  IconCheck, 
  IconX, 
  IconEye, 
  IconSearch,
  IconFilter,
  IconDownload,
  IconClock
} from '../components/ui/Icons';

export default function PanelAprobarDocentes() {
  const session = getSession();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [filteredUsuarios, setFilteredUsuarios] = useState<Usuario[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'todos' | 'pendientes' | 'aprobados' | 'rechazados'>('todos');
  const [selectedUsuario, setSelectedUsuario] = useState<Usuario | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    loadUsuarios();
  }, []);

  useEffect(() => {
    filterUsuarios();
  }, [usuarios, searchTerm, filterStatus]);

  const loadUsuarios = async () => {
    setLoading(true);
    try {
      const data = await getUsuarios();
      // Solo mostrar docentes pendientes de aprobación o que requieren revisión
      const docentes = data.filter(user => 
        user.rol === 'docente_aula' && 
        (!user.aprobado || user.requiere_revision)
      );
      setUsuarios(docentes);
    } catch (error) {
      console.error('Error loading usuarios:', error);
      setToast({ message: 'Error al cargar usuarios', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const filterUsuarios = () => {
    let filtered = usuarios;

    // Filtro por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(user => 
        `${user.nombre} ${user.apellidos}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.telefono?.includes(searchTerm) ||
        user.documento?.includes(searchTerm)
      );
    }

    // Filtro por estado
    if (filterStatus !== 'todos') {
      filtered = filtered.filter(user => {
        switch (filterStatus) {
          case 'pendientes':
            return !user.aprobado;
          case 'aprobados':
            return user.aprobado && !user.requiere_revision;
          case 'rechazados':
            return user.rechazado;
          default:
            return true;
        }
      });
    }

    setFilteredUsuarios(filtered);
  };

  const handleAprobar = async (usuarioId: number) => {
    setProcessingId(usuarioId);
    try {
      await updateUsuario(usuarioId, {
        aprobado: true,
        rechazado: false,
        requiere_revision: false,
        fecha_aprobacion: new Date().toISOString(),
        activo: true
      });

      // Actualizar estado local
      setUsuarios(prev => prev.map(user => 
        user.id === usuarioId 
          ? { ...user, aprobado: true, rechazado: false, requiere_revision: false, activo: true }
          : user
      ));

      setToast({ message: 'Usuario aprobado correctamente', type: 'success' });
      setShowModal(false);
    } catch (error) {
      console.error('Error aprobar usuario:', error);
      setToast({ message: 'Error al aprobar usuario', type: 'error' });
    } finally {
      setProcessingId(null);
    }
  };

  const handleRechazar = async (usuarioId: number, motivo?: string) => {
    setProcessingId(usuarioId);
    try {
      await updateUsuario(usuarioId, {
        aprobado: false,
        rechazado: true,
        requiere_revision: false,
        motivo_rechazo: motivo || 'No especificado',
        fecha_rechazo: new Date().toISOString(),
        activo: false
      });

      // Actualizar estado local
      setUsuarios(prev => prev.map(user => 
        user.id === usuarioId 
          ? { ...user, aprobado: false, rechazado: true, requiere_revision: false, activo: false }
          : user
      ));

      setToast({ message: 'Usuario rechazado', type: 'success' });
      setShowModal(false);
    } catch (error) {
      console.error('Error rechazar usuario:', error);
      setToast({ message: 'Error al rechazar usuario', type: 'error' });
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (usuario: Usuario) => {
    if (usuario.rechazado) {
      return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-700 font-medium">Rechazado</span>;
    }
    if (usuario.aprobado && !usuario.requiere_revision) {
      return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700 font-medium">Aprobado</span>;
    }
    if (usuario.requiere_revision) {
      return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700 font-medium">Requiere Revisión</span>;
    }
    return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700 font-medium">Pendiente</span>;
  };

  const pendingCount = usuarios.filter(u => !u.aprobado && !u.rechazado).length;
  const approvedCount = usuarios.filter(u => u.aprobado && !u.requiere_revision).length;
  const rejectedCount = usuarios.filter(u => u.rechazado).length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-8 text-white">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-display font-bold">Panel de Aprobación</h1>
              <p className="text-emerald-100 mt-1">
                Gestión y aprobación de docentes del sistema
              </p>
            </div>
            
            <div className="flex items-center gap-4 mt-4 md:mt-0">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{pendingCount}</div>
                <div className="text-xs text-emerald-200">Pendientes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{approvedCount}</div>
                <div className="text-xs text-emerald-200">Aprobados</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Búsqueda */}
            <div className="relative flex-1">
              <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Buscar por nombre, teléfono o documento..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Filtro por estado */}
            <div className="relative">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
                className="appearance-none bg-white border border-gray-200 rounded-xl px-4 py-3 pr-10 focus:ring-2 focus:ring-emerald-500 focus:border-transparent min-w-48"
              >
                <option value="todos">Todos los estados</option>
                <option value="pendientes">Pendientes</option>
                <option value="aprobados">Aprobados</option>
                <option value="rechazados">Rechazados</option>
              </select>
              <IconFilter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            </div>
          </div>
        </div>

        {/* Lista de usuarios */}
        {loading ? (
          <div className="flex justify-center items-center min-h-96">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <IconUsers size={20} />
                  Docentes para Revisión ({filteredUsuarios.length})
                </h3>
                <div className="text-sm text-gray-500">
                  Mostrando {filteredUsuarios.length} de {usuarios.length} docentes
                </div>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {filteredUsuarios.length === 0 ? (
                <div className="p-12 text-center">
                  <IconUsers className="mx-auto text-gray-300 mb-4" size={48} />
                  <h4 className="text-lg font-medium text-gray-500">No hay docentes para mostrar</h4>
                  <p className="text-gray-400 mt-1">Ajusta los filtros para ver más resultados</p>
                </div>
              ) : (
                filteredUsuarios.map(usuario => (
                  <div key={usuario.id} className="p-6 hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-bold text-lg">
                          {usuario.nombre.charAt(0)}{usuario.apellidos?.charAt(0)}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <h4 className="font-semibold text-gray-800">
                              {usuario.nombre} {usuario.apellidos}
                            </h4>
                            {getStatusBadge(usuario)}
                          </div>
                          
                          <div className="text-sm text-gray-600 space-y-1">
                            <div className="flex items-center gap-4">
                              <span>📞 {usuario.telefono || 'No especificado'}</span>
                              <span>📄 {usuario.documento || 'No especificado'}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <IconClock size={12} />
                              Registro: {new Date(usuario.created_at || Date.now()).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedUsuario(usuario);
                            setShowModal(true);
                          }}
                          className="px-4 py-2 text-sm bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors flex items-center gap-2"
                        >
                          <IconEye size={14} />
                          Ver Detalles
                        </button>

                        {!usuario.aprobado && !usuario.rechazado && (
                          <>
                            <button
                              onClick={() => handleAprobar(usuario.id)}
                              disabled={processingId === usuario.id}
                              className="px-4 py-2 text-sm bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors flex items-center gap-2 disabled:opacity-50"
                            >
                              <IconCheck size={14} />
                              {processingId === usuario.id ? 'Procesando...' : 'Aprobar'}
                            </button>
                            
                            <button
                              onClick={() => handleRechazar(usuario.id)}
                              disabled={processingId === usuario.id}
                              className="px-4 py-2 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors flex items-center gap-2 disabled:opacity-50"
                            >
                              <IconX size={14} />
                              {processingId === usuario.id ? 'Procesando...' : 'Rechazar'}
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Modal de detalles */}
        {showModal && selectedUsuario && (
          <Modal
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            title={`Detalles del Docente: ${selectedUsuario.nombre} ${selectedUsuario.apellidos}`}
            size="lg"
          >
            <div className="space-y-6">
              {/* Información personal */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">Información Personal</h4>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Nombre completo:</span>
                      <div className="font-medium">{selectedUsuario.nombre} {selectedUsuario.apellidos}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Documento:</span>
                      <div className="font-medium">{selectedUsuario.documento || 'No especificado'}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Teléfono:</span>
                      <div className="font-medium">{selectedUsuario.telefono || 'No especificado'}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Fecha de registro:</span>
                      <div className="font-medium">
                        {new Date(selectedUsuario.created_at || Date.now()).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Estado actual */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">Estado de Aprobación</h4>
                <div className="flex items-center gap-3">
                  {getStatusBadge(selectedUsuario)}
                  {selectedUsuario.motivo_rechazo && (
                    <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                      Motivo: {selectedUsuario.motivo_rechazo}
                    </div>
                  )}
                </div>
              </div>

              {/* Acciones */}
              {!selectedUsuario.aprobado && !selectedUsuario.rechazado && (
                <div className="flex gap-4 pt-4 border-t border-gray-200">
                  <Button
                    onClick={() => handleAprobar(selectedUsuario.id)}
                    disabled={processingId === selectedUsuario.id}
                    variant="primary"
                    className="flex items-center gap-2"
                  >
                    <IconCheck size={16} />
                    {processingId === selectedUsuario.id ? 'Aprobando...' : 'Aprobar Docente'}
                  </Button>
                  
                  <Button
                    onClick={() => handleRechazar(selectedUsuario.id, 'Rechazado desde panel de detalles')}
                    disabled={processingId === selectedUsuario.id}
                    variant="outline"
                    className="flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <IconX size={16} />
                    {processingId === selectedUsuario.id ? 'Rechazando...' : 'Rechazar'}
                  </Button>
                </div>
              )}
            </div>
          </Modal>
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