import React from 'react';

// Error para datos no encontrados
export const EmptyState = ({ 
  title, 
  description, 
  action, 
  icon 
}: { 
  title: string; 
  description: string; 
  action?: React.ReactNode; 
  icon?: React.ReactNode;
}) => (
  <div className="text-center py-12">
    {icon || (
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
    )}
    <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-600 mb-6 max-w-md mx-auto">{description}</p>
    {action}
  </div>
);

// Error para fallos de red/API
export const ErrorState = ({ 
  message = "No se pudieron cargar los datos", 
  onRetry 
}: { 
  message?: string; 
  onRetry?: () => void;
}) => (
  <div className="text-center py-12">
    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
      <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </div>
    <h3 className="text-lg font-semibold text-gray-900 mb-2">Error de carga</h3>
    <p className="text-gray-600 mb-6 max-w-md mx-auto">{message}</p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
      >
        Reintentar
      </button>
    )}
  </div>
);

// Error para red/caída de conexión
export const NetworkError = ({ onRetry }: { onRetry?: () => void }) => (
  <div className="text-center py-12">
    <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
      <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
      </svg>
    </div>
    <h3 className="text-lg font-semibold text-gray-900 mb-2">Sin conexión</h3>
    <p className="text-gray-600 mb-6 max-w-md mx-auto">
      No se pudo conectar con el servidor. Verifica tu conexión a internet.
    </p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
      >
        Reintentar
      </button>
    )}
  </div>
);

// Error para permisos denegados
export const PermissionError = ({ 
  requiredPermission, 
  contactAdmin = true 
}: { 
  requiredPermission?: string; 
  contactAdmin?: boolean;
}) => (
  <div className="text-center py-12">
    <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
      <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    </div>
    <h3 className="text-lg font-semibold text-gray-900 mb-2">Acceso denegado</h3>
    <p className="text-gray-600 mb-6 max-w-md mx-auto">
      {requiredPermission 
        ? `Necesitas permiso de "${requiredPermission}" para acceder a esta función.`
        : "No tienes los permisos necesarios para acceder a esta página."
      }
    </p>
    {contactAdmin && (
      <p className="text-sm text-gray-500">
        Contacta al administrador del sistema si crees que esto es un error.
      </p>
    )}
  </div>
);

// Error para datos corruptos/inválidos
export const DataError = ({ 
  dataType, 
  onRetry 
}: { 
  dataType: string; 
  onRetry?: () => void;
}) => (
  <div className="text-center py-12">
    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
      <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </div>
    <h3 className="text-lg font-semibold text-gray-900 mb-2">Datos inválidos</h3>
    <p className="text-gray-600 mb-6 max-w-md mx-auto">
      Los {dataType} recibidos no son válidos o están corruptos.
    </p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
      >
        Reintentar
      </button>
    )}
  </div>
);

// Error genérico con mensaje personalizado
export const GenericError = ({ 
  title, 
  message, 
  severity = "error", 
  onRetry 
}: { 
  title: string; 
  message: string; 
  severity?: "error" | "warning" | "info"; 
  onRetry?: () => void;
}) => {
  const colors = {
    error: "bg-red-100 text-red-600",
    warning: "bg-amber-100 text-amber-600", 
    info: "bg-blue-100 text-blue-600"
  };

  return (
    <div className="text-center py-12">
      <div className={`w-16 h-16 ${colors[severity]} rounded-full flex items-center justify-center mx-auto mb-4`}>
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          Reintentar
        </button>
      )}
    </div>
  );
};
