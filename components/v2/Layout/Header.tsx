// components/v2/Layout/Header.tsx
import * as React from "react";
import Link from "next/link";

export default function Header() {
  return (
    <header className="w-full bg-black text-white border-b border-white">
      <div className="mx-auto max-w-7xl px-4">
        <div className="navbar min-h-[64px] px-0">
          {/* Izquierda: Hamburguesa */}
          <div className="navbar-start">
            <div className="dropdown">
              <label
                tabIndex={0}
                className="btn btn-ghost btn-circle text-white"
                aria-label="Abrir menú"
              >
                {/* Ícono hamburguesa blanco */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </label>
              {/* Menú: fondo negro, texto blanco, borde blanco */}
              <ul
                tabIndex={0}
                className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow rounded-2xl bg-black text-white border border-white w-56"
              >
                <li><Link href="/">Inicio</Link></li>
                <li><Link href="/categories">Categorías</Link></li>
                <li><Link href="/blog">Blog</Link></li>
                <li><Link href="/about">About</Link></li>
                <li><Link href="/contact">Contacto</Link></li>
              </ul>
            </div>
          </div>

          {/* Centro: Título */}
          <div className="navbar-center">
            <Link href="/" className="font-semibold text-lg tracking-tight">
              BlinkX
            </Link>
          </div>

          {/* Derecha: Acciones (opcional) */}
          <div className="navbar-end gap-3">
            {/* Pastilla “Categories” de ejemplo, mantiene estilo minimal */}
            <Link
              href="/categories"
              className="px-3 py-1 rounded-full border border-white hover:opacity-90"
            >
              Categorías
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

