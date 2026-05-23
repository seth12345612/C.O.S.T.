const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey",
  "Access-Control-Max-Age": "86400",
};

interface RequestBody {
  intrebare: string;
  raspuns: string;
  context: { bani: number; fericire: number; saptamana: number; scenariu?: string };
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
    const { intrebare, raspuns, context }: RequestBody = await req.json();
    if (!intrebare || !raspuns) return respond({ error: "Missing intrebare or raspuns" }, 400);

    const prompt =
      `Ești un evaluator pentru un joc de educație financiară pentru studenți români. ` +
      `Trebuie să evaluezi răspunsul unui student la o întrebare săptămânală.\n\n` +
      `Întrebarea: "${intrebare}"\n` +
      `Răspunsul studentului: "${raspuns}"\n` +
      `Context jucător: bani=${context.bani} RON, fericire=${context.fericire}%, săptămâna ${context.saptamana}/48.\n\n` +
      `Evaluează răspunsul și returnează DOAR un JSON valid cu următoarea structură (fără text în plus):\n` +
      `{\n` +
      `  "corect": boolean (true dacă răspunsul demonstrează înțelegere financiară corectă, altfel false),\n` +
      `  "baniDelta": number (î înte 5 și 20 dacă e corect, -5 până la -15 dacă e greșit),\n` +
      `  "fericireDelta": number (între 2 și 8 dacă e corect, -2 până la -8 dacă e greșit),\n` +
      `  "explicatie": string (explicație în română, maxim 100 cuvinte)\n` +
      `}`;

    const geminiRes = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          role: "user",
          parts: [{ text: prompt }],
        }],
        generationConfig: { temperature: 0.3, maxOutputTokens: 500, topP: 0.95 },
      }),
    });

    if (!geminiRes.ok) {
      const text = await geminiRes.text();
      return respond({ error: `Gemini ${geminiRes.status}: ${text.slice(0, 300)}` }, 502);
    }

    const data = await geminiRes.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!reply) return respond({ error: "Empty response from Gemini" }, 502);

    const jsonMatch = reply.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return respond({ error: "No JSON in Gemini response" }, 502);

    const result = JSON.parse(jsonMatch[0]);
    return respond({
      corect: Boolean(result.corect),
      baniDelta: Math.round(result.baniDelta),
      fericireDelta: Math.round(result.fericireDelta),
      explicatie: String(result.explicatie || ""),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return respond({ error: msg }, 500);
  }
});
