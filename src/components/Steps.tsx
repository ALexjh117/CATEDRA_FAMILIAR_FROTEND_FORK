import React from 'react'

const steps = [
  { title: 'Registra tu rol', text: 'Familias, docentes y administradores en una sola plataforma.', emoji: '👤', color: 'bg-brand-100 text-brand-600' },
  { title: 'Recibe tareas', text: 'Actividades semanales o quincenales para desarrollar en familia.', emoji: '📋', color: 'bg-blue-100 text-blue-600' },
  { title: 'Envía evidencia', text: 'Las familias comparten fotos, textos o archivos de las actividades.', emoji: '📸', color: 'bg-green-100 text-green-600' },
  { title: 'Califica y acompaña', text: 'Los docentes evalúan y la nota se incluye en el boletín escolar.', emoji: '⭐', color: 'bg-purple-100 text-purple-600' }
]

export default function Steps(){
  return (
    <section id="como" className="py-16">
      <div className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-3">Cómo funciona</h2>
          <p className="text-gray-700 text-lg">Simple, rápido y efectivo en 4 pasos</p>
        </div>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i)=> (
            <div key={i} className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className={`w-16 h-16 rounded-xl ${s.color} flex items-center justify-center text-3xl mb-4 shadow-md`}>
                {s.emoji}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{s.title}</h3>
              <p className="text-gray-700 leading-relaxed">{s.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
