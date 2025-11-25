import React, { useState } from 'react'
import Header from '../components/Header'
import Hero from '../components/Hero'
import Steps from '../components/Steps'
import RoleCard from '../components/RoleCard'
import DemoCTA from '../components/DemoCTA'
import ModalRegister from '../components/ModalRegister'

export default function Landing(){
  const [modalOpen, setModalOpen] = useState(false)
  const [role, setRole] = useState<string | undefined>(undefined)
  const [toast, setToast] = useState<string | null>(null)

  function openRole(r?:string){ setRole(r); setModalOpen(true) }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Header onOpenRegister={()=>openRole(undefined)} />
      <main>
        <Hero onPrimary={()=>openRole(undefined)} onSecondary={()=>{ const el = document.getElementById('demo'); el && el.scrollIntoView({behavior:'smooth'}) }} />
        <div className="max-w-6xl mx-auto px-4">
          <Steps />

          <section id="roles" className="py-12">
            <h2 className="text-2xl font-semibold text-center">Roles</h2>
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              <RoleCard role="Padre / Acudiente" description="Gestiona tareas y envía evidencias" onRegister={openRole} />
              <RoleCard role="Docente" description="Asigna tareas y revisa entregas" onRegister={openRole} />
              <RoleCard role="Administrador" description="Configuración y gestión" onRegister={openRole} />
            </div>
          </section>

          <section id="demo" className="py-12 text-center">
            <h3 className="text-xl font-semibold">Prueba rápida</h3>
            <DemoCTA onDone={(s)=>setToast(`Demo creada: ${s.students} estudiantes`)} />
          </section>
        </div>
      </main>

      <footer className="mt-12 bg-white border-t py-6">
        <div className="max-w-6xl mx-auto px-4 text-sm text-gray-600">Contacto: contacto@catedra-familia.org · Tel: 300-000-0000</div>
      </footer>

      <ModalRegister open={modalOpen} role={role} onClose={()=>setModalOpen(false)} />
      {toast ? <div className="fixed bottom-6 right-6 bg-white p-3 rounded shadow">{toast}</div> : null}
    </div>
  )
}
