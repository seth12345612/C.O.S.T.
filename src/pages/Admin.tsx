import { useEffect, useState } from "react";
import { OrbBackground } from "@/components/OrbBackground";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/context/AuthContext";
import type { LeaderboardEntry, DBUser } from "@/types";
import {
  loadLeaderboardEntries, deleteLeaderboardEntry, clearLeaderboard,
  getBannedUsers, banUser, unbanUser,
} from "@/lib/leaderboard";
import { getAllUsers as getDBUsers, getLeaderboardStats } from "@/lib/supabase";
import { Trash2, Shield, ShieldOff, Search, AlertTriangle, Users, Trophy, User } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface UserRow {
  dbUser?: DBUser;
  username: string;
  email: string;
  totalEntries: number;
  bestScore: number;
  totalScore: number;
  isBanned: boolean;
}

export default function Admin() {
  const { isAdmin, user, dbUser: adminDbUser } = useAuth();
  const [banInput, setBanInput] = useState("");
  const [tab, setTab] = useState<"users" | "leaderboard" | "bans">("users");

  const { data, isLoading: loading, refetch } = useQuery({
    queryKey: ["adminData"],
    queryFn: async () => {
      const [loadedEntries, dbUsers, stats, bannedList] = await Promise.all([
        loadLeaderboardEntries(),
        getDBUsers(),
        getLeaderboardStats(),
        getBannedUsers(),
      ]);
      const userRows: UserRow[] = dbUsers.map((db) => {
        const stat = stats.find((s) => s.username === db.name);
        return {
          dbUser: db,
          username: db.name,
          email: db.email,
          totalEntries: stat?.totalEntries ?? 0,
          bestScore: stat?.bestScore ?? 0,
          totalScore: stat?.totalScore ?? 0,
          isBanned: db.is_banned,
        };
      });
      userRows.sort((a, b) => b.bestScore - a.bestScore);
      return { entries: loadedEntries, users: userRows, banned: bannedList };
    },
    enabled: !!isAdmin,
  });

  const entries = data?.entries ?? [];
  const users = data?.users ?? [];
  const banned = data?.banned ?? [];

  if (!isAdmin) {
    return (
      <Layout>
        <OrbBackground />
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <Shield size={48} className="text-red-500/40 mx-auto mb-4" />
          <h1 className="text-2xl font-black text-main mb-2">Acces interzis</h1>
          <p className="text-dim">Nu ai permisiuni de administrator.</p>
        </div>
      </Layout>
    );
  }

  async function handleDelete(id: string) {
    await deleteLeaderboardEntry(id);
    refetch();
  }

  async function handleBan(name: string) {
    if (!name.trim()) return;
    await banUser(name.trim());
    setBanInput("");
    refetch();
  }

  async function handleUnban(name: string) {
    await unbanUser(name);
    refetch();
  }

  const sorted = [...entries].sort((a, b) => b.score - a.score);

  if (loading) {
    return (
      <Layout>
        <OrbBackground />
        <div className="max-w-3xl mx-auto px-4 py-20 text-center">
          <p className="text-dim">Se incarca...</p>
        </div>
      </Layout>
    );
  }

  const tabClass = (t: string) =>
    "px-4 py-2 rounded-xl text-sm font-semibold transition-all " +
    (tab === t ? "bg-purple-600 text-main" : "bg-card text-muted hover:bg-card-hover");
  const banTabClass = (t: string) =>
    "px-4 py-2 rounded-xl text-sm font-semibold transition-all " +
    (tab === t ? "bg-red-600 text-main" : "bg-card text-muted hover:bg-card-hover");

  return (
    <Layout>
      <OrbBackground />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Shield size={24} className="text-red-400" />
          <h1 className="text-2xl font-black text-main">Panou Admin</h1>
        </div>

        <div className="flex gap-2 mb-6 flex-wrap">
          <button onClick={() => setTab("users")} className={tabClass("users")}>
            <Users size={14} className="inline mr-1" />
            Utilizatori ({users.length})
          </button>
          <button onClick={() => setTab("leaderboard")} className={tabClass("leaderboard")}>
            <Trophy size={14} className="inline mr-1" />
            Leaderboard ({sorted.length})
          </button>
          <button onClick={() => setTab("bans")} className={banTabClass("bans")}>
            <ShieldOff size={14} className="inline mr-1" />
            Banati ({banned.length})
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
                    <div className="font-bold text-main text-sm">{user.name}</div>
                    <div className="text-xs text-dim">{user.email}</div>
                  </div>
                  <span className="ml-auto text-[10px] px-2 py-1 rounded-full bg-purple-500/30 text-purple-300 font-medium">TU (admin)</span>
                </div>
              </div>
            )}

            {users.length === 0 ? (
              <div className="text-center py-12 text-subtle">
                <Users size={36} className="mx-auto mb-3 opacity-40" />
                <p>Niciun utilizator inregistrat.</p>
              </div>
            ) : (
              users.map((u) => (
                <div
                  key={u.email}
                  className={"flex items-center gap-3 p-3 rounded-2xl border " + (u.isBanned ? "border-red-500/30 bg-red-500/10" : "border-subtle bg-card")}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={"font-bold text-sm " + (u.isBanned ? "text-red-400 line-through" : "text-main")}>
                        {u.username}
                      </span>
                      <span className="text-xs text-subtle">{u.email}</span>
                      {u.isBanned && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-500/30 text-red-300 font-medium">BANAT</span>
                      )}
                      {u.email === adminDbUser?.email && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-purple-500/30 text-purple-300 font-medium">ADMIN</span>
                      )}
                    </div>
                    <div className="text-xs text-subtle">
                      {u.totalEntries} intrari . Cel mai bun: {u.bestScore.toLocaleString("ro-RO")} RON . Total: {u.totalScore.toLocaleString("ro-RO")} RON
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {!u.isBanned ? (
                      <button onClick={() => handleBan(u.username)}
                        className="p-2 rounded-lg bg-orange-500/20 border border-orange-500/30 text-orange-400 hover:bg-orange-500/30 transition-colors"
                        title="Ban">
                        <Shield size={14} />
                      </button>
                    ) : (
                      <button onClick={() => handleUnban(u.username)}
                        className="p-2 rounded-lg bg-green-500/20 border border-green-500/30 text-green-400 hover:bg-green-500/30 transition-colors"
                        title="Unban">
                        <ShieldOff size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {tab === "leaderboard" && (
          <div className="space-y-2">
            <div className="flex justify-end">
              <button onClick={async () => { if (confirm("Stergi TOATE intrarile din clasament?")) { await clearLeaderboard(); refetch(); } }}
                className="px-3 py-1.5 rounded-lg bg-red-600/20 border border-red-500/30 text-red-400 hover:bg-red-600/30 text-xs font-semibold transition-colors">
                <Trash2 size={12} className="inline mr-1" /> Sterge tot clasamentul
              </button>
            </div>
            {sorted.length === 0 ? (
              <div className="text-center py-12 text-subtle">
                <Search size={36} className="mx-auto mb-3 opacity-40" />
                <p>Nicio intrare in clasament.</p>
              </div>
            ) : (
              sorted.map((e) => {
                const ib = banned.includes(e.username);
                return (
                  <div key={e.id}
                    className={"flex items-center gap-3 p-3 rounded-2xl border " + (ib ? "border-red-500/30 bg-red-500/10" : "border-subtle bg-card")}>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={"font-bold text-sm " + (ib ? "text-red-400 line-through" : "text-main")}>
                          {e.username}
                        </span>
                        {ib && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-500/30 text-red-300 font-medium">BANAT</span>}
                      </div>
                      <div className="text-xs text-subtle">
                        {e.score.toLocaleString("ro-RO")} RON . {e.months} luni . {e.scenario}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {!ib ? (
                        <button onClick={() => handleBan(e.username)}
                          className="p-2 rounded-lg bg-orange-500/20 border border-orange-500/30 text-orange-400 hover:bg-orange-500/30 transition-colors"
                          title="Ban">
                          <Shield size={14} />
                        </button>
                      ) : (
                        <button onClick={() => handleUnban(e.username)}
                          className="p-2 rounded-lg bg-green-500/20 border border-green-500/30 text-green-400 hover:bg-green-500/30 transition-colors"
                          title="Unban">
                          <ShieldOff size={14} />
                        </button>
                      )}
                      <button onClick={() => handleDelete(e.id)}
                        className="p-2 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 transition-colors"
                        title="Sterge">
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
              <input value={banInput} onChange={(e) => setBanInput(e.target.value)}
                placeholder="Nume utilizator de banat..."
                className="flex-1 px-4 py-2.5 rounded-xl bg-card border border-subtle text-main text-sm placeholder:text-faint focus:outline-none focus:border-red-500/50"
                onKeyDown={(e) => e.key === "Enter" && handleBan(banInput)} />
              <button onClick={() => handleBan(banInput)}
                className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-main font-semibold text-sm transition-colors">
                <Shield size={14} className="inline mr-1" /> Ban
              </button>
            </div>

            {banned.length === 0 ? (
              <div className="text-center py-12 text-subtle">
                <ShieldOff size={36} className="mx-auto mb-3 opacity-40" />
                <p>Niciun jucator banat.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {banned.map((name) => (
                  <div key={name}
                    className="flex items-center gap-3 p-3 rounded-2xl border border-red-500/20 bg-red-500/5">
                    <AlertTriangle size={16} className="text-red-400 shrink-0" />
                    <span className="flex-1 text-sm font-medium text-main">{name}</span>
                    <button onClick={() => handleUnban(name)}
                      className="px-3 py-1.5 rounded-lg bg-green-500/20 border border-green-500/30 text-green-400 hover:bg-green-500/30 text-xs font-semibold transition-colors">
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
