import React from 'react'

const steps = [
  { title: 'Registra tu rol', text: 'Crea una cuenta rápida como Padre, Docente o Admin.' },
  { title: 'Asigna tareas', text: 'Los docentes crean tareas y las familias envían evidencia.' },
  { title: 'Evalúa y acompaña', text: 'Monitorea progreso y fortalece vínculos.' }
]

export default function Steps(){
  return (
    <section id="como" className="py-12">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h2 className="text-2xl font-semibold">Cómo funciona — en 3 pasos</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {steps.map((s, i)=> (
            <div key={i} className="bg-white rounded-2xl shadow p-6 hover:shadow-xl transition transform hover:-translate-y-1">
              <div className="w-12 h-12 rounded-md bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold">{i+1}</div>
              <h3 className="mt-3 font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm text-gray-600">{s.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
