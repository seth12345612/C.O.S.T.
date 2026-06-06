import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { OrbBackground } from "@/components/OrbBackground";
import { Layout } from "@/components/Layout";
import {
  Trophy,
  Medal,
  Star,
  User,
  UserPlus,
  Filter,
  Share2,
  Users,
  GraduationCap,
  Globe,
} from "lucide-react";
import type { LeaderboardEntry } from "@/types";
import { loadLeaderboardEntries, loadLocalScores, getBannedUsers } from "@/lib/leaderboard";
import ShareButton from "@/components/ShareButton";
import { useQuery } from "@tanstack/react-query";

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
  const sortUnit = sortKey === "economii" ? "RON" : sortKey === "xp" ? "XP" : "luni";

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
              Scorul tau
            </span>
          )}
        </div>
        <div className="text-xs text-subtle">
          {entry.months} luni . {entry.scenario}
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

type Category = "economii" | "xp" | "datorii";
type Filter = "global" | "prieteni" | "facultate";

const CATEGORIES: { key: Category; label: string; icon: typeof Star }[] = [
  { key: "economii", label: "Economii", icon: Star },
  { key: "xp", label: "XP", icon: Trophy },
  { key: "datorii", label: "Management datorii", icon: Users },
];

const FILTERS: { key: Filter; label: string; icon: typeof Globe }[] = [
  { key: "global", label: "Global", icon: Globe },
  { key: "prieteni", label: "Prieteni", icon: Users },
  { key: "facultate", label: "Facultatea mea", icon: GraduationCap },
];

export default function Leaderboard() {
  const [userScores, setUserScores] = useState<LeaderboardEntry[]>(() => loadLocalScores());
  const [category, setCategory] = useState<Category>("economii");
  const [filter, setFilter] = useState<Filter>("global");

  const { data: sortedAll = [], isLoading } = useQuery({
    queryKey: ["leaderboard"],
    queryFn: async () => {
      const [banned, loaded] = await Promise.all([getBannedUsers(), loadLeaderboardEntries()]);
      const filtered = loaded.filter((e) => !banned.includes(e.username));
      setUserScores(filtered);
      return filtered.sort((a, b) => b.score - a.score).slice(0, 10);
    },
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    const local = loadLocalScores();
    setUserScores(local);
  }, []);

  const sortFn = (a: LeaderboardEntry, b: LeaderboardEntry) => {
    if (category === "datorii") return b.months - a.months;
    return b.score - a.score;
  };

  const hasScores = sortedAll.length > 0;
  const sortedUser = [...userScores].sort(sortFn);

  const sortedAllByCategory = [...sortedAll].sort(sortFn);

  const top10Marked = sortedAllByCategory.map(entry => ({
    ...entry,
    isUserScore: userScores.some(u => u.id === entry.id)
  }));

  const mockNote = filter !== "global" ? "funcționalitate în curând" : null;

  if (isLoading) {
    return (
      <Layout>
        <OrbBackground />
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-pulse text-4xl mb-3">🏆</div>
            <h1 className="text-3xl font-black text-main mb-2">Clasament</h1>
          </div>
        </div>
      </Layout>
    );
  }

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
          <h1 className="text-3xl font-black text-main mb-2">Clasament</h1>
          <p className="text-dim text-sm">Top jucatori dupa economii finale.</p>
        </motion.div>

        <div className="flex flex-wrap gap-2 justify-center mb-4">
          {CATEGORIES.map((cat) => {
            const active = category === cat.key;
            const Icon = cat.icon;
            return (
              <button
                key={cat.key}
                onClick={() => setCategory(cat.key)}
                className={
                  "inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all border " +
                  (active
                    ? "bg-purple-500/15 border-purple-500/40 text-purple-300"
                    : "bg-card-soft4 border-subtle text-muted hover:text-main hover:border-strong")
                }
              >
                <Icon size={15} />
                {cat.label}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap gap-2 justify-center mb-6">
          {FILTERS.map((f) => {
            const active = filter === f.key;
            const Icon = f.icon;
            return (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={
                  "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border " +
                  (active
                    ? "bg-card-active border-medium text-main"
                    : "bg-card-soft4 border-subtle text-muted hover:text-main hover:border-strong")
                }
              >
                <Icon size={13} />
                {f.label}
              </button>
            );
          })}
        </div>

        {mockNote && (
          <p className="text-center text-xs text-faint mb-4 italic">~ {mockNote} ~</p>
        )}

        {!hasScores ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16 px-4"
          >
            <div className="w-20 h-20 mx-auto mb-5 rounded-3xl bg-gradient-to-br from-amber-500/10 to-yellow-500/5 border border-amber-500/20 flex items-center justify-center">
              <Trophy size={36} className="text-amber-400" />
            </div>
            <h2 className="text-xl font-bold text-main mb-2">Nimeni pe podium... încă!</h2>
            <p className="text-muted text-sm max-w-xs mx-auto leading-relaxed">
              Clasamentul se golește când nu mai sunt jucători activi. Joacă un scenariu și fii primul care apare!
            </p>
            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-faint">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              Tu poți fi nr. 1
            </div>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {userScores.length > 0 && (
              <div>
                <h2 className="text-sm font-bold text-purple-300 mb-3 flex items-center gap-2">
                  <Star size={14} className="text-purple-400" />
                  Scorurile tale
                </h2>
                <div className="space-y-2">
                  {sortedUser.slice(0, 10).map((s, i) => (
                    <ScoreRow key={s.id} entry={s} rank={i + 1} isUserScore={true} showRank={true} sortKey={category} />
                  ))}
                </div>
              </div>
            )}

            {userScores.length > 0 && <div className="border-t border-subtle my-4" />}

            <div>
              <h2 className="text-sm font-bold text-muted mb-3">
                {userScores.length > 0 ? "Top Global" : "Clasament"}
              </h2>
              <div className="space-y-2">
                {top10Marked.map((s, i) => (
                  <ScoreRow key={s.id} entry={s} rank={i + 1} isUserScore={s.isUserScore} showRank={true} sortKey={category} />
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 p-4 rounded-2xl border border-subtle bg-card text-center">
          <p className="text-xs text-subtle">
            Clasamentul se sincronizeaza online.
            {userScores.length > 0 && " Scorurile tale sunt evidentiate cu mov."}
          </p>
        </div>

        <div className="mt-4 flex justify-center">
          <ShareButton
            title="Clasament C.O.S.T."
            text={`Vezi clasamentul C.O.S.T.!\n${
              top10Marked.length > 0
                ? `Locul 1: ${top10Marked[0].username} – ${top10Marked[0].score.toLocaleString("ro-RO")} RON`
                : "Fii primul pe podium!"
            }`}
          />
        </div>
      </div>
    </Layout>
  );
}
