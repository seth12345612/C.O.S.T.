import { useEffect, useState } from "react";
import { Link, useSearchParams } from "wouter";
import { motion } from "framer-motion";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Layout } from "@/components/Layout";
import { OrbBackground } from "@/components/OrbBackground";

const VERIFY_FUNC = "https://twdvhkwrlwhadbmortqk.supabase.co/functions/v1/verify-payment";
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3ZHZoa3dybHdoYWRibW9ydHFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyMDM4OTAsImV4cCI6MjA5NDc3OTg5MH0.mvQkXjYR3YDChjbuGmmm006QOTjw6rQz6UdAKZYG-lQ";

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const { activateFullPremium, activateAdvancedPremium, isPremium } = useAuth();
  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    if (!sessionId) {
      setStatus("error");
      setErrorMsg("Lipsește ID-ul sesiunii de plată.");
      return;
    }

    let cancelled = false;

    async function verify() {
      try {
        const res = await fetch(VERIFY_FUNC, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${ANON_KEY}` },
          body: JSON.stringify({ session_id: sessionId }),
        });
        const data = await res.json();
        if (cancelled) return;

        if (!res.ok || data.error) throw new Error(data.error || `HTTP ${res.status}`);

        if (data.verified) {
          if (data.tier === "premium_advanced") {
            activateAdvancedPremium(30 * 24 * 60 * 60 * 1000);
          } else {
            activateFullPremium(30 * 24 * 60 * 60 * 1000);
          }
          setStatus("success");
        } else {
          setStatus("error");
          setErrorMsg(data.reason === "unpaid" ? "Plata nu a fost confirmată." : "Verificarea a eșuat.");
        }
      } catch (err) {
        if (!cancelled) {
          setStatus("error");
          setErrorMsg(err instanceof Error ? err.message : "Eroare la verificare");
        }
      }
    }

    verify();
    return () => { cancelled = true; };
  }, [searchParams, activateFullPremium]);

  return (
    <Layout>
      <OrbBackground />
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
        >
          {status === "verifying" && (
            <div className="space-y-6">
              <div className="w-20 h-20 mx-auto rounded-full bg-purple-600/20 flex items-center justify-center">
                <Loader2 size={40} className="text-purple-400 animate-spin" />
              </div>
              <h1 className="text-2xl font-bold text-main">Verificăm plata...</h1>
              <p className="text-dim">Te rugăm să aștepți un moment.</p>
            </div>
          )}

          {status === "success" && (
            <div className="space-y-6">
              <div className="w-20 h-20 mx-auto rounded-full bg-green-500/20 flex items-center justify-center">
                <CheckCircle2 size={40} className="text-green-400" />
              </div>
              <h1 className="text-2xl font-bold text-main">Plată Confirmată!</h1>
              <p className="text-muted">
                Ai activat Premium C.O.S.T. pentru 30 de zile. Bucură-te de toate funcțiile exclusive!
              </p>
              <Link
                href="/premium"
                className="inline-block px-6 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-main font-bold transition-all"
              >
                Mergi la Premium
              </Link>
            </div>
          )}

          {status === "error" && (
            <div className="space-y-6">
              <div className="w-20 h-20 mx-auto rounded-full bg-red-500/20 flex items-center justify-center">
                <XCircle size={40} className="text-red-400" />
              </div>
              <h1 className="text-2xl font-bold text-main">Eroare la Verificare</h1>
              <p className="text-muted">{errorMsg}</p>
              <div className="flex gap-3 justify-center">
                <Link
                  href="/premium"
                  className="inline-block px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 text-main font-bold transition-all"
                >
                  Înapoi la Premium
                </Link>
                <Link
                  href="/"
                  className="inline-block px-6 py-3 rounded-xl border border-strong text-bright font-bold transition-all hover:bg-card"
                >
                  Acasă
                </Link>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </Layout>
  );
}
