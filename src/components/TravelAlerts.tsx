import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, ExternalLink, Loader2, ShieldAlert, MapPin } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

type NewsItem = {
  title: string;
  link: string;
  pubDate: string;
  source: string;
  description?: string;
};

type RegionAlert = {
  region: string;
  regionBn: string;
  level: "high" | "medium" | "low";
  reasons: Set<string>;
  reasonsBn: Set<string>;
  news: NewsItem[];
};

// Bangladesh regions with keyword variants (bn + en) for matching
const REGIONS: { key: string; bn: string; en: string; match: RegExp }[] = [
  { key: "coxsbazar", bn: "কক্সবাজার", en: "Cox's Bazar", match: /কক্সবাজার|coxs?\s*bazar|cox'?s bazar/i },
  { key: "chattogram", bn: "চট্টগ্রাম", en: "Chattogram", match: /চট্টগ্রাম|চট্রগ্রাম|chattogram|chittagong|ctg/i },
  { key: "feni", bn: "ফেনী", en: "Feni", match: /ফেনী|feni/i },
  { key: "noakhali", bn: "নোয়াখালী", en: "Noakhali", match: /নোয়াখালী|noakhali/i },
  { key: "laxmipur", bn: "লক্ষ্মীপুর", en: "Laxmipur", match: /লক্ষ্মীপুর|lakshmipur|laxmipur/i },
  { key: "cumilla", bn: "কুমিল্লা", en: "Cumilla", match: /কুমিল্লা|cumilla|comilla/i },
  { key: "sylhet", bn: "সিলেট", en: "Sylhet", match: /সিলেট|sylhet/i },
  { key: "sunamganj", bn: "সুনামগঞ্জ", en: "Sunamganj", match: /সুনামগঞ্জ|sunamganj/i },
  { key: "moulvibazar", bn: "মৌলভীবাজার", en: "Moulvibazar", match: /মৌলভীবাজার|moulvibazar|maulvibazar/i },
  { key: "habiganj", bn: "হবিগঞ্জ", en: "Habiganj", match: /হবিগঞ্জ|habiganj/i },
  { key: "bandarban", bn: "বান্দরবান", en: "Bandarban", match: /বান্দরবান|bandarban/i },
  { key: "rangamati", bn: "রাঙ্গামাটি", en: "Rangamati", match: /রাঙ্গামাটি|রাঙামাটি|rangamati/i },
  { key: "khagrachari", bn: "খাগড়াছড়ি", en: "Khagrachhari", match: /খাগড়াছড়ি|khagrachhari|khagrachari/i },
  { key: "barisal", bn: "বরিশাল", en: "Barisal", match: /বরিশাল|barisal|barishal/i },
  { key: "bhola", bn: "ভোলা", en: "Bhola", match: /ভোলা|bhola/i },
  { key: "patuakhali", bn: "পটুয়াখালী", en: "Patuakhali", match: /পটুয়াখালী|patuakhali/i },
  { key: "khulna", bn: "খুলনা", en: "Khulna", match: /খুলনা|khulna/i },
  { key: "satkhira", bn: "সাতক্ষীরা", en: "Satkhira", match: /সাতক্ষীরা|satkhira/i },
  { key: "dhaka", bn: "ঢাকা", en: "Dhaka", match: /(?<!চট্ট)ঢাকা|dhaka/i },
  { key: "rangpur", bn: "রংপুর", en: "Rangpur", match: /রংপুর|rangpur/i },
  { key: "kurigram", bn: "কুড়িগ্রাম", en: "Kurigram", match: /কুড়িগ্রাম|kurigram/i },
];

// Hazard keywords → risk level + label
const HAZARDS: { match: RegExp; level: "high" | "medium" | "low"; en: string; bn: string }[] = [
  { match: /বন্যা|flood|জলাবদ্ধতা|inundat|deluge/i, level: "high", en: "Flooding", bn: "বন্যা" },
  { match: /ঘূর্ণিঝড়|cyclone|hurricane|typhoon/i, level: "high", en: "Cyclone", bn: "ঘূর্ণিঝড়" },
  { match: /ভূমিধস|landslide|mudslide/i, level: "high", en: "Landslide", bn: "ভূমিধস" },
  { match: /জলোচ্ছ্বাস|storm surge|tidal surge/i, level: "high", en: "Storm surge", bn: "জলোচ্ছ্বাস" },
  { match: /ভূমিকম্প|earthquake|tremor/i, level: "high", en: "Earthquake", bn: "ভূমিকম্প" },
  { match: /সহিংসতা|violence|clash|সংঘর্ষ|riot|unrest|অবরোধ|blockade|hartal|হরতাল|curfew|কারফিউ/i, level: "high", en: "Unrest/clash", bn: "সহিংসতা/অবরোধ" },
  { match: /ভারী বৃষ্টি|heavy rain|torrential rain/i, level: "medium", en: "Heavy rain", bn: "ভারী বৃষ্টি" },
  { match: /বজ্রপাত|lightning|thunderstorm|বজ্রঝড়/i, level: "medium", en: "Lightning/storm", bn: "বজ্রপাত/ঝড়" },
  { match: /কুয়াশা|dense fog|শৈত্যপ্রবাহ|cold wave/i, level: "medium", en: "Fog/cold wave", bn: "কুয়াশা/শৈত্যপ্রবাহ" },
  { match: /তাপপ্রবাহ|heatwave|heat wave/i, level: "medium", en: "Heat wave", bn: "তাপপ্রবাহ" },
  { match: /সড়ক দুর্ঘটনা|road accident|bus crash|ferry sank|লঞ্চ ডুবি/i, level: "medium", en: "Transport accident", bn: "যানবাহন দুর্ঘটনা" },
];

const stripHtml = (s: string) => s.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();

const QUERIES_BN = [
  "বাংলাদেশ বন্যা", "ঘূর্ণিঝড় বাংলাদেশ", "ভূমিধস বাংলাদেশ",
  "সিলেট সুনামগঞ্জ বন্যা", "ফেনী নোয়াখালী বন্যা", "চট্টগ্রাম কক্সবাজার বন্যা",
  "সড়ক অবরোধ বাংলাদেশ", "হরতাল বাংলাদেশ",
];
const QUERIES_EN = [
  "Bangladesh flood", "Bangladesh cyclone", "Bangladesh landslide",
  "Sylhet Sunamganj flood", "Feni Noakhali flood", "Chittagong Cox's Bazar flood",
  "Bangladesh blockade protest", "Bangladesh hartal",
];

const TravelAlerts = () => {
  const { language } = useLanguage();
  const isBn = language === "bn";
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchNews = async () => {
    setLoading(true);
    setError(false);
    try {
      const queries = isBn ? QUERIES_BN : QUERIES_EN;
      const hl = isBn ? "bn" : "en-BD";
      const ceid = isBn ? "BD:bn" : "BD:en";
      const results = await Promise.allSettled(
        queries.map(async (q) => {
          const rss = `https://news.google.com/rss/search?q=${encodeURIComponent(q + " when:3d")}&hl=${hl}&gl=BD&ceid=${ceid}`;
          const url = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rss)}&count=8`;
          const res = await fetch(url);
          if (!res.ok) throw new Error("fail");
          const data = await res.json();
          return (data.items || []) as any[];
        })
      );
      const merged: NewsItem[] = [];
      const seen = new Set<string>();
      for (const r of results) {
        if (r.status !== "fulfilled") continue;
        for (const it of r.value) {
          const key = (it.title || "").slice(0, 70);
          if (seen.has(key)) continue;
          seen.add(key);
          const desc = stripHtml(it.description || "");
          const m = (it.title || "").match(/ - ([^-]+)$/);
          merged.push({
            title: (it.title || "").replace(/ - [^-]+$/, "").trim(),
            link: it.link,
            pubDate: it.pubDate,
            source: m ? m[1].trim() : "News",
            description: desc.slice(0, 200),
          });
        }
      }
      merged.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
      setItems(merged.slice(0, 40));
      if (merged.length === 0) setError(true);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
    const iv = setInterval(fetchNews, 5 * 60 * 1000);
    return () => clearInterval(iv);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isBn]);

  // Build region-based alerts
  const regionAlerts: RegionAlert[] = [];
  const regionMap = new Map<string, RegionAlert>();

  for (const item of items) {
    const text = `${item.title} ${item.description || ""}`;
    // Find hazards mentioned
    const hazardMatches = HAZARDS.filter((h) => h.match.test(text));
    if (hazardMatches.length === 0) continue;
    const topHazard = hazardMatches[0];

    // Find regions mentioned
    for (const reg of REGIONS) {
      if (!reg.match.test(text)) continue;
      let entry = regionMap.get(reg.key);
      if (!entry) {
        entry = {
          region: reg.en,
          regionBn: reg.bn,
          level: topHazard.level,
          reasons: new Set(),
          reasonsBn: new Set(),
          news: [],
        };
        regionMap.set(reg.key, entry);
      }
      // Upgrade level: high > medium > low
      const rank = { high: 3, medium: 2, low: 1 } as const;
      if (rank[topHazard.level] > rank[entry.level]) entry.level = topHazard.level;
      entry.reasons.add(topHazard.en);
      entry.reasonsBn.add(topHazard.bn);
      if (entry.news.length < 3) entry.news.push(item);
    }
  }
  for (const v of regionMap.values()) regionAlerts.push(v);
  regionAlerts.sort((a, b) => {
    const r = { high: 3, medium: 2, low: 1 } as const;
    return r[b.level] - r[a.level];
  });

  const levelStyle = (l: "high" | "medium" | "low") => ({
    high: "border-red-600 bg-red-500/10 text-red-700 dark:text-red-300",
    medium: "border-orange-500 bg-orange-500/10 text-orange-700 dark:text-orange-300",
    low: "border-yellow-500 bg-yellow-500/10 text-yellow-700 dark:text-yellow-300",
  }[l]);
  const levelLabel = (l: "high" | "medium" | "low") =>
    isBn
      ? { high: "🚨 উচ্চ ঝুঁকি", medium: "⚠️ মাঝারি ঝুঁকি", low: "🟡 সতর্কতা" }[l]
      : { high: "🚨 High risk", medium: "⚠️ Moderate", low: "🟡 Advisory" }[l];
  const levelAdvice = (l: "high" | "medium" | "low") =>
    isBn
      ? {
          high: "এই মুহূর্তে ভ্রমণ এড়িয়ে চলুন। জরুরি না হলে যাত্রা স্থগিত করুন।",
          medium: "সাবধানে যাত্রা করুন, বিকল্প রুট রাখুন, সর্বশেষ আপডেট দেখুন।",
          low: "স্বাভাবিকের চেয়ে সতর্ক থাকুন, আবহাওয়ার আপডেট রাখুন।",
        }[l]
      : {
          high: "Avoid travel now. Postpone unless urgent.",
          medium: "Travel cautiously, keep backup routes, monitor updates.",
          low: "Stay extra alert; keep an eye on weather updates.",
        }[l];

  return (
    <Card className="mb-6 border-2 border-red-500/50 bg-gradient-to-br from-red-500/5 via-orange-500/5 to-background">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base md:text-lg">
          <div className="relative">
            <ShieldAlert className="w-5 h-5 text-red-600" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-ping" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
          </div>
          <span className="bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent font-bold">
            {isBn ? "🚨 লাইভ ভ্রমণ সতর্কতা" : "🚨 Live Travel Advisories"}
          </span>
          <Badge variant="outline" className="ml-auto text-[10px] gap-1">
            <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" /> LIVE
          </Badge>
          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={fetchNews} disabled={loading}>
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </CardTitle>
        <p className="text-[11px] text-muted-foreground">
          {isBn
            ? "রিয়েল-টাইম সংবাদ থেকে বাংলাদেশের কোন জেলায় বন্যা, ঘূর্ণিঝড়, ভূমিধস, অবরোধ বা অন্য ঝুঁকি আছে — প্রতি ৫ মিনিটে অটো-আপডেট।"
            : "Real-time news analysis of Bangladesh districts with floods, cyclones, landslides, unrest, or other risks — auto-refresh every 5 minutes."}
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading && regionAlerts.length === 0 && (
          <div className="flex justify-center py-6"><Loader2 className="w-6 h-6 animate-spin text-red-500" /></div>
        )}
        {!loading && regionAlerts.length === 0 && !error && (
          <div className="flex items-center gap-2 p-4 rounded-lg bg-green-500/10 border border-green-500/40 text-green-700 dark:text-green-300">
            <span className="text-2xl">✅</span>
            <div className="text-sm">
              {isBn
                ? "এই মুহূর্তে বাংলাদেশের কোনো জেলায় বড় ভ্রমণ ঝুঁকির খবর পাওয়া যায়নি। ভ্রমণ মোটামুটি নিরাপদ।"
                : "No major travel risks detected across Bangladesh right now. Travel appears generally safe."}
            </div>
          </div>
        )}
        {error && regionAlerts.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-4">
            {isBn ? "সংবাদ লোড করা যায়নি।" : "Couldn't load news."}
          </p>
        )}

        {regionAlerts.map((r, i) => (
          <div key={i} className={`p-4 rounded-lg border-l-4 ${levelStyle(r.level)}`}>
            <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
              <div className="font-bold text-base flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                {isBn ? r.regionBn : r.region}
              </div>
              <Badge variant="outline" className="text-[10px] font-bold tracking-wider">{levelLabel(r.level)}</Badge>
            </div>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {Array.from(isBn ? r.reasonsBn : r.reasons).map((rz, j) => (
                <Badge key={j} variant="secondary" className="text-[10px]">
                  <AlertTriangle className="w-3 h-3 mr-1" />{rz}
                </Badge>
              ))}
            </div>
            <p className="text-xs mb-2 font-medium opacity-90">💡 {levelAdvice(r.level)}</p>
            <div className="space-y-1 mt-2 pt-2 border-t border-current/20">
              {r.news.slice(0, 2).map((n, k) => (
                <a
                  key={k}
                  href={n.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-1.5 text-[11px] hover:underline opacity-80 hover:opacity-100"
                >
                  <ExternalLink className="w-3 h-3 flex-shrink-0 mt-0.5" />
                  <span className="line-clamp-1"><strong>{n.source}:</strong> {n.title}</span>
                </a>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default TravelAlerts;
