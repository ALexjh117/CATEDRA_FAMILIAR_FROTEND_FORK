import React from 'react'

type Props = { onPrimary?: ()=>void; onSecondary?: ()=>void }

export default function Hero({ onPrimary, onSecondary }: Props){
  return (
    <section id="inicio" className="relative overflow-hidden py-20">
      <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-indigo-100 opacity-60 blur-3xl pointer-events-none" />
      <div className="max-w-6xl mx-auto px-6 flex flex-col-reverse lg:flex-row items-center gap-12">
        <div className="w-full lg:w-1/2">
          <div className="inline-flex items-center gap-3 bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium">Nuevo · Lanzamiento</div>
          <h1 className="mt-6 text-4xl md:text-5xl lg:text-6xl font-display font-extrabold leading-tight text-gray-900">Cátedra de Familia — Aprendizaje en casa, prevención en comunidad</h1>
          <p className="mt-4 text-lg text-gray-600">Conecta familias y escuelas con herramientas simples para seguimiento, evidencia y acompañamiento.</p>

          <div className="mt-8 flex items-center gap-4">
            <button onClick={onPrimary} className="inline-flex items-center gap-3 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white font-semibold py-3 px-6 rounded-xl shadow-lg transform transition hover:-translate-y-0.5">Comenzar ahora</button>
            <button onClick={onSecondary} className="inline-flex items-center gap-2 bg-white border border-gray-200 px-5 py-3 rounded-xl">Probar demo</button>
          </div>

          <div className="mt-6 flex items-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-2"><strong className="text-indigo-600">3K+</strong><span>tareas en piloto</span></div>
            <div className="flex items-center gap-2"><strong className="text-indigo-600">+150</strong><span>docentes</span></div>
          </div>
        </div>

        <div className="w-full lg:w-1/2 flex justify-center">
          <img src="/src/assets/illustration-hero.svg" alt="Ilustración hero" loading="lazy" className="w-full max-w-lg rounded-2xl shadow-2xl" />
        </div>
      </div>
    </section>
  )
}
