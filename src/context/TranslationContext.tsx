import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { getStoredLanguage, setStoredLanguage, translateTexts } from "@/lib/translate";

interface TranslationContextType {
  t: (text: string) => string;
  language: string;
  setLanguage: (lang: string) => void;
  ready: boolean;
}

const TranslationContext = createContext<TranslationContextType | null>(null);

const LANGUAGES = [
  { code: "ro", label: "Română", flag: "🇷🇴" },
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "it", label: "Italiano", flag: "🇮🇹" },
];

export { LANGUAGES };

export function TranslationProvider({ children }: { children: ReactNode }) {
  const [language, setLang] = useState(getStoredLanguage);
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [ready, setReady] = useState(true);

  const pendingRef = useRef<string[]>([]);
  const timerRef = useRef<number | null>(null);
  const langRef = useRef(language); // always in sync

  langRef.current = language;

  const scheduleTranslation = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(async () => {
      const texts = [...pendingRef.current];
      pendingRef.current = [];
      if (texts.length === 0) return;

      const currentLang = langRef.current;
      if (currentLang === "ro") return;

      setReady(false);
      const results = await translateTexts(texts, currentLang);
      const map: Record<string, string> = {};
      texts.forEach((t, i) => { map[t] = results[i]; });
      setTranslations((prev) => ({ ...prev, ...map }));
      setReady(true);
    }, 200);
  }, []);

  const changeLanguage = useCallback((lang: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setLang(lang);
    setStoredLanguage(lang);
    setTranslations({});
    pendingRef.current = [];
  }, []);

  const t = useCallback(
    (text: string) => {
      if (language === "ro" || !text) return text;

      const cached = translations[text];
      if (cached) return cached;

      if (!pendingRef.current.includes(text)) {
        pendingRef.current.push(text);
        scheduleTranslation();
      }

      return text;
    },
    [language, translations, scheduleTranslation]
  );

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <TranslationContext.Provider value={{ t, language, setLanguage: changeLanguage, ready }}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  const ctx = useContext(TranslationContext);
  if (!ctx) throw new Error("useTranslation must be used inside TranslationProvider");
  return ctx;
}
