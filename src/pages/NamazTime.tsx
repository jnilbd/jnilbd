import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Sun, Moon, Sunrise, Sunset, Cloud, Star, Loader2, Compass, Bell, BellOff, MessageCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type PrayerTimes = {
  Fajr: string; Sunrise: string; Dhuhr: string; Asr: string; Maghrib: string; Isha: string;
};
type ApiResp = { data: { timings: PrayerTimes; date: { readable: string; hijri: { date: string; month: { en: string; ar: string }; year: string } }; meta: { latitude: number; longitude: number; timezone: string } } };

const fmt = (t: string, bn: boolean) => {
  const [h,m] = t.split(":").map(Number);
  const d = new Date(); d.setHours(h, m, 0, 0);
  return d.toLocaleTimeString(bn?"bn-BD":"en-US", { hour: "numeric", minute: "2-digit", hour12: true });
};

const NamazTime = () => {
  const { language } = useLanguage();
  const bn = language === "bn";
  const [data, setData] = useState<ApiResp["data"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [city, setCity] = useState("Dhaka");
  const [country, setCountry] = useState("Bangladesh");
  const [coords, setCoords] = useState<{lat:number;lng:number}|null>(null);

  const fetchByCoords = async (lat: number, lng: number) => {
    setLoading(true); setError("");
    try {
      const r = await fetch(`https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lng}&method=2`);
      const j: ApiResp = await r.json();
      setData(j.data);
    } catch (e) { setError(bn?"ডেটা লোড করতে ব্যর্থ":"Failed to load"); }
    finally { setLoading(false); }
  };
  const fetchByCity = async () => {
    setLoading(true); setError("");
    try {
      const r = await fetch(`https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}&method=2`);
      const j: ApiResp = await r.json();
      setData(j.data);
      setCoords({ lat: j.data.meta.latitude, lng: j.data.meta.longitude });
    } catch (e) { setError(bn?"ডেটা লোড করতে ব্যর্থ":"Failed to load"); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => { setCoords({lat:pos.coords.latitude, lng:pos.coords.longitude}); fetchByCoords(pos.coords.latitude, pos.coords.longitude); },
        () => fetchByCity(),
        { timeout: 6000 }
      );
    } else fetchByCity();
    // eslint-disable-next-line
  }, []);

  const prayers = data ? [
    { key: "Fajr", labelBn: "ফজর", icon: Star, time: data.timings.Fajr, color: "from-indigo-500 to-violet-600" },
    { key: "Sunrise", labelBn: "সূর্যোদয়", icon: Sunrise, time: data.timings.Sunrise, color: "from-amber-400 to-orange-500" },
    { key: "Dhuhr", labelBn: "যুহর", icon: Sun, time: data.timings.Dhuhr, color: "from-yellow-400 to-amber-500" },
    { key: "Asr", labelBn: "আসর", icon: Cloud, time: data.timings.Asr, color: "from-orange-400 to-red-500" },
    { key: "Maghrib", labelBn: "মাগরিব", icon: Sunset, time: data.timings.Maghrib, color: "from-rose-500 to-pink-600" },
    { key: "Isha", labelBn: "ইশা", icon: Moon, time: data.timings.Isha, color: "from-slate-700 to-indigo-900" },
  ] : [];

  // next prayer
  const now = new Date();
  let next = "";
  if (data) {
    const list: [string, string][] = [["Fajr", data.timings.Fajr],["Dhuhr", data.timings.Dhuhr],["Asr", data.timings.Asr],["Maghrib", data.timings.Maghrib],["Isha", data.timings.Isha]];
    for (const [k, t] of list) {
      const [h, m] = t.split(":").map(Number);
      const dt = new Date(); dt.setHours(h, m, 0, 0);
      if (dt > now) { next = k; break; }
    }
    if (!next) next = "Fajr";
  }

  return (
    <div className="container py-6 lg:py-10 max-w-4xl space-y-6">
      <motion.div initial={{opacity:0,y:-10}} animate={{opacity:1,y:0}} className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-glow">
          <Compass className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <h1 className="font-display text-2xl lg:text-3xl font-bold">{bn?"নামাজের সময়":"Prayer Times"}</h1>
          <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3" />{data?.meta.timezone || "—"}{coords && ` • ${coords.lat.toFixed(2)}, ${coords.lng.toFixed(2)}`}</p>
        </div>
      </motion.div>

      <Card><CardContent className="p-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <Input placeholder={bn?"শহর":"City"} value={city} onChange={e=>setCity(e.target.value)} />
          <Input placeholder={bn?"দেশ":"Country"} value={country} onChange={e=>setCountry(e.target.value)} />
          <Button onClick={fetchByCity} disabled={loading} className="gradient-bg-primary text-white">{bn?"খুঁজুন":"Search"}</Button>
        </div>
      </CardContent></Card>

      {loading && <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}
      {error && <Card><CardContent className="p-4 text-center text-destructive">{error}</CardContent></Card>}

      {data && (<>
        <Card className="bg-gradient-to-br from-primary/10 via-background to-secondary/10 border-primary/30">
          <CardContent className="p-5 text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">{bn?"আজকের তারিখ":"Today"}</p>
            <p className="font-display text-xl font-bold mt-1">{data.date.readable}</p>
            <p className="text-sm text-muted-foreground mt-0.5">{data.date.hijri.date} {data.date.hijri.month.en} {data.date.hijri.year} هـ</p>
            {next && <p className="mt-3 text-sm">{bn?"পরবর্তী নামাজ":"Next prayer"}: <strong className="text-primary">{prayers.find(p=>p.key===next)?.[bn?"labelBn":"key" as any] || next}</strong></p>}
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {prayers.map((p, i) => {
            const isNext = next === p.key;
            return (
              <motion.div key={p.key} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:i*0.05}}>
                <Card className={`overflow-hidden ${isNext?"ring-2 ring-primary shadow-glow":""}`}>
                  <CardContent className="p-4">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${p.color} text-white flex items-center justify-center mb-2`}>
                      <p.icon className="w-5 h-5" />
                    </div>
                    <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">{bn? p.labelBn : p.key}</div>
                    <div className="font-display font-bold text-2xl mt-0.5">{fmt(p.time, bn)}</div>
                    {isNext && <div className="text-[10px] text-primary font-bold mt-1">⭐ {bn?"পরবর্তী":"Next"}</div>}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <p className="text-center text-[11px] text-muted-foreground">{bn?"ডেটা সোর্স":"Source"}: aladhan.com (ISNA method)</p>
      </>)}
    </div>
  );
};

export default NamazTime;
