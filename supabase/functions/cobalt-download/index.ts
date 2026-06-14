// Proxies Cobalt API (https://github.com/imputnet/cobalt) to fetch direct download
// links from YouTube, TikTok, Instagram, Facebook, Twitter/X, Reddit, etc.
// We try multiple public instances + an optional self-host (COBALT_API_URL secret) for resiliency.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const DEFAULT_INSTANCES = [
  "https://dwnld.nichind.dev",
  "https://cobalt-backend.canine.tools",
  "https://cobalt-api.ayo.tf",
  "https://co.eepy.today",
  "https://cobalt.synzr.space",
  "https://api.cobalt.tools",
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const {
      url,
      audioOnly,
      quality,
      audioFormat,   // "mp3" | "ogg" | "wav" | "opus" | "best"
      audioBitrate,  // "320" | "256" | "192" | "128" | "96" | "64"
      videoCodec,    // "h264" | "av1" | "vp9"
    } = await req.json();

    if (!url || typeof url !== "string") return json({ error: "url is required" }, 400);

    const body: Record<string, unknown> = {
      url,
      videoQuality: quality || "720",
      audioFormat: audioOnly ? (audioFormat || "mp3") : "best",
      audioBitrate: audioBitrate || "128",
      youtubeVideoCodec: videoCodec || "h264",
      downloadMode: audioOnly ? "audio" : "auto",
      filenameStyle: "pretty",
      disableMetadata: false,
    };

    const userInstance = Deno.env.get("COBALT_API_URL");
    const instances = userInstance
      ? [userInstance.replace(/\/$/, ""), ...DEFAULT_INSTANCES]
      : DEFAULT_INSTANCES;

    const errors: string[] = [];
    for (const base of instances) {
      try {
        const res = await fetch(`${base}/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            "User-Agent": "Mozilla/5.0 (compatible; LovableDownloader/1.0)",
          },
          body: JSON.stringify(body),
        });
        const text = await res.text();
        let data: any = null;
        try { data = JSON.parse(text); } catch { /* not json */ }

        if (data?.status === "tunnel" || data?.status === "redirect" || data?.url) {
          return json({ ok: true, instance: base, ...data });
        }
        if (data?.status === "picker" && Array.isArray(data?.picker)) {
          return json({ ok: true, instance: base, ...data });
        }
        const errMsg =
          data?.error?.code ||
          data?.error?.text ||
          data?.text ||
          `status ${res.status}`;
        errors.push(`${new URL(base).host}: ${errMsg}`);
      } catch (e) {
        errors.push(`${base}: ${String(e).slice(0, 100)}`);
      }
    }
    return json(
      {
        error:
          "All download providers failed. Try a different link, or try again in a moment.",
        details: errors,
      },
      502
    );
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
