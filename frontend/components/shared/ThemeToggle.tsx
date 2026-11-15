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

function applyThemeToDom(t: "dark" | "light") {
  document.documentElement.setAttribute("data-theme", t);
  if (t === "light") {
    document.documentElement.classList.add("light");
    document.documentElement.classList.remove("dark");
  } else {
    document.documentElement.classList.add("dark");
    document.documentElement.classList.remove("light");
  }
}

export function ThemeToggle({ className }: { className?: string }) {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const selectTheme = (t: "dark" | "light") => {
    localStorage.setItem("lunaredge-theme", t);
    applyThemeToDom(t);
    window.dispatchEvent(new Event("storage"));
  };

  return (
    <div
      className={`inline-flex items-center rounded-xl border border-white/10 bg-[#05070b] p-1 font-telemetry text-xs shadow-sm ${
        className ?? ""
      }`}
    >
      <button
        type="button"
        onClick={() => selectTheme("dark")}
        className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 font-medium transition ${
          theme === "dark"
            ? "bg-cyan-500/25 text-cyan-300 border border-cyan-400/50 shadow-sm"
            : "text-slate-400 hover:text-white"
        }`}
        title="Deep Space Dark Theme"
      >
        <span>🌑</span>
        <span className="font-hud text-[10px] tracking-wider">DARK</span>
      </button>

      <button
        type="button"
        onClick={() => selectTheme("light")}
        className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 font-medium transition ${
          theme === "light"
            ? "bg-white text-slate-900 font-bold border border-slate-300 shadow-sm"
            : "text-slate-400 hover:text-white"
        }`}
        title="NASA Cleanroom White Theme (Site-Wide)"
      >
        <span>☀️</span>
        <span className="font-hud text-[10px] tracking-wider">CLEANROOM</span>
      </button>
    </div>
  );
}
