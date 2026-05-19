import { motion } from "framer-motion";
import { Coins, Smile, BookOpen, Star, X, CheckCircle } from "lucide-react";
import type { LimitedEvent } from "@/data/limitedEvents";
import { useXP } from "@/context/XPContext";
import { useState, useEffect } from "react";

const COMPLETED_KEY = "cost_limited_events_completed";

interface CompletedChoice {
  eventId: string;
  optionIndex: number;
  bani: number;
  fericirePct: number;
  lectie: string;
  timestamp: number;
}

function getCompleted(): Record<string, CompletedChoice> {
  try {
    const raw = localStorage.getItem(COMPLETED_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function saveCompleted(eventId: string, choice: CompletedChoice) {
  const all = getCompleted();
  all[eventId] = choice;
  localStorage.setItem(COMPLETED_KEY, JSON.stringify(all));
}

interface LimitedEventModalProps {
  event: LimitedEvent;
  onClose: () => void;
}

export function LimitedEventModal({ event, onClose }: LimitedEventModalProps) {
  const { addXP } = useXP();
  const [completed, setCompleted] = useState<CompletedChoice | null>(null);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const all = getCompleted();
    if (all[event.id]) {
      setCompleted(all[event.id]);
      setDone(true);
    }
  }, [event.id]);

  const handleChoose = (index: number) => {
    const opt = event.optiuni?.[index];
    if (!opt || completed) return;

    setSelectedOpt(index);

    const choice: CompletedChoice = {
      eventId: event.id,
      optionIndex: index,
      bani: opt.bani,
      fericirePct: opt.fericirePct,
      lectie: opt.lectie,
      timestamp: Date.now(),
    };

    saveCompleted(event.id, choice);
    setCompleted(choice);

    if (opt.bonusXP) {
      addXP(opt.bonusXP);
    }

    setTimeout(() => {
      setDone(true);
    }, 300);
  };

  if (done && completed) {
    const chosenOpt = event.optiuni?.[completed.optionIndex];
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="relative w-full max-w-md bg-[#0d0820] rounded-3xl shadow-2xl overflow-hidden"
          style={{ borderColor: `${event.culoare}60`, borderWidth: 1 }}
        >
          <div
            className="absolute top-0 inset-x-0 h-1"
            style={{ background: `linear-gradient(to right, ${event.culoare}, ${event.culoare}88)` }}
          />
          <div className="p-6 text-center">
            <div className="text-4xl mb-3">{event.emoji}</div>
            <div className="flex items-center justify-center gap-2 mb-2">
              <CheckCircle size={18} className="text-green-400" />
              <span className="font-bold text-green-400 text-sm">Deja participat</span>
            </div>
            <h3 className="font-black text-white text-lg mb-1">{event.titlu}</h3>
            <div className="p-3 rounded-xl border border-green-500/20 bg-green-500/5 text-left mt-4">
              <div className="text-xs text-white/40 mb-1 font-medium">Ai ales:</div>
              <div className="text-sm text-white mb-2 font-semibold">{chosenOpt?.text}</div>
              <div className="flex items-center gap-3 flex-wrap">
                <span className={`flex items-center gap-1 text-xs font-bold ${completed.bani >= 0 ? "text-green-400" : "text-red-400"}`}>
                  <Coins size={10} />
                  {completed.bani >= 0 ? "+" : ""}{completed.bani} RON
                </span>
                <span className={`flex items-center gap-1 text-xs font-bold ${completed.fericirePct >= 0 ? "text-green-400" : "text-red-400"}`}>
                  <Smile size={10} />
                  {completed.fericirePct >= 0 ? "+" : ""}{completed.fericirePct}%
                </span>
              </div>
              <div className="flex items-start gap-1.5 mt-2">
                <BookOpen size={10} className="text-white/30 shrink-0 mt-0.5" />
                <span className="text-xs text-white/40 italic">{completed.lectie}</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="mt-4 w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white/70 text-sm font-medium transition-all"
            >
              Închide
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (done) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ type: "spring", damping: 24, stiffness: 300 }}
        className="relative w-full max-w-lg bg-[#0d0820] rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
        style={{ borderColor: `${event.culoare}60`, borderWidth: 1 }}
      >
        <div
          className="absolute top-0 inset-x-0 h-1"
          style={{ background: `linear-gradient(to right, ${event.culoare}, ${event.culoare}88)` }}
        />

        <div className="flex items-center gap-4 px-5 pt-5 pb-3 border-b border-white/10">
          <span className="text-2xl">{event.emoji}</span>
          <div>
            <div className="font-bold text-white text-sm">{event.titlu}</div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="flex items-center gap-1 text-xs text-purple-300">
                <Star size={10} />
                Eveniment cu timp limitat
              </span>
              <span className="text-xs text-yellow-300 font-semibold">+{event.bonusXP} XP</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="ml-auto p-1.5 rounded-lg text-white/30 hover:text-white hover:bg-white/10 transition-all"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-5">
          <p className="text-white/70 text-sm mb-5">{event.descriere}</p>

          <div className="space-y-2.5">
            {event.optiuni?.map((opt, i) => {
              const baniPos = opt.bani >= 0;
              const fericirePos = opt.fericirePct >= 0;
              const isSelected = selectedOpt === i;
              return (
                <div
                  key={i}
                  onClick={() => handleChoose(i)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? "border-green-500/40 bg-green-500/10"
                      : "border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-semibold text-white text-sm flex-1 pr-3">
                      {opt.text}
                    </div>
                    {isSelected && (
                      <span className="text-green-400 text-sm font-bold shrink-0">✓ Ales</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 flex-wrap mb-2">
                    <span className={`flex items-center gap-1 text-xs font-bold ${baniPos ? "text-green-400" : "text-red-400"}`}>
                      <Coins size={11} />
                      {baniPos ? "+" : ""}{opt.bani} RON
                    </span>
                    <span className={`flex items-center gap-1 text-xs font-bold ${fericirePos ? "text-green-400" : "text-red-400"}`}>
                      <Smile size={11} />
                      {fericirePos ? "+" : ""}{opt.fericirePct}%
                    </span>
                    {opt.bonusXP && (
                      <span className="text-xs text-purple-300 font-bold">+{opt.bonusXP} XP</span>
                    )}
                  </div>
                  <div className="flex items-start gap-1.5">
                    <BookOpen size={11} className="text-white/30 shrink-0 mt-0.5" />
                    <span className="text-xs text-white/40 italic">{opt.lectie}</span>
                  </div>
                  {opt.explicatie && (
                    <div className="mt-2 p-2.5 rounded-xl bg-white/3 border border-white/5">
                      <div className="text-xs text-white/30 leading-relaxed">{opt.explicatie}</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <button
            onClick={onClose}
            className="mt-4 w-full py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white/70 text-sm font-medium transition-all"
          >
            Anulează
          </button>
        </div>
      </motion.div>
    </div>
  );
}