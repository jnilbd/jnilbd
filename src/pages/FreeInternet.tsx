import { useState } from "react";
import { motion } from "framer-motion";
import { Wifi, Loader2, Sparkles, Phone, Settings, Gift, AlertTriangle } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const operators = [
  { id: "grameenphone", name: "Grameenphone (GP)", color: "from-blue-600 to-cyan-500", code: "*121#" },
  { id: "robi", name: "Robi", color: "from-red-600 to-orange-500", code: "*123#" },
  { id: "banglalink", name: "Banglalink", color: "from-orange-500 to-yellow-500", code: "*121#" },
  { id: "airtel", name: "Airtel", color: "from-red-500 to-pink-500", code: "*121#" },
  { id: "teletalk", name: "Teletalk", color: "from-emerald-600 to-green-500", code: "*152#" },
];

const FreeInternet = () => {
  const { language } = useLanguage();
  const bn = language === "bn";
  const [op, setOp] = useState<string | null>(null);
  const [topic, setTopic] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState("");

  const topics = [
    { id: "social-packs", icon: Wifi, label: bn ? "সোশ্যাল প্যাক (FB/WA/Imo)" : "Social Packs (FB/WA/Imo)" },
    { id: "cheap-mb", icon: Gift, label: bn ? "সবচেয়ে সস্তা MB অফার" : "Cheapest MB Offers" },
    { id: "night-packs", icon: Sparkles, label: bn ? "নাইট প্যাক ও বোনাস" : "Night Packs & Bonus" },
    { id: "free-internet-vpn", icon: Settings, label: bn ? "সোশ্যাল প্যাক → ফুল নেট (VPN/Handler)" : "Social Pack → Full Net (VPN/Handler)" },
    { id: "emergency-balance", icon: Phone, label: bn ? "ইমার্জেন্সি ব্যালেন্স/MB লোন" : "Emergency Balance/MB Loan" },
    { id: "student-offers", icon: Gift, label: bn ? "স্টুডেন্ট ও বান্ডেল অফার" : "Student & Bundle Offers" },
    { id: "apn-settings", icon: Settings, label: bn ? "APN ও সেটিংস" : "APN & Settings" },
  ];

  const ask = async (selectedTopic: string) => {
    if (!op) return;
    setTopic(selectedTopic);
    setLoading(true);
    setAnswer("");
    try {
      const { data, error } = await supabase.functions.invoke("free-internet-guide", {
        body: { operator: op, topic: selectedTopic, language },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      setAnswer((data as any)?.content || "");
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
            {bn ? "বাংলাদেশের সব সিমের লেটেস্ট সস্তা ও ফ্রি ইন্টারনেট অফার" : "Latest cheap & free internet offers — all BD operators"}
          </p>
        </div>
      </motion.div>

      <Card className="border-amber-500/30 bg-amber-500/5">
        <CardContent className="p-3 flex gap-2 text-xs text-amber-700 dark:text-amber-400">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <p>
            {bn
              ? "সব অফার ও কোড অপারেটরের পরিবর্তন সাপেক্ষ। বিপদকালীন/ছাত্র ব্যবহারের জন্য — দয়া করে অপারেটরের শর্তাবলী মেনে চলুন।"
              : "All offers and codes are subject to operator changes. For emergency/student use — please follow operator T&C."}
          </p>
        </CardContent>
      </Card>

      {/* Operator selection */}
      <div>
        <h2 className="text-sm font-semibold mb-2 text-muted-foreground uppercase tracking-wider">
          {bn ? "১. আপনার সিম বেছে নিন" : "1. Choose your SIM"}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {operators.map((o) => (
            <button
              key={o.id}
              onClick={() => { setOp(o.id); setAnswer(""); setTopic(""); }}
              className={`p-3 rounded-2xl text-white text-left bg-gradient-to-br ${o.color} transition-bounce ${op === o.id ? "ring-4 ring-primary/60 scale-[1.02]" : "opacity-80 hover:opacity-100"}`}
            >
              <div className="text-sm font-bold leading-tight">{o.name}</div>
              <div className="text-[10px] opacity-90 mt-1">USSD: {o.code}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Topic selection */}
      {op && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h2 className="text-sm font-semibold mb-2 text-muted-foreground uppercase tracking-wider">
            {bn ? "২. কী জানতে চান?" : "2. What do you want to know?"}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {topics.map((tp) => (
              <button
                key={tp.id}
                onClick={() => ask(tp.id)}
                disabled={loading}
                className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-smooth ${topic === tp.id ? "border-primary bg-primary/10" : "border-border hover:border-primary/50 bg-card"} disabled:opacity-50`}
              >
                <div className="w-9 h-9 rounded-lg gradient-bg-primary text-white flex items-center justify-center shrink-0">
                  <tp.icon className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium">{tp.label}</span>
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Answer */}
      {(loading || answer) && (
        <Card className="overflow-hidden">
          <CardContent className="p-5">
            {selectedOp && (
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <Badge className={`bg-gradient-to-r ${selectedOp.color} text-white border-0`}>{selectedOp.name}</Badge>
                {topic && <Badge variant="outline">{topics.find((t) => t.id === topic)?.label}</Badge>}
                <Badge variant="secondary" className="text-[10px]">
                  <Sparkles className="w-3 h-3 mr-1" /> AI {bn ? "সর্বশেষ আপডেট" : "Latest update"}
                </Badge>
              </div>
            )}
            {loading ? (
              <div className="flex items-center justify-center py-12 gap-2 text-muted-foreground">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-sm">{bn ? "সর্বশেষ তথ্য আনা হচ্ছে..." : "Fetching latest info..."}</span>
              </div>
            ) : (
              <article className="prose prose-sm dark:prose-invert max-w-none prose-headings:font-display prose-headings:mt-4 prose-headings:mb-2 prose-p:my-2 prose-ul:my-2 prose-li:my-0.5 prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-primary prose-code:before:content-none prose-code:after:content-none">
                <ReactMarkdown>{answer}</ReactMarkdown>
              </article>
            )}
          </CardContent>
        </Card>
      )}

      <p className="text-center text-[11px] text-muted-foreground pt-2">
        {bn ? "সবসময় আপডেটেড থাকুন — যেকোনো সিম, যেকোনো সময়।" : "Stay updated — any SIM, any time."}
      </p>
    </div>
  );
};

export default FreeInternet;
