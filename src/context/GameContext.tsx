import { useEffect, useRef, type ReactNode } from "react";
import { toast } from "sonner";
import { useAuth } from "./AuthContext";
import { loadProfile, saveProfile } from "@/lib/syncProfile";
import { useGameStore } from "@/store/gameStore";
import type { GameState } from "@/types";

export function GameProvider({ children }: { children: ReactNode }) {
  const { isPremium, user } = useAuth();
  const state = useGameStore((s) => s.state);
  const setState = useGameStore((s) => s.setState);
  
  const dbLoaded = useRef(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (!user?.email || dbLoaded.current) return;
    dbLoaded.current = true;
    loadProfile(user.email, user.sub).then((profile) => {
      if (profile?.current_game && typeof profile.current_game === "object") {
        setState(profile.current_game as GameState);
      }
    });
  }, [user?.email, user?.sub, setState]);

  useEffect(() => {
    if (!user?.email || !state) return;
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      saveProfile(user.email!, user.sub, { current_game: state });
    }, 1500);
    return () => clearTimeout(saveTimer.current);
  }, [state, user?.email, user?.sub]);

  return <>{children}</>;
}

export function useGame() {
  const store = useGameStore();
  const { isPremium } = useAuth();

  return {
    state: store.state,
    initGame: (scenariuId: string, subScenariuId: string, dificultateKey: any, venitLunar?: number, limitedEventBonus?: any) => 
      store.initGame(scenariuId, subScenariuId, dificultateKey, venitLunar, limitedEventBonus, isPremium),
    nextWeek: () => store.nextWeek(isPremium),
    chooseOption: (optionIndex: number) => store.chooseOption(optionIndex, isPremium),
    startEndless: () => store.startEndless(isPremium),
    resetGame: store.resetGame,
    savedCapital: store.savedCapital,
    submitAiAnswer: store.submitAiAnswer,
    dismissAiQuestion: store.dismissAiQuestion,
  };
}
