"use client";

import { useTheme } from "./ThemeProvider";

const OPTIONS: { mode: "auto" | "light" | "dark"; label: string }[] = [
  { mode: "auto", label: "Auto" },
  { mode: "light", label: "Day" },
  { mode: "dark", label: "Night" },
];

export default function ThemeToggle() {
  const { mode, setMode } = useTheme();

  return (
    <div className="flex items-center rounded-full border border-white/60 bg-white/60 p-1 text-xs font-medium shadow-glass backdrop-blur-md dark:border-white/10 dark:bg-white/5">
      {OPTIONS.map((opt) => (
        <button
          key={opt.mode}
          onClick={() => setMode(opt.mode)}
          className={`rounded-full px-3 py-1.5 transition-all ${
            mode === opt.mode
              ? "bg-brand-gradient text-white shadow-glow"
              : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
