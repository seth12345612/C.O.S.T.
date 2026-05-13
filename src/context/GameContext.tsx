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
}

interface GameContextType {
  state: GameState | null;
  initGame: (scenariuId: string, subScenariuId: string, dificultate: DifficultyKey, limitedEventBonus?: GameState["limitedEventBonus"]) => void;
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
    limitedEventBonus?: GameState["limitedEventBonus"],
  ) => {
    const scenario = SCENARII[scenariuId];
    const difficulty = DIFICULTATI[dificultateKey];
    const startCfg = (START_CONFIG[scenariuId] ?? START_CONFIG.camin)[dificultateKey];
    const subScenariu = scenario.subScenarii.find((s) => s.id === subScenariuId) ?? scenario.subScenarii[0];

    const cheltuieliExtra = subScenariu.cheltuieliExtra.reduce((sum, c) => sum + c.suma, 0);
    const startBani = startCfg.bani + subScenariu.venitBonus - cheltuieliExtra;

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
    });
  }, []);

  const checkGameOver = useCallback((bani: number, fericire: number, saptamana: number, isEndless: boolean): { over: boolean; title: string; reason: string } => {
    if (bani < 0) return { over: true, title: "Game Over — Faliment", reason: "Banii tăi au ajuns sub 0. Nu ai mai putut acoperi cheltuielile." };
    if (fericire <= 0) return { over: true, title: "Game Over — Epuizare", reason: "Energia ta a ajuns la 0. Burnout-ul te-a doborât." };
    if (!isEndless && saptamana >= 48) return { over: false, title: "Felicitări! Ai terminat cei 12 luni!", reason: "Ai reușit să supraviețuiești financiar un an întreg!" };
    return { over: false, title: "", reason: "" };
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

      if (newSaptamana % 4 === 0) {
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

      const go = checkGameOver(newBani, newFericire, newSaptamana, prev.isEndless);

      const nextEvent = !go.over && !(newSaptamana >= 48 && !prev.isEndless) ? getNextEvent(prev.scenariuId) : null;

      return {
        ...prev,
        saptamana: newSaptamana,
        luna: newLuna,
        saptamanaInLuna: newSaptamanaInLuna,
        bani: newBani,
        fericire: Math.max(0, Math.min(100, newFericire)),
        isGameOver: go.over || (newSaptamana >= 48 && !prev.isEndless),
        gameOverTitle: go.title,
        gameOverReason: go.reason,
        evenimentCurent: nextEvent,
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

      const go = checkGameOver(newBani, newFericire, prev.saptamana, prev.isEndless);

      return {
        ...prev,
        bani: newBani,
        fericire: newFericire,
        istoricDecizii: [...prev.istoricDecizii, decizie],
        evenimentCurent: null,
        isGameOver: go.over,
        gameOverTitle: go.over ? go.title : prev.gameOverTitle,
        gameOverReason: go.over ? go.reason : prev.gameOverReason,
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
