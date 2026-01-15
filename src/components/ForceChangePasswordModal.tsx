import { useState } from 'react';
import Modal from './ui/Modal';
import Button from './ui/Button';
import FormFieldInput from './ui/FormFieldInput';
import { IconLock, IconAlertTriangle } from './ui/Icons';
import { cambiarContrasena } from '../api/endpoints';

export default function ForceChangePasswordModal({
  isOpen,
  userId,
  userName,
  onSuccess
}: {
  isOpen: boolean;
  userId: number;
  userName: string;
  onSuccess: () => void;
}) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validaciones
    if (newPassword.length < 6) {
      setError('La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (currentPassword === newPassword) {
      setError('La nueva contraseña debe ser diferente a la actual');
      return;
    }

    setLoading(true);

    try {
      const result = await cambiarContrasena(userId, currentPassword, newPassword);
      
      if (result.success) {
        // Limpiar formulario
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        onSuccess();
      } else {
        setError(result.error || 'Error al cambiar contraseña');
      }
    } catch (err) {
      setError('Error de conexión. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {}} // No se puede cerrar, es obligatorio
      title="Cambio de Contraseña Obligatorio"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Alerta */}
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
          <IconAlertTriangle className="text-amber-600 flex-shrink-0 mt-0.5" size={20} />
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-800 mb-1">
              Actualización de Seguridad Requerida
            </p>
            <p className="text-sm text-amber-700">
              Hola <strong>{userName}</strong>, debes cambiar tu contraseña antes de continuar.
              Esta es una medida de seguridad para proteger tu cuenta.
            </p>
          </div>
        </div>

        <FormFieldInput
          name="currentPassword"
          label="Contraseña Actual"
          type="password"
          placeholder="Ingresa tu contraseña actual"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          required
        />

        <FormFieldInput
          name="newPassword"
          label="Nueva Contraseña"
          type="password"
          placeholder="Mínimo 6 caracteres"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />

        <FormFieldInput
          name="confirmPassword"
          label="Confirmar Nueva Contraseña"
          type="password"
          placeholder="Repite la nueva contraseña"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        {/* Indicador de fortaleza */}
        {newPassword && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600">Fortaleza:</span>
              <span className={`font-semibold ${
                newPassword.length < 6 ? 'text-red-600' :
                newPassword.length < 8 ? 'text-amber-600' :
                'text-green-600'
              }`}>
                {newPassword.length < 6 ? 'Débil' :
                 newPassword.length < 8 ? 'Media' :
                 'Fuerte'}
              </span>
            </div>
            <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all ${
                  newPassword.length < 6 ? 'bg-red-500 w-1/3' :
                  newPassword.length < 8 ? 'bg-amber-500 w-2/3' :
                  'bg-green-500 w-full'
                }`}
              />
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <div className="pt-4">
          <Button
            type="submit"
            disabled={loading || !currentPassword || !newPassword || !confirmPassword}
            className="w-full"
          >
            {loading ? 'Cambiando contraseña...' : 'Cambiar Contraseña'}
          </Button>
        </div>

        <p className="text-xs text-slate-500 text-center">
          Esta acción es obligatoria. No podrás acceder al sistema sin cambiar tu contraseña.
        </p>
      </form>
    </Modal>
  );
}
