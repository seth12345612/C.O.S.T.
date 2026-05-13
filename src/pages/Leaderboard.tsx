import { useEffect, useState } from "react";
import { OrbBackground } from "@/components/OrbBackground";
import { Layout } from "@/components/Layout";
import { Trophy, Medal, Star } from "lucide-react";
import { loadLeaderboardEntries, type LeaderboardEntry } from "@/lib/leaderboard";

const MOCK_SCORES: LeaderboardEntry[] = [
  { id: "mock-1", username: "StudentCampion", score: 18540, months: 12, scenario: "garsoniera", date: 0 },
  { id: "mock-2", username: "IonMihalache", score: 14200, months: 12, scenario: "chirie", date: 0 },
  { id: "mock-3", username: "MariaPopescu", score: 12800, months: 12, scenario: "navetist", date: 0 },
  { id: "mock-4", username: "AlexIT", score: 11500, months: 11, scenario: "garsoniera", date: 0 },
  { id: "mock-5", username: "StudentEconom", score: 9800, months: 12, scenario: "camin", date: 0 },
  { id: "mock-6", username: "FinanceKid", score: 8400, months: 10, scenario: "chirie", date: 0 },
  { id: "mock-7", username: "BudgetHero", score: 7200, months: 9, scenario: "camin", date: 0 },
  { id: "mock-8", username: "NavetistPro", score: 6100, months: 12, scenario: "navetist", date: 0 },
];

const RANK_ICONS = [
  { icon: Trophy, color: "text-yellow-400" },
  { icon: Medal, color: "text-gray-300" },
  { icon: Medal, color: "text-amber-600" },
];

export default function Leaderboard() {
  const [savedScores, setSavedScores] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    setSavedScores(loadLeaderboardEntries());
  }, []);

  const allScores = [...savedScores, ...MOCK_SCORES]
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  return (
    <Layout>
      <OrbBackground />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">🏆</div>
          <h1 className="text-3xl font-black text-white mb-2">Clasament</h1>
          <p className="text-white/50 text-sm">Top jucători după economii finale.</p>
        </div>

        <div className="space-y-2">
          {allScores.map((s, i) => {
            const isTop3 = i < 3;
            const RankIcon = RANK_ICONS[i]?.icon;
            return (
              <div
                key={s.id}
                className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                  isTop3
                    ? "border-yellow-500/20 bg-yellow-500/5"
                    : "border-white/8 bg-white/4"
                }`}
              >
                <div className="w-8 shrink-0 text-center">
                  {RankIcon ? (
                    <RankIcon size={20} className={RANK_ICONS[i].color} />
                  ) : (
                    <span className="text-sm font-black text-white/40">#{i + 1}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-white text-sm">{s.username}</div>
                  <div className="text-xs text-white/40">{s.months} luni · {s.scenario}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-black text-white">{s.score.toLocaleString("ro-RO")} RON</div>
                  <div className="flex items-center gap-1 justify-end">
                    <Star size={10} className="text-purple-400" />
                    <span className="text-xs text-purple-400">{s.score * 2} XP</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 p-4 rounded-2xl border border-white/10 bg-white/5 text-center">
          <p className="text-xs text-white/40">Clasamentul se actualizează după fiecare joc finalizat. Conectarea la cont va fi disponibilă în curând.</p>
        </div>
      </div>
    </Layout>
  );
}
