import { Link, useSearchParams } from "wouter";
import { motion } from "framer-motion";
import { Sparkles, Crown, MessageCircle, Unlock, Calendar, Mail, Check, Zap, Loader2, CreditCard } from "lucide-react";
import { OrbBackground } from "@/components/OrbBackground";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";

const CHECKOUT_FUNC = "https://twdvhkwrlwhadbmortqk.supabase.co/functions/v1/create-checkout";
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3ZHZoa3dybHdoYWRibW9ydHFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyMDM4OTAsImV4cCI6MjA5NDc3OTg5MH0.mvQkXjYR3YDChjbuGmmm006QOTjw6rQz6UdAKZYG-lQ";

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
    desc: "Acces nelimitat la Mentorul AI — utilizatorii free au doar 10 întrebări/zi.",
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
  const { isPremium, activateDemoPremium, activateFullPremium, deactivatePremium, getPremiumTimeRemaining, premiumTrialEndsAt, user } = useAuth();
  const isActive = isPremium && premiumTrialEndsAt && premiumTrialEndsAt > Date.now();
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.get("canceled")) {
      setCheckoutError("Plata a fost anulată. Poți încerca din nou oricând.");
    }
  }, [searchParams]);

  const handleBuyPremium = async () => {
    setCheckoutLoading(true);
    setCheckoutError("");
    try {
      const res = await fetch(CHECKOUT_FUNC, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${ANON_KEY}` },
        body: JSON.stringify({
          email: user?.email ?? "",
          name: user?.name ?? "",
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || `HTTP ${res.status}`);
      if (data.url) window.location.href = data.url;
      else throw new Error("No checkout URL returned");
    } catch (err) {
      setCheckoutError(err instanceof Error ? err.message : "Eroare la inițierea plății");
    } finally {
      setCheckoutLoading(false);
    }
  };

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
          <motion.h1 variants={fadeUp} custom={1} className="text-4xl sm:text-5xl font-black text-main mb-4">
            De<span className="bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-400 bg-clip-text text-transparent">blochează</span> Potențialul
          </motion.h1>
          <motion.p variants={fadeUp} custom={2} className="text-lg text-muted max-w-2xl mx-auto mb-8">
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
              <div className="text-xs text-faint">Fără card — doar pentru testare</div>
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
              className="p-5 rounded-2xl border border-subtle bg-card hover:bg-card-soft8 transition-all group"
            >
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br ${benefit.color} shrink-0`}>
                  <benefit.icon size={20} className="text-main" />
                </div>
                <div>
                  <h3 className="font-bold text-main text-sm mb-1">{benefit.title}</h3>
                  <p className="text-xs text-dim">{benefit.desc}</p>
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
            <h2 className="text-xl font-bold text-main mb-2">Ce include Premium?</h2>
            <p className="text-sm text-dim">Toate beneficiile pentru a-ți maximiza experiența</p>
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
              <div key={item} className="flex items-center gap-2 text-sm text-strong">
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
          className="p-6 rounded-2xl border border-subtle bg-card text-center"
        >
          <h2 className="text-xl font-bold text-main mb-2">Cumpără Premium</h2>
          <p className="text-3xl font-black text-main mb-1">
            9 <span className="text-lg font-normal text-dim">RON / lună</span>
          </p>
          <p className="text-sm text-subtle mb-6">Plată unică lunară — acces complet la toate funcțiile</p>

          {checkoutError && (
            <p className="text-sm text-red-400 mb-4">{checkoutError}</p>
          )}

          <button
            onClick={handleBuyPremium}
            disabled={checkoutLoading}
            className="inline-flex items-center gap-2 px-8 py-3 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-main font-bold text-sm transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {checkoutLoading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <CreditCard size={18} />
            )}
            {checkoutLoading ? "Se procesează..." : "Plătește cu Cardul"}
          </button>

          <p className="text-xs text-faint mt-4">
            Plăți securizate prin Stripe. Nu stocăm datele cardului tău.
          </p>
        </motion.section>
      </div>
    </Layout>
  );
}