import { useEffect, useState, useCallback, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, RefreshCw, ExternalLink, Newspaper, Search, AlertCircle, Calendar, Globe } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type NewsItem = { title: string; link: string; source: string; pubDate: string; description: string };

type Paper = {
  id: string;
  name: string;
  lang: "bn" | "en";
  site: string;
  type: "national" | "english" | "online";
  popular?: boolean;
};

const PAPERS: Paper[] = [
  // Top Bengali dailies
  { id: "np_prothomalo", name: "প্রথম আলো", lang: "bn", site: "prothomalo.com", type: "national", popular: true },
  { id: "np_bdpratidin", name: "বাংলাদেশ প্রতিদিন", lang: "bn", site: "bd-pratidin.com", type: "national", popular: true },
  { id: "np_kalerkantho", name: "কালের কণ্ঠ", lang: "bn", site: "kalerkantho.com", type: "national", popular: true },
  { id: "np_jugantor", name: "যুগান্তর", lang: "bn", site: "jugantor.com", type: "national", popular: true },
  { id: "np_ittefaq", name: "ইত্তেফাক", lang: "bn", site: "ittefaq.com.bd", type: "national", popular: true },
  { id: "np_samakal", name: "সমকাল", lang: "bn", site: "samakal.com", type: "national", popular: true },
  { id: "np_manabzamin", name: "মানবজমিন", lang: "bn", site: "mzamin.com", type: "national" },
  { id: "np_inqilab", name: "ইনকিলাব", lang: "bn", site: "dailyinqilab.com", type: "national" },
  { id: "np_nayadiganta", name: "নয়া দিগন্ত", lang: "bn", site: "dailynayadiganta.com", type: "national" },
  { id: "np_amaderorshomoy", name: "আমাদের সময়", lang: "bn", site: "dainikamadershomoy.com", type: "national" },
  { id: "np_jaijaidin", name: "যায় যায় দিন", lang: "bn", site: "jaijaidinbd.com", type: "national" },
  // Online Bengali
  { id: "np_jagonews24", name: "জাগো নিউজ ২৪", lang: "bn", site: "jagonews24.com", type: "online", popular: true },
  { id: "np_banglatribune", name: "বাংলা ট্রিবিউন", lang: "bn", site: "banglatribune.com", type: "online" },
  { id: "np_bdnews24", name: "বিডিনিউজ ২৪", lang: "bn", site: "bdnews24.com", type: "online", popular: true },
  { id: "np_bbcbangla", name: "BBC বাংলা", lang: "bn", site: "bbc.com/bengali", type: "online", popular: true },
  { id: "np_dailystar_bn", name: "দ্য ডেইলি স্টার (বাংলা)", lang: "bn", site: "bangla.thedailystar.net", type: "online" },
  // English
  { id: "np_dailystar", name: "The Daily Star", lang: "en", site: "thedailystar.net", type: "english", popular: true },
  { id: "np_dhakatribune", name: "Dhaka Tribune", lang: "en", site: "dhakatribune.com", type: "english", popular: true },
  { id: "np_newage", name: "New Age", lang: "en", site: "newagebd.net", type: "english" },
  { id: "np_observer", name: "The Daily Observer", lang: "en", site: "observerbd.com", type: "english" },
  { id: "np_financialexpress", name: "Financial Express", lang: "en", site: "thefinancialexpress.com.bd", type: "english" },
  { id: "np_businessstandard", name: "The Business Standard", lang: "en", site: "tbsnews.net", type: "english", popular: true },
];

function timeAgo(date: string) {
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";
  const sec = Math.floor((Date.now() - d.getTime()) / 1000);
  if (sec < 60) return `${sec} সেকেন্ড আগে`;
  if (sec < 3600) return `${Math.floor(sec / 60)} মিনিট আগে`;
  if (sec < 86400) return `${Math.floor(sec / 3600)} ঘণ্টা আগে`;
  return `${Math.floor(sec / 86400)} দিন আগে`;
}

function isToday(date: string) {
  const d = new Date(date);
  if (isNaN(d.getTime())) return false;
  const now = new Date();
  return d.toDateString() === now.toDateString();
}

function PaperHeadlines({ paper }: { paper: Paper }) {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fetchedAt, setFetchedAt] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.functions.invoke("politics-news", { body: { category: paper.id } });
      if (error) throw error;
      setItems(data?.items ?? []);
      setFetchedAt(data?.fetchedAt ?? "");
    } catch (e: any) {
      setError(e?.message ?? "Failed");
    } finally {
      setLoading(false);
    }
  }, [paper.id]);

  useEffect(() => {
    load();
  }, [load]);

  const todayCount = items.filter((i) => isToday(i.pubDate)).length;

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-2 mb-4 flex-wrap">
        <div>
          <h3 className="text-xl font-bold flex items-center gap-2">
            📰 {paper.name}
            {paper.popular && <Badge variant="secondary" className="text-xs">জনপ্রিয়</Badge>}
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            {paper.site} • {todayCount} টি আজকের সংবাদ
            {fetchedAt && ` • সর্বশেষ: ${timeAgo(fetchedAt)}`}
          </p>
        </div>
        <div className="flex gap-2">
          <a href={`https://${paper.site}`} target="_blank" rel="noopener noreferrer">
            <Button size="sm" variant="outline" className="gap-1"><ExternalLink className="h-3 w-3" />সাইট</Button>
          </a>
          <Button size="sm" variant="outline" onClick={load} disabled={loading} className="gap-1">
            {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
          </Button>
        </div>
      </div>

      {error && (
        <Card className="p-3 border-destructive/30 bg-destructive/5 flex gap-2 mb-3">
          <AlertCircle className="h-4 w-4 text-destructive mt-0.5" /><p className="text-xs text-destructive">{error}</p>
        </Card>
      )}

      {loading && items.length === 0 && (
        <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
      )}

      <div className="space-y-2">
        {items.slice(0, 12).map((it, i) => (
          <a key={i} href={it.link} target="_blank" rel="noopener noreferrer" className="block group p-3 rounded-md hover:bg-muted/50 transition-colors border-l-2 border-l-transparent hover:border-l-primary">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm leading-snug group-hover:text-primary line-clamp-2">{it.title}</h4>
                {it.description && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{it.description}</p>
                )}
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="text-xs text-muted-foreground">{timeAgo(it.pubDate)}</span>
                  {isToday(it.pubDate) && <Badge variant="outline" className="text-[10px] py-0 h-4 border-green-500/50 text-green-600">আজ</Badge>}
                </div>
              </div>
              <ExternalLink className="h-3 w-3 text-muted-foreground shrink-0 mt-1" />
            </div>
          </a>
        ))}
      </div>

      {!loading && items.length === 0 && !error && (
        <p className="text-center text-sm text-muted-foreground py-6">কোনো সংবাদ পাওয়া যায়নি</p>
      )}
    </Card>
  );
}

export default function Newspapers() {
  const [q, setQ] = useState("");
  const [type, setType] = useState<"all" | "national" | "online" | "english">("all");

  const today = useMemo(
    () => new Date().toLocaleDateString("bn-BD", { weekday: "long", year: "numeric", month: "long", day: "numeric" }),
    []
  );

  const filtered = useMemo(() => {
    return PAPERS.filter((p) => {
      if (type !== "all" && p.type !== type) return false;
      if (q && !p.name.toLowerCase().includes(q.toLowerCase()) && !p.site.includes(q.toLowerCase())) return false;
      return true;
    }).sort((a, b) => (b.popular ? 1 : 0) - (a.popular ? 1 : 0));
  }, [q, type]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <section className="border-b bg-gradient-to-br from-primary/10 via-transparent to-accent/10">
        <div className="container mx-auto px-4 py-10 md:py-14">
          <Badge variant="secondary" className="mb-3 gap-1">
            <Calendar className="h-3 w-3" /> {today}
          </Badge>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-3 flex items-center gap-3">
            <Newspaper className="h-8 w-8 md:h-12 md:w-12 text-primary" />
            সংবাদপত্র
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            বাংলাদেশের শীর্ষ সকল দৈনিক ও অনলাইন সংবাদপত্রের আজকের গুরুত্বপূর্ণ হেডলাইন — প্রতিনিয়ত স্বয়ংক্রিয়ভাবে আপডেট হয়, তারিখ ও সময়সহ।
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* Filters */}
        <Card className="p-4 sticky top-16 z-10 backdrop-blur bg-background/95">
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="সংবাদপত্র খুঁজুন (যেমন: প্রথম আলো, Daily Star)..." value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
            </div>
            <div className="flex gap-1 flex-wrap">
              {([
                { v: "all", l: "সব" },
                { v: "national", l: "জাতীয় (বাংলা)" },
                { v: "online", l: "অনলাইন" },
                { v: "english", l: "ইংরেজি" },
              ] as const).map((t) => (
                <Button key={t.v} size="sm" variant={type === t.v ? "default" : "outline"} onClick={() => setType(t.v)}>
                  {t.l}
                </Button>
              ))}
            </div>
            <Badge variant="outline" className="shrink-0">{filtered.length} টি সংবাদপত্র</Badge>
          </div>
        </Card>

        {/* Today's Top Headlines aggregate */}
        <Card className="p-6 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/30">
          <h2 className="text-xl font-bold mb-1 flex items-center gap-2"><Globe className="h-5 w-5 text-primary" /> আজকের শীর্ষ সংবাদ (সম্মিলিত)</h2>
          <p className="text-sm text-muted-foreground mb-4">সব সংবাদপত্র থেকে আজকের সবচেয়ে গুরুত্বপূর্ণ খবরগুলো এক জায়গায়</p>
          <PaperHeadlines paper={{ id: "np_today_top", name: "শীর্ষ সংবাদ", lang: "bn", site: "all", type: "national" }} />
        </Card>

        {/* Individual papers grid */}
        <div className="grid md:grid-cols-2 gap-4">
          {filtered.map((p) => (
            <PaperHeadlines key={p.id} paper={p} />
          ))}
        </div>

        {filtered.length === 0 && (
          <Card className="p-10 text-center text-muted-foreground">কোনো সংবাদপত্র খুঁজে পাওয়া যায়নি</Card>
        )}
      </div>
    </div>
  );
}
