// Live Train Tracker — BR network
// Strategy:
//   1) Try reverse-engineered upstream sources (BRLLT, BR portal) for real GPS.
//   2) Fall back to schedule-based AI estimator using OSM station coordinates.
//   3) Optional Lovable AI narration in Bangla.

import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

// ---------- Station coordinates (OSM / public data) ----------
const STATION_COORDS: Record<string, [number, number]> = {
  "Dhaka (Kamalapur)": [23.7325, 90.4262],
  "Dhaka (Bimanbandar)": [23.8513, 90.4006],
  "Joydebpur": [23.9999, 90.4203],
  "Tangail": [24.2513, 89.9167],
  "Bangabandhu Setu E": [24.4014, 89.8086],
  "Sirajganj": [24.4534, 89.7007],
  "Ishwardi": [24.1333, 89.0667],
  "Natore": [24.4206, 88.9897],
  "Abdulpur": [24.2667, 88.8833],
  "Rajshahi": [24.3636, 88.6241],
  "Chapainawabganj": [24.5965, 88.2775],
  "Mymensingh": [24.7471, 90.4203],
  "Jamalpur": [24.9375, 89.9375],
  "Dewanganj": [25.1167, 89.7],
  "Bhairab Bazar": [24.0533, 90.9786],
  "Brahmanbaria": [23.9571, 91.1119],
  "Akhaura": [23.8667, 91.2167],
  "Cumilla": [23.4607, 91.1809],
  "Feni": [23.0159, 91.3976],
  "Chattogram": [22.3475, 91.8123],
  "Cox's Bazar": [21.4272, 92.0058],
  "Sylhet": [24.8949, 91.8687],
  "Kulaura": [24.5333, 92.05],
  "Srimangal": [24.3081, 91.7297],
  "Khulna": [22.8456, 89.5403],
  "Jessore": [23.1681, 89.2086],
  "Faridpur": [23.6, 89.85],
  "Pabna": [24.0064, 89.2372],
  "Bogura": [24.8465, 89.3776],
  "Parbatipur": [25.6592, 88.9261],
  "Saidpur": [25.7747, 88.8939],
  "Dinajpur": [25.6217, 88.6354],
  "Rangpur": [25.7439, 89.2752],
  "Lalmonirhat": [25.9167, 89.45],
  "Thakurgaon": [26.0333, 88.4667],
  "Kishoreganj": [24.4333, 90.7833],
  "Mohanganj": [24.85, 90.9667],
  "Narsingdi": [23.9322, 90.715],
};

// Route stop sequences (with departure offsets in minutes from origin)
type Stop = { station: string; offset: number };
const ROUTES: Record<string, Stop[]> = {
  // Dhaka -> Chattogram
  "Dhaka (Kamalapur)|Chattogram": [
    { station: "Dhaka (Kamalapur)", offset: 0 },
    { station: "Dhaka (Bimanbandar)", offset: 25 },
    { station: "Bhairab Bazar", offset: 90 },
    { station: "Brahmanbaria", offset: 130 },
    { station: "Akhaura", offset: 150 },
    { station: "Cumilla", offset: 200 },
    { station: "Feni", offset: 260 },
    { station: "Chattogram", offset: 320 },
  ],
  "Dhaka (Kamalapur)|Cox's Bazar": [
    { station: "Dhaka (Kamalapur)", offset: 0 },
    { station: "Dhaka (Bimanbandar)", offset: 25 },
    { station: "Bhairab Bazar", offset: 90 },
    { station: "Akhaura", offset: 150 },
    { station: "Cumilla", offset: 200 },
    { station: "Feni", offset: 260 },
    { station: "Chattogram", offset: 330 },
    { station: "Cox's Bazar", offset: 525 },
  ],
  "Dhaka (Kamalapur)|Sylhet": [
    { station: "Dhaka (Kamalapur)", offset: 0 },
    { station: "Dhaka (Bimanbandar)", offset: 25 },
    { station: "Bhairab Bazar", offset: 95 },
    { station: "Brahmanbaria", offset: 140 },
    { station: "Akhaura", offset: 160 },
    { station: "Srimangal", offset: 280 },
    { station: "Kulaura", offset: 340 },
    { station: "Sylhet", offset: 410 },
  ],
  "Dhaka (Kamalapur)|Rajshahi": [
    { station: "Dhaka (Kamalapur)", offset: 0 },
    { station: "Dhaka (Bimanbandar)", offset: 25 },
    { station: "Joydebpur", offset: 50 },
    { station: "Tangail", offset: 110 },
    { station: "Bangabandhu Setu E", offset: 145 },
    { station: "Sirajganj", offset: 175 },
    { station: "Ishwardi", offset: 230 },
    { station: "Natore", offset: 280 },
    { station: "Abdulpur", offset: 310 },
    { station: "Rajshahi", offset: 350 },
  ],
  "Dhaka (Kamalapur)|Khulna": [
    { station: "Dhaka (Kamalapur)", offset: 0 },
    { station: "Joydebpur", offset: 50 },
    { station: "Tangail", offset: 110 },
    { station: "Bangabandhu Setu E", offset: 145 },
    { station: "Ishwardi", offset: 240 },
    { station: "Pabna", offset: 280 },
    { station: "Jessore", offset: 460 },
    { station: "Khulna", offset: 565 },
  ],
  "Dhaka (Kamalapur)|Dinajpur": [
    { station: "Dhaka (Kamalapur)", offset: 0 },
    { station: "Joydebpur", offset: 50 },
    { station: "Bangabandhu Setu E", offset: 150 },
    { station: "Ishwardi", offset: 240 },
    { station: "Natore", offset: 290 },
    { station: "Bogura", offset: 360 },
    { station: "Parbatipur", offset: 480 },
    { station: "Dinajpur", offset: 540 },
  ],
  "Dhaka (Kamalapur)|Rangpur": [
    { station: "Dhaka (Kamalapur)", offset: 0 },
    { station: "Joydebpur", offset: 50 },
    { station: "Bangabandhu Setu E", offset: 150 },
    { station: "Ishwardi", offset: 240 },
    { station: "Natore", offset: 290 },
    { station: "Bogura", offset: 360 },
    { station: "Parbatipur", offset: 480 },
    { station: "Saidpur", offset: 510 },
    { station: "Rangpur", offset: 595 },
  ],
  "Dhaka (Kamalapur)|Dewanganj": [
    { station: "Dhaka (Kamalapur)", offset: 0 },
    { station: "Joydebpur", offset: 50 },
    { station: "Mymensingh", offset: 175 },
    { station: "Jamalpur", offset: 240 },
    { station: "Dewanganj", offset: 295 },
  ],
  "Dhaka (Kamalapur)|Kishoreganj": [
    { station: "Dhaka (Kamalapur)", offset: 0 },
    { station: "Bhairab Bazar", offset: 105 },
    { station: "Kishoreganj", offset: 225 },
  ],
  "Dhaka (Kamalapur)|Mohanganj": [
    { station: "Dhaka (Kamalapur)", offset: 0 },
    { station: "Joydebpur", offset: 50 },
    { station: "Mymensingh", offset: 175 },
    { station: "Mohanganj", offset: 370 },
  ],
};

// Train schedule (subset, mirrored from frontend)
type Train = { name: string; number: string; from: string; to: string; depart: string; arrive: string; off: string };
const TRAINS: Train[] = [
  { name: "Subarna Express", number: "701/702", from: "Dhaka (Kamalapur)", to: "Chattogram", depart: "16:30", arrive: "21:50", off: "Monday" },
  { name: "Sonar Bangla Express", number: "787/788", from: "Dhaka (Kamalapur)", to: "Chattogram", depart: "07:00", arrive: "12:20", off: "Tuesday" },
  { name: "Mahanagar Provati", number: "704", from: "Dhaka (Kamalapur)", to: "Chattogram", depart: "07:45", arrive: "13:55", off: "None" },
  { name: "Mahanagar Express", number: "722", from: "Dhaka (Kamalapur)", to: "Chattogram", depart: "21:20", arrive: "04:50", off: "Sunday" },
  { name: "Turna Express", number: "742", from: "Dhaka (Kamalapur)", to: "Chattogram", depart: "23:00", arrive: "06:20", off: "None" },
  { name: "Cox's Bazar Express", number: "813/814", from: "Dhaka (Kamalapur)", to: "Cox's Bazar", depart: "22:30", arrive: "07:20", off: "Tuesday" },
  { name: "Parjatak Express", number: "815/816", from: "Dhaka (Kamalapur)", to: "Cox's Bazar", depart: "06:15", arrive: "15:00", off: "Sunday" },
  { name: "Parabat Express", number: "709/710", from: "Dhaka (Kamalapur)", to: "Sylhet", depart: "06:30", arrive: "13:00", off: "Tuesday" },
  { name: "Joyantika Express", number: "717/718", from: "Dhaka (Kamalapur)", to: "Sylhet", depart: "11:15", arrive: "19:00", off: "None" },
  { name: "Upaban Express", number: "739/740", from: "Dhaka (Kamalapur)", to: "Sylhet", depart: "20:30", arrive: "05:00", off: "Wednesday" },
  { name: "Kalni Express", number: "773/774", from: "Dhaka (Kamalapur)", to: "Sylhet", depart: "15:00", arrive: "21:30", off: "Friday" },
  { name: "Sundarban Express", number: "725/726", from: "Dhaka (Kamalapur)", to: "Khulna", depart: "08:15", arrive: "17:40", off: "Tuesday" },
  { name: "Chitra Express", number: "763/764", from: "Dhaka (Kamalapur)", to: "Khulna", depart: "19:00", arrive: "03:40", off: "Monday" },
  { name: "Banalata Express", number: "791/792", from: "Dhaka (Kamalapur)", to: "Rajshahi", depart: "13:30", arrive: "19:30", off: "Friday" },
  { name: "Silk City Express", number: "753/754", from: "Dhaka (Kamalapur)", to: "Rajshahi", depart: "14:40", arrive: "20:30", off: "Sunday" },
  { name: "Padma Express", number: "759/760", from: "Dhaka (Kamalapur)", to: "Rajshahi", depart: "23:00", arrive: "04:30", off: "Tuesday" },
  { name: "Dhumketu Express", number: "769/770", from: "Dhaka (Kamalapur)", to: "Rajshahi", depart: "06:00", arrive: "11:40", off: "Saturday" },
  { name: "Rangpur Express", number: "771/772", from: "Dhaka (Kamalapur)", to: "Rangpur", depart: "09:10", arrive: "19:05", off: "Sunday" },
  { name: "Drutajan Express", number: "757/758", from: "Dhaka (Kamalapur)", to: "Dinajpur", depart: "20:00", arrive: "05:55", off: "Wednesday" },
  { name: "Ekota Express", number: "705/706", from: "Dhaka (Kamalapur)", to: "Dinajpur", depart: "10:10", arrive: "20:05", off: "Tuesday" },
  { name: "Tista Express", number: "707/708", from: "Dhaka (Kamalapur)", to: "Dewanganj", depart: "07:30", arrive: "12:25", off: "Monday" },
  { name: "Brahmaputra Express", number: "743/744", from: "Dhaka (Kamalapur)", to: "Dewanganj", depart: "18:00", arrive: "23:15", off: "None" },
  { name: "Egarosindhur Provati", number: "737", from: "Dhaka (Kamalapur)", to: "Kishoreganj", depart: "07:15", arrive: "11:00", off: "Wednesday" },
  { name: "Mohanganj Express", number: "789/790", from: "Dhaka (Kamalapur)", to: "Mohanganj", depart: "14:20", arrive: "20:30", off: "Monday" },
];

// ---------- Helpers ----------
const BD_OFFSET_MIN = 6 * 60; // BST UTC+6

function nowBdMinutes(): number {
  const d = new Date();
  const utcMin = d.getUTCHours() * 60 + d.getUTCMinutes();
  return (utcMin + BD_OFFSET_MIN) % (24 * 60);
}

function parseHHMM(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function interpolate(a: [number, number], b: [number, number], t: number): [number, number] {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
}

// Estimate position for a train at given time
function estimatePosition(train: Train, nowMin: number) {
  const route = ROUTES[`${train.from}|${train.to}`];
  if (!route) return null;

  const dep = parseHHMM(train.depart);
  const arr = parseHHMM(train.arrive);
  let elapsed = nowMin - dep;
  if (arr < dep) {
    // overnight
    if (nowMin < dep && nowMin <= arr) elapsed = nowMin + (24 * 60 - dep);
  }
  if (elapsed < -30) {
    return { status: "scheduled", message: `Departs at ${train.depart}`, coord: STATION_COORDS[train.from] || null, nextStation: train.from, progress: 0 };
  }
  if (elapsed < 0) {
    return { status: "boarding", message: `Boarding at ${train.from}`, coord: STATION_COORDS[train.from] || null, nextStation: train.from, progress: 0 };
  }

  const totalDuration = route[route.length - 1].offset;
  if (elapsed > totalDuration + 30) {
    return { status: "arrived", message: `Reached ${train.to}`, coord: STATION_COORDS[train.to] || null, nextStation: train.to, progress: 1 };
  }

  // Find segment
  for (let i = 0; i < route.length - 1; i++) {
    const a = route[i], b = route[i + 1];
    if (elapsed >= a.offset && elapsed <= b.offset) {
      const segT = (elapsed - a.offset) / (b.offset - a.offset);
      const ca = STATION_COORDS[a.station];
      const cb = STATION_COORDS[b.station];
      if (!ca || !cb) continue;
      const coord = interpolate(ca, cb, segT);
      const minsToNext = b.offset - elapsed;
      return {
        status: "running",
        coord,
        progress: elapsed / totalDuration,
        lastStation: a.station,
        nextStation: b.station,
        minsToNext,
        message: `Between ${a.station} and ${b.station} — ${minsToNext} min to next stop`,
      };
    }
  }
  return null;
}

// ---------- Upstream reverse-engineering attempts ----------
async function tryBrllt(trainNumber: string): Promise<any | null> {
  const candidates = [
    `https://brllt.netlify.app/api/train/${encodeURIComponent(trainNumber)}`,
    `https://brllt.netlify.app/.netlify/functions/train?number=${encodeURIComponent(trainNumber)}`,
    `https://api.brllt.com/v1/train/${encodeURIComponent(trainNumber)}`,
  ];
  for (const url of candidates) {
    try {
      const r = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Linux; Android 13) JNIL/1.0",
          "Accept": "application/json",
        },
        signal: AbortSignal.timeout(4000),
      });
      if (r.ok) {
        const ct = r.headers.get("content-type") || "";
        if (ct.includes("json")) {
          const data = await r.json();
          if (data && (data.latitude || data.lat || data.location)) {
            return { source: "brllt", data };
          }
        }
      }
    } catch (_) { /* swallow */ }
  }
  return null;
}

async function tryBrPortal(trainNumber: string): Promise<any | null> {
  // Bangladesh Railway journey status (paid SMS gateway leak attempt)
  try {
    const url = `https://railway.gov.bd/site/page/train-location/${encodeURIComponent(trainNumber)}`;
    const r = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0", "Accept": "text/html" },
      signal: AbortSignal.timeout(4000),
    });
    if (r.ok) {
      const text = await r.text();
      const latMatch = text.match(/lat(?:itude)?["':\s]+(-?\d+\.\d+)/i);
      const lngMatch = text.match(/lng|lon(?:gitude)?["':\s]+(-?\d+\.\d+)/i);
      if (latMatch && lngMatch) {
        return { source: "br_portal", data: { lat: parseFloat(latMatch[1]), lng: parseFloat(lngMatch[1]) } };
      }
    }
  } catch (_) { /* swallow */ }
  return null;
}

// ---------- AI narration ----------
async function narrate(state: any, train: Train, isBn: boolean): Promise<string> {
  const key = Deno.env.get("LOVABLE_API_KEY");
  if (!key) return "";
  try {
    const prompt = isBn
      ? `তুমি একজন বাংলাদেশ রেলওয়ের লাইভ ট্রেন এনাউন্সার। একটি ছোট ১-২ বাক্যের বাংলা update দাও:\nTrain: ${train.name} (${train.number})\nStatus: ${state.status}\nDetails: ${state.message || ""}\nProgress: ${(state.progress ? Math.round(state.progress * 100) : 0)}%\nফরম্যাট: বন্ধুসুলভ, সংক্ষিপ্ত, ইমোজি ছাড়া।`
      : `You are a live train announcer for Bangladesh Railway. Give 1-2 short sentences:\nTrain: ${train.name} (${train.number})\nStatus: ${state.status}\nDetails: ${state.message || ""}\nProgress: ${(state.progress ? Math.round(state.progress * 100) : 0)}%`;
    const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${key}` },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 120,
      }),
      signal: AbortSignal.timeout(6000),
    });
    if (!r.ok) return "";
    const j = await r.json();
    return j.choices?.[0]?.message?.content?.trim() || "";
  } catch {
    return "";
  }
}

// ---------- Main ----------
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const url = new URL(req.url);
    const lang = url.searchParams.get("lang") || "en";
    const isBn = lang === "bn";
    const onlyTrain = url.searchParams.get("train"); // optional train number filter

    const nowMin = nowBdMinutes();
    const today = new Date().toLocaleDateString("en-US", { weekday: "long", timeZone: "Asia/Dhaka" });

    const results: any[] = [];

    for (const t of TRAINS) {
      if (onlyTrain && !t.number.includes(onlyTrain)) continue;
      if (t.off !== "None" && t.off === today) continue;

      // Try live sources first (best-effort, non-blocking parallel)
      const liveNum = t.number.split("/")[0];
      const [brllt, brp] = await Promise.all([tryBrllt(liveNum), tryBrPortal(liveNum)]);
      const live = brllt || brp;

      let position: any;
      if (live?.data) {
        const lat = live.data.lat ?? live.data.latitude ?? live.data.location?.lat;
        const lng = live.data.lng ?? live.data.longitude ?? live.data.location?.lng;
        if (typeof lat === "number" && typeof lng === "number") {
          position = { status: "live", coord: [lat, lng], message: "Live GPS", source: live.source };
        }
      }
      if (!position) {
        position = estimatePosition(t, nowMin);
        if (position) position.source = "estimate";
      }
      if (!position) continue;

      results.push({
        name: t.name,
        number: t.number,
        from: t.from,
        to: t.to,
        depart: t.depart,
        arrive: t.arrive,
        ...position,
      });
    }

    // Narrate only when 1 train requested (avoid burning credits)
    if (onlyTrain && results[0]) {
      const t = TRAINS.find((x) => x.number === results[0].number)!;
      results[0].narration = await narrate(results[0], t, isBn);
    }

    return new Response(
      JSON.stringify({
        generatedAt: new Date().toISOString(),
        bdTime: `${String(Math.floor(nowMin / 60)).padStart(2, "0")}:${String(nowMin % 60).padStart(2, "0")}`,
        count: results.length,
        trains: results,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
