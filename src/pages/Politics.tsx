import { useEffect, useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, RefreshCw, ExternalLink, Flag, Globe, Newspaper, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";

type NewsItem = { title: string; link: string; source: string; pubDate: string; description: string };

const BD_PARTIES = [
  { id: "awami", label: "আওয়ামী লীগ", en: "Awami League", color: "bg-green-600", icon: "🟢" },
  { id: "bnp", label: "বিএনপি", en: "BNP", color: "bg-red-600", icon: "🔴" },
  { id: "jamaat", label: "জামায়াতে ইসলামী", en: "Jamaat-e-Islami", color: "bg-emerald-700", icon: "🟢" },
  { id: "ncp", label: "এনসিপি", en: "NCP", color: "bg-blue-600", icon: "🔵" },
  { id: "bd", label: "সার্বিক বাংলাদেশ", en: "Bangladesh Overall", color: "bg-primary", icon: "🇧🇩" },
];

const WORLD = [
  { id: "india", label: "ভারত", en: "India", flag: "🇮🇳" },
  { id: "pakistan", label: "পাকিস্তান", en: "Pakistan", flag: "🇵🇰" },
  { id: "usa", label: "যুক্তরাষ্ট্র", en: "USA", flag: "🇺🇸" },
  { id: "china", label: "চীন", en: "China", flag: "🇨🇳" },
  { id: "middleeast", label: "মধ্যপ্রাচ্য", en: "Middle East", flag: "🕌" },
  { id: "world", label: "বিশ্ব রাজনীতি", en: "World", flag: "🌍" },
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
    const t = setInterval(load, 5 * 60 * 1000); // auto-refresh every 5 min
    return () => clearInterval(t);
  }, [load]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {fetchedAt ? `সর্বশেষ আপডেট: ${timeAgo(fetchedAt)}` : ""}
        </p>
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
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      )}

      <div className="grid gap-3">
        {items.map((it, i) => (
          <a
            key={i}
            href={it.link}
            target="_blank"
            rel="noopener noreferrer"
            className="block group"
          >
            <Card className="p-4 hover:shadow-md transition-all hover:border-primary/40">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold leading-snug group-hover:text-primary transition-colors">
                    {it.title}
                  </h3>
                  {it.description && (
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{it.description}</p>
                  )}
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

export default function Politics() {
  const { language } = useLanguage();
  const isBn = language === "bn";
  const [bdActive, setBdActive] = useState(BD_PARTIES[0].id);
  const [worldActive, setWorldActive] = useState(WORLD[0].id);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <section className="border-b">
        <div className="container mx-auto px-4 py-10 md:py-14">
          <Badge variant="secondary" className="mb-3 gap-1">
            <Newspaper className="h-3 w-3" /> {isBn ? "লাইভ আপডেট • প্রতি ৫ মিনিটে রিফ্রেশ" : "Live • Auto-refresh"}
          </Badge>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-3">
            {isBn ? "রাজনীতি আপডেট" : "Politics Update"}
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            {isBn
              ? "বাংলাদেশের প্রধান রাজনৈতিক দল ও বিশ্ব রাজনীতির সর্বশেষ খবর এক জায়গায়।"
              : "Latest news from Bangladesh's major political parties and global politics in one place."}
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 space-y-10">
        {/* Bangladesh Section */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Flag className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-bold">🇧🇩 বাংলাদেশের রাজনীতি</h2>
          </div>

          <Tabs value={bdActive} onValueChange={setBdActive}>
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 h-auto gap-1">
              {BD_PARTIES.map((p) => (
                <TabsTrigger key={p.id} value={p.id} className="text-xs md:text-sm py-2">
                  <span className="mr-1">{p.icon}</span>{p.label}
                </TabsTrigger>
              ))}
            </TabsList>
            {BD_PARTIES.map((p) => (
              <TabsContent key={p.id} value={p.id} className="mt-6">
                <NewsList category={p.id} />
              </TabsContent>
            ))}
          </Tabs>
        </section>

        {/* World Section */}
        <section className="pt-6 border-t">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-bold">🌍 আন্তর্জাতিক রাজনীতি</h2>
          </div>

          <Tabs value={worldActive} onValueChange={setWorldActive}>
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-6 h-auto gap-1">
              {WORLD.map((w) => (
                <TabsTrigger key={w.id} value={w.id} className="text-xs md:text-sm py-2">
                  <span className="mr-1">{w.flag}</span>{w.label}
                </TabsTrigger>
              ))}
            </TabsList>
            {WORLD.map((w) => (
              <TabsContent key={w.id} value={w.id} className="mt-6">
                <NewsList category={w.id} />
              </TabsContent>
            ))}
          </Tabs>
        </section>
      </div>
    </div>
  );
}
