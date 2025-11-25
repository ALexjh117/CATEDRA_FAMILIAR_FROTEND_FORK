import React from 'react'

export default function DashboardParent({ data }: any){
  const pending = data?.pendingAssignments || []
  const recent = data?.recentSubmissions || []

  return (
    <div className="space-y-6">
      <section className="bg-white rounded-xl p-6 shadow">
        <h3 className="font-semibold">Tareas pendientes</h3>
        {pending.length ? (
          <ul className="mt-3 space-y-2">
            {pending.slice(0,5).map((p:any)=> (
              <li key={p.id} className="flex justify-between items-center border-b py-2">
                <div>
                  <div className="font-medium">{p.title}</div>
                  <div className="text-xs text-gray-500">Vencimiento: {p.due}</div>
                </div>
                <div className="text-sm text-gray-600">{p.status}</div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-3 text-sm text-gray-500">No hay tareas pendientes.</div>
        )}
      </section>

      <section className="bg-white rounded-xl p-6 shadow">
        <h3 className="font-semibold">Última entrega</h3>
        {recent.length ? (
          <div className="mt-3">{recent[0].studentName} - {recent[0].submittedAt}</div>
        ) : <div className="mt-3 text-sm text-gray-500">Sin entregas recientes</div>}
      </section>
    </div>
  )
}
