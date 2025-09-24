// components/v2/SearchHero.tsx
import * as React from 'react';
import SearchInline from '@/components/SearchInline';

type Props = {
  title?: string;
  subtitle?: string;
  className?: string;
  autoFocus?: boolean; // si luego quieres enfocar en la home, úsalo en SearchInline
};

export default function SearchHero({
  title = 'Busca en todo el catálogo',
  subtitle = 'Empieza a escribir y te sugerimos productos al instante.',
  className = '',
}: Props) {
  return (
    <section className={`border-b border-base-300 bg-base-200/50 dark:bg-base-200/30 ${className}`}>
      <div className="mx-auto max-w-6xl px-4 py-4 sm:py-5">
        {(title || subtitle) && (
          <header className="mb-2">
            {title && <h2 className="text-xl sm:text-2xl font-semibold">{title}</h2>}
            {subtitle && <p className="text-sm opacity-80">{subtitle}</p>}
          </header>
        )}

        {/* Buscador con autocompletado (Algolia) */}
        <SearchInline
          placeholder="Buscar por nombre, categoría o descripción…"
          className="w-full"
        />
      </div>
    </section>
  );
}
