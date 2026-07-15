// MAG / Stalker portal client — lists channels and resolves playback URLs
// for a MAG-style IPTV portal (Ministra/Stalker middleware).
//
// Endpoints:
//   GET ?action=list&portal=<base>&mac=<mac>
//     -> { channels: [{ id, name, logo, group, cmd }] }
//   GET ?action=resolve&portal=<base>&mac=<mac>&cmd=<cmd>
//     -> { url: "http://..." }  (raw stream URL, meant to be piped through /stream-proxy)

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
  "Access-Control-Allow-Headers": "*",
};

const UA =
  "Mozilla/5.0 (QtEmbedded; U; Linux; C) AppleWebKit/533.3 (KHTML, like Gecko) MAG200 stbapp ver: 4 rev: 250 Safari/533.3";

function headers(mac: string, token?: string, portal?: string) {
  const h: Record<string, string> = {
    "User-Agent": UA,
    "Accept": "*/*",
    "X-User-Agent": "Model: MAG250; Link: WiFi",
    "Cookie": `mac=${mac}; stb_lang=en; timezone=Asia/Dhaka`,
  };
  if (token) h["Authorization"] = `Bearer ${token}`;
  if (portal) h["Referer"] = portal;
  return h;
}

async function handshake(portalBase: string, mac: string): Promise<string> {
  const url = `${portalBase}/portal.php?type=stb&action=handshake&token=&JsHttpRequest=1-xml`;
  const r = await fetch(url, { headers: headers(mac, undefined, portalBase) });
  const j = await r.json();
  const token = j?.js?.token;
  if (!token) throw new Error("handshake failed — no token");
  // profile
  await fetch(`${portalBase}/portal.php?type=stb&action=get_profile&JsHttpRequest=1-xml`, {
    headers: headers(mac, token, portalBase),
  }).catch(() => {});
  return token;
}

async function listChannels(portalBase: string, mac: string) {
  const token = await handshake(portalBase, mac);
  const url = `${portalBase}/portal.php?type=itv&action=get_all_channels&JsHttpRequest=1-xml`;
  const r = await fetch(url, { headers: headers(mac, token, portalBase) });
  const j = await r.json();
  const rows: any[] = j?.js?.data || [];

  // genres for group names
  let genreMap: Record<string, string> = {};
  try {
    const gr = await fetch(`${portalBase}/portal.php?type=itv&action=get_genres&JsHttpRequest=1-xml`, {
      headers: headers(mac, token, portalBase),
    });
    const gj = await gr.json();
    for (const g of (gj?.js || [])) genreMap[String(g.id)] = String(g.title || "");
  } catch {}

  const channels = rows.map((r) => ({
    id: String(r.id ?? r.number ?? crypto.randomUUID()),
    name: String(r.name || r.tv_id || `Channel ${r.number ?? ""}`).trim(),
    logo: r.logo ? (String(r.logo).startsWith("http") ? r.logo : `${portalBase}/misc/logos/320/${r.logo}`) : null,
    group: genreMap[String(r.tv_genre_id)] || "General",
    cmd: String(r.cmd || ""),
  })).filter((c) => c.cmd);
  return channels;
}

async function resolveCmd(portalBase: string, mac: string, cmd: string): Promise<string> {
  const token = await handshake(portalBase, mac);
  const url = `${portalBase}/portal.php?type=itv&action=create_link&cmd=${encodeURIComponent(cmd)}&JsHttpRequest=1-xml`;
  const r = await fetch(url, { headers: headers(mac, token, portalBase) });
  const j = await r.json();
  const outCmd: string = j?.js?.cmd || cmd;
  // "ffmpeg http://..." or "http://..."
  const m = outCmd.match(/https?:\/\/\S+/);
  if (!m) throw new Error("no stream URL in cmd");
  return m[0];
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });
  const u = new URL(req.url);
  const action = u.searchParams.get("action") || "list";
  const portal = (u.searchParams.get("portal") || "").replace(/\/$/, "");
  const mac = u.searchParams.get("mac") || "";
  if (!portal || !mac) {
    return new Response(JSON.stringify({ error: "missing portal or mac" }), {
      status: 400, headers: { ...CORS, "Content-Type": "application/json" },
    });
  }
  try {
    if (action === "list") {
      const channels = await listChannels(portal, mac);
      return new Response(JSON.stringify({ channels }), {
        headers: { ...CORS, "Content-Type": "application/json" },
      });
    }
    if (action === "resolve") {
      const cmd = u.searchParams.get("cmd") || "";
      if (!cmd) return new Response(JSON.stringify({ error: "missing cmd" }), { status: 400, headers: { ...CORS, "Content-Type": "application/json" } });
      const url = await resolveCmd(portal, mac, cmd);
      return new Response(JSON.stringify({ url }), {
        headers: { ...CORS, "Content-Type": "application/json" },
      });
    }
    return new Response(JSON.stringify({ error: "unknown action" }), {
      status: 400, headers: { ...CORS, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 502, headers: { ...CORS, "Content-Type": "application/json" },
    });
  }
});
