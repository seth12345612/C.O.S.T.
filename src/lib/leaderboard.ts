import { SCENARII } from "@/data/scenarios";

export interface LeaderboardEntry {
  id: string;
  username: string;
  score: number;
  months: number;
  scenario: string;
  date: number;
}

const STORAGE_KEY = "cost_leaderboard";
const MAX_ENTRIES = 20;

export function loadLeaderboardEntries(): LeaderboardEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as LeaderboardEntry[];
  } catch {
    return [];
  }
}

export function saveLeaderboardEntry(entry: Omit<LeaderboardEntry, "id" | "date">) {
  if (typeof window === "undefined") return;

  const existing = loadLeaderboardEntries();
  const newEntry: LeaderboardEntry = {
    ...entry,
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    date: Date.now(),
  };

  const merged = [newEntry, ...existing]
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_ENTRIES);

  localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
}

export function deleteLeaderboardEntry(id: string) {
  if (typeof window === "undefined") return;
  const existing = loadLeaderboardEntries();
  const filtered = existing.filter((e) => e.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

const BAN_KEY = "cost_banned_users";

export function getBannedUsers(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(BAN_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function banUser(username: string) {
  const banned = getBannedUsers();
  if (!banned.includes(username)) {
    localStorage.setItem(BAN_KEY, JSON.stringify([...banned, username]));
  }
}

export function unbanUser(username: string) {
  const banned = getBannedUsers();
  localStorage.setItem(BAN_KEY, JSON.stringify(banned.filter((u) => u !== username)));
}

export function getScenarioLabel(scenarioId: string, subScenarioId?: string) {
  const scenario = SCENARII[scenarioId];
  if (!scenario) return scenarioId;
  const sub = scenario.subScenarii.find((item) => item.id === subScenarioId);
  return sub ? `${scenario.nume} — ${sub.label}` : scenario.nume;
}
