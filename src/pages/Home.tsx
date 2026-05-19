import { Link } from "wouter";
import { motion } from "framer-motion";
import { Clock, Star, Lock, Zap, TrendingUp, Users, Gamepad2, Crown, X, Calendar } from "lucide-react";
import { OrbBackground } from "@/components/OrbBackground";
import { Layout } from "@/components/Layout";
import { useXP } from "@/context/XPContext";
import { useAuth } from "@/context/AuthContext";
import { SCENARII } from "@/data/scenarios";
import { getActiveLimitedEvents, getTimeRemaining, type LimitedEvent } from "@/data/limitedEvents";
import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { LimitedEventModal } from "@/components/LimitedEventModal";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.45 } }),
};

function isInSeason(seasonTag: string | undefined): boolean {
  if (!seasonTag) return true;
  const month = new Date().getMonth();
  if (seasonTag === "iarna") return month === 11 || month === 0 || month === 1;
  if (seasonTag === "vara") return month === 5 || month === 6 || month === 7;
  return true;
}

function getSeasonName(seasonTag: string | undefined): string {
  if (!seasonTag) return "";
  if (seasonTag === "iarna") return "iarnă";
  if (seasonTag === "vara") return "vară";
  return seasonTag;
}

function PremiumModal({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="relative w-full max-w-md p-6 rounded-3xl border border-purple-500/30 bg-gradient-to-br from-purple-900/90 to-fuchsia-900/90 backdrop-blur-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
        >
          <X size={18} className="text-white" />
        </button>
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500">
            <Crown size={32} className="text-white" />
          </div>
          <h2 className="text-2xl font-black text-white mb-2">Dorești Premium?</h2>
          <p className="text-white/70 mb-6">
            Deblochează toate scenariile sezoniere și caracteristici exclusive!
          </p>
          <div className="space-y-3 mb-6">
            {[
              "✨ Toate scenariile sezoniere (iarna, vara)",
              "🎯 Acces nelimitat la evenimente",
              "💬 Chat cu mentorul",
              "🔓 Toate scenariile premium",
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-3 text-white/80 text-sm">
                <span className="text-purple-300">✓</span>
                {feature}
              </div>
            ))}
          </div>
          <Link
            href="/premium"
            className="block w-full py-3 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold transition-all hover:shadow-lg hover:shadow-yellow-500/30"
          >
            Vezi Varianta Premium
          </Link>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function Home() {
  const { xpState, isUnlocked, xpRequiredFor } = useXP();
  const { isPremium, premiumTrialEndsAt } = useAuth();
  const limitedEvents = getActiveLimitedEvents();
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<LimitedEvent | null>(null);
  const isPremiumActive = isPremium && premiumTrialEndsAt && premiumTrialEndsAt > Date.now();

  const scenariiList = Object.values(SCENARII);

  return (
    <Layout>
      <OrbBackground />
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-16">

        {/* Hero */}
        <motion.section
          className="text-center pt-8 pb-4"
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
        >
          <motion.div variants={fadeUp} custom={0} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-sm font-medium mb-6">
            <Zap size={14} />
            Joc de Educație Financiară
          </motion.div>
          <motion.h1 variants={fadeUp} custom={1} className="text-5xl sm:text-6xl md:text-7xl font-black leading-tight mb-4">
            <span className="bg-gradient-to-r from-purple-400 via-fuchsia-300 to-orange-400 bg-clip-text text-transparent">
              C.O.S.T.
            </span>
          </motion.h1>
          <motion.p variants={fadeUp} custom={2} className="text-lg sm:text-xl text-white/60 max-w-2xl mx-auto mb-2 font-medium">
            College Operating &amp; Survival Tactics
          </motion.p>
          <motion.p variants={fadeUp} custom={3} className="text-white/40 max-w-xl mx-auto mb-10 text-sm">
            Simulează viața financiară a unui student, ia decizii inteligente și deblochează noi scenarii prin XP.
          </motion.p>
          <motion.div variants={fadeUp} custom={4} className="flex flex-wrap gap-3 justify-center">
            <Link href="/game" className="px-8 py-3 bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white rounded-2xl font-bold text-lg transition-all shadow-lg shadow-purple-900/30 hover:shadow-purple-900/50 hover:-translate-y-0.5 active:translate-y-0">
              Joacă acum
            </Link>
            <Link href="/tutorial" className="px-8 py-3 border border-blue-400/40 hover:border-blue-400 bg-blue-500/10 text-blue-300 hover:text-blue-200 rounded-2xl font-bold text-lg transition-all hover:bg-blue-500/20">
              Tutorial
            </Link>
            <Link href="/finance" className="px-8 py-3 border border-white/20 hover:border-white/40 text-white/80 hover:text-white rounded-2xl font-bold text-lg transition-all hover:bg-white/5">
              Finanțele mele
            </Link>
          </motion.div>
        </motion.section>

        {/* Limited Events */}
        {limitedEvents.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Clock size={18} className="text-orange-400" />
              <h2 className="text-lg font-bold text-white">Evenimente cu timp limitat</h2>
              <span className="ml-auto text-xs text-white/40">Bonus XP special</span>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {limitedEvents.map((ev) => {
                const timeLeft = getTimeRemaining(ev.endsAt);
                const isExpiringSoon = ev.endsAt - Date.now() < 1000 * 60 * 60 * 3;
                return (
                  <motion.div
                    key={ev.id}
                    whileHover={{ scale: 1.02 }}
                    className="relative p-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden cursor-pointer"
                    style={{ borderColor: `${ev.culoare}50` }}
                    onClick={() => setSelectedEvent(ev)}
                  >
                    <div className="absolute inset-0 opacity-10" style={{ background: `linear-gradient(135deg, ${ev.culoare} 0%, transparent 70%)` }} />
                    <div className="relative flex items-start gap-3">
                      <span className="text-3xl shrink-0">{ev.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-white text-sm truncate">{ev.titlu}</span>
                        </div>
                        <p className="text-xs text-white/50 mb-2 line-clamp-2">{ev.descriere}</p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${isExpiringSoon ? "bg-red-500/20 text-red-300 pulse-red" : "bg-orange-500/20 text-orange-300"}`}>
                            <Clock size={10} />
                            {timeLeft}
                          </span>
                          <span className="text-xs text-purple-300 font-semibold">+{ev.bonusXP} XP</span>
                          {ev.bonusBani && ev.bonusBani > 0 && (
                            <span className="text-xs text-green-400 font-semibold">+{ev.bonusBani} RON</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 w-full flex items-center justify-center gap-1.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors">
                      <Gamepad2 size={12} />
                      Participă
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.section>
        )}

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-3 gap-3"
        >
          {[
            { label: "XP Total", value: xpState.xp.toString(), icon: Star, color: "text-yellow-400" },
            { label: "Nivel", value: xpState.level.toString(), icon: TrendingUp, color: "text-purple-400" },
            { label: "Scenarii deblocate", value: `${xpState.scenariiDeblocate.length}/${scenariiList.length}`, icon: Users, color: "text-orange-400" },
          ].map((stat) => (
            <div key={stat.label} className="p-4 rounded-2xl border border-white/10 bg-white/5 text-center">
              <stat.icon size={20} className={`${stat.color} mx-auto mb-2`} />
              <div className="text-2xl font-black text-white">{stat.value}</div>
              <div className="text-xs text-white/40 mt-0.5">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Scenarios Grid */}
        <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
          <div className="flex items-center gap-2 mb-6">
            <Gamepad2 size={18} className="text-purple-400" />
            <h2 className="text-xl font-bold text-white">Scenarii disponibile</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {scenariiList.map((sc, i) => {
              const unlocked = isUnlocked(sc.id);
              const xpNeeded = xpRequiredFor(sc.id);
              const inSeason = isInSeason(sc.seasonTag);
              const isPremiumLocked = sc.isPremium && !unlocked && !isPremiumActive;

              const handleClick = () => {
                if (sc.isPremium && !unlocked && !isPremiumActive) {
                  setShowPremiumModal(true);
                }
              };

              return (
                <motion.div
                  key={sc.id}
                  custom={i}
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  whileHover={unlocked && inSeason ? { scale: 1.03, y: -4 } : {}}
                  onClick={handleClick}
                  className={`relative rounded-2xl border overflow-hidden transition-all ${
                    unlocked || (sc.isPremium && isPremiumActive)
                      ? "border-white/15 bg-white/5 cursor-pointer hover:border-white/30"
                      : sc.isPremium && !unlocked
                      ? "border-yellow-500/30 bg-yellow-500/5 cursor-pointer hover:border-yellow-500/50"
                      : "border-white/8 bg-white/3 cursor-not-allowed"
                  } ${!inSeason ? "opacity-50" : ""}`}
                >
                  <div className={`absolute inset-0 ${sc.bgClass} opacity-40`} />
                  <div className="relative p-4">
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-3xl">{sc.emoji}</span>
                      <div className="flex flex-col items-end gap-1">
                        {sc.isPremium && (
                          <span className="text-xs px-2 py-0.5 rounded-full border border-yellow-500/40 text-yellow-300 bg-yellow-500/10 flex items-center gap-1">
                            <Crown size={10} />
                            PRO
                          </span>
                        )}
                        {sc.seasonal && (
                          <span className="text-xs px-2 py-0.5 rounded-full border border-orange-500/40 text-orange-300 bg-orange-500/10 flex items-center gap-1">
                            <Calendar size={10} />
                            Sezonier
                          </span>
                        )}
                      </div>
                    </div>
                    <h3 className="font-bold text-white text-sm mb-1">{sc.nume}</h3>
                    <p className="text-xs text-white/50 line-clamp-2 mb-3">{sc.descriere}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-white/40">{sc.cheltuieliFixe.length} cheltuieli fixe</span>
                      <span className="text-xs text-white/40">·</span>
                      <span className="text-xs text-white/40">{sc.subScenarii.length} sub-scenarii</span>
                    </div>
                    {!inSeason && (
                      <div className="mt-2 text-xs text-orange-300 flex items-center gap-1">
                        <Clock size={10} />
                        Revine în sezonul {getSeasonName(sc.seasonTag)}
                      </div>
                    )}
                    {(unlocked || (sc.isPremium && isPremiumActive)) && inSeason ? (
                      <Link
                        href={`/game?scenario=${sc.id}`}
                        className="mt-3 w-full block text-center py-1.5 rounded-xl text-xs font-bold transition-all"
                        style={{ background: `${sc.accentColor}30`, color: sc.accentColor, border: `1px solid ${sc.accentColor}40` }}
                      >
                        {isPremiumActive && sc.isPremium ? "PRO · Joacă" : "Joacă"}
                      </Link>
                    ) : isPremiumLocked ? (
                      <div className="mt-3 w-full text-center py-1.5 rounded-xl bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-xs font-bold text-yellow-300 border border-yellow-500/30 flex items-center justify-center gap-1">
                        <Crown size={12} />
                        Premium — Dezblochează cu PRO
                      </div>
                    ) : (
                      <div className="mt-3 w-full text-center py-1.5 rounded-xl bg-white/5 text-xs font-medium text-white/30 border border-white/10 flex items-center justify-center gap-1">
                        <Lock size={10} />
                        Necesită {xpNeeded} XP
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        {/* How it works */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="grid sm:grid-cols-3 gap-4"
        >
          {[
            { emoji: "🎯", title: "Alege scenariul", desc: "Student la cămin, chiriaș, navetist sau cu job full-time — tu decizi." },
            { emoji: "🧠", title: "Ia decizii financiare", desc: "Fiecare săptămână aduce evenimente reale. Alegerile tale contează." },
            { emoji: "📈", title: "Câștigă XP și deblochează", desc: "Cu fiecare joc câștigat, primești XP și deblochezi scenarii noi." },
          ].map((step) => (
            <div key={step.title} className="p-5 rounded-2xl border border-white/10 bg-white/5 text-center">
              <div className="text-3xl mb-3">{step.emoji}</div>
              <h3 className="font-bold text-white mb-1 text-sm">{step.title}</h3>
              <p className="text-xs text-white/50">{step.desc}</p>
            </div>
          ))}
        </motion.section>

        {/* Premium Info Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          <div className="relative overflow-hidden rounded-3xl border border-yellow-500/30 bg-gradient-to-r from-purple-900/80 to-fuchsia-900/80">
            <div className="absolute inset-0 opacity-20" style={{ background: "radial-gradient(circle at 30% 50%, rgba(234, 179, 8, 0.3) 0%, transparent 50%), radial-gradient(circle at 70% 50%, rgba(217, 70, 239, 0.3) 0%, transparent 50%)" }} />
            <div className="relative p-6 md:p-8">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="shrink-0">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg shadow-yellow-500/30">
                    <Crown size={40} className="text-white" />
                  </div>
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h2 className="text-2xl md:text-3xl font-black text-white mb-2">
                    🌟 Varianta Premium
                  </h2>
                  <p className="text-white/70 mb-4 max-w-xl">
                    Deblochează toate scenariile sezoniere, evenimente exclusive și chat cu mentorul!
                  </p>
                  <div className="flex flex-wrap justify-center md:justify-start gap-3 mb-4">
                    {[
                      "Mai multe evenimente",
                      "Chat cu mentorul",
                      "Scenarii sezoniere oricând",
                    ].map((feature) => (
                      <span key={feature} className="px-3 py-1 rounded-full bg-white/10 text-white/80 text-xs border border-white/20">
                        {feature}
                      </span>
                    ))}
                  </div>
                  <Link
                    href="/premium"
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold transition-all hover:shadow-lg hover:shadow-yellow-500/30 hover:-translate-y-0.5"
                  >
                    <Crown size={16} />
                    Vrei Premium?
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </motion.section>
      </div>
      <AnimatePresence>
        {showPremiumModal && <PremiumModal onClose={() => setShowPremiumModal(false)} />}
      </AnimatePresence>
      <AnimatePresence>
        {selectedEvent && (
          <LimitedEventModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
        )}
      </AnimatePresence>
    </Layout>
  );
}
