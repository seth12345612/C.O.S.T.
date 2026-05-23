import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";

export function NicknameModal() {
  const { showNicknameModal, setDisplayName, closeNicknameModal } = useAuth();
  const [nickname, setNickname] = useState("");

  const handleSubmit = () => {
    const trimmed = nickname.trim();
    if (trimmed.length < 2) return;
    setDisplayName(trimmed);
  };

  return (
    <AnimatePresence>
      {showNicknameModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-overlay backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="w-[360px] max-w-[calc(100vw-2rem)] p-6 rounded-2xl border border-subtle bg-card-strong shadow-2xl"
          >
            <h2 className="text-lg font-bold text-main mb-1">Alege-ți un nume</h2>
            <p className="text-sm text-dim mb-4">
              Cum vrei să apari în joc?
            </p>
            <input
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              placeholder="Numele tău..."
              autoFocus
              maxLength={30}
              className="w-full px-3 py-2.5 rounded-xl border border-medium bg-card text-main placeholder:text-fainter text-sm focus:outline-none focus:border-purple-500/50 mb-4"
            />
            <div className="flex gap-2">
              <button
                onClick={handleSubmit}
                disabled={nickname.trim().length < 2}
                className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-main text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Salvează
              </button>
              <button
                onClick={closeNicknameModal}
                className="px-4 py-2.5 rounded-xl border border-medium text-muted hover:text-main text-sm font-medium transition-all"
              >
                Mai târziu
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
