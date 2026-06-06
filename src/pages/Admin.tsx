import { useEffect, useState } from "react";
import { OrbBackground } from "@/components/OrbBackground";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/context/AuthContext";
import type { DBUser } from "@/types";
import { getAllUsers as getDBUsers, getBannedUsernames, setBanStatus } from "@/lib/supabase";
import { Shield, ShieldOff, Users, User, Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface UserRow {
  dbUser?: DBUser;
  username: string;
  email: string;
  isBanned: boolean;
}

export default function Admin() {
  const { isAdmin, user, dbUser: adminDbUser } = useAuth();

  const { data: users, isLoading: loading, refetch } = useQuery({
    queryKey: ["adminUsers"],
    queryFn: async () => {
      const [dbUsers, bannedList] = await Promise.all([
        getDBUsers(),
        getBannedUsernames(),
      ]);
      const userRows: UserRow[] = dbUsers.map((db) => ({
        dbUser: db,
        username: db.name,
        email: db.email,
        isBanned: db.is_banned,
      }));
      return userRows;
    },
    enabled: !!isAdmin,
  });

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

  async function handleBan(name: string) {
    if (!name.trim()) return;
    try {
      await setBanStatus(name.trim(), true);
      refetch();
    } catch (e) { console.error(e); }
  }

  async function handleUnban(name: string) {
    try {
      await setBanStatus(name, false);
      refetch();
    } catch (e) { console.error(e); }
  }

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

  return (
    <Layout>
      <OrbBackground />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Shield size={24} className="text-red-400" />
          <h1 className="text-2xl font-black text-main">Panou Admin</h1>
        </div>

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

          {(!users || users.length === 0) ? (
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
      </div>
    </Layout>
  );
}
