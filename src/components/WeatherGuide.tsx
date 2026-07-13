import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Droplets, Wind, Thermometer, Snowflake, CloudRain, Info } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

type Level = { range: string; label: string; risk: string; color: string };
type Section = { icon: JSX.Element; title: string; intro: string; levels: Level[] };

const WeatherGuide = () => {
  const { language } = useLanguage();
  const isBn = language === "bn";

  const sections: Section[] = isBn ? [
    {
      icon: <Thermometer className="w-4 h-4" />,
      title: "🌡️ তাপমাত্রা (°C) — কতটুকু হলে কী বিপদ",
      intro: "শরীরের স্বাভাবিক তাপমাত্রা ৩৭°C। বাতাসের তাপমাত্রা এর কাছাকাছি বা বেশি হলে ঘাম শুকাতে পারে না, হিটস্ট্রোকের ঝুঁকি বাড়ে।",
      levels: [
        { range: "৪০°C+", label: "চরম বিপজ্জনক", risk: "হিটস্ট্রোক, অজ্ঞান, মৃত্যুঝুঁকি। শিশু, বয়স্ক ও রোগীর জন্য জরুরি অবস্থা।", color: "bg-red-600/10 border-red-600 text-red-700 dark:text-red-300" },
        { range: "৩৬–৪০°C", label: "তাপপ্রবাহ", risk: "মাথাব্যথা, ক্লান্তি, পানিশূন্যতা, হিট এক্সহশন। দুপুরে বাইরে যাওয়া বিপজ্জনক।", color: "bg-orange-500/10 border-orange-500 text-orange-700 dark:text-orange-300" },
        { range: "৩২–৩৬°C", label: "গরম, অস্বস্তিকর", risk: "প্রচুর ঘাম, পানির চাহিদা বেশি। দীর্ঘ পরিশ্রমে দুর্বলতা।", color: "bg-yellow-500/10 border-yellow-500 text-yellow-700 dark:text-yellow-300" },
        { range: "২০–৩২°C", label: "স্বাভাবিক / আরামদায়ক", risk: "মানব শরীরের জন্য নিরাপদ পরিসর। বাইরের কাজের জন্য উপযুক্ত।", color: "bg-green-500/10 border-green-500 text-green-700 dark:text-green-300" },
        { range: "১০–২০°C", label: "শীতল", risk: "হালকা শীত। গরম কাপড় লাগবে, বিশেষ করে ভোরে।", color: "bg-sky-500/10 border-sky-500 text-sky-700 dark:text-sky-300" },
        { range: "৫–১০°C", label: "ঠান্ডা", risk: "শিশু ও বয়স্কদের ঠান্ডাজনিত অসুখের ঝুঁকি — জ্বর, নিউমোনিয়া।", color: "bg-blue-500/10 border-blue-500 text-blue-700 dark:text-blue-300" },
        { range: "৫°C-এর নিচে", label: "শৈত্যপ্রবাহ", risk: "হাইপোথার্মিয়া, ঠান্ডায় মৃত্যু হতে পারে। ছিন্নমূল মানুষ, শিশু-বয়স্করা চরম ঝুঁকিতে।", color: "bg-indigo-600/10 border-indigo-600 text-indigo-700 dark:text-indigo-300" },
      ],
    },
    {
      icon: <Droplets className="w-4 h-4" />,
      title: "💧 আর্দ্রতা (%) — বাতাসে জলীয় বাষ্প",
      intro: "আর্দ্রতা বেশি হলে ঘাম শুকায় না, শরীর ঠান্ডা হতে পারে না — 'অনুভূত তাপমাত্রা' অনেক বেড়ে যায়। কম হলে ত্বক-নাক-গলা শুকিয়ে যায়।",
      levels: [
        { range: "৯০–১০০%", label: "অতি আর্দ্র", risk: "ভ্যাপসা গরম, শ্বাসকষ্ট, ছত্রাক-ব্যাকটেরিয়া দ্রুত বাড়ে। বৃষ্টি/কুয়াশার সম্ভাবনা।", color: "bg-blue-600/10 border-blue-600 text-blue-700 dark:text-blue-300" },
        { range: "৭০–৯০%", label: "আর্দ্র", risk: "গরমকালে অস্বস্তিকর, ঘাম শুকায় না। হাঁপানি/অ্যালার্জি রোগীদের সমস্যা।", color: "bg-cyan-500/10 border-cyan-500 text-cyan-700 dark:text-cyan-300" },
        { range: "৪০–৭০%", label: "আরামদায়ক", risk: "মানব শরীরের জন্য আদর্শ পরিসর।", color: "bg-green-500/10 border-green-500 text-green-700 dark:text-green-300" },
        { range: "৩০–৪০%", label: "শুষ্ক", risk: "ত্বক-ঠোঁট ফাটা, চোখ জ্বালা। বেশি পানি পান করুন।", color: "bg-yellow-500/10 border-yellow-500 text-yellow-700 dark:text-yellow-300" },
        { range: "৩০%-এর নিচে", label: "অতি শুষ্ক", risk: "নাক দিয়ে রক্ত, শ্বাসনালীর সংক্রমণ, স্ট্যাটিক বিদ্যুৎ, আগুনের ঝুঁকি বেশি।", color: "bg-orange-500/10 border-orange-500 text-orange-700 dark:text-orange-300" },
      ],
    },
    {
      icon: <Wind className="w-4 h-4" />,
      title: "💨 বাতাসের গতি (km/h) — Beaufort স্কেল",
      intro: "বাতাসের গতি ও দমকা (gust) দুটোই গুরুত্বপূর্ণ। ৬০ km/h-এর বেশি দমকা মানেই ঘরবাড়ি, গাছপালা, বৈদ্যুতিক লাইনের ক্ষতির ঝুঁকি।",
      levels: [
        { range: "১১৮+ km/h", label: "ঘূর্ণিঝড় (Cyclone)", risk: "ঘরবাড়ি ধ্বংস, গাছ উপড়ে যায়, বিদ্যুৎ-যোগাযোগ বিচ্ছিন্ন। জীবনের ঝুঁকি — আশ্রয়কেন্দ্রে যান।", color: "bg-red-600/10 border-red-600 text-red-700 dark:text-red-300" },
        { range: "৮৯–১১৭ km/h", label: "প্রবল ঝড়", risk: "টিন-ছাদ উড়ে যায়, বড় গাছ ভাঙে, সাইনবোর্ড পড়ে। বাইরে বের হওয়া বিপজ্জনক।", color: "bg-red-500/10 border-red-500 text-red-700 dark:text-red-300" },
        { range: "৬২–৮৮ km/h", label: "ঝড় (Gale)", risk: "ছোট গাছ ভাঙে, ছাউনি উড়ে, নদীতে বড় ঢেউ। নৌকা-লঞ্চ বন্ধ রাখুন।", color: "bg-orange-500/10 border-orange-500 text-orange-700 dark:text-orange-300" },
        { range: "৪০–৬১ km/h", label: "দমকা হাওয়া", risk: "ছাতা উল্টে যায়, মোটরসাইকেল চালানো কঠিন। আলগা জিনিস সরান।", color: "bg-yellow-500/10 border-yellow-500 text-yellow-700 dark:text-yellow-300" },
        { range: "২০–৩৯ km/h", label: "মৃদু বাতাস", risk: "কাগজ-ধুলো ওড়ে, ছোট ডাল নড়ে। সাধারণত নিরাপদ।", color: "bg-sky-500/10 border-sky-500 text-sky-700 dark:text-sky-300" },
        { range: "০–১৯ km/h", label: "শান্ত / মৃদু", risk: "ধোঁয়া উপরে ওঠে, পাতা সামান্য নড়ে। কোনো ঝুঁকি নেই।", color: "bg-green-500/10 border-green-500 text-green-700 dark:text-green-300" },
      ],
    },
    {
      icon: <CloudRain className="w-4 h-4" />,
      title: "🌧️ বৃষ্টিপাত (mm/২৪ঘণ্টা) — BMD মানদণ্ড",
      intro: "বাংলাদেশ আবহাওয়া অধিদপ্তরের (BMD) শ্রেণীবিভাগ অনুযায়ী ২৪ ঘণ্টায় জমে থাকা বৃষ্টির পরিমাণ।",
      levels: [
        { range: "৮৯+ mm", label: "অতি ভারী বর্ষণ", risk: "আকস্মিক বন্যা, জলাবদ্ধতা, ভূমিধস (পাহাড়ি এলাকা)। ট্রেন-বাস-ফ্লাইট বিলম্ব।", color: "bg-red-600/10 border-red-600 text-red-700 dark:text-red-300" },
        { range: "৪৪–৮৮ mm", label: "ভারী বর্ষণ", risk: "শহরে জলাবদ্ধতা, নিচু এলাকা প্লাবিত, ট্রাফিক জ্যাম, বৈদ্যুতিক শর্টসার্কিটের ঝুঁকি।", color: "bg-orange-500/10 border-orange-500 text-orange-700 dark:text-orange-300" },
        { range: "২২–৪৩ mm", label: "মাঝারি ভারী বর্ষণ", risk: "রাস্তায় পানি জমে, দৃশ্যমানতা কমে। ছাতা/রেইনকোট বাধ্যতামূলক।", color: "bg-yellow-500/10 border-yellow-500 text-yellow-700 dark:text-yellow-300" },
        { range: "১০–২১ mm", label: "মাঝারি বর্ষণ", risk: "সাধারণ বৃষ্টি, বাইরে কাজে অসুবিধা।", color: "bg-sky-500/10 border-sky-500 text-sky-700 dark:text-sky-300" },
        { range: "১–৯ mm", label: "হালকা বৃষ্টি", risk: "গুঁড়ি গুঁড়ি বা হালকা বৃষ্টি। বড় ঝুঁকি নেই।", color: "bg-green-500/10 border-green-500 text-green-700 dark:text-green-300" },
      ],
    },
    {
      icon: <Thermometer className="w-4 h-4" />,
      title: "🥵 অনুভূত তাপমাত্রা (Feels Like) কেন আলাদা?",
      intro: "প্রকৃত তাপমাত্রা + আর্দ্রতা + বাতাস + সূর্যের বিকিরণ মিলিয়ে শরীর যতটা তাপ অনুভব করে। গরমকালে আর্দ্রতা বেশি হলে অনুভূত তাপমাত্রা ৫–১০°C বেশি হতে পারে।",
      levels: [
        { range: "৫৪°C+", label: "চরম বিপদ", risk: "কয়েক মিনিটেই হিটস্ট্রোক। বাইরে থাকা মানেই মৃত্যুঝুঁকি।", color: "bg-red-600/10 border-red-600 text-red-700 dark:text-red-300" },
        { range: "৪১–৫৪°C", label: "বিপজ্জনক", risk: "দীর্ঘক্ষণ থাকলে হিটস্ট্রোক নিশ্চিত। শারীরিক পরিশ্রম বন্ধ রাখুন।", color: "bg-orange-500/10 border-orange-500 text-orange-700 dark:text-orange-300" },
        { range: "৩২–৪১°C", label: "সাবধানতা জরুরি", risk: "হিট ক্র্যাম্প, ক্লান্তি, পানিশূন্যতা। ঘন ঘন পানি খান।", color: "bg-yellow-500/10 border-yellow-500 text-yellow-700 dark:text-yellow-300" },
        { range: "২৭–৩২°C", label: "সতর্ক থাকুন", risk: "দীর্ঘ পরিশ্রমে ক্লান্তি আসতে পারে।", color: "bg-sky-500/10 border-sky-500 text-sky-700 dark:text-sky-300" },
      ],
    },
    {
      icon: <Snowflake className="w-4 h-4" />,
      title: "❄️ শীতকালীন সতর্কতা",
      intro: "বাংলাদেশে সাধারণত ডিসেম্বর–ফেব্রুয়ারিতে তাপমাত্রা ১০°C-এর নিচে নামলে শৈত্যপ্রবাহ ধরা হয়।",
      levels: [
        { range: "৪°C-এর নিচে", label: "তীব্র শৈত্যপ্রবাহ", risk: "হাইপোথার্মিয়া, হৃদরোগ ও শ্বাসকষ্ট বৃদ্ধি, নবজাতক-বৃদ্ধদের মৃত্যুঝুঁকি।", color: "bg-indigo-700/10 border-indigo-700 text-indigo-700 dark:text-indigo-300" },
        { range: "৪–৬°C", label: "মাঝারি শৈত্যপ্রবাহ", risk: "নিউমোনিয়া, ঠান্ডা, ফ্লু, হাঁপানি বেড়ে যায়।", color: "bg-blue-600/10 border-blue-600 text-blue-700 dark:text-blue-300" },
        { range: "৬–৮°C", label: "মৃদু শৈত্যপ্রবাহ", risk: "গরম কাপড়, কম্বল দরকার। শিশু-বয়স্কদের বিশেষ যত্ন।", color: "bg-blue-500/10 border-blue-500 text-blue-700 dark:text-blue-300" },
        { range: "৮–১০°C", label: "শীত", risk: "সোয়েটার/জ্যাকেট পরুন, ভোরে সাবধান।", color: "bg-sky-500/10 border-sky-500 text-sky-700 dark:text-sky-300" },
      ],
    },
  ] : [
    {
      icon: <Thermometer className="w-4 h-4" />,
      title: "🌡️ Temperature (°C) — Health Risks",
      intro: "Normal body temperature is 37°C. When air temperature approaches or exceeds this, sweat can't evaporate and heatstroke risk rises sharply.",
      levels: [
        { range: "40°C+", label: "Extreme Danger", risk: "Heatstroke, unconsciousness, risk of death. Emergency for children, elderly, and the sick.", color: "bg-red-600/10 border-red-600 text-red-700 dark:text-red-300" },
        { range: "36–40°C", label: "Heat Wave", risk: "Headache, exhaustion, dehydration, heat exhaustion. Avoid midday outdoor activity.", color: "bg-orange-500/10 border-orange-500 text-orange-700 dark:text-orange-300" },
        { range: "32–36°C", label: "Hot, Uncomfortable", risk: "Heavy sweating, high water need. Fatigue during long physical work.", color: "bg-yellow-500/10 border-yellow-500 text-yellow-700 dark:text-yellow-300" },
        { range: "20–32°C", label: "Comfortable", risk: "Safe range for the human body. Ideal for outdoor work.", color: "bg-green-500/10 border-green-500 text-green-700 dark:text-green-300" },
        { range: "10–20°C", label: "Cool", risk: "Mildly cold. Warm clothing needed, especially at dawn.", color: "bg-sky-500/10 border-sky-500 text-sky-700 dark:text-sky-300" },
        { range: "5–10°C", label: "Cold", risk: "Cold-related illness risk for children and elderly — fever, pneumonia.", color: "bg-blue-500/10 border-blue-500 text-blue-700 dark:text-blue-300" },
        { range: "Below 5°C", label: "Cold Wave", risk: "Hypothermia, cold-related deaths. Homeless people, children, and elderly are at extreme risk.", color: "bg-indigo-600/10 border-indigo-600 text-indigo-700 dark:text-indigo-300" },
      ],
    },
    {
      icon: <Droplets className="w-4 h-4" />,
      title: "💧 Humidity (%) — Water Vapor in Air",
      intro: "High humidity prevents sweat from evaporating, so the body can't cool itself — 'feels-like' temperature spikes. Low humidity dries skin, nose, and throat.",
      levels: [
        { range: "90–100%", label: "Very Humid", risk: "Muggy heat, breathing difficulty, fast growth of mould/bacteria. Rain/fog likely.", color: "bg-blue-600/10 border-blue-600 text-blue-700 dark:text-blue-300" },
        { range: "70–90%", label: "Humid", risk: "Uncomfortable in summer, sweat won't dry. Trouble for asthma/allergy patients.", color: "bg-cyan-500/10 border-cyan-500 text-cyan-700 dark:text-cyan-300" },
        { range: "40–70%", label: "Comfortable", risk: "Ideal range for the human body.", color: "bg-green-500/10 border-green-500 text-green-700 dark:text-green-300" },
        { range: "30–40%", label: "Dry", risk: "Cracked skin/lips, eye irritation. Drink more water.", color: "bg-yellow-500/10 border-yellow-500 text-yellow-700 dark:text-yellow-300" },
        { range: "Below 30%", label: "Very Dry", risk: "Nosebleeds, respiratory infections, static electricity, higher fire risk.", color: "bg-orange-500/10 border-orange-500 text-orange-700 dark:text-orange-300" },
      ],
    },
    {
      icon: <Wind className="w-4 h-4" />,
      title: "💨 Wind Speed (km/h) — Beaufort Scale",
      intro: "Both sustained wind and gusts matter. Gusts above 60 km/h can damage buildings, trees, and power lines.",
      levels: [
        { range: "118+ km/h", label: "Cyclone", risk: "Houses destroyed, trees uprooted, power/comm cut. Life-threatening — go to a shelter.", color: "bg-red-600/10 border-red-600 text-red-700 dark:text-red-300" },
        { range: "89–117 km/h", label: "Severe Storm", risk: "Tin roofs fly, large trees break, signs fall. Going outside is dangerous.", color: "bg-red-500/10 border-red-500 text-red-700 dark:text-red-300" },
        { range: "62–88 km/h", label: "Gale", risk: "Small trees break, shelters fly, large waves on rivers. Stop boats/launches.", color: "bg-orange-500/10 border-orange-500 text-orange-700 dark:text-orange-300" },
        { range: "40–61 km/h", label: "Strong Wind", risk: "Umbrellas flip, hard to ride two-wheelers. Secure loose items.", color: "bg-yellow-500/10 border-yellow-500 text-yellow-700 dark:text-yellow-300" },
        { range: "20–39 km/h", label: "Light Wind", risk: "Paper/dust flies, small branches sway. Generally safe.", color: "bg-sky-500/10 border-sky-500 text-sky-700 dark:text-sky-300" },
        { range: "0–19 km/h", label: "Calm / Light Air", risk: "Smoke rises straight, leaves barely move. No risk.", color: "bg-green-500/10 border-green-500 text-green-700 dark:text-green-300" },
      ],
    },
    {
      icon: <CloudRain className="w-4 h-4" />,
      title: "🌧️ Rainfall (mm/24h) — BMD Classification",
      intro: "Bangladesh Meteorological Department (BMD) classification for rainfall accumulated over 24 hours.",
      levels: [
        { range: "89+ mm", label: "Extremely Heavy", risk: "Flash floods, waterlogging, landslides (hilly areas). Trains, buses, flights delayed.", color: "bg-red-600/10 border-red-600 text-red-700 dark:text-red-300" },
        { range: "44–88 mm", label: "Heavy Rain", risk: "Urban flooding, low areas submerged, traffic jams, short-circuit risk.", color: "bg-orange-500/10 border-orange-500 text-orange-700 dark:text-orange-300" },
        { range: "22–43 mm", label: "Moderately Heavy", risk: "Water on roads, low visibility. Umbrella/raincoat mandatory.", color: "bg-yellow-500/10 border-yellow-500 text-yellow-700 dark:text-yellow-300" },
        { range: "10–21 mm", label: "Moderate Rain", risk: "Normal rain, outdoor work difficult.", color: "bg-sky-500/10 border-sky-500 text-sky-700 dark:text-sky-300" },
        { range: "1–9 mm", label: "Light Rain", risk: "Drizzle or light shower. No major risk.", color: "bg-green-500/10 border-green-500 text-green-700 dark:text-green-300" },
      ],
    },
    {
      icon: <Thermometer className="w-4 h-4" />,
      title: "🥵 Why 'Feels Like' Differs",
      intro: "Real temperature + humidity + wind + solar radiation combined determines how the body actually feels heat. In summer with high humidity, feels-like can be 5–10°C higher.",
      levels: [
        { range: "54°C+", label: "Extreme Danger", risk: "Heatstroke within minutes. Being outside is a death risk.", color: "bg-red-600/10 border-red-600 text-red-700 dark:text-red-300" },
        { range: "41–54°C", label: "Danger", risk: "Prolonged exposure guarantees heatstroke. Stop physical work.", color: "bg-orange-500/10 border-orange-500 text-orange-700 dark:text-orange-300" },
        { range: "32–41°C", label: "Extreme Caution", risk: "Heat cramps, exhaustion, dehydration. Drink water frequently.", color: "bg-yellow-500/10 border-yellow-500 text-yellow-700 dark:text-yellow-300" },
        { range: "27–32°C", label: "Caution", risk: "Fatigue possible during prolonged exertion.", color: "bg-sky-500/10 border-sky-500 text-sky-700 dark:text-sky-300" },
      ],
    },
    {
      icon: <Snowflake className="w-4 h-4" />,
      title: "❄️ Winter Warnings",
      intro: "In Bangladesh, cold waves are declared when temperature drops below 10°C, typically December–February.",
      levels: [
        { range: "Below 4°C", label: "Severe Cold Wave", risk: "Hypothermia, spike in heart & respiratory illness, death risk for infants/elderly.", color: "bg-indigo-700/10 border-indigo-700 text-indigo-700 dark:text-indigo-300" },
        { range: "4–6°C", label: "Moderate Cold Wave", risk: "Pneumonia, cold, flu, asthma flare-ups.", color: "bg-blue-600/10 border-blue-600 text-blue-700 dark:text-blue-300" },
        { range: "6–8°C", label: "Mild Cold Wave", risk: "Warm clothes and blankets needed. Extra care for children/elderly.", color: "bg-blue-500/10 border-blue-500 text-blue-700 dark:text-blue-300" },
        { range: "8–10°C", label: "Cold", risk: "Wear sweater/jacket, be careful at dawn.", color: "bg-sky-500/10 border-sky-500 text-sky-700 dark:text-sky-300" },
      ],
    },
  ];

  return (
    <Card className="mt-6 border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-background">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base md:text-lg">
          <Info className="w-5 h-5 text-primary" />
          <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent font-bold">
            {isBn ? "📖 আবহাওয়া গাইড — কোন সংখ্যায় কী বিপদ" : "📖 Weather Guide — What Each Number Means"}
          </span>
        </CardTitle>
        <p className="text-[11px] text-muted-foreground">
          {isBn
            ? "তাপমাত্রা, আর্দ্রতা, বাতাসের গতি, বৃষ্টি — কোন মাত্রায় কী স্বাস্থ্যঝুঁকি ও করণীয়, বিস্তারিত জানুন।"
            : "Temperature, humidity, wind, rain — what health risks each level poses and what to do about it."}
        </p>
      </CardHeader>
      <CardContent>
        <Accordion type="multiple" className="w-full">
          {sections.map((s, i) => (
            <AccordionItem key={i} value={`item-${i}`}>
              <AccordionTrigger className="text-sm font-semibold hover:no-underline">
                <span className="flex items-center gap-2 text-left">{s.icon}{s.title}</span>
              </AccordionTrigger>
              <AccordionContent>
                <p className="text-xs text-muted-foreground mb-3 italic">{s.intro}</p>
                <div className="space-y-2">
                  {s.levels.map((lv, j) => (
                    <div key={j} className={`p-3 rounded-lg border-l-4 ${lv.color}`}>
                      <div className="flex items-center justify-between gap-2 mb-1 flex-wrap">
                        <span className="font-bold text-sm">{lv.range}</span>
                        <span className="text-xs font-semibold opacity-80">{lv.label}</span>
                      </div>
                      <p className="text-xs opacity-90 leading-relaxed">{lv.risk}</p>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
};

export default WeatherGuide;
