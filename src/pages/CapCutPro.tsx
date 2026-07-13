import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Check, Sparkles, Zap, Crown, ShieldCheck, Clock, Star, Flame,
  Wand2, Video, Music2, Layers, Type, Palette, Download, Users,
  MessageCircle, Phone, ChevronDown, Rocket, BadgeCheck, Gift
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const WHATSAPP = "+8801774585757";
const BKASH = "01774-585757";
const NAGAD = "01774-585757";
const ROCKET = "01774-585757-7";

/* ---------- Countdown ---------- */
function useCountdown(hours = 23) {
  const target = useMemo(() => {
    const saved = localStorage.getItem("capcut_countdown_end");
    if (saved) {
      const t = Number(saved);
      if (t > Date.now()) return t;
    }
    const t = Date.now() + hours * 3600 * 1000;
    localStorage.setItem("capcut_countdown_end", String(t));
    return t;
  }, [hours]);

  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const diff = Math.max(0, target - now);
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  const bn = (n: number) => n.toString().padStart(2, "0").replace(/\d/g, d => "০১২৩৪৫৬৭৮৯"[+d]);
  return { h, m, s, bn };
}

/* ---------- Plans ---------- */
const plans = [
  {
    id: "1m", name: "১ মাস", price: 149, old: 499, badge: "ট্রায়াল",
    features: ["সব প্রিমিয়াম ইফেক্ট", "4K এক্সপোর্ট", "কোনো ওয়াটারমার্ক নেই", "১টি ডিভাইস"],
  },
  {
    id: "3m", name: "৩ মাস", price: 349, old: 1499, badge: "জনপ্রিয়", highlight: true,
    features: ["সব প্রিমিয়াম ইফেক্ট", "4K/HDR এক্সপোর্ট", "AI ফিচার আনলক", "২টি ডিভাইস", "প্রিমিয়াম টেমপ্লেট"],
  },
  {
    id: "1y", name: "১ বছর", price: 899, old: 5999, badge: "সেরা মূল্য",
    features: ["সব ফিচার + AI Pro", "4K/HDR + কালার গ্রেডিং", "৩টি ডিভাইস", "১০০০+ প্রিমিয়াম টেমপ্লেট", "লাইফটাইম সাপোর্ট"],
  },
];

/* ---------- Features ---------- */
const features = [
  { i: Wand2, t: "AI ম্যাজিক টুলস", d: "AI ব্যাকগ্রাউন্ড রিমুভ, অটো ক্যাপশন, স্ক্রিপ্ট থেকে ভিডিও" },
  { i: Video, t: "4K/HDR এক্সপোর্ট", d: "সিনেমা কোয়ালিটি এক্সপোর্ট — YouTube/Reels/TikTok রেডি" },
  { i: Layers, t: "আনলিমিটেড লেয়ার", d: "মাল্টি-ট্র্যাক এডিটিং, কীফ্রেম, মাস্কিং সব ফ্রি" },
  { i: Music2, t: "৫০,০০০+ সাউন্ড", d: "কপিরাইট-ফ্রি মিউজিক, SFX, ভয়েস ইফেক্ট" },
  { i: Type, t: "প্রিমিয়াম ফন্ট", d: "১০০০+ বাংলা+ইংরেজি স্টাইলিশ ফন্ট ও এনিমেটেড টেক্সট" },
  { i: Palette, t: "প্রো কালার গ্রেডিং", d: "LUTs, কার্ভ, সিনেম্যাটিক প্রিসেট" },
];

const testimonials = [
  { n: "রাফসান আহমেদ", r: "কন্টেন্ট ক্রিয়েটর", t: "৩ দিনেই আমার Reels ভাইরাল! CapCut Pro-র AI ক্যাপশন গেম চেঞ্জার।", rt: 5 },
  { n: "সাদিয়া ইসলাম", r: "ওয়েডিং এডিটর", t: "4K এক্সপোর্ট আর কালার গ্রেডিং — ক্লায়েন্ট মুগ্ধ। এত কম দামে এই কোয়ালিটি!", rt: 5 },
  { n: "তানভীর হাসান", r: "YouTuber (১.২M)", t: "ওয়াটারমার্ক ছাড়া, কোনো ল্যাগ নেই। ২ মিনিটে অ্যাক্টিভ হয়ে গেছে।", rt: 5 },
  { n: "মেহেদী রহমান", r: "ফ্রিল্যান্সার", t: "প্রতিদিন Fiverr অর্ডার ডেলিভার করি এটা দিয়েই। ROI পাগলাটে।", rt: 5 },
];

const faqs = [
  { q: "অ্যাক্টিভেশন কতক্ষণে হবে?", a: "পেমেন্ট কনফার্মের পর ২–১০ মিনিটের মধ্যে আপনার অ্যাকাউন্ট অ্যাক্টিভ হয়ে যাবে। ২৪/৭ WhatsApp সাপোর্ট।" },
  { q: "নিজের ইমেইল দিয়ে লগইন করব?", a: "হ্যাঁ। আপনার নিজের CapCut অ্যাকাউন্টেই Pro আনলক হবে। কোনো শেয়ার্ড লগইন নয়।" },
  { q: "ব্যান হবে না তো?", a: "১০০% সেফ। অফিসিয়াল আপগ্রেড মেথড ব্যবহার করি। এখন পর্যন্ত ৫,০০০+ ইউজার — কেউ ব্যান হননি।" },
  { q: "রিফান্ড পাব?", a: "অ্যাক্টিভেশন না হলে ১০০% রিফান্ড গ্যারান্টি। bKash/Nagad-এ সাথে সাথে ফেরত।" },
  { q: "কোন কোন ডিভাইসে চলবে?", a: "Android, iPhone, iPad, Windows, macOS — সবগুলোতেই কাজ করে।" },
];

/* ---------- Page ---------- */
export default function CapCutPro() {
  const { h, m, s, bn } = useCountdown(23);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [selectedPlan, setSelectedPlan] = useState("3m");

  const orderWhatsApp = (planId: string) => {
    const p = plans.find(x => x.id === planId)!;
    const msg = encodeURIComponent(
      `আসসালামু আলাইকুম!\n\nCapCut Pro অর্ডার করতে চাই।\nপ্ল্যান: ${p.name} — ৳${p.price}\n\nদয়া করে পেমেন্ট ইনস্ট্রাকশন দিন।`
    );
    window.open(`https://wa.me/${WHATSAPP.replace(/\D/g,"")}?text=${msg}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Announcement bar */}
      <div className="bg-gradient-to-r from-primary via-primary-glow to-primary text-primary-foreground text-center text-xs sm:text-sm py-2 px-3">
        <Flame className="inline h-3.5 w-3.5 mr-1 text-secondary" />
        <span className="font-semibold">ফ্ল্যাশ সেল</span> — ৭০% পর্যন্ত ছাড় শেষ হবে{" "}
        <span className="tabular-nums font-bold text-secondary">
          {bn(h)}:{bn(m)}:{bn(s)}
        </span>{" "}
        পরে
      </div>

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-40"
          style={{ background: "var(--gradient-hero)" }}
        />
        <div className="relative container mx-auto px-4 py-8 sm:py-16 lg:py-20 grid lg:grid-cols-2 gap-8 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
          >
            <Badge className="bg-secondary text-secondary-foreground border-0 mb-3 font-semibold text-[11px] sm:text-xs">
              <Crown className="h-3 w-3 mr-1" /> #১ ট্রাস্টেড সেলার বাংলাদেশ
            </Badge>
            <h1 className="text-[28px] leading-[1.15] sm:text-5xl lg:text-6xl font-bold tracking-tight">
              <span className="block">CapCut Pro</span>
              <span className="block mt-1 sm:mt-2 bg-gradient-to-r from-secondary via-accent to-secondary bg-clip-text text-transparent">
                মাত্র ৳১৪৯ থেকে
              </span>
            </h1>
            <p className="mt-4 text-sm sm:text-lg text-muted-foreground max-w-xl">
              অফিসিয়াল CapCut Pro আনলক — <b className="text-foreground">4K এক্সপোর্ট, AI ফিচার, ওয়াটারমার্ক মুক্ত</b>, ৫,০০০+ প্রিমিয়াম ইফেক্ট। ২ মিনিটে অ্যাক্টিভ, ১০০% সেফ, রিফান্ড গ্যারান্টি।
            </p>

            {/* Countdown */}
            <div className="mt-5">
              <div className="flex items-center gap-1.5 text-[10px] sm:text-xs uppercase tracking-widest text-muted-foreground mb-2">
                <Clock className="h-3.5 w-3.5 text-destructive" /> অফার শেষ হবে:
              </div>
              <div className="flex gap-2">
                {[{l:"ঘণ্টা",v:h},{l:"মিনিট",v:m},{l:"সেকেন্ড",v:s}].map((x,i)=>(
                  <div key={i} className="bg-primary text-primary-foreground rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 min-w-[52px] sm:min-w-[64px] text-center shadow-lg">
                    <div className="text-lg sm:text-2xl font-bold tabular-nums leading-tight">{bn(x.v)}</div>
                    <div className="text-[9px] sm:text-[10px] opacity-70">{x.l}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 sm:mt-7 flex flex-col sm:flex-row gap-2.5 sm:gap-3">
              <Button size="lg" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground font-bold shadow-[var(--shadow-orange)] h-12 px-6 w-full sm:w-auto" onClick={()=>orderWhatsApp(selectedPlan)}>
                <Rocket className="h-4 w-4 mr-2" /> এখনই কিনুন — ৳১৪৯
              </Button>
              <Button size="lg" variant="outline" className="h-12 w-full sm:w-auto" onClick={()=>document.getElementById("plans")?.scrollIntoView({behavior:"smooth"})}>
                সব প্ল্যান দেখুন
              </Button>
            </div>

            {/* Trust bar */}
            <div className="mt-6 sm:mt-8 grid grid-cols-3 gap-2 sm:gap-3 max-w-md">
              {[
                { n: "৫,০০০+", l: "খুশি ইউজার" },
                { n: "৪.৯★", l: "রেটিং" },
                { n: "২ মিনিট", l: "অ্যাক্টিভেশন" },
              ].map((x,i)=>(
                <div key={i} className="text-center border-l border-border first:border-l-0 pl-2 sm:pl-3 first:pl-0">
                  <div className="text-base sm:text-xl font-bold text-secondary">{x.n}</div>
                  <div className="text-[10px] sm:text-[11px] text-muted-foreground leading-tight">{x.l}</div>
                </div>
              ))}
            </div>
          </motion.div>


          {/* Hero card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.15 }}
            className="relative"
          >
            <div className="absolute -inset-4 bg-gradient-to-br from-secondary/30 via-accent/20 to-primary/40 blur-3xl rounded-full" />
            <Card className="relative p-6 sm:p-8 bg-gradient-to-br from-primary to-primary-glow text-primary-foreground border-0 shadow-[var(--shadow-elegant)]">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <div className="h-10 w-10 rounded-xl bg-secondary text-secondary-foreground grid place-items-center font-bold">CC</div>
                  <div>
                    <div className="font-bold">CapCut Pro</div>
                    <div className="text-[11px] opacity-70">Official Premium Unlock</div>
                  </div>
                </div>
                <Badge className="bg-destructive text-destructive-foreground border-0">–৭০%</Badge>
              </div>

              <div className="space-y-2.5">
                {[
                  "৪K/HDR এক্সপোর্ট — ওয়াটারমার্ক মুক্ত",
                  "AI স্ক্রিপ্ট → ভিডিও, অটো ক্যাপশন",
                  "৫,০০০+ প্রিমিয়াম ইফেক্ট + LUTs",
                  "১০০০+ বাংলা ফন্ট + এনিমেশন",
                  "কপিরাইট-ফ্রি ৫০,০০০+ মিউজিক",
                  "সব ডিভাইস — Android/iOS/PC/Mac",
                ].map((x,i)=>(
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 mt-0.5 text-secondary shrink-0" />
                    <span>{x}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-5 border-t border-primary-foreground/15 flex items-end justify-between">
                <div>
                  <div className="text-xs opacity-70 line-through">৳৫,৯৯৯/বছর</div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-secondary">৳১৪৯</span>
                    <span className="text-sm opacity-80">/মাস থেকে</span>
                  </div>
                </div>
                <Button size="sm" className="bg-secondary text-secondary-foreground hover:bg-secondary/90 font-bold" onClick={()=>orderWhatsApp("1m")}>
                  অর্ডার
                </Button>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Social proof strip */}
      <section className="border-y border-border bg-muted/40 py-4">
        <div className="container mx-auto px-4 flex items-center justify-center gap-6 flex-wrap text-xs sm:text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-secondary" /> ১০০% সেফ ও অফিসিয়াল</div>
          <div className="flex items-center gap-1.5"><BadgeCheck className="h-4 w-4 text-secondary" /> রিফান্ড গ্যারান্টি</div>
          <div className="flex items-center gap-1.5"><Zap className="h-4 w-4 text-secondary" /> ২ মিনিট অ্যাক্টিভেশন</div>
          <div className="flex items-center gap-1.5"><Users className="h-4 w-4 text-secondary" /> ৫,০০০+ ইউজার</div>
          <div className="flex items-center gap-1.5"><Clock className="h-4 w-4 text-secondary" /> ২৪/৭ সাপোর্ট</div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-10 sm:py-16">
        <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-10">
          <Badge variant="outline" className="mb-3">কেন CapCut Pro?</Badge>
          <h2 className="text-2xl sm:text-4xl font-bold leading-tight">প্রফেশনাল ভিডিও এডিটিং — <span className="text-secondary">আপনার মোবাইলেই</span></h2>
          <p className="mt-3 text-sm sm:text-base text-muted-foreground">যা আছে Premiere Pro-তে, তার ৯০% পাবেন CapCut Pro-তে — এক ক্লিকে</p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">

          {features.map((f,i)=>{
            const Icon = f.i;
            return (
              <motion.div key={i} initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:i*0.05}}>
                <Card className="p-3.5 sm:p-5 h-full hover:shadow-[var(--shadow-elegant)] hover:-translate-y-1 transition-all border-border/60 group">
                  <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-gradient-to-br from-secondary to-accent grid place-items-center mb-2.5 sm:mb-3 group-hover:scale-110 transition-transform">
                    <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-primary-foreground" />
                  </div>
                  <h3 className="font-bold text-sm sm:text-lg leading-tight">{f.t}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">{f.d}</p>
                </Card>

              </motion.div>
            );
          })}
        </div>
      </section>

      {/* PLANS */}
      <section id="plans" className="bg-gradient-to-b from-muted/30 to-transparent py-10 sm:py-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-10">
            <Badge className="bg-destructive text-destructive-foreground border-0 mb-3">
              <Flame className="h-3 w-3 mr-1" /> লিমিটেড টাইম অফার
            </Badge>
            <h2 className="text-2xl sm:text-4xl font-bold">আপনার প্ল্যান বেছে নিন</h2>
            <p className="mt-2 sm:mt-3 text-sm sm:text-base text-muted-foreground">যেকোনো প্ল্যানে ১০০% রিফান্ড গ্যারান্টি</p>
          </div>


          <div className="grid md:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {plans.map((p) => (
              <motion.div key={p.id} whileHover={{y:-4}}>
                <Card
                  onClick={()=>setSelectedPlan(p.id)}
                  className={cn(
                    "p-6 relative cursor-pointer transition-all border-2",
                    selectedPlan === p.id ? "border-secondary shadow-[var(--shadow-orange)]" : "border-border hover:border-secondary/50",
                    p.highlight && "md:scale-105 md:-my-2"
                  )}
                >
                  {p.badge && (
                    <div className={cn(
                      "absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[11px] font-bold",
                      p.highlight ? "bg-secondary text-secondary-foreground" : "bg-primary text-primary-foreground"
                    )}>
                      {p.badge}
                    </div>
                  )}
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground font-semibold">{p.name}</div>
                    <div className="mt-2 flex items-baseline justify-center gap-1">
                      <span className="text-xs text-muted-foreground line-through">৳{p.old}</span>
                    </div>
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-5xl font-bold text-secondary">৳{p.price}</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">এককালীন পেমেন্ট</div>
                  </div>
                  <ul className="mt-6 space-y-2.5">
                    {p.features.map((f,i)=>(
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-secondary mt-0.5 shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className={cn(
                      "w-full mt-6 font-bold h-11",
                      p.highlight
                        ? "bg-secondary text-secondary-foreground hover:bg-secondary/90"
                        : "bg-primary text-primary-foreground hover:bg-primary/90"
                    )}
                    onClick={(e)=>{e.stopPropagation(); orderWhatsApp(p.id);}}
                  >
                    <MessageCircle className="h-4 w-4 mr-2" /> এখনই অর্ডার
                  </Button>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Payment info */}
          <div className="mt-10 max-w-3xl mx-auto">
            <Card className="p-5 bg-gradient-to-r from-primary/5 to-secondary/5 border-secondary/30">
              <div className="flex items-center gap-2 mb-3">
                <Gift className="h-5 w-5 text-secondary" />
                <div className="font-bold">পেমেন্ট মাধ্যম</div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                <div className="bg-background rounded-lg p-3 border border-border"><div className="text-xs text-muted-foreground">bKash</div><div className="font-bold tabular-nums">{BKASH}</div><div className="text-[10px] text-muted-foreground">(Personal / Send Money)</div></div>
                <div className="bg-background rounded-lg p-3 border border-border"><div className="text-xs text-muted-foreground">Nagad</div><div className="font-bold tabular-nums">{NAGAD}</div><div className="text-[10px] text-muted-foreground">(Personal / Send Money)</div></div>
                <div className="bg-background rounded-lg p-3 border border-border"><div className="text-xs text-muted-foreground">Rocket</div><div className="font-bold tabular-nums">{ROCKET}</div><div className="text-[10px] text-muted-foreground">(Send Money)</div></div>
                <div className="bg-background rounded-lg p-3 border border-border"><div className="text-xs text-muted-foreground">ব্যাংক</div><div className="font-bold">DBBL / City</div><div className="text-[10px] text-muted-foreground">চ্যাটে জিজ্ঞেস করুন</div></div>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                পেমেন্টের পর Transaction ID টা WhatsApp-এ পাঠালেই ২–১০ মিনিটে অ্যাক্টিভ হয়ে যাবে।
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="container mx-auto px-4 py-10 sm:py-16">
        <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-10">
          <Badge variant="outline" className="mb-3">রিভিউ</Badge>
          <h2 className="text-2xl sm:text-4xl font-bold">যারা কিনেছেন, তারাই বলছেন</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">

          {testimonials.map((t,i)=>(
            <Card key={i} className="p-5">
              <div className="flex gap-0.5 mb-2">
                {Array.from({length:t.rt}).map((_,k)=>(
                  <Star key={k} className="h-4 w-4 fill-secondary text-secondary" />
                ))}
              </div>
              <p className="text-sm">"{t.t}"</p>
              <div className="mt-4 pt-3 border-t border-border">
                <div className="font-semibold text-sm">{t.n}</div>
                <div className="text-xs text-muted-foreground">{t.r}</div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Guarantee */}
      <section className="container mx-auto px-4 pb-10 sm:pb-16">
        <Card className="p-5 sm:p-10 bg-gradient-to-br from-primary to-primary-glow text-primary-foreground border-0 relative overflow-hidden">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-secondary/30 blur-3xl" />
          <div className="relative grid grid-cols-[auto,1fr] gap-4 sm:gap-6 items-center">
            <div className="h-14 w-14 sm:h-20 sm:w-20 rounded-full bg-secondary grid place-items-center shrink-0">
              <ShieldCheck className="h-7 w-7 sm:h-10 sm:w-10 text-primary" />
            </div>
            <div>
              <h3 className="text-lg sm:text-3xl font-bold leading-tight">১০০% মানি-ব্যাক গ্যারান্টি</h3>
              <p className="mt-1.5 sm:mt-2 text-xs sm:text-base opacity-90">
                অ্যাক্টিভেশন না হলে বা কোনো সমস্যা হলে সাথে সাথে ফুল রিফান্ড। আপনার রিস্ক জিরো।
              </p>
            </div>
          </div>
        </Card>
      </section>

      {/* FAQ */}
      <section className="container mx-auto px-4 pb-16 max-w-3xl">
        <div className="text-center mb-6 sm:mb-8">
          <Badge variant="outline" className="mb-3">FAQ</Badge>
          <h2 className="text-2xl sm:text-4xl font-bold">প্রশ্ন? আমরা উত্তর দিচ্ছি</h2>
        </div>

        <div className="space-y-2">
          {faqs.map((f,i)=>(
            <Card key={i} className="overflow-hidden">
              <button
                className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors"
                onClick={()=>setOpenFaq(openFaq===i?null:i)}
              >
                <span className="font-semibold">{f.q}</span>
                <ChevronDown className={cn("h-5 w-5 transition-transform", openFaq===i && "rotate-180")} />
              </button>
              {openFaq===i && (
                <div className="px-4 pb-4 text-sm text-muted-foreground">{f.a}</div>
              )}
            </Card>
          ))}
        </div>
      </section>

      {/* Sticky bottom CTA — sits above mobile BottomNav (~64px) */}
      <div className="fixed bottom-16 md:bottom-0 inset-x-0 z-40 bg-primary text-primary-foreground border-t border-primary-foreground/10 shadow-2xl">
        <div className="container mx-auto px-3 py-2 flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-secondary" />
            <div className="text-sm">
              <b>CapCut Pro</b> — অফার শেষ:{" "}
              <span className="tabular-nums text-secondary font-bold">{bn(h)}:{bn(m)}:{bn(s)}</span>
            </div>
          </div>
          <div className="flex-1 sm:hidden text-[11px] leading-tight">
            <div className="font-bold">CapCut Pro ৳১৪৯</div>
            <div className="opacity-80">শেষ: <span className="tabular-nums text-secondary font-bold">{bn(h)}:{bn(m)}:{bn(s)}</span></div>
          </div>
          <Button size="sm" className="bg-secondary text-secondary-foreground hover:bg-secondary/90 font-bold h-9 px-3 text-xs sm:text-sm" onClick={()=>orderWhatsApp(selectedPlan)}>
            <MessageCircle className="h-4 w-4 mr-1" /> অর্ডার
          </Button>
          <a href={`tel:${WHATSAPP}`} className="h-9 w-9 grid place-items-center rounded-md bg-secondary/20 hover:bg-secondary/30 shrink-0" aria-label="Call">
            <Phone className="h-4 w-4 text-secondary" />
          </a>
        </div>
      </div>
      {/* Spacer for sticky CTA + mobile BottomNav */}
      <div className="h-28 md:h-16" />

    </div>
  );
}
