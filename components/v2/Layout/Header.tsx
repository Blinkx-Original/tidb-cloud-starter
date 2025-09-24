// components/v2/Layout/Header.tsx
'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Header() {
  const [open, setOpen] = useState(false);

  // Cerrar con ESC
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-black/10 bg-white/90 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="font-bold tracking-tight text-lg">
          BlinkX
        </Link>

        {/* Botón hamburguesa (más grande) */}
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

      {/* Backdrop transparente para cerrar al click fuera (no oscurece, no tapa el footer visualmente) */}
      {open && (
        <div
          className="fixed inset-0 z-[900]"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Menú flotante FIXED: no modifica la altura del header ni el layout */}
      {open && (
        <nav
          className="fixed top-14 right-4 z-[1000] w-64 bg-white border border-black/10 shadow-xl rounded-2xl"
          role="menu"
        >
          <ul className="flex flex-col p-2">
            <li>
              <Link
                href="/"
                className="block px-4 py-2 hover:bg-gray-100 rounded"
                onClick={() => setOpen(false)}
                role="menuitem"
              >
                Inicio
              </Link>
            </li>
            <li>
              <Link
                href="/categories"
                className="block px-4 py-2 hover:bg-gray-100 rounded"
                onClick={() => setOpen(false)}
                role="menuitem"
              >
                Categorías
              </Link>
            </li>
            <li>
              <Link
                href="/blog"
                className="block px-4 py-2 hover:bg-gray-100 rounded"
                onClick={() => setOpen(false)}
                role="menuitem"
              >
                Blog
              </Link>
            </li>
            <li>
              <Link
                href="/about"
                className="block px-4 py-2 hover:bg-gray-100 rounded"
                onClick={() => setOpen(false)}
                role="menuitem"
              >
                About
              </Link>
            </li>
            <li>
              <Link
                href="/contact"
                className="block px-4 py-2 hover:bg-gray-100 rounded"
                onClick={() => setOpen(false)}
                role="menuitem"
              >
                Contacto
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}

