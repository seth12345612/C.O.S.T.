import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from "react";
import type { Achievement, AchievementStats } from "@/types";
import { ACHIEVEMENTS, checkAchievements } from "@/data/achievements";
import { useAuth } from "@/context/AuthContext";
import { useXP } from "@/context/XPContext";
import { loadProfile, saveProfile } from "@/lib/syncProfile";

const STORAGE_KEY = "cost_achievements";
const TUTORIAL_KEY = "cost_tutorial_completed";

interface AchievementContextType {
  deblocate: string[];
  notificari: Achievement[];
  stats: AchievementStats;
  actualizeazaStats: (p: Partial<AchievementStats>) => void;
  reseteazaNotificari: () => void;
}

const AchievementContext = createContext<AchievementContextType | null>(null);

function incarcaDeblocate(): string[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; }
}

export function AchievementProvider({ children: copii, statsInitiale }: { children: ReactNode; statsInitiale?: Partial<AchievementStats> }) {
  const [deblocate, setDeblocate] = useState<string[]>(incarcaDeblocate);
  const [notificari, setNotificari] = useState<Achievement[]>([]);
  const [stats, setStats] = useState<AchievementStats>({
    totalJocuri: 0, totalVictorii: 0, scenariiDeblocate: 0, scenariiJucate: [],
    nivelCurent: 0, baniTotaliCastigati: 0, evenimenteCompletate: 0, tutorialCompletat: false,
    premiumActiv: false, utilizatorConectat: false, limitedEventsCompletate: 0, achievementIds: [],
    ...statsInitiale,
  });
  const { user, isPremium, premiumTrialEndsAt } = useAuth();
  const { xpState } = useXP();
  const dbSynced = useRef(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout>>();
  const lastLevel = useRef(0);
  const lastLogin = useRef(false);
  const lastPremium = useRef(false);

  useEffect(() => {
    if (!user?.email || dbSynced.current) return;
    dbSynced.current = true;
    loadProfile(user.email, user.sub).then((profile) => {
      if (profile?.achievements) {
        const arr = profile.achievements;
        if (Array.isArray(arr)) setDeblocate(arr);
      }
    });
  }, [user?.email, user?.sub]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(deblocate));
    if (!user?.email) return;
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      saveProfile(user.email!, user.sub, { achievements: deblocate });
    }, 1000);
    return () => clearTimeout(saveTimer.current);
  }, [deblocate, user?.email, user?.sub]);

  const actualizeazaStats = useCallback((p: Partial<AchievementStats>) => {
    setStats((prev) => {
      const noi = { ...prev, ...p, achievementIds: deblocate };
      const noiDeblocari = checkAchievements(noi, deblocate);
      if (noiDeblocari.length > 0) {
        setDeblocate((d) => [...d, ...noiDeblocari.map((a) => a.id)]);
        setNotificari((n) => [...n, ...noiDeblocari]);
      }
      return noi;
    });
  }, [deblocate]);

  const reseteazaNotificari = useCallback(() => setNotificari([]), []);

  useEffect(() => {
    const loggedIn = !!user;
    if (loggedIn && !lastLogin.current) {
      lastLogin.current = true;
      actualizeazaStats({ utilizatorConectat: true });
    }
    if (!loggedIn) lastLogin.current = false;
  }, [user, actualizeazaStats]);

  const isPremiumActive = isPremium && premiumTrialEndsAt && premiumTrialEndsAt > Date.now();
  useEffect(() => {
    if (isPremiumActive && !lastPremium.current) {
      lastPremium.current = true;
      actualizeazaStats({ premiumActiv: true });
    }
    if (!isPremiumActive) lastPremium.current = false;
  }, [isPremiumActive, actualizeazaStats]);

  useEffect(() => {
    if (xpState.level !== lastLevel.current) {
      lastLevel.current = xpState.level;
      actualizeazaStats({
        nivelCurent: xpState.level,
        scenariiDeblocate: xpState.scenariiDeblocate.length,
      });
    }
  }, [xpState.level, xpState.scenariiDeblocate.length, actualizeazaStats]);

  useEffect(() => {
    const completed = localStorage.getItem(TUTORIAL_KEY) === "true";
    if (completed) {
      actualizeazaStats({ tutorialCompletat: true });
    }
  }, [actualizeazaStats]);

  return (
    <AchievementContext.Provider value={{ deblocate, notificari, stats: { ...stats, achievementIds: deblocate }, actualizeazaStats, reseteazaNotificari }}>
      {copii}
    </AchievementContext.Provider>
  );
}

export function useAchievements() {
  const ctx = useContext(AchievementContext);
  if (!ctx) throw new Error("useAchievements needs AchievementProvider");
  return ctx;
}
