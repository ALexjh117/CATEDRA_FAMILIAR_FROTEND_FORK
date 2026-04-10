import { useState, useEffect } from 'react';
import Modal from './ui/Modal';
import Button from './ui/Button';
import FormFieldInput from './ui/FormFieldInput';
import { IconMail, IconCheck, IconLock, IconKey, IconArrowLeft } from './ui/Icons';
import { solicitarCodigoRecuperacion, verificarCodigoOTP, verificarCodigoYCambiarContrasena } from '../api/endpoints';

type Step = 'email' | 'code' | 'success';

interface PasswordRecoveryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PasswordRecoveryModal({ isOpen, onClose }: PasswordRecoveryModalProps) {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Debug removido

  const resetForm = () => {
    setEmail('');
    setCode('');
    setNewPassword('');
    setConfirmPassword('');
    setError(null);
    setEmailSent(false);
    setStep('email');
    setShowConfirmModal(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await solicitarCodigoRecuperacion(email);
      
      if (result.success) {
        setEmailSent(true);
        setStep('code');
      } else {
        setError(result.error || 'No se pudo enviar el código');
      }
    } catch (err) {
      setError('Error de conexión. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!code || code.length !== 6) {
      setError('Ingresa el código de 6 dígitos');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const result = await verificarCodigoOTP(code);
      
      if (result.success) {
        setError(null);
      } else {
        setError(result.error || 'Código inválido o expirado');
      }
    } catch (err) {
      setError('Error de conexión. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setError(null);

    // Debug removido

    // Validaciones
    if (!code || code.length !== 6) {
      // Debug removido
      setError('Ingresa el código de 6 dígitos');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      // Debug removido
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (newPassword !== confirmPassword) {
      // Debug removido
      setError('Las contraseñas no coinciden');
      return;
    }

    // Debug removido
    // En lugar de enviar directamente, mostrar modal de confirmación
    setShowConfirmModal(true);
  };

  const confirmPasswordChange = async () => {
    setShowConfirmModal(false);
    setLoading(true);

    try {
      // Debug removido
      
      const result = await verificarCodigoYCambiarContrasena(code, newPassword);
      
      if (result.success) {
        // Debug removido
        setStep('success');
      } else {
        // Debug removido
        setError(result.error || 'Error al cambiar contraseña');
      }
    } catch (err) {
      // Debug removido
      setError('Error de conexión. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    if (step === 'code') {
      setStep('email');
      setEmailSent(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={step === 'email' ? 'Recuperar Contraseña' : step === 'code' ? 'Verificar Código' : '¡Contraseña Actualizada!'}
      size="md"
    >
      {/* Step 1: Email */}
      {step === 'email' && (
        <form onSubmit={handleSendCode} className="space-y-4">
          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center">
              <IconMail className="text-indigo-600" size={32} />
            </div>
            <p className="text-slate-600 text-sm">
              Ingresa tu correo electrónico y te enviaremos un código de recuperación de 6 dígitos.
            </p>
            <p className="text-slate-500 text-xs mt-2">
              El código también se mostrará en la consola del sistema para desarrollo.
            </p>
          </div>

          <FormFieldInput
            name="email"
            label="Correo Electrónico"
            type="email"
            placeholder="tu-correo@ejemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={handleClose}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading || !email}
              className="flex-1"
            >
              {loading ? 'Enviando...' : 'Enviar Código'}
            </Button>
          </div>
        </form>
      )}

      {/* Step 2: Code Verification */}
      {step === 'code' && (
        <div className="space-y-4">
          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
              <IconKey className="text-amber-600" size={32} />
            </div>
            <p className="text-slate-600 text-sm">
              Enviamos un código de 6 dígitos a <span className="font-medium">{email}</span>
            </p>
            <p className="text-slate-500 text-xs mt-2">
              También puedes ver el código en la consola del sistema
            </p>
          </div>

          <div className="space-y-4">
            <FormFieldInput
              name="code"
              label="Código de Verificación"
              type="text"
              placeholder="000000"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              required
              className="text-center text-lg tracking-widest"
              helpText="Máximo 6 dígitos"
            />

            <Button
              type="button"
              variant="outline"
              onClick={handleVerifyCode}
              disabled={loading || code.length !== 6}
              className="w-full"
            >
              {loading ? 'Verificando...' : 'Verificar Código'}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-slate-500">O establecer nueva contraseña directamente</span>
              </div>
            </div>

            <FormFieldInput
              name="newPassword"
              label="Nueva Contraseña"
              type="password"
              placeholder="Ingresa tu nueva contraseña"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />

            <FormFieldInput
              name="confirmPassword"
              label="Confirmar Nueva Contraseña"
              type="password"
              placeholder="Repite tu nueva contraseña"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={goBack}
              className="flex items-center gap-2"
            >
              <IconArrowLeft size={16} />
              Atrás
            </Button>
            <Button
              onClick={handleResetPassword}
              disabled={loading || !code || !newPassword || !confirmPassword}
              className="flex-1"
            >
              {loading ? 'Actualizando...' : 'Cambiar Contraseña'}
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Success */}
      {step === 'success' && (
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center">
            <IconCheck className="text-green-600" size={32} />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">
            ✅ ¡Contraseña Actualizada!
          </h3>
          <p className="text-slate-600 mb-6">
            Tu contraseña ha sido cambiada correctamente. Ahora puedes iniciar sesión con tu nueva contraseña.
          </p>
          <Button onClick={handleClose} className="w-full">
            Ir al Login
          </Button>
        </div>
      )}

      {/* Modal de Confirmación de Cambio de Contraseña - FUERA del modal principal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="🔐 Confirmar Cambio de Contraseña"
        size="md"
      >
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="font-bold text-red-800 mb-2 text-center">
              ⚠️ ¡VERIFICA LA CONTRASEÑA ANTES DE CONTINUAR!
            </h3>
            <p className="text-sm text-red-700 text-center">
              Esta es la contraseña exacta que se guardará en el sistema:
            </p>
          </div>

          <div className="bg-slate-100 border-2 border-slate-300 rounded-lg p-4">
            <div className="text-center">
              <p className="text-xs text-slate-600 mb-2 font-semibold">CONTRASEÑA QUE SE GUARDARÁ:</p>
              <div className="bg-white border-2 border-red-400 rounded px-4 py-3 font-mono text-lg font-bold text-red-600">
                {newPassword}
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Longitud: {newPassword.length} caracteres
              </p>
              <p className="text-xs text-slate-500">
                Espacios: {newPassword !== newPassword.trim() ? 'SÍ (¡PROBLEMA!)' : 'NO'}
              </p>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <h4 className="font-semibold text-blue-800 mb-2 text-sm">📋 Análisis Detallado:</h4>
            <div className="text-xs text-blue-700 space-y-1 font-mono">
              <div><strong>Valor exacto:</strong> [{newPassword}]</div>
              <div><strong>Valor trim:</strong> [{newPassword.trim()}</div>
              <div><strong>Códigos ASCII:</strong> {Array.from(newPassword).map(c => c.charCodeAt(0)).join(',')}</div>
              <div><strong>Caracteres:</strong> {Array.from(newPassword).map(c => `'${c}'`).join(', ')}</div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-xs text-amber-800">
              <strong>📝 NOTA:</strong> Copia esta contraseña exactamente como aparece arriba para probar el login después del cambio.
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowConfirmModal(false)}
              className="flex-1"
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              onClick={confirmPasswordChange}
              disabled={loading}
              className="flex-1 bg-red-600 hover:bg-red-700"
            >
              {loading ? 'Guardando...' : 'Sí, Guardar Esta Contraseña'}
            </Button>
          </div>
        </div>
      </Modal>
    </Modal>
  );
}
