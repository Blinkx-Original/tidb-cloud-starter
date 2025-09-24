// components/v2/Layout/Header.tsx
'use client';

import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-base-content/10 bg-base-100/80 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between gap-3">
        {/* Izquierda: logo */}
        <Link href="/" className="font-bold tracking-tight text-lg">BlinkX</Link>

        {/* Derecha: toggle de tema + menú */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <NavMenu />
        </div>
      </div>
    </header>
  );
}

function NavMenu() {
  return (
    <details className="dropdown dropdown-end">
      <summary className="btn btn-ghost btn-sm rounded-2xl px-3" aria-label="Abrir menú">☰</summary>
      <ul className="menu dropdown-content mt-2 p-2 shadow bg-base-100 rounded-box w-56">
        <li><Link href="/">Inicio</Link></li>
        <li><Link href="/categories">Categorías</Link></li>
        <li><Link href="/blog">Blog</Link></li>
        <li><Link href="/about">About</Link></li>
        <li><Link href="/contact">Contacto</Link></li>
      </ul>
    </details>
  );
}


