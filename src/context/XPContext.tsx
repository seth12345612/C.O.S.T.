import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { SCENARII } from "@/data/scenarios";

export interface XPState {
  xp: number;
  level: number;
  scenariiDeblocate: string[];
}

const XP_PER_LEVEL = 200;

const ALL_SCENARIOS_ORDER = [
  "camin", "navetist", "chirie", "supermarket", "bursa_sociala", "rude", "meditatii", "schimbari",
  "garsoniera", "antreprenor", "privat", "erasmus", "masina", "parinte", "iarna", "vara", "vacanta"
];

function getXPUnlock(): Record<string, number> {
  const unlock: Record<string, number> = {};
  for (const [id, scenario] of Object.entries(SCENARII)) {
    if (!scenario.isInternal) {
      unlock[id] = scenario.xpRequired;
    }
  }
  return unlock;
}

const XP_UNLOCK = getXPUnlock();

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
  setPremiumOverride: (active: boolean) => void;
  premiumOverride: boolean;
}

const XPContext = createContext<XPContextType | null>(null);

export function XPProvider({ children }: { children: ReactNode }) {
  const [xpState, setXPState] = useState<XPState>(loadXP);
  const [premiumOverride, setPremiumOverride] = useState(false);

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
  
  const isUnlocked = useCallback((id: string) => {
    if (premiumOverride) return true;
    return xpState.scenariiDeblocate.includes(id);
  }, [xpState, premiumOverride]);
  
  const xpRequiredFor = useCallback((id: string) => XP_UNLOCK[id] ?? 0, []);

  return (
    <XPContext.Provider value={{ xpState, addXP, xpForNextLevel, xpProgress, isUnlocked, xpRequiredFor, setPremiumOverride, premiumOverride }}>
      {children}
    </XPContext.Provider>
  );
}

export function useXP() {
  const ctx = useContext(XPContext);
  if (!ctx) throw new Error("useXP must be inside XPProvider");
  return ctx;
}
