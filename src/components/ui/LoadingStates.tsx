import React from 'react';
import LoadingSpinner from './LoadingSpinner';

// Loading para tarjetas de estadísticas
export const StatsCardSkeleton = () => (
  <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm animate-pulse">
    <div className="flex items-center gap-3">
      <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
      <div className="flex-1">
        <div className="h-6 bg-gray-200 rounded w-16 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-24"></div>
      </div>
    </div>
  </div>
);

// Loading para tabla de datos
export const TableSkeleton = ({ rows = 5 }: { rows?: number }) => (
  <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
    <div className="p-4 border-b border-slate-200">
      <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
    </div>
    <div className="divide-y divide-slate-100">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="p-4 animate-pulse">
          <div className="flex items-center gap-4">
            <div className="h-4 bg-gray-200 rounded w-20"></div>
            <div className="h-4 bg-gray-200 rounded w-32"></div>
            <div className="h-4 bg-gray-200 rounded w-24"></div>
            <div className="h-4 bg-gray-200 rounded w-16 ml-auto"></div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Loading para charts
export const ChartSkeleton = () => (
  <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
    <div className="h-4 bg-gray-200 rounded w-48 mb-4 animate-pulse"></div>
    <div className="h-64 bg-gray-100 rounded-lg animate-pulse"></div>
  </div>
);

// Loading para botones de acción
export const ButtonLoading = ({ children, loading, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { children: React.ReactNode; loading?: boolean }) => (
  <button
    {...props}
    disabled={loading || props.disabled}
    className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
      loading ? 'opacity-50 cursor-not-allowed' : ''
    } ${props.className || ''}`}
  >
    {loading && <LoadingSpinner size="sm" />}
    {children}
  </button>
);

// Loading para página completa
export const PageLoading = ({ message = "Cargando..." }: { message?: string }) => (
  <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
    <LoadingSpinner size="lg" />
    <p className="text-slate-500 animate-pulse">{message}</p>
  </div>
);

// Loading para contenido específico
export const ContentLoading = ({ height = 200 }: { height?: number }) => (
  <div className="animate-pulse">
    <div 
      className="bg-gray-200 rounded-lg w-full"
      style={{ height: `${height}px` }}
    ></div>
  </div>
);

// Loading inline para texto
export const TextLoading = ({ width = "w-20", height = "h-4" }: { width?: string; height?: string }) => (
  <div className={`${width} ${height} bg-gray-200 rounded animate-pulse`}></div>
);
