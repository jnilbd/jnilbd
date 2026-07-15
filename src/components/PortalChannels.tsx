import { useEffect, useMemo, useRef, useState } from "react";
import Hls from "hls.js";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Play, RefreshCw, Search, Tv, Wifi, WifiOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";

type PCh = { id: string; name: string; logo: string | null; group: string; cmd: string };

const PROXY_BASE = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stream-proxy`;
const proxify = (u: string) => `${PROXY_BASE}?u=${encodeURIComponent(u)}`;

const PortalChannels = ({
  portal, mac, label,
}: { portal: string; mac: string; label: string }) => {
  const { language } = useLanguage();
  const t = (bn: string, en: string) => (language === "bn" ? bn : en);

  const [channels, setChannels] = useState<PCh[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [group, setGroup] = useState<string>("all");
  const [active, setActive] = useState<PCh | null>(null);
  const [playing, setPlaying] = useState<"idle" | "loading" | "playing" | "error">("idle");
  const [unblock, setUnblock] = useState(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/mag-portal?action=list&portal=${encodeURIComponent(portal)}&mac=${encodeURIComponent(mac)}`;
      const r = await fetch(url);
      const j = await r.json();
      if (!r.ok) throw new Error(j?.error || "load failed");
      setChannels(j.channels || []);
    } catch (e: any) {
      setError(e?.message || "load failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [portal, mac]);

  const groups = useMemo(() => {
    const s = new Set<string>();
    channels.forEach(c => s.add(c.group));
    return ["all", ...Array.from(s).sort()];
  }, [channels]);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return channels.filter(c =>
      (group === "all" || c.group === group) &&
      (!qq || c.name.toLowerCase().includes(qq) || c.group.toLowerCase().includes(qq))
    );
  }, [channels, q, group]);

  const play = async (c: PCh) => {
    setActive(c); setPlaying("loading");
    try {
      const rurl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/mag-portal?action=resolve&portal=${encodeURIComponent(portal)}&mac=${encodeURIComponent(mac)}&cmd=${encodeURIComponent(c.cmd)}`;
      const r = await fetch(rurl);
      const j = await r.json();
      if (!r.ok || !j?.url) throw new Error(j?.error || "resolve failed");
      const streamUrl = unblock ? proxify(j.url) : j.url;
      const video = videoRef.current;
      if (!video) return;
      hlsRef.current?.destroy(); hlsRef.current = null;
      if (Hls.isSupported() && (/\.m3u8/i.test(j.url) || unblock)) {
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
      toast.error(e?.message || "resolve failed");
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
          <p className="text-[11px] text-muted-foreground truncate">{portal} · MAC {mac}</p>
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

      <div className="flex items-center gap-2 mb-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={e => setQ(e.target.value)} placeholder={t("চ্যানেল খুঁজুন", "Search channels")} className="pl-8 h-9 rounded-xl" />
        </div>
      </div>

      {groups.length > 1 && (
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
          <p className="text-sm">{t("চ্যানেল লোড হচ্ছে…", "Loading channels…")}</p>
        </div>
      ) : error ? (
        <Card className="p-4 border-rose-500/30 bg-rose-500/5 text-sm">
          <p className="font-semibold text-rose-500">{t("পোর্টাল লোড ব্যর্থ", "Portal load failed")}</p>
          <p className="text-xs text-muted-foreground mt-1">{error}</p>
          <p className="text-[11px] text-muted-foreground mt-2">
            {t("MAC ভুল/এক্সপায়ার্ড হতে পারে অথবা পোর্টাল অফলাইন।", "MAC may be invalid/expired or the portal is offline.")}
          </p>
        </Card>
      ) : (
        <>
          <p className="text-[11px] text-muted-foreground mb-2">{filtered.length} / {channels.length} {t("চ্যানেল", "channels")}</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-[60vh] overflow-y-auto">
            {filtered.map(c => (
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
        </>
      )}
    </Card>
  );
};

export default PortalChannels;
