import { useState, useEffect } from 'react';
import Modal from './ui/Modal';
import Button from './ui/Button';

export default function TestConfirmModal() {
  const [showMainModal, setShowMainModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [password, setPassword] = useState('');

  useEffect(() => {
    console.log('[TestConfirmModal] showConfirmModal:', showConfirmModal);
  }, [showConfirmModal]);

  const handleShowConfirm = () => {
    console.log('[TestConfirmModal] Botón presionado, password:', password);
    console.log('[TestConfirmModal] Antes de setShowConfirmModal:', showConfirmModal);
    setShowConfirmModal(true);
    console.log('[TestConfirmModal] Después de setShowConfirmModal:', showConfirmModal);
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test Modal de Confirmación</h1>
      
      <div className="space-y-4">
        <input
          type="text"
          placeholder="Escribe una contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border rounded"
        />
        
        <Button onClick={() => setShowMainModal(true)}>
          Abrir Modal Principal
        </Button>

        <Button onClick={handleShowConfirm} variant="outline">
          Abrir Modal de Confirmación Directo
        </Button>
      </div>

      {/* Modal Principal */}
      <Modal
        isOpen={showMainModal}
        onClose={() => setShowMainModal(false)}
        title="Modal Principal"
      >
        <div className="space-y-4">
          <p>Esta es una prueba del modal principal</p>
          <input
            type="text"
            placeholder="Contraseña en modal principal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded"
          />
          <Button onClick={handleShowConfirm}>
            Mostrar Confirmación
          </Button>
        </div>
      </Modal>

      {/* Modal de Confirmación - Separado */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="🔐 Confirmación"
      >
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded p-4">
            <h3 className="font-bold text-red-800">Contraseña que se guardará:</h3>
            <div className="bg-white border-2 border-red-400 rounded p-2 font-mono text-center text-lg">
              {password}
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Longitud: {password.length} caracteres
            </p>
          </div>
          
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShowConfirmModal(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={() => {
                console.log('Contraseña confirmada:', password);
                setShowConfirmModal(false);
                setShowMainModal(false);
              }}
              className="flex-1"
            >
              Confirmar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
