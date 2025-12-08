interface CalificacionBadgeProps {
  calificacion: number | string;
  tipo?: 'numerica' | 'cualitativa';
  size?: 'sm' | 'md' | 'lg';
}

export default function CalificacionBadge({ calificacion, tipo = 'numerica', size = 'md' }: CalificacionBadgeProps) {
  const getColor = () => {
    if (tipo === 'cualitativa') {
      switch (calificacion) {
        case 'superior':
          return 'bg-green-100 text-green-700 border-green-200';
        case 'alto':
          return 'bg-blue-100 text-blue-700 border-blue-200';
        case 'basico':
          return 'bg-yellow-100 text-yellow-700 border-yellow-200';
        case 'bajo':
          return 'bg-red-100 text-red-700 border-red-200';
        default:
          return 'bg-gray-100 text-gray-700 border-gray-200';
      }
    }

    // Numérica
    const nota = typeof calificacion === 'number' ? calificacion : parseFloat(calificacion);
    if (nota >= 4.5) return 'bg-green-100 text-green-700 border-green-200';
    if (nota >= 4.0) return 'bg-blue-100 text-blue-700 border-blue-200';
    if (nota >= 3.0) return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    return 'bg-red-100 text-red-700 border-red-200';
  };

  const getLabel = () => {
    if (tipo === 'cualitativa') {
      switch (calificacion) {
        case 'superior':
          return 'Superior';
        case 'alto':
          return 'Alto';
        case 'basico':
          return 'Básico';
        case 'bajo':
          return 'Bajo';
        default:
          return calificacion;
      }
    }
    return calificacion;
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  return (
    <span className={`inline-flex items-center font-bold rounded-full border ${getColor()} ${sizeClasses[size]}`}>
      {getLabel()}
    </span>
  );
}
