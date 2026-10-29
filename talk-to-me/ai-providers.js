// "Minha conta de IA": cada pessoa usa a própria chave de API.
// A chave fica salva só neste aparelho (localStorage) e vai direto do navegador
// para o provedor escolhido. Ela nunca passa pelo servidor do app nem pelo Firebase.

export const PROVIDERS = {
  gemini: {
    name: "Google Gemini",
    tag: "Tem plano gratuito",
    model: "gemini-3.5-flash-lite",
    keyUrl: "https://aistudio.google.com/apikey",
    keyHint: "Crie no Google AI Studio (aistudio.google.com) → Get API key.",
    placeholder: "AIza..."
  },
  anthropic: {
    name: "Claude (Anthropic)",
    tag: "Pago por uso",
    model: "claude-haiku-5-5",
    keyUrl: "https://console.anthropic.com/settings/keys",
    keyHint: "Crie no Claude Console (console.anthropic.com) → API Keys. A assinatura do app Claude não vale aqui: a API é cobrada à parte.",
    placeholder: "sk-ant-..."
  },
  openai: {
    name: "ChatGPT (OpenAI)",
    tag: "Pago por uso",
    model: "gpt-5-mini",
    keyUrl: "https://platform.openai.com/api-keys",
    keyHint: "Crie na OpenAI Platform (platform.openai.com) → API keys. A assinatura do ChatGPT não vale aqui: a API é cobrada à parte.",
    placeholder: "sk-..."
  }
};

const KEY = "ttm-ai";
export function loadAi() {
  try { return JSON.parse(localStorage.getItem(KEY) || "null") || { provider: "server" }; }
  catch (e) { return { provider: "server" }; }
}
export function saveAi(cfg) { try { localStorage.setItem(KEY, JSON.stringify(cfg)); } catch (e) {} }
export function clearAi() { try { localStorage.removeItem(KEY); } catch (e) {} }

// Lê JSON mesmo se vier dentro de ```json ... ```
export function parseJSON(text) {
  try { return JSON.parse(text); } catch (e) {}
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) { try { return JSON.parse(fence[1]); } catch (e) {} }
  const a = text.search(/[\[{]/), b = Math.max(text.lastIndexOf("}"), text.lastIndexOf("]"));
  if (a >= 0 && b > a) { try { return JSON.parse(text.slice(a, b + 1)); } catch (e) {} }
  return undefined;
}

function fail(status) {
  if (status === 400 || status === 401 || status === 403) return { code: "key" };
  if (status === 429) return { code: "rate" };
  return { code: "error" };
}

// system: instruções | messages: [{role:"user"|"assistant", content}]
export async function callProvider(cfg, system, messages) {
  const sys = system + "\n\nAnswer with valid JSON only, no other text.";
  const model = (cfg.model || PROVIDERS[cfg.provider].model).trim();
  let r, text = "";
  try {
    if (cfg.provider === "anthropic") {
      r = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": cfg.key,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
          "content-type": "application/json"
        },
        body: JSON.stringify({ model, max_tokens: 700, system: sys, messages })
      });
      if (!r.ok) throw fail(r.status);
      const j = await r.json();
      text = (j.content || []).filter(b => b.type === "text").map(b => b.text).join("");
    } else if (cfg.provider === "gemini") {
      r = await fetch("https://generativelanguage.googleapis.com/v1beta/models/" + encodeURIComponent(model) + ":generateContent", {
        method: "POST",
        headers: { "x-goog-api-key": cfg.key, "content-type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: sys }] },
          contents: messages.map(m => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] })),
          generationConfig: { responseMimeType: "application/json", maxOutputTokens: 700 }
        })
      });
      if (!r.ok) throw fail(r.status);
      const j = await r.json();
      text = ((j.candidates && j.candidates[0] && j.candidates[0].content && j.candidates[0].content.parts) || []).map(p => p.text || "").join("");
    } else if (cfg.provider === "openai") {
      r = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { authorization: "Bearer " + cfg.key, "content-type": "application/json" },
        body: JSON.stringify({ model, messages: [{ role: "system", content: sys }].concat(messages) })
      });
      if (!r.ok) throw fail(r.status);
      const j = await r.json();
      text = (j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content) || "";
    } else throw { code: "off" };
  } catch (e) {
    if (e && e.code) throw e;
    throw { code: "error" };
  }
  const data = parseJSON(text);
  if (data === undefined) throw { code: "error" };
  return data;
}
