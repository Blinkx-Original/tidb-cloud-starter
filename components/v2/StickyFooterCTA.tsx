// components/v2/StickyFooterCTA.tsx
import Link from 'next/link';

export type StickyFooterCTAProps = {
  title: string;
  buttonLabel: string;
  buttonHref: string;
  backgroundClass?: string;
};

export default function StickyFooterCTA({
  title,
  buttonLabel,
  buttonHref,
  backgroundClass = 'bg-gray-100',
}: StickyFooterCTAProps) {
  return (
    <div
      className={`fixed bottom-0 left-0 right-0 border-t ${backgroundClass} animate-slide-up-fade-in`}
      role="region"
      aria-label="Sticky call to action"
    >
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-3 p-3 sm:p-4">
        {/* Título: más grande y truncado */}
        <div className="flex-1 min-w-0">
          <div className="truncate text-lg sm:text-xl font-medium leading-tight">
            {title}
          </div>
        </div>

        {/* Botón único: azul eléctrico (accent) + pastilla grande */}
        <Link
          href={buttonHref}
          className="inline-flex items-center justify-center
                     rounded-2xl min-w-[10rem]
                     px-5 sm:px-6 py-3 sm:py-3.5
                     bg-accent text-white hover:bg-accent-hover
                     shadow-accent-glow focus:outline-none focus:ring-2 focus:ring-accent-ring
                     transition-colors text-base sm:text-lg font-semibold"
        >
          {buttonLabel}
        </Link>
      </div>
    </div>
  );
}
