import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useToast } from './ToastProvider'

export default function FloatingRoleSwitch(){
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const toast = useToast()

  function go(role:string){
    localStorage.setItem('previewRole', role)
    navigate(`/dashboard?role=${role}`)
    toast.show(`Vista: ${role} (solo preview)`)
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="flex flex-col items-end">
        {open && (
          <div className="mb-2 bg-white p-3 rounded-lg shadow-lg w-44">
            <div className="flex flex-col gap-2">
              <button onClick={()=>go('parent')} className="px-3 py-2 rounded text-sm text-left hover:bg-gray-50">Padre / Acudiente</button>
              <button onClick={()=>go('teacher')} className="px-3 py-2 rounded text-sm text-left hover:bg-gray-50">Docente</button>
              <button onClick={()=>go('admin')} className="px-3 py-2 rounded text-sm text-left hover:bg-gray-50">Administrador</button>
              <button onClick={()=>setOpen(false)} className="mt-2 text-xs text-gray-500">Cerrar</button>
            </div>
          </div>
        )}
        <button aria-label="Cambiar vista (Preview)" title="Cambiar vista (Preview)" onClick={()=>setOpen(o=>!o)} className="w-12 h-12 rounded-full bg-brand-600 text-white shadow-lg flex items-center justify-center"> 
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
        </button>
      </div>
    </div>
  )
}
