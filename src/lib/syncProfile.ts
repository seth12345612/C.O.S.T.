const FUNC_URL = "https://twdvhkwrlwhadbmortqk.supabase.co/functions/v1/sync-profile";
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3ZHZoa3dybHdoYWRibW9ydHFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyMDM4OTAsImV4cCI6MjA5NDc3OTg5MH0.mvQkXjYR3YDChjbuGmmm006QOTjw6rQz6UdAKZYG-lQ";

async function call(action: "get" | "put", email?: string, userId?: string, data?: Record<string, unknown>) {
  try {
    const res = await fetch(FUNC_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${ANON_KEY}` },
      body: JSON.stringify({ action, email, user_id: userId, data }),
    });
    return await res.json();
  } catch {
    return null;
  }
}

export async function loadProfile(email: string, userId?: string) {
  const result = await call("get", email, userId);
  return result?.profile ?? null;
}

export async function saveProfile(
  email: string,
  userId: string | undefined,
  data: Record<string, unknown>,
) {
  await call("put", email, userId, data);
}
