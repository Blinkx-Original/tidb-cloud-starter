// components/v2/StickyFooterCTA.tsx
import * as React from 'react';
import NextLink from 'next/link';

type Props = {
  title: string;           // Product name or blog post title
  buttonLabel: string;     // e.g., "Go to Offer", "Request a Quote"
  href: string;            // Internal or external link
};

function LinkButton({
  href,
  className,
  ariaLabel,
  children,
}: {
  href: string;
  className?: string;
  ariaLabel?: string;
  children: React.ReactNode;
}) {
  const isExternal = /^https?:\/\//i.test(href);
  if (isExternal) {
    return (
      <a
        href={href}
        className={className}
        aria-label={ariaLabel}
        target="_blank"
        rel="noopener noreferrer nofollow"
      >
        {children}
      </a>
    );
  }
  return (
    <NextLink href={href} className={className} aria-label={ariaLabel}>
      {children}
    </NextLink>
  );
}

export default function StickyFooterCTA({ title, buttonLabel, href }: Props) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    // Espera al siguiente frame para que Tailwind pueda animar del estado inicial al final
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  if (!title || !buttonLabel || !href) return null;

  return (
    <div
      role="region"
      aria-label="Sticky call to action"
      className="fixed inset-x-0 bottom-0 z-50"
    >
      {/* Contenedor con fondo gris suave y borde sutil */}
      <div
        className={[
          "bg-gray-100 border-t border-gray-200 shadow-lg transition-all duration-500 ease-out",
          mounted ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
        ].join(" ")}
      >
        {/* Safe area para iOS */}
        <div
          className="max-w-7xl mx-auto px-3 py-3"
          style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 12px)' }}
        >
          <div className="flex items-center gap-3">
            {/* Izquierda: título (más grande) */}
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-base sm:text-lg text-black truncate">
                {title}
              </div>
            </div>

            {/* Derecha: botón (50% en móvil, auto en ≥sm) negro con texto blanco */}
            <LinkButton
              href={href}
              ariaLabel={buttonLabel}
              className="btn w-1/2 sm:w-auto shrink-0 bg-black text-white border-black hover:opacity-90"
            >
              {buttonLabel}
            </LinkButton>
          </div>
        </div>
      </div>
    </div>
  );
}

