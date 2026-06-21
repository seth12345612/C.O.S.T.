import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { OrbBackground } from "@/components/OrbBackground";
import { Layout } from "@/components/Layout";
import {
  Trophy,
  Medal,
  Star,
} from "lucide-react";
import type { LeaderboardEntry } from "@/types";
import { loadLocalScores } from "@/lib/leaderboard";
import { useTranslation } from "@/context/TranslationContext";

const RANK_ICONS = [
  { icon: Trophy, color: "text-yellow-400" },
  { icon: Medal, color: "text-gray-300" },
  { icon: Medal, color: "text-amber-600" },
];

function formatDate(timestamp: number): string {
  if (!timestamp) return "";
  return new Date(timestamp).toLocaleDateString("ro-RO", { day: "2-digit", month: "2-digit", year: "numeric" });
}

interface ScoreRowProps {
  entry: LeaderboardEntry;
  rank: number;
  isUserScore: boolean;
  showRank?: boolean;
  sortKey: "economii" | "xp" | "datorii";
}

function ScoreRow({ entry, rank, isUserScore, showRank = true, sortKey }: ScoreRowProps) {
  const isTop3 = rank <= 3;
  const RankIcon = RANK_ICONS[rank - 1]?.icon;

  const rowClass = isUserScore
    ? "border-purple-500/50 bg-purple-500/10"
    : isTop3
      ? "border-yellow-500/20 bg-yellow-500/5"
      : "border-subtle8 bg-card-soft4";

  const sortValue = sortKey === "datorii" ? entry.months : sortKey === "xp" ? entry.score * 2 : entry.score;
  const sortUnit = sortKey === "economii" ? "RON" : sortKey === "xp" ? "XP" : t("luni");

  return (
    <div className={"flex items-center gap-3 p-3.5 rounded-2xl border transition-all " + rowClass}>
      {showRank && (
        <div className="w-7 shrink-0 text-center">
          {RankIcon ? (
            <RankIcon size={18} className={RANK_ICONS[rank - 1].color} />
          ) : (
            <span className="text-sm font-black text-subtle">#{rank}</span>
          )}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={"font-bold text-sm " + (isUserScore ? "text-purple-300" : "text-main")}>
            {entry.username}
          </span>
          {isUserScore && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-purple-500/30 text-purple-300 font-medium">
              {t("Scorul tau")}
            </span>
          )}
        </div>
        <div className="text-xs text-subtle">
          {entry.months} {t("luni")} . {entry.scenario}
          {entry.date > 0 && (
            <span className="ml-2 text-faint">. {formatDate(entry.date)}</span>
          )}
        </div>
      </div>
      <div className="text-right shrink-0">
        <div className="font-black text-main text-sm">{sortValue.toLocaleString("ro-RO")} {sortUnit}</div>
        {sortKey !== "xp" && (
          <div className="flex items-center gap-1 justify-end">
            <Star size={10} className="text-purple-400" />
            <span className="text-xs text-purple-400">{entry.score * 2} XP</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Leaderboard() {
  const { t } = useTranslation();
  const [userScores, setUserScores] = useState<LeaderboardEntry[]>(() => loadLocalScores());

  useEffect(() => {
    const local = loadLocalScores();
    setUserScores(local);
  }, []);

  const sortFn = (a: LeaderboardEntry, b: LeaderboardEntry) => b.score - a.score;
  const sortedUser = [...userScores].sort(sortFn);
  const hasScores = userScores.length > 0;

  return (
    <Layout>
      <OrbBackground />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center mb-8"
        >
          <div className="text-4xl mb-3">🏆</div>
          <h1 className="text-3xl font-black text-main mb-2">{t("Clasament personal")}</h1>
          <p className="text-dim text-sm">{t("Istoricul scenariilor tale finalizate.")}</p>
        </motion.div>

        {!hasScores ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16 px-4"
          >
            <div className="w-20 h-20 mx-auto mb-5 rounded-3xl bg-gradient-to-br from-amber-500/10 to-yellow-500/5 border border-amber-500/20 flex items-center justify-center">
              <Trophy size={36} className="text-amber-400" />
            </div>
            <h2 className="text-xl font-bold text-main mb-2">{t("Niciun joc finalizat încă")}</h2>
            <p className="text-muted text-sm max-w-xs mx-auto leading-relaxed">
              {t("Joacă și termină un scenariu ca să-ți vezi scorurile aici!")}
            </p>
            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-faint">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              {t("Fii primul pe listă")}
            </div>
          </motion.div>
        ) : (
          <div className="space-y-2">
            {sortedUser.slice(0, 10).map((s, i) => (
              <ScoreRow key={s.id} entry={s} rank={i + 1} isUserScore={true} showRank={true} sortKey="economii" />
            ))}
          </div>
        )}

        <div className="mt-6 p-4 rounded-2xl border border-subtle bg-card text-center">
          <p className="text-xs text-subtle">
            {t("Scorurile tale sunt salvate local pe acest dispozitiv.")}
          </p>
        </div>
      </div>
    </Layout>
  );
}
