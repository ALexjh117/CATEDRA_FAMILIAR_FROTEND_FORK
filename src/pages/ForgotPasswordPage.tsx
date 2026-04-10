import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import FormFieldInput from '../components/ui/FormFieldInput';
import { IconMail, IconArrowLeft, IconCheck } from '../components/ui/Icons';
import { solicitarCodigoRecuperacion } from '../api/endpoints';
import '../styles/ForgotPasswordOTP.css';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [codigo, setCodigo] = useState(['', '', '', '', '', '']);
  const [nuevaContrasena, setNuevaContrasena] = useState('');
  const [confirmarContrasena, setConfirmarContrasena] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [step, setStep] = useState<'email' | 'code' | 'success'>('email');

  // Manejar input de código OTP
  const handleCodeChange = (index: number, value: string) => {
    const newCode = [...codigo];
    newCode[index] = value.slice(-1); // Solo un dígito
    setCodigo(newCode);
    
    // Auto-focus al siguiente input
    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`) as HTMLInputElement;
      nextInput?.focus();
    }
  };

  // Pegar código
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    const newCode = pastedData.split('').map((char, index) => 
      index < 6 ? char : codigo[index] || ''
    );
    setCodigo(newCode);
  };

  // Solicitar código OTP
  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      console.log('[ForgotPassword] SOLICITANDO CÓDIGO OTP:', {
        email: email,
        timestamp: new Date().toISOString()
      });

      const response = await solicitarCodigoRecuperacion(email);

      console.log('[ForgotPassword] RESPUESTA CÓDIGO OTP:', {
        success: response.success,
        message: response.message,
        data: response.data
      });

      if (response.success) {
        const successMessage = '✅ Código enviado a tu correo';
        
        // En desarrollo, mostrar el código
        if (response.data?.codigo) {
          setMessage(`${successMessage}\n🔑 Código de desarrollo: ${response.data.codigo}`);
        } else {
          setMessage(successMessage);
        }
        
        setStep('code');
        setShowCodeInput(true);
      } else {
        setMessage(`❌ ${response.message}`);
      }
    } catch (error) {
      console.error('[ForgotPassword] ERROR SOLICITANDO CÓDIGO:', error);
      setMessage('❌ Error al solicitar código');
    } finally {
      setLoading(false);
    }
  };

  // Cambiar contraseña
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetLoading(true);
    setMessage('');

    // Validaciones
    const codigoCompleto = codigo.join('');
    console.log('[ForgotPassword] INTENTANDO CAMBIAR CONTRASEÑA:', {
      codigo: codigoCompleto,
      codigoLength: codigoCompleto.length,
      nuevaContrasena: nuevaContrasena,
      nuevaContrasenaLength: nuevaContrasena.length,
      confirmarContrasena: confirmarContrasena,
      passwordsMatch: nuevaContrasena === confirmarContrasena
    });

    if (codigoCompleto.length !== 6) {
      setMessage('❌ El código debe tener 6 dígitos');
      setResetLoading(false);
      return;
    }

    if (nuevaContrasena.length < 6) {
      setMessage('❌ La contraseña debe tener al menos 6 caracteres');
      setResetLoading(false);
      return;
    }

    if (nuevaContrasena !== confirmarContrasena) {
      setMessage('❌ Las contraseñas no coinciden');
      setResetLoading(false);
      return;
    }

    try {
      const { verificarCodigoYCambiarContrasena } = await import('../api/endpoints');
      
      const response = await verificarCodigoYCambiarContrasena(codigoCompleto, nuevaContrasena);

      console.log('[ForgotPassword] RESPUESTA CAMBIO CONTRASEÑA:', {
        success: response.success,
        message: response.message,
        passwordQueSeGuardo: nuevaContrasena
      });

      if (response.success) {
        setMessage('✅ Contraseña actualizada correctamente');
        setStep('success');
        
        // Redirigir al login después de 2 segundos
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setMessage(`❌ ${response.message}`);
      }
    } catch (error) {
      console.error('[ForgotPassword] ERROR CAMBIANDO CONTRASEÑA:', error);
      setMessage('❌ Error al actualizar contraseña');
    } finally {
      setResetLoading(false);
    }
  };

  const goBack = () => {
    if (step === 'code') {
      setStep('email');
      setShowCodeInput(false);
      setMessage('');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/login" className="inline-flex items-center text-teal-600 hover:text-teal-700 mb-4">
            <IconArrowLeft size={20} className="mr-2" />
            Volver al Login
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {step === 'email' && 'Recuperar Contraseña'}
            {step === 'code' && 'Restablecer Contraseña'}
            {step === 'success' && '✅ Contraseña Actualizada'}
          </h1>
          <p className="text-gray-600">
            {step === 'email' && 'Recupera el acceso a tu cuenta'}
            {step === 'code' && 'Ingresa el código y tu nueva contraseña'}
            {step === 'success' && 'Tu contraseña ha sido cambiada'}
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* Step 1: Email */}
          {step === 'email' && (
            <form onSubmit={handleRequestCode} className="space-y-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
                  <IconMail className="text-blue-600" size={32} />
                </div>
                <p className="text-gray-600 mb-4">
                  Ingresa tu correo electrónico y te enviaremos un código de verificación
                </p>
              </div>

              <FormFieldInput
                name="email"
                label="Correo electrónico"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="tu@correo.com"
                className="w-full"
              />

              <Button
                type="submit"
                disabled={loading || !email}
                className="w-full"
              >
                {loading ? 'Enviando...' : 'Enviar código'}
              </Button>
            </form>
          )}

          {/* Step 2: Code + Password */}
          {step === 'code' && (
            <form onSubmit={handleResetPassword} className="space-y-6">
              <div className="text-center mb-6">
                <p className="text-gray-600 mb-2">
                  Ingresa el código de 6 dígitos enviado a:
                </p>
                <p className="font-semibold text-blue-600">{email}</p>
              </div>

              {/* Input de código OTP */}
              <div className="otp-inputs flex justify-center gap-2 mb-6">
                {codigo.map((digit, index) => (
                  <input
                    key={index}
                    id={`code-${index}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleCodeChange(index, e.target.value)}
                    onPaste={index === 0 ? handlePaste : undefined}
                    className="otp-input w-12 h-12 text-center text-xl font-bold border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-all"
                    pattern="[0-9]"
                    inputMode="numeric"
                  />
                ))}
              </div>

              <FormFieldInput
                name="nuevaContrasena"
                label="Nueva contraseña"
                type="password"
                value={nuevaContrasena}
                onChange={(e) => setNuevaContrasena(e.target.value)}
                required
                placeholder="Mínimo 6 caracteres"
                className="w-full"
                helpText="Mínimo 6 caracteres"
              />

              <FormFieldInput
                name="confirmarContrasena"
                label="Confirmar contraseña"
                type="password"
                value={confirmarContrasena}
                onChange={(e) => setConfirmarContrasena(e.target.value)}
                required
                placeholder="Repite la nueva contraseña"
                className="w-full"
              />

              <div className="form-actions flex gap-3">
                <Button
                  type="button"
                  onClick={goBack}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <IconArrowLeft size={16} />
                  Atrás
                </Button>
                <Button
                  type="submit"
                  disabled={resetLoading || codigo.join('').length !== 6 || !nuevaContrasena || !confirmarContrasena}
                  className="flex-1"
                >
                  {resetLoading ? 'Actualizando...' : 'Actualizar contraseña'}
                </Button>
              </div>
            </form>
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
                Tu contraseña ha sido cambiada correctamente. Serás redirigido al login...
              </p>
              <div className="animate-pulse text-sm text-blue-600">
                Redirigiendo en 2 segundos...
              </div>
              <Button
                onClick={() => navigate('/login')}
                variant="outline"
                className="mt-4"
              >
                Ir al Login ahora
              </Button>
            </div>
          )}

          {/* Message */}
          {message && (
            <div className={`mt-6 p-4 rounded-lg text-center ${
              message.includes('✅') ? 'bg-green-50 text-green-800 border border-green-200' : 
              message.includes('❌') ? 'bg-red-50 text-red-800 border border-red-200' : 
              'bg-blue-50 text-blue-800 border border-blue-200'
            }`}>
              <div className="whitespace-pre-line">{message}</div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-gray-600 text-sm">
            ¿Recordaste tu contraseña?{' '}
            <Link to="/login" className="text-teal-600 hover:text-teal-700 font-medium">
              Iniciar sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
