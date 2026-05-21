import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import type { Achievement, AchievementStats } from "@/types";
import { ACHIEVEMENTS, checkAchievements } from "@/data/achievements";

const STORAGE_KEY = "cost_achievements";

interface AchievementContextType {
  deblocate: string[];
  notificari: Achievement[];
  stats: AchievementStats;
  actualizeazaStats: (p: Partial<AchievementStats>) => void;
  reseteazaNotificari: () => void;
}

const AchievementContext = createContext<AchievementContextType | null>(null);

function incarcaDeblocate(): string[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch { return []; }
}

export function AchievementProvider({ children: copii, statsInitiale }: { children: ReactNode; statsInitiale?: Partial<AchievementStats> }) {
  const [deblocate, setDeblocate] = useState<string[]>(incarcaDeblocate);
  const [notificari, setNotificari] = useState<Achievement[]>([]);
  const [stats, setStats] = useState<AchievementStats>({
    totalJocuri: 0,
    totalVictorii: 0,
    scenariiDeblocate: 0,
    scenariiJucate: [],
    nivelCurent: 0,
    baniTotaliCastigati: 0,
    evenimenteCompletate: 0,
    tutorialCompletat: false,
    premiumActiv: false,
    utilizatorConectat: false,
    limitedEventsCompletate: 0,
    achievementIds: [],
    ...statsInitiale,
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(deblocate));
  }, [deblocate]);

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
