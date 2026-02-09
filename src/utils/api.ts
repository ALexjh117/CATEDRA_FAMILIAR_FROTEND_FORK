/**
 * @deprecated Use httpService from '../api/httpService' instead
 * Este archivo se mantiene para compatibilidad con código existente
 */

import httpService from '../api/httpService';

export type ApiError = { errors?: Record<string,string>; message?: string }

// Re-exportar httpService para compatibilidad
export async function apiGet(path: string){ 
  const response = await httpService.get(path);
  return response.data;
}

export async function apiPost(path: string, body: any, isForm=false){
  if (isForm) {
    // Para FormData, usar httpService centralizado
    const response = await httpService.post(path, body);
    return response.data;
  }
  const response = await httpService.post(path, body);
  return response.data;
}

export async function apiPut(path: string, body: any, isForm=false){
  if (isForm) {
    // Para FormData, usar httpService centralizado
    const response = await httpService.put(path, body);
    return response.data;
  }
  const response = await httpService.put(path, body);
  return response.data;
}

export default { apiGet, apiPost, apiPut }
