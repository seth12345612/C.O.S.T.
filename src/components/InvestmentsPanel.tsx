"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { TrendingUp, TrendingDown, PiggyBank, Target, Plus, Minus, BarChart3, Coins, Building2, Leaf, Landmark, Wallet, Timer, Rocket, Plane, GraduationCap, Home, Car } from "lucide-react"
import type { Investment, ObiectivTermenLung } from "@/types"
import {
  ACTIUNI,
  FONDURI_MUTUALE,
  OBIECTIVE_DEFAULT,
  INVESTMENTS_KEY,
  OBJECTIVE_KEY,
} from "@/data/investments"

const HISTORY_KEY = "cost_portfolio_history"

interface PortfolioSnapshot {
  value: number
  timestamp: number
}

const RISK_CONFIG = {
  scazut: { label: "Scăzut", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", dot: "bg-emerald-400" },
  mediu: { label: "Mediu", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", dot: "bg-amber-400" },
  ridicat: { label: "Ridicat", color: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/20", dot: "bg-rose-400" },
} as const

const GOAL_ICONS: Record<string, React.ElementType> = {
  masina: Car, calatorie: Plane, educatie: GraduationCap, casa: Home,
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
  const isUp = trend >= 0
  const lineColor = isUp ? "#22c55e" : "#ef4444"

  return (
    <div className="relative bg-gradient-to-br from-card via-card to-card-strong border border-subtle rounded-xl p-4 overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 opacity-5">
        <div className={`w-full h-full rounded-full blur-3xl ${isUp ? "bg-green-500" : "bg-red-500"}`} />
      </div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-main flex items-center gap-1.5">
          <BarChart3 size={14} className={isUp ? "text-green-400" : "text-red-400"} />
          Evoluția portofoliului
        </h3>
        <motion.span
          key={trendPct}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className={`flex items-center gap-1 text-xs font-bold ${isUp ? "text-green-400" : "text-red-400"}`}
        >
          {isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {trendPct >= 0 ? "+" : ""}{trendPct.toFixed(1)}%
        </motion.span>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={lineColor} stopOpacity="0.3" />
            <stop offset="100%" stopColor={lineColor} stopOpacity="0.02" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        <path d={`${pathD}L${padding + chartW},${padding + chartH}L${padding},${padding + chartH}Z`} fill="url(#chartGrad)" />
        <path d={pathD} fill="none" stroke={lineColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" filter="url(#glow)" />
        <path d={pathD} fill="none" stroke={lineColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.8" />
        {[0, data.length - 1].map((i) => {
          const [x, y] = points[i].split(",").map(Number)
          return (
            <g key={i}>
              <circle cx={x} cy={y} r="4" fill="#1a1a2e" stroke={lineColor} strokeWidth="2" />
              <circle cx={x} cy={y} r="1.5" fill={lineColor} />
            </g>
          )
        })}
      </svg>
      <div className="flex justify-between text-[10px] text-muted mt-1">
        <span>{new Date(data[0].timestamp).toLocaleDateString("ro-RO", { month: "short", day: "numeric" })}</span>
        <span>{new Date(data[data.length - 1].timestamp).toLocaleDateString("ro-RO", { month: "short", day: "numeric" })}</span>
      </div>
    </div>
  )
}

function AnimatedNumber({ value, suffix = "" }: { value: number; suffix?: string }) {
  return (
    <motion.span
      key={value}
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      className="tabular-nums"
    >
      {value} {suffix}
    </motion.span>
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
    if (raw) { try { setInvestitii(JSON.parse(raw)) } catch {} }
    const rawObj = localStorage.getItem(OBJECTIVE_KEY)
    if (rawObj) { try { setObiective(JSON.parse(rawObj)) } catch {} }
    const rawHist = localStorage.getItem(HISTORY_KEY)
    if (rawHist) { try { setHistory(JSON.parse(rawHist)) } catch {} }
  }, [])

  useEffect(() => { localStorage.setItem(INVESTMENTS_KEY, JSON.stringify(investitii)) }, [investitii])
  useEffect(() => { localStorage.setItem(OBJECTIVE_KEY, JSON.stringify(obiective)) }, [obiective])
  useEffect(() => { localStorage.setItem(HISTORY_KEY, JSON.stringify(history)) }, [history])

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

  const randamentCuloare = (val: number) => val >= 0 ? "text-emerald-400" : "text-rose-400"

  const INVEST_EMOJIS: Record<string, string> = {
    actiuni_tech: "💻", actiuni_energie: "🌿", actiuni_banca: "🏛️",
    fond_echilibrat: "⚖️", fond_cu_venit: "🔒", fond_agresiv: "🚀",
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Portfolio Overview */}
      <div className="relative bg-gradient-to-br from-indigo-500/5 via-card-strong to-card-strong border border-indigo-500/10 rounded-2xl p-6 overflow-hidden">
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-main flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <PiggyBank size={16} className="text-white" />
              </div>
              Portofoliu de Investiții
            </h2>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20">
              <Wallet size={13} className="text-emerald-400" />
              <span className="text-xs text-muted">Disponibil:</span>
              <span className="text-sm font-bold text-emerald-400">{baniDisponibili} RON</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-4">
            {[
              { label: "Valoare Totală", value: totalPortofoliu, icon: Coins, gradient: "from-blue-500 to-indigo-600" },
              { label: "Investit", value: totalInvestit, icon: BarChart3, gradient: "from-violet-500 to-purple-600" },
              { label: "Randament", value: randamentProcentual, isPct: true, icon: TrendingUp, gradient: diferenta >= 0 ? "from-emerald-500 to-green-600" : "from-rose-500 to-red-600" },
            ].map((card, i) => (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i }}
                className="relative group"
              >
                <div className="bg-gradient-to-br from-card to-card-strong border border-subtle hover:border-strong/50 rounded-xl p-3.5 text-center transition-all duration-300">
                  <div className={`w-7 h-7 mx-auto mb-2 rounded-lg bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-lg`}>
                    <card.icon size={13} className="text-white" />
                  </div>
                  <p className="text-[11px] text-muted mb-0.5">{card.label}</p>
                  <p className={`text-base font-bold flex items-center justify-center gap-1 ${card.isPct ? randamentCuloare(diferenta) : "text-main"}`}>
                    {card.isPct ? (
                      <>
                        {diferenta >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                        {randamentProcentual.toFixed(1)}%
                      </>
                    ) : (
                      <AnimatedNumber value={card.value} suffix="RON" />
                    )}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {history.length >= 2 && <PortfolioChart data={history} />}

          <AnimatePresence mode="popLayout">
            {investitii.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-8"
              >
                <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 flex items-center justify-center">
                  <Coins size={22} className="text-indigo-400" />
                </div>
                <p className="text-sm text-muted mb-1">Nu ai investiții active</p>
                <p className="text-xs text-muted/60">Cumpără acțiuni sau fonduri mutuale mai jos</p>
              </motion.div>
            ) : (
              <motion.div layout className="space-y-2 mt-4">
                {investitii.map((inv, idx) => {
                  const profit = inv.valoareCurenta - inv.sumaInvestita
                  const profitPct = inv.sumaInvestita > 0 ? (profit / inv.sumaInvestita) * 100 : 0
                  const risk = RISK_CONFIG[inv.risc]
                  return (
                    <motion.div
                      key={inv.id}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: idx * 0.03 }}
                      className="relative flex items-center gap-3 bg-gradient-to-r from-card to-card-strong border border-subtle hover:border-strong/40 rounded-xl p-3.5 group transition-all duration-200"
                    >
                      <div className={`absolute left-0 top-2 bottom-2 w-1 rounded-full ${profit >= 0 ? "bg-emerald-500" : "bg-rose-500"}`} />
                      <div className="flex-1 min-w-0 pl-2">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-semibold text-main truncate">{inv.nume}</span>
                          <span className={`shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-full ${risk.bg} ${risk.border} ${risk.color}`}>
                            {risk.label}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
                          <span>Investit: <span className="text-main font-medium">{inv.sumaInvestita} RON</span></span>
                          <span>Actual: <span className="text-main font-medium">{inv.valoareCurenta} RON</span></span>
                          <motion.span
                            key={profit}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className={`inline-flex items-center gap-0.5 font-semibold ${randamentCuloare(profit)}`}
                          >
                            {profit > 0 ? <TrendingUp size={11} /> : profit < 0 ? <TrendingDown size={11} /> : null}
                            {profit >= 0 ? "+" : ""}{profitPct.toFixed(1)}%
                          </motion.span>
                        </div>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleSell(inv)}
                        className="shrink-0 px-3.5 py-2 text-xs font-medium rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 hover:shadow-lg hover:shadow-rose-500/10 transition-all"
                      >
                        Vinde
                      </motion.button>
                    </motion.div>
                  )
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Buy Section */}
      <div className="relative bg-gradient-to-br from-emerald-500/5 via-card-strong to-card-strong border border-emerald-500/10 rounded-2xl p-6 overflow-hidden">
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <TrendingUp size={16} className="text-white" />
            </div>
            <h2 className="text-lg font-bold text-main">Cumpără Investiții</h2>
          </div>

          <div className="space-y-5">
            {/* Stocks */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="h-5 w-1 rounded-full bg-gradient-to-b from-sky-400 to-blue-500" />
                <h3 className="text-sm font-semibold text-strong flex items-center gap-1.5">
                  <Building2 size={14} className="text-sky-400" />
                  Acțiuni
                </h3>
              </div>
              <div className="grid sm:grid-cols-3 gap-3">
                {ACTIUNI.map((a) => {
                  const risk = RISK_CONFIG[a.risc]
                  const cost = a.valoareCurenta * (unitati[a.id] || 1)
                  return (
                    <motion.div
                      key={a.id}
                      whileHover={{ y: -2 }}
                      className="group bg-gradient-to-br from-card via-card to-card-strong border border-subtle hover:border-sky-500/30 rounded-xl p-3.5 transition-all duration-200"
                    >
                      <div className="flex items-start justify-between mb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{INVEST_EMOJIS[a.id]}</span>
                          <div>
                            <p className="text-sm font-semibold text-main leading-tight">{a.nume.replace(/\(.*\)/, "").trim()}</p>
                            <p className="text-[10px] text-muted">{a.nume.match(/\((.*?)\)/)?.[1]}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mb-3">
                        <div className="text-xs text-muted">Preț:</div>
                        <div className="text-sm font-bold text-main">{a.valoareCurenta} RON</div>
                        <div className="ml-auto flex items-center gap-1">
                          <span className="text-[10px] font-medium text-emerald-400">{(a.randamentAnual * 100).toFixed(0)}%/an</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 mb-3">
                        <span className={`w-1.5 h-1.5 rounded-full ${risk.dot}`} />
                        <span className={`text-[10px] font-medium ${risk.color}`}>{risk.label}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center bg-card-strong rounded-lg border border-subtle overflow-hidden">
                          <button
                            onClick={() => setUnitati((prev) => ({ ...prev, [a.id]: Math.max(1, (prev[a.id] || 1) - 1) }))}
                            className="p-1.5 text-muted hover:text-main hover:bg-white/5 transition-colors"
                          >
                            <Minus size={13} />
                          </button>
                          <span className="w-7 text-center text-sm text-main font-semibold tabular-nums">{unitati[a.id] || 1}</span>
                          <button
                            onClick={() => setUnitati((prev) => ({ ...prev, [a.id]: (prev[a.id] || 1) + 1 }))}
                            className="p-1.5 text-muted hover:text-main hover:bg-white/5 transition-colors"
                          >
                            <Plus size={13} />
                          </button>
                        </div>

                        <motion.button
                          key={cost}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => handleBuy(a)}
                          disabled={cost > baniDisponibili}
                          className={`px-3.5 py-1.5 text-xs font-medium rounded-xl transition-all ${
                            cost > baniDisponibili
                              ? "bg-muted/10 text-muted/50 cursor-not-allowed"
                              : "bg-gradient-to-r from-emerald-500/15 to-emerald-500/5 border border-emerald-500/25 text-emerald-400 hover:from-emerald-500/25 hover:shadow-lg hover:shadow-emerald-500/10"
                          }`}
                        >
                          {cost > baniDisponibili ? `${cost} RON` : "Cumpără"}
                        </motion.button>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>

            {/* Mutual Funds */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="h-5 w-1 rounded-full bg-gradient-to-b from-amber-400 to-orange-500" />
                <h3 className="text-sm font-semibold text-strong flex items-center gap-1.5">
                  <Landmark size={14} className="text-amber-400" />
                  Fonduri Mutuale
                </h3>
              </div>
              <div className="grid sm:grid-cols-3 gap-3">
                {FONDURI_MUTUALE.map((f) => {
                  const risk = RISK_CONFIG[f.risc]
                  const cost = f.valoareCurenta * (unitati[f.id] || 1)
                  return (
                    <motion.div
                      key={f.id}
                      whileHover={{ y: -2 }}
                      className="group bg-gradient-to-br from-card via-card to-card-strong border border-subtle hover:border-amber-500/30 rounded-xl p-3.5 transition-all duration-200"
                    >
                      <div className="flex items-start justify-between mb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{INVEST_EMOJIS[f.id]}</span>
                          <div>
                            <p className="text-sm font-semibold text-main leading-tight">{f.nume.replace(/\(.*\)/, "").trim()}</p>
                            <p className="text-[10px] text-muted">{f.nume.match(/\((.*?)\)/)?.[1]}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mb-3">
                        <div className="text-xs text-muted">Preț:</div>
                        <div className="text-sm font-bold text-main">{f.valoareCurenta} RON</div>
                        <div className="ml-auto flex items-center gap-1">
                          <span className="text-[10px] font-medium text-emerald-400">{(f.randamentAnual * 100).toFixed(0)}%/an</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 mb-3">
                        <span className={`w-1.5 h-1.5 rounded-full ${risk.dot}`} />
                        <span className={`text-[10px] font-medium ${risk.color}`}>{risk.label}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center bg-card-strong rounded-lg border border-subtle overflow-hidden">
                          <button
                            onClick={() => setUnitati((prev) => ({ ...prev, [f.id]: Math.max(1, (prev[f.id] || 1) - 1) }))}
                            className="p-1.5 text-muted hover:text-main hover:bg-white/5 transition-colors"
                          >
                            <Minus size={13} />
                          </button>
                          <span className="w-7 text-center text-sm text-main font-semibold tabular-nums">{unitati[f.id] || 1}</span>
                          <button
                            onClick={() => setUnitati((prev) => ({ ...prev, [f.id]: (prev[f.id] || 1) + 1 }))}
                            className="p-1.5 text-muted hover:text-main hover:bg-white/5 transition-colors"
                          >
                            <Plus size={13} />
                          </button>
                        </div>

                        <motion.button
                          key={cost}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => handleBuy(f)}
                          disabled={cost > baniDisponibili}
                          className={`px-3.5 py-1.5 text-xs font-medium rounded-xl transition-all ${
                            cost > baniDisponibili
                              ? "bg-muted/10 text-muted/50 cursor-not-allowed"
                              : "bg-gradient-to-r from-emerald-500/15 to-emerald-500/5 border border-emerald-500/25 text-emerald-400 hover:from-emerald-500/25 hover:shadow-lg hover:shadow-emerald-500/10"
                          }`}
                        >
                          {cost > baniDisponibili ? `${cost} RON` : "Cumpără"}
                        </motion.button>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Long-Term Goals */}
      <div className="relative bg-gradient-to-br from-rose-500/5 via-card-strong to-card-strong border border-rose-500/10 rounded-2xl p-6 overflow-hidden">
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-lg shadow-rose-500/20">
              <Rocket size={16} className="text-white" />
            </div>
            <h2 className="text-lg font-bold text-main">Obiective pe Termen Lung</h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            {OBIECTIVE_DEFAULT.map((obj, idx) => {
              const existent = obiective.find((o) => o.id === obj.id)
              const sumaAcumulata = existent?.sumaAcumulata ?? obj.sumaAcumulata
              const progres = obj.sumaTinta > 0 ? Math.min((sumaAcumulata / obj.sumaTinta) * 100, 100) : 0
              const GoalIcon = GOAL_ICONS[obj.tip] || Target

              const priorityColors: Record<string, string> = {
                ridicata: "from-red-500 to-rose-600",
                medie: "from-amber-500 to-orange-600",
                scazuta: "from-emerald-500 to-green-600",
              }

              const barColor =
                progres >= 100 ? "from-emerald-500 to-green-500"
                  : progres >= 50 ? "from-amber-500 to-orange-500"
                    : "from-rose-500 to-pink-500"

              return (
                <motion.div
                  key={obj.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.06 }}
                  className="bg-gradient-to-br from-card via-card to-card-strong border border-subtle hover:border-rose-500/20 rounded-xl p-4 transition-all duration-200"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${priorityColors[obj.prioritate]} flex items-center justify-center shadow-lg shrink-0`}>
                      <GoalIcon size={16} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-main">{obj.nume}</p>
                      <div className="flex items-center gap-3 text-xs text-muted mt-0.5">
                        <span className="font-medium">
                          <span className="text-main">{sumaAcumulata} RON</span> / {obj.sumaTinta} RON
                        </span>
                        <span className="flex items-center gap-1">
                          <Timer size={10} />
                          {obj.termenLuni} luni
                        </span>
                      </div>
                    </div>
                    <motion.span
                      key={progres.toFixed(0)}
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      className={`text-base font-black ${
                        progres >= 100 ? "text-emerald-400" : progres >= 50 ? "text-amber-400" : "text-rose-400"
                      }`}
                    >
                      {progres.toFixed(0)}%
                    </motion.span>
                  </div>

                  <div className="w-full h-2.5 bg-card-strong rounded-full overflow-hidden mb-3 border border-subtle/50">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progres}%` }}
                      transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
                      className={`h-full rounded-full bg-gradient-to-r ${barColor} shadow-lg`}
                      style={{ boxShadow: progres > 0 ? `0 0 8px ${progres >= 100 ? "#22c55e" : progres >= 50 ? "#f59e0b" : "#f43f5e"}40` : undefined }}
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <input
                        type="number"
                        min={1}
                        max={baniDisponibili}
                        value={alocare[obj.id] || ""}
                        onChange={(e) => setAlocare((prev) => ({ ...prev, [obj.id]: e.target.value }))}
                        placeholder="Sumă de alocat"
                        className="w-full px-3 py-2 text-xs rounded-xl bg-card-strong border border-subtle text-main placeholder:text-muted/50 focus:outline-none focus:border-rose-500/40 focus:ring-1 focus:ring-rose-500/20 transition-all"
                      />
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => handleAllocate(obj)}
                      disabled={!alocare[obj.id] || Number(alocare[obj.id]) <= 0 || Number(alocare[obj.id]) > baniDisponibili}
                      className="shrink-0 px-4 py-2 text-xs font-medium rounded-xl bg-gradient-to-r from-rose-500/15 to-rose-500/5 border border-rose-500/25 text-rose-400 hover:from-rose-500/25 hover:shadow-lg hover:shadow-rose-500/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                      Alocă
                    </motion.button>
                  </div>
                </motion.div>
              )
            })}
          </div>

          {obiective.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 pt-4 border-t border-subtle/50"
            >
              <p className="text-xs text-muted text-center">
                Total alocat:{" "}
                <span className="text-main font-semibold">
                  {obiective.reduce((s, o) => s + o.sumaAcumulata, 0)} RON
                </span>
                <span className="text-muted/50 mx-1.5">·</span>
                <span className="text-muted/70">
                  {obiective.filter((o) => o.sumaAcumulata >= o.sumaTinta).length}/{obiective.length} atinse
                </span>
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
