import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useAchievements } from "@/context/AchievementContext";

export function AchievementNotification() {
  const { notificari, reseteazaNotificari } = useAchievements();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (notificari.length === 0) return;
    const timer = setTimeout(() => {
      if (current < notificari.length - 1) setCurrent(current + 1);
      else { reseteazaNotificari(); setCurrent(0); }
    }, 4000);
    return () => clearTimeout(timer);
  }, [notificari, current, reseteazaNotificari]);

  if (notificari.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2">
      <AnimatePresence mode="popLayout">
        <motion.div
          key={notificari[current]?.id}
          initial={{ opacity: 0, x: 100, scale: 0.8 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 100, scale: 0.8 }}
          className="bg-gradient-to-r from-yellow-600/90 to-amber-600/90 border border-yellow-400/30 rounded-xl p-4 shadow-2xl shadow-yellow-900/50 backdrop-blur-sm w-80"
        >
          <div className="flex items-start gap-3">
            <span className="text-3xl">{notificari[current]?.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-yellow-200/70 font-medium uppercase tracking-wider">Achievement Deblocat!</p>
              <p className="text-main font-bold text-sm mt-0.5">{notificari[current]?.titlu}</p>
              <p className="text-yellow-100/80 text-xs mt-0.5">{notificari[current]?.descriere}</p>
              <p className="text-yellow-300 text-xs mt-1">+{notificari[current]?.xpReward} XP</p>
            </div>
            <button onClick={reseteazaNotificari} className="text-dim hover:text-main shrink-0"><X size={14} /></button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
