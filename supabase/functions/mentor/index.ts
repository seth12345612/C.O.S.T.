import "https://deno.land/std@0.224.0/dotenv/load.ts";

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY") ?? "";
const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

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

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
  }

  try {
    const { messages, context }: MentorRequest = await req.json();

    const systemPrompt = buildSystemPrompt(context);
    const allMessages = [{ role: "user" as const, content: systemPrompt }, ...messages];

    const geminiContents = allMessages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const res = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: geminiContents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 500,
          topP: 0.9,
        },
        safetySettings: [
          { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
        ],
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Gemini API error: ${res.status} - ${text}`);
    }

    const data = await res.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "Scuze, nu pot răspunde acum. Încearcă din nou!";

    return new Response(JSON.stringify({
      reply,
      usage: data.usageMetadata ?? {},
    }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
});

function buildSystemPrompt(context?: MentorRequest["context"]): string {
  const contextInfo = context
    ? `Contextul jucătorului:
- Scenariu: ${context.scenariu ?? "N/A"}
- Dificultate: ${context.dificultate ?? "N/A"}
- Bani: ${context.bani ?? "N/A"} RON
- Fericire: ${context.fericire ?? "N/A"}%
- Săptămâna: ${context.saptamana ?? "N/A"} / 48
- Venit lunar: ${context.venitLunar ?? "N/A"} RON
- Costuri lunare: ${context.costuriLunare ?? "N/A"} RON`
    : "Jucătorul nu este momentan într-un joc activ.";

  return `Ești Mentorul C.O.S.T., un asistent financiar prietenos pentru studenți români.

Rolul tău:
- Oferi sfaturi financiare practice și adaptate pentru studenți
- Răspunzi în limba română
- Folosești un ton prietenos, dar serios și profesional
- Dai exemple concrete și cifre relevante pentru studenți
- Încurajezi economisirea și gestionarea responsabilă a banilor
- Maxim 100 cuvinte per răspuns

${contextInfo}

Reguli:
- Nu inventa informații false despre taxe sau legi
- Dacă nu știi ceva, recomandă consultarea unui specialist
- Nu promova investiții riscante
- Concentrează-te pe educație financiară de bază: bugetare, economisire, cheltuieli responsabile`;
}
