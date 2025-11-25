import React from 'react'

const ALL_PERMISSIONS = [
  'users.create','users.edit','assignments.create','grades.manage','reports.export'
]

type Props = {
  role: string
  permissions: string[]
  onChange: (perms: string[])=>void
  onRoleChange: (r:string)=>void
}

export default function RolePermissionPicker({ role, permissions, onChange, onRoleChange }: Props){
  function toggle(p:string){
    if(permissions.includes(p)) onChange(permissions.filter(x=>x!==p))
    else onChange([...permissions, p])
  }

  return (
    <div>
      <div className="mb-3">
        <label className="text-sm font-medium text-gray-700">Rol</label>
        <select value={role} onChange={e=>onRoleChange(e.target.value)} className="mt-1 w-full border rounded-md p-2">
          <option value="admin">Admin</option>
          <option value="coordinator">Coordinador</option>
          <option value="teacher">Docente</option>
          <option value="orientator">Orientador</option>
          <option value="viewer">Viewer</option>
        </select>
      </div>

      <div className="mt-4">
        <div className="text-sm font-medium text-gray-700 mb-2">Permisos</div>
        <div className="grid gap-2 md:grid-cols-2">
          {ALL_PERMISSIONS.map(p=> (
            <label key={p} className="inline-flex items-center gap-2">
              <input type="checkbox" checked={permissions.includes(p)} onChange={()=>toggle(p)} />
              <span className="text-sm text-gray-700">{p}</span>
            </label>
          ))}
        </div>
      </div>

      {role === 'teacher' ? (
        <div className="mt-4">
          <label className="inline-flex items-center gap-2"><input type="checkbox" /> <span>isGradeDirector</span></label>
        </div>
      ) : null}
    </div>
  )
}
