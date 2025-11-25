import React from 'react'

export default function DashboardTeacher({ data }: any){
  const pending = data?.pendingAssignments || []
  const recent = data?.recentSubmissions || []

  return (
    <div className="space-y-6">
      <section className="bg-white rounded-xl p-6 shadow">
        <h3 className="font-semibold">Entregas por revisar</h3>
        <div className="mt-3 text-sm text-gray-600">{pending.length} entregas pendientes</div>
      </section>

      <section className="bg-white rounded-xl p-6 shadow">
        <h3 className="font-semibold">Estudiantes con atrasos</h3>
        <div className="mt-3 text-sm text-gray-500">{/* placeholder list */} Ninguno en demo</div>
      </section>
    </div>
  )
}
