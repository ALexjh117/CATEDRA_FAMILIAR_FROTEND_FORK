import React, { useState, useEffect } from 'react'

type Props = { open: boolean; role?: string; onClose: ()=>void }

export default function ModalRegister({ open, role, onClose }: Props){
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')

  useEffect(()=>{
    if(open){ setName(''); setEmail('') }
  },[open])

  if(!open) return null

  function handleSubmit(e: React.FormEvent){
    e.preventDefault()
    const key = `user:${role||'guest'}`
    const payload = { name, email, role }
    try{ localStorage.setItem(key, JSON.stringify(payload)) }catch(e){ console.warn(e) }
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        <h3 className="text-lg font-semibold">Registro {role ? `— ${role}` : ''}</h3>
        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <div>
            <label className="block text-sm text-gray-700">Nombre</label>
            <input required value={name} onChange={e=>setName(e.target.value)} className="w-full mt-1 border px-3 py-2 rounded" />
          </div>
          <div>
            <label className="block text-sm text-gray-700">Email</label>
            <input required type="email" value={email} onChange={e=>setEmail(e.target.value)} className="w-full mt-1 border px-3 py-2 rounded" />
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded border">Cancelar</button>
            <button type="submit" className="px-4 py-2 rounded bg-brand-600 text-white">Crear</button>
          </div>
        </form>
      </div>
    </div>
  )
}
