// Rota /api/chat (Vercel Serverless Function).
// OPCIONAL: "IA do app", paga pelo dono. Só funciona se ANTHROPIC_API_KEY estiver configurada.
// Quem usa a própria chave (tela "Minha conta de IA") não passa por aqui.
// Recebe a conversa do app, confere se a pessoa está logada (Firebase)
// e pede a resposta à API do Claude. A chave da API fica só aqui no servidor.
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

if (!getApps().length && process.env.FIREBASE_SERVICE_ACCOUNT) {
  initializeApp({ credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)) });
}

// Limite simples por pessoa (reinicia quando o servidor reinicia).
const hits = new Map();
function tooMany(uid) {
  const now = Date.now(), win = 60_000, max = 20;
  const arr = (hits.get(uid) || []).filter(t => now - t < win);
  arr.push(now); hits.set(uid, arr);
  return arr.length > max;
}

// Lê o JSON da resposta mesmo se vier dentro de ```json ... ```
function parseJSON(text) {
  try { return JSON.parse(text); } catch {}
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) { try { return JSON.parse(fence[1]); } catch {} }
  const a = text.search(/[\[{]/), b = Math.max(text.lastIndexOf("}"), text.lastIndexOf("]"));
  if (a >= 0 && b > a) { try { return JSON.parse(text.slice(a, b + 1)); } catch {} }
  return undefined;
}

export default async function handler(req, res) {
  if (req.method === "GET") return res.status(200).json({ configured: !!(process.env.ANTHROPIC_API_KEY && getApps().length) });
  if (req.method !== "POST") return res.status(405).json({ error: "Use POST" });
  if (!process.env.ANTHROPIC_API_KEY || !getApps().length) return res.status(503).json({ error: "Servidor não configurado" });

  // 1) Só aceita quem está logado no app
  const token = (req.headers.authorization || "").replace(/^Bearer\s+/i, "");
  let uid;
  try { uid = (await getAuth().verifyIdToken(token)).uid; }
  catch { return res.status(401).json({ error: "Faça login de novo" }); }
  if (tooMany(uid)) return res.status(429).json({ error: "Muitas mensagens seguidas" });

  // 2) Valida o que chegou
  const { system, messages } = req.body || {};
  if (typeof system !== "string" || system.length > 8000 || !Array.isArray(messages) || !messages.length || messages.length > 40)
    return res.status(400).json({ error: "Pedido inválido" });
  const clean = messages
    .filter(m => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string" && m.content.trim())
    .map(m => ({ role: m.role, content: m.content.slice(0, 4000) }));
  while (clean.length && clean[0].role !== "user") clean.shift();
  if (!clean.length || clean[clean.length - 1].role !== "user") return res.status(400).json({ error: "Pedido inválido" });

  // 3) Chama a API do Claude
  let r;
  try {
    r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json"
      },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL || "claude-haiku-5-5",
        max_tokens: 700,
        system: system + "\n\nAnswer with valid JSON only, no other text.",
        messages: clean
      })
    });
  } catch { return res.status(502).json({ error: "Falha ao falar com a IA" }); }
  if (r.status === 429) return res.status(429).json({ error: "Limite da API atingido" });
  if (!r.ok) { console.error("Claude API", r.status, await r.text()); return res.status(502).json({ error: "Falha ao falar com a IA" }); }

  const j = await r.json();
  const text = (j.content || []).filter(b => b.type === "text").map(b => b.text).join("");
  const data = parseJSON(text);
  if (data === undefined) return res.status(502).json({ error: "Resposta inválida da IA" });
  return res.status(200).json({ data });
}
