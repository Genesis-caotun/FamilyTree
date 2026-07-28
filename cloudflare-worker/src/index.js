const MODEL = "@cf/meta/llama-3.2-11b-vision-instruct";

const corsHeaders = (origin, allowed) => ({
  "Access-Control-Allow-Origin": allowed === "*" ? "*" : origin,
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Vary": "Origin",
});

function json(body, status = 200, headers = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", ...headers },
  });
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
    const origin = request.headers.get("Origin") || "";
    const allowed = env.ALLOWED_ORIGIN || "*";
    const cors = corsHeaders(origin, allowed);
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
    if (request.method !== "POST") return json({ error: "POST only" }, 405, cors);
    if (allowed !== "*" && origin !== allowed) return json({ error: "Origin not allowed" }, 403, cors);

    try {
      const body = await request.json();
      if (body?.task !== "genogram_scan" || typeof body?.image !== "string" || !body.image.startsWith("data:image/")) {
        return json({ error: "Invalid genogram_scan payload" }, 400, cors);
      }
      if (body.image.length > 8_000_000) return json({ error: "Image payload too large" }, 413, cors);

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
Bounding boxes must be normalized from 0 to 1. For parent, from=parent and to=child. For serviceArrow, from=service unit and to=person. A divorce is marked by X; separation is one slash. Do not invent names or ages that are not visible. Mark uncertainty in warnings.`;

      const localDraft = body.localDraft ? `\nLocal computer-vision draft for comparison:\n${JSON.stringify(body.localDraft).slice(0, 18000)}` : "";
      const messages = [
        { role: "system", content: "You analyze social-work genograms. Be conservative, follow the requested JSON schema, and never infer sensitive facts not shown in the image." },
        { role: "user", content: `Analyze this anonymized hand-drawn or scanned genogram. Identify person symbols, service-unit ellipses, partner/parent/service-arrow relationships, divorce X, and separation slash. ${schema}${localDraft}` },
      ];

      const response = await env.AI.run(MODEL, { messages, image: body.image });
      let parsed;
      try { parsed = parseModelJson(response); }
      catch { parsed = parseModelJson(response?.response || response?.result || response); }
      return json({ ok: true, result: parsed, model: MODEL }, 200, cors);
    } catch (error) {
      return json({ error: error?.message || "AI processing failed" }, 500, cors);
    }
  },
};
