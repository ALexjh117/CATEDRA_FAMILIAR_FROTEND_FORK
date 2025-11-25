import React, { useRef, useState, useEffect } from 'react'

type Props = {
  id: string
  onFileChange: (file: File | null)=>void
  initialUrl?: string | null
}

export default function FileUploader({ id, onFileChange, initialUrl=null }: Props){
  const inputRef = useRef<HTMLInputElement|null>(null)
  const [preview, setPreview] = useState<string| null>(initialUrl)

  useEffect(()=>{ return ()=>{ if(preview && preview.startsWith('blob:')) URL.revokeObjectURL(preview) } },[preview])

  function handle(e: React.ChangeEvent<HTMLInputElement>){
    const f = e.target.files && e.target.files[0]
    if(!f){ setPreview(initialUrl); onFileChange(null); return }
    const validTypes = ['image/png','image/jpeg']
    if(!validTypes.includes(f.type)){
      alert('Formato no válido. Use PNG o JPG.')
      onFileChange(null)
      return
    }
    if(f.size > 3 * 1024 * 1024){ alert('El archivo debe ser <= 3MB'); onFileChange(null); return }
    const url = URL.createObjectURL(f)
    setPreview(url)
    onFileChange(f)
  }

  return (
    <div>
      <div className="flex items-center gap-4">
        <div className="w-20 h-20 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center">
          {preview ? <img src={preview} alt="preview" className="w-full h-full object-cover"/> : <div className="text-gray-400">No photo</div>}
        </div>
        <div>
          <input id={id} ref={inputRef} type="file" accept="image/png,image/jpeg" onChange={handle} className="hidden" />
          <button type="button" onClick={()=>inputRef.current?.click()} className="px-3 py-2 border rounded">Seleccionar foto</button>
        </div>
      </div>
    </div>
  )
}
