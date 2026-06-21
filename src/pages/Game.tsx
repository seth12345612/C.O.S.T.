import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Coins, Smile, Calendar, ArrowLeft, Filter, Plus, X } from "lucide-react";
import { OrbBackground } from "@/components/OrbBackground";
import { Layout } from "@/components/Layout";
import { EventModal } from "@/components/EventModal";
import { GameOver } from "@/components/GameOver";
import { WeeklyQuiz } from "@/components/WeeklyQuiz";
import { useGame } from "@/context/GameContext";
import { useXP } from "@/context/XPContext";
import { useTranslation } from "@/context/TranslationContext";
import { useFinance } from "@/context/FinanceContext";
import { SCENARII, DIFICULTATI } from "@/data/scenarios";
import { Link } from "wouter";
import type { DifficultyKey, DecizieIstorica, SursaVenit, HistoryFilter } from "@/types";

const STORAGE_KEY = "cost_income_sources";

function SetupScreen() {
  const { t } = useTranslation();
  const [, navigate] = useLocation();
  const { initGame, resetGame } = useGame();
  const { isUnlocked, xpRequiredFor } = useXP();
  const { addTransaction } = useFinance();
  const [selectedScenariu, setSelectedScenariu] = useState<string>("camin");
  const [selectedSub, setSelectedSub] = useState<string>("coleg");
  const [selectedDiff, setSelectedDiff] = useState<DifficultyKey>("mediu");
  const [surseVenit, setSurseVenit] = useState<SursaVenit[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [{ id: crypto.randomUUID(), nume: "", suma: 0 }];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(surseVenit));
  }, [surseVenit]);

  function addSursa() {
    setSurseVenit((prev) => [...prev, { id: crypto.randomUUID(), nume: "", suma: 0 }]);
  }

  function removeSursa(id: string) {
    setSurseVenit((prev) => prev.filter((s) => s.id !== id));
  }

  function updateSursa(id: string, field: "nume" | "suma", value: string | number) {
    setSurseVenit((prev) => prev.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  }

  const venitTotal = surseVenit.reduce((sum, s) => sum + (s.suma || 0), 0);
  const capitalSalvat = Number(localStorage.getItem("cost_capital") ?? 0);

  useEffect(() => {
    resetGame();
    const params = new URLSearchParams(window.location.search);
    const sc = params.get("scenario");
    if (sc && SCENARII[sc]) {
      setSelectedScenariu(sc);
      setSelectedSub(SCENARII[sc].subScenarii[0].id);
    }
  }, []);

  useEffect(() => {
    const sc = SCENARII[selectedScenariu];
    if (sc) setSelectedSub(sc.subScenarii[0].id);
  }, [selectedScenariu]);

  const scenario = SCENARII[selectedScenariu];

  const FINANCE_ADDED_KEY = "cost_initial_finance_added";

  function start() {
    if (!localStorage.getItem(FINANCE_ADDED_KEY)) {
      surseVenit.forEach((s) => {
        if (s.suma > 0) {
          addTransaction({
            tip: "venit",
            descriere: s.nume,
            suma: s.suma,
            categorie: "Venit",
            data: new Date().toISOString().split("T")[0],
          });
        }
      });
      localStorage.setItem(FINANCE_ADDED_KEY, "1");
    }
    initGame(selectedScenariu, selectedSub, selectedDiff, venitTotal);
  }

  const allScenarii = Object.values(SCENARII);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link href="/" className="inline-flex items-center gap-1.5 text-dim hover:text-main text-sm mb-6 transition-colors">
        <ArrowLeft size={14} /> {t("Înapoi")}
      </Link>

      <div className="flex items-center justify-between mb-2">
        <h1 className="text-3xl font-black text-main">{t("Configurează jocul")}</h1>
        <Link
          href="/tutorial"
          className="px-3 py-1.5 rounded-lg border border-yellow-500/40 bg-yellow-500/10 text-yellow-300 text-xs font-semibold hover:bg-yellow-500/20 transition-colors"
        >
          {t("📖 Tutorial")}
        </Link>
      </div>
      <p className="text-dim text-sm mb-8">{t("Alege scenariul, sub-scenariul și dificultatea ta.")}</p>

      {/* Income selection - custom sources */}
      <div className="mb-6">
        <h2 className="text-sm font-bold text-muted uppercase tracking-wider mb-3">{t("Veniturile tale")}</h2>
        <div className="space-y-2">
          {surseVenit.map((sursa) => (
            <div key={sursa.id} className="flex items-center gap-2">
              <input
                type="text"
                placeholder={t("Nume venit (ex: Salariu)")}
                value={sursa.nume}
                onChange={(e) => updateSursa(sursa.id, "nume", e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl bg-card border border-subtle text-main text-sm placeholder-white/30 focus:outline-none focus:border-green-500/40"
              />
              <div className="relative w-32">
                <input
                  type="number"
                  placeholder={t("Suma")}
                  value={sursa.suma || ""}
                  onChange={(e) => updateSursa(sursa.id, "suma", Number(e.target.value))}
                  className="w-full pl-3 pr-8 py-2 rounded-xl bg-card border border-subtle text-main text-sm placeholder-white/30 focus:outline-none focus:border-green-500/40"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-subtle">RON</span>
              </div>
              {surseVenit.length > 1 && (
                <button onClick={() => removeSursa(sursa.id)} className="p-2 text-red-400 hover:text-red-300 transition-colors">
                  <X size={16} />
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          onClick={addSursa}
          className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-green-400 hover:text-green-300 transition-colors"
        >
          <Plus size={14} /> {t("Adaugă sursă de venit")}
        </button>
        <div className="mt-3 p-3 rounded-xl border border-green-500/20 bg-green-500/10">
          <span className="text-sm font-semibold text-green-300">{t("Venit lunar total: ")}</span>
          <span className="text-sm font-black text-green-400">{venitTotal} RON</span>
        </div>
        {capitalSalvat > 0 && (
          <div className="mt-2 p-3 rounded-xl border border-yellow-500/20 bg-yellow-500/10">
            <span className="text-sm font-semibold text-yellow-300">{t("Capital economisit: ")}</span>
            <span className="text-sm font-black text-yellow-400">+{capitalSalvat} RON</span>
          </div>
        )}
      </div>

      {/* Scenario selection */}
      <div className="mb-6">
        <h2 className="text-sm font-bold text-muted uppercase tracking-wider mb-3">{t("Scenariu")}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {allScenarii.map((sc) => {
            const unlocked = isUnlocked(sc.id);
            const xpNeeded = xpRequiredFor(sc.id);
            return (
              <button
                key={sc.id}
                disabled={!unlocked}
                onClick={() => setSelectedScenariu(sc.id)}
                className={`relative p-3 rounded-2xl border text-left transition-all overflow-hidden ${
                  selectedScenariu === sc.id
                    ? "border-purple-500/60 bg-purple-600/20"
                    : unlocked
                    ? "border-subtle bg-card hover:border-strong hover:bg-card-soft8"
                    : "border-subtler bg-card-soft opacity-50 cursor-not-allowed"
                }`}
              >
                <div className={`absolute inset-0 ${sc.bgClass} opacity-30`} />
                <div className="relative">
                  <span className="text-xl block mb-1">{sc.emoji}</span>
                  <span className="text-xs font-semibold text-main block leading-tight">{t(sc.nume)}</span>
                  {!unlocked && <span className="text-xs text-subtle">{t("🔒")} {sc.isPremium ? t("Premium") : `${xpNeeded} XP`}</span>}
                  {sc.seasonal && <span className="text-xs text-orange-400">{t("Sezonier")}</span>}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Sub-scenario */}
      <div className="mb-6">
        <h2 className="text-sm font-bold text-muted uppercase tracking-wider mb-3">{t("Sub-scenariu")}</h2>
        <div className="space-y-2">
          {scenario.subScenarii.map((sub) => (
            <button
              key={sub.id}
              onClick={() => setSelectedSub(sub.id)}
              className={`w-full p-3 rounded-2xl border text-left transition-all ${
                selectedSub === sub.id
                  ? "border-purple-500/60 bg-purple-600/20"
                  : "border-subtle bg-card hover:border-strong"
              }`}
            >
              <div className="font-semibold text-main text-sm">{t(sub.label)}</div>
              <div className="text-xs text-dim mt-0.5">{t(sub.description)}</div>
              <div className="flex gap-3 mt-1.5 flex-wrap">
                {sub.venitBonus !== 0 && (
                  <span className={`text-xs font-bold ${sub.venitBonus > 0 ? "text-green-400" : "text-red-400"}`}>
                    {sub.venitBonus > 0 ? "+" : ""}{sub.venitBonus} RON/{t("lună")}
                  </span>
                )}
                {sub.cheltuieliExtra.map((c) => (
                  <span key={c.nume} className={`text-xs ${c.suma > 0 ? "text-red-400" : "text-green-400"}`}>
                    {c.suma > 0 ? "-" : "+"}{Math.abs(c.suma)} {t(c.nume)}
                  </span>
                ))}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Difficulty */}
      <div className="mb-8">
        <h2 className="text-sm font-bold text-muted uppercase tracking-wider mb-3">{t("Dificultate")}</h2>
        <div className="grid grid-cols-3 gap-2">
          {(Object.entries(DIFICULTATI) as [DifficultyKey, typeof DIFICULTATI[DifficultyKey]][]).map(([key, diff]) => (
            <button
              key={key}
              onClick={() => setSelectedDiff(key)}
              className={`p-3 rounded-2xl border text-center transition-all ${
                selectedDiff === key
                  ? key === "usor" ? "border-green-500/60 bg-green-600/20 text-green-300"
                    : key === "greu" ? "border-red-500/60 bg-red-600/20 text-red-300"
                    : "border-yellow-500/60 bg-yellow-600/20 text-yellow-300"
                  : "border-subtle bg-card text-muted hover:border-strong"
              }`}
            >
              <div className="font-bold text-sm">{t(diff.nume)}</div>
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={start}
        className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-main font-black text-lg transition-all shadow-lg shadow-purple-900/30 flex items-center justify-center gap-2"
      >
        {t("Începe jocul")} <ChevronRight size={20} />
      </button>
    </div>
  );
}

function HistoryPanel({ decizii, filter, setFilter }: {
  decizii: DecizieIstorica[];
  filter: HistoryFilter;
  setFilter: (f: HistoryFilter) => void;
}) {
  const { t } = useTranslation();
  const filtered = decizii.filter((d) => {
    if (filter === "tutto") return true;
    if (filter === "luna") return d.luna === Math.max(...decizii.map((x) => x.luna));
    if (filter === "saptamana") return d.saptamana === Math.max(...decizii.map((x) => x.saptamana));
    return true;
  });

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-3">
        <Filter size={14} className="text-subtle" />
        <span className="text-sm font-bold text-muted">{t("Filtrare:")}</span>
        {(["tutto", "luna", "saptamana"] as HistoryFilter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-2 py-0.5 rounded-lg text-xs font-semibold transition-all ${
              filter === f ? "bg-purple-600/30 text-purple-300 border border-purple-500/40" : "text-subtle hover:text-muted"
            }`}
          >
            {f === "tutto" ? t("Toate") : f === "luna" ? t("Luna curentă") : t("Săptămâna curentă")}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[400px] lg:max-h-[600px]">
        {filtered.length === 0 ? (
          <div className="text-center text-faint text-sm py-8">{t("Nicio decizie încă.")}</div>
        ) : (
          [...filtered].reverse().map((d, i) => (
            <motion.div
              key={d.id}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.02 }}
              className="p-3 rounded-xl border border-subtle8 bg-card-soft4"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-strong">{t(d.titluEveniment)}</span>
                <span className="text-xs text-faint">L{d.luna}·S{d.saptamana}</span>
              </div>
              <div className="text-xs text-muted mb-1">"{t(d.alegere)}"</div>
              <div className="flex items-center gap-3">
                <span className={`text-xs font-bold ${d.baniDelta >= 0 ? "text-green-400" : "text-red-400"}`}>
                  {d.baniDelta >= 0 ? "+" : ""}{Math.round(d.baniDelta)} RON
                </span>
                <span className={`text-xs font-bold ${d.fericireDelta >= 0 ? "text-blue-400" : "text-orange-400"}`}>
                  {d.fericireDelta >= 0 ? "+" : ""}{Math.round(d.fericireDelta)}%
                </span>
              </div>
              <div className="text-xs text-faint italic mt-1">{t(d.lectie)}</div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}

function GameScreen() {
  const { t } = useTranslation();
  const { state, nextWeek, resetGame } = useGame();
  const [, navigate] = useLocation();
  const [historyFilter, setHistoryFilter] = useState<HistoryFilter>("tutto");
  const [showHistory, setShowHistory] = useState(false);

  if (!state) return null;

  const scenario = SCENARII[state.scenariuId];
  const subScenariu = scenario.subScenarii.find((s) => s.id === state.subScenariuId) ?? scenario.subScenarii[0];
  const diff = DIFICULTATI[state.dificultateKey];
  const moneyPct = Math.max(0, Math.min(100, (state.bani / 5000) * 100));
  const happyPct = Math.max(0, Math.min(100, state.fericire));
  const weekPct = (state.saptamana / 48) * 100;
  const allCheltuieli = [
    ...scenario.cheltuieliFixe,
    ...subScenariu.cheltuieliExtra.filter((c) => c.suma > 0),
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => { resetGame(); window.location.href = "/game"; }} className="inline-flex items-center gap-1.5 text-dim hover:text-main text-sm transition-colors">
          <ArrowLeft size={14} /> {t("Schimbă scenariul")}</button>
        <div className="text-xs text-subtle">{t(diff.nume)} · {scenario.emoji} {t(scenario.nume)}</div>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Main game column */}
        <div className="lg:col-span-2 space-y-4">
          {/* Progress */}
          <div className="p-4 rounded-2xl border border-subtle bg-card">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <Calendar size={14} className="text-purple-400" />
                <span className="font-bold text-main text-sm">
                  {t("Luna")} {state.luna} · {t("Săptămâna")} {state.saptamanaInLuna} {t("din")} 4
                </span>
              </div>
              <span className="text-xs text-subtle">{state.saptamana}/48</span>
            </div>
            <div className="w-full h-2 bg-card-hover rounded-full overflow-hidden mt-2">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-orange-500 rounded-full transition-all duration-500"
                style={{ width: `${weekPct}%` }}
              />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl border border-subtle bg-card">
              <div className="flex items-center gap-2 mb-2">
                <Coins size={16} className="text-yellow-400" />
                <span className="text-sm font-bold text-strong">{t("Bani disponibili")}</span>
              </div>
              <div className={`text-2xl font-black mb-2 ${state.bani < 0 ? "text-red-400" : state.bani < 500 ? "text-orange-400" : "text-main"}`}>
                {Math.round(state.bani).toLocaleString("ro-RO")} RON
              </div>
              <div className="w-full h-2 bg-card-hover rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${state.bani < 500 ? "bg-red-500" : "bg-gradient-to-r from-yellow-500 to-green-500"}`}
                  style={{ width: `${moneyPct}%` }}
                />
              </div>
            </div>
            <div className="p-4 rounded-2xl border border-subtle bg-card">
              <div className="flex items-center gap-2 mb-2">
                <Smile size={16} className="text-green-400" />
                <span className="text-sm font-bold text-strong">{t("Fericire / Energie")}</span>
              </div>
              <div className={`text-2xl font-black mb-2 ${state.fericire < 20 ? "text-red-400" : state.fericire < 50 ? "text-orange-400" : "text-main"}`}>
                {Math.round(state.fericire)}%
              </div>
              <div className="w-full h-2 bg-card-hover rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${state.fericire < 30 ? "bg-red-500" : "bg-gradient-to-r from-green-500 to-teal-500"}`}
                  style={{ width: `${happyPct}%` }}
                />
              </div>
            </div>
          </div>

          {/* Fixed costs */}
          <div className="p-4 rounded-2xl border border-subtle bg-card">
            <h3 className="text-sm font-bold text-muted mb-3">{t("Cheltuieli fixe lunare")}</h3>
            <div className="space-y-1.5">
              {allCheltuieli.map((c, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-xs text-muted">{t(c.nume)}</span>
                  <span className="text-xs font-bold text-red-400">-{c.suma} RON</span>
                </div>
              ))}
              <div className="border-t border-subtle pt-1.5 flex items-center justify-between">
                <span className="text-xs font-bold text-muted">{t("Total / lună")}</span>
                <span className="text-xs font-black text-red-400">
                  -{allCheltuieli.reduce((s, c) => s + c.suma, 0)} RON
                </span>
              </div>
            </div>
          </div>

          {/* Next week button */}
          <button
            onClick={nextWeek}
            disabled={!!state.evenimentCurent}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 disabled:opacity-50 disabled:cursor-not-allowed text-main font-black text-base transition-all shadow-lg shadow-purple-900/30 flex items-center justify-center gap-2"
          >
            {t("Avansează la săptămâna următoare")} <ChevronRight size={18} />
          </button>

          {/* History toggle (mobile) */}
          <button
            className="lg:hidden w-full py-2.5 rounded-xl border border-medium bg-card text-muted text-sm font-semibold"
            onClick={() => setShowHistory((v) => !v)}
          >
            {showHistory ? t("Ascunde istoricul") : <>{t("Afișează istoricul")} ({state.istoricDecizii.length} {t("decizii")})</>}
          </button>

          {/* History (mobile) */}
          <AnimatePresence>
            {showHistory && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="lg:hidden overflow-hidden"
              >
                <div className="p-4 rounded-2xl border border-subtle bg-card">
                  <HistoryPanel decizii={state.istoricDecizii} filter={historyFilter} setFilter={setHistoryFilter} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* History sidebar (desktop) */}
        <div className="hidden lg:block p-4 rounded-2xl border border-subtle bg-card self-start sticky top-20">
          <h3 className="text-sm font-bold text-main mb-3">{t("Istoricul deciziilor")}</h3>
          <HistoryPanel decizii={state.istoricDecizii} filter={historyFilter} setFilter={setHistoryFilter} />
        </div>
      </div>
    </div>
  );
}

export default function GamePage() {
  const { state, resetGame, initGame } = useGame();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sc = params.get("scenario");
    if (sc && state && state.scenariuId !== sc) {
      resetGame();
    } else if (!sc) {
      resetGame();
    }
  }, []);

  const scenariuId = state?.scenariuId ?? "camin";
  const scenario = SCENARII[scenariuId];
  const currentScenario = window.location.search.includes("scenario=") 
    ? new URLSearchParams(window.location.search).get("scenario") || scenariuId 
    : scenariuId;
  const hasUrlScenario = !!new URLSearchParams(window.location.search).get("scenario");

  return (
    <Layout>
      <OrbBackground bgClass={state ? scenario?.bgClass : undefined} />
      {state ? <GameScreen /> : <SetupScreen key={currentScenario} />}
      <EventModal />
      <WeeklyQuiz />
      <GameOver />
    </Layout>
  );
}
