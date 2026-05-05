import { useState } from "react";
import { motion } from "framer-motion";
import { Download, Link as LinkIcon, Loader2, Music2, Video, Youtube, Instagram, Facebook, Twitter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Result = {
  ok: boolean;
  url?: string;
  filename?: string;
  picker?: Array<{ url: string; thumb?: string; type?: string }>;
  status?: string;
  text?: string;
};

const Downloader = () => {
  const { language } = useLanguage();
  const t = (bn: string, en: string) => (language === "bn" ? bn : en);

  const [url, setUrl] = useState("");
  const [mode, setMode] = useState<"video" | "audio">("video");
  const [quality, setQuality] = useState("720");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  const handleFetch = async () => {
    if (!url.trim()) {
      toast.error(t("একটি লিঙ্ক দিন", "Please paste a link"));
      return;
    }
    setBusy(true);
    setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("cobalt-download", {
        body: { url: url.trim(), audioOnly: mode === "audio", quality },
      });
      if (error) throw error;
      setResult(data);
      if (!data?.ok && !data?.picker) {
        toast.error(data?.error || t("ডাউনলোড পাওয়া যায়নি", "Could not fetch"));
      } else {
        toast.success(t("রেডি! নিচের বাটনে ক্লিক করুন", "Ready! Click the button below"));
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  };

  const supported = [
    { name: "YouTube", icon: Youtube, color: "text-red-600" },
    { name: "TikTok", icon: Music2, color: "text-fuchsia-600" },
    { name: "Instagram", icon: Instagram, color: "text-pink-500" },
    { name: "Facebook", icon: Facebook, color: "text-blue-600" },
    { name: "Twitter/X", icon: Twitter, color: "text-foreground" },
    { name: "Reddit", icon: LinkIcon, color: "text-orange-600" },
  ];

  return (
    <div className="container py-8 max-w-3xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-3">
            <Download className="w-3.5 h-3.5" />
            {t("ভিডিও ও অডিও ডাউনলোডার", "Video & Audio Downloader")}
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold mb-2">
            {t("যেকোনো লিঙ্ক — সরাসরি ডাউনলোড", "Any link — direct download")}
          </h1>
          <p className="text-muted-foreground text-sm">
            {t(
              "YouTube, TikTok, Instagram, Facebook, Twitter/X, Reddit ও আরো অনেক সাইট",
              "YouTube, TikTok, Instagram, Facebook, Twitter/X, Reddit and many more"
            )}
          </p>
        </div>

        <Card className="p-6 space-y-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">
              {t("ভিডিও/পোস্টের লিঙ্ক", "Video/Post link")}
            </label>
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
              className="h-11"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3">
            <Tabs value={mode} onValueChange={(v) => setMode(v as "video" | "audio")}>
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="video" className="gap-1.5">
                  <Video className="w-4 h-4" /> {t("ভিডিও", "Video")}
                </TabsTrigger>
                <TabsTrigger value="audio" className="gap-1.5">
                  <Music2 className="w-4 h-4" /> {t("অডিও (MP3)", "Audio (MP3)")}
                </TabsTrigger>
              </TabsList>
            </Tabs>
            {mode === "video" && (
              <Select value={quality} onValueChange={setQuality}>
                <SelectTrigger className="md:w-32"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["360", "480", "720", "1080", "1440", "2160", "max"].map((q) => (
                    <SelectItem key={q} value={q}>{q === "max" ? "Max" : `${q}p`}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <Button onClick={handleFetch} disabled={busy} size="lg" className="w-full">
            {busy ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
            {t("ডাউনলোড লিঙ্ক বানাও", "Get download link")}
          </Button>

          {result?.url && (
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
              <p className="text-sm text-muted-foreground mb-2">
                {t("ডাউনলোডের জন্য প্রস্তুত:", "Ready to download:")}
              </p>
              <a href={result.url} target="_blank" rel="noopener noreferrer" download>
                <Button className="w-full" size="lg">
                  <Download className="w-4 h-4 mr-2" />
                  {t("ফাইল ডাউনলোড করুন", "Download file")}
                </Button>
              </a>
            </div>
          )}

          {result?.picker && result.picker.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">{t("একাধিক ফাইল পাওয়া গেছে:", "Multiple files found:")}</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {result.picker.map((p, i) => (
                  <a key={i} href={p.url} target="_blank" rel="noopener noreferrer" download
                     className="block rounded-lg border p-2 hover:border-primary transition-smooth">
                    {p.thumb && <img src={p.thumb} alt="" className="rounded aspect-square object-cover w-full mb-1" />}
                    <span className="text-xs font-medium">{p.type || `Item ${i + 1}`}</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </Card>

        <div className="mt-6">
          <p className="text-xs font-semibold text-muted-foreground mb-2 text-center">
            {t("সাপোর্টেড প্ল্যাটফর্ম", "Supported platforms")}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {supported.map((s) => (
              <div key={s.name} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted text-xs font-medium">
                <s.icon className={`w-3.5 h-3.5 ${s.color}`} />
                {s.name}
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-center text-muted-foreground mt-4">
          {t(
            "শুধু ব্যক্তিগত ব্যবহারের জন্য। কপিরাইট আইন মেনে চলুন।",
            "For personal use only. Please respect copyright laws."
          )}
        </p>
      </motion.div>
    </div>
  );
};

export default Downloader;
