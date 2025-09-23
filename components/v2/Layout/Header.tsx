// components/v2/Layout/Header.tsx
'use client';

import Link from 'next/link';
import SearchPill from '@/components/v2/SearchPill';
// Si tu ThemeToggle es export default:
import ThemeToggle from '@/components/ThemeToggle';
// Si no es default, usa: import { ThemeToggle } from '@/components/ThemeToggle';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-black/10 dark:border-white/10 bg-base-100/80 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center gap-3">
        {/* Izquierda: logo */}
        <div className="shrink-0">
          <Link href="/" className="font-bold tracking-tight text-lg">
            BlinkX
          </Link>
        </div>

        {/* Centro: buscador (siempre visible; en móvil ocupa todo el ancho disponible) */}
        <div className="flex-1 min-w-0">
          <SearchPill
            size="md"
            placeholder="Buscar productos…"
            className="w-full"
          />
        </div>

        {/* Derecha: tema + menú */}
        <div className="shrink-0 flex items-center gap-2">
          <ThemeToggle />
          <NavMenu />
        </div>
      </div>
    </header>
  );
}

function NavMenu() {
  // Menú simple con <details> para evitar JS extra y mantenerlo compatible
  return (
    <details className="dropdown dropdown-end">
      <summary
        className="btn btn-ghost btn-sm rounded-2xl px-3"
        aria-label="Abrir menú"
      >
        ☰
      </summary>
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



