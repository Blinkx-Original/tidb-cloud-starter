// components/v2/PillLinks.tsx
import Link from "next/link";
import * as React from "react";

export type PillItem = {
  label: string;
  href: string;          // ← URL clicable
  ariaLabel?: string;
  icon?: React.ReactNode; // opcional: emoji o SVG inline
};

export default function PillLinks({
  items,
  className = "",
}: {
  items: PillItem[];
  className?: string;
}) {
  return (
    <div
      className={
        "flex flex-wrap items-center justify-center gap-3 sm:gap-4 " + className
      }
    >
      {items.map((it, i) => (
        <Link
          key={i}
          href={it.href}
          aria-label={it.ariaLabel || it.label}
          className="group inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-sm sm:text-base hover:shadow-md transition-shadow focus:outline-none focus:ring-2 focus:ring-accent-ring"
        >
          {/* Icono opcional (emoji o SVG) */}
          {it.icon ? <span className="text-[1.05em]">{it.icon}</span> : null}
          <span className="font-medium">{it.label}</span>
        </Link>
      ))}
    </div>
  );
}
