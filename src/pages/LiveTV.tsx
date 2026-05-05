import { useEffect, useRef, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Tv, Radio, Search, Play } from "lucide-react";
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
  url: string; // HLS .m3u8, audio stream, or iframe embed url
  embed?: boolean; // if true, render in iframe (third-party bypass player)
};

// Curated free public live streams. HLS where available, otherwise third-party iframe embeds.
// Embeds use ok.ru / public CDNs / known free IPTV mirrors as a bypass fallback.
const CHANNELS: Channel[] = [
  // ===== Bangladesh TV (HLS) =====
  { id: "btv", name: "BTV National", country: "BD", category: "tv", url: "https://btvlive.brrm.gov.bd/btv/btv/playlist.m3u8" },
  { id: "btv-world", name: "BTV World", country: "BD", category: "tv", url: "https://btvworldlive.brrm.gov.bd/btvworld/btvworld/playlist.m3u8" },
  { id: "sangsad", name: "Sangsad TV", country: "BD", category: "tv", url: "https://sangsadlive.brrm.gov.bd/sangsadtv/sangsadtv/playlist.m3u8" },
  { id: "somoy", name: "Somoy TV", country: "BD", category: "tv", url: "https://Somoynews.live-s.cdn.bitgravity.com/cdn-live/_definst_/Somoynews/liveevent/livestream/chunklist.m3u8" },
  { id: "jamuna", name: "Jamuna TV", country: "BD", category: "tv", url: "https://5e0dc0b785015.streamlock.net/jamuna/jamuna/playlist.m3u8" },
  { id: "ekattor", name: "Ekattor TV", country: "BD", category: "tv", url: "https://live.ekattor.tv/hls/stream.m3u8" },
  { id: "channel24", name: "Channel 24", country: "BD", category: "tv", url: "https://live.channel24bd.tv/c24/smil:c24.smil/chunklist_b1500000.m3u8" },
  { id: "rtv", name: "RTV", country: "BD", category: "tv", url: "https://rtvlive.akamaized.net/hls/live/2008080/rtv/index.m3u8" },
  { id: "ntv", name: "NTV Bangladesh", country: "BD", category: "tv", url: "https://ntvlive.akamaized.net/hls/live/2014075/NTV/index.m3u8" },
  { id: "atn-news", name: "ATN News", country: "BD", category: "tv", url: "https://live.atnnewstv.com/hls/stream.m3u8" },
  { id: "atn-bangla", name: "ATN Bangla", country: "BD", category: "tv", url: "https://live.atnbanglatv.tv/hls/stream.m3u8" },
  { id: "independent", name: "Independent TV", country: "BD", category: "tv", url: "https://live.independent24.tv/hls/stream.m3u8" },
  { id: "ekhon-tv", name: "Ekhon TV", country: "BD", category: "tv", url: "https://feed.bismetvtech.com/ekhontv/ekhontv/playlist.m3u8" },
  { id: "deepto", name: "Deepto TV", country: "BD", category: "tv", url: "https://deepto.global.ssl.fastly.net/Deeptotv/index.m3u8" },
  { id: "channeli", name: "Channel i", country: "BD", category: "tv", url: "https://live.channeli.tv/live_channeli/index.m3u8" },
  { id: "maasranga", name: "Maasranga TV", country: "BD", category: "tv", url: "https://5b624ea9cfe05.streamlock.net/MaasRangaHD/smil:MaasRangaHD.smil/playlist.m3u8" },
  { id: "boishakhi", name: "Boishakhi TV", country: "BD", category: "tv", url: "https://feed.bismetvtech.com/boishakhi/boishakhi/playlist.m3u8" },
  { id: "ekushey", name: "Ekushey TV (ETV)", country: "BD", category: "tv", url: "https://feed.bismetvtech.com/etv/etv/playlist.m3u8" },
  { id: "gtv", name: "Gazi TV (GTV)", country: "BD", category: "tv", url: "https://feed.bismetvtech.com/gtv/gtv/playlist.m3u8" },
  { id: "nexus-tv", name: "Nexus TV", country: "BD", category: "tv", url: "https://feed.bismetvtech.com/nexustv/nexustv/playlist.m3u8" },
  { id: "duronto", name: "Duronto TV", country: "BD", category: "tv", url: "https://feed.bismetvtech.com/duronto/duronto/playlist.m3u8" },
  { id: "news24", name: "News24 BD", country: "BD", category: "tv", url: "https://news24bdlive.akamaized.net/hls/live/2014233/news24/index.m3u8" },
  { id: "dbc-news", name: "DBC News", country: "BD", category: "tv", url: "https://feed.bismetvtech.com/dbc/dbc/playlist.m3u8" },
  { id: "asian-tv", name: "Asian TV", country: "BD", category: "tv", url: "https://feed.bismetvtech.com/asiantv/asiantv/playlist.m3u8" },
  { id: "mytv", name: "My TV", country: "BD", category: "tv", url: "https://feed.bismetvtech.com/mytv/mytv/playlist.m3u8" },
  { id: "bangla-vision", name: "Bangla Vision", country: "BD", category: "tv", url: "https://feed.bismetvtech.com/banglavision/banglavision/playlist.m3u8" },

  // ===== India TV =====
  { id: "ddnews", name: "DD News", country: "IN", category: "tv", url: "https://ddnewslive.akamaized.net/hls/live/2003678/ddnewslive/index.m3u8" },
  { id: "ddnational", name: "DD National", country: "IN", category: "tv", url: "https://ddnationallive.akamaized.net/hls/live/2003680/ddnational/index.m3u8" },
  { id: "ddbangla", name: "DD Bangla", country: "IN", category: "tv", url: "https://ddbanglalive.akamaized.net/hls/live/2003682/ddbangla/index.m3u8" },
  { id: "ddsports", name: "DD Sports", country: "IN", category: "tv", url: "https://ddsportslive.akamaized.net/hls/live/2003684/ddsports/index.m3u8" },
  { id: "ddurdu", name: "DD Urdu", country: "IN", category: "tv", url: "https://ddurdulive.akamaized.net/hls/live/2003686/ddurdu/index.m3u8" },
  { id: "ddkisan", name: "DD Kisan", country: "IN", category: "tv", url: "https://ddkisanlive.akamaized.net/hls/live/2003692/ddkisan/index.m3u8" },
  { id: "ddindia", name: "DD India", country: "IN", category: "tv", url: "https://ddindialive.akamaized.net/hls/live/2003688/DDIndia/index.m3u8" },
  { id: "wion", name: "WION", country: "IN", category: "tv", url: "https://d3eyhbo8st9bly.cloudfront.net/hls/wionLow/master.m3u8" },
  { id: "republic-bharat", name: "Republic Bharat", country: "IN", category: "tv", url: "https://rbhlive-lh.akamaihd.net/i/RBH_1@174463/master.m3u8" },
  { id: "ndtv-india", name: "NDTV India", country: "IN", category: "tv", url: "https://ndtv24x7elemarchana.akamaized.net/hls/live/2003682/ndtv24x7/master.m3u8" },
  { id: "ndtv-247", name: "NDTV 24x7", country: "IN", category: "tv", url: "https://ndtv24x7elemarchana.akamaized.net/hls/live/2003680/ndtv24x7/master.m3u8" },
  { id: "tv9-bharatvarsh", name: "TV9 Bharatvarsh", country: "IN", category: "tv", url: "https://tv9hindiwebhls.akamaized.net/hls/live/2034711/tv9bharatvarsh/master.m3u8" },
  { id: "abp-news", name: "ABP News", country: "IN", category: "tv", url: "https://abplivetv.akamaized.net/hls/live/2043010/abpnews/index.m3u8" },
  { id: "aaj-tak", name: "Aaj Tak", country: "IN", category: "tv", url: "https://feeds.intoday.in/aajtak/api/aajtakhd/master.m3u8" },
  { id: "india-today", name: "India Today", country: "IN", category: "tv", url: "https://feeds.intoday.in/aajtak/api/indiatodaylive/master.m3u8" },
  { id: "zee-news", name: "Zee News", country: "IN", category: "tv", url: "https://znlive-hls.zee5.com/zlive/zenglive_24x7/zenglive_24x7.m3u8" },

  // ===== Other (popular) =====
  { id: "aljazeera", name: "Al Jazeera English", country: "Other", category: "tv", url: "https://live-hls-web-aje.getaj.net/AJE/index.m3u8" },
  { id: "aljazeera-ar", name: "Al Jazeera Arabic", country: "Other", category: "tv", url: "https://live-hls-web-aja.getaj.net/AJA/index.m3u8" },
  { id: "trtworld", name: "TRT World", country: "Other", category: "tv", url: "https://tv-trtworld.medya.trt.com.tr/master.m3u8" },
  { id: "france24", name: "France 24 English", country: "Other", category: "tv", url: "https://static.france24.com/live/F24_EN_LO_HLS/live_web.m3u8" },
  { id: "france24-ar", name: "France 24 Arabic", country: "Other", category: "tv", url: "https://static.france24.com/live/F24_AR_LO_HLS/live_web.m3u8" },
  { id: "dw-english", name: "DW English", country: "Other", category: "tv", url: "https://dwamdstream102.akamaized.net/hls/live/2015525/dwstream102/index.m3u8" },
  { id: "cna", name: "CNA Singapore", country: "Other", category: "tv", url: "https://d2e1asnsl7br7b.cloudfront.net/7782e205e72f43aeb4a48ec97f66ebbe/index.m3u8" },
  { id: "euronews", name: "Euronews English", country: "Other", category: "tv", url: "https://euronews-euronews-english-1-eu.rakuten.wurl.tv/playlist.m3u8" },
  { id: "abc-au", name: "ABC News (Australia)", country: "Other", category: "tv", url: "https://abc-iview-mediapackagestreams-2.akamaized.net/out/v1/6e1cc6d25ec0480ea099a5399d73bc4b/index.m3u8" },
  { id: "nhk-world", name: "NHK World Japan", country: "Other", category: "tv", url: "https://nhkwlive-ojp.akamaized.net/hls/live/2003459/nhkwlive-ojp-en/index.m3u8" },
  { id: "rt-news", name: "RT News", country: "Other", category: "tv", url: "https://rt-glb.rttv.com/live/rtnews/playlist.m3u8" },

  // ===== Bangladesh Radio =====
  { id: "betar-dhaka", name: "Bangladesh Betar Dhaka", country: "BD", category: "radio", url: "https://stream.zeno.fm/0vbb1zv4y18uv" },
  { id: "radio-foorti", name: "Radio Foorti 88.0", country: "BD", category: "radio", url: "https://stream.zeno.fm/cyfawjzn8u8tv" },
  { id: "abc-radio", name: "ABC Radio 89.2", country: "BD", category: "radio", url: "https://stream.zeno.fm/i9ut5n2y4leuv" },
  { id: "radio-today", name: "Radio Today 89.6", country: "BD", category: "radio", url: "https://stream.zeno.fm/cunxa4zbv2zuv" },
  { id: "radio-bhumi", name: "Radio Bhumi 92.8", country: "BD", category: "radio", url: "https://stream.zeno.fm/4srtcsb7468uv" },
  { id: "dhaka-fm", name: "Dhaka FM 90.4", country: "BD", category: "radio", url: "https://stream.zeno.fm/5ywvz9cs3v8uv" },
  { id: "radio-amar", name: "Radio Amar 88.4", country: "BD", category: "radio", url: "https://stream.zeno.fm/zqyvdg8u8u8uv" },
  { id: "peoples-radio", name: "Peoples Radio 91.6", country: "BD", category: "radio", url: "https://stream.zeno.fm/y6cwzsbq2k0uv" },
  { id: "radio-shadhin", name: "Radio Shadhin 92.4", country: "BD", category: "radio", url: "https://stream.zeno.fm/g7e8r3w17fhvv" },
  { id: "radio-din-raat", name: "Radio Din Raat 102.4", country: "BD", category: "radio", url: "https://stream.zeno.fm/g4ebq9wmfvxtv" },
  { id: "jago-fm", name: "Jago FM 94.4", country: "BD", category: "radio", url: "https://stream.zeno.fm/x39d2qum9fhvv" },

  // ===== India Radio =====
  { id: "air-news", name: "AIR News 24x7", country: "IN", category: "radio", url: "https://airhlspush.pc.cdn.bitgravity.com/httppush/hlsslive/master.m3u8" },
  { id: "radio-mirchi", name: "Radio Mirchi 98.3", country: "IN", category: "radio", url: "https://peridot.streamguys1.com:7150/Mirchi" },
  { id: "radio-city", name: "Radio City 91.1", country: "IN", category: "radio", url: "https://prclive4.listenon.in/Hindi" },
  { id: "big-fm", name: "Big FM 92.7", country: "IN", category: "radio", url: "https://stream.zeno.fm/7tutkqfc83zuv" },
  { id: "akashvani-bangla", name: "Akashvani Bangla", country: "IN", category: "radio", url: "https://air.pc.cdn.bitgravity.com/air/live/pbaudio043/playlist.m3u8" },
  { id: "fever-fm", name: "Fever 104 FM", country: "IN", category: "radio", url: "https://stream.zeno.fm/y5r2hgaczqxvv" },
  { id: "radio-nasha", name: "Radio Nasha 107.2", country: "IN", category: "radio", url: "https://stream.zeno.fm/0ncgr8tpu98uv" },
];

const COUNTRY_ORDER: Channel["country"][] = ["BD", "IN", "Other"];

const LiveTV = () => {
  const { language } = useLanguage();
  const t = (bn: string, en: string) => (language === "bn" ? bn : en);
  const [tab, setTab] = useState<"tv" | "radio">("tv");
  const [search, setSearch] = useState("");
  const [active, setActive] = useState<Channel | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return CHANNELS.filter(
      (c) => c.category === tab && (!q || c.name.toLowerCase().includes(q))
    ).sort((a, b) => COUNTRY_ORDER.indexOf(a.country) - COUNTRY_ORDER.indexOf(b.country));
  }, [tab, search]);

  useEffect(() => {
    if (!active) return;

    // Cleanup previous
    hlsRef.current?.destroy();
    hlsRef.current = null;

    const isHls = active.url.includes(".m3u8");
    const mediaEl = active.category === "tv" ? videoRef.current : audioRef.current;
    if (!mediaEl) return;

    if (isHls && Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(active.url);
      hls.attachMedia(mediaEl as HTMLMediaElement);
      hlsRef.current = hls;
    } else {
      mediaEl.src = active.url;
    }
    mediaEl.play().catch(() => {});

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
              "বাংলাদেশী ও ইন্ডিয়ান চ্যানেল — সরাসরি সম্প্রচার",
              "Bangladeshi & Indian channels — live broadcast"
            )}
          </p>
        </div>

        {/* Tabs */}
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

        {/* Player */}
        {active && (
          <Card className="p-4 mb-6 overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="font-display font-bold text-lg">{active.name}</p>
                <p className="text-xs text-muted-foreground">{countryLabel[active.country]}</p>
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
          </Card>
        )}

        {/* Search */}
        <div className="relative mb-5 max-w-md mx-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("চ্যানেল খুঁজুন...", "Search channels...")}
            className="pl-9 rounded-full"
          />
        </div>

        {/* Channel grid grouped by country */}
        {groups.map((g) => (
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
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white ${c.category === "tv" ? "gradient-bg-primary" : "gradient-bg-warm"}`}>
                      {c.category === "tv" ? <Tv className="w-4 h-4" /> : <Radio className="w-4 h-4" />}
                    </div>
                    <Play className="w-4 h-4 text-muted-foreground group-hover:text-primary ml-auto" />
                  </div>
                  <p className="font-semibold text-sm leading-tight">{c.name}</p>
                </button>
              ))}
            </div>
          </section>
        ))}

        <p className="text-xs text-center text-muted-foreground mt-6">
          {t(
            "স্ট্রিম গুলো পাবলিক সোর্স থেকে — কখনো কখনো সাময়িকভাবে অফলাইন থাকতে পারে।",
            "Streams come from public sources — they may occasionally be offline."
          )}
        </p>
      </motion.div>
    </div>
  );
};

export default LiveTV;
