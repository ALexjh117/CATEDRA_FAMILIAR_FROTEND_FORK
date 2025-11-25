import React from 'react'

export default function DashboardAdmin({ data }: any){
  const usersActive = data?.usersActive || { teachers:0, parents:0 }

  return (
    <div className="space-y-6">
      <section className="bg-white rounded-xl p-6 shadow">
        <h3 className="font-semibold">Usuarios activos</h3>
        <div className="mt-3 text-sm text-gray-600">Docentes: {usersActive.teachers || 0} · Padres: {usersActive.parents || 0}</div>
      </section>

      <section className="bg-white rounded-xl p-6 shadow">
        <h3 className="font-semibold">Reportes</h3>
        <div className="mt-3 text-sm text-gray-500">Reportes pendientes: {data?.reportsPending || 0}</div>
      </section>
    </div>
  )
}
