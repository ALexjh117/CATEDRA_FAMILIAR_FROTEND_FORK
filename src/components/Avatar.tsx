import React from 'react'

type Props = { name: string; size?: number }

export default function Avatar({ name, size=40 }: Props){
  const initials = name.split(' ').map(s=>s[0]).slice(0,2).join('')
  return (
    <div style={{ width: size, height: size }} className="rounded-full bg-gray-200 flex items-center justify-center text-sm">{initials}</div>
  )
}
