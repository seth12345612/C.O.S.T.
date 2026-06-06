import { create } from "zustand";
import { toast } from "sonner";
import type { DifficultyKey, GameEvent, DecizieIstorica, GameState, AiAnswerResult } from "@/types";
import { SCENARII, DIFICULTATI, START_CONFIG } from "@/data/scenarios";
import { GAME_EVENTS, shuffleArray } from "@/data/events";

const CAPITAL_KEY = "cost_capital";
const FUNC_BASE = "https://twdvhkwrlwhadbmortqk.supabase.co";
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3ZHZoa3dybHdoYWRibW9ydHFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyMDM4OTAsImV4cCI6MjA5NDc3OTg5MH0.mvQkXjYR3YDChjbuGmmm006QOTjw6rQz6UdAKZYG-lQ";

function getRandomEventQuestion(scenariuId: string): string {
  const events = GAME_EVENTS[scenariuId];
  if (!events || events.length === 0) return "Ce ai face ca să îți îmbunătățești situația financiară? Explică alegerea ta.";
  const event = events[Math.floor(Math.random() * events.length)];
  return `${event.titlu}: ${event.descriere}\n\nTu ce faci în această situație? Explică alegerea ta.`;
}

interface GameStore {
  state: GameState | null;
  eventQueue: GameEvent[];
  setState: (state: GameState | null) => void;
  initGame: (scenariuId: string, subScenariuId: string, dificultate: DifficultyKey, venitLunar?: number, limitedEventBonus?: GameState["limitedEventBonus"], isPremium?: boolean) => void;
  nextWeek: (isPremium?: boolean) => void;
  chooseOption: (optionIndex: number, isPremium?: boolean) => void;
  startEndless: (isPremium?: boolean) => void;
  resetGame: () => void;
  savedCapital: () => number;
  submitAiAnswer: (answer: string) => Promise<void>;
  dismissAiQuestion: () => void;
}

function checkGameOver(bani: number, fericire: number, reputatie: number, saptamana: number, isEndless: boolean, isRecoveryMode: boolean = false, recoveryWeeksRemaining: number = 0): { over: boolean; enterRecovery: boolean; title: string; reason: string } {
  if (bani < 0 && !isRecoveryMode) return { over: false, enterRecovery: true, title: "", reason: "" };
  if (bani < 0 && isRecoveryMode && recoveryWeeksRemaining <= 0) return { over: true, enterRecovery: false, title: "Game Over — Faliment", reason: "Nu ai reușit să te recuperezi din datorii în cele 8 săptămâni. Situația financiară a devenit ireversibilă." };
  if (fericire <= 0) return { over: true, enterRecovery: false, title: "Game Over — Epuizare", reason: "Energia ta a ajuns la 0. Burnout-ul te-a doborât." };
  if (reputatie <= 0) return { over: true, enterRecovery: false, title: "Game Over — Reputație distrusă", reason: "Nimeni nu mai are încredere în tine după deciziile tale. Reputația ta e zero." };
  if (!isEndless && saptamana >= 48) return { over: false, enterRecovery: false, title: "Felicitări! Ai terminat cei 12 luni!", reason: "Ai reușit să supraviețuiești financiar un an întreg!" };
  return { over: false, enterRecovery: false, title: "", reason: "" };
}

export const useGameStore = create<GameStore>((set, get) => ({
  state: null,
  eventQueue: [],
  
  setState: (state) => set({ state }),

  initGame: (scenariuId, subScenariuId, dificultateKey, venitLunar = 0, limitedEventBonus, isPremium = false) => {
    const scenario = SCENARII[scenariuId];
    const startCfg = (START_CONFIG[scenariuId] ?? START_CONFIG.camin)[dificultateKey];
    const subScenariu = scenario.subScenarii.find((s) => s.id === subScenariuId) ?? scenario.subScenarii[0];

    const cheltuieliExtra = subScenariu.cheltuieliExtra.reduce((sum, c) => sum + c.suma, 0);
    const savedCapital = Number(localStorage.getItem(CAPITAL_KEY) ?? 0);
    localStorage.removeItem(CAPITAL_KEY);
    const startBani = savedCapital + venitLunar - cheltuieliExtra;

    const rawEvents = (GAME_EVENTS[scenariuId] ?? []).filter((e) => !e.isPremium || isPremium);
    
    let finalBani = startBani;
    if (limitedEventBonus?.bani) finalBani += limitedEventBonus.bani;
    let finalFericire = startCfg.fericire;
    if (limitedEventBonus?.fericire) finalFericire = Math.min(100, finalFericire + limitedEventBonus.fericire);

    set({
      eventQueue: shuffleArray(rawEvents),
      state: {
        scenariuId,
        subScenariuId,
        dificultateKey,
        bani: finalBani,
        fericire: Math.min(100, finalFericire),
        reputatie: 50,
        venitLunar,
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
      }
    });
  },

  nextWeek: (isPremium = false) => {
    const { state, eventQueue } = get();
    if (!state || state.isGameOver || state.evenimentCurent) return;

    const newSaptamana = state.saptamana + 1;
    const newLuna = Math.max(1, Math.ceil(newSaptamana / 4));
    const newSaptamanaInLuna = ((newSaptamana - 1) % 4) + 1;

    let newBani = state.bani;
    let newFericire = state.fericire;
    let newReputatie = state.reputatie;
    let newRecoveryWeeks = state.recoveryWeeksRemaining;
    let isRecoveryMode = state.isRecoveryMode;
    let originalScenarioId = state.originalScenarioId;

    if (newSaptamana % 4 === 0 && !isRecoveryMode) {
      let venit = state.venitLunar;
      if (state.dificultateKey === "usor") venit *= 1.0;
      if (state.dificultateKey === "mediu") venit *= 0.9;
      if (state.dificultateKey === "greu") venit *= 0.8;

      const scenario = SCENARII[state.scenariuId];
      const subScenariu = scenario.subScenarii.find((s) => s.id === state.subScenariuId) ?? scenario.subScenarii[0];
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
        const go = checkGameOver(newBani, newFericire, newReputatie, newSaptamana, state.isEndless, isRecoveryMode, newRecoveryWeeks);
        set({
          state: {
            ...state,
            saptamana: newSaptamana, luna: newLuna, saptamanaInLuna: newSaptamanaInLuna,
            bani: newBani, fericire: Math.max(0, Math.min(100, newFericire)),
            isGameOver: go.over, gameOverTitle: go.title, gameOverReason: go.reason,
          }
        });
        if (go.over) {
          if (go.title?.includes("Felicitări")) toast.success("🎉 " + go.title, { description: go.reason });
          else toast.error("💀 " + go.title, { description: go.reason });
        }
        return;
      }
    }

    const go = checkGameOver(newBani, newFericire, newReputatie, newSaptamana, state.isEndless, isRecoveryMode, newRecoveryWeeks);

    let newEventQueue = [...eventQueue];
    if (go.enterRecovery && !state.isRecoveryMode) {
      isRecoveryMode = true;
      newRecoveryWeeks = 8;
      originalScenarioId = state.scenariuId;
      newEventQueue = shuffleArray(GAME_EVENTS.recuperare ?? []);
    }

    const newScenariuId = isRecoveryMode && !state.isRecoveryMode ? "recuperare" : (newBani >= 0 && state.isRecoveryMode ? (state.originalScenarioId ?? state.scenariuId) : state.scenariuId);

    // Grab next event if any (simple implementation, but we'll pop later in actual logic if we want to trigger events on nextWeek, wait, GameContext doesn't trigger event in nextWeek, it just resets evenimentCurent. Wait! If there's an event trigger... ah GameContext relies on another component to call getNextEvent. Wait, the original GameContext had getNextEvent, but it was not exported! Ah, getNextEvent was internally used but NOT in GameContextType! Wait, let me check.)
    
    set({
      eventQueue: newEventQueue,
      state: {
        ...state,
        scenariuId: newScenariuId,
        saptamana: newSaptamana, luna: newLuna, saptamanaInLuna: newSaptamanaInLuna,
        bani: newBani, fericire: Math.max(0, Math.min(100, newFericire)),
        reputatie: Math.max(0, Math.min(100, newReputatie)),
        isGameOver: go.over || (newSaptamana >= 48 && !state.isEndless),
        gameOverTitle: go.title, gameOverReason: go.reason,
        evenimentCurent: null, // Evenimentele vor fi extrase de componenta EventModal
        aiQuestion: state.aiQuestion ? state.aiQuestion : { intrebare: getRandomEventQuestion(newScenariuId), status: "available", rezultat: null },
        isRecoveryMode, recoveryWeeksRemaining: newRecoveryWeeks, originalScenarioId,
      }
    });

    if (go.over || (newSaptamana >= 48 && !state.isEndless)) {
      if (go.title?.includes("Felicitări")) toast.success("🎉 " + go.title, { description: go.reason });
      else toast.error("💀 " + go.title, { description: go.reason });
    }
  },

  chooseOption: (optionIndex, isPremium = false) => {
    const { state, eventQueue } = get();
    if (!state || !state.evenimentCurent) return;

    const opt = state.evenimentCurent.optiuni[optionIndex];
    if (!opt) return;

    let baniDelta = opt.bani;
    let fericireDelta = opt.fericirePct;
    let reputatieDelta = opt.reputatiePct ?? 0;

    if (state.dificultateKey === "usor") {
      baniDelta = baniDelta < 0 ? baniDelta * 0.8 : baniDelta * 1.1;
      fericireDelta = fericireDelta < 0 ? fericireDelta * 0.8 : fericireDelta * 1.2;
    } else if (state.dificultateKey === "greu") {
      baniDelta = baniDelta < 0 ? baniDelta * 1.0 : baniDelta * 0.8;
      fericireDelta = fericireDelta < 0 ? fericireDelta * 1.0 : fericireDelta * 0.8;
    }

    const newBani = state.bani + baniDelta;
    const newFericire = Math.max(0, Math.min(100, state.fericire + fericireDelta));
    const newReputatie = Math.max(0, Math.min(100, state.reputatie + reputatieDelta));

    const decizie: DecizieIstorica = {
      id: `${state.evenimentCurent.id}-${Date.now()}`,
      luna: state.luna, saptamana: state.saptamanaInLuna,
      titluEveniment: state.evenimentCurent.titlu, alegere: opt.text,
      lectie: opt.lectie, baniDelta, fericireDelta, reputatieDelta, timestamp: Date.now(),
    };

    const go = checkGameOver(newBani, newFericire, newReputatie, state.saptamana, state.isEndless, state.isRecoveryMode, state.recoveryWeeksRemaining);

    let isRecoveryMode = state.isRecoveryMode;
    let recoveryWeeksRemaining = state.recoveryWeeksRemaining;
    let originalScenarioId = state.originalScenarioId;
    let newScenariuId = state.scenariuId;
    let newEventQueue = [...eventQueue];

    if (newBani >= 0 && state.isRecoveryMode) {
      isRecoveryMode = false;
      recoveryWeeksRemaining = 0;
      newScenariuId = state.originalScenarioId ?? state.scenariuId;
      originalScenarioId = undefined;
      newEventQueue = shuffleArray(GAME_EVENTS[newScenariuId] ?? []);
    }

    const randomQuestion = state.aiQuestion
      ? state.aiQuestion
      : { intrebare: getRandomEventQuestion(state.scenariuId), status: "available" as const, rezultat: null };

    set({
      eventQueue: newEventQueue,
      state: {
        ...state,
        scenariuId: newScenariuId,
        bani: newBani, fericire: newFericire, reputatie: newReputatie,
        istoricDecizii: [...state.istoricDecizii, decizie],
        evenimentCurent: null,
        aiQuestion: randomQuestion,
        isGameOver: go.over, gameOverTitle: go.over ? go.title : state.gameOverTitle,
        gameOverReason: go.over ? go.reason : state.gameOverReason,
        isRecoveryMode, recoveryWeeksRemaining, originalScenarioId,
      }
    });

    if (go.over) {
      if (go.title?.includes("Felicitări")) toast.success("🎉 " + go.title, { description: go.reason });
      else toast.error("💀 " + go.title, { description: go.reason });
    }
  },

  startEndless: (isPremium = false) => {
    const { state } = get();
    if (!state) return;
    const rawEvents = (GAME_EVENTS[state.scenariuId] ?? []).filter((e) => !e.isPremium || isPremium);
    set({
      eventQueue: shuffleArray(rawEvents),
      state: { ...state, isEndless: true, isGameOver: false, gameOverTitle: "", gameOverReason: "" }
    });
  },

  resetGame: () => {
    set({ state: null, eventQueue: [] });
  },

  savedCapital: () => {
    return Number(localStorage.getItem(CAPITAL_KEY) ?? 0);
  },

  submitAiAnswer: async (answer) => {
    const { state } = get();
    if (!state?.aiQuestion || state.aiQuestion.status !== "available") return;

    const { intrebare } = state.aiQuestion;
    const baniCurenti = state.bani;
    const fericireCurenta = state.fericire;
    const reputatieCurenta = state.reputatie;
    const saptamanaCurenta = state.saptamana;
    const scenariuId = state.scenariuId;

    set({ state: { ...state, aiQuestion: { ...state.aiQuestion, status: "evaluating" } } });

    try {
      const prompt = `Evaluează răspunsul unui elev la o întrebare de educație financiară (copii până în 20 de ani).\n\nÎntrebarea: "${intrebare}"\nRăspunsul elevului: "${answer}"\n\nContext: bani=${baniCurenti} RON, fericire=${fericireCurenta}%, reputatie=${reputatieCurenta}%, săptămâna ${saptamanaCurenta}/48.\n\nEXPLICAȚIE (maxim 3 propoziții): Explică prietenos, pe înțelesul unui copil, de ce răspunsul e bun sau greșit și ce putea face mai bine.\n\nAPOI, pe ultima linie, adaugă DOAR un JSON cu acest format:\n{"corect":true,"baniDelta":12,"fericireDelta":5,"reputatieDelta":3}\n\nReguli pentru delte (în funcție de cât de complet și corect e răspunsul):\n- complet, bine explicat, exemple → baniDelta 140-200, fericireDelta 10-15, reputatieDelta 5-10\n- corect dar incomplet (doar parțial) → baniDelta 50-80, fericireDelta 5-10, reputatieDelta 2-5\n- greșit dar a încercat → baniDelta -100 până la -200, fericireDelta -15 până la -20, reputatieDelta -5 până la -10\n- greșit complet sau off-topic → baniDelta -300 până la -400, fericireDelta -30 până la -35, reputatieDelta -15 până la -25`;

      const res = await fetch(`${FUNC_BASE}/functions/v1/mentor`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${ANON_KEY}` },
        body: JSON.stringify({ messages: [{ role: "user", content: prompt }], context: { bani: baniCurenti, fericire: fericireCurenta, saptamana: saptamanaCurenta, scenariu: scenariuId } }),
      });

      if (!res.ok) throw new Error(`API ${res.status}`);
      const data = await res.json();
      const reply = String(data.reply || "");
      const jsonMatch = reply.match(/\{"corect":(true|false),"baniDelta":(-?\d+),"fericireDelta":(-?\d+)(,"reputatieDelta":(-?\d+))?\}/);

      let corect = answer.trim().length > 20;
      let baniDelta = corect ? 120 : -200;
      let fericireDelta = corect ? 10 : -20;
      let reputatieDelta = corect ? 5 : -10;
      let explicatie = reply;

      if (jsonMatch) {
        corect = jsonMatch[1] === "true";
        baniDelta = Math.round(Number(jsonMatch[2]) / 5) * 5;
        fericireDelta = Math.round(Number(jsonMatch[3]));
        reputatieDelta = jsonMatch[5] ? Math.round(Number(jsonMatch[5])) : (corect ? 5 : -10);
        explicatie = reply.replace(jsonMatch[0], "").trim();
      }

      explicatie = explicatie.replace(/^(Explicație:|Explicaţie:|Răspuns:|Evaluare:)\s*/i, "").replace(/\n{3,}/g, "\n\n").trim();
      if (!explicatie || explicatie.length < 10) {
        explicatie = corect ? "Răspuns bun! Ai înțeles ideea. Continuă să înveți despre bani și economisire!" : "Mai încearcă! Gândește-te cum ai putea să răspunzi mai bine data viitoare.";
      }

      const rezultat: AiAnswerResult = { corect, baniDelta, fericireDelta, reputatieDelta, explicatie };
      if (corect) toast.success("Răspuns corect!", { description: `+${baniDelta} RON, +${fericireDelta} fericire, +${reputatieDelta} reputație` });
      else toast.error("Răspuns greșit", { description: `${baniDelta} RON, ${fericireDelta} fericire, ${reputatieDelta} reputație` });

      set((s) => {
        if (!s.state?.aiQuestion) return s;
        return {
          state: {
            ...s.state,
            bani: Math.max(0, s.state.bani + rezultat.baniDelta),
            fericire: Math.max(0, Math.min(100, s.state.fericire + rezultat.fericireDelta)),
            reputatie: Math.max(0, Math.min(100, s.state.reputatie + (rezultat.reputatieDelta ?? 0))),
            aiQuestion: { ...s.state.aiQuestion, status: "evaluated", rezultat },
            istoricDecizii: [...s.state.istoricDecizii, { id: `ai-${Date.now()}`, luna: s.state.luna, saptamana: s.state.saptamanaInLuna, titluEveniment: intrebare, alegere: answer, lectie: rezultat.explicatie, baniDelta: rezultat.baniDelta, fericireDelta: rezultat.fericireDelta, reputatieDelta: rezultat.reputatieDelta, timestamp: Date.now() }],
          }
        };
      });
    } catch {
      // Fallback
      const len = answer.trim().length;
      let corect = len > 15;
      let baniDelta = 0, fericireDelta = 0, reputatieDelta = 0, explicatie = "";
      if (len > 120) { corect = true; baniDelta = 170; fericireDelta = 12; reputatieDelta = 8; explicatie = "Răspuns excelent! Ai intrat în detalii și ai arătat că ai înțeles bine ideea. Bravo!"; }
      else if (len > 60) { corect = true; baniDelta = 65; fericireDelta = 7; reputatieDelta = 4; explicatie = "Răspuns corect! Data viitoare încearcă să adaugi mai multe detalii sau exemple."; }
      else if (len > 20) { corect = true; baniDelta = 50; fericireDelta = 5; reputatieDelta = 2; explicatie = "Ideea e corectă, dar e cam scurt. Ce ai putea adăuga ca să fie mai complet?"; }
      else { baniDelta = -150; fericireDelta = -18; reputatieDelta = -12; explicatie = "Răspunsul e prea scurt. Scrie măcar 2-3 propoziții ca să înveți ceva nou!"; }

      const rezultat: AiAnswerResult = { corect, baniDelta, fericireDelta, reputatieDelta, explicatie };
      if (corect) toast.success("Răspuns corect!", { description: `+${baniDelta} RON, +${fericireDelta} fericire, +${reputatieDelta} reputație` });
      else toast.error("Răspuns greșit", { description: `${baniDelta} RON, ${fericireDelta} fericire, ${reputatieDelta} reputație` });

      set((s) => {
        if (!s.state?.aiQuestion) return s;
        return {
          state: {
            ...s.state,
            bani: Math.max(0, s.state.bani + rezultat.baniDelta),
            fericire: Math.max(0, Math.min(100, s.state.fericire + rezultat.fericireDelta)),
            reputatie: Math.max(0, Math.min(100, s.state.reputatie + (rezultat.reputatieDelta ?? 0))),
            aiQuestion: { ...s.state.aiQuestion, status: "evaluated", rezultat },
            istoricDecizii: [...s.state.istoricDecizii, { id: `ai-${Date.now()}`, luna: s.state.luna, saptamana: s.state.saptamanaInLuna, titluEveniment: intrebare, alegere: answer, lectie: rezultat.explicatie, baniDelta: rezultat.baniDelta, fericireDelta: rezultat.fericireDelta, reputatieDelta: rezultat.reputatieDelta, timestamp: Date.now() }],
          }
        };
      });
    }
  },

  dismissAiQuestion: () => {
    set((s) => {
      if (!s.state) return s;
      const rezultat = s.state.aiQuestion?.rezultat;
      return {
        state: {
          ...s.state,
          aiQuestion: null,
          ...(rezultat?.baniDelta ? { bani: Math.max(0, s.state.bani) } : {}),
        }
      };
    });
  }
}));
