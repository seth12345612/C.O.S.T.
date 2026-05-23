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
    const { email, name } = await req.json();

    const baseUrl = req.headers.get("origin") ?? "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "ron",
            product_data: {
              name: "C.O.S.T. Premium — 30 de zile",
              description: "Acces complet la toate funcțiile premium ale jocului C.O.S.T.",
            },
            unit_amount: 900,
          },
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/premium?canceled=1`,
      customer_email: email,
      ...(name ? { customer_creation: "always", metadata: { name } } : {}),
    });

    return respond({ url: session.url });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return respond({ error: msg }, 500);
  }
});
