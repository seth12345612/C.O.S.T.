import { createClient } from "@supabase/supabase-js";
import type { DBUser, DBLeaderboardEntry } from "@/types";

const sbUrl = import.meta.env.VITE_SUPABASE_URL || "https://twdvhkwrlwhadbmortqk.supabase.co";
const sbKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3ZHZoa3dybHdoYWRibW9ydHFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyMDM4OTAsImV4cCI6MjA5NDc3OTg5MH0.mvQkXjYR3YDChjbuGmmm006QOTjw6rQz6UdAKZYG-lQ";

const GLOBAL_KEY = "__cost_supabase";
export const supabase = (globalThis as any)[GLOBAL_KEY] || ((globalThis as any)[GLOBAL_KEY] = createClient(sbUrl, sbKey));

/** Sincronizeaza datele utilizatorului autentificat in baza de date Supabase. */
export async function syncUserToDB(authUser: { email: string; name: string; picture?: string }): Promise<DBUser | null> {
  const { data, error } = await supabase
    .from("users")
    .upsert({ email: authUser.email, name: authUser.name, picture: authUser.picture ?? null }, { onConflict: "email" })
    .select()
    .single();
  if (error) { console.error("syncUserToDB error:", error); return null; }
  return data;
}

/** Returneaza utilizatorul dupa adresa de email. */
export async function getUserByEmail(email: string): Promise<DBUser | null> {
  try {
    const { data, error } = await supabase.from("users").select("*").eq("email", email).single();
    if (error) throw error;
    return data;
  } catch { return null; }
}

/** Returneaza toti utilizatorii inregistrati, ordonati alfabetic. */
export async function getAllUsers(): Promise<DBUser[]> {
  try {
    const { data, error } = await supabase.from("users").select("*").order("name", { ascending: true });
    if (error) throw error;
    return data || [];
  } catch (e) { console.error("getAllUsers error:", e); return []; }
}

/** Returneaza toate intrarile din clasament, ordonate descrescator dupa scor. */
export async function getLeaderboardEntries(): Promise<DBLeaderboardEntry[]> {
  const { data, error } = await supabase.from("leaderboard").select("*").order("score", { ascending: false });
  if (error) throw error;
  return data || [];
}

/** Salveaza o intrare noua in clasament. */
export async function saveLeaderboardEntry(entry: { userId: string; username: string; score: number; months: number; scenario: string }): Promise<void> {
  const { error } = await supabase.from("leaderboard").insert({
    user_id: entry.userId || null,
    username: entry.username,
    score: entry.score,
    months: entry.months,
    scenario: entry.scenario
  });
  if (error) throw error;
}

/** Sterge o intrare din clasament dupa ID. */
export async function deleteLeaderboardEntry(id: string): Promise<void> {
  const { error } = await supabase.from("leaderboard").delete().eq("id", id);
  if (error) throw error;
}

/** Sterge toate intrarile din clasament. */
export async function clearLeaderboard(): Promise<void> {
  const { error } = await supabase.from("leaderboard").delete().not("id", "is", null);
  if (error) throw error;
}

/** Returneaza lista de username-uri ale utilizatorilor banati. */
export async function getBannedUsernames(): Promise<string[]> {
  try {
    const { data, error } = await supabase.from("users").select("name").eq("is_banned", true);
    if (error) throw error;
    return (data || []).map((u) => u.name);
  } catch (e) { console.error("getBannedUsernames error:", e); return []; }
}

/** Seteaza sau elimina statusul de ban pentru un utilizator. */
export async function setBanStatus(username: string, banned: boolean): Promise<void> {
  try {
    const { error } = await supabase.from("users").update({ is_banned: banned }).eq("name", username);
    if (error) throw error;
  } catch (e) { console.error("setBanStatus error:", e); }
}

/** Calculeaza statistici per utilizator pe baza intrarilor din clasament (total intrari, cel mai bun scor, scor total). */
export async function getLeaderboardStats(): Promise<{ username: string; totalEntries: number; bestScore: number; totalScore: number; isBanned: boolean }[]> {
  const [entries, banned] = await Promise.all([getLeaderboardEntries(), getBannedUsernames()]);
  const map = new Map<string, { totalEntries: number; bestScore: number; totalScore: number; isBanned: boolean }>();
  for (const e of entries) {
    const existing = map.get(e.username);
    if (existing) {
      existing.totalEntries++;
      existing.totalScore += e.score;
      if (e.score > existing.bestScore) existing.bestScore = e.score;
    } else {
      map.set(e.username, { totalEntries: 1, bestScore: e.score, totalScore: e.score, isBanned: banned.includes(e.username) });
    }
  }
  return Array.from(map.entries()).map(([username, stats]) => ({ username, ...stats })).sort((a, b) => b.bestScore - a.bestScore);
}

export type { DBUser, DBLeaderboardEntry } from "@/types";
