import { create } from "zustand";
import type { XPState } from "@/types";
import { SCENARII } from "@/data/scenarios";
import { loadActiveBooster } from "@/lib/shop-equip";

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

function computeLevel(xp: number): number {
  return Math.floor(xp / XP_PER_LEVEL) + 1;
}

function computeUnlocked(xp: number): string[] {
  return ALL_SCENARIOS_ORDER.filter((id) => xp >= (XP_UNLOCK[id] ?? 9999));
}

interface XPStore {
  xpState: XPState;
  premiumOverride: boolean;
  setXPState: (state: XPState) => void;
  addXP: (amount: number, subscriptionTier?: string) => void;
  setPremiumOverride: (active: boolean) => void;
  isUnlocked: (scenariuId: string) => boolean;
  xpRequiredFor: (scenariuId: string) => number;
  xpForNextLevel: number;
  xpProgress: () => number;
}

export const useXPStore = create<XPStore>((set, get) => ({
  xpState: DEFAULT_XP,
  premiumOverride: false,

  setXPState: (state) => set({ xpState: state }),
  
  setPremiumOverride: (active) => set({ premiumOverride: active }),

  addXP: (amount, subscriptionTier) => {
    let boost = subscriptionTier === "premium_advanced" ? 1.2 : 1;
    const active = loadActiveBooster();
    if (active?.itemId === "booster_xp") boost *= 1.5;
    const finalAmount = Math.round(amount * boost);
    set((s) => {
      const newXP = s.xpState.xp + finalAmount;
      const newLevel = computeLevel(newXP);
      const newUnlocked = computeUnlocked(newXP);
      return { xpState: { xp: newXP, level: newLevel, scenariiDeblocate: newUnlocked } };
    });
  },

  isUnlocked: (id) => {
    const { xpState, premiumOverride } = get();
    const sc = SCENARII[id];
    if (sc?.isPremium) return premiumOverride;
    if (premiumOverride) return true;
    return xpState.scenariiDeblocate.includes(id);
  },

  xpRequiredFor: (id) => XP_UNLOCK[id] ?? 0,

  xpForNextLevel: XP_PER_LEVEL,

  xpProgress: () => {
    const { xpState } = get();
    return (xpState.xp % XP_PER_LEVEL) / XP_PER_LEVEL;
  }
}));
