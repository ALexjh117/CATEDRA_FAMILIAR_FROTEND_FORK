import React from 'react'
import { Link } from 'react-router-dom'

type Props = { onPrimary?: ()=>void; onSecondary?: ()=>void }

export default function Hero({ onPrimary, onSecondary }: Props){
  return (
    <section id="inicio" className="relative overflow-hidden py-20 md:py-28">
      {/* Elementos decorativos */}
      <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-brand-100 opacity-50 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-32 w-80 h-80 rounded-full bg-brand-200 opacity-30 blur-3xl pointer-events-none" />
      <div className="max-w-6xl mx-auto px-6 flex flex-col-reverse lg:flex-row items-center gap-12 relative z-10">
        <div className="w-full lg:w-1/2">
          <div className="inline-flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
            </span>
            Piloto 2025 · SENA Fábrica de Software
          </div>
          <h1 className="mt-6 text-5xl md:text-6xl lg:text-7xl font-display font-extrabold leading-tight text-gray-900">
            Cátedra de <span className="text-teal-600">Familia</span>
          </h1>
          <p className="mt-4 text-xl md:text-2xl text-gray-800 leading-relaxed">
            Formación familiar, <span className="text-teal-600 font-bold">prevención</span> y acompañamiento en comunidad
          </p>
          <p className="mt-3 text-lg text-gray-700">Fortalece vínculos familiares y previene la deserción con tareas semanales, evidencia compartida y calificación en el boletín escolar.</p>

          <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
            <Link
              to="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-teal-600 text-white font-bold text-lg py-4 px-8 rounded-xl shadow-lg hover:bg-teal-700 transform transition hover:-translate-y-0.5 hover:shadow-xl"
            >
              <span>Comenzar ahora</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>

          <div className="mt-10 rounded-3xl border border-white/70 bg-white/80 p-4 shadow-xl shadow-slate-200/60 backdrop-blur-sm md:p-5">
            <div className="flex flex-col gap-3 border-b border-slate-200/80 pb-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">Resumen del proyecto</div>
                <div className="mt-1 text-sm text-slate-600">Una iniciativa institucional enfocada en formación, acompañamiento y confianza digital.</div>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1.5 text-xs font-semibold text-teal-700 border border-teal-200">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-400 opacity-75"></span>
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-teal-500"></span>
                </span>
                Activo 2025
              </div>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <div className="rounded-2xl bg-gradient-to-br from-teal-50 to-white px-4 py-4 border border-teal-100">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-600 text-white shadow-md">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"/>
                  </svg>
                </div>
                <div className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Programa</div>
                <div className="mt-1 text-lg font-bold text-slate-900">Proyecto SENA 2025</div>
                <div className="mt-1 text-sm text-slate-600">Impulsado como piloto de transformación educativa y familiar.</div>
              </div>

              <div className="rounded-2xl bg-gradient-to-br from-purple-50 to-white px-4 py-4 border border-purple-100">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-purple-600 text-white shadow-md">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"/>
                  </svg>
                </div>
                <div className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Cobertura</div>
                <div className="mt-1 text-lg font-bold text-slate-900">Occidente de Popayán</div>
                <div className="mt-1 text-sm text-slate-600">Pensado para fortalecer el trabajo articulado entre escuela y familia.</div>
              </div>

              <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-white px-4 py-4 border border-emerald-100">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Confianza</div>
                <div className="mt-1 text-lg font-bold text-slate-900">Plataforma segura</div>
                <div className="mt-1 text-sm text-slate-600">Diseñada para un uso institucional confiable, claro y acompañado.</div>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-1/2 flex justify-center">
          <div className="relative">
            <div className="absolute -inset-4 bg-brand-200 rounded-3xl blur-2xl opacity-30" />
            <img 
              src="/src/assets/img_familias/Imagen de WhatsApp 2025-11-25 a las 10.29.36_df7a69b4.jpg" 
              alt="Familias trabajando juntas en actividades educativas" 
              loading="lazy" 
              className="relative w-full max-w-lg rounded-2xl shadow-2xl object-cover aspect-square" 
            />
          </div>
        </div>
      </div>
    </section>
  )
}
