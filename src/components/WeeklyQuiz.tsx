import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGame } from "@/context/GameContext";
import { Coins, Smile, Send, Loader2, CheckCircle, XCircle } from "lucide-react";
import { useTranslation } from "@/context/TranslationContext";

export function WeeklyQuiz() {
  const { t } = useTranslation();
  const { state, submitAiAnswer, dismissAiQuestion } = useGame();
  const [answer, setAnswer] = useState("");

  if (!state?.aiQuestion || state.aiQuestion.status === "generating") return null;

  const qi = state.aiQuestion;
  const intrebare = qi.intrebare.replace(/^(Întrebare:|Î:)\s*/i, "");
  const isEvaluating = qi.status === "evaluating";
  const isEvaluated = qi.status === "evaluated";
  const result = qi.rezultat;
  const canSubmit = answer.trim().length > 0 && !isEvaluating;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    await submitAiAnswer(answer);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
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
          className="relative w-full max-w-lg bg-card-strong border border-purple-500/30 rounded-3xl shadow-2xl shadow-purple-900/40 overflow-hidden max-h-[90vh]"
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
            <span className="ml-auto text-xs text-subtle">{t("Săpt.")} {state.saptamana}</span>
          </div>

          <div className="p-5 overflow-y-auto max-h-[calc(90vh-4rem)]">
            <h3 className="text-xl font-black text-main mb-2">{t("Întrebarea săptămânii")}</h3>
            <p className="text-strong text-sm mb-5 leading-relaxed">{t(intrebare)}</p>

            {isEvaluating ? (
              <div className="flex flex-col items-center justify-center py-8">
                <Loader2 size={32} className="animate-spin text-purple-400 mb-3" />
                <p className="text-muted text-sm">{t("Se evaluează răspunsul...")}</p>
              </div>
            ) : !isEvaluated ? (
              <>
                <textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder={t("Scrie răspunsul tău...")}
                  className="w-full p-3 rounded-xl border border-medium bg-card text-main text-sm placeholder:text-faintest focus:outline-none focus:border-purple-500/50 resize-none"
                  rows={3}
                  disabled={isEvaluating}
                />
                <button
                  onClick={handleSubmit}
                  disabled={!canSubmit}
                  className="w-full mt-3 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 disabled:opacity-50 disabled:cursor-not-allowed text-main font-bold text-sm transition-all shadow-lg shadow-purple-900/30 flex items-center justify-center gap-2"
                >
                  <Send size={16} /> {t("Trimite răspunsul")}
                </button>
              </>
            ) : result ? (
              <>
                <div className={`p-4 rounded-2xl border ${result.corect ? "border-green-500/30 bg-green-500/10" : "border-red-500/30 bg-red-500/10"}`}>
                  <div className="flex items-center gap-2 mb-3">
                    {result.corect ? (
                      <CheckCircle size={20} className="text-green-400" />
                    ) : (
                      <XCircle size={20} className="text-red-400" />
                    )}
                    <span className={`font-black text-lg ${result.corect ? "text-green-400" : "text-red-400"}`}>
                      {result.corect ? t("Corect!") : t("Greșit")}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mb-2">
                    {result.baniDelta !== 0 && (
                      <span className={`flex items-center gap-1 text-sm font-bold ${result.baniDelta > 0 ? "text-green-400" : "text-red-400"}`}>
                        <Coins size={13} />
                        {result.baniDelta > 0 ? "+" : ""}{result.baniDelta} RON
                      </span>
                    )}
                    {result.fericireDelta !== 0 && (
                      <span className={`flex items-center gap-1 text-sm font-bold ${result.fericireDelta > 0 ? "text-green-400" : "text-red-400"}`}>
                        <Smile size={13} />
                        {result.fericireDelta > 0 ? "+" : ""}{result.fericireDelta}%
                      </span>
                    )}
                  </div>
                  <p className="text-muted text-sm">{t(result.explicatie)}</p>
                </div>

                <button
                  onClick={dismissAiQuestion}
                  className="w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-main font-bold text-sm transition-all shadow-lg shadow-purple-900/30"
                >
                  {t("Continuă")}
                </button>
              </>
            ) : null}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
