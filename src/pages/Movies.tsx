import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Film, Tv2, Search, Star, Play, X, Loader2, Calendar } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

// Public TMDB read-only API key (browse only — search & metadata).
// Streams are loaded via vidsrc.to as a third-party embed (bypass).
const TMDB_KEY = "8265bd1679663a7ea12ac168da84d2e8"; // widely used demo read-only key
const TMDB_IMG = "https://image.tmdb.org/t/p/w500";

type MediaType = "movie" | "tv";
interface Item {
  id: number;
  title: string;
  poster_path: string | null;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
  overview: string;
}

const Movies = () => {
  const { language } = useLanguage();
  const bn = language === "bn";
  const t = (b: string, e: string) => (bn ? b : e);

  const [type, setType] = useState<MediaType>("movie");
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState<{ id: number; title: string; type: MediaType } | null>(null);
  const [season, setSeason] = useState(1);
  const [episode, setEpisode] = useState(1);

  const load = async (q?: string) => {
    setLoading(true);
    try {
      const url = q
        ? `https://api.themoviedb.org/3/search/${type}?api_key=${TMDB_KEY}&query=${encodeURIComponent(q)}&language=en-US`
        : `https://api.themoviedb.org/3/${type}/popular?api_key=${TMDB_KEY}&language=en-US&page=1`;
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
      }));
      setItems(list);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [type]);

  const embedUrl = active
    ? active.type === "movie"
      ? `https://vidsrc.to/embed/movie/${active.id}`
      : `https://vidsrc.to/embed/tv/${active.id}/${season}/${episode}`
    : "";

  return (
    <div className="container py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 text-secondary text-xs font-semibold mb-3">
            <Film className="w-3.5 h-3.5" />
            {t("জনপ্রিয় মুভি ও সিরিজ", "Popular Movies & Series")}
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold mb-2">
            {t("🎬 মুভি ও সিরিজ স্ট্রিমিং", "🎬 Movies & Series Streaming")}
          </h1>
          <p className="text-muted-foreground text-sm">
            {t(
              "জনপ্রিয় মুভি ও TV সিরিজ — তৃতীয়-পক্ষ এমবেডের মাধ্যমে।",
              "Popular movies & TV series — via third-party embed."
            )}
          </p>
        </div>

        {/* Type tabs */}
        <div className="flex justify-center mb-5">
          <div className="inline-flex rounded-full bg-muted p-1">
            <button
              onClick={() => { setType("movie"); setActive(null); }}
              className={`px-5 py-2 rounded-full text-sm font-semibold flex items-center gap-2 transition-smooth ${type === "movie" ? "gradient-bg-primary text-white shadow-glow" : ""}`}
            >
              <Film className="w-4 h-4" /> {t("মুভি", "Movies")}
            </button>
            <button
              onClick={() => { setType("tv"); setActive(null); }}
              className={`px-5 py-2 rounded-full text-sm font-semibold flex items-center gap-2 transition-smooth ${type === "tv" ? "gradient-bg-warm text-white shadow-pink" : ""}`}
            >
              <Tv2 className="w-4 h-4" /> {t("সিরিজ", "Series")}
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-6 max-w-md mx-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && load(query)}
            placeholder={t("খুঁজুন...", "Search...")}
            className="pl-9 rounded-full"
          />
        </div>

        {/* Player */}
        {active && (
          <Card className="p-4 mb-6 overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <p className="font-display font-bold text-lg">{active.title}</p>
              <Button variant="ghost" size="sm" onClick={() => setActive(null)}>
                <X className="w-4 h-4" />
              </Button>
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
            <p className="text-[11px] text-muted-foreground mt-2">
              {t(
                "প্লেয়ারে অ্যাড আসতে পারে — অ্যাড ব্লকার ব্যবহারের পরামর্শ দেওয়া হলো।",
                "Player may show ads — using an ad-blocker is recommended."
              )}
            </p>
          </Card>
        )}

        {/* Grid */}
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
            {items.map((m) => (
              <motion.button
                key={m.id}
                whileHover={{ y: -4 }}
                onClick={() => { setActive({ id: m.id, title: m.title, type }); setSeason(1); setEpisode(1); }}
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
                  <div className="absolute bottom-0 left-0 right-0 p-2 text-white">
                    <p className="text-[11px] flex items-center gap-1 opacity-80">
                      <Calendar className="w-3 h-3" />
                      {(m.release_date || m.first_air_date || "").slice(0, 4)}
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
            ))}
          </div>
        )}

        <p className="text-xs text-center text-muted-foreground mt-8">
          {t(
            "ডেটা: TMDB • স্ট্রিম: vidsrc.to (থার্ড-পার্টি) — কন্টেন্টের কপিরাইট সংশ্লিষ্ট মালিকদের।",
            "Data: TMDB • Stream: vidsrc.to (third-party) — content copyrights belong to respective owners."
          )}
        </p>
      </motion.div>
    </div>
  );
};

export default Movies;
