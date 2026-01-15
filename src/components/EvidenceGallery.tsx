import { useState } from 'react';
import { IconX, IconChevronLeft, IconChevronRight, IconZoomIn, IconZoomOut } from './ui/Icons';

interface EvidenceGalleryProps {
  images: string[];
  initialIndex?: number;
  onClose: () => void;
}

export default function EvidenceGallery({ images, initialIndex = 0, onClose }: EvidenceGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    setZoom(1);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    setZoom(1);
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.25, 0.5));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') goToPrevious();
    if (e.key === 'ArrowRight') goToNext();
    if (e.key === 'Escape') onClose();
    if (e.key === '+' || e.key === '=') handleZoomIn();
    if (e.key === '-') handleZoomOut();
  };

  if (images.length === 0) return null;

  return (
    <div
      className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center"
      onClick={onClose}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between text-white z-10">
        <div className="text-sm font-medium">
          {currentIndex + 1} / {images.length}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleZoomOut();
            }}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            title="Zoom Out (-)"
          >
            <IconZoomOut className="w-5 h-5" />
          </button>
          <span className="text-sm w-12 text-center">{Math.round(zoom * 100)}%</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleZoomIn();
            }}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            title="Zoom In (+)"
          >
            <IconZoomIn className="w-5 h-5" />
          </button>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          title="Cerrar (Esc)"
        >
          <IconX className="w-6 h-6" />
        </button>
      </div>

      {/* Navigation */}
      {images.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              goToPrevious();
            }}
            className="absolute left-4 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-white"
            title="Anterior (←)"
          >
            <IconChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              goToNext();
            }}
            className="absolute right-4 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-white"
            title="Siguiente (→)"
          >
            <IconChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Image */}
      <div
        className="max-w-7xl max-h-[90vh] overflow-auto p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={images[currentIndex]}
          alt={`Evidencia ${currentIndex + 1}`}
          className="w-full h-full object-contain transition-transform duration-200"
          style={{ transform: `scale(${zoom})` }}
        />
      </div>

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
          <div className="flex gap-2 justify-center overflow-x-auto pb-2">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(idx);
                  setZoom(1);
                }}
                className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                  idx === currentIndex
                    ? 'border-blue-500 scale-110'
                    : 'border-white/30 hover:border-white/60'
                }`}
              >
                <img
                  src={img}
                  alt={`Miniatura ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
