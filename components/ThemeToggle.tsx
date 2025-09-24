// components/ThemeToggle.tsx
'use client';
import * as React from 'react';

export type ThemePref = 'light' | 'dark' | 'auto';

// DaisyUI themes
const LIGHT_THEME = 'winter';
const DARK_THEME  = 'night';

export function applyTheme(pref: ThemePref) {
  const root = document.documentElement;

  const apply = (isDark: boolean) => {
    // 1) DaisyUI
    root.setAttribute('data-theme', isDark ? DARK_THEME : LIGHT_THEME);
    // 2) Tailwind "dark:"
    root.classList.toggle('dark', isDark);
  };

  if (pref === 'auto') {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    apply(mq.matches);
    const handler = (e: MediaQueryListEvent) => apply(e.matches);
    try { mq.addEventListener('change', handler); }
    catch { (mq as any).addListener(handler); }
  } else {
    apply(pref === 'dark');
  }

  localStorage.setItem('themePref', pref);
  // Útil si tienes listeners (opcional)
  window.dispatchEvent(new CustomEvent('theme-change', { detail: pref }));
}

export default function ThemeToggle() {
  const [pref, setPref] = React.useState<ThemePref>('auto');

  React.useEffect(() => {
    const saved = (localStorage.getItem('themePref') as ThemePref) || 'auto';
    setPref(saved);
    applyTheme(saved);
  }, []);

  const set = (p: ThemePref) => () => { setPref(p); applyTheme(p); };

  return (
    <div className="join rounded-xl">
      <button
        className={`btn btn-ghost btn-xs join-item ${pref==='light' ? 'bg-base-200' : ''}`}
        onClick={set('light')}
        aria-label="Light mode"
      >
        ☀️
      </button>
      <button
        className={`btn btn-ghost btn-xs join-item ${pref==='auto' ? 'bg-base-200' : ''}`}
        onClick={set('auto')}
        aria-label="Auto mode"
      >
        A
      </button>
      <button
        className={`btn btn-ghost btn-xs join-item ${pref==='dark' ? 'bg-base-200' : ''}`}
        onClick={set('dark')}
        aria-label="Dark mode"
      >
        🌙
      </button>
    </div>
  );
}


