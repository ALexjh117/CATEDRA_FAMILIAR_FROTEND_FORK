import React from 'react'

type Props = { open: boolean; title?: string; description?: string; onCancel: ()=>void; onConfirm: ()=>void }

export default function ConfirmModal({ open, title='Confirmar', description, onCancel, onConfirm }: Props){
  if(!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 className="text-lg font-semibold">{title}</h3>
        {description ? <p className="mt-2 text-sm text-gray-600">{description}</p> : null}
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onCancel} className="px-4 py-2 rounded border">Cancelar</button>
          <button onClick={onConfirm} className="px-4 py-2 rounded bg-red-600 text-white">Confirmar</button>
        </div>
      </div>
    </div>
  )
}
