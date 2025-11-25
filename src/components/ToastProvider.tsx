import React, { createContext, useContext, useState } from 'react'
import Toast from './Toast'

type ToastCtx = { show: (msg:string)=>void }
const Ctx = createContext<ToastCtx|undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }){
  const [msg, setMsg] = useState<string | null>(null)
  function show(m:string){ setMsg(m); setTimeout(()=>setMsg(null), 3500) }
  return (
    <Ctx.Provider value={{ show }}>
      {children}
      {msg ? <Toast message={msg} onClose={()=>setMsg(null)} /> : null}
    </Ctx.Provider>
  )
}

export function useToast(){
  const ctx = useContext(Ctx)
  if(!ctx) throw new Error('useToast must be used inside ToastProvider')
  return ctx
}

export default ToastProvider
