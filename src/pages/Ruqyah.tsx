import { useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Shield, Play, Pause, Download, Search, BookOpen, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  RUQYAH_ITEMS, RUQYAH_CATEGORIES, RUQYAH_RECITERS, surahAudio,
} from "@/data/ruqyah";

const Ruqyah = () => {
  const [cat, setCat] = useState("সব");
  const [q, setQ] = useState("");
  const [reciter, setReciter] = useState("ar.alafasy");
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return RUQYAH_ITEMS.filter(r =>
      (cat === "সব" || r.categories.includes(cat as any)) &&
      (!qq || r.bnName.toLowerCase().includes(qq) || r.surahName.toLowerCase().includes(qq) || r.benefit.toLowerCase().includes(qq))
    );
  }, [cat, q]);

  const ensureAudio = () => {
    if (!audioRef.current) {
      const el = new Audio();
      el.preload = "auto";
      audioRef.current = el;
    }
    return audioRef.current;
  };

  const play = (id: string, surahNo: number) => {
    const el = ensureAudio();
    if (playingId === id && !el.paused) {
      el.pause();
      setPlayingId(null);
      return;
    }
    try { el.pause(); } catch {}
    setLoadingId(id);
    el.src = surahAudio(surahNo, reciter);
    el.onended = () => setPlayingId(null);
    el.onerror = () => {
      toast.error("অডিও সোর্সে সমস্যা — অন্য কারি ট্রাই করুন");
      setPlayingId(null); setLoadingId(null);
    };
    el.oncanplay = () => setLoadingId(null);
    const p = el.play();
    if (p && typeof p.then === "function") {
      p.then(() => setPlayingId(id))
       .catch(() => { toast.error("প্লে করতে আবার চাপুন"); setPlayingId(null); setLoadingId(null); });
    }
  };

  const download = (surahNo: number, name: string) => {
    const url = surahAudio(surahNo, reciter);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${name}-${reciter}.mp3`;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success("ডাউনলোড শুরু হয়েছে");
  };

  return (
    <div className="container py-6 lg:py-10 max-w-5xl space-y-5">
      <motion.div initial={{opacity:0,y:-10}} animate={{opacity:1,y:0}} className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-700 text-white flex items-center justify-center shadow-glow">
          <Shield className="w-6 h-6" />
        </div>
        <div>
          <h1 className="font-display text-2xl lg:text-3xl font-bold">রুকইয়া শারইয়াহ</h1>
          <p className="text-xs text-muted-foreground">কুরআন ও হাদিস ভিত্তিক চিকিৎসা — জাদু, বদনজর, জ্বিন ও রোগের জন্য</p>
        </div>
      </motion.div>

      {/* Intro */}
      <Card className="bg-gradient-to-br from-indigo-500/10 via-background to-purple-500/5 border-indigo-500/30">
        <CardContent className="p-4 space-y-2 text-sm">
          <p className="font-semibold text-indigo-700 dark:text-indigo-300">📖 রুকইয়া কী?</p>
          <p className="text-muted-foreground leading-relaxed">
            রুকইয়া শারইয়াহ মানে — কুরআনের আয়াত, আল্লাহর নাম ও নবী ﷺ-এর শেখানো দোয়া দিয়ে নিজেকে বা অন্যকে আরোগ্য করা ও সুরক্ষা দেওয়া।
            এটি সম্পূর্ণ হালাল, বৈধ এবং অত্যন্ত কার্যকর — যদি দৃঢ় বিশ্বাস ও নিয়মিতভাবে আমল করা হয়। কোনো তাবিজ, কবিরাজ বা শিরকি কাজে যাওয়ার দরকার নেই।
          </p>
          <p className="text-xs"><strong>নিয়ম:</strong> অজু করে কেবলামুখী হয়ে বসুন → আউযুবিল্লাহ ও বিসমিল্লাহ পড়ুন → নিচের আয়াতগুলো খুশু-খুজু সহ পড়ুন বা শুনুন → হাতে ফুঁ দিয়ে শরীরে মুছে দিন। পানিতে ফুঁ দিয়ে পান করানো ও গোসল করানোও সুন্নত।</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="grid md:grid-cols-2 gap-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input className="pl-9" placeholder="সূরা বা সমস্যা খুঁজুন..." value={q} onChange={e=>setQ(e.target.value)} />
            </div>
            <Select value={reciter} onValueChange={setReciter}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {RUQYAH_RECITERS.map(r => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-wrap gap-2">
            {RUQYAH_CATEGORIES.map(c => (
              <button key={c} onClick={()=>setCat(c)}
                className={`text-xs px-3 py-1.5 rounded-full border transition ${cat===c?"gradient-bg-primary text-white border-transparent":"bg-muted hover:bg-muted/80 border-border"}`}>
                {c}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="text-xs text-muted-foreground">{filtered.length}টি রুকইয়া</div>

      <div className="grid gap-3">
        {filtered.map((r, i) => {
          const playing = playingId === r.id;
          const loading = loadingId === r.id;
          return (
            <motion.div key={r.id} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:Math.min(i*0.03,0.3)}}>
              <Card className="border-l-4 border-l-indigo-500/60">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display text-lg font-bold">{r.bnName}</h3>
                      <p className="text-xs text-muted-foreground">{r.surahName} • {r.howOften}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Button size="sm" onClick={()=>play(r.id, r.surahNo)} className="gradient-bg-primary text-white">
                        {loading ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : (playing ? <Pause className="w-4 h-4 mr-1" /> : <Play className="w-4 h-4 mr-1" />)}
                        {playing ? "থামাও" : "শুনুন"}
                      </Button>
                      <Button size="sm" variant="outline" onClick={()=>download(r.surahNo, r.bnName)}>
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {r.categories.map(c => <Badge key={c} variant="secondary" className="text-[10px]">{c}</Badge>)}
                  </div>

                  <div className="text-sm space-y-2">
                    <p><span className="font-semibold text-indigo-700 dark:text-indigo-300">🎯 ফজিলত: </span>{r.benefit}</p>
                    <p><span className="font-semibold text-emerald-700 dark:text-emerald-300">📋 কীভাবে: </span><span className="text-muted-foreground">{r.use}</span></p>
                    <p className="text-[11px] text-muted-foreground"><BookOpen className="w-3 h-3 inline mr-1" />সূত্র: {r.reference}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <Card className="bg-amber-500/5 border-amber-500/30">
        <CardContent className="p-4 text-xs text-muted-foreground space-y-1.5">
          <p className="font-semibold text-amber-700 dark:text-amber-300">⚠️ গুরুত্বপূর্ণ পরামর্শ</p>
          <p>• দৃঢ় ঈমান ও তাওয়াক্কুল থাকতে হবে — শিফা আল্লাহর হাতে।</p>
          <p>• হারাম কাজ ও গান-বাজনা ছেড়ে দিন; বাসায় ছবি/মূর্তি রাখবেন না।</p>
          <p>• ৫ ওয়াক্ত নামাজ, সকাল-সন্ধ্যার দোয়া (মাসনুন আযকার) নিয়মিত পড়ুন।</p>
          <p>• টানা ৭, ২১ বা ৪০ দিন আমল করলে ইনশাআল্লাহ ফল পাবেন।</p>
          <p>• গুরুতর শারীরিক সমস্যায় ডাক্তারের চিকিৎসাও চালিয়ে যান — উভয়ই সুন্নত।</p>
        </CardContent>
      </Card>

      <p className="text-center text-[11px] text-muted-foreground">অডিও সোর্স: cdn.islamic.network • সকল রুকইয়া কুরআন ও সহিহ হাদিস থেকে</p>
    </div>
  );
};

export default Ruqyah;
