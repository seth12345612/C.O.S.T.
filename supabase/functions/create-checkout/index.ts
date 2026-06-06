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
    const { email, name, tier } = await req.json();
    const baseUrl = req.headers.get("origin") ?? "http://localhost:3000";

    const tierConfig = tier === "premium_advanced"
      ? { amount: 1900, name: "C.O.S.T. Premium Advanced — 30 de zile", desc: "Toate funcțiile avansate premium" }
      : { amount: 900, name: "C.O.S.T. Premium — 30 de zile", desc: "Acces complet la toate funcțiile premium" };

    let userId: string | null = null;
    if (email) {
      const { data: users } = await supabase.from("users").select("id").eq("email", email).limit(1);
      if (users?.length) userId = users[0].id;
    }

    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .insert({ user_id: userId, email: email || "", amount: tierConfig.amount, currency: "ron", status: "pending", duration_days: 30 })
      .select("id")
      .single();

    if (orderErr || !order) return respond({ error: "Failed to create order" }, 500);

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{
        price_data: {
          currency: "ron",
          product_data: { name: tierConfig.name, description: tierConfig.desc },
          unit_amount: tierConfig.amount,
        },
        quantity: 1,
      }],
      success_url: `${baseUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/premium?canceled=1`,
      customer_email: email,
      metadata: { order_id: order.id, tier: tier || "premium_basic" },
    });

    const { error: payErr } = await supabase.from("payments").insert({
      order_id: order.id,
      user_id: userId,
      provider: "stripe",
      provider_session_id: session.id,
      amount: tierConfig.amount,
      currency: "ron",
      status: "pending",
    });

    if (payErr) return respond({ error: "Failed to create payment record" }, 500);

    return respond({ url: session.url });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return respond({ error: msg }, 500);
  }
});
