import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { query, language } = await req.json();
    if (!query || typeof query !== "string" || query.trim().length < 2) {
      return new Response(JSON.stringify({ error: "Invalid query" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");

    const isBn = language === "bn";
    const sys = `You are a Bangladesh market price expert covering: solar equipment (panels, batteries, inverters, charge controllers, IPS, UPS), electronics (TV, AC, fridge, fan, washing machine, motors, pumps, wires, switches), home appliances, mobile/laptop, tools, generators and more. Sources you reference: Solartech BD, Rahimafrooz, Sherpa Power, Walton, Singer, Transcom, Best Electronics, Star Tech, Ryans, Daraz, Pickaboo, local market wholesale (Nawabpur, Bongshal, Stadium Market).

Reply ONLY in ${isBn ? "Bengali (বাংলা)" : "English"}. Be specific with brand + model + approximate BDT price ranges (low/medium/high tier). Mention warranty, availability and best place to buy. Keep answer concise and well structured with markdown.`;

    const userMsg = `Item / equipment user is asking about: "${query}"

Provide:
1. **৩-৫টি ব্র্যান্ড/মডেল অপশন** with approximate current BDT price range (লো-মিড-হাই টিয়ার)
2. **স্পেসিফিকেশন/ক্যাপাসিটি** wise breakdown if applicable (e.g., for solar panel: per watt price; battery: per Ah; AC: per ton)
3. **ওয়ারেন্টি ও সার্ভিস**
4. **কোথায় কিনবেন** — top 2-3 trusted shops/sites in Bangladesh
5. **💡 টিপস** — কেনার আগে কী দেখবেন, কীভাবে দাম কমাতে পারবেন

If item is unclear, list common variations. Use markdown headings (##), bullet points, and BDT (৳) format.`;

    const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: sys },
          { role: "user", content: userMsg },
        ],
      }),
    });

    if (!r.ok) {
      const t = await r.text();
      const status = r.status === 429 || r.status === 402 ? r.status : 500;
      return new Response(JSON.stringify({ error: t }), {
        status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const data = await r.json();
    const answer = data?.choices?.[0]?.message?.content ?? "";

    return new Response(JSON.stringify({ answer }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
