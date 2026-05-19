import { motion } from "framer-motion";
import { Link } from "wouter";
import { useGame } from "@/context/GameContext";
import { useXP } from "@/context/XPContext";
<<<<<<< HEAD
import { useFinance } from "@/context/FinanceContext";
import { useAuth } from "@/context/AuthContext";
import { Trophy, RotateCcw, TrendingUp, Coins, Smile } from "lucide-react";
import { useEffect, useRef } from "react";
import { saveLeaderboardEntry, getScenarioLabel } from "@/lib/leaderboard";
import { DIFICULTATI } from "@/data/scenarios";
=======
import { Trophy, RotateCcw, TrendingUp, Coins, Smile } from "lucide-react";
import { useEffect, useRef } from "react";
import { saveLeaderboardEntry, getScenarioLabel } from "@/lib/leaderboard";
>>>>>>> bca33c6a3a6b536a83ed88053ea89ffdd976de0f

export function GameOver() {
  const { state, startEndless, resetGame } = useGame();
  const { addXP } = useXP();
<<<<<<< HEAD
  const { addTransaction } = useFinance();
  const { user } = useAuth();
  const xpAdded = useRef(false);
  const scoreSaved = useRef(false);
  const moneyTransferred = useRef(false);
=======
  const xpAdded = useRef(false);
  const scoreSaved = useRef(false);
>>>>>>> bca33c6a3a6b536a83ed88053ea89ffdd976de0f

  const isWin = state && state.saptamana >= 48 && state.bani >= 0 && state.fericire > 0;

  useEffect(() => {
    if (!state?.isGameOver) {
      xpAdded.current = false;
      scoreSaved.current = false;
      return;
    }

    if (!xpAdded.current) {
      xpAdded.current = true;
<<<<<<< HEAD
      const diffXP = { usor: 50, mediu: 75, greu: 100 };
      const baseXP = diffXP[state.dificultateKey] ?? 50;
      const bonusXP = state.limitedEventBonus?.xp ?? 0;
      const totalXP = baseXP + bonusXP;
      addXP(totalXP);
    }

    if (isWin && !moneyTransferred.current) {
      moneyTransferred.current = true;
      addTransaction({
        tip: "venit",
        descriere: `Câștig din scenariu ${getScenarioLabel(state.scenariuId, state.subScenariuId)}`,
        suma: Math.round(state.bani),
        categorie: "Altele",
        data: new Date().toISOString().split("T")[0],
      });
    }

    if (!scoreSaved.current) {
      scoreSaved.current = true;
      const months = Math.max(1, Math.ceil(state.saptamana / 4));
      const username = user?.name || "Anonim";
      saveLeaderboardEntry({
        username,
=======
      const baseXP = state.saptamana * 2;
      const bonusXP = state.limitedEventBonus?.xp ?? 0;
      const totalXP = Math.max(20, baseXP) + bonusXP;
      addXP(totalXP);
    }

    if (!scoreSaved.current) {
      scoreSaved.current = true;
      const months = Math.max(1, Math.ceil(state.saptamana / 4));
      saveLeaderboardEntry({
        username: "Tu",
>>>>>>> bca33c6a3a6b536a83ed88053ea89ffdd976de0f
        score: Math.round(state.bani),
        months,
        scenario: getScenarioLabel(state.scenariuId, state.subScenariuId),
      });
    }
<<<<<<< HEAD
  }, [state, addXP, addTransaction, user]);

  if (!state || !state.isGameOver) return null;

  const diffXP = { usor: 50, mediu: 75, greu: 100 };
  const xpEarned = diffXP[state.dificultateKey] ?? 50 + (state.limitedEventBonus?.xp ?? 0);
  const difficultyName = DIFICULTATI[state.dificultateKey]?.nume ?? "Ușor";
=======
  }, [state, addXP]);

  if (!state || !state.isGameOver) return null;

  const xpEarned = Math.max(20, state.saptamana * 2) + (state.limitedEventBonus?.xp ?? 0);
>>>>>>> bca33c6a3a6b536a83ed88053ea89ffdd976de0f

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", damping: 20, stiffness: 250 }}
        className="relative w-full max-w-lg bg-[#0d0820] border border-purple-500/30 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
      >
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-purple-500 via-fuchsia-500 to-orange-500" />

        <div className="p-6">
          <div className="text-center mb-6">
            <div className="text-5xl mb-3">{isWin ? "🏆" : "💸"}</div>
            <h2 className="text-2xl font-black text-white mb-1">{state.gameOverTitle}</h2>
            <p className="text-white/60 text-sm">{state.gameOverReason}</p>
          </div>

          {/* Final stats */}
<<<<<<< HEAD
          <div className="grid grid-cols-4 gap-2 mb-5">
            <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10 text-center">
              <Coins size={14} className="text-yellow-400 mx-auto mb-1" />
              <div className="font-black text-white text-xs">{Math.round(state.bani)} RON</div>
              <div className="text-[10px] text-white/40">Bani finali</div>
            </div>
            <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10 text-center">
              <Smile size={14} className="text-green-400 mx-auto mb-1" />
              <div className="font-black text-white text-xs">{Math.round(state.fericire)}%</div>
              <div className="text-[10px] text-white/40">Fericire</div>
            </div>
            <div className="p-2.5 rounded-2xl bg-purple-600/20 border border-purple-500/30 text-center">
              <TrendingUp size={14} className="text-purple-400 mx-auto mb-1" />
              <div className="font-black text-purple-300 text-xs">+{xpEarned} XP</div>
              <div className="text-[10px] text-white/40">Câștigat</div>
            </div>
            <div className="p-2.5 rounded-2xl bg-orange-600/20 border border-orange-500/30 text-center">
              <div className="font-black text-orange-300 text-xs">{difficultyName}</div>
              <div className="text-[10px] text-white/40">Dificultate</div>
=======
          <div className="grid grid-cols-3 gap-3 mb-5">
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-center">
              <Coins size={16} className="text-yellow-400 mx-auto mb-1" />
              <div className="font-black text-white text-sm">{Math.round(state.bani)} RON</div>
              <div className="text-xs text-white/40">Bani finali</div>
            </div>
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-center">
              <Smile size={16} className="text-green-400 mx-auto mb-1" />
              <div className="font-black text-white text-sm">{Math.round(state.fericire)}%</div>
              <div className="text-xs text-white/40">Fericire</div>
            </div>
            <div className="p-3 rounded-2xl bg-purple-600/20 border border-purple-500/30 text-center">
              <TrendingUp size={16} className="text-purple-400 mx-auto mb-1" />
              <div className="font-black text-purple-300 text-sm">+{xpEarned} XP</div>
              <div className="text-xs text-white/40">Câștigat</div>
>>>>>>> bca33c6a3a6b536a83ed88053ea89ffdd976de0f
            </div>
          </div>

          {/* Decisions summary */}
          {state.istoricDecizii.length > 0 && (
            <div className="mb-5">
              <h3 className="text-sm font-bold text-white/80 mb-2 flex items-center gap-1.5">
                <Trophy size={14} className="text-yellow-400" />
                Istoricul deciziilor tale
              </h3>
              <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                {state.istoricDecizii.map((d) => (
                  <div key={d.id} className="p-2.5 rounded-xl bg-white/5 border border-white/8">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-xs font-semibold text-white/70">{d.titluEveniment}</span>
                      <span className="text-xs text-white/40">L{d.luna} S{d.saptamana}</span>
                    </div>
                    <div className="text-xs text-white/50 mb-1">"{d.alegere}"</div>
                    <div className="text-xs text-white/30 italic">{d.lectie}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-2">
            {isWin && (
              <button
                onClick={startEndless}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white font-bold transition-all"
              >
                Continuă în Mod Endless
              </button>
            )}
            <button
              onClick={resetGame}
              className="w-full py-3 rounded-2xl border border-white/20 hover:border-white/40 text-white/80 hover:text-white font-semibold transition-all flex items-center justify-center gap-2"
            >
              <RotateCcw size={16} />
              Joc nou
            </button>
            <Link
              href="/"
              onClick={resetGame}
              className="w-full py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-center font-medium transition-all text-sm"
            >
              Înapoi la meniu
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
