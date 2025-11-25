import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useToast } from './ToastProvider'

const ROLES = [ { key: 'parent', label: 'Padre / Acudiente' }, { key:'teacher', label:'Docente' }, { key:'admin', label:'Administrador' } ]

export default function RoleSwitcher(){
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const toast = useToast()
  const btnRef = useRef<HTMLButtonElement|null>(null)

  useEffect(()=>{
    function onDoc(e: MouseEvent){ if(!btnRef.current) return; if(e.target instanceof Node && !btnRef.current.contains(e.target)) setOpen(false) }
    document.addEventListener('click', onDoc)
    return ()=> document.removeEventListener('click', onDoc)
  },[])

  function go(r:string){
    setOpen(false)
    localStorage.setItem('previewRole', r)
    navigate(`/dashboard?role=${r}`)
    toast.show(`Vista: ${r} (solo preview)`)
  }

  return (
    <div className="relative inline-block text-left">
      <button ref={btnRef} onClick={()=>setOpen(o=>!o)} className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white border hover:shadow" aria-haspopup="true" aria-expanded={open}> 
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
        <span className="text-sm">Ver como</span>
      </button>

      {open ? (
        <div className="absolute right-0 mt-2 w-44 bg-white border rounded-md shadow-md z-50">
          <ul className="py-1">
            {ROLES.map(r=> (
              <li key={r.key}>
                <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50" onClick={()=>go(r.key)}>{r.label}</button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  )
}
