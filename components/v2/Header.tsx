// components/v2/Header.tsx
import Link from 'next/link';
import React from 'react';
import InlineSearch from './InlineSearch';

function ThemeToggle() {
  // Simple: respeta data-theme y guarda en localStorage
  const [theme, setTheme] = React.useState<'light' | 'dark' | 'auto'>('auto');

  React.useEffect(() => {
    const saved = (localStorage.getItem('themePref') as typeof theme) || 'auto';
    setTheme(saved);
  }, []);
  React.useEffect(() => {
    localStorage.setItem('themePref', theme);
    if (theme === 'auto') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', theme);
    }
  }, [theme]);

  const Btn = ({
    val,
    label,
  }: {
    val: 'light' | 'dark' | 'auto';
    label: string;
  }) => (
    <button
      onClick={() => setTheme(val)}
      className={`text-xs px-2 py-1 rounded-full border ${
        theme === val ? 'bg-base-200' : ''
      }`}
      aria-pressed={theme === val}
    >
      {label}
    </button>
  );

  return (
    <div className="flex gap-2 items-center">
      <Btn val="light" label="Día" />
      <Btn val="auto" label="Auto" />
      <Btn val="dark" label="Noche" />
    </div>
  );
}

export default function Header() {
  return (
    <header className="sticky top-0 z-40 bg-base-100/80 backdrop-blur border-b border-base-200">
      <div className="mx-auto max-w-6xl px-4 h-14 flex items-center gap-3">
        {/* Izquierda: logo */}
        <div className="shrink-0">
          <Link href="/" className="font-semibold">BlinkX</Link>
        </div>

        {/* Centro: inline search SIEMPRE visible */}
        <div className="flex-1 min-w-0">
          <InlineSearch className="max-w-2xl mx-auto" placeholder="Buscar en catálogo…" />
        </div>

        {/* Derecha: toggles / menú */}
        <div className="shrink-0 flex items-center gap-3">
          <ThemeToggle />
          <Link
            href="/categories"
            className="hidden sm:inline-block text-sm px-3 py-1 rounded-full border hover:bg-base-200"
          >
            Categorías
          </Link>
        </div>
      </div>
    </header>
  );
}

