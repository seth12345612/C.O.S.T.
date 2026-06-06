import { useEffect, useRef, type ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";
import { loadProfile, saveProfile } from "@/lib/syncProfile";
import { useXPStore } from "@/store/xpStore";
import type { XPState } from "@/types";

function saveLocal(state: XPState) {
  try { localStorage.setItem("cost_xp", JSON.stringify(state)); } catch {}
}

export function XPProvider({ children }: { children: ReactNode }) {
  const { user, subscriptionTier } = useAuth();
  const xpState = useXPStore((s) => s.xpState);
  const setXPState = useXPStore((s) => s.setXPState);

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
  }, [user?.email, user?.sub, setXPState]);

  useEffect(() => {
    saveLocal(xpState);
    if (!user?.email) return;
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      saveProfile(user.email!, user.sub, { xp: xpState });
    }, 1000);
    return () => clearTimeout(saveTimer.current);
  }, [xpState, user?.email, user?.sub]);

  return <>{children}</>;
}

export function useXP() {
  const store = useXPStore();
  const { subscriptionTier } = useAuth();

  return {
    xpState: store.xpState,
    addXP: (amount: number) => store.addXP(amount, subscriptionTier),
    xpForNextLevel: store.xpForNextLevel,
    xpProgress: store.xpProgress(),
    isUnlocked: store.isUnlocked,
    xpRequiredFor: store.xpRequiredFor,
    setPremiumOverride: store.setPremiumOverride,
    premiumOverride: store.premiumOverride,
  };
}
