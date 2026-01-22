import httpService from '../api/httpService';
import { isBypassValidationsEnabled } from './dev';

export async function getDashboard(role: string, userId?: string, timeoutMs = 6000){
  const qs = new URLSearchParams()
  if(role) qs.set('role', role)
  if(userId) qs.set('userId', userId)

  // Si está en modo bypass, siempre retornar fallback
  if (isBypassValidationsEnabled()) {
    return { ok: true, data: {
      role,
      header: { name: 'Demo User', context: 'Demo Mode' },
      stats: { assignments: 5, pendingSubmissions: 3, onTimeRate: 85 },
      pendingAssignments: [],
      recentSubmissions: [],
      quickActions: []
    }};
  }

  try {
    const response = await httpService.get(`/dashboard?${qs.toString()}`, { timeout: timeoutMs });
    return { ok: true, data: response.data };
  } catch (e) {
    // fallback empty structure
    return { ok: false, data: {
      role,
      header: { name: 'Demo User', context: 'Demo' },
      stats: { assignments: 0, pendingSubmissions: 0, onTimeRate: 0 },
      pendingAssignments: [],
      recentSubmissions: [],
      quickActions: []
    }, error: e };
  }
}

export default { getDashboard }
