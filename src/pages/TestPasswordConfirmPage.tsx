import { useState } from 'react';
import PasswordRecoveryModal from '../components/PasswordRecoveryModal';
import Button from '../components/ui/Button';

export default function TestPasswordConfirmPage() {
  const [showModal, setShowModal] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  const handleModalClose = () => {
    addLog('Modal cerrado');
    setShowModal(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          🔐 Test Modal de Confirmación de Contraseña
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Panel de Control */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Panel de Control
              </h2>

              <div className="space-y-4">
                <Button
                  onClick={() => setShowModal(true)}
                  className="w-full"
                >
                  Abrir Modal de Recuperación
                </Button>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-3">🧪 Pasos para probar:</h3>
                  <ol className="list-decimal list-inside space-y-2 text-blue-800 text-sm">
                    <li>Click en "Abrir Modal de Recuperación"</li>
                    <li>Ingresa tu correo electrónico</li>
                    <li>Obtén el código OTP (aparece en consola del backend)</li>
                    <li>Ingresa el código de 6 dígitos</li>
                    <li>Establece una nueva contraseña</li>
                    <li>Confirma la contraseña</li>
                    <li>🎯 **VERIFICA el modal de confirmación**</li>
                    <li>Copia exactamente la contraseña que muestra</li>
                    <li>Prueba el login con esa contraseña</li>
                  </ol>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h3 className="font-semibold text-red-900 mb-3">⚠️ Qué buscar en el modal:</h3>
                  <ul className="list-disc list-inside space-y-1 text-red-800 text-sm">
                    <li>Contraseña exacta que se guardará</li>
                    <li>Longitud correcta</li>
                    <li>Si hay espacios ocultos</li>
                    <li>Códigos ASCII de cada carácter</li>
                    <li>Valor original vs valor trim</li>
                  </ul>
                </div>

                <Button
                  onClick={() => setLogs([])}
                  variant="outline"
                  className="w-full"
                >
                  Limpiar Logs
                </Button>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                🔍 Problema a Identificar
              </h2>
              
              <div className="space-y-3 text-sm">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <p className="font-semibold text-amber-900">🐛 Problema Actual:</p>
                  <p className="text-amber-800">
                    La contraseña que se guarda en el sistema no coincide con la que se envía en el login.
                  </p>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="font-semibold text-green-900">✅ Solución:</p>
                  <p className="text-green-800">
                    El modal de confirmación muestra exactamente qué contraseña se guardará para poder compararla.
                  </p>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                  <p className="font-semibold text-purple-900">🎯 Objetivo:</p>
                  <p className="text-purple-800">
                    Identificar si el problema está en espacios ocultos, caracteres especiales, o estado del formulario.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Logs */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                📋 Activity Logs
              </h2>
              <span className="text-sm text-gray-500">
                {logs.length} eventos
              </span>
            </div>

            <div className="bg-black text-green-400 rounded-lg p-4 h-96 overflow-y-auto font-mono text-xs">
              {logs.length === 0 ? (
                <div className="text-gray-500">Interactúa con el modal para ver los logs...</div>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className="mb-1">
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Instrucciones Finales */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6">
          <h3 className="font-bold text-blue-900 mb-4">🎯 Flujo Completo de Prueba:</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-blue-800 mb-2">1. Cambio de Contraseña:</h4>
              <ol className="list-decimal list-inside space-y-1 text-blue-700 text-sm">
                <li>Abre el modal de recuperación</li>
                <li>Ingresa correo y obtén código</li>
                <li>Establece nueva contraseña</li>
                <li>🔍 **VERIFICA el modal de confirmación**</li>
                <li>Copia la contraseña exacta que muestra</li>
              </ol>
            </div>
            
            <div>
              <h4 className="font-semibold text-purple-800 mb-2">2. Prueba de Login:</h4>
              <ol className="list-decimal list-inside space-y-1 text-purple-700 text-sm">
                <li>Cierra el modal de recuperación</li>
                <li>Ve a la página de login</li>
                <li>Usa el mismo correo</li>
                <li>🔍 **Pega la contraseña exacta** que copiaste</li>
                <li>Observa los logs de la consola</li>
                <li>Compara valores character-by-character</li>
              </ol>
            </div>
          </div>

          <div className="mt-4 bg-red-100 border border-red-300 rounded-lg p-3">
            <p className="text-sm text-red-800 font-semibold">
              🔑 Si el login falla, compara exactamente la contraseña del modal con la que aparece en los logs del login.
            </p>
          </div>
        </div>
      </div>

      {/* Modal de Recuperación */}
      <PasswordRecoveryModal
        isOpen={showModal}
        onClose={handleModalClose}
      />
    </div>
  );
}
