// Runs every 2 minutes via cron. For each active train alert subscription:
// 1. Queries the official Bangladesh Railway eticket search endpoint
// 2. If seats are available (> 0) and we haven't already notified in the last 30 min,
//    inserts a row into train_alert_notifications (realtime-broadcast to subscriber)
//    and updates last_notified_at on the subscription.
// 3. Browser clients listen to realtime + show Notification API alerts (no cost).
// SMS/WhatsApp sending is queued via scheduled_messages so the existing
// send-scheduled-messages cron picks it up when Twilio is configured.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const BR_SEARCH_URL = "https://railspaapi.shohoz.com/v1.0/web/bookings/search-trips-v2";

// Map our display station names → BR API station codes
const STATION_MAP: Record<string, string> = {
  "Dhaka (Kamalapur)": "Dhaka",
  "Dhaka (Bimanbandar)": "Dhaka Airport",
  "Dhaka (Tejgaon)": "Tejgaon",
  "Chattogram": "Chattogram",
  "Sylhet": "Sylhet",
  "Khulna": "Khulna",
  "Rajshahi": "Rajshahi",
  "Rangpur": "Rangpur",
  "Dinajpur": "Dinajpur",
  "Cox's Bazar": "Cox's Bazar Icon",
  "Mymensingh": "Mymensingh",
  "Jamalpur": "Jamalpur",
  "Bogura": "Bogura",
  "Cumilla": "Cumilla",
  "Brahmanbaria": "B Baria",
  "Akhaura": "Akhaura",
  "Ishwardi": "Ishwardi By Pass",
  "Pabna": "Pabna",
  "Chapainawabganj": "Chapai Nawabganj",
  "Joydebpur": "Joydebpur",
  "Tangail": "Tangail",
  "Saidpur": "Saidpur",
  "Parbatipur": "Parbatipur",
  "Lalmonirhat": "Lalmonirhat",
};

function mapStation(name: string): string {
  return STATION_MAP[name] ?? name;
}

async function checkRoute(from: string, to: string, date: string) {
  // Date format BR API expects: DD-MMM-YYYY (e.g. 28-May-2026)
  const d = new Date(date + "T00:00:00");
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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const today = new Date().toISOString().slice(0, 10);

  // Only check upcoming subscriptions (journey_date >= today, active = true)
  const { data: subs, error } = await supabase
    .from("train_alert_subscribers")
    .select("*")
    .eq("active", true)
    .gte("journey_date", today)
    .limit(200);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Group subscribers by route+date to minimize API calls
  const groups = new Map<string, typeof subs>();
  for (const s of subs ?? []) {
    const key = `${s.from_station}|${s.to_station}|${s.journey_date}`;
    if (!groups.has(key)) groups.set(key, [] as any);
    groups.get(key)!.push(s);
  }

  const results: any[] = [];
  const COOLDOWN_MS = 3 * 60 * 1000; // re-notify after 3 min so users get a fresh ping if seats still open
  const now = Date.now();

  for (const [key, groupSubs] of groups.entries()) {
    const [from, to, date] = key.split("|");
    const r = await checkRoute(from, to, date);

    const availableTrips = r.trips
      .map((t) => ({ trip: t, seats: totalSeats(t) }))
      .filter((x) => x.seats > 0);

    // Update last_checked_at for all subs in group
    await supabase
      .from("train_alert_subscribers")
      .update({ last_checked_at: new Date().toISOString() })
      .in("id", groupSubs!.map((s: any) => s.id));

    if (availableTrips.length === 0) {
      results.push({ key, available: 0, status: r.status });
      continue;
    }

    for (const sub of groupSubs!) {
      // cooldown
      if (sub.last_notified_at && now - new Date(sub.last_notified_at).getTime() < COOLDOWN_MS) {
        continue;
      }
      // optional train_number filter
      const matched = sub.train_number
        ? availableTrips.filter((x) => String(x.trip?.train_model ?? x.trip?.trip_number ?? "").includes(sub.train_number!))
        : availableTrips;
      if (matched.length === 0) continue;

      const first = matched[0];
      const trainName = first.trip?.trip_number ?? first.trip?.train_model ?? "Train";
      const trainNo = first.trip?.train_model ?? first.trip?.trip_number ?? "";
      const totalAvail = matched.reduce((a, b) => a + b.seats, 0);

      const msg = (sub.language === "bn"
        ? `🚆 টিকেট পাওয়া যাচ্ছে! ${sub.from_station} → ${sub.to_station} (${sub.journey_date}). ${matched.length}টি ট্রেন, প্রায় ${totalAvail}টি সিট। এখনই বুক করুন: https://eticket.railway.gov.bd`
        : `🚆 Tickets available! ${sub.from_station} → ${sub.to_station} (${sub.journey_date}). ${matched.length} train(s), ~${totalAvail} seats. Book now: https://eticket.railway.gov.bd`);

      // 1) Insert notification (realtime to browser)
      await supabase.from("train_alert_notifications").insert({
        subscriber_id: sub.id,
        phone: sub.phone,
        train_name: String(trainName),
        train_number: String(trainNo),
        from_station: sub.from_station,
        to_station: sub.to_station,
        journey_date: sub.journey_date,
        seats_available: totalAvail,
        seat_class: sub.seat_class,
        message: msg,
      });

      // 2) Queue SMS/WhatsApp via scheduled_messages (sends when Twilio configured)
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

      // 3) Update sub
      await supabase
        .from("train_alert_subscribers")
        .update({
          last_notified_at: new Date().toISOString(),
          last_seats_found: totalAvail,
        })
        .eq("id", sub.id);

      results.push({ sub: sub.id, notified: true, seats: totalAvail });
    }
  }

  return new Response(JSON.stringify({ checked: groups.size, results }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
