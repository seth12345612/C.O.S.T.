import { createContext, useContext, useState, useCallback, useRef, useEffect, useMemo, type ReactNode } from "react";
import type { DifficultyKey, GameEvent, DecizieIstorica, GameState, AiQuestion, AiAnswerResult } from "@/types";
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
  submitAiAnswer: (answer: string) => Promise<void>;
  dismissAiQuestion: () => void;
}

const CAPITAL_KEY = "cost_capital";
const FUNC_BASE = "https://twdvhkwrlwhadbmortqk.supabase.co";
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3ZHZoa3dybHdoYWRibW9ydHFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyMDM4OTAsImV4cCI6MjA5NDc3OTg5MH0.mvQkXjYR3YDChjbuGmmm006QOTjw6rQz6UdAKZYG-lQ";

const WEEKLY_QUESTIONS = [
  "Imaginează-ți că primești 50 de lei de la bunici de ziua ta. Un prieten îți spune să îi cheltuiești azi pe dulciuri și suc, iar altul îți spune să îi pui deoparte pentru ceva mai important mai târziu. Tu ce crezi că e mai bine să faci cu banii ăia? Explică de ce ai alege așa.",
  "Dacă ai vrea să îți cumperi o tabletă care costă 400 de lei și primești 20 de lei pe săptămână de la părinți, câte săptămâni ar trebui să economisești ca s-o iei? Dar dacă cheltuiești jumătate din bani în fiecare săptămână pe alte chestii, cât timp ți-ar lua?",
  "Te afli într-un magazin și vezi un super joc video la reducere cu 50% — costă 150 de lei în loc de 300. Tu ai doar 200 de lei strânși pentru o geantă nouă de școală. Ce faci: cumperi jocul sau iei geanta? De ce? Există vreo variantă prin care ai putea avea amândouă?",
  "Hai să zicem că ai un cont de economii unde primești 5 lei în plus la fiecare 100 de lei pe an (asta e dobânda). Dacă pui 200 de lei anul ăsta și nu te atingi de ei, câți bani vei avea peste un an? Dar dacă mai pui încă 100 de lei anul următor?",
  "Un prieten vrea să împrumute 30 de lei de la tine și zice că ți-i dă înapoi săptămâna viitoare. Tu știi că el mai are datorii și la alți colegi și nu și le-a plătit încă. Ce faci? Îi împrumuți banii sau nu? Cum i-ai spune politicos dacă nu vrei să îi dai?",
  "Părinții tăi îți dau 100 de lei pe lună pentru cheltuieli. Tu vrei să îți cumperi un joc de 60 de lei, să mergi la film (20 de lei) și să îți iei și un tricou (30 de lei). Adună toate costurile. Îți ajung banii? Dacă nu, la ce ai putea renunța ca să îți încapă în buget?",
  "De sărbători primești în total 300 de lei cadou de la toată familia. Un prieten îți spune să îi cheltuiești imediat, altul îți spune să îi împărți: o parte să cheltuiești, o parte să economisești, o parte să donezi. Tu ce crezi că e mai înțelept? Cum ai împărți cei 300 de lei?",
  "La școală se organizează o tombolă: costă 5 lei biletul, iar premiul mare e o consolă de 1000 de lei. Un coleg cumpără 10 bilete și zice că „sigur câștigă”. Tu ce crezi, e sigur că va câștiga? Câți bilet ai cumpăra tu și de ce?",
  "Ana primește 15 lei pe săptămână de la părinți. Ea își notează într-un caiet pe ce cheltuiește fiecare bănuț. După o lună, vede că a dat 30 de lei pe snacksuri și sucuri. Tu ții evidența cheltuielilor tale? Crezi că te-ar ajuta să îți dai seama pe ce se duc banii?",
  "Vrei să strângi bani pentru un telefon care costă 600 de lei. Ai putea să faci mici slujbe prin cartier: să plimbi câini (20 de lei/plimbare), să ajuți la teme (15 lei/ședință) sau să speli mașini (30 de lei/masina). Alege o combinație de slujbe câștigi 600 de lei într-o lună (4 săptămâni). Câte slujbe ar trebui să faci pe săptămână?",
];

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
      aiQuestion: null,
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

      const newScenariuId = isRecoveryMode && !prev.isRecoveryMode ? "recuperare" : (newBani >= 0 && prev.isRecoveryMode ? (prev.originalScenarioId ?? prev.scenariuId) : prev.scenariuId);

      return {
        ...prev,
        scenariuId: newScenariuId,
        saptamana: newSaptamana, luna: newLuna, saptamanaInLuna: newSaptamanaInLuna,
        bani: newBani, fericire: Math.max(0, Math.min(100, newFericire)),
        isGameOver: go.over || (newSaptamana >= 48 && !prev.isEndless),
        gameOverTitle: go.title, gameOverReason: go.reason,
        evenimentCurent: null,
        aiQuestion: prev.aiQuestion ? prev.aiQuestion : { intrebare: WEEKLY_QUESTIONS[Math.floor(Math.random() * WEEKLY_QUESTIONS.length)], status: "available", rezultat: null },
        isRecoveryMode, recoveryWeeksRemaining: originalScenarioId,
      };
    });
  }, [checkGameOver]);

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

      const randomQuestion = prev.aiQuestion
        ? prev.aiQuestion
        : {
            intrebare: WEEKLY_QUESTIONS[Math.floor(Math.random() * WEEKLY_QUESTIONS.length)],
            status: "available" as const,
            rezultat: null,
          };

      return {
        ...prev,
        scenariuId: newScenariuId,
        bani: newBani, fericire: newFericire,
        istoricDecizii: [...prev.istoricDecizii, decizie],
        evenimentCurent: null,
        aiQuestion: randomQuestion,
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

  const submitAiAnswer = useCallback(async (answer: string) => {
    let intrebare = "";
    let baniCurenti = 0;
    let fericireCurenta = 50;
    let saptamanaCurenta = 1;
    let scenariuId = "";

    setState((prev) => {
      if (!prev?.aiQuestion || prev.aiQuestion.status !== "available") return prev;
      intrebare = prev.aiQuestion.intrebare;
      baniCurenti = prev.bani;
      fericireCurenta = prev.fericire;
      saptamanaCurenta = prev.saptamana;
      scenariuId = prev.scenariuId;
      return { ...prev, aiQuestion: { ...prev.aiQuestion, status: "evaluating" } };
    });

    if (!intrebare) return;

    try {
      const prompt =
        `Evaluează răspunsul unui elev la o întrebare de educație financiară (copii până în 20 de ani).\n\n` +
        `Întrebarea: "${intrebare}"\n` +
        `Răspunsul elevului: "${answer}"\n\n` +
        `Context: bani=${baniCurenti} RON, fericire=${fericireCurenta}%, săptămâna ${saptamanaCurenta}/48.\n\n` +
        `EXPLICAȚIE (maxim 3 propoziții): Explică prietenos, pe înțelesul unui copil, de ce răspunsul e bun sau greșit și ce putea face mai bine.\n\n` +
        `APOI, pe ultima linie, adaugă DOAR un JSON cu acest format:\n` +
        `{"corect":true,"baniDelta":12,"fericireDelta":5}\n\n` +
        `Reguli pentru delte (în funcție de cât de complet și corect e răspunsul):\n` +
        `- complet, bine explicat, exemple → baniDelta 140-200, fericireDelta 10-15\n` +
        `- corect dar incomplet (doar parțial) → baniDelta 50-80, fericireDelta 5-10\n` +
        `- greșit dar a încercat → baniDelta -100 până la -200, fericireDelta -15 până la -20\n` +
        `- greșit complet sau off-topic → baniDelta -300 până la -400, fericireDelta -30 până la -35`;

      const res = await fetch(`${FUNC_BASE}/functions/v1/mentor`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${ANON_KEY}` },
        body: JSON.stringify({
          messages: [{ role: "user", content: prompt }],
          context: { bani: baniCurenti, fericire: fericireCurenta, saptamana: saptamanaCurenta, scenariu: scenariuId },
        }),
      });

      if (!res.ok) throw new Error(`API ${res.status}`);
      const data = await res.json();
      const reply = String(data.reply || "");
      const jsonRegex = /\{"corect":(true|false),"baniDelta":(-?\d+),"fericireDelta":(-?\d+)\}/;
      const jsonMatch = reply.match(jsonRegex);

      let corect = answer.trim().length > 20;
      let baniDelta = corect ? 120 : -200;
      let fericireDelta = corect ? 10 : -20;
      let explicatie = reply;

      if (jsonMatch) {
        corect = jsonMatch[1] === "true";
        baniDelta = Math.round(Number(jsonMatch[2]) / 5) * 5;
        fericireDelta = Math.round(Number(jsonMatch[3]));
        explicatie = reply.replace(jsonMatch[0], "").trim();
      }

      explicatie = explicatie
        .replace(/^(Explicație:|Explicaţie:|Răspuns:|Evaluare:)\s*/i, "")
        .replace(/\n{3,}/g, "\n\n")
        .trim();

      if (!explicatie || explicatie.length < 10) {
        explicatie = corect
          ? "Răspuns bun! Ai înțeles ideea. Continuă să înveți despre bani și economisire!"
          : "Mai încearcă! Gândește-te cum ai putea să răspunzi mai bine data viitoare.";
      }

      const rezultat: AiAnswerResult = { corect, baniDelta, fericireDelta, explicatie };
      setState((prev) => {
        if (!prev?.aiQuestion) return prev;
        return {
          ...prev,
          bani: Math.max(0, prev.bani + rezultat.baniDelta),
          fericire: Math.max(0, Math.min(100, prev.fericire + rezultat.fericireDelta)),
          aiQuestion: { ...prev.aiQuestion, status: "evaluated", rezultat },
        };
      });
    } catch {
      const len = answer.trim().length;
      let corect = len > 15;
      let baniDelta = 0;
      let fericireDelta = 0;
      let explicatie = "";
      if (len > 120) { corect = true; baniDelta = 170; fericireDelta = 12; explicatie = "Răspuns excelent! Ai intrat în detalii și ai arătat că ai înțeles bine ideea. Bravo!"; }
      else if (len > 60) { corect = true; baniDelta = 65; fericireDelta = 7; explicatie = "Răspuns corect! Data viitoare încearcă să adaugi mai multe detalii sau exemple."; }
      else if (len > 20) { corect = true; baniDelta = 50; fericireDelta = 5; explicatie = "Ideea e corectă, dar e cam scurt. Ce ai putea adăuga ca să fie mai complet?"; }
      else { baniDelta = -150; fericireDelta = -18; explicatie = "Răspunsul e prea scurt. Scrie măcar 2-3 propoziții ca să înveți ceva nou!"; }
      const rezultat: AiAnswerResult = { corect, baniDelta, fericireDelta, explicatie };
      setState((prev) => {
        if (!prev?.aiQuestion) return prev;
        return { ...prev, bani: Math.max(0, prev.bani + rezultat.baniDelta), fericire: Math.max(0, Math.min(100, prev.fericire + rezultat.fericireDelta)), aiQuestion: { ...prev.aiQuestion, status: "evaluated", rezultat } };
      });
    }
  }, []);

  const dismissAiQuestion = useCallback(() => {
    setState((prev) => {
      if (!prev) return prev;
      const rezultat = prev.aiQuestion?.rezultat;
      return {
        ...prev,
        aiQuestion: null,
        ...(rezultat?.baniDelta ? { bani: Math.max(0, prev.bani) } : {}),
      };
    });
  }, []);

  return (
    <GameContext.Provider value={{ state, initGame, nextWeek, chooseOption, startEndless, resetGame, savedCapital, submitAiAnswer, dismissAiQuestion }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used inside GameProvider");
  return ctx;
}
