import { motion } from "framer-motion";
import { Link } from "wouter";
import { useGame } from "@/context/GameContext";
import { useXP } from "@/context/XPContext";
import { useFinance } from "@/context/FinanceContext";
import { useAuth } from "@/context/AuthContext";
import { useAchievements } from "@/context/AchievementContext";
import { SoundEffects } from "@/lib/sounds";
import { Trophy, RotateCcw, TrendingUp, Coins, Smile } from "lucide-react";
import { useEffect, useRef } from "react";
import { getScenarioLabel } from "@/data/scenarios";
import { DIFICULTATI } from "@/data/scenarios";

export function GameOver() {
  const { state, startEndless, resetGame } = useGame();
  const { addXP } = useXP();
  const { financeState, addTransaction, deleteTransaction } = useFinance();
  const { user, dbUser } = useAuth();
  const { actualizeazaStats, stats } = useAchievements();
  const xpAdded = useRef(false);
  const moneyTransferred = useRef(false);
  const capitalSaved = useRef(false);

  const isWin = state && state.saptamana >= 48 && state.bani >= 0 && state.fericire > 0;

  useEffect(() => {
    if (!state?.isGameOver) {
      xpAdded.current = false;
      capitalSaved.current = false;
      return;
    }

    if (!xpAdded.current) {
      if (isWin) SoundEffects.success();
      else SoundEffects.gameOver();
    }

    actualizeazaStats({
      totalJocuri: stats.totalJocuri + 1,
      scenariiJucate: [...new Set([...stats.scenariiJucate, state.scenariuId])],
      baniTotaliCastigati: stats.baniTotaliCastigati + Math.max(0, Math.round(state.bani)),
      evenimenteCompletate: stats.evenimenteCompletate + state.istoricDecizii.length,
      totalVictorii: isWin ? stats.totalVictorii + 1 : stats.totalVictorii,
    });

    if (!xpAdded.current) {
      xpAdded.current = true;
      const diffXP = { usor: 50, mediu: 75, greu: 100 };
      const baseXP = diffXP[state.dificultateKey] ?? 50;
      const bonusXP = state.limitedEventBonus?.xp ?? 0;
      const totalXP = baseXP + bonusXP;
      addXP(totalXP);
    }

    if (isWin && !moneyTransferred.current) {
      moneyTransferred.current = true;
      financeState.tranzactii.forEach((t) => {
        if (t.tip === "venit" && (t.descriere.startsWith("Capital rămas") || t.descriere.startsWith("Câștig din scenariu"))) {
          deleteTransaction(t.id);
        }
      });
      addTransaction({
        tip: "venit",
        descriere: `Capital rămas: ${getScenarioLabel(state.scenariuId, state.subScenariuId)}`,
        suma: Math.round(state.bani),
        categorie: "Altele",
        data: new Date().toISOString().split("T")[0],
      });
    }

    if (!capitalSaved.current) {
      capitalSaved.current = true;
      localStorage.setItem("cost_capital", JSON.stringify(Math.round(state.bani)));
    }
  }, [state, addXP, addTransaction, deleteTransaction, financeState.tranzactii, user]);

  if (!state || !state.isGameOver) return null;

  const diffXP = { usor: 50, mediu: 75, greu: 100 };
  const xpEarned = diffXP[state.dificultateKey] ?? 50 + (state.limitedEventBonus?.xp ?? 0);
  const difficultyName = DIFICULTATI[state.dificultateKey]?.nume ?? "Ușor";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-overlay-strong backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", damping: 20, stiffness: 250 }}
        className="relative w-full max-w-lg bg-card-strong border border-purple-500/30 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
      >
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-purple-500 via-fuchsia-500 to-orange-500" />

        <div className="p-6">
          <div className="text-center mb-6">
            <div className="text-5xl mb-3">{isWin ? "🏆" : "💸"}</div>
            <h2 className="text-2xl font-black text-main mb-1">{state.gameOverTitle}</h2>
            <p className="text-muted text-sm">{state.gameOverReason}</p>
          </div>

          <div className="grid grid-cols-4 gap-2 mb-5">
            <div className="p-2.5 rounded-2xl bg-card border border-subtle text-center">
              <Coins size={14} className="text-yellow-400 mx-auto mb-1" />
              <div className="font-black text-main text-xs">{Math.round(state.bani)} RON</div>
              <div className="text-[10px] text-subtle">Bani finali</div>
            </div>
            <div className="p-2.5 rounded-2xl bg-card border border-subtle text-center">
              <Smile size={14} className="text-green-400 mx-auto mb-1" />
              <div className="font-black text-main text-xs">{Math.round(state.fericire)}%</div>
              <div className="text-[10px] text-subtle">Fericire</div>
            </div>
            <div className="p-2.5 rounded-2xl bg-purple-600/20 border border-purple-500/30 text-center">
              <TrendingUp size={14} className="text-purple-400 mx-auto mb-1" />
              <div className="font-black text-purple-300 text-xs">+{xpEarned} XP</div>
              <div className="text-[10px] text-subtle">Câștigat</div>
            </div>
            <div className="p-2.5 rounded-2xl bg-orange-600/20 border border-orange-500/30 text-center">
              <div className="font-black text-orange-300 text-xs">{difficultyName}</div>
              <div className="text-[10px] text-subtle">Dificultate</div>
            </div>
          </div>

          {state.istoricDecizii.length > 0 && (
            <div className="mb-5">
              <h3 className="text-sm font-bold text-bright mb-2 flex items-center gap-1.5">
                <Trophy size={14} className="text-yellow-400" />
                Istoricul deciziilor tale
              </h3>
              <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                {state.istoricDecizii.map((d) => (
                  <div key={d.id} className="p-2.5 rounded-xl bg-card border border-subtle8">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-xs font-semibold text-strong">{d.titluEveniment}</span>
                      <span className="text-xs text-subtle">L{d.luna} S{d.saptamana}</span>
                    </div>
                    <div className="text-xs text-dim mb-1">\"{d.alegere}\"</div>
                    <div className="text-xs text-faint italic">{d.lectie}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2">
            {isWin && (
              <button
                onClick={startEndless}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-main font-bold transition-all"
              >
                Continuă în Mod Endless
              </button>
            )}
            <button
              onClick={resetGame}
              className="w-full py-3 rounded-2xl border border-strong hover:border-strongest text-bright hover:text-main font-semibold transition-all flex items-center justify-center gap-2"
            >
              <RotateCcw size={16} />
              Joc nou
            </button>
            <Link
              href="/"
              onClick={resetGame}
              className="w-full py-3 rounded-2xl bg-card hover:bg-card-hover text-muted hover:text-main text-center font-medium transition-all text-sm"
            >
              Înapoi la meniu
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

