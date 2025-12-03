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
    <div className="text-center">
      <button onClick={handleDemo} disabled={loading} className="inline-flex items-center gap-3 bg-white text-brand-700 px-8 py-4 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
        {loading ? <span className="spinner" aria-hidden/> : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        )}
        <span className="text-brand-700">{loading ? 'Creando demo...' : 'Probar demo gratis'}</span>
      </button>
      {message ? <div className="mt-4 text-white bg-white/20 backdrop-blur-sm px-6 py-3 rounded-lg inline-block font-semibold">{message}</div> : null}
    </div>
  )
}
