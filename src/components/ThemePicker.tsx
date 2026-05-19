import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Palette, Check, X, Pipette } from "lucide-react";
import { useTheme, THEME_PRESETS } from "@/context/ThemeContext";

export function ThemePicker() {
  const { themeState, currentPreset, setPreset, setCustomColor, clearCustom } = useTheme();
  const [open, setOpen] = useState(false);
  const [customInput, setCustomInput] = useState(themeState.customColor ?? "#7828c8");
  const pickerRef = useRef<HTMLDivElement>(null);
  const colorInputRef = useRef<HTMLInputElement>(null);

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

  return (
    <div className="relative" ref={pickerRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 hover:border-white/30 transition-all"
        title="Personalizează culoarea"
      >
        <div
          className="w-4 h-4 rounded-full border-2 border-white/30 shrink-0"
          style={{ background: activeColor }}
        />
        <Palette size={13} className="text-white/60" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -8 }}
            transition={{ duration: 0.18 }}
            className="absolute right-0 top-full mt-2 w-72 bg-[#0d0820] border border-white/15 rounded-2xl shadow-2xl shadow-black/60 z-[60] overflow-hidden"
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Palette size={14} className="text-primary" style={{ color: activeColor }} />
                  <span className="text-sm font-bold text-white">Tema interfeței</span>
                </div>
                <button onClick={() => setOpen(false)} className="p-1 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-all">
                  <X size={14} />
                </button>
              </div>

              {/* Preset grid */}
              <div className="mb-4">
                <p className="text-xs text-white/40 font-semibold uppercase tracking-wider mb-2">Teme predefinite</p>
                <div className="grid grid-cols-4 gap-2">
                  {THEME_PRESETS.map((preset) => {
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
                              <Check size={16} className="text-white drop-shadow-md" />
                            </div>
                          )}
                        </div>
                        <span className="text-xs text-white/50 group-hover:text-white/80 transition-colors text-center leading-tight" style={{ fontSize: "10px" }}>
                          {preset.label.split(" ")[0]}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom color */}
              <div className="border-t border-white/10 pt-4">
                <p className="text-xs text-white/40 font-semibold uppercase tracking-wider mb-2">Culoare personalizată</p>
                <div className="flex items-center gap-2">
                  <div
                    className="w-10 h-10 rounded-xl border-2 border-white/20 cursor-pointer shrink-0 relative overflow-hidden"
                    style={{ background: customInput }}
                    onClick={() => colorInputRef.current?.click()}
                  >
                    <input
                      ref={colorInputRef}
                      type="color"
                      value={customInput}
                      onChange={(e) => setCustomInput(e.target.value)}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                    <div className="absolute bottom-0 right-0 p-0.5">
                      <Pipette size={10} className="text-white drop-shadow-md" />
                    </div>
                  </div>
                  <input
                    type="text"
                    value={customInput}
                    onChange={(e) => {
                      const val = e.target.value;
                      setCustomInput(val);
                    }}
                    placeholder="#7828c8"
                    className="flex-1 px-2.5 py-2 rounded-xl border border-white/15 bg-white/5 text-white text-xs font-mono focus:outline-none focus:border-white/40 transition-all"
                  />
                  <button
                    onClick={() => {
                      if (/^#[0-9a-fA-F]{6}$/.test(customInput)) {
                        setCustomColor(customInput);
                      }
                    }}
                    className="px-3 py-2 rounded-xl text-xs font-bold text-white transition-all"
                    style={{ background: `${currentPreset.primary}60`, border: `1px solid ${currentPreset.primary}40` }}
                  >
                    Aplică
                  </button>
                </div>
                {themeState.customColor && (
                  <button
                    onClick={clearCustom}
                    className="mt-2 text-xs text-white/40 hover:text-white/70 transition-colors flex items-center gap-1"
                  >
                    <X size={11} />
                    Elimină culoarea personalizată
                  </button>
                )}
              </div>

              {/* Preview badge */}
              <div className="mt-4 p-3 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black text-white"
                  style={{ background: `linear-gradient(135deg, ${activeColor}, ${currentPreset.secondary})` }}>
                  C
                </div>
                <div>
                  <div className="text-xs font-bold text-white">{themeState.customColor ? "Culoare personalizată" : currentPreset.label}</div>
                  <div className="text-xs text-white/40 font-mono">{activeColor}</div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
