import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { Sparkles, CloudSun, Calendar, MapPin, Quote } from "lucide-react";

/* ---------- Bengali calendar helpers ---------- */
const BN_DIGITS = ["০","১","২","৩","৪","৫","৬","৭","৮","৯"];
const toBn = (n: number | string) => String(n).replace(/\d/g, (d) => BN_DIGITS[+d]);

const BN_MONTHS = ["বৈশাখ","জ্যৈষ্ঠ","আষাঢ়","শ্রাবণ","ভাদ্র","আশ্বিন","কার্তিক","অগ্রহায়ণ","পৌষ","মাঘ","ফাল্গুন","চৈত্র"];
const BN_WEEKDAYS = ["রবিবার","সোমবার","মঙ্গলবার","বুধবার","বৃহস্পতিবার","শুক্রবার","শনিবার"];

// Approximation: BS new year = 14 April. Good enough for display.
function getBanglaDate(d = new Date()) {
  const y = d.getFullYear();
  const monthLen = [31,31,31,31,31,31,30,30,30,30,30,30]; // Boishakh..Chaitra (post-reform commonly 31,31,31,31,31,31,30,30,30,30,30,30)
  const newYear = new Date(y, 3, 14); // Apr 14
  let bnYear = y - 593;
  let start = newYear;
  if (d < newYear) { bnYear -= 1; start = new Date(y - 1, 3, 14); }
  const diff = Math.floor((+d - +start) / 86400000);
  let days = diff, mIdx = 0;
  for (; mIdx < 12 && days >= monthLen[mIdx]; mIdx++) days -= monthLen[mIdx];
  return { day: days + 1, month: BN_MONTHS[mIdx], monthIdx: mIdx, year: bnYear };
}

/* ---------- Occasion detector ---------- */
type Occasion = { title: string; subtitle: string; emoji: string; gradient: string };

function detectOccasion(d = new Date()): Occasion | null {
  const m = d.getMonth() + 1, day = d.getDate(), dow = d.getDay();
  const bn = getBanglaDate(d);

  // Fridays = Jumma
  if (dow === 5) return { title: "জুম্মা মোবারক", subtitle: "আজ পবিত্র শুক্রবার — সালাত ও দরুদ পড়ুন।", emoji: "🕌", gradient: "from-emerald-500 via-teal-500 to-cyan-500" };

  // Fixed-date observances (Gregorian)
  if (m === 1 && day === 1) return { title: "শুভ নববর্ষ", subtitle: "Happy New Year! নতুন বছরের শুভেচ্ছা।", emoji: "🎆", gradient: "from-indigo-500 via-purple-500 to-pink-500" };
  if (m === 2 && day === 14) return { title: "ভালোবাসা দিবস", subtitle: "শুভ ভ্যালেন্টাইন'স ডে — প্রিয়জনকে ভালোবাসুন।", emoji: "💐", gradient: "from-rose-500 via-pink-500 to-red-500" };
  if (m === 2 && day === 21) return { title: "আন্তর্জাতিক মাতৃভাষা দিবস", subtitle: "অমর একুশে — ভাষা শহীদদের শ্রদ্ধাঞ্জলি।", emoji: "🇧🇩", gradient: "from-red-600 via-red-700 to-green-700" };
  if (m === 3 && day === 17) return { title: "জাতির পিতার জন্মদিন", subtitle: "শিশু দিবসের শুভেচ্ছা।", emoji: "🎂", gradient: "from-green-600 via-emerald-600 to-teal-600" };
  if (m === 3 && day === 26) return { title: "স্বাধীনতা দিবস", subtitle: "৭১-এর শহীদদের প্রতি শ্রদ্ধা।", emoji: "🇧🇩", gradient: "from-green-700 via-red-600 to-green-700" };
  if (m === 5 && day === 1) return { title: "মে দিবস", subtitle: "শ্রমজীবী মানুষের প্রতি সালাম।", emoji: "✊", gradient: "from-red-600 to-orange-500" };
  if (m === 8 && day === 15) return { title: "জাতীয় শোক দিবস", subtitle: "বঙ্গবন্ধুর প্রতি শ্রদ্ধাঞ্জলি।", emoji: "🖤", gradient: "from-gray-700 via-gray-800 to-black" };
  if (m === 12 && day === 16) return { title: "মহান বিজয় দিবস", subtitle: "৫৪ বছরের গৌরবময় বিজয়।", emoji: "🏆", gradient: "from-green-700 via-red-600 to-green-800" };
  if (m === 12 && day === 25) return { title: "শুভ বড়দিন", subtitle: "Merry Christmas!", emoji: "🎄", gradient: "from-red-600 via-green-600 to-emerald-600" };

  // Bangla calendar observances
  if (bn.monthIdx === 0 && bn.day === 1) return { title: "শুভ নববর্ষ ১৪৩১", subtitle: "পহেলা বৈশাখের শুভেচ্ছা — এসো হে বৈশাখ।", emoji: "🎊", gradient: "from-red-500 via-orange-500 to-yellow-500" };
  if (bn.monthIdx === 10 && bn.day === 1) return { title: "পহেলা ফাল্গুন", subtitle: "বসন্তের শুভেচ্ছা — আহা কী আনন্দ আকাশে বাতাসে।", emoji: "🌸", gradient: "from-yellow-400 via-orange-400 to-pink-400" };

  // Saturday weekend cheer
  if (dow === 6) return { title: "শুভ শনিবার", subtitle: "সপ্তাহের শেষ দিনে নিজেকে সময় দিন।", emoji: "🌿", gradient: "from-sky-500 via-blue-500 to-indigo-500" };

  return null;
}

const QUOTES = [
  { t: "যে পড়ে সে জানে, যে জানে সে এগিয়ে যায়।", a: "— প্রবাদ" },
  { t: "সফলতা এক রাতে আসে না, প্রতিদিনের ছোট অভ্যাসে আসে।", a: "— অজানা" },
  { t: "তুমি যা চাও, তা হতে কখনো দেরি নেই।", a: "— জর্জ এলিয়ট" },
  { t: "জীবনে সবচেয়ে বড় ঝুঁকি হলো কোনো ঝুঁকি না নেওয়া।", a: "— মার্ক জাকারবার্গ" },
  { t: "নিজের প্রতি বিশ্বাস রাখো — অর্ধেক যুদ্ধ এখানেই জেতা।", a: "— থিওডোর রুজভেল্ট" },
];

/* ---------- Weather (Open-Meteo, no key) ---------- */
type Weather = { temp: number; code: number; city: string };

const WMO: Record<number, { bn: string; icon: string }> = {
  0: { bn: "পরিষ্কার", icon: "☀️" }, 1: { bn: "মূলত পরিষ্কার", icon: "🌤️" }, 2: { bn: "আংশিক মেঘলা", icon: "⛅" }, 3: { bn: "মেঘলা", icon: "☁️" },
  45: { bn: "কুয়াশা", icon: "🌫️" }, 48: { bn: "কুয়াশা", icon: "🌫️" },
  51: { bn: "হালকা বৃষ্টি", icon: "🌦️" }, 53: { bn: "হালকা বৃষ্টি", icon: "🌦️" }, 55: { bn: "বৃষ্টি", icon: "🌧️" },
  61: { bn: "বৃষ্টি", icon: "🌧️" }, 63: { bn: "মাঝারি বৃষ্টি", icon: "🌧️" }, 65: { bn: "ভারী বৃষ্টি", icon: "⛈️" },
  71: { bn: "তুষারপাত", icon: "🌨️" }, 80: { bn: "বৃষ্টিপাত", icon: "🌦️" }, 95: { bn: "বজ্রবৃষ্টি", icon: "⛈️" },
};

function useWeather() {
  const [w, setW] = useState<Weather | null>(null);
  useEffect(() => {
    const cached = sessionStorage.getItem("dw-weather");
    if (cached) { try { setW(JSON.parse(cached)); return; } catch { /* */ } }
    fetch("https://api.open-meteo.com/v1/forecast?latitude=23.81&longitude=90.41&current=temperature_2m,weather_code&timezone=Asia/Dhaka")
      .then(r => r.json())
      .then(d => {
        const data = { temp: Math.round(d?.current?.temperature_2m ?? 0), code: d?.current?.weather_code ?? 0, city: "ঢাকা" };
        setW(data);
        sessionStorage.setItem("dw-weather", JSON.stringify(data));
      })
      .catch(() => {});
  }, []);
  return w;
}

/* ---------- Main component ---------- */
export default function DailyWidgets() {
  const now = useMemo(() => new Date(), []);
  const occasion = useMemo(() => detectOccasion(now), [now]);
  const bn = useMemo(() => getBanglaDate(now), [now]);
  const weather = useWeather();
  const quoteIdx = now.getDate() % QUOTES.length;

  const engDate = now.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const HIJRI_MONTHS_BN = ["মহররম","সফর","রবিউল আউয়াল","রবিউস সানি","জমাদিউল আউয়াল","জমাদিউস সানি","রজব","শাবান","রমজান","শাওয়াল","জিলক্বদ","জিলহজ"];
  const hijriParts = new Intl.DateTimeFormat("en-US-u-ca-islamic-umalqura", { day: "numeric", month: "numeric", year: "numeric" }).formatToParts(now);
  const hDay = hijriParts.find(p => p.type === "day")?.value ?? "";
  const hMonth = Number(hijriParts.find(p => p.type === "month")?.value ?? 1);
  const hYear = hijriParts.find(p => p.type === "year")?.value ?? "";
  const toBnDigits = (s: string) => s.replace(/\d/g, d => "০১২৩৪৫৬৭৮৯"[Number(d)]);
  const hijri = `${toBnDigits(hDay)} ${HIJRI_MONTHS_BN[hMonth - 1]} ${toBnDigits(hYear)}`;
  const bnWeekday = BN_WEEKDAYS[now.getDay()];

  return (
    <section className="container py-6 md:py-10">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-primary/95 via-primary to-primary/85 shadow-elegant"
      >
        {/* Decorative orbs */}
        <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-secondary/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-white/10 blur-3xl pointer-events-none" />
        <div className="absolute inset-0 opacity-[0.05] bg-[linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

        <div className="relative grid grid-cols-1 lg:grid-cols-[1.1fr_1.4fr_1fr] divide-y lg:divide-y-0 lg:divide-x divide-white/15">
          {/* Weather */}
          <Link to="/weather" className="group p-5 md:p-6 hover:bg-white/5 transition-colors">
            <div className="flex items-center gap-2 text-white/70 text-[10px] font-bold uppercase tracking-[0.18em] mb-3">
              <CloudSun className="w-3.5 h-3.5 text-secondary" />
              <span>বর্তমান আবহাওয়া</span>
            </div>
            {weather ? (
              <>
                <div className="flex items-end gap-3">
                  <span className="text-6xl md:text-7xl font-display font-bold text-white leading-none tabular-nums">
                    {toBn(weather.temp)}°
                  </span>
                  <span className="text-4xl mb-1">{WMO[weather.code]?.icon ?? "🌡️"}</span>
                </div>
                <div className="mt-2 text-sm font-semibold text-white/95">{WMO[weather.code]?.bn ?? "—"}</div>
                <div className="mt-3 flex items-center gap-1.5 text-xs text-white/70 group-hover:text-secondary transition-colors">
                  <MapPin className="w-3 h-3" /> {weather.city} <span className="opacity-50">•</span>
                  <span className="font-medium">বিস্তারিত →</span>
                </div>
              </>
            ) : (
              <div className="text-4xl text-white/70">⛅</div>
            )}
          </Link>

          {/* Tri-Calendar */}
          <div className="p-5 md:p-6">
            <div className="flex items-center gap-2 text-white/70 text-[10px] font-bold uppercase tracking-[0.18em] mb-3">
              <Calendar className="w-3.5 h-3.5 text-secondary" />
              <span>আজকের তারিখ</span>
            </div>
            <div className="grid grid-cols-3 gap-2.5">
              <div className="rounded-xl bg-white/10 backdrop-blur-md border border-white/15 p-3">
                <div className="text-[9px] uppercase tracking-wider text-secondary font-bold mb-1">বাংলা</div>
                <div className="font-display font-bold text-white text-sm leading-tight">{toBn(bn.day)} {bn.month}</div>
                <div className="text-[10px] text-white/70 mt-0.5">{toBn(bn.year)} • {bnWeekday}</div>
              </div>
              <div className="rounded-xl bg-white/10 backdrop-blur-md border border-white/15 p-3">
                <div className="text-[9px] uppercase tracking-wider text-secondary font-bold mb-1">English</div>
                <div className="font-semibold text-white text-sm leading-tight">
                  {now.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                </div>
                <div className="text-[10px] text-white/70 mt-0.5">
                  {now.toLocaleDateString("en-GB", { year: "numeric", weekday: "long" })}
                </div>
              </div>
              <div className="rounded-xl bg-white/10 backdrop-blur-md border border-white/15 p-3">
                <div className="text-[9px] uppercase tracking-wider text-secondary font-bold mb-1">হিজরি</div>
                <div className="font-semibold text-white text-sm leading-tight text-right">{hijri}</div>
              </div>
            </div>
          </div>

          {/* Occasion / Quote */}
          <AnimatePresence mode="wait">
            <motion.div
              key={occasion?.title ?? "quote"}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="p-5 md:p-6 relative"
            >
              <div className="flex items-center gap-2 text-white/70 text-[10px] font-bold uppercase tracking-[0.18em] mb-3">
                <Sparkles className="w-3.5 h-3.5 text-secondary" />
                <span>{occasion ? "আজকের বিশেষ" : "আজকের অনুপ্রেরণা"}</span>
              </div>
              {occasion ? (
                <div>
                  <div className="text-3xl mb-1.5">{occasion.emoji}</div>
                  <h3 className="text-base font-display font-bold text-white leading-tight">{occasion.title}</h3>
                  <p className="text-xs text-white/80 mt-1 leading-relaxed line-clamp-2">{occasion.subtitle}</p>
                </div>
              ) : (
                <div>
                  <Quote className="w-5 h-5 text-secondary/80 mb-2" />
                  <p className="text-sm font-medium text-white leading-snug line-clamp-3">"{QUOTES[quoteIdx].t}"</p>
                  <p className="text-[11px] text-white/60 mt-2">{QUOTES[quoteIdx].a}</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </section>
  );
}

