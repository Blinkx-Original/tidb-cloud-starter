import * as React from 'react';
import Header from './Header';

export interface LayoutProps {
  children: React.ReactNode;
}

export default function CommonLayout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Global Header */}
      <Header />

      {/* Page content */}
      <main className="flex-1">{children}</main>
    </div>
  );
}
