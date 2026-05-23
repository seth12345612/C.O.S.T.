import { motion, AnimatePresence } from "framer-motion";
import { useGame } from "@/context/GameContext";
import { Coins, Smile, ChevronRight } from "lucide-react";

export function EventModal() {
  const { state, chooseOption } = useGame();

  if (!state || !state.evenimentCurent) return null;
  const ev = state.evenimentCurent;

  function handleContinue() {
    const idx = Math.floor(Math.random() * ev.optiuni.length);
    chooseOption(idx);
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-overlay backdrop-blur-sm"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ type: "spring", damping: 24, stiffness: 300 }}
          className="relative w-full max-w-lg bg-card-strong border border-purple-500/30 rounded-3xl shadow-2xl shadow-purple-900/40 overflow-hidden"
        >
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-purple-500 via-fuchsia-500 to-orange-500" />

          <div className="flex items-center gap-4 px-5 pt-5 pb-3 border-b border-subtle">
            <div className="flex items-center gap-1.5 text-sm">
              <Coins size={14} className="text-yellow-400" />
              <span className="font-bold text-main">{Math.round(state.bani)} RON</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm">
              <Smile size={14} className="text-green-400" />
              <span className="font-bold text-main">{Math.round(state.fericire)}%</span>
            </div>
            <span className="ml-auto text-xs text-subtle">Luna {state.luna} · Săpt. {state.saptamanaInLuna}</span>
          </div>

          <div className="p-5">
            <h3 className="text-xl font-black text-main mb-2">{ev.titlu}</h3>
            <p className="text-strong text-sm mb-6">{ev.descriere}</p>

            <button
              onClick={handleContinue}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 transition-all text-main font-bold text-sm flex items-center justify-center gap-2"
            >
              Continuă <ChevronRight size={16} />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}