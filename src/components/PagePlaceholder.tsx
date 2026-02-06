import { useEffect } from 'react';

export default function PagePlaceholder({ title, description }: { title?: string; description?: string }) {
  useEffect(() => { document.title = title ? `${title} - Cátedra de Familia` : 'Cátedra de Familia'; }, [title]);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="bg-white rounded-2xl p-8 shadow">
        <h1 className="text-2xl font-bold">{title || 'Página'}</h1>
        {description && <p className="text-sm text-slate-600 mt-2">{description}</p>}
        <div className="mt-6 text-sm text-slate-500">Esta es una vista provisional para desarrollo; reemplázala por la implementación real cuando esté disponible.</div>
      </div>
    </div>
  );
}
