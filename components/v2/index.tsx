// components/v2/index.tsx
'use client';

import * as React from 'react';
import Header from './Layout/Header';

type Props = { children: React.ReactNode };

export default function CommonLayout({ children }: Props) {
  return (
    <>
      <Header />
      <main className="min-h-[50vh]">{children}</main>
      <footer className="border-top border-black/10 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-6 text-sm opacity-70">
          © {new Date().getFullYear()} Blinkx
        </div>
      </footer>
    </>
  );
}
