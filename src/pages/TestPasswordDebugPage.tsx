import { useState } from 'react';
import FormFieldInput from '../components/ui/FormFieldInput';
import Button from '../components/ui/Button';

export default function TestPasswordDebugPage() {
  const [password, setPassword] = useState('');
  const [passwordTrim, setPasswordTrim] = useState('');
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const trimmed = value.trim();
    
    setPassword(value);
    setPasswordTrim(trimmed);
    
    addLog(`Cambio detectado: "${value}" (len: ${value.length})`);
    addLog(`Trim: "${trimmed}" (len: ${trimmed.length})`);
    addLog(`Tiene espacios al inicio: ${value.startsWith(' ')}`);
    addLog(`Tiene espacios al final: ${value.endsWith(' ')}`);
    addLog(`Char codes: ${Array.from(value).map(c => c.charCodeAt(0)).join(',')}`);
    addLog(`Trim char codes: ${Array.from(trimmed).map(c => c.charCodeAt(0)).join(',')}`);
    addLog('---');
  };

  const testSubmit = () => {
    addLog(`SUBMIT - Enviando: "${passwordTrim}"`);
    addLog(`SUBMIT - Longitud: ${passwordTrim.length}`);
    addLog(`SUBMIT - Valor exacto: [${passwordTrim}]`);
    addLog('=== SUBMIT COMPLETADO ===');
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const simulatePasswordRecovery = () => {
    addLog('SIMULACIÓN - Cambio de contraseña completado');
    addLog('SIMULACIÓN - Limpiando formulario...');
    setPassword('');
    setPasswordTrim('');
    addLog('SIMULACIÓN - Formulario limpiado');
    addLog('=== SIMULACIÓN COMPLETADA ===');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          🔍 Debug de Contraseña
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Formulario de prueba */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Formulario de Prueba
            </h2>

            <div className="space-y-4">
              <FormFieldInput
                label="Contraseña"
                name="password"
                type="password"
                placeholder="Escribe una contraseña"
                value={password}
                onChange={handlePasswordChange}
              />

              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <h3 className="font-semibold text-gray-700">Estado actual:</h3>
                <p><strong>Valor original:</strong> [{password}]</p>
                <p><strong>Valor trim:</strong> [{passwordTrim}]</p>
                <p><strong>Longitud original:</strong> {password.length}</p>
                <p><strong>Longitud trim:</strong> {passwordTrim.length}</p>
                <p><strong>Son iguales:</strong> {password === passwordTrim ? 'SÍ' : 'NO'}</p>
              </div>

              <div className="flex gap-3">
                <Button onClick={testSubmit} className="flex-1">
                  Probar Submit
                </Button>
                <Button onClick={simulatePasswordRecovery} variant="outline" className="flex-1">
                  Simular Recuperación
                </Button>
              </div>

              <Button onClick={clearLogs} variant="ghost" className="w-full">
                Limpiar Logs
              </Button>
            </div>
          </div>

          {/* Logs */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                Console Logs
              </h2>
              <span className="text-sm text-gray-500">
                {logs.length} entradas
              </span>
            </div>

            <div className="bg-black text-green-400 rounded-lg p-4 h-96 overflow-y-auto font-mono text-xs">
              {logs.length === 0 ? (
                <div className="text-gray-500">Escribe en el campo de contraseña para ver los logs...</div>
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

        {/* Instrucciones */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="font-semibold text-blue-900 mb-3">🧪 Pasos para reproducir el problema:</h3>
          <ol className="list-decimal list-inside space-y-2 text-blue-800">
            <li>Escribe una contraseña en el campo (ej: "Alexjh179@")</li>
            <li>Observa los logs para ver el valor exacto</li>
            <li>Click en "Simular Recuperación" (limpia el formulario)</li>
            <li>Escribe la misma contraseña pero con una pequeña variación (ej: "Alexjh170@")</li>
            <li>Click en "Probar Submit" para ver qué se enviaría</li>
            <li>Compara los valores para detectar diferencias</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
