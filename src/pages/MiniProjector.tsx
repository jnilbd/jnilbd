import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Check, Sparkles, ShieldCheck, Star, Flame, Truck, Package,
  Monitor, Volume2, Wifi, Bluetooth, Zap, Award, Clock,
  MessageCircle, Phone, ChevronDown, Gift, MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const WHATSAPP = "+8801774585757";
const PHONE = "01774-585757";
const PRODUCT_ID = "363cc343-e203-44bb-b18d-925cef913c3c";
const HERO_IMG = "https://images.unsplash.com/photo-1626379953822-baec19c3accd?w=1200&q=80";

/* ---------- Countdown ---------- */
function useCountdown(hours = 23) {
  const target = useMemo(() => {
    const saved = localStorage.getItem("projector_countdown_end");
    if (saved) {
      const t = Number(saved);
      if (t > Date.now()) return t;
    }
    const t = Date.now() + hours * 3600 * 1000;
    localStorage.setItem("projector_countdown_end", String(t));
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

const features = [
  { i: Monitor, t: "১৯২০×১০৮০ Full HD", d: `ক্রিস্টাল ক্লিয়ার HD ছবি — ৪০" থেকে ২০০" পর্যন্ত স্ক্রিন` },
  { i: Volume2, t: "বিল্ট-ইন স্পিকার", d: "শক্তিশালী স্টেরিও সাউন্ড — বাড়তি স্পিকার লাগবে না" },
  { i: Wifi, t: "WiFi + স্ক্রিন মিরর", d: "মোবাইল/ল্যাপটপ থেকে সরাসরি ওয়্যারলেস স্ট্রিম" },
  { i: Bluetooth, t: "Bluetooth ৫.০", d: "যেকোনো স্পিকার/হেডফোন কানেক্ট করুন" },
  { i: Zap, t: "৮০০০ Lumens উজ্জ্বলতা", d: "দিনের আলোতেও ভাল ছবি — নাইট ভিউ সিনেমার মতো" },
  { i: Package, t: "HDMI / USB / AV / TF", d: "সব ডিভাইস সাপোর্ট — সেট-টপ বক্স, ল্যাপটপ, PS4/5" },
];

const useCases = [
  { emoji: "🎬", t: "হোম সিনেমা", d: "পরিবারের সাথে মুভি নাইট" },
  { emoji: "⚽", t: "খেলা দেখা", d: "বড় স্ক্রিনে ক্রিকেট/ফুটবল ম্যাচ" },
  { emoji: "🎮", t: "গেমিং", d: "PS5/Xbox বড় পর্দায় খেলুন" },
  { emoji: "📊", t: "অফিস মিটিং", d: "প্রেজেন্টেশন ও কনফারেন্স" },
  { emoji: "🎓", t: "ক্লাসরুম", d: "শিক্ষার্থীদের জন্য পারফেক্ট" },
  { emoji: "🎉", t: "ইভেন্ট", d: "বিয়ে, জন্মদিন, প্রোগ্রাম" },
];

const boxItems = [
  "মিনি HD প্রজেক্টর ইউনিট",
  "রিমোট কন্ট্রোল",
  "HDMI ক্যাবল",
  "পাওয়ার অ্যাডাপ্টার",
  "AV ক্যাবল",
  "ইউজার ম্যানুয়াল (বাংলা)",
];

const testimonials = [
  { n: "শাহরিয়ার হোসেন", r: "ঢাকা", t: "বাসায় সিনেমা হল বানিয়ে ফেলেছি! ছবির কোয়ালিটি অসাধারণ। দাম হিসেবে সেরা।", rt: 5 },
  { n: "নুসরাত জাহান", r: "চট্টগ্রাম", t: "বাচ্চাদের কার্টুন আর অনলাইন ক্লাসের জন্য পারফেক্ট। WiFi কানেকশন সহজ।", rt: 5 },
  { n: "মেহেদী হাসান", r: "সিলেট", t: "কালকে অর্ডার দিয়েছিলাম, আজ পেয়ে গেলাম। ক্যাশ অন ডেলিভারি — পুরো নিরাপদ।", rt: 5 },
  { n: "রাফি আহমেদ", r: "রাজশাহী", t: "প্রেজেন্টেশনের জন্য নিয়েছিলাম, এখন বাসায়ই খেলা দেখি। ফ্যামিলি খুশি।", rt: 5 },
];

const faqs = [
  { q: "ডেলিভারি কতদিনে হবে?", a: "ঢাকার ভেতরে ১-২ দিন, ঢাকার বাইরে ৩-৫ দিনের মধ্যে পৌঁছে যাবে কুরিয়ারের মাধ্যমে।" },
  { q: "ক্যাশ অন ডেলিভারি আছে?", a: "হ্যাঁ, ১০০% ক্যাশ অন ডেলিভারি। প্রোডাক্ট হাতে পেয়ে চেক করে তারপর পেমেন্ট করবেন।" },
  { q: "ওয়ারেন্টি কতদিনের?", a: "৬ মাসের সার্ভিস ওয়ারেন্টি। কোনো সমস্যা হলে সরাসরি রিপ্লেসমেন্ট বা রিপেয়ার।" },
  { q: "স্ক্রিন সাইজ কতটুকু হবে?", a: "প্রজেক্টর থেকে দূরত্ব অনুযায়ী ৪০" থেকে ২০০" পর্যন্ত স্ক্রিন পাবেন। ঘরের যেকোনো দেয়ালে চালাতে পারবেন।" },
  { q: "মোবাইল কানেক্ট করা যাবে?", a: "হ্যাঁ, WiFi স্ক্রিন মিররিং এবং HDMI ক্যাবল দুইভাবেই মোবাইল কানেক্ট করা যায়।" },
  { q: "সাউন্ড কেমন?", a: "বিল্ট-ইন স্টেরিও স্পিকার ভালো। আরো বড় সাউন্ডের জন্য Bluetooth স্পিকার কানেক্ট করতে পারবেন।" },
];

export default function MiniProjector() {
  const { h, m, s, bn } = useCountdown(23);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [form, setForm] = useState({ name: "", phone: "", address: "", qty: 1, note: "" });
  const [submitting, setSubmitting] = useState(false);

  const price = 4990;
  const oldPrice = 6500;
  const saving = oldPrice - price;
  const total = price * form.qty;

  const scrollToOrder = () => {
    document.getElementById("order-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.address) {
      toast.error("অনুগ্রহ করে নাম, ফোন ও ঠিকানা পূরণ করুন");
      return;
    }
    if (!/^01[3-9]\d{8}$/.test(form.phone.replace(/[-\s]/g, ""))) {
      toast.error("সঠিক বাংলাদেশি মোবাইল নম্বর দিন");
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.from("shop_orders").insert({
        product_id: PRODUCT_ID,
        product_name: "মিনি HD প্রজেক্টর",
        customer_name: form.name,
        customer_phone: form.phone,
        customer_address: form.address,
        quantity: form.qty,
        unit_price: price,
        total_amount: total,
        payment_method: "cash_on_delivery",
        payment_status: "pending",
        order_status: "pending",
        notes: form.note || null,
      } as any);
      if (error) throw error;
      toast.success("অর্ডার সফল! আমরা শীঘ্রই আপনাকে কল করব।");
      setForm({ name: "", phone: "", address: "", qty: 1, note: "" });
    } catch (err: any) {
      toast.error("অর্ডার ব্যর্থ: " + (err?.message || "আবার চেষ্টা করুন"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top urgency bar */}
      <div className="bg-gradient-to-r from-red-600 via-orange-500 to-red-600 text-white text-xs md:text-sm py-2 px-3 text-center font-medium sticky top-0 z-40">
        <Flame className="inline w-3.5 h-3.5 mr-1 animate-pulse" />
        সীমিত অফার — মাত্র {bn(h)}:{bn(m)}:{bn(s)} বাকি
        <Flame className="inline w-3.5 h-3.5 ml-1 animate-pulse" />
      </div>

      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white">
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "radial-gradient(circle at 20% 20%, rgba(99,102,241,0.4) 0%, transparent 45%), radial-gradient(circle at 80% 70%, rgba(234,179,8,0.3) 0%, transparent 45%)" }} />
        <div className="container relative z-10 py-8 md:py-16 grid md:grid-cols-2 gap-8 items-center">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <Badge className="mb-3 bg-yellow-400 text-black hover:bg-yellow-400 text-xs">🔥 HOT DEAL — ২৩% ছাড়</Badge>
            <h1 className="text-3xl md:text-5xl font-bold mb-3 leading-tight">
              বাসায় বানান <span className="text-yellow-400">নিজের সিনেমা হল</span>
            </h1>
            <p className="text-base md:text-lg text-white/80 mb-4">
              মিনি HD প্রজেক্টর — Full HD ছবি, বিল্ট-ইন স্পিকার, WiFi + Bluetooth সহ। ২০০" পর্যন্ত বড় স্ক্রিন।
            </p>

            <div className="flex items-baseline gap-3 mb-4">
              <span className="text-4xl md:text-5xl font-bold text-yellow-400">৳{price.toLocaleString()}</span>
              <span className="text-lg text-white/60 line-through">৳{oldPrice.toLocaleString()}</span>
              <Badge className="bg-red-500 hover:bg-red-500">সেভ ৳{saving}</Badge>
            </div>

            <div className="flex flex-wrap gap-2 mb-5 text-xs">
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/10 border border-white/20"><Truck className="w-3 h-3" /> ফ্রি ডেলিভারি</span>
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/10 border border-white/20"><ShieldCheck className="w-3 h-3" /> ৬ মাস ওয়ারেন্টি</span>
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/10 border border-white/20"><Package className="w-3 h-3" /> ক্যাশ অন ডেলিভারি</span>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <Button size="lg" onClick={scrollToOrder} className="bg-yellow-400 text-black hover:bg-yellow-300 font-bold text-base">
                <Gift className="mr-2 w-5 h-5" /> এখনই অর্ডার করুন
              </Button>
              <Button size="lg" variant="outline" asChild className="border-white/30 text-white hover:bg-white/10 hover:text-white bg-transparent">
                <a href={`https://wa.me/${WHATSAPP.replace(/\D/g, "")}`} target="_blank" rel="noreferrer">
                  <MessageCircle className="mr-2 w-5 h-5" /> WhatsApp
                </a>
              </Button>
            </div>

            <div className="mt-5 flex items-center gap-2 text-xs text-white/70">
              <div className="flex -space-x-2">
                {[1,2,3,4].map(i => <div key={i} className="w-6 h-6 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 border-2 border-slate-900" />)}
              </div>
              <span><b className="text-white">২,৫০০+</b> সন্তুষ্ট গ্রাহক</span>
              <span className="flex items-center gap-0.5 ml-2">
                {[1,2,3,4,5].map(i => <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />)}
                <span className="ml-1">৪.৯</span>
              </span>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-yellow-400/30 to-indigo-500/30 blur-3xl rounded-full" />
            <img src={HERO_IMG} alt="Mini HD Projector" className="relative rounded-2xl shadow-2xl w-full object-cover aspect-[4/3]" />
            <div className="absolute -bottom-3 -right-3 bg-red-600 text-white px-3 py-2 rounded-xl shadow-lg text-xs font-bold rotate-3">
              -{Math.round((1 - price/oldPrice) * 100)}% ছাড়!
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-10 md:py-16 container">
        <div className="text-center mb-8">
          <Badge variant="outline" className="mb-2">কেন এই প্রজেক্টর?</Badge>
          <h2 className="text-2xl md:text-4xl font-bold">প্রিমিয়াম ফিচার — সাশ্রয়ী দামে</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          {features.map((f, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
              <Card className="p-4 md:p-5 h-full hover:shadow-lg transition-shadow border-2 hover:border-primary/50">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-primary to-secondary text-white grid place-items-center mb-3">
                  <f.i className="w-5 h-5 md:w-6 md:h-6" />
                </div>
                <h3 className="font-bold text-sm md:text-base mb-1">{f.t}</h3>
                <p className="text-xs md:text-sm text-muted-foreground">{f.d}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-10 md:py-16 bg-muted/40">
        <div className="container">
          <div className="text-center mb-8">
            <Badge variant="outline" className="mb-2">কোথায় ব্যবহার করবেন?</Badge>
            <h2 className="text-2xl md:text-4xl font-bold">এক প্রজেক্টর — অনেক ব্যবহার</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {useCases.map((u, i) => (
              <Card key={i} className="p-4 text-center hover:shadow-md transition-shadow">
                <div className="text-4xl mb-2">{u.emoji}</div>
                <div className="font-bold text-sm">{u.t}</div>
                <div className="text-xs text-muted-foreground mt-1">{u.d}</div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Box contents */}
      <section className="py-10 md:py-16 container">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-6">
            <Badge variant="outline" className="mb-2">বক্সে যা থাকছে</Badge>
            <h2 className="text-2xl md:text-3xl font-bold">সম্পূর্ণ প্যাকেজ — কিছুই কিনতে হবে না</h2>
          </div>
          <Card className="p-5 md:p-8 bg-gradient-to-br from-primary/5 to-secondary/5 border-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {boxItems.map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground grid place-items-center flex-shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-sm md:text-base">{item}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-10 md:py-16 bg-muted/40">
        <div className="container">
          <div className="text-center mb-8">
            <Badge variant="outline" className="mb-2">গ্রাহকরা কী বলছেন</Badge>
            <h2 className="text-2xl md:text-4xl font-bold">২,৫০০+ সন্তুষ্ট গ্রাহক</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {testimonials.map((tm, i) => (
              <Card key={i} className="p-4 md:p-5">
                <div className="flex gap-0.5 mb-2">
                  {Array.from({ length: tm.rt }).map((_, j) => <Star key={j} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)}
                </div>
                <p className="text-sm md:text-base mb-3 italic">"{tm.t}"</p>
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-secondary text-white grid place-items-center font-bold text-sm">
                    {tm.n[0]}
                  </div>
                  <div>
                    <div className="font-semibold text-sm">{tm.n}</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3" />{tm.r}</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ORDER FORM */}
      <section id="order-form" className="py-10 md:py-16 container">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-6">
            <Badge className="mb-2 bg-red-500 hover:bg-red-500">
              <Clock className="w-3 h-3 mr-1" /> {bn(h)}:{bn(m)}:{bn(s)} বাকি
            </Badge>
            <h2 className="text-2xl md:text-4xl font-bold mb-2">অর্ডার করুন এখনই</h2>
            <p className="text-muted-foreground text-sm">ফর্ম পূরণ করলেই আমাদের টিম আপনাকে কল করে কনফার্ম করবে</p>
          </div>

          <Card className="p-5 md:p-8 border-2 border-primary/30 shadow-xl">
            <form onSubmit={handleOrder} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">আপনার নাম *</label>
                <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="পূর্ণ নাম" required />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">মোবাইল নম্বর *</label>
                <Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="01XXXXXXXXX" required />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">সম্পূর্ণ ঠিকানা *</label>
                <Textarea value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="বাসা/রোড, এলাকা, থানা, জেলা" rows={2} required />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">পরিমাণ</label>
                <div className="flex items-center gap-2">
                  <Button type="button" variant="outline" size="icon" onClick={() => setForm({ ...form, qty: Math.max(1, form.qty - 1) })}>-</Button>
                  <div className="w-16 text-center font-bold text-lg">{form.qty}</div>
                  <Button type="button" variant="outline" size="icon" onClick={() => setForm({ ...form, qty: form.qty + 1 })}>+</Button>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">অতিরিক্ত নোট (ঐচ্ছিক)</label>
                <Textarea value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} placeholder="কোনো বিশেষ নির্দেশনা?" rows={2} />
              </div>

              <div className="rounded-xl bg-muted/60 p-4 space-y-1.5 text-sm">
                <div className="flex justify-between"><span>প্রোডাক্ট মূল্য</span><span>৳{price} × {form.qty}</span></div>
                <div className="flex justify-between text-green-600"><span>ডেলিভারি চার্জ</span><span>ফ্রি</span></div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t"><span>মোট</span><span className="text-primary">৳{total.toLocaleString()}</span></div>
                <div className="text-xs text-muted-foreground pt-1">পেমেন্ট: প্রোডাক্ট হাতে পেয়ে ক্যাশ অন ডেলিভারি</div>
              </div>

              <Button type="submit" size="lg" disabled={submitting} className="w-full bg-gradient-to-r from-primary to-secondary text-white font-bold text-base">
                {submitting ? "অর্ডার প্রসেসিং..." : `✓ অর্ডার কনফার্ম করুন — ৳${total.toLocaleString()}`}
              </Button>

              <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground pt-2">
                <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5" /> ১০০% নিরাপদ</span>
                <span className="flex items-center gap-1"><Award className="w-3.5 h-3.5" /> অরিজিনাল</span>
                <span className="flex items-center gap-1"><Truck className="w-3.5 h-3.5" /> দ্রুত ডেলিভারি</span>
              </div>
            </form>
          </Card>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <Button variant="outline" asChild>
              <a href={`tel:${PHONE.replace(/-/g, "")}`}><Phone className="mr-2 w-4 h-4" /> কল করুন</a>
            </Button>
            <Button variant="outline" asChild className="bg-green-50 hover:bg-green-100 border-green-300">
              <a href={`https://wa.me/${WHATSAPP.replace(/\D/g, "")}`} target="_blank" rel="noreferrer">
                <MessageCircle className="mr-2 w-4 h-4 text-green-600" /> WhatsApp
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-10 md:py-16 bg-muted/40">
        <div className="container max-w-3xl">
          <div className="text-center mb-6">
            <Badge variant="outline" className="mb-2">FAQ</Badge>
            <h2 className="text-2xl md:text-4xl font-bold">সাধারণ প্রশ্ন</h2>
          </div>
          <div className="space-y-2">
            {faqs.map((f, i) => (
              <Card key={i} className="overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full p-4 flex items-center justify-between text-left">
                  <span className="font-semibold text-sm md:text-base pr-2">{f.q}</span>
                  <ChevronDown className={cn("w-5 h-5 flex-shrink-0 transition-transform", openFaq === i && "rotate-180")} />
                </button>
                {openFaq === i && (
                  <div className="px-4 pb-4 text-sm text-muted-foreground">{f.a}</div>
                )}
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-12 md:py-16 bg-gradient-to-br from-primary via-primary/90 to-secondary text-white text-center">
        <div className="container">
          <Sparkles className="w-10 h-10 mx-auto mb-3 text-yellow-300" />
          <h2 className="text-2xl md:text-4xl font-bold mb-2">অপেক্ষা করবেন না — স্টক সীমিত</h2>
          <p className="mb-5 text-white/85">আজই অর্ডার করুন, আগামীকাল বাসায় সিনেমা দেখুন</p>
          <Button size="lg" onClick={scrollToOrder} className="bg-yellow-400 text-black hover:bg-yellow-300 font-bold">
            <Gift className="mr-2 w-5 h-5" /> এখনই অর্ডার করুন — ৳{price}
          </Button>
        </div>
      </section>

      {/* Sticky Bottom CTA (mobile) */}
      <div className="fixed bottom-16 md:bottom-4 left-0 right-0 z-30 px-3 md:px-0 md:left-1/2 md:-translate-x-1/2 md:max-w-md">
        <div className="rounded-2xl bg-background/95 backdrop-blur-md border-2 border-primary shadow-2xl p-2.5 flex items-center gap-2">
          <div className="flex-1 min-w-0">
            <div className="text-[10px] text-muted-foreground leading-tight">অফার প্রাইস</div>
            <div className="font-bold text-primary leading-tight">৳{price} <span className="text-xs line-through text-muted-foreground font-normal">৳{oldPrice}</span></div>
          </div>
          <Button size="sm" onClick={scrollToOrder} className="bg-gradient-to-r from-primary to-secondary text-white font-bold whitespace-nowrap">
            অর্ডার করুন
          </Button>
        </div>
      </div>
    </div>
  );
}
