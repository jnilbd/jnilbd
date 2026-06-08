import { useEffect, useRef, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Tv, Radio, Search, Play, Loader2 } from "lucide-react";
import Hls from "hls.js";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

type Channel = {
  id: string;
  name: string;
  country: "BD" | "IN" | "Other";
  category: "tv" | "radio";
  logo?: string;
  url: string;
  referrer?: string;
  userAgent?: string;
};

const COUNTRY_ORDER: Channel["country"][] = ["BD", "IN", "Other"];

// Curated reliable fallbacks that always render even if remote sources are temporarily down
const FALLBACK_TV: Channel[] = [
  { id: "aljazeera-en", name: "Al Jazeera English", country: "Other", category: "tv", url: "https://live-hls-web-aje.getaj.net/AJE/index.m3u8" },
  { id: "dw-en", name: "DW English", country: "Other", category: "tv", url: "https://dwamdstream102.akamaized.net/hls/live/2015525/dwstream102/index.m3u8" },
  { id: "france24-en", name: "France 24 English", country: "Other", category: "tv", url: "https://static.france24.com/live/F24_EN_LO_HLS/live_web.m3u8" },
  { id: "nhk-world", name: "NHK World Japan", country: "Other", category: "tv", url: "https://nhkwlive-ojp.akamaized.net/hls/live/2003459/nhkwlive-ojp-en/index.m3u8" },
];

const LiveTV = () => {
  const { language } = useLanguage();
  const t = (bn: string, en: string) => (language === "bn" ? bn : en);
  const [tab, setTab] = useState<"tv" | "radio">("tv");
  const [search, setSearch] = useState("");
  const [active, setActive] = useState<Channel | null>(null);
  const [tvChannels, setTvChannels] = useState<Channel[]>([]);
  const [radioChannels, setRadioChannels] = useState<Channel[]>([]);
  const [loadingTv, setLoadingTv] = useState(true);
  const [loadingRadio, setLoadingRadio] = useState(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);

  // ----- Fetch live TV from iptv-org (free, community-maintained, working M3U8 streams) -----
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
        const list: Channel[] = [];
        const seenName = new Set<string>();
        for (const s of streams) {
          if (!s.channel || !s.url) continue;
          const meta = chMap.get(s.channel);
          if (!meta) continue;
          if (meta.is_nsfw) continue;
          if (meta.country !== "BD" && meta.country !== "IN") continue;
          // Skip streams that require special headers (won't play in browser)
          if (s.user_agent || s.referrer) continue;
          // Prefer https
          if (!s.url.startsWith("https://")) continue;
          const name = (s.title || meta.name || "").trim();
          if (!name) continue;
          const key = `${meta.country}:${name.toLowerCase()}`;
          if (seenName.has(key)) continue;
          seenName.add(key);
          list.push({
            id: `${meta.id}-${list.length}`,
            name,
            country: meta.country as "BD" | "IN",
            category: "tv",
            logo: meta.logo,
            url: s.url,
          });
        }
        if (!cancelled) {
          // Sort: BD first, then IN, alphabetical
          list.sort((a, b) =>
            COUNTRY_ORDER.indexOf(a.country) - COUNTRY_ORDER.indexOf(b.country) ||
            a.name.localeCompare(b.name)
          );
          setTvChannels([...list, ...FALLBACK_TV]);
        }
      } catch (e) {
        console.error("iptv-org fetch failed", e);
        if (!cancelled) setTvChannels(FALLBACK_TV);
      } finally {
        if (!cancelled) setLoadingTv(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // ----- Fetch radio from radio-browser.info (free, open API, only working stations) -----
  useEffect(() => {
    let cancelled = false;
    const fetchCountry = async (cc: "BD" | "IN") => {
      // Try multiple mirrors for resilience
      const mirrors = [
        "https://de1.api.radio-browser.info",
        "https://de2.api.radio-browser.info",
        "https://nl1.api.radio-browser.info",
      ];
      for (const base of mirrors) {
        try {
          const r = await fetch(
            `${base}/json/stations/bycountrycodeexact/${cc}?hidebroken=true&order=votes&reverse=true&limit=120`
          );
          if (!r.ok) continue;
          return (await r.json()) as any[];
        } catch {}
      }
      return [];
    };
    (async () => {
      const [bd, ind] = await Promise.all([fetchCountry("BD"), fetchCountry("IN")]);
      const map = (arr: any[], cc: "BD" | "IN"): Channel[] =>
        arr
          .filter((s) => s.url_resolved && s.lastcheckok === 1)
          .map((s, i) => ({
            id: `${cc}-${s.stationuuid || i}`,
            name: s.name?.trim() || "Unknown",
            country: cc,
            category: "radio" as const,
            logo: s.favicon || undefined,
            url: s.url_resolved,
          }));
      if (!cancelled) {
        setRadioChannels([...map(bd, "BD"), ...map(ind, "IN")]);
        setLoadingRadio(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const allChannels = tab === "tv" ? tvChannels : radioChannels;

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return allChannels.filter((c) => !q || c.name.toLowerCase().includes(q));
  }, [allChannels, search]);

  useEffect(() => {
    if (!active) return;
    hlsRef.current?.destroy();
    hlsRef.current = null;
    const isHls = active.url.includes(".m3u8");
    const mediaEl = active.category === "tv" ? videoRef.current : audioRef.current;
    if (!mediaEl) return;
    if (isHls && Hls.isSupported() && active.category === "tv") {
      const hls = new Hls({ enableWorker: true });
      hls.loadSource(active.url);
      hls.attachMedia(mediaEl as HTMLMediaElement);
      hls.on(Hls.Events.ERROR, (_e, data) => {
        if (data.fatal) console.warn("HLS fatal", data);
      });
      hlsRef.current = hls;
    } else {
      (mediaEl as HTMLMediaElement).src = active.url;
    }
    (mediaEl as HTMLMediaElement).play().catch(() => {});
    return () => {
      hlsRef.current?.destroy();
      hlsRef.current = null;
    };
  }, [active]);

  const countryLabel: Record<Channel["country"], string> = {
    BD: t("বাংলাদেশ", "Bangladesh"),
    IN: t("ভারত", "India"),
    Other: t("অন্যান্য", "Other"),
  };

  const groups = COUNTRY_ORDER.map((c) => ({
    country: c,
    items: filtered.filter((ch) => ch.country === c),
  })).filter((g) => g.items.length > 0);

  const loading = tab === "tv" ? loadingTv : loadingRadio;

  return (
    <div className="container py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-3">
            {tab === "tv" ? <Tv className="w-3.5 h-3.5" /> : <Radio className="w-3.5 h-3.5" />}
            {t("লাইভ স্ট্রিমিং", "Live Streaming")}
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold mb-2">
            {t("লাইভ টিভি ও রেডিও", "Live TV & Radio")}
          </h1>
          <p className="text-muted-foreground">
            {t(
              "বাংলাদেশী ও ইন্ডিয়ান চ্যানেল — অটো-আপডেট হওয়া ফ্রি সোর্স",
              "Bangladeshi & Indian channels — auto-updated free sources"
            )}
          </p>
        </div>

        <div className="flex justify-center mb-5">
          <div className="inline-flex rounded-full bg-muted p-1">
            <button
              onClick={() => { setTab("tv"); setActive(null); }}
              className={`px-5 py-2 rounded-full text-sm font-semibold flex items-center gap-2 transition-smooth ${tab === "tv" ? "gradient-bg-primary text-white shadow-glow" : ""}`}
            >
              <Tv className="w-4 h-4" /> {t("টিভি", "TV")}
            </button>
            <button
              onClick={() => { setTab("radio"); setActive(null); }}
              className={`px-5 py-2 rounded-full text-sm font-semibold flex items-center gap-2 transition-smooth ${tab === "radio" ? "gradient-bg-warm text-white shadow-pink" : ""}`}
            >
              <Radio className="w-4 h-4" /> {t("রেডিও", "Radio")}
            </button>
          </div>
        </div>

        {active && (
          <Card className="p-4 mb-6 overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                {active.logo && (
                  <img src={active.logo} alt="" className="w-10 h-10 rounded object-contain bg-muted" onError={(e) => ((e.target as HTMLImageElement).style.display = "none")} />
                )}
                <div>
                  <p className="font-display font-bold text-lg">{active.name}</p>
                  <p className="text-xs text-muted-foreground">{countryLabel[active.country]}</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setActive(null)}>×</Button>
            </div>
            {active.category === "tv" ? (
              <video
                ref={videoRef}
                controls
                autoPlay
                playsInline
                className="w-full aspect-video bg-black rounded-xl"
              />
            ) : (
              <div className="bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl p-8 flex flex-col items-center gap-4">
                <Radio className="w-16 h-16 text-primary animate-pulse" />
                <audio ref={audioRef} controls autoPlay className="w-full max-w-md" />
              </div>
            )}
            <p className="text-[11px] text-muted-foreground mt-2">
              {t("স্ট্রিম না চললে অন্য চ্যানেল ট্রাই করুন — কিছু সোর্স জিও-ব্লকড।", "If a stream doesn't play, try another — some sources are geo-blocked.")}
            </p>
          </Card>
        )}

        <div className="relative mb-5 max-w-md mx-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("চ্যানেল খুঁজুন...", "Search channels...")}
            className="pl-9 rounded-full"
          />
        </div>

        {loading && (
          <div className="flex flex-col items-center py-12 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin mb-2" />
            <p className="text-sm">{t("সর্বশেষ লাইভ চ্যানেল লোড হচ্ছে...", "Loading latest live channels...")}</p>
          </div>
        )}

        {!loading && groups.length === 0 && (
          <p className="text-center text-muted-foreground py-8">
            {t("কোনো চ্যানেল পাওয়া যায়নি।", "No channels found.")}
          </p>
        )}

        {!loading && groups.map((g) => (
          <section key={g.country} className="mb-8">
            <h2 className="text-lg font-display font-bold mb-3 flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${g.country === "BD" ? "bg-green-600" : g.country === "IN" ? "bg-orange-500" : "bg-muted-foreground"}`} />
              {countryLabel[g.country]}
              <span className="text-xs font-normal text-muted-foreground">({g.items.length})</span>
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {g.items.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setActive(c)}
                  className={`group relative p-4 rounded-2xl border bg-card hover:border-primary hover:shadow-elegant transition-smooth text-left ${active?.id === c.id ? "border-primary shadow-glow" : "border-border"}`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {c.logo ? (
                      <img src={c.logo} alt="" className="w-8 h-8 rounded object-contain bg-muted" onError={(e) => ((e.target as HTMLImageElement).style.visibility = "hidden")} />
                    ) : (
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white ${c.category === "tv" ? "gradient-bg-primary" : "gradient-bg-warm"}`}>
                        {c.category === "tv" ? <Tv className="w-4 h-4" /> : <Radio className="w-4 h-4" />}
                      </div>
                    )}
                    <Play className="w-4 h-4 text-muted-foreground group-hover:text-primary ml-auto" />
                  </div>
                  <p className="font-semibold text-sm leading-tight line-clamp-2">{c.name}</p>
                </button>
              ))}
            </div>
          </section>
        ))}

        <p className="text-xs text-center text-muted-foreground mt-6">
          {t(
            "সোর্স: iptv-org (টিভি) + radio-browser.info (রেডিও) — কমিউনিটি দ্বারা ক্রমাগত আপডেট।",
            "Sources: iptv-org (TV) + radio-browser.info (radio) — continuously community-updated."
          )}
        </p>
      </motion.div>
    </div>
  );
};

export default LiveTV;
