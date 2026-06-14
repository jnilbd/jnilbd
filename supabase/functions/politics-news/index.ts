import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

type Item = { title: string; link: string; source: string; pubDate: string; description: string };

const FEEDS: Record<string, { q: string; hl: string; gl: string; ceid: string }> = {
  awami: { q: "আওয়ামী লীগ", hl: "bn", gl: "BD", ceid: "BD:bn" },
  bnp: { q: "বিএনপি", hl: "bn", gl: "BD", ceid: "BD:bn" },
  jamaat: { q: "জামায়াতে ইসলামী", hl: "bn", gl: "BD", ceid: "BD:bn" },
  ncp: { q: "এনসিপি জাতীয় নাগরিক পার্টি", hl: "bn", gl: "BD", ceid: "BD:bn" },
  bd: { q: "বাংলাদেশ রাজনীতি", hl: "bn", gl: "BD", ceid: "BD:bn" },
  india: { q: "India politics", hl: "en", gl: "IN", ceid: "IN:en" },
  usa: { q: "US politics Trump Biden", hl: "en", gl: "US", ceid: "US:en" },
  world: { q: "world politics", hl: "en", gl: "US", ceid: "US:en" },
  pakistan: { q: "Pakistan politics", hl: "en", gl: "PK", ceid: "PK:en" },
  china: { q: "China politics", hl: "en", gl: "US", ceid: "US:en" },
  middleeast: { q: "Middle East politics Israel Palestine", hl: "en", gl: "US", ceid: "US:en" },
  // War / conflict feeds
  war_overview: { q: "active wars conflicts ceasefire", hl: "en", gl: "US", ceid: "US:en" },
  war_ukraine: { q: "Russia Ukraine war frontline", hl: "en", gl: "US", ceid: "US:en" },
  war_gaza: { q: "Israel Gaza Hamas war ceasefire", hl: "en", gl: "US", ceid: "US:en" },
  war_lebanon: { q: "Israel Lebanon Hezbollah conflict", hl: "en", gl: "US", ceid: "US:en" },
  war_iran: { q: "Iran Israel strike conflict", hl: "en", gl: "US", ceid: "US:en" },
  war_yemen: { q: "Yemen Houthi Red Sea conflict", hl: "en", gl: "US", ceid: "US:en" },
  war_sudan: { q: "Sudan civil war RSF", hl: "en", gl: "US", ceid: "US:en" },
  war_myanmar: { q: "Myanmar civil war junta resistance", hl: "en", gl: "US", ceid: "US:en" },
  war_africa: { q: "Africa conflict Congo Sahel", hl: "en", gl: "US", ceid: "US:en" },
  war_taiwan: { q: "Taiwan China tension military", hl: "en", gl: "US", ceid: "US:en" },
  war_kashmir: { q: "India Pakistan border tension Kashmir", hl: "en", gl: "IN", ceid: "IN:en" },
  war_ceasefire: { q: "ceasefire peace talks negotiations", hl: "en", gl: "US", ceid: "US:en" },
  war_humanitarian: { q: "war humanitarian crisis refugees casualties", hl: "en", gl: "US", ceid: "US:en" },
  war_bangla: { q: "যুদ্ধ সংঘাত আন্তর্জাতিক", hl: "bn", gl: "BD", ceid: "BD:bn" },
};

function decode(s: string) {
  return s
    .replace(/<!\[CDATA\[(.*?)\]\]>/gs, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/<[^>]+>/g, "")
    .trim();
}

function parseRss(xml: string, limit = 20): Item[] {
  const items: Item[] = [];
  const re = /<item>([\s\S]*?)<\/item>/g;
  let m;
  while ((m = re.exec(xml)) && items.length < limit) {
    const block = m[1];
    const get = (tag: string) => {
      const r = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`).exec(block);
      return r ? decode(r[1]) : "";
    };
    items.push({
      title: get("title"),
      link: get("link"),
      source: get("source") || "Google News",
      pubDate: get("pubDate"),
      description: get("description").slice(0, 280),
    });
  }
  return items;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const { category = "awami" } = await req.json().catch(() => ({}));
    const feed = FEEDS[category] ?? FEEDS.awami;
    const url = `https://news.google.com/rss/search?q=${encodeURIComponent(feed.q)}&hl=${feed.hl}&gl=${feed.gl}&ceid=${feed.ceid}`;
    const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
    const xml = await res.text();
    const items = parseRss(xml);
    return new Response(JSON.stringify({ items, fetchedAt: new Date().toISOString() }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e), items: [] }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
