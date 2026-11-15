"use client";

import { useSyncExternalStore } from "react";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function getSnapshot(): "dark" | "light" {
  if (typeof window === "undefined") return "dark";
  const saved = localStorage.getItem("lunaredge-theme");
  return saved === "light" ? "light" : "dark";
}

function getServerSnapshot(): "dark" | "light" {
  return "dark";
}

function applyThemeToDom(theme: "dark" | "light") {
  document.documentElement.setAttribute("data-theme", theme);
  if (theme === "light") {
    document.documentElement.classList.add("light");
    document.documentElement.classList.remove("dark");
  } else {
    document.documentElement.classList.add("dark");
    document.documentElement.classList.remove("light");
  }
}

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    localStorage.setItem("lunaredge-theme", next);
    applyThemeToDom(next);
    window.dispatchEvent(new Event("storage"));
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`flex items-center gap-1.5 rounded-full border px-3 py-1 font-telemetry text-xs transition-all shadow-sm ${
        theme === "dark"
          ? "border-cyan-500/40 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 hover:border-cyan-400"
          : "border-slate-300 bg-white text-slate-800 hover:border-sky-500 hover:text-sky-600 shadow-md"
      }`}
      title={
        theme === "dark"
          ? "Switch to NASA Cleanroom White Theme (Full Website)"
          : "Switch to Deep Space Dark Theme"
      }
    >
      <span>{theme === "dark" ? "☀️" : "🌑"}</span>
      <span className="font-hud text-[10px] tracking-wider">
        {theme === "dark" ? "CLEANROOM WHITE" : "DEEP SPACE DARK"}
      </span>
    </button>
  );
}
