import React from 'react'
import RoleSwitcher from './RoleSwitcher'

type Props = { onOpenRegister?: (role?: string)=>void }

export default function Header({ onOpenRegister }: Props){
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-brand-100/50 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/src/assets/logo.jpg" alt="Logo Cátedra de Familia" className="w-12 h-12 rounded-lg shadow-md object-cover" />
          <div>
            <div className="text-xl font-display font-bold text-gray-900">Cátedra</div>
            <div className="text-xs text-gray-600 -mt-0.5">de Familia</div>
          </div>
        </div>
        <nav className="hidden md:flex items-center gap-8">
          <a href="#inicio" className="text-gray-800 hover:text-brand-600 font-medium transition-colors">Inicio</a>
          <a href="#como" className="text-gray-800 hover:text-brand-600 font-medium transition-colors">Cómo funciona</a>
          <a href="#sobre-colectivo" className="text-gray-800 hover:text-brand-600 font-medium transition-colors">Sobre Nosotros</a>
          <RoleSwitcher />
          <button
            onClick={()=>onOpenRegister && onOpenRegister()}
            className="inline-flex items-center gap-2 bg-teal-600 text-white px-6 py-2.5 rounded-xl hover:bg-teal-700 transition-all shadow-md hover:shadow-lg font-bold"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
            <span>Registrarse</span>
          </button>
        </nav>
        <div className="md:hidden">
          <button className="p-2 rounded-md border bg-white"><svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor"><path d="M3 6h14M3 10h14M3 14h14" /></svg></button>
        </div>
      </div>
    </header>
  )
}
