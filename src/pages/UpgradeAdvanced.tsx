import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Shield, ArrowUp, Crown, Calendar, Sparkles, BarChart3, MessageCircle, Zap, Target, Loader2, ArrowLeft, Check } from "lucide-react";
import { OrbBackground } from "@/components/OrbBackground";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/context/AuthContext";
import type { SubscriptionTier } from "@/types";

const CHECKOUT_FUNC = "https://twdvhkwrlwhadbmortqk.supabase.co/functions/v1/create-checkout";
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3ZHZoa3dybHdoYWRibW9ydHFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyMDM4OTAsImV4cCI6MjA5NDc3OTg5MH0.mvQkXjYR3YDChjbuGmmm006QOTjw6rQz6UdAKZYG-lQ";

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("ro-RO", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

const ADVANCED_BENEFITS = [
  { icon: BarChart3, text: "Analize financiare detaliate" },
  { icon: MessageCircle, text: "Mentorat AI personalizat" },
  { icon: Shield, text: "Suport prioritar 24/7" },
  { icon: Zap, text: "XP boost +20%" },
  { icon: Target, text: "Provocări premium exclusive" },
];

export default function UpgradeAdvanced() {
  const { isPremium, premiumTrialEndsAt, user, subscriptionTier } = useAuth();
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isActive = isPremium && premiumTrialEndsAt && premiumTrialEndsAt > Date.now();

  // Dacă utilizatorul nu are un abonament activ, redirecționează înapoi
  if (!isActive) {
    setLocation("/premium");
    return null;
  }

  // Dacă utilizatorul are deja premium_advanced, redirecționează înapoi
  if (subscriptionTier === "premium_advanced") {
    setLocation("/premium");
    return null;
  }

  const expirationDate = formatDate(premiumTrialEndsAt!);

  const handleCheckout = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(CHECKOUT_FUNC, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${ANON_KEY}`,
        },
        body: JSON.stringify({
          email: user?.email ?? "",
          name: user?.name ?? "",
          tier: "premium_advanced" as SubscriptionTier,
          upgrade: true,
          current_period_end: premiumTrialEndsAt,
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || `HTTP ${res.status}`);
      if (data.url) window.location.href = data.url;
      else throw new Error("No checkout URL returned");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Eroare la inițierea plății");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <OrbBackground />
      <div className="max-w-2xl mx-auto px-4 py-12">
        <button
          onClick={() => setLocation("/premium")}
          className="flex items-center gap-1.5 text-subtle hover:text-strong text-sm mb-8 transition-colors"
        >
          <ArrowLeft size={16} />
          Înapoi la planuri
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative rounded-3xl border border-purple-500/30 bg-gradient-to-b from-purple-500/10 via-card to-card overflow-hidden"
        >
          {/* Header gradient decorativ */}
          <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-purple-600/20 to-transparent pointer-events-none" />
          <div className="absolute top-0 right-0 w-60 h-60 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative p-8 sm:p-10">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="flex items-center justify-center mb-6"
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-purple-500/40 bg-purple-500/15 text-purple-300 text-sm font-medium">
                <ArrowUp size={14} />
                Upgrade Plan
              </div>
            </motion.div>

            {/* Icon + Title */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-center mb-8"
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-500/25">
                <Shield size={32} className="text-white" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-main mb-2">
                Premium <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Advanced</span>
              </h1>
              <p className="text-muted text-sm max-w-md mx-auto">
                Deblochează toate funcțiile avansate și maximizează-ți experiența de învățare financiară.
              </p>
            </motion.div>

            {/* Pricing */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex items-center justify-center gap-3 mb-8"
            >
              <div className="text-center">
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-5xl font-black text-main">19</span>
                  <span className="text-lg font-bold text-dim">.00 RON</span>
                </div>
                <span className="text-xs text-subtle">pe lună</span>
              </div>
            </motion.div>

            {/* Expiration notice */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="p-4 rounded-2xl border border-yellow-500/25 bg-yellow-500/5 mb-8"
            >
              <div className="flex items-start gap-3">
                <Calendar size={20} className="text-yellow-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-yellow-300 mb-1">
                    Când începe noul abonament?
                  </p>
                  <p className="text-xs text-yellow-200/70 leading-relaxed">
                    Noul tău plan <strong className="text-yellow-200">Premium Advanced</strong> va intra în vigoare imediat după expirarea abonamentului tău curent, pe data de{" "}
                    <strong className="text-yellow-200">{expirationDate}</strong>.
                    Nu vei fi taxat suplimentar pentru perioada deja acoperită de planul actual.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Current plan indicator */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
              className="flex items-center justify-between p-3 rounded-xl border border-subtle bg-card-soft4 mb-6"
            >
              <div className="flex items-center gap-2">
                <Crown size={16} className="text-yellow-400" />
                <span className="text-xs text-dim">Planul tău curent</span>
              </div>
              <span className="text-xs font-bold text-yellow-300 px-2 py-0.5 rounded-full bg-yellow-500/15 border border-yellow-500/20">
                Premium Basic • 9 RON/lună
              </span>
            </motion.div>

            {/* Benefits */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mb-8"
            >
              <h3 className="text-sm font-bold text-purple-300 mb-4 flex items-center gap-2">
                <Sparkles size={14} />
                Ce primești în plus față de Basic
              </h3>
              <div className="space-y-3">
                {ADVANCED_BENEFITS.map((b, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + i * 0.08 }}
                    className="flex items-center gap-3 p-3 rounded-xl border border-purple-500/15 bg-purple-500/5"
                  >
                    <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center shrink-0">
                      <b.icon size={16} className="text-purple-400" />
                    </div>
                    <span className="text-sm text-strong">{b.text}</span>
                    <Check size={14} className="text-green-400 ml-auto shrink-0" />
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Error */}
            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-red-400 text-center mb-4"
              >
                {error}
              </motion.p>
            )}

            {/* CTA */}
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCheckout}
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-sm transition-all shadow-lg shadow-purple-600/25 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin" />
                  Se procesează...
                </span>
              ) : (
                <span className="inline-flex items-center gap-2">
                  <ArrowUp size={16} />
                  Continuă la plată • 19 RON/lună
                </span>
              )}
            </motion.button>

            {/* Fine print */}
            <p className="text-[11px] text-faint text-center mt-4 leading-relaxed">
              Plata se procesează securizat prin Stripe. Abonamentul Premium Advanced va începe automat pe <strong>{expirationDate}</strong>.
            </p>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}
