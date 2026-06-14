import { useEffect, useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, RefreshCw, ExternalLink, Swords, Flame, HeartHandshake, AlertCircle, ShieldAlert } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type NewsItem = { title: string; link: string; source: string; pubDate: string; description: string };

const OVERVIEW = { id: "war_overview", label: "সার্বিক যুদ্ধ পরিস্থিতি", flag: "🌐" };

const ACTIVE_WARS = [
  { id: "war_ukraine", label: "রাশিয়া-ইউক্রেন", flag: "🇷🇺🇺🇦", status: "চলমান", since: "ফেব্রু ২০২২", desc: "পূর্ব ও দক্ষিণ ইউক্রেনে ফ্রন্টলাইন যুদ্ধ; ড্রোন ও মিসাইল হামলা।" },
  { id: "war_gaza", label: "ইসরায়েল-গাজা", flag: "🇮🇱🇵🇸", status: "চলমান", since: "অক্টো ২০২৩", desc: "গাজা উপত্যকায় বিমান ও স্থল হামলা; মানবিক বিপর্যয়।" },
  { id: "war_lebanon", label: "ইসরায়েল-লেবানন (হিজবুল্লাহ)", flag: "🇮🇱🇱🇧", status: "চলমান", since: "২০২৪", desc: "দক্ষিণ লেবাননে সংঘর্ষ ও সীমান্ত পার গুলিবর্ষণ।" },
  { id: "war_iran", label: "ইরান-ইসরায়েল উত্তেজনা", flag: "🇮🇷🇮🇱", status: "উত্তপ্ত", since: "২০২৪", desc: "সরাসরি মিসাইল-ড্রোন বিনিময় ও প্রক্সি হামলা।" },
  { id: "war_yemen", label: "ইয়েমেন-হুথি / রেড সি", flag: "🇾🇪", status: "চলমান", since: "২০২৩", desc: "লোহিত সাগরে জাহাজে হামলা; মার্কিন-ব্রিটিশ পাল্টা হামলা।" },
  { id: "war_sudan", label: "সুদান গৃহযুদ্ধ", flag: "🇸🇩", status: "তীব্র", since: "এপ্রিল ২০২৩", desc: "সেনাবাহিনী বনাম RSF; বিশ্বের বৃহত্তম মানবিক সংকট।" },
  { id: "war_myanmar", label: "মিয়ানমার গৃহযুদ্ধ", flag: "🇲🇲", status: "চলমান", since: "২০২১", desc: "জান্তা বনাম PDF ও জাতিগত সশস্ত্র গোষ্ঠী; বাংলাদেশ সীমান্তে চাপ।" },
  { id: "war_africa", label: "আফ্রিকা (কঙ্গো, সাহেল)", flag: "🌍", status: "চলমান", since: "চলমান", desc: "DRC-তে M23, সাহেলে জিহাদি সংঘর্ষ।" },
];

const FLASHPOINTS = [
  { id: "war_taiwan", label: "তাইওয়ান প্রণালী", flag: "🇹🇼🇨🇳", desc: "চীনের সামরিক মহড়া বৃদ্ধি; সম্ভাব্য সংঘর্ষের ঝুঁকি।" },
  { id: "war_kashmir", label: "ভারত-পাকিস্তান সীমান্ত", flag: "🇮🇳🇵🇰", desc: "কাশ্মীর LoC তে গোলাগুলি ও কূটনৈতিক উত্তেজনা।" },
];

const THEMES = [
  { id: "war_ceasefire", label: "যুদ্ধবিরতি ও শান্তি আলোচনা", icon: HeartHandshake, color: "text-green-600" },
  { id: "war_humanitarian", label: "মানবিক সংকট ও হতাহত", icon: ShieldAlert, color: "text-red-600" },
  { id: "war_bangla", label: "বাংলা ভাষায় যুদ্ধের খবর", icon: Flame, color: "text-orange-600" },
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

function NewsList({ category }: { category: string }) {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fetchedAt, setFetchedAt] = useState<string>("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.functions.invoke("politics-news", { body: { category } });
      if (error) throw error;
      setItems(data?.items ?? []);
      setFetchedAt(data?.fetchedAt ?? "");
    } catch (e: any) {
      setError(e?.message ?? "Failed to load news");
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => {
    load();
    const t = setInterval(load, 5 * 60 * 1000);
    return () => clearInterval(t);
  }, [load]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">{fetchedAt ? `সর্বশেষ আপডেট: ${timeAgo(fetchedAt)}` : ""}</p>
        <Button size="sm" variant="outline" onClick={load} disabled={loading} className="gap-1">
          {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
          রিফ্রেশ
        </Button>
      </div>

      {error && (
        <Card className="p-4 border-destructive/30 bg-destructive/5 flex gap-2 items-start">
          <AlertCircle className="h-4 w-4 text-destructive mt-0.5" />
          <p className="text-sm text-destructive">{error}</p>
        </Card>
      )}

      {loading && items.length === 0 && (
        <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      )}

      <div className="grid gap-3">
        {items.map((it, i) => (
          <a key={i} href={it.link} target="_blank" rel="noopener noreferrer" className="block group">
            <Card className="p-4 hover:shadow-md transition-all hover:border-primary/40">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold leading-snug group-hover:text-primary transition-colors">{it.title}</h3>
                  {it.description && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{it.description}</p>}
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <Badge variant="secondary" className="text-xs">{it.source}</Badge>
                    <span className="text-xs text-muted-foreground">{timeAgo(it.pubDate)}</span>
                  </div>
                </div>
                <ExternalLink className="h-4 w-4 text-muted-foreground shrink-0 group-hover:text-primary" />
              </div>
            </Card>
          </a>
        ))}
      </div>

      {!loading && items.length === 0 && !error && (
        <Card className="p-8 text-center text-muted-foreground">কোনো সংবাদ পাওয়া যায়নি</Card>
      )}
    </div>
  );
}

export default function WarUpdates() {
  const [active, setActive] = useState(OVERVIEW.id);
  const [flashActive, setFlashActive] = useState(FLASHPOINTS[0].id);
  const [themeActive, setThemeActive] = useState(THEMES[0].id);
  const activeWar = ACTIVE_WARS.find((w) => w.id === active);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <section className="border-b bg-gradient-to-br from-destructive/10 via-transparent to-orange-500/10">
        <div className="container mx-auto px-4 py-10 md:py-14">
          <Badge variant="destructive" className="mb-3 gap-1">
            <Flame className="h-3 w-3" /> লাইভ • প্রতি ৫ মিনিটে অটো রিফ্রেশ
          </Badge>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-3 flex items-center gap-3">
            <Swords className="h-8 w-8 md:h-12 md:w-12 text-destructive" />
            যুদ্ধ আপডেট
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            বিশ্বের কোথায় এখন যুদ্ধ চলছে, কে কাকে আক্রমণ করছে, কে এগিয়ে, যুদ্ধবিরতির আলোচনা, মানবিক সংকট — সবকিছুর সর্বশেষ খবর এক জায়গায়।
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 space-y-10">
        {/* Active wars overview cards */}
        <section>
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Flame className="h-5 w-5 text-destructive" /> এই মুহূর্তে চলমান যুদ্ধসমূহ
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            {ACTIVE_WARS.map((w) => (
              <button
                key={w.id}
                onClick={() => setActive(w.id)}
                className={`text-left p-4 rounded-lg border transition-all hover:shadow-md ${
                  active === w.id ? "border-destructive bg-destructive/5 shadow-md" : "bg-card hover:border-primary/40"
                }`}
              >
                <div className="text-2xl mb-1">{w.flag}</div>
                <h3 className="font-semibold text-sm">{w.label}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={w.status === "তীব্র" ? "destructive" : "secondary"} className="text-xs">{w.status}</Badge>
                  <span className="text-xs text-muted-foreground">{w.since}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{w.desc}</p>
              </button>
            ))}
            <button
              onClick={() => setActive(OVERVIEW.id)}
              className={`text-left p-4 rounded-lg border transition-all hover:shadow-md ${
                active === OVERVIEW.id ? "border-primary bg-primary/5 shadow-md" : "bg-card hover:border-primary/40"
              }`}
            >
              <div className="text-2xl mb-1">{OVERVIEW.flag}</div>
              <h3 className="font-semibold text-sm">{OVERVIEW.label}</h3>
              <p className="text-xs text-muted-foreground mt-2">বিশ্বব্যাপী সব যুদ্ধের সর্বশেষ সংবাদ</p>
            </button>
          </div>

          <Card className="p-5">
            <h3 className="font-bold mb-3">
              📰 {activeWar?.label ?? OVERVIEW.label} — সর্বশেষ খবর
            </h3>
            <NewsList category={active} />
          </Card>
        </section>

        {/* Flashpoints */}
        <section className="pt-6 border-t">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-orange-600" /> উত্তপ্ত / সম্ভাব্য সংঘাত
          </h2>
          <Tabs value={flashActive} onValueChange={setFlashActive}>
            <TabsList className="grid w-full grid-cols-2 h-auto gap-1">
              {FLASHPOINTS.map((f) => (
                <TabsTrigger key={f.id} value={f.id} className="text-xs md:text-sm py-2">
                  <span className="mr-1">{f.flag}</span>{f.label}
                </TabsTrigger>
              ))}
            </TabsList>
            {FLASHPOINTS.map((f) => (
              <TabsContent key={f.id} value={f.id} className="mt-4">
                <p className="text-sm text-muted-foreground mb-3">{f.desc}</p>
                <NewsList category={f.id} />
              </TabsContent>
            ))}
          </Tabs>
        </section>

        {/* Themes: ceasefire, humanitarian, bangla */}
        <section className="pt-6 border-t">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <HeartHandshake className="h-5 w-5 text-green-600" /> বিষয়ভিত্তিক আপডেট
          </h2>
          <Tabs value={themeActive} onValueChange={setThemeActive}>
            <TabsList className="grid w-full grid-cols-1 md:grid-cols-3 h-auto gap-1">
              {THEMES.map((t) => (
                <TabsTrigger key={t.id} value={t.id} className="text-xs md:text-sm py-2">
                  <t.icon className={`h-3.5 w-3.5 mr-1 ${t.color}`} />{t.label}
                </TabsTrigger>
              ))}
            </TabsList>
            {THEMES.map((t) => (
              <TabsContent key={t.id} value={t.id} className="mt-4">
                <NewsList category={t.id} />
              </TabsContent>
            ))}
          </Tabs>
        </section>
      </div>
    </div>
  );
}
