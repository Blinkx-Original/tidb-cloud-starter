// components/v2/SearchHero.tsx
import * as React from 'react';
import SearchPill from '@/components/v2/SearchPill';

type Props = {
  title?: string;
  subtitle?: string;
  className?: string;
  autoFocus?: boolean; // normalmente false fuera del homepage
};

export default function SearchHero({
  title = 'Busca en el catálogo',
  subtitle = 'Escribe y te sugerimos productos al instante',
  className = '',
  autoFocus = false,
}: Props) {
  return (
    <section className={`border-b border-base-300 bg-base-200/50 dark:bg-base-200/20 ${className}`}>
      <div className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
        {(title || subtitle) && (
          <header className="mb-3">
            {title && <h2 className="text-xl sm:text-2xl font-semibold">{title}</h2>}
            {subtitle && <p className="text-sm opacity-80">{subtitle}</p>}
          </header>
        )}
        <SearchPill
          size="lg"
          placeholder="Buscar por nombre, categoría o descripción…"
          autoFocus={autoFocus}
        />
      </div>
    </section>
  );
}
