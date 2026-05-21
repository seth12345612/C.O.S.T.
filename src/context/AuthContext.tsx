import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type { AuthUser, DBUser } from "@/types";
import { supabase, syncUserToDB } from "@/lib/supabase";

interface AuthContextType {
  user: AuthUser | null;
  dbUser: DBUser | null;
  isVerified: boolean;
  isAdmin: boolean;
  isPremium: boolean;
  premiumTrialEndsAt: number | null;
  login: () => void;
  logout: () => void;
  activateDemoPremium: () => void;
  deactivatePremium: () => void;
  getPremiumTimeRemaining: () => string;
}

const AuthContext = createContext<AuthContextType | null>(null);
const PREMIUM_KEY = "cost_premium";

function loadPremium(): { isPremium: boolean; premiumTrialEndsAt: number | null } {
  try {
    const raw = localStorage.getItem(PREMIUM_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { isPremium: false, premiumTrialEndsAt: null };
}

function savePremium(isPremium: boolean, premiumTrialEndsAt: number | null) {
  localStorage.setItem(PREMIUM_KEY, JSON.stringify({ isPremium, premiumTrialEndsAt }));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [dbUser, setDbUser] = useState<DBUser | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  const premiumInit = useCallback(loadPremium, []);
  const [isPremium, setIsPremium] = useState(premiumInit().isPremium);
  const [premiumTrialEndsAt, setPremiumTrialEndsAt] = useState<number | null>(premiumInit().premiumTrialEndsAt);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const hash = window.location.hash;

    async function initAuth() {
      if (hash.includes("access_token")) {
        // Explicitly set session from URL hash
        const params = new URLSearchParams(hash.slice(1));
        const accessToken = params.get("access_token") ?? "";
        const refreshToken = params.get("refresh_token") ?? "";
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        if (error) { console.error("setSession error:", error); return; }
        if (data.session?.user && !cancelled) {
          await handleSession(data.session);
          // Clean URL hash
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      } else {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user && !cancelled) {
          await handleSession(session);
        }
      }
    }

    async function handleSession(session: import("@supabase/supabase-js").Session) {
      const authUser: AuthUser = {
        sub: session.user.id,
        name: session.user.user_metadata.full_name ?? session.user.email ?? "",
        email: session.user.email ?? "",
        picture: session.user.user_metadata.avatar_url,
      };
      setUser(authUser);
      setIsVerified(true);
      const dbUser = await syncUserToDB({ email: authUser.email, name: authUser.name, picture: authUser.picture });
      if (dbUser) { setDbUser(dbUser); setIsAdmin(dbUser.is_admin); }
    }

    initAuth().catch((e) => console.error("Auth init error:", e));

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth event:", event, session?.user?.email);
      if (event === "SIGNED_IN" && session?.user && !cancelled) {
        await handleSession(session);
      } else if (event === "SIGNED_OUT" || event === "USER_DELETED") {
        if (!cancelled) {
          setUser(null); setDbUser(null); setIsVerified(false); setIsAdmin(false);
        }
      }
    });

    return () => { cancelled = true; subscription.unsubscribe(); };
  }, []);

  useEffect(() => {
    savePremium(isPremium, premiumTrialEndsAt);
  }, [isPremium, premiumTrialEndsAt]);

  const login = useCallback(() => {
    supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: window.location.origin } });
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setDbUser(null);
    setIsVerified(false);
    setIsAdmin(false);
    Object.keys(localStorage).forEach(k => { if (k.startsWith("sb-") || k.includes("supabase")) localStorage.removeItem(k); });
    supabase.auth.signOut().catch(e => console.error("signOut error:", e));
  }, []);

  const activateDemoPremium = useCallback(() => {
    const endsAt = Date.now() + 7 * 24 * 60 * 60 * 1000;
    setIsPremium(true);
    setPremiumTrialEndsAt(endsAt);
  }, []);

  const deactivatePremium = useCallback(() => {
    setIsPremium(false);
    setPremiumTrialEndsAt(null);
  }, []);

  const getPremiumTimeRemaining = useCallback(() => {
    if (!premiumTrialEndsAt) return "";
    const diff = premiumTrialEndsAt - Date.now();
    if (diff <= 0) return "Expirat";
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    if (days > 0) return `${days}z ${hours}h`;
    return `${hours}h`;
  }, [premiumTrialEndsAt]);

  return (
    <AuthContext.Provider
      value={{
        user,
        dbUser,
        isVerified,
        isAdmin,
        isPremium,
        premiumTrialEndsAt,
        login,
        logout,
        activateDemoPremium,
        deactivatePremium,
        getPremiumTimeRemaining,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}

