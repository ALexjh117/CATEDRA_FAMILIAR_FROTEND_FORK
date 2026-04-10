import React from 'react';

interface ImageLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  imageAlt: string;
  personName: string;
  personRole: string;
}

export default function ImageLightbox({ 
  isOpen, 
  onClose, 
  imageSrc, 
  imageAlt, 
  personName, 
  personRole 
}: ImageLightboxProps) {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="dialog"
      aria-modal="true"
      aria-labelledby="lightbox-title"
    >
      {/* Botón de cerrar */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm text-white transition hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white/50"
        aria-label="Cerrar imagen"
      >
        <svg 
          className="h-6 w-6" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M6 18L18 6M6 6l12 12" 
          />
        </svg>
      </button>

      {/* Contenedor de la imagen */}
      <div className="relative max-w-4xl max-h-[90vh] w-full">
        {/* Información de la persona */}
        <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/70 to-transparent p-6 text-white">
          <h3 id="lightbox-title" className="text-2xl font-bold">{personName}</h3>
          <p className="text-lg opacity-90">{personRole}</p>
        </div>

        {/* Imagen grande */}
        <div className="flex items-center justify-center">
          <img
            src={imageSrc}
            alt={imageAlt}
            className="max-h-[80vh] max-w-full rounded-lg object-contain shadow-2xl"
            style={{ maxHeight: '70vh' }}
          />
        </div>

        {/* Indicador de navegación */}
        <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/70 to-transparent p-6 text-center">
          <p className="text-sm text-white/80">
            Click fuera o presiona ESC para cerrar
          </p>
        </div>
      </div>
    </div>
  );
}
