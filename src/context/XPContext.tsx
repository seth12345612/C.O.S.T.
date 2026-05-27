import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from "react";
import type { XPState } from "@/types";
import { SCENARII } from "@/data/scenarios";
import { useAuth } from "@/context/AuthContext";
import { loadProfile, saveProfile } from "@/lib/syncProfile";

const XP_PER_LEVEL = 200;

const ALL_SCENARIOS_ORDER = [
  "camin", "navetist", "chirie", "supermarket", "bursa_sociala", "rude", "meditatii", "schimbari",
  "garsoniera", "antreprenor", "privat", "erasmus", "masina", "parinte", "iarna", "vara", "vacanta"
];

function getXPUnlock(): Record<string, number> {
  const unlock: Record<string, number> = {};
  for (const [id, scenario] of Object.entries(SCENARII)) {
    if (!scenario.isInternal) unlock[id] = scenario.xpRequired;
  }
  return unlock;
}

const XP_UNLOCK = getXPUnlock();

const DEFAULT_XP: XPState = { xp: 0, level: 1, scenariiDeblocate: ["camin", "navetist"] };

function loadLocal(): XPState {
  try {
    const raw = localStorage.getItem("cost_xp");
    if (raw) return JSON.parse(raw);
  } catch {}
  return DEFAULT_XP;
}

function saveLocal(state: XPState) {
  try { localStorage.setItem("cost_xp", JSON.stringify(state)); } catch {}
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
  const [xpState, setXPState] = useState<XPState>(loadLocal);
  const [premiumOverride, setPremiumOverride] = useState(false);
  const { user, subscriptionTier } = useAuth();
  const dbSynced = useRef(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (!user?.email || dbSynced.current) return;
    dbSynced.current = true;
    loadProfile(user.email, user.sub).then((profile) => {
      if (profile?.xp && typeof profile.xp === "object" && "xp" in profile.xp) {
        setXPState(profile.xp as XPState);
      }
    });
  }, [user?.email, user?.sub]);

  useEffect(() => {
    saveLocal(xpState);
    if (!user?.email) return;
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      saveProfile(user.email!, user.sub, { xp: xpState });
    }, 1000);
    return () => clearTimeout(saveTimer.current);
  }, [xpState, user?.email, user?.sub]);

  const addXP = useCallback((amount: number) => {
    const boost = subscriptionTier === "premium_advanced" ? 1.2 : 1;
    const finalAmount = Math.round(amount * boost);
    setXPState((prev) => {
      const newXP = prev.xp + finalAmount;
      const newLevel = computeLevel(newXP);
      const newUnlocked = computeUnlocked(newXP);
      return { xp: newXP, level: newLevel, scenariiDeblocate: newUnlocked };
    });
  }, [subscriptionTier]);

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
