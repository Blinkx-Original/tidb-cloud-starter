// components/v2/ThemeToggle.tsx
import * as React from "react";

type ThemePref = "light" | "dark" | "auto";

function setHtmlDark(on: boolean) {
  try {
    const root = document.documentElement;
    if (on) root.classList.add("dark");
    else root.classList.remove("dark");
  } catch {}
}

function isNightNow() {
  const hour = new Date().getHours();
  return hour >= 19 || hour < 7; // 19:00–07:00
}

export function applyTheme(pref: ThemePref) {
  if (pref === "light") setHtmlDark(false);
  else if (pref === "dark") setHtmlDark(true);
  else setHtmlDark(isNightNow());
}

export default function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const [pref, setPref] = React.useState<ThemePref>("auto");

  React.useEffect(() => {
    try {
      const saved = (localStorage.getItem("themePref") as ThemePref) || "auto";
      setPref(saved);
    } catch {}
  }, []);

  React.useEffect(() => {
    try {
      localStorage.setItem("themePref", pref);
      applyTheme(pref);
      // Notificar a otros componentes/pestañas
      window.dispatchEvent(new CustomEvent("theme-change", { detail: { pref } }));
    } catch {}
  }, [pref]);

  // Re-evaluar modo "auto" cada 10 min
  React.useEffect(() => {
    if (pref !== "auto") return;
    const t = setInterval(() => applyTheme("auto"), 10 * 60 * 1000);
    return () => clearInterval(t);
  }, [pref]);

  const btnBase =
    "px-2.5 py-1 rounded-full border transition select-none focus:outline-none";
  const activeLight =
    pref === "light" ? "bg-black text-white border-black dark:bg-white dark:text-black dark:border-white" : "border-black text-black hover:bg-black/5 dark:border-white dark:text-white dark:hover:bg-white/10";
  const activeAuto =
    pref === "auto" ? "bg-black text-white border-black dark:bg-white dark:text-black dark:border-white" : "border-black text-black hover:bg-black/5 dark:border-white dark:text-white dark:hover:bg-white/10";
  const activeDark =
    pref === "dark" ? "bg-black text-white border-black dark:bg-white dark:text-black dark:border-white" : "border-black text-black hover:bg-black/5 dark:border-white dark:text-white dark:hover:bg-white/10";

  // Compacto: iconos solamente; Normal: iconos + labels
  return (
    <div
      className={`inline-flex items-center gap-1 rounded-full p-1 border border-black dark:border-white ${
        compact ? "" : "text-sm"
      }`}
      aria-label="Selector de tema"
    >
      <button
        className={`${btnBase} ${activeLight}`}
        onClick={() => setPref("light")}
        title="Modo día"
        aria-pressed={pref === "light"}
      >
        <span aria-hidden>☀️</span>
        {!compact && <span className="ml-1 hidden sm:inline">Día</span>}
      </button>
      <button
        className={`${btnBase} ${activeAuto}`}
        onClick={() => setPref("auto")}
        title="Automático por horario"
        aria-pressed={pref === "auto"}
      >
        <span aria-hidden>🕘</span>
        {!compact && <span className="ml-1 hidden sm:inline">Auto</span>}
      </button>
      <button
        className={`${btnBase} ${activeDark}`}
        onClick={() => setPref("dark")}
        title="Modo noche"
        aria-pressed={pref === "dark"}
      >
        <span aria-hidden>🌙</span>
        {!compact && <span className="ml-1 hidden sm:inline">Noche</span>}
      </button>
    </div>
  );
}
