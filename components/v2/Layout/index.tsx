// components/v2/Layout/index.tsx
import * as React from 'react';
import Header from './Header';
import Footer from '../Footer';

export interface LayoutProps {
  children: React.ReactNode;
}

export default function CommonLayout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-white text-black">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
