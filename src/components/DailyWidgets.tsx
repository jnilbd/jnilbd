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
  const hijri = new Intl.DateTimeFormat("ar-SA-u-ca-islamic-umalqura", { day: "numeric", month: "long", year: "numeric" }).format(now);
  const bnWeekday = BN_WEEKDAYS[now.getDay()];

  return (
    <section className="container py-6 md:py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
        {/* Occasion / Quote */}
        <AnimatePresence mode="wait">
          <motion.div
            key={occasion?.title ?? "quote"}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45 }}
            className={`relative overflow-hidden rounded-2xl p-4 md:p-5 text-white shadow-elegant ${
              occasion ? `bg-gradient-to-br ${occasion.gradient}` : "bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900"
            }`}
          >
            <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/10" />
            <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-white/5" />
            {occasion ? (
              <div className="relative">
                <div className="text-3xl md:text-4xl mb-1">{occasion.emoji}</div>
                <h3 className="text-lg md:text-xl font-bold leading-tight">{occasion.title}</h3>
                <p className="text-xs md:text-sm text-white/90 mt-1 leading-relaxed">{occasion.subtitle}</p>
              </div>
            ) : (
              <div className="relative">
                <Quote className="w-6 h-6 mb-2 text-white/70" />
                <p className="text-sm md:text-base font-medium leading-relaxed">"{QUOTES[quoteIdx].t}"</p>
                <p className="text-xs text-white/70 mt-2">{QUOTES[quoteIdx].a}</p>
              </div>
            )}
            <Sparkles className="absolute top-3 right-3 w-4 h-4 text-white/60" />
          </motion.div>
        </AnimatePresence>

        {/* Tri-Calendar */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.05 }}
          className="rounded-2xl p-4 md:p-5 bg-card border border-border/60 shadow-card"
        >
          <div className="flex items-center gap-2 text-muted-foreground text-xs mb-3">
            <Calendar className="w-4 h-4" />
            <span>আজকের তারিখ</span>
          </div>
          <div className="space-y-2.5">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">বাংলা</div>
              <div className="font-display font-bold text-base md:text-lg leading-tight">
                {toBn(bn.day)} {bn.month} {toBn(bn.year)}
              </div>
              <div className="text-xs text-muted-foreground">{bnWeekday}</div>
            </div>
            <div className="h-px bg-border/60" />
            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">English</div>
              <div className="font-semibold text-sm md:text-base">{engDate}</div>
            </div>
            <div className="h-px bg-border/60" />
            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">হিজরি</div>
              <div className="font-semibold text-sm md:text-base text-right" dir="rtl">{hijri}</div>
            </div>
          </div>
        </motion.div>

        {/* Weather */}
        <Link to="/weather">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}
            whileHover={{ y: -4 }}
            className="relative overflow-hidden rounded-2xl p-4 md:p-5 text-white shadow-elegant bg-gradient-to-br from-sky-500 via-blue-500 to-indigo-600 h-full block cursor-pointer"
          >
            <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10" />
            <div className="flex items-center gap-2 text-white/80 text-xs mb-3 relative">
              <CloudSun className="w-4 h-4" />
              <span>বর্তমান আবহাওয়া</span>
            </div>
            {weather ? (
              <div className="relative">
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl md:text-6xl font-display font-bold">{toBn(weather.temp)}°</span>
                  <span className="text-2xl">{WMO[weather.code]?.icon ?? "🌡️"}</span>
                </div>
                <div className="text-sm md:text-base font-medium mt-1">{WMO[weather.code]?.bn ?? "—"}</div>
                <div className="flex items-center gap-1 text-xs text-white/80 mt-2">
                  <MapPin className="w-3 h-3" /> {weather.city} • বিস্তারিত দেখুন →
                </div>
              </div>
            ) : (
              <div className="relative">
                <div className="text-4xl">⛅</div>
                <div className="text-sm mt-2 text-white/80">লোড হচ্ছে...</div>
              </div>
            )}
          </motion.div>
        </Link>
      </div>
    </section>
  );
}
