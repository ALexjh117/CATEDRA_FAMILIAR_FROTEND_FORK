import React from 'react'

type Props = {
  id: string
  label: string
  helper?: string
  error?: string | null
  children: React.ReactNode
}

export default function FormField({ id, label, helper, error, children }: Props){
  return (
    <div className="flex flex-col">
      <label htmlFor={id} className="text-sm font-medium text-gray-700">{label}</label>
      <div className="mt-1">{children}</div>
      {helper ? <div className="text-xs text-gray-500 mt-1">{helper}</div> : null}
      {error ? <div id={`${id}-error`} className="text-xs text-red-600 mt-1">{error}</div> : null}
    </div>
  )
}
