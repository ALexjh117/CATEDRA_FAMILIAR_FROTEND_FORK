import { useState, useEffect } from 'react';
import { getSession, updateUsuario, getPerfilUsuario, getMiInstitucion, getInstitucionById } from '../api/endpoints';
import DashboardLayout from '../components/DashboardLayout';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Button from '../components/ui/Button';
import FormFieldInput from '../components/ui/FormFieldInput';
import { IconEdit, IconUsers, IconInstitution } from '../components/ui/Icons';
import { useToast } from '../components/ui/ToastGlobal';
import type { RolUsuario, Institucion } from '../mocks/data';

export default function ProfilePage() {
  const session = getSession();
  const user = session?.user;
  const { showToast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [institucion, setInstitucion] = useState<Institucion | null>(null);
  const [perfilCompleto, setPerfilCompleto] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    nombre: user?.nombre || '',
    apellidos: user?.apellidos || '',
    correo: user?.correo || user?.email || '',
    telefono: user?.telefono || '',
    documento: user?.documento || '',
    tipoDocumento: user?.tipoDocumento || 'cc',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Cargar datos completos del perfil e institución
  useEffect(() => {
    const loadProfileData = async () => {
      console.log('🔍 [PROFILE PAGE] Cargando datos del perfil...');
      console.log('  - Usuario actual:', user);
      console.log('  - Rol:', user?.rol);
      
      setLoading(true);
      try {
        // Intentar cargar perfil completo
        console.log('  - Llamando getPerfilUsuario()...');
        const perfilResult = await getPerfilUsuario();
        console.log('  - Resultado getPerfilUsuario:', perfilResult);
        
        if (perfilResult.success && perfilResult.usuario) {
          setPerfilCompleto(perfilResult.usuario);
          // Actualizar formData con datos completos
          setFormData(prev => ({
            ...prev,
            nombre: perfilResult.usuario.nombre || prev.nombre,
            apellidos: perfilResult.usuario.apellidos || perfilResult.usuario.apellido || prev.apellidos,
            correo: perfilResult.usuario.correo || perfilResult.usuario.email || prev.correo,
            telefono: perfilResult.usuario.telefono || prev.telefono,
            documento: perfilResult.usuario.documento || perfilResult.usuario.numeroDocumento || prev.documento,
            tipoDocumento: perfilResult.usuario.tipoDocumento || perfilResult.usuario.tipo_documento || prev.tipoDocumento,
          }));
        }

        // Cargar institución si tiene institucionId
        const institucionId = user?.institucionId || perfilResult.usuario?.institucionId;
        if (institucionId) {
          const inst = await getMiInstitucion();
          if (inst) {
            setInstitucion(inst);
          } else {
            // Intentar con getInstitucionById como fallback
            const instById = await getInstitucionById(institucionId);
            if (instById) setInstitucion(instById);
          }
        }
      } catch (error) {
        console.error('Error cargando perfil:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProfileData();
  }, [user?.institucionId]);

  // Actualizar formData cuando cambie perfilCompleto (user viene de getSession, no cambia reactivamente)
  useEffect(() => {
    if (perfilCompleto) {
      setFormData({
        nombre: perfilCompleto.nombre || user?.nombre || '',
        apellidos: perfilCompleto.apellidos || perfilCompleto.apellido || user?.apellidos || '',
        correo: perfilCompleto.correo || user?.correo || user?.email || '',
        telefono: perfilCompleto.telefono || user?.telefono || '',
        documento: perfilCompleto.documento || user?.documento || '',
        tipoDocumento: perfilCompleto.tipoDocumento || user?.tipoDocumento || 'cc',
      });
    }
  }, [perfilCompleto]); // Solo depende de perfilCompleto, no de user (que se recrea en cada render)

  const getRolLabel = (rol: RolUsuario) => {
    const labels: Record<RolUsuario, string> = {
      acudiente: 'Acudiente',
      docente_aula: 'Docente de Aula',
      orientador: 'Orientador',
      coordinador: 'Coordinador',
      rector: 'Rector',
      admin: 'Administrador',
      admin_sistema: 'Administrador del Sistema',
    };
    return labels[rol] || rol;
  };

  const getRolColor = (rol: RolUsuario) => {
    const colors: Record<RolUsuario, string> = {
      acudiente: 'from-cyan-400 to-cyan-600',
      docente_aula: 'from-blue-400 to-indigo-600',
      orientador: 'from-violet-400 to-purple-600',
      coordinador: 'from-amber-400 to-orange-600',
      rector: 'from-rose-400 to-red-600',
      admin: 'from-teal-400 to-teal-600',
      admin_sistema: 'from-slate-600 to-slate-800',
    };
    return colors[rol] || 'from-gray-400 to-gray-600';
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }
    if (!formData.apellidos.trim()) {
      newErrors.apellidos = 'Los apellidos son requeridos';
    }
    if (!formData.correo.trim()) {
      newErrors.correo = 'El correo es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.correo)) {
      newErrors.correo = 'Correo electrónico inválido';
    }
    if (formData.telefono && !/^\d{10}$/.test(formData.telefono.replace(/\D/g, ''))) {
      newErrors.telefono = 'El teléfono debe tener 10 dígitos';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    
    setSaving(true);
    try {
      // Llamar a la API para actualizar
      if (user?.id) {
        await updateUsuario(user.id, {
          ...user,
          nombre: formData.nombre,
          apellidos: formData.apellidos,
          correo: formData.correo,
          telefono: formData.telefono,
          documento: formData.documento,
          tipoDocumento: formData.tipoDocumento,
        });
        
        // Actualizar sesión local
        const currentSession = getSession();
        if (currentSession) {
          currentSession.user = {
            ...currentSession.user,
            nombre: formData.nombre,
            apellidos: formData.apellidos,
            correo: formData.correo,
            email: formData.correo,
            telefono: formData.telefono,
            documento: formData.documento,
            tipoDocumento: formData.tipoDocumento,
          };
          localStorage.setItem('session', JSON.stringify(currentSession));
        }
        
        showToast('Perfil actualizado correctamente', 'success');
        setEditMode(false);
      }
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      showToast('Error al actualizar el perfil', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      nombre: user?.nombre || '',
      apellidos: user?.apellidos || '',
      correo: user?.correo || user?.email || '',
      telefono: user?.telefono || '',
      documento: user?.documento || '',
      tipoDocumento: user?.tipoDocumento || 'cc',
    });
    setErrors({});
    setEditMode(false);
  };

  if (!user) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header con gradiente */}
        <div className="relative bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-8 mb-6 overflow-hidden">
          {/* Decoraciones */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative flex flex-col sm:flex-row items-center gap-6">
            {/* Avatar grande */}
            <div className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${getRolColor(user.rol)} flex items-center justify-center text-white text-3xl font-bold shadow-2xl ring-4 ring-white/20`}>
              {user.nombre?.charAt(0) || 'U'}{user.apellidos?.charAt(0) || ''}
            </div>
            
            <div className="text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">
                {user.nombre} {user.apellidos}
              </h1>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-2">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold bg-gradient-to-r ${getRolColor(user.rol)} text-white`}>
                  {getRolLabel(user.rol)}
                </span>
                {user.institucion && (
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-white/10 text-white/80">
                    {user.institucion}
                  </span>
                )}
                {!user.institucion && institucion && (
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-white/10 text-white/80">
                    {institucion.nombre}
                  </span>
                )}
              </div>
            </div>
            
            {!editMode && (
              <Button 
                onClick={() => setEditMode(true)} 
                className="sm:ml-auto flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border-white/20"
              >
                <IconEdit size={16} />
                Editar Perfil
              </Button>
            )}
          </div>
        </div>

        {/* Información del perfil */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
            <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <IconUsers size={20} className="text-slate-400" />
              Información Personal
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              {editMode ? 'Actualiza tu información personal' : 'Tu información de perfil'}
            </p>
          </div>

          <div className="p-6">
            {editMode ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormFieldInput
                    name="nombre"
                    label="Nombre"
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    error={errors.nombre}
                    placeholder="Tu nombre"
                    required
                  />
                  <FormFieldInput
                    name="apellidos"
                    label="Apellidos"
                    type="text"
                    value={formData.apellidos}
                    onChange={(e) => setFormData({ ...formData, apellidos: e.target.value })}
                    error={errors.apellidos}
                    placeholder="Tus apellidos"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormFieldInput
                    name="correo"
                    label="Correo Electrónico"
                    type="email"
                    value={formData.correo}
                    onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
                    error={errors.correo}
                    placeholder="correo@ejemplo.com"
                    required
                  />
                  <FormFieldInput
                    name="telefono"
                    label="Teléfono"
                    type="tel"
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                    error={errors.telefono}
                    placeholder="3001234567"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Tipo de Documento
                    </label>
                    <select
                      value={formData.tipoDocumento}
                      onChange={(e) => setFormData({ ...formData, tipoDocumento: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 transition-all"
                    >
                      <option value="cc">Cédula de Ciudadanía</option>
                      <option value="ce">Cédula de Extranjería</option>
                      <option value="ti">Tarjeta de Identidad</option>
                      <option value="pasaporte">Pasaporte</option>
                    </select>
                  </div>
                  <FormFieldInput
                    name="documento"
                    label="Número de Documento"
                    type="text"
                    value={formData.documento}
                    onChange={(e) => setFormData({ ...formData, documento: e.target.value })}
                    placeholder="1234567890"
                  />
                </div>

                {/* Botones de acción */}
                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <Button 
                    variant="outline" 
                    onClick={handleCancel}
                    disabled={saving}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2"
                  >
                    {saving ? (
                      <>
                        <LoadingSpinner size="sm" />
                        Guardando...
                      </>
                    ) : (
                      'Guardar Cambios'
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Nombre</label>
                    <p className="text-slate-800 font-medium">{user.nombre || '-'}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Apellidos</label>
                    <p className="text-slate-800 font-medium">{user.apellidos || '-'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Correo Electrónico</label>
                    <p className="text-slate-800 font-medium">{user.correo || user.email || '-'}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Teléfono</label>
                    <p className="text-slate-800 font-medium">{user.telefono || '-'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Tipo de Documento</label>
                    <p className="text-slate-800 font-medium">
                      {formData.tipoDocumento === 'cc' ? 'Cédula de Ciudadanía' :
                       formData.tipoDocumento === 'ce' ? 'Cédula de Extranjería' :
                       formData.tipoDocumento === 'ti' ? 'Tarjeta de Identidad' :
                       formData.tipoDocumento === 'pasaporte' ? 'Pasaporte' : '-'}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Número de Documento</label>
                    <p className="text-slate-800 font-medium">{user.documento || '-'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Rol</label>
                    <p className="text-slate-800 font-medium">{getRolLabel(user.rol)}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Institución</label>
                    <p className="text-slate-800 font-medium">{institucion?.nombre || user.institucion || 'Sin asignar'}</p>
                  </div>
                </div>

                {/* Información adicional de la institución */}
                {institucion && (
                  <div className="mt-4 p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl border border-slate-200">
                    <div className="flex items-center gap-2 mb-3">
                      <IconInstitution size={18} className="text-slate-500" />
                      <h4 className="font-semibold text-slate-700">Detalles de la Institución</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-slate-500">Dirección:</span>
                        <p className="text-slate-700 font-medium">{institucion.direccion || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-slate-500">Teléfono:</span>
                        <p className="text-slate-700 font-medium">{institucion.telefono || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-slate-500">Correo:</span>
                        <p className="text-slate-700 font-medium">{institucion.correo || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-slate-500">Naturaleza:</span>
                        <p className="text-slate-700 font-medium capitalize">{institucion.naturaleza || 'N/A'}</p>
                      </div>
                      {institucion.municipio && (
                        <div>
                          <span className="text-slate-500">Ubicación:</span>
                          <p className="text-slate-700 font-medium">
                            {institucion.municipio}{institucion.departamento ? `, ${institucion.departamento}` : ''}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Estado de Cuenta</label>
                  <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
                    user.activo 
                      ? 'bg-emerald-100 text-emerald-700' 
                      : 'bg-slate-100 text-slate-500'
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${user.activo ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                    {user.activo ? 'Cuenta Activa' : 'Cuenta Inactiva'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sección de seguridad */}
        <div className="mt-6 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
            <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Seguridad
            </h2>
            <p className="text-sm text-slate-500 mt-1">Gestiona la seguridad de tu cuenta</p>
          </div>

          <div className="p-6">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
              <div>
                <h3 className="font-medium text-slate-800">Cambiar Contraseña</h3>
                <p className="text-sm text-slate-500 mt-1">
                  Actualiza tu contraseña para mantener tu cuenta segura
                </p>
              </div>
              <Button 
                variant="outline"
                onClick={() => showToast('Funcionalidad de cambio de contraseña próximamente', 'info')}
              >
                Cambiar
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
