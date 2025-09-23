// components/v2/Layout/index.tsx
import * as React from 'react';
import Header from './Header';
type HeaderProps = React.ComponentProps<typeof Header>;
import Footer from '../Footer';

export interface LayoutProps {
  children: React.ReactNode;
  headerProps?: HeaderProps;
}

export default function CommonLayout({ children, headerProps }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-base-100">
      <Header {...(headerProps ?? {})} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}



