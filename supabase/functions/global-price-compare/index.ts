import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { product, countries, language } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");

    const isBn = language === "bn";
    const countryList = (countries && countries.length ? countries : ["Bangladesh", "India", "Nepal", "China", "USA", "UAE"]).join(", ");

    const sys = `You are a global gadget/electronics price comparison expert. You know approximate current retail prices of phones, laptops, desktops, TVs, tablets, cameras, smart-watches, headphones, gaming consoles, home appliances and other gadgets in multiple countries. Reply in ${isBn ? "Bengali (বাংলা)" : "English"}. Always disclose that prices are approximate/indicative and fluctuate.`;

    const userMsg = `Product: ${product}
Compare countries: ${countryList}

Provide a detailed comparison:
1. A markdown TABLE with columns: Country | Local Price (local currency) | Approx BDT (৳) | Approx USD ($) | Notes (tax/import/availability)
2. Show the cheapest and most expensive country with the difference (%).
3. Mention import duty / VAT / customs issues if someone wants to buy from cheaper country and bring to Bangladesh.
4. Suggest best country to buy from for a Bangladeshi buyer (considering warranty, import tax, grey market risk).
5. List 1-2 trusted retailers per country (e.g. Star Tech/Daraz BD, Flipkart/Amazon IN, JD/Tmall CN, Amazon/BestBuy US, Daraz NP, Sharaf DG UAE).
6. End with practical tips (warranty, region-lock, charger plug, software/band compatibility).

Use clear markdown with headings and the comparison table. Use 1 USD ≈ 122 BDT, 1 INR ≈ 1.4 BDT, 1 CNY ≈ 17 BDT, 1 NPR ≈ 0.9 BDT, 1 AED ≈ 33 BDT as rough conversions.`;

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
      JSON.stringify({ comparison: data.choices[0].message.content }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
