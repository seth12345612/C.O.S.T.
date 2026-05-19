import { useEffect, useState } from "react";
import { OrbBackground } from "@/components/OrbBackground";
import { Layout } from "@/components/Layout";
import { Trophy, Medal, Star, User } from "lucide-react";
import { loadLeaderboardEntries, type LeaderboardEntry } from "@/lib/leaderboard";

const MOCK_SCORES: LeaderboardEntry[] = [
  { id: "mock-1", username: "StudentCampion", score: 18540, months: 12, scenario: "Garsoniera", date: 0 },
  { id: "mock-2", username: "IonMihalache", score: 14200, months: 12, scenario: "Chirie", date: 0 },
  { id: "mock-3", username: "MariaPopescu", score: 12800, months: 12, scenario: "Navetist", date: 0 },
  { id: "mock-4", username: "AlexIT", score: 11500, months: 11, scenario: "Garsoniera", date: 0 },
  { id: "mock-5", username: "StudentEconom", score: 9800, months: 12, scenario: "Cămin", date: 0 },
  { id: "mock-6", username: "FinanceKid", score: 8400, months: 10, scenario: "Chirie", date: 0 },
  { id: "mock-7", username: "BudgetHero", score: 7200, months: 9, scenario: "Cămin", date: 0 },
  { id: "mock-8", username: "NavetistPro", score: 6100, months: 12, scenario: "Navetist", date: 0 },
];

const RANK_ICONS = [
  { icon: Trophy, color: "text-yellow-400" },
  { icon: Medal, color: "text-gray-300" },
  { icon: Medal, color: "text-amber-600" },
];

function formatDate(timestamp: number): string {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  return date.toLocaleDateString("ro-RO", { day: "2-digit", month: "2-digit", year: "numeric" });
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

  return (
    <div
      className={`flex items-center gap-3 p-3.5 rounded-2xl border transition-all ${
        isUserScore
          ? "border-purple-500/50 bg-purple-500/10"
          : isTop3
            ? "border-yellow-500/20 bg-yellow-500/5"
            : "border-white/8 bg-white/4"
      }`}
    >
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
          <span className={`font-bold text-sm ${isUserScore ? "text-purple-300" : "text-white"}`}>
            {entry.username}
          </span>
          {isUserScore && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-purple-500/30 text-purple-300 font-medium">
              ★ Scorul tău
            </span>
          )}
        </div>
        <div className="text-xs text-white/40">
          {entry.months} luni · {entry.scenario}
          {entry.date > 0 && (
            <span className="ml-2 text-white/30">· {formatDate(entry.date)}</span>
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
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loaded = loadLeaderboardEntries();
    setUserScores(loaded);
    setIsLoaded(true);
  }, []);

  const hasUserScores = userScores.length > 0;
  const sortedMock = [...MOCK_SCORES].sort((a, b) => b.score - a.score).slice(0, 10);
  const sortedUser = [...userScores].sort((a, b) => b.score - a.score);

  const allSorted = [...userScores, ...MOCK_SCORES].sort((a, b) => b.score - a.score).slice(0, 10);
  const top10WithUserMarked = allSorted.map(entry => ({
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
          <p className="text-white/50 text-sm">Top jucători după economii finale.</p>
        </div>

        {!hasUserScores && sortedMock.length === 0 ? (
          <div className="text-center py-12">
            <User size={48} className="text-white/20 mx-auto mb-4" />
            <p className="text-white/50 text-lg font-medium">Nu există scoruri încă</p>
            <p className="text-white/30 text-sm mt-2">Joacă un joc pentru a apărea în clasament!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {hasUserScores && (
              <div>
                <h2 className="text-sm font-bold text-purple-300 mb-3 flex items-center gap-2">
                  <Star size={14} className="text-purple-400" />
                  Scorurile tale
                </h2>
                <div className="space-y-2">
                  {sortedUser.slice(0, 10).map((s, i) => (
                    <ScoreRow
                      key={s.id}
                      entry={s}
                      rank={i + 1}
                      isUserScore={true}
                      showRank={true}
                    />
                  ))}
                </div>
              </div>
            )}

            {hasUserScores && <div className="border-t border-white/10 my-4" />}

            <div>
              {hasUserScores ? (
                <h2 className="text-sm font-bold text-white/60 mb-3">Top Global</h2>
              ) : (
                <h2 className="text-sm font-bold text-white/60 mb-3">Clasament</h2>
              )}
              <div className="space-y-2">
                {top10WithUserMarked.map((s, i) => (
                  <ScoreRow
                    key={s.id}
                    entry={s}
                    rank={i + 1}
                    isUserScore={s.isUserScore}
                    showRank={true}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 p-4 rounded-2xl border border-white/10 bg-white/5 text-center">
          <p className="text-xs text-white/40">
            Clasamentul se salvează local pe dispozitivul tău.
            {hasUserScores && " Scorurile tale sunt evidențiate cu mov."}
          </p>
        </div>
      </div>
    </Layout>
  );
}
