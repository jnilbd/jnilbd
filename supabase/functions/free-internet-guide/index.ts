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
    const sys = `You are a Bangladesh telecom expert for GP, Robi, Banglalink, Airtel, Teletalk — social packs, MB bonuses, night packs, student offers, app-exclusive deals, USSD codes, emergency loans.

ALWAYS reply in ${lang}.

STRICT FORMATTING RULES — follow exactly so the output is easy to read:
- Use Markdown with clear visual separation.
- Use \`##\` for every major section heading. Start each section with a relevant emoji (📦 💳 ⚙️ 💡 ⚠️).
- Put ONE BLANK LINE before and after every heading, list, table, and paragraph. Never run things together.
- Use short bullet points (one idea per bullet). Use \`-\` for bullets.
- Wrap USSD codes, APN names, app names in backticks: \`*121*1*4#\`, \`MyGP\`.
- Use **bold** ONLY for pack names, prices, or key terms — never bold entire paragraphs.
- For pack lists, prefer a Markdown table with columns: Pack | Price (৳) | MB/Validity | How to buy.
- Use \`---\` as a horizontal divider between the 5 main sections.
- Keep each paragraph under 3 sentences. Break long explanations into bullets.
- Do NOT use h1 (\`#\`). Start from \`##\`.`;

    const userPrompt = `Operator: ${operator.toUpperCase()}
Topic: ${topic}

Provide an up-to-date guide (late 2025 / 2026) with EXACTLY these 5 sections, in this order, each separated by \`---\`:

## 📦 ${language === "bn" ? "সাশ্রয়ী / ফ্রি / সোশ্যাল প্যাক" : "Cheap / Free / Social Packs"}
A markdown table of available packs (name, price ৳, MB & validity, what's included).

---

## 💳 ${language === "bn" ? "কেনার নিয়ম" : "How to Buy"}
Bullet list of exact USSD codes and app steps (MyGP / MyRobi / MyBL / Nagad / bKash). One step per bullet.

---

## ⚙️ ${language === "bn" ? "ফোনে সেটআপ" : "Phone Setup"}
APN settings and VPN/Handler configuration (ProxyDroid, HTTP Injector, OpenVPN — educational). Use numbered steps.

---

## 💡 ${language === "bn" ? "টিপস ও কৌশল" : "Tips & Tricks"}
Bullets: emergency MB loan codes, night packs, student offers, referral bonuses.

---

## ⚠️ ${language === "bn" ? "সতর্কতা" : "Warnings"}
Short bullets about operator T&C, throttling, what to avoid.

Be accurate, practical, Bangladesh-focused. Keep bullets short and scannable.`;

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
