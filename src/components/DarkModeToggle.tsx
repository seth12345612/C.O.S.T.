import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

const KEY = "cost_dark_mode";

export function DarkModeToggle() {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem(KEY);
    if (saved !== null) return saved === "true";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    localStorage.setItem(KEY, String(isDark));
    document.documentElement.classList.toggle("dark", isDark);
    document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
  }, [isDark]);

  return (
    <button
      onClick={() => setIsDark((v) => !v)}
      className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors"
      title={isDark ? "Comută la modul light" : "Comută la modul dark"}
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
