// components/v2/index.tsx
import * as React from "react";
import Header from "./Layout/Header";
import Footer from "../v2/Footer";

type Props = {
  children: React.ReactNode;
};

function applyAutoDarkByTime() {
  try {
    const hour = new Date().getHours();
    const isNight = hour >= 19 || hour < 7; // 19:00–07:00
    const root = document.documentElement;
    if (isNight) root.classList.add("dark");
    else root.classList.remove("dark");
  } catch {}
}

export default function CommonLayout({ children }: Props) {
  React.useEffect(() => {
    // Aplica modo nocturno por hora local
    applyAutoDarkByTime();

    // Re-evaluar cada 10 minutos por si cambia la hora mientras navega
    const t = setInterval(applyAutoDarkByTime, 10 * 60 * 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="min-h-screen bg-white text-black dark:bg-black dark:text-white">
      <Header />
      <div>{children}</div>
      <Footer />
    </div>
  );
}
