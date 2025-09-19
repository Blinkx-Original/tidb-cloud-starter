import * as React from 'react';
import Header, { HeaderProps } from './Header';
import Footer from '../Footer';

export interface LayoutProps {
  children: React.ReactNode;
  headerProps?: HeaderProps;
}

export default function CommonLayout({ children, headerProps }: LayoutProps) {
  return (
    // ⬇️ padding-bottom en el wrapper, no margen en main
    <div className="min-h-screen flex flex-col pb-10">
      <Header {...(headerProps || {})} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
