import { useState, useRef, useEffect } from "react";
import { useTranslation, LANGUAGES } from "@/context/TranslationContext";
import { Globe, ChevronDown } from "lucide-react";

export function LanguageSwitcher() {
  const { language, setLanguage } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-muted hover:text-main hover:bg-white/5 border border-subtle hover:border-strong transition-all"
      >
        <Globe size={13} />
        <span>{current.flag}</span>
        <span className="hidden sm:inline">{current.label}</span>
        <ChevronDown size={11} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-40 py-1 rounded-xl bg-card-strong border border-subtle shadow-xl shadow-black/30 z-50">
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              onClick={() => { setLanguage(l.code); setOpen(false); }}
              className={`w-full flex items-center gap-2 px-3 py-2 text-xs transition-colors ${
                language === l.code
                  ? "text-purple-300 bg-purple-500/10 font-semibold"
                  : "text-muted hover:text-main hover:bg-white/5"
              }`}
            >
              <span>{l.flag}</span>
              {l.label}
              {language === l.code && <span className="ml-auto text-purple-400">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
