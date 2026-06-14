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
    } else if (mode === "abroad") {
      if (!country) {
        return new Response(JSON.stringify({ error: "country required" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const vt = visaType || "any";
      const sc = sector || "any";
      userPrompt = `A Bangladeshi person wants to go to **${country}** on **${vt} visa**${sc !== "any" ? `, sector: ${sc}` : ""}.
Provide a complete, current, structured guide with EXACTLY these sections separated by \`---\`:

## 🛂 ${language === "bn" ? "ভিসার ধরন ও যোগ্যতা" : "Visa Type & Eligibility"}
- Which visa categories apply (student/work/business/family/skilled migration).
- Eligibility: age, education, IELTS/language, experience, funds.
- Application steps in order.

---

## 📞 ${language === "bn" ? "কোথায় যোগাযোগ করবেন (নিরাপদ চ্যানেল)" : "Where to Apply (Safe Channels)"}
Markdown table: Channel | What it does | Cost (৳) | Risk level.
Include BMET, BOESL, embassy, government-licensed RA agencies, university DSW offices, official scholarship portals. Warn against unverified middlemen ("দালাল").

---

## 💰 ${language === "bn" ? "মোট খরচ ভাঙানো" : "Cost Breakdown"}
Markdown table: Item | Cost (৳) | Notes.
Rows: visa fee, agency/processing, medical, police clearance, IELTS/language test, ticket, first-month rent, food, total upfront, hidden costs.

---

## 💵 ${language === "bn" ? "আয় ও কর্মক্ষেত্র" : "Earnings & Job Market"}
Markdown table: Job/Sector | Monthly salary (BDT equivalent) | Working hours/week | Typical contract length | Skill required.
Add a "realistic first-year savings" line in **bold**.

---

## 🔥 ${language === "bn" ? "পরিশ্রম ও চ্যালেঞ্জ" : "Hard Work & Challenges"}
Bullets: physical workload, weather, language barrier, homesickness, contract abuse, kafala system if applicable, racism, accommodation crowding, food halal availability.

---

## 📅 ${language === "bn" ? "কত দিনে কত টাকা — টাইমলাইন" : "Timeline: How Much in How Long"}
Markdown table: Period | Realistic net savings (৳) | Notes.
Rows: 0-3 months, 3-6 months, 6-12 months, 1-2 years, 2-5 years.

---

## ⚠️ ${language === "bn" ? "সাধারণ ভুল ও প্রতারণা" : "Common Mistakes & Scams"}
Numbered list: fake job offers, "ভিজিট ভিসায় গিয়ে কাজ", forged demand letters, overpaying middlemen, signing contracts without reading, surrendering passport, "ফ্রি ভিসা" trap.

---

## 🚫 ${language === "bn" ? "অবৈধ পথে যাওয়ার ভয়াবহতা" : "Dangers of Illegal Migration"}
Strong, plain language about: Mediterranean boat deaths, Libya/Tunisia detention, human trafficking, jail/deportation, family losing land & money, lifetime ban. Use **bold** for life-threatening risks. End with: "${language === "bn" ? "অবৈধ পথে কখনো নয় — শুধু সরকার-অনুমোদিত চ্যানেল।" : "Never go illegally — only government-approved channels."}"

---

## ✅ ${language === "bn" ? "করণীয় চেকলিস্ট" : "Action Checklist"}
Numbered checklist a person should follow today to safely start the process.

End with: "${language === "bn" ? "*সব তথ্য আনুমানিক — দূতাবাস ও BMET ওয়েবসাইট থেকে চূড়ান্ত যাচাই করুন।*" : "*All info indicative — verify with embassy & BMET before acting.*"}"`;
    } else if (mode === "remittance") {
      const sf = sendFrom || "any country";
      const st = sendTo || "Bangladesh";
      userPrompt = `Guide for sending money: **${sf} → ${st}**.
Provide current, practical information with EXACTLY these sections separated by \`---\`:

## 🏦 ${language === "bn" ? "টাকা পাঠানোর সেরা মাধ্যম" : "Best Remittance Channels"}
Markdown table: Service | Type | Fee | Exchange rate | Speed | Govt 2.5% incentive eligible?
Include: bKash Remittance, Nagad Remittance, Rocket, Wise, Western Union, MoneyGram, RIA, Taptap Send, Remitly, Sonali Bank, Islami Bank, Agrani, Janata, NRB Bank, City Bank.

---

## 🎁 ${language === "bn" ? "সরকারি ২.৫% প্রণোদনা" : "Govt 2.5% Incentive"}
- Who qualifies, how to claim, which channels auto-credit it.
- Documents needed.

---

## 📲 ${language === "bn" ? "মোবাইলে টাকা পাঠানো (সবচেয়ে দ্রুত)" : "Mobile Money (Fastest)"}
Numbered steps for bKash/Nagad remittance: setup, sender side, receiver side, limits per day/month.

---

## 💱 ${language === "bn" ? "সর্বনিম্ন খরচে পাঠানোর কৌশল" : "Cheapest Way Tips"}
- Compare hundi vs legal — explain why legal is safer and now competitive.
- Best timing, batching, currency tips.
- Why hundi is illegal & risky (no incentive, account freeze, no proof).

---

## 📞 ${language === "bn" ? "পরস্পরের সাথে যোগাযোগ" : "Staying in Touch"}
Bullets: WhatsApp, IMO, Messenger, Viber free calling tips; cheap international SIM/eSIM (Airalo, Holafly); local calling cards; video call etiquette; sending documents via email/Google Drive.

---

## 🆘 ${language === "bn" ? "জরুরি যোগাযোগ" : "Emergency Contacts"}
- BD embassy/high commission in ${sf}.
- Probashi Kallyan helpline 16135.
- BMET, Wage Earners' Welfare Board.
- What to do if salary unpaid, passport seized, or arrested.

---

## ⚠️ ${language === "bn" ? "প্রতারণা থেকে বাঁচুন" : "Avoid Scams"}
Bullets: fake remittance SMS, OTP phishing, "double your money" hundi agents, fake exchange rate apps.

End with: "${language === "bn" ? "*রেট ও ফি প্রতিদিন বদলায় — পাঠানোর আগে অ্যাপে যাচাই করুন।*" : "*Rates & fees change daily — verify in-app before sending.*"}"`;
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
