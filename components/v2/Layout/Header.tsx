// components/v2/Layout/Header.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import NavOverlay from './NavOverlay';

export default function Header() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <>
      <header
        id="site-header"
        className="sticky top-0 z-50 border-b border-black/10 bg-white/90 backdrop-blur"
      >
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2" aria-label="Ir al inicio">
            <Image
              src="/brand/blinkx.webp"
              alt="BlinkX"
              width={110}
              height={28}
              priority
              className="h-7 w-auto sm:h-8"
            />
          </Link>

          {/* Botón hamburguesa (más visible) */}
          <button
            onClick={() => setOpen((v) => !v)}
            aria-haspopup="menu"
            aria-expanded={open}
            aria-label="Abrir menú"
            className="relative flex flex-col justify-between w-9 h-8 cursor-pointer select-none"
          >
            <span className="block h-1.5 w-full bg-black rounded"></span>
            <span className="block h-1.5 w-full bg-black rounded"></span>
            <span className="block h-1.5 w-full bg-black rounded"></span>
          </button>
        </div>
      </header>

      {/* Overlay del menú */}
      <NavOverlay open={open} onClose={() => setOpen(false)} anchorId="site-header" />
    </>
  );
}


