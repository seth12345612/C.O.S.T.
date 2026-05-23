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
    const { email } = await req.json();
    if (!email) return respond({ isPremium: false });

    const { data } = await supabase
      .from("payments")
      .select("premium_until")
      .eq("email", email)
      .eq("status", "completed")
      .gte("premium_until", new Date().toISOString())
      .order("premium_until", { ascending: false })
      .limit(1);

    if (data?.length) {
      const until = new Date(data[0].premium_until).getTime();
      if (until > Date.now()) {
        return respond({ isPremium: true, premiumUntil: until });
      }
    }

    return respond({ isPremium: false });
  } catch {
    return respond({ isPremium: false });
  }
});
