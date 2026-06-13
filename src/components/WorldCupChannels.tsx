import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Trophy, Play, RefreshCw, CheckCircle2, XCircle, Loader2, Shield, ShieldCheck } from "lucide-react";
import { WORLD_CUP_CHANNELS, type WCChannel } from "@/data/worldCupChannels";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";

const PROXY_BASE = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stream-proxy`;
const proxify = (u: string) => `${PROXY_BASE}?u=${encodeURIComponent(u)}`;

/**
 * World Cup / Football channels with auto-failover + built-in
 * server-side proxy ("Unblock Mode") that routes streams through
 * an edge function to bypass CORS and many geo-blocks.
 */
const WorldCupChannels = () => {
  const { language } = useLanguage();
  const t = (bn: string, en: string) => (language === "bn" ? bn : en);

  const [active, setActive] = useState<WCChannel | null>(null);
  const [urlIndex, setUrlIndex] = useState(0);
  const [status, setStatus] = useState<"loading" | "playing" | "error">("loading");
  const [unblock, setUnblock] = useState<boolean>(() => {
    try { return localStorage.getItem("wc_unblock") === "1"; } catch { return false; }
  });
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);

  useEffect(() => {
    try { localStorage.setItem("wc_unblock", unblock ? "1" : "0"); } catch {}
  }, [unblock]);

  const tryUrl = (ch: WCChannel, idx: number) => {
    if (idx >= ch.urls.length) {
      setStatus("error");
      toast.error(t(
        `সব মিরর ব্যর্থ — ${ch.name} অফলাইন থাকতে পারে। Unblock Mode চালু করে আবার চেষ্টা করুন।`,
        `All mirrors failed — ${ch.name} may be offline. Try enabling Unblock Mode.`
      ));
      return;
    }
    setUrlIndex(idx);
    setStatus("loading");
    const raw = ch.urls[idx];
    const url = unblock ? proxify(raw) : raw;
    const video = videoRef.current;
    if (!video) return;

    hlsRef.current?.destroy();
    hlsRef.current = null;

    if (Hls.isSupported()) {
      const hls = new Hls({ enableWorker: true, manifestLoadingTimeOut: 10000, manifestLoadingMaxRetry: 1 });
      hls.loadSource(url);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setStatus("playing");
        video.play().catch(() => {});
      });
      hls.on(Hls.Events.ERROR, (_e, data) => {
        if (data.fatal) {
          hls.destroy();
          toast.message(t(
            `মিরর ${idx + 1} ব্যর্থ — পরের চেষ্টা...`,
            `Mirror ${idx + 1} failed — trying next...`
          ));
          tryUrl(ch, idx + 1);
        }
      });
      hlsRef.current = hls;
    } else {
      video.src = url;
      video.play().then(() => setStatus("playing")).catch(() => tryUrl(ch, idx + 1));
    }
  };

  useEffect(() => {
    if (active) tryUrl(active, 0);
    return () => { hlsRef.current?.destroy(); hlsRef.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, unblock]);

  return (
    <Card className="p-4 md:p-5 mb-6 bg-gradient-to-br from-amber-500/5 via-background to-emerald-500/5 border-amber-500/30">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-emerald-600 flex items-center justify-center text-white">
          <Trophy className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-display font-bold text-lg leading-tight">
            {t("ফিফা বিশ্বকাপ ২০২৬ — লাইভ চ্যানেল", "FIFA World Cup 2026 — Live Channels")}
          </h3>
          <p className="text-xs text-muted-foreground">
            {t("প্রতিটি চ্যানেলে একাধিক মিরর — একটি কাজ না করলে স্বয়ংক্রিয়ভাবে পরেরটি চালু হবে",
               "Each channel has multiple mirrors — if one fails, the next plays automatically")}
          </p>
        </div>
      </div>

      {active && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2 gap-2">
            <div className="min-w-0">
              <p className="font-semibold truncate">{active.name}</p>
              <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                {status === "loading" && <><Loader2 className="w-3 h-3 animate-spin" /> {t("লোড হচ্ছে", "Loading")} — mirror {urlIndex + 1}/{active.urls.length}</>}
                {status === "playing" && <><CheckCircle2 className="w-3 h-3 text-emerald-500" /> {t("চলছে", "Playing")} — mirror {urlIndex + 1}/{active.urls.length}</>}
                {status === "error" && <><XCircle className="w-3 h-3 text-rose-500" /> {t("সব মিরর ব্যর্থ", "All mirrors failed")}</>}
              </p>
            </div>
            <div className="flex gap-1">
              <Button variant="outline" size="sm" onClick={() => tryUrl(active, urlIndex + 1)} disabled={urlIndex + 1 >= active.urls.length}>
                <RefreshCw className="w-3.5 h-3.5 mr-1" /> {t("পরের মিরর", "Next mirror")}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setActive(null)}>×</Button>
            </div>
          </div>
          <video ref={videoRef} controls autoPlay playsInline className="w-full aspect-video bg-black rounded-xl" />
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {WORLD_CUP_CHANNELS.map((ch) => (
          <button
            key={ch.id}
            onClick={() => setActive(ch)}
            className={`text-left p-3 rounded-xl border transition-smooth hover:border-primary hover:shadow-elegant ${active?.id === ch.id ? "border-primary bg-primary/5" : "border-border bg-card"}`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-muted">{ch.country}</span>
              <Play className="w-3.5 h-3.5 ml-auto text-muted-foreground" />
            </div>
            <p className="font-semibold text-sm leading-tight line-clamp-2">{ch.name}</p>
            {ch.description && (
              <p className="text-[10px] text-muted-foreground mt-1 line-clamp-2">{ch.description}</p>
            )}
            <p className="text-[10px] text-primary mt-1 font-semibold">{ch.urls.length} {t("মিরর", "mirrors")}</p>
          </button>
        ))}
      </div>

      <p className="text-[11px] text-muted-foreground mt-3 text-center">
        {t("কিছু চ্যানেল জিও-ব্লকড হতে পারে। সবসময় কমপক্ষে ২-৩টি ভিন্ন চ্যানেল ট্রাই করুন।",
           "Some channels may be geo-blocked. Always try 2-3 different channels.")}
      </p>
    </Card>
  );
};

export default WorldCupChannels;
