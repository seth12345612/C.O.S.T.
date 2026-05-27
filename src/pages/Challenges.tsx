import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { OrbBackground } from "@/components/OrbBackground";
import { Layout } from "@/components/Layout";
import { WEEKLY_CHALLENGES, MONTHLY_CHALLENGES, PREMIUM_CHALLENGES } from "@/data/challenges";
import { Calendar, Clock, CheckCircle, Zap, Gift, Crown, Lock } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const STORAGE_KEY = "cost_completed_challenges";

function loadCompleted(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveCompleted(ids: string[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
}

const dificultateCuloare: Record<string, string> = {
  usor: "text-green-400 bg-green-500/10 border-green-500/20",
  mediu: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
  greu: "text-red-400 bg-red-500/10 border-red-500/20",
};

const dificultateLabel: Record<string, string> = {
  usor: "Ușor",
  mediu: "Mediu",
  greu: "Greu",
};

export default function Challenges() {
  const [completed, setCompleted] = useState<string[]>(loadCompleted);
  const { subscriptionTier } = useAuth();
  const isAdvanced = subscriptionTier === "premium_advanced";

  useEffect(() => {
    saveCompleted(completed);
  }, [completed]);

  const toggleComplete = (id: string) => {
    setCompleted((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const allChallenges = [...WEEKLY_CHALLENGES, ...MONTHLY_CHALLENGES, ...PREMIUM_CHALLENGES];
  const completedChallenges = allChallenges.filter((c) =>
    completed.includes(c.id)
  );
  const pendingChallenges = allChallenges.filter(
    (c) => !completed.includes(c.id)
  );

  const renderChallenge = (challenge: typeof allChallenges[number], index: number) => {
    const isDone = completed.includes(challenge.id);
    const isLocked = challenge.isPremium && !isAdvanced;
    return (
      <motion.div
        key={challenge.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className={`relative rounded-xl p-4 border transition-all ${
          isLocked
            ? "bg-gray-900/50 border-gray-700/30 opacity-60"
            : isDone
              ? "bg-green-500/5 border-green-500/30"
              : "bg-card border-subtle hover:border-white/10"
        }`}
      >
        <div className="flex items-start gap-3">
          <span className="text-2xl shrink-0">{isLocked ? "🔒" : challenge.emoji}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className={`font-semibold text-sm ${isDone ? "text-green-400" : isLocked ? "text-gray-500" : "text-main"}`}>
                {challenge.titlu}
              </p>
              {isDone && <CheckCircle size={14} className="text-green-400 shrink-0" />}
              {challenge.isPremium && !isLocked && <Crown size={12} className="text-purple-400 shrink-0" />}
              {isLocked && <Lock size={12} className="text-gray-500 shrink-0" />}
            </div>
            <p className="text-xs text-subtle mt-0.5">{challenge.descriere}</p>
            <p className="text-[11px] text-dim mt-1 italic">
              {challenge.obiectiv}
            </p>
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${dificultateCuloare[challenge.dificultate]}`}>
                {dificultateLabel[challenge.dificultate]}
              </span>
              <span className="flex items-center gap-1 text-[10px] text-yellow-400">
                <Zap size={10} /> +{challenge.recompensaXP} XP
              </span>
              <span className="flex items-center gap-1 text-[10px] text-green-400">
                <Gift size={10} /> +{challenge.recompensaBani} RON
              </span>
              {challenge.isPremium && (
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full border border-purple-500/30 text-purple-400 bg-purple-500/10">
                  Premium
                </span>
              )}
            </div>
          </div>
          <button
            onClick={() => !isLocked && toggleComplete(challenge.id)}
            disabled={isLocked}
            className={`shrink-0 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
              isLocked
                ? "bg-gray-800 text-gray-500 border border-gray-700/30 cursor-not-allowed"
                : isDone
                  ? "bg-green-500/20 text-green-400 border border-green-500/30"
                  : "bg-card-hover text-muted border border-subtle hover:bg-white/10 hover:text-main"
            }`}
          >
            {isLocked ? "Premium" : isDone ? "Finalizat" : "Marchează ca finalizat"}
          </button>
        </div>
      </motion.div>
    );
  };

  return (
    <Layout>
      <OrbBackground />
      <div className="relative z-10 max-w-4xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs mb-4">
            <Zap size={12} /> Provocări
          </div>
          <h1 className="text-3xl font-bold text-main mb-2">Provocări</h1>
          <p className="text-dim">
            {completed.length} / {allChallenges.length} completate
          </p>
        </motion.div>

        {completedChallenges.length > 0 && (
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-10"
          >
            <h2 className="text-lg font-bold text-green-400 mb-3 flex items-center gap-2">
              <CheckCircle size={16} /> Finalizate
            </h2>
            <div className="space-y-2">
              {completedChallenges.map((c, i) => renderChallenge(c, i))}
            </div>
          </motion.section>
        )}

        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-10"
        >
          <h2 className="text-lg font-bold text-main mb-3 flex items-center gap-2">
            <Calendar size={16} className="text-cyan-400" /> Săptămânale
          </h2>
          <div className="space-y-2">
            {WEEKLY_CHALLENGES.filter((c) => !completed.includes(c.id)).map(
              (c, i) => renderChallenge(c, i)
            )}
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <h2 className="text-lg font-bold text-main mb-3 flex items-center gap-2">
            <Clock size={16} className="text-orange-400" /> Lunare
          </h2>
          <div className="space-y-2">
            {MONTHLY_CHALLENGES.filter((c) => !completed.includes(c.id)).map(
              (c, i) => renderChallenge(c, i)
            )}
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-10"
        >
          <h2 className="text-lg font-bold text-main mb-3 flex items-center gap-2">
            <Crown size={16} className="text-purple-400" /> Premium
            {!isAdvanced && <span className="text-[10px] text-muted font-normal ml-1">(necesită Premium Advanced)</span>}
          </h2>
          <div className="space-y-2">
            {PREMIUM_CHALLENGES.filter((c) => !completed.includes(c.id)).map(
              (c, i) => renderChallenge(c, i)
            )}
          </div>
        </motion.section>
      </div>
    </Layout>
  );
}
