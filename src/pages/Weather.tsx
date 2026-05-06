import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CloudRain, Wind, Thermometer, Droplets, AlertTriangle, MapPin, Sun, CloudSnow, Cloud, Search, Loader2, BellRing } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { PAGE_BANNERS } from "@/lib/siteImages";

interface City { name: string; lat: number; lon: number; country: string }

// Pre-loaded BD + nearby IN cities for quick access
const QUICK_CITIES: City[] = [
  { name: "ঢাকা / Dhaka", lat: 23.8103, lon: 90.4125, country: "BD" },
  { name: "চট্টগ্রাম / Chattogram", lat: 22.3569, lon: 91.7832, country: "BD" },
  { name: "সিলেট / Sylhet", lat: 24.8949, lon: 91.8687, country: "BD" },
  { name: "খুলনা / Khulna", lat: 22.8456, lon: 89.5403, country: "BD" },
  { name: "রাজশাহী / Rajshahi", lat: 24.3745, lon: 88.6042, country: "BD" },
  { name: "বরিশাল / Barisal", lat: 22.7010, lon: 90.3535, country: "BD" },
  { name: "রংপুর / Rangpur", lat: 25.7439, lon: 89.2752, country: "BD" },
  { name: "ময়মনসিংহ / Mymensingh", lat: 24.7471, lon: 90.4203, country: "BD" },
  { name: "কক্সবাজার / Cox's Bazar", lat: 21.4272, lon: 92.0058, country: "BD" },
  { name: "কলকাতা / Kolkata", lat: 22.5726, lon: 88.3639, country: "IN" },
  { name: "শিলিগুড়ি / Siliguri", lat: 26.7271, lon: 88.3953, country: "IN" },
  { name: "আগরতলা / Agartala", lat: 23.8315, lon: 91.2868, country: "IN" },
  { name: "গুয়াহাটি / Guwahati", lat: 26.1445, lon: 91.7362, country: "IN" },
];

const wmoCode = (code: number, isBn: boolean) => {
  const map: Record<number, [string, string, any]> = {
    0: ["পরিষ্কার আকাশ", "Clear sky", Sun],
    1: ["প্রায় পরিষ্কার", "Mainly clear", Sun],
    2: ["আংশিক মেঘলা", "Partly cloudy", Cloud],
    3: ["মেঘলা", "Overcast", Cloud],
    45: ["কুয়াশা", "Fog", Cloud],
    48: ["জমাট কুয়াশা", "Rime fog", Cloud],
    51: ["হালকা গুঁড়ি বৃষ্টি", "Light drizzle", CloudRain],
    53: ["মাঝারি গুঁড়ি বৃষ্টি", "Moderate drizzle", CloudRain],
    55: ["ঘন গুঁড়ি বৃষ্টি", "Dense drizzle", CloudRain],
    61: ["হালকা বৃষ্টি", "Light rain", CloudRain],
    63: ["মাঝারি বৃষ্টি", "Moderate rain", CloudRain],
    65: ["ভারী বৃষ্টি", "Heavy rain", CloudRain],
    71: ["হালকা তুষারপাত", "Light snow", CloudSnow],
    73: ["তুষারপাত", "Snow", CloudSnow],
    75: ["ভারী তুষারপাত", "Heavy snow", CloudSnow],
    80: ["বৃষ্টিপাত", "Rain showers", CloudRain],
    81: ["মাঝারি বৃষ্টিপাত", "Moderate showers", CloudRain],
    82: ["প্রচণ্ড বৃষ্টিপাত", "Violent showers", CloudRain],
    95: ["বজ্রঝড়", "Thunderstorm", AlertTriangle],
    96: ["শিলাবৃষ্টিসহ ঝড়", "Thunderstorm w/ hail", AlertTriangle],
    99: ["ভয়াবহ বজ্রঝড়", "Severe thunderstorm", AlertTriangle],
  };
  const v = map[code] || ["অজানা", "Unknown", Cloud];
  return { text: isBn ? v[0] : v[1], Icon: v[2] };
};

const Weather = () => {
  const { language } = useLanguage();
  const isBn = language === "bn";
  const [city, setCity] = useState<City>(QUICK_CITIES[0]);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [subPhone, setSubPhone] = useState("");
  const [subName, setSubName] = useState("");
  const [subbing, setSubbing] = useState(false);

  const subscribeAlerts = async () => {
    if (!/^(\+?88)?01[3-9]\d{8}$/.test(subPhone.replace(/\s/g, ""))) {
      toast.error(isBn ? "সঠিক মোবাইল নম্বর দিন" : "Enter a valid mobile number");
      return;
    }
    setSubbing(true);
    try {
      const { error } = await supabase.from("weather_alert_subscribers").insert({
        phone: subPhone.trim(),
        name: subName.trim() || null,
        city: city.name,
        lat: city.lat,
        lon: city.lon,
        language: isBn ? "bn" : "en",
      });
      if (error && !String(error.message).includes("duplicate")) throw error;
      toast.success(isBn ? "✅ সাবস্ক্রিপশন সম্পন্ন — দুর্যোগে SMS পাবেন" : "✅ Subscribed — you'll get SMS during severe weather");
      setSubPhone(""); setSubName("");
    } catch (e: any) {
      toast.error(e.message || "Failed");
    } finally {
      setSubbing(false);
    }
  };

  const fetchWeather = async (c: City) => {
    setLoading(true);
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${c.lat}&longitude=${c.lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m,wind_gusts_10m&hourly=temperature_2m,precipitation_probability,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max&timezone=auto&forecast_days=7`;
      const r = await fetch(url);
      const j = await r.json();
      setData(j);
    } catch (e) {
      toast.error(isBn ? "আবহাওয়া লোড ব্যর্থ" : "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchWeather(city); }, [city]);

  const useMyLocation = () => {
    if (!navigator.geolocation) return toast.error("Geolocation N/A");
    navigator.geolocation.getCurrentPosition(
      (pos) => setCity({ name: isBn ? "আমার অবস্থান" : "My Location", lat: pos.coords.latitude, lon: pos.coords.longitude, country: "" }),
      () => toast.error(isBn ? "অনুমতি দিন" : "Permission denied")
    );
  };

  const handleSearch = async () => {
    if (!search.trim()) return;
    try {
      const r = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(search)}&count=1&language=${isBn ? "bn" : "en"}`);
      const j = await r.json();
      if (j.results?.[0]) {
        const x = j.results[0];
        setCity({ name: `${x.name}, ${x.country_code}`, lat: x.latitude, lon: x.longitude, country: x.country_code });
        setSearch("");
      } else toast.error(isBn ? "শহর পাওয়া যায়নি" : "Not found");
    } catch { toast.error("Error"); }
  };

  // Build alerts
  const alerts: { level: "danger" | "warn"; text: string }[] = [];
  if (data?.current) {
    const c = data.current;
    if (c.temperature_2m >= 38) alerts.push({ level: "danger", text: isBn ? `🔥 চরম গরম: ${c.temperature_2m}°C — হিটস্ট্রোকের ঝুঁকি, প্রচুর পানি পান করুন` : `🔥 Extreme heat: ${c.temperature_2m}°C — heatstroke risk` });
    else if (c.temperature_2m >= 34) alerts.push({ level: "warn", text: isBn ? `☀️ বেশি গরম: ${c.temperature_2m}°C — সাবধান থাকুন` : `☀️ Hot: ${c.temperature_2m}°C` });
    if (c.temperature_2m <= 8) alerts.push({ level: "danger", text: isBn ? `🥶 প্রচণ্ড ঠান্ডা: ${c.temperature_2m}°C — গরম কাপড় পরুন` : `🥶 Severe cold: ${c.temperature_2m}°C` });
    else if (c.temperature_2m <= 12) alerts.push({ level: "warn", text: isBn ? `❄️ ঠান্ডা: ${c.temperature_2m}°C` : `❄️ Cold: ${c.temperature_2m}°C` });
    if ([95, 96, 99].includes(c.weather_code)) alerts.push({ level: "danger", text: isBn ? "⚡ বজ্রঝড়ের সতর্কতা — ঘরে থাকুন" : "⚡ Thunderstorm alert — stay indoors" });
    if (c.wind_gusts_10m >= 60) alerts.push({ level: "danger", text: isBn ? `🌪️ ঝড়ো বাতাস: ${c.wind_gusts_10m} km/h` : `🌪️ Storm wind: ${c.wind_gusts_10m} km/h` });
    else if (c.wind_speed_10m >= 40) alerts.push({ level: "warn", text: isBn ? `💨 দমকা হাওয়া: ${c.wind_speed_10m} km/h` : `💨 Strong wind: ${c.wind_speed_10m} km/h` });
    if ([65, 82].includes(c.weather_code)) alerts.push({ level: "warn", text: isBn ? "🌧️ ভারী বৃষ্টি — জলাবদ্ধতার সম্ভাবনা" : "🌧️ Heavy rain — flooding possible" });
  }
  // Next 24h heavy rain check
  if (data?.hourly) {
    const next24 = data.hourly.precipitation_probability?.slice(0, 24) || [];
    const maxProb = Math.max(...next24);
    if (maxProb >= 80) alerts.push({ level: "warn", text: isBn ? `☔ আগামী ২৪ ঘণ্টায় বৃষ্টির সম্ভাবনা ${maxProb}%` : `☔ ${maxProb}% rain chance next 24h` });
  }

  const current = data?.current;
  const currentInfo = current ? wmoCode(current.weather_code, isBn) : null;

  return (
    <div className="container py-8 max-w-5xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="rounded-3xl overflow-hidden mb-6 shadow-elegant">
          <img src={PAGE_BANNERS.weather} alt="Bangladesh weather" loading="lazy" width={1280} height={420} className="w-full h-48 md:h-64 object-cover" />
        </div>
        <h1 className="text-3xl md:text-4xl font-display font-bold mb-2">
          {isBn ? "🌤️ আবহাওয়া ও সতর্কতা" : "🌤️ Weather & Alerts"}
        </h1>
        <p className="text-muted-foreground mb-6">
          {isBn ? "বাংলাদেশ ও ভারতের নিকটবর্তী এলাকার সবচেয়ে নির্ভুল আবহাওয়া (Open-Meteo)" : "Accurate forecast for BD & nearby IN regions"}
        </p>

        <Card className="mb-6 border-2 border-primary/40 bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-primary text-base md:text-lg">
              <BellRing className="w-5 h-5" />
              {isBn ? "দুর্যোগে SMS অ্যালার্ট পেতে সাবস্ক্রাইব করুন" : "Subscribe for SMS alerts during severe weather"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-muted-foreground">
              {isBn
                ? `${city.name} অঞ্চলে ঝড়, বজ্রপাত, ভারী বৃষ্টি বা চরম তাপমাত্রার সতর্কতা সরাসরি ফোনে।`
                : `Get storm, lightning, heavy rain or extreme temperature alerts for ${city.name} on your phone.`}
            </p>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">{isBn ? "নাম (ঐচ্ছিক)" : "Name (optional)"}</Label>
                <Input value={subName} onChange={(e) => setSubName(e.target.value)} placeholder={isBn ? "আপনার নাম" : "Your name"} />
              </div>
              <div>
                <Label className="text-xs">{isBn ? "মোবাইল নম্বর *" : "Mobile *"}</Label>
                <Input value={subPhone} onChange={(e) => setSubPhone(e.target.value)} placeholder="01XXXXXXXXX" />
              </div>
            </div>
            <Button onClick={subscribeAlerts} disabled={subbing} className="w-full sm:w-auto rounded-full gradient-bg-primary text-white">
              <BellRing className="w-4 h-4 mr-2" />
              {subbing ? (isBn ? "প্রসেস হচ্ছে..." : "Processing...") : (isBn ? "সাবস্ক্রাইব করুন" : "Subscribe")}
            </Button>
          </CardContent>
        </Card>

        <div className="flex gap-2 mb-4 flex-wrap">
          <Input placeholder={isBn ? "শহর খুঁজুন..." : "Search city..."} value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSearch()} className="flex-1 min-w-[200px]" />
          <Button onClick={handleSearch}><Search className="w-4 h-4" /></Button>
          <Button variant="outline" onClick={useMyLocation}><MapPin className="w-4 h-4 mr-1" />{isBn ? "আমার অবস্থান" : "My Location"}</Button>
        </div>

        <div className="flex gap-2 mb-6 flex-wrap">
          {QUICK_CITIES.map((c) => (
            <Badge key={c.name} variant={city.name === c.name ? "default" : "outline"} className="cursor-pointer" onClick={() => setCity(c)}>
              {c.name}
            </Badge>
          ))}
        </div>

        {loading && <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin" /></div>}

        {!loading && data && (
          <>
            {alerts.length > 0 && (
              <Card className="mb-6 border-2 border-destructive/50">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-destructive">
                    <AlertTriangle className="w-5 h-5" />{isBn ? "সক্রিয় সতর্কতা" : "Active Alerts"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {alerts.map((a, i) => (
                    <div key={i} className={`p-3 rounded-lg ${a.level === "danger" ? "bg-destructive/10 text-destructive" : "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400"}`}>
                      {a.text}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {current && currentInfo && (
              <Card className="mb-6 gradient-bg-cool text-white">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-2"><MapPin className="w-4 h-4" /><span>{city.name}</span></div>
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <div className="text-6xl font-bold">{Math.round(current.temperature_2m)}°C</div>
                      <div className="text-lg opacity-90">{currentInfo.text}</div>
                      <div className="text-sm opacity-80">{isBn ? "অনুভূত" : "Feels like"} {Math.round(current.apparent_temperature)}°C</div>
                    </div>
                    <currentInfo.Icon className="w-24 h-24 opacity-80" />
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
                    <div className="bg-white/20 rounded-lg p-3"><Droplets className="w-4 h-4 mb-1" /><div className="text-xs opacity-80">{isBn ? "আর্দ্রতা" : "Humidity"}</div><div className="font-bold">{current.relative_humidity_2m}%</div></div>
                    <div className="bg-white/20 rounded-lg p-3"><Wind className="w-4 h-4 mb-1" /><div className="text-xs opacity-80">{isBn ? "বাতাস" : "Wind"}</div><div className="font-bold">{current.wind_speed_10m} km/h</div></div>
                    <div className="bg-white/20 rounded-lg p-3"><CloudRain className="w-4 h-4 mb-1" /><div className="text-xs opacity-80">{isBn ? "বৃষ্টি" : "Rain"}</div><div className="font-bold">{current.precipitation} mm</div></div>
                    <div className="bg-white/20 rounded-lg p-3"><Thermometer className="w-4 h-4 mb-1" /><div className="text-xs opacity-80">{isBn ? "দমকা" : "Gusts"}</div><div className="font-bold">{current.wind_gusts_10m} km/h</div></div>
                  </div>
                </CardContent>
              </Card>
            )}

            {data.daily && (
              <Card>
                <CardHeader><CardTitle>{isBn ? "৭ দিনের পূর্বাভাস" : "7-Day Forecast"}</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {data.daily.time.map((d: string, i: number) => {
                      const info = wmoCode(data.daily.weather_code[i], isBn);
                      const date = new Date(d);
                      return (
                        <div key={d} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                          <div className="flex items-center gap-3 flex-1">
                            <info.Icon className="w-6 h-6 text-primary" />
                            <div>
                              <div className="font-medium">{date.toLocaleDateString(isBn ? "bn-BD" : "en-US", { weekday: "short", day: "numeric", month: "short" })}</div>
                              <div className="text-xs text-muted-foreground">{info.text}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-muted-foreground">💧 {data.daily.precipitation_probability_max[i]}%</div>
                            <div className="font-bold">{Math.round(data.daily.temperature_2m_max[i])}° / {Math.round(data.daily.temperature_2m_min[i])}°</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
};

export default Weather;
