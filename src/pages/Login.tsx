import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { LogIn, Mail, User, Loader2, ArrowLeft } from "lucide-react";

export default function Login() {
  const { login, loginManual, user } = useAuth();
  const { currentPreset } = useTheme();
  const [, setLocation] = useLocation();
  const [nume, setNume] = useState("");
  const [prenume, setPrenume] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (user) {
    setLocation("/");
    return null;
  }

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!nume.trim() || !prenume.trim() || !email.trim()) {
      setError("Toate câmpurile sunt obligatorii");
      return;
    }
    if (!email.includes("@")) {
      setError("Adresa de email nu este validă");
      return;
    }

    setSubmitting(true);
    try {
      loginManual(nume.trim(), prenume.trim(), email.trim());
      setLocation("/");
    } catch {
      setError("A apărut o eroare. Încearcă din nou.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ background: "var(--login-bg-gradient)" }}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full opacity-10 blur-3xl"
          style={{ background: `radial-gradient(circle, ${currentPreset.primary}, transparent)` }} />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full opacity-10 blur-3xl"
          style={{ background: `radial-gradient(circle, ${currentPreset.secondary}, transparent)` }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md mx-4"
      >
        <button
          onClick={() => setLocation("/")}
          className="flex items-center gap-1.5 text-subtle hover:text-strong text-sm mb-4 transition-colors"
        >
          <ArrowLeft size={16} />
          Înapoi
        </button>

        <div className="bg-card backdrop-blur-xl border border-subtle rounded-3xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <span
              className="text-3xl font-black bg-clip-text text-transparent"
              style={{ backgroundImage: `linear-gradient(to right, ${currentPreset.primary}, ${currentPreset.secondary})` }}
            >
              C.O.S.T.
            </span>
            <p className="text-subtle text-sm mt-2">Conectează-te pentru a continua</p>
          </div>

          {/* Google login */}
          <button
            onClick={login}
            className="w-full flex items-center justify-center gap-3 rounded-xl border border-medium bg-card px-5 py-3 text-sm font-medium text-main hover:bg-card-hover hover:border-stronger transition-all mb-6"
          >
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            Conectare cu Google
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-card-hover" />
            <span className="text-xs text-faint">sau cu email</span>
            <div className="flex-1 h-px bg-card-hover" />
          </div>

          {/* Manual form */}
          <form onSubmit={handleManualSubmit} className="space-y-4">
            <div>
              <label className="flex items-center gap-2 text-xs text-dim mb-1.5">
                <User size={13} />
                Prenume
              </label>
              <input
                value={prenume}
                onChange={(e) => setPrenume(e.target.value)}
                placeholder="ex: Ioana"
                className="w-full px-4 py-2.5 rounded-xl border border-medium bg-card text-main placeholder:text-faintest text-sm focus:outline-none focus:border-purple-500/50 transition-all"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-xs text-dim mb-1.5">
                <User size={13} />
                Nume
              </label>
              <input
                value={nume}
                onChange={(e) => setNume(e.target.value)}
                placeholder="ex: Popescu"
                className="w-full px-4 py-2.5 rounded-xl border border-medium bg-card text-main placeholder:text-faintest text-sm focus:outline-none focus:border-purple-500/50 transition-all"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-xs text-dim mb-1.5">
                <Mail size={13} />
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ex: ioana@example.com"
                className="w-full px-4 py-2.5 rounded-xl border border-medium bg-card text-main placeholder:text-faintest text-sm focus:outline-none focus:border-purple-500/50 transition-all"
              />
            </div>

            {error && (
              <p className="text-red-400 text-xs">{error}</p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold text-main transition-all disabled:opacity-60"
              style={{
                background: `linear-gradient(to right, ${currentPreset.primary}, ${currentPreset.secondary})`,
              }}
            >
              {submitting ? <Loader2 size={16} className="animate-spin" /> : <LogIn size={16} />}
              {submitting ? "Se procesează..." : "Continuă"}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
