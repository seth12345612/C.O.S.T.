import { Link, useSearchParams } from "wouter";
import { motion } from "framer-motion";
import { Crown, Star, Shield, Sparkles, MessageCircle, Unlock, Calendar, Zap, BarChart3, Target, Check, Mail, Loader2, CreditCard, ArrowUp } from "lucide-react";
import { OrbBackground } from "@/components/OrbBackground";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";
import type { SubscriptionTier } from "@/types";
import { TIERS, hasTierAccess } from "@/data/tiers";

const CHECKOUT_FUNC = "https://twdvhkwrlwhadbmortqk.supabase.co/functions/v1/create-checkout";
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3ZHZoa3dybHdoYWRibW9ydHFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyMDM4OTAsImV4cCI6MjA5NDc3OTg5MH0.mvQkXjYR3YDChjbuGmmm006QOTjw6rQz6UdAKZYG-lQ";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

export default function Premium() {
  const { isPremium, activateDemoPremium, activateFullPremium, activateAdvancedPremium, deactivatePremium, getPremiumTimeRemaining, premiumTrialEndsAt, user, subscriptionTier, setSubscriptionTier } = useAuth();
  const isActive = isPremium && premiumTrialEndsAt && premiumTrialEndsAt > Date.now();
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier>("premium_basic");
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.get("canceled")) {
      setCheckoutError("Plata a fost anulată. Poți încerca din nou oricând.");
    }
  }, [searchParams]);

  const handleBuyPremium = async (tier: SubscriptionTier) => {
    setCheckoutLoading(true);
    setCheckoutError("");
    try {
      const res = await fetch(CHECKOUT_FUNC, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${ANON_KEY}` },
        body: JSON.stringify({
          email: user?.email ?? "",
          name: user?.name ?? "",
          tier,
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

  const currentTierLabel = isActive ? TIERS.find(t => t.id === subscriptionTier)?.label : "Free";

  return (
    <Layout>
      <OrbBackground />
      <div className="max-w-5xl mx-auto px-4 py-12 space-y-12">
        <motion.section
          className="text-center"
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
        >
          <motion.div variants={fadeUp} custom={0} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-yellow-500/30 bg-yellow-500/10 text-yellow-300 text-sm font-medium mb-6">
            <Crown size={14} />
            Planuri Premium
          </motion.div>
          <motion.h1 variants={fadeUp} custom={1} className="text-4xl sm:text-5xl font-black text-main mb-4">
            Alege-ți <span className="bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-400 bg-clip-text text-transparent">Planul</span>
          </motion.h1>
          <motion.p variants={fadeUp} custom={2} className="text-lg text-muted max-w-2xl mx-auto mb-8">
            Transformă-ți experiența de educație financiară cu funcții exclusive și suport prioritar.
          </motion.p>

          {isActive && (
            <motion.div variants={fadeUp} custom={3} className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl border border-green-500/30 bg-green-500/10">
              <span className="text-green-400 text-xl">✓</span>
              <div className="text-left">
                <div className="font-bold text-green-300">Plan activ: {currentTierLabel}</div>
                <div className="text-xs text-green-400/70">Expiră în: {getPremiumTimeRemaining()}</div>
              </div>
              <button
                onClick={deactivatePremium}
                className="ml-4 px-3 py-1.5 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs font-medium transition-all"
              >
                Dezactivează
              </button>
            </motion.div>
          )}
        </motion.section>

        <div className="grid md:grid-cols-3 gap-6">
          {TIERS.map((tier, i) => {
            const isCurrentPlan = isActive && subscriptionTier === tier.id;
            const isDowngrade = isActive && tier.id === "free";
            const isUpgrade = isActive && tier.id === "premium_advanced" && subscriptionTier === "premium_basic";

            return (
              <motion.div
                key={tier.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className={`relative flex flex-col p-6 rounded-2xl border transition-all ${
                  isCurrentPlan
                    ? "border-green-500/40 bg-green-500/5 shadow-lg shadow-green-500/10"
                    : tier.popular
                    ? "border-yellow-500/40 bg-yellow-500/5 shadow-lg shadow-yellow-500/10"
                    : "border-subtle bg-card hover:border-strong"
                }`}
              >
                {tier.popular && !isCurrentPlan && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 text-black text-[10px] font-bold uppercase tracking-wider">
                    Popular
                  </div>
                )}
                {isCurrentPlan && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-green-500 text-white text-[10px] font-bold uppercase tracking-wider">
    Activează
                  </div>
                )}

                <div className="flex flex-col items-center text-center mb-6">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br ${tier.gradient} mb-4`}>
                    <tier.icon size={24} className="text-white" />
                  </div>
                  <h2 className="text-lg font-bold text-main">{tier.label}</h2>
                  <div className="mt-2">
                    <span className="text-3xl font-black text-main">{tier.priceRON}</span>
                    <span className="text-sm text-dim ml-1">RON / lună</span>
                  </div>
                  <p className="text-xs text-subtle mt-1">{tier.priceLabel}</p>
                </div>

                <div className="flex-1 space-y-3 mb-6">
                  {tier.benefits.map((b, j) => (
                    <div key={j} className="flex items-start gap-2.5">
                      <div className={`p-0.5 rounded-full shrink-0 mt-0.5 ${
                        isCurrentPlan || hasTierAccess(subscriptionTier, tier.id) ? "text-green-400" : "text-subtle"
                      }`}>
                        <b.icon size={14} />
                      </div>
                      <span className={`text-xs ${
                        isCurrentPlan || hasTierAccess(subscriptionTier, tier.id) ? "text-strong" : "text-dim"
                      }`}>{b.text}</span>
                    </div>
                  ))}
                </div>

                {tier.id === "free" ? (
                  isCurrentPlan ? (
                    <div className="w-full py-2.5 rounded-xl border border-green-500/30 bg-green-500/10 text-green-400 text-sm font-bold text-center">
                      Planul tău curent
                    </div>
                  ) : (
                    <button
                      onClick={deactivatePremium}
                      className="w-full py-2.5 rounded-xl border border-subtle text-dim hover:text-main hover:border-strong text-sm font-medium transition-all"
                    >
                      Revino la Free
                    </button>
                  )
                ) : isCurrentPlan ? (
                  <div className="w-full py-2.5 rounded-xl border border-green-500/30 bg-green-500/10 text-green-400 text-sm font-bold text-center">
                    Planul tău curent
                  </div>
                ) : (
                  <button
                    onClick={() => isActive ? (
                      tier.id === "premium_advanced"
                        ? activateAdvancedPremium(premiumTrialEndsAt! - Date.now() + 30 * 24 * 60 * 60 * 1000)
                        : activateFullPremium(premiumTrialEndsAt! - Date.now() + 30 * 24 * 60 * 60 * 1000)
                    ) : handleBuyPremium(tier.id)}
                    disabled={checkoutLoading && selectedTier === tier.id}
                    className={`w-full py-2.5 rounded-xl font-bold text-sm transition-all ${
                      tier.popular
                        ? "bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black hover:scale-[1.02]"
                        : "bg-card-hover text-main hover:bg-white/10 border border-subtle"
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {checkoutLoading && selectedTier === tier.id ? (
                      <span className="inline-flex items-center gap-1.5">
                        <Loader2 size={14} className="animate-spin" />
                        Se procesează...
                      </span>
                    ) : isActive ? (
                      <span className="inline-flex items-center gap-1.5">
                        <ArrowUp size={14} />
                        Fă Upgrade
                      </span>
                    ) : (
                      "Abonează-te"
                    )}
                  </button>
                )}
              </motion.div>
            );
          })}
        </div>

        {checkoutError && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-red-400 text-center"
          >
            {checkoutError}
          </motion.p>
        )}

        {!isActive && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex flex-col items-center gap-3 p-6 rounded-2xl border border-purple-500/20 bg-purple-500/5 text-center"
          >
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

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="p-6 rounded-2xl border border-subtle bg-card text-center"
        >
          <h2 className="text-xl font-bold text-main mb-4">Comparație detaliată</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-subtle">
                  <th className="text-left py-2 pr-4 text-dim font-medium">Funcție</th>
                  {TIERS.map(t => (
                    <th key={t.id} className="py-2 px-3 text-center text-strong font-bold">{t.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { name: "Scenarii disponibile", free: "3", basic: "Toate", adv: "Toate" },
                  { name: "Întrebări AI / zi", free: "10", basic: "Nelimitat", adv: "Nelimitat" },
                  { name: "Urmărire finanțe", free: "✓", basic: "✓", adv: "✓" },
                  { name: "Scenarii sezoniere", free: "—", basic: "Oricând", adv: "Oricând" },
                  { name: "Evenimente exclusive", free: "—", basic: "✓", adv: "✓" },
                  { name: "Analize financiare", free: "—", basic: "—", adv: "Detaliate" },
                  { name: "Mentorat AI personalizat", free: "—", basic: "—", adv: "✓" },
                  { name: "Suport prioritar", free: "—", basic: "—", adv: "24/7" },
                  { name: "XP boost", free: "—", basic: "—", adv: "+20%" },
                  { name: "Provocări premium", free: "—", basic: "—", adv: "✓" },
                ].map((row, i) => (
                  <tr key={i} className="border-b border-subtle/50">
                    <td className="py-2.5 pr-4 text-strong">{row.name}</td>
                    <td className="py-2.5 px-3 text-center text-dim">{row.free}</td>
                    <td className="py-2.5 px-3 text-center text-dim">{row.basic}</td>
                    <td className="py-2.5 px-3 text-center text-dim">{row.adv}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="text-center"
        >
          <p className="text-xs text-faint mb-4">
            Plăți securizate prin Stripe. Nu stocăm datele cardului tău.
          </p>
          <p className="text-xs text-faint">
            Ai întrebări? Contactează-ne la{" "}
            <a href="mailto:contact@cost.ro" className="text-yellow-400 hover:underline">
              contact@cost.ro
            </a>
          </p>
        </motion.section>
      </div>
    </Layout>
  );
}
