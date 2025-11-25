import React from 'react'

type Props = {
  role: string;
  description: string;
  icon?: React.ReactNode;
  onRegister?: (role:string)=>void;
}

export default function RoleCard({ role, description, icon, onRegister }: Props){
  return (
    <div className="bg-white rounded-2xl shadow-md p-6 text-center hover:shadow-xl transition transform hover:-translate-y-2">
      <div className="flex items-center justify-center mb-4">
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-50 to-indigo-100 flex items-center justify-center text-indigo-700 text-xl">{icon ?? role[0]}</div>
      </div>
      <h3 className="font-semibold text-lg">{role}</h3>
      <p className="text-sm text-gray-600 mt-2">{description}</p>
      <div className="mt-6">
        <button onClick={()=>onRegister && onRegister(role)} className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg shadow hover:bg-indigo-700 transition">Registrarse</button>
      </div>
    </div>
  )
}
