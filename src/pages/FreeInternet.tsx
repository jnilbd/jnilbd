import { useState } from "react";
import { motion } from "framer-motion";
import { Wifi, Loader2, Phone, Settings, Gift, AlertTriangle, ExternalLink, RefreshCcw, Radio } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Item = {
  title: string;
  link: string;
  source: string;
  pubDate: string;
  description: string;
  image?: string;
};

const operators = [
  { id: "grameenphone", name: "Grameenphone (GP)", color: "from-blue-600 to-cyan-500", code: "*121#" },
  { id: "robi", name: "Robi", color: "from-red-600 to-orange-500", code: "*123#" },
  { id: "banglalink", name: "Banglalink", color: "from-orange-500 to-yellow-500", code: "*121#" },
  { id: "airtel", name: "Airtel", color: "from-red-500 to-pink-500", code: "*121#" },
  { id: "teletalk", name: "Teletalk", color: "from-emerald-600 to-green-500", code: "*152#" },
];

const timeAgo = (iso: string, bn: boolean) => {
  const t = Date.parse(iso);
  if (!t) return "";
  const diff = Math.max(0, Date.now() - t);
  const m = Math.floor(diff / 60000);
  if (m < 1) return bn ? "এইমাত্র" : "just now";
  if (m < 60) return bn ? `${m} মিনিট আগে` : `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return bn ? `${h} ঘন্টা আগে` : `${h}h ago`;
  const d = Math.floor(h / 24);
  return bn ? `${d} দিন আগে` : `${d}d ago`;
};

const FreeInternet = () => {
  const { language } = useLanguage();
  const bn = language === "bn";
  const [op, setOp] = useState<string | null>(null);
  const [topic, setTopic] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<Item[]>([]);

  const topics = [
    { id: "cheap-mb", icon: Gift, label: bn ? "সস্তা MB" : "Cheap MB" },
    { id: "social-packs", icon: Wifi, label: bn ? "সোশ্যাল" : "Social" },
    { id: "night-packs", icon: Radio, label: bn ? "নাইট প্যাক" : "Night" },
    { id: "emergency-balance", icon: Phone, label: bn ? "ইমার্জেন্সি" : "Emergency" },
  ];


  const load = async (selectedTopic: string) => {
    if (!op) return;
    setTopic(selectedTopic);
    setLoading(true);
    setItems([]);
    try {
      const { data, error } = await supabase.functions.invoke("free-internet-guide", {
        body: { operator: op, topic: selectedTopic, language },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      setItems(((data as any)?.items || []) as Item[]);
    } catch (e: any) {
      toast.error(e?.message || (bn ? "লোড করা যায়নি" : "Failed to load"));
    } finally {
      setLoading(false);
    }
  };

  const selectedOp = operators.find((o) => o.id === op);

  return (
    <div className="container py-6 lg:py-10 max-w-5xl space-y-5">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl gradient-bg-cool text-white flex items-center justify-center shadow-glow">
          <Wifi className="w-6 h-6" />
        </div>
        <div>
          <h1 className="font-display text-2xl lg:text-3xl font-bold">
            {bn ? "ফ্রি ইন্টারনেট গাইড" : "Free Internet Guide"}
          </h1>
          <p className="text-xs text-muted-foreground">
            {bn
              ? "লাইভ Google News + অপারেটর ব্লগ থেকে রিয়েল-টাইম অফার (AI নয়)"
              : "Real-time offers pulled live from Google News + operator blogs (no AI)"}
          </p>
        </div>
      </motion.div>

      <Card className="border-amber-500/30 bg-amber-500/5">
        <CardContent className="p-3 flex gap-2 text-xs text-amber-700 dark:text-amber-400">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <p>
            {bn
              ? "সব অফার অপারেটরের পরিবর্তন সাপেক্ষ। ফলাফল সরাসরি সোর্স ওয়েবসাইটে যায় — আমরা কিছু হোস্ট করি না।"
              : "All offers are subject to operator changes. Links open the original source — we don't host any content."}
          </p>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-sm font-semibold mb-2 text-muted-foreground uppercase tracking-wider">
          {bn ? "১. আপনার সিম বেছে নিন" : "1. Choose your SIM"}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {operators.map((o) => (
            <button
              key={o.id}
              onClick={() => { setOp(o.id); load("cheap-mb", o.id); }}
              className={`p-3 rounded-2xl text-white text-left bg-gradient-to-br ${o.color} transition-bounce ${op === o.id ? "ring-4 ring-primary/60 scale-[1.02]" : "opacity-80 hover:opacity-100"}`}
            >
              <div className="text-sm font-bold leading-tight">{o.name}</div>
              <div className="text-[10px] opacity-90 mt-1">USSD: {o.code}</div>
            </button>
          ))}
        </div>
      </div>

      {op && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-thin">
            {topics.map((tp) => (
              <button
                key={tp.id}
                onClick={() => load(tp.id)}
                disabled={loading}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium whitespace-nowrap transition-smooth ${topic === tp.id ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:border-primary/50"} disabled:opacity-50`}
              >
                <tp.icon className="w-3.5 h-3.5" />
                {tp.label}
              </button>
            ))}
          </div>
        </motion.div>
      )}


      {(loading || items.length > 0) && (
        <Card className="overflow-hidden">
          <CardContent className="p-4 sm:p-5">
            {selectedOp && (
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                <Badge className={`bg-gradient-to-r ${selectedOp.color} text-white border-0`}>{selectedOp.name}</Badge>
                {topic && <Badge variant="outline">{topics.find((t) => t.id === topic)?.label}</Badge>}
                <Badge variant="secondary" className="text-[10px]">
                  <Radio className="w-3 h-3 mr-1" /> {bn ? "লাইভ সোর্স" : "Live source"}
                </Badge>
                <Button
                  variant="ghost" size="sm" className="h-7 ml-auto"
                  disabled={loading} onClick={() => topic && load(topic)}
                >
                  <RefreshCcw className={`w-3.5 h-3.5 mr-1 ${loading ? "animate-spin" : ""}`} />
                  {bn ? "রিফ্রেশ" : "Refresh"}
                </Button>
              </div>
            )}

            {loading ? (
              <div className="flex items-center justify-center py-12 gap-2 text-muted-foreground">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-sm">{bn ? "সর্বশেষ তথ্য আনা হচ্ছে..." : "Fetching latest..."}</span>
              </div>
            ) : items.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-8">
                {bn ? "কোনো ফলাফল পাওয়া যায়নি। অন্য টপিক ট্রাই করুন।" : "No results. Try another topic."}
              </p>
            ) : (
              <ul className="divide-y divide-border">
                {items.map((it, i) => (
                  <li key={i} className="py-3 first:pt-0 last:pb-0">
                    <a
                      href={it.link} target="_blank" rel="noopener noreferrer"
                      className="group flex gap-3"
                    >
                      {it.image ? (
                        <img src={it.image} alt="" loading="lazy"
                          className="w-16 h-16 rounded-lg object-cover shrink-0 border border-border" />
                      ) : (
                        <div className="w-16 h-16 rounded-lg gradient-bg-cool/20 bg-muted flex items-center justify-center shrink-0">
                          <Wifi className="w-6 h-6 text-muted-foreground" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-semibold leading-snug group-hover:text-primary line-clamp-2">
                          {it.title}
                        </h3>
                        {it.description && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{it.description}</p>
                        )}
                        <div className="flex items-center gap-2 mt-1.5 text-[11px] text-muted-foreground">
                          <span className="font-medium">{it.source}</span>
                          {it.pubDate && (<><span>•</span><span>{timeAgo(it.pubDate, bn)}</span></>)}
                          <ExternalLink className="w-3 h-3 ml-auto opacity-60 group-hover:opacity-100" />
                        </div>
                      </div>
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      )}

      <p className="text-center text-[11px] text-muted-foreground pt-2">
        {bn
          ? "সরাসরি সোর্স থেকে আনা — যেকোনো হোস্টিং সার্ভারে চলবে, কোনো ক্রেডিট লাগবে না।"
          : "Fetched directly from public sources — portable to any host, zero credits."}
      </p>
    </div>
  );
};

export default FreeInternet;
