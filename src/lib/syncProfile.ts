const FUNC_URL = "https://twdvhkwrlwhadbmortqk.supabase.co/functions/v1/sync-profile";
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

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
