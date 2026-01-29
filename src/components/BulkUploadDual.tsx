import { useState } from 'react';
import { 
  IconDownload, 
  IconFileUpload, 
  IconCheck, 
  IconAlertTriangle,
  IconFileSpreadsheet,
  IconLoader,
  IconUsers,
  IconUser
} from './ui/Icons';
import Button from './ui/Button';
import apiClient from '../api/apiClient';

interface BulkUploadDualProps {
  institucionId: number;
  onClose: () => void;
  onSuccess?: () => void;
}

interface UploadResult {
  totalEstudiantes: number;
  estudiantesCreados: number;
  estudiantesActualizados: number;
  totalAcudientes: number;
  acudientesCreados: number;
  acudientesReutilizados: number;
  vinculosCreados: number;
  errores?: Array<{
    archivo: 'estudiantes' | 'acudientes';
    fila: number;
    campo: string;
    valor: any;
    mensaje: string;
  }>;
}

export default function BulkUploadDual({ institucionId, onClose, onSuccess }: BulkUploadDualProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [archivoEstudiantes, setArchivoEstudiantes] = useState<File | null>(null);
  const [archivoAcudientes, setArchivoAcudientes] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // ============================================
  // PASO 1: Instrucciones
  // ============================================

  const handleNext = () => {
    if (step === 1) {
      setStep(2);
    } else if (step === 2 && archivoEstudiantes && archivoAcudientes) {
      handleUpload();
    }
  };

  // ============================================
  // PASO 2: Subir archivos
  // ============================================

  const handleFileEstudiantes = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setArchivoEstudiantes(file);
      setError(null);
    }
  };

  const handleFileAcudientes = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setArchivoAcudientes(file);
      setError(null);
    }
  };

  const handleDropEstudiantes = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      setArchivoEstudiantes(file);
      setError(null);
    }
  };

  const handleDropAcudientes = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      setArchivoAcudientes(file);
      setError(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // ============================================
  // PASO 3: Procesar
  // ============================================

  const handleUpload = async () => {
    if (!archivoEstudiantes || !archivoAcudientes) {
      setError('Debes seleccionar ambos archivos');
      return;
    }

    console.log('🚀 [BulkUploadDual] Iniciando carga masiva...');
    console.log('📄 Archivo Estudiantes:', archivoEstudiantes.name, archivoEstudiantes.size, 'bytes');
    console.log('👨‍👩‍👧 Archivo Acudientes:', archivoAcudientes.name, archivoAcudientes.size, 'bytes');
    console.log('🏫 Institución ID:', institucionId);

    setProcessing(true);
    setProgress(0);
    setError(null);
    setStep(3);

    try {
      setProgress(20);
      console.log('📡 Enviando archivos al backend...');
      
      const response = await apiClient.cargaMasivaDual(
        archivoEstudiantes,
        archivoAcudientes,
        institucionId
      );

      console.log('📥 Respuesta del backend:', response);
      console.log('📊 Datos completos:', JSON.stringify(response.data, null, 2));
      setProgress(100);

      if (response.success && response.data) {
        console.log('✅ Carga exitosa:', response.data);
        console.log('📋 Errores del backend:', response.data.errores);
        console.log('📋 Detalle estudiantes:', response.data.detalleEstudiantes);
        console.log('📋 Detalle acudientes:', response.data.detalleAcudientes);
        setResult(response.data);
        if (onSuccess) {
          onSuccess();
        }
      } else {
        console.error('❌ Error en la respuesta:', response.message);
        setError(response.message || 'Error al procesar la carga masiva');
      }
    } catch (err: any) {
      console.error('💥 Error capturado:', err);
      console.error('Stack:', err.stack);
      setError(err.message || 'Error inesperado al procesar los archivos');
    } finally {
      setProcessing(false);
      console.log('🏁 Proceso finalizado');
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-between">
        {[
          { num: 1, label: 'Instrucciones' },
          { num: 2, label: 'Cargar Archivos' },
          { num: 3, label: 'Resultado' }
        ].map((s, i) => (
          <div key={s.num} className="flex items-center flex-1">
            <div className="flex flex-col items-center flex-1">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                step >= s.num 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-slate-200 text-slate-400'
              }`}>
                {s.num}
              </div>
              <div className={`text-xs mt-1 ${step >= s.num ? 'text-indigo-600 font-semibold' : 'text-slate-500'}`}>
                {s.label}
              </div>
            </div>
            {i < 2 && (
              <div className={`h-0.5 flex-1 ${step > s.num ? 'bg-indigo-600' : 'bg-slate-200'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Instrucciones */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-6 border border-indigo-100">
            <h3 className="text-lg font-bold text-indigo-900 mb-4">
              📋 Carga Masiva Simplificada
            </h3>
            <p className="text-slate-700 mb-4">
              Ahora puedes subir tus archivos <strong>sin modificarlos</strong>. El sistema acepta el formato que ya manejas en tu institución.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <h4 className="font-bold text-slate-800 mb-3">✅ Formato de Archivos Aceptados</h4>
            
            <div className="space-y-4">
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-start gap-3">
                  <IconUsers className="text-blue-600 flex-shrink-0 mt-1" size={24} />
                  <div className="flex-1">
                    <p className="font-semibold text-blue-900 mb-2">Archivo 1: Estudiantes</p>
                    <p className="text-sm text-blue-700 mb-2">Debe contener estas columnas:</p>
                    <ul className="text-xs text-blue-600 space-y-1">
                      <li>• TIPO DOCUMENTO, NUMERO DOCUMENTO, NOMBRES, APELLIDOS</li>
                      <li>• FECHA DE NACIMIENTO, SEXO, CURSO</li>
                      <li>• DOCUMENTO ACUDIENTE (para vincular)</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
                <div className="flex items-start gap-3">
                  <IconUser className="text-emerald-600 flex-shrink-0 mt-1" size={24} />
                  <div className="flex-1">
                    <p className="font-semibold text-emerald-900 mb-2">Archivo 2: Acudientes</p>
                    <p className="text-sm text-emerald-700 mb-2">Debe contener estas columnas:</p>
                    <ul className="text-xs text-emerald-600 space-y-1">
                      <li>• TIPO DOCUMENTO, NUMERO DOCUMENTO, NOMBRES, APELLIDOS</li>
                      <li>• TELEFONO, CORREO, DIRECCION</li>
                      <li>• PARENTESCO, OCUPACION</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="text-sm text-amber-800 font-semibold mb-2">💡 Conversiones Automáticas:</p>
            <ul className="text-sm text-amber-700 space-y-1 list-disc list-inside">
              <li>Fechas: 12/03/2008 → 2008-03-12 (automático)</li>
              <li>Mayúsculas: TI, CC, MADRE → ti, cc, madre (automático)</li>
              <li>Cursos: 2A, 3B → 2, 3 (extrae el número automáticamente)</li>
              <li>Vinculación: Se hace automáticamente por documento</li>
            </ul>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={handleNext}>
              Siguiente: Cargar Archivos
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Subir Archivos */}
      {step === 2 && (
        <div className="space-y-4">
          {/* Archivo Estudiantes */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              📄 Archivo de Estudiantes
            </label>
            <div
              onDrop={handleDropEstudiantes}
              onDragOver={handleDragOver}
              className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors cursor-pointer bg-slate-50/50"
            >
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileEstudiantes}
                className="hidden"
                id="file-estudiantes"
              />
              <label htmlFor="file-estudiantes" className="cursor-pointer">
                <IconFileSpreadsheet className="mx-auto mb-3 text-blue-400" size={48} />
                {archivoEstudiantes ? (
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-blue-200 rounded-lg">
                    <IconCheck size={16} className="text-blue-600" />
                    <span className="text-sm font-medium text-blue-700">{archivoEstudiantes.name}</span>
                  </div>
                ) : (
                  <>
                    <p className="text-sm font-semibold text-slate-700 mb-1">
                      Arrastra tu archivo aquí o haz clic para seleccionar
                    </p>
                    <p className="text-xs text-slate-500">
                      Excel (.xlsx, .xls) o CSV
                    </p>
                  </>
                )}
              </label>
            </div>
          </div>

          {/* Archivo Acudientes */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              👨‍👩‍👧 Archivo de Acudientes
            </label>
            <div
              onDrop={handleDropAcudientes}
              onDragOver={handleDragOver}
              className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-emerald-400 transition-colors cursor-pointer bg-slate-50/50"
            >
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileAcudientes}
                className="hidden"
                id="file-acudientes"
              />
              <label htmlFor="file-acudientes" className="cursor-pointer">
                <IconFileSpreadsheet className="mx-auto mb-3 text-emerald-400" size={48} />
                {archivoAcudientes ? (
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-emerald-200 rounded-lg">
                    <IconCheck size={16} className="text-emerald-600" />
                    <span className="text-sm font-medium text-emerald-700">{archivoAcudientes.name}</span>
                  </div>
                ) : (
                  <>
                    <p className="text-sm font-semibold text-slate-700 mb-1">
                      Arrastra tu archivo aquí o haz clic para seleccionar
                    </p>
                    <p className="text-xs text-slate-500">
                      Excel (.xlsx, .xls) o CSV
                    </p>
                  </>
                )}
              </label>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
              <IconAlertTriangle className="text-red-600 flex-shrink-0 mt-0.5" size={18} />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => setStep(1)}>
              Volver
            </Button>
            <Button 
              onClick={handleNext} 
              disabled={!archivoEstudiantes || !archivoAcudientes}
              className="flex-1"
            >
              {!archivoEstudiantes || !archivoAcudientes ? 'Selecciona ambos archivos' : 'Procesar Carga Masiva'}
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Resultado */}
      {step === 3 && (
        <div className="space-y-4">
          {processing ? (
            <div className="text-center py-12">
              <IconLoader className="mx-auto mb-4 text-indigo-600 animate-spin" size={64} />
              <h3 className="text-lg font-bold text-slate-800 mb-2">
                Procesando archivos...
              </h3>
              <div className="max-w-md mx-auto">
                <div className="bg-slate-200 h-3 rounded-full overflow-hidden mb-2">
                  <div 
                    className="bg-indigo-600 h-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-sm text-slate-600">
                  {progress < 50 ? 'Validando archivos...' : progress < 80 ? 'Creando registros...' : 'Finalizando...'}
                </p>
              </div>
            </div>
          ) : result ? (
            <div>
              {/* Advertencia si no se crearon registros */}
              {result.estudiantesCreados === 0 && result.acudientesCreados === 0 && (
                <div className="bg-amber-50 border-2 border-amber-400 rounded-xl p-6 mb-4">
                  <div className="flex items-start gap-3">
                    <IconAlertTriangle className="text-amber-600 flex-shrink-0 mt-1" size={32} />
                    <div>
                      <h3 className="font-bold text-amber-900 text-lg mb-2">⚠️ No se Crearon Registros</h3>
                      <p className="text-amber-800 mb-3">
                        El backend procesó los archivos pero <strong>no insertó ningún estudiante ni acudiente</strong>. 
                        Esto generalmente ocurre por:
                      </p>
                      <ul className="text-sm text-amber-700 space-y-1 list-disc list-inside">
                        <li>Las columnas del Excel no coinciden con las esperadas</li>
                        <li>Los datos ya existen en el sistema (documentos duplicados)</li>
                        <li>Faltan campos obligatorios en los archivos</li>
                        <li>El formato de las fechas o datos no es válido</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-white border border-slate-200 rounded-xl p-6 mb-4">
                <div className="flex items-center gap-3 mb-4">
                  <IconCheck className={result.estudiantesCreados > 0 || result.acudientesCreados > 0 ? "text-green-600" : "text-amber-600"} size={32} />
                  <h3 className="font-bold text-slate-800 text-lg">
                    {result.estudiantesCreados > 0 || result.acudientesCreados > 0 
                      ? '¡Carga Masiva Completada!' 
                      : 'Proceso Completado (Sin Registros Creados)'}
                  </h3>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                  <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-blue-600">{result.totalEstudiantes}</div>
                    <div className="text-xs text-blue-600 mt-1">Estudiantes Procesados</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-green-600">{result.estudiantesCreados}</div>
                    <div className="text-xs text-green-600 mt-1">Estudiantes Creados</div>
                  </div>
                  <div className="bg-emerald-50 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-emerald-600">{result.totalAcudientes}</div>
                    <div className="text-xs text-emerald-600 mt-1">Acudientes Procesados</div>
                  </div>
                  <div className="bg-teal-50 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-teal-600">{result.acudientesCreados}</div>
                    <div className="text-xs text-teal-600 mt-1">Acudientes Creados</div>
                  </div>
                  <div className="bg-cyan-50 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-cyan-600">{result.acudientesReutilizados}</div>
                    <div className="text-xs text-cyan-600 mt-1">Acudientes Reutilizados</div>
                  </div>
                  <div className="bg-indigo-50 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-indigo-600">{result.vinculosCreados}</div>
                    <div className="text-xs text-indigo-600 mt-1">Vínculos Creados</div>
                  </div>
                </div>

                {result.errores && result.errores.length > 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <p className="text-sm font-semibold text-amber-800 mb-2">
                      ⚠️ {result.errores.length} registro(s) con errores:
                    </p>
                    <div className="max-h-48 overflow-y-auto space-y-1">
                      {result.errores.map((err, i) => (
                        <div key={i} className="text-xs text-amber-700">
                          • <strong>{err.archivo}</strong> - Fila {err.fila}, Campo {err.campo}: {err.mensaje}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex gap-3">
                <Button onClick={onClose} className="flex-1">
                  Finalizar
                </Button>
              </div>
            </div>
          ) : error ? (
            <div>
              <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                <IconAlertTriangle className="mx-auto mb-3 text-red-600" size={48} />
                <h3 className="font-bold text-red-800 mb-2">Error al Procesar</h3>
                <p className="text-sm text-red-700">{error}</p>
              </div>
              <div className="flex gap-3 mt-4">
                <Button variant="ghost" onClick={() => setStep(2)}>
                  Volver a Intentar
                </Button>
                <Button onClick={onClose} className="flex-1">
                  Cerrar
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
