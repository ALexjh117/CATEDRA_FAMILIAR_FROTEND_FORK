import React from 'react'
import RoleSwitcher from './RoleSwitcher'

type Props = { onOpenRegister?: (role?: string)=>void }

export default function Header({ onOpenRegister }: Props){
  return (
    <header className="sticky top-0 z-40 bg-white/90 border-b">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-2xl font-display font-semibold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-indigo-400">Cátedra</div>
          <div className="text-sm text-gray-600">Familia</div>
        </div>
        <nav className="hidden md:flex items-center gap-6">
          <a href="#inicio" className="text-gray-600 hover:text-gray-900">Inicio</a>
          <a href="#como" className="text-gray-600 hover:text-gray-900">Cómo funciona</a>
          <a href="#roles" className="text-gray-600 hover:text-gray-900">Roles</a>
          <a href="#contacto" className="text-gray-600 hover:text-gray-900">Contacto</a>
          <RoleSwitcher />
          <button
            onClick={()=>onOpenRegister && onOpenRegister()}
            className="ml-4 inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white px-4 py-2 rounded-md hover:from-indigo-700 hover:to-indigo-600 transition shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A4 4 0 017 16h10a4 4 0 01.879 1.804M12 7v6" /></svg>
            Iniciar
          </button>
        </nav>
        <div className="md:hidden">
          <button className="p-2 rounded-md border bg-white"><svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor"><path d="M3 6h14M3 10h14M3 14h14" /></svg></button>
        </div>
      </div>
    </header>
  )
}
