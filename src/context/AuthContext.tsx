import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type { AuthUser, DBUser, SubscriptionTier } from "@/types";
import { supabase, syncUserToDB } from "@/lib/supabase";
import { useTranslation } from "@/context/TranslationContext";

const CHECK_PREMIUM_FUNC = "https://twdvhkwrlwhadbmortqk.supabase.co/functions/v1/check-premium";
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3ZHZoa3dybHdoYWRibW9ydHFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyMDM4OTAsImV4cCI6MjA5NDc3OTg5MH0.mvQkXjYR3YDChjbuGmmm006QOTjw6rQz6UdAKZYG-lQ";

interface AuthContextType {
  user: AuthUser | null;
  dbUser: DBUser | null;
  isVerified: boolean;
  isAdmin: boolean;
  isPremium: boolean;
  premiumTrialEndsAt: number | null;
  subscriptionTier: SubscriptionTier;
  setSubscriptionTier: (tier: SubscriptionTier) => void;
  showNicknameModal: boolean;
  login: () => void;
  loginManual: (nume: string, prenume: string, email: string) => void;
  logout: () => void;
  setDisplayName: (name: string) => void;
  closeNicknameModal: () => void;
  activateDemoPremium: () => void;
  activateFullPremium: (durationMs: number) => void;
  activateAdvancedPremium: (durationMs: number) => void;
  deactivatePremium: () => void;
  getPremiumTimeRemaining: () => string;
}

const AuthContext = createContext<AuthContextType | null>(null);
const PREMIUM_KEY = "cost_premium";
const TIER_KEY = "cost_subscription_tier";
const MANUAL_USER_KEY = "cost_manual_user";
const DISPLAY_NAME_KEY = "cost_display_name";

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
  const [subscriptionTier, setSubscriptionTierState] = useState<SubscriptionTier>(() => {
    try {
      const saved = localStorage.getItem(TIER_KEY);
      if (saved === "premium_basic" || saved === "premium_advanced") return saved;
    } catch {}
    return "free";
  });
  const [isAdmin, setIsAdmin] = useState(false);
  const [showNicknameModal, setShowNicknameModal] = useState(false);

  const setSubscriptionTier = useCallback((tier: SubscriptionTier) => {
    setSubscriptionTierState(tier);
    localStorage.setItem(TIER_KEY, tier);
  }, []);

  const restoreManualUser = useCallback(() => {
    try {
      const raw = localStorage.getItem(MANUAL_USER_KEY);
      if (raw) {
        const u: AuthUser = JSON.parse(raw);
        setUser(u);
        setIsVerified(true);
      }
    } catch {}
  }, []);

  useEffect(() => {
    let cancelled = false;
    const hash = window.location.hash;

    async function initAuth() {
      if (hash.includes("access_token")) {
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
          window.history.replaceState({}, document.title, window.location.pathname);
          window.location.href = "/login/success";
        }
      } else {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user && !cancelled) {
          await handleSession(session);
        } else {
          restoreManualUser();
        }
      }
    }

    async function handleSession(session: import("@supabase/supabase-js").Session) {
      const storedName = localStorage.getItem(DISPLAY_NAME_KEY);
      const name = storedName || session.user.user_metadata.full_name || session.user.email || "";
      const authUser: AuthUser = {
        sub: session.user.id,
        name,
        email: session.user.email ?? "",
        picture: session.user.user_metadata.avatar_url,
      };
      setUser(authUser);
      setIsVerified(true);
      const dbUser = await syncUserToDB({ email: authUser.email, name: authUser.name, picture: authUser.picture });
      if (dbUser) { setDbUser(dbUser); setIsAdmin(dbUser.is_admin); }
      if (!storedName) {
        setShowNicknameModal(true);
      }
    }

    initAuth().catch((e) => console.error("Auth init error:", e));

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user && !cancelled) {
        await handleSession(session);
      } else if (event === "SIGNED_OUT" || event === "USER_DELETED") {
        if (!cancelled) {
          setUser(null); setDbUser(null); setIsVerified(false); setIsAdmin(false);
        }
      }
    });

    return () => { cancelled = true; subscription.unsubscribe(); };
  }, [restoreManualUser]);

  const syncPremiumFromDB = useCallback(async (email: string, userId?: string) => {
    try {
      const res = await fetch(CHECK_PREMIUM_FUNC, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${ANON_KEY}` },
        body: JSON.stringify({ email, user_id: userId }),
      });
      const data = await res.json();
      if (data.isPremium && data.premiumUntil) {
        setIsPremium(true);
        setPremiumTrialEndsAt(data.premiumUntil);
        if (data.tier) setSubscriptionTier(data.tier);
      }
    } catch {}
  }, [setSubscriptionTier]);

  useEffect(() => {
    if (user?.email) {
      syncPremiumFromDB(user.email, user.sub);
    }
  }, [user?.email, user?.sub, syncPremiumFromDB]);

  useEffect(() => {
    savePremium(isPremium, premiumTrialEndsAt);
  }, [isPremium, premiumTrialEndsAt]);

  const login = useCallback(() => {
    supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: window.location.origin } });
  }, []);

  const loginManual = useCallback((nume: string, prenume: string, email: string) => {
    const authUser: AuthUser = {
      sub: crypto.randomUUID(),
      name: `${prenume} ${nume}`,
      email,
    };
    localStorage.setItem(MANUAL_USER_KEY, JSON.stringify(authUser));
    setUser(authUser);
    setIsVerified(true);
    syncUserToDB({ email: authUser.email, name: authUser.name }).then((db) => {
      if (db) { setDbUser(db); setIsAdmin(db.is_admin); }
    });
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setDbUser(null);
    setIsVerified(false);
    setIsAdmin(false);
    localStorage.removeItem(MANUAL_USER_KEY);
    Object.keys(localStorage).forEach(k => { if (k.startsWith("sb-") || k.includes("supabase")) localStorage.removeItem(k); });
    supabase.auth.signOut().catch(e => console.error("signOut error:", e));
  }, []);

  const setDisplayName = useCallback((name: string) => {
    localStorage.setItem(DISPLAY_NAME_KEY, name);
    setUser((prev) => prev ? { ...prev, name } : null);
    if (user?.email) syncUserToDB({ email: user.email, name });
    setShowNicknameModal(false);
  }, [user?.email]);

  const closeNicknameModal = useCallback(() => {
    setShowNicknameModal(false);
  }, []);

  const activateDemoPremium = useCallback(() => {
    const endsAt = Date.now() + 7 * 24 * 60 * 60 * 1000;
    setIsPremium(true);
    setPremiumTrialEndsAt(endsAt);
    setSubscriptionTier("premium_advanced");
  }, [setSubscriptionTier]);

  const activateFullPremium = useCallback((durationMs: number) => {
    const endsAt = Date.now() + durationMs;
    setIsPremium(true);
    setPremiumTrialEndsAt(endsAt);
    setSubscriptionTier("premium_basic");
  }, [setSubscriptionTier]);

  const activateAdvancedPremium = useCallback((durationMs: number) => {
    const endsAt = Date.now() + durationMs;
    setIsPremium(true);
    setPremiumTrialEndsAt(endsAt);
    setSubscriptionTier("premium_advanced");
  }, [setSubscriptionTier]);

  const deactivatePremium = useCallback(() => {
    setIsPremium(false);
    setPremiumTrialEndsAt(null);
    setSubscriptionTier("free");
  }, [setSubscriptionTier]);

  const { t } = useTranslation();
  const getPremiumTimeRemaining = useCallback(() => {
    if (!premiumTrialEndsAt) return "";
    const diff = premiumTrialEndsAt - Date.now();
    if (diff <= 0) return t("Expirat");
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
        subscriptionTier,
        setSubscriptionTier,
        showNicknameModal,
        login,
        loginManual,
        logout,
        setDisplayName,
        closeNicknameModal,
        activateDemoPremium,
        activateFullPremium,
        activateAdvancedPremium,
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
