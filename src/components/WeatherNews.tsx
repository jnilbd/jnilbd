import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Newspaper, ExternalLink, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

type NewsItem = {
  title: string;
  link: string;
  pubDate: string;
  source: string;
  thumbnail?: string;
  description?: string;
};

const QUERIES_BN = [
  "বাংলাদেশ বন্যা",
  "ফেনী চট্টগ্রাম বন্যা",
  "ঘূর্ণিঝড় বাংলাদেশ",
  "বজ্রপাত বাংলাদেশ",
  "ভারী বৃষ্টি বাংলাদেশ",
];
const QUERIES_EN = [
  "Bangladesh flood",
  "Feni Chittagong flood",
  "Bangladesh cyclone",
  "Bangladesh storm weather",
  "Bangladesh heavy rain",
];

const stripHtml = (s: string) => s.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();

const timeAgo = (iso: string, isBn: boolean) => {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return isBn ? "এইমাত্র" : "just now";
  if (diff < 3600) return isBn ? `${Math.floor(diff / 60)} মিনিট আগে` : `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return isBn ? `${Math.floor(diff / 3600)} ঘণ্টা আগে` : `${Math.floor(diff / 3600)}h ago`;
  return isBn ? `${Math.floor(diff / 86400)} দিন আগে` : `${Math.floor(diff / 86400)}d ago`;
};

const WeatherNews = () => {
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
      const gl = "BD";
      const ceid = isBn ? "BD:bn" : "BD:en";
      const results = await Promise.allSettled(
        queries.map(async (q) => {
          const rss = `https://news.google.com/rss/search?q=${encodeURIComponent(q + " when:2d")}&hl=${hl}&gl=${gl}&ceid=${ceid}`;
          const url = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rss)}&count=6`;
          const res = await fetch(url);
          if (!res.ok) throw new Error("fetch failed");
          const data = await res.json();
          return (data.items || []) as any[];
        })
      );
      const merged: NewsItem[] = [];
      const seen = new Set<string>();
      for (const r of results) {
        if (r.status !== "fulfilled") continue;
        for (const it of r.value) {
          const key = (it.title || "").slice(0, 60);
          if (seen.has(key)) continue;
          seen.add(key);
          const desc = stripHtml(it.description || "");
          // Extract source from title suffix "... - Source"
          const m = (it.title || "").match(/ - ([^-]+)$/);
          merged.push({
            title: (it.title || "").replace(/ - [^-]+$/, "").trim(),
            link: it.link,
            pubDate: it.pubDate,
            source: m ? m[1].trim() : (it.author || "News"),
            thumbnail: it.thumbnail || it.enclosure?.link,
            description: desc.slice(0, 180),
          });
        }
      }
      merged.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
      setItems(merged.slice(0, 15));
      if (merged.length === 0) setError(true);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
    const iv = setInterval(fetchNews, 5 * 60 * 1000); // refresh every 5 min
    return () => clearInterval(iv);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isBn]);

  return (
    <Card className="mt-6 border-2 border-red-500/40 bg-gradient-to-br from-red-500/5 via-orange-500/5 to-background">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base md:text-lg">
          <div className="relative">
            <Newspaper className="w-5 h-5 text-red-600" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-ping" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
          </div>
          <span className="bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent font-bold">
            {isBn ? "🔴 লাইভ দুর্যোগ ও আবহাওয়া সংবাদ" : "🔴 Live Disaster & Weather News"}
          </span>
          <Badge variant="outline" className="ml-auto text-[10px] gap-1">
            <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
            LIVE
          </Badge>
          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={fetchNews} disabled={loading}>
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </CardTitle>
        <p className="text-[11px] text-muted-foreground">
          {isBn
            ? "বাংলাদেশজুড়ে বন্যা, ঝড়, বজ্রপাত ও ভারী বৃষ্টির সর্বশেষ খবর — প্রতি ৫ মিনিটে আপডেট"
            : "Latest floods, storms, lightning, and heavy rain across Bangladesh — refreshes every 5 minutes"}
        </p>
      </CardHeader>
      <CardContent className="space-y-2 max-h-[500px] overflow-y-auto">
        {loading && items.length === 0 && (
          <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-red-500" /></div>
        )}
        {error && items.length === 0 && !loading && (
          <p className="text-center text-sm text-muted-foreground py-6">
            {isBn ? "সংবাদ লোড করা যায়নি — কিছুক্ষণ পর আবার চেষ্টা করুন।" : "Couldn't load news. Try again shortly."}
          </p>
        )}
        {items.map((n, i) => (
          <a
            key={i}
            href={n.link}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex gap-3 p-3 rounded-lg border border-border/50 hover:border-red-500/50 hover:bg-red-500/5 transition-all"
          >
            {n.thumbnail && (
              <img
                src={n.thumbnail}
                alt=""
                loading="lazy"
                className="w-16 h-16 md:w-20 md:h-20 rounded-md object-cover flex-shrink-0"
                onError={(e) => ((e.currentTarget.style.display = "none"))}
              />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <Badge variant="secondary" className="text-[10px] py-0 px-1.5">{n.source}</Badge>
                <span className="text-[10px] text-muted-foreground">{timeAgo(n.pubDate, isBn)}</span>
              </div>
              <div className="text-sm font-semibold leading-snug group-hover:text-red-600 line-clamp-2">
                {n.title}
              </div>
              {n.description && (
                <div className="text-[11px] text-muted-foreground line-clamp-2 mt-1">{n.description}</div>
              )}
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 flex-shrink-0 mt-1" />
          </a>
        ))}
      </CardContent>
    </Card>
  );
};

export default WeatherNews;
