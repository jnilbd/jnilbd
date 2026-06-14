import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plane, MapPin, Wallet, Bus, Train, Ship, Hotel, Camera, Heart, Star, Loader2, RefreshCw, Search, Sparkles } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Destination = {
  name: string;
  region: string;
  highlights: string[];
  transport: { mode: string; cost: string; icon: any }[];
  stay: string;
  food: string;
  ticket: string;
  totalLow: number;
  totalHigh: number;
  days: string;
  bestTime: string;
};

const BD_DESTINATIONS: Destination[] = [
  {
    name: "Cox's Bazar (কক্সবাজার)", region: "Chattogram",
    highlights: ["বিশ্বের দীর্ঘতম সমুদ্র সৈকত", "Himchori জলপ্রপাত", "Inani বিচ", "Sea aquarium"],
    transport: [
      { mode: "ঢাকা থেকে AC বাস", cost: "৳1,500-2,200", icon: Bus },
      { mode: "Cox's Bazar Express ট্রেন (Snigdha)", cost: "৳1,325", icon: Train },
      { mode: "ফ্লাইট (US-Bangla/NovoAir)", cost: "৳5,000-9,000", icon: Plane },
    ],
    stay: "৳800 (বাজেট) – ৳8,000 (লাক্সারি) প্রতি রাত",
    food: "৳300-1,500 প্রতিদিন (সামুদ্রিক মাছ ট্রাই করুন)",
    ticket: "Inani/Himchori entry: ৳40-100",
    totalLow: 8000, totalHigh: 25000, days: "3-4 দিন", bestTime: "Nov-Feb",
  },
  {
    name: "Sajek Valley (সাজেক)", region: "Rangamati",
    highlights: ["মেঘের রাজ্য", "Konglak পাহাড়", "Helipad সানসেট", "আদিবাসী সংস্কৃতি"],
    transport: [
      { mode: "ঢাকা→খাগড়াছড়ি বাস", cost: "৳750-1,200", icon: Bus },
      { mode: "খাগড়াছড়ি→সাজেক জিপ (চাঁদের গাড়ি)", cost: "৳8,000-10,000 (10 জন)", icon: Bus },
    ],
    stay: "Cottage ৳1,500-5,000 প্রতি রাত",
    food: "প্যাকেজ ৳200-400 প্রতি বেলা (cottage থেকেই)",
    ticket: "Army entry permit: free (NID লাগবে)",
    totalLow: 6000, totalHigh: 12000, days: "2-3 দিন", bestTime: "Aug-Mar",
  },
  {
    name: "Sundarbans (সুন্দরবন)", region: "Khulna",
    highlights: ["রয়েল বেঙ্গল টাইগার", "ম্যানগ্রোভ ফরেস্ট", "Karamjal", "Kotka beach"],
    transport: [
      { mode: "ঢাকা→খুলনা ট্রেন/বাস", cost: "৳700-1,800", icon: Train },
      { mode: "3-day cruise package", cost: "৳8,000-15,000 (all-in)", icon: Ship },
    ],
    stay: "Cruise ship cabin (প্যাকেজে অন্তর্ভুক্ত)",
    food: "প্যাকেজে অন্তর্ভুক্ত",
    ticket: "Forest dept fees: প্যাকেজে অন্তর্ভুক্ত",
    totalLow: 10000, totalHigh: 20000, days: "3-4 দিন", bestTime: "Oct-Mar",
  },
  {
    name: "Bandarban (বান্দরবান)", region: "Chattogram Hill Tracts",
    highlights: ["Nilgiri", "Boga Lake", "Nafa-khum waterfall", "Chimbuk পাহাড়"],
    transport: [
      { mode: "ঢাকা→বান্দরবান AC বাস", cost: "৳900-1,400", icon: Bus },
      { mode: "চাঁদের গাড়ি (লোকাল)", cost: "৳4,000-8,000/দিন", icon: Bus },
    ],
    stay: "Hill view resort ৳2,000-6,000",
    food: "৳400-800 প্রতিদিন",
    ticket: "Nilgiri: ৳50, Boga Lake guide: ৳1,500",
    totalLow: 7000, totalHigh: 15000, days: "3 দিন", bestTime: "Sep-Mar",
  },
  {
    name: "Sylhet — Jaflong/Ratargul", region: "Sylhet",
    highlights: ["জলাবন (swamp forest)", "Jaflong পাথর", "চা বাগান", "Bisanakandi"],
    transport: [
      { mode: "ঢাকা→সিলেট Parabat Express", cost: "৳736 (Snigdha)", icon: Train },
      { mode: "লোকাল CNG/Microbus", cost: "৳3,000-5,000/দিন", icon: Bus },
    ],
    stay: "৳1,200-4,500 প্রতি রাত",
    food: "৳400-1,000 (সাত রঙা চা ট্রাই করুন)",
    ticket: "Ratargul boat: ৳800 (5 জন)",
    totalLow: 5500, totalHigh: 12000, days: "2-3 দিন", bestTime: "Jul-Sep (jolaboner জন্য)",
  },
  {
    name: "Saint Martin (সেন্ট মার্টিন)", region: "Cox's Bazar",
    highlights: ["প্রবাল দ্বীপ", "Chera Dwip", "নীল সমুদ্র", "Snorkeling"],
    transport: [
      { mode: "ঢাকা→Teknaf বাস", cost: "৳1,500-2,200", icon: Bus },
      { mode: "Teknaf→St Martin জাহাজ", cost: "৳1,000-3,500 round trip", icon: Ship },
    ],
    stay: "Resort ৳2,000-12,000 প্রতি রাত",
    food: "৳600-2,000 (calamari, lobster)",
    ticket: "Chera Dwip বোট: ৳200-500",
    totalLow: 9000, totalHigh: 25000, days: "2-3 দিন", bestTime: "Nov-Feb",
  },
  {
    name: "Sreemangal (চা রাজধানী)", region: "Moulvibazar",
    highlights: ["7-color tea", "Lawachara forest", "চা বাগান", "Hum Hum waterfall"],
    transport: [
      { mode: "ঢাকা→Sreemangal ট্রেন", cost: "৳450-700", icon: Train },
      { mode: "লোকাল CNG", cost: "৳1,500-2,500/দিন", icon: Bus },
    ],
    stay: "Eco-resort ৳1,500-6,000",
    food: "৳400-800",
    ticket: "Lawachara entry: ৳50",
    totalLow: 4500, totalHigh: 10000, days: "2 দিন", bestTime: "Oct-Mar",
  },
];

const INDIA_DESTINATIONS = [
  { name: "কলকাতা (Kolkata)", purpose: "ভ্রমণ + শপিং", visa: "Indian tourist visa ($35-50)", transport: "Maitree Express: ৳3,500-5,000 / বাস (Shyamoli): ৳1,800-2,500", stay: "₹800-3,000/রাত (Sudder Street)", must: "Victoria Memorial, New Market shopping, Park Street, Howrah Bridge", budget: "৳25,000-50,000 (3-4 দিন)" },
  { name: "চেন্নাই/ভেলোর (Vellore)", purpose: "চিকিৎসা", visa: "Medical visa (Apollo/CMC appointment letter)", transport: "Dhaka→Chennai ফ্লাইট: ৳22,000-35,000", stay: "CMC এলাকায় guesthouse ₹500-2,000/রাত", must: "CMC Vellore বা Apollo Chennai এ পরীক্ষা/চিকিৎসা", budget: "৳60,000-2,00,000+" },
  { name: "শিলং/মেঘালয় (Shillong)", purpose: "প্রাকৃতিক ভ্রমণ", visa: "Tourist visa (Dawki land port)", transport: "Sylhet→Tamabil→Dawki→Shillong ৳3,000-5,000", stay: "₹1,000-4,000/রাত", must: "Cherrapunji, Mawlynnong, Dawki Umngot নদী", budget: "৳20,000-40,000 (4-5 দিন)" },
  { name: "দার্জিলিং/সিকিম", purpose: "পাহাড় ভ্রমণ", visa: "Tourist visa + Sikkim ILP", transport: "Kolkata→NJP ট্রেন→জিপ ₹3,000-5,000", stay: "₹1,200-5,000/রাত", must: "Tiger Hill sunrise, toy train, Tsomgo lake", budget: "৳35,000-65,000 (5-7 দিন)" },
  { name: "আগ্রা + দিল্লি", purpose: "ঐতিহাসিক", visa: "Tourist visa", transport: "Dhaka→Delhi ফ্লাইট ৳18,000-35,000", stay: "₹1,500-6,000/রাত", must: "Taj Mahal, Red Fort, Qutub Minar, Chandni Chowk", budget: "৳40,000-80,000 (5-6 দিন)" },
];

const DUBAI_DESTINATIONS = [
  { name: "দুবাই (UAE)", purpose: "শপিং + ভ্রমণ", visa: "UAE tourist visa: ৳12,000-18,000", transport: "Dhaka→Dubai ফ্লাইট: ৳40,000-75,000", stay: "AED 200-1,500/রাত", must: "Burj Khalifa, Desert Safari, Dubai Mall, Palm Jumeirah, Global Village", budget: "৳1,20,000-3,00,000 (5-7 দিন)" },
  { name: "আবু ধাবি", purpose: "ধর্মীয় + পারিবারিক", visa: "Same UAE visa", transport: "Dubai→Abu Dhabi বাস: AED 25", stay: "AED 250-1,200/রাত", must: "Sheikh Zayed Grand Mosque, Ferrari World, Yas Island", budget: "৳20,000-50,000 (2-3 দিন)" },
];

const CHINA_DESTINATIONS = [
  { name: "গুয়াংঝু (Guangzhou)", purpose: "ব্যবসা / wholesale", visa: "Business or M visa", transport: "Dhaka→Guangzhou: ৳45,000-75,000", stay: "¥150-600/রাত", must: "Canton Fair, Yiwu market trip", budget: "৳1,50,000-3,50,000 (7-10 দিন)" },
  { name: "বেইজিং (Beijing)", purpose: "ভ্রমণ + ঐতিহ্য", visa: "L tourist visa", transport: "Dhaka→Beijing: ৳55,000-90,000", stay: "¥200-800/রাত", must: "Great Wall, Forbidden City, Tiananmen, Hutongs", budget: "৳1,80,000-3,50,000 (6-8 দিন)" },
  { name: "Kunming/Yunnan", purpose: "চিকিৎসা ও ভ্রমণ", visa: "Tourist/medical visa", transport: "Dhaka→Kunming: ৳40,000-65,000", stay: "¥150-500/রাত", must: "Stone Forest, Lijiang, Tiger Leaping Gorge", budget: "৳1,20,000-2,50,000 (7 দিন)" },
];

const SAUDI_DESTINATIONS = [
  { name: "মক্কা ও মদিনা (হজ)", purpose: "হজ", visa: "Hajj visa", transport: "Dhaka→Jeddah প্যাকেজে অন্তর্ভুক্ত", stay: "Hotel + খাবার সব প্যাকেজে", must: "Tawaf, Sa'i, Arafat, Muzdalifah, Mina, Mosque al-Nabawi", budget: "৳5,76,755 — ৳10,00,000+" },
  { name: "ওমরাহ", purpose: "ওমরাহ", visa: "Umrah e-visa ($117)", transport: "Dhaka→Jeddah: ৳65,000-1,20,000", stay: "Makkah hotel: SAR 200-800/রাত", must: "Tawaf, Sa'i, Madina ziyarat", budget: "৳1,50,000-3,50,000 (10-15 দিন)" },
  { name: "Riyadh / Dammam", purpose: "চাকরি / ব্যবসা", visa: "Work visa, Iqama", transport: "Dhaka→Riyadh: ৳60,000-95,000", stay: "Sharing room: SAR 300-800/মাস", must: "Edge of the World, Diriyah, Kingdom Tower", budget: "চাকরির উপর নির্ভরশীল" },
];

const POPULAR_DESTINATIONS = [
  "Cox's Bazar", "Sajek Valley", "Sundarbans", "Bandarban", "Sylhet", "Saint Martin Island",
  "Sreemangal", "Rangamati", "Kuakata", "Sundarban Cruise", "Kolkata", "Darjeeling", "Shillong",
  "Kashmir", "Goa", "Dubai", "Bali", "Maldives", "Thailand (Bangkok/Phuket)", "Malaysia (Kuala Lumpur/Langkawi)",
  "Singapore", "Nepal (Kathmandu/Pokhara)", "Bhutan", "Sri Lanka", "Turkey (Istanbul/Cappadocia)",
  "Egypt", "Makkah (Umrah)", "Madinah",
];

const markdownClass = `
  max-w-none text-[15px] leading-relaxed
  [&_h1]:text-xl [&_h1]:font-bold [&_h1]:mt-6 [&_h1]:mb-3
  [&_h2]:text-lg [&_h2]:font-bold [&_h2]:mt-6 [&_h2]:mb-2 [&_h2]:flex [&_h2]:items-center [&_h2]:gap-2 [&_h2]:text-primary
  [&_h3]:text-base [&_h3]:font-semibold [&_h3]:mt-4 [&_h3]:mb-2
  [&_p]:my-3 [&_p]:leading-7
  [&_ul]:my-3 [&_ul]:space-y-2 [&_ul]:pl-5 [&_ul]:list-disc [&_ul]:marker:text-primary
  [&_ol]:my-3 [&_ol]:space-y-2 [&_ol]:pl-5 [&_ol]:list-decimal [&_ol]:marker:text-primary [&_ol]:marker:font-bold
  [&_li]:pl-1 [&_li]:leading-7
  [&_strong]:text-foreground [&_strong]:font-semibold
  [&_code]:bg-primary/10 [&_code]:text-primary [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-[13px] [&_code]:font-mono
  [&_table]:my-4 [&_table]:w-full [&_table]:text-sm [&_table]:border-collapse
  [&_th]:bg-muted [&_th]:p-2 [&_th]:text-left [&_th]:font-semibold [&_th]:border [&_th]:border-border
  [&_td]:p-2 [&_td]:border [&_td]:border-border [&_td]:align-top
  [&_hr]:my-5 [&_hr]:border-border
`;

export default function TravelGuide() {
  const { language } = useLanguage();
  const isBn = language === "bn";
  const [favs, setFavs] = useState<Set<string>>(new Set());

  const toggleFav = (name: string) => {
    const next = new Set(favs);
    next.has(name) ? next.delete(name) : next.add(name);
    setFavs(next);
  };

  // Live price refresh per card
  const [priceLoading, setPriceLoading] = useState<string | null>(null);
  const [livePrices, setLivePrices] = useState<Record<string, string>>({});

  const refreshPrices = async (name: string) => {
    setPriceLoading(name);
    try {
      const { data, error } = await supabase.functions.invoke("travel-advisor", {
        body: { mode: "prices", destination: name, language },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setLivePrices((p) => ({ ...p, [name]: data.content }));
    } catch (e: any) {
      toast.error(isBn ? "দাম আনতে সমস্যা" : "Failed to fetch prices", { description: e.message });
    } finally {
      setPriceLoading(null);
    }
  };

  // Route search
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeAnswer, setRouteAnswer] = useState("");

  const searchRoute = async () => {
    if (!from.trim() || !to.trim()) {
      toast.error(isBn ? "কোথা থেকে ও কোথায় দিন" : "Enter from and to");
      return;
    }
    setRouteLoading(true);
    setRouteAnswer("");
    try {
      const { data, error } = await supabase.functions.invoke("travel-advisor", {
        body: { mode: "route", from: from.trim(), to: to.trim(), language },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setRouteAnswer(data.content);
    } catch (e: any) {
      toast.error(isBn ? "তথ্য আনতে সমস্যা" : "Failed", { description: e.message });
    } finally {
      setRouteLoading(false);
    }
  };

  // Detailed destination guide
  const [destQuery, setDestQuery] = useState("");
  const [destLoading, setDestLoading] = useState(false);
  const [destAnswer, setDestAnswer] = useState("");

  const searchDestination = async (q?: string) => {
    const query = (q ?? destQuery).trim();
    if (!query) {
      toast.error(isBn ? "গন্তব্য লিখুন" : "Enter a destination");
      return;
    }
    setDestQuery(query);
    setDestLoading(true);
    setDestAnswer("");
    try {
      const { data, error } = await supabase.functions.invoke("travel-advisor", {
        body: { mode: "destination", destination: query, language },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setDestAnswer(data.content);
    } catch (e: any) {
      toast.error(isBn ? "তথ্য আনতে সমস্যা" : "Failed", { description: e.message });
    } finally {
      setDestLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8 text-center">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/60 text-primary-foreground mb-4">
          <Plane className="h-7 w-7" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-2">
          {isBn ? "ভ্রমণ গাইড — লাইভ খরচসহ" : "Travel Guide — with Live Costs"}
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          {isBn
            ? "রুট সার্চ করে বাস/ট্রেন/ফ্লাইটের আজকের ভাড়া দেখুন, সর্বনিম্ন খরচে যাওয়ার উপায় জানুন, এবং প্রতিটি গন্তব্যের বিস্তারিত গাইড পড়ুন।"
            : "Search any route for today's bus/train/flight fares, find the cheapest way, and read detailed guides for every destination."}
        </p>
      </div>

      <Tabs defaultValue="route" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6 h-auto">
          <TabsTrigger value="route" className="flex flex-col sm:flex-row gap-1 py-2">
            <Search className="h-4 w-4" /> <span className="text-xs sm:text-sm">{isBn ? "রুট খরচ" : "Route"}</span>
          </TabsTrigger>
          <TabsTrigger value="guide" className="flex flex-col sm:flex-row gap-1 py-2">
            <Sparkles className="h-4 w-4" /> <span className="text-xs sm:text-sm">{isBn ? "বিস্তারিত গাইড" : "Detailed"}</span>
          </TabsTrigger>
          <TabsTrigger value="destinations" className="flex flex-col sm:flex-row gap-1 py-2">
            <MapPin className="h-4 w-4" /> <span className="text-xs sm:text-sm">{isBn ? "গন্তব্য" : "Destinations"}</span>
          </TabsTrigger>
        </TabsList>

        {/* ROUTE SEARCH */}
        <TabsContent value="route" className="space-y-4">
          <Card className="p-5">
            <h2 className="font-bold text-lg mb-1">{isBn ? "কোথা থেকে কোথায়?" : "From where to where?"}</h2>
            <p className="text-sm text-muted-foreground mb-4">
              {isBn ? "বাস, ট্রেন, ফ্লাইট সব মাধ্যমের আপডেট ভাড়া + সর্বনিম্ন খরচের রুট" : "Compare bus, train and flight fares + cheapest combo"}
            </p>
            <div className="grid sm:grid-cols-[1fr_1fr_auto] gap-2">
              <Input placeholder={isBn ? "যেমন: ঢাকা" : "e.g. Dhaka"} value={from} onChange={(e) => setFrom(e.target.value)} />
              <Input placeholder={isBn ? "যেমন: কক্সবাজার" : "e.g. Cox's Bazar"} value={to} onChange={(e) => setTo(e.target.value)} />
              <Button onClick={searchRoute} disabled={routeLoading}>
                {routeLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                <span className="ml-2">{isBn ? "খুঁজুন" : "Search"}</span>
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {[["Dhaka", "Cox's Bazar"], ["Dhaka", "Sylhet"], ["Dhaka", "Sajek"], ["Dhaka", "Kolkata"], ["Dhaka", "Dubai"]].map(([f, t]) => (
                <Badge key={f + t} variant="outline" className="cursor-pointer hover:bg-accent" onClick={() => { setFrom(f); setTo(t); }}>
                  {f} → {t}
                </Badge>
              ))}
            </div>
          </Card>

          {routeLoading && (
            <Card className="p-8 flex items-center justify-center gap-2 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              {isBn ? "আজকের ভাড়া আনা হচ্ছে..." : "Fetching latest fares..."}
            </Card>
          )}

          {routeAnswer && (
            <Card className="p-5">
              <article className={markdownClass}>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{routeAnswer}</ReactMarkdown>
              </article>
            </Card>
          )}
        </TabsContent>

        {/* DETAILED DESTINATION GUIDE */}
        <TabsContent value="guide" className="space-y-4">
          <Card className="p-5">
            <h2 className="font-bold text-lg mb-1">{isBn ? "যেকোনো গন্তব্যের বিস্তারিত গাইড" : "Detailed Guide — Any Destination"}</h2>
            <p className="text-sm text-muted-foreground mb-4">
              {isBn ? "কেন যাবেন, কী দেখবেন, কী খাবেন, কোথায় থাকবেন, ঝুঁকি ও সতর্কতা — সব এক জায়গায়।" : "Why visit, what to see/eat, where to stay, risks & cautions — all in one place."}
            </p>
            <div className="grid sm:grid-cols-[1fr_auto] gap-2">
              <Input
                placeholder={isBn ? "যেমন: কাশ্মীর, বালি, কক্সবাজার..." : "e.g. Kashmir, Bali, Cox's Bazar..."}
                value={destQuery}
                onChange={(e) => setDestQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && searchDestination()}
              />
              <Button onClick={() => searchDestination()} disabled={destLoading}>
                {destLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                <span className="ml-2">{isBn ? "গাইড দাও" : "Get guide"}</span>
              </Button>
            </div>
            <div className="mt-3">
              <div className="text-xs text-muted-foreground mb-2">{isBn ? "জনপ্রিয় গন্তব্য:" : "Popular:"}</div>
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                {POPULAR_DESTINATIONS.map((d) => (
                  <Badge key={d} variant="outline" className="cursor-pointer hover:bg-accent" onClick={() => searchDestination(d)}>
                    {d}
                  </Badge>
                ))}
              </div>
            </div>
          </Card>

          {destLoading && (
            <Card className="p-8 flex items-center justify-center gap-2 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              {isBn ? "বিস্তারিত গাইড তৈরি হচ্ছে..." : "Building detailed guide..."}
            </Card>
          )}

          {destAnswer && (
            <Card className="p-5">
              <article className={markdownClass}>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{destAnswer}</ReactMarkdown>
              </article>
            </Card>
          )}
        </TabsContent>

        {/* DESTINATIONS LISTING (old tabs) */}
        <TabsContent value="destinations">
          <Tabs defaultValue="bd" className="w-full">
            <TabsList className="grid w-full grid-cols-5 mb-6">
              <TabsTrigger value="bd">🇧🇩 BD</TabsTrigger>
              <TabsTrigger value="in">🇮🇳 India</TabsTrigger>
              <TabsTrigger value="ae">🇦🇪 Dubai</TabsTrigger>
              <TabsTrigger value="cn">🇨🇳 China</TabsTrigger>
              <TabsTrigger value="sa">🇸🇦 Saudi</TabsTrigger>
            </TabsList>

            <TabsContent value="bd" className="space-y-4">
              {BD_DESTINATIONS.map((d) => (
                <Card key={d.name} className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-lg">{d.name}</h3>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {d.region} • {d.days} • {isBn ? "সেরা সময়" : "Best"}: {d.bestTime}
                      </p>
                    </div>
                    <button onClick={() => toggleFav(d.name)} aria-label="favorite">
                      <Heart className={`h-5 w-5 ${favs.has(d.name) ? "fill-red-500 text-red-500" : "text-muted-foreground"}`} />
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-3">
                    {d.highlights.map((h) => <Badge key={h} variant="secondary" className="text-xs">{h}</Badge>)}
                  </div>

                  <div className="space-y-2 text-sm border-t pt-3">
                    <div className="font-semibold text-xs text-muted-foreground uppercase mb-1">{isBn ? "পরিবহন" : "Transport"}</div>
                    {d.transport.map((t, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <t.icon className="h-4 w-4 text-primary" />
                        <span className="flex-1">{t.mode}</span>
                        <span className="font-semibold">{t.cost}</span>
                      </div>
                    ))}
                  </div>

                  <div className="grid sm:grid-cols-3 gap-3 mt-3 text-xs border-t pt-3">
                    <div>
                      <div className="font-semibold text-muted-foreground mb-0.5 flex items-center gap-1"><Hotel className="h-3 w-3" />{isBn ? "থাকা" : "Stay"}</div>
                      <div>{d.stay}</div>
                    </div>
                    <div>
                      <div className="font-semibold text-muted-foreground mb-0.5">🍽️ {isBn ? "খাবার" : "Food"}</div>
                      <div>{d.food}</div>
                    </div>
                    <div>
                      <div className="font-semibold text-muted-foreground mb-0.5 flex items-center gap-1"><Camera className="h-3 w-3" />{isBn ? "টিকেট" : "Tickets"}</div>
                      <div>{d.ticket}</div>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <Wallet className="h-4 w-4 text-primary" />
                      <span className="text-sm font-semibold">{isBn ? "মোট বাজেট" : "Total"}</span>
                      <span className="text-base font-bold text-primary">
                        ৳{d.totalLow.toLocaleString()} – ৳{d.totalHigh.toLocaleString()}
                      </span>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => refreshPrices(d.name)} disabled={priceLoading === d.name}>
                      {priceLoading === d.name ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
                      <span className="ml-1.5 text-xs">{isBn ? "আজকের দাম" : "Today's price"}</span>
                    </Button>
                  </div>

                  {livePrices[d.name] && (
                    <div className="mt-3 pt-3 border-t bg-muted/30 -mx-5 -mb-5 px-5 pb-5 rounded-b-lg">
                      <article className={markdownClass}>
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{livePrices[d.name]}</ReactMarkdown>
                      </article>
                    </div>
                  )}
                </Card>
              ))}
            </TabsContent>

            {[
              { val: "in", list: INDIA_DESTINATIONS },
              { val: "ae", list: DUBAI_DESTINATIONS },
              { val: "cn", list: CHINA_DESTINATIONS },
              { val: "sa", list: SAUDI_DESTINATIONS },
            ].map(({ val, list }) => (
              <TabsContent key={val} value={val} className="space-y-4">
                {list.map((d: any) => (
                  <Card key={d.name} className="p-5">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-bold text-lg">{d.name}</h3>
                        <Badge variant="outline" className="text-xs mt-1">{d.purpose}</Badge>
                      </div>
                      <button onClick={() => toggleFav(d.name)} aria-label="favorite">
                        <Heart className={`h-5 w-5 ${favs.has(d.name) ? "fill-red-500 text-red-500" : "text-muted-foreground"}`} />
                      </button>
                    </div>
                    <div className="space-y-2 text-sm mt-3">
                      <p><span className="font-semibold">📋 Visa:</span> {d.visa}</p>
                      <p><span className="font-semibold">✈️ Transport:</span> {d.transport}</p>
                      <p><span className="font-semibold">🏨 Stay:</span> {d.stay}</p>
                      <p><span className="font-semibold">⭐ Must do:</span> {d.must}</p>
                    </div>
                    <div className="mt-3 pt-3 border-t flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <Wallet className="h-4 w-4 text-primary" />
                        <span className="text-sm font-semibold">{isBn ? "বাজেট" : "Budget"}</span>
                        <span className="text-base font-bold text-primary">{d.budget}</span>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => refreshPrices(d.name)} disabled={priceLoading === d.name}>
                        {priceLoading === d.name ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
                        <span className="ml-1.5 text-xs">{isBn ? "আজকের দাম" : "Today's price"}</span>
                      </Button>
                    </div>
                    {livePrices[d.name] && (
                      <div className="mt-3 pt-3 border-t bg-muted/30 -mx-5 -mb-5 px-5 pb-5 rounded-b-lg">
                        <article className={markdownClass}>
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>{livePrices[d.name]}</ReactMarkdown>
                        </article>
                      </div>
                    )}
                  </Card>
                ))}
              </TabsContent>
            ))}
          </Tabs>
        </TabsContent>
      </Tabs>

      <Card className="mt-6 p-4 bg-muted/30">
        <p className="text-xs text-muted-foreground flex items-start gap-2">
          <Star className="h-3 w-3 mt-0.5 flex-shrink-0" />
          {isBn
            ? "“আজকের দাম” বাটনে চাপ দিলে AI বর্তমান বাজার অনুযায়ী আনুমানিক ভাড়া এনে দেয়। বুকিং এর আগে অফিসিয়াল সোর্সে যাচাই করুন।"
            : "Tap “Today's price” to fetch up-to-date estimates via AI. Always verify with official sources before booking."}
        </p>
      </Card>
    </div>
  );
}
