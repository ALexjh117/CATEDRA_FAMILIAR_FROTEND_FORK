import React, { useState } from 'react'
import Header from '../components/Header'
import Hero from '../components/Hero'
import Steps from '../components/Steps'
import DemoCTA from '../components/DemoCTA'
import ModalRegister from '../components/ModalRegister'

export default function Landing(){
  const [modalOpen, setModalOpen] = useState(false)
  const [role, setRole] = useState<string | undefined>(undefined)
  const [toast, setToast] = useState<string | null>(null)

  function openRole(r?:string){ setRole(r); setModalOpen(true) }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-brand-50/30 to-blue-50/20 text-gray-900">
      <Header onOpenRegister={()=>openRole(undefined)} />
      <main>
        <Hero onPrimary={()=>openRole(undefined)} onSecondary={()=>{ const el = document.getElementById('demo'); el && el.scrollIntoView({behavior:'smooth'}) }} />
        <div className="max-w-6xl mx-auto px-4">
          <Steps />

          {/* Sección de Impacto con Galería */}
          <section className="py-16 bg-gradient-to-br from-white to-brand-50/30 rounded-3xl my-16">
            <div className="max-w-5xl mx-auto px-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-4">
                  Fortaleciendo <span className="text-teal-600">vínculos familiares</span>
                </h2>
                <p className="text-gray-700 text-lg max-w-2xl mx-auto">
                  Familias de nuestra comunidad participando activamente en el desarrollo educativo de sus hijos
                </p>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="relative group overflow-hidden rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300">
                  <img 
                    src="/src/assets/img_familias/Imagen de WhatsApp 2025-11-25 a las 10.29.34_35254a6c.jpg" 
                    alt="Familia desarrollando actividades educativas juntos" 
                    className="w-full h-72 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                    <p className="text-white font-semibold p-6 text-lg">Actividades en familia</p>
                  </div>
                </div>
                <div className="relative group overflow-hidden rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300">
                  <img 
                    src="/src/assets/img_familias/IMG-20251125-WA0079[1].jpg" 
                    alt="Comunidad educativa trabajando en conjunto" 
                    className="w-full h-72 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                    <p className="text-white font-semibold p-6 text-lg">Comunidad unida</p>
                  </div>
                </div>
              </div>
              <div className="mt-8 text-center">
                <p className="text-gray-600 italic">Imágenes de familias participantes en el proyecto</p>
              </div>
            </div>
          </section>

          <section id="sobre-colectivo" className="py-16 relative">
            <div className="absolute top-10 right-10 w-72 h-72 rounded-full bg-brand-100 opacity-30 blur-3xl pointer-events-none" />
            <div className="absolute bottom-10 left-10 w-80 h-80 rounded-full bg-blue-100 opacity-20 blur-3xl pointer-events-none" />
            <div className="relative">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-4">
                  Sobre <span className="text-teal-600">Parchando Juntos</span>
                </h2>
                <p className="text-gray-700 text-lg max-w-3xl mx-auto">
                  Colectivo Pedagógico comprometido con la formación integral y la prevención del reclutamiento armado en el Occidente de Popayán
                </p>
              </div>
              
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                {/* Imagen del Colectivo */}
                <div className="flex justify-center">
                  <img 
                    src="/src/assets/pj.png" 
                    alt="Colectivo Parchando Juntos" 
                    className="w-48 h-48 rounded-2xl shadow-lg object-cover object-center"
                  />
                </div>
                
                {/* Información del Colectivo */}
                <div className="space-y-6">
                  <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center flex-shrink-0">
                        <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-display font-bold text-xl text-gray-900 mb-2">Misión</h3>
                        <p className="text-gray-700 leading-relaxed">
                          Fortalecer los vínculos familiares y comunitarios mediante estrategias pedagógicas innovadoras que contribuyan a la formación integral de niños, niñas y jóvenes del Occidente de Popayán.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-display font-bold text-xl text-gray-900 mb-2">Objetivos</h3>
                        <p className="text-gray-700 leading-relaxed">
                          Prevenir el reclutamiento armado a través de la educación, promover la participación activa de las familias en la formación educativa y crear espacios de diálogo y construcción comunitaria.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
                        <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-display font-bold text-xl text-gray-900 mb-2">Impacto</h3>
                        <p className="text-gray-700 leading-relaxed">
                          Transformación social a través de la educación, creación de redes de apoyo comunitario y desarrollo de competencias familiares para la construcción de paz y convivencia.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section id="demo" className="py-16">
            <div className="max-w-3xl mx-auto">
              <div className="bg-gradient-to-br from-gray-800 via-gray-900 to-slate-900 rounded-3xl shadow-2xl p-12 text-center relative overflow-hidden border-2 border-brand-500/30">
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/20 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-teal-500/20 rounded-full blur-3xl" />
                <div className="relative z-10">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand-500/20 backdrop-blur-sm mb-6 border-2 border-brand-400">
                    <svg className="w-8 h-8 text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="text-3xl md:text-4xl font-display font-bold mb-4 text-white">¿Listo para comenzar?</h3>
                  <p className="text-gray-200 mb-8 text-lg max-w-xl mx-auto font-medium">Explora la plataforma con datos de demostración. Navega como docente, coordinador o administrador.</p>
                  <DemoCTA onDone={(s)=>setToast(`Demo creada: ${s.students} estudiantes`)} />
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      <footer className="mt-20 bg-gradient-to-r from-gray-900 via-brand-900 to-gray-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">C</span>
                </div>
                <h4 className="font-display font-bold text-xl">Cátedra de Familia</h4>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">Fortaleciendo vínculos entre familias y escuelas.</p>
            </div>
            <div>
              <h5 className="font-semibold mb-3 text-brand-400">Navegación</h5>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#inicio" className="hover:text-brand-300 transition">Inicio</a></li>
                <li><a href="#como" className="hover:text-brand-300 transition">Cómo funciona</a></li>
                <li><a href="#sobre-colectivo" className="hover:text-brand-300 transition">Sobre Nosotros</a></li>
                <li><a href="#demo" className="hover:text-brand-300 transition">Demo</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-3 text-brand-400">Contacto</h5>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  parchandojuntos2025@gmail.com
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  Tel: 310 739 2818
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Popayán, Cauca
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6">
            <div className="text-center text-sm text-gray-500 mb-4">
              <p>© 2025 PARCHANDO JUNTOS - Colectivo Pedagógico, Comité Operativo para la Formación Integral y la Prevención del Reclutamiento Armado del Occidente de Popayán.</p>
              <p className="mt-2 text-xs">Desarrollo SENA - Fábrica de Software.</p>
            </div>
            <div className="flex justify-center gap-6 text-xs text-gray-600">
              <a href="#" className="hover:text-brand-400 transition">Política de Privacidad</a>
              <a href="#" className="hover:text-brand-400 transition">Tratamiento de Datos Personales</a>
              <a href="#" className="hover:text-brand-400 transition">Términos y Condiciones</a>
            </div>
          </div>
        </div>
      </footer>

      <ModalRegister open={modalOpen} role={role} onClose={()=>setModalOpen(false)} />
      {toast ? <div className="fixed bottom-6 right-6 bg-white p-3 rounded shadow">{toast}</div> : null}
    </div>
  )
}
