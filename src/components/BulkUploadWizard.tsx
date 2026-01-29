import { useState } from 'react';
import { 
  IconDownload, 
  IconFileUpload, 
  IconCheck, 
  IconX, 
  IconAlertTriangle,
  IconFileSpreadsheet,
  IconLoader
} from './ui/Icons';
import Button from './ui/Button';
import { 
  createEstudiante, 
  createUsuario, 
  vincularEstudianteAcudiente,
  descargarPlantillaEstudiantes,
  validarExcelEstudiantes,
  cargaMasivaEstudiantes
} from '../api/endpoints';
import { isBypassValidationsEnabled } from '../utils/dev';

interface ValidationError {
  fila: number;
  campo: string;
  valor: string;
  mensaje: string;
}

interface EstudianteRow {
  fila: number;
  estudiante_nombre: string;
  estudiante_apellidos: string;
  estudiante_documento: string;
  estudiante_tipo_doc: string;
  estudiante_fecha_nacimiento: string;
  curso_id: string;
  acudiente_nombre: string;
  acudiente_apellidos: string;
  acudiente_documento: string;
  acudiente_tipo_doc: string;
  acudiente_telefono: string;
  acudiente_correo: string;
  parentesco: string;
  es_principal: string;
}

interface ProcessResult {
  total: number;
  exitosos: number;
  errores: number;
  detalles: Array<{ fila: number; estudiante: string; status: 'ok' | 'error'; mensaje?: string }>;
}

export default function BulkUploadWizard({ 
  institucionId, 
  onClose,
  cursoId
}: { 
  institucionId: number;
  onClose: () => void;
  cursoId?: number;  // Si se provee, usa carga masiva del backend
}) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [file, setFile] = useState<File | null>(null);
  const [data, setData] = useState<EstudianteRow[]>([]);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ProcessResult | null>(null);
  const [useBackendUpload, setUseBackendUpload] = useState(!isBypassValidationsEnabled() && !!cursoId);

  // ============================================
  // PASO 1: Descargar plantilla
  // ============================================
  
  const handleDownloadTemplate = async () => {
    // Si hay backend disponible, descargar desde el servidor
    if (useBackendUpload) {
      try {
        await descargarPlantillaEstudiantes();
        return;
      } catch (error) {
        console.warn('Error descargando desde backend, usando plantilla local');
      }
    }
    
    // Plantilla local (CSV)
    const headers = [
      'estudiante_nombre',
      'estudiante_apellidos',
      'estudiante_documento',
      'estudiante_tipo_doc',
      'estudiante_fecha_nacimiento',
      'curso_id',
      'acudiente_nombre',
      'acudiente_apellidos',
      'acudiente_documento',
      'acudiente_tipo_doc',
      'acudiente_telefono',
      'acudiente_correo',
      'parentesco',
      'es_principal'
    ];
    
    const example = [
      'Juan',
      'Pérez García',
      '1234567890',
      'ti',
      '2010-05-15',
      '1',
      'María',
      'García López',
      '9876543210',
      'cc',
      '3001234567',
      'maria@correo.com',
      'madre',
      'si'
    ];
    
    const csvContent = [
      headers.join(','),
      example.join(','),
      // Fila vacía para que el usuario pueda agregar más
      Array(14).fill('').join(',')
    ].join('\n');
    
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `plantilla_estudiantes_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  // ============================================
  // PASO 2: Subir archivo
  // ============================================
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      parseFile(selectedFile);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
      parseFile(droppedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const parseFile = (file: File) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        alert('El archivo está vacío o no tiene el formato correcto');
        return;
      }
      
      const headers = lines[0].split(',').map(h => h.trim().replace(/["\r]/g, ''));
      const rows: EstudianteRow[] = [];
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim().replace(/["\r]/g, ''));
        
        // Ignorar filas vacías
        if (values.every(v => !v)) continue;
        
        const row: any = { fila: i + 1 };
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });
        
        rows.push(row as EstudianteRow);
      }
      
      setData(rows);
      validateData(rows);
      setStep(3);
    };
    
    reader.readAsText(file);
  };

  // ============================================
  // PASO 3: Validar datos
  // ============================================
  
  const validateData = (rows: EstudianteRow[]) => {
    const validationErrors: ValidationError[] = [];
    
    rows.forEach(row => {
      // Validar estudiante
      if (!row.estudiante_nombre) {
        validationErrors.push({
          fila: row.fila,
          campo: 'estudiante_nombre',
          valor: row.estudiante_nombre,
          mensaje: 'El nombre del estudiante es obligatorio'
        });
      }
      
      if (!row.estudiante_apellidos) {
        validationErrors.push({
          fila: row.fila,
          campo: 'estudiante_apellidos',
          valor: row.estudiante_apellidos,
          mensaje: 'Los apellidos del estudiante son obligatorios'
        });
      }
      
      if (!row.estudiante_documento) {
        validationErrors.push({
          fila: row.fila,
          campo: 'estudiante_documento',
          valor: row.estudiante_documento,
          mensaje: 'El documento del estudiante es obligatorio'
        });
      }
      
      if (!['ti', 'cc', 'ce'].includes(row.estudiante_tipo_doc?.toLowerCase())) {
        validationErrors.push({
          fila: row.fila,
          campo: 'estudiante_tipo_doc',
          valor: row.estudiante_tipo_doc,
          mensaje: 'Tipo de documento inválido (debe ser: ti, cc o ce)'
        });
      }
      
      // Validar fecha
      if (row.estudiante_fecha_nacimiento) {
        const fecha = new Date(row.estudiante_fecha_nacimiento);
        if (isNaN(fecha.getTime())) {
          validationErrors.push({
            fila: row.fila,
            campo: 'estudiante_fecha_nacimiento',
            valor: row.estudiante_fecha_nacimiento,
            mensaje: 'Fecha de nacimiento inválida (formato: YYYY-MM-DD)'
          });
        }
      }
      
      // Validar curso ID
      if (!row.curso_id || isNaN(parseInt(row.curso_id))) {
        validationErrors.push({
          fila: row.fila,
          campo: 'curso_id',
          valor: row.curso_id,
          mensaje: 'El ID del curso es obligatorio y debe ser numérico'
        });
      }
      
      // Validar acudiente
      if (!row.acudiente_nombre) {
        validationErrors.push({
          fila: row.fila,
          campo: 'acudiente_nombre',
          valor: row.acudiente_nombre,
          mensaje: 'El nombre del acudiente es obligatorio'
        });
      }
      
      if (!row.acudiente_apellidos) {
        validationErrors.push({
          fila: row.fila,
          campo: 'acudiente_apellidos',
          valor: row.acudiente_apellidos,
          mensaje: 'Los apellidos del acudiente son obligatorios'
        });
      }
      
      if (!row.acudiente_documento) {
        validationErrors.push({
          fila: row.fila,
          campo: 'acudiente_documento',
          valor: row.acudiente_documento,
          mensaje: 'El documento del acudiente es obligatorio'
        });
      }
      
      if (!['cc', 'ce', 'pasaporte'].includes(row.acudiente_tipo_doc?.toLowerCase())) {
        validationErrors.push({
          fila: row.fila,
          campo: 'acudiente_tipo_doc',
          valor: row.acudiente_tipo_doc,
          mensaje: 'Tipo de documento inválido (debe ser: cc, ce o pasaporte)'
        });
      }
      
      if (!row.acudiente_telefono) {
        validationErrors.push({
          fila: row.fila,
          campo: 'acudiente_telefono',
          valor: row.acudiente_telefono,
          mensaje: 'El teléfono del acudiente es obligatorio'
        });
      }
      
      if (!['padre', 'madre', 'abuelo', 'tio', 'hermano', 'otro'].includes(row.parentesco?.toLowerCase())) {
        validationErrors.push({
          fila: row.fila,
          campo: 'parentesco',
          valor: row.parentesco,
          mensaje: 'Parentesco inválido (padre, madre, abuelo, tio, hermano, otro)'
        });
      }
      
      if (!['si', 'no', 's', 'n', '1', '0', 'true', 'false'].includes(row.es_principal?.toLowerCase())) {
        validationErrors.push({
          fila: row.fila,
          campo: 'es_principal',
          valor: row.es_principal,
          mensaje: 'Es principal debe ser: si, no, 1, 0, true o false'
        });
      }
    });
    
    setErrors(validationErrors);
  };

  const handleExportErrors = () => {
    const csvContent = [
      'Fila,Campo,Valor,Mensaje de Error',
      ...errors.map(e => `${e.fila},"${e.campo}","${e.valor}","${e.mensaje}"`)
    ].join('\n');
    
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `errores_validacion_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  // ============================================
  // PASO 4: Procesar
  // ============================================
  
  const handleProcess = async () => {
    if (errors.length > 0) {
      alert('Hay errores de validación. Por favor corrígelos antes de continuar.');
      return;
    }
    
    setProcessing(true);
    setProgress(0);
    
    const detalles: ProcessResult['detalles'] = [];
    let exitosos = 0;
    let erroresCount = 0;
    
    // Si tenemos backend y cursoId, usar carga masiva del servidor
    if (useBackendUpload && file && cursoId) {
      try {
        // Primero validar
        const validacion = await validarExcelEstudiantes(file);
        
        if (!validacion.success) {
          alert(`Error al validar: ${validacion.error}`);
          setProcessing(false);
          return;
        }
        
        if (validacion.filasInvalidas && validacion.filasInvalidas > 0) {
          const continuar = window.confirm(
            `Se encontraron ${validacion.filasInvalidas} filas con errores de ${validacion.totalFilas} total.\n` +
            `¿Desea continuar solo con las ${validacion.filasValidas} filas válidas?`
          );
          if (!continuar) {
            setProcessing(false);
            return;
          }
        }
        
        setProgress(50);
        
        // Ejecutar carga masiva
        const resultado = await cargaMasivaEstudiantes(file, cursoId);
        
        setProgress(100);
        
        if (resultado.success) {
          setResult({
            total: resultado.totalProcesados || 0,
            exitosos: resultado.insertados || 0,
            errores: resultado.rechazados || 0,
            detalles: resultado.errores?.map(e => ({
              fila: e.fila,
              estudiante: `Fila ${e.fila}`,
              status: 'error' as const,
              mensaje: e.error
            })) || []
          });
        } else {
          alert(`Error en carga masiva: ${resultado.error}`);
        }
        
        setProcessing(false);
        setStep(4);
        return;
      } catch (error: any) {
        alert(`Error: ${error.message}`);
        setProcessing(false);
        return;
      }
    }
    
    // Proceso local fila por fila (modo bypass o sin backend)
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      setProgress(Math.round(((i + 1) / data.length) * 100));
      
      try {
        // 1. Crear acudiente (si no existe)
        const acudienteResult = await createUsuario({
          nombre: row.acudiente_nombre,
          apellidos: row.acudiente_apellidos,
          documento: row.acudiente_documento,
          tipoDocumento: row.acudiente_tipo_doc as any,
          telefono: row.acudiente_telefono,
          correo: row.acudiente_correo,
          rol: 'acudiente',
          password: row.acudiente_documento, // Contraseña inicial = documento
          institucionId
        });
        
        if (!acudienteResult.success) {
          detalles.push({
            fila: row.fila,
            estudiante: `${row.estudiante_nombre} ${row.estudiante_apellidos}`,
            status: 'error',
            mensaje: `Error al crear acudiente: ${acudienteResult.error}`
          });
          erroresCount++;
          continue;
        }
        
        // 2. Crear estudiante
        const estudianteResult = await createEstudiante({
          nombre: row.estudiante_nombre,
          apellidos: row.estudiante_apellidos,
          documento: row.estudiante_documento,
          tipoDocumento: row.estudiante_tipo_doc as any,
          fechaNacimiento: row.estudiante_fecha_nacimiento,
          cursoId: parseInt(row.curso_id),
          institucionId
        });
        
        if (!estudianteResult.success) {
          detalles.push({
            fila: row.fila,
            estudiante: `${row.estudiante_nombre} ${row.estudiante_apellidos}`,
            status: 'error',
            mensaje: `Error al crear estudiante: ${estudianteResult.error}`
          });
          erroresCount++;
          continue;
        }
        
        // 3. Vincular estudiante-acudiente
        const esPrincipal = ['si', 's', '1', 'true'].includes(row.es_principal?.toLowerCase());
        
        const vinculoResult = await vincularEstudianteAcudiente({
          estudianteId: estudianteResult.estudiante!.id,
          acudienteId: acudienteResult.usuario!.id,
          parentesco: row.parentesco as any,
          esPrincipal
        });
        
        if (!vinculoResult.success) {
          detalles.push({
            fila: row.fila,
            estudiante: `${row.estudiante_nombre} ${row.estudiante_apellidos}`,
            status: 'error',
            mensaje: `Estudiante creado pero error al vincular: ${vinculoResult.error}`
          });
          erroresCount++;
          continue;
        }
        
        // Todo exitoso
        detalles.push({
          fila: row.fila,
          estudiante: `${row.estudiante_nombre} ${row.estudiante_apellidos}`,
          status: 'ok'
        });
        exitosos++;
        
      } catch (err) {
        detalles.push({
          fila: row.fila,
          estudiante: `${row.estudiante_nombre} ${row.estudiante_apellidos}`,
          status: 'error',
          mensaje: `Error inesperado: ${err}`
        });
        erroresCount++;
      }
    }
    
    setResult({
      total: data.length,
      exitosos,
      errores: erroresCount,
      detalles
    });
    
    setProcessing(false);
    setStep(4);
  };

  const handleExportResult = () => {
    if (!result || !result.detalles) return;
    
    const detallesArray = Array.isArray(result.detalles) ? result.detalles : [];
    const csvContent = [
      'Fila,Estudiante,Estado,Mensaje',
      ...detallesArray.map(d => 
        `${d.fila},"${d.estudiante}","${d.status === 'ok' ? 'Exitoso' : 'Error'}","${d.mensaje || '-'}"`
      )
    ].join('\n');
    
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `resultado_carga_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-between">
        {[
          { num: 1, label: 'Plantilla' },
          { num: 2, label: 'Cargar' },
          { num: 3, label: 'Validar' },
          { num: 4, label: 'Procesar' }
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
            {i < 3 && (
              <div className={`h-0.5 flex-1 ${step > s.num ? 'bg-indigo-600' : 'bg-slate-200'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Descargar Plantilla */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="text-center py-8">
            <IconFileSpreadsheet className="mx-auto mb-4 text-emerald-500" size={64} />
            <h3 className="text-lg font-bold text-slate-800 mb-2">
              Paso 1: Descarga la Plantilla
            </h3>
            <p className="text-slate-600 mb-6">
              Descarga el archivo CSV de ejemplo y complétalo con los datos de tus estudiantes y acudientes.
            </p>
            <Button onClick={handleDownloadTemplate} className="inline-flex items-center gap-2">
              <IconDownload size={16} />
              Descargar Plantilla CSV
            </Button>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-sm text-blue-800 font-semibold mb-2">📋 Instrucciones:</p>
            <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
              <li>Completa todos los campos obligatorios</li>
              <li>Usa el formato de fecha: YYYY-MM-DD (ej: 2010-05-15)</li>
              <li>Tipo de documento estudiante: ti, cc o ce</li>
              <li>Tipo de documento acudiente: cc, ce o pasaporte</li>
              <li>Parentesco: padre, madre, abuelo, tio, hermano, otro</li>
              <li>Es principal: si o no</li>
            </ul>
          </div>
          
          <div className="flex justify-end">
            <Button onClick={() => setStep(2)}>
              Siguiente: Cargar Archivo
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Subir Archivo */}
      {step === 2 && (
        <div className="space-y-4">
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className="border-2 border-dashed border-slate-300 rounded-xl p-12 text-center hover:border-indigo-400 transition-colors cursor-pointer bg-slate-50/50"
          >
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <IconFileUpload className="mx-auto mb-4 text-slate-400" size={64} />
              <p className="text-lg font-semibold text-slate-700 mb-2">
                Arrastra tu archivo CSV aquí
              </p>
              <p className="text-sm text-slate-500 mb-4">
                o haz clic para seleccionar
              </p>
              {file && (
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg">
                  <IconFileSpreadsheet size={20} className="text-emerald-500" />
                  <span className="text-sm font-medium text-slate-700">{file.name}</span>
                </div>
              )}
            </label>
          </div>
          
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => setStep(1)}>
              Volver
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Validar */}
      {step === 3 && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800">Resultado de Validación</h3>
              {errors.length > 0 && (
                <Button variant="ghost" size="sm" onClick={handleExportErrors} className="text-xs">
                  <IconDownload size={14} className="mr-1" />
                  Exportar Errores
                </Button>
              )}
            </div>
            
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="bg-blue-50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-blue-600">{data.length}</div>
                <div className="text-xs text-blue-600">Registros</div>
              </div>
              <div className="bg-green-50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-green-600">{data.length - errors.length}</div>
                <div className="text-xs text-green-600">Válidos</div>
              </div>
              <div className="bg-red-50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-red-600">{errors.length}</div>
                <div className="text-xs text-red-600">Errores</div>
              </div>
            </div>
            
            {errors.length > 0 && (
              <div className="max-h-64 overflow-y-auto border border-red-200 rounded-lg">
                <table className="w-full text-sm">
                  <thead className="bg-red-50 sticky top-0">
                    <tr>
                      <th className="text-left p-2 text-red-700">Fila</th>
                      <th className="text-left p-2 text-red-700">Campo</th>
                      <th className="text-left p-2 text-red-700">Error</th>
                    </tr>
                  </thead>
                  <tbody>
                    {errors.map((err, i) => (
                      <tr key={i} className="border-t border-red-100">
                        <td className="p-2 font-mono">{err.fila}</td>
                        <td className="p-2 font-mono text-xs">{err.campo}</td>
                        <td className="p-2 text-red-600">{err.mensaje}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            {errors.length === 0 && (
              <div className="text-center py-6">
                <IconCheck className="mx-auto mb-2 text-green-500" size={48} />
                <p className="text-green-600 font-semibold">
                  ✅ Todos los registros son válidos
                </p>
              </div>
            )}
          </div>
          
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => setStep(2)}>
              Volver
            </Button>
            <Button 
              onClick={handleProcess} 
              disabled={errors.length > 0}
              className="flex-1"
            >
              {errors.length > 0 ? 'Corrige los errores primero' : 'Procesar Carga Masiva'}
            </Button>
          </div>
        </div>
      )}

      {/* Step 4: Procesar */}
      {step === 4 && (
        <div className="space-y-4">
          {processing ? (
            <div className="text-center py-12">
              <IconLoader className="mx-auto mb-4 text-indigo-600 animate-spin" size={64} />
              <h3 className="text-lg font-bold text-slate-800 mb-2">
                Procesando registros...
              </h3>
              <div className="max-w-md mx-auto">
                <div className="bg-slate-200 h-3 rounded-full overflow-hidden mb-2">
                  <div 
                    className="bg-indigo-600 h-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-sm text-slate-600">
                  {progress}% completado
                </p>
              </div>
            </div>
          ) : result ? (
            <div>
              <div className="bg-white border border-slate-200 rounded-xl p-4 mb-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-800">Resumen de Procesamiento</h3>
                  <Button variant="ghost" size="sm" onClick={handleExportResult} className="text-xs">
                    <IconDownload size={14} className="mr-1" />
                    Exportar Resultado
                  </Button>
                </div>
                
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="bg-blue-50 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-blue-600">{result.total}</div>
                    <div className="text-xs text-blue-600">Total</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-green-600">{result.exitosos}</div>
                    <div className="text-xs text-green-600">Exitosos</div>
                  </div>
                  <div className="bg-red-50 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-red-600">{result.errores}</div>
                    <div className="text-xs text-red-600">Errores</div>
                  </div>
                </div>
                
                {result.errores > 0 && result.detalles && (
                  <div className="max-h-48 overflow-y-auto border border-amber-200 rounded-lg bg-amber-50 p-3">
                    <p className="text-sm font-semibold text-amber-800 mb-2">Registros con errores:</p>
                    {(Array.isArray(result.detalles) ? result.detalles : []).filter(d => d.status === 'error').map((d, i) => (
                      <div key={i} className="text-xs text-amber-700 mb-1">
                        • Fila {d.fila} ({d.estudiante}): {d.mensaje}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="flex gap-3">
                <Button onClick={onClose} className="flex-1">
                  Finalizar
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
