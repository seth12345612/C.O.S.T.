import { Link, useLocation } from "wouter";
import { useState } from "react";
import { useXP } from "@/context/XPContext";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { ThemePicker } from "@/components/ThemePicker";
import { GoogleAuthButton } from "@/components/GoogleAuthButton";
import { EmailOtpVerifier } from "@/components/EmailOtpVerifier";
import { Home, PhoneCall, Wallet, Trophy, Menu, X, Crown, Shield, ShieldCheck } from "lucide-react";

const NAV = [
  { href: "/", label: "Acasă", icon: Home },
  { href: "/finance", label: "Finanțe", icon: Wallet },
  { href: "/leaderboard", label: "Clasament", icon: Trophy },
  { href: "/contact", label: "Contact", icon: PhoneCall },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const { xpState, xpProgress } = useXP();
  const { themeState, currentPreset } = useTheme();
  const { isPremium, premiumTrialEndsAt, isAdmin } = useAuth();
  const [location] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const activeColor = themeState.customColor ?? currentPreset.primary;
  const secondaryColor = currentPreset.secondary;
  const isPremiumActive = isPremium && premiumTrialEndsAt && premiumTrialEndsAt > Date.now();

  return (
    <div className="min-h-screen flex flex-col relative">
      <header className="sticky top-0 z-50 border-b border-white/10 backdrop-blur-xl bg-black/40">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <span
              className="text-xl font-black bg-clip-text text-transparent"
              style={{ backgroundImage: `linear-gradient(to right, ${activeColor}, ${secondaryColor})` }}
            >
              C.O.S.T.
            </span>
            <span className="hidden sm:block text-xs text-white/40 font-medium">Educație Financiară</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {isAdmin && (
              <Link
                href="/admin"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
                style={location === "/admin" ? {
                  background: `${activeColor}22`,
                  color: activeColor,
                  border: `1px solid ${activeColor}55`,
                } : { color: "rgba(255,255,255,0.6)" }}
              >
                <ShieldCheck size={14} style={location === "/admin" ? { color: activeColor } : { color: "rgba(255,255,255,0.6)" }} />
                <span>Admin</span>
              </Link>
            )}
            {NAV.map((item) => {
              const active = location === item.href || (item.href !== "/" && location.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
                  style={active ? {
                    background: `${activeColor}22`,
                    color: activeColor,
                    border: `1px solid ${activeColor}55`,
                  } : undefined}
                  onMouseEnter={(e) => {
                    if (!active) {
                      (e.currentTarget as HTMLElement).style.color = "white";
                      (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      (e.currentTarget as HTMLElement).style.color = "";
                      (e.currentTarget as HTMLElement).style.background = "";
                    }
                  }}
                >
                  <item.icon size={14} style={active ? { color: activeColor } : { color: "rgba(255,255,255,0.6)" }} />
                  <span style={!active ? { color: "rgba(255,255,255,0.6)" } : undefined}>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2 shrink-0">
            <div className="hidden sm:flex items-center gap-2">
              <div className="flex flex-col items-end gap-0.5">
                <span className="text-xs text-white/50">Nivel {xpState.level}</span>
                <div className="w-20 h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${xpProgress * 100}%`,
                      backgroundImage: `linear-gradient(to right, ${activeColor}, ${secondaryColor})`,
                    }}
                  />
                </div>
              </div>
              <span className="text-xs font-bold" style={{ color: activeColor }}>{xpState.xp} XP</span>
              {isAdmin && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/20 border border-red-500/40 text-red-400 text-xs font-bold">
                  <Shield size={10} />
                  ADMIN
                </span>
              )}
              {isPremiumActive && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-500/20 border border-yellow-500/40 text-yellow-400 text-xs font-bold">
                  <Crown size={10} />
                  PRO
                </span>
              )}
            </div>

            <GoogleAuthButton />
            <ThemePicker />

            <button
              className="md:hidden p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
              onClick={() => setMenuOpen((v) => !v)}
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="md:hidden border-t border-white/10 bg-black/60 backdrop-blur-xl">
            <nav className="max-w-6xl mx-auto px-4 py-3 flex flex-col gap-1">
              {isAdmin && (
                <Link
                  href="/admin"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
                  style={location === "/admin" ? {
                    background: `${activeColor}22`,
                    color: activeColor,
                    border: `1px solid ${activeColor}55`,
                  } : { color: "rgba(255,255,255,0.6)" }}
                >
                  <ShieldCheck size={16} />
                  Admin
                </Link>
              )}
              {NAV.map((item) => {
                const active = location === item.href || (item.href !== "/" && location.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
                    style={active ? {
                      background: `${activeColor}22`,
                      color: activeColor,
                      border: `1px solid ${activeColor}55`,
                    } : { color: "rgba(255,255,255,0.6)" }}
                  >
                    <item.icon size={16} />
                    {item.label}
                  </Link>
                );
              })}
              <div className="flex items-center gap-2 px-3 py-2 mt-1 border-t border-white/10">
                <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${xpProgress * 100}%`,
                      backgroundImage: `linear-gradient(to right, ${activeColor}, ${secondaryColor})`,
                    }}
                  />
                </div>
                <span className="text-xs font-bold" style={{ color: activeColor }}>
                  Niv. {xpState.level} · {xpState.xp} XP
                </span>
              </div>
            </nav>
          </div>
        )}
      </header>

      <main className="flex-1 relative z-10">
        {children}
      </main>



      <footer className="border-t border-white/10 py-4 text-center text-xs text-white/30 relative z-10">
        <div className="max-w-6xl mx-auto px-4">
          C.O.S.T. — College Operating &amp; Survival Tactics &copy; 2025 · Educație financiară pentru studenți
        </div>
      </footer>
    </div>
  );
}
