const HF_TOKEN = Deno.env.get("HF_API_TOKEN");
const HF_URL = "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey",
  "Access-Control-Max-Age": "86400",
};

interface MentorRequest {
  messages: { role: "user" | "assistant"; content: string }[];
  context?: {
    scenariu?: string;
    dificultate?: string;
    bani?: number;
    fericire?: number;
    saptamana?: number;
  };
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS_HEADERS });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  if (!HF_TOKEN) return json({ error: "HF_API_TOKEN not configured" }, 500);

  try {
    const { messages, context }: MentorRequest = await req.json();
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return json({ error: "No messages provided" }, 400);
    }

    const contextStr = context
      ? `Context: scenariu=${context.scenariu ?? "?"}, dificultate=${context.dificultate ?? "?"}, bani=${context.bani ?? "?"} RON, fericire=${context.fericire ?? "?"}%, saptamana=${context.saptamana ?? "?"}/48. `
      : "";

    const systemMsg = `<s>[INST] <<SYS>>Ești Mentorul C.O.S.T., asistent financiar pentru studenți români. Răspunde util, concis (max 100 cuvinte), în română. ${contextStr}<</SYS>>`;

    const history = messages.map((m) =>
      m.role === "user" ? `[INST] ${m.content} [/INST]` : m.content
    ).join("\n");

    const prompt = `${systemMsg}\n${history}\n[/INST]`;

    const hfRes = await fetch(HF_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${HF_TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        inputs: prompt,
        parameters: { max_new_tokens: 300, temperature: 0.7, top_p: 0.9, do_sample: true },
      }),
    });

    if (!hfRes.ok) {
      const text = await hfRes.text();
      if (hfRes.status === 503) {
        // Model is loading, retry with a simpler prompt
        const retryRes = await fetch(HF_URL, {
          method: "POST",
          headers: { Authorization: `Bearer ${HF_TOKEN}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            inputs: prompt,
            parameters: { max_new_tokens: 150, temperature: 0.7, wait_for_model: true },
          }),
        });
        if (!retryRes.ok) {
          const retryText = await retryRes.text();
          throw new Error(`HuggingFace error: ${retryRes.status} - ${retryText.slice(0, 300)}`);
        }
        const retryData = await retryRes.json();
        const reply = Array.isArray(retryData) ? retryData[0]?.generated_text : retryData?.generated_text;
        return json({ reply: extractReply(reply ?? "", prompt) });
      }
      throw new Error(`HuggingFace error: ${hfRes.status} - ${text.slice(0, 300)}`);
    }

    const data = await hfRes.json();
    const reply = Array.isArray(data) ? data[0]?.generated_text : data?.generated_text;
    return json({ reply: extractReply(reply ?? "", prompt) });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return json({ error: message }, 500);
  }
});

function extractReply(text: string, prompt: string): string {
  const after = text.slice(prompt.length).trim();
  if (after) return after.replace(/<\/?s>/g, "").replace(/\[\/INST\]/g, "").trim();
  return "Îmi pare rău, nu pot răspunde acum. Încearcă din nou!";
}
