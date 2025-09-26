'use client';
import { useEffect } from 'react';
import Header from './Header';
import Footer from './Footer';

export default function CommonLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Remove any dark class and force data-theme=light
    if (typeof document !== 'undefined') {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }, []);

  return (
    <div data-theme="light" className="min-h-screen bg-white text-black flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

