// components/v2/StickyFooterCTA.tsx
import * as React from 'react';
import Link from 'next/link';

export type StickyFooterCTAProps = {
  title: string;
  buttonLabel: string;
  buttonHref: string;
  className?: string;
};

export default function StickyFooterCTA({
  title,
  buttonLabel,
  buttonHref,
  className = '',
}: StickyFooterCTAProps) {
  const [show, setShow] = React.useState(false);

  React.useEffect(() => {
    // Dispara animación en cliente
    const id = requestAnimationFrame(() => setShow(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div
      role="region"
      aria-label="Acción rápida"
      className={[
        'fixed inset-x-0 bottom-0 z-50',
        'bg-gray-100/95 backdrop-blur border-t border-neutral-200',
        'shadow-[0_-4px_12px_rgba(0,0,0,0.06)]',
        'transition-all duration-300 will-change-transform',
        show ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0',
        'safe-area-inset-b', // iOS bottom
        className,
      ].join(' ')}
    >
      <div className="mx-auto max-w-6xl px-4 py-3 sm:py-4">
        <div className="flex items-center gap-3">
          {/* Título ocupa 50% en móvil, truncado */}
          <div className="flex-1 min-w-0 sm:min-w-[60%]">
            <p className="text-base sm:text-lg font-medium truncate">{title}</p>
          </div>

          {/* Botón ocupa ~50% en móvil */}
          <div className="w-1/2 sm:w-auto flex justify-end">
            <Link
              href={buttonHref}
              className="inline-flex items-center justify-center rounded-2xl border border-black bg-black text-white px-4 py-2 sm:px-5 sm:py-2.5 text-sm sm:text-base hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-black"
            >
              {buttonLabel}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
