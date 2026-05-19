import { createContext, useContext, useState, useCallback, useRef, type ReactNode } from "react";
import { SCENARII, DIFICULTATI, START_CONFIG, type DifficultyKey } from "@/data/scenarios";
import { GAME_EVENTS, shuffleArray, type GameEvent } from "@/data/events";

export interface DecizieIstorica {
  id: string;
  luna: number;
  saptamana: number;
  titluEveniment: string;
  alegere: string;
  lectie: string;
  baniDelta: number;
  fericireDelta: number;
  timestamp: number;
}

export interface GameState {
  scenariuId: string;
  subScenariuId: string;
  dificultateKey: DifficultyKey;
  bani: number;
  fericire: number;
  saptamana: number;
  luna: number;
  saptamanaInLuna: number;
  istoricDecizii: DecizieIstorica[];
  isGameOver: boolean;
  gameOverTitle: string;
  gameOverReason: string;
  isEndless: boolean;
  evenimentCurent: GameEvent | null;
  evenimenteRamase: GameEvent[];
  limitedEventBonus?: { xp: number; bani?: number; fericire?: number };
<<<<<<< HEAD
  isRecoveryMode: boolean;
  recoveryWeeksRemaining: number;
  originalScenarioId?: string;
=======
>>>>>>> bca33c6a3a6b536a83ed88053ea89ffdd976de0f
}

interface GameContextType {
  state: GameState | null;
<<<<<<< HEAD
  initGame: (scenariuId: string, subScenariuId: string, dificultate: DifficultyKey, venitLunar?: number, limitedEventBonus?: GameState["limitedEventBonus"]) => void;
=======
  initGame: (scenariuId: string, subScenariuId: string, dificultate: DifficultyKey, limitedEventBonus?: GameState["limitedEventBonus"]) => void;
>>>>>>> bca33c6a3a6b536a83ed88053ea89ffdd976de0f
  nextWeek: () => void;
  chooseOption: (optionIndex: number) => void;
  startEndless: () => void;
  resetGame: () => void;
}

const GameContext = createContext<GameContextType | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<GameState | null>(null);
  const eventQueueRef = useRef<GameEvent[]>([]);

  const initGame = useCallback((
    scenariuId: string,
    subScenariuId: string,
    dificultateKey: DifficultyKey,
<<<<<<< HEAD
    venitLunar?: number,
=======
>>>>>>> bca33c6a3a6b536a83ed88053ea89ffdd976de0f
    limitedEventBonus?: GameState["limitedEventBonus"],
  ) => {
    const scenario = SCENARII[scenariuId];
    const difficulty = DIFICULTATI[dificultateKey];
    const startCfg = (START_CONFIG[scenariuId] ?? START_CONFIG.camin)[dificultateKey];
    const subScenariu = scenario.subScenarii.find((s) => s.id === subScenariuId) ?? scenario.subScenarii[0];

    const cheltuieliExtra = subScenariu.cheltuieliExtra.reduce((sum, c) => sum + c.suma, 0);
<<<<<<< HEAD
    const venitLunarBase = venitLunar ?? 0;
    const startBani = startCfg.bani + subScenariu.venitBonus + venitLunarBase - cheltuieliExtra;
=======
    const startBani = startCfg.bani + subScenariu.venitBonus - cheltuieliExtra;
>>>>>>> bca33c6a3a6b536a83ed88053ea89ffdd976de0f

    const rawEvents = GAME_EVENTS[scenariuId] ?? [];
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
<<<<<<< HEAD
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
=======
    });
  }, []);

  const checkGameOver = useCallback((bani: number, fericire: number, saptamana: number, isEndless: boolean): { over: boolean; title: string; reason: string } => {
    if (bani < 0) return { over: true, title: "Game Over — Faliment", reason: "Banii tăi au ajuns sub 0. Nu ai mai putut acoperi cheltuielile." };
    if (fericire <= 0) return { over: true, title: "Game Over — Epuizare", reason: "Energia ta a ajuns la 0. Burnout-ul te-a doborât." };
    if (!isEndless && saptamana >= 48) return { over: false, title: "Felicitări! Ai terminat cei 12 luni!", reason: "Ai reușit să supraviețuiești financiar un an întreg!" };
    return { over: false, title: "", reason: "" };
>>>>>>> bca33c6a3a6b536a83ed88053ea89ffdd976de0f
  }, []);

  const getNextEvent = useCallback((scenariuId: string): GameEvent | null => {
    if (eventQueueRef.current.length === 0) {
      const rawEvents = GAME_EVENTS[scenariuId] ?? [];
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
<<<<<<< HEAD
      let newRecoveryWeeks = prev.recoveryWeeksRemaining;
      let isRecoveryMode = prev.isRecoveryMode;
      let originalScenarioId = prev.originalScenarioId;

      if (newSaptamana % 4 === 0 && !isRecoveryMode) {
=======

      if (newSaptamana % 4 === 0) {
>>>>>>> bca33c6a3a6b536a83ed88053ea89ffdd976de0f
        const scenario = SCENARII[prev.scenariuId];
        const subScenariu = scenario.subScenarii.find((s) => s.id === prev.subScenariuId) ?? scenario.subScenarii[0];
        const diff = DIFICULTATI[prev.dificultateKey];

        let venit = scenario.venitLunar + subScenariu.venitBonus;
        if (prev.dificultateKey === "usor") venit *= 1.0;
        if (prev.dificultateKey === "mediu") venit *= 0.9;
        if (prev.dificultateKey === "greu") venit *= 0.8;

        const cheltuieliFixe = scenario.cheltuieliFixe.reduce((s, c) => s + c.suma, 0);
        const cheltuieliExtra = subScenariu.cheltuieliExtra.filter((c) => c.suma > 0).reduce((s, c) => s + c.suma, 0);
        newBani += venit - cheltuieliFixe - cheltuieliExtra;
        _ = diff;
      }

<<<<<<< HEAD
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
            saptamana: newSaptamana,
            luna: newLuna,
            saptamanaInLuna: newSaptamanaInLuna,
            bani: newBani,
            fericire: Math.max(0, Math.min(100, newFericire)),
            isGameOver: go.over,
            gameOverTitle: go.title,
            gameOverReason: go.reason,
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
=======
      const go = checkGameOver(newBani, newFericire, newSaptamana, prev.isEndless);

      const nextEvent = !go.over && !(newSaptamana >= 48 && !prev.isEndless) ? getNextEvent(prev.scenariuId) : null;

      return {
        ...prev,
>>>>>>> bca33c6a3a6b536a83ed88053ea89ffdd976de0f
        saptamana: newSaptamana,
        luna: newLuna,
        saptamanaInLuna: newSaptamanaInLuna,
        bani: newBani,
        fericire: Math.max(0, Math.min(100, newFericire)),
        isGameOver: go.over || (newSaptamana >= 48 && !prev.isEndless),
        gameOverTitle: go.title,
        gameOverReason: go.reason,
        evenimentCurent: nextEvent,
<<<<<<< HEAD
        isRecoveryMode,
        recoveryWeeksRemaining: newRecoveryWeeks,
        originalScenarioId,
=======
>>>>>>> bca33c6a3a6b536a83ed88053ea89ffdd976de0f
      };
    });
  }, [checkGameOver, getNextEvent]);

  const chooseOption = useCallback((optionIndex: number) => {
    setState((prev) => {
      if (!prev || !prev.evenimentCurent) return prev;
      const opt = prev.evenimentCurent.optiuni[optionIndex];
      if (!opt) return prev;

      const diff = DIFICULTATI[prev.dificultateKey];
      let baniDelta = opt.bani;
      let fericireDelta = opt.fericirePct;

      if (prev.dificultateKey === "usor") {
        baniDelta = baniDelta < 0 ? baniDelta * 0.8 : baniDelta * 1.1;
        fericireDelta = fericireDelta < 0 ? fericireDelta * 0.8 : fericireDelta * 1.2;
      } else if (prev.dificultateKey === "greu") {
        baniDelta = baniDelta < 0 ? baniDelta * 1.0 : baniDelta * 0.8;
        fericireDelta = fericireDelta < 0 ? fericireDelta * 1.0 : fericireDelta * 0.8;
      }
      _ = diff;

      const newBani = prev.bani + baniDelta;
      const newFericire = Math.max(0, Math.min(100, prev.fericire + fericireDelta));

      const decizie: DecizieIstorica = {
        id: `${prev.evenimentCurent.id}-${Date.now()}`,
        luna: prev.luna,
        saptamana: prev.saptamanaInLuna,
        titluEveniment: prev.evenimentCurent.titlu,
        alegere: opt.text,
        lectie: opt.lectie,
        baniDelta,
        fericireDelta,
        timestamp: Date.now(),
      };

<<<<<<< HEAD
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
=======
      const go = checkGameOver(newBani, newFericire, prev.saptamana, prev.isEndless);

      return {
        ...prev,
>>>>>>> bca33c6a3a6b536a83ed88053ea89ffdd976de0f
        bani: newBani,
        fericire: newFericire,
        istoricDecizii: [...prev.istoricDecizii, decizie],
        evenimentCurent: null,
        isGameOver: go.over,
        gameOverTitle: go.over ? go.title : prev.gameOverTitle,
        gameOverReason: go.over ? go.reason : prev.gameOverReason,
<<<<<<< HEAD
        isRecoveryMode,
        recoveryWeeksRemaining,
        originalScenarioId,
=======
>>>>>>> bca33c6a3a6b536a83ed88053ea89ffdd976de0f
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

  const resetGame = useCallback(() => setState(null), []);

  return (
    <GameContext.Provider value={{ state, initGame, nextWeek, chooseOption, startEndless, resetGame }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used inside GameProvider");
  return ctx;
}

// dummy to silence ts unused var warnings
function _(_: unknown) { return _; }
