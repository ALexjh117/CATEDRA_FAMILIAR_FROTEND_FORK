export type ApiError = { errors?: Record<string,string>; message?: string }

const BASE = process.env.REACT_APP_API_BASE || '/api'

async function request(path: string, options: RequestInit = {}){
  const url = path.startsWith('http') ? path : `${BASE}${path}`
  const res = await fetch(url, options)
  const text = await res.text()
  const contentType = res.headers.get('content-type') || ''
  let data: any = text
  try{ if(contentType.includes('application/json')) data = JSON.parse(text) }catch(e){ data = text }
  if(!res.ok){
    const err: ApiError = typeof data === 'object' ? data : { message: data }
    throw err
  }
  return data
}

export async function apiGet(path: string){ return request(path, { method: 'GET', credentials: 'include' }) }
export async function apiPost(path: string, body: any, isForm=false){
  const opts: RequestInit = { method: 'POST', credentials: 'include' }
  if(isForm){ opts.body = body }
  else { opts.body = JSON.stringify(body); opts.headers = { 'Content-Type': 'application/json' } }
  return request(path, opts)
}
export async function apiPut(path: string, body: any, isForm=false){
  const opts: RequestInit = { method: 'PUT', credentials: 'include' }
  if(isForm){ opts.body = body }
  else { opts.body = JSON.stringify(body); opts.headers = { 'Content-Type': 'application/json' } }
  return request(path, opts)
}

export default { apiGet, apiPost, apiPut }
