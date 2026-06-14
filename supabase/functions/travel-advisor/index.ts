import { corsHeaders } from "npm:@supabase/supabase-js@2.95.0/cors";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const body = await req.json();
    const { mode, from, to, destination, country, visaType, sector, sendFrom, sendTo, language } = body;
    const lang = language === "bn" ? "Bangla (বাংলা)" : "English";
    const today = new Date().toISOString().slice(0, 10);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");

    const sysBase = `You are an up-to-date Bangladesh & international travel expert.
Today's date: ${today}.
ALWAYS reply in ${lang}.

FORMATTING RULES (strict):
- Markdown only. Use \`##\` for sections (start with relevant emoji). No \`#\` (h1).
- Blank line before/after every heading, list, table, paragraph.
- Use markdown tables for any fare/price comparison. Columns clear and short.
- Use \`-\` bullets, one idea per bullet. Keep paragraphs ≤3 sentences.
- Wrap codes, station/airport codes, app names in backticks.
- **Bold** only for prices, names, key terms.
- Use \`---\` to separate sections.
- Prices: give realistic current ranges (BDT primary). Mention "approx — verify before booking" at end.
- Never invent train numbers / flight numbers you are not sure about; say "check operator app".`;

    let userPrompt = "";
    let sys = sysBase;

    if (mode === "route") {
      if (!from || !to) {
        return new Response(JSON.stringify({ error: "from & to required" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      userPrompt = `Route: **${from} → ${to}**

Provide a complete, up-to-date travel guide for this route with EXACTLY these sections separated by \`---\`:

## 🚌 ${language === "bn" ? "বাসে যাওয়ার উপায়" : "By Bus"}
Markdown table: Operator | AC/Non-AC | Fare (৳) | Duration | Departure points. List 4-6 known operators.

---

## 🚆 ${language === "bn" ? "ট্রেনে যাওয়ার উপায়" : "By Train"}
Markdown table: Train name | Class (Shovan/Snigdha/AC) | Fare (৳) | Duration | Off-day. If no direct train, suggest nearest junction + connection.

---

## ✈️ ${language === "bn" ? "ফ্লাইটে যাওয়ার উপায়" : "By Air"}
Markdown table: Airline | Fare range (৳) | Duration | Frequency. If no direct flight, say so and propose nearest airport + onward transport.

---

## 🚢 ${language === "bn" ? "নৌপথ / লঞ্চ" : "Waterway / Launch"}
If applicable; otherwise write one line saying not applicable.

---

## 💰 ${language === "bn" ? "সর্বনিম্ন খরচে যাওয়ার উপায়" : "Cheapest Way"}
- Pick the absolute cheapest option with **exact ৳** amount.
- Then a **broken-route / multi-leg** cheapest alternative if it saves money (e.g. local bus + train transfer). Step-by-step bullets.

---

## ⏱️ ${language === "bn" ? "দ্রুততম উপায়" : "Fastest Way"}
- One-line winner with duration and price.

---

## 📌 ${language === "bn" ? "ব্যবহারিক টিপস" : "Practical Tips"}
- Best booking apps/sites (Shohoz, bdtickets, eticket.railway.gov.bd, Biman, US-Bangla, NovoAir).
- Advance booking window, peak season warnings, safety notes.

End with: "${language === "bn" ? "*সব দাম আনুমানিক — বুকিং এর আগে যাচাই করুন।*" : "*All prices approximate — verify before booking.*"}"`;
    } else if (mode === "destination") {
      if (!destination) {
        return new Response(JSON.stringify({ error: "destination required" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      userPrompt = `Destination: **${destination}**

Provide a detailed, current travel guide with EXACTLY these sections separated by \`---\`:

## 🌍 ${language === "bn" ? "কেন যাবেন?" : "Why Visit?"}
2-3 sentences capturing the unique experience.

---

## 🎯 ${language === "bn" ? "কী কী দেখবেন (Must-see)" : "Must-See Attractions"}
Numbered list — at least 6 spots with 1-line description each and approximate entry fee.

---

## 🍽️ ${language === "bn" ? "কী খাবেন" : "Must-Try Food"}
Bullets — local dishes + where to find them + price range.

---

## 🏨 ${language === "bn" ? "কোথায় থাকবেন" : "Where to Stay"}
Markdown table: Area | Budget (৳/night) | Mid-range | Luxury | Why.

---

## 🚗 ${language === "bn" ? "যাতায়াত (লোকাল)" : "Getting Around"}
Bullets — local transport options with fare ranges.

---

## 📅 ${language === "bn" ? "সেরা সময় ও কয়দিন" : "Best Time & Duration"}
- Best months, weather notes, ideal trip length.

---

## 💵 ${language === "bn" ? "মোট বাজেট অনুমান" : "Total Budget Estimate"}
Markdown table: Style | Per person (৳) | Includes.

---

## ⚠️ ${language === "bn" ? "ঝুঁকি ও সতর্কতা" : "Risks & Cautions"}
Bullets covering: safety/scams, health (water, food, altitude), weather hazards, wildlife, political/security, what NOT to miss buying insurance for, female-traveller notes, halal-food availability if relevant.

---

## ❌ ${language === "bn" ? "যা মিস করলে আফসোস করবেন" : "Don't Miss"}
3-5 must-do experiences (sunrise spots, special tours, seasonal events).

End with: "${language === "bn" ? "*তথ্য আপডেটেড রাখার চেষ্টা করা হয়েছে — যাওয়ার আগে অফিসিয়াল সোর্স যাচাই করুন।*" : "*Information kept current — verify with official sources before travel.*"}"`;
    } else if (mode === "prices") {
      // Refresh prices for a known destination card
      userPrompt = `Give a quick current-price refresh for **${destination}** travel from Dhaka.

## 💸 ${language === "bn" ? "বর্তমান আনুমানিক খরচ" : "Current Estimated Costs"}

Markdown table with these rows: Bus (AC), Bus (Non-AC), Train (Snigdha/AC), Flight (one-way), Hotel (budget/night), Hotel (mid/night), Food (per day), Local transport (per day), Entry tickets (typical).
Columns: Item | Price (৳) | Notes.

Then 3 bullets: cheapest combo total, comfortable combo total, luxury combo total — each with **৳ amount** for 3 days/2 nights per person.

End with: "${language === "bn" ? "*আজকের তারিখ অনুযায়ী আনুমানিক।*" : "*Approximate as of today.*"}"`;
    } else {
      return new Response(JSON.stringify({ error: "invalid mode" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

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
