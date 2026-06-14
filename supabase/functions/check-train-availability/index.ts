// Runs every minute via cron, but performs a BURST of 4 internal checks spaced ~12s apart
// so users effectively get sub-minute (≈15s) detection of newly opened seats.
//
// For each active train alert subscription:
// 1. Queries the official Bangladesh Railway eticket search endpoint for the user's
//    chosen origin → destination AND for known intermediate boarding stations along the
//    same route (e.g. a Rajshahi→Dhaka subscriber is also notified when seats appear at
//    Abdulpur→Dhaka, Ishwardi→Dhaka, Natore→Dhaka, Joydebpur→Dhaka, etc.).
// 2. If seats are available (> 0) and we haven't already notified in the last 90 sec,
//    inserts a row into train_alert_notifications (realtime → browser push) AND queues
//    SMS/WhatsApp via scheduled_messages when chosen.
// 3. The message clearly states the actual boarding station so users know where to catch
//    the train (the train will still stop at their preferred origin if it's on the route).

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const BR_SEARCH_URL = "https://railspaapi.shohoz.com/v1.0/web/bookings/search-trips-v2";

const BOOKING_WINDOW_DAYS = 10;

// Map our display station names → current Bangladesh Railway eTicket city values
const STATION_MAP: Record<string, string> = {
  "Dhaka (Kamalapur)": "Dhaka",
  "Dhaka (Bimanbandar)": "Biman_Bandar",
  "Dhaka (Tejgaon)": "Dhaka",
  "Chattogram": "Chattogram",
  "Sylhet": "Sylhet",
  "Khulna": "Khulna",
  "Rajshahi": "Rajshahi",
  "Rangpur": "Rangpur",
  "Dinajpur": "Dinajpur",
  "Cox's Bazar": "Coxs_Bazar",
  "Mymensingh": "Mymensingh",
  "Jamalpur": "Jamalpur",
  "Bogura": "Bogura",
  "Cumilla": "Cumilla",
  "Brahmanbaria": "B_Baria",
  "Akhaura": "Akhaura",
  "Ishwardi": "Ishwardi_By_Pass",
  "Pabna": "Pabna",
  "Chapainawabganj": "Chapai_Nawabganj",
  "Joydebpur": "Joydebpur",
  "Tangail": "Tangail",
  "Saidpur": "Saidpur",
  "Parbatipur": "Parbatipur",
  "Lalmonirhat": "Lalmonirhat",
  // Intermediate stations along major routes
  "Abdulpur": "Abdulpur",
  "Natore": "Natore",
  "Chatmohar": "Chatmohar",
  "Bheramara": "Bheramara",
  "Poradaha": "Poradaha",
  "Jessore": "Jessore",
  "Kushtia Court": "Kushtia Court",
  "Faridpur": "Faridpur",
  "Feni": "Feni",
  "Bhairab Bazar": "Bhairab_Bazar",
  "Narsingdi": "Narsingdi",
  "Srimangal": "Srimangal",
  "Maulvibazar": "Maulvi Bazar",
  "Joypurhat": "Joypurhat",
  "Santahar": "Santahar",
  "Sirajganj Bazar": "Sirajganj_Bazar",
  "Bangabandhu Bridge East": "B_B_East",
};

function mapStation(name: string): string {
  return STATION_MAP[name] ?? name;
}

// Intermediate origin stations between an actual origin → destination.
// When a user subscribes for A→B, we also check each "between" station → B and notify
// them so they can board from a closer/different station if seats open there.
const ROUTE_INTERMEDIATES: Record<string, string[]> = {
  // → Dhaka (Kamalapur)
  "Rajshahi|Dhaka (Kamalapur)": ["Abdulpur", "Ishwardi", "Pabna", "Natore", "Chatmohar", "Tangail", "Joydebpur"],
  "Chattogram|Dhaka (Kamalapur)": ["Feni", "Cumilla", "Akhaura", "Brahmanbaria", "Bhairab Bazar", "Narsingdi"],
  "Sylhet|Dhaka (Kamalapur)": ["Srimangal", "Maulvibazar", "Brahmanbaria", "Akhaura", "Bhairab Bazar"],
  "Khulna|Dhaka (Kamalapur)": ["Jessore", "Poradaha", "Bheramara", "Ishwardi", "Faridpur"],
  "Rangpur|Dhaka (Kamalapur)": ["Parbatipur", "Joypurhat", "Santahar", "Natore", "Ishwardi", "Joydebpur"],
  "Dinajpur|Dhaka (Kamalapur)": ["Parbatipur", "Saidpur", "Santahar", "Natore", "Ishwardi"],
  "Cox's Bazar|Dhaka (Kamalapur)": ["Chattogram", "Feni", "Cumilla", "Akhaura"],
  "Mymensingh|Dhaka (Kamalapur)": ["Jamalpur", "Joydebpur"],
  // Dhaka → (reverse)
  "Dhaka (Kamalapur)|Rajshahi": ["Joydebpur", "Tangail", "Chatmohar", "Natore", "Ishwardi", "Abdulpur"],
  "Dhaka (Kamalapur)|Chattogram": ["Narsingdi", "Bhairab Bazar", "Brahmanbaria", "Akhaura", "Cumilla", "Feni"],
  "Dhaka (Kamalapur)|Sylhet": ["Bhairab Bazar", "Akhaura", "Brahmanbaria", "Maulvibazar", "Srimangal"],
  "Dhaka (Kamalapur)|Khulna": ["Faridpur", "Ishwardi", "Bheramara", "Poradaha", "Jessore"],
  "Dhaka (Kamalapur)|Rangpur": ["Joydebpur", "Ishwardi", "Natore", "Santahar", "Joypurhat", "Parbatipur"],
  "Dhaka (Kamalapur)|Dinajpur": ["Ishwardi", "Natore", "Santahar", "Parbatipur", "Saidpur"],
  "Dhaka (Kamalapur)|Cox's Bazar": ["Akhaura", "Cumilla", "Feni", "Chattogram"],
};

function intermediatesFor(from: string, to: string): string[] {
  return ROUTE_INTERMEDIATES[`${from}|${to}`] ?? [];
}

async function checkRoute(from: string, to: string, date: string) {
  const d = new Date(date + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const max = new Date(today);
  max.setDate(max.getDate() + BOOKING_WINDOW_DAYS - 1);
  if (d < today || d > max) return { ok: false, status: 400, trips: [] as any[], error: "Journey date is outside BR 10-day booking window" };
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const formatted = `${String(d.getDate()).padStart(2,"0")}-${months[d.getMonth()]}-${d.getFullYear()}`;
  const url = `${BR_SEARCH_URL}?from_city=${encodeURIComponent(mapStation(from))}&to_city=${encodeURIComponent(mapStation(to))}&date_of_journey=${encodeURIComponent(formatted)}&seat_class=S_CHAIR`;
  try {
    const res = await fetch(url, {
      headers: {
        "Accept": "application/json",
        "User-Agent": "Mozilla/5.0 (compatible; JnilBD-TrainAlert/1.0)",
      },
    });
    if (!res.ok) return { ok: false, status: res.status, trips: [] as any[] };
    const data = await res.json().catch(() => ({}));
    const trips = (data?.data?.trains ?? data?.data ?? []) as any[];
    return { ok: true, status: 200, trips: Array.isArray(trips) ? trips : [] };
  } catch (e) {
    return { ok: false, status: 0, trips: [] as any[], error: e instanceof Error ? e.message : String(e) };
  }
}

function totalSeats(trip: any): number {
  const types = trip?.seat_types ?? trip?.seatTypes ?? trip?.classes ?? [];
  if (!Array.isArray(types)) return 0;
  let total = 0;
  for (const s of types) {
    const n = Number(s?.seat_counts?.online ?? s?.online ?? s?.available_seats ?? 0);
    if (Number.isFinite(n)) total += n;
  }
  return total;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function runOneCycle(supabase: any) {
  const today = new Date().toISOString().slice(0, 10);
  const { data: subs, error } = await supabase
    .from("train_alert_subscribers")
    .select("*")
    .eq("active", true)
    .gte("journey_date", today)
    .limit(200);
  if (error) return { error: error.message, notified: 0 };

  // Build a set of unique (from, to, date) routes to query (origin + intermediates)
  type RouteKey = string; // `${from}|${to}|${date}`
  const routesNeeded = new Set<RouteKey>();
  const subRoutes = new Map<string, Array<{ from: string; to: string; date: string; isIntermediate: boolean }>>();

  for (const s of subs ?? []) {
    const list: Array<{ from: string; to: string; date: string; isIntermediate: boolean }> = [];
    list.push({ from: s.from_station, to: s.to_station, date: s.journey_date, isIntermediate: false });
    for (const im of intermediatesFor(s.from_station, s.to_station)) {
      list.push({ from: im, to: s.to_station, date: s.journey_date, isIntermediate: true });
    }
    subRoutes.set(s.id, list);
    for (const r of list) routesNeeded.add(`${r.from}|${r.to}|${r.date}`);
  }

  // Fetch all routes in parallel (one BR API call per unique route)
  const routeResults = new Map<RouteKey, Awaited<ReturnType<typeof checkRoute>>>();
  await Promise.all(
    Array.from(routesNeeded).map(async (key) => {
      const [f, t, d] = key.split("|");
      const r = await checkRoute(f, t, d);
      routeResults.set(key, r);
    }),
  );

  const COOLDOWN_MS = 90 * 1000; // 90s — burst-mode safe, avoids duplicate spam
  const now = Date.now();
  let notifiedCount = 0;

  // Update last_checked_at for all subs
  if ((subs ?? []).length > 0) {
    await supabase
      .from("train_alert_subscribers")
      .update({ last_checked_at: new Date().toISOString() })
      .in("id", (subs as any[]).map((s) => s.id));
  }

  for (const sub of subs ?? []) {
    if (sub.last_notified_at && now - new Date(sub.last_notified_at).getTime() < COOLDOWN_MS) continue;

    const routes = subRoutes.get(sub.id) ?? [];
    // Aggregate available trips across origin + intermediates
    const found: Array<{ from: string; to: string; trip: any; seats: number; isIntermediate: boolean }> = [];
    for (const r of routes) {
      const res = routeResults.get(`${r.from}|${r.to}|${r.date}`);
      if (!res || !res.ok) continue;
      for (const trip of res.trips) {
        const seats = totalSeats(trip);
        if (seats > 0) found.push({ from: r.from, to: r.to, trip, seats, isIntermediate: r.isIntermediate });
      }
    }

    // Optional train_number filter
    const matched = sub.train_number
      ? found.filter((x) => String(x.trip?.train_model ?? x.trip?.trip_number ?? "").includes(sub.train_number!))
      : found;
    if (matched.length === 0) continue;

    // Build a friendly message — group by boarding station
    const byOrigin = new Map<string, { count: number; seats: number }>();
    for (const m of matched) {
      const cur = byOrigin.get(m.from) ?? { count: 0, seats: 0 };
      cur.count += 1; cur.seats += m.seats;
      byOrigin.set(m.from, cur);
    }
    const totalSeatsAll = matched.reduce((a, b) => a + b.seats, 0);
    const first = matched[0];
    const trainName = first.trip?.trip_number ?? first.trip?.train_model ?? "Train";
    const trainNo = first.trip?.train_model ?? first.trip?.trip_number ?? "";

    const originsLine = Array.from(byOrigin.entries())
      .map(([o, v]) => `${o} (~${v.seats})`)
      .join(", ");

    const msg = sub.language === "bn"
      ? `🚆 টিকেট পাওয়া যাচ্ছে! গন্তব্য: ${sub.to_station} (${sub.journey_date}). বোর্ডিং স্টেশন: ${originsLine}. মোট ~${totalSeatsAll}টি সিট। এখনই বুক করুন: https://eticket.railway.gov.bd`
      : `🚆 Tickets available! Destination: ${sub.to_station} (${sub.journey_date}). Boarding: ${originsLine}. Total ~${totalSeatsAll} seats. Book now: https://eticket.railway.gov.bd`;

    // 1) Realtime browser notification
    await supabase.from("train_alert_notifications").insert({
      subscriber_id: sub.id,
      phone: sub.phone,
      train_name: String(trainName),
      train_number: String(trainNo),
      from_station: Array.from(byOrigin.keys()).join(", "),
      to_station: sub.to_station,
      journey_date: sub.journey_date,
      seats_available: totalSeatsAll,
      seat_class: sub.seat_class,
      message: msg,
    });

    // 2) Queue SMS/WhatsApp
    if ((sub.channel === "sms" || sub.channel === "whatsapp") && sub.user_id) {
      await supabase.from("scheduled_messages").insert({
        user_id: sub.user_id,
        recipient_name: sub.name ?? "Train Alert",
        recipient_phone: sub.phone,
        channel: sub.channel,
        message: msg,
        send_at: new Date().toISOString(),
        status: "pending",
      });
    }

    await supabase
      .from("train_alert_subscribers")
      .update({ last_notified_at: new Date().toISOString(), last_seats_found: totalSeatsAll })
      .eq("id", sub.id);

    notifiedCount += 1;
  }

  return { routesChecked: routesNeeded.size, subs: (subs ?? []).length, notified: notifiedCount };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  // Burst mode: 4 cycles spaced 12s apart inside one minute → ~15s detection latency.
  // Allow callers to disable burst with ?burst=0 (e.g. for the on-subscribe immediate ping).
  const url = new URL(req.url);
  const burst = url.searchParams.get("burst") !== "0";
  const cycles = burst ? 4 : 1;
  const gapMs = 12_000;

  const results: any[] = [];
  for (let i = 0; i < cycles; i++) {
    const r = await runOneCycle(supabase);
    results.push({ cycle: i + 1, ...r });
    if (i < cycles - 1) await sleep(gapMs);
  }

  return new Response(JSON.stringify({ cycles, results }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
