import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { CloudRain, Wind, Thermometer, Droplets, AlertTriangle, MapPin, Sun, CloudSnow, Cloud, Search, Loader2, BellRing, Clock, CalendarDays, Layers } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { PAGE_BANNERS } from "@/lib/siteImages";

interface City { name: string; lat: number; lon: number; country: string }

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

// Different weather forecast model sources (all served via Open-Meteo for unified format)
const MODELS = [
  { id: "best_match", bn: "সেরা মিশ্রণ (Best Match)", en: "Best Match", desc: "Open-Meteo's auto-selected best model" },
  { id: "ecmwf_ifs025", bn: "ECMWF (ইউরোপীয়)", en: "ECMWF (European)", desc: "European Centre — world's most accurate model" },
  { id: "gfs_seamless", bn: "GFS (মার্কিন NOAA)", en: "GFS (US NOAA)", desc: "US Global Forecast System" },
  { id: "icon_seamless", bn: "ICON (জার্মান DWD)", en: "ICON (German DWD)", desc: "German national weather service" },
  { id: "jma_seamless", bn: "JMA (জাপান)", en: "JMA (Japan)", desc: "Japan Meteorological Agency" },
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

// Generate Bangla narrative for an hour
const hourNarrative = (h: number, code: number, temp: number, prob: number, isBn: boolean) => {
  const w = wmoCode(code, isBn).text;
  if (!isBn) return `${w}, ${Math.round(temp)}°C${prob >= 30 ? `, ${prob}% rain chance` : ""}`;
  let timeOfDay = "";
  if (h >= 5 && h < 12) timeOfDay = "সকালে";
  else if (h >= 12 && h < 16) timeOfDay = "দুপুরে";
  else if (h >= 16 && h < 19) timeOfDay = "বিকেলে";
  else if (h >= 19 && h < 22) timeOfDay = "সন্ধ্যায়";
  else timeOfDay = "রাতে";
  let rainHint = "";
  if (prob >= 70) rainHint = " — ছাতা সাথে রাখুন";
  else if (prob >= 40) rainHint = " — বৃষ্টির সম্ভাবনা";
  return `${timeOfDay} ${w}, ${Math.round(temp)}°C${rainHint}`;
};

const Weather = () => {
  const { language } = useLanguage();
  const isBn = language === "bn";
  const [city, setCity] = useState<City>(QUICK_CITIES[0]);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [longRange, setLongRange] = useState<any>(null);
  const [longLoading, setLongLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [subPhone, setSubPhone] = useState("");
  const [subName, setSubName] = useState("");
  const [subbing, setSubbing] = useState(false);
  const [model, setModel] = useState("best_match");
  const [days, setDays] = useState(7);          // 7 / 14 / 16
  const [longDays, setLongDays] = useState(30); // 30 / 60 / 90

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
      toast.success(isBn ? "✅ সাবস্ক্রিপশন সম্পন্ন — দুর্যোগে SMS পাবেন" : "✅ Subscribed");
      setSubPhone(""); setSubName("");
    } catch (e: any) {
      toast.error(e.message || "Failed");
    } finally { setSubbing(false); }
  };

  const fetchWeather = async (c: City, m: string, d: number) => {
    setLoading(true);
    try {
      const modelParam = m === "best_match" ? "" : `&models=${m}`;
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${c.lat}&longitude=${c.lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m,wind_gusts_10m&hourly=temperature_2m,precipitation_probability,precipitation,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,sunrise,sunset&timezone=auto&forecast_days=${d}${modelParam}`;
      const r = await fetch(url);
      const j = await r.json();
      setData(j);
    } catch { toast.error(isBn ? "আবহাওয়া লোড ব্যর্থ" : "Failed to load"); }
    finally { setLoading(false); }
  };

  // Long-range (30/60/90 days) via Open-Meteo seasonal/extended models
  const fetchLongRange = async (c: City, d: number) => {
    setLongLoading(true);
    try {
      // Use ECMWF IFS extended-range model which provides ~46 days, and chain to longer if needed
      // For >16 days, we use the "seasonal" forecast API
      const url = `https://climate-api.open-meteo.com/v1/climate?latitude=${c.lat}&longitude=${c.lon}&start_date=${todayStr()}&end_date=${addDaysStr(d-1)}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&models=EC_Earth3P_HR&timezone=auto`;
      const r = await fetch(url);
      const j = await r.json();
      setLongRange(j);
    } catch {
      // graceful fallback — show climatology message
      setLongRange(null);
    } finally { setLongLoading(false); }
  };

  useEffect(() => { fetchWeather(city, model, days); }, [city, model, days]);
  useEffect(() => { fetchLongRange(city, longDays); }, [city, longDays]);

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

  // Enhanced alerts with severity + recommended actions
  type Alert = {
    severity: "extreme" | "severe" | "moderate" | "advisory";
    icon: string;
    title: string;
    detail: string;
    actions: string[];
  };
  const alerts: Alert[] = [];

  if (data?.current && data?.hourly && data?.daily) {
    const c = data.current;
    const next24Prob = data.hourly.precipitation_probability?.slice(0, 24) || [];
    const next24Precip = data.hourly.precipitation?.slice(0, 24) || [];
    const next24Codes = data.hourly.weather_code?.slice(0, 24) || [];
    const next24Wind = data.hourly.wind_speed_10m?.slice(0, 24) || [];
    const maxProb = Math.max(0, ...next24Prob);
    const totalRain24 = next24Precip.reduce((a: number, b: number) => a + (b || 0), 0);
    const peakRainHourIdx = next24Precip.indexOf(Math.max(...next24Precip, 0));
    const peakRainTime = data.hourly.time?.[peakRainHourIdx];
    const hasThunder24 = next24Codes.some((c: number) => [95, 96, 99].includes(c));
    const maxWind24 = Math.max(0, ...next24Wind);

    // ☀️ Extreme heat
    if (c.temperature_2m >= 40 || c.apparent_temperature >= 42) {
      alerts.push({
        severity: "extreme",
        icon: "🔥",
        title: isBn ? "চরম তাপদাহ সতর্কতা" : "Extreme Heat Warning",
        detail: isBn
          ? `তাপমাত্রা ${Math.round(c.temperature_2m)}°C, অনুভূত ${Math.round(c.apparent_temperature)}°C — হিটস্ট্রোকের উচ্চ ঝুঁকি।`
          : `Temperature ${Math.round(c.temperature_2m)}°C, feels like ${Math.round(c.apparent_temperature)}°C — high heatstroke risk.`,
        actions: isBn
          ? ["দুপুর ১১টা–৪টা ঘরের বাইরে যাবেন না", "প্রতি ১৫–২০ মিনিটে পানি/স্যালাইন পান করুন", "হালকা সুতি কাপড়, ছাতা/টুপি ব্যবহার করুন", "শিশু, বয়স্ক ও অসুস্থদের প্রতি বিশেষ নজর", "মাথা ঘোরা/বমি হলে দ্রুত ছায়ায় যান, ডাক্তার ডাকুন"]
          : ["Avoid outdoor activity 11 AM – 4 PM", "Drink water/ORS every 15–20 minutes", "Wear light cotton clothes, hat, umbrella", "Check on children, elderly, and the sick", "Move to shade and seek help if dizzy or nauseous"],
      });
    } else if (c.temperature_2m >= 36) {
      alerts.push({
        severity: "severe",
        icon: "☀️",
        title: isBn ? "তাপপ্রবাহ" : "Heat Wave",
        detail: isBn
          ? `${Math.round(c.temperature_2m)}°C — অনুভূত ${Math.round(c.apparent_temperature)}°C। দীর্ঘ সময় রোদে থাকা ক্ষতিকর।`
          : `${Math.round(c.temperature_2m)}°C — feels like ${Math.round(c.apparent_temperature)}°C.`,
        actions: isBn
          ? ["প্রচুর পানি ও তরল পান করুন", "সরাসরি রোদ এড়িয়ে চলুন", "হালকা রঙের ঢিলেঢালা পোশাক পরুন", "ক্যাফেইন ও অ্যালকোহল এড়িয়ে চলুন"]
          : ["Drink plenty of fluids", "Stay out of direct sun", "Wear light, loose clothing", "Avoid caffeine and alcohol"],
      });
    } else if (c.temperature_2m >= 34) {
      alerts.push({
        severity: "moderate",
        icon: "🌡️",
        title: isBn ? "গরমের সতর্কতা" : "Hot Weather Advisory",
        detail: isBn ? `${Math.round(c.temperature_2m)}°C — অস্বস্তিকর গরম।` : `${Math.round(c.temperature_2m)}°C — uncomfortably warm.`,
        actions: isBn ? ["পর্যাপ্ত পানি পান করুন", "ছায়ায় বিশ্রাম নিন"] : ["Stay hydrated", "Rest in shade frequently"],
      });
    }

    // ⛈️ Thunderstorm
    if ([95, 96, 99].includes(c.weather_code) || (hasThunder24 && c.weather_code !== 0)) {
      const isNow = [95, 96, 99].includes(c.weather_code);
      alerts.push({
        severity: c.weather_code === 99 ? "extreme" : isNow ? "severe" : "moderate",
        icon: "⛈️",
        title: isBn ? (isNow ? "বজ্রঝড় চলছে" : "আসন্ন বজ্রঝড়") : (isNow ? "Thunderstorm Active" : "Thunderstorm Expected"),
        detail: isBn
          ? (isNow ? "বজ্রপাত ও দমকা হাওয়ার ঝুঁকি।" : "আগামী ২৪ ঘণ্টায় বজ্রঝড়ের পূর্বাভাস।")
          : (isNow ? "Active lightning and gusty wind risk." : "Thunderstorm forecast within 24h."),
        actions: isBn
          ? ["খোলা মাঠ, গাছ ও বৈদ্যুতিক খুঁটি থেকে দূরে থাকুন", "পাকা ভবনের ভেতরে আশ্রয় নিন", "টিভি/ফ্রিজ/চার্জার আনপ্লাগ করুন", "মোবাইল চার্জে রেখে কথা বলবেন না", "ধাতব ছাতা/ছাদ এড়িয়ে চলুন"]
          : ["Stay away from open fields, trees, and poles", "Shelter inside a concrete building", "Unplug TVs, fridges, chargers", "Avoid using phones while charging", "Avoid metal umbrellas and roofs"],
      });
    }

    // 🌪️ Storm / strong wind
    if (c.wind_gusts_10m >= 88 || maxWind24 >= 88) {
      alerts.push({
        severity: "extreme",
        icon: "🌪️",
        title: isBn ? "ঘূর্ণিঝড় / প্রবল ঝড়" : "Severe Storm",
        detail: isBn ? `দমকা বাতাস ${Math.round(Math.max(c.wind_gusts_10m, maxWind24))} km/h — ঘরবাড়ি ক্ষতির ঝুঁকি।` : `Gusts ${Math.round(Math.max(c.wind_gusts_10m, maxWind24))} km/h — property damage risk.`,
        actions: isBn
          ? ["নিরাপদ আশ্রয়কেন্দ্রে চলে যান", "জরুরি কাগজ, টর্চ, পানি ও শুকনা খাবার প্রস্তুত রাখুন", "গাছ/সাইনবোর্ড/টিনের ছাদ থেকে দূরে থাকুন", "জানালা টেপ দিয়ে শক্ত করুন", "বিদ্যুৎ ও গ্যাস মেইন বন্ধ রাখুন"]
          : ["Move to a designated shelter", "Keep documents, torch, water, dry food ready", "Stay away from trees, signboards, tin roofs", "Tape/reinforce windows", "Turn off main electricity and gas"],
      });
    } else if (c.wind_gusts_10m >= 60 || maxWind24 >= 60) {
      alerts.push({
        severity: "severe",
        icon: "💨",
        title: isBn ? "ঝড়ো বাতাসের সতর্কতা" : "Storm Wind Warning",
        detail: isBn ? `${Math.round(Math.max(c.wind_gusts_10m, maxWind24))} km/h দমকা বাতাস সম্ভব।` : `Gusts up to ${Math.round(Math.max(c.wind_gusts_10m, maxWind24))} km/h possible.`,
        actions: isBn
          ? ["আলগা জিনিসপত্র, ফুলের টব ভেতরে নিন", "মোটরসাইকেল/সাইকেল সাবধানে চালান", "নৌকা/ট্রলার তীরে রাখুন"]
          : ["Secure loose objects and pots", "Ride two-wheelers cautiously", "Bring boats ashore"],
      });
    } else if (c.wind_speed_10m >= 40) {
      alerts.push({
        severity: "moderate",
        icon: "💨",
        title: isBn ? "দমকা হাওয়া" : "Strong Wind",
        detail: isBn ? `বাতাসের গতি ${Math.round(c.wind_speed_10m)} km/h।` : `Wind ${Math.round(c.wind_speed_10m)} km/h.`,
        actions: isBn ? ["আলগা ছাতা/ব্যানার সরিয়ে ফেলুন"] : ["Secure loose items outdoors"],
      });
    }

    // 🌧️ Heavy rain / rain
    const peakHr = peakRainTime ? new Date(peakRainTime).toLocaleTimeString(isBn ? "bn-BD" : "en-US", { hour: "numeric", hour12: true }) : "";
    if (totalRain24 >= 89 || next24Precip.some((p: number) => p >= 30)) {
      alerts.push({
        severity: "extreme",
        icon: "🌊",
        title: isBn ? "অতি ভারী বর্ষণ ও জলাবদ্ধতা" : "Extremely Heavy Rainfall",
        detail: isBn
          ? `আগামী ২৪ ঘণ্টায় ~${Math.round(totalRain24)} mm বৃষ্টি — শীর্ষ ${peakHr}। জলাবদ্ধতা/বন্যার ঝুঁকি।`
          : `~${Math.round(totalRain24)} mm in 24h — peak around ${peakHr}. Flooding risk.`,
        actions: isBn
          ? ["নিচু এলাকা/আন্ডারপাস এড়িয়ে চলুন", "বৈদ্যুতিক খুঁটি ও ছেড়া তার থেকে দূরে থাকুন", "গুরুত্বপূর্ণ জিনিস উঁচু জায়গায় রাখুন", "জরুরি ওষুধ, পানি, শুকনা খাবার মজুদ রাখুন", "ভ্রমণ পরিকল্পনা স্থগিত করুন"]
          : ["Avoid low-lying areas and underpasses", "Stay clear of poles and downed wires", "Move valuables to higher ground", "Stock medicine, water, dry food", "Postpone travel plans"],
      });
    } else if (totalRain24 >= 50 || next24Precip.some((p: number) => p >= 15)) {
      alerts.push({
        severity: "severe",
        icon: "🌧️",
        title: isBn ? "ভারী বৃষ্টিপাত" : "Heavy Rainfall",
        detail: isBn
          ? `আগামী ২৪ ঘণ্টায় ~${Math.round(totalRain24)} mm বৃষ্টি প্রত্যাশিত — শীর্ষ ${peakHr}।`
          : `~${Math.round(totalRain24)} mm expected in 24h — peak ${peakHr}.`,
        actions: isBn
          ? ["ছাতা/রেইনকোট সাথে রাখুন", "ধীরে গাড়ি চালান, হেডলাইট জ্বালান", "ছাদ/ড্রেন পরিষ্কার রাখুন", "ফোন/পাওয়ারব্যাংক চার্জ করে রাখুন"]
          : ["Carry umbrella/raincoat", "Drive slowly with headlights on", "Clear roof drains and gutters", "Charge phones and power banks"],
      });
    } else if (maxProb >= 70) {
      alerts.push({
        severity: "moderate",
        icon: "☔",
        title: isBn ? "বৃষ্টির প্রবল সম্ভাবনা" : "Likely Rain",
        detail: isBn ? `সর্বোচ্চ ${maxProb}% সম্ভাবনা — সম্ভাব্য শীর্ষ ${peakHr}।` : `${maxProb}% chance — peak around ${peakHr}.`,
        actions: isBn ? ["বের হওয়ার আগে ছাতা নিন", "কাপড় ছাদ থেকে নামিয়ে রাখুন"] : ["Take an umbrella", "Bring laundry inside"],
      });
    } else if (maxProb >= 40) {
      alerts.push({
        severity: "advisory",
        icon: "🌦️",
        title: isBn ? "মাঝারি বৃষ্টির সম্ভাবনা" : "Possible Showers",
        detail: isBn ? `${maxProb}% সম্ভাবনা আগামী ২৪ ঘণ্টায়।` : `${maxProb}% chance over next 24h.`,
        actions: isBn ? ["সম্ভব হলে ছাতা সাথে রাখুন"] : ["Keep an umbrella handy"],
      });
    }

    // ❄️ Cold
    if (c.temperature_2m <= 6) {
      alerts.push({
        severity: "severe",
        icon: "🥶",
        title: isBn ? "শৈত্যপ্রবাহ" : "Cold Wave",
        detail: isBn ? `${Math.round(c.temperature_2m)}°C — তীব্র ঠান্ডা।` : `${Math.round(c.temperature_2m)}°C — severe cold.`,
        actions: isBn ? ["গরম কাপড় ও কম্বল ব্যবহার করুন", "শিশু-বয়স্কদের ঘরে রাখুন", "গরম পানীয় পান করুন"] : ["Wear warm layers and blankets", "Keep elderly and children indoors", "Drink warm fluids"],
      });
    }
  }

  const sevStyle = (s: Alert["severity"]) => ({
    extreme: "bg-red-600/10 border-red-600 text-red-700 dark:text-red-300",
    severe: "bg-orange-500/10 border-orange-500 text-orange-700 dark:text-orange-300",
    moderate: "bg-yellow-500/10 border-yellow-500 text-yellow-800 dark:text-yellow-300",
    advisory: "bg-blue-500/10 border-blue-500 text-blue-700 dark:text-blue-300",
  })[s];
  const sevLabel = (s: Alert["severity"]) => isBn
    ? ({ extreme: "চরম", severe: "তীব্র", moderate: "মাঝারি", advisory: "পরামর্শ" }[s])
    : ({ extreme: "EXTREME", severe: "SEVERE", moderate: "MODERATE", advisory: "ADVISORY" }[s]);

  // Next 24h hourly slice
  const hourly24 = useMemo(() => {
    if (!data?.hourly) return [];
    const now = new Date();
    const nowH = now.getHours();
    const startIdx = (data.hourly.time as string[]).findIndex(t => new Date(t).getHours() === nowH && new Date(t).getDate() === now.getDate());
    const idx = startIdx === -1 ? 0 : startIdx;
    return Array.from({ length: 24 }, (_, i) => {
      const j = idx + i;
      return {
        time: data.hourly.time[j],
        temp: data.hourly.temperature_2m[j],
        code: data.hourly.weather_code[j],
        prob: data.hourly.precipitation_probability?.[j] ?? 0,
        precip: data.hourly.precipitation?.[j] ?? 0,
        wind: data.hourly.wind_speed_10m?.[j] ?? 0,
      };
    });
  }, [data]);

  const current = data?.current;
  const currentInfo = current ? wmoCode(current.weather_code, isBn) : null;

  return (
    <div className="container py-8 max-w-5xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="rounded-3xl overflow-hidden mb-6 shadow-elegant">
          <img src={PAGE_BANNERS.weather} alt="Bangladesh weather" loading="lazy" width={1280} height={420} className="w-full h-48 md:h-64 object-cover" />
        </div>
        <h1 className="text-3xl md:text-4xl font-display font-bold mb-2">{isBn ? "🌤️ আবহাওয়া ও পূর্বাভাস" : "🌤️ Weather & Forecast"}</h1>
        <p className="text-muted-foreground mb-6">{isBn ? "ঘণ্টা-ভিত্তিক, ১৬ দিন ও দীর্ঘমেয়াদি পূর্বাভাস — একাধিক মডেল থেকে" : "Hourly, 16-day & long-range forecast — from multiple models"}</p>



        <div className="flex gap-2 mb-4 flex-wrap">
          <Input placeholder={isBn ? "শহর খুঁজুন..." : "Search city..."} value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSearch()} className="flex-1 min-w-[200px]" />
          <Button onClick={handleSearch}><Search className="w-4 h-4" /></Button>
          <Button variant="outline" onClick={useMyLocation}><MapPin className="w-4 h-4 mr-1" />{isBn ? "আমার অবস্থান" : "Location"}</Button>
        </div>

        <div className="flex gap-2 mb-4 flex-wrap">
          {QUICK_CITIES.map((c) => (
            <Badge key={c.name} variant={city.name === c.name ? "default" : "outline"} className="cursor-pointer" onClick={() => setCity(c)}>{c.name}</Badge>
          ))}
        </div>

        {/* Model selector */}
        <Card className="mb-6 bg-muted/30">
          <CardContent className="p-3 flex items-center gap-3 flex-wrap">
            <Layers className="w-4 h-4 text-primary shrink-0" />
            <Label className="text-xs font-semibold whitespace-nowrap">{isBn ? "ডেটা সোর্স / মডেল:" : "Data source:"}</Label>
            <Select value={model} onValueChange={setModel}>
              <SelectTrigger className="w-auto min-w-[220px] h-8"><SelectValue /></SelectTrigger>
              <SelectContent>
                {MODELS.map(m => <SelectItem key={m.id} value={m.id}>{isBn ? m.bn : m.en} — <span className="text-muted-foreground text-xs">{m.desc}</span></SelectItem>)}
              </SelectContent>
            </Select>
            <span className="text-[11px] text-muted-foreground">{isBn ? "বিভিন্ন মডেল তুলনা করে সবচেয়ে কাছাকাছি ফলাফল বেছে নিন" : "Compare models for best accuracy"}</span>
          </CardContent>
        </Card>

        {loading && <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin" /></div>}

        {!loading && data && (
          <>
            {alerts.length > 0 && (
              <Card className="mb-6 border-2 border-destructive/50">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-destructive">
                    <AlertTriangle className="w-5 h-5" />
                    {isBn ? "সক্রিয় আবহাওয়া সতর্কতা" : "Active Weather Alerts"}
                    <Badge variant="outline" className="ml-auto text-xs">{alerts.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {alerts.map((a, i) => (
                    <div key={i} className={`p-4 rounded-lg border-l-4 ${sevStyle(a.severity)}`}>
                      <div className="flex items-center justify-between gap-2 mb-1 flex-wrap">
                        <div className="font-bold text-sm md:text-base flex items-center gap-2">
                          <span className="text-xl">{a.icon}</span>{a.title}
                        </div>
                        <Badge variant="outline" className="text-[10px] font-bold tracking-wider">{sevLabel(a.severity)}</Badge>
                      </div>
                      <p className="text-xs md:text-sm mb-2 opacity-90">{a.detail}</p>
                      <div className="bg-background/40 rounded-md p-2 mt-2">
                        <div className="text-[11px] font-semibold mb-1 uppercase tracking-wide opacity-70">
                          {isBn ? "✅ করণীয়" : "✅ Recommended actions"}
                        </div>
                        <ul className="text-xs space-y-0.5 list-disc list-inside marker:opacity-50">
                          {a.actions.map((ac, j) => <li key={j}>{ac}</li>)}
                        </ul>
                      </div>
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

            {/* Forecast tabs: hourly / daily / long range */}
            <Tabs defaultValue="hourly" className="mb-6">
              <TabsList className="w-full grid grid-cols-3 h-auto">
                <TabsTrigger value="hourly" className="text-xs md:text-sm py-2"><Clock className="w-3.5 h-3.5 mr-1" />{isBn ? "ঘণ্টা-ভিত্তিক ২৪ঘ" : "Hourly 24h"}</TabsTrigger>
                <TabsTrigger value="daily" className="text-xs md:text-sm py-2"><CalendarDays className="w-3.5 h-3.5 mr-1" />{isBn ? "৭–১৬ দিন" : "7–16 days"}</TabsTrigger>
                <TabsTrigger value="long" className="text-xs md:text-sm py-2">📅 {isBn ? "৩০/৬০ দিন" : "30/60 days"}</TabsTrigger>
              </TabsList>

              {/* HOURLY */}
              <TabsContent value="hourly" className="mt-3">
                <Card>
                  <CardHeader className="pb-2"><CardTitle className="text-base">{isBn ? "আগামী ২৪ ঘণ্টার বিস্তারিত" : "Next 24 hours"}</CardTitle></CardHeader>
                  <CardContent>
                    <div className="space-y-1.5 max-h-[500px] overflow-y-auto pr-1">
                      {hourly24.map((h, i) => {
                        const info = wmoCode(h.code, isBn);
                        const t = new Date(h.time);
                        const isHigh = h.prob >= 60;
                        return (
                          <div key={i} className={`flex items-center gap-3 p-2.5 rounded-lg ${isHigh ? "bg-blue-500/10 border border-blue-500/30" : "bg-muted/40"}`}>
                            <div className="w-14 shrink-0 text-center">
                              <div className="text-sm font-bold">{t.toLocaleTimeString(isBn ? "bn-BD" : "en-US", { hour: "numeric", hour12: true })}</div>
                              <div className="text-[10px] text-muted-foreground">{t.toLocaleDateString(isBn ? "bn-BD" : "en-US", { weekday: "short" })}</div>
                            </div>
                            <info.Icon className="w-6 h-6 text-primary shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium truncate">{hourNarrative(t.getHours(), h.code, h.temp, h.prob, isBn)}</div>
                              <div className="text-[11px] text-muted-foreground flex gap-3 flex-wrap">
                                <span>💧 {h.prob}%</span>
                                {h.precip > 0 && <span>🌧️ {h.precip.toFixed(1)}mm</span>}
                                <span>💨 {Math.round(h.wind)}km/h</span>
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <div className="font-bold text-lg">{Math.round(h.temp)}°</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* DAILY 7/14/16 */}
              <TabsContent value="daily" className="mt-3">
                <Card>
                  <CardHeader className="pb-2 flex flex-row items-center justify-between flex-wrap gap-2">
                    <CardTitle className="text-base">{isBn ? `${days} দিনের পূর্বাভাস` : `${days}-day forecast`}</CardTitle>
                    <div className="flex gap-1">
                      {[7, 14, 16].map(n => (
                        <Button key={n} size="sm" variant={days === n ? "default" : "outline"} onClick={() => setDays(n)} className="h-7 text-xs px-3">{n}{isBn ? " দিন" : "d"}</Button>
                      ))}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {data.daily?.time.map((d: string, i: number) => {
                        const info = wmoCode(data.daily.weather_code[i], isBn);
                        const date = new Date(d);
                        const prob = data.daily.precipitation_probability_max[i] ?? 0;
                        const sum = data.daily.precipitation_sum[i] ?? 0;
                        const sr = data.daily.sunrise?.[i]?.split("T")[1]?.slice(0, 5);
                        const ss = data.daily.sunset?.[i]?.split("T")[1]?.slice(0, 5);
                        const wind = Math.round(data.daily.wind_speed_10m_max?.[i] ?? 0);
                        let narrative = "";
                        if (isBn) {
                          if (prob >= 70) narrative = "সারাদিনে বৃষ্টি হওয়ার প্রবল সম্ভাবনা — ছাতা সাথে রাখুন।";
                          else if (prob >= 40) narrative = "মাঝে-মাঝে বৃষ্টির সম্ভাবনা আছে।";
                          else if (info.text.includes("পরিষ্কার")) narrative = "দিনটি প্রায় শুষ্ক ও পরিষ্কার থাকবে।";
                          else narrative = info.text + " থাকবে।";
                          if (wind >= 40) narrative += ` দমকা হাওয়া (${wind} km/h) সম্ভব।`;
                        }
                        return (
                          <div key={d} className="p-3 rounded-lg bg-muted/40 border border-border/40">
                            <div className="flex items-center justify-between gap-3 flex-wrap">
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <info.Icon className="w-7 h-7 text-primary shrink-0" />
                                <div className="min-w-0">
                                  <div className="font-semibold">{date.toLocaleDateString(isBn ? "bn-BD" : "en-US", { weekday: "long", day: "numeric", month: "short" })}</div>
                                  <div className="text-xs text-muted-foreground">{info.text}</div>
                                </div>
                              </div>
                              <div className="text-right shrink-0">
                                <div className="text-xs text-muted-foreground">💧 {prob}%{sum > 0 ? ` · ${sum.toFixed(1)}mm` : ""}</div>
                                <div className="font-bold">{Math.round(data.daily.temperature_2m_max[i])}° / {Math.round(data.daily.temperature_2m_min[i])}°</div>
                              </div>
                            </div>
                            {(narrative || sr) && (
                              <div className="mt-2 pt-2 border-t border-border/40 text-xs text-muted-foreground space-y-0.5">
                                {narrative && <p>📝 {narrative}</p>}
                                {sr && <p>🌅 {isBn ? "সূর্যোদয়" : "Sunrise"}: {sr} · 🌇 {isBn ? "সূর্যাস্ত" : "Sunset"}: {ss} · 💨 {wind} km/h</p>}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* LONG RANGE 30/60/90 */}
              <TabsContent value="long" className="mt-3">
                <Card>
                  <CardHeader className="pb-2 flex flex-row items-center justify-between flex-wrap gap-2">
                    <CardTitle className="text-base">{isBn ? `${longDays} দিনের দীর্ঘমেয়াদি পূর্বাভাস` : `${longDays}-day long-range`}</CardTitle>
                    <div className="flex gap-1">
                      {[30, 60, 90].map(n => (
                        <Button key={n} size="sm" variant={longDays === n ? "default" : "outline"} onClick={() => setLongDays(n)} className="h-7 text-xs px-3">{n}{isBn ? " দিন" : "d"}</Button>
                      ))}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-[11px] text-muted-foreground mb-3">
                      {isBn
                        ? "⚠️ দীর্ঘমেয়াদি পূর্বাভাস জলবায়ু মডেল (EC-Earth3P-HR) থেকে — সাধারণ প্রবণতা বুঝতে সাহায্য করে, কিন্তু নির্দিষ্ট দিনের সঠিকতা কম। ৭ দিনের ভেতরের পূর্বাভাস বেশি নির্ভুল।"
                        : "⚠️ Long-range from climate model (EC-Earth3P-HR) — useful for trends, not exact daily values."}
                    </p>
                    {longLoading && <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin" /></div>}
                    {!longLoading && longRange?.daily ? (
                      <div className="space-y-1.5 max-h-[600px] overflow-y-auto pr-1">
                        {longRange.daily.time.map((d: string, i: number) => {
                          const date = new Date(d);
                          const max = longRange.daily.temperature_2m_max?.[i];
                          const min = longRange.daily.temperature_2m_min?.[i];
                          const rain = longRange.daily.precipitation_sum?.[i] ?? 0;
                          return (
                            <div key={d} className="flex items-center justify-between p-2 rounded-lg bg-muted/30 text-sm">
                              <div className="flex-1">
                                <span className="font-medium">{date.toLocaleDateString(isBn ? "bn-BD" : "en-US", { weekday: "short", day: "numeric", month: "short" })}</span>
                                {rain >= 5 && <span className="text-xs text-blue-600 dark:text-blue-400 ml-2">🌧️ {rain.toFixed(1)}mm {isBn ? "(বৃষ্টি)" : ""}</span>}
                              </div>
                              <div className="text-right">
                                <span className="font-bold">{Math.round(max)}°</span>
                                <span className="text-muted-foreground"> / {Math.round(min)}°</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (!longLoading && (
                      <p className="text-center text-sm text-muted-foreground py-6">{isBn ? "দীর্ঘমেয়াদি ডেটা লোড হয়নি — কিছুক্ষণ পর আবার চেষ্টা করুন।" : "Long-range data unavailable"}</p>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <p className="text-center text-[10px] text-muted-foreground">
              {isBn ? "ডেটা সোর্স" : "Sources"}: Open-Meteo · ECMWF · NOAA GFS · DWD ICON · JMA · EC-Earth3P-HR
              {model !== "best_match" && <> · {isBn ? "বর্তমান মডেল" : "current"}: <strong>{MODELS.find(m => m.id === model)?.en}</strong></>}
            </p>

            {/* SMS alerts — bottom */}
            <Card className="mt-6 border-2 border-primary/40 bg-primary/5">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-primary text-base md:text-lg">
                  <BellRing className="w-5 h-5" />
                  {isBn ? "দুর্যোগে SMS অ্যালার্ট" : "SMS Disaster Alerts"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-muted-foreground">
                  {isBn
                    ? `${city.name} অঞ্চলের ঝড়, বজ্রপাত, ভারী বৃষ্টি বা চরম তাপমাত্রার সতর্কতা সরাসরি ফোনে SMS-এ পাবেন।`
                    : `Get SMS alerts for storms, lightning, heavy rain, and extreme heat in ${city.name}.`}
                </p>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">{isBn ? "নাম (ঐচ্ছিক)" : "Name"}</Label>
                    <Input value={subName} onChange={(e) => setSubName(e.target.value)} placeholder={isBn ? "আপনার নাম" : "Your name"} />
                  </div>
                  <div>
                    <Label className="text-xs">{isBn ? "মোবাইল *" : "Mobile *"}</Label>
                    <Input value={subPhone} onChange={(e) => setSubPhone(e.target.value)} placeholder="01XXXXXXXXX" />
                  </div>
                </div>
                <Button onClick={subscribeAlerts} disabled={subbing} className="w-full sm:w-auto rounded-full gradient-bg-primary text-white">
                  <BellRing className="w-4 h-4 mr-2" />
                  {subbing ? "..." : (isBn ? "সাবস্ক্রাইব করুন" : "Subscribe")}
                </Button>
              </CardContent>
            </Card>
          </>
        )}
      </motion.div>
    </div>
  );
};

const todayStr = () => new Date().toISOString().slice(0, 10);
const addDaysStr = (n: number) => { const d = new Date(); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); };

export default Weather;
