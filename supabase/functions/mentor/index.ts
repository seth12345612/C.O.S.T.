const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey",
  "Access-Control-Max-Age": "86400",
};

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface RequestBody {
  messages: Message[];
  context?: {
    scenariu?: string;
    dificultate?: string;
    bani?: number;
    fericire?: number;
    saptamana?: number;
  };
}

function respond(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }
  if (req.method !== "POST") return respond({ error: "Method not allowed" }, 405);
  if (!GEMINI_API_KEY) return respond({ error: "GEMINI_API_KEY not set" }, 500);

  try {
    const { messages, context }: RequestBody = await req.json();
    if (!messages?.length) return respond({ error: "No messages" }, 400);

    const contextBlock = context
      ? `\n\nContext jucător: scenariu=${context.scenariu ?? "?"}, dificultate=${context.dificultate ?? "?"}, bani=${context.bani ?? "?"} RON, fericire=${context.fericire ?? "?"}%, săptămâna ${context.saptamana ?? "?"}/48.`
      : "";

    const systemText =
      `Ești Mentorul C.O.S.T., un asistent AI specializat în educație financiară pentru studenți români. ` +
      `Răspunde util, concis (max 150 cuvinte), în limba română. ` +
      `Nu da sfaturi de investiții speculative sau recomandări financiare personalizate — oferă doar educație financiară generală.` +
      contextBlock;

    const firstMsg = messages[0];
    const systemMsg = { role: "user" as const, parts: [{ text: `${systemText}\n\n${firstMsg.content}` }] };
    const restMsgs = messages.slice(1).map((m) => ({
      role: m.role === "assistant" ? "model" as const : "user" as const,
      parts: [{ text: m.content }],
    }));
    const contents = [systemMsg, ...restMsgs];

    const geminiRes = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents,
        generationConfig: { temperature: 0.7, maxOutputTokens: 1500, topP: 0.95 },
      }),
    });

    if (!geminiRes.ok) {
      const text = await geminiRes.text();
      return respond({ error: `Gemini ${geminiRes.status}: ${text.slice(0, 300)}` }, 502);
    }

    const data = await geminiRes.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!reply) {
      return respond({ error: "Empty response from Gemini" }, 502);
    }

    return respond({ reply });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return respond({ error: msg }, 500);
  }
});
