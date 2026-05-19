import { motion, AnimatePresence } from "framer-motion";
import { useGame } from "@/context/GameContext";
import { Coins, Smile, BookOpen } from "lucide-react";
import type { GameEvent } from "@/data/events";

function getMergedEvent(event: GameEvent, subScenariuId: string | undefined): GameEvent {
  if (!subScenariuId || !event.subScenariuModificari) {
    return event;
  }
  const override = event.subScenariuModificari[subScenariuId];
  if (!override) {
    return event;
  }
  return {
    ...event,
    descriere: override.descriere ?? event.descriere,
    optiuni: override.optiuni ?? event.optiuni,
  };
}

export function EventModal() {
  const { state, chooseOption } = useGame();

  if (!state || !state.evenimentCurent) return null;
  const baseEvent = state.evenimentCurent;
  const ev = getMergedEvent(baseEvent, state.subScenariuId);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ type: "spring", damping: 24, stiffness: 300 }}
          className="relative w-full max-w-lg bg-[#0d0820] border border-purple-500/30 rounded-3xl shadow-2xl shadow-purple-900/40 overflow-hidden"
        >
          {/* Header glow */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-purple-500 via-fuchsia-500 to-orange-500" />

          {/* Current stats badge */}
          <div className="flex items-center gap-4 px-5 pt-5 pb-3 border-b border-white/10">
            <div className="flex items-center gap-1.5 text-sm">
              <Coins size={14} className="text-yellow-400" />
              <span className="font-bold text-white">{Math.round(state.bani)} RON</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm">
              <Smile size={14} className="text-green-400" />
              <span className="font-bold text-white">{Math.round(state.fericire)}%</span>
            </div>
            <span className="ml-auto text-xs text-white/40">Luna {state.luna} · Săpt. {state.saptamanaInLuna}</span>
          </div>

          <div className="p-5">
            <h3 className="text-xl font-black text-white mb-2">{ev.titlu}</h3>
            <p className="text-white/70 text-sm mb-5">{ev.descriere}</p>

            {/* Options */}
            <div className="space-y-2.5">
              {ev.optiuni.map((opt, i) => {
                const baniPositive = opt.bani >= 0;
                const fericirePositive = opt.fericirePct >= 0;
                return (
                  <motion.button
                    key={i}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => chooseOption(i)}
                    className="w-full text-left p-4 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all group"
                  >
                    <div className="font-semibold text-white text-sm mb-2 group-hover:text-purple-200 transition-colors">
                      {opt.text}
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className={`flex items-center gap-1 text-xs font-bold ${baniPositive ? "text-green-400" : "text-red-400"}`}>
                        <Coins size={11} />
                        {baniPositive ? "+" : ""}{opt.bani} RON
                      </span>
                      <span className={`flex items-center gap-1 text-xs font-bold ${fericirePositive ? "text-green-400" : "text-red-400"}`}>
                        <Smile size={11} />
                        {fericirePositive ? "+" : ""}{opt.fericirePct}%
                      </span>
                      {opt.bonusXP && (
                        <span className="text-xs text-purple-300 font-bold">+{opt.bonusXP} XP</span>
                      )}
                    </div>
                    <div className="flex items-start gap-1.5 mt-2">
                      <BookOpen size={11} className="text-white/30 shrink-0 mt-0.5" />
                      <span className="text-xs text-white/40 italic">{opt.lectie}</span>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
