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

const OPERATOR_KEYWORDS: Record<string, { bn: string; en: string; site?: string }> = {
  grameenphone: { bn: "গ্রামীণফোন GP অফার", en: "Grameenphone GP internet offer", site: "grameenphone.com" },
  robi:         { bn: "রবি ইন্টারনেট অফার",   en: "Robi internet MB offer",         site: "robi.com.bd" },
  banglalink:   { bn: "বাংলালিংক অফার",       en: "Banglalink internet offer",       site: "banglalink.net" },
  airtel:       { bn: "এয়ারটেল অফার",         en: "Airtel BD internet offer",        site: "bd.airtel.com" },
  teletalk:     { bn: "টেলিটক অফার",           en: "Teletalk internet offer",         site: "teletalk.com.bd" },
};

const TOPIC_KEYWORDS: Record<string, { bn: string; en: string }> = {
  "social-packs":         { bn: "সোশ্যাল প্যাক ফেসবুক হোয়াটসঅ্যাপ",   en: "social pack facebook whatsapp imo" },
  "cheap-mb":             { bn: "সস্তা MB ইন্টারনেট প্যাক",             en: "cheapest internet MB pack" },
  "night-packs":          { bn: "নাইট প্যাক বোনাস",                    en: "night pack bonus internet" },
  "free-internet-vpn":    { bn: "ফ্রি ইন্টারনেট VPN হ্যান্ডলার",         en: "free internet vpn handler config" },
  "emergency-balance":    { bn: "ইমার্জেন্সি ব্যালেন্স MB লোন",          en: "emergency balance MB loan code" },
  "student-offers":       { bn: "স্টুডেন্ট অফার বান্ডেল",                en: "student bundle offer" },
  "apn-settings":         { bn: "APN সেটিংস 4G ইন্টারনেট",             en: "APN settings 4G internet" },
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
    const r = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
    if (!r.ok) return [];
    return parseRss(await r.text());
  } catch { return []; }
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

    const feeds = [
      // Bangla news coverage
      `https://news.google.com/rss/search?q=${encodeURIComponent(qBn)}&hl=bn&gl=BD&ceid=BD:bn`,
      // English coverage
      `https://news.google.com/rss/search?q=${encodeURIComponent(qEn)}&hl=en&gl=BD&ceid=BD:en`,
      // Operator's own site
      `https://news.google.com/rss/search?q=${encodeURIComponent(qSite)}&hl=en&gl=BD&ceid=BD:en`,
      // Community blogs / techtunes / BDIX-style
      `https://news.google.com/rss/search?q=${encodeURIComponent(qEn + " techtunes trickbd bdix")}&hl=en&gl=BD&ceid=BD:en`,
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

    // Sort newest first
    merged.sort((a, b) => {
      const da = Date.parse(a.pubDate) || 0;
      const db = Date.parse(b.pubDate) || 0;
      return db - da;
    });

    return new Response(JSON.stringify({
      items: merged.slice(0, 40),
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
