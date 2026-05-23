import { Link } from "wouter";
import { motion } from "framer-motion";
import { Sparkles, Crown, MessageCircle, Unlock, Calendar, Mail, Check, Zap } from "lucide-react";
import { OrbBackground } from "@/components/OrbBackground";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/context/AuthContext";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

const BENEFITS = [
  {
    icon: Sparkles,
    title: "Evenimente Exclusive",
    desc: "Acces la evenimente speciale și funcții noi înainte de toată lumea.",
    color: "from-yellow-400 to-orange-500",
  },
  {
    icon: MessageCircle,
    title: "Chat AI Nelimitat",
    desc: "Acces nelimitat la Mentorul AI — utilizatorii free au doar 5 mesaje/zi.",
    color: "from-purple-400 to-pink-500",
  },
  {
    icon: Unlock,
    title: "Toate Scenariile",
    desc: "Deblochezi instantaneu toate scenariile de joc fără să câștigă XP.",
    color: "from-green-400 to-emerald-500",
  },
  {
    icon: Calendar,
    title: "Scenarii Sezoniere Oricând",
    desc: "Joacă scenarii sezoniere (Crăciun, Paște, Vară) oricând dorești.",
    color: "from-blue-400 to-cyan-500",
  },
];

export default function Premium() {
  const { isPremium, activateDemoPremium, deactivatePremium, getPremiumTimeRemaining, premiumTrialEndsAt } = useAuth();
  const isActive = isPremium && premiumTrialEndsAt && premiumTrialEndsAt > Date.now();

  return (
    <Layout>
      <OrbBackground />
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-12">
        <motion.section
          className="text-center"
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
        >
          <motion.div variants={fadeUp} custom={0} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-yellow-500/30 bg-yellow-500/10 text-yellow-300 text-sm font-medium mb-6">
            <Crown size={14} />
            Varianta Premium
          </motion.div>
          <motion.h1 variants={fadeUp} custom={1} className="text-4xl sm:text-5xl font-black text-white mb-4">
            De<span className="bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-400 bg-clip-text text-transparent">blochează</span> Potențialul
          </motion.h1>
          <motion.p variants={fadeUp} custom={2} className="text-lg text-white/60 max-w-2xl mx-auto mb-8">
            Transformă-ți experiența de educație financiară cu funcții exclusive și suport prioritar.
          </motion.p>

          {isActive ? (
            <motion.div variants={fadeUp} custom={3} className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl border border-green-500/30 bg-green-500/10">
              <span className="text-green-400 text-xl">✓</span>
              <div className="text-left">
                <div className="font-bold text-green-300">Premium Activ</div>
                <div className="text-xs text-green-400/70">Expiră în: {getPremiumTimeRemaining()}</div>
              </div>
              <button
                onClick={deactivatePremium}
                className="ml-4 px-3 py-1.5 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs font-medium transition-all"
              >
                Dezactivează
              </button>
            </motion.div>
          ) : (
            <motion.div variants={fadeUp} custom={3} className="inline-flex flex-col items-center gap-3 px-6 py-4 rounded-2xl border border-purple-500/20 bg-purple-500/5">
              <div className="flex items-center gap-2 text-yellow-400 text-sm font-medium">
                <Zap size={16} />
                Încearcă Premium gratuit — 7 zile
              </div>
              <button
                onClick={activateDemoPremium}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black font-bold text-sm transition-all hover:scale-105"
              >
                Activează Demo Premium
              </button>
              <div className="text-xs text-white/30">Fără card — doar pentru testare</div>
            </motion.div>
          )}
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid sm:grid-cols-2 gap-4"
        >
          {BENEFITS.map((benefit, i) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + i * 0.1 }}
              className="p-5 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/8 transition-all group"
            >
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br ${benefit.color} shrink-0`}>
                  <benefit.icon size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm mb-1">{benefit.title}</h3>
                  <p className="text-xs text-white/50">{benefit.desc}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="p-6 rounded-2xl border border-purple-500/20 bg-purple-500/5"
        >
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-white mb-2">Ce include Premium?</h2>
            <p className="text-sm text-white/50">Toate beneficiile pentru a-ți maximiza experiența</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-3 mb-6">
            {[
              "Acces nelimitat la toate scenariile",
              "Chat preferențial cu mentorul AI",
              "Evenimente exclusive înaintea tuturor",
              "Scenarii sezoniere disponibile oricând",
              "Badge special de utilizator Premium",
              "Suport prioritar prin email",
            ].map((item) => (
              <div key={item} className="flex items-center gap-2 text-sm text-white/70">
                <Check size={14} className="text-green-400 shrink-0" />
                {item}
              </div>
            ))}
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
          className="text-center"
        >
          <p className="text-white/50 text-sm mb-4">
            Interesat de Premium? Contactează-ne și află mai multe detalii!
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white font-bold transition-all hover:-translate-y-0.5"
          >
            <Mail size={18} />
            Contactează-ne
          </Link>
        </motion.section>
      </div>
    </Layout>
  );
}