import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { Tv, Radio, Search, Play, Loader2, Trophy, Star, CheckCircle2, XCircle, Activity, Globe2, Flag, Wifi, Layers, ChevronDown, Zap } from "lucide-react";
import Hls from "hls.js";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";
import SportsSchedule from "@/components/SportsSchedule";
import WorldCupChannels from "@/components/WorldCupChannels";
import LiveScoreBoard from "@/components/LiveScoreBoard";
import { BDIX_CHANNELS, IMPORTANT_BD_CHANNELS, IMPORTANT_IN_CHANNELS } from "@/data/bdixChannels";

const DEAD_KEY = "livetv:dead:v2";
const FAV_KEY = "livetv:favorites:v2";
const RECENT_KEY = "livetv:recent:v1";

type Tab = "tv" | "bdix" | "world" | "sports" | "radio" | "scores";
type Health = "unknown" | "checking" | "live" | "dead";

type Channel = {
  id: string;
  name: string;
  country: string;
  countryName?: string;
  category: Exclude<Tab, "scores">;
  categories?: string[];
  logo?: string;
  url: string;          // current/primary
  urls?: string[];      // all alternate URLs
  provider?: string;
  isFallback?: boolean;
};

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

const COUNTRY_NAMES: Record<string, string> = {
  BD: "Bangladesh", IN: "India", PK: "Pakistan", US: "United States", UK: "United Kingdom",
  GB: "United Kingdom", QA: "Qatar", AE: "UAE", SA: "Saudi Arabia", DE: "Germany", FR: "France",
  JP: "Japan", CN: "China", KR: "Korea", TR: "Turkey", BR: "Brazil", MX: "Mexico", ES: "Spain",
  IT: "Italy", RU: "Russia", AT: "Austria", AU: "Australia", CA: "Canada", NP: "Nepal", LK: "Sri Lanka",
  MY: "Malaysia", ID: "Indonesia", TH: "Thailand", PH: "Philippines", SG: "Singapore", EG: "Egypt",
};

// Priority: BD = 0, IN = 1, all others = 2
const countryPriority = (c: string) => (c === "BD" ? 0 : c === "IN" ? 1 : 2);

// Important-channel boost based on name
const importanceScore = (ch: Channel) => {
  const n = ch.name.toLowerCase();
  if (ch.country === "BD" && IMPORTANT_BD_CHANNELS.some(k => n.includes(k))) return 0;
  if (ch.country === "IN" && IMPORTANT_IN_CHANNELS.some(k => n.includes(k))) return 0;
  return 1;
};

const LiveTV = () => {
  const { language } = useLanguage();
  const t = (bn: string, en: string) => (language === "bn" ? bn : en);

  const [tab, setTab] = useState<Tab>("tv");
  const [search, setSearch] = useState("");
  const [countryFilter, setCountryFilter] = useState<string>("all");
  const [onlyFavs, setOnlyFavs] = useState(false);
  const [active, setActive] = useState<Channel | null>(null);
  const [expandedWorld, setExpandedWorld] = useState<string | null>(null);

  const [tvChannels, setTvChannels] = useState<Channel[]>([]);
  const [worldChannels, setWorldChannels] = useState<Channel[]>([]);
  const [sportsChannels, setSportsChannels] = useState<Channel[]>([]);
  const [radioChannels, setRadioChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);

  const [favs, setFavs] = useState<Set<string>>(() => {
    try { return new Set(JSON.parse(localStorage.getItem(FAV_KEY) || "[]")); } catch { return new Set(); }
  });
  const [dead, setDead] = useState<Set<string>>(() => {
    try { return new Set(JSON.parse(localStorage.getItem(DEAD_KEY) || "[]")); } catch { return new Set(); }
  });
  const [recent, setRecent] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]"); } catch { return []; }
  });
  const [health, setHealth] = useState<Record<string, Health>>({});

  useEffect(() => { localStorage.setItem(DEAD_KEY, JSON.stringify([...dead])); }, [dead]);
  useEffect(() => { localStorage.setItem(FAV_KEY, JSON.stringify([...favs])); }, [favs]);
  useEffect(() => { localStorage.setItem(RECENT_KEY, JSON.stringify(recent.slice(0, 20))); }, [recent]);

  const reportDead = (id: string, name: string) => {
    setDead(prev => new Set(prev).add(id));
    setHealth(h => ({ ...h, [id]: "dead" }));
    toast.success(t(`${name} ডেড হিসেবে চিহ্নিত — নিচে চলে গেছে`, `${name} marked offline — moved to bottom`));
  };
  const restoreDead = () => {
    setDead(new Set());
    toast.success(t("ডেড লিস্ট রিকভার হয়েছে", "Recovered all dead streams"));
  };

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const playerRef = useRef<HTMLDivElement | null>(null);
  const fallbackIdxRef = useRef(0);

  const toggleFav = (id: string) => {
    setFavs(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  // ----- Fetch TV (BD/IN) + World grouped + Sports from iptv-org -----
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

        // Group streams by channel id (for World multi-link)
        const grouped = new Map<string, { meta: any; urls: string[] }>();
        const sportsList: Channel[] = [];
        const seenSports = new Set<string>();

        for (const s of streams) {
          if (!s.channel || !s.url) continue;
          if (s.user_agent || s.referrer) continue;
          if (!s.url.startsWith("https://")) continue;
          const meta = chMap.get(s.channel);
          if (!meta || meta.is_nsfw) continue;

          if (!grouped.has(meta.id)) grouped.set(meta.id, { meta, urls: [] });
          grouped.get(meta.id)!.urls.push(s.url);

          const cats: string[] = meta.categories || [];
          if (cats.includes("sports")) {
            const k = `${meta.country}:${meta.name.toLowerCase()}`;
            if (!seenSports.has(k)) {
              seenSports.add(k);
              sportsList.push({
                id: `s-${meta.id}`,
                name: meta.name,
                country: meta.country || "Other",
                countryName: COUNTRY_NAMES[meta.country] || meta.country,
                category: "sports",
                logo: meta.logo,
                url: s.url,
                urls: [s.url],
              });
            }
          }
        }

        // Attach all URLs to sports
        sportsList.forEach(sp => {
          const id = sp.id.replace(/^s-/, "");
          const g = grouped.get(id);
          if (g) sp.urls = g.urls;
        });

        const tvList: Channel[] = [];
        const worldList: Channel[] = [];
        for (const { meta, urls } of grouped.values()) {
          const ch: Channel = {
            id: meta.id,
            name: meta.name,
            country: meta.country || "Other",
            countryName: COUNTRY_NAMES[meta.country] || meta.country,
            category: "tv",
            categories: meta.categories,
            logo: meta.logo,
            url: urls[0],
            urls,
          };
          if (meta.country === "BD" || meta.country === "IN") tvList.push(ch);
          worldList.push({ ...ch, category: "world" as any });
        }

        if (!cancelled) {
          setTvChannels([...tvList, ...FALLBACK_TV]);
          setWorldChannels(worldList);
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

  // Radio
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
          urls: [s.url_resolved],
        }));
      if (!cancelled) setRadioChannels([...map(bd, "BD"), ...map(ind, "IN")]);
    })();
    return () => { cancelled = true; };
  }, []);

  // BDIX list as Channels
  const bdixChannels: Channel[] = useMemo(() =>
    BDIX_CHANNELS.map(b => ({
      id: b.id,
      name: b.name,
      country: "BD",
      countryName: "Bangladesh",
      category: "bdix" as any,
      provider: b.provider,
      url: b.url,
      urls: [b.url],
    })), []);

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
      setHealth(h => ({ ...h, [ch.id]: "unknown" }));
    }
  }, []);

  const allChannels =
    tab === "tv" ? tvChannels :
    tab === "world" ? worldChannels :
    tab === "bdix" ? bdixChannels :
    tab === "sports" ? sportsChannels :
    tab === "radio" ? radioChannels : [];

  const availableCountries = useMemo(() => {
    const set = new Set<string>();
    allChannels.forEach(c => set.add(c.country));
    return [...set].sort((a, b) => countryPriority(a) - countryPriority(b) || a.localeCompare(b));
  }, [allChannels]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    const base = allChannels.filter((c) =>
      (!q || c.name.toLowerCase().includes(q)) &&
      (countryFilter === "all" || c.country === countryFilter) &&
      (!onlyFavs || favs.has(c.id))
    );
    const recentRank = (id: string) => {
      const i = recent.indexOf(id);
      return i === -1 ? 999 : i; // lower = more recent
    };
    return base.sort((a, b) => {
      // Dead always at bottom
      const da = dead.has(a.id) ? 1 : 0;
      const db = dead.has(b.id) ? 1 : 0;
      if (da !== db) return da - db;
      // Recently-played first
      const ra = recentRank(a.id);
      const rb = recentRank(b.id);
      if (ra !== rb) return ra - rb;
      // Favourites next
      const fa = favs.has(a.id) ? 0 : 1;
      const fb = favs.has(b.id) ? 0 : 1;
      if (fa !== fb) return fa - fb;
      // Country priority (BD > IN > others)
      const pa = countryPriority(a.country);
      const pb = countryPriority(b.country);
      if (pa !== pb) return pa - pb;
      // Important channels boost
      const ia = importanceScore(a);
      const ib = importanceScore(b);
      if (ia !== ib) return ia - ib;
      return a.name.localeCompare(b.name);
    });
  }, [allChannels, search, countryFilter, onlyFavs, favs, dead, recent]);

  useEffect(() => {
    const targets = filtered.slice(0, 12).filter(c => !(c.id in health));
    targets.forEach(c => checkHealth(c));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtered]);

  // Try a given URL index, auto-fallback on error
  const playUrl = useCallback((ch: Channel, urlIdx: number) => {
    const urls = ch.urls && ch.urls.length ? ch.urls : [ch.url];
    if (urlIdx >= urls.length) {
      toast.error(t(`${ch.name} এর সব লিংক ডেড — নিচে সরিয়ে দিচ্ছি`, `All links for ${ch.name} are dead — moving down`));
      setDead(prev => new Set(prev).add(ch.id));
      setHealth(h => ({ ...h, [ch.id]: "dead" }));
      return;
    }
    const url = urls[urlIdx];
    fallbackIdxRef.current = urlIdx;
    hlsRef.current?.destroy();
    hlsRef.current = null;
    const isHls = url.includes(".m3u8");
    const mediaEl = ch.category === "radio" ? audioRef.current : videoRef.current;
    if (!mediaEl) return;
    if (isHls && Hls.isSupported() && ch.category !== "radio") {
      const hls = new Hls({ enableWorker: true });
      hls.loadSource(url);
      hls.attachMedia(mediaEl as HTMLMediaElement);
      hls.on(Hls.Events.ERROR, (_e, data) => {
        if (data.fatal) {
          if (urlIdx + 1 < urls.length) {
            toast.message(t(`লিংক ${urlIdx + 1} ফেল — অটো ব্যাকআপ চালু হচ্ছে...`, `Link ${urlIdx + 1} failed — trying backup...`));
            playUrl(ch, urlIdx + 1);
          } else {
            toast.error(t("সব ব্যাকআপ ফেল — অন্য চ্যানেল চেষ্টা করুন", "All backups failed — try another channel"));
            setDead(prev => new Set(prev).add(ch.id));
            setHealth(h => ({ ...h, [ch.id]: "dead" }));
          }
        }
      });
      hlsRef.current = hls;
    } else {
      (mediaEl as HTMLMediaElement).src = url;
      (mediaEl as HTMLMediaElement).onerror = () => {
        if (urlIdx + 1 < urls.length) playUrl(ch, urlIdx + 1);
        else setDead(prev => new Set(prev).add(ch.id));
      };
    }
    (mediaEl as HTMLMediaElement).play().catch(() => {});
  }, [t]);

  const openChannel = (ch: Channel) => {
    setActive(ch);
    setRecent(prev => [ch.id, ...prev.filter(x => x !== ch.id)].slice(0, 20));
    // Scroll player into view
    requestAnimationFrame(() => {
      playerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  useEffect(() => {
    if (!active) return;
    playUrl(active, 0);
    return () => { hlsRef.current?.destroy(); hlsRef.current = null; };
  }, [active, playUrl]);

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
            <Tv className="w-3.5 h-3.5" />
            {t("লাইভ স্ট্রিমিং", "Live Streaming")}
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold mb-2">
            {t("লাইভ টিভি • BDIX • ওয়ার্ল্ড • স্পোর্টস • রেডিও", "Live TV • BDIX • World • Sports • Radio")}
          </h1>
          <p className="text-muted-foreground text-sm">
            {t("অটো ব্যাকআপ লিংক • ডেড স্ট্রিম রিকভারি • BD/IN প্রাধান্য",
               "Auto-backup links • dead stream recovery • BD/IN priority")}
          </p>
        </div>

        <div className="flex justify-center mb-5 overflow-x-auto">
          <div className="inline-flex rounded-full bg-muted p-1">
            {([
              { k: "tv", label: t("টিভি","TV"), icon: Tv },
              { k: "bdix", label: "BDIX", icon: Wifi },
              { k: "world", label: t("ওয়ার্ল্ড","World"), icon: Globe2 },
              { k: "sports", label: t("স্পোর্টস","Sports"), icon: Trophy },
              { k: "scores", label: t("স্কোর","Scores"), icon: Activity },
              { k: "radio", label: t("রেডিও","Radio"), icon: Radio },
            ] as { k: Tab; label: string; icon: any }[]).map(({ k, label, icon: Icon }) => (
              <button
                key={k}
                onClick={() => { setTab(k); setActive(null); setCountryFilter("all"); setExpandedWorld(null); }}
                className={`px-3 py-2 rounded-full text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-smooth whitespace-nowrap ${tab === k ? "gradient-bg-primary text-white shadow-glow" : ""}`}
              >
                <Icon className="w-4 h-4" /> {label}
              </button>
            ))}
          </div>
        </div>

        {tab === "scores" ? (
          <LiveScoreBoard />
        ) : (
          <>
            <div ref={playerRef}>
              {active && (
                <Card className="p-4 mb-6 overflow-hidden">
                  <div className="flex items-center justify-between mb-3 gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                      {active.logo && (
                        <img src={active.logo} alt="" className="w-10 h-10 rounded object-contain bg-muted shrink-0" onError={(e) => ((e.target as HTMLImageElement).style.display = "none")} />
                      )}
                      <div className="min-w-0">
                        <p className="font-display font-bold text-lg truncate">{active.name}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {active.countryName || active.country}
                          {active.provider ? ` • ${active.provider}` : ""}
                          {active.urls && active.urls.length > 1 ? ` • ${active.urls.length} ${t("লিংক", "links")}` : ""}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {active.urls && active.urls.length > 1 && (
                        <Button variant="outline" size="sm" onClick={() => playUrl(active, (fallbackIdxRef.current + 1) % active.urls!.length)}>
                          {t("পরের লিংক", "Next link")}
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" onClick={() => setActive(null)}>×</Button>
                    </div>
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
                    {t("না চললে অটো ব্যাকআপ লিংক চেষ্টা করা হবে। BDIX চ্যানেল শুধু অংশগ্রহণকারী ISP-তে কাজ করে।",
                       "If a stream fails, backup links auto-try. BDIX channels only work on participating ISPs.")}
                  </p>
                </Card>
              )}
            </div>

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

            {tab === "sports" && <WorldCupChannels />}
            {tab === "sports" && <SportsSchedule />}

            {tab === "bdix" && (
              <Card className="p-3 mb-4 bg-amber-500/5 border-amber-500/30">
                <p className="text-xs text-muted-foreground">
                  <Wifi className="inline w-3.5 h-3.5 mr-1 text-amber-600" />
                  {t("BDIX চ্যানেল শুধু বাংলাদেশী ISP (Link3, Amber IT, Carnival ইত্যাদি) এর গ্রাহকদের জন্য কাজ করে। মোবাইল ডেটায় কাজ নাও করতে পারে।",
                     "BDIX channels work only on Bangladesh ISP networks (Link3, Amber IT, Carnival etc.). May not work on mobile data.")}
                </p>
              </Card>
            )}

            {dead.size > 0 && (
              <div className="flex justify-center mb-4 gap-2">
                <Button variant="ghost" size="sm" className="text-xs" onClick={restoreDead}>
                  <RefreshIcon /> {t(`${dead.size}টি ডেড স্ট্রিম রিকভার করো`, `Recover ${dead.size} dead stream${dead.size>1?"s":""}`)}
                </Button>
              </div>
            )}

            {loading && tab !== "radio" && tab !== "bdix" && (
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
                const isDead = dead.has(c.id);
                const isExpanded = expandedWorld === c.id;
                const linkCount = c.urls?.length || 1;
                return (
                  <div key={c.id} className={`group relative p-4 rounded-2xl border bg-card hover:border-primary hover:shadow-elegant transition-smooth ${active?.id === c.id ? "border-primary shadow-glow" : "border-border"} ${isDead ? "opacity-50" : ""}`}>
                    <button onClick={(e) => { e.stopPropagation(); toggleFav(c.id); }} className="absolute top-2 right-2 p-1 rounded-full hover:bg-muted z-10" aria-label="Favorite">
                      <Star className={`w-4 h-4 ${isFav ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`} />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); reportDead(c.id, c.name); }} className="absolute top-2 right-9 p-1 rounded-full hover:bg-rose-500/10 z-10 opacity-0 group-hover:opacity-100 transition-opacity" aria-label="Report dead" title={t("ডেড রিপোর্ট", "Report dead")}>
                      <Flag className="w-3.5 h-3.5 text-rose-500" />
                    </button>
                    <button onClick={() => openChannel(c)} className="w-full text-left">
                      <div className="flex items-center gap-2 mb-2">
                        {c.logo ? (
                          <img src={c.logo} alt="" className="w-8 h-8 rounded object-contain bg-muted" onError={(e) => ((e.target as HTMLImageElement).style.visibility = "hidden")} />
                        ) : (
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white ${c.category === "radio" ? "gradient-bg-warm" : c.category === "sports" ? "bg-gradient-to-br from-amber-500 to-orange-600" : (c.category as string) === "bdix" ? "bg-gradient-to-br from-emerald-500 to-teal-600" : "gradient-bg-primary"}`}>
                            {c.category === "sports" ? <Trophy className="w-4 h-4" /> : c.category === "radio" ? <Radio className="w-4 h-4" /> : (c.category as string) === "bdix" ? <Wifi className="w-4 h-4" /> : <Tv className="w-4 h-4" />}
                          </div>
                        )}
                        <Play className="w-4 h-4 text-muted-foreground group-hover:text-primary ml-auto" />
                      </div>
                      <p className="font-semibold text-sm leading-tight line-clamp-2 pr-4">{c.name}</p>
                      <div className="flex items-center justify-between mt-1.5">
                        <span className="text-[10px] text-muted-foreground">
                          {COUNTRY_NAMES[c.country] || c.country}
                          {linkCount > 1 && <span className="ml-1 text-primary">• {linkCount} {t("লিংক", "links")}</span>}
                        </span>
                        {healthBadge(c.id)}
                      </div>
                    </button>

                    {tab === "world" && linkCount > 1 && (
                      <button
                        onClick={(e) => { e.stopPropagation(); setExpandedWorld(isExpanded ? null : c.id); }}
                        className="mt-2 w-full text-[10px] text-primary flex items-center justify-center gap-1 hover:underline"
                      >
                        <Layers className="w-3 h-3" />
                        {isExpanded ? t("লিংক লুকাও", "Hide links") : t(`সব ${linkCount}টি লিংক`, `All ${linkCount} links`)}
                        <ChevronDown className={`w-3 h-3 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                      </button>
                    )}

                    {tab === "world" && isExpanded && c.urls && (
                      <div className="mt-2 space-y-1 max-h-40 overflow-y-auto border-t pt-2">
                        {c.urls.map((u, i) => (
                          <button
                            key={i}
                            onClick={(e) => { e.stopPropagation(); openChannel({ ...c, url: u, urls: [u, ...c.urls!.filter(x => x !== u)] }); }}
                            className="w-full text-left text-[10px] px-2 py-1 rounded hover:bg-muted flex items-center gap-1"
                          >
                            <Play className="w-2.5 h-2.5 shrink-0" />
                            <span className="truncate">{t(`লিংক ${i + 1}`, `Link ${i + 1}`)}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <p className="text-xs text-center text-muted-foreground mt-8">
              {t("সোর্স: iptv-org + radio-browser.info + BDIX কমিউনিটি — অটো ব্যাকআপ ও ডেড রিকভারি সহ।",
                 "Sources: iptv-org + radio-browser.info + BDIX community — auto-backup & dead recovery.")}
            </p>
          </>
        )}
      </motion.div>
    </div>
  );
};

const RefreshIcon = () => (
  <svg className="w-3.5 h-3.5 mr-1 inline" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5" /></svg>
);

export default LiveTV;
