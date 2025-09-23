'use client';

import { useEffect, useState } from 'react';

export type Theme = 'light' | 'dark' | 'auto';

function systemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

export function applyTheme(theme: Theme) {
  const resolved = theme === 'auto' ? systemTheme() : theme;
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', resolved);
  }
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof document === 'undefined') return 'light';
    // si ya hay data-theme, úsalo como punto de partida
    const current = document.documentElement.getAttribute('data-theme') as 'light' | 'dark' | null;
    return current ?? 'auto';
  });

  useEffect(() => {
    applyTheme(theme);
    try {
      localStorage.setItem('themePref', theme);
    } catch {}
  }, [theme]);

  const cycle = () =>
    setTheme((t) => (t === 'light' ? 'dark' : t === 'dark' ? 'auto' : 'light'));

  return (
    <button
      type="button"
      onClick={cycle}
      className="btn btn-sm"
      aria-label="Toggle theme"
      title={`Theme: ${theme}`}
    >
      {theme === 'light' ? '🌙' : theme === 'dark' ? '☀️' : '🖥️'}
    </button>
  );
}
