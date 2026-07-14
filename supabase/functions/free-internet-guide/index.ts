// Free Internet Guide — NO AI. Live-scrapes Google News RSS + operator blogs.
// Portable: works on any host (only needs outbound HTTPS). No API keys required.
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

type Item = {
  title: string;
  link: string;
  source: string;
  pubDate: string;
  description: string;
  image?: string;
};

const OPERATOR_KEYWORDS: Record<string, { bn: string; en: string; site?: string; aliases: string[] }> = {
  grameenphone: { bn: "গ্রামীণফোন GP অফার", en: "Grameenphone GP internet offer", site: "grameenphone.com",
    aliases: ["grameenphone", "gp ", "gp,", "গ্রামীণফোন", "জিপি"] },
  robi:         { bn: "রবি ইন্টারনেট অফার",   en: "Robi internet MB offer",         site: "robi.com.bd",
    aliases: ["robi", "রবি"] },
  banglalink:   { bn: "বাংলালিংক অফার",       en: "Banglalink internet offer",       site: "banglalink.net",
    aliases: ["banglalink", "বাংলালিংক", "bl "] },
  airtel:       { bn: "এয়ারটেল অফার",         en: "Airtel BD internet offer",        site: "bd.airtel.com",
    aliases: ["airtel", "এয়ারটেল"] },
  teletalk:     { bn: "টেলিটক অফার",           en: "Teletalk internet offer",         site: "teletalk.com.bd",
    aliases: ["teletalk", "টেলিটক"] },
};

const TOPIC_KEYWORDS: Record<string, { bn: string; en: string; match: string[] }> = {
  "social-packs":         { bn: "সোশ্যাল প্যাক ফেসবুক হোয়াটসঅ্যাপ",   en: "social pack facebook whatsapp imo",
    match: ["social", "facebook", "whatsapp", "imo", "সোশ্যাল", "ফেসবুক"] },
  "cheap-mb":             { bn: "সস্তা MB ইন্টারনেট প্যাক",             en: "cheapest internet MB pack",
    match: ["mb", "internet", "pack", "offer", "প্যাক", "ইন্টারনেট", "অফার"] },
  "night-packs":          { bn: "নাইট প্যাক বোনাস",                    en: "night pack bonus internet",
    match: ["night", "bonus", "নাইট", "বোনাস"] },
  "free-internet-vpn":    { bn: "ফ্রি ইন্টারনেট VPN হ্যান্ডলার",         en: "free internet vpn handler config",
    match: ["free", "vpn", "handler", "ফ্রি"] },
  "emergency-balance":    { bn: "ইমার্জেন্সি ব্যালেন্স MB লোন",          en: "emergency balance MB loan code",
    match: ["emergency", "loan", "balance", "ধার", "ইমার্জেন্সি"] },
  "student-offers":       { bn: "স্টুডেন্ট অফার বান্ডেল",                en: "student bundle offer",
    match: ["student", "bundle", "স্টুডেন্ট"] },
  "apn-settings":         { bn: "APN সেটিংস 4G ইন্টারনেট",             en: "APN settings 4G internet",
    match: ["apn", "settings", "4g", "5g"] },
};


function decode(s: string) {
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, " ")
    .replace(/<[^>]+>/g, "").trim();
}

function extractImg(html: string): string | undefined {
  const m = /<img[^>]+src=["']([^"']+)["']/i.exec(html);
  return m?.[1];
}

function parseRss(xml: string, limit = 25): Item[] {
  const items: Item[] = [];
  const re = /<item>([\s\S]*?)<\/item>/g;
  let m;
  while ((m = re.exec(xml)) && items.length < limit) {
    const block = m[1];
    const get = (tag: string) => {
      const r = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`).exec(block);
      return r ? decode(r[1]) : "";
    };
    const descRaw = (/\<description[^>]*\>([\s\S]*?)<\/description>/.exec(block) || [, ""])[1] || "";
    items.push({
      title: get("title"),
      link: get("link"),
      source: get("source") || "Google News",
      pubDate: get("pubDate"),
      description: decode(descRaw).slice(0, 260),
      image: extractImg(descRaw),
    });
  }
  return items;
}

async function fetchRss(url: string): Promise<Item[]> {
  try {
    const r = await fetch(url, {
      redirect: "follow",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
        "Accept": "application/rss+xml, application/xml, text/xml, */*",
        "Accept-Language": "en-US,en;q=0.9,bn;q=0.8",
        // Bypass Google's EU cookie consent wall (edge runs in EU region)
        "Cookie": "CONSENT=YES+cb.20210328-17-p0.en+FX+123; SOCS=CAISHAgBEhJnd3NfMjAyMzExMjItMF9SQzEaAmVuIAEaBgiA1p2rBg",
      },
    });
    const text = await r.text();
    console.log(`[rss] ${r.status} ${text.length}b ${url.slice(0, 90)}`);
    if (!r.ok) return [];
    return parseRss(text);
  } catch (e) {
    console.log(`[rss-err] ${(e as Error).message} ${url.slice(0, 90)}`);
    return [];
  }
}



Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const { operator, topic, language } = await req.json();
    if (!operator || !topic) {
      return new Response(JSON.stringify({ error: "operator and topic required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const op = OPERATOR_KEYWORDS[operator] || OPERATOR_KEYWORDS.grameenphone;
    const tp = TOPIC_KEYWORDS[topic] || TOPIC_KEYWORDS["cheap-mb"];
    const bn = language === "bn";

    const qBn = `${op.bn} ${tp.bn}`;
    const qEn = `${op.en} ${tp.en}`;
    const qSite = op.site ? `${tp.en} site:${op.site}` : qEn;

    // `when:` is a Google News URL param, not a query token.
    const WHEN = "&when=60d";

    const feeds = [
      `https://news.google.com/rss/search?q=${encodeURIComponent(qBn)}${WHEN}&hl=bn&gl=BD&ceid=BD:bn`,
      `https://news.google.com/rss/search?q=${encodeURIComponent(qEn)}${WHEN}&hl=en&gl=BD&ceid=BD:en`,
      `https://news.google.com/rss/search?q=${encodeURIComponent(qSite)}${WHEN}&hl=en&gl=BD&ceid=BD:en`,
      `https://news.google.com/rss/search?q=${encodeURIComponent(qEn + " techtunes trickbd")}${WHEN}&hl=en&gl=BD&ceid=BD:en`,
      // Fallback without date filter
      `https://news.google.com/rss/search?q=${encodeURIComponent(qEn)}&hl=en&gl=BD&ceid=BD:en`,
      `https://news.google.com/rss/search?q=${encodeURIComponent(qBn)}&hl=bn&gl=BD&ceid=BD:bn`,
      // Bing News fallback (works from any region, no consent wall)
      `https://www.bing.com/news/search?q=${encodeURIComponent(qEn + " bangladesh")}&format=rss&cc=bd`,
      `https://www.bing.com/news/search?q=${encodeURIComponent(qSite + " bangladesh")}&format=rss&cc=bd`,
    ];


    const results = await Promise.all(feeds.map(fetchRss));
    const seen = new Set<string>();
    const merged: Item[] = [];
    for (const arr of results) {
      for (const it of arr) {
        const key = (it.link || it.title).slice(0, 200);
        if (!it.title || seen.has(key)) continue;
        seen.add(key);
        merged.push(it);
      }
    }

    // Prefer items within 180 days; if none, fall back to whatever we got
    const CUTOFF = Date.now() - 180 * 24 * 60 * 60 * 1000;
    const recent = merged.filter((it) => {
      const t = Date.parse(it.pubDate);
      return t && t >= CUTOFF;
    });
    const fresh = recent.length > 0 ? recent : merged;


    // Sort newest first
    fresh.sort((a, b) => {
      const da = Date.parse(a.pubDate) || 0;
      const db = Date.parse(b.pubDate) || 0;
      return db - da;
    });


    return new Response(JSON.stringify({
      items: fresh.slice(0, 40),
      operator,
      topic,
      language,
      fetchedAt: new Date().toISOString(),
      note: bn
        ? "লাইভ Google News + অপারেটর ব্লগ থেকে সরাসরি আনা — কোনো AI ব্যবহার হয়নি।"
        : "Live from Google News + operator blogs — no AI used.",
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String((e as Error).message || e), items: [] }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
