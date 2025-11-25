import React from 'react'

export default function DashboardShell({ header, stats, children, role, loading }: any){
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg font-semibold">{header?.name || '—'}</div>
              <div className="text-sm text-gray-500">{header?.context || ''}</div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-sm text-gray-500">Tareas</div>
                <div className="text-xl font-bold">{stats?.assignments ?? 0}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-500">Pendientes</div>
                <div className="text-xl font-bold">{stats?.pendingSubmissions ?? 0}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-500">On time</div>
                <div className="text-xl font-bold">{Math.round((stats?.onTimeRate||0)*100)}%</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {children}
          </div>
          <aside className="space-y-4">
            <div className="bg-white rounded-xl shadow p-4">Quick actions</div>
            <div className="bg-white rounded-xl shadow p-4">Notifications</div>
          </aside>
        </div>
      </div>
    </div>
  )
}
