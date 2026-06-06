import { useState, useCallback, useEffect } from "react";

interface EquippedState {
  themeId: string | null;
  avatarId: string | null;
  badgeId: string | null;
}

interface ActiveBooster {
  itemId: string;
  expiresAt: number;
}

const EQUIPPED_KEY = "cost_shop_equipped";
const BOOSTER_KEY = "cost_shop_booster";

export function loadEquipped(): EquippedState {
  try {
    const raw = localStorage.getItem(EQUIPPED_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { themeId: null, avatarId: null, badgeId: null };
}

function saveEquipped(state: EquippedState) {
  try { localStorage.setItem(EQUIPPED_KEY, JSON.stringify(state)); } catch {}
}

export function loadActiveBooster(): ActiveBooster | null {
  try {
    const raw = localStorage.getItem(BOOSTER_KEY);
    if (raw) {
      const b: ActiveBooster = JSON.parse(raw);
      if (b.expiresAt > Date.now()) return b;
    }
  } catch {}
  return null;
}

function saveBooster(b: ActiveBooster | null) {
  if (b) {
    try { localStorage.setItem(BOOSTER_KEY, JSON.stringify(b)); } catch {}
  } else {
    try { localStorage.removeItem(BOOSTER_KEY); } catch {}
  }
}

export function useEquipped() {
  const [equipped, setEquipped] = useState<EquippedState>(loadEquipped);
  const [activeBooster, setActiveBooster] = useState<ActiveBooster | null>(loadActiveBooster);

  useEffect(() => { saveEquipped(equipped); }, [equipped]);
  useEffect(() => { saveBooster(activeBooster); }, [activeBooster]);

  const equipTheme = useCallback((shopId: string | null) => {
    setEquipped((prev) => ({ ...prev, themeId: shopId }));
  }, []);

  const equipAvatar = useCallback((shopId: string | null) => {
    setEquipped((prev) => ({ ...prev, avatarId: shopId }));
  }, []);

  const equipBadge = useCallback((shopId: string | null) => {
    setEquipped((prev) => ({ ...prev, badgeId: shopId }));
  }, []);

  const activateBooster = useCallback((shopId: string, durataZile: number) => {
    setActiveBooster((prev) => {
      const baseTime = prev?.itemId === shopId && prev.expiresAt > Date.now() ? prev.expiresAt : Date.now();
      return { itemId: shopId, expiresAt: baseTime + durataZile * 24 * 60 * 60 * 1000 };
    });
  }, []);

  const isBoosterActive = useCallback((shopId: string) => {
    return activeBooster?.itemId === shopId && activeBooster.expiresAt > Date.now();
  }, [activeBooster]);

  return { equipped, activeBooster, equipTheme, equipAvatar, equipBadge, activateBooster, isBoosterActive };
}
