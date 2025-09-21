// components/v2/SearchPill.tsx
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import clsx from 'clsx';

type Props = {
  size?: 'sm' | 'md' | 'lg';
  placeholder?: string;
  defaultQuery?: string;
  autoFocus?: boolean;
  className?: string;
};

export default function SearchPill({
  size = 'md',
  placeholder = 'Buscar productos…',
  defaultQuery = '',
  autoFocus = false,
  className,
}: Props) {
  const router = useRouter();
  const [q, setQ] = useState(defaultQuery);
  const inputRef = useRef<HTMLInputElement>(null);

  // Cmd/Ctrl+K to focus
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().includes('MAC');
      if ((isMac && e.metaKey && e.key.toLowerCase() === 'k') || (!isMac && e.ctrlKey && e.key.toLowerCase() === 'k')) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const heights = { sm: 'h-10', md: 'h-12', lg: 'h-14' };
  const textSizes = { sm: 'text-sm', md: 'text-base', lg: 'text-lg' };
  const paddings = { sm: 'px-4', md: 'px-5', lg: 'px-6' };

  function submit() {
    const term = (q || '').trim();
    router.push(term ? `/search?q=${encodeURIComponent(term)}` : '/search');
  }

  return (
    <div
      className={clsx(
        'relative w-full max-w-2xl',
        className
      )}
      role="search"
      aria-label="Buscar productos"
    >
      <div
        className={clsx(
          'flex items-center gap-3 rounded-full border border-neutral-200 bg-white shadow-sm hover:shadow transition',
          heights[size],
          paddings[size]
        )}
      >
        <svg
          aria-hidden
          width="20"
          height="20"
          viewBox="0 0 24 24"
          className="text-neutral-500"
        >
          <path fill="currentColor" d="M15.5 14h-.79l-.28-.27a6.471 6.471 0 0 0 1.57-4.23A6.5 6.5 0 1 0 9.5 16a6.471 6.471 0 0 0 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5Zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14Z"/>
        </svg>
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          placeholder={placeholder}
          className={clsx(
            'flex-1 bg-transparent outline-none placeholder-neutral-400',
            textSizes[size]
          )}
          autoFocus={autoFocus}
        />
        <kbd className="hidden sm:flex items-center gap-1 text-[11px] text-neutral-500 border border-neutral-200 px-2 py-1 rounded-md">
          <span className="hidden md:inline">⌘</span>
          <span className="md:hidden">Ctrl</span> K
        </kbd>
        <button
          onClick={submit}
          className={clsx(
            'rounded-full bg-black text-white px-4 py-2 hover:opacity-90',
            textSizes.sm
          )}
          aria-label="Buscar"
        >
          Buscar
        </button>
      </div>
    </div>
  );
}
