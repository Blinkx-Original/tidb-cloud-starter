// components/ThemeToggle.tsx
'use client';
import * as React from 'react';

export type ThemePref = 'light' | 'dark' | 'auto';

// DaisyUI: cambia estos nombres si tu tailwind.config usa otros temas
const LIGHT_THEME = 'winter';
const DARK_THEME  = 'night';

export function applyTheme(pref: ThemePref) {
  const root = document.documentElement;

  const setTheme = (isDark: boolean) => {
    root.setAttribute('data-theme', isDark ? DARK_THEME : LIGHT_THEME);
  };

  if (pref === 'auto') {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    setTheme(mq.matches);
    const handler = (e: MediaQueryListEvent) => setTheme(e.matches);
    try { mq.addEventListener('change', handler); }
    catch { mq.addListener(handler); }
  } else {
    setTheme(pref === 'dark');
  }

  localStorage.setItem('themePref', pref);
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
    <div className="join rounded-2xl border border-base-content/20">
      <button className={`btn btn-xs join-item ${pref==='light'?'btn-active':''}`} onClick={set('light')} aria-label="Tema claro">☀️</button>
      <button className={`btn btn-xs join-item ${pref==='auto' ?'btn-active':''}`} onClick={set('auto')}  aria-label="Tema automático">A</button>
      <button className={`btn btn-xs join-item ${pref==='dark' ?'btn-active':''}`} onClick={set('dark')}  aria-label="Tema oscuro">🌙</button>
    </div>
  );
}

