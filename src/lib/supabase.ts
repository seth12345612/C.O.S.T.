import { createClient } from "@supabase/supabase-js";
import type { DBUser } from "@/types";

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

export type { DBUser } from "@/types";
