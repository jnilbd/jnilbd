import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Train as TrainIcon, ArrowDownRight, ArrowUpRight, Clock } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

type TrainRow = {
  name: string;
  number: string;
  from: string;
  to: string;
  depart: string;
  arrive: string;
  off: string;
};

type Props = { trains: TrainRow[]; stations: string[] };

// Bangladesh time helper
function nowBD() {
  const d = new Date();
  const utcMs = d.getTime() + d.getTimezoneOffset() * 60_000;
  return new Date(utcMs + 6 * 3600_000);
}
const dayNameBD = () => nowBD().toLocaleDateString("en-US", { weekday: "long" });
const hhmmBD = () => nowBD().toTimeString().slice(0, 5);
function toMin(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}
function fmtDiff(mins: number, isBn: boolean) {
  const abs = Math.abs(mins);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  const str = h ? `${h}${isBn ? "ঘ" : "h"} ${m}${isBn ? "মি" : "m"}` : `${m}${isBn ? " মিনিট" : " min"}`;
  return str;
}

export default function StationDisplayBoard({ trains, stations }: Props) {
  const { language } = useLanguage();
  const isBn = language === "bn";
  const [station, setStation] = useState("Dhaka (Kamalapur)");
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 30_000);
    return () => clearInterval(id);
  }, []);

  const { departures, arrivals, off } = useMemo(() => {
    const today = dayNameBD();
    const nowMin = toMin(hhmmBD());

    const dep = trains
      .filter((t) => t.from === station && t.off !== today)
      .map((t) => ({ ...t, diff: toMin(t.depart) - nowMin }))
      .map((t) => ({ ...t, diff: t.diff < -180 ? t.diff + 1440 : t.diff })) // wrap past 3am
      .sort((a, b) => a.diff - b.diff)
      .slice(0, 12);

    const arr = trains
      .filter((t) => t.to === station && t.off !== today)
      .map((t) => ({ ...t, diff: toMin(t.arrive) - nowMin }))
      .map((t) => ({ ...t, diff: t.diff < -180 ? t.diff + 1440 : t.diff }))
      .sort((a, b) => a.diff - b.diff)
      .slice(0, 12);

    const offToday = trains.filter((t) => (t.from === station || t.to === station) && t.off === today);
    return { departures: dep, arrivals: arr, off: offToday };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [station, trains, tick]);

  const statusFor = (diff: number) => {
    if (diff <= -10) return { label: isBn ? "ছেড়ে গেছে" : "Departed", color: "bg-muted text-muted-foreground" };
    if (diff <= 0) return { label: isBn ? "এইমাত্র" : "Now", color: "bg-destructive text-destructive-foreground animate-pulse" };
    if (diff <= 15) return { label: isBn ? "বোর্ডিং" : "Boarding", color: "bg-primary text-primary-foreground animate-pulse" };
    if (diff <= 60) return { label: isBn ? "শীঘ্রই" : "Soon", color: "bg-orange-500 text-white" };
    return { label: isBn ? "নির্ধারিত" : "Scheduled", color: "bg-secondary text-secondary-foreground" };
  };

  return (
    <div className="space-y-4">
      <Card className="p-4 bg-gradient-to-br from-slate-900 to-slate-800 text-white border-slate-700">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
          <div className="flex items-center gap-2">
            <TrainIcon className="h-5 w-5 text-amber-400" />
            <h3 className="font-bold text-lg">{isBn ? "স্টেশন ডিসপ্লে বোর্ড" : "Station Display Board"}</h3>
          </div>
          <div className="flex items-center gap-2 text-sm font-mono">
            <Clock className="h-4 w-4 text-amber-400" />
            <span>{hhmmBD()} BD · {dayNameBD()}</span>
          </div>
        </div>
        <select
          value={station}
          onChange={(e) => setStation(e.target.value)}
          className="w-full h-10 rounded-md bg-slate-700 border border-slate-600 text-white px-3 text-sm"
        >
          {stations.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <p className="text-[11px] text-slate-400 mt-2">
          {isBn
            ? "তথ্য সরকারি BR টাইম-টেবিল থেকে। প্ল্যাটফর্ম নম্বর BR পাবলিক API তে নেই — স্টেশনের অফিসিয়াল অ্যানাউন্সমেন্ট দেখুন। ৩০ সেকেন্ডে অটো-রিফ্রেশ।"
            : "Data from official BR timetable. Platform numbers aren't in BR's public API — confirm on-station. Auto-refresh every 30s."}
        </p>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Departures */}
        <Card className="overflow-hidden">
          <div className="bg-primary text-primary-foreground p-3 flex items-center gap-2">
            <ArrowUpRight className="h-4 w-4" />
            <h4 className="font-bold text-sm">{isBn ? "ছেড়ে যাওয়া (DEPARTURES)" : "DEPARTURES"}</h4>
          </div>
          <div className="divide-y">
            {departures.length === 0 && (
              <p className="p-4 text-sm text-muted-foreground">{isBn ? "আজ কোনো ট্রেন নেই" : "No trains today"}</p>
            )}
            {departures.map((t) => {
              const s = statusFor(t.diff);
              return (
                <div key={t.number + "d"} className="p-3 flex items-center justify-between gap-2 hover:bg-accent">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-base font-bold text-primary">{t.depart}</span>
                      <span className="font-semibold text-sm truncate">{t.name}</span>
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      #{t.number.split("/")[0]} → {t.to} · {isBn ? "প্ল্যাটফর্ম" : "Platform"} —
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <Badge className={`text-[10px] ${s.color}`}>{s.label}</Badge>
                    {t.diff > 0 && t.diff < 600 && (
                      <div className="text-[10px] text-muted-foreground mt-1">{fmtDiff(t.diff, isBn)}</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Arrivals */}
        <Card className="overflow-hidden">
          <div className="bg-green-700 text-white p-3 flex items-center gap-2">
            <ArrowDownRight className="h-4 w-4" />
            <h4 className="font-bold text-sm">{isBn ? "আসছে (ARRIVALS)" : "ARRIVALS"}</h4>
          </div>
          <div className="divide-y">
            {arrivals.length === 0 && (
              <p className="p-4 text-sm text-muted-foreground">{isBn ? "আজ কোনো ট্রেন নেই" : "No trains today"}</p>
            )}
            {arrivals.map((t) => {
              const s = statusFor(t.diff);
              return (
                <div key={t.number + "a"} className="p-3 flex items-center justify-between gap-2 hover:bg-accent">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-base font-bold text-green-700">{t.arrive}</span>
                      <span className="font-semibold text-sm truncate">{t.name}</span>
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      #{t.number.split("/")[0]} ← {t.from} · {isBn ? "প্ল্যাটফর্ম" : "Platform"} —
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <Badge className={`text-[10px] ${s.color}`}>{s.label}</Badge>
                    {t.diff > 0 && t.diff < 600 && (
                      <div className="text-[10px] text-muted-foreground mt-1">{fmtDiff(t.diff, isBn)}</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {off.length > 0 && (
        <Card className="p-3 bg-muted/50">
          <p className="text-xs text-muted-foreground">
            <strong>{isBn ? "আজ বন্ধ:" : "Off today:"}</strong>{" "}
            {off.map((t) => t.name).join(", ")}
          </p>
        </Card>
      )}
    </div>
  );
}
