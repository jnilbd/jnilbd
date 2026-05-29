import { useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, RefreshCw, Train as TrainIcon, Radio, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";

// Fix Leaflet default icon paths (Vite bundling)
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const trainIcon = L.divIcon({
  className: "train-marker",
  html: `<div style="background:hsl(var(--primary));color:hsl(var(--primary-foreground));width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:16px;box-shadow:0 2px 8px rgba(0,0,0,.35);border:2px solid white">🚆</div>`,
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});

const liveIcon = L.divIcon({
  className: "train-marker-live",
  html: `<div style="background:#16a34a;color:white;width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:16px;box-shadow:0 0 0 4px rgba(22,163,74,.35);border:2px solid white">🛰️</div>`,
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});

type TrainState = {
  name: string;
  number: string;
  from: string;
  to: string;
  depart: string;
  arrive: string;
  status: string;
  coord: [number, number] | null;
  message?: string;
  progress?: number;
  nextStation?: string;
  lastStation?: string;
  minsToNext?: number;
  source?: string;
  narration?: string;
};

function FitBounds({ trains }: { trains: TrainState[] }) {
  const map = useMap();
  useEffect(() => {
    const coords = trains.filter((t) => t.coord).map((t) => t.coord as [number, number]);
    if (coords.length > 1) {
      map.fitBounds(L.latLngBounds(coords).pad(0.2));
    }
  }, [trains, map]);
  return null;
}

export default function LiveTrainMap() {
  const { language } = useLanguage();
  const isBn = language === "bn";
  const [trains, setTrains] = useState<TrainState[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<TrainState | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string>("");
  const [narration, setNarration] = useState<string>("");
  const [narrLoading, setNarrLoading] = useState(false);
  const intervalRef = useRef<number | null>(null);

  const load = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("train-tracker", {
        body: null,
        method: "GET",
      } as any);
      // invoke doesn't easily do GET with query, fallback to fetch
      let payload: any = data;
      if (!payload) {
        const url = `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co/functions/v1/train-tracker?lang=${language}`;
        const r = await fetch(url, {
          headers: { Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
        });
        payload = await r.json();
      }
      if (error) throw error;
      setTrains(payload.trains || []);
      setUpdatedAt(payload.bdTime || "");
      setError(null);
    } catch (e: any) {
      setError(e.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    intervalRef.current = window.setInterval(load, 30_000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  const askNarration = async (t: TrainState) => {
    setNarrLoading(true);
    setNarration("");
    try {
      const url = `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co/functions/v1/train-tracker?lang=${language}&train=${encodeURIComponent(t.number.split("/")[0])}`;
      const r = await fetch(url, {
        headers: { Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
      });
      const j = await r.json();
      setNarration(j.trains?.[0]?.narration || (isBn ? "AI ন্যারেশন এখন পাওয়া যায়নি।" : "AI narration unavailable."));
    } catch {
      setNarration(isBn ? "AI ন্যারেশন লোড ব্যর্থ।" : "Narration failed.");
    } finally {
      setNarrLoading(false);
    }
  };

  const activeTrains = useMemo(
    () => trains.filter((t) => t.coord && (t.status === "running" || t.status === "live" || t.status === "boarding")),
    [trains],
  );

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex items-center justify-between gap-2 flex-wrap mb-3">
          <div>
            <h3 className="font-bold text-lg flex items-center gap-2">
              <Radio className="h-5 w-5 text-primary animate-pulse" />
              {isBn ? "লাইভ ট্রেন ম্যাপ" : "Live Train Map"}
            </h3>
            <p className="text-xs text-muted-foreground">
              {isBn
                ? `${activeTrains.length}টি ট্রেন চলমান · BD সময় ${updatedAt} · প্রতি ৩০ সেকেন্ডে আপডেট`
                : `${activeTrains.length} active · BD time ${updatedAt} · auto-refresh 30s`}
            </p>
          </div>
          <Button onClick={load} variant="outline" size="sm" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          </Button>
        </div>

        {error && <p className="text-sm text-destructive mb-2">{error}</p>}

        <div className="h-[420px] rounded-lg overflow-hidden border">
          <MapContainer
            center={[23.685, 90.3563]}
            zoom={7}
            style={{ height: "100%", width: "100%" }}
            scrollWheelZoom
          >
            <TileLayer
              attribution='&copy; OpenStreetMap'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <FitBounds trains={activeTrains} />
            {activeTrains.map((t) => (
              <Marker
                key={t.number}
                position={t.coord!}
                icon={t.source === "brllt" || t.source === "br_portal" ? liveIcon : trainIcon}
                eventHandlers={{ click: () => { setSelected(t); setNarration(""); } }}
              >
                <Popup>
                  <div className="text-xs">
                    <div className="font-bold">{t.name}</div>
                    <div className="text-muted-foreground">#{t.number}</div>
                    <div>{t.from} → {t.to}</div>
                    <div className="mt-1">{t.message}</div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </Card>

      {/* Train list */}
      <Card className="p-4">
        <h4 className="font-semibold mb-3 flex items-center gap-2">
          <TrainIcon className="h-4 w-4" />
          {isBn ? "চলমান ট্রেন" : "Active Trains"}
        </h4>
        <div className="grid sm:grid-cols-2 gap-2 max-h-80 overflow-y-auto">
          {trains.map((t) => (
            <button
              key={t.number}
              onClick={() => { setSelected(t); setNarration(""); }}
              className={`text-left p-3 rounded-lg border hover:bg-accent transition-colors ${
                selected?.number === t.number ? "border-primary bg-accent" : ""
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">{t.name}</span>
                {t.source === "brllt" || t.source === "br_portal" ? (
                  <Badge variant="default" className="text-[10px]">LIVE GPS</Badge>
                ) : (
                  <Badge variant="secondary" className="text-[10px]">{t.status === "running" ? "EST" : t.status.toUpperCase()}</Badge>
                )}
              </div>
              <div className="text-xs text-muted-foreground">{t.from.split(" ")[0]} → {t.to} · {t.depart}</div>
              {t.message && <div className="text-xs mt-1">{t.message}</div>}
              {typeof t.progress === "number" && (
                <div className="h-1 bg-muted rounded mt-2 overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: `${Math.round(t.progress * 100)}%` }} />
                </div>
              )}
            </button>
          ))}
          {!trains.length && !loading && (
            <p className="text-sm text-muted-foreground col-span-2">{isBn ? "কোনো ট্রেন চলছে না।" : "No trains running."}</p>
          )}
        </div>
      </Card>

      {/* AI narration */}
      {selected && (
        <Card className="p-4 bg-primary/5 border-primary/20">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              {selected.name} — AI {isBn ? "আপডেট" : "Update"}
            </h4>
            <Button size="sm" variant="outline" onClick={() => askNarration(selected)} disabled={narrLoading}>
              {narrLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : (isBn ? "AI বলো" : "Ask AI")}
            </Button>
          </div>
          <p className="text-sm">{narration || selected.message || (isBn ? "AI ন্যারেশন এর জন্য বাটনে চাপুন।" : "Click button for AI narration.")}</p>
          <p className="text-[10px] text-muted-foreground mt-2">
            {selected.source === "brllt" || selected.source === "br_portal"
              ? (isBn ? "✓ লাইভ GPS ডেটা" : "✓ Live GPS data")
              : (isBn ? "⚡ সময়সূচী + AI অনুমান (±১৫–৩০ মিনিট নির্ভুলতা)" : "⚡ Schedule + AI estimate (±15–30 min accuracy)")}
          </p>
        </Card>
      )}
    </div>
  );
}
