import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Phone, Search, MessageCircle, Video, ExternalLink, AlertTriangle, MapPin } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

type Op = { code: string; name: string; color: string };
const BD_OPERATORS: Op[] = [
  { code: "013|017", name: "Grameenphone", color: "bg-blue-500" },
  { code: "014|019", name: "Banglalink", color: "bg-orange-500" },
  { code: "015", name: "Teletalk", color: "bg-green-600" },
  { code: "016|018", name: "Robi/Airtel", color: "bg-red-500" },
];

function detectOperator(num: string): Op | null {
  const clean = num.replace(/\D/g, "").replace(/^88/, "");
  const prefix = clean.slice(0, 3);
  return BD_OPERATORS.find((o) => o.code.split("|").includes(prefix)) || null;
}

function normalizeIntl(num: string) {
  let clean = num.replace(/\D/g, "");
  if (clean.startsWith("0")) clean = "880" + clean.slice(1);
  if (!clean.startsWith("880") && clean.length === 10) clean = "880" + clean;
  return clean;
}

export default function PhoneLookup() {
  const { lang } = useLanguage();
  const isBn = lang === "bn";
  const [phone, setPhone] = useState("");
  const [result, setResult] = useState<string | null>(null);

  const handleLookup = () => {
    if (!phone || phone.replace(/\D/g, "").length < 10) return;
    setResult(normalizeIntl(phone));
  };

  const op = result ? detectOperator(result) : null;
  const intl = result || "";
  const noPlus = intl;

  const services = result
    ? [
        { name: "WhatsApp", icon: MessageCircle, url: `https://wa.me/${noPlus}`, color: "bg-green-500", desc: isBn ? "চ্যাট/কল শুরু করুন" : "Open chat / call" },
        { name: "WhatsApp Business", icon: MessageCircle, url: `https://wa.me/${noPlus}?text=Hello`, color: "bg-emerald-600", desc: isBn ? "মেসেজ পাঠান" : "Send a message" },
        { name: "Imo", icon: Video, url: `imo://chat?phone=${noPlus}`, color: "bg-sky-500", desc: isBn ? "Imo অ্যাপ খুলবে" : "Opens Imo app" },
        { name: "Viber", icon: Phone, url: `viber://chat?number=%2B${noPlus}`, color: "bg-purple-500", desc: isBn ? "Viber খুলবে" : "Opens Viber" },
        { name: "Telegram", icon: MessageCircle, url: `https://t.me/+${noPlus}`, color: "bg-blue-500", desc: isBn ? "Telegram প্রোফাইল" : "Telegram profile" },
        { name: "Signal", icon: MessageCircle, url: `https://signal.me/#p/+${noPlus}`, color: "bg-indigo-500", desc: isBn ? "Signal চ্যাট" : "Signal chat" },
        { name: "Direct Call", icon: Phone, url: `tel:+${noPlus}`, color: "bg-primary", desc: isBn ? "সরাসরি কল" : "Direct call" },
        { name: "SMS", icon: MessageCircle, url: `sms:+${noPlus}`, color: "bg-slate-500", desc: isBn ? "SMS পাঠান" : "Send SMS" },
        { name: "Truecaller Search", icon: Search, url: `https://www.truecaller.com/search/bd/${noPlus}`, color: "bg-cyan-500", desc: isBn ? "নাম খুঁজুন" : "Find name" },
        { name: "Facebook Search", icon: Search, url: `https://www.facebook.com/search/top?q=${encodeURIComponent("+" + noPlus)}`, color: "bg-blue-600", desc: isBn ? "FB-তে খুঁজুন" : "Search on FB" },
        { name: "Google Search", icon: Search, url: `https://www.google.com/search?q=${encodeURIComponent("+" + noPlus)}`, color: "bg-red-500", desc: isBn ? "ওয়েব সার্চ" : "Web search" },
      ]
    : [];

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8 text-center">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/60 text-primary-foreground mb-4">
          <Phone className="h-7 w-7" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-2">
          {isBn ? "ফোন নাম্বার লুকআপ" : "Phone Number Lookup"}
        </h1>
        <p className="text-muted-foreground">
          {isBn
            ? "যেকোনো বাংলাদেশী নাম্বার দিয়ে দেখুন কোন কোন অনলাইন সার্ভিসে অ্যাকাউন্ট আছে"
            : "Enter any Bangladeshi number to find which online services have an account"}
        </p>
      </div>

      {/* Disclaimer */}
      <Card className="p-4 mb-6 border-amber-500/50 bg-amber-50/50 dark:bg-amber-950/20">
        <div className="flex gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold mb-1">{isBn ? "গোপনীয়তা সম্পর্কে" : "About privacy"}</p>
            <p className="text-muted-foreground text-xs">
              {isBn
                ? "এই টুল শুধু পাবলিক deep-link ও সার্চ লিংক তৈরি করে — কোনো প্রাইভেট ডেটা স্ক্র্যাপ করে না। প্রতিটি সার্ভিস (WhatsApp/Imo/Viber) ইউজার যদি তার প্রোফাইল পাবলিক রাখে তাহলেই ছবি/নাম দেখাবে।"
                : "This tool only generates public deep-links and search links — it does not scrape private data. Each service (WhatsApp/Imo/Viber) only shows the photo/name if the user has set their profile to public."}
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-5 mb-6">
        <Label>{isBn ? "ফোন নাম্বার (বাংলাদেশ)" : "Phone number (Bangladesh)"}</Label>
        <div className="flex gap-2 mt-2">
          <Input
            type="tel"
            placeholder="01XXXXXXXXX"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLookup()}
          />
          <Button onClick={handleLookup}>
            <Search className="h-4 w-4 mr-1" />
            {isBn ? "খুঁজুন" : "Lookup"}
          </Button>
        </div>
      </Card>

      {result && (
        <>
          <Card className="p-5 mb-6">
            <h3 className="font-bold mb-3">{isBn ? "নাম্বার তথ্য" : "Number Info"}</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{isBn ? "ইন্টারন্যাশনাল ফরম্যাট" : "International"}</span>
                <span className="font-mono">+{intl}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">{isBn ? "অপারেটর" : "Operator"}</span>
                {op ? (
                  <Badge className={`${op.color} text-white`}>{op.name}</Badge>
                ) : (
                  <Badge variant="outline">{isBn ? "অজানা" : "Unknown"}</Badge>
                )}
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">{isBn ? "দেশ" : "Country"}</span>
                <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> Bangladesh (+880)</span>
              </div>
            </div>
          </Card>

          <h3 className="font-bold mb-3">
            {isBn ? "এই নাম্বারে যা চেক করতে পারেন" : "Check this number on"}
          </h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {services.map((s) => (
              <a key={s.name} href={s.url} target="_blank" rel="noreferrer">
                <Card className="p-4 hover:bg-accent transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-lg ${s.color} text-white flex items-center justify-center flex-shrink-0`}>
                      <s.icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm">{s.name}</div>
                      <div className="text-xs text-muted-foreground">{s.desc}</div>
                    </div>
                    <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  </div>
                </Card>
              </a>
            ))}
          </div>

          <Card className="p-4 mt-6 bg-muted/30">
            <p className="text-xs text-muted-foreground">
              {isBn
                ? "💡 টিপ: প্রতিটি সার্ভিসে ক্লিক করলে যদি ইউজার অ্যাকাউন্ট থাকে তাহলে তার পাবলিক প্রোফাইল ছবি ও নাম দেখাবে। অ্যাকাউন্ট না থাকলে ইনভাইট পেজ খুলবে।"
                : "💡 Tip: Clicking each service will show the public profile photo and name if an account exists. If not, an invite page will open."}
            </p>
          </Card>
        </>
      )}
    </div>
  );
}
