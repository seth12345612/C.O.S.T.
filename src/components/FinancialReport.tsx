import { useMemo } from "react";
import { motion } from "framer-motion";
import { XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid } from "recharts";
import { TrendingUp, TrendingDown, Download, Lightbulb, HeartPulse, Crown, Lock } from "lucide-react";
import { useFinance } from "@/context/FinanceContext";
import { useAuth } from "@/context/AuthContext";
import { useTranslation } from "@/context/TranslationContext";
import { generateReport, exportReportToHTML } from "@/lib/export";

const COLORS = ["#7c3aed", "#f59e0b", "#10b981", "#ef4444", "#3b82f6", "#ec4899", "#14b8a6", "#f97316"];

export function FinancialReport({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  const { financeState, totalVenituri, totalCheltuieli, cheltuieliPerCategorie } = useFinance();
  const { subscriptionTier } = useAuth();
  const isAdvanced = subscriptionTier === "premium_advanced";

  const report = useMemo(
    () => generateReport(financeState.tranzactii, totalVenituri, totalCheltuieli, cheltuieliPerCategorie),
    [financeState.tranzactii, totalVenituri, totalCheltuieli, cheltuieliPerCategorie]
  );

  const pieData = Object.entries(report.cheltuieliPeCategorii).map(([name, value]) => ({ name, value }));

  const scorColor = report.scorSanatateFinanciara >= 70 ? "text-green-400" :
    report.scorSanatateFinanciara >= 40 ? "text-yellow-400" : "text-red-400";

  const scorBg = report.scorSanatateFinanciara >= 70 ? "from-green-500/20 to-emerald-500/10 border-green-500/30" :
    report.scorSanatateFinanciara >= 40 ? "from-yellow-500/20 to-amber-500/10 border-yellow-500/30" :
    "from-red-500/20 to-rose-500/10 border-red-500/30";

  function handleDownload() {
    exportReportToHTML(report, "cost_raport_financiar.html");
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card-strong border border-subtle rounded-2xl p-6 max-w-2xl mx-auto max-h-[80vh] overflow-y-auto"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-main flex items-center gap-2">
          <Lightbulb size={20} className="text-yellow-400" />
          {t("Raport Financiar")}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={handleDownload}
            className="p-2 rounded-lg bg-purple-500/20 border border-purple-500/30 text-purple-400 hover:bg-purple-500/30 transition-colors"
            title={t("Exportă ca HTML")}
          >
            <Download size={16} />
          </button>
        </div>
      </div>

      <div>

      <div className={`bg-gradient-to-br ${scorBg} rounded-xl p-4 mb-6 text-center`}>
        <p className="text-dim text-xs mb-1">{t("Scor Sănătate Financiară")}</p>
        <p className={`text-4xl font-black ${scorColor}`}>{report.scorSanatateFinanciara}/100</p>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3 text-center">
          <TrendingUp size={16} className="text-green-400 mx-auto mb-1" />
          <p className="text-lg font-bold text-green-300">{report.totalVenituri} RON</p>
          <p className="text-xs text-subtle">{t("Venituri")}</p>
        </div>
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-center">
          <TrendingDown size={16} className="text-red-400 mx-auto mb-1" />
          <p className="text-lg font-bold text-red-300">{report.totalCheltuieli} RON</p>
          <p className="text-xs text-subtle">{t("Cheltuieli")}</p>
        </div>
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 text-center">
          <HeartPulse size={16} className={`mx-auto mb-1 ${report.balanta >= 0 ? "text-blue-400" : "text-red-400"}`} />
          <p className={`text-lg font-bold ${report.balanta >= 0 ? "text-blue-300" : "text-red-300"}`}>
            {report.balanta >= 0 ? "+" : ""}{report.balanta} RON
          </p>
          <p className="text-xs text-subtle">{t("Balanta")}</p>
        </div>
      </div>

      {!isAdvanced && (
        <div className="p-4 rounded-xl border border-purple-500/20 bg-purple-500/5 text-center mb-6">
          <Lock size={20} className="text-purple-400 mx-auto mb-2" />
          <p className="text-sm text-muted mb-1">{t("Analize financiare detaliate")}</p>
          <p className="text-xs text-dim mb-3">{t("Diagrame, cash flow și sfaturi personalizate sunt disponibile în Premium Advanced.")}</p>
          <a href="/premium" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-main text-xs font-bold transition-all hover:scale-105">
            <Crown size={12} />
            {t("Upgrade la Premium Advanced")}
          </a>
        </div>
      )}

      {isAdvanced && pieData.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-strong mb-3">{t("Cheltuieli pe Categorii")}</h3>
          <div className="flex items-center gap-4">
            <div className="w-40 h-40 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={35} outerRadius={65} dataKey="value">
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "#1a1035", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-1">
              {pieData.map((item, i) => (
                <div key={item.name} className="flex items-center gap-2 text-xs">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                  <span className="text-muted">{item.name}</span>
                  <span className="text-main font-medium ml-auto">{item.value} RON</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {isAdvanced && report.cashFlow.length > 1 && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-strong mb-3">{t("Cash Flow")}</h3>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={report.cashFlow}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="saptamana" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} />
                <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} />
                <Tooltip contentStyle={{ background: "#1a1035", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px" }} />
                <Line type="monotone" dataKey="valoare" stroke="#7c3aed" strokeWidth={2} dot={{ fill: "#7c3aed", r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {isAdvanced && (
        <div>
          <h3 className="text-sm font-semibold text-strong mb-3 flex items-center gap-1.5">
            <Lightbulb size={14} className="text-yellow-400" />
            {t("Sfaturi Personalizate")}
          </h3>
          <div className="space-y-2">
            {report.sfaturi.map((s, i) => (
              <div key={i} className="p-3 rounded-xl bg-card border border-subtle text-sm text-strong leading-relaxed">
                {s}
              </div>
            ))}
          </div>
        </div>
      )}

      </div>

      <button onClick={onClose} className="w-full mt-6 py-3 rounded-xl bg-card hover:bg-card-hover text-muted hover:text-main border border-subtle transition-all text-sm">
        {t("Închide")}
      </button>
    </motion.div>
  );
}
