import * as React from 'react';
import Header, { HeaderProps } from './Header';

export interface LayoutProps {
  children: React.ReactNode;
  headerProps?: HeaderProps; // <-- ahora el layout acepta props para el header
}

export default function CommonLayout({ children, headerProps }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Global Header en todas las páginas */}
      <Header {...(headerProps || {})} />

      {/* Contenido de la página */}
      <main className="flex-1">{children}</main>
    </div>
  );
}
