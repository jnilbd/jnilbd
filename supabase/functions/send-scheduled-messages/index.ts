// Runs every minute via cron. Picks pending scheduled_messages whose send_at <= now()
// and sends them. If TWILIO_API_KEY + TWILIO_PHONE_FROM are configured, uses Twilio
// (SMS or WhatsApp). Otherwise marks them as 'ready' so the user can send via wa.me.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const TWILIO_GATEWAY = "https://connector-gateway.lovable.dev/twilio";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  const TWILIO_API_KEY = Deno.env.get("TWILIO_API_KEY");
  const TWILIO_FROM = Deno.env.get("TWILIO_PHONE_FROM"); // e.g. +14155552671
  const TWILIO_WHATSAPP_FROM = Deno.env.get("TWILIO_WHATSAPP_FROM"); // e.g. whatsapp:+14155238886
  const twilioReady = Boolean(LOVABLE_API_KEY && TWILIO_API_KEY && (TWILIO_FROM || TWILIO_WHATSAPP_FROM));

  const { data: due, error } = await supabase
    .from("scheduled_messages")
    .select("*")
    .eq("status", "pending")
    .lte("send_at", new Date().toISOString())
    .limit(50);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const results: Array<{ id: string; status: string; error?: string }> = [];

  for (const m of due ?? []) {
    if (!twilioReady) {
      // Mark "ready" so the frontend can offer wa.me link to user
      await supabase
        .from("scheduled_messages")
        .update({ status: "ready" })
        .eq("id", m.id);
      results.push({ id: m.id, status: "ready" });
      continue;
    }

    try {
      const isWhatsApp = m.channel === "whatsapp";
      const from = isWhatsApp ? TWILIO_WHATSAPP_FROM : TWILIO_FROM;
      if (!from) throw new Error(`No ${isWhatsApp ? "WhatsApp" : "SMS"} sender configured`);

      const to = isWhatsApp ? `whatsapp:${m.recipient_phone}` : m.recipient_phone;
      const body = new URLSearchParams({
        To: to,
        From: from,
        Body: m.message,
      });

      const res = await fetch(`${TWILIO_GATEWAY}/Messages.json`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "X-Connection-Api-Key": TWILIO_API_KEY!,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || `Twilio ${res.status}`);

      await supabase
        .from("scheduled_messages")
        .update({ status: "sent", sent_at: new Date().toISOString() })
        .eq("id", m.id);
      results.push({ id: m.id, status: "sent" });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      await supabase
        .from("scheduled_messages")
        .update({ status: "failed", error: msg })
        .eq("id", m.id);
      results.push({ id: m.id, status: "failed", error: msg });
    }
  }

  return new Response(JSON.stringify({ processed: results.length, results, twilioReady }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
