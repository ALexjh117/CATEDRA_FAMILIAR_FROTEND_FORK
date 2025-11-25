import React, { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { getDashboard } from '../utils/dashboardApi'
import { useToast } from '../components/ToastProvider'
import DashboardShell from '../components/DashboardShell'

const DashboardParent = React.lazy(()=> import('../components/dash/DashboardParent'))
const DashboardTeacher = React.lazy(()=> import('../components/dash/DashboardTeacher'))
const DashboardAdmin = React.lazy(()=> import('../components/dash/DashboardAdmin'))

export default function DashboardPage(){
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()
  const toast = useToast()
  const paramRole = params.get('role')
  const [role, setRole] = useState<string | null>(paramRole)
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<any>(null)

  useEffect(()=>{
    const preset = localStorage.getItem('previewRole') || 'parent'
    if(!paramRole){
      navigate(`/dashboard?role=${preset}`, { replace: true })
      setRole(preset)
    }else{
      setRole(paramRole)
    }
  },[paramRole])

  useEffect(()=>{
    if(!role) return
    localStorage.setItem('previewRole', role)
    toast.show(`Vista: ${role} (solo preview)`)
    setLoading(true)
    getDashboard(role).then(res=>{
      setData(res.data)
    }).catch(()=>{
      setData(null)
    }).finally(()=> setLoading(false))
  },[role])

  if(!role) return <div className="p-6">Selecciona un rol...</div>

  return (
    <DashboardShell header={data?.header} stats={data?.stats} role={role} loading={loading}>
      <Suspense fallback={<div className="p-6">Cargando...</div>}>
        {role === 'parent' && <DashboardParent data={data} />}
        {role === 'teacher' && <DashboardTeacher data={data} />}
        {role === 'admin' && <DashboardAdmin data={data} />}
        {['parent','teacher','admin'].indexOf(role) === -1 && <div className="p-6">Selecciona un rol válido.</div>}
      </Suspense>
    </DashboardShell>
  )
}
