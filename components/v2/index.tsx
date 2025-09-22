// components/v2/index.tsx
import * as React from "react";
import Header from "./Layout/Header";
import Footer from "../v2/Footer";
import ThemeToggle, { applyTheme } from "../ThemeToggle";

type Props = { children: React.ReactNode };

function bootThemeOnce() {
  try {
    const saved = (localStorage.getItem("themePref") as "light" | "dark" | "auto") || "auto";
    applyTheme(saved);
  } catch {}
}

export default function CommonLayout({ children }: Props) {
  React.useEffect(() => {
    bootThemeOnce();
    // Responder a cambios (por ejemplo, desde otra pestaña)
    const onStorage = (e: StorageEvent) => {
      if (e.key === "themePref" && e.newValue) applyTheme(e.newValue as any);
    };
    const onCustom = () => {
      try {
        const saved = (localStorage.getItem("themePref") as any) || "auto";
        applyTheme(saved);
      } catch {}
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener("theme-change", onCustom as any);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("theme-change", onCustom as any);
    };
  }, []);

  return (
    <div className="min-h-screen bg-white text-black dark:bg-black dark:text-white">
      <Header />
      {/* Contenido */}
      <div>{children}</div>
      <Footer />
    </div>
  );
}

