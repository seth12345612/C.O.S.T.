import { useEffect, useState } from "react";
import { OrbBackground } from "@/components/OrbBackground";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/context/AuthContext";
import {
  loadLeaderboardEntries, deleteLeaderboardEntry,
  getBannedUsers, banUser, unbanUser,
  type LeaderboardEntry,
} from "@/lib/leaderboard";
import { Trash2, Shield, ShieldOff, Search, AlertTriangle, Users, Trophy, User } from "lucide-react";

interface UserStats {
  username: string;
  totalEntries: number;
  bestScore: number;
  totalScore: number;
  isBanned: boolean;
}

export default function Admin() {
  const { isAdmin, user } = useAuth();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [banned, setBanned] = useState<string[]>([]);
  const [banInput, setBanInput] = useState("");
  const [tab, setTab] = useState<"users" | "leaderboard" | "bans">("users");

  useEffect(() => {
    if (!isAdmin) return;
    setEntries(loadLeaderboardEntries());
    setBanned(getBannedUsers());
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <Layout>
        <OrbBackground />
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <Shield size={48} className="text-red-500/40 mx-auto mb-4" />
          <h1 className="text-2xl font-black text-white mb-2">Acces interzis</h1>
          <p className="text-white/50">Nu ai permisiuni de administrator.</p>
        </div>
      </Layout>
    );
  }

  function handleDelete(id: string) {
    deleteLeaderboardEntry(id);
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }

  function handleBan(name: string) {
    if (!name.trim()) return;
    banUser(name.trim());
    setBanned(getBannedUsers());
    setBanInput("");
  }

  function handleUnban(name: string) {
    unbanUser(name);
    setBanned(getBannedUsers());
  }

  function handleBanFromEntry(username: string) {
    banUser(username);
    setBanned(getBannedUsers());
  }

  const sorted = [...entries].sort((a, b) => b.score - a.score);

  const userMap = new Map<string, UserStats>();
  for (const e of entries) {
    const existing = userMap.get(e.username);
    if (existing) {
      existing.totalEntries++;
      existing.totalScore += e.score;
      if (e.score > existing.bestScore) existing.bestScore = e.score;
    } else {
      userMap.set(e.username, {
        username: e.username,
        totalEntries: 1,
        bestScore: e.score,
        totalScore: e.score,
        isBanned: banned.includes(e.username),
      });
    }
  }
  const usersList = Array.from(userMap.values()).sort((a, b) => b.bestScore - a.bestScore);

  return (
    <Layout>
      <OrbBackground />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Shield size={24} className="text-red-400" />
          <h1 className="text-2xl font-black text-white">Panou Admin</h1>
        </div>

        <div className="flex gap-2 mb-6 flex-wrap">
          <button
            onClick={() => setTab("users")}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              tab === "users"
                ? "bg-purple-600 text-white"
                : "bg-white/5 text-white/60 hover:bg-white/10"
            }`}
          >
            <Users size={14} className="inline mr-1" />
            Utilizatori ({usersList.length})
          </button>
          <button
            onClick={() => setTab("leaderboard")}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              tab === "leaderboard"
                ? "bg-purple-600 text-white"
                : "bg-white/5 text-white/60 hover:bg-white/10"
            }`}
          >
            <Trophy size={14} className="inline mr-1" />
            Leaderboard ({sorted.length})
          </button>
          <button
            onClick={() => setTab("bans")}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              tab === "bans"
                ? "bg-red-600 text-white"
                : "bg-white/5 text-white/60 hover:bg-white/10"
            }`}
          >
            <ShieldOff size={14} className="inline mr-1" />
            Banați ({banned.length})
          </button>
        </div>

        {tab === "users" && (
          <div className="space-y-2">
            {user && (
              <div className="p-4 rounded-2xl border border-purple-500/30 bg-purple-500/10 mb-4">
                <div className="flex items-center gap-3">
                  {user.picture ? (
                    <img src={user.picture} alt="" className="w-10 h-10 rounded-full" />
                  ) : (
                    <User size={24} className="text-purple-400" />
                  )}
                  <div>
                    <div className="font-bold text-white text-sm">{user.name}</div>
                    <div className="text-xs text-white/50">{user.email}</div>
                  </div>
                  <span className="ml-auto text-[10px] px-2 py-1 rounded-full bg-purple-500/30 text-purple-300 font-medium">TU (admin)</span>
                </div>
              </div>
            )}

            {usersList.length === 0 ? (
              <div className="text-center py-12 text-white/40">
                <Users size={36} className="mx-auto mb-3 opacity-40" />
                <p>Niciun utilizator înregistrat.</p>
              </div>
            ) : (
              usersList.map((u) => {
                const isBanned = banned.includes(u.username);
                return (
                  <div
                    key={u.username}
                    className={`flex items-center gap-3 p-3 rounded-2xl border ${
                      isBanned ? "border-red-500/30 bg-red-500/10" : "border-white/10 bg-white/5"
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`font-bold text-sm ${isBanned ? "text-red-400 line-through" : "text-white"}`}>
                          {u.username}
                        </span>
                        {isBanned && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-500/30 text-red-300 font-medium">BANAT</span>
                        )}
                        {u.username === user?.name && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-purple-500/30 text-purple-300 font-medium">ADMIN</span>
                        )}
                      </div>
                      <div className="text-xs text-white/40">
                        {u.totalEntries} intrări · Cel mai bun: {u.bestScore.toLocaleString("ro-RO")} RON · Total: {u.totalScore.toLocaleString("ro-RO")} RON
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {!isBanned ? (
                        <button
                          onClick={() => handleBan(u.username)}
                          className="p-2 rounded-lg bg-orange-500/20 border border-orange-500/30 text-orange-400 hover:bg-orange-500/30 transition-colors"
                          title="Ban"
                        >
                          <Shield size={14} />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUnban(u.username)}
                          className="p-2 rounded-lg bg-green-500/20 border border-green-500/30 text-green-400 hover:bg-green-500/30 transition-colors"
                          title="Unban"
                        >
                          <ShieldOff size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {tab === "leaderboard" && (
          <div className="space-y-2">
            {sorted.length === 0 ? (
              <div className="text-center py-12 text-white/40">
                <Search size={36} className="mx-auto mb-3 opacity-40" />
                <p>Nicio intrare în clasament.</p>
              </div>
            ) : (
              sorted.map((e) => {
                const isBanned = banned.includes(e.username);
                return (
                  <div
                    key={e.id}
                    className={`flex items-center gap-3 p-3 rounded-2xl border ${
                      isBanned ? "border-red-500/30 bg-red-500/10" : "border-white/10 bg-white/5"
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`font-bold text-sm ${isBanned ? "text-red-400 line-through" : "text-white"}`}>
                          {e.username}
                        </span>
                        {isBanned && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-500/30 text-red-300 font-medium">BANAT</span>
                        )}
                      </div>
                      <div className="text-xs text-white/40">
                        {e.score.toLocaleString("ro-RO")} RON · {e.months} luni · {e.scenario}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {!isBanned ? (
                        <button
                          onClick={() => handleBanFromEntry(e.username)}
                          className="p-2 rounded-lg bg-orange-500/20 border border-orange-500/30 text-orange-400 hover:bg-orange-500/30 transition-colors"
                          title="Ban"
                        >
                          <Shield size={14} />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUnban(e.username)}
                          className="p-2 rounded-lg bg-green-500/20 border border-green-500/30 text-green-400 hover:bg-green-500/30 transition-colors"
                          title="Unban"
                        >
                          <ShieldOff size={14} />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(e.id)}
                        className="p-2 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 transition-colors"
                        title="Șterge"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {tab === "bans" && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <input
                value={banInput}
                onChange={(e) => setBanInput(e.target.value)}
                placeholder="Nume utilizator de banat..."
                className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-red-500/50"
                onKeyDown={(e) => e.key === "Enter" && handleBan(banInput)}
              />
              <button
                onClick={() => handleBan(banInput)}
                className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-sm transition-colors"
              >
                <Shield size={14} className="inline mr-1" />
                Ban
              </button>
            </div>

            {banned.length === 0 ? (
              <div className="text-center py-12 text-white/40">
                <ShieldOff size={36} className="mx-auto mb-3 opacity-40" />
                <p>Niciun jucător banat.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {banned.map((name) => (
                  <div
                    key={name}
                    className="flex items-center gap-3 p-3 rounded-2xl border border-red-500/20 bg-red-500/5"
                  >
                    <AlertTriangle size={16} className="text-red-400 shrink-0" />
                    <span className="flex-1 text-sm font-medium text-white">{name}</span>
                    <button
                      onClick={() => handleUnban(name)}
                      className="px-3 py-1.5 rounded-lg bg-green-500/20 border border-green-500/30 text-green-400 hover:bg-green-500/30 text-xs font-semibold transition-colors"
                    >
                      Unban
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}