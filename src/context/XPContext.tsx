import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";

export interface XPState {
  xp: number;
  level: number;
  scenariiDeblocate: string[];
}

const XP_PER_LEVEL = 200;
const ALL_SCENARIOS_ORDER = ["camin", "navetist", "chirie", "iarna", "garsoniera", "vara", "vacanta"];
const XP_UNLOCK: Record<string, number> = {
  camin: 0,
  navetist: 0,
  chirie: 200,
  iarna: 300,
  garsoniera: 500,
  vara: 400,
  vacanta: 600,
};

function loadXP(): XPState {
  try {
    const raw = localStorage.getItem("cost_xp");
    if (raw) return JSON.parse(raw);
  } catch {}
  return { xp: 0, level: 1, scenariiDeblocate: ["camin", "navetist"] };
}

function saveXP(state: XPState) {
  try {
    localStorage.setItem("cost_xp", JSON.stringify(state));
  } catch {}
}

function computeLevel(xp: number): number {
  return Math.floor(xp / XP_PER_LEVEL) + 1;
}

function computeUnlocked(xp: number): string[] {
  return ALL_SCENARIOS_ORDER.filter((id) => xp >= (XP_UNLOCK[id] ?? 9999));
}

interface XPContextType {
  xpState: XPState;
  addXP: (amount: number) => void;
  xpForNextLevel: number;
  xpProgress: number;
  isUnlocked: (scenariuId: string) => boolean;
  xpRequiredFor: (scenariuId: string) => number;
}

const XPContext = createContext<XPContextType | null>(null);

export function XPProvider({ children }: { children: ReactNode }) {
  const [xpState, setXPState] = useState<XPState>(loadXP);

  useEffect(() => { saveXP(xpState); }, [xpState]);

  const addXP = useCallback((amount: number) => {
    setXPState((prev) => {
      const newXP = prev.xp + amount;
      const newLevel = computeLevel(newXP);
      const newUnlocked = computeUnlocked(newXP);
      return { xp: newXP, level: newLevel, scenariiDeblocate: newUnlocked };
    });
  }, []);

  const xpForNextLevel = XP_PER_LEVEL;
  const xpProgress = (xpState.xp % XP_PER_LEVEL) / XP_PER_LEVEL;
  const isUnlocked = useCallback((id: string) => xpState.scenariiDeblocate.includes(id), [xpState]);
  const xpRequiredFor = useCallback((id: string) => XP_UNLOCK[id] ?? 0, []);

  return (
    <XPContext.Provider value={{ xpState, addXP, xpForNextLevel, xpProgress, isUnlocked, xpRequiredFor }}>
      {children}
    </XPContext.Provider>
  );
}

export function useXP() {
  const ctx = useContext(XPContext);
  if (!ctx) throw new Error("useXP must be inside XPProvider");
  return ctx;
}
