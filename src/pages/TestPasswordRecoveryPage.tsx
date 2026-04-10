import { useState } from 'react';
import PasswordRecoveryModal from '../components/PasswordRecoveryModal';
import Button from '../components/ui/Button';

export default function TestPasswordRecoveryPage() {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-4 text-center">
          Test Sistema de Recuperación
        </h1>
        
        <p className="text-gray-600 mb-8 text-center">
          Prueba el nuevo sistema de recuperación de contraseña con códigos OTP
        </p>

        <div className="space-y-4">
          <Button
            onClick={() => setShowModal(true)}
            className="w-full"
          >
            Abrir Modal de Recuperación
          </Button>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">📋 Características:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>✅ Envío de código OTP de 6 dígitos</li>
              <li>✅ Verificación de código</li>
              <li>✅ Cambio de contraseña seguro</li>
              <li>✅ Validación de contraseñas</li>
              <li>✅ Manejo de errores</li>
              <li>✅ UI responsiva</li>
            </ul>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h3 className="font-semibold text-amber-900 mb-2">🔧 Para probar:</h3>
            <ol className="text-sm text-amber-800 space-y-1">
              <li>1. Ingresa un correo válido</li>
              <li>2. Recibirás un código en consola (backend)</li>
              <li>3. Ingresa el código de 6 dígitos</li>
              <li>4. Establece nueva contraseña</li>
              <li>5. ¡Listo!</li>
            </ol>
          </div>
        </div>
      </div>

      <PasswordRecoveryModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </div>
  );
}
