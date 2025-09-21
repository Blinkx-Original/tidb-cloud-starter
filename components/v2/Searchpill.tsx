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

export default function SearchPill({
  size = 'md',
  placeholder = 'Buscar productos…',
  defaultQuery = '',
  autoFocus = false,
  className = '',
}: Props) {
  const router = useRouter();
  const [q, setQ] = useState(defaultQuery);
  const inputRef = useRef<HTMLInputElement>(null);

  // Cmd/Ctrl + K → enfocar input
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const k = e.key?.toLowerCase();
      if ((e.metaKey && k === 'k') || (e.ctrlKey && k === 'k')) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const heights = { sm: 'h-10', md: 'h-12', lg: 'h-14' }[size];
  const text = { sm: 'text-sm', md: 'text-base', lg: 'text-lg' }[size];
  const pad = { sm: 'px-4', md: 'px-5', lg: 'px-6' }[size];

  const submit = () => {
    const term = (q || '').trim();
    router.push(term ? `/search?q=${encodeURIComponent(term)}` : '/search');
  };

  return (
    <div role="search" aria-label="Buscar productos" className={`relative w-full max-w-2xl ${className}`}>
      <div className={`flex items-center gap-3 rounded-full border border-neutral-200 bg-white shadow-sm hover:shadow transition ${heights} ${pad}`}>
        <svg aria-hidden width="20" height="20" viewBox="0 0 24 24" className="text-neutral-500">
          <path
            fill="currentColor"
            d="M15.5 14h-.79l-.28-.27a6.471 6.471 0 0 0 1.57-4.23A6.5 6.5 0 1 0 9.5 16a6.471 6.471 0 0 0 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5Zm-6 0C7.01

