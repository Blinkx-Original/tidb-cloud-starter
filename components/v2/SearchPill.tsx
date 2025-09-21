// components/v2/SearchPill.tsx
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';

type Props = {
  size?: 'sm' | 'md' | 'lg';
  placeholder?: string;
  defaultQuery?: string;
  autoFocus?: boolean;
  className?: string;
};

function sizeClasses(size: 'sm' | 'md' | 'lg') {
  if (size === 'sm') return { h: 'h-10', text: 'text-sm', pad: 'px-4' };
  if (size === 'lg') return { h: 'h-14', text: 'text-lg', pad: 'px-6' };
  return { h: 'h-12', text: 'text-base', pad: 'px-5' }; // md
}

export default function SearchPill({
  size = 'md',
  placeholder = 'Buscar productos...',
  defaultQuery = '',
  autoFocus = false,
  className = '',
}: Props) {
  const router = useRouter();
  const [q, setQ] = useState(defaultQuery);
  const inputRef = useRef<HTMLInputElement>(null);

  // Cmd/Ctrl + K -> focus
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const k = (e.key || '').toLowerCase();
      if ((e.metaKey && k === 'k') || (e.ctrlKey && k === 'k')) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const { h, text, pad } = sizeClasses(size);

  const submit = () => {
    const term = (q || '').trim();
    router.push(term ? `/search?q=${encodeURIComponent(term)}` : '/search');
  };

  return (
    <div
      role="search"
      aria-label="Buscar productos"
      className={['relative w-full max-w-2xl', className].filter(Boolean).join(' ')}
    >
      <div
        className={[
          'flex items-center gap-3 rounded-full border border-neutral-200',
          'bg-white shadow-sm hover:shadow transition',
          h,
          pad,
        ].join(' ')}
      >
        <svg aria-hidden width="20" height="20" viewBox="0 0 24 24" className="text-neutral-500">
          <path
            fill="currentColor"
            d="M15.5 14h-.79l-.28-.27a6.471 6.471 0 0 0 1.57-4.23A6.5 6.5 0 1 0 9.5 16a6.471 6.471 0 0 0 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5Zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14Z"
          />
        </svg>

        <input
          ref={inputRef}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          placeholder={placeholder}
          className={['flex-1 bg-transparent outline-none placeholder-neutral-400', text].join(' ')}
          autoFocus={autoFocus}
        />

        <kbd className="hidden sm:flex items-center gap-1 text-[11px] text-neutral-500 border border-neutral-200 px-2 py-1 rounded-md">
          ⌘/Ctrl K
        </kbd>

        <button
          onClick={submit}
          className={['rounded-full bg-black text-white px-4 py-2 hover:opacity-90', 'text-sm'].join(' ')}
          aria-label="Buscar"
        >
          Buscar
        </button>
      </div>
    </div>
  );
}

