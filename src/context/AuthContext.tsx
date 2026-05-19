import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { send } from "@emailjs/browser";

export interface AuthUser {
  sub: string;
  name: string;
  email: string;
  picture?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isVerified: boolean;
<<<<<<< HEAD
  isPremium: boolean;
  premiumTrialEndsAt: number | null;
=======
>>>>>>> bca33c6a3a6b536a83ed88053ea89ffdd976de0f
  otpSentAt: number | null;
  otpExpiresAt: number | null;
  isOtpSending: boolean;
  otpError: string | null;
  otpMessage: string | null;
  login: (user: AuthUser) => void;
  logout: () => void;
  sendOtp: () => Promise<void>;
  verifyOtp: (code: string) => boolean;
<<<<<<< HEAD
  activateDemoPremium: () => void;
  deactivatePremium: () => void;
  getPremiumTimeRemaining: () => string;
=======
>>>>>>> bca33c6a3a6b536a83ed88053ea89ffdd976de0f
}

const AuthContext = createContext<AuthContextType | null>(null);
const STORAGE_KEY = "cost_auth_state";

interface StoredAuthState {
  user: AuthUser;
  isVerified: boolean;
<<<<<<< HEAD
  isPremium?: boolean;
  premiumTrialEndsAt?: number;
}

function loadAuthState(): { user: AuthUser | null; isVerified: boolean; isPremium: boolean; premiumTrialEndsAt: number | null } {
  if (typeof window === "undefined") return { user: null, isVerified: false, isPremium: false, premiumTrialEndsAt: null };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { user: null, isVerified: false, isPremium: false, premiumTrialEndsAt: null };
    const parsed = JSON.parse(raw) as StoredAuthState;
    return { user: parsed.user, isVerified: parsed.isVerified, isPremium: parsed.isPremium ?? false, premiumTrialEndsAt: parsed.premiumTrialEndsAt ?? null };
  } catch {
    return { user: null, isVerified: false, isPremium: false, premiumTrialEndsAt: null };
  }
}

function saveAuthState(user: AuthUser | null, isVerified: boolean, isPremium: boolean, premiumTrialEndsAt: number | null) {
  if (typeof window === "undefined") return;
  if (user) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ user, isVerified, isPremium, premiumTrialEndsAt }));
=======
}

function loadAuthState(): { user: AuthUser | null; isVerified: boolean } {
  if (typeof window === "undefined") return { user: null, isVerified: false };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { user: null, isVerified: false };
    const parsed = JSON.parse(raw) as StoredAuthState;
    return { user: parsed.user, isVerified: parsed.isVerified };
  } catch {
    return { user: null, isVerified: false };
  }
}

function saveAuthState(user: AuthUser | null, isVerified: boolean) {
  if (typeof window === "undefined") return;
  if (user) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ user, isVerified }));
>>>>>>> bca33c6a3a6b536a83ed88053ea89ffdd976de0f
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}

function createOtpCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const initialState = useMemo(loadAuthState, []);
  const [user, setUser] = useState<AuthUser | null>(initialState.user);
  const [isVerified, setIsVerified] = useState(initialState.isVerified);
<<<<<<< HEAD
  const [isPremium, setIsPremium] = useState(initialState.isPremium);
  const [premiumTrialEndsAt, setPremiumTrialEndsAt] = useState<number | null>(initialState.premiumTrialEndsAt);
=======
>>>>>>> bca33c6a3a6b536a83ed88053ea89ffdd976de0f
  const [otpCode, setOtpCode] = useState<string | null>(null);
  const [otpSentAt, setOtpSentAt] = useState<number | null>(null);
  const [otpExpiresAt, setOtpExpiresAt] = useState<number | null>(null);
  const [isOtpSending, setIsOtpSending] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpMessage, setOtpMessage] = useState<string | null>(null);

  useEffect(() => {
<<<<<<< HEAD
    saveAuthState(user, isVerified, isPremium, premiumTrialEndsAt);
  }, [user, isVerified, isPremium, premiumTrialEndsAt]);
=======
    saveAuthState(user, isVerified);
  }, [user, isVerified]);
>>>>>>> bca33c6a3a6b536a83ed88053ea89ffdd976de0f

  const login = useCallback((newUser: AuthUser) => {
    setUser(newUser);
    setIsVerified(false);
<<<<<<< HEAD
    setIsPremium(false);
    setPremiumTrialEndsAt(null);
=======
>>>>>>> bca33c6a3a6b536a83ed88053ea89ffdd976de0f
    setOtpCode(null);
    setOtpSentAt(null);
    setOtpExpiresAt(null);
    setOtpError(null);
    setOtpMessage(null);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setIsVerified(false);
<<<<<<< HEAD
    setIsPremium(false);
    setPremiumTrialEndsAt(null);
=======
>>>>>>> bca33c6a3a6b536a83ed88053ea89ffdd976de0f
    setOtpCode(null);
    setOtpSentAt(null);
    setOtpExpiresAt(null);
    setOtpError(null);
    setOtpMessage(null);
<<<<<<< HEAD
    saveAuthState(null, false, false, null);
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

=======
    saveAuthState(null, false);
  }, []);

>>>>>>> bca33c6a3a6b536a83ed88053ea89ffdd976de0f
  const sendOtp = useCallback(async () => {
    if (!user) return;

    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
    const templatePassId = import.meta.env.VITE_EMAILJS_TEMPLATE_PASS_ID;

    if (!serviceId || !templateId || !publicKey || !templatePassId) {
      setOtpError("Lipsesc setările EmailJS pentru trimiterea codului.");
      return;
    }

    const code = createOtpCode();
    const expiresAt = Date.now() + 30_000;
    setOtpCode(code);
    setOtpSentAt(Date.now());
    setOtpExpiresAt(expiresAt);
    setOtpError(null);
    setOtpMessage("Se trimite codul de verificare...");
    setIsOtpSending(true);

    try {
      await send(
        serviceId,
        templatePassId,
        {
          to_email: user.email,
          to_name: user.name,
          code,
        },
        publicKey
      );
      setOtpMessage("Codul a fost trimis. Verifică-ți emailul.");
    } catch (error) {
      console.error("OTP email error:", error);
      setOtpError("Nu s-a putut trimite codul. Încearcă din nou.");
      setOtpMessage(null);
    } finally {
      setIsOtpSending(false);
    }
  }, [user]);

  const verifyOtp = useCallback((code: string) => {
    if (!otpCode || !otpExpiresAt) {
      setOtpError("Nu există cod activ. Trimite din nou codul.");
      return false;
    }
    if (Date.now() > otpExpiresAt) {
      setOtpError("Codul a expirat. Trimite unul nou.");
      return false;
    }
    if (code !== otpCode) {
      setOtpError("Cod incorect. Încearcă din nou.");
      return false;
    }

    setIsVerified(true);
    setOtpError(null);
    setOtpMessage("Autentificare reușită.");
    return true;
  }, [otpCode, otpExpiresAt]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isVerified,
<<<<<<< HEAD
        isPremium,
        premiumTrialEndsAt,
=======
>>>>>>> bca33c6a3a6b536a83ed88053ea89ffdd976de0f
        otpSentAt,
        otpExpiresAt,
        isOtpSending,
        otpError,
        otpMessage,
        login,
        logout,
        sendOtp,
        verifyOtp,
<<<<<<< HEAD
        activateDemoPremium,
        deactivatePremium,
        getPremiumTimeRemaining,
=======
>>>>>>> bca33c6a3a6b536a83ed88053ea89ffdd976de0f
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
