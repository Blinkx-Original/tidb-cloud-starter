// components/v2/Header.tsx
import React from 'react';
import Link from 'next/link';
import InlineSearch from './InlineSearch';

type HeaderProps = {
  /** opcional: ocultar buscador en home si ya tienes el grande */
  hideInlineSearchOnHome?: boolean;
};

export default function Header({ hideInlineSearchOnHome }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-base-100/80 backdrop-blur border-b border-base-300">
      <div className="mx-auto max-w-6xl px-4 h-14 flex items-center gap-3">
        {/* Izquierda: logo */}
        <div className="w-[120px] shrink-0">
          <Link href="/" className="font-bold text-lg">BlinkX</Link>
        </div>

        {/* Centro: búsqueda inline (siempre visible) */}
        <div className="flex-1 hidden sm:block">
          <InlineSearch />
        </div>

        {/* Derecha: controles (tema + menú) */}
        <div className="w-[120px] shrink-0 flex items-center justify-end gap-2">
          {/* Toggle tema – tus botones existentes */}
          <div className="join hidden sm:flex">
            <button
              className="btn btn-xs join-item"
              onClick={() => {
                localStorage.setItem('themePref', 'light');
                document.documentElement.setAttribute('data-theme', 'winter');
              }}
              title="Día"
            >
              ☀️
            </button>
            <button
              className="btn btn-xs join-item"
              onClick={() => {
                localStorage.setItem('themePref', 'auto');
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                document.documentElement.setAttribute('data-theme', prefersDark ? 'night' : 'winter');
              }}
              title="Auto"
            >
              🌓
            </button>
            <button
              className="btn btn-xs join-item"
              onClick={() => {
                localStorage.setItem('themePref', 'dark');
                document.documentElement.setAttribute('data-theme', 'night');
              }}
              title="Noche"
            >
              🌙
            </button>
          </div>

          {/* Menú hamburguesa o enlace a categorías */}
          <Link href="/categories" className="btn btn-ghost btn-sm">Categorías</Link>
        </div>
      </div>

      {/* Buscador visible también en mobile (debajo de la barra) */}
      <div className="sm:hidden px-4 pb-3">
        <InlineSearch />
      </div>
    </header>
  );
}
