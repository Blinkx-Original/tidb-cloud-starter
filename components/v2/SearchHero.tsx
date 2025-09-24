// components/v2/SearchHero.tsx
import * as React from 'react';
import SearchInline from '@/components/SearchInline';

type Props = {
  title?: string;
  subtitle?: string;
  className?: string;
  variant?: 'compact' | 'full';
  /**
   * Compatibilidad hacia atrás: aceptamos autoFocus aunque
   * SearchInline no lo use. Así no rompe llamadas existentes
   * como <SearchHero autoFocus={false} />.
   */
  autoFocus?: boolean;
};

export default function SearchHero({
  title = 'Busca en todo el catálogo',
  subtitle = 'Empieza a escribir y te sugerimos productos al instante.',
  className = '',
  variant = 'compact',
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  autoFocus = false,
}: Props) {
  const showHeader = variant === 'full' && (title || subtitle);

  return (
    <section className={`border-b border-base-300 bg-base-200/50 dark:bg-base-200/30 ${className}`}>
      <div className={`mx-auto max-w-6xl px-4 ${variant === 'compact' ? 'py-3 sm:py-4' : 'py-6 sm:py-8'}`}>
        {showHeader && (
          <header className="mb-2">
            {title && <h2 className="text-xl sm:text-2xl font-semibold">{title}</h2>}
            {subtitle && <p className="text-sm opacity-80">{subtitle}</p>}
          </header>
        )}

        {/* centrado y angosto en desktop; full en mobile */}
        <div className="mx-auto w-full sm:w-4/5 md:w-2/3 lg:w-1/2">
          <SearchInline
            placeholder="Buscar por nombre, categoría o descripción…"
            className="w-full"
          />
        </div>
      </div>
    </section>
  );
}


