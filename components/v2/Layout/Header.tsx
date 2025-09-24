// components/v2/Layout/Header.tsx
'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-black/10 bg-white/90 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="font-bold tracking-tight text-lg">
          BlinkX
        </Link>

        {/* Botón hamburguesa */}
        <button
          onClick={() => setOpen(!open)}
          aria-label="Abrir menú"
          className="relative flex flex-col justify-between w-8 h-6 cursor-pointer"
        >
          <span className="block h-1 w-full bg-black rounded"></span>
          <span className="block h-1 w-full bg-black rounded"></span>
          <span className="block h-1 w-full bg-black rounded"></span>
        </button>
      </div>

      {/* Menú flotante */}
      {open && (
        <nav className="absolute right-4 mt-2 w-56 bg-white border border-black/10 shadow-lg rounded-xl z-50">
          <ul className="flex flex-col p-2">
            <li>
              <Link
                href="/"
                className="px-4 py-2 hover:bg-gray-100 rounded"
                onClick={() => setOpen(false)}
              >
                Inicio
              </Link>
            </li>
            <li>
              <Link
                href="/categories"
                className="px-4 py-2 hover:bg-gray-100 rounded"
                onClick={() => setOpen(false)}
              >
                Categorías
              </Link>
            </li>
            <li>
              <Link
                href="/blog"
                className="px-4 py-2 hover:bg-gray-100 rounded"
                onClick={() => setOpen(false)}
              >
                Blog
              </Link>
            </li>
            <li>
              <Link
                href="/about"
                className="px-4 py-2 hover:bg-gray-100 rounded"
                onClick={() => setOpen(false)}
              >
                About
              </Link>
            </li>
            <li>
              <Link
                href="/contact"
                className="px-4 py-2 hover:bg-gray-100 rounded"
                onClick={() => setOpen(false)}
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


