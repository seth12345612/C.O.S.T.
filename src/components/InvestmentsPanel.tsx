"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { TrendingUp, TrendingDown, PiggyBank, Target, Plus, Minus, BarChart3 } from "lucide-react"
import type { Investment, ObiectivTermenLung } from "@/types"
import {
  ACTIUNI,
  FONDURI_MUTUALE,
  OBIECTIVE_DEFAULT,
  simuleazaPiata,
  INVESTMENTS_KEY,
  OBJECTIVE_KEY,
} from "@/data/investments"

const HISTORY_KEY = "cost_portfolio_history"

interface PortfolioSnapshot {
  value: number
  timestamp: number
}

function PortfolioChart({ data }: { data: PortfolioSnapshot[] }) {
  if (data.length < 2) return null

  const values = data.map((d) => d.value)
  const max = Math.max(...values, 1)
  const min = Math.min(...values, 0)
  const range = max - min || 1
  const width = 320
  const height = 120
  const padding = 4
  const chartW = width - padding * 2
  const chartH = height - padding * 2

  const points = data.map((d, i) => {
    const x = padding + (i / (data.length - 1)) * chartW
    const y = padding + chartH - ((d.value - min) / range) * chartH
    return `${x},${y}`
  })

  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"}${p}`).join("")
  const firstVal = data[0].value
  const lastVal = data[data.length - 1].value
  const trend = lastVal - firstVal
  const trendPct = firstVal > 0 ? (trend / firstVal) * 100 : 0
  const TrendIcon = trend >= 0 ? TrendingUp : TrendingDown

  return (
    <div className="bg-card border border-subtle rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-main flex items-center gap-1.5">
          <BarChart3 size={14} className="text-purple-400" />
          Evoluția portofoliului
        </h3>
        <span className={`flex items-center gap-1 text-xs font-bold ${trend >= 0 ? "text-green-400" : "text-red-400"}`}>
          <TrendIcon size={12} />
          {trendPct >= 0 ? "+" : ""}{trendPct.toFixed(1)}%
        </span>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={trend >= 0 ? "#22c55e" : "#ef4444"} stopOpacity="0.25" />
            <stop offset="100%" stopColor={trend >= 0 ? "#22c55e" : "#ef4444"} stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <path d={`${pathD}L${padding + chartW},${padding + chartH}L${padding},${padding + chartH}Z`} fill="url(#chartGrad)" />
        <path d={pathD} fill="none" stroke={trend >= 0 ? "#22c55e" : "#ef4444"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {[0, data.length - 1].map((i) => {
          const [x, y] = points[i].split(",").map(Number)
          return <circle key={i} cx={x} cy={y} r="3" fill={trend >= 0 ? "#22c55e" : "#ef4444"} stroke="#1a1a2e" strokeWidth="1.5" />
        })}
      </svg>
      <div className="flex justify-between text-[10px] text-muted mt-1">
        <span>{new Date(data[0].timestamp).toLocaleDateString("ro-RO", { month: "short", day: "numeric" })}</span>
        <span>{new Date(data[data.length - 1].timestamp).toLocaleDateString("ro-RO", { month: "short", day: "numeric" })}</span>
      </div>
    </div>
  )
}

interface InvestmentsPanelProps {
  baniDisponibili: number
  onInvest: (suma: number) => void
}

export function InvestmentsPanel({ baniDisponibili, onInvest }: InvestmentsPanelProps) {
  const [investitii, setInvestitii] = useState<Investment[]>([])
  const [obiective, setObiective] = useState<ObiectivTermenLung[]>([])
  const [unitati, setUnitati] = useState<Record<string, number>>({})
  const [alocare, setAlocare] = useState<Record<string, string>>({})
  const [history, setHistory] = useState<PortfolioSnapshot[]>([])

  useEffect(() => {
    const raw = localStorage.getItem(INVESTMENTS_KEY)
    if (raw) {
      try {
        setInvestitii(JSON.parse(raw))
      } catch { /* empty */ }
    }
    const rawObj = localStorage.getItem(OBJECTIVE_KEY)
    if (rawObj) {
      try {
        setObiective(JSON.parse(rawObj))
      } catch { /* empty */ }
    }
    const rawHist = localStorage.getItem(HISTORY_KEY)
    if (rawHist) {
      try {
        setHistory(JSON.parse(rawHist))
      } catch { /* empty */ }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(INVESTMENTS_KEY, JSON.stringify(investitii))
  }, [investitii])

  useEffect(() => {
    localStorage.setItem(OBJECTIVE_KEY, JSON.stringify(obiective))
  }, [obiective])

  useEffect(() => {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history))
  }, [history])

  const totalPortofoliu = investitii.reduce((sum, i) => sum + i.valoareCurenta, 0)
  const totalInvestit = investitii.reduce((sum, i) => sum + i.sumaInvestita, 0)
  const diferenta = totalPortofoliu - totalInvestit
  const randamentProcentual = totalInvestit > 0 ? (diferenta / totalInvestit) * 100 : 0

  useEffect(() => {
    if (totalInvestit === 0) return
    setHistory((prev) => {
      const last = prev[prev.length - 1]
      if (last && Math.abs(last.value - totalPortofoliu) < 1) return prev
      const next = [...prev, { value: totalPortofoliu, timestamp: Date.now() }]
      return next.length > 20 ? next.slice(-20) : next
    })
  }, [totalPortofoliu, totalInvestit])

  const handleBuy = useCallback(
    (template: Investment) => {
      const nrUnitati = unitati[template.id] || 1
      const cost = template.valoareCurenta * nrUnitati
      if (cost > baniDisponibili || cost <= 0) return
      const nouaInvestitie: Investment = {
        id: `${template.id}_${Date.now()}`,
        tip: template.tip,
        nume: template.nume,
        sumaInvestita: cost,
        valoareCurenta: cost,
        randamentAnual: template.randamentAnual,
        dataCumpararii: Date.now(),
        risc: template.risc,
      }
      setInvestitii((prev) => [...prev, nouaInvestitie])
      onInvest(cost)
      setUnitati((prev) => ({ ...prev, [template.id]: 1 }))
    },
    [unitati, baniDisponibili, onInvest]
  )

  const handleSell = useCallback(
    (inv: Investment) => {
      setInvestitii((prev) => prev.filter((i) => i.id !== inv.id))
      onInvest(-inv.valoareCurenta)
    },
    [onInvest]
  )

  const handleAllocate = useCallback(
    (obj: ObiectivTermenLung) => {
      const suma = Number(alocare[obj.id]) || 0
      if (suma <= 0 || suma > baniDisponibili) return
      setObiective((prev) =>
        prev.map((o) =>
          o.id === obj.id
            ? { ...o, sumaAcumulata: Math.min(o.sumaAcumulata + suma, o.sumaTinta) }
            : o
        )
      )
      onInvest(suma)
      setAlocare((prev) => ({ ...prev, [obj.id]: "" }))
    },
    [alocare, baniDisponibili, onInvest]
  )

  const riscCuloare = (r: Investment["risc"]) =>
    r === "scazut" ? "text-green-400" : r === "mediu" ? "text-yellow-400" : "text-red-400"

  const riscBg = (r: Investment["risc"]) =>
    r === "scazut" ? "bg-green-500/10 border-green-500/20" : r === "mediu" ? "bg-yellow-500/10 border-yellow-500/20" : "bg-red-500/10 border-red-500/20"

  const randamentCuloare = (val: number) =>
    val >= 0 ? "text-green-400" : "text-red-400"

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="bg-card-strong border border-subtle rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-main flex items-center gap-2">
            <PiggyBank size={20} className="text-purple-400" />
            Portofoliu de Investiții
          </h2>
          <span className="text-sm text-muted">
            Disponibil: <span className="text-main font-semibold">{baniDisponibili} RON</span>
          </span>
        </div>
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-card border border-subtle rounded-xl p-3 text-center">
            <p className="text-xs text-muted mb-1">Valoare Totală</p>
            <p className="text-lg font-bold text-main">{totalPortofoliu} RON</p>
          </div>
          <div className="bg-card border border-subtle rounded-xl p-3 text-center">
            <p className="text-xs text-muted mb-1">Investit</p>
            <p className="text-lg font-bold text-main">{totalInvestit} RON</p>
          </div>
          <div className="bg-card border border-subtle rounded-xl p-3 text-center">
            <p className="text-xs text-muted mb-1">Randament</p>
            <p className={`text-lg font-bold flex items-center justify-center gap-1 ${randamentCuloare(diferenta)}`}>
              {diferenta >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              {randamentProcentual.toFixed(1)}%
            </p>
          </div>
        </div>

        {history.length >= 2 && <PortfolioChart data={history} />}

        <AnimatePresence mode="popLayout">
          {investitii.length === 0 ? (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-muted py-6 text-sm"
            >
              Nu ai investiții active. Cumpără mai jos!
            </motion.p>
          ) : (
            <motion.div layout className="space-y-2">
              {investitii.map((inv) => {
                const profit = inv.valoareCurenta - inv.sumaInvestita
                const profitPct = inv.sumaInvestita > 0 ? (profit / inv.sumaInvestita) * 100 : 0
                return (
                  <motion.div
                    key={inv.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex items-center justify-between bg-card border border-subtle rounded-xl p-3"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-main truncate">{inv.nume}</p>
                      <div className="flex gap-3 text-xs text-muted mt-1">
                        <span>Investit: <span className="text-main">{inv.sumaInvestita} RON</span></span>
                        <span>Actual: <span className="text-main">{inv.valoareCurenta} RON</span></span>
                        <span className={`flex items-center gap-0.5 ${randamentCuloare(profit)}`}>
                          {profit > 0 ? <TrendingUp size={12} /> : profit < 0 ? <TrendingDown size={12} /> : null}
                          {profit >= 0 ? "+" : ""}{profitPct.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleSell(inv)}
                      className="ml-3 shrink-0 px-3 py-1.5 text-xs rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors"
                    >
                      Vinde
                    </button>
                  </motion.div>
                )
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="bg-card-strong border border-subtle rounded-2xl p-6">
        <h2 className="text-lg font-bold text-main flex items-center gap-2 mb-4">
          <TrendingUp size={20} className="text-emerald-400" />
          Cumpără Investiții
        </h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-strong mb-2">Acțiuni</h3>
            <div className="space-y-2">
              {ACTIUNI.map((a) => (
                <div
                  key={a.id}
                  className="bg-card border border-subtle rounded-xl p-3"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-sm font-medium text-main">{a.nume}</p>
                      <div className="flex gap-2 text-xs text-muted mt-0.5">
                        <span>Preț: <span className="text-main">{a.valoareCurenta} RON</span></span>
                        <span>Randament: <span className="text-emerald-400">{(a.randamentAnual * 100).toFixed(0)}%/an</span></span>
                        <span className={riscCuloare(a.risc)}>Risc: {a.risc}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center bg-card-strong rounded-lg border border-subtle">
                      <button
                        onClick={() =>
                          setUnitati((prev) => ({
                            ...prev,
                            [a.id]: Math.max(1, (prev[a.id] || 1) - 1),
                          }))
                        }
                        className="p-1.5 text-muted hover:text-main transition-colors"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-8 text-center text-sm text-main font-medium">
                        {unitati[a.id] || 1}
                      </span>
                      <button
                        onClick={() =>
                          setUnitati((prev) => ({
                            ...prev,
                            [a.id]: (prev[a.id] || 1) + 1,
                          }))
                        }
                        className="p-1.5 text-muted hover:text-main transition-colors"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <span className="text-xs text-muted">
                      Total: <span className="text-main font-medium">{(a.valoareCurenta * (unitati[a.id] || 1)).toFixed(0)} RON</span>
                    </span>
                    <button
                      onClick={() => handleBuy(a)}
                      disabled={a.valoareCurenta * (unitati[a.id] || 1) > baniDisponibili}
                      className="ml-auto px-3 py-1.5 text-xs rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      Cumpără
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-strong mb-2">Fonduri Mutuale</h3>
            <div className="space-y-2">
              {FONDURI_MUTUALE.map((f) => (
                <div
                  key={f.id}
                  className="bg-card border border-subtle rounded-xl p-3"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-sm font-medium text-main">{f.nume}</p>
                      <div className="flex gap-2 text-xs text-muted mt-0.5">
                        <span>Preț: <span className="text-main">{f.valoareCurenta} RON</span></span>
                        <span>Randament: <span className="text-emerald-400">{(f.randamentAnual * 100).toFixed(0)}%/an</span></span>
                        <span className={riscCuloare(f.risc)}>Risc: {f.risc}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center bg-card-strong rounded-lg border border-subtle">
                      <button
                        onClick={() =>
                          setUnitati((prev) => ({
                            ...prev,
                            [f.id]: Math.max(1, (prev[f.id] || 1) - 1),
                          }))
                        }
                        className="p-1.5 text-muted hover:text-main transition-colors"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-8 text-center text-sm text-main font-medium">
                        {unitati[f.id] || 1}
                      </span>
                      <button
                        onClick={() =>
                          setUnitati((prev) => ({
                            ...prev,
                            [f.id]: (prev[f.id] || 1) + 1,
                          }))
                        }
                        className="p-1.5 text-muted hover:text-main transition-colors"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <span className="text-xs text-muted">
                      Total: <span className="text-main font-medium">{(f.valoareCurenta * (unitati[f.id] || 1)).toFixed(0)} RON</span>
                    </span>
                    <button
                      onClick={() => handleBuy(f)}
                      disabled={f.valoareCurenta * (unitati[f.id] || 1) > baniDisponibili}
                      className="ml-auto px-3 py-1.5 text-xs rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      Cumpără
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card-strong border border-subtle rounded-2xl p-6">
        <h2 className="text-lg font-bold text-main flex items-center gap-2 mb-4">
          <Target size={20} className="text-rose-400" />
          Obiective pe Termen Lung
        </h2>
        <div className="space-y-3">
          {OBIECTIVE_DEFAULT.map((obj) => {
            const existent = obiective.find((o) => o.id === obj.id)
            const sumaAcumulata = existent?.sumaAcumulata ?? obj.sumaAcumulata
            const progres = obj.sumaTinta > 0 ? Math.min((sumaAcumulata / obj.sumaTinta) * 100, 100) : 0
            const prioritateCuloare =
              obj.prioritate === "ridicata"
                ? "text-red-400"
                : obj.prioritate === "medie"
                  ? "text-yellow-400"
                  : "text-green-400"
            return (
              <div
                key={obj.id}
                className="bg-card border border-subtle rounded-xl p-3"
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-sm font-medium text-main">{obj.nume}</p>
                    <div className="flex gap-3 text-xs text-muted mt-0.5">
                      <span>
                        {sumaAcumulata} RON / {obj.sumaTinta} RON
                      </span>
                      <span className={prioritateCuloare}>
                        Prioritate: {obj.prioritate}
                      </span>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-main">{progres.toFixed(0)}%</span>
                </div>
                <div className="w-full h-2 bg-card-strong rounded-full overflow-hidden mb-3">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progres}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className={`h-full rounded-full ${
                      progres >= 100
                        ? "bg-emerald-500"
                        : progres >= 50
                          ? "bg-yellow-500"
                          : "bg-rose-500"
                    }`}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    max={baniDisponibili}
                    value={alocare[obj.id] || ""}
                    onChange={(e) =>
                      setAlocare((prev) => ({ ...prev, [obj.id]: e.target.value }))
                    }
                    placeholder="Sumă"
                    className="w-24 px-2 py-1.5 text-xs rounded-lg bg-card-strong border border-subtle text-main placeholder:text-muted focus:outline-none focus:border-purple-500/50"
                  />
                  <button
                    onClick={() => handleAllocate(obj)}
                    disabled={!alocare[obj.id] || Number(alocare[obj.id]) <= 0 || Number(alocare[obj.id]) > baniDisponibili}
                    className="px-3 py-1.5 text-xs rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Alocă
                  </button>
                </div>
              </div>
            )
          })}
        </div>
        {obiective.length > 0 && (
          <div className="mt-4 pt-4 border-t border-subtle">
            <p className="text-xs text-muted text-center">
              Total alocat obiectivelor:{" "}
              <span className="text-main font-medium">
                {obiective.reduce((s, o) => s + o.sumaAcumulata, 0)} RON
              </span>
            </p>
          </div>
        )}
      </div>
    </motion.div>
  )
}
