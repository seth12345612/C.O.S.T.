import { createClient } from "@supabase/supabase-js";
import type { DBUser, DBLeaderboardEntry } from "@/types";

const sbUrl = import.meta.env.VITE_SUPABASE_URL || "https://twdvhkwrlwhadbmortqk.supabase.co";
const sbKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3ZHZoa3dybHdoYWRibW9ydHFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyMDM4OTAsImV4cCI6MjA5NDc3OTg5MH0.mvQkXjYR3YDChjbuGmmm006QOTjw6rQz6UdAKZYG-lQ";

// Supabase client for auth only
const GLOBAL_KEY = "__cost_supabase";
export const supabase = (globalThis as any)[GLOBAL_KEY] || ((globalThis as any)[GLOBAL_KEY] = createClient(sbUrl, sbKey));

// Direct REST API for DB operations (faster, no client overhead)
const API = `${sbUrl}/rest/v1`;
const HEADERS = { apikey: sbKey, Authorization: `Bearer ${sbKey}`, "Content-Type": "application/json" };

async function api(path: string, init?: RequestInit) {
  const res = await fetch(`${API}${path}`, { ...init, headers: { ...HEADERS, ...init?.headers } });
  if (!res.ok) { const t = await res.text(); throw new Error(`HTTP ${res.status}: ${t}`); }
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

export async function syncUserToDB(authUser: { email: string; name: string; picture?: string }): Promise<DBUser | null> {
  const { data, error } = await supabase
    .from("users")
    .upsert({ email: authUser.email, name: authUser.name, picture: authUser.picture ?? null }, { onConflict: "email" })
    .select()
    .single();
  if (error) { console.error("syncUserToDB error:", error); return null; }
  return data;
}

export async function getUserByEmail(email: string): Promise<DBUser | null> {
  try { return (await api(`/users?email=eq.${encodeURIComponent(email)}&select=*`))[0] ?? null; }
  catch { return null; }
}

export async function getAllUsers(): Promise<DBUser[]> {
  try { return await api("/users?select=*&order=name.asc"); }
  catch (e) { console.error("getAllUsers error:", e); return []; }
}

export async function getLeaderboardEntries(): Promise<DBLeaderboardEntry[]> {
  return api("/leaderboard?select=*&order=score.desc");
}

export async function saveLeaderboardEntry(entry: { userId: string; username: string; score: number; months: number; scenario: string }): Promise<void> {
  await api("/leaderboard", {
    method: "POST",
    body: JSON.stringify({ user_id: entry.userId, username: entry.username, score: entry.score, months: entry.months, scenario: entry.scenario }),
  });
}

export async function deleteLeaderboardEntry(id: string): Promise<void> {
  await api(`/leaderboard?id=eq.${id}`, { method: "DELETE" });
}

export async function clearLeaderboard(): Promise<void> {
  await api("/leaderboard?id=gte.00000000-0000-0000-0000-000000000000", { method: "DELETE" });
}

export async function getBannedUsernames(): Promise<string[]> {
  try {
    const data: DBUser[] = await api("/users?select=name&is_banned=eq.true");
    return data.map((u) => u.name);
  } catch (e) { console.error("getBannedUsernames error:", e); return []; }
}

export async function setBanStatus(username: string, banned: boolean): Promise<void> {
  try {
    await api(`/users?name=eq.${encodeURIComponent(username)}`, {
      method: "PATCH",
      body: JSON.stringify({ is_banned: banned }),
    });
  } catch (e) { console.error("setBanStatus error:", e); }
}

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
