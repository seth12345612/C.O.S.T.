import Stripe from "https://esm.sh/stripe@17.7.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY") ?? "";
const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: "2025-02-24.acacia", httpClient: Stripe.createFetchHttpClient() });

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
  if (!STRIPE_SECRET_KEY) return respond({ error: "STRIPE_SECRET_KEY not set" }, 500);

  try {
    const { session_id } = await req.json();
    if (!session_id) return respond({ error: "Missing session_id" }, 400);

    const session = await stripe.checkout.sessions.retrieve(session_id);
    if (session.payment_status !== "paid") {
      return respond({ verified: false, reason: "unpaid" });
    }

    const { data: payments } = await supabase
      .from("payments")
      .select("id, order_id")
      .eq("provider_session_id", session_id)
      .limit(1);

    if (!payments?.length) return respond({ error: "Payment record not found" }, 404);

    const payment = payments[0];
    const premiumUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    await supabase.from("payments").update({
      status: "completed",
      provider_payment_id: session.payment_intent as string,
      premium_until: premiumUntil,
      updated_at: new Date().toISOString(),
    }).eq("id", payment.id);

    await supabase.from("orders").update({
      status: "paid",
      updated_at: new Date().toISOString(),
    }).eq("id", payment.order_id);

    return respond({
      verified: true,
      email: session.customer_email,
      premium_until: premiumUntil,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return respond({ error: msg }, 500);
  }
});
