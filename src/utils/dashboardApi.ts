export async function getDashboard(role: string, userId?: string, timeoutMs = 6000){
  const qs = new URLSearchParams()
  if(role) qs.set('role', role)
  if(userId) qs.set('userId', userId)
  const url = `/api/dashboard?${qs.toString()}`

  const fetchPromise = fetch(url, { credentials: 'include' }).then(async res=>{
    if(!res.ok) throw await res.json().catch(()=>({ message: res.statusText }))
    return res.json()
  })

  const timeoutPromise = new Promise((_, reject)=> setTimeout(()=> reject(new Error('timeout')), timeoutMs))

  try{
    const data = await Promise.race([fetchPromise, timeoutPromise]) as any
    return { ok: true, data }
  }catch(e){
    // fallback empty structure
    return { ok: false, data: {
      role,
      header: { name: 'Demo User', context: 'Demo' },
      stats: { assignments: 0, pendingSubmissions: 0, onTimeRate: 0 },
      pendingAssignments: [],
      recentSubmissions: [],
      quickActions: []
    }, error: e }
  }
}

export default { getDashboard }
