import React, { useEffect, useState } from 'react'
import FormField from './FormField'
import FileUploader from './FileUploader'
import RolePermissionPicker from './RolePermissionPicker'
import ConfirmModal from './ConfirmModal'
import { apiGet, apiPost, apiPut } from '../utils/api'
import { useToast } from './ToastProvider'
import Spinner from './Spinner'

import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

type Props = { userId?: string; onSuccess?: (user:any)=>void }

const phoneRe = /^\+?[0-9]{7,15}$/

const UserSchema = z.object({
  firstName: z.string().min(2, 'Nombre requiere mínimo 2 caracteres'),
  lastName: z.string().min(2, 'Apellido requiere mínimo 2 caracteres'),
  documentType: z.enum(['cedula','tarjeta','pasaporte']).optional().or(z.literal('')).optional(),
  documentNumber: z.string().optional().refine(v=> !v || /^\d{6,}$/.test(v), { message: 'Número de documento debe ser dígitos (mín 6)' }),
  birthDate: z.string().optional().refine(v=> !v || new Date(v) <= new Date(), { message: 'Fecha inválida' }),
  email: z.string().email('Email inválido'),
  password: z.string().optional(),
  confirmPassword: z.string().optional(),
  mustResetPassword: z.boolean().optional(),
  role: z.enum(['admin','coordinator','teacher','orientator','viewer']),
  permissions: z.array(z.string()).optional(),
  isGradeDirector: z.boolean().optional(),
  gradeAssigned: z.string().optional(),
  phone: z.string().optional().refine(v=> !v || phoneRe.test(v), { message: 'Teléfono inválido. Ej: +573001234567' }),
  emailAlternate: z.string().optional(),
  notes: z.string().max(1000).optional(),
  isActive: z.boolean().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  profilePhotoFile: z.any().optional()
}).superRefine((data, ctx)=>{
  // password rules: required on create (handled outside) and if provided must be >=8 and include number
  if(data.password){
    if(data.password.length < 8) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Password mínimo 8 caracteres', path:['password'] })
    if(!/[0-9]/.test(data.password)) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Password debe contener al menos un número', path:['password'] })
    if(data.password !== data.confirmPassword) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Las contraseñas no coinciden', path:['confirmPassword'] })
  }
  if(data.startDate && data.endDate){
    if(new Date(data.endDate) < new Date(data.startDate)) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'EndDate debe ser >= StartDate', path:['endDate'] })
  }
})

export default function AdminUserForm({ userId, onSuccess }: Props){
  const isEdit = !!userId
  const toast = useToast()
  const [loading,setLoading] = useState(false)
  const [confirmDisableOpen, setConfirmDisableOpen] = useState(false)

  const { register, handleSubmit, control, reset, setValue, formState: { errors } } = useForm<any>({ resolver: zodResolver(UserSchema), defaultValues: {
    firstName:'', lastName:'', documentType:'', documentNumber:'', birthDate:'',
    email:'', password:'', confirmPassword:'', mustResetPassword:false,
    role:'teacher', permissions:[], isGradeDirector:false, gradeAssigned:'',
    phone:'', emailAlternate:'', notes:'', isActive:true, startDate:'', endDate:'', profilePhotoFile: null
  }})

  useEffect(()=>{
    if(isEdit){
      (async ()=>{
        try{
          const data = await apiGet(`/users/${userId}`)
          // normalize data keys we expect
          reset({ ...data, profilePhotoFile: null })
        }catch(e:any){ console.warn('could not load user', e); toast.show('No se pudo cargar usuario') }
      })()
    }
  },[userId])

  async function onSubmit(formData: any){
    // If creating, ensure password required
    if(!isEdit && (!formData.password || formData.password.length < 8)){
      toast.show('Password requerido en creación')
      return
    }

    setLoading(true)
    try{
      let resp:any
      if(formData.profilePhotoFile){
        const fd = new FormData()
        Object.keys(formData).forEach(k=>{
          const v = formData[k]
          if(k === 'profilePhotoFile') return
          if(v !== undefined && v !== null) fd.append(k, typeof v === 'object' ? JSON.stringify(v) : String(v))
        })
        fd.append('profilePhoto', formData.profilePhotoFile as File)
        if(isEdit) resp = await apiPut(`/users/${userId}`, fd, true)
        else resp = await apiPost('/users', fd, true)
      }else{
        const payload = { ...formData }
        delete payload.profilePhotoFile
        if(isEdit) resp = await apiPut(`/users/${userId}`, payload)
        else resp = await apiPost('/users', payload)
      }
      toast.show(resp?.message || 'Usuario guardado')
      onSuccess && onSuccess(resp.user || resp)
    }catch(err:any){
      if(err && err.errors){
        // map server errors into form errors where possible
        Object.keys(err.errors).forEach((k:string)=>{
          setValue(k, (getValue:any)=> getValue)
        })
        toast.show('Corrige los errores del formulario')
      }else{
        toast.show(err?.message || 'Error al guardar')
      }
    }finally{ setLoading(false) }
  }

  function handleToggleActive(next:boolean){
    if(!next){ setConfirmDisableOpen(true) }
    else setValue('isActive', true)
  }

  function confirmDisable(){ setValue('isActive', false); setConfirmDisableOpen(false); toast.show('Usuario desactivado') }

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 max-w-3xl mx-auto">
      <h2 className="text-2xl font-semibold">{isEdit ? 'Editar usuario' : 'Crear usuario'}</h2>
      <p className="text-sm text-gray-500 mt-1">Complete los datos del usuario. Los campos marcados son obligatorios.</p>

      {Object.keys(errors || {}).length ? (
        <div className="mt-4 p-3 bg-red-50 border border-red-100 text-red-700 rounded">Hay errores en el formulario. Revise los campos.</div>
      ) : null}

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 grid gap-6 grid-cols-1 md:grid-cols-2">
        <div className="space-y-4">
          <FormField id="firstName" label="Nombre" error={errors.firstName?.message}>
            <input id="firstName" {...register('firstName')} className="border rounded-md p-2 w-full" disabled={loading} />
          </FormField>

          <FormField id="lastName" label="Apellido" error={errors.lastName?.message}>
            <input id="lastName" {...register('lastName')} className="border rounded-md p-2 w-full" disabled={loading} />
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField id="documentType" label="Tipo doc">
              <select {...register('documentType')} className="border rounded-md p-2 w-full">
                <option value="">-</option>
                <option value="cedula">Cédula</option>
                <option value="tarjeta">Tarjeta</option>
                <option value="pasaporte">Pasaporte</option>
              </select>
            </FormField>
            <FormField id="documentNumber" label="Número doc" error={errors.documentNumber?.message}>
              <input {...register('documentNumber')} className="border rounded-md p-2 w-full" />
            </FormField>
          </div>

          <FormField id="birthDate" label="Fecha de nacimiento" error={errors.birthDate?.message}>
            <input type="date" {...register('birthDate')} className="border rounded-md p-2 w-full" />
          </FormField>

          <FormField id="phone" label="Teléfono" error={errors.phone?.message}>
            <input {...register('phone')} placeholder="+57300..." className="border rounded-md p-2 w-full" />
          </FormField>
        </div>

        <div className="space-y-4">
          <FormField id="email" label="Email" error={errors.email?.message}>
            <input {...register('email')} className="border rounded-md p-2 w-full" disabled={loading} />
          </FormField>

          <FormField id="password" label="Password" error={errors.password?.message} helper={isEdit? 'Dejar vacío para no cambiar' : undefined}>
            <input type="password" {...register('password')} className="border rounded-md p-2 w-full" disabled={loading} />
          </FormField>

          <FormField id="confirmPassword" label="Confirmar Password" error={errors.confirmPassword?.message}>
            <input type="password" {...register('confirmPassword')} className="border rounded-md p-2 w-full" disabled={loading} />
          </FormField>

          <div className="flex items-center gap-4">
            <label className="inline-flex items-center gap-2"><input type="checkbox" {...register('mustResetPassword')} /> <span className="text-sm">Forzar cambio de contraseña</span></label>
            <label className="inline-flex items-center gap-2"><input type="checkbox" checked={!!(errors.isActive ? false : undefined) ? undefined : undefined} onChange={e=>handleToggleActive(e.target.checked)} defaultChecked={true} /> <span className="text-sm">Activo</span></label>
          </div>

          <FormField id="profilePhoto" label="Foto de perfil">
            <Controller control={control} name="profilePhotoFile" render={({ field })=> (
              <FileUploader id="profilePhoto" initialUrl={undefined} onFileChange={(f)=>field.onChange(f)} />
            )} />
          </FormField>
        </div>

        <div className="md:col-span-2">
          <div className="bg-gray-50 rounded p-4">
            <Controller control={control} name="permissions" render={({ field })=> (
              <RolePermissionPicker role={''} permissions={field.value || []} onChange={(p)=>field.onChange(p)} onRoleChange={(r)=>setValue('role', r)} />
            )} />
          </div>
        </div>

        <div className="md:col-span-2">
          <FormField id="notes" label="Notas">
            <textarea {...register('notes')} className="border rounded-md p-2 w-full" rows={4} maxLength={1000} />
          </FormField>
        </div>

        <div className="md:col-span-2 flex justify-end gap-3 pt-4 border-t mt-4">
          <button type="button" onClick={()=>{ if(window.confirm('Cancelar cambios?')) window.history.back() }} className="bg-white border text-gray-700 px-4 py-2 rounded-md">Cancelar</button>
          <button type="submit" disabled={loading} className="bg-brand-600 text-white px-4 py-2 rounded-md shadow-md inline-flex items-center gap-2">
            {loading ? <Spinner/> : null}
            <span>{isEdit? 'Guardar cambios' : 'Crear usuario'}</span>
          </button>
        </div>
      </form>

      <ConfirmModal open={confirmDisableOpen} title="Desactivar usuario" description="¿Seguro que desea desactivar este usuario?" onCancel={()=>setConfirmDisableOpen(false)} onConfirm={confirmDisable} />
    </div>
  )
}
