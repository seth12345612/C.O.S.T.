import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";

export interface ThemePreset {
  id: string;
  label: string;
  primary: string;
  primaryH: number;
  primaryS: number;
  primaryL: number;
  secondary: string;
  secondaryH: number;
  secondaryS: number;
  secondaryL: number;
  bg: string;
  bgH: number;
  bgS: number;
  bgL: number;
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: "purple",
    label: "Violet (implicit)",
    primary: "#7828c8",
    primaryH: 270, primaryS: 70, primaryL: 47,
    secondary: "#ff7828",
    secondaryH: 25, secondaryS: 100, secondaryL: 57,
    bg: "#0d0615",
    bgH: 270, bgS: 15, bgL: 6,
  },
  {
    id: "blue",
    label: "Albastru Ocean",
    primary: "#2563eb",
    primaryH: 221, primaryS: 83, primaryL: 53,
    secondary: "#f59e0b",
    secondaryH: 38, secondaryS: 92, secondaryL: 50,
    bg: "#020b18",
    bgH: 221, bgS: 50, bgL: 6,
  },
  {
    id: "green",
    label: "Verde Smarald",
    primary: "#059669",
    primaryH: 161, primaryS: 94, primaryL: 30,
    secondary: "#f97316",
    secondaryH: 21, secondaryS: 96, secondaryL: 52,
    bg: "#021108",
    bgH: 161, bgS: 40, bgL: 4,
  },
  {
    id: "rose",
    label: "Roz Aprins",
    primary: "#e11d48",
    primaryH: 347, primaryS: 77, primaryL: 50,
    secondary: "#f59e0b",
    secondaryH: 38, secondaryS: 92, secondaryL: 50,
    bg: "#120208",
    bgH: 347, bgS: 40, bgL: 4,
  },
  {
    id: "orange",
    label: "Portocaliu Foc",
    primary: "#ea580c",
    primaryH: 21, primaryS: 90, primaryL: 48,
    secondary: "#7c3aed",
    secondaryH: 263, secondaryS: 70, secondaryL: 58,
    bg: "#120800",
    bgH: 21, bgS: 60, bgL: 4,
  },
  {
    id: "cyan",
    label: "Cyan Neon",
    primary: "#0891b2",
    primaryH: 192, primaryS: 91, primaryL: 36,
    secondary: "#f59e0b",
    secondaryH: 38, secondaryS: 92, secondaryL: 50,
    bg: "#010f14",
    bgH: 192, bgS: 60, bgL: 4,
  },
  {
    id: "gold",
    label: "Auriu Regal",
    primary: "#d97706",
    primaryH: 32, primaryS: 95, primaryL: 44,
    secondary: "#7c3aed",
    secondaryH: 263, secondaryS: 70, secondaryL: 58,
    bg: "#100800",
    bgH: 32, bgS: 50, bgL: 4,
  },
  {
    id: "pink",
    label: "Roz Pastel",
    primary: "#db2777",
    primaryH: 330, primaryS: 71, primaryL: 51,
    secondary: "#6366f1",
    secondaryH: 239, secondaryS: 84, secondaryL: 67,
    bg: "#120009",
    bgH: 330, bgS: 40, bgL: 4,
  },
];

function hexToHSL(hex: string): { h: number; s: number; l: number } {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

export interface ThemeState {
  presetId: string;
  customColor: string | null;
}

function load(): ThemeState {
  try {
    const raw = localStorage.getItem("cost_theme");
    if (raw) return JSON.parse(raw);
  } catch {}
  return { presetId: "purple", customColor: null };
}

function save(state: ThemeState) {
  try { localStorage.setItem("cost_theme", JSON.stringify(state)); } catch {}
}

function applyTheme(preset: ThemePreset, customPrimary?: string | null) {
  const root = document.documentElement;
  let h = preset.primaryH, s = preset.primaryS, l = preset.primaryL;
  if (customPrimary) {
    const hsl = hexToHSL(customPrimary);
    h = hsl.h; s = hsl.s; l = hsl.l;
  }
  root.style.setProperty("--primary", `${h} ${s}% ${l}%`);
  root.style.setProperty("--ring", `${h} ${s}% ${l}%`);
  root.style.setProperty("--sidebar-primary", `${h} ${s}% ${l}%`);
  root.style.setProperty("--secondary", `${preset.secondaryH} ${preset.secondaryS}% ${preset.secondaryL}%`);
  root.style.setProperty("--background", `${preset.bgH} ${preset.bgS}% ${preset.bgL}%`);
  root.style.setProperty("--card", `${preset.bgH} ${preset.bgS}% ${Math.min(100, preset.bgL + 4)}%`);
  root.style.setProperty("--muted", `${preset.bgH} ${Math.max(0, preset.bgS - 5)}% ${Math.min(100, preset.bgL + 10)}%`);
  root.style.setProperty("--border", `${preset.bgH} ${Math.min(100, preset.bgS + 5)}% ${Math.min(100, preset.bgL + 14)}%`);
}

interface ThemeContextType {
  themeState: ThemeState;
  currentPreset: ThemePreset;
  setPreset: (id: string) => void;
  setCustomColor: (hex: string) => void;
  clearCustom: () => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeState, setThemeState] = useState<ThemeState>(load);

  const currentPreset = THEME_PRESETS.find((p) => p.id === themeState.presetId) ?? THEME_PRESETS[0];

  useEffect(() => {
    applyTheme(currentPreset, themeState.customColor);
  }, [currentPreset, themeState.customColor]);

  useEffect(() => {
    save(themeState);
  }, [themeState]);

  const setPreset = useCallback((id: string) => {
    setThemeState({ presetId: id, customColor: null });
  }, []);

  const setCustomColor = useCallback((hex: string) => {
    setThemeState((prev) => ({ ...prev, customColor: hex }));
  }, []);

  const clearCustom = useCallback(() => {
    setThemeState((prev) => ({ ...prev, customColor: null }));
  }, []);

  return (
    <ThemeContext.Provider value={{ themeState, currentPreset, setPreset, setCustomColor, clearCustom }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be inside ThemeProvider");
  return ctx;
}
