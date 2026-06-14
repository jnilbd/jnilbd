import { useEffect, useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  TrendingUp, TrendingDown, Loader2, RefreshCw, ExternalLink, BarChart3,
  AlertTriangle, ShieldCheck, Target, BookOpen, Wallet, CheckCircle2, Building2,
  Sparkles, AlertCircle, LineChart,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type NewsItem = { title: string; link: string; source: string; pubDate: string; description: string };

const BD_FEEDS = [
  { id: "stock_bd_bangla", label: "🇧🇩 বাংলা শেয়ারবাজার নিউজ" },
  { id: "stock_dse", label: "DSE (ঢাকা স্টক এক্সচেঞ্জ)" },
  { id: "stock_cse", label: "CSE (চিটাগাং স্টক এক্সচেঞ্জ)" },
  { id: "stock_ipo_bd", label: "IPO ও নতুন লিস্টিং" },
];

const WORLD_FEEDS = [
  { id: "stock_world", label: "🌍 গ্লোবাল মার্কেট (S&P, Nasdaq, Dow)" },
  { id: "stock_india", label: "🇮🇳 ভারত (Sensex, Nifty)" },
  { id: "stock_crypto", label: "₿ ক্রিপ্টো (Bitcoin, Ethereum)" },
];

const BD_SECTORS = [
  { name: "ব্যাংকিং", risk: "মাঝারি", potential: "ডিভিডেন্ড ভালো, প্রাইস স্থিতিশীল", note: "NPL বাড়লে চাপ" },
  { name: "ফার্মা", risk: "কম", potential: "রপ্তানি বৃদ্ধি — দীর্ঘমেয়াদে স্থিতিশীল", note: "Beacon, Square, Renata, Beximco Pharma" },
  { name: "টেলিকম", risk: "কম", potential: "ক্যাশ ফ্লো শক্তিশালী, ডিভিডেন্ড", note: "Grameenphone, Robi" },
  { name: "টেক্সটাইল / গার্মেন্টস", risk: "মাঝারি", potential: "রপ্তানি নির্ভর, ডলার রেটে সুবিধা", note: "অর্ডার কমলে চাপ" },
  { name: "ফুয়েল / পাওয়ার", risk: "মাঝারি-উচ্চ", potential: "সরকারি সাবসিডি ও LNG দামের উপর নির্ভর", note: "Summit, United Power" },
  { name: "সিমেন্ট / স্টিল", risk: "মাঝারি", potential: "অবকাঠামো প্রকল্পে চাহিদা", note: "কাঁচামাল আমদানি ঝুঁকি" },
  { name: "ফুড / FMCG", risk: "কম", potential: "ঘরোয়া চাহিদা স্থিতিশীল", note: "Olympic, Pran, BATBC" },
  { name: "মিউচুয়াল ফান্ড", risk: "কম-মাঝারি", potential: "Diversified, ছোট বিনিয়োগকারীর জন্য নিরাপদ", note: "NAV নিয়মিত দেখো" },
  { name: "জুট / সিরামিক / আইটি", risk: "উচ্চ", potential: "ছোট ক্যাপ — Volatility বেশি", note: "ম্যানিপুলেশন কমন" },
];

const RISK_FACTORS = [
  { t: "মার্কেট ম্যানিপুলেশন", d: "Junk শেয়ারে কৃত্রিম দাম বাড়ানো-কমানো; চক্র সক্রিয়। 'হঠাৎ ১০ দিন আপার সার্কিট' = বিপদ সংকেত।" },
  { t: "তথ্যের অসামঞ্জস্য (Insider Trading)", d: "কোম্পানির ভেতরের লোক আগে জানে; আপনি জানার আগেই দাম মুভ হয়ে যায়।" },
  { t: "তারল্য সংকট", d: "DSE-তে অনেক শেয়ার দিনে কয়েকশ ট্রেডও হয় না; বিক্রি করতে গেলে আটকে যাবেন।" },
  { t: "ম্যাক্রো ঝুঁকি", d: "টাকার অবমূল্যায়ন, সুদের হার, রাজনৈতিক অস্থিরতা, বৈদেশিক রিজার্ভ — সব মার্কেটে প্রভাব ফেলে।" },
  { t: "আবেগ-ভিত্তিক সিদ্ধান্ত (FOMO/Panic)", d: "মার্কেট পড়লে আতঙ্কে বিক্রি, বাড়লে লোভে কেনা — ৯০% বিনিয়োগকারী এখানেই হারে।" },
  { t: "Floor Price ফাঁদ", d: "Floor Price আরোপিত শেয়ার বিক্রি করা যায় না; ক্যাপিটাল আটকে পড়ে।" },
  { t: "Z-ক্যাটাগরি শেয়ার", d: "ডিভিডেন্ড দেয় না, AGM হয় না — মূলত জুয়া। সম্পূর্ণ এড়ানোই ভালো।" },
  { t: "অতিরিক্ত মার্জিন লোন", d: "ব্রোকার থেকে লোন নিয়ে ট্রেড — মার্কেট পড়লে Force Sell, পুঁজির চেয়ে বেশি হারাতে পারেন।" },
];

const FUNDAMENTAL_METRICS = [
  { metric: "P/E Ratio", good: "১০-২০", desc: "Share Price ÷ EPS। কম মানে সস্তা, বেশি মানে দামি (গ্রোথ স্টকে ব্যতিক্রম)।" },
  { metric: "EPS (Earnings Per Share)", good: "ক্রমবর্ধমান", desc: "প্রতি শেয়ারে কোম্পানির আয়। ৩-৫ বছরে বাড়ছে কিনা দেখো।" },
  { metric: "NAV (Net Asset Value)", good: "Market Price < 2x NAV", desc: "শেয়ারপ্রতি কোম্পানির প্রকৃত সম্পদ।" },
  { metric: "ROE (Return on Equity)", good: "১৫%+", desc: "ইকুইটির উপর কোম্পানি কত % লাভ করছে।" },
  { metric: "Debt-to-Equity", good: "< ১.০", desc: "ঋণ বনাম ইকুইটি। বেশি হলে আর্থিক ঝুঁকি।" },
  { metric: "Dividend Yield", good: "৪-৮%", desc: "(ডিভিডেন্ড ÷ Share Price) × ১০০। ক্যাশ ডিভিডেন্ড > স্টক ডিভিডেন্ড।" },
  { metric: "Free Float", good: "২৫%+", desc: "পাবলিকের হাতে কত % শেয়ার আছে। কম হলে ম্যানিপুলেশন সহজ।" },
  { metric: "Volume", good: "ধারাবাহিক", desc: "দৈনিক ট্রেডিং ভলিউম। হঠাৎ বাড়লে কারণ খুঁজো।" },
];

const STEPS = [
  { t: "১. BO অ্যাকাউন্ট খোলো", d: "যেকোনো ব্রোকার হাউসে (LankaBangla, IDLC, BRAC EPL, City Brokerage, EBL Securities)। NID + ছবি + ব্যাংক হিসাব + ৫০০৳ ফি।" },
  { t: "২. ছোট পুঁজি দিয়ে শুরু", d: "১০,০০০-৫০,০০০ টাকা দিয়ে শুরু করো — শেখার ফি হিসেবে ধরো। কখনো ধার করে বা ইমার্জেন্সি ফান্ড দিয়ে নয়।" },
  { t: "৩. ব্লু-চিপ শেয়ার বাছাই", d: "Grameenphone, Square Pharma, BATBC, Robi, BRAC Bank, Walton — শক্তিশালী ফান্ডামেন্টাল ও নিয়মিত ডিভিডেন্ড।" },
  { t: "৪. Diversification", d: "৫-৮টা ভিন্ন সেক্টরের শেয়ারে ভাগ করো। কোনো একটায় ২৫% এর বেশি নয়।" },
  { t: "৫. দীর্ঘমেয়াদ ধরো", d: "ভালো কোম্পানির শেয়ার ৩-৫ বছর ধরো — কম্পাউন্ডিং কাজ করবে। ডে-ট্রেডিং = বেশিরভাগের জন্য ক্ষতি।" },
  { t: "৬. SIP মাইন্ডসেট", d: "প্রতি মাসে নির্দিষ্ট টাকা একই শেয়ারে বিনিয়োগ করো — গড় দাম ভালো হবে।" },
  { t: "৭. রিপোর্ট পড়ো", d: "Annual Report, Quarterly Statement, Director's Report — কোম্পানির ওয়েবসাইট ও DSE-তে ফ্রি।" },
  { t: "৮. Stop-Loss সেট করো", d: "কেনা দামের -১৫% নিচে নেমে গেলে বিক্রি — ক্যাপিটাল রক্ষা সবার আগে।" },
];

const POTENTIAL = [
  { type: "ব্লু-চিপ (Long-term)", ret: "বছরে ১২-২০%", risk: "কম", best: "নতুন বিনিয়োগকারী" },
  { type: "মিড-ক্যাপ গ্রোথ", ret: "বছরে ১৮-৪০%", risk: "মাঝারি", best: "মাঝারি অভিজ্ঞতা" },
  { type: "ডিভিডেন্ড স্টক", ret: "৬-১০% ক্যাশ + ক্যাপিটাল গেইন", risk: "কম", best: "প্যাসিভ ইনকাম খুঁজছেন" },
  { type: "মিউচুয়াল ফান্ড (Closed-End)", ret: "৮-১৫%", risk: "কম-মাঝারি", best: "সময় কম, রিসার্চ করতে চান না" },
  { type: "IPO (নতুন লিস্টিং)", ret: "লিস্টিং দিনে ৫০-২০০%", risk: "মাঝারি", best: "লটারি — যেটা পাবেন ভাগ্য" },
  { type: "Junk / Z-ক্যাটাগরি", ret: "জুয়া", risk: "অত্যন্ত উচ্চ", best: "এড়িয়ে চলুন" },
];

const TIPS = [
  "৩-৬ মাসের ইমার্জেন্সি ফান্ড আগে গড়ুন, তারপর শেয়ার বাজারে নামুন",
  "কখনোই ১০০% পুঁজি একসাথে বিনিয়োগ নয় — ৩-৪ ধাপে বিনিয়োগ করুন",
  "টিপস-গ্রুপ, ফেসবুক/টেলিগ্রাম 'গুরু'দের ফলো করে ট্রেড = সর্বনাশ",
  "নিজে পড়ুন, নিজে বুঝুন — অন্যের কথায় বিনিয়োগ করলে দোষ অন্যের নয়, আপনার",
  "ক্যাশ ডিভিডেন্ড দেওয়া কোম্পানি > বোনাস/স্টক ডিভিডেন্ড দেওয়া কোম্পানি",
  "AGM-এ অংশ নিন — কোম্পানির আসল চেহারা বুঝবেন",
  "মার্কেট ক্র্যাশে ভালো শেয়ার কিনুন, বুমে বিক্রি করুন — উল্টোটা করেই অধিকাংশ মানুষ হারে",
  "ট্যাক্স রিবেট — ৩ লাখ টাকা পর্যন্ত স্টক বিনিয়োগে ১৫% রিবেট পাবেন (ধারা ৪৪)",
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
  const [fetchedAt, setFetchedAt] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.functions.invoke("politics-news", { body: { category } });
      if (error) throw error;
      setItems(data?.items ?? []);
      setFetchedAt(data?.fetchedAt ?? "");
    } catch (e: any) {
      setError(e?.message ?? "Failed");
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
        <p className="text-xs text-muted-foreground">{fetchedAt ? `সর্বশেষ: ${timeAgo(fetchedAt)}` : ""}</p>
        <Button size="sm" variant="outline" onClick={load} disabled={loading} className="gap-1">
          {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}রিফ্রেশ
        </Button>
      </div>
      {error && (
        <Card className="p-4 border-destructive/30 bg-destructive/5 flex gap-2"><AlertCircle className="h-4 w-4 text-destructive mt-0.5" /><p className="text-sm text-destructive">{error}</p></Card>
      )}
      {loading && items.length === 0 && <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>}
      <div className="grid gap-3">
        {items.map((it, i) => (
          <a key={i} href={it.link} target="_blank" rel="noopener noreferrer" className="block group">
            <Card className="p-4 hover:shadow-md transition-all hover:border-primary/40">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold leading-snug group-hover:text-primary">{it.title}</h3>
                  {it.description && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{it.description}</p>}
                  <div className="flex gap-2 mt-2 flex-wrap"><Badge variant="secondary" className="text-xs">{it.source}</Badge><span className="text-xs text-muted-foreground">{timeAgo(it.pubDate)}</span></div>
                </div>
                <ExternalLink className="h-4 w-4 text-muted-foreground shrink-0" />
              </div>
            </Card>
          </a>
        ))}
      </div>
      {!loading && items.length === 0 && !error && <Card className="p-8 text-center text-muted-foreground">কোনো সংবাদ নেই</Card>}
    </div>
  );
}

export default function Stocks() {
  const [bdActive, setBdActive] = useState(BD_FEEDS[0].id);
  const [worldActive, setWorldActive] = useState(WORLD_FEEDS[0].id);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <section className="border-b bg-gradient-to-br from-green-500/10 via-transparent to-blue-500/10">
        <div className="container mx-auto px-4 py-10 md:py-14">
          <Badge variant="secondary" className="mb-3 gap-1"><LineChart className="h-3 w-3" /> লাইভ • প্রতি ৫ মিনিটে অটো রিফ্রেশ</Badge>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-3 flex items-center gap-3">
            <BarChart3 className="h-8 w-8 md:h-12 md:w-12 text-primary" />
            স্টক আপডেট
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            ঢাকা ও চিটাগাং স্টক এক্সচেঞ্জের সর্বশেষ খবর, সেক্টর-ভিত্তিক বিশ্লেষণ, ঝুঁকি পর্যালোচনা, লাভের সম্ভাবনা ও বিনিয়োগ গাইডলাইন — সব এক জায়গায়।
          </p>
          <div className="flex flex-wrap gap-2 mt-4">
            <a href="https://www.dsebd.org" target="_blank" rel="noopener noreferrer">
              <Badge variant="outline" className="gap-1 cursor-pointer hover:bg-primary/10"><ExternalLink className="h-3 w-3" />DSE Live</Badge>
            </a>
            <a href="https://www.cse.com.bd" target="_blank" rel="noopener noreferrer">
              <Badge variant="outline" className="gap-1 cursor-pointer hover:bg-primary/10"><ExternalLink className="h-3 w-3" />CSE Live</Badge>
            </a>
            <a href="https://www.lankabd.com" target="_blank" rel="noopener noreferrer">
              <Badge variant="outline" className="gap-1 cursor-pointer hover:bg-primary/10"><ExternalLink className="h-3 w-3" />LankaBangla Research</Badge>
            </a>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 space-y-10">
        {/* Bangladesh Market */}
        <section>
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2"><Building2 className="h-5 w-5 text-primary" /> 🇧🇩 বাংলাদেশ শেয়ারবাজার (DSE / CSE)</h2>
          <Tabs value={bdActive} onValueChange={setBdActive}>
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto gap-1">
              {BD_FEEDS.map((f) => <TabsTrigger key={f.id} value={f.id} className="text-xs md:text-sm py-2">{f.label}</TabsTrigger>)}
            </TabsList>
            {BD_FEEDS.map((f) => <TabsContent key={f.id} value={f.id} className="mt-6"><NewsList category={f.id} /></TabsContent>)}
          </Tabs>
        </section>

        {/* Sector Analysis */}
        <section className="pt-6 border-t">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2"><Target className="h-5 w-5" /> সেক্টর-ভিত্তিক বিশ্লেষণ</h2>
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50"><tr>
                <th className="text-left p-3">সেক্টর</th><th className="text-left p-3">ঝুঁকি</th><th className="text-left p-3">সম্ভাবনা</th><th className="text-left p-3">নোট</th>
              </tr></thead>
              <tbody>
                {BD_SECTORS.map((s) => (
                  <tr key={s.name} className="border-t hover:bg-muted/30">
                    <td className="p-3 font-medium">{s.name}</td>
                    <td className="p-3"><Badge variant={s.risk.includes("উচ্চ") ? "destructive" : s.risk.includes("কম") ? "secondary" : "outline"}>{s.risk}</Badge></td>
                    <td className="p-3 text-muted-foreground">{s.potential}</td>
                    <td className="p-3 text-xs text-muted-foreground">{s.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Risk Review */}
        <section className="pt-6 border-t">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-destructive" /> ঝুঁকি পর্যালোচনা</h2>
          <div className="grid md:grid-cols-2 gap-3">
            {RISK_FACTORS.map((r) => (
              <Card key={r.t} className="p-4 border-l-4 border-l-destructive">
                <h3 className="font-semibold text-destructive mb-1">{r.t}</h3>
                <p className="text-sm text-muted-foreground">{r.d}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* Profit Potential */}
        <section className="pt-6 border-t">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2"><TrendingUp className="h-5 w-5 text-green-600" /> লাভের সম্ভাবনা ও বিনিয়োগ প্রকার</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {POTENTIAL.map((p) => (
              <Card key={p.type} className="p-5">
                <h3 className="font-bold mb-2">{p.type}</h3>
                <div className="space-y-1 text-sm">
                  <p className="flex justify-between"><span className="text-muted-foreground">রিটার্ন:</span> <span className="font-semibold text-green-600">{p.ret}</span></p>
                  <p className="flex justify-between"><span className="text-muted-foreground">ঝুঁকি:</span> <Badge variant={p.risk.includes("উচ্চ") ? "destructive" : "secondary"} className="text-xs">{p.risk}</Badge></p>
                  <p className="flex justify-between"><span className="text-muted-foreground">কার জন্য:</span> <span className="text-right">{p.best}</span></p>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Step-by-step guide */}
        <section className="pt-6 border-t">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2"><BookOpen className="h-5 w-5" /> ০ থেকে শুরু — পূর্ণাঙ্গ গাইডলাইন</h2>
          <div className="grid md:grid-cols-2 gap-3">
            {STEPS.map((s, i) => (
              <Card key={i} className="p-4 flex gap-3">
                <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold shrink-0">{i + 1}</div>
                <div>
                  <h3 className="font-semibold">{s.t}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{s.d}</p>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Fundamental Analysis */}
        <section className="pt-6 border-t">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2"><Sparkles className="h-5 w-5" /> ফান্ডামেন্টাল অ্যানালাইসিস মেট্রিক্স</h2>
          <Accordion type="single" collapsible className="bg-card border rounded-lg">
            {FUNDAMENTAL_METRICS.map((m) => (
              <AccordionItem key={m.metric} value={m.metric}>
                <AccordionTrigger className="px-4">
                  <div className="flex items-center justify-between w-full pr-4">
                    <span className="font-semibold">{m.metric}</span>
                    <Badge variant="outline" className="ml-2 text-xs">আদর্শ: {m.good}</Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 text-sm text-muted-foreground">{m.desc}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        {/* Pro Tips */}
        <section className="pt-6 border-t">
          <Card className="p-6 bg-gradient-to-br from-primary/10 to-accent/10 border-primary/30">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-primary" /> অভিজ্ঞদের পরামর্শ</h2>
            <ul className="space-y-2">
              {TIPS.map((t, i) => (
                <li key={i} className="flex gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" /><span>{t}</span>
                </li>
              ))}
            </ul>
          </Card>
        </section>

        {/* Global Markets */}
        <section className="pt-6 border-t">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2"><TrendingDown className="h-5 w-5" /> 🌍 আন্তর্জাতিক মার্কেট</h2>
          <Tabs value={worldActive} onValueChange={setWorldActive}>
            <TabsList className="grid w-full grid-cols-1 md:grid-cols-3 h-auto gap-1">
              {WORLD_FEEDS.map((f) => <TabsTrigger key={f.id} value={f.id} className="text-xs md:text-sm py-2">{f.label}</TabsTrigger>)}
            </TabsList>
            {WORLD_FEEDS.map((f) => <TabsContent key={f.id} value={f.id} className="mt-6"><NewsList category={f.id} /></TabsContent>)}
          </Tabs>
        </section>

        {/* Disclaimer */}
        <Card className="p-5 bg-amber-500/10 border-amber-500/30">
          <p className="text-sm flex gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <span><b>ডিসক্লেইমার:</b> এখানে দেওয়া সব তথ্য শিক্ষামূলক উদ্দেশ্যে। শেয়ার বাজারের বিনিয়োগ ঝুঁকিপূর্ণ — নিজের গবেষণা ছাড়া বা সার্টিফায়েড ইনভেস্টমেন্ট অ্যাডভাইজারের পরামর্শ ছাড়া বিনিয়োগ করবেন না। অতীতের পারফরম্যান্স ভবিষ্যৎ রিটার্নের নিশ্চয়তা নয়।</span>
          </p>
        </Card>
      </div>
    </div>
  );
}
