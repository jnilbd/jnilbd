import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { Tv, Radio, Search, Play, Loader2, Trophy, Star, CheckCircle2, XCircle, Activity, Globe2, Flag } from "lucide-react";
import Hls from "hls.js";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";
import SportsSchedule from "@/components/SportsSchedule";

const DEAD_KEY = "livetv:dead:v1";

type Tab = "tv" | "sports" | "radio";
type Health = "unknown" | "checking" | "live" | "dead";

type Channel = {
  id: string;
  name: string;
  country: string; // ISO code
  countryName?: string;
  category: Tab;
  categories?: string[];
  logo?: string;
  url: string;
  isFallback?: boolean;
};

const FAV_KEY = "livetv:favorites:v2";

// Always-on fallback streams (tested, public, no special headers)
const FALLBACK_TV: Channel[] = [
  { id: "fb-aje", name: "Al Jazeera English", country: "QA", category: "tv", url: "https://live-hls-web-aje.getaj.net/AJE/index.m3u8", isFallback: true },
  { id: "fb-dw", name: "DW English", country: "DE", category: "tv", url: "https://dwamdstream102.akamaized.net/hls/live/2015525/dwstream102/index.m3u8", isFallback: true },
  { id: "fb-france24", name: "France 24 English", country: "FR", category: "tv", url: "https://static.france24.com/live/F24_EN_LO_HLS/live_web.m3u8", isFallback: true },
  { id: "fb-nhk", name: "NHK World Japan", country: "JP", category: "tv", url: "https://nhkwlive-ojp.akamaized.net/hls/live/2003459/nhkwlive-ojp-en/index.m3u8", isFallback: true },
  { id: "fb-bloomberg", name: "Bloomberg TV", country: "US", category: "tv", url: "https://liveproduseast.global.ssl.fastly.net/atishay-public/3/index.m3u8", isFallback: true },
];

const FALLBACK_SPORTS: Channel[] = [
  { id: "fb-redbull", name: "Red Bull TV", country: "AT", category: "sports", url: "https://rbmn-live.akamaized.net/hls/live/590964/BoRB-AT/master.m3u8", isFallback: true },
  { id: "fb-fast-action", name: "FAST Action Sports", country: "US", category: "sports", url: "https://amg00489-amg00489c12-amg-fast-2-rakuten.amagi.tv/playlist/amg00489-blackbeltmagazine-blackbeltmagazine-rakuten/playlist.m3u8", isFallback: true },
  { id: "fb-stadium", name: "Stadium", country: "US", category: "sports", url: "https://stadium-stadium-1-us.plex.wurl.com/manifest/playlist.m3u8", isFallback: true },
  { id: "fb-fuel", name: "Fuel TV", country: "US", category: "sports", url: "https://amg00489-amg00489c20-amg-fast-2-rakuten.amagi.tv/playlist/amg00489-fueltv-fueltvxtreme-rakuten/playlist.m3u8", isFallback: true },
];

// Best-effort country names
const COUNTRY_NAMES: Record<string, string> = {
  BD: "Bangladesh", IN: "India", PK: "Pakistan", US: "United States", UK: "United Kingdom",
  GB: "United Kingdom", QA: "Qatar", AE: "UAE", SA: "Saudi Arabia", DE: "Germany", FR: "France",
  JP: "Japan", CN: "China", KR: "Korea", TR: "Turkey", BR: "Brazil", MX: "Mexico", ES: "Spain",
  IT: "Italy", RU: "Russia", AT: "Austria", AU: "Australia", CA: "Canada", NP: "Nepal", LK: "Sri Lanka",
  MY: "Malaysia", ID: "Indonesia", TH: "Thailand", PH: "Philippines", SG: "Singapore", EG: "Egypt",
};

const LiveTV = () => {
  const { language } = useLanguage();
  const t = (bn: string, en: string) => (language === "bn" ? bn : en);

  const [tab, setTab] = useState<Tab>("tv");
  const [search, setSearch] = useState("");
  const [countryFilter, setCountryFilter] = useState<string>("all");
  const [onlyFavs, setOnlyFavs] = useState(false);
  const [active, setActive] = useState<Channel | null>(null);

  const [tvChannels, setTvChannels] = useState<Channel[]>([]);
  const [sportsChannels, setSportsChannels] = useState<Channel[]>([]);
  const [radioChannels, setRadioChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);

  const [favs, setFavs] = useState<Set<string>>(() => {
    try { return new Set(JSON.parse(localStorage.getItem(FAV_KEY) || "[]")); } catch { return new Set(); }
  });
  const [health, setHealth] = useState<Record<string, Health>>({});

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);

  useEffect(() => {
    localStorage.setItem(FAV_KEY, JSON.stringify([...favs]));
  }, [favs]);

  const toggleFav = (id: string) => {
    setFavs(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  // ----- Fetch TV & Sports from iptv-org -----
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [streamsRes, channelsRes] = await Promise.all([
          fetch("https://iptv-org.github.io/api/streams.json"),
          fetch("https://iptv-org.github.io/api/channels.json"),
        ]);
        const streams = await streamsRes.json();
        const channels = await channelsRes.json();
        const chMap = new Map<string, any>(channels.map((c: any) => [c.id, c]));
        const tvList: Channel[] = [];
        const sportsList: Channel[] = [];
        const seenTv = new Set<string>();
        const seenSports = new Set<string>();
        for (const s of streams) {
          if (!s.channel || !s.url) continue;
          if (s.user_agent || s.referrer) continue;
          if (!s.url.startsWith("https://")) continue;
          const meta = chMap.get(s.channel);
          if (!meta || meta.is_nsfw) continue;
          const name = (s.title || meta.name || "").trim();
          if (!name) continue;
          const cats: string[] = meta.categories || [];
          const country = meta.country || "Other";
          const ch: Channel = {
            id: `${meta.id}-${s.url.length}`,
            name,
            country,
            countryName: COUNTRY_NAMES[country] || country,
            category: "tv",
            categories: cats,
            logo: meta.logo,
            url: s.url,
          };
          // Sports list: worldwide, sports category
          if (cats.includes("sports")) {
            const k = `${country}:${name.toLowerCase()}`;
            if (!seenSports.has(k)) {
              seenSports.add(k);
              sportsList.push({ ...ch, category: "sports" });
            }
          }
          // TV list: BD + IN only for the main TV tab
          if (country === "BD" || country === "IN") {
            const k = `${country}:${name.toLowerCase()}`;
            if (!seenTv.has(k)) {
              seenTv.add(k);
              tvList.push(ch);
            }
          }
        }
        if (!cancelled) {
          tvList.sort((a, b) => a.country.localeCompare(b.country) || a.name.localeCompare(b.name));
          sportsList.sort((a, b) => a.country.localeCompare(b.country) || a.name.localeCompare(b.name));
          setTvChannels([...tvList, ...FALLBACK_TV]);
          setSportsChannels([...sportsList, ...FALLBACK_SPORTS]);
        }
      } catch (e) {
        console.error("iptv-org fetch failed", e);
        if (!cancelled) {
          setTvChannels(FALLBACK_TV);
          setSportsChannels(FALLBACK_SPORTS);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // ----- Fetch radio from radio-browser.info -----
  useEffect(() => {
    let cancelled = false;
    const fetchCountry = async (cc: string) => {
      const mirrors = [
        "https://de1.api.radio-browser.info", "https://de2.api.radio-browser.info", "https://nl1.api.radio-browser.info",
      ];
      for (const base of mirrors) {
        try {
          const r = await fetch(`${base}/json/stations/bycountrycodeexact/${cc}?hidebroken=true&order=votes&reverse=true&limit=150`);
          if (!r.ok) continue;
          return (await r.json()) as any[];
        } catch {}
      }
      return [];
    };
    (async () => {
      const [bd, ind] = await Promise.all([fetchCountry("BD"), fetchCountry("IN")]);
      const map = (arr: any[], cc: string): Channel[] =>
        arr.filter((s) => s.url_resolved && s.lastcheckok === 1).map((s, i) => ({
          id: `r-${cc}-${s.stationuuid || i}`,
          name: s.name?.trim() || "Unknown",
          country: cc,
          countryName: COUNTRY_NAMES[cc] || cc,
          category: "radio" as const,
          logo: s.favicon || undefined,
          url: s.url_resolved,
        }));
      if (!cancelled) setRadioChannels([...map(bd, "BD"), ...map(ind, "IN")]);
    })();
    return () => { cancelled = true; };
  }, []);

  // ----- Health check (best-effort: fetch HLS manifest text) -----
  const checkHealth = useCallback(async (ch: Channel) => {
    setHealth(h => ({ ...h, [ch.id]: "checking" }));
    try {
      const ctrl = new AbortController();
      const tId = setTimeout(() => ctrl.abort(), 6000);
      const res = await fetch(ch.url, { method: "GET", signal: ctrl.signal });
      clearTimeout(tId);
      if (!res.ok) throw new Error("bad");
      const txt = (await res.text()).slice(0, 200);
      const ok = txt.includes("#EXTM3U") || ch.category === "radio";
      setHealth(h => ({ ...h, [ch.id]: ok ? "live" : "dead" }));
    } catch {
      // CORS blocked = inconclusive — mark unknown rather than dead
      setHealth(h => ({ ...h, [ch.id]: "unknown" }));
    }
  }, []);

  const allChannels = tab === "tv" ? tvChannels : tab === "sports" ? sportsChannels : radioChannels;

  const availableCountries = useMemo(() => {
    const set = new Set<string>();
    allChannels.forEach(c => set.add(c.country));
    return [...set].sort();
  }, [allChannels]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return allChannels.filter((c) =>
      (!q || c.name.toLowerCase().includes(q)) &&
      (countryFilter === "all" || c.country === countryFilter) &&
      (!onlyFavs || favs.has(c.id))
    );
  }, [allChannels, search, countryFilter, onlyFavs, favs]);

  // Auto health-check first 12 visible items
  useEffect(() => {
    const targets = filtered.slice(0, 12).filter(c => !(c.id in health));
    targets.forEach(c => checkHealth(c));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtered]);

  useEffect(() => {
    if (!active) return;
    hlsRef.current?.destroy();
    hlsRef.current = null;
    const isHls = active.url.includes(".m3u8");
    const mediaEl = active.category === "radio" ? audioRef.current : videoRef.current;
    if (!mediaEl) return;
    if (isHls && Hls.isSupported() && active.category !== "radio") {
      const hls = new Hls({ enableWorker: true });
      hls.loadSource(active.url);
      hls.attachMedia(mediaEl as HTMLMediaElement);
      hls.on(Hls.Events.ERROR, (_e, data) => {
        if (data.fatal) {
          toast.error(t("স্ট্রিম চালু করা যাচ্ছে না — অন্যটি চেষ্টা করুন", "Stream failed — try another"));
        }
      });
      hlsRef.current = hls;
    } else {
      (mediaEl as HTMLMediaElement).src = active.url;
    }
    (mediaEl as HTMLMediaElement).play().catch(() => {});
    return () => { hlsRef.current?.destroy(); hlsRef.current = null; };
  }, [active]); // eslint-disable-line

  const healthBadge = (id: string) => {
    const h = health[id] || "unknown";
    if (h === "live") return <span title="Live" className="inline-flex items-center gap-0.5 text-emerald-600 text-[10px] font-semibold"><CheckCircle2 className="w-3 h-3" />LIVE</span>;
    if (h === "dead") return <span title="Offline" className="inline-flex items-center gap-0.5 text-rose-600 text-[10px] font-semibold"><XCircle className="w-3 h-3" />OFF</span>;
    if (h === "checking") return <Activity className="w-3 h-3 text-muted-foreground animate-pulse" />;
    return null;
  };

  return (
    <div className="container py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-3">
            {tab === "sports" ? <Trophy className="w-3.5 h-3.5" /> : tab === "radio" ? <Radio className="w-3.5 h-3.5" /> : <Tv className="w-3.5 h-3.5" />}
            {t("লাইভ স্ট্রিমিং", "Live Streaming")}
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold mb-2">
            {t("লাইভ টিভি • স্পোর্টস • রেডিও", "Live TV • Sports • Radio")}
          </h1>
          <p className="text-muted-foreground text-sm">
            {t("ফ্রি ও কমিউনিটি সোর্স — সার্চ, ফেভারিট, স্বাস্থ্য যাচাই, ফলব্যাক স্ট্রিম সহ",
               "Free community sources — search, favorites, health check, fallback streams")}
          </p>
        </div>

        <div className="flex justify-center mb-5">
          <div className="inline-flex rounded-full bg-muted p-1">
            {([
              { k: "tv", label: t("টিভি","TV"), icon: Tv },
              { k: "sports", label: t("স্পোর্টস","Sports"), icon: Trophy },
              { k: "radio", label: t("রেডিও","Radio"), icon: Radio },
            ] as { k: Tab; label: string; icon: any }[]).map(({ k, label, icon: Icon }) => (
              <button
                key={k}
                onClick={() => { setTab(k); setActive(null); setCountryFilter("all"); }}
                className={`px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 transition-smooth ${tab === k ? "gradient-bg-primary text-white shadow-glow" : ""}`}
              >
                <Icon className="w-4 h-4" /> {label}
              </button>
            ))}
          </div>
        </div>

        {active && (
          <Card className="p-4 mb-6 overflow-hidden">
            <div className="flex items-center justify-between mb-3 gap-2">
              <div className="flex items-center gap-3 min-w-0">
                {active.logo && (
                  <img src={active.logo} alt="" className="w-10 h-10 rounded object-contain bg-muted shrink-0" onError={(e) => ((e.target as HTMLImageElement).style.display = "none")} />
                )}
                <div className="min-w-0">
                  <p className="font-display font-bold text-lg truncate">{active.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{active.countryName || active.country}{active.isFallback ? " • Fallback" : ""}</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setActive(null)}>×</Button>
            </div>
            {active.category === "radio" ? (
              <div className="bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl p-8 flex flex-col items-center gap-4">
                <Radio className="w-16 h-16 text-primary animate-pulse" />
                <audio ref={audioRef} controls autoPlay className="w-full max-w-md" />
              </div>
            ) : (
              <video ref={videoRef} controls autoPlay playsInline className="w-full aspect-video bg-black rounded-xl" />
            )}
            <p className="text-[11px] text-muted-foreground mt-2">
              {t("না চললে অন্য চ্যানেল ট্রাই করুন — কিছু সোর্স জিও-ব্লকড বা সাময়িক ডাউন।",
                 "If a stream doesn't play, try another — some sources are geo-blocked or temporarily down.")}
            </p>
          </Card>
        )}

        <div className="grid sm:grid-cols-[1fr_auto_auto] gap-2 mb-5 max-w-3xl mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t("চ্যানেল খুঁজুন...", "Search channels...")} className="pl-9 rounded-full" />
          </div>
          <Select value={countryFilter} onValueChange={setCountryFilter}>
            <SelectTrigger className="rounded-full min-w-[140px]"><Globe2 className="w-4 h-4 mr-1" /><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("সব দেশ", "All countries")}</SelectItem>
              {availableCountries.map(c => (
                <SelectItem key={c} value={c}>{COUNTRY_NAMES[c] || c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant={onlyFavs ? "default" : "outline"} className="rounded-full" onClick={() => setOnlyFavs(v => !v)}>
            <Star className={`w-4 h-4 ${onlyFavs ? "fill-current" : ""}`} />
            <span className="ml-1">{favs.size}</span>
          </Button>
        </div>

        {loading && tab !== "radio" && (
          <div className="flex flex-col items-center py-12 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin mb-2" />
            <p className="text-sm">{t("সর্বশেষ চ্যানেল লোড হচ্ছে...", "Loading latest channels...")}</p>
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <p className="text-center text-muted-foreground py-8">{t("কোনো চ্যানেল পাওয়া যায়নি।", "No channels found.")}</p>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {filtered.map((c) => {
            const isFav = favs.has(c.id);
            const h = health[c.id];
            return (
              <div
                key={c.id}
                className={`group relative p-4 rounded-2xl border bg-card hover:border-primary hover:shadow-elegant transition-smooth ${active?.id === c.id ? "border-primary shadow-glow" : "border-border"}`}
              >
                <button
                  onClick={(e) => { e.stopPropagation(); toggleFav(c.id); }}
                  className="absolute top-2 right-2 p-1 rounded-full hover:bg-muted z-10"
                  aria-label="Favorite"
                >
                  <Star className={`w-4 h-4 ${isFav ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`} />
                </button>
                <button onClick={() => setActive(c)} className="w-full text-left">
                  <div className="flex items-center gap-2 mb-2">
                    {c.logo ? (
                      <img src={c.logo} alt="" className="w-8 h-8 rounded object-contain bg-muted" onError={(e) => ((e.target as HTMLImageElement).style.visibility = "hidden")} />
                    ) : (
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white ${c.category === "radio" ? "gradient-bg-warm" : c.category === "sports" ? "bg-gradient-to-br from-amber-500 to-orange-600" : "gradient-bg-primary"}`}>
                        {c.category === "sports" ? <Trophy className="w-4 h-4" /> : c.category === "radio" ? <Radio className="w-4 h-4" /> : <Tv className="w-4 h-4" />}
                      </div>
                    )}
                    <Play className="w-4 h-4 text-muted-foreground group-hover:text-primary ml-auto" />
                  </div>
                  <p className="font-semibold text-sm leading-tight line-clamp-2 pr-4">{c.name}</p>
                  <div className="flex items-center justify-between mt-1.5">
                    <span className="text-[10px] text-muted-foreground">{COUNTRY_NAMES[c.country] || c.country}</span>
                    {h ? healthBadge(c.id) : (
                      <button
                        onClick={(e) => { e.stopPropagation(); checkHealth(c); }}
                        className="text-[10px] text-primary hover:underline"
                      >
                        {t("চেক", "Check")}
                      </button>
                    )}
                  </div>
                </button>
              </div>
            );
          })}
        </div>

        <p className="text-xs text-center text-muted-foreground mt-8">
          {t("সোর্স: iptv-org + radio-browser.info — কমিউনিটি দ্বারা ক্রমাগত আপডেট। স্পোর্টস: বিশ্বব্যাপী ফ্রি চ্যানেল।",
             "Sources: iptv-org + radio-browser.info — continuously community-updated. Sports: worldwide free channels.")}
        </p>
      </motion.div>
    </div>
  );
};

export default LiveTV;
