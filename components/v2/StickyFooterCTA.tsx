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
        rel="noopener nofollow"
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
  if (!title || !buttonLabel || !href) return null;

  return (
    <div
      role="region"
      aria-label="Sticky call to action"
      className="fixed inset-x-0 bottom-0 z-50"
    >
      {/* Bar container */}
      <div className="bg-white border-t shadow-lg">
        {/* Safe area for iOS bottom insets */}
        <div
          className="max-w-7xl mx-auto px-3 py-3"
          style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 12px)' }}
        >
          <div className="flex items-center gap-3">
            {/* Left: title (takes remaining space) */}
            <div className="flex-1 min-w-0">
              <div className="font-semibold truncate">{title}</div>
            </div>
            {/* Right: button (50% width on mobile, auto on ≥sm) */}
            <LinkButton
              href={href}
              ariaLabel={buttonLabel}
              className="btn w-1/2 sm:w-auto shrink-0"
            >
              {buttonLabel}
            </LinkButton>
          </div>
        </div>
      </div>
    </div>
  );
}
