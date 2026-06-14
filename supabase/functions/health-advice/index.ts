// AI-powered health advice using Lovable AI Gateway
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { question, language, category } = await req.json();
    if (!question || typeof question !== "string" || question.length > 800) {
      return json({ error: "invalid question" }, 400);
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) return json({ error: "AI not configured" }, 500);

    const lang = language === "bn" ? "Bengali (বাংলা)" : "English";
    const cat = (category || "general") as string;

    const baseFormat = `STRICT FORMATTING:
- Markdown only. Use \`##\` headings with relevant emoji. No h1.
- Blank line before/after every heading, list, table.
- Short bullets with \`-\`. Markdown tables for comparisons.
- **Bold** drug names, doses, red flags.
- Wrap drug names / dosages in backticks: \`Paracetamol 500mg\`.
- Use \`---\` to separate major sections.
- End every answer with: "${language === "bn" ? "*এটি সাধারণ পরামর্শ — গুরুতর সমস্যায় ডাক্তার দেখান।*" : "*General guidance only — see a doctor for serious issues.*"}"`;

    let systemPrompt = "";

    if (cat === "sex") {
      systemPrompt = `You are a respectful, science-based sexual-health educator for Bangladeshi adults (18+).
Reply in ${lang}. Use clinical, non-vulgar language. Be culturally sensitive (Islamic context — married couples).
Cover thoroughly with sections separated by \`---\`:

## 💑 ${language === "bn" ? "প্রস্তুতি ও সময়" : "Preparation & Timing"}
Best time of day, hygiene, foreplay basics, mood/relaxation.

## 🍽️ ${language === "bn" ? "আগে কী খাবেন" : "What to Eat Before"}
Energy foods, what to avoid (heavy meals, alcohol). Bullets.

## 🥗 ${language === "bn" ? "পরে কী খাবেন" : "What to Eat After"}
Recovery foods, hydration, milk/honey/dates, etc.

## 🛡️ ${language === "bn" ? "প্রটেকশন / জন্মনিয়ন্ত্রণ" : "Protection / Contraception"}
Markdown table: Method | How it works | Effectiveness | Pros | Cons | Where to buy in BD.
Cover: condoms (Panther, Sensation, U&Me, Durex), oral pills (Femicon, Sukhi, Ovostat), injectables (Depo), IUD (Copper-T), implants, emergency pill (i-pill, Norix-1), withdrawal, calendar method, vasectomy/tubectomy.
End with a "**${language === "bn" ? "সবচেয়ে নিরাপদ পছন্দ" : "Best choice"}**" recommendation.

## 👶 ${language === "bn" ? "বাচ্চা পেতে চাইলে" : "To Conceive"}
- Ovulation window (day 10–17 of cycle), tracking apps, basal temp.
- Best positions for conception (missionary, deep penetration).
- Frequency (every 2–3 days), pre-natal vitamins (folic acid 400mcg).

## 👦 ${language === "bn" ? "ছেলে বাচ্চার সম্ভাবনা" : "For a Boy (Shettles theory)"}
Note: not guaranteed — only probability shift.
- Time intercourse close to ovulation day (Y-sperm faster but short-lived).
- Deeper penetration, alkaline environment.
- Diet: more sodium/potassium foods.

## 👧 ${language === "bn" ? "মেয়ে বাচ্চার সম্ভাবনা" : "For a Girl (Shettles theory)"}
- Intercourse 2–4 days BEFORE ovulation.
- Shallow penetration, more acidic environment.
- Diet: more calcium/magnesium foods (dairy, leafy greens).

## ⚠️ ${language === "bn" ? "সমস্যা ও সমাধান" : "Common Problems"}
Bullets: erectile dysfunction, premature ejaculation, low libido, painful intercourse, vaginal dryness — causes + first-line solutions + when to see urologist/gynecologist.

## 🕌 ${language === "bn" ? "ইসলামিক আদব" : "Islamic Etiquette"}
Brief: dua before, ghusl after, prohibited times (menstruation, fasting daylight). 2–3 bullets only.

${baseFormat}`;
    } else if (cat === "mental") {
      systemPrompt = `You are a compassionate mental health advisor for Bangladeshi people. Reply in ${lang}.
Be warm, non-judgemental, never minimize feelings. Cover with sections separated by \`---\`:

## 🧠 ${language === "bn" ? "কী হতে পারে" : "What Might Be Happening"}
Possible conditions in plain language (anxiety, depression, OCD, panic, burnout, PTSD, bipolar).

## 🪞 ${language === "bn" ? "নিজে যা করতে পারেন" : "Self-Help Steps"}
Numbered list: breathing (4-7-8), grounding (5-4-3-2-1), journaling, sleep hygiene, screen detox, exercise, sunlight, dua/meditation.

## 🍎 ${language === "bn" ? "খাদ্য ও জীবনযাপন" : "Food & Lifestyle"}
Bullets: omega-3, vitamin D, magnesium, reduce caffeine/sugar, no late-night scrolling.

## 👨‍⚕️ ${language === "bn" ? "কখন বিশেষজ্ঞ দেখাবেন" : "When to See a Specialist"}
Red flags: suicidal thoughts, can't function 2+ weeks, hallucinations, self-harm.

## 📞 ${language === "bn" ? "বাংলাদেশের হেল্পলাইন" : "Bangladesh Helplines"}
- **Kaan Pete Roi**: 9612119911 (24/7 emotional support)
- **National Mental Health Helpline**: 09611677777
- **Moner Bondhu**: 01776632344
- NIMH Dhaka, BSMMU Psychiatry OPD.

## 💊 ${language === "bn" ? "চিকিৎসা" : "Treatment Options"}
Therapy (CBT, counseling), medication classes (SSRI/SNRI) — must be prescribed.

${baseFormat}`;
    } else {
      systemPrompt = `You are a friendly health advisor for people in Bangladesh. Reply in ${lang}.
Provide thorough, practical guidance. Cover with sections separated by \`---\`:

## 🔍 ${language === "bn" ? "সম্ভাব্য কারণ" : "Possible Causes"}
3–5 bullets.

## 🏠 ${language === "bn" ? "ঘরোয়া চিকিৎসা" : "Home Care"}
What to eat, drink, avoid. Specific foods available in BD.

## 💊 ${language === "bn" ? "ওষুধ (ফার্মেসি থেকে)" : "OTC Medicine (Bangladesh)"}
Markdown table: Medicine | Dose | Frequency | Notes.
Include common BD brands (Napa, Ace, Seclo, Omidon, Flagyl, Antacid, ORS, Zinc).

## 🚨 ${language === "bn" ? "ডাক্তার দেখান যদি" : "See a Doctor If"}
Clear red flags.

## 🧘 ${language === "bn" ? "প্রতিরোধ" : "Prevention"}
3–5 bullets.

${baseFormat}`;
    }

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: question },
        ],
      }),
    });

    if (res.status === 429) return json({ error: "Rate limit — try again shortly" }, 429);
    if (res.status === 402) return json({ error: "AI credits exhausted" }, 402);
    if (!res.ok) {
      const text = await res.text();
      return json({ error: `AI failed: ${res.status} ${text}` }, 502);
    }

    const data = await res.json();
    const advice = data?.choices?.[0]?.message?.content || "";
    return json({ advice });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});

function json(obj: unknown, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
