// components/v2/PillBlock.tsx
import * as React from "react";
import Link from "next/link";

type Pill = {
  label: string;
  href: string; // URL clicable
  ariaLabel?: string;
  icon?: React.ReactNode;
};

type Segment = {
  textBefore?: string;
  pill: Pill;
  textAfter?: string;
};

export default function PillBlock({
  segments,
  className = "",
}: {
  segments: Segment[];
  className?: string;
}) {
  return (
    <section
      className={
        [
          // Card estilo Vercel + elevación
          "mx-4 sm:mx-auto max-w-4xl",
          "mt-12 sm:mt-16 mb-12 sm:mb-16",
          "px-6 sm:px-8 py-8 sm:py-10",
          "rounded-2xl border border-black/10 bg-white",
          "shadow-[0_8px_30px_rgba(0,0,0,0.06)]",
          className,
        ].join(" ")
      }
    >
      <div
        className={[
          "text-center flex flex-wrap items-center justify-center gap-3 sm:gap-4",
          // Tipografía H3-like (igual que el bloque de abajo)
          "text-[1.25rem] sm:text-2xl md:text-[28px]",
          "font-semibold leading-snug tracking-tight text-gray-900",
        ].join(" ")}
      >
        {segments.map((seg, i) => (
          <React.Fragment key={i}>
            {seg.textBefore ? <span className="font-semibold">{seg.textBefore}</span> : null}

            <Link
              href={seg.pill.href}
              aria-label={seg.pill.ariaLabel || seg.pill.label}
              className={[
                // Pill más grande
                "inline-flex items-center gap-2",
                "rounded-full border border-black/10 bg-white",
                "px-5 sm:px-6 py-3",
                "text-base sm:text-lg font-medium",
                "hover:shadow-md transition-shadow",
                "focus:outline-none focus:ring-2 focus:ring-black/20",
              ].join(" ")}
            >
              {seg.pill.icon ? <span className="text-[1.1em]">{seg.pill.icon}</span> : null}
              <span>{seg.pill.label}</span>
            </Link>

            {seg.textAfter ? <span className="font-semibold">{seg.textAfter}</span> : null}
          </React.Fragment>
        ))}
      </div>
    </section>
  );
}
