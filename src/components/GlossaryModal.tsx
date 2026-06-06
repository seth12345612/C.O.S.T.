import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Search, X } from "lucide-react";
import { FINANCIAL_TERMS, TERMS_BY_CATEGORY, type FinancialTerm } from "@/data/financial-terms";

export function GlossaryButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 z-50 p-3 rounded-full bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-main shadow-lg shadow-purple-900/40 transition-all hover:scale-105"
        title="Vocabular financiar"
      >
        <BookOpen size={20} />
      </button>
      <GlossaryModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}

export function GlossaryModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<FinancialTerm | null>(null);

  const filtered = search.trim()
    ? FINANCIAL_TERMS.filter((t) =>
        t.term.toLowerCase().includes(search.toLowerCase()) ||
        t.definition.toLowerCase().includes(search.toLowerCase())
      )
    : FINANCIAL_TERMS;

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-overlay backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative w-full max-w-xl bg-card-strong border border-purple-500/30 rounded-3xl shadow-2xl shadow-purple-900/40 overflow-hidden max-h-[85vh] flex flex-col"
          >
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-purple-500 via-fuchsia-500 to-orange-500" />

            <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-subtle">
              <h2 className="text-lg font-black text-main flex items-center gap-2">
                <BookOpen size={18} className="text-purple-400" />
                Glosar financiar
              </h2>
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-card-hover text-muted hover:text-main transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="px-5 py-3 border-b border-subtle">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setSelected(null); }}
                  placeholder="Caută un termen..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-card border border-medium text-main text-sm placeholder:text-faintest focus:outline-none focus:border-purple-500/50"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              {selected ? (
                <div>
                  <button
                    onClick={() => setSelected(null)}
                    className="text-xs text-muted hover:text-main mb-3 transition-colors"
                  >
                    &larr; Înapoi la listă
                  </button>
                  <h3 className="text-xl font-black text-main mb-2">{selected.term}</h3>
                  <p className="text-muted text-sm leading-relaxed mb-3">{selected.definition}</p>
                  {selected.example && (
                    <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
                      <p className="text-xs text-purple-300 font-semibold mb-1">EXEMPLU</p>
                      <p className="text-sm text-muted">{selected.example}</p>
                    </div>
                  )}
                </div>
              ) : filtered.length === 0 ? (
                <p className="text-center text-muted py-8">Niciun termen găsit.</p>
              ) : (
                <div className="space-y-1">
                  {filtered.map((term) => (
                    <button
                      key={term.term}
                      onClick={() => setSelected(term)}
                      className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-card-hover transition-colors"
                    >
                      <span className="text-sm font-semibold text-main">{term.term}</span>
                      <p className="text-xs text-muted mt-0.5 line-clamp-1">{term.definition}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
