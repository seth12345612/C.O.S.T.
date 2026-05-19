import { useState } from "react";
import { motion } from "framer-motion";
import { OrbBackground } from "@/components/OrbBackground";
import { Layout } from "@/components/Layout";
<<<<<<< HEAD
import { MentorChat } from "@/components/MentorChat";
=======
>>>>>>> bca33c6a3a6b536a83ed88053ea89ffdd976de0f
import { useFinance } from "@/context/FinanceContext";
import { Plus, Trash2, TrendingUp, TrendingDown, PiggyBank, Target } from "lucide-react";
import type { TransactionType } from "@/context/FinanceContext";

const CATEGORII = ["Mâncare", "Transport", "Divertisment", "Îmbrăcăminte", "Sănătate", "Educație", "Utilități", "Altele"];

const COLORS = ["#7828c8", "#ff7828", "#16a34a", "#0284c7", "#f59e0b", "#ec4899", "#14b8a6", "#64748b"];

export default function Finance() {
  const {
    financeState, addTransaction, deleteTransaction, updateBudget, setObiectiv,
    totalVenituri, totalCheltuieli, sold, cheltuieliPerCategorie,
  } = useFinance();

  const [tab, setTab] = useState<"tranzactii" | "bugete" | "obiectiv">("tranzactii");
  const [form, setForm] = useState({ tip: "cheltuiala" as TransactionType, descriere: "", suma: "", categorie: "Mâncare", data: new Date().toISOString().slice(0, 10) });
  const [showForm, setShowForm] = useState(false);
  const [newObiectiv, setNewObiectiv] = useState(financeState.obiectivEconomii.toString());
<<<<<<< HEAD
  const [showLargeExpenseWarning, setShowLargeExpenseWarning] = useState(false);
  const [pendingTransaction, setPendingTransaction] = useState<typeof form | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
=======
>>>>>>> bca33c6a3a6b536a83ed88053ea89ffdd976de0f

  function submitTransaction(e: React.FormEvent) {
    e.preventDefault();
    if (!form.descriere || !form.suma) return;
<<<<<<< HEAD
    
    if (form.tip === "cheltuiala" && parseFloat(form.suma) > 500) {
      setPendingTransaction(form);
      setShowLargeExpenseWarning(true);
      return;
    }
    
=======
>>>>>>> bca33c6a3a6b536a83ed88053ea89ffdd976de0f
    addTransaction({ ...form, suma: parseFloat(form.suma) });
    setForm({ tip: "cheltuiala", descriere: "", suma: "", categorie: "Mâncare", data: new Date().toISOString().slice(0, 10) });
    setShowForm(false);
  }

<<<<<<< HEAD
  function confirmLargeExpense() {
    if (pendingTransaction) {
      addTransaction({ ...pendingTransaction, suma: parseFloat(pendingTransaction.suma) });
      setForm({ tip: "cheltuiala", descriere: "", suma: "", categorie: "Mâncare", data: new Date().toISOString().slice(0, 10) });
      setShowForm(false);
    }
    setShowLargeExpenseWarning(false);
    setPendingTransaction(null);
  }

  function confirmDelete() {
    if (deleteConfirmId) {
      deleteTransaction(deleteConfirmId);
      setDeleteConfirmId(null);
    }
  }

=======
>>>>>>> bca33c6a3a6b536a83ed88053ea89ffdd976de0f
  const totalCheltuieliLuna = Object.values(cheltuieliPerCategorie).reduce((s, v) => s + v, 0);

  return (
    <Layout>
      <OrbBackground />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-black text-white mb-1">Finanțele mele</h1>
            <p className="text-white/50 text-sm">Urmărește veniturile, cheltuielile și economiile tale reale.</p>
          </div>
          <button
            onClick={() => setShowForm((v) => !v)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold transition-all"
          >
            <Plus size={16} />
            <span className="hidden sm:block">Adaugă</span>
          </button>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="p-4 rounded-2xl border border-green-500/20 bg-green-500/5">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp size={14} className="text-green-400" />
              <span className="text-xs text-white/50">Venituri</span>
            </div>
            <div className="text-xl font-black text-green-400">+{totalVenituri.toFixed(0)} RON</div>
          </div>
          <div className="p-4 rounded-2xl border border-red-500/20 bg-red-500/5">
            <div className="flex items-center gap-2 mb-1">
              <TrendingDown size={14} className="text-red-400" />
              <span className="text-xs text-white/50">Cheltuieli</span>
            </div>
            <div className="text-xl font-black text-red-400">-{totalCheltuieli.toFixed(0)} RON</div>
          </div>
          <div className={`p-4 rounded-2xl border ${sold >= 0 ? "border-purple-500/20 bg-purple-500/5" : "border-red-500/20 bg-red-500/5"}`}>
            <div className="flex items-center gap-2 mb-1">
              <PiggyBank size={14} className={sold >= 0 ? "text-purple-400" : "text-red-400"} />
              <span className="text-xs text-white/50">Sold</span>
            </div>
            <div className={`text-xl font-black ${sold >= 0 ? "text-purple-400" : "text-red-400"}`}>
              {sold >= 0 ? "+" : ""}{sold.toFixed(0)} RON
            </div>
          </div>
        </div>

        {/* Add transaction form */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-5 p-4 rounded-2xl border border-white/10 bg-white/5"
          >
            <h3 className="text-sm font-bold text-white mb-3">Adaugă tranzacție</h3>
            <form onSubmit={submitTransaction} className="space-y-3">
              <div className="flex gap-2">
                {(["venit", "cheltuiala", "economie"] as TransactionType[]).map((tip) => (
                  <button
                    key={tip}
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, tip }))}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                      form.tip === tip
                        ? tip === "venit" ? "border-green-500/60 bg-green-600/20 text-green-300"
                          : tip === "economie" ? "border-purple-500/60 bg-purple-600/20 text-purple-300"
                          : "border-red-500/60 bg-red-600/20 text-red-300"
                        : "border-white/10 bg-white/5 text-white/50"
                    }`}
                  >
                    {tip === "venit" ? "Venit" : tip === "cheltuiala" ? "Cheltuială" : "Economie"}
                  </button>
                ))}
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <input
                  required
                  value={form.descriere}
                  onChange={(e) => setForm((p) => ({ ...p, descriere: e.target.value }))}
                  placeholder="Descriere"
                  className="px-3 py-2 rounded-xl border border-white/15 bg-white/5 text-white placeholder:text-white/25 text-sm focus:outline-none focus:border-purple-500/50 transition-all"
                />
                <input
                  required
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.suma}
                  onChange={(e) => setForm((p) => ({ ...p, suma: e.target.value }))}
                  placeholder="Suma (RON)"
                  className="px-3 py-2 rounded-xl border border-white/15 bg-white/5 text-white placeholder:text-white/25 text-sm focus:outline-none focus:border-purple-500/50 transition-all"
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <select
                  value={form.categorie}
                  onChange={(e) => setForm((p) => ({ ...p, categorie: e.target.value }))}
                  className="px-3 py-2 rounded-xl border border-white/15 bg-[#0d0820] text-white text-sm focus:outline-none focus:border-purple-500/50 transition-all"
                >
                  {CATEGORII.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <input
                  type="date"
                  value={form.data}
                  onChange={(e) => setForm((p) => ({ ...p, data: e.target.value }))}
                  className="px-3 py-2 rounded-xl border border-white/15 bg-[#0d0820] text-white text-sm focus:outline-none focus:border-purple-500/50 transition-all"
                />
              </div>
              <div className="flex gap-2">
                <button type="submit" className="flex-1 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold transition-all">
                  Salvează
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-xl border border-white/15 text-white/60 hover:text-white text-sm transition-all">
                  Anulează
                </button>
              </div>
            </form>
          </motion.div>
        )}

<<<<<<< HEAD
        {/* Large expense warning modal */}
        {showLargeExpenseWarning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="bg-[#1a1425] border border-red-500/30 rounded-2xl p-5 max-w-sm w-full"
            >
              <h3 className="text-lg font-bold text-white mb-3">Atenție</h3>
              <p className="text-white/70 mb-5">Ești sigur că vrei să salvezi această cheltuială?</p>
              <div className="flex gap-2">
                <button
                  onClick={confirmLargeExpense}
                  className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-bold transition-all"
                >
                  Confirmă
                </button>
                <button
                  onClick={() => { setShowLargeExpenseWarning(false); setPendingTransaction(null); }}
                  className="flex-1 py-2 rounded-xl border border-white/15 text-white/70 hover:text-white text-sm transition-all"
                >
                  Anulează
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Delete confirmation modal */}
        {deleteConfirmId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="bg-[#1a1425] border border-white/10 rounded-2xl p-5 max-w-sm w-full"
            >
              <h3 className="text-lg font-bold text-white mb-3">Confirmare ștergere</h3>
              <p className="text-white/70 mb-5">Sigur vrei să ștergi această tranzacție?</p>
              <div className="flex gap-2">
                <button
                  onClick={confirmDelete}
                  className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-bold transition-all"
                >
                  Șterge
                </button>
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="flex-1 py-2 rounded-xl border border-white/15 text-white/70 hover:text-white text-sm transition-all"
                >
                  Anulează
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

=======
>>>>>>> bca33c6a3a6b536a83ed88053ea89ffdd976de0f
        {/* Tabs */}
        <div className="flex gap-1 mb-5 p-1 bg-white/5 rounded-2xl border border-white/10">
          {(["tranzactii", "bugete", "obiectiv"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${
                tab === t ? "bg-purple-600/30 text-purple-300 border border-purple-500/30" : "text-white/50 hover:text-white"
              }`}
            >
              {t === "tranzactii" ? "Tranzacții" : t === "bugete" ? "Bugete" : "Obiectiv economii"}
            </button>
          ))}
        </div>

        {/* Transactions */}
        {tab === "tranzactii" && (
          <div className="space-y-2">
            {financeState.tranzactii.length === 0 ? (
              <div className="text-center py-16 text-white/30">
                <PiggyBank size={40} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm">Nicio tranzacție. Apasă "+ Adaugă" pentru a începe.</p>
              </div>
            ) : (
              financeState.tranzactii.map((t, i) => (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className="flex items-center gap-3 p-3 rounded-xl border border-white/8 bg-white/4 hover:bg-white/6 transition-all group"
                >
                  <div className={`w-2 h-8 rounded-full shrink-0 ${t.tip === "venit" ? "bg-green-400" : t.tip === "economie" ? "bg-purple-400" : "bg-red-400"}`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-white truncate">{t.descriere}</div>
                    <div className="text-xs text-white/40">{t.categorie} · {t.data}</div>
                  </div>
                  <div className={`font-black text-sm shrink-0 ${t.tip === "venit" ? "text-green-400" : t.tip === "economie" ? "text-purple-400" : "text-red-400"}`}>
                    {t.tip === "venit" ? "+" : "-"}{t.suma.toFixed(0)} RON
                  </div>
                  <button
<<<<<<< HEAD
                    onClick={() => setDeleteConfirmId(t.id)}
=======
                    onClick={() => deleteTransaction(t.id)}
>>>>>>> bca33c6a3a6b536a83ed88053ea89ffdd976de0f
                    className="p-1.5 rounded-lg text-white/20 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </motion.div>
              ))
            )}
          </div>
        )}

        {/* Budgets */}
        {tab === "bugete" && (
          <div className="space-y-3">
            <p className="text-xs text-white/40 mb-4">Setează limite de cheltuieli per categorie și urmărește progresul lunar.</p>
            {financeState.budgete.map((b, i) => {
              const cheltuit = cheltuieliPerCategorie[b.categorie] ?? 0;
              const pct = b.limita > 0 ? Math.min(100, (cheltuit / b.limita) * 100) : 0;
              const overBudget = cheltuit > b.limita && b.limita > 0;
              return (
                <div key={b.categorie} className="p-3 rounded-xl border border-white/10 bg-white/5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-white">{b.categorie}</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold ${overBudget ? "text-red-400" : "text-white/60"}`}>
                        {cheltuit.toFixed(0)} / {b.limita} RON
                      </span>
                      <input
                        type="number"
                        min="0"
                        value={b.limita}
                        onChange={(e) => updateBudget(b.categorie, parseInt(e.target.value) || 0)}
                        className="w-20 px-2 py-1 rounded-lg border border-white/15 bg-white/5 text-white text-xs focus:outline-none focus:border-purple-500/50 text-right"
                      />
<<<<<<< HEAD
                      {overBudget && <span className="text-xs text-red-400 font-semibold">⚠️ Ai depășit bugetul propus!</span>}
=======
>>>>>>> bca33c6a3a6b536a83ed88053ea89ffdd976de0f
                    </div>
                  </div>
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${overBudget ? "bg-red-500" : ""}`}
                      style={{
                        width: `${pct}%`,
                        background: overBudget ? undefined : COLORS[i % COLORS.length],
                      }}
                    />
                  </div>
                </div>
              );
            })}
            <div className="p-3 rounded-xl border border-white/10 bg-white/5 flex items-center justify-between">
              <span className="text-sm font-bold text-white/70">Total cheltuieli lunare</span>
              <span className="text-sm font-black text-red-400">{totalCheltuieliLuna.toFixed(0)} RON</span>
            </div>
          </div>
        )}

        {/* Savings goal */}
        {tab === "obiectiv" && (
          <div className="space-y-4">
            <div className="p-5 rounded-2xl border border-purple-500/20 bg-purple-500/5">
              <div className="flex items-center gap-2 mb-4">
                <Target size={18} className="text-purple-400" />
                <h3 className="font-bold text-white">Obiectiv de economii</h3>
              </div>
              <div className="mb-4">
<<<<<<< HEAD
                {financeState.obiectivEconomii > 0 && (
                  <>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-white/50">Progres</span>
                      <span className="text-xs font-bold text-purple-300">
                        {financeState.economiiCurente.toFixed(0)} / {financeState.obiectivEconomii} RON
                      </span>
                    </div>
                    <div className="w-full h-4 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-fuchsia-500 rounded-full transition-all duration-700"
                        style={{ width: `${Math.min(100, (financeState.economiiCurente / financeState.obiectivEconomii) * 100)}%` }}
                      />
                    </div>
                    <div className="text-xs text-white/40 mt-1 text-right">
                      {Math.round((financeState.economiiCurente / financeState.obiectivEconomii) * 100)}%
                    </div>
                  </>
                )}
                {financeState.obiectivEconomii === 0 && (
                  <div className="text-sm text-white/60">Setează un obiectiv pentru a vedea progresul.</div>
                )}
=======
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-white/50">Progres</span>
                  <span className="text-xs font-bold text-purple-300">
                    {financeState.economiiCurente.toFixed(0)} / {financeState.obiectivEconomii} RON
                  </span>
                </div>
                <div className="w-full h-4 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-fuchsia-500 rounded-full transition-all duration-700"
                    style={{ width: `${Math.min(100, (financeState.economiiCurente / financeState.obiectivEconomii) * 100)}%` }}
                  />
                </div>
                <div className="text-xs text-white/40 mt-1 text-right">
                  {Math.round((financeState.economiiCurente / financeState.obiectivEconomii) * 100)}%
                </div>
>>>>>>> bca33c6a3a6b536a83ed88053ea89ffdd976de0f
              </div>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="0"
                  value={newObiectiv}
                  onChange={(e) => setNewObiectiv(e.target.value)}
                  placeholder="Obiectiv nou (RON)"
                  className="flex-1 px-3 py-2 rounded-xl border border-white/15 bg-white/5 text-white placeholder:text-white/25 text-sm focus:outline-none focus:border-purple-500/50 transition-all"
                />
                <button
                  onClick={() => { if (newObiectiv) setObiectiv(parseFloat(newObiectiv)); }}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold transition-all"
                >
                  Setează
                </button>
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-white/10 bg-white/5">
              <h4 className="text-sm font-bold text-white mb-3">Sfaturi pentru economii</h4>
              <ul className="space-y-2">
                {[
                  "Regula 50/30/20: 50% nevoi, 30% dorințe, 20% economii",
                  "Economisește înainte să cheltuiești — pune deoparte automat",
                  "Un fond de urgență de 3-6 luni de cheltuieli e esențial",
                  "Revizuiește abonamentele lunare — ai unele inutile?",
                  "Gătitul acasă economisește în medie 500-800 RON/lună",
                ].map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-white/50">
                    <span className="text-purple-400 shrink-0 mt-0.5">•</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
<<<<<<< HEAD
      <MentorChat />
=======
>>>>>>> bca33c6a3a6b536a83ed88053ea89ffdd976de0f
    </Layout>
  );
}
