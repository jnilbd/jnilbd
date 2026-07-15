import { useEffect, useMemo, useRef, useState } from "react";
import Hls from "hls.js";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Play, RefreshCw, Search, Tv, Wifi, WifiOff, Film, Clapperboard } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";

type XCh = { id: string; name: string; logo: string | null; group: string; url: string };
type Kind = "live" | "movie" | "series";

const PROXY_BASE = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stream-proxy`;
const proxify = (u: string) => `${PROXY_BASE}?u=${encodeURIComponent(u)}`;

// Parse M3U/M3U_PLUS playlist
function parseM3U(text: string): XCh[] {
  const lines = text.split(/\r?\n/);
  const out: XCh[] = [];
  let cur: Partial<XCh> | null = null;
  let i = 0;
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;
    if (line.startsWith("#EXTINF")) {
      const nameMatch = line.match(/,(.+)$/);
      const logoMatch = line.match(/tvg-logo="([^"]*)"/i);
      const groupMatch = line.match(/group-title="([^"]*)"/i);
      cur = {
        name: nameMatch?.[1]?.trim() || "Unknown",
        logo: logoMatch?.[1] || null,
        group: groupMatch?.[1] || "Other",
      };
    } else if (!line.startsWith("#") && cur) {
      out.push({
        id: `x${i++}`,
        name: cur.name!,
        logo: cur.logo!,
        group: cur.group!,
        url: line,
      });
      cur = null;
    }
  }
  return out;
}

// Guess kind from group name (many providers prefix VOD/Series/Movies)
function guessKind(group: string, url: string): Kind {
  const g = group.toLowerCase();
  if (g.includes("series") || g.includes("সিরিজ") || url.includes("/series/")) return "series";
  if (g.includes("vod") || g.includes("movie") || g.includes("film") || g.includes("মুভি") || url.includes("/movie/")) return "movie";
  return "live";
}

const XtreamChannels = ({
  m3uUrl, label, username, expiry,
}: { m3uUrl: string; label: string; username?: string; expiry?: string }) => {
  const { language } = useLanguage();
  const t = (bn: string, en: string) => (language === "bn" ? bn : en);

  const [allChannels, setAllChannels] = useState<XCh[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [kind, setKind] = useState<Kind>("live");
  const [group, setGroup] = useState<string>("all");
  const [active, setActive] = useState<XCh | null>(null);
  const [playing, setPlaying] = useState<"idle" | "loading" | "playing" | "error">("idle");
  const [unblock, setUnblock] = useState(true);
  const [visible, setVisible] = useState(120);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const r = await fetch(proxify(m3uUrl));
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const text = await r.text();
      const parsed = parseM3U(text);
      if (parsed.length === 0) throw new Error("Empty or invalid playlist");
      setAllChannels(parsed);
    } catch (e: any) {
      setError(e?.message || "load failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); setVisible(120); /* eslint-disable-next-line */ }, [m3uUrl]);

  const kindCounts = useMemo(() => {
    const c = { live: 0, movie: 0, series: 0 };
    allChannels.forEach(ch => { c[guessKind(ch.group, ch.url)]++; });
    return c;
  }, [allChannels]);

  const byKind = useMemo(
    () => allChannels.filter(c => guessKind(c.group, c.url) === kind),
    [allChannels, kind]
  );

  const groups = useMemo(() => {
    const s = new Set<string>();
    byKind.forEach(c => s.add(c.group));
    return ["all", ...Array.from(s).sort()];
  }, [byKind]);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return byKind.filter(c =>
      (group === "all" || c.group === group) &&
      (!qq || c.name.toLowerCase().includes(qq) || c.group.toLowerCase().includes(qq))
    );
  }, [byKind, q, group]);

  useEffect(() => { setVisible(120); }, [kind, group, q]);

  const play = async (c: XCh) => {
    setActive(c); setPlaying("loading");
    try {
      const streamUrl = unblock ? proxify(c.url) : c.url;
      const video = videoRef.current;
      if (!video) return;
      hlsRef.current?.destroy(); hlsRef.current = null;
      const isM3u8 = /\.m3u8($|\?)/i.test(c.url) || unblock;
      if (Hls.isSupported() && isM3u8) {
        const hls = new Hls({ enableWorker: true });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          setPlaying("playing");
          video.play().catch(() => {});
        });
        hls.on(Hls.Events.ERROR, (_e, d) => {
          if (d.fatal) { hls.destroy(); setPlaying("error"); toast.error(t("চ্যানেল চালু করা গেলো না", "Stream failed")); }
        });
        hlsRef.current = hls;
      } else {
        video.src = streamUrl;
        video.play().then(() => setPlaying("playing")).catch(() => setPlaying("error"));
      }
    } catch (e: any) {
      setPlaying("error");
      toast.error(e?.message || "play failed");
    }
  };

  useEffect(() => () => { hlsRef.current?.destroy(); hlsRef.current = null; }, []);

  return (
    <Card className="p-4 mb-4 border-primary/30 bg-gradient-to-br from-primary/5 via-background to-primary/5">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white">
          <Tv className="w-5 h-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-bold leading-tight truncate">{label}</p>
          <p className="text-[11px] text-muted-foreground truncate">
            {username ? `user: ${username} · ` : ""}{expiry ? `exp: ${expiry}` : ""}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading}>
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {active && (
        <div className="mb-3">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="min-w-0">
              <p className="font-semibold truncate">{active.name}</p>
              <p className="text-[11px] text-muted-foreground">
                {playing === "loading" && <><Loader2 className="w-3 h-3 inline animate-spin mr-1" />{t("লোড হচ্ছে", "Loading")}</>}
                {playing === "playing" && t("চলছে", "Playing")}
                {playing === "error" && t("ব্যর্থ", "Failed")}
              </p>
            </div>
            <div className="flex gap-1">
              <Button variant="outline" size="sm" onClick={() => setUnblock(v => !v)}>
                {unblock ? <Wifi className="w-3.5 h-3.5 mr-1" /> : <WifiOff className="w-3.5 h-3.5 mr-1" />}
                {unblock ? t("প্রক্সি অন", "Proxy on") : t("প্রক্সি অফ", "Proxy off")}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => { setActive(null); hlsRef.current?.destroy(); }}>×</Button>
            </div>
          </div>
          <video ref={videoRef} controls autoPlay playsInline className="w-full aspect-video bg-black rounded-xl" />
        </div>
      )}

      {/* Kind tabs */}
      {!loading && !error && (
        <div className="flex gap-1.5 mb-3">
          {([
            { k: "live" as Kind, icon: Tv, label: t("লাইভ", "Live"), n: kindCounts.live },
            { k: "movie" as Kind, icon: Film, label: t("মুভি", "Movies"), n: kindCounts.movie },
            { k: "series" as Kind, icon: Clapperboard, label: t("সিরিজ", "Series"), n: kindCounts.series },
          ]).map(({ k, icon: Icon, label, n }) => (
            <button
              key={k}
              onClick={() => { setKind(k); setGroup("all"); }}
              className={`flex-1 px-2 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 border ${kind === k ? "bg-primary text-primary-foreground border-primary" : "border-border bg-card"}`}
            >
              <Icon className="w-3.5 h-3.5" /> {label}
              <span className={`text-[10px] px-1 rounded ${kind === k ? "bg-white/25" : "bg-muted"}`}>{n}</span>
            </button>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2 mb-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={e => setQ(e.target.value)} placeholder={t("খুঁজুন", "Search")} className="pl-8 h-9 rounded-xl" />
        </div>
      </div>

      {groups.length > 1 && !loading && !error && (
        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide -mx-1 px-1 pb-2 mb-2">
          {groups.map(g => (
            <button key={g} onClick={() => setGroup(g)}
              className={`px-2.5 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap border ${group === g ? "bg-primary text-primary-foreground border-primary" : "border-border bg-card"}`}>
              {g === "all" ? t("সব", "All") : g}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="py-10 grid place-items-center text-muted-foreground">
          <Loader2 className="w-6 h-6 animate-spin mb-2" />
          <p className="text-sm">{t("প্লেলিস্ট লোড হচ্ছে…", "Loading playlist…")}</p>
        </div>
      ) : error ? (
        <Card className="p-4 border-rose-500/30 bg-rose-500/5 text-sm">
          <p className="font-semibold text-rose-500">{t("প্লেলিস্ট লোড ব্যর্থ", "Playlist load failed")}</p>
          <p className="text-xs text-muted-foreground mt-1">{error}</p>
          <p className="text-[11px] text-muted-foreground mt-2">
            {t("সার্ভার অফলাইন থাকতে পারে অথবা অ্যাকাউন্ট এক্সপায়ার্ড।", "Server may be offline or account expired.")}
          </p>
        </Card>
      ) : (
        <>
          <p className="text-[11px] text-muted-foreground mb-2">{Math.min(visible, filtered.length)} / {filtered.length} {t("দেখানো হচ্ছে", "shown")}</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-[60vh] overflow-y-auto">
            {filtered.slice(0, visible).map(c => (
              <button key={c.id} onClick={() => play(c)}
                className={`text-left p-2.5 rounded-xl border transition-smooth hover:border-primary hover:shadow-elegant ${active?.id === c.id ? "border-primary bg-primary/5" : "border-border bg-card"}`}>
                <div className="flex items-center gap-2">
                  {c.logo ? (
                    <img src={c.logo} alt="" className="w-8 h-8 rounded object-contain bg-muted shrink-0" onError={(e) => ((e.currentTarget.style.display = "none"))} />
                  ) : (
                    <div className="w-8 h-8 rounded bg-muted grid place-items-center shrink-0"><Tv className="w-4 h-4 text-muted-foreground" /></div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-xs leading-tight line-clamp-2">{c.name}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{c.group}</p>
                  </div>
                  <Play className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                </div>
              </button>
            ))}
          </div>
          {visible < filtered.length && (
            <div className="text-center mt-3">
              <Button variant="outline" size="sm" onClick={() => setVisible(v => v + 120)}>
                {t("আরো দেখাও", "Show more")} (+120)
              </Button>
            </div>
          )}
        </>
      )}
    </Card>
  );
};

export default XtreamChannels;
