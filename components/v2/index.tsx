// components/v2/index.tsx
'use client';

import * as React from 'react';
import Header from './Layout/Header';

type Props = { children: React.ReactNode };

export default function CommonLayout({ children }: Props) {
  return (
    <div className="min-h-screen flex flex-col bg-white text-black isolate">
      <Header />

      {/* El contenido crece y empuja el footer hacia abajo */}
      <main className="flex-1">{children}</main>

      {/* Footer SIEMPRE visible */}
      <footer
        className="relative z-10 border-t border-black/10 bg-white"
        role="contentinfo"
      >
        <div className="mx-auto max-w-6xl px-4 py-6 text-sm opacity-70">
          © {new Date().getFullYear()} BlinkX
        </div>
      </footer>
    </div>
  );
}
