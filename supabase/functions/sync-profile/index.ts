import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
);

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey",
  "Access-Control-Max-Age": "86400",
};

function respond(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS_HEADERS });
  if (req.method !== "POST") return respond({ error: "Method not allowed" }, 405);

  try {
    const { action, email, user_id, data } = await req.json();
    if (!email && !user_id) return respond({ error: "email or user_id required" }, 400);

    if (action === "get") {
      const query = supabase
        .from("user_profiles")
        .select("*")
        .limit(1);

      if (user_id) query.eq("user_id", user_id);
      else query.eq("email", email);

      const { data: rows } = await query;

      if (rows?.length) {
        return respond({ profile: rows[0] });
      }

      return respond({ profile: null });
    }

    if (action === "put") {
      const { xp, finance, achievements, theme, current_game } = data ?? {};

      const payload: Record<string, unknown> = { email, updated_at: new Date().toISOString() };
      if (xp !== undefined) payload.xp = xp;
      if (finance !== undefined) payload.finance = finance;
      if (achievements !== undefined) payload.achievements = achievements;
      if (theme !== undefined) payload.theme = theme;
      if (current_game !== undefined) payload.current_game = current_game;

      if (user_id) {
        const { data: existing } = await supabase
          .from("user_profiles")
          .select("user_id")
          .eq("user_id", user_id)
          .limit(1);

        if (existing?.length) {
          await supabase.from("user_profiles").update(payload).eq("user_id", user_id);
        } else {
          await supabase.from("user_profiles").insert({ user_id, ...payload });
        }
      } else {
        const { data: existing } = await supabase
          .from("user_profiles")
          .select("user_id")
          .eq("email", email)
          .limit(1);

        if (existing?.length) {
          await supabase.from("user_profiles").update(payload).eq("email", email);
        } else {
          await supabase.from("user_profiles").insert({ email, ...payload });
        }
      }

      return respond({ ok: true });
    }

    return respond({ error: "Invalid action. Use 'get' or 'put'." }, 400);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return respond({ error: msg }, 500);
  }
});
