import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plane, MapPin, Wallet, Bus, Train, Ship, Hotel, Camera, Heart, Star } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

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
  {
    name: "কলকাতা (Kolkata)", purpose: "ভ্রমণ + শপিং",
    visa: "Indian tourist visa ($35-50)",
    transport: "Maitree Express (ঢাকা-কলকাতা): ৳3,500-5,000 / বাস (Shyamoli): ৳1,800-2,500",
    stay: "₹800-3,000/রাত (Sudder Street এলাকায়)",
    must: "Victoria Memorial, New Market shopping, Park Street খাবার, Howrah Bridge",
    budget: "৳25,000-50,000 (3-4 দিন)",
  },
  {
    name: "চেন্নাই/ভেলোর (Vellore)", purpose: "চিকিৎসা",
    visa: "Medical visa (Apollo/CMC এর appointment letter লাগবে)",
    transport: "Dhaka→Chennai ফ্লাইট: ৳22,000-35,000 (US-Bangla/IndiGo)",
    stay: "CMC এলাকায় guesthouse ₹500-2,000/রাত",
    must: "CMC Vellore বা Apollo Chennai এ পরীক্ষা/চিকিৎসা",
    budget: "৳60,000-2,00,000+ (চিকিৎসার ধরন অনুযায়ী)",
  },
  {
    name: "শিলং/মেঘালয় (Shillong)", purpose: "প্রাকৃতিক ভ্রমণ",
    visa: "Tourist visa (Dawki land port দিয়ে)",
    transport: "Sylhet→Tamabil→Dawki→Shillong সড়কপথে ৳3,000-5,000",
    stay: "₹1,000-4,000/রাত",
    must: "Cherrapunji, Mawlynnong (এশিয়ার ক্লিনেস্ট গ্রাম), Dawki Umngot নদী",
    budget: "৳20,000-40,000 (4-5 দিন)",
  },
  {
    name: "দার্জিলিং/সিকিম", purpose: "পাহাড় ভ্রমণ",
    visa: "Tourist visa + Sikkim ILP",
    transport: "Kolkata→NJP ট্রেন→জিপ ₹3,000-5,000",
    stay: "₹1,200-5,000/রাত",
    must: "Tiger Hill sunrise, toy train, Tsomgo lake (Sikkim)",
    budget: "৳35,000-65,000 (5-7 দিন)",
  },
  {
    name: "আগ্রা + দিল্লি", purpose: "ঐতিহাসিক",
    visa: "Tourist visa",
    transport: "Dhaka→Delhi ফ্লাইট ৳18,000-35,000",
    stay: "₹1,500-6,000/রাত",
    must: "Taj Mahal, Red Fort, Qutub Minar, Chandni Chowk",
    budget: "৳40,000-80,000 (5-6 দিন)",
  },
];

const DUBAI_DESTINATIONS = [
  {
    name: "দুবাই (UAE)", purpose: "শপিং + ভ্রমণ + কাজের ইন্টারভিউ",
    visa: "UAE tourist visa: ৳12,000-18,000 (60 দিন)",
    transport: "Dhaka→Dubai ফ্লাইট: ৳40,000-75,000 (Emirates/Biman/Air Arabia)",
    stay: "AED 200-1,500/রাত (Deira সস্তা, Marina লাক্সারি)",
    must: "Burj Khalifa (AED 169), Desert Safari (AED 200), Dubai Mall, Palm Jumeirah, Global Village (AED 25)",
    budget: "৳1,20,000-3,00,000 (5-7 দিন)",
  },
  {
    name: "আবু ধাবি (Abu Dhabi)", purpose: "ধর্মীয় + পারিবারিক",
    visa: "Same UAE visa",
    transport: "Dubai→Abu Dhabi বাস: AED 25 (2 ঘণ্টা)",
    stay: "AED 250-1,200/রাত",
    must: "Sheikh Zayed Grand Mosque (free), Ferrari World (AED 295), Yas Island",
    budget: "৳20,000-50,000 (2-3 দিন add-on)",
  },
];

const CHINA_DESTINATIONS = [
  {
    name: "গুয়াংঝু (Guangzhou)", purpose: "ব্যবসা / wholesale shopping",
    visa: "Business or M visa (invitation letter সহজ)",
    transport: "Dhaka→Guangzhou ফ্লাইট: ৳45,000-75,000 (China Southern/US-Bangla)",
    stay: "¥150-600/রাত",
    must: "Canton Fair (April/Oct), Yiwu market trip, Dafen গ্রাম",
    budget: "৳1,50,000-3,50,000 (7-10 দিন)",
  },
  {
    name: "বেইজিং (Beijing)", purpose: "ভ্রমণ + ঐতিহ্য",
    visa: "L tourist visa",
    transport: "Dhaka→Beijing ফ্লাইট: ৳55,000-90,000",
    stay: "¥200-800/রাত",
    must: "Great Wall (¥45-60), Forbidden City (¥40), Tiananmen Square, Hutongs",
    budget: "৳1,80,000-3,50,000 (6-8 দিন)",
  },
  {
    name: "Kunming/Yunnan", purpose: "চিকিৎসা ও ভ্রমণ",
    visa: "Tourist or medical visa",
    transport: "Dhaka→Kunming ফ্লাইট: ৳40,000-65,000",
    stay: "¥150-500/রাত",
    must: "Stone Forest, Lijiang old town, Tiger Leaping Gorge",
    budget: "৳1,20,000-2,50,000 (7 দিন)",
  },
];

const SAUDI_DESTINATIONS = [
  {
    name: "মক্কা ও মদিনা (হজ)", purpose: "হজ",
    visa: "Hajj visa — সরকারি/বেসরকারি এজেন্সির মাধ্যমে",
    transport: "Dhaka→Jeddah ফ্লাইট প্যাকেজে অন্তর্ভুক্ত",
    stay: "Hotel + খাবার সব প্যাকেজে",
    must: "Tawaf, Sa'i, Arafat, Muzdalifah, Mina, Mosque al-Nabawi",
    budget: "সরকারি প্যাকেজ: ৳5,76,755 — ৳10,00,000+ (2025)",
  },
  {
    name: "ওমরাহ (সারা বছর)", purpose: "ওমরাহ",
    visa: "Umrah visa — agency বা e-visa ($117)",
    transport: "Dhaka→Jeddah ফ্লাইট: ৳65,000-1,20,000",
    stay: "Makkah hotel: SAR 200-800/রাত",
    must: "Tawaf, Sa'i, Madina ziyarat (8 দিন standard প্যাকেজ)",
    budget: "৳1,50,000-3,50,000 (10-15 দিন)",
  },
  {
    name: "Riyadh / Dammam", purpose: "চাকরি / ব্যবসা",
    visa: "Work visa, Iqama লাগবে",
    transport: "Dhaka→Riyadh ফ্লাইট: ৳60,000-95,000",
    stay: "Sharing room: SAR 300-800/মাস",
    must: "Edge of the World, Diriyah, Kingdom Tower",
    budget: "চাকরির উপর নির্ভরশীল",
  },
];

export default function TravelGuide() {
  const { language } = useLanguage();
  const isBn = language === "bn";
  const [favs, setFavs] = useState<Set<string>>(new Set());

  const toggleFav = (name: string) => {
    const next = new Set(favs);
    next.has(name) ? next.delete(name) : next.add(name);
    setFavs(next);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8 text-center">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/60 text-primary-foreground mb-4">
          <Plane className="h-7 w-7" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-2">
          {isBn ? "ভ্রমণ গাইড — সম্ভাব্য খরচসহ" : "Travel Guide — with Estimated Costs"}
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          {isBn
            ? "বাংলাদেশের জনপ্রিয় গন্তব্য থেকে শুরু করে ভারত, দুবাই, চীন ও সৌদি আরবের হজ/ওমরাহ — পরিবহন, থাকা, টিকেট সব মিলিয়ে আনুমানিক বাজেট"
            : "From popular Bangladesh destinations to India, Dubai, China and Saudi Hajj/Umrah — transport, stay, tickets and total budget estimates"}
        </p>
      </div>

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

              <div className="mt-3 pt-3 border-t flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold">{isBn ? "মোট বাজেট" : "Total budget"}</span>
                </div>
                <span className="text-base font-bold text-primary">
                  ৳{d.totalLow.toLocaleString()} – ৳{d.totalHigh.toLocaleString()}
                </span>
              </div>
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
                <div className="mt-3 pt-3 border-t flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wallet className="h-4 w-4 text-primary" />
                    <span className="text-sm font-semibold">{isBn ? "আনুমানিক বাজেট" : "Budget"}</span>
                  </div>
                  <span className="text-base font-bold text-primary">{d.budget}</span>
                </div>
              </Card>
            ))}
          </TabsContent>
        ))}
      </Tabs>

      <Card className="mt-6 p-4 bg-muted/30">
        <p className="text-xs text-muted-foreground flex items-start gap-2">
          <Star className="h-3 w-3 mt-0.5 flex-shrink-0" />
          {isBn
            ? "সব খরচ আনুমানিক (নভেম্বর 2025) — সিজন, ফ্লাইট কোম্পানি ও কারেন্সি রেট অনুযায়ী পরিবর্তন হতে পারে। বুক করার আগে আপডেটেড দাম যাচাই করুন।"
            : "All costs are estimates (Nov 2025) — they vary with season, airline and currency rate. Verify updated prices before booking."}
        </p>
      </Card>
    </div>
  );
}
