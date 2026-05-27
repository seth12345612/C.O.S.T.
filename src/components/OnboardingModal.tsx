import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { GraduationCap, X } from "lucide-react";

const TUTORIAL_KEY = "cost_tutorial_completed";

export function isTutorialCompleted(): boolean {
  return localStorage.getItem(TUTORIAL_KEY) === "true";
}

export function markTutorialCompleted() {
  localStorage.setItem(TUTORIAL_KEY, "true");
}

export function skipTutorial() {
  localStorage.setItem(TUTORIAL_KEY, "true");
}

export function OnboardingModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [, navigate] = useLocation();

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-overlay backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative w-full max-w-md bg-card-strong border border-purple-500/30 rounded-3xl shadow-2xl shadow-purple-900/40 overflow-hidden"
          >
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-purple-500 via-fuchsia-500 to-orange-500" />

            <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-card-hover text-muted hover:text-main transition-colors">
              <X size={18} />
            </button>

            <div className="p-6 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-fuchsia-500/20 flex items-center justify-center mx-auto mb-4">
                <GraduationCap size={32} className="text-purple-400" />
              </div>

              <h2 className="text-xl font-black text-main mb-2">Bun venit în C.O.S.T.!</h2>
              <p className="text-muted text-sm leading-relaxed mb-6">
                Înveți să îți gestionezi banii printr-un joc interactiv. Înainte să începi, 
                îți recomandăm să parcurgi tutorialul pentru a înțelege mecanica jocului.
              </p>

              <div className="space-y-3">
                <button
                  onClick={() => { markTutorialCompleted(); navigate("/tutorial"); }}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-main font-bold text-sm transition-all shadow-lg shadow-purple-900/30"
                >
                  Începe tutorialul
                </button>
                <button
                  onClick={() => { skipTutorial(); onClose(); }}
                  className="w-full py-2.5 rounded-xl bg-card border border-subtle text-muted hover:text-main hover:border-stronger text-sm font-medium transition-all"
                >
                  Sari peste, am experiență
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
