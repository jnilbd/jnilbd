import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};


serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const { summary, language } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");

    const sys = language === "bn"
      ? "তুমি বাংলাদেশী একজন স্মার্ট ফিন্যান্স কোচ। ব্যবহারকারীর মাসিক আয়, ব্যয়, ক্যাটেগরি ও ধার দেখে বাংলায় ৫টি সুনির্দিষ্ট ও বাস্তবমুখী পরামর্শ দাও — কোথায় খরচ কমানো যায়, কোনটা এখন কেনা উচিত নয়, কত সঞ্চয় করা উচিত। সংক্ষিপ্ত bullet point আকারে।"
      : "You are a Bangladeshi smart finance coach. From the user's monthly income, expenses, categories and debts, give 5 specific actionable tips — what to cut, what NOT to buy now, how much to save. Concise bullet points.";

    const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: sys },
          { role: "user", content: JSON.stringify(summary) },
        ],
      }),
    });

    if (r.status === 429) return new Response(JSON.stringify({ error: "Rate limit, try later" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    if (r.status === 402) return new Response(JSON.stringify({ error: "AI credits required" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    if (!r.ok) {
      const t = await r.text();
      console.error("AI error", r.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const data = await r.json();
    const insight = data.choices?.[0]?.message?.content ?? "";
    return new Response(JSON.stringify({ insight }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
