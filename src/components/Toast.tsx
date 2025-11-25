import React, { useEffect } from 'react'

type Props = { message: string; onClose?: ()=>void }

export default function Toast({ message, onClose }: Props){
  useEffect(()=>{
    const t = setTimeout(()=> onClose && onClose(), 3000)
    return ()=>clearTimeout(t)
  },[])

  return (
    <div role="status" aria-live="polite" className="fixed bottom-6 right-6 bg-white border p-3 rounded shadow">{message}</div>
  )
}
