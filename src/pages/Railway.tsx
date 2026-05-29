import { useEffect, useMemo, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Train, ExternalLink, MapPin, Bell, Camera, Phone, Search, Clock, BellRing, CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";


// Curated Bangladesh Railway data — major stations & popular intercity trains.
// Data is approximate and based on public BR schedule (Nov 2024 print).
// For live availability we deep-link to the official eticket portal.

const STATIONS = [
  "Dhaka (Kamalapur)", "Dhaka (Bimanbandar)", "Dhaka (Tejgaon)",
  "Chattogram", "Sylhet", "Khulna", "Rajshahi", "Rangpur", "Dinajpur",
  "Bogura", "Cumilla", "Brahmanbaria", "Akhaura", "Lalmonirhat",
  "Jamalpur", "Mymensingh", "Tangail", "Joydebpur", "Narsingdi",
  "Chapainawabganj", "Ishwardi", "Pabna", "Faridpur", "Jessore",
  "Cox's Bazar", "Feni", "Noakhali", "Bhairab Bazar", "Kishoreganj",
  "Sirajganj", "Natore", "Parbatipur", "Saidpur", "Thakurgaon",
];

type Train = {
  name: string;
  number: string;
  from: string;
  to: string;
  depart: string;
  arrive: string;
  off: string; // off day
  classes: string[];
  fareAC: number;
  fareSnigdha: number;
  fareShovan: number;
};

const TRAINS: Train[] = [
  { name: "Subarna Express", number: "701/702", from: "Dhaka (Kamalapur)", to: "Chattogram", depart: "16:30", arrive: "21:50", off: "Monday", classes: ["AC_S","SNIGDHA","S_CHAIR"], fareAC: 1226, fareSnigdha: 805, fareShovan: 425 },
  { name: "Sonar Bangla Express", number: "787/788", from: "Dhaka (Kamalapur)", to: "Chattogram", depart: "07:00", arrive: "12:20", off: "Tuesday", classes: ["AC_B","AC_S","SNIGDHA","S_CHAIR"], fareAC: 1422, fareSnigdha: 805, fareShovan: 425 },
  { name: "Mahanagar Provati", number: "704", from: "Dhaka (Kamalapur)", to: "Chattogram", depart: "07:45", arrive: "13:55", off: "None", classes: ["AC_S","SNIGDHA","S_CHAIR","SHOVAN"], fareAC: 1150, fareSnigdha: 770, fareShovan: 405 },
  { name: "Mahanagar Express", number: "722", from: "Dhaka (Kamalapur)", to: "Chattogram", depart: "21:20", arrive: "04:50", off: "Sunday", classes: ["AC_B","AC_S","SNIGDHA","S_CHAIR"], fareAC: 1422, fareSnigdha: 805, fareShovan: 405 },
  { name: "Turna Express", number: "742", from: "Dhaka (Kamalapur)", to: "Chattogram", depart: "23:00", arrive: "06:20", off: "None", classes: ["AC_B","AC_S","SNIGDHA","S_CHAIR"], fareAC: 1422, fareSnigdha: 805, fareShovan: 405 },
  { name: "Cox's Bazar Express", number: "813/814", from: "Dhaka (Kamalapur)", to: "Cox's Bazar", depart: "22:30", arrive: "07:20", off: "Tuesday", classes: ["AC_B","AC_S","SNIGDHA","S_CHAIR"], fareAC: 2380, fareSnigdha: 1325, fareShovan: 695 },
  { name: "Parjatak Express", number: "815/816", from: "Dhaka (Kamalapur)", to: "Cox's Bazar", depart: "06:15", arrive: "15:00", off: "Sunday", classes: ["AC_B","AC_S","SNIGDHA","S_CHAIR"], fareAC: 2380, fareSnigdha: 1325, fareShovan: 695 },
  { name: "Parabat Express", number: "709/710", from: "Dhaka (Kamalapur)", to: "Sylhet", depart: "06:30", arrive: "13:00", off: "Tuesday", classes: ["AC_S","SNIGDHA","S_CHAIR"], fareAC: 1099, fareSnigdha: 736, fareShovan: 395 },
  { name: "Joyantika Express", number: "717/718", from: "Dhaka (Kamalapur)", to: "Sylhet", depart: "11:15", arrive: "19:00", off: "None", classes: ["AC_S","SNIGDHA","S_CHAIR","SHOVAN"], fareAC: 1099, fareSnigdha: 736, fareShovan: 320 },
  { name: "Upaban Express", number: "739/740", from: "Dhaka (Kamalapur)", to: "Sylhet", depart: "20:30", arrive: "05:00", off: "Wednesday", classes: ["AC_B","AC_S","SNIGDHA","S_CHAIR"], fareAC: 1396, fareSnigdha: 736, fareShovan: 395 },
  { name: "Kalni Express", number: "773/774", from: "Dhaka (Kamalapur)", to: "Sylhet", depart: "15:00", arrive: "21:30", off: "Friday", classes: ["AC_S","SNIGDHA","S_CHAIR"], fareAC: 1099, fareSnigdha: 736, fareShovan: 395 },
  { name: "Sundarban Express", number: "725/726", from: "Dhaka (Kamalapur)", to: "Khulna", depart: "08:15", arrive: "17:40", off: "Tuesday", classes: ["AC_B","AC_S","SNIGDHA","S_CHAIR"], fareAC: 1864, fareSnigdha: 1004, fareShovan: 525 },
  { name: "Chitra Express", number: "763/764", from: "Dhaka (Kamalapur)", to: "Khulna", depart: "19:00", arrive: "03:40", off: "Monday", classes: ["AC_B","AC_S","SNIGDHA","S_CHAIR"], fareAC: 1864, fareSnigdha: 1004, fareShovan: 525 },
  { name: "Banalata Express", number: "791/792", from: "Dhaka (Kamalapur)", to: "Rajshahi", depart: "13:30", arrive: "19:30", off: "Friday", classes: ["AC_B","AC_S","SNIGDHA","S_CHAIR"], fareAC: 1232, fareSnigdha: 656, fareShovan: 375 },
  { name: "Silk City Express", number: "753/754", from: "Dhaka (Kamalapur)", to: "Rajshahi", depart: "14:40", arrive: "20:30", off: "Sunday", classes: ["AC_S","SNIGDHA","S_CHAIR","SHOVAN"], fareAC: 1232, fareSnigdha: 656, fareShovan: 340 },
  { name: "Padma Express", number: "759/760", from: "Dhaka (Kamalapur)", to: "Rajshahi", depart: "23:00", arrive: "04:30", off: "Tuesday", classes: ["AC_B","AC_S","SNIGDHA","S_CHAIR"], fareAC: 1232, fareSnigdha: 656, fareShovan: 340 },
  { name: "Dhumketu Express", number: "769/770", from: "Dhaka (Kamalapur)", to: "Rajshahi", depart: "06:00", arrive: "11:40", off: "Saturday", classes: ["AC_S","SNIGDHA","S_CHAIR"], fareAC: 1232, fareSnigdha: 656, fareShovan: 340 },
  { name: "Rangpur Express", number: "771/772", from: "Dhaka (Kamalapur)", to: "Rangpur", depart: "09:10", arrive: "19:05", off: "Sunday", classes: ["AC_B","AC_S","SNIGDHA","S_CHAIR"], fareAC: 2050, fareSnigdha: 1093, fareShovan: 565 },
  { name: "Drutajan Express", number: "757/758", from: "Dhaka (Kamalapur)", to: "Dinajpur", depart: "20:00", arrive: "05:55", off: "Wednesday", classes: ["AC_B","AC_S","SNIGDHA","S_CHAIR"], fareAC: 2050, fareSnigdha: 1093, fareShovan: 565 },
  { name: "Ekota Express", number: "705/706", from: "Dhaka (Kamalapur)", to: "Dinajpur", depart: "10:10", arrive: "20:05", off: "Tuesday", classes: ["AC_B","AC_S","SNIGDHA","S_CHAIR"], fareAC: 2050, fareSnigdha: 1093, fareShovan: 565 },
  { name: "Tista Express", number: "707/708", from: "Dhaka (Kamalapur)", to: "Dewanganj", depart: "07:30", arrive: "12:25", off: "Monday", classes: ["SNIGDHA","S_CHAIR","SHOVAN"], fareAC: 0, fareSnigdha: 405, fareShovan: 215 },
  { name: "Brahmaputra Express", number: "743/744", from: "Dhaka (Kamalapur)", to: "Dewanganj", depart: "18:00", arrive: "23:15", off: "None", classes: ["SNIGDHA","S_CHAIR","SHOVAN"], fareAC: 0, fareSnigdha: 405, fareShovan: 215 },
  { name: "Egarosindhur Provati", number: "737", from: "Dhaka (Kamalapur)", to: "Kishoreganj", depart: "07:15", arrive: "11:00", off: "Wednesday", classes: ["S_CHAIR","SHOVAN"], fareAC: 0, fareSnigdha: 0, fareShovan: 165 },
  { name: "Mohanganj Express", number: "789/790", from: "Dhaka (Kamalapur)", to: "Mohanganj", depart: "14:20", arrive: "20:30", off: "Monday", classes: ["SNIGDHA","S_CHAIR","SHOVAN"], fareAC: 0, fareSnigdha: 360, fareShovan: 195 },
];

const PLATFORM_CCTV = [
  { name: "Kamalapur Railway Station Live (BR)", url: "https://www.youtube.com/results?search_query=kamalapur+railway+station+live" },
  { name: "Chattogram Station Surveillance Feeds", url: "https://www.youtube.com/results?search_query=chittagong+railway+station+live" },
  { name: "Sylhet Station — Public Cams", url: "https://www.youtube.com/results?search_query=sylhet+railway+station+live" },
  { name: "Rajshahi Station — Public Cams", url: "https://www.youtube.com/results?search_query=rajshahi+railway+station+live" },
  { name: "Insecam — Bangladesh Public Cameras", url: "http://www.insecam.org/en/bycountry/BD/" },
];

const todayDay = () => new Date().toLocaleDateString("en-US", { weekday: "long" });

export default function Railway() {
  const { language } = useLanguage();
  const isBn = language === "bn";
  const { toast } = useToast();

  const [from, setFrom] = useState("Dhaka (Kamalapur)");
  const [to, setTo] = useState("Chattogram");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [phone, setPhone] = useState("");
  const [alertName, setAlertName] = useState("");
  const [alertChannel, setAlertChannel] = useState<"browser" | "sms" | "whatsapp">("browser");
  const [alertTrain, setAlertTrain] = useState<string>("");
  const [alertClass, setAlertClass] = useState<string>("");
  const [subscribing, setSubscribing] = useState(false);
  const [subscribed, setSubscribed] = useState<{ id: string; phone: string } | null>(null);
  const [liveAlerts, setLiveAlerts] = useState<any[]>([]);
  const [searchedPair, setSearchedPair] = useState<{ from: string; to: string } | null>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const matches = useMemo(() => {
    if (!searchedPair) return [];
    return TRAINS.filter(
      (t) =>
        t.from.toLowerCase().includes(searchedPair.from.toLowerCase()) &&
        t.to.toLowerCase().includes(searchedPair.to.toLowerCase())
    );
  }, [searchedPair]);

  const today = todayDay();

  const eticketUrl = (t: Train) => {
    const params = new URLSearchParams({
      fromcity: t.from.split(" ")[0],
      tocity: t.to.split(" ")[0],
      doj: date.split("-").reverse().join("-"),
      class: t.classes[0] || "S_CHAIR",
    });
    return `https://eticket.railway.gov.bd/booking/train/search?${params}`;
  };

  const handleSearch = () => setSearchedPair({ from, to });

  // Restore subscription from localStorage so refresh keeps the active alert
  useEffect(() => {
    const saved = localStorage.getItem("train_alert_sub");
    if (saved) {
      try { setSubscribed(JSON.parse(saved)); } catch { /* ignore */ }
    }
  }, []);

  // Subscribe to realtime notifications for this phone
  useEffect(() => {
    if (!subscribed?.phone) return;
    // Ask browser notification permission once
    if (typeof Notification !== "undefined" && Notification.permission === "default") {
      Notification.requestPermission().catch(() => {});
    }
    // Load any recent existing notifications
    supabase
      .from("train_alert_notifications")
      .select("*")
      .eq("phone", subscribed.phone)
      .order("created_at", { ascending: false })
      .limit(10)
      .then(({ data }) => { if (data) setLiveAlerts(data); });

    channelRef.current = supabase
      .channel(`train-alerts-${subscribed.phone}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "train_alert_notifications", filter: `phone=eq.${subscribed.phone}` },
        (payload) => {
          const n: any = payload.new;
          setLiveAlerts((prev) => [n, ...prev].slice(0, 20));
          // Browser notification
          if (typeof Notification !== "undefined" && Notification.permission === "granted") {
            try {
              new Notification(isBn ? "🚆 ট্রেন টিকেট পাওয়া যাচ্ছে!" : "🚆 Train tickets available!", {
                body: n.message,
                icon: "/placeholder.svg",
                tag: `train-${n.id}`,
              });
            } catch { /* ignore */ }
          }
          // Toast fallback
          toast({
            title: isBn ? "🚆 টিকেট পাওয়া যাচ্ছে!" : "🚆 Tickets available!",
            description: n.message,
          });
        }
      )
      .subscribe();

    return () => {
      if (channelRef.current) supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    };
  }, [subscribed?.phone, isBn, toast]);

  // Normalize Bangladeshi phone numbers: accept 01XXXXXXXXX, 8801XXXXXXXXX, +8801XXXXXXXXX,
  // strip spaces/dashes, and always store in international E.164 (+8801XXXXXXXXX).
  const normalizeBdPhone = (raw: string): string | null => {
    const digits = raw.replace(/[^\d]/g, "");
    if (digits.length === 11 && digits.startsWith("01")) return `+880${digits.slice(1)}`;
    if (digits.length === 13 && digits.startsWith("8801")) return `+${digits}`;
    if (digits.length === 14 && digits.startsWith("88001")) return `+880${digits.slice(4)}`; // tolerate typo
    return null;
  };

  const handleAlertSubscribe = async () => {
    const normalized = normalizeBdPhone(phone);
    if (!normalized) {
      toast({
        title: isBn ? "ফোন নাম্বার সঠিক নয়" : "Invalid phone number",
        description: isBn
          ? "১১ ডিজিটের নাম্বার দিন (যেমন: 01774585757) — কান্ট্রি কোড লাগবে না।"
          : "Enter your 11-digit BD number (e.g. 01774585757) — no country code needed.",
        variant: "destructive",
      });
      return;
    }
    setSubscribing(true);
    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from("train_alert_subscribers")
      .insert({
        user_id: user?.id ?? null,
        name: alertName || null,
        phone: normalized,
        channel: alertChannel,
        from_station: from,
        to_station: to,
        journey_date: date,
        train_number: alertTrain || null,
        seat_class: alertClass || null,
        language: isBn ? "bn" : "en",
      })
      .select("id, phone")
      .single();
    setSubscribing(false);

    if (error || !data) {
      toast({ title: "Error", description: error?.message ?? "Failed", variant: "destructive" });
      return;
    }
    const sub = { id: data.id, phone: data.phone };
    setSubscribed(sub);
    localStorage.setItem("train_alert_sub", JSON.stringify(sub));

    // Trigger an immediate single-cycle check (skip burst for the on-subscribe ping)
    supabase.functions.invoke("check-train-availability", { body: {} }).catch(() => {});

    if (typeof Notification !== "undefined" && Notification.permission === "default") {
      try { await Notification.requestPermission(); } catch { /* ignore */ }
    }

    toast({
      title: isBn ? "✅ সাবস্ক্রাইব হয়েছে" : "✅ Subscribed",
      description: isBn
        ? "টিকেট পাওয়া গেলে সাথে সাথে ব্রাউজার নোটিফিকেশন পাবেন। পেজ বন্ধ করলেও কাজ করবে যদি নোটিফিকেশন allow করা থাকে।"
        : "You'll get a browser notification the moment seats open up.",
    });
  };

  const handleUnsubscribe = async () => {
    if (!subscribed) return;
    await supabase
      .from("train_alert_subscribers")
      .update({ active: false })
      .eq("id", subscribed.id);
    localStorage.removeItem("train_alert_sub");
    setSubscribed(null);
    setLiveAlerts([]);
    toast({ title: isBn ? "অ্যালার্ট বন্ধ" : "Alert stopped" });
  };


  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8 text-center">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/60 text-primary-foreground mb-4">
          <Train className="h-7 w-7" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-2">
          {isBn ? "বাংলাদেশ রেলওয়ে — স্মার্ট টিকেট অ্যাসিস্ট্যান্ট" : "Bangladesh Railway — Smart Ticket Assistant"}
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          {isBn
            ? "ট্রেন খুঁজুন, ভাড়া দেখুন, এক ক্লিকে অফিসিয়াল eticket পেজে যান। টিকিট খালি হলে SMS অ্যালার্ট পান।"
            : "Find trains, view fares, jump to the official eticket page in one click. Get SMS alerts when seats open up."}
        </p>
      </div>

      <Tabs defaultValue="search" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="search"><Search className="h-4 w-4 mr-1" />{isBn ? "খুঁজুন" : "Search"}</TabsTrigger>
          <TabsTrigger value="alert"><Bell className="h-4 w-4 mr-1" />{isBn ? "অ্যালার্ট" : "Alert"}</TabsTrigger>
          <TabsTrigger value="tracker"><MapPin className="h-4 w-4 mr-1" />{isBn ? "ট্র্যাকার" : "Tracker"}</TabsTrigger>
          <TabsTrigger value="cctv"><Camera className="h-4 w-4 mr-1" />CCTV</TabsTrigger>
        </TabsList>

        {/* SEARCH TAB */}
        <TabsContent value="search" className="space-y-4">
          <Card className="p-5">
            <div className="grid md:grid-cols-4 gap-3">
              <div>
                <Label className="text-xs">{isBn ? "কোথা থেকে" : "From"}</Label>
                <select
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                >
                  {STATIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <Label className="text-xs">{isBn ? "কোথায়" : "To"}</Label>
                <select
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                >
                  {STATIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <Label className="text-xs">{isBn ? "তারিখ" : "Date"}</Label>
                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
              <div className="flex items-end">
                <Button onClick={handleSearch} className="w-full">
                  <Search className="h-4 w-4 mr-2" />{isBn ? "ট্রেন খুঁজুন" : "Find Trains"}
                </Button>
              </div>
            </div>
          </Card>

          {searchedPair && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">
                  {matches.length} {isBn ? "টি ট্রেন পাওয়া গেছে" : "trains found"}
                </h3>
                <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />{isBn ? "আজ" : "Today"}: {today}</Badge>
              </div>
              {matches.length === 0 && (
                <Card className="p-8 text-center text-muted-foreground">
                  {isBn ? "এই রুটে সরাসরি ট্রেন নেই। বিকল্প রুট চেক করুন।" : "No direct train on this route. Check alternative routes."}
                </Card>
              )}
              {matches.map((t) => {
                const isOff = t.off === today;
                return (
                  <Card key={t.number} className="p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-bold">{t.name}</h4>
                          <Badge variant="outline" className="text-xs">#{t.number}</Badge>
                          {isOff && <Badge variant="destructive" className="text-xs">{isBn ? "আজ বন্ধ" : "Off Today"}</Badge>}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {t.from} → {t.to}
                        </div>
                        <div className="flex items-center gap-3 mt-2 text-sm">
                          <span className="font-mono">🕘 {t.depart}</span>
                          <span>→</span>
                          <span className="font-mono">{t.arrive}</span>
                          {t.off !== "None" && (
                            <span className="text-xs text-muted-foreground">
                              ({isBn ? "বন্ধ" : "Off"}: {t.off})
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2 mt-3 text-xs">
                          {t.fareAC > 0 && <Badge variant="secondary">AC: ৳{t.fareAC}</Badge>}
                          {t.fareSnigdha > 0 && <Badge variant="secondary">Snigdha: ৳{t.fareSnigdha}</Badge>}
                          {t.fareShovan > 0 && <Badge variant="secondary">Shovan: ৳{t.fareShovan}</Badge>}
                        </div>
                      </div>
                      <Button asChild size="sm">
                        <a href={eticketUrl(t)} target="_blank" rel="noreferrer">
                          {isBn ? "টিকেট কাটুন" : "Buy Ticket"} <ExternalLink className="h-3 w-3 ml-1" />
                        </a>
                      </Button>
                    </div>
                  </Card>
                );
              })}
              <p className="text-xs text-muted-foreground text-center">
                {isBn
                  ? "অফিসিয়াল eticket পোর্টালে রিয়েল-টাইম availability ও সিট সিলেকশন দেখা যাবে।"
                  : "Real-time seat availability shown on the official eticket portal."}
              </p>
            </div>
          )}
        </TabsContent>

        {/* ALERT TAB */}
        <TabsContent value="alert" className="space-y-4">
          <Card className="p-6 max-w-2xl mx-auto">
            <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
              <BellRing className="h-5 w-5 text-primary" />
              {isBn ? "টিকেট খালি হলে সাথে সাথে অ্যালার্ট" : "Instant alert when seats open"}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {isBn
                ? "প্রতি ২ মিনিটে আমরা অফিসিয়াল BR সার্ভার চেক করি। ক্যানসেল বা এক্সট্রা বগি যোগ হলে সিট খালি হওয়া মাত্রই আপনার ব্রাউজারে নোটিফিকেশন পাঠাই — পেজ বারবার রিফ্রেশ করতে হবে না, একদম ফ্রি।"
                : "Every 2 minutes we poll the official BR server. The moment seats open (cancellation or extra coach), you get a browser notification — no refresh, no cost."}
            </p>

            {/* Notification setup guidelines */}
            <div className="mb-5 rounded-lg border border-primary/20 bg-primary/5 p-4">
              <div className="flex items-center gap-2 mb-2 font-semibold text-sm">
                <BellRing className="h-4 w-4 text-primary" />
                {isBn ? "নোটিফিকেশন পাওয়ার গাইডলাইন (অবশ্যই পড়ুন)" : "Notification setup guide (please read)"}
              </div>
              <ol className="text-xs space-y-1.5 text-muted-foreground list-decimal list-inside">
                {isBn ? (
                  <>
                    <li>সাবস্ক্রাইব করার পর ব্রাউজার যখন "Allow Notifications" prompt দেখাবে — অবশ্যই <strong className="text-foreground">Allow</strong> চাপুন।</li>
                    <li>মোবাইলে Chrome/Brave ব্যবহার করুন। সাইটটি একবার <strong className="text-foreground">হোম স্ক্রিনে Add</strong> করে নিলে ব্যাকগ্রাউন্ডেও নোটিফিকেশন আসবে।</li>
                    <li>iPhone (Safari) ব্যবহারকারী: Settings → Safari → Advanced → Experimental Features → <strong className="text-foreground">Push API</strong> on করুন (iOS 16.4+)।</li>
                    <li>ফোনের Settings এ গিয়ে এই ব্রাউজারের জন্য Notification <strong className="text-foreground">Allow + Sound + Lock screen</strong> অন রাখুন।</li>
                    <li>"Do Not Disturb" বা "Focus" মোড অফ রাখুন, না হলে নোটিফিকেশন silent হয়ে যাবে।</li>
                    <li>SMS/WhatsApp বেছে নিলে — নাম্বারটি <strong className="text-foreground">+880</strong> দিয়ে শুরু করুন (যেমন +8801XXXXXXXXX)। WhatsApp এর ক্ষেত্রে প্রথমবার আমাদের sandbox এ <code className="px-1 rounded bg-muted">join</code> মেসেজ পাঠাতে হবে — সাবস্ক্রাইব করলে আমরা ইনস্ট্রাকশন পাঠাব।</li>
                    <li><strong className="text-foreground">দ্রুত অ্যালার্ট:</strong> আমরা প্রতি <strong className="text-foreground">১ মিনিটে</strong> Bangladesh Railway সার্ভার চেক করি — সিট খালি হলে সাধারণত <strong className="text-foreground">২–৫ মিনিটের মধ্যে</strong> আপনি নোটিফিকেশন পেয়ে যাবেন। সাথে সাথে <a href="https://eticket.railway.gov.bd" target="_blank" rel="noreferrer" className="text-primary underline">eticket.railway.gov.bd</a> এ গিয়ে বুক করুন — দেরি করলে টিকেট অন্য কেউ নিয়ে নিবে।</li>
                    <li>ব্রাউজার বা সাইটের ডেটা মুছলে অ্যালার্ট আবার চালু করতে হবে।</li>
                  </>
                ) : (
                  <>
                    <li>When the browser shows the "Allow Notifications" prompt, you must tap <strong className="text-foreground">Allow</strong>.</li>
                    <li>On mobile use Chrome/Brave. <strong className="text-foreground">Add to Home Screen</strong> once — background notifications will work even when the tab is closed.</li>
                    <li>iPhone (Safari): turn on Settings → Safari → Advanced → Experimental Features → <strong className="text-foreground">Push API</strong> (iOS 16.4+).</li>
                    <li>In phone Settings, allow this browser to send notifications with <strong className="text-foreground">Sound + Lock screen</strong> enabled.</li>
                    <li>Turn off "Do Not Disturb" / "Focus" mode, otherwise alerts will be silenced.</li>
                    <li>For SMS/WhatsApp, enter the number in <strong className="text-foreground">+880</strong> format (e.g. +8801XXXXXXXXX). WhatsApp requires sending a one-time <code className="px-1 rounded bg-muted">join</code> code to our sandbox — we'll share the instruction after subscribe.</li>
                    <li><strong className="text-foreground">Fast alerts:</strong> we poll Bangladesh Railway <strong className="text-foreground">every 1 minute</strong> — when a seat opens you'll usually get the alert within <strong className="text-foreground">2–5 minutes</strong>. Book immediately at <a href="https://eticket.railway.gov.bd" target="_blank" rel="noreferrer" className="text-primary underline">eticket.railway.gov.bd</a> — tickets disappear fast.</li>
                    <li>Clearing browser data will deactivate the alert — re-subscribe if that happens.</li>
                  </>
                )}
              </ol>
            </div>


            {subscribed ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 p-3 rounded-md bg-green-500/10 text-green-700 dark:text-green-300">
                  <CheckCircle2 className="h-5 w-5" />
                  <div className="text-sm font-medium">
                    {isBn ? "অ্যালার্ট সক্রিয়" : "Alert active"} — {subscribed.phone}
                  </div>
                </div>
                <div className="text-sm">
                  <Label className="text-xs">{isBn ? "রুট" : "Route"}</Label>
                  <div className="font-medium">{from} → {to} • {date}</div>
                </div>
                <Button variant="outline" onClick={handleUnsubscribe} className="w-full">
                  {isBn ? "অ্যালার্ট বন্ধ করুন" : "Stop alert"}
                </Button>

                {liveAlerts.length > 0 && (
                  <div className="pt-4 border-t space-y-2">
                    <div className="text-sm font-semibold">{isBn ? "সাম্প্রতিক অ্যালার্ট" : "Recent alerts"}</div>
                    {liveAlerts.map((n) => (
                      <Card key={n.id} className="p-3 bg-primary/5 border-primary/20">
                        <div className="text-sm">{n.message}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {new Date(n.created_at).toLocaleString()}
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <Label>{isBn ? "কোথা থেকে" : "From"}</Label>
                    <select value={from} onChange={(e) => setFrom(e.target.value)} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                      {STATIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <Label>{isBn ? "কোথায়" : "To"}</Label>
                    <select value={to} onChange={(e) => setTo(e.target.value)} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                      {STATIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <Label>{isBn ? "যাত্রার তারিখ" : "Journey date"}</Label>
                    <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                  </div>
                  <div>
                    <Label>{isBn ? "ট্রেন (ঐচ্ছিক)" : "Train (optional)"}</Label>
                    <Input placeholder={isBn ? "যেকোনো ট্রেন" : "Any train"} value={alertTrain} onChange={(e) => setAlertTrain(e.target.value)} />
                  </div>
                </div>

                <div>
                  <Label>{isBn ? "ক্লাস (ঐচ্ছিক)" : "Seat class (optional)"}</Label>
                  <select value={alertClass} onChange={(e) => setAlertClass(e.target.value)} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                    <option value="">{isBn ? "যেকোনো ক্লাস" : "Any class"}</option>
                    <option value="AC_B">AC Berth</option>
                    <option value="AC_S">AC Seat</option>
                    <option value="SNIGDHA">Snigdha</option>
                    <option value="S_CHAIR">Shovan Chair</option>
                    <option value="SHOVAN">Shovan</option>
                  </select>
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <Label>{isBn ? "নাম (ঐচ্ছিক)" : "Your name (optional)"}</Label>
                    <Input value={alertName} onChange={(e) => setAlertName(e.target.value)} />
                  </div>
                  <div>
                    <Label>{isBn ? "ফোন নাম্বার" : "Phone number"} *</Label>
                    <Input type="tel" placeholder="01XXXXXXXXX" value={phone} onChange={(e) => setPhone(e.target.value)} />
                  </div>
                </div>

                <div>
                  <Label>{isBn ? "কোথায় অ্যালার্ট চান" : "Notify me via"}</Label>
                  <div className="grid grid-cols-3 gap-2 mt-1">
                    {([
                      { v: "browser", bn: "ব্রাউজার (ফ্রি)", en: "Browser (Free)" },
                      { v: "sms", bn: "SMS", en: "SMS" },
                      { v: "whatsapp", bn: "WhatsApp", en: "WhatsApp" },
                    ] as const).map((o) => (
                      <button
                        key={o.v}
                        type="button"
                        onClick={() => setAlertChannel(o.v)}
                        className={`h-10 rounded-md border text-xs font-medium transition-colors ${alertChannel === o.v ? "border-primary bg-primary/10 text-primary" : "border-input bg-background"}`}
                      >
                        {isBn ? o.bn : o.en}
                      </button>
                    ))}
                  </div>
                  {alertChannel !== "browser" && (
                    <p className="text-xs text-muted-foreground mt-2">
                      {isBn
                        ? "SMS/WhatsApp ডেলিভারি Twilio গেটওয়ে সক্রিয় হলে চালু হবে। এখনই ব্রাউজার নোটিফিকেশন ফ্রিতে চলবে।"
                        : "SMS/WhatsApp delivery activates when Twilio gateway is configured. Browser notifications work now for free."}
                    </p>
                  )}
                </div>

                <Button onClick={handleAlertSubscribe} disabled={subscribing} className="w-full">
                  <Bell className="h-4 w-4 mr-2" />
                  {subscribing
                    ? (isBn ? "সাবস্ক্রাইব হচ্ছে..." : "Subscribing...")
                    : (isBn ? "অ্যালার্ট চালু করুন (ফ্রি)" : "Start free alert")}
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  {isBn
                    ? "প্রম্পট এলে \"Allow\" দিন — তবেই ব্যাকগ্রাউন্ডে নোটিফিকেশন কাজ করবে।"
                    : "Click \"Allow\" on the browser prompt so notifications work in the background."}
                </p>
              </div>
            )}
          </Card>
        </TabsContent>


        {/* TRACKER TAB */}
        <TabsContent value="tracker">
          <Card className="p-6">
            <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              {isBn ? "লাইভ ট্রেন ট্র্যাকার" : "Live Train Tracker"}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {isBn
                ? "ট্রেনের বর্তমান অবস্থান ও বিলম্বের তথ্য দেখার জন্য নিচের অফিসিয়াল ও থার্ড-পার্টি ট্র্যাকার ব্যবহার করুন।"
                : "Use these official and third-party trackers to see current train location and delays."}
            </p>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { name: "Bangladesh Railway Official", url: "https://railway.gov.bd/" },
                { name: "BR Train Tracker (Where is my train)", url: "https://eticket.railway.gov.bd/" },
                { name: "Train Status SMS Service", url: "sms:16318?body=tr%20<train_no>" },
                { name: "Helpline 163", url: "tel:163" },
              ].map((l) => (
                <a key={l.name} href={l.url} target="_blank" rel="noreferrer">
                  <Card className="p-4 hover:bg-accent transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{l.name}</span>
                      <ExternalLink className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </Card>
                </a>
              ))}
            </div>
            <div className="mt-6 p-4 rounded-lg bg-muted/50">
              <p className="text-xs font-semibold mb-2">{isBn ? "SMS দিয়ে ট্রেন স্ট্যাটাস:" : "SMS train status:"}</p>
              <code className="text-xs">TR &lt;train_number&gt; → 16318</code>
              <p className="text-xs text-muted-foreground mt-1">
                {isBn ? "যেমনঃ TR 705 পাঠান 16318 নাম্বারে" : "Example: Send 'TR 705' to 16318"}
              </p>
            </div>
          </Card>
        </TabsContent>

        {/* CCTV TAB */}
        <TabsContent value="cctv">
          <Card className="p-6">
            <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
              <Camera className="h-5 w-5 text-primary" />
              {isBn ? "প্ল্যাটফর্ম CCTV ও লাইভ ক্যামেরা" : "Platform CCTV & Live Cameras"}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {isBn
                ? "পাবলিকলি অ্যাক্সেসিবল লাইভ স্ট্রিম ও সার্ভিল্যান্স ক্যাম। অফিসিয়াল BR CCTV পাবলিক না, তাই YouTube live ও Insecam-এর মতো পাবলিক সোর্স ব্যবহার করা হয়েছে।"
                : "Publicly accessible live streams and surveillance cams. Official BR CCTV isn't public, so we use YouTube live and Insecam-style public sources."}
            </p>
            <div className="space-y-2">
              {PLATFORM_CCTV.map((c) => (
                <a key={c.name} href={c.url} target="_blank" rel="noreferrer">
                  <Card className="p-3 hover:bg-accent transition-colors flex items-center justify-between">
                    <span className="text-sm font-medium">{c.name}</span>
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  </Card>
                </a>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Helpline */}
      <Card className="mt-6 p-4 bg-primary/5 border-primary/20">
        <div className="flex items-center gap-3 flex-wrap">
          <Phone className="h-5 w-5 text-primary" />
          <span className="font-semibold">{isBn ? "জরুরি যোগাযোগ:" : "Emergency contact:"}</span>
          <a href="tel:163" className="text-sm underline">163 (BR Helpline)</a>
          <a href="tel:09666773773" className="text-sm underline">09666 773 773 (eticket)</a>
        </div>
      </Card>
    </div>
  );
}
