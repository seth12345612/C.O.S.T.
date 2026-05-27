import { useState, useEffect, useMemo } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, TrendingDown, DollarSign, RefreshCw, BarChart3, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Layout } from "@/components/Layout";
import { OrbBackground } from "@/components/OrbBackground";
import { useXP } from "@/context/XPContext";

interface Stock {
  name: string;
  sector: string;
  price: number;
  owned: number;
  priceHistory: number[];
}

const INITIAL_STOCKS: Stock[] = [
  { name: "TechNova", sector: "tech", price: 150, owned: 0, priceHistory: [150] },
  { name: "GreenPower", sector: "energie", price: 80, owned: 0, priceHistory: [80] },
  { name: "MedLife", sector: "sănătate", price: 210, owned: 0, priceHistory: [210] },
  { name: "FinBank", sector: "financiar", price: 95, owned: 0, priceHistory: [95] },
  { name: "EduFuture", sector: "educație", price: 45, owned: 0, priceHistory: [45] },
];

const SECTOR_COLORS: Record<string, string> = {
  tech: "from-cyan-500 to-blue-600",
  energie: "from-emerald-500 to-green-600",
  sănătate: "from-rose-500 to-pink-600",
  financiar: "from-amber-500 to-yellow-600",
  educație: "from-violet-500 to-purple-600",
};

const SECTOR_BG: Record<string, string> = {
  tech: "bg-cyan-500/10 border-cyan-500/30",
  energie: "bg-emerald-500/10 border-emerald-500/30",
  sănătate: "bg-rose-500/10 border-rose-500/30",
  financiar: "bg-amber-500/10 border-amber-500/30",
  educație: "bg-violet-500/10 border-violet-500/30",
};

function generateRandomChange(): number {
  const change = (Math.random() * 0.25 + 0.10) * (Math.random() > 0.5 ? 1 : -1);
  return change;
}

function MiniSparkline({ history }: { history: number[] }) {
  const min = Math.min(...history);
  const max = Math.max(...history);
  const range = max - min || 1;

  return (
    <div className="flex items-end gap-[2px] h-8">
      {history.slice(-8).map((val, i) => {
        const height = ((val - min) / range) * 100;
        const isUp = i > 0 && val >= history.slice(-8)[i - 1];
        return (
          <div
            key={i}
            className={`w-1.5 rounded-t-sm transition-all duration-300 ${isUp ? "bg-green-400" : "bg-red-400"}`}
            style={{ height: `${Math.max(height, 8)}%` }}
          />
        );
      })}
    </div>
  );
}

function PortfolioChart({ history }: { history: number[] }) {
  const maxVal = Math.max(...history, 1);

  return (
    <div className="flex items-end gap-1 h-32">
      {history.map((val, i) => {
        const height = (val / maxVal) * 100;
        const isUp = i > 0 && val >= history[i - 1];
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <span className="text-[9px] font-bold text-muted">{Math.round(val)}</span>
            <div
              className={`w-full rounded-t-md transition-all duration-300 ${isUp ? "bg-green-500/70" : "bg-red-500/70"}`}
              style={{ height: `${Math.max(height, 4)}%` }}
            />
            <span className="text-[8px] text-faint">R{i + 1}</span>
          </div>
        );
      })}
    </div>
  );
}

function GameScreen({ onEnd }: { onEnd: () => void }) {
  const [stocks, setStocks] = useState<Stock[]>(INITIAL_STOCKS.map((s) => ({ ...s, priceHistory: [s.price] })));
  const [cash, setCash] = useState(1000);
  const [round, setRound] = useState(1);
  const [portfolioHistory, setPortfolioHistory] = useState<number[]>([1000]);
  const [gameOver, setGameOver] = useState(false);
  const [lastRoundChange, setLastRoundChange] = useState<Record<number, number>>({});

  const totalValue = useMemo(() => {
    const stocksValue = stocks.reduce((sum, s) => sum + s.price * s.owned, 0);
    return cash + stocksValue;
  }, [stocks, cash]);

  useEffect(() => {
    if (gameOver) return;
    if (round > 10) {
      setGameOver(true);
      return;
    }
  }, [round, gameOver]);

  function nextRound() {
    if (round >= 10) {
      setGameOver(true);
      return;
    }

    setStocks((prev) => {
      const changes: Record<number, number> = {};
      const updated = prev.map((s, i) => {
        const change = generateRandomChange();
        changes[i] = change;
        const newPrice = Math.max(1, Math.round(s.price * (1 + change)));
        return { ...s, price: newPrice, priceHistory: [...s.priceHistory, newPrice] };
      });
      setLastRoundChange(changes);
      return updated;
    });

    setRound((r) => r + 1);
  }

  useEffect(() => {
    if (round > 1 || portfolioHistory.length === 1) {
      setPortfolioHistory((prev) => [...prev, totalValue]);
    }
  }, [round]);

  function buyStock(index: number) {
    setStocks((prev) => {
      const stock = prev[index];
      const price = stock.price;
      if (cash < price) {
        toast.error("Fonduri insuficiente!");
        return prev;
      }
      const updated = [...prev];
      updated[index] = { ...stock, owned: stock.owned + 1 };
      setCash((c) => c - price);
      toast.success(`Ai cumpărat 1 acțiune ${stock.name} pentru ${price} RON`);
      return updated;
    });
  }

  function sellStock(index: number) {
    setStocks((prev) => {
      const stock = prev[index];
      if (stock.owned <= 0) {
        toast.error("Nu deții acțiuni din această companie!");
        return prev;
      }
      const updated = [...prev];
      updated[index] = { ...stock, owned: stock.owned - 1 };
      setCash((c) => c + stock.price);
      toast.success(`Ai vândut 1 acțiune ${stock.name} pentru ${stock.price} RON`);
      return updated;
    });
  }

  if (gameOver) {
    return <GameOverScreen portfolioHistory={portfolioHistory} totalValue={totalValue} cash={cash} onEnd={onEnd} />;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <Link href="/" className="inline-flex items-center gap-1.5 text-dim hover:text-main text-sm mb-6 transition-colors">
        <ArrowLeft size={14} /> Înapoi
      </Link>

      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-3xl font-black text-main mb-1">Simulator Bursă</h1>
        <p className="text-sm text-muted">Investește în acțiuni și maximizează-ți portofoliul în 10 runde!</p>
      </motion.div>

      <div className="grid lg:grid-cols-4 gap-4 mb-6">
        <div className="p-4 rounded-2xl border border-subtle bg-card">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign size={16} className="text-yellow-400" />
            <span className="text-xs font-bold text-muted uppercase tracking-wider">Numerar</span>
          </div>
          <span className="text-2xl font-black text-main">{cash.toLocaleString("ro-RO")} RON</span>
        </div>
        <div className="p-4 rounded-2xl border border-subtle bg-card">
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 size={16} className="text-blue-400" />
            <span className="text-xs font-bold text-muted uppercase tracking-wider">Portofoliu</span>
          </div>
          <span className="text-2xl font-black text-main">{totalValue.toLocaleString("ro-RO")} RON</span>
        </div>
        <div className="p-4 rounded-2xl border border-subtle bg-card">
          <div className="flex items-center gap-2 mb-1">
            <RefreshCw size={16} className="text-purple-400" />
            <span className="text-xs font-bold text-muted uppercase tracking-wider">Runda</span>
          </div>
          <span className="text-2xl font-black text-main">{round} / 10</span>
        </div>
        <div className="p-4 rounded-2xl border border-subtle bg-card">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp size={16} className="text-emerald-400" />
            <span className="text-xs font-bold text-muted uppercase tracking-wider">Profit</span>
          </div>
          <span className={`text-2xl font-black ${totalValue >= 1000 ? "text-green-400" : "text-red-400"}`}>
            {totalValue >= 1000 ? "+" : ""}{Math.round(totalValue - 1000).toLocaleString("ro-RO")} RON
          </span>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-muted uppercase tracking-wider mb-1">Acțiuni disponibile</h2>
          {stocks.map((stock, i) => {
            const change = lastRoundChange[i];
            const changePct = change ? (change * 100).toFixed(1) : null;

            return (
              <motion.div
                key={stock.name}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`p-3 rounded-2xl border ${SECTOR_BG[stock.sector]}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="text-sm font-bold text-main">{stock.name}</span>
                    <span className="text-[10px] text-muted ml-2 uppercase">{stock.sector}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-black text-main">{stock.price} RON</span>
                    {changePct && (
                      <span className={`flex items-center gap-0.5 text-xs font-bold ${change! >= 0 ? "text-green-400" : "text-red-400"}`}>
                        {change! >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                        {change! >= 0 ? "+" : ""}{changePct}%
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <MiniSparkline history={stock.priceHistory} />
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => sellStock(i)}
                      disabled={stock.owned <= 0}
                      className="px-2.5 py-1 rounded-lg bg-red-500/20 border border-red-500/30 text-red-300 text-xs font-bold hover:bg-red-500/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      Vinde
                    </button>
                    <span className="text-xs font-bold text-muted min-w-[20px] text-center">{stock.owned}</span>
                    <button
                      onClick={() => buyStock(i)}
                      disabled={cash < stock.price}
                      className="px-2.5 py-1 rounded-lg bg-green-500/20 border border-green-500/30 text-green-300 text-xs font-bold hover:bg-green-500/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      Cumpără
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div>
          <div className="p-4 rounded-2xl border border-subtle bg-card mb-4">
            <h2 className="text-sm font-bold text-muted uppercase tracking-wider mb-3">Evoluția portofoliului</h2>
            <PortfolioChart history={portfolioHistory} />
          </div>

          <div className="p-4 rounded-2xl border border-subtle bg-card">
            <h2 className="text-sm font-bold text-muted uppercase tracking-wider mb-2">Sfaturi</h2>
            <ul className="space-y-1 text-xs text-dim list-disc list-inside">
              <li>Diversifică-ți investițiile pentru a reduce riscul</li>
              <li>Prețurile se schimbă aleator cu ±10-25% pe rundă</li>
              <li>Poți cumpăra și vinde oricând în runda curentă</li>
              <li>După 10 runde, jocul se termină și primești XP</li>
            </ul>
          </div>
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onClick={nextRound}
        className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-main font-black text-base transition-all shadow-lg shadow-emerald-900/30 flex items-center justify-center gap-2"
      >
        <RefreshCw size={18} />
        Încheie runda {round} → Runda {round + 1}
      </motion.button>
    </div>
  );
}

function GameOverScreen({
  portfolioHistory,
  totalValue,
  cash,
  onEnd,
}: {
  portfolioHistory: number[];
  totalValue: number;
  cash: number;
  onEnd: () => void;
}) {
  const { addXP } = useXP();
  const xpAwarded = Math.round((totalValue / 1000) * 30);

  useEffect(() => {
    addXP(xpAwarded);
    const result = {
      date: new Date().toISOString(),
      game: "stock_market",
      score: totalValue,
      xpAwarded,
      portfolioHistory,
    };
    try {
      const existing = JSON.parse(localStorage.getItem("cost_stock_results") || "[]");
      existing.push(result);
      localStorage.setItem("cost_stock_results", JSON.stringify(existing));
    } catch {}
    toast.success(`🎉 Ai câștigat ${xpAwarded} XP!`);
  }, []);

  const maxDrawdown = useMemo(() => {
    let peak = portfolioHistory[0];
    let maxDd = 0;
    for (const val of portfolioHistory) {
      if (val > peak) peak = val;
      const dd = (peak - val) / peak;
      if (dd > maxDd) maxDd = dd;
    }
    return maxDd;
  }, [portfolioHistory]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center mb-8">
        <div className="text-6xl mb-4">{totalValue >= 1500 ? "🏆" : totalValue >= 1000 ? "👍" : "📉"}</div>
        <h1 className="text-3xl font-black text-main mb-2">Joc terminat!</h1>
        <p className="text-sm text-muted">Ai completat toate cele 10 runde. Iată rezumatul final:</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="p-6 rounded-2xl border border-subtle bg-card mb-6"
      >
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center">
            <span className="text-xs font-bold text-muted uppercase tracking-wider block mb-1">Valoare finală</span>
            <span className={`text-3xl font-black ${totalValue >= 1000 ? "text-green-400" : "text-red-400"}`}>
              {Math.round(totalValue).toLocaleString("ro-RO")} RON
            </span>
          </div>
          <div className="text-center">
            <span className="text-xs font-bold text-muted uppercase tracking-wider block mb-1">Numerar rămas</span>
            <span className="text-3xl font-black text-main">{Math.round(cash).toLocaleString("ro-RO")} RON</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <span className="text-xs font-bold text-muted uppercase tracking-wider block mb-1">Profit total</span>
            <span className={`text-xl font-black ${totalValue >= 1000 ? "text-green-400" : "text-red-400"}`}>
              {totalValue >= 1000 ? "+" : ""}{Math.round(totalValue - 1000).toLocaleString("ro-RO")} RON
            </span>
          </div>
          <div className="text-center">
            <span className="text-xs font-bold text-muted uppercase tracking-wider block mb-1">Max Drawdown</span>
            <span className="text-xl font-black text-orange-400">{(maxDrawdown * 100).toFixed(1)}%</span>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="p-6 rounded-2xl border border-subtle bg-card mb-6"
      >
        <h2 className="text-sm font-bold text-muted uppercase tracking-wider mb-3">Evoluția portofoliului</h2>
        <PortfolioChart history={portfolioHistory} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="p-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-center mb-6"
      >
        <span className="text-xs font-bold text-muted uppercase tracking-wider block mb-1">XP CÂȘTIGAT</span>
        <span className="text-4xl font-black text-emerald-400">+{xpAwarded} XP</span>
        <p className="text-xs text-dim mt-1">
          {totalValue >= 1500 ? "Performanță excepțională! Ai un talent pentru investiții!" :
           totalValue >= 1000 ? "Rezultat solid! Ai încheiat pe plus." :
           "Nu ai făcut profit de data asta. Mai încearcă!"}
        </p>
      </motion.div>

      <div className="flex gap-3">
        <button
          onClick={onEnd}
          className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-main font-black text-base transition-all shadow-lg shadow-purple-900/30"
        >
          Joacă din nou
        </button>
        <Link
          href="/"
          className="flex-1 py-3.5 rounded-2xl border border-subtle bg-card text-main font-black text-base text-center hover:bg-card-soft8 transition-all"
        >
          Pagina principală
        </Link>
      </div>
    </div>
  );
}

export default function StockGame() {
  const [key, setKey] = useState(0);

  return (
    <Layout>
      <OrbBackground bgClass="bg-gradient-to-br from-emerald-950 via-slate-900 to-teal-950" />
      <GameScreen key={key} onEnd={() => setKey((k) => k + 1)} />
    </Layout>
  );
}
