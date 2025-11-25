import React, { useState } from 'react'
import { createDemoData } from '../utils/mockService'

type Props = { onDone?: (summary:any)=>void }

export default function DemoCTA({ onDone }: Props){
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  async function handleDemo(){
    setLoading(true)
    try{
      const summary = createDemoData()
      setMessage(`Demo creada: ${summary.parents} padres, ${summary.teachers} docentes, ${summary.students} estudiantes`)
      onDone && onDone(summary)
    }catch(e){
      setMessage('No se pudo crear demo')
    }finally{ setLoading(false) }
  }

  return (
    <div className="mt-6 text-center">
      <button onClick={handleDemo} className="inline-flex items-center gap-2 bg-white border border-gray-300 px-4 py-2 rounded-md">
        {loading ? <span className="spinner" aria-hidden/> : null}
        <span>Probar demo</span>
      </button>
      {message ? <div className="mt-3 text-sm text-green-600">{message}</div> : null}
    </div>
  )
}
