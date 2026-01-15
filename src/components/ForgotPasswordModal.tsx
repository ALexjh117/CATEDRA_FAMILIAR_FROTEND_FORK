import { useState } from 'react';
import Modal from './ui/Modal';
import Button from './ui/Button';
import FormFieldInput from './ui/FormFieldInput';
import { IconMail, IconCheck } from './ui/Icons';
import { solicitarRecuperacionContrasena } from '../api/endpoints';

export default function ForgotPasswordModal({
  isOpen,
  onClose
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await solicitarRecuperacionContrasena(email);
      
      if (result.success) {
        setSuccess(true);
        setEmail('');
      } else {
        setError(result.error || 'Error al enviar correo de recuperación');
      }
    } catch (err) {
      setError('Error de conexión. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setError(null);
    setSuccess(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Recuperar Contraseña"
      size="md"
    >
      {!success ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center">
              <IconMail className="text-indigo-600" size={32} />
            </div>
            <p className="text-slate-600 text-sm">
              Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
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
              {loading ? 'Enviando...' : 'Enviar Enlace'}
            </Button>
          </div>
        </form>
      ) : (
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center">
            <IconCheck className="text-green-600" size={32} />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">
            ✅ Correo Enviado
          </h3>
          <p className="text-slate-600 mb-6">
            Hemos enviado un enlace de recuperación a tu correo electrónico.
            Revisa tu bandeja de entrada y sigue las instrucciones.
          </p>
          <Button onClick={handleClose} className="w-full">
            Entendido
          </Button>
        </div>
      )}
    </Modal>
  );
}
