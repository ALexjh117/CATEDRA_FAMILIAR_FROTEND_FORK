import React from 'react'
import { Link } from 'react-router-dom'

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
          <Link
            to="/login"
            className="inline-flex items-center gap-2 bg-teal-600 text-white px-6 py-2.5 rounded-xl hover:bg-teal-700 transition-all shadow-md hover:shadow-lg font-bold"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>
            <span>Ingresar</span>
          </Link>
        </nav>
        <div className="md:hidden">
          <Link to="/login" className="p-2 rounded-md border bg-white text-teal-600 font-bold">Ingresar</Link>
        </div>
      </div>
    </header>
  )
}
