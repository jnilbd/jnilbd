import { useEffect, useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Activity, RefreshCw, Trophy, Loader2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

// Free no-key endpoints (community/unofficial). Each one is wrapped in try/catch.
// Cricket: scorebat doesn't cover cricket — use a free aggregator mirror.
// Football: scorebat video API (free, no key).
const FOOTBALL_API = "https://www.scorebat.com/video-api/v3/feed";
// Cricket free mirror (public). If down we fall back to a static placeholder.
const CRICKET_APIS = [
  "https://api.cricapi.com/v1/currentMatches?apikey=public&offset=0",
  "https://cricket-live-data.vercel.app/api/live",
];

type Sport = "cricket" | "football";

type Score = {
  id: string;
  sport: Sport;
  title: string;
  teamA: string;
  teamB: string;
  scoreA?: string;
  scoreB?: string;
  status: string;
  competition?: string;
  isBdIn?: boolean;
};

const BD_IN_KEYWORDS = ["bangladesh", "india", "bd ", "ind ", "kolkata", "mumbai", "chennai", "delhi", "dhaka"];

function isBdIn(text: string) {
  const t = text.toLowerCase();
  return BD_IN_KEYWORDS.some(k => t.includes(k));
}

const LiveScoreBoard = () => {
  const { language } = useLanguage();
  const t = (bn: string, en: string) => (language === "bn" ? bn : en);

  const [sport, setSport] = useState<Sport | "all">("all");
  const [scores, setScores] = useState<Score[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchCricket = async (): Promise<Score[]> => {
    for (const url of CRICKET_APIS) {
      try {
        const r = await fetch(url);
        if (!r.ok) continue;
        const j = await r.json();
        const items = j?.data || j?.matches || j || [];
        if (!Array.isArray(items)) continue;
        return items.slice(0, 20).map((m: any, i: number): Score => {
          const teams = m.teams || m.teamInfo?.map((x: any) => x.name) || [m.teamA, m.teamB];
          const a = teams?.[0] || m.team1 || "—";
          const b = teams?.[1] || m.team2 || "—";
          const sa = m.score?.[0]?.r ? `${m.score[0].r}/${m.score[0].w} (${m.score[0].o})` : (m.scoreA || "");
          const sb = m.score?.[1]?.r ? `${m.score[1].r}/${m.score[1].w} (${m.score[1].o})` : (m.scoreB || "");
          const title = m.name || m.title || `${a} vs ${b}`;
          return {
            id: m.id || `cri-${i}`,
            sport: "cricket",
            title,
            teamA: a, teamB: b,
            scoreA: sa, scoreB: sb,
            status: m.status || m.matchStarted ? "Live" : (m.status || "Upcoming"),
            competition: m.matchType || m.series || "Cricket",
            isBdIn: isBdIn(`${a} ${b} ${title}`),
          };
        });
      } catch {}
    }
    return [];
  };

  const fetchFootball = async (): Promise<Score[]> => {
    try {
      const r = await fetch(FOOTBALL_API);
      if (!r.ok) return [];
      const j = await r.json();
      const items = j?.response || [];
      return items.slice(0, 25).map((m: any, i: number): Score => {
        const title = m.title || "";
        const [a, b] = title.split(/\s+vs\.?\s+|\s+-\s+/i);
        return {
          id: `foot-${i}-${m.matchviewUrl || title}`,
          sport: "football",
          title,
          teamA: (a || "").trim(),
          teamB: (b || "").trim(),
          status: m.date || "—",
          competition: m.competition || "Football",
          isBdIn: isBdIn(title + " " + (m.competition || "")),
        };
      });
    } catch { return []; }
  };

  const load = useCallback(async () => {
    setLoading(true);
    const [c, f] = await Promise.all([fetchCricket(), fetchFootball()]);
    // BD/IN first, then live first
    const all = [...c, ...f].sort((x, y) => {
      if (x.isBdIn !== y.isBdIn) return x.isBdIn ? -1 : 1;
      const lx = /live/i.test(x.status) ? 0 : 1;
      const ly = /live/i.test(y.status) ? 0 : 1;
      return lx - ly;
    });
    setScores(all);
    setLastUpdate(new Date());
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(load, 30000); // poll every 30s — lightweight
    return () => clearInterval(id);
  }, [load]);

  const filtered = sport === "all" ? scores : scores.filter(s => s.sport === sport);

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl gradient-bg-primary flex items-center justify-center text-white">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-display font-bold text-xl">{t("লাইভ স্কোর বোর্ড", "Live Score Board")}</h2>
            <p className="text-[11px] text-muted-foreground flex items-center gap-1">
              <Activity className="w-3 h-3" />
              {t("প্রতি ৩০ সেকেন্ডে আপডেট • লো-ডেটা মোড", "Updates every 30s • low-data mode")}
              {lastUpdate && ` • ${lastUpdate.toLocaleTimeString()}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <div className="inline-flex rounded-full bg-muted p-1">
            {(["all", "cricket", "football"] as const).map(s => (
              <button
                key={s}
                onClick={() => setSport(s)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize ${sport === s ? "gradient-bg-primary text-white" : ""}`}
              >
                {s === "all" ? t("সব", "All") : s === "cricket" ? t("ক্রিকেট", "Cricket") : t("ফুটবল", "Football")}
              </button>
            ))}
          </div>
          <Button variant="ghost" size="icon" onClick={load} disabled={loading} aria-label="Refresh">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {loading && filtered.length === 0 && (
        <div className="flex items-center justify-center py-10 text-muted-foreground">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          {t("স্কোর লোড হচ্ছে...", "Loading scores...")}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <Card className="p-6 text-center text-muted-foreground text-sm">
          {t("এই মুহূর্তে কোনো লাইভ ম্যাচ পাওয়া যায়নি। কিছুক্ষণ পরে আবার চেষ্টা করুন।",
            "No live matches found right now. Please try again shortly.")}
        </Card>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map(s => (
          <Card key={s.id} className={`p-3 ${s.isBdIn ? "border-primary/50 shadow-glow" : ""}`}>
            <div className="flex items-center justify-between mb-2">
              <Badge variant={s.sport === "cricket" ? "default" : "secondary"} className="text-[10px]">
                {s.sport === "cricket" ? "🏏" : "⚽"} {s.competition}
              </Badge>
              {s.isBdIn && <Badge variant="outline" className="text-[10px]">BD/IN</Badge>}
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-sm truncate">{s.teamA}</span>
                {s.scoreA && <span className="font-mono text-xs">{s.scoreA}</span>}
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-sm truncate">{s.teamB}</span>
                {s.scoreB && <span className="font-mono text-xs">{s.scoreB}</span>}
              </div>
            </div>
            <div className="mt-2 pt-2 border-t flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground truncate">{s.status}</span>
              {/live/i.test(s.status) && (
                <span className="inline-flex items-center gap-1 text-[10px] text-rose-500 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" /> LIVE
                </span>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default LiveScoreBoard;
