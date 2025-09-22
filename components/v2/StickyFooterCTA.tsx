// components/v2/StickyFooterCTA.tsx
import Link from 'next/link';

export type StickyFooterCTAProps = {
  title: string;
  buttonLabel: string;
  buttonHref: string;
  backgroundClass?: string; // <-- add this
};

export default function StickyFooterCTA({
  title,
  buttonLabel,
  buttonHref,
  backgroundClass = 'bg-gray-100', // <-- default if not provided
}: StickyFooterCTAProps) {
  return (
    <div
      className={`fixed bottom-0 left-0 right-0 border-t ${backgroundClass} animate-slide-up-fade-in`}
    >
      <div className="max-w-5xl mx-auto flex items-center justify-between p-3 sm:p-4">
        <div className="truncate text-base sm:text-lg font-medium">{title}</div>
        <Link
          href={buttonHref}
          className="btn w-1/2 sm:w-auto rounded-2xl bg-black text-white border-black hover:opacity-90"
        >
          {buttonLabel}
        </Link>
      </div>
    </div>
  );
}
