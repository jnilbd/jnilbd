// Proxies Cobalt API (https://github.com/imputnet/cobalt) to fetch direct download
// links from YouTube, TikTok, Instagram, Facebook, Twitter/X, Reddit, etc.
// No API key required. We try a list of public instances for resiliency.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const INSTANCES = [
  "https://api.cobalt.tools",
  "https://co.wuk.sh",
  "https://cobalt-api.kwiatekmiki.com",
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { url, audioOnly, quality } = await req.json();
    if (!url || typeof url !== "string") {
      return json({ error: "url is required" }, 400);
    }

    const body = {
      url,
      videoQuality: quality || "720",
      audioFormat: audioOnly ? "mp3" : "best",
      downloadMode: audioOnly ? "audio" : "auto",
      filenameStyle: "pretty",
    };

    let lastErr = "";
    for (const base of INSTANCES) {
      try {
        const res = await fetch(`${base}/`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(body),
        });
        const data = await res.json().catch(() => null);
        if (data && (data.url || data.picker)) {
          return json({ ok: true, ...data });
        }
        lastErr = (data && (data.text || data.error?.code)) || `status ${res.status}`;
      } catch (e) {
        lastErr = String(e);
      }
    }
    return json({ error: `All providers failed. Last: ${lastErr}` }, 502);
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
