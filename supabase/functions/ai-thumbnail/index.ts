// AI Thumbnail Maker - generates high-quality thumbnails via Lovable AI Gateway
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const STYLE_HINTS: Record<string, string> = {
  youtube:
    "YouTube viral thumbnail style: bold, high-contrast, dramatic lighting, expressive subject, big bold readable space for title, vibrant colors, eye-catching, professional, 4K detail",
  cinematic:
    "Cinematic poster style: moody lighting, film grain, dramatic composition, depth of field, rich colors",
  minimal:
    "Clean minimal editorial style: lots of negative space, single hero subject, refined typography area, soft modern palette",
  tech: "Modern tech product style: clean studio lighting, geometric layout, dark background with glowing accents, futuristic feel",
  vlog: "Lifestyle vlog style: warm natural light, candid feeling, friendly atmosphere, bright colors, soft bokeh background",
  gaming:
    "Gaming thumbnail style: explosive energy, neon glows, action-packed, bold dramatic subject, high saturation, intense lighting",
  educational:
    "Educational explainer style: clean illustrative composition, friendly color palette, clear focal subject, space for big title text",
  news: "News/documentary style: serious tone, professional photography, balanced composition, restrained color palette",
};

const SIZE_MAP: Record<string, string> = {
  "16:9": "1536x1024",
  "1:1": "1024x1024",
  "9:16": "1024x1536",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { prompt, style, aspect, title } = await req.json();
    if (!prompt || typeof prompt !== "string") {
      return json({ error: "prompt is required" }, 400);
    }
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) return json({ error: "AI not configured" }, 500);

    const styleHint = STYLE_HINTS[style] || STYLE_HINTS.youtube;
    const size = SIZE_MAP[aspect] || SIZE_MAP["16:9"];

    const fullPrompt = `${prompt}

${styleHint}
${title ? `Leave clean visual space (top or bottom third) to overlay the title: "${title}"` : "Leave clean visual space for a title overlay"}.
Ultra detailed, sharp focus, professional thumbnail composition. Do NOT add any text, letters, words, or watermarks in the image — only the visual scene. The user will add their own title text afterwards.`;

    const r = await fetch("https://ai.gateway.lovable.dev/v1/images/generations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-image-2",
        prompt: fullPrompt,
        size,
        quality: "medium",
        n: 1,
      }),
    });

    if (!r.ok) {
      const errText = await r.text();
      if (r.status === 429) return json({ error: "Rate limit. Try again in a moment." }, 429);
      if (r.status === 402) return json({ error: "AI credits exhausted. Please add credits." }, 402);
      return json({ error: errText.slice(0, 500) }, r.status);
    }

    const data = await r.json();
    const b64 = data?.data?.[0]?.b64_json;
    if (!b64) return json({ error: "No image returned" }, 502);

    return json({ ok: true, image: `data:image/png;base64,${b64}` });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});

function json(obj: unknown, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
