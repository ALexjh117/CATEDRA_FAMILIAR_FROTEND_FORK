import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSession, logout } from '../api/endpoints';
import Modal from './ui/Modal';
import Button from './ui/Button';

const TIMEOUT_DURATION = 2 * 60 * 60 * 1000; // 2 horas en milisegundos
const WARNING_BEFORE = 5 * 60 * 1000; // Avisar 5 minutos antes
const DISABLE_SESSION_TIMEOUT = true; // Deshabilitar expiración automática y modal

export default function SessionTimeoutProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [showWarning, setShowWarning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(5 * 60); // 5 minutos en segundos
  const [lastActivity, setLastActivity] = useState(Date.now());

  useEffect(() => {
    if (DISABLE_SESSION_TIMEOUT) {
      return;
    }
    const session = getSession();
    if (!session) return;

    // Eventos que resetean el timer de inactividad
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    
    const resetTimer = () => {
      setLastActivity(Date.now());
      setShowWarning(false);
    };

    events.forEach(event => {
      document.addEventListener(event, resetTimer);
    });

    // Verificar inactividad cada 30 segundos
    const checkInterval = setInterval(() => {
      const now = Date.now();
      const timeSinceActivity = now - lastActivity;
      
      // Si está a 5 minutos de expirar, mostrar advertencia
      if (timeSinceActivity >= TIMEOUT_DURATION - WARNING_BEFORE && timeSinceActivity < TIMEOUT_DURATION) {
        const secondsLeft = Math.floor((TIMEOUT_DURATION - timeSinceActivity) / 1000);
        setTimeLeft(secondsLeft);
        setShowWarning(true);
      }
      
      // Si pasaron 2 horas, cerrar sesión
      if (timeSinceActivity >= TIMEOUT_DURATION) {
        handleLogout();
      }
    }, 30000);

    // Countdown para el modal de advertencia
    let countdownInterval: NodeJS.Timeout | null = null;
    if (showWarning) {
      countdownInterval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleLogout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, resetTimer);
      });
      clearInterval(checkInterval);
      if (countdownInterval) clearInterval(countdownInterval);
    };
  }, [lastActivity, showWarning]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleContinue = () => {
    setLastActivity(Date.now());
    setShowWarning(false);
    setTimeLeft(5 * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
      {children}
      
      <Modal
        isOpen={false}
        onClose={() => {}} // No se puede cerrar, debe elegir
        title="⏱️ Sesión por Expirar"
        size="sm"
      >
        <div className="text-center py-6">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
            <svg className="w-10 h-10 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          
          <h3 className="text-lg font-bold text-slate-800 mb-2">
            Tu sesión está por expirar
          </h3>
          
          <p className="text-slate-600 mb-6">
            Por seguridad, tu sesión se cerrará automáticamente en:
          </p>
          
          <div className="text-4xl font-bold text-amber-600 mb-6 font-mono">
            {formatTime(timeLeft)}
          </div>
          
          <div className="flex gap-3">
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="flex-1"
            >
              Cerrar Sesión
            </Button>
            <Button
              onClick={handleContinue}
              className="flex-1"
            >
              Continuar Trabajando
            </Button>
          </div>
          
          <p className="text-xs text-slate-500 mt-4">
            Las sesiones expiran después de 2 horas de inactividad
          </p>
        </div>
      </Modal>
    </>
  );
}
