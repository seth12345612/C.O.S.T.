import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";

export function EmailOtpVerifier() {
  const {
    user,
    isVerified,
    otpSentAt,
    otpExpiresAt,
    isOtpSending,
    otpError,
    otpMessage,
    sendOtp,
    verifyOtp,
    logout,
  } = useAuth();
  const [code, setCode] = useState("");
  const [success, setSuccess] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!user || isVerified) return;
    if (!otpSentAt && !isOtpSending) {
      sendOtp();
    }
  }, [user, isVerified, otpSentAt, isOtpSending, sendOtp]);

  useEffect(() => {
    if (isVerified) {
      setSuccess(true);
    }
  }, [isVerified]);

  useEffect(() => {
    if (!otpExpiresAt) return;
    const interval = setInterval(() => setTick((value) => value + 1), 1000);
    return () => clearInterval(interval);
  }, [otpExpiresAt]);

  const secondsLeft = useMemo(() => {
    if (!otpExpiresAt) return 0;
    return Math.max(0, Math.ceil((otpExpiresAt - Date.now()) / 1000));
  }, [otpExpiresAt, tick]);

  if (!user || isVerified) return null;

  const handleVerify = () => {
    const result = verifyOtp(code.trim());
    if (result) {
      setSuccess(true);
      setCode("");
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 p-4">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0d0820] p-6 shadow-2xl">
        <h2 className="text-xl font-black text-white mb-2">Verificare în doi pași</h2>
        <p className="text-sm text-white/60 mb-4">
          Am trimis un cod de verificare pe emailul tău: <span className="text-white/80">{user.email}</span>.
          Codul expiră în {secondsLeft} secunde.
        </p>

        <div className="space-y-3">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ""))}
            maxLength={6}
            placeholder="Introdu codul de 6 cifre"
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-purple-500/50"
          />

          {otpError ? (
            <div className="rounded-2xl bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-200">
              {otpError}
            </div>
          ) : null}

          {otpMessage ? (
            <div className="rounded-2xl bg-green-500/10 border border-green-500/20 p-3 text-sm text-green-200">
              {otpMessage}
            </div>
          ) : null}

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handleVerify}
              disabled={code.length !== 6}
              className="rounded-2xl bg-gradient-to-r from-purple-600 to-fuchsia-600 px-4 py-3 text-sm font-bold text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Verifică codul
            </button>
            <button
              type="button"
              onClick={sendOtp}
              disabled={isOtpSending}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white hover:border-white/20 transition"
            >
              {isOtpSending ? "Retrimitem..." : "Retrimite codul"}
            </button>
          </div>

          <button
            type="button"
            onClick={logout}
            className="w-full rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-200 hover:bg-red-500/20 transition"
          >
            Ieși din verificare
          </button>

          <p className="text-xs text-white/40">
            Dacă nu primești codul, verifică folderul de spam sau apasă "Retrimite codul".
          </p>
        </div>
      </div>
    </div>
  );
}
