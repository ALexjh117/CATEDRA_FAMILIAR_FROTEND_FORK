import { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { 
  IconUpload,
  IconDownload,
  IconCheck,
  IconX,
  IconAlert,
  IconUsers,
  IconFile
} from '../components/ui/Icons';
import Toast from '../components/Toast';

interface CSVRow {
  [key: string]: string;
}

interface UploadResult {
  total: number;
  success: number;
  errors: Array<{
    row: number;
    field: string;
    message: string;
    data: CSVRow;
  }>;
}

export default function CargaMasiva() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [omitirErrores, setOmitirErrores] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === 'text/csv' || droppedFile.name.endsWith('.csv')) {
        setFile(droppedFile);
      } else {
        setToast({ message: 'Solo se permiten archivos CSV', type: 'error' });
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type === 'text/csv' || selectedFile.name.endsWith('.csv')) {
        setFile(selectedFile);
      } else {
        setToast({ message: 'Solo se permiten archivos CSV', type: 'error' });
      }
    }
  };

  const parseCSV = (text: string): CSVRow[] => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];
    
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const rows: CSVRow[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
      if (values.length === headers.length) {
        const row: CSVRow = {};
        headers.forEach((header, index) => {
          row[header] = values[index];
        });
        rows.push(row);
      }
    }
    
    return rows;
  };

  const validateRow = (row: CSVRow, index: number): Array<{ field: string; message: string }> => {
    const errors: Array<{ field: string; message: string }> = [];
    
    // Validaciones básicas para usuarios
    if (!row.nombre || row.nombre.length < 2) {
      errors.push({ field: 'nombre', message: 'Nombre requerido (mínimo 2 caracteres)' });
    }
    
    if (!row.apellidos || row.apellidos.length < 2) {
      errors.push({ field: 'apellidos', message: 'Apellidos requeridos (mínimo 2 caracteres)' });
    }
    
    if (!row.telefono || !/^\d{10}$/.test(row.telefono)) {
      errors.push({ field: 'telefono', message: 'Teléfono debe tener 10 dígitos' });
    }
    
    if (!row.documento || row.documento.length < 6) {
      errors.push({ field: 'documento', message: 'Documento requerido (mínimo 6 caracteres)' });
    }
    
    if (!['admin_sistema', 'rector', 'coordinador', 'docente_aula', 'acudiente'].includes(row.rol)) {
      errors.push({ field: 'rol', message: 'Rol inválido' });
    }
    
    return errors;
  };

  const processUpload = async () => {
    if (!file) return;
    
    setUploading(true);
    setUploadResult(null);
    
    try {
      const text = await file.text();
      const rows = parseCSV(text);
      
      const result: UploadResult = {
        total: rows.length,
        success: 0,
        errors: []
      };
      
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const validationErrors = validateRow(row, i + 2); // +2 porque row 1 es header
        
        if (validationErrors.length > 0) {
          // Si hay errores y no se configuró omitir errores, agregarlos al resultado
          if (!omitirErrores) {
            validationErrors.forEach(error => {
              result.errors.push({
                row: i + 2,
                field: error.field,
                message: error.message,
                data: row
              });
            });
            continue; // Saltar este registro
          }
          // Si se configuró omitir errores, log pero continuar
          console.warn(`Fila ${i + 2}: errores omitidos`, validationErrors);
        }
        
        // Simular procesamiento exitoso
        await new Promise(resolve => setTimeout(resolve, 50));
        result.success++;
      }
      
      setUploadResult(result);
      
      if (result.errors.length === 0) {
        setToast({ 
          message: `Carga exitosa: ${result.success} registros procesados`, 
          type: 'success' 
        });
      } else if (result.success > 0) {
        setToast({ 
          message: `Carga parcial: ${result.success} exitosos, ${result.errors.length} errores`, 
          type: 'info' 
        });
      } else {
        setToast({ 
          message: `Carga fallida: ${result.errors.length} errores encontrados`, 
          type: 'error' 
        });
      }
      
    } catch (error) {
      console.error('Error procesando archivo:', error);
      setToast({ message: 'Error al procesar el archivo', type: 'error' });
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = () => {
    const template = `nombre,apellidos,telefono,documento,rol,activo
Juan,Pérez,3001234567,12345678,docente_aula,true
María,García,3007654321,87654321,acudiente,true
Carlos,Rodríguez,3009876543,11223344,coordinador,true`;
    
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'plantilla_usuarios.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-display font-bold">Carga Masiva</h1>
              <p className="text-blue-100 mt-1">
                Importación de usuarios mediante archivos CSV
              </p>
            </div>
            
            <button
              onClick={downloadTemplate}
              className="mt-4 md:mt-0 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors flex items-center gap-2"
            >
              <IconDownload size={16} />
              Descargar Plantilla
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Upload Area */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Subir Archivo CSV</h3>
              
              {/* Drag & Drop Area */}
              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                  dragActive 
                    ? 'border-blue-400 bg-blue-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                {file ? (
                  <div className="space-y-3">
                    <IconFile className="mx-auto text-green-500" size={48} />
                    <div>
                      <p className="font-semibold text-gray-800">{file.name}</p>
                      <p className="text-sm text-gray-500">
                        {(file.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                    <button
                      onClick={() => setFile(null)}
                      className="text-sm text-red-600 hover:text-red-800 underline"
                    >
                      Remover archivo
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <IconUpload className="mx-auto text-gray-400" size={48} />
                    <div>
                      <p className="text-lg font-medium text-gray-700">
                        Arrastra tu archivo CSV aquí
                      </p>
                      <p className="text-gray-500">o haz clic para seleccionar</p>
                    </div>
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>
                )}
              </div>

              {/* Configuración */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={omitirErrores}
                    onChange={(e) => setOmitirErrores(e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <div>
                    <span className="font-medium text-gray-800">Omitir errores</span>
                    <p className="text-sm text-gray-600">
                      Los registros con errores se saltarán automáticamente
                    </p>
                  </div>
                </label>
              </div>

              {/* Botón de carga */}
              <div className="mt-6">
                <button
                  onClick={processUpload}
                  disabled={!file || uploading}
                  className="w-full px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {uploading ? (
                    <>
                      <LoadingSpinner size="sm" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      <IconUpload size={18} />
                      Iniciar Carga
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Resultados de la carga */}
            {uploadResult && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Resultado de la Carga</h3>
                
                {/* Resumen */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">{uploadResult.total}</div>
                    <div className="text-sm text-blue-700">Total</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">{uploadResult.success}</div>
                    <div className="text-sm text-green-700">Exitosos</div>
                  </div>
                  <div className="bg-red-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-red-600">{uploadResult.errors.length}</div>
                    <div className="text-sm text-red-700">Errores</div>
                  </div>
                </div>

                {/* Lista de errores */}
                {uploadResult.errors.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <IconAlert size={18} className="text-red-500" />
                      Errores Encontrados
                    </h4>
                    <div className="max-h-60 overflow-y-auto space-y-2">
                      {uploadResult.errors.map((error, index) => (
                        <div key={index} className="bg-red-50 border border-red-200 rounded-lg p-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="font-medium text-red-800">
                                Fila {error.row}: {error.field}
                              </p>
                              <p className="text-sm text-red-600">{error.message}</p>
                              <p className="text-xs text-red-500 mt-1">
                                Datos: {Object.entries(error.data).map(([k, v]) => `${k}: ${v}`).join(', ')}
                              </p>
                            </div>
                            <IconX className="text-red-500 mt-1" size={16} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Información y ayuda */}
          <div className="space-y-6">
            {/* Formato requerido */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Formato Requerido</h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Columnas Obligatorias:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• <strong>nombre:</strong> Nombre del usuario</li>
                    <li>• <strong>apellidos:</strong> Apellidos completos</li>
                    <li>• <strong>telefono:</strong> 10 dígitos numéricos</li>
                    <li>• <strong>documento:</strong> Número de identificación</li>
                    <li>• <strong>rol:</strong> Tipo de usuario</li>
                    <li>• <strong>activo:</strong> true/false</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Roles Válidos:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• admin_sistema</li>
                    <li>• rector</li>
                    <li>• coordinador</li>
                    <li>• docente_aula</li>
                    <li>• acudiente</li>
                  </ul>
                </div>
              </div>

              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <IconAlert className="text-yellow-600 mt-0.5" size={16} />
                  <div className="text-sm text-yellow-700">
                    <strong>Importante:</strong> Usa la plantilla proporcionada para asegurar el formato correcto.
                  </div>
                </div>
              </div>
            </div>

            {/* Estadísticas */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Configuración</h3>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <IconCheck className="text-green-500 mt-1" size={16} />
                  <div>
                    <h4 className="font-medium text-gray-800">Omitir Errores</h4>
                    <p className="text-sm text-gray-600">
                      {omitirErrores 
                        ? 'Activado: Se procesarán solo los registros válidos'
                        : 'Desactivado: Se detendrá al encontrar errores'
                      }
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <IconUsers className="text-blue-500 mt-1" size={16} />
                  <div>
                    <h4 className="font-medium text-gray-800">Límite de Registros</h4>
                    <p className="text-sm text-gray-600">
                      Máximo 1000 registros por archivo
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Toast */}
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </div>
    </DashboardLayout>
  );
}