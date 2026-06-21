import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import type { ThemePreset, ThemeState } from "@/types";

export const SHOP_PRESET_IDS = ["polar", "neon", "gold", "green"];

const _BASE_PRESETS: ThemePreset[] = [
  {
    id: "purple",
    label: "Violet (implicit)",
    primary: "#7828c8",
    primaryH: 270, primaryS: 70, primaryL: 47,
    secondary: "#ff7828",
    secondaryH: 25, secondaryS: 100, secondaryL: 57,
    bg: "#1a0f2e",
    bgH: 270, bgS: 30, bgL: 12,
  },
  {
    id: "blue",
    label: "Albastru Ocean",
    primary: "#2563eb",
    primaryH: 221, primaryS: 83, primaryL: 53,
    secondary: "#f59e0b",
    secondaryH: 38, secondaryS: 92, secondaryL: 50,
    bg: "#0a1628",
    bgH: 221, bgS: 50, bgL: 10,
  },
  {
    id: "green",
    label: "Verde Smarald",
    primary: "#059669",
    primaryH: 161, primaryS: 94, primaryL: 30,
    secondary: "#f97316",
    secondaryH: 21, secondaryS: 96, secondaryL: 52,
    bg: "#061a10",
    bgH: 161, bgS: 40, bgL: 8,
  },
  {
    id: "rose",
    label: "Roz Aprins",
    primary: "#e11d48",
    primaryH: 347, primaryS: 77, primaryL: 50,
    secondary: "#f59e0b",
    secondaryH: 38, secondaryS: 92, secondaryL: 50,
    bg: "#1a0810",
    bgH: 347, bgS: 40, bgL: 8,
  },
  {
    id: "orange",
    label: "Portocaliu Foc",
    primary: "#ea580c",
    primaryH: 21, primaryS: 90, primaryL: 48,
    secondary: "#7c3aed",
    secondaryH: 263, secondaryS: 70, secondaryL: 58,
    bg: "#1a0c04",
    bgH: 21, bgS: 50, bgL: 8,
  },
  {
    id: "cyan",
    label: "Cyan Neon",
    primary: "#0891b2",
    primaryH: 192, primaryS: 91, primaryL: 36,
    secondary: "#f59e0b",
    secondaryH: 38, secondaryS: 92, secondaryL: 50,
    bg: "#041820",
    bgH: 192, bgS: 50, bgL: 8,
  },
  {
    id: "gold",
    label: "Auriu Regal",
    primary: "#d97706",
    primaryH: 32, primaryS: 95, primaryL: 44,
    secondary: "#7c3aed",
    secondaryH: 263, secondaryS: 70, secondaryL: 58,
    bg: "#1a1004",
    bgH: 32, bgS: 50, bgL: 8,
  },
  {
    id: "pink",
    label: "Roz Pastel",
    primary: "#db2777",
    primaryH: 330, primaryS: 71, primaryL: 51,
    secondary: "#6366f1",
    secondaryH: 239, secondaryS: 84, secondaryL: 67,
    bg: "#1a0812",
    bgH: 330, bgS: 40, bgL: 8,
  },
  {
    id: "polar",
    label: "Noapte polară",
    primary: "#1e3a5f",
    primaryH: 210, primaryS: 80, primaryL: 25,
    secondary: "#60a5fa",
    secondaryH: 210, secondaryS: 60, secondaryL: 60,
    bg: "#060e1a",
    bgH: 210, bgS: 50, bgL: 6,
  },
  {
    id: "neon",
    label: "Roz neon",
    primary: "#f43f5e",
    primaryH: 346, primaryS: 77, primaryL: 50,
    secondary: "#d946ef",
    secondaryH: 300, secondaryS: 60, secondaryL: 54,
    bg: "#1a040e",
    bgH: 346, bgS: 40, bgL: 8,
  },
];

// Backward-compatible alias
export const THEME_PRESETS: ThemePreset[] = _BASE_PRESETS;

export function getThemePresets(tr: (s: string) => string): ThemePreset[] {
  return _BASE_PRESETS.map((p) => ({ ...p, label: tr(p.label) }));
}

function toHex(color: string): string {
  const test = new Option().style;
  test.color = color;
  if (!test.color) return "#7828c8";
  const ctx = document.createElement("canvas").getContext("2d")!;
  ctx.fillStyle = test.color;
  const hex = ctx.fillStyle;
  return hex === "transparent" ? "#7828c8" : hex;
}

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
  let bgH = preset.bgH, bgS = preset.bgS, bgL = preset.bgL;
  if (customPrimary) {
    const hex = toHex(customPrimary);
    const hsl = hexToHSL(hex);
    h = hsl.h; s = hsl.s; l = hsl.l;
    bgH = hsl.h;
    bgS = Math.max(10, Math.round(hsl.s * 0.35));
    bgL = Math.max(6, Math.min(14, Math.round(hsl.l * 0.15)));
  }
  const cardL = Math.min(100, bgL + 5);
  const mutedL = Math.min(100, bgL + 12);
  const borderL = Math.min(100, bgL + 18);
  const fgL = Math.min(100, bgL + 65);
  root.style.setProperty("--primary", `${h} ${s}% ${l}%`);
  root.style.setProperty("--ring", `${h} ${s}% ${l}%`);
  root.style.setProperty("--sidebar-primary", `${h} ${s}% ${l}%`);
  root.style.setProperty("--primary-foreground", `${h} ${Math.max(0, s - 20)}% ${l > 60 ? 10 : 92}%`);
  root.style.setProperty("--secondary", `${preset.secondaryH} ${preset.secondaryS}% ${preset.secondaryL}%`);
  root.style.setProperty("--background", `${bgH} ${bgS}% ${bgL}%`);
  root.style.setProperty("--card", `${bgH} ${bgS}% ${cardL}%`);
  root.style.setProperty("--card-foreground", `${bgH} ${Math.max(0, bgS - 10)}% ${fgL}%`);
  root.style.setProperty("--card-border", `${bgH} ${Math.min(100, bgS + 10)}% ${Math.min(100, borderL + 4)}%`);
  root.style.setProperty("--muted", `${bgH} ${Math.max(0, bgS - 5)}% ${mutedL}%`);
  root.style.setProperty("--muted-foreground", `${bgH} ${Math.max(0, bgS - 10)}% ${Math.min(100, bgL + 45)}%`);
  root.style.setProperty("--border", `${bgH} ${Math.min(100, bgS + 5)}% ${borderL}%`);
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

  const currentPreset = _BASE_PRESETS.find((p) => p.id === themeState.presetId) ?? _BASE_PRESETS[0];

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
