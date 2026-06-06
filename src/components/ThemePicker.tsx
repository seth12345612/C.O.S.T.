import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { Palette, Check, X, Pipette, Crown } from "lucide-react";
import { useTheme, THEME_PRESETS, SHOP_PRESET_IDS } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";

export function ThemePicker() {
  const { themeState, currentPreset, setPreset, setCustomColor, clearCustom } = useTheme();
  const { isPremium, premiumTrialEndsAt } = useAuth();
  const [open, setOpen] = useState(false);
  const [customInput, setCustomInput] = useState(themeState.customColor ?? "#7828c8");
  const pickerRef = useRef<HTMLDivElement>(null);
  const colorInputRef = useRef<HTMLInputElement>(null);
  const isPremiumActive = isPremium && premiumTrialEndsAt && premiumTrialEndsAt > Date.now();

  useEffect(() => {
    if (!isPremiumActive && themeState.customColor) {
      clearCustom();
    }
  }, [isPremiumActive, themeState.customColor, clearCustom]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  const activeColor = themeState.customColor ?? currentPreset.primary;

  function applyColor(val: string) {
    if (!isPremiumActive) return;
    const test = new Option().style;
    test.color = val;
    if (test.color) {
      setCustomColor(val);
    }
  }

  return (
    <div className="relative" ref={pickerRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-medium bg-card hover:bg-card-hover hover:border-stronger transition-all"
        title="Personalizează culoarea"
      >
        <div
          className="w-4 h-4 rounded-full border-2 border-stronger shrink-0"
          style={{ background: activeColor }}
        />
        <Palette size={13} className="text-muted" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -8 }}
            transition={{ duration: 0.18 }}
            className="absolute right-0 top-full mt-2 w-72 bg-card-strong border border-medium rounded-2xl shadow-2xl shadow-black/60 z-[60] overflow-hidden"
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Palette size={14} className="text-primary" style={{ color: activeColor }} />
                  <span className="text-sm font-bold text-main">Tema interfeței</span>
                </div>
                <button onClick={() => setOpen(false)} className="p-1 rounded-lg text-subtle hover:text-main hover:bg-card-hover transition-all">
                  <X size={14} />
                </button>
              </div>

              {/* Preset grid */}
              <div className="mb-4">
                <p className="text-xs text-subtle font-semibold uppercase tracking-wider mb-2">Teme predefinite</p>
                <div className="grid grid-cols-4 gap-2">
                  {THEME_PRESETS.filter((p) => !SHOP_PRESET_IDS.includes(p.id)).map((preset) => {
                    const isActive = themeState.presetId === preset.id && !themeState.customColor;
                    return (
                      <button
                        key={preset.id}
                        onClick={() => { setPreset(preset.id); setCustomInput(preset.primary); }}
                        className="group flex flex-col items-center gap-1.5"
                        title={preset.label}
                      >
                        <div
                          className="relative w-10 h-10 rounded-xl border-2 transition-all"
                          style={{
                            background: `linear-gradient(135deg, ${preset.primary} 0%, ${preset.secondary} 100%)`,
                            borderColor: isActive ? "white" : "transparent",
                            boxShadow: isActive ? `0 0 12px ${preset.primary}60` : "none",
                          }}
                        >
                          {isActive && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Check size={16} className="text-main drop-shadow-md" />
                            </div>
                          )}
                        </div>
                        <span className="text-xs text-dim group-hover:text-bright transition-colors text-center leading-tight" style={{ fontSize: "10px" }}>
                          {preset.label.split(" ")[0]}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom color — premium only */}
              <div className="border-t border-subtle pt-4">
                <p className="text-xs text-subtle font-semibold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Pipette size={11} />
                  Culoare personalizată
                  {!isPremiumActive && <Crown size={11} className="text-yellow-400" />}
                </p>
                {isPremiumActive ? (
                  <div className="flex items-center gap-2">
                    <div
                      className="w-10 h-10 rounded-xl border-2 border-strong cursor-pointer shrink-0 relative overflow-hidden"
                      style={{ background: customInput }}
                      onClick={() => colorInputRef.current?.click()}
                    >
                      <input
                        ref={colorInputRef}
                        type="color"
                        value={/^#[0-9a-fA-F]{6}$/.test(customInput) ? customInput : "#7828c8"}
                        onChange={(e) => { setCustomInput(e.target.value); applyColor(e.target.value); }}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                      <div className="absolute bottom-0 right-0 p-0.5">
                        <Pipette size={10} className="text-main drop-shadow-md" />
                      </div>
                    </div>
                    <input
                      type="text"
                      value={customInput}
                      onChange={(e) => setCustomInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") applyColor(customInput); }}
                      placeholder="#7828c8"
                      className="flex-1 px-2.5 py-2 rounded-xl border border-medium bg-card text-main text-xs font-mono focus:outline-none focus:border-strongest transition-all"
                    />
                    <button
                      onClick={() => applyColor(customInput)}
                      className="px-3 py-2 rounded-xl text-xs font-bold bg-primary text-primary-foreground transition-all hover:opacity-90"
                    >
                      Aplică
                    </button>
                  </div>
                ) : (
                  <div className="rounded-xl bg-card border border-subtle p-3 text-center">
                    <p className="text-xs text-muted mb-2">Disponibil doar în varianta Premium</p>
                    <Link
                      href="/premium"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-yellow-500 to-orange-500 text-main text-xs font-bold transition-all hover:shadow-lg hover:shadow-yellow-500/30"
                    >
                      <Crown size={12} />
                      Devino Premium
                    </Link>
                  </div>
                )}
                {isPremiumActive && themeState.customColor && (
                  <button
                    onClick={clearCustom}
                    className="mt-2 text-xs text-subtle hover:text-strong transition-colors flex items-center gap-1"
                  >
                    <X size={11} />
                    Elimină culoarea personalizată
                  </button>
                )}
              </div>

              {/* Preview badge */}
              <div className="mt-4 p-3 rounded-xl bg-card border border-subtle flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black text-main"
                  style={{ background: `linear-gradient(135deg, ${activeColor}, ${currentPreset.secondary})` }}>
                  C
                </div>
                <div>
                  <div className="text-xs font-bold text-main">{themeState.customColor ? "Culoare personalizată" : currentPreset.label}</div>
                  <div className="text-xs text-subtle font-mono">{activeColor}</div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
