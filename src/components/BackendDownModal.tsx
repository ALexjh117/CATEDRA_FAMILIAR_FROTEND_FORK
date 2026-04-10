import { useEffect, useState } from 'react';
import Modal from './ui/Modal';
import Button from './ui/Button';
import { logout } from '../api/endpoints';

export default function BackendDownModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onDown = () => setOpen(true);
    window.addEventListener('backend:down', onDown as EventListener);
    return () => {
      window.removeEventListener('backend:down', onDown as EventListener);
    };
  }, []);

  const handleReLogin = async () => {
    try {
      await logout();
    } catch {}
    window.location.href = '/login';
  };

  return (
    <Modal isOpen={open} onClose={() => setOpen(false)} title="¡Ups! Algo salió mal" size="sm">
      <div className="text-center py-4">
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-rose-100 to-red-100 flex items-center justify-center">
          <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-slate-800 mb-2">No pudimos cargar la información</h3>
        <p className="text-slate-600 mb-6">Puede ser un problema temporal de conexión o del servicio. Por protección de datos, te pedimos volver a iniciar sesión cuando esté disponible de nuevo.</p>
        <div className="flex gap-3">
          <Button variant="ghost" onClick={() => setOpen(false)} className="flex-1">Cerrar</Button>
          <Button onClick={handleReLogin} className="flex-1">Volver a iniciar sesión</Button>
        </div>
        <p className="text-xs text-slate-500 mt-4">Si el problema persiste, verifica tu conexión o contacta al administrador.</p>
      </div>
    </Modal>
  );
}
