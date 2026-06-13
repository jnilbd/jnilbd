// HLS / stream proxy — unlocks CORS and many geo-blocks by routing through
// the edge function's server region. Rewrites m3u8 manifest URLs so segments
// also flow through the proxy.
//
// Usage:  /stream-proxy?u=<absolute-stream-url>
// Returns the upstream body with permissive CORS headers. For .m3u8 it
// rewrites every referenced URI (variant playlists + segments + keys) to
// point back at this same proxy.

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
  "Access-Control-Allow-Headers": "*",
  "Access-Control-Expose-Headers": "*",
};

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

function buildProxied(reqUrl: URL, target: string): string {
  return `${reqUrl.origin}${reqUrl.pathname}?u=${encodeURIComponent(target)}`;
}

function resolveUrl(base: string, ref: string): string {
  try { return new URL(ref, base).toString(); } catch { return ref; }
}

function rewriteManifest(body: string, upstreamUrl: string, reqUrl: URL): string {
  const lines = body.split(/\r?\n/);
  const out: string[] = [];
  for (const raw of lines) {
    const line = raw;
    if (!line) { out.push(line); continue; }
    if (line.startsWith("#")) {
      // Rewrite URI="..." occurrences (EXT-X-KEY, EXT-X-MAP, etc.)
      const rewritten = line.replace(/URI="([^"]+)"/g, (_m, u) => {
        const abs = resolveUrl(upstreamUrl, u);
        return `URI="${buildProxied(reqUrl, abs)}"`;
      });
      out.push(rewritten);
    } else {
      const abs = resolveUrl(upstreamUrl, line.trim());
      out.push(buildProxied(reqUrl, abs));
    }
  }
  return out.join("\n");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });

  const reqUrl = new URL(req.url);
  const target = reqUrl.searchParams.get("u");
  if (!target) {
    return new Response("missing ?u=", { status: 400, headers: CORS });
  }

  let upstreamUrl: string;
  try { upstreamUrl = new URL(target).toString(); }
  catch { return new Response("bad url", { status: 400, headers: CORS }); }

  try {
    const upstream = await fetch(upstreamUrl, {
      headers: {
        "User-Agent": UA,
        "Accept": "*/*",
        "Referer": new URL(upstreamUrl).origin + "/",
        "Origin": new URL(upstreamUrl).origin,
      },
      redirect: "follow",
    });

    const ct = upstream.headers.get("content-type") || "";
    const isManifest =
      upstreamUrl.toLowerCase().includes(".m3u8") ||
      ct.includes("mpegurl") ||
      ct.includes("application/vnd.apple");

    const headers = new Headers(CORS);
    if (isManifest) {
      const text = await upstream.text();
      const rewritten = rewriteManifest(text, upstream.url || upstreamUrl, reqUrl);
      headers.set("Content-Type", "application/vnd.apple.mpegurl");
      return new Response(rewritten, { status: upstream.status, headers });
    }

    // Binary passthrough (TS segments, keys, etc.)
    headers.set("Content-Type", ct || "application/octet-stream");
    const len = upstream.headers.get("content-length");
    if (len) headers.set("Content-Length", len);
    return new Response(upstream.body, { status: upstream.status, headers });
  } catch (err) {
    return new Response(`proxy error: ${(err as Error).message}`, {
      status: 502, headers: CORS,
    });
  }
});
