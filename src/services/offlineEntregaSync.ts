import { httpService } from '../api/httpService';

import { getOfflineSession } from './offlineSessionService';

export interface OfflineEntregaFile {
  name: string;
  type: string;
  size: number;
  lastModified: number;
  blob: Blob;
}

export interface OfflineEntregaRecord {
  id: string;
  asignacionId: number;
  estudianteId: number;
  descripcion?: string;
  nombreEnvio?: string;
  archivosUrl?: string[];
  archivos: OfflineEntregaFile[];
  createdAt: string;
  status: 'pending' | 'syncing' | 'synced' | 'error';
  syncedAt?: string;
  lastError?: string;
}

const DB_NAME = 'catedra-familia-offline';
const DB_VERSION = 1;
const STORE_NAME = 'entregas';

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('status', 'status', { unique: false });
        store.createIndex('assignmentStudent', ['asignacionId', 'estudianteId'], { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('No se pudo abrir IndexedDB'));
  });
}

function wrapRequest<T = unknown>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('Error en IndexedDB'));
  });
}

async function withStore<T>(mode: IDBTransactionMode, run: (store: IDBObjectStore) => Promise<T>): Promise<T> {
  const db = await openDatabase();
  try {
    const tx = db.transaction(STORE_NAME, mode);
    const store = tx.objectStore(STORE_NAME);
    const result = await run(store);
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error ?? new Error('Transacción fallida en IndexedDB'));
      tx.onabort = () => reject(tx.error ?? new Error('Transacción abortada en IndexedDB'));
    });
    return result;
  } finally {
    db.close();
  }
}

function createOfflineId(asignacionId: number, estudianteId: number) {
  return `offline_${asignacionId}_${estudianteId}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

async function toOfflineFiles(files: File[]): Promise<OfflineEntregaFile[]> {
  return files.map((file) => ({
    name: file.name,
    type: file.type,
    size: file.size,
    lastModified: file.lastModified,
    blob: file.slice(0, file.size, file.type),
  }));
}

function toRuntimeFiles(files: OfflineEntregaFile[]): File[] {
  return files.map((file) => new File([file.blob], file.name, { type: file.type, lastModified: file.lastModified }));
}

function extractEntregaResult(payload: any) {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return payload.data;
  }
  return payload;
}

async function postOfflineSync(record: OfflineEntregaRecord) {
  const offlineSession = getOfflineSession();
  const files = await Promise.all(record.archivos.map(async (file) => ({
    name: file.name,
    type: file.type,
    size: file.size,
    lastModified: file.lastModified,
    contentBase64: await blobToBase64(file.blob),
  })));

  return httpService.post('/offline/sync-tasks', {
    tasks: [
      {
        id: record.id,
        offlineId: record.id,
        assignmentId: record.asignacionId,
        asignacionId: record.asignacionId,
        studentId: record.estudianteId,
        estudianteId: record.estudianteId,
        description: record.descripcion,
        descripcion: record.descripcion,
        nombreEnvio: record.nombreEnvio,
        archivosUrl: record.archivosUrl,
        files,
        createdAt: record.createdAt,
        offlineCreatedAt: record.createdAt,
        fechaEntregaOriginal: record.createdAt,
        institutionId: offlineSession?.institucionId,
        institucionId: offlineSession?.institucionId,
        offlineUser: offlineSession ? {
          userId: offlineSession.userId,
          email: offlineSession.email,
          tipo: offlineSession.tipo,
        } : undefined,
      },
    ],
    sessionToken: offlineSession?.sessionToken,
  });
}

async function postDirectEntrega(record: OfflineEntregaRecord) {
  const files = toRuntimeFiles(record.archivos);
  const form = new FormData();
  form.append('estudianteId', String(record.estudianteId));
  if (record.descripcion) form.append('descripcion', record.descripcion);
  if (record.nombreEnvio) form.append('nombreEnvio', record.nombreEnvio);
  form.append('offlineId', record.id);
  form.append('createdAt', record.createdAt);
  form.append('offlineCreatedAt', record.createdAt);
  form.append('fechaEntregaOriginal', record.createdAt);
  (record.archivosUrl || []).forEach((u) => form.append('archivosUrl', u));
  files.forEach((file) => form.append('archivos', file));

  try {
    return await httpService.post(`/api/movil/asignaciones/${record.asignacionId}/entregas`, form);
  } catch (error: any) {
    if (error && (error.status === 404 || error.status === 405)) {
      return await httpService.post(`/api/asignaciones/${record.asignacionId}/entregas`, form);
    }
    throw error;
  }
}

async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      resolve(result.includes(',') ? result.split(',')[1] : result);
    };
    reader.onerror = () => reject(reader.error ?? new Error('No se pudo leer archivo offline'));
    reader.readAsDataURL(blob);
  });
}

export async function saveEntregaOffline(input: {
  asignacionId: number;
  estudianteId: number;
  descripcion?: string;
  nombreEnvio?: string;
  archivos?: File[];
  archivosUrl?: string[];
  createdAt?: string;
}): Promise<OfflineEntregaRecord> {
  const existing = await getPendingEntregaOffline(input.asignacionId, input.estudianteId);
  if (existing) return existing;

  const record: OfflineEntregaRecord = {
    id: createOfflineId(input.asignacionId, input.estudianteId),
    asignacionId: input.asignacionId,
    estudianteId: input.estudianteId,
    descripcion: input.descripcion,
    nombreEnvio: input.nombreEnvio,
    archivosUrl: input.archivosUrl || [],
    archivos: await toOfflineFiles(input.archivos || []),
    createdAt: input.createdAt || new Date().toISOString(),
    status: 'pending',
  };

  await withStore('readwrite', async (store) => {
    await wrapRequest(store.put(record));
    return undefined;
  });

  return record;
}

export async function getPendingEntregaOffline(asignacionId: number, estudianteId: number): Promise<OfflineEntregaRecord | null> {
  const all = await getOfflineEntregas();
  return all.find((item) => item.asignacionId === asignacionId && item.estudianteId === estudianteId && (item.status === 'pending' || item.status === 'error' || item.status === 'syncing')) || null;
}

export async function getOfflineEntregas(): Promise<OfflineEntregaRecord[]> {
  return withStore('readonly', async (store) => {
    const result = await wrapRequest(store.getAll());
    return Array.isArray(result) ? result as OfflineEntregaRecord[] : [];
  });
}

export async function removeOfflineEntrega(id: string): Promise<void> {
  await withStore('readwrite', async (store) => {
    await wrapRequest(store.delete(id));
    return undefined;
  });
}

export async function updateOfflineEntrega(id: string, patch: Partial<OfflineEntregaRecord>): Promise<void> {
  await withStore('readwrite', async (store) => {
    const current = await wrapRequest<OfflineEntregaRecord | undefined>(store.get(id));
    if (!current) return undefined;
    await wrapRequest(store.put({ ...current, ...patch }));
    return undefined;
  });
}

export async function syncPendingEntregas(): Promise<Array<{ offlineId: string; status: 'success' | 'error'; error?: string; entrega?: any }>> {
  if (typeof navigator !== 'undefined' && !navigator.onLine) return [];

  const all = await getOfflineEntregas();
  const pending = all.filter((item) => item.status === 'pending' || item.status === 'error');
  const results: Array<{ offlineId: string; status: 'success' | 'error'; error?: string; entrega?: any }> = [];

  for (const record of pending) {
    try {
      await updateOfflineEntrega(record.id, { status: 'syncing', lastError: undefined });

      let response: any;
      try {
        response = await postOfflineSync(record);
      } catch {
        response = await postDirectEntrega(record);
      }

      const payload = extractEntregaResult(response?.data ?? response);
      await updateOfflineEntrega(record.id, {
        status: 'synced',
        syncedAt: new Date().toISOString(),
        lastError: undefined,
      });
      results.push({ offlineId: record.id, status: 'success', entrega: payload });
    } catch (error: any) {
      const message = error?.message || 'No se pudo sincronizar la entrega offline';
      await updateOfflineEntrega(record.id, { status: 'error', lastError: message });
      results.push({ offlineId: record.id, status: 'error', error: message });
    }
  }

  return results;
}
