import Stripe from "https://esm.sh/stripe@17.7.0?target=deno";

const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY") ?? "";
const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: "2025-02-24.acacia", httpClient: Stripe.createFetchHttpClient() });

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

    return respond({ verified: true, email: session.customer_email, name: session.metadata?.name });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return respond({ error: msg }, 500);
  }
});
