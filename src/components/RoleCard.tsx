import React from 'react'

type Props = {
  role: string;
  description: string;
  icon?: React.ReactNode;
  onRegister?: (role:string)=>void;
}

const roleColors: Record<string, string> = {
  'Padre / Acudiente': 'bg-brand-100 text-brand-600 border-brand-200',
  'Docente': 'bg-blue-100 text-blue-600 border-blue-200',
  'Administrador': 'bg-purple-100 text-purple-600 border-purple-200'
}

export default function RoleCard({ role, description, icon, onRegister }: Props){
  const colorClass = roleColors[role] || 'bg-brand-100 text-brand-600 border-brand-200'
  
  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 text-center hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-transparent hover:border-brand-300">
      <div className="flex items-center justify-center mb-6">
        <div className={`w-20 h-20 rounded-2xl ${colorClass} flex items-center justify-center text-3xl font-bold shadow-lg`}>
          {icon ?? role[0]}
        </div>
      </div>
      <h3 className="font-display font-bold text-xl text-gray-900 mb-3">{role}</h3>
      <p className="text-gray-700 mb-6 leading-relaxed">{description}</p>
      <button 
        onClick={()=>onRegister && onRegister(role)} 
        className="inline-flex items-center gap-2 bg-teal-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-teal-700 transition-all hover:shadow-xl"
      >
        <span>Registrarse</span>
      </button>
    </div>
  )
}
