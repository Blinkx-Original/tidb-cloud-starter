// components/v2/index.tsx
import * as React from "react";
import Header from "./Layout/Header";
import Footer from "../v2/Footer";

type Props = {
  children: React.ReactNode;
};

export default function CommonLayout({ children }: Props) {
  return (
    <div className="bg-black text-white min-h-screen">
      <Header />
      {/* Contenido */}
      <div>{children}</div>
      <Footer />
    </div>
  );
}
