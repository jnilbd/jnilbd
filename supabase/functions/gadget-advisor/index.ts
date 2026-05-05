import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { budget, category, requirements, language } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");

    const isBn = language === "bn";
    const sys = `You are an expert Bangladesh gadget market advisor. You know current market prices (in BDT) for ${category} from authorized retailers like Star Tech, Ryans, Tech Land, Pickaboo, Daraz, Apple Gadgets BD, Samsung BD, Xiaomi BD, etc. Reply in ${isBn ? "Bengali (বাংলা)" : "English"}. Be specific with model names, specs, and approximate BDT prices. Include a mix of brand-new latest models AND 1-2 year old still-available models that offer better value.`;

    const userMsg = `Budget: ৳${budget} BDT
Category: ${category}
User requirements: ${requirements || "general use"}

Recommend 5-7 specific ${category} options available in Bangladesh market right now within or near this budget. For each:
- Brand & exact model name
- Approximate current BDT price (range)
- Key specs (processor, RAM, storage, display, camera/battery as relevant)
- Why it fits the budget & requirements
- Mark as "🆕 Latest" or "💰 Older but great value (1-2 years old, still available)"
- Best place to buy in BD

End with a "🏆 Top Pick" recommendation and a "💡 Hidden Gem" (older model with great value).
Format clearly with markdown headings and bullet points.`;

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
      return new Response(JSON.stringify({ error: t }), {
        status: r.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await r.json();
    return new Response(
      JSON.stringify({ recommendation: data.choices[0].message.content }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
