import type { LeaderboardEntry } from "@/types";
import { SCENARII } from "@/data/scenarios";
import { getLeaderboardEntries, saveLeaderboardEntry as supabaseSave, deleteLeaderboardEntry as supabaseDelete, getBannedUsernames, setBanStatus } from "./supabase";

const LOCAL_KEY = "cost_leaderboard_local";

export function loadLocalScores(): LeaderboardEntry[] {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveLocal(entries: LeaderboardEntry[]) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(entries));
}

async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms)),
  ]);
}

export async function loadLeaderboardEntries(): Promise<LeaderboardEntry[]> {
  try {
    const entries = await withTimeout(getLeaderboardEntries(), 8000);
    return entries.map((e) => ({
      id: e.id,
      username: e.username,
      score: e.score,
      months: e.months,
      scenario: e.scenario,
      date: new Date(e.created_at).getTime(),
    }));
  } catch (e) {
    console.warn("Supabase leaderboard load failed, using local:", e);
    return loadLocalScores();
  }
}

export async function saveLeaderboardEntry(entry: { userId: string; username: string; score: number; months: number; scenario: string }): Promise<void> {
  const localEntry: LeaderboardEntry = {
    id: "local-" + Date.now(),
    username: entry.username,
    score: entry.score,
    months: entry.months,
    scenario: entry.scenario,
    date: Date.now(),
  };
  const local = loadLocalScores();
  local.push(localEntry);
  saveLocal(local);

  if (entry.userId) {
    try {
      await withTimeout(supabaseSave(entry), 8000);
    } catch (e) {
      console.warn("Supabase save failed, saved locally only:", e);
    }
  }
}

export async function deleteLeaderboardEntry(id: string): Promise<void> {
  const local = loadLocalScores();
  saveLocal(local.filter((e) => e.id !== id));
  try {
    await withTimeout(supabaseDelete(id), 8000);
  } catch (e) {
    console.warn("Supabase delete failed, deleted locally only:", e);
  }
}

export async function getBannedUsers(): Promise<string[]> {
  try {
    return await withTimeout(getBannedUsernames(), 8000);
  } catch {
    return [];
  }
}

export async function banUser(username: string): Promise<void> {
  try {
    await withTimeout(setBanStatus(username, true), 8000);
  } catch (e) {
    console.warn("Supabase ban failed:", e);
  }
}

export async function unbanUser(username: string): Promise<void> {
  try {
    await withTimeout(setBanStatus(username, false), 8000);
  } catch (e) {
    console.warn("Supabase unban failed:", e);
  }
}

export function getScenarioLabel(scenarioId: string, subScenarioId?: string) {
  const scenario = SCENARII[scenarioId];
  if (!scenario) return scenarioId;
  const sub = scenario.subScenarii.find((item) => item.id === subScenarioId);
  return sub ? `${scenario.nume} — ${sub.label}` : scenario.nume;
}
