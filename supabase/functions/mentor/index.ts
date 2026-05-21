const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey",
  "Access-Control-Max-Age": "86400",
};

interface MentorRequest {
  messages: { role: "user" | "assistant" | "system"; content: string }[];
  context?: {
    scenariu?: string;
    dificultate?: string;
    bani?: number;
    fericire?: number;
    saptamana?: number;
    venitLunar?: number;
    costuriLunare?: number;
  };
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }
  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  if (!GEMINI_API_KEY) {
    return json({ error: "GEMINI_API_KEY not configured" }, 500);
  }

  try {
    const { messages, context }: MentorRequest = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return json({ error: "No messages provided" }, 400);
    }

    const contextInfo = context
      ? `Contextul jucătorului:\n- Scenariu: ${context.scenariu ?? "N/A"}\n- Dificultate: ${context.dificultate ?? "N/A"}\n- Bani: ${context.bani ?? "N/A"} RON\n- Fericire: ${context.fericire ?? "N/A"}%\n- Săptămâna: ${context.saptamana ?? "N/A"} / 48`
      : "Jucătorul nu este momentan într-un joc activ.";

    const systemInstruction = `Ești Mentorul C.O.S.T., un asistent financiar prietenos pentru studenți români. Oferi sfaturi financiare practice în română. Maxim 100 cuvinte. ${contextInfo}`;

    const geminiContents = messages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const geminiRes = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemInstruction }] },
        contents: geminiContents,
        generationConfig: { temperature: 0.7, maxOutputTokens: 500, topP: 0.9 },
        safetySettings: [
          { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
        ],
      }),
    });

    if (!geminiRes.ok) {
      const text = await geminiRes.text();
      throw new Error(`Gemini returned ${geminiRes.status}: ${text.slice(0, 500)}`);
    }

    const data = await geminiRes.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!reply) {
      throw new Error("Empty response from Gemini");
    }

    return json({ reply, usage: data.usageMetadata ?? {} });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return json({ error: message }, 500);
  }
});
