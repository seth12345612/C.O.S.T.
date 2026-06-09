const CACHE_KEY = "cost_translations";
const LANG_KEY = "cost_language";

interface Cache {
  [lang: string]: { [text: string]: string };
}

function loadCache(): Cache {
  try { return JSON.parse(localStorage.getItem(CACHE_KEY) || "{}"); } catch { return {}; }
}

function saveCache(cache: Cache) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(cache)); } catch {} 
}

export function getStoredLanguage(): string {
  try { return localStorage.getItem(LANG_KEY) || "ro"; } catch { return "ro"; }
}

export function setStoredLanguage(lang: string) {
  try { localStorage.setItem(LANG_KEY, lang); } catch {}
}

export async function translateTexts(texts: string[], targetLang: string): Promise<string[]> {
  if (targetLang === "ro" || texts.length === 0) return texts;

  const cache = loadCache();
  const results: string[] = [];
  const uncached: string[] = [];

  for (const t of texts) {
    const cached = cache[targetLang]?.[t];
    if (cached) {
      results.push(cached);
    } else {
      results.push("");
      uncached.push(t);
    }
  }

  if (uncached.length > 0) {
    const apiKey = import.meta.env.VITE_GOOGLE_TRANSLATE_API_KEY;
    if (!apiKey) {
      console.warn("[translate] No VITE_GOOGLE_TRANSLATE_API_KEY set");
      return texts; // fallback to original
    }

    try {
      const res = await fetch(
        `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`,
        {
          method: "POST",
          body: JSON.stringify({ q: uncached, target: targetLang, source: "ro", format: "text" }),
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!res.ok) {
        const errBody = await res.text();
        console.error(`[translate] API error ${res.status}:`, errBody);
        return texts;
      }

      const data = await res.json();

      if (!data?.data?.translations) {
        console.warn("[translate] Unexpected API response:", data);
        return texts;
      }

      cache[targetLang] = cache[targetLang] || {};
      let idx = 0;
      for (let i = 0; i < results.length; i++) {
        if (results[i] === "") {
          const tr = data.data.translations[idx];
          if (tr?.translatedText) {
            cache[targetLang][uncached[idx]] = tr.translatedText;
            results[i] = tr.translatedText;
          }
          idx++;
        }
      }
      saveCache(cache);
    } catch (err) {
      console.error("[translate] Fetch failed:", err);
      return texts;
    }
  }

  // fill any remaining empty slots with original text
  let idx = 0;
  for (let i = 0; i < results.length; i++) {
    if (results[i] === "") {
      results[i] = texts[i];
    }
  }

  return results;
}
