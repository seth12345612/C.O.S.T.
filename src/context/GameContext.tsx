import { createContext, useContext, useState, useCallback, useRef, useEffect, type ReactNode } from "react";
import type { DifficultyKey, GameEvent, DecizieIstorica, GameState } from "@/types";
import { SCENARII, DIFICULTATI, START_CONFIG } from "@/data/scenarios";
import { GAME_EVENTS, shuffleArray } from "@/data/events";
import { useAuth } from "./AuthContext";
import { loadProfile, saveProfile } from "@/lib/syncProfile";

interface GameContextType {
  state: GameState | null;
  initGame: (scenariuId: string, subScenariuId: string, dificultate: DifficultyKey, venitLunar?: number, limitedEventBonus?: GameState["limitedEventBonus"]) => void;
  nextWeek: () => void;
  chooseOption: (optionIndex: number) => void;
  startEndless: () => void;
  resetGame: () => void;
  savedCapital: () => number;
}

const CAPITAL_KEY = "cost_capital";

const GameContext = createContext<GameContextType | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<GameState | null>(null);
  const eventQueueRef = useRef<GameEvent[]>([]);
  const { isPremium, user } = useAuth();
  const isPremiumRef = useRef(isPremium);
  isPremiumRef.current = isPremium;
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
  }, [user?.email, user?.sub]);

  useEffect(() => {
    if (!user?.email || !state) return;
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      saveProfile(user.email!, user.sub, { current_game: state });
    }, 1500);
    return () => clearTimeout(saveTimer.current);
  }, [state, user?.email, user?.sub]);

  const initGame = useCallback((
    scenariuId: string,
    subScenariuId: string,
    dificultateKey: DifficultyKey,
    venitLunar?: number,
    limitedEventBonus?: GameState["limitedEventBonus"],
  ) => {
    const scenario = SCENARII[scenariuId];
    const difficulty = DIFICULTATI[dificultateKey];
    const startCfg = (START_CONFIG[scenariuId] ?? START_CONFIG.camin)[dificultateKey];
    const subScenariu = scenario.subScenarii.find((s) => s.id === subScenariuId) ?? scenario.subScenarii[0];

    const cheltuieliExtra = subScenariu.cheltuieliExtra.reduce((sum, c) => sum + c.suma, 0);
    const venit = venitLunar ?? 0;
    const savedCapital = Number(localStorage.getItem(CAPITAL_KEY) ?? 0);
    localStorage.removeItem(CAPITAL_KEY);
    const startBani = savedCapital + venit - cheltuieliExtra;

    const rawEvents = (GAME_EVENTS[scenariuId] ?? []).filter((e) => !e.isPremium || isPremiumRef.current);
    const shuffled = shuffleArray(rawEvents);
    eventQueueRef.current = shuffled;

    let finalBani = startBani;
    if (limitedEventBonus?.bani) finalBani += limitedEventBonus.bani;
    let finalFericire = startCfg.fericire;
    if (limitedEventBonus?.fericire) finalFericire = Math.min(100, finalFericire + limitedEventBonus.fericire);

    setState({
      scenariuId,
      subScenariuId,
      dificultateKey,
      bani: finalBani,
      fericire: Math.min(100, finalFericire),
      venitLunar: venit,
      saptamana: 0,
      luna: 1,
      saptamanaInLuna: 0,
      istoricDecizii: [],
      isGameOver: false,
      gameOverTitle: "",
      gameOverReason: "",
      isEndless: false,
      evenimentCurent: null,
      evenimenteRamase: [],
      limitedEventBonus,
      isRecoveryMode: false,
      recoveryWeeksRemaining: 0,
    });
  }, []);

  const checkGameOver = useCallback((bani: number, fericire: number, saptamana: number, isEndless: boolean, isRecoveryMode: boolean = false, recoveryWeeksRemaining: number = 0): { over: boolean; enterRecovery: boolean; title: string; reason: string } => {
    if (bani < 0 && !isRecoveryMode) return { over: false, enterRecovery: true, title: "", reason: "" };
    if (bani < 0 && isRecoveryMode && recoveryWeeksRemaining <= 0) return { over: true, enterRecovery: false, title: "Game Over — Faliment", reason: "Nu ai reușit să te recuperezi din datorii în cele 8 săptămâni. Situația financiară a devenit ireversibilă." };
    if (fericire <= 0) return { over: true, enterRecovery: false, title: "Game Over — Epuizare", reason: "Energia ta a ajuns la 0. Burnout-ul te-a doborât." };
    if (!isEndless && saptamana >= 48) return { over: false, enterRecovery: false, title: "Felicitări! Ai terminat cei 12 luni!", reason: "Ai reușit să supraviețuiești financiar un an întreg!" };
    return { over: false, enterRecovery: false, title: "", reason: "" };
  }, []);

  const getNextEvent = useCallback((scenariuId: string): GameEvent | null => {
    if (eventQueueRef.current.length === 0) {
      const rawEvents = (GAME_EVENTS[scenariuId] ?? []).filter((e) => !e.isPremium || isPremiumRef.current);
      eventQueueRef.current = shuffleArray(rawEvents);
    }
    return eventQueueRef.current.pop() ?? null;
  }, []);

  const nextWeek = useCallback(() => {
    setState((prev) => {
      if (!prev || prev.isGameOver || prev.evenimentCurent) return prev;

      const newSaptamana = prev.saptamana + 1;
      const newLuna = Math.max(1, Math.ceil(newSaptamana / 4));
      const newSaptamanaInLuna = ((newSaptamana - 1) % 4) + 1;

      let newBani = prev.bani;
      let newFericire = prev.fericire;
      let newRecoveryWeeks = prev.recoveryWeeksRemaining;
      let isRecoveryMode = prev.isRecoveryMode;
      let originalScenarioId = prev.originalScenarioId;

      if (newSaptamana % 4 === 0 && !isRecoveryMode) {
        let venit = prev.venitLunar;
        if (prev.dificultateKey === "usor") venit *= 1.0;
        if (prev.dificultateKey === "mediu") venit *= 0.9;
        if (prev.dificultateKey === "greu") venit *= 0.8;

        const scenario = SCENARII[prev.scenariuId];
        const subScenariu = scenario.subScenarii.find((s) => s.id === prev.subScenariuId) ?? scenario.subScenarii[0];
        const cheltuieliFixe = scenario.cheltuieliFixe.reduce((s, c) => s + c.suma, 0);
        const cheltuieliExtra = subScenariu.cheltuieliExtra.filter((c) => c.suma > 0).reduce((s, c) => s + c.suma, 0);
        newBani += venit - cheltuieliFixe - cheltuieliExtra;
      }

      if (isRecoveryMode) {
        newRecoveryWeeks -= 1;
        newFericire -= 5;

        if (newBani >= 0) {
          isRecoveryMode = false;
          newRecoveryWeeks = 0;
          originalScenarioId = undefined;
        } else if (newRecoveryWeeks <= 0) {
          const go = checkGameOver(newBani, newFericire, newSaptamana, prev.isEndless, isRecoveryMode, newRecoveryWeeks);
          return {
            ...prev,
            saptamana: newSaptamana, luna: newLuna, saptamanaInLuna: newSaptamanaInLuna,
            bani: newBani, fericire: Math.max(0, Math.min(100, newFericire)),
            isGameOver: go.over, gameOverTitle: go.title, gameOverReason: go.reason,
          };
        }
      }

      const go = checkGameOver(newBani, newFericire, newSaptamana, prev.isEndless, isRecoveryMode, newRecoveryWeeks);

      if (go.enterRecovery && !prev.isRecoveryMode) {
        isRecoveryMode = true;
        newRecoveryWeeks = 8;
        originalScenarioId = prev.scenariuId;
        eventQueueRef.current = shuffleArray(GAME_EVENTS.recuperare ?? []);
      }

      const nextEvent = !go.over && !(newSaptamana >= 48 && !prev.isEndless)
        ? getNextEvent(isRecoveryMode ? "recuperare" : prev.scenariuId)
        : null;

      const newScenariuId = isRecoveryMode && !prev.isRecoveryMode ? "recuperare" : (newBani >= 0 && prev.isRecoveryMode ? (prev.originalScenarioId ?? prev.scenariuId) : prev.scenariuId);

      return {
        ...prev,
        scenariuId: newScenariuId,
        saptamana: newSaptamana, luna: newLuna, saptamanaInLuna: newSaptamanaInLuna,
        bani: newBani, fericire: Math.max(0, Math.min(100, newFericire)),
        isGameOver: go.over || (newSaptamana >= 48 && !prev.isEndless),
        gameOverTitle: go.title, gameOverReason: go.reason,
        evenimentCurent: nextEvent,
        isRecoveryMode, recoveryWeeksRemaining: newRecoveryWeeks, originalScenarioId,
      };
    });
  }, [checkGameOver, getNextEvent]);

  const chooseOption = useCallback((optionIndex: number) => {
    setState((prev) => {
      if (!prev || !prev.evenimentCurent) return prev;
      const opt = prev.evenimentCurent.optiuni[optionIndex];
      if (!opt) return prev;

      let baniDelta = opt.bani;
      let fericireDelta = opt.fericirePct;

      if (prev.dificultateKey === "usor") {
        baniDelta = baniDelta < 0 ? baniDelta * 0.8 : baniDelta * 1.1;
        fericireDelta = fericireDelta < 0 ? fericireDelta * 0.8 : fericireDelta * 1.2;
      } else if (prev.dificultateKey === "greu") {
        baniDelta = baniDelta < 0 ? baniDelta * 1.0 : baniDelta * 0.8;
        fericireDelta = fericireDelta < 0 ? fericireDelta * 1.0 : fericireDelta * 0.8;
      }

      const newBani = prev.bani + baniDelta;
      const newFericire = Math.max(0, Math.min(100, prev.fericire + fericireDelta));

      const decizie: DecizieIstorica = {
        id: `${prev.evenimentCurent.id}-${Date.now()}`,
        luna: prev.luna, saptamana: prev.saptamanaInLuna,
        titluEveniment: prev.evenimentCurent.titlu, alegere: opt.text,
        lectie: opt.lectie, baniDelta, fericireDelta, timestamp: Date.now(),
      };

      const go = checkGameOver(newBani, newFericire, prev.saptamana, prev.isEndless, prev.isRecoveryMode, prev.recoveryWeeksRemaining);

      let isRecoveryMode = prev.isRecoveryMode;
      let recoveryWeeksRemaining = prev.recoveryWeeksRemaining;
      let originalScenarioId = prev.originalScenarioId;
      let newScenariuId = prev.scenariuId;

      if (newBani >= 0 && prev.isRecoveryMode) {
        isRecoveryMode = false;
        recoveryWeeksRemaining = 0;
        newScenariuId = prev.originalScenarioId ?? prev.scenariuId;
        originalScenarioId = undefined;
        eventQueueRef.current = shuffleArray(GAME_EVENTS[newScenariuId] ?? []);
      }

      return {
        ...prev,
        scenariuId: newScenariuId,
        bani: newBani, fericire: newFericire,
        istoricDecizii: [...prev.istoricDecizii, decizie],
        evenimentCurent: null,
        isGameOver: go.over, gameOverTitle: go.over ? go.title : prev.gameOverTitle,
        gameOverReason: go.over ? go.reason : prev.gameOverReason,
        isRecoveryMode, recoveryWeeksRemaining, originalScenarioId,
      };
    });
  }, [checkGameOver]);

  const startEndless = useCallback(() => {
    setState((prev) => {
      if (!prev) return prev;
      const rawEvents = GAME_EVENTS[prev.scenariuId] ?? [];
      eventQueueRef.current = shuffleArray(rawEvents);
      return { ...prev, isEndless: true, isGameOver: false, gameOverTitle: "", gameOverReason: "" };
    });
  }, []);

  const resetGame = useCallback(() => {
    setState(null);
    if (user?.email) {
      saveProfile(user.email, user.sub, { current_game: null });
    }
  }, [user?.email, user?.sub]);

  const savedCapital = useCallback(() => {
    return Number(localStorage.getItem(CAPITAL_KEY) ?? 0);
  }, []);

  return (
    <GameContext.Provider value={{ state, initGame, nextWeek, chooseOption, startEndless, resetGame, savedCapital }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used inside GameProvider");
  return ctx;
}
