import type { Tarea, Categoria } from '../mocks/data';

interface TareaCardProps {
  tarea: Tarea & { categoria?: Categoria; fechaLimite?: string };
  onEntregar?: (tareaId: number) => void;
  onVer?: (tareaId: number) => void;
  showActions?: boolean;
  estado?: 'pendiente' | 'enviada' | 'calificada';
  viewMode?: 'acudiente' | 'docente';
}

export default function TareaCard({ 
  tarea, 
  onEntregar, 
  onVer,
  showActions = true, 
  estado,
  viewMode = 'acudiente' 
}: TareaCardProps) {
  const categoria = tarea.categoria;
  
  const getEstadoBadge = () => {
    const estadoActual = estado || 'pendiente';
    switch (estadoActual) {
      case 'enviada':
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
            Enviada
          </span>
        );
      case 'calificada':
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
            Calificada
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-700">
            Pendiente
          </span>
        );
    }
  };

  const getDaysRemaining = () => {
    const today = new Date();
    const fechaFin = tarea.fechaLimite || tarea.fechaVencimiento;
    const vencimiento = new Date(fechaFin);
    const diff = Math.ceil((vencimiento.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const daysRemaining = getDaysRemaining();
  const isDocenteView = viewMode === 'docente';

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden border border-gray-100">
      {/* Header con categoría */}
      <div 
        className="h-2"
        style={{ backgroundColor: categoria?.color || '#6B7280' }}
      />
      
      <div className="p-5">
        {/* Categoría y estado */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">{categoria?.icono || '📋'}</span>
            <span 
              className="text-xs font-medium px-2 py-1 rounded-full"
              style={{ 
                backgroundColor: `${categoria?.color}20` || '#F3F4F6',
                color: categoria?.color || '#6B7280'
              }}
            >
              {categoria?.nombre || 'Sin categoría'}
            </span>
          </div>
          {getEstadoBadge()}
        </div>

        {/* Título */}
        <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-2">
          {tarea.titulo}
        </h3>

        {/* Descripción */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {tarea.descripcion}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2 text-sm">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className={`${daysRemaining < 0 ? 'text-red-600' : daysRemaining <= 3 ? 'text-orange-600' : 'text-gray-600'}`}>
              {daysRemaining < 0 
                ? 'Vencida' 
                : daysRemaining === 0 
                  ? 'Vence hoy' 
                  : `${daysRemaining} días`}
            </span>
          </div>

          {showActions && !isDocenteView && estado !== 'calificada' && (
            <button
              onClick={() => onEntregar && onEntregar(tarea.id)}
              className="px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 transition-colors"
            >
              {estado === 'enviada' ? 'Ver entrega' : 'Entregar'}
            </button>
          )}
          
          {showActions && isDocenteView && (
            <button
              onClick={() => onVer && onVer(tarea.id)}
              className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
            >
              Ver detalles
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
