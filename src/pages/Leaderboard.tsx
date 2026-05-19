import { useEffect, useState } from "react";
import { OrbBackground } from "@/components/OrbBackground";
import { Layout } from "@/components/Layout";
import { Trophy, Medal, Star, User } from "lucide-react";
import { loadLeaderboardEntries, loadLocalScores, getBannedUsers, type LeaderboardEntry } from "@/lib/leaderboard";

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
}

function ScoreRow({ entry, rank, isUserScore, showRank = true }: ScoreRowProps) {
  const isTop3 = rank <= 3;
  const RankIcon = RANK_ICONS[rank - 1]?.icon;

  const rowClass = isUserScore
    ? "border-purple-500/50 bg-purple-500/10"
    : isTop3
      ? "border-yellow-500/20 bg-yellow-500/5"
      : "border-white/8 bg-white/4";

  return (
    <div className={"flex items-center gap-3 p-3.5 rounded-2xl border transition-all " + rowClass}>
      {showRank && (
        <div className="w-7 shrink-0 text-center">
          {RankIcon ? (
            <RankIcon size={18} className={RANK_ICONS[rank - 1].color} />
          ) : (
            <span className="text-sm font-black text-white/40">#{rank}</span>
          )}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={"font-bold text-sm " + (isUserScore ? "text-purple-300" : "text-white")}>
            {entry.username}
          </span>
          {isUserScore && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-purple-500/30 text-purple-300 font-medium">
              Scorul tau
            </span>
          )}
        </div>
        <div className="text-xs text-white/40">
          {entry.months} luni . {entry.scenario}
          {entry.date > 0 && (
            <span className="ml-2 text-white/30">. {formatDate(entry.date)}</span>
          )}
        </div>
      </div>
      <div className="text-right shrink-0">
        <div className="font-black text-white text-sm">{entry.score.toLocaleString("ro-RO")} RON</div>
        <div className="flex items-center gap-1 justify-end">
          <Star size={10} className="text-purple-400" />
          <span className="text-xs text-purple-400">{entry.score * 2} XP</span>
        </div>
      </div>
    </div>
  );
}

export default function Leaderboard() {
  const [userScores, setUserScores] = useState<LeaderboardEntry[]>([]);
  const [sortedAll, setSortedAll] = useState<LeaderboardEntry[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const local = loadLocalScores();
    setUserScores(local);
    setSortedAll(local.sort((a, b) => b.score - a.score).slice(0, 10));
    setIsLoaded(true);

    let cancelled = false;
    (async () => {
      try {
        const [banned, loaded] = await Promise.all([getBannedUsers(), loadLeaderboardEntries()]);
        if (!cancelled) {
          const filtered = loaded.filter((e) => !banned.includes(e.username));
          setUserScores(filtered);
          setSortedAll(filtered.sort((a, b) => b.score - a.score).slice(0, 10));
        }
      } catch (e) {
        console.warn("Leaderboard sync failed:", e);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const hasScores = sortedAll.length > 0;
  const sortedUser = [...userScores].sort((a, b) => b.score - a.score);

  const top10Marked = sortedAll.map(entry => ({
    ...entry,
    isUserScore: userScores.some(u => u.id === entry.id)
  }));

  if (!isLoaded) {
    return (
      <Layout>
        <OrbBackground />
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-pulse text-4xl mb-3">🏆</div>
            <h1 className="text-3xl font-black text-white mb-2">Clasament</h1>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <OrbBackground />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">🏆</div>
          <h1 className="text-3xl font-black text-white mb-2">Clasament</h1>
          <p className="text-white/50 text-sm">Top jucatori dupa economii finale.</p>
        </div>

        {!hasScores ? (
          <div className="text-center py-12">
            <User size={48} className="text-white/20 mx-auto mb-4" />
            <p className="text-white/50 text-lg font-medium">Nu exista scoruri inca</p>
            <p className="text-white/30 text-sm mt-2">Joaca un joc pentru a aparea in clasament!</p>
          </div>
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
                    <ScoreRow key={s.id} entry={s} rank={i + 1} isUserScore={true} showRank={true} />
                  ))}
                </div>
              </div>
            )}

            {userScores.length > 0 && <div className="border-t border-white/10 my-4" />}

            <div>
              <h2 className="text-sm font-bold text-white/60 mb-3">
                {userScores.length > 0 ? "Top Global" : "Clasament"}
              </h2>
              <div className="space-y-2">
                {top10Marked.map((s, i) => (
                  <ScoreRow key={s.id} entry={s} rank={i + 1} isUserScore={s.isUserScore} showRank={true} />
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 p-4 rounded-2xl border border-white/10 bg-white/5 text-center">
          <p className="text-xs text-white/40">
            Clasamentul se sincronizeaza online.
            {userScores.length > 0 && " Scorurile tale sunt evidentiate cu mov."}
          </p>
        </div>
      </div>
    </Layout>
  );
}
