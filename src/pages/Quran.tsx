import { useEffect, useMemo, useState, useRef } from "react";
import { motion } from "framer-motion";
import { BookOpen, Play, Pause, Loader2, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

type Surah = { number: number; name: string; englishName: string; englishNameTranslation: string; numberOfAyahs: number; revelationType: string };
type Ayah = { number: number; text: string; numberInSurah: number; juz: number; audio?: string };

const Quran = () => {
  const { language } = useLanguage();
  const bn = language === "bn";
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [current, setCurrent] = useState<number>(1);
  const [arabic, setArabic] = useState<Ayah[]>([]);
  const [translation, setTranslation] = useState<Ayah[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [reciter, setReciter] = useState("ar.alafasy");
  const [translator, setTranslator] = useState(bn?"bn.bengali":"en.sahih");
  const [playingAyah, setPlayingAyah] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    fetch("https://api.alquran.cloud/v1/surah").then(r=>r.json()).then(j => setSurahs(j.data || []));
  }, []);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`https://api.alquran.cloud/v1/surah/${current}/${reciter}`).then(r=>r.json()),
      fetch(`https://api.alquran.cloud/v1/surah/${current}/${translator}`).then(r=>r.json()),
    ]).then(([a, t]) => {
      setArabic(a.data?.ayahs || []);
      setTranslation(t.data?.ayahs || []);
    }).finally(()=>setLoading(false));
    setPlayingAyah(null);
    audioRef.current?.pause();
  }, [current, reciter, translator]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return surahs;
    return surahs.filter(s => s.englishName.toLowerCase().includes(q) || s.name.includes(q) || String(s.number).startsWith(q));
  }, [surahs, search]);

  const surahInfo = surahs.find(s => s.number === current);

  const playAyah = (ayah: Ayah) => {
    if (!ayah.audio) return;
    if (playingAyah === ayah.numberInSurah) {
      audioRef.current?.pause();
      setPlayingAyah(null); return;
    }
    if (!audioRef.current) audioRef.current = new Audio();
    audioRef.current.src = ayah.audio;
    audioRef.current.play();
    setPlayingAyah(ayah.numberInSurah);
    audioRef.current.onended = () => {
      // play next ayah
      const next = arabic.find(a => a.numberInSurah === ayah.numberInSurah + 1);
      if (next) playAyah(next); else setPlayingAyah(null);
    };
  };
  const playFull = () => {
    if (arabic[0]) playAyah(arabic[0]);
  };

  return (
    <div className="container py-6 lg:py-10 max-w-6xl space-y-4">
      <motion.div initial={{opacity:0,y:-10}} animate={{opacity:1,y:0}} className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-green-700 text-white flex items-center justify-center shadow-glow">
          <BookOpen className="w-6 h-6" />
        </div>
        <div>
          <h1 className="font-display text-2xl lg:text-3xl font-bold">{bn?"আল-কুরআন":"Al-Quran"}</h1>
          <p className="text-xs text-muted-foreground">{bn?"৩০ পারা — পড়ুন ও শুনুন":"30 Para — Read & Listen"}</p>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-[300px_1fr] gap-4">
        {/* Sidebar */}
        <div className="space-y-3 lg:sticky lg:top-20 lg:self-start lg:max-h-[80vh] flex flex-col">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-9" placeholder={bn?"সূরা খুঁজুন":"Search Surah"} value={search} onChange={e=>setSearch(e.target.value)} />
          </div>
          <Card className="flex-1 overflow-hidden">
            <CardContent className="p-0 max-h-[60vh] lg:max-h-[70vh] overflow-y-auto divide-y divide-border">
              {filtered.map(s => (
                <button key={s.number} onClick={()=>setCurrent(s.number)}
                  className={`w-full flex items-center gap-3 p-2.5 text-left hover:bg-muted/60 ${current===s.number?"bg-primary/10":""}`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${current===s.number?"gradient-bg-primary text-white":"bg-muted"}`}>{s.number}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm truncate">{s.englishName}</div>
                    <div className="text-[10px] text-muted-foreground">{s.englishNameTranslation} • {s.numberOfAyahs} {bn?"আয়াত":"verses"}</div>
                  </div>
                  <div className="font-arabic text-lg">{s.name}</div>
                </button>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Reader */}
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <Select value={reciter} onValueChange={setReciter}>
              <SelectTrigger><SelectValue placeholder={bn?"কারি":"Reciter"} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ar.alafasy">Mishary Alafasy</SelectItem>
                <SelectItem value="ar.husary">Mahmoud Al-Husary</SelectItem>
                <SelectItem value="ar.minshawi">Minshawi</SelectItem>
                <SelectItem value="ar.abdulbasitmurattal">Abdul Basit</SelectItem>
                <SelectItem value="ar.hudhaify">Al-Hudhaify</SelectItem>
                <SelectItem value="ar.muhammadayyoub">Muhammad Ayyoub</SelectItem>
              </SelectContent>
            </Select>
            <Select value={translator} onValueChange={setTranslator}>
              <SelectTrigger><SelectValue placeholder={bn?"অনুবাদ":"Translation"} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="bn.bengali">বাংলা — Muhiuddin Khan</SelectItem>
                <SelectItem value="en.sahih">English — Sahih Intl</SelectItem>
                <SelectItem value="en.pickthall">English — Pickthall</SelectItem>
                <SelectItem value="ur.jalandhry">اردو — Jalandhry</SelectItem>
                <SelectItem value="hi.hindi">हिंदी</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card className="bg-gradient-to-br from-emerald-500/10 via-background to-emerald-500/5 border-emerald-500/30">
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{bn?"সূরা":"Surah"} {surahInfo?.number}</p>
                  <h2 className="font-display text-2xl font-bold">{surahInfo?.englishName} <span className="text-base text-muted-foreground font-normal">— {surahInfo?.englishNameTranslation}</span></h2>
                  <p className="text-xs text-muted-foreground">{surahInfo?.numberOfAyahs} {bn?"আয়াত":"verses"} • {surahInfo?.revelationType}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Button size="icon" variant="outline" onClick={()=>setCurrent(Math.max(1,current-1))} disabled={current<=1}><ChevronLeft className="w-4 h-4" /></Button>
                  <Button size="icon" variant="outline" onClick={()=>setCurrent(Math.min(114,current+1))} disabled={current>=114}><ChevronRight className="w-4 h-4" /></Button>
                  <Button onClick={playFull} className="gradient-bg-primary text-white"><Play className="w-4 h-4 mr-1" />{bn?"সম্পূর্ণ শুনুন":"Play all"}</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
          ) : (
            <Card><CardContent className="p-0 divide-y divide-border">
              {arabic.map((a, i) => {
                const tr = translation[i];
                const playing = playingAyah === a.numberInSurah;
                return (
                  <div key={a.number} className={`p-4 ${playing?"bg-primary/5":""}`}>
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-8 h-8 rounded-full gradient-bg-primary text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{a.numberInSurah}</div>
                      <p dir="rtl" className="flex-1 text-2xl lg:text-3xl leading-loose font-arabic text-right" style={{ fontFamily: "'Amiri Quran','Scheherazade New','Noto Naskh Arabic',serif" }}>
                        {a.text}
                      </p>
                      <Button size="icon" variant="ghost" onClick={()=>playAyah(a)} className="shrink-0">
                        {playing ? <Pause className="w-4 h-4 text-primary" /> : <Play className="w-4 h-4" />}
                      </Button>
                    </div>
                    {tr && <p className="text-sm text-muted-foreground leading-relaxed pl-11">{tr.text}</p>}
                  </div>
                );
              })}
            </CardContent></Card>
          )}

          <p className="text-center text-[11px] text-muted-foreground">{bn?"ডেটা":"Data"}: alquran.cloud (open API)</p>
        </div>
      </div>
    </div>
  );
};

export default Quran;
