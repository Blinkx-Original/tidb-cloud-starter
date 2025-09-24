// components/v2/index.tsx
'use client';

import * as React from 'react';
import Header from './Layout/Header';
import Footer from './Footer';

type Props = { children: React.ReactNode };

export default function CommonLayout({ children }: Props) {
  return (
    <div className="min-h-screen flex flex-col bg-white text-black isolate">
      <Header />
      <main className="flex-1">{children}</main>
      {/* Footer original con enlaces legales, social, etc. */}
      <Footer />
    </div>
  );
}

