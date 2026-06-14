import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Film, Tv2, Search, Star, Play, X, Loader2, Calendar, Globe, Download, Music, Archive, ServerCog, ExternalLink } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const TMDB_KEY = "8265bd1679663a7ea12ac168da84d2e8";
const TMDB_IMG = "https://image.tmdb.org/t/p/w500";
const CURRENT_YEAR = new Date().getFullYear();

type MediaType = "movie" | "tv" | "song";

interface Item {
  id: number;
  title: string;
  poster_path: string | null;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
  overview: string;
  original_language?: string;
}

// Language / region presets covering Bangla, all Indian, Pakistani, Korean and world
const LANGS = [
  { code: "",   label: "All",        bn: "সব",          flag: "🌍" },
  { code: "bn", label: "Bangla",     bn: "বাংলা",        flag: "🇧🇩" },
  { code: "hi", label: "Hindi",      bn: "হিন্দি",       flag: "🇮🇳" },
  { code: "ta", label: "Tamil",      bn: "তামিল",        flag: "🇮🇳" },
  { code: "te", label: "Telugu",     bn: "তেলেগু",       flag: "🇮🇳" },
  { code: "ml", label: "Malayalam",  bn: "মালায়ালম",     flag: "🇮🇳" },
  { code: "kn", label: "Kannada",    bn: "কন্নড়",        flag: "🇮🇳" },
  { code: "mr", label: "Marathi",    bn: "মারাঠি",       flag: "🇮🇳" },
  { code: "pa", label: "Punjabi",    bn: "পাঞ্জাবি",     flag: "🇮🇳" },
  { code: "gu", label: "Gujarati",   bn: "গুজরাটি",      flag: "🇮🇳" },
  { code: "ur", label: "Urdu/Pak",   bn: "উর্দু/পাকি",   flag: "🇵🇰" },
  { code: "en", label: "English",    bn: "ইংরেজি",       flag: "🇺🇸" },
  { code: "ko", label: "Korean",     bn: "কোরিয়ান",      flag: "🇰🇷" },
  { code: "ja", label: "Japanese",   bn: "জাপানি",       flag: "🇯🇵" },
  { code: "zh", label: "Chinese",    bn: "চাইনিজ",       flag: "🇨🇳" },
  { code: "tr", label: "Turkish",    bn: "তুর্কি",        flag: "🇹🇷" },
  { code: "es", label: "Spanish",    bn: "স্প্যানিশ",     flag: "🇪🇸" },
  { code: "fr", label: "French",     bn: "ফরাসি",        flag: "🇫🇷" },
  { code: "ar", label: "Arabic",     bn: "আরবি",         flag: "🇸🇦" },
  { code: "fa", label: "Persian",    bn: "ফারসি",        flag: "🇮🇷" },
  { code: "th", label: "Thai",       bn: "থাই",          flag: "🇹🇭" },
  { code: "id", label: "Indonesian", bn: "ইন্দোনেশিয়",   flag: "🇮🇩" },
  { code: "ru", label: "Russian",    bn: "রুশ",          flag: "🇷🇺" },
];

// Multiple streaming server providers — failover options
const SERVERS = {
  movie: [
    { name: "VidSrc.to",     url: (id: number) => `https://vidsrc.to/embed/movie/${id}` },
    { name: "VidSrc.xyz",    url: (id: number) => `https://vidsrc.xyz/embed/movie?tmdb=${id}` },
    { name: "2Embed",        url: (id: number) => `https://www.2embed.cc/embed/${id}` },
    { name: "MultiEmbed",    url: (id: number) => `https://multiembed.mov/?video_id=${id}&tmdb=1` },
    { name: "VidLink",       url: (id: number) => `https://vidlink.pro/movie/${id}` },
    { name: "Embed.su",      url: (id: number) => `https://embed.su/embed/movie/${id}` },
    { name: "AutoEmbed",     url: (id: number) => `https://autoembed.cc/movie/tmdb/${id}` },
    { name: "SuperEmbed",    url: (id: number) => `https://multiembed.mov/directstream.php?video_id=${id}&tmdb=1` },
  ],
  tv: [
    { name: "VidSrc.to",     url: (id: number, s: number, e: number) => `https://vidsrc.to/embed/tv/${id}/${s}/${e}` },
    { name: "VidSrc.xyz",    url: (id: number, s: number, e: number) => `https://vidsrc.xyz/embed/tv?tmdb=${id}&season=${s}&episode=${e}` },
    { name: "2Embed",        url: (id: number, s: number, e: number) => `https://www.2embed.cc/embedtv/${id}&s=${s}&e=${e}` },
    { name: "MultiEmbed",    url: (id: number, s: number, e: number) => `https://multiembed.mov/?video_id=${id}&tmdb=1&s=${s}&e=${e}` },
    { name: "VidLink",       url: (id: number, s: number, e: number) => `https://vidlink.pro/tv/${id}/${s}/${e}` },
    { name: "Embed.su",      url: (id: number, s: number, e: number) => `https://embed.su/embed/tv/${id}/${s}/${e}` },
    { name: "AutoEmbed",     url: (id: number, s: number, e: number) => `https://autoembed.cc/tv/tmdb/${id}-${s}-${e}` },
  ],
};

// Download / torrent search aggregators
const downloadLinks = (title: string, year?: string) => {
  const q = encodeURIComponent(`${title} ${year || ""}`.trim());
  return [
    { name: "YTS (Movies)",      url: `https://yts.mx/browse-movies/${q}` },
    { name: "1337x Search",      url: `https://1337x.to/search/${q}/1/` },
    { name: "TorrentGalaxy",     url: `https://torrentgalaxy.to/torrents.php?search=${q}` },
    { name: "RARBG Mirror",      url: `https://rargb.to/search/?search=${q}` },
    { name: "Google Drive Search", url: `https://www.google.com/search?q=${q}+download+mkv+OR+mp4+site:drive.google.com` },
    { name: "Telegram Search",   url: `https://www.google.com/search?q=${q}+download+site:t.me` },
  ];
};

const Movies = () => {
  const { language } = useLanguage();
  const bn = language === "bn";
  const t = (b: string, e: string) => (bn ? b : e);

  const [type, setType] = useState<MediaType>("movie");
  const [lang, setLang] = useState("");                 // language filter
  const [year, setYear] = useState<number | "">("");    // year filter (archive)
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [active, setActive] = useState<{ id: number; title: string; type: MediaType; year?: string } | null>(null);
  const [season, setSeason] = useState(1);
  const [episode, setEpisode] = useState(1);
  const [serverIdx, setServerIdx] = useState(0);

  // YouTube song search query
  const songQuery = query.trim() || (lang ? LANGS.find(l => l.code === lang)?.label + " songs" : "popular songs");

  const fetchTmdb = async () => {
    if (type === "song") return;
    setLoading(true);
    try {
      let url = "";
      if (query.trim()) {
        url = `https://api.themoviedb.org/3/search/${type}?api_key=${TMDB_KEY}&query=${encodeURIComponent(query)}&language=en-US&page=${page}&include_adult=false`;
      } else {
        const yearParam = year ? (type === "movie" ? `&primary_release_year=${year}` : `&first_air_date_year=${year}`) : "";
        const langParam = lang ? `&with_original_language=${lang}` : "";
        url = `https://api.themoviedb.org/3/discover/${type}?api_key=${TMDB_KEY}&sort_by=popularity.desc&include_adult=false&page=${page}${langParam}${yearParam}`;
      }
      const r = await fetch(url);
      const j = await r.json();
      const list: Item[] = (j.results || []).map((m: any) => ({
        id: m.id,
        title: m.title || m.name,
        poster_path: m.poster_path,
        vote_average: m.vote_average,
        release_date: m.release_date,
        first_air_date: m.first_air_date,
        overview: m.overview,
        original_language: m.original_language,
      }));
      setItems(list);
      setTotalPages(Math.min(j.total_pages || 1, 500));
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { setPage(1); }, [type, lang, year]);
  useEffect(() => { fetchTmdb(); /* eslint-disable-next-line */ }, [type, lang, year, page]);

  const embedUrl = useMemo(() => {
    if (!active) return "";
    if (active.type === "movie") {
      const srv = SERVERS.movie[serverIdx] || SERVERS.movie[0];
      return srv.url(active.id);
    }
    if (active.type === "tv") {
      const srv = SERVERS.tv[serverIdx] || SERVERS.tv[0];
      return (srv.url as any)(active.id, season, episode);
    }
    return "";
  }, [active, serverIdx, season, episode]);

  const archiveYears = useMemo(() => {
    const arr = [];
    for (let y = CURRENT_YEAR; y >= 1950; y--) arr.push(y);
    return arr;
  }, []);

  return (
    <div className="container py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 text-secondary text-xs font-semibold mb-3">
            <Film className="w-3.5 h-3.5" />
            {t("অল-ইন-ওয়ান এন্টারটেইনমেন্ট", "All-in-One Entertainment")}
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold mb-2">
            {t("🎬 মুভি • সিরিজ • নাটক • গান", "🎬 Movies • Series • Drama • Songs")}
          </h1>
          <p className="text-muted-foreground text-sm">
            {t(
              "বাংলা, হিন্দি, তামিল, তেলেগু, উর্দু, কোরিয়ান, তুর্কি — যেকোনো ভাষা, যেকোনো বছর। মাল্টি-সার্ভার ইন্সট্যান্ট স্ট্রিমিং + ডাউনলোড।",
              "Bangla, Hindi, Tamil, Telugu, Urdu, Korean, Turkish — any language, any year. Multi-server instant streaming + download."
            )}
          </p>
        </div>

        {/* Type tabs */}
        <div className="flex justify-center mb-4">
          <div className="inline-flex rounded-full bg-muted p-1 flex-wrap">
            <button
              onClick={() => { setType("movie"); setActive(null); }}
              className={`px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 transition-smooth ${type === "movie" ? "gradient-bg-primary text-white shadow-glow" : ""}`}
            >
              <Film className="w-4 h-4" /> {t("মুভি", "Movies")}
            </button>
            <button
              onClick={() => { setType("tv"); setActive(null); }}
              className={`px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 transition-smooth ${type === "tv" ? "gradient-bg-warm text-white shadow-pink" : ""}`}
            >
              <Tv2 className="w-4 h-4" /> {t("সিরিজ/নাটক", "Series/Drama")}
            </button>
            <button
              onClick={() => { setType("song"); setActive(null); }}
              className={`px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 transition-smooth ${type === "song" ? "bg-pink-500 text-white shadow-lg" : ""}`}
            >
              <Music className="w-4 h-4" /> {t("গান", "Songs")}
            </button>
          </div>
        </div>

        {/* Language chips */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-3 -mx-2 px-2 scrollbar-thin">
          {LANGS.map((l) => (
            <button
              key={l.code || "all"}
              onClick={() => setLang(l.code)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border whitespace-nowrap transition-smooth ${lang === l.code ? "gradient-bg-primary text-white border-transparent shadow-glow" : "bg-card hover:border-primary"}`}
            >
              <span className="mr-1">{l.flag}</span>{bn ? l.bn : l.label}
            </button>
          ))}
        </div>

        {/* Year archive selector */}
        {type !== "song" && (
          <div className="flex items-center gap-2 flex-wrap mb-4">
            <Archive className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs font-semibold text-muted-foreground">{t("আর্কাইভ (বছর):", "Archive (year):")}</span>
            <button
              onClick={() => setYear("")}
              className={`px-3 py-1 rounded-full text-xs font-semibold border ${year === "" ? "gradient-bg-primary text-white border-transparent" : "bg-card"}`}
            >
              {t("আপডেটেড/জনপ্রিয়", "Updated/Popular")}
            </button>
            <select
              value={year}
              onChange={(e) => setYear(e.target.value ? Number(e.target.value) : "")}
              className="px-3 py-1 rounded-full text-xs font-semibold border bg-card"
            >
              <option value="">{t("বছর বাছাই", "Pick year")}</option>
              {archiveYears.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
            {year !== "" && (
              <span className="text-xs text-muted-foreground">
                {t(`${year} সালের জনপ্রিয়`, `Popular from ${year}`)}
              </span>
            )}
          </div>
        )}

        {/* Search */}
        <div className="relative mb-6 max-w-md mx-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (setPage(1), fetchTmdb())}
            placeholder={type === "song" ? t("গানের নাম / শিল্পী...", "Song / artist...") : t("খুঁজুন...", "Search title...")}
            className="pl-9 rounded-full"
          />
        </div>

        {/* === SONGS TAB === */}
        {type === "song" && (
          <Card className="p-3 overflow-hidden mb-6">
            <p className="text-xs text-muted-foreground mb-2">
              {t("YouTube থেকে লাইভ সার্চ রেজাল্ট — যেকোনো ভাষার গান, ভিডিও, নাটক।", "Live YouTube search — songs, music videos, drama in any language.")}
            </p>
            <div className="aspect-video bg-black rounded-xl overflow-hidden">
              <iframe
                key={songQuery}
                src={`https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(songQuery)}`}
                className="w-full h-full"
                allow="autoplay; encrypted-media; fullscreen"
                allowFullScreen
              />
            </div>
          </Card>
        )}

        {/* === Player (movies / tv) === */}
        {active && active.type !== "song" && (
          <Card className="p-4 mb-6 overflow-hidden">
            <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
              <p className="font-display font-bold text-lg flex-1 min-w-0 truncate">{active.title} {active.year && <span className="text-muted-foreground text-sm">({active.year})</span>}</p>
              <Button variant="ghost" size="sm" onClick={() => setActive(null)}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Server selector */}
            <div className="flex items-center gap-2 flex-wrap mb-3">
              <ServerCog className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs font-semibold">{t("সার্ভার:", "Server:")}</span>
              {(active.type === "movie" ? SERVERS.movie : SERVERS.tv).map((s, i) => (
                <button
                  key={s.name}
                  onClick={() => setServerIdx(i)}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-smooth ${serverIdx === i ? "gradient-bg-primary text-white border-transparent" : "bg-card hover:border-primary"}`}
                >
                  {s.name}
                </button>
              ))}
              <span className="text-[10px] text-muted-foreground">{t("একটা না চললে পরেরটা ট্রাই করুন", "If one fails, try the next")}</span>
            </div>

            {active.type === "tv" && (
              <div className="flex flex-wrap gap-2 mb-3 items-center">
                <label className="text-xs font-semibold">S</label>
                <Input type="number" min={1} value={season} onChange={(e) => setSeason(Math.max(1, +e.target.value || 1))} className="w-20 h-8" />
                <label className="text-xs font-semibold">E</label>
                <Input type="number" min={1} value={episode} onChange={(e) => setEpisode(Math.max(1, +e.target.value || 1))} className="w-20 h-8" />
              </div>
            )}

            <div className="aspect-video bg-black rounded-xl overflow-hidden">
              <iframe
                key={embedUrl}
                src={embedUrl}
                className="w-full h-full"
                allow="autoplay; fullscreen; encrypted-media"
                allowFullScreen
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Download */}
            <div className="mt-3">
              <p className="text-xs font-semibold flex items-center gap-1 mb-2"><Download className="w-3.5 h-3.5" /> {t("ডাউনলোড অপশন (একাধিক সোর্স):", "Download options (multiple sources):")}</p>
              <div className="flex gap-2 flex-wrap">
                {downloadLinks(active.title, active.year).map((d) => (
                  <a key={d.name} href={d.url} target="_blank" rel="noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-semibold bg-muted hover:bg-primary hover:text-primary-foreground transition-smooth border">
                    {d.name} <ExternalLink className="w-3 h-3" />
                  </a>
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground mt-2">
                {t("⚠️ ডাউনলোড থার্ড-পার্টি সাইট থেকে — VPN ও অ্যাড-ব্লকার ব্যবহার করুন।", "⚠️ Downloads via third-party sites — use VPN & ad-blocker.")}
              </p>
            </div>
          </Card>
        )}

        {/* === Grid === */}
        {type !== "song" && (loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : items.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">{t("কোন রেজাল্ট নেই", "No results")}</p>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
              {items.map((m) => {
                const y = (m.release_date || m.first_air_date || "").slice(0, 4);
                return (
                  <motion.button
                    key={m.id}
                    whileHover={{ y: -4 }}
                    onClick={() => { setActive({ id: m.id, title: m.title, type: type as MediaType, year: y }); setSeason(1); setEpisode(1); setServerIdx(0); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                    className="text-left group rounded-2xl overflow-hidden bg-card border border-border hover:border-primary hover:shadow-elegant transition-smooth"
                  >
                    <div className="relative aspect-[2/3] bg-muted">
                      {m.poster_path ? (
                        <img src={`${TMDB_IMG}${m.poster_path}`} alt={m.title} className="w-full h-full object-cover" loading="lazy" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground"><Film className="w-10 h-10" /></div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                      <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-500/90 text-black text-[11px] font-bold">
                        <Star className="w-3 h-3 fill-current" />
                        {m.vote_average?.toFixed(1)}
                      </div>
                      {m.original_language && (
                        <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-black/60 text-white text-[10px] font-bold uppercase">
                          {m.original_language}
                        </div>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 p-2 text-white">
                        <p className="text-[11px] flex items-center gap-1 opacity-80">
                          <Calendar className="w-3 h-3" />{y}
                        </p>
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-smooth bg-black/40">
                        <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
                          <Play className="w-6 h-6 text-black ml-0.5" />
                        </div>
                      </div>
                    </div>
                    <div className="p-2">
                      <p className="font-semibold text-xs leading-tight line-clamp-2">{m.title}</p>
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* Pagination */}
            <div className="flex justify-center items-center gap-2 mt-6">
              <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>← {t("আগের", "Prev")}</Button>
              <span className="text-xs text-muted-foreground">{t(`পৃষ্ঠা ${page} / ${totalPages}`, `Page ${page} / ${totalPages}`)}</span>
              <Button size="sm" variant="outline" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>{t("পরের", "Next")} →</Button>
            </div>
          </>
        ))}

        <div className="text-center mt-8 space-y-1">
          <p className="text-[11px] text-muted-foreground flex items-center justify-center gap-1">
            <Globe className="w-3 h-3" />
            {t(
              "ডেটা: TMDB • স্ট্রিম: ৭+ থার্ড-পার্টি সার্ভার • গান: YouTube • ডাউনলোড: পাবলিক অ্যাগ্রিগেটর",
              "Data: TMDB • Stream: 7+ third-party servers • Songs: YouTube • Downloads: public aggregators"
            )}
          </p>
          <p className="text-[10px] text-muted-foreground">
            {t("কন্টেন্টের কপিরাইট সংশ্লিষ্ট মালিকদের। এই পেজ শুধু একটি ইন্টারফেস।", "All content copyrights belong to respective owners. This page is only an interface.")}
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Movies;
