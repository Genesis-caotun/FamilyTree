const MODEL = "@cf/meta/llama-3.2-11b-vision-instruct";
const WORKER_VERSION = "6.1.1";

function allowedOrigins(env) {
  return String(env.ALLOWED_ORIGINS || "*").split(",").map(v => v.trim()).filter(Boolean);
}
function isOriginAllowed(origin, env) {
  const list = allowedOrigins(env);
  return list.includes("*") || list.includes(origin || "null");
}
function corsHeaders(origin, env) {
  const allowed = isOriginAllowed(origin, env);
  return {
    "Access-Control-Allow-Origin": allowed ? (origin || "null") : "null",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Genogram-Client",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin",
  };
}
function json(body, status = 200, headers = {}) {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", ...headers } });
}
function parseModelJson(value) {
  if (value && typeof value === "object" && (value.people || value.nodes)) return value;
  const text = typeof value === "string" ? value : value?.response || value?.result || JSON.stringify(value);
  const clean = String(text).trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  const start = clean.indexOf("{");
  const end = clean.lastIndexOf("}");
  return JSON.parse(start >= 0 && end > start ? clean.slice(start, end + 1) : clean);
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "null";
    const cors = corsHeaders(origin, env);
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
    if (!isOriginAllowed(origin, env)) return json({ error: "Origin not allowed" }, 403, cors);

    if (request.method === "GET") {
      return json({ ok: true, service: env.SERVICE_NAME || "騰元家系圖 AI 協助服務", model: MODEL, version: WORKER_VERSION, privacy: "request images are not stored by this Worker" }, 200, cors);
    }
    if (request.method !== "POST") return json({ error: "POST only" }, 405, cors);

    const declaredLength = Number(request.headers.get("Content-Length") || 0);
    if (declaredLength > 6_000_000) return json({ error: "Image payload too large" }, 413, cors);

    const clientKey = request.headers.get("X-Genogram-Client") || request.headers.get("CF-Connecting-IP") || origin;
    if (env.AI_RATE_LIMITER) {
      const { success } = await env.AI_RATE_LIMITER.limit({ key: String(clientKey).slice(0, 180) });
      if (!success) return json({ error: "使用次數過於頻繁，請稍後再試" }, 429, cors);
    }

    try {
      const body = await request.json();
      if (body?.task !== "genogram_scan" || typeof body?.image !== "string" || !body.image.startsWith("data:image/")) {
        return json({ error: "Invalid genogram_scan payload" }, 400, cors);
      }
      if (body.image.length > 5_000_000) return json({ error: "Image payload too large" }, 413, cors);

      const schema = `Return JSON only with this shape:
{
  "people": [{
    "id": "p1",
    "type": "male|female|unknown|pregnancy|loss|service",
    "name": "label visible in image or empty string",
    "age": "number as string or empty string",
    "bbox": {"x":0.0,"y":0.0,"w":0.1,"h":0.1},
    "confidence": 0.0
  }],
  "relationships": [{
    "type": "partner|parent|serviceArrow",
    "from": "p1",
    "to": "p2",
    "status": "married|cohabiting|separated|divorced|",
    "confidence": 0.0
  }],
  "warnings": ["uncertain item"]
}
Bounding boxes must be normalized from 0 to 1. For parent, from=parent and to=child. For serviceArrow, from=service unit and to=person. Divorce is marked by X; separation is one slash. Do not invent names, ages, diagnoses, abuse, or other sensitive facts that are not clearly visible. Mark uncertainty in warnings.`;

      const localDraft = body.localDraft ? `\nLocal computer-vision draft for comparison:\n${JSON.stringify(body.localDraft).slice(0, 18000)}` : "";
      const messages = [
        { role: "system", content: "You analyze anonymized social-work genograms. Be conservative, follow the requested JSON schema, and never infer sensitive facts not shown in the image." },
        { role: "user", content: `Analyze this anonymized hand-drawn or scanned genogram. Identify person symbols, service-unit ellipses, partner/parent/service-arrow relationships, divorce X, and separation slash. ${schema}${localDraft}` },
      ];

      const response = await env.AI.run(MODEL, { messages, image: body.image });
      let parsed;
      try { parsed = parseModelJson(response); }
      catch { parsed = parseModelJson(response?.response || response?.result || response); }
      return json({ ok: true, result: parsed, model: MODEL, version: WORKER_VERSION }, 200, cors);
    } catch (error) {
      const message = error?.message || "AI processing failed";
      const quota = /3036|neuron|quota|allocation|limit/i.test(message);
      return json({ error: quota ? "今日免費 AI 額度可能已用完，請稍後或隔日再試" : message }, quota ? 429 : 500, cors);
    }
  },
};
