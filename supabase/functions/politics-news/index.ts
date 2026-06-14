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
  // Stock market feeds
  stock_dse: { q: "DSE Dhaka Stock Exchange Bangladesh", hl: "en", gl: "BD", ceid: "BD:en" },
  stock_bd_bangla: { q: "শেয়ার বাজার ঢাকা স্টক এক্সচেঞ্জ DSE", hl: "bn", gl: "BD", ceid: "BD:bn" },
  stock_cse: { q: "CSE Chittagong Stock Exchange", hl: "en", gl: "BD", ceid: "BD:en" },
  stock_world: { q: "global stock market S&P Nasdaq Dow", hl: "en", gl: "US", ceid: "US:en" },
  stock_india: { q: "Sensex Nifty Indian stock market", hl: "en", gl: "IN", ceid: "IN:en" },
  stock_crypto: { q: "Bitcoin Ethereum crypto market", hl: "en", gl: "US", ceid: "US:en" },
  stock_ipo_bd: { q: "Bangladesh IPO new listing share", hl: "en", gl: "BD", ceid: "BD:en" },
  // Bangladeshi newspapers — today's headlines via site: filter
  np_prothomalo: { q: "site:prothomalo.com", hl: "bn", gl: "BD", ceid: "BD:bn" },
  np_bdpratidin: { q: "site:bd-pratidin.com", hl: "bn", gl: "BD", ceid: "BD:bn" },
  np_kalerkantho: { q: "site:kalerkantho.com", hl: "bn", gl: "BD", ceid: "BD:bn" },
  np_jugantor: { q: "site:jugantor.com", hl: "bn", gl: "BD", ceid: "BD:bn" },
  np_ittefaq: { q: "site:ittefaq.com.bd", hl: "bn", gl: "BD", ceid: "BD:bn" },
  np_samakal: { q: "site:samakal.com", hl: "bn", gl: "BD", ceid: "BD:bn" },
  np_manabzamin: { q: "site:mzamin.com", hl: "bn", gl: "BD", ceid: "BD:bn" },
  np_inqilab: { q: "site:dailyinqilab.com", hl: "bn", gl: "BD", ceid: "BD:bn" },
  np_nayadiganta: { q: "site:dailynayadiganta.com", hl: "bn", gl: "BD", ceid: "BD:bn" },
  np_amaderorshomoy: { q: "site:dainikamadershomoy.com", hl: "bn", gl: "BD", ceid: "BD:bn" },
  np_jaijaidin: { q: "site:jaijaidinbd.com", hl: "bn", gl: "BD", ceid: "BD:bn" },
  np_jagonews24: { q: "site:jagonews24.com", hl: "bn", gl: "BD", ceid: "BD:bn" },
  np_banglatribune: { q: "site:banglatribune.com", hl: "bn", gl: "BD", ceid: "BD:bn" },
  np_bdnews24: { q: "site:bangla.bdnews24.com", hl: "bn", gl: "BD", ceid: "BD:bn" },
  np_dailystar: { q: "site:thedailystar.net", hl: "en", gl: "BD", ceid: "BD:en" },
  np_dailystar_bn: { q: "site:bangla.thedailystar.net", hl: "bn", gl: "BD", ceid: "BD:bn" },
  np_bbcbangla: { q: "site:bbc.com/bengali", hl: "bn", gl: "BD", ceid: "BD:bn" },
  np_dhakatribune: { q: "site:dhakatribune.com", hl: "en", gl: "BD", ceid: "BD:en" },
  np_newage: { q: "site:newagebd.net", hl: "en", gl: "BD", ceid: "BD:en" },
  np_observer: { q: "site:observerbd.com", hl: "en", gl: "BD", ceid: "BD:en" },
  np_financialexpress: { q: "site:thefinancialexpress.com.bd", hl: "en", gl: "BD", ceid: "BD:en" },
  np_businessstandard: { q: "site:tbsnews.net", hl: "en", gl: "BD", ceid: "BD:en" },
  // Top headlines aggregate
  np_today_top: { q: "বাংলাদেশ আজকের সংবাদ", hl: "bn", gl: "BD", ceid: "BD:bn" },
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
