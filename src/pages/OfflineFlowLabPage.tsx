import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import { getSession } from '../api/endpoints';
import { getMisEstudiantesAcudiente, getMisTareasAcudiente, listarTareasEstudiante, type TareaAsignadaMovil } from '../api/acudiente';
import { httpService } from '../api/httpService';
import {
  clearOfflineSession,
  ensureOfflineSession,
  getOfflineSession,
  isOfflineSessionExpired,
  loginWithOfflineSession,
  refreshOfflineSession,
  type OfflineSessionData,
} from '../services/offlineSessionService';
import {
  getOfflineEntregas,
  removeOfflineEntrega,
  saveEntregaOffline,
  syncPendingEntregas,
  type OfflineEntregaRecord,
} from '../services/offlineEntregaSync';

type LabLog = {
  id: string;
  level: 'info' | 'success' | 'error';
  message: string;
  details?: unknown;
  createdAt: string;
};

const createLog = (level: LabLog['level'], message: string, details?: unknown): LabLog => ({
  id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
  level,
  message,
  details,
  createdAt: new Date().toISOString(),
});

type LabStudent = {
  id: number;
  label: string;
  raw: { id: number; nombres?: string; apellidos?: string; cursoId?: number };
};

type LabAssignment = {
  id: number;
  studentId: number;
  studentLabel: string;
  title: string;
  dueDate?: string;
  status: string;
  raw: TareaAsignadaMovil;
};

type SyncNotice = {
  type: 'success' | 'info' | 'error';
  message: string;
};

// ===== Redact helpers to avoid exposing sensitive data =====
function maskEmail(email?: string) {
  if (!email || typeof email !== 'string') return undefined;
  const [user, domain] = email.split('@');
  if (!domain) return '***';
  const visible = user.slice(0, 2);
  return `${visible}***@${domain}`;
}

function maskToken(token?: string) {
  if (!token || typeof token !== 'string') return undefined;
  if (token.length <= 10) return '***';
  return `${token.slice(0, 6)}...${token.slice(-4)}`;
}

function maskString(val?: string) {
  if (!val) return undefined;
  return val.length <= 4 ? '***' : `${val.slice(0, 2)}***${val.slice(-1)}`;
}

function redactWebSession(session: any) {
  if (!session || typeof session !== 'object') return session;
  const user = session.user || {};
  return {
    user: {
      id: user.id,
      nombre: user.nombre,
      apellidos: user.apellidos ? '***' : '',
      correo: maskEmail(user.correo),
      rol: user.rol,
      rolId: user.rolId,
      institucionId: user.institucionId ?? user.institucion_id ?? user?.institucion?.id,
      // No exponer teléfono/documento
      telefono: user.telefono ? '***' : undefined,
      documento: user.documento ? '***' : undefined,
      activo: user.activo,
      debe_cambiar_contrasena: Boolean(user.debe_cambiar_contrasena),
    },
    isPreview: Boolean(session.isPreview),
    token: maskToken(session.token),
    loginTime: session.loginTime,
    estudiantes: Array.isArray(session.estudiantes) ? session.estudiantes.length : 0,
    context: session.context?.institucionId ? { institucionId: session.context.institucionId } : undefined,
  };
}

function redactOfflineSession(os: any) {
  if (!os || typeof os !== 'object') return os;
  return {
    userId: os.userId,
    email: maskEmail(os.email),
    rolId: os.rolId,
    institucionId: os.institucionId ?? os?.datosEspecificos?.institucionId,
    tipo: os.tipo,
    // Enmascarar tokens
    sessionToken: maskToken(os.sessionToken),
    createdAt: os.createdAt,
    expiresAt: os.expiresAt,
    datosEspecificos: os.datosEspecificos?.institucionId ? { institucionId: os.datosEspecificos.institucionId } : undefined,
  };
}

function formatStudentLabel(student: { id: number; nombres?: string; apellidos?: string; cursoId?: number }) {
  const fullName = `${student.nombres || ''} ${student.apellidos || ''}`.trim();
  return fullName ? `${fullName} · ID ${student.id}` : `Estudiante #${student.id}`;
}

function formatAssignmentLabel(item: LabAssignment) {
  const due = item.dueDate ? ` · vence ${new Date(item.dueDate).toLocaleDateString()}` : '';
  return `${item.title} · ${item.studentLabel}${due}`;
}

function normalizeStudentFromAny(student: any): LabStudent {
  const id = Number(student?.id ?? student?.estudianteId ?? student?.estudiante_id ?? 0);
  const nombres = student?.nombres ?? student?.nombre ?? student?.estudianteNombre ?? '';
  const apellidos = student?.apellidos ?? student?.apellido ?? '';
  const cursoId = student?.cursoId ?? student?.curso_id;
  return {
    id,
    label: formatStudentLabel({ id, nombres, apellidos, cursoId }),
    raw: { id, nombres, apellidos, cursoId },
  };
}

function buildStudentMap(items: LabStudent[]) {
  const map = new Map<number, LabStudent>();
  for (const item of items) {
    if (item.id) map.set(item.id, item);
  }
  return map;
}

function resolveStudentsForAssignment(task: any, students: LabStudent[], studentMap: Map<number, LabStudent>) {
  const directStudentId = Number(task?.estudianteId ?? task?.estudiante_id ?? task?.studentId ?? 0);
  if (directStudentId && studentMap.has(directStudentId)) {
    return [studentMap.get(directStudentId)!];
  }

  const courseId = Number(task?.cursoId ?? task?.curso_id ?? task?.curso?.id ?? 0);
  if (courseId) {
    const courseMatches = students.filter((student) => Number(student.raw?.cursoId ?? 0) === courseId);
    if (courseMatches.length > 0) {
      return courseMatches;
    }
  }

  if (students.length === 1) {
    return students;
  }

  return [] as LabStudent[];
}

function normalizeAssignmentFromAny(task: any, students: LabStudent[], studentMap: Map<number, LabStudent>): LabAssignment[] {
  const id = Number(task?.id ?? task?.asignacionId ?? task?.asignacion_id ?? 0);
  if (!id) return [];

  const matchedStudents = resolveStudentsForAssignment(task, students, studentMap);
  const fallbackStudentId = Number(task?.estudianteId ?? task?.estudiante_id ?? task?.studentId ?? 0);

  if (matchedStudents.length === 0) {
    return [{
      id,
      studentId: fallbackStudentId,
      studentLabel: fallbackStudentId ? `Estudiante #${fallbackStudentId}` : 'Sin estudiante asociado',
      title: task?.titulo || task?.nombre || task?.tema || 'Asignación',
      dueDate: task?.fechaVencimiento || task?.fecha_vencimiento,
      status: task?.estado || task?.status || 'pendiente',
      raw: {
        id,
        titulo: task?.titulo || task?.nombre || task?.tema || 'Asignación',
        descripcion: task?.descripcion || task?.detalle || '',
        fechaInicio: task?.fechaInicio || task?.fecha_inicio,
        fechaVencimiento: task?.fechaVencimiento || task?.fecha_vencimiento,
        estado: task?.estado || task?.status || 'pendiente',
        cursoId: task?.cursoId || task?.curso_id,
        cursoNombre: task?.cursoNombre || task?.curso?.nombre,
        esIndividual: task?.esIndividual ?? task?.es_individual,
      },
    }];
  }

  return matchedStudents.map((student) => ({
    id,
    studentId: student.id,
    studentLabel: student.label,
    title: task?.titulo || task?.nombre || task?.tema || 'Asignación',
    dueDate: task?.fechaVencimiento || task?.fecha_vencimiento,
    status: task?.estado || task?.status || 'pendiente',
    raw: {
      id,
      titulo: task?.titulo || task?.nombre || task?.tema || 'Asignación',
      descripcion: task?.descripcion || task?.detalle || '',
      fechaInicio: task?.fechaInicio || task?.fecha_inicio,
      fechaVencimiento: task?.fechaVencimiento || task?.fecha_vencimiento,
      estado: task?.estado || task?.status || 'pendiente',
      cursoId: task?.cursoId || task?.curso_id,
      cursoNombre: task?.cursoNombre || task?.curso?.nombre,
      esIndividual: task?.esIndividual ?? task?.es_individual,
    },
  }));
}

export default function OfflineFlowLabPage() {
  const session = getSession();
  const [isOnline, setIsOnline] = useState(typeof navigator === 'undefined' ? true : navigator.onLine);
  const [offlineSession, setOfflineSession] = useState<OfflineSessionData | null>(() => getOfflineSession());
  const [offlineEntregas, setOfflineEntregas] = useState<OfflineEntregaRecord[]>([]);
  const [students, setStudents] = useState<LabStudent[]>([]);
  const [assignments, setAssignments] = useState<LabAssignment[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [logs, setLogs] = useState<LabLog[]>([]);
  const [working, setWorking] = useState<string | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedAssignmentId, setSelectedAssignmentId] = useState('');
  const [nombreEnvio, setNombreEnvio] = useState('Prueba offline desde lab');
  const [descripcion, setDescripcion] = useState('Entrega creada para probar el flujo offline completo');
  const [archivoUrl, setArchivoUrl] = useState('https://ejemplo.com/evidencia-offline');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [statusResponse, setStatusResponse] = useState<unknown>(null);
  const [syncNotice, setSyncNotice] = useState<SyncNotice | null>(null);
  const [activeStep, setActiveStep] = useState(1);
  const [activePanel, setActivePanel] = useState<'queue' | 'sent' | 'status' | 'logs'>('queue');

  const appendLog = (level: LabLog['level'], message: string, details?: unknown) => {
    setLogs((prev) => [createLog(level, message, details), ...prev].slice(0, 20));
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validar tamaño máximo (10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        appendLog('error', `El archivo ${file.name} es demasiado grande. Máximo permitido: 10MB`);
        event.target.value = ''; // Limpiar input
        return;
      }

      // Validar tipo de archivo
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
      if (!allowedTypes.includes(file.type)) {
        appendLog('error', `Tipo de archivo no permitido: ${file.type}. Tipos permitidos: imágenes, PDF, Word, texto`);
        event.target.value = ''; // Limpiar input
        return;
      }

      setSelectedFile(file);
      appendLog('info', `Archivo seleccionado: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`);

      // Crear preview para imágenes
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setFilePreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setFilePreview(null);
      }
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    appendLog('info', 'Archivo eliminado');
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Quitar el prefijo data:image/...;base64,
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const loadOfflineState = async () => {
    const [sessionData, entregas] = await Promise.all([
      ensureOfflineSession().catch(() => getOfflineSession()),
      getOfflineEntregas().catch(() => []),
    ]);
    setOfflineSession(sessionData ?? null);
    setOfflineEntregas(entregas);
  };

  const loadCatalog = async () => {
    if (catalogLoading) {
      appendLog('info', 'loadCatalog: Ya está cargando, evitando llamada duplicada');
      return;
    }
    
    setCatalogLoading(true);
    appendLog('info', 'loadCatalog: Iniciando carga de catálogo');
    
    try {
      let normalizedStudents: LabStudent[] = [];
      let flattenedAssignments: LabAssignment[] = [];

      try {
        appendLog('info', 'loadCatalog: Obteniendo tareas y estudiantes de acudiente');
        const combined = await getMisTareasAcudiente();
        const combinedStudents = Array.isArray(combined?.estudiantes) ? combined.estudiantes : [];
        normalizedStudents = combinedStudents.map(normalizeStudentFromAny).filter((item) => item.id);
        appendLog('info', `loadCatalog: ${normalizedStudents.length} estudiantes obtenidos de tareas`);

        const studentMap = buildStudentMap(normalizedStudents);
        const combinedAssignments = Array.isArray(combined?.asignaciones) ? combined.asignaciones : [];
        flattenedAssignments = combinedAssignments
          .flatMap((task) => normalizeAssignmentFromAny(task, normalizedStudents, studentMap))
          .filter((item) => item.id);
        appendLog('info', `loadCatalog: ${flattenedAssignments.length} asignaciones obtenidas de tareas`);
      } catch (error) {
        appendLog('error', 'loadCatalog: Error obteniendo tareas de acudiente', error);
      }

      if (normalizedStudents.length === 0) {
        appendLog('info', 'loadCatalog: No hay estudiantes, intentando getMisEstudiantesAcudiente');
        const misEstudiantes = await getMisEstudiantesAcudiente();
        normalizedStudents = (Array.isArray(misEstudiantes) ? misEstudiantes : [])
          .map(normalizeStudentFromAny)
          .filter((item) => item.id);
        appendLog('info', `loadCatalog: ${normalizedStudents.length} estudiantes obtenidos de getMisEstudiantesAcudiente`);
      }

      if (flattenedAssignments.length === 0 && normalizedStudents.length > 0) {
        appendLog('info', 'loadCatalog: No hay asignaciones, obteniendo tareas por estudiante');
        const assignmentResults = await Promise.all(
          normalizedStudents.map(async (student) => {
            try {
              const tasks = await listarTareasEstudiante(student.id);
              return (Array.isArray(tasks) ? tasks : []).map((task) => ({
                id: Number(task.id),
                studentId: student.id,
                studentLabel: student.label,
                title: task.titulo || 'Asignación',
                dueDate: task.fechaVencimiento,
                status: task.estado,
                raw: task,
              } satisfies LabAssignment));
            } catch (error) {
              appendLog('error', `loadCatalog: Error obteniendo tareas del estudiante ${student.id}`, error);
              return [] as LabAssignment[];
            }
          })
        );
        flattenedAssignments = assignmentResults.flat();
        appendLog('info', `loadCatalog: ${flattenedAssignments.length} asignaciones obtenidas por estudiante`);
      }

      setStudents(normalizedStudents);
      setAssignments(flattenedAssignments);
      appendLog('success', `loadCatalog: Carga completada - ${normalizedStudents.length} estudiantes, ${flattenedAssignments.length} asignaciones`);

      if (!selectedStudentId && normalizedStudents.length > 0) {
        setSelectedStudentId(String(normalizedStudents[0].id));
        appendLog('info', `loadCatalog: Estudiante seleccionado automáticamente: ${normalizedStudents[0].id}`);
      }

      if (!selectedAssignmentId && flattenedAssignments.length > 0) {
        setSelectedAssignmentId(String(flattenedAssignments[0].id));
        appendLog('info', `loadCatalog: Asignación seleccionada automáticamente: ${flattenedAssignments[0].id}`);
      }
    } catch (error) {
      appendLog('error', 'No se pudieron cargar estudiantes y asignaciones para el laboratorio offline', {
        error,
        sessionUser: session?.user,
      });
      setStudents([]);
      setAssignments([]);
    } finally {
      setCatalogLoading(false);
      appendLog('info', 'loadCatalog: Carga finalizada');
    }
  };

  useEffect(() => {
    loadOfflineState();
    loadCatalog();

    if (typeof window === 'undefined') return;

    const handleOnline = () => {
      setIsOnline(true);
      loadOfflineState();
      // Solo cargar catálogo si no está cargando actualmente
      if (!catalogLoading) {
        loadCatalog();
      }
      const hasPending = offlineEntregas.some((item) => item.status === 'pending' || item.status === 'error' || item.status === 'syncing');
      if (hasPending) {
        handleAction('sync', async () => {
          await runSyncFlow(true);
        });
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setOfflineSession(getOfflineSession());
      getOfflineEntregas().then(setOfflineEntregas).catch(() => setOfflineEntregas([]));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []); // Solo ejecutar al montar

  const sessionLabel = useMemo(() => {
    if (!offlineSession) return 'Sin sesión offline';
    return isOfflineSessionExpired(offlineSession)
      ? 'Sesión offline expirada'
      : `Sesión offline activa para ${offlineSession.email}`;
  }, [offlineSession]);

  const selectedStudent = useMemo(
    () => students.find((item) => String(item.id) === selectedStudentId) || null,
    [students, selectedStudentId]
  );

  const filteredAssignments = useMemo(
    () => assignments.filter((item) => !selectedStudentId || String(item.studentId) === selectedStudentId),
    [assignments, selectedStudentId]
  );

  const selectedAssignment = useMemo(
    () => filteredAssignments.find((item) => String(item.id) === selectedAssignmentId) || null,
    [filteredAssignments, selectedAssignmentId]
  );

  useEffect(() => {
    // Solo auto-seleccionar si no hay nada seleccionado
    if (!selectedStudentId && students.length > 0) {
      setSelectedStudentId(String(students[0].id));
      return;
    }

    // Si el estudiante seleccionado ya no existe, limpiar selección
    if (selectedStudentId && !students.some((item) => String(item.id) === selectedStudentId)) {
      setSelectedStudentId('');
    }
  }, [students.length]); // Solo cuando cambia la cantidad de estudiantes

  useEffect(() => {
    // Solo auto-seleccionar asignación si no hay nada seleccionado
    if (!selectedAssignmentId && filteredAssignments.length > 0) {
      setSelectedAssignmentId(String(filteredAssignments[0].id));
      return;
    }

    // Si la asignación seleccionada ya no existe en el filtro actual, limpiar
    if (selectedAssignmentId && !filteredAssignments.some((item) => String(item.id) === selectedAssignmentId)) {
      setSelectedAssignmentId('');
    }
  }, [filteredAssignments.length]); // Solo cuando cambia la cantidad de asignaciones filtradas

  const handleAction = async (key: string, action: () => Promise<void>) => {
    setWorking(key);
    try {
      await action();
    } finally {
      setWorking(null);
    }
  };

  const handleGenerateOfflineSession = async () => {
    await handleAction('generate-session', async () => {
      const sessionData = await ensureOfflineSession();
      setOfflineSession(sessionData);
      appendLog('success', 'Sesión offline generada/actualizada');
    });
  };

  const handleRefreshOfflineSession = async () => {
    await handleAction('refresh-session', async () => {
      const sessionData = await refreshOfflineSession();
      setOfflineSession(sessionData);
      appendLog(sessionData ? 'success' : 'error', sessionData ? 'Sesión offline refrescada' : 'No se pudo refrescar la sesión offline');
    });
  };

  const handleOfflineLogin = async () => {
    await handleAction('offline-login', async () => {
      const result = await loginWithOfflineSession(offlineSession?.email || session?.user?.correo);
      if (!result) {
        appendLog('error', 'El login offline no devolvió sesión');
        return;
      }
      appendLog('success', 'Login offline ejecutado');
      await loadOfflineState();
    });
  };

  const handleQueueEntrega = async () => {
    await handleAction('queue-entrega', async () => {
      if (!selectedStudent || !selectedAssignment) {
        appendLog('error', 'Debes elegir primero un estudiante y una asignación');
        return;
      }

      let archivoBase64: string | undefined;
      let archivoNombre: string | undefined;
      let archivoTipo: string | undefined;

      // Convertir archivo a base64 si hay uno seleccionado
      if (selectedFile) {
        try {
          archivoBase64 = await convertFileToBase64(selectedFile);
          archivoNombre = selectedFile.name;
          archivoTipo = selectedFile.type;
          appendLog('info', `Archivo convertido a base64: ${selectedFile.name}`);
        } catch (error) {
          appendLog('error', 'Error al convertir archivo a base64', error);
          return;
        }
      }

      const record = await saveEntregaOffline({
        asignacionId: selectedAssignment.id,
        estudianteId: selectedStudent.id,
        nombreEnvio,
        descripcion,
        archivosUrl: archivoUrl ? [archivoUrl] : [],
        // Agregar información del archivo
        archivoBase64,
        archivoNombre,
        archivoTipo,
      });
      
      appendLog('success', 'Entrega guardada en cola offline', {
        ...record,
        tieneArchivo: !!selectedFile,
        nombreArchivo: selectedFile?.name,
      });
      
      // Limpiar archivo después de guardar
      if (selectedFile) {
        setSelectedFile(null);
        setFilePreview(null);
      }
      
      await loadOfflineState();
    });
  };

  const runSyncFlow = async (showReconnectMessage = false) => {
    const pendingBefore = offlineEntregas.filter((item) => item.status === 'pending' || item.status === 'error' || item.status === 'syncing').length;
    const result = await syncPendingEntregas();
    appendLog('success', 'Intento de sincronización ejecutado', result);
    await loadOfflineState();
    setSyncNotice({
      type: 'success',
      message: showReconnectMessage
        ? pendingBefore > 0
          ? 'Ya tienes conexión de nuevo. Tarea mandada exitosamente.'
          : 'Ya tienes conexión de nuevo. No había tareas pendientes por enviar.'
        : pendingBefore > 0
          ? 'Tarea mandada exitosamente.'
          : 'La sincronización se ejecutó correctamente.',
    });
  };

  const handleSync = async () => {
    await handleAction('sync', async () => {
      await runSyncFlow(false);
    });
  };

  const handleCheckStatus = async () => {
    await handleAction('check-status', async () => {
      const offlineIds = offlineEntregas.map((item) => item.id);
      const response = await httpService.post('/offline/check-status', { offlineIds });
      setStatusResponse(response.data);
      appendLog('info', 'Consulta de estado de sincronización completada', response.data);
    });
  };

  const handlePendingTasks = async () => {
    await handleAction('pending-tasks', async () => {
      const response = await httpService.get('/offline/pending-tasks');
      appendLog('info', 'Consulta de tareas pendientes completada', response.data);
    });
  };

  const handleRemoveEntrega = async (id: string) => {
    await handleAction(`remove-${id}`, async () => {
      await removeOfflineEntrega(id);
      appendLog('info', `Entrega offline eliminada: ${id}`);
      await loadOfflineState();
    });
  };

  const handleClearOfflineSession = async () => {
    await handleAction('clear-session', async () => {
      clearOfflineSession();
      setOfflineSession(null);
      setStatusResponse(null);
      appendLog('info', 'Sesión offline local eliminada');
    });
  };

  const stepCards = [
    {
      title: 'Paso 1',
      description: offlineSession && !isOfflineSessionExpired(offlineSession)
        ? 'Ya tienes sesión offline lista. Puedes refrescarla o seguir al siguiente paso.'
        : 'Primero genera tu sesión offline para guardar tu identidad en este dispositivo.',
      completed: Boolean(offlineSession && !isOfflineSessionExpired(offlineSession)),
    },
    {
      title: 'Paso 2',
      description: selectedAssignment
        ? `Tienes seleccionada la asignación "${selectedAssignment.title}" para ${selectedAssignment.studentLabel}.`
        : 'Elige un estudiante y luego una asignación para preparar la prueba offline.',
      completed: Boolean(selectedAssignment && selectedStudent),
    },
    {
      title: 'Paso 3',
      description: offlineEntregas.length > 0
        ? `Ya tienes ${offlineEntregas.length} entrega(s) guardadas en la cola local.`
        : 'Guarda una entrega en la cola local para simular el trabajo sin internet.',
      completed: offlineEntregas.length > 0,
    },
    {
      title: 'Paso 4',
      description: isOnline
        ? 'Cuando quieras, sincroniza las entregas pendientes con el backend.'
        : 'Estás en modo offline. Puedes seguir guardando entregas y sincronizarlas cuando vuelva el internet.',
      completed: false,
    },
  ];

  const sentSubmissions = useMemo(
    () => offlineEntregas.filter((item) => item.status === 'synced'),
    [offlineEntregas]
  );

  const pendingSubmissions = useMemo(
    () => offlineEntregas.filter((item) => item.status !== 'synced'),
    [offlineEntregas]
  );

  const stepActions = [
    {
      id: 1,
      title: 'Sesión offline',
      short: 'Prepara tu sesión',
      completed: Boolean(offlineSession && !isOfflineSessionExpired(offlineSession)),
    },
    {
      id: 2,
      title: 'Elegir tarea',
      short: 'Selecciona estudiante y asignación',
      completed: Boolean(selectedAssignment && selectedStudent),
    },
    {
      id: 3,
      title: 'Guardar offline',
      short: 'Crea la entrega local',
      completed: pendingSubmissions.length > 0 || sentSubmissions.length > 0,
    },
    {
      id: 4,
      title: 'Sincronizar',
      short: 'Envía y revisa resultados',
      completed: sentSubmissions.length > 0,
    },
  ];

  const goToNextStep = () => setActiveStep((prev) => Math.min(prev + 1, 4));
  const goToPrevStep = () => setActiveStep((prev) => Math.max(prev - 1, 1));

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Lab de flujo offline</h1>
            <p className="mt-2 text-sm text-slate-600">Aquí puedes probar sesión offline, login offline, cola IndexedDB y sincronización manual antes de integrarlo definitivamente al rol de acudiente.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/dashboard" className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
              Volver al dashboard
            </Link>
            <span className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold ${isOnline ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
              {isOnline ? 'En línea' : 'Offline'}
            </span>
          </div>
        </div>

        <section className={`rounded-3xl border p-6 shadow-sm ${isOnline ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50'}`}>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                {isOnline ? 'Estás en línea' : 'Estás en modo offline'}
              </h2>
              <p className="mt-2 text-sm text-slate-700">
                {isOnline
                  ? 'Puedes preparar la sesión offline, elegir una asignación y dejar lista una entrega para probar la sincronización.'
                  : 'No tienes internet. ¿Qué quieres hacer? Puedes guardar una tarea en cola y sincronizarla luego cuando vuelva la conexión.'}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button onClick={handleGenerateOfflineSession} loading={working === 'generate-session'}>
                Preparar sesión offline
              </Button>
              <Button variant="secondary" onClick={handleQueueEntrega} loading={working === 'queue-entrega'}>
                Subir tarea a la cola
              </Button>
              <Button variant="outline" onClick={handleSync} loading={working === 'sync'}>
                Sincronizar pendientes
              </Button>
            </div>
          </div>
          {syncNotice && (
            <div className={`mt-4 rounded-2xl border px-4 py-3 text-sm font-medium ${syncNotice.type === 'success' ? 'border-emerald-300 bg-emerald-100 text-emerald-800' : syncNotice.type === 'error' ? 'border-rose-300 bg-rose-100 text-rose-800' : 'border-sky-300 bg-sky-100 text-sky-800'}`}>
              {syncNotice.message}
            </div>
          )}
        </section>

        <section className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Flujo guiado</h2>
              <p className="mt-1 text-sm text-slate-600">Sigue estos pasos en orden. Así el laboratorio se siente más simple y menos cargado.</p>
            </div>
            <div className="text-sm font-medium text-slate-500">Paso actual: {activeStep} de 4</div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {stepActions.map((step) => (
              <button
                key={step.id}
                type="button"
                onClick={() => setActiveStep(step.id)}
                className={`rounded-2xl border p-4 text-left transition ${activeStep === step.id ? 'border-teal-500 bg-teal-50 shadow-sm' : step.completed ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-slate-50 hover:border-slate-300'}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-bold text-slate-900">Paso {step.id}</span>
                  <span className={`rounded-full px-2 py-1 text-xs font-semibold ${step.completed ? 'bg-emerald-100 text-emerald-700' : activeStep === step.id ? 'bg-teal-100 text-teal-700' : 'bg-slate-200 text-slate-600'}`}>
                    {step.completed ? 'Listo' : activeStep === step.id ? 'Actual' : 'Pendiente'}
                  </span>
                </div>
                <div className="mt-3 font-semibold text-slate-900">{step.title}</div>
                <p className="mt-1 text-sm text-slate-600">{step.short}</p>
              </button>
            ))}
          </div>
        </section>

        <div className="space-y-6">
          {activeStep === 1 && (
            <section className="rounded-3xl bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">1. Sesión offline</h2>
                  <p className="mt-1 text-sm text-slate-600">Genera, refresca y valida la sesión offline que luego usarás para autenticación y sincronización.</p>
                </div>
                <div className={`rounded-full px-3 py-1 text-xs font-semibold ${offlineSession && !isOfflineSessionExpired(offlineSession) ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                  {sessionLabel}
                </div>
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <Button onClick={handleGenerateOfflineSession} loading={working === 'generate-session'} className="w-full justify-center">
                  Obtener sesión offline
                </Button>
                <Button variant="outline" onClick={handleRefreshOfflineSession} loading={working === 'refresh-session'} className="w-full justify-center">
                  Refrescar sesión
                </Button>
                <Button variant="secondary" onClick={handleOfflineLogin} loading={working === 'offline-login'} className="w-full justify-center">
                  Login offline
                </Button>
                <Button variant="danger" onClick={handleClearOfflineSession} loading={working === 'clear-session'} className="w-full justify-center">
                  Limpiar sesión local
                </Button>
              </div>

              {/* Ocultamos detalles de sesión para evitar exposición de datos sensibles */}
            </section>
          )}

          {activeStep === 2 && (
            <section className="rounded-3xl bg-white p-6 shadow-sm">
              <div>
                <h2 className="text-xl font-bold text-slate-900">2. Elegir estudiante y asignación</h2>
                <p className="mt-1 text-sm text-slate-600">En vez de escribir IDs, selecciona aquí el estudiante y la asignación que quieres usar en la prueba offline.</p>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <label className="space-y-2 text-sm font-medium text-slate-700">
                  Estudiante
                  <select value={selectedStudentId} onChange={(e) => setSelectedStudentId(e.target.value)} className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-teal-500" disabled={catalogLoading || students.length === 0}>
                    <option value="">Selecciona un estudiante</option>
                    {students.map((student) => (
                      <option key={student.id} value={student.id}>{student.label}</option>
                    ))}
                  </select>
                </label>
                <label className="space-y-2 text-sm font-medium text-slate-700">
                  Asignación
                  <select value={selectedAssignmentId} onChange={(e) => setSelectedAssignmentId(e.target.value)} className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-teal-500" disabled={catalogLoading || filteredAssignments.length === 0}>
                    <option value="">Selecciona una asignación</option>
                    {filteredAssignments.map((assignment) => (
                      <option key={`${assignment.studentId}-${assignment.id}`} value={assignment.id}>{formatAssignmentLabel(assignment)}</option>
                    ))}
                  </select>
                </label>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 md:col-span-2">
                  {catalogLoading ? (
                    <div>Cargando estudiantes y asignaciones...</div>
                  ) : selectedAssignment ? (
                    <div className="space-y-2">
                      <div><span className="font-semibold text-slate-900">Estudiante:</span> {selectedAssignment.studentLabel}</div>
                      <div><span className="font-semibold text-slate-900">Asignación:</span> {selectedAssignment.title}</div>
                      <div><span className="font-semibold text-slate-900">Estado actual:</span> {selectedAssignment.status}</div>
                      <div><span className="font-semibold text-slate-900">Vence:</span> {selectedAssignment.dueDate ? new Date(selectedAssignment.dueDate).toLocaleString() : 'Sin fecha registrada'}</div>
                    </div>
                  ) : (
                    <div>No hay una asignación seleccionada todavía.</div>
                  )}
                </div>
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600 md:col-span-2">
                  <span className="font-semibold text-slate-900">Consejo:</span> selecciona una asignación, apaga internet, guarda la tarea en cola y luego vuelve a conectarte para mandarla.
                </div>
              </div>
            </section>
          )}

          {activeStep === 3 && (
            <section className="rounded-3xl bg-white p-6 shadow-sm">
              <div>
                <h2 className="text-xl font-bold text-slate-900">3. Crear entrega offline</h2>
                <p className="mt-1 text-sm text-slate-600">Cuando ya elegiste la tarea, aquí decides qué quieres hacer: guardar la entrega en cola, seguir offline o sincronizar.</p>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <label className="space-y-2 text-sm font-medium text-slate-700 md:col-span-2">
                  Nombre del envío
                  <input value={nombreEnvio} onChange={(e) => setNombreEnvio(e.target.value)} className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-teal-500" />
                </label>
                <label className="space-y-2 text-sm font-medium text-slate-700 md:col-span-2">
                  Descripción
                  <textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)} rows={4} className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-teal-500" />
                </label>
                <label className="space-y-2 text-sm font-medium text-slate-700 md:col-span-2">
                  URL de evidencia (opcional)
                  <input value={archivoUrl} onChange={(e) => setArchivoUrl(e.target.value)} className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-teal-500" placeholder="https://ejemplo.com/evidencia" />
                </label>
                
                {/* Upload de archivos */}
                <label className="space-y-2 text-sm font-medium text-slate-700 md:col-span-2">
                  Archivo adjunto (opcional)
                  <div className="relative">
                    <input
                      type="file"
                      onChange={handleFileSelect}
                      accept="image/*,.pdf,.doc,.docx,.txt"
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-teal-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
                    />
                    <div className="mt-2 text-xs text-slate-500">
                      Tipos permitidos: imágenes (JPG, PNG, GIF, WebP), PDF, Word, TXT. Máximo 10MB.
                    </div>
                  </div>
                </label>

                {/* Preview del archivo */}
                {selectedFile && (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 md:col-span-2">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="font-medium text-slate-900">{selectedFile.name}</div>
                        <div className="text-sm text-slate-600">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB · {selectedFile.type}
                        </div>
                      </div>
                      <button
                        onClick={removeFile}
                        className="rounded-lg bg-red-50 px-3 py-1 text-sm font-medium text-red-700 transition hover:bg-red-100"
                      >
                        Eliminar
                      </button>
                    </div>
                    
                    {/* Preview para imágenes */}
                    {filePreview && (
                      <div className="mt-3 rounded-lg border border-slate-200 overflow-hidden">
                        <img 
                          src={filePreview} 
                          alt="Preview" 
                          className="max-h-48 w-full object-contain bg-white"
                        />
                      </div>
                    )}
                    
                    {/* Icono para documentos */}
                    {!filePreview && (
                      <div className="mt-3 flex items-center gap-2 text-sm text-slate-600">
                        <svg className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span>Documento listo para enviar</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <Button onClick={handleQueueEntrega} loading={working === 'queue-entrega'}>
                  Guardar tarea en cola offline
                </Button>
                <Button variant="secondary" onClick={handleSync} loading={working === 'sync'}>
                  Sincronizar ahora
                </Button>
                <Button variant="outline" onClick={loadCatalog} loading={catalogLoading}>
                  Recargar asignaciones
                </Button>
                <Button variant="outline" onClick={handleCheckStatus} loading={working === 'check-status'}>
                  Consultar check-status
                </Button>
                <Button variant="outline" onClick={handlePendingTasks} loading={working === 'pending-tasks'}>
                  Consultar pending-tasks
                </Button>
              </div>
            </section>
          )}

          {activeStep === 4 && (
            <section className="rounded-3xl bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">4. Sincronizar y revisar</h2>
                  <p className="mt-1 text-sm text-slate-600">Cuando recuperes conexión, sincroniza y revisa fácilmente qué quedó pendiente, qué se envió y qué respondió el sistema.</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button variant="secondary" onClick={handleSync} loading={working === 'sync'}>
                    Sincronizar ahora
                  </Button>
                  <Button variant="outline" onClick={handleCheckStatus} loading={working === 'check-status'}>
                    Consultar check-status
                  </Button>
                </div>
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-4">
                {[
                  { key: 'queue', label: `Pendientes (${pendingSubmissions.length})` },
                  { key: 'sent', label: `Enviadas (${sentSubmissions.length})` },
                  { key: 'status', label: 'Estado backend' },
                  { key: 'logs', label: `Logs (${logs.length})` },
                ].map((panel) => (
                  <button
                    key={panel.key}
                    type="button"
                    onClick={() => setActivePanel(panel.key as 'queue' | 'sent' | 'status' | 'logs')}
                    className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${activePanel === panel.key ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300'}`}
                  >
                    {panel.label}
                  </button>
                ))}
              </div>

              {activePanel === 'queue' && (
                <div className="mt-5 space-y-4">
                  {offlineEntregas.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-sm text-slate-500">No hay entregas offline en cola.</div>
                  ) : pendingSubmissions.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-emerald-300 bg-emerald-50 p-6 text-sm text-emerald-700">No tienes pendientes. Todo lo guardado ya fue enviado.</div>
                  ) : (
                    pendingSubmissions.map((item) => (
                      <div key={item.id} className="rounded-2xl border border-slate-200 p-4">
                        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                          <div className="space-y-2 text-sm text-slate-700">
                            <div><span className="font-semibold text-slate-900">ID:</span> {item.id}</div>
                            <div><span className="font-semibold text-slate-900">Asignación:</span> {assignments.find((assignment) => assignment.id === item.asignacionId)?.title || `Asignación #${item.asignacionId}`}</div>
                            <div><span className="font-semibold text-slate-900">Estudiante:</span> {students.find((student) => student.id === item.estudianteId)?.label || `Estudiante #${item.estudianteId}`}</div>
                            <div><span className="font-semibold text-slate-900">Estado:</span> {item.status}</div>
                            <div><span className="font-semibold text-slate-900">Creada:</span> {item.createdAt}</div>
                            {item.lastError && <div className="text-rose-600"><span className="font-semibold">Error:</span> {item.lastError}</div>}
                          </div>
                          <Button variant="danger" size="sm" onClick={() => handleRemoveEntrega(item.id)} loading={working === `remove-${item.id}`}>
                            Eliminar
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activePanel === 'sent' && (
                <div className="mt-5 space-y-4">
                  {sentSubmissions.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-sm text-slate-500">Todavía no has mandado tareas desde este laboratorio.</div>
                  ) : (
                    sentSubmissions.map((item) => (
                      <div key={item.id} className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                        <div className="space-y-2 text-sm text-slate-700">
                          <div><span className="font-semibold text-slate-900">Asignación:</span> {assignments.find((assignment) => assignment.id === item.asignacionId)?.title || `Asignación #${item.asignacionId}`}</div>
                          <div><span className="font-semibold text-slate-900">Estudiante:</span> {students.find((student) => student.id === item.estudianteId)?.label || `Estudiante #${item.estudianteId}`}</div>
                          <div><span className="font-semibold text-slate-900">Nombre del envío:</span> {item.nombreEnvio || 'Sin nombre'}</div>
                          <div><span className="font-semibold text-slate-900">Descripción:</span> {item.descripcion || 'Sin descripción'}</div>
                          <div><span className="font-semibold text-slate-900">Estado:</span> {item.status}</div>
                          <div><span className="font-semibold text-slate-900">Creada:</span> {item.createdAt}</div>
                          <div><span className="font-semibold text-slate-900">Enviada:</span> {item.syncedAt ? new Date(item.syncedAt).toLocaleString() : 'Sin fecha registrada'}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activePanel === 'status' && (
                <pre className="mt-5 overflow-auto whitespace-pre-wrap break-all rounded-2xl bg-slate-950 p-4 text-xs text-slate-100">{JSON.stringify(statusResponse, null, 2)}</pre>
              )}

              {activePanel === 'logs' && (
                <div className="mt-5 space-y-3">
                  {logs.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">Aún no hay logs de acciones.</div>
                  ) : (
                    logs.map((log) => (
                      <div key={log.id} className={`rounded-2xl border p-4 ${log.level === 'success' ? 'border-emerald-200 bg-emerald-50' : log.level === 'error' ? 'border-rose-200 bg-rose-50' : 'border-slate-200 bg-slate-50'}`}>
                        <div className="flex items-center justify-between gap-3 text-sm">
                          <span className="font-semibold text-slate-900">{log.message}</span>
                          <span className="text-xs text-slate-500">{new Date(log.createdAt).toLocaleString()}</span>
                        </div>
                        {typeof log.details !== 'undefined' && (
                          <pre className="mt-3 overflow-auto whitespace-pre-wrap break-all text-xs text-slate-600">{JSON.stringify(log.details, null, 2)}</pre>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </section>
          )}

          <section className="rounded-3xl bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Navegación del asistente</h2>
                <p className="mt-1 text-sm text-slate-600">Usa estos botones para avanzar en orden y mantener la pantalla limpia.</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" onClick={goToPrevStep} disabled={activeStep === 1}>
                  Anterior
                </Button>
                <Button onClick={goToNextStep} disabled={activeStep === 4}>
                  Siguiente
                </Button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
