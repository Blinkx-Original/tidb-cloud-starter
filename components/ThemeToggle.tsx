'use client';

import { useEffect, useState } from 'react';

export type Theme = 'light' | 'dark';

export function applyTheme(theme: Theme) {
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', theme);
  }
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof document === 'undefined') return 'light';
    return (document.documentElement.getAttribute('data-theme') as Theme) || 'light';
  });

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const toggle = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'));

  return (
    <button
      type="button"
      onClick={toggle}
      className="btn btn-sm"
      aria-label="Toggle theme"
      title="Toggle theme"
    >
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  );
}

