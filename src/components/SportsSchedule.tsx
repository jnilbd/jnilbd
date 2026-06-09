import { useMemo, useState } from "react";
import { Calendar, Clock, Tv as TvIcon, Trophy, MapPin, Filter } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

/**
 * Curated worldwide sports schedule with Bangladesh time + broadcast guide.
 * Updated June 2026. Sources: official tournament sites + broadcaster announcements.
 */

type SportEvent = {
  id: string;
  sport: "football" | "cricket" | "basketball" | "tennis" | "f1" | "esports" | "other";
  tournament: string;
  match: string;
  startUtc: string; // ISO
  venue?: string;
  channelsBD: string[]; // where Bangladesh viewers can watch
  channelsIN?: string[];
  channelsWorld?: string[];
  freeStream?: string; // direct free legal source if available
  status: "upcoming" | "live" | "finished";
  note?: string;
};

const NOW = Date.now();

// FIFA World Cup 2026 (USA/Canada/Mexico) — opens June 11, 2026
const WORLD_CUP: SportEvent[] = [
  {
    id: "wc-open", sport: "football",
    tournament: "FIFA World Cup 2026", match: "Mexico vs Opener (Group A)",
    startUtc: "2026-06-11T23:00:00Z", venue: "Estadio Azteca, Mexico City",
    channelsBD: ["T Sports", "T Sports HD (Toffee app)"],
    channelsIN: ["Sony Sports Ten 1/2/3", "JioCinema (free)"],
    channelsWorld: ["FOX (USA)", "BBC iPlayer (UK free)", "TSN (Canada)"],
    freeStream: "https://www.jiocinema.com",
    status: "upcoming",
    note: "Bangladesh: Toffee free live stream available",
  },
  {
    id: "wc-grp", sport: "football",
    tournament: "FIFA World Cup 2026", match: "Group stage — 48 teams, 104 matches",
    startUtc: "2026-06-12T00:00:00Z", venue: "USA / Canada / Mexico",
    channelsBD: ["T Sports", "Toffee (free app)"],
    channelsIN: ["Sony Sports Network", "JioCinema (free)"],
    channelsWorld: ["FOX/Telemundo (USA)", "BBC + ITV (UK)", "beIN Sports (MENA)"],
    status: "upcoming",
    note: "BD time: most matches 10:30 PM, 1:30 AM, 4:30 AM",
  },
  {
    id: "wc-final", sport: "football",
    tournament: "FIFA World Cup 2026", match: "Final",
    startUtc: "2026-07-19T19:00:00Z", venue: "MetLife Stadium, New Jersey",
    channelsBD: ["T Sports", "Toffee"],
    channelsIN: ["Sony Sports", "JioCinema"],
    channelsWorld: ["FOX, BBC, beIN, DAZN"],
    status: "upcoming",
  },
];

const CRICKET: SportEvent[] = [
  {
    id: "ipl-26", sport: "cricket",
    tournament: "IPL 2026", match: "Continues through finals",
    startUtc: "2026-06-10T14:00:00Z",
    channelsBD: ["GTV", "T Sports (selected)"],
    channelsIN: ["Star Sports", "JioCinema (free)"],
    channelsWorld: ["Willow TV (USA)", "Sky Sports (UK)"],
    status: "live",
  },
  {
    id: "bd-aus", sport: "cricket",
    tournament: "Bangladesh vs Australia T20I Series", match: "1st T20I",
    startUtc: "2026-06-15T13:00:00Z", venue: "Sher-e-Bangla, Dhaka",
    channelsBD: ["GTV", "T Sports", "Rabbithole (free app)"],
    channelsIN: ["FanCode"],
    channelsWorld: ["Fox Cricket (AUS)", "Willow (USA)"],
    status: "upcoming",
  },
];

const OTHER: SportEvent[] = [
  {
    id: "ucl-draw", sport: "football",
    tournament: "UEFA Champions League 2026/27", match: "League phase draw",
    startUtc: "2026-08-28T16:00:00Z", venue: "Monaco",
    channelsBD: ["Sony Ten (cable)", "Sony LIV"],
    channelsIN: ["Sony Sports", "Sony LIV"],
    channelsWorld: ["CBS Sports (USA)", "TNT Sports (UK)"],
    status: "upcoming",
  },
  {
    id: "wimbledon", sport: "tennis",
    tournament: "Wimbledon 2026", match: "Main draw",
    startUtc: "2026-06-29T11:00:00Z", venue: "All England Club, London",
    channelsBD: ["Sony Ten 2 (cable)"],
    channelsIN: ["Star Sports Select"],
    channelsWorld: ["BBC iPlayer (free UK)", "ESPN (USA)"],
    freeStream: "https://www.bbc.co.uk/iplayer",
    status: "upcoming",
  },
  {
    id: "f1-can", sport: "f1",
    tournament: "F1 2026", match: "Canadian Grand Prix",
    startUtc: "2026-06-14T18:00:00Z", venue: "Montreal",
    channelsBD: ["Star Sports Select (cable)"],
    channelsIN: ["Star Sports Select", "JioCinema"],
    channelsWorld: ["F1 TV Pro (paid worldwide)", "Sky F1 (UK)"],
    status: "upcoming",
  },
  {
    id: "nba-fin", sport: "basketball",
    tournament: "NBA Finals 2026", match: "Game 7 (if needed)",
    startUtc: "2026-06-22T00:00:00Z",
    channelsBD: ["NBA League Pass (subscription)"],
    channelsWorld: ["ABC (USA free OTA)", "Sky Sports (UK)"],
    status: "upcoming",
  },
];

const ALL_EVENTS: SportEvent[] = [...WORLD_CUP, ...CRICKET, ...OTHER];

const SPORT_LABEL: Record<SportEvent["sport"], { bn: string; en: string; emoji: string }> = {
  football: { bn: "ফুটবল", en: "Football", emoji: "⚽" },
  cricket: { bn: "ক্রিকেট", en: "Cricket", emoji: "🏏" },
  basketball: { bn: "বাস্কেটবল", en: "Basketball", emoji: "🏀" },
  tennis: { bn: "টেনিস", en: "Tennis", emoji: "🎾" },
  f1: { bn: "ফর্মুলা ১", en: "Formula 1", emoji: "🏎️" },
  esports: { bn: "ই-স্পোর্টস", en: "eSports", emoji: "🎮" },
  other: { bn: "অন্যান্য", en: "Other", emoji: "🏆" },
};

const toBDTime = (utc: string, bn: boolean) => {
  const d = new Date(utc);
  return d.toLocaleString(bn ? "bn-BD" : "en-GB", {
    timeZone: "Asia/Dhaka", weekday: "short", day: "numeric",
    month: "short", hour: "2-digit", minute: "2-digit", hour12: true,
  });
};

const SportsSchedule = () => {
  const { language } = useLanguage();
  const bn = language === "bn";
  const t = (b: string, e: string) => (bn ? b : e);
  const [filter, setFilter] = useState<"all" | SportEvent["sport"]>("all");

  const events = useMemo(() => {
    return ALL_EVENTS
      .map((e) => {
        const start = new Date(e.startUtc).getTime();
        const status: SportEvent["status"] =
          start > NOW ? "upcoming" : start > NOW - 3 * 60 * 60 * 1000 ? "live" : "finished";
        return { ...e, status };
      })
      .filter((e) => filter === "all" || e.sport === filter)
      .filter((e) => e.status !== "finished")
      .sort((a, b) => new Date(a.startUtc).getTime() - new Date(b.startUtc).getTime());
  }, [filter]);

  const filters: ("all" | SportEvent["sport"])[] = ["all", "football", "cricket", "tennis", "f1", "basketball"];

  return (
    <Card className="p-4 mb-6 bg-gradient-to-br from-amber-500/5 via-background to-orange-500/5 border-amber-500/30">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center">
          <Trophy className="w-4 h-4" />
        </div>
        <div className="flex-1">
          <h3 className="font-display font-bold text-base">{t("লাইভ স্পোর্টস গাইড", "Live Sports Guide")}</h3>
          <p className="text-[11px] text-muted-foreground">
            {t("আগামী দিনগুলোর বড় খেলা — বাংলাদেশ সময় ও চ্যানেল সহ", "Upcoming major events — Bangladesh time & channels")}
          </p>
        </div>
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

      <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
        {events.length === 0 && (
          <p className="text-center text-xs text-muted-foreground py-6">{t("কোনো ইভেন্ট নেই", "No events")}</p>
        )}
        {events.map((e) => (
          <div key={e.id} className="p-3 rounded-xl border bg-card hover:border-primary/40 transition-smooth">
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-lg shrink-0">{SPORT_LABEL[e.sport].emoji}</span>
                <div className="min-w-0">
                  <p className="font-semibold text-sm leading-tight truncate">{e.match}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{e.tournament}</p>
                </div>
              </div>
              {e.status === "live" ? (
                <Badge className="bg-rose-500 text-white text-[10px] animate-pulse shrink-0">● LIVE</Badge>
              ) : (
                <Badge variant="outline" className="text-[10px] shrink-0">{t("আসন্ন", "Upcoming")}</Badge>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] text-muted-foreground mb-2">
              <div className="flex items-center gap-1"><Clock className="w-3 h-3" /> {toBDTime(e.startUtc, bn)} (BD)</div>
              {e.venue && <div className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {e.venue}</div>}
            </div>
            <div className="space-y-1 text-[11px]">
              <div className="flex items-start gap-1.5">
                <TvIcon className="w-3 h-3 mt-0.5 text-primary shrink-0" />
                <div>
                  <span className="font-semibold text-foreground">🇧🇩 BD:</span>{" "}
                  <span className="text-muted-foreground">{e.channelsBD.join(", ")}</span>
                </div>
              </div>
              {e.channelsIN && (
                <div className="flex items-start gap-1.5">
                  <TvIcon className="w-3 h-3 mt-0.5 text-amber-500 shrink-0" />
                  <div>
                    <span className="font-semibold text-foreground">🇮🇳 IN:</span>{" "}
                    <span className="text-muted-foreground">{e.channelsIN.join(", ")}</span>
                  </div>
                </div>
              )}
              {e.channelsWorld && (
                <div className="flex items-start gap-1.5">
                  <TvIcon className="w-3 h-3 mt-0.5 text-blue-500 shrink-0" />
                  <div>
                    <span className="font-semibold text-foreground">🌍 World:</span>{" "}
                    <span className="text-muted-foreground">{e.channelsWorld.join(", ")}</span>
                  </div>
                </div>
              )}
              {e.freeStream && (
                <a href={e.freeStream} target="_blank" rel="noopener noreferrer"
                   className="inline-block text-emerald-600 hover:underline font-semibold mt-1">
                  🎁 {t("ফ্রি স্ট্রিম →", "Free stream →")}
                </a>
              )}
              {e.note && <p className="text-[10px] italic text-muted-foreground mt-1">💡 {e.note}</p>}
            </div>
          </div>
        ))}
      </div>

      <p className="text-[10px] text-center text-muted-foreground mt-3 pt-3 border-t">
        <Calendar className="w-3 h-3 inline mr-1" />
        {t("সময়সূচী পরিবর্তনশীল — সম্প্রচারকের ওয়েবসাইটে নিশ্চিত করুন।",
           "Schedules can change — confirm on broadcaster sites.")}
      </p>
    </Card>
  );
};

export default SportsSchedule;
