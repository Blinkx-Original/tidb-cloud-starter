// components/v2/Layout/Header.tsx
import * as React from "react";
import Link from "next/link";

export default function Header() {
  return (
    <header className="w-full bg-white text-black border-b border-black dark:bg-black dark:text-white dark:border-white">
      <div className="mx-auto max-w-7xl px-4">
        <div className="navbar min-h-[64px] px-0">
          {/* Izquierda: Hamburguesa */}
          <div className="navbar-start">
            <div className="dropdown">
              <label
                tabIndex={0}
                className="btn btn-ghost btn-circle"
                aria-label="Abrir menú"
              >
                {/* Ícono hamburguesa usa currentColor → negro en día / blanco en noche */}
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

              {/* Menú: fondo y bordes según tema */}
              <ul
                tabIndex={0}
                className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow rounded-2xl w-56
                           bg-white text-black border border-black
                           dark:bg-black dark:text-white dark:border-white"
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

          {/* Derecha: Atajo a categorías */}
          <div className="navbar-end gap-3">
            <Link
              href="/categories"
              className="px-3 py-1 rounded-full border border-black hover:opacity-90
                         dark:border-white"
            >
              Categorías
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

