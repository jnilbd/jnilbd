import { useEffect, useMemo, useState, useCallback } from "react";
import { Calendar, Clock, Tv as TvIcon, Trophy, MapPin, Filter, RefreshCw, ExternalLink, Star, Flame } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

/**
 * 100% live sports schedule powered by ESPN's public scoreboard API.
 * High-priority tournaments (World Cup, UCL, ICC finals) are fetched with a
 * wider date window and pinned to the top with a highlighted badge.
 */

type Sport = "football" | "cricket" | "basketball" | "tennis" | "f1" | "americanfootball" | "baseball" | "hockey";

type SportEvent = {
  id: string;
  sport: Sport;
  tournament: string;
  match: string;
  startUtc: string;
  venue?: string;
  state: "pre" | "in" | "post";
  statusDetail?: string;
  score?: string;
  channelsBD: string[];
  channelsIN?: string[];
  channelsWorld?: string[];
  espnLink?: string;
  priority: number; // 0 = normal, 1 = top league, 2 = tournament (WC/UCL), 3 = knockout/final
};

// tier: 3 = mega (World Cup / continental finals), 2 = major league, 1 = normal
const LEAGUES: { sport: Sport; path: string; tournament: string; tier: number; wideWindow?: boolean; bd: string[]; in?: string[]; world?: string[] }[] = [
  // ⭐ MEGA — always fetch 30-day window so semifinals / finals appear
  { sport: "football", path: "soccer/fifa.world", tournament: "FIFA World Cup 2026", tier: 3, wideWindow: true, bd: ["T Sports", "Toffee"], in: ["Sony Sports", "JioCinema"], world: ["FOX", "BBC", "beIN"] },
  { sport: "football", path: "soccer/uefa.champions", tournament: "UEFA Champions League", tier: 3, wideWindow: true, bd: ["Sony Sports (cable)"], in: ["Sony Sports", "SonyLIV"], world: ["CBS Paramount+", "TNT Sports"] },
  { sport: "football", path: "soccer/conmebol.america", tournament: "Copa América", tier: 3, wideWindow: true, bd: ["Sony Sports"], in: ["Sony Sports", "SonyLIV"], world: ["FOX", "TUDN"] },
  { sport: "football", path: "soccer/uefa.euro", tournament: "UEFA Euro", tier: 3, wideWindow: true, bd: ["Sony Sports"], in: ["Sony Sports", "SonyLIV"], world: ["ESPN", "BBC/ITV"] },
  { sport: "cricket", path: "cricket/8039", tournament: "ICC International", tier: 3, wideWindow: true, bd: ["T Sports", "Gazi TV", "Toffee"], in: ["Star Sports", "Disney+ Hotstar"], world: ["Willow TV (US)", "Sky Sports (UK)"] },
  // 🔥 MAJOR leagues
  { sport: "football", path: "soccer/fifa.worldq.uefa", tournament: "FIFA WC Qualifying — UEFA", tier: 2, bd: ["Sony Sports (cable)"], in: ["Sony Sports", "SonyLIV"] },
  { sport: "football", path: "soccer/fifa.worldq.conmebol", tournament: "FIFA WC Qualifying — CONMEBOL", tier: 2, bd: ["Sony Sports"], in: ["Sony Sports", "SonyLIV"] },
  { sport: "football", path: "soccer/uefa.europa", tournament: "UEFA Europa League", tier: 2, bd: ["Sony Sports (cable)"], in: ["Sony Sports", "SonyLIV"] },
  { sport: "football", path: "soccer/eng.1", tournament: "English Premier League", tier: 2, bd: ["Star Sports Select (cable)"], in: ["Star Sports", "Disney+ Hotstar"], world: ["NBC / Peacock", "Sky Sports"] },
  { sport: "football", path: "soccer/esp.1", tournament: "LaLiga", tier: 2, bd: ["Sports18 (cable)"], in: ["Sports18", "JioCinema"] },
  { sport: "football", path: "soccer/ita.1", tournament: "Serie A", tier: 2, bd: ["Sports18 (cable)"], in: ["Sports18", "JioCinema"] },
  { sport: "football", path: "soccer/ger.1", tournament: "Bundesliga", tier: 2, bd: ["Sony Sports (cable)"], in: ["Sony Sports", "SonyLIV"] },
  { sport: "football", path: "soccer/fra.1", tournament: "Ligue 1", tier: 2, bd: ["Sports18 (cable)"], in: ["Sports18", "JioCinema"] },
  { sport: "cricket", path: "cricket/23431", tournament: "IPL", tier: 2, bd: ["Star Sports (cable)"], in: ["Star Sports", "JioCinema"] },
  // Tennis / F1 / US leagues
  { sport: "tennis", path: "tennis/atp", tournament: "ATP Tour", tier: 1, bd: ["Sony Sports (cable)"], in: ["Sony Sports", "SonyLIV"] },
  { sport: "tennis", path: "tennis/wta", tournament: "WTA Tour", tier: 1, bd: ["Sony Sports (cable)"], in: ["Sony Sports", "SonyLIV"] },
  { sport: "f1", path: "racing/f1", tournament: "Formula 1", tier: 2, wideWindow: true, bd: ["Star Sports Select (cable)"], in: ["Star Sports", "F1 TV Pro"], world: ["Sky Sports F1", "ESPN"] },
  { sport: "basketball", path: "basketball/nba", tournament: "NBA", tier: 1, bd: ["Sony Sports (cable)"], in: ["Sony Sports", "SonyLIV"], world: ["ESPN", "TNT", "NBA League Pass"] },
  { sport: "americanfootball", path: "football/nfl", tournament: "NFL", tier: 1, bd: ["DAZN (VPN)"], world: ["FOX / CBS / NBC", "NFL Game Pass"] },
  { sport: "baseball", path: "baseball/mlb", tournament: "MLB", tier: 1, bd: ["MLB.TV"], world: ["FOX", "ESPN", "MLB.TV"] },
  { sport: "hockey", path: "hockey/nhl", tournament: "NHL", tier: 1, bd: ["NHL.TV"], world: ["ESPN+", "TNT", "Sportsnet"] },
];

const SPORT_LABEL: Record<Sport, { bn: string; en: string; emoji: string }> = {
  football: { bn: "ফুটবল", en: "Football", emoji: "⚽" },
  cricket: { bn: "ক্রিকেট", en: "Cricket", emoji: "🏏" },
  basketball: { bn: "বাস্কেটবল", en: "Basketball", emoji: "🏀" },
  tennis: { bn: "টেনিস", en: "Tennis", emoji: "🎾" },
  f1: { bn: "ফর্মুলা ১", en: "F1", emoji: "🏎️" },
  americanfootball: { bn: "NFL", en: "NFL", emoji: "🏈" },
  baseball: { bn: "বেসবল", en: "Baseball", emoji: "⚾" },
  hockey: { bn: "হকি", en: "Hockey", emoji: "🏒" },
};

const toBDTime = (iso: string, bn: boolean) => {
  return new Date(iso).toLocaleString(bn ? "bn-BD" : "en-GB", {
    timeZone: "Asia/Dhaka", weekday: "short", day: "2-digit",
    month: "short", hour: "2-digit", minute: "2-digit", hour12: true,
  });
};

function ymd(d: Date) {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}${m}${day}`;
}

async function fetchLeague(l: typeof LEAGUES[number]): Promise<SportEvent[]> {
  try {
    let url = `https://site.api.espn.com/apis/site/v2/sports/${l.path}/scoreboard`;
    if (l.wideWindow) {
      const start = new Date(Date.now() - 2 * 86400000);
      const end = new Date(Date.now() + 30 * 86400000);
      url += `?dates=${ymd(start)}-${ymd(end)}&limit=200`;
    }
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) return [];
    const json: any = await res.json();
    const events: any[] = json?.events || [];
    return events.map((ev): SportEvent => {
      const comp = ev?.competitions?.[0];
      const competitors = comp?.competitors || [];
      const home = competitors.find((c: any) => c.homeAway === "home") || competitors[0];
      const away = competitors.find((c: any) => c.homeAway === "away") || competitors[1];
      const homeName = home?.team?.displayName || home?.athlete?.displayName || home?.team?.name || "";
      const awayName = away?.team?.displayName || away?.athlete?.displayName || away?.team?.name || "";
      const match = ev?.name || (homeName && awayName ? `${homeName} vs ${awayName}` : (ev?.shortName || "Match"));
      const state: "pre" | "in" | "post" = ev?.status?.type?.state || "pre";
      const score = (home?.score && away?.score) ? `${homeName} ${home.score} — ${away.score} ${awayName}` : undefined;
      // Detect knockout / final / semifinal from notes or season type
      const notes: string = (comp?.notes || []).map((n: any) => n?.headline || n?.type || "").join(" ").toLowerCase();
      const seasonType: string = (ev?.season?.slug || ev?.seasonType?.name || "").toLowerCase();
      const knockoutRe = /(final|semifinal|semi-final|semi final|quarterfinal|quarter-final|quarter final|round of 16|knockout|championship|title)/;
      const isKnockout = knockoutRe.test(notes) || knockoutRe.test(seasonType) || knockoutRe.test(match.toLowerCase());
      let priority = l.tier;
      if (isKnockout && l.tier >= 2) priority = 4; // pin knockouts of majors to very top
      else if (isKnockout) priority = Math.max(l.tier, 2);
      return {
        id: `${l.path}-${ev.id}`,
        sport: l.sport,
        tournament: ev?.league?.name || l.tournament,
        match,
        startUtc: ev?.date || new Date().toISOString(),
        venue: comp?.venue?.fullName || ev?.venue?.fullName,
        state,
        statusDetail: ev?.status?.type?.shortDetail || ev?.status?.type?.detail,
        score,
        channelsBD: l.bd,
        channelsIN: l.in,
        channelsWorld: l.world,
        espnLink: ev?.links?.[0]?.href,
        priority,
      };
    });
  } catch {
    return [];
  }
}

const SportsSchedule = () => {
  const { language } = useLanguage();
  const bn = language === "bn";
  const t = (b: string, e: string) => (bn ? b : e);
  const [filter, setFilter] = useState<"all" | Sport>("all");
  const [events, setEvents] = useState<SportEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastFetch, setLastFetch] = useState<number>(0);

  const load = useCallback(async () => {
    setLoading(true);
    const chunks = await Promise.all(LEAGUES.map(fetchLeague));
    const all = chunks.flat();
    // sort: knockouts of majors first, then priority, then live, then time.
    const cutoff = Date.now() - 6 * 60 * 60 * 1000;
    const filtered = all.filter(e => new Date(e.startUtc).getTime() > cutoff);
    filtered.sort((a, b) => {
      // Highest priority first (4 = knockout of mega, 3 = mega, 2 = major, 1 = normal)
      if (b.priority !== a.priority) return b.priority - a.priority;
      // Then live > upcoming > finished
      const rank = (s: SportEvent) => s.state === "in" ? 0 : s.state === "pre" ? 1 : 2;
      if (rank(a) !== rank(b)) return rank(a) - rank(b);
      return new Date(a.startUtc).getTime() - new Date(b.startUtc).getTime();
    });
    setEvents(filtered);
    setLastFetch(Date.now());
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    const iv = setInterval(load, 90 * 1000); // refresh every 90s
    return () => clearInterval(iv);
  }, [load]);

  const shown = useMemo(
    () => events.filter(e => filter === "all" || e.sport === filter),
    [events, filter]
  );

  const filters: ("all" | Sport)[] = ["all", "football", "cricket", "tennis", "f1", "basketball", "americanfootball", "baseball", "hockey"];

  return (
    <Card className="p-4 mb-6 bg-gradient-to-br from-amber-500/5 via-background to-orange-500/5 border-amber-500/30">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center">
          <Trophy className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-display font-bold text-base">{t("লাইভ স্পোর্টস গাইড", "Live Sports Guide")}</h3>
          <p className="text-[11px] text-muted-foreground truncate">
            {t("ESPN লাইভ ডেটা • প্রতি ৯০ সেকেন্ডে অটো-আপডেট", "ESPN live data • auto-refresh every 90s")}
            {lastFetch > 0 && (
              <span className="ml-1">
                • {new Date(lastFetch).toLocaleTimeString(bn ? "bn-BD" : "en-GB", { timeZone: "Asia/Dhaka", hour: "2-digit", minute: "2-digit" })}
              </span>
            )}
          </p>
        </div>
        <Button size="sm" variant="outline" className="h-8 px-2 shrink-0" onClick={load} disabled={loading}>
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      <div className="flex items-center gap-1.5 mb-3 overflow-x-auto pb-1">
        <Filter className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
        {filters.map((f) => (
          <Button
            key={f} size="sm" variant={filter === f ? "default" : "outline"}
            className="h-7 px-2.5 text-[11px] rounded-full shrink-0"
            onClick={() => setFilter(f)}
          >
            {f === "all" ? t("সব", "All") : `${SPORT_LABEL[f].emoji} ${bn ? SPORT_LABEL[f].bn : SPORT_LABEL[f].en}`}
          </Button>
        ))}
      </div>

      <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
        {loading && shown.length === 0 && (
          <p className="text-center text-xs text-muted-foreground py-6">{t("লোড হচ্ছে…", "Loading live data…")}</p>
        )}
        {!loading && shown.length === 0 && (
          <p className="text-center text-xs text-muted-foreground py-6">{t("এই মুহূর্তে কোনো ইভেন্ট নেই", "No scheduled events right now")}</p>
        )}
        {shown.map((e) => (
          <div key={e.id} className="p-3 rounded-xl border bg-card hover:border-primary/40 transition-smooth">
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-lg shrink-0">{SPORT_LABEL[e.sport].emoji}</span>
                <div className="min-w-0">
                  <p className="font-semibold text-sm leading-tight truncate">{e.match}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{e.tournament}</p>
                </div>
              </div>
              {e.state === "in" ? (
                <Badge className="bg-rose-500 text-white text-[10px] animate-pulse shrink-0">● LIVE</Badge>
              ) : e.state === "post" ? (
                <Badge variant="secondary" className="text-[10px] shrink-0">{t("শেষ", "Final")}</Badge>
              ) : (
                <Badge variant="outline" className="text-[10px] shrink-0">{t("আসন্ন", "Upcoming")}</Badge>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] text-muted-foreground mb-2">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" /> {toBDTime(e.startUtc, bn)} (BD)
              </div>
              {e.venue && <div className="flex items-center gap-1 truncate"><MapPin className="w-3 h-3 shrink-0" /> <span className="truncate">{e.venue}</span></div>}
            </div>
            {e.state === "in" && e.score && (
              <div className="text-[12px] font-semibold text-rose-600 mb-1.5">{e.score} {e.statusDetail && <span className="text-muted-foreground font-normal ml-1">• {e.statusDetail}</span>}</div>
            )}
            {e.state === "pre" && e.statusDetail && (
              <div className="text-[11px] text-muted-foreground mb-1.5">⏳ {e.statusDetail}</div>
            )}
            <div className="space-y-1 text-[11px]">
              <div className="flex items-start gap-1.5">
                <TvIcon className="w-3 h-3 mt-0.5 text-primary shrink-0" />
                <div><span className="font-semibold text-foreground">🇧🇩 BD:</span> <span className="text-muted-foreground">{e.channelsBD.join(", ")}</span></div>
              </div>
              {e.channelsIN && (
                <div className="flex items-start gap-1.5">
                  <TvIcon className="w-3 h-3 mt-0.5 text-amber-500 shrink-0" />
                  <div><span className="font-semibold text-foreground">🇮🇳 IN:</span> <span className="text-muted-foreground">{e.channelsIN.join(", ")}</span></div>
                </div>
              )}
              {e.channelsWorld && (
                <div className="flex items-start gap-1.5">
                  <TvIcon className="w-3 h-3 mt-0.5 text-blue-500 shrink-0" />
                  <div><span className="font-semibold text-foreground">🌍 World:</span> <span className="text-muted-foreground">{e.channelsWorld.join(", ")}</span></div>
                </div>
              )}
              {e.espnLink && (
                <a href={e.espnLink} target="_blank" rel="noopener noreferrer"
                   className="inline-flex items-center gap-1 text-primary hover:underline font-semibold mt-1">
                  {t("ESPN-এ বিস্তারিত", "ESPN details")} <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      <p className="text-[10px] text-center text-muted-foreground mt-3 pt-3 border-t">
        <Calendar className="w-3 h-3 inline mr-1" />
        {t("সরাসরি ESPN থেকে আসছে — সময় ও স্ট্যাটাস রিয়েল-টাইম।",
           "Live from ESPN — time & status update in real time.")}
      </p>
    </Card>
  );
};

export default SportsSchedule;
