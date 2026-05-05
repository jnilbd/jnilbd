import { corsHeaders } from "npm:@supabase/supabase-js@2.95.0/cors";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { operator, topic, language } = await req.json();
    if (!operator || !topic) {
      return new Response(JSON.stringify({ error: "operator and topic required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");

    const lang = language === "bn" ? "Bangla (বাংলা)" : "English";
    const sys = `You are a Bangladesh telecom expert specializing in cheap/free internet packs from GP, Robi, Banglalink, Airtel, and Teletalk. You know all current social packs (Facebook, WhatsApp, Messenger, Imo, TikTok, YouTube), MB bonuses, night packs, student offers, MyGP/MyRobi/MyBL app exclusive deals, USSD codes, VPN/Handler tricks for using social pack data on any app, and emergency balance/MB loans. Always reply in ${lang}. Keep answers structured with clear headings, bullet points, exact USSD codes (like *121*1*4#), pack prices in BDT, validity, and step-by-step setup. Mention disclaimers about operator terms changing.`;

    const userPrompt = `Operator: ${operator.toUpperCase()}
Topic: ${topic}

Provide the most up-to-date guide (as of late 2025/2026) with:
1. **Available cheap/free/social packs** — name, price (BDT), MB/validity, what's included
2. **How to buy** — exact USSD code + app steps (MyGP/MyRobi/MyBL/Nagad/bKash)
3. **Setup on phone** — APN settings, VPN/Handler config if needed (mention ProxyDroid, HTTP Injector, OpenVPN for using social pack on full internet — for educational purposes)
4. **Tips & tricks** — emergency MB loan codes, night packs, student offers, referral bonuses
5. **Warnings** — operator T&C, throttling, what to avoid

Use markdown. Be accurate, practical, and Bangladesh-focused.`;

    const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "system", content: sys }, { role: "user", content: userPrompt }],
      }),
    });

    if (r.status === 429) return new Response(JSON.stringify({ error: "Rate limit, try again shortly" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    if (r.status === 402) return new Response(JSON.stringify({ error: "AI credits exhausted" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    if (!r.ok) throw new Error(`AI ${r.status}`);

    const j = await r.json();
    const content = j.choices?.[0]?.message?.content || "";
    return new Response(JSON.stringify({ content }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String((e as Error).message || e) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
