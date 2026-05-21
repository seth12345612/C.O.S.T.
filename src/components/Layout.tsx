import { Link, useLocation } from "wouter";
import { useState } from "react";
import { useXP } from "@/context/XPContext";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { ThemePicker } from "@/components/ThemePicker";
import { GoogleAuthButton } from "@/components/GoogleAuthButton";
import { DarkModeToggle } from "@/components/DarkModeToggle";
import { SoundEffects } from "@/lib/sounds";
import { Home, PhoneCall, Wallet, Trophy, Menu, X, Crown, Shield, ShieldCheck, Info, Award, Volume2, VolumeX } from "lucide-react";

const NAV = [
  { href: "/", label: "Acasă", icon: Home },
  { href: "/finance", label: "Finanțe", icon: Wallet },
  { href: "/leaderboard", label: "Clasament", icon: Trophy },
  { href: "/achievements", label: "Achievements", icon: Award },
  { href: "/despre", label: "Despre", icon: Info },
  { href: "/contact", label: "Contact", icon: PhoneCall },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const { xpState } = useXP();
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
        <div className="max-w-6xl mx-auto px-4 h-12 flex items-center justify-between gap-2">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <span
              className="text-lg font-black bg-clip-text text-transparent"
              style={{ backgroundImage: `linear-gradient(to right, ${activeColor}, ${secondaryColor})` }}
            >
              C.O.S.T.
            </span>
            <span className="hidden lg:block text-[11px] text-white/40 font-medium">Educație Financiară</span>
          </Link>

          <nav className="hidden md:flex items-center gap-0.5">
            {isAdmin && (
              <Link
                href="/admin"
                className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-all"
                style={location === "/admin" ? {
                  background: `${activeColor}22`,
                  color: activeColor,
                  border: `1px solid ${activeColor}55`,
                } : { color: "rgba(255,255,255,0.5)" }}
              >
                <ShieldCheck size={12} />
                <span>Admin</span>
              </Link>
            )}
            {NAV.map((item) => {
              const active = location === item.href || (item.href !== "/" && location.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-all"
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
                  <item.icon size={12} style={active ? { color: activeColor } : { color: "rgba(255,255,255,0.5)" }} />
                  <span style={!active ? { color: "rgba(255,255,255,0.6)" } : undefined}>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-1.5 shrink-0">
            <div className="hidden sm:flex items-center gap-1.5">
              <span className="text-[11px] font-bold" style={{ color: activeColor }}>Lv.{xpState.level}</span>
              {isAdmin && (
                <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-red-500/20 border border-red-500/40 text-red-400 text-[10px] font-bold leading-none">
                  <Shield size={8} />
                  A
                </span>
              )}
              {isPremiumActive && (
                <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-yellow-500/20 border border-yellow-500/40 text-yellow-400 text-[10px] font-bold leading-none">
                  <Crown size={8} />
                  P
                </span>
              )}
            </div>

            <button
              onClick={() => SoundEffects.setEnabled(!SoundEffects.enabled)}
              className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors"
              title={SoundEffects.enabled ? "Sunete activate" : "Sunete dezactivate"}
            >
              {SoundEffects.enabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
            </button>
            <DarkModeToggle />
            <GoogleAuthButton compact />
            <ThemePicker />

            <button
              className="md:hidden p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
              onClick={() => setMenuOpen((v) => !v)}
            >
              {menuOpen ? <X size={18} /> : <Menu size={18} />}
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
                <div className="flex items-center gap-2 text-xs text-white/50">
                  <span className="font-bold" style={{ color: activeColor }}>Lv.{xpState.level}</span>
                  <span>{xpState.xp} XP</span>
                </div>
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
