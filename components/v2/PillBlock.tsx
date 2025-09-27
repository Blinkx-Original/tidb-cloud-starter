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
        "mx-auto max-w-4xl mt-10 mb-12 px-6 py-8 rounded-2xl border border-black/10 bg-white " +
        className
      }
    >
      <div className="text-center text-lg sm:text-xl leading-relaxed flex flex-wrap items-center justify-center gap-3 sm:gap-4">
        {segments.map((seg, i) => (
          <React.Fragment key={i}>
            {seg.textBefore ? (
              <span className="font-semibold">{seg.textBefore}</span>
            ) : null}

            <Link
              href={seg.pill.href}
              aria-label={seg.pill.ariaLabel || seg.pill.label}
              className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-sm sm:text-base hover:shadow-md transition-shadow focus:outline-none focus:ring-2 focus:ring-accent-ring"
            >
              {seg.pill.icon ? (
                <span className="text-[1.05em]">{seg.pill.icon}</span>
              ) : null}
              <span className="font-medium">{seg.pill.label}</span>
            </Link>

            {seg.textAfter ? (
              <span className="font-semibold">{seg.textAfter}</span>
            ) : null}
          </React.Fragment>
        ))}
      </div>
    </section>
  );
}
