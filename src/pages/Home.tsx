import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, ShoppingBag, Briefcase, FolderKanban, BookOpen, Tag, Home as HomeIcon, Star, Facebook, Instagram, MessageCircle, Youtube, Linkedin, CalendarClock, Wallet, Image as ImageIcon, Mic, Compass, FileType, Tv, Download, Clock, Map, Ruler, HeartPulse, Sun, Lock, Receipt, Scale, Percent, CloudRain, Smartphone, Wifi, Send, Film, ShieldCheck, Zap, Users, Award, TrendingUp, Globe2, PlayCircle, Megaphone, User } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Marquee from "@/components/Marquee";
import { PAGE_BANNERS } from "@/lib/siteImages";
import DailyWidgets from "@/components/DailyWidgets";
import { supabase } from "@/integrations/supabase/client";
import { ALL_CATEGORIES } from "@/lib/categories";


type DbProduct = { id: string; name: string; name_bn?: string | null; price: number; discount_price?: number | null; image?: string | null; category?: string | null; badge?: string | null; badge_color?: string | null };
type DbReview = { id: string; reviewer_name: string | null; rating: number; comment: string | null; created_at: string };
type DbService = { id: string; name: string; name_bn?: string | null; short_description?: string | null; short_description_bn?: string | null; image?: string | null; badge?: string | null; badge_color?: string | null };

const badgeColorMap: Record<string, string> = {
  red: "bg-red-500", green: "bg-green-500", blue: "bg-blue-500",
  orange: "bg-orange-500", purple: "bg-purple-500", pink: "bg-pink-500",
};

const Home = () => {
  const { t, language } = useLanguage();
  const isBn = language === "bn";
  const [featured, setFeatured] = useState<DbProduct[]>([]);
  const [reviews, setReviews] = useState<DbReview[]>([]);
  const [featuredServices, setFeaturedServices] = useState<DbService[]>([]);
  const [now, setNow] = useState<Date>(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const toBnDigits = (s: string | number) =>
    String(s).replace(/[0-9]/g, (d) => "০১২৩৪৫৬৭৮৯"[Number(d)]);
  const dhakaTime = new Intl.DateTimeFormat(isBn ? "bn-BD" : "en-US", {
    hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true, timeZone: "Asia/Dhaka",
  }).format(now);
  const dhakaDate = new Intl.DateTimeFormat(isBn ? "bn-BD" : "en-US", {
    weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Dhaka",
  }).format(now);


  useEffect(() => {
    (async () => {
      const [prodRes, revRes, svcRes] = await Promise.all([
        supabase.from("shop_products").select("id,name,name_bn,price,discount_price,image,category,badge,badge_color").eq("is_active", true).eq("is_featured", true).order("created_at", { ascending: false }).limit(4),
        supabase.from("product_reviews").select("id,reviewer_name,rating,comment,created_at").eq("is_approved", true).order("created_at", { ascending: false }).limit(4),
        supabase.from("services_catalog").select("id,name,name_bn,short_description,short_description_bn,image,badge,badge_color").eq("is_active", true).order("display_order", { ascending: true }).limit(3),
      ]);
      setFeatured((prodRes.data as any) || []);
      setReviews((revRes.data as any) || []);
      setFeaturedServices((svcRes.data as any) || []);
    })();
  }, []);

  // Home cards mirror the menu (ALL_CATEGORIES) order exactly, minus the Home entry itself.
  const gradients = ["gradient-bg-primary", "gradient-bg-cool", "gradient-bg-warm"] as const;
  const descKeyMap: Record<string, string> = {
    "/quran": "card.quran", "/hadith": "card.hadith", "/ruqyah": "card.ruqyah",
    "/namaz": "card.namaz", "/weather": "card.weather", "/finance": "card.finance",
    "/offers": "card.offers", "/livetv": "card.livetv", "/business-guide": "card.businessGuide",
    "/health": "card.health", "/travel": "card.travel", "/politics": "card.politics",
    "/war": "card.war", "/stocks": "card.stocks", "/newspapers": "card.newspapers",
    "/shop": "card.shop", "/services": "card.services", "/free-internet": "card.freeNet",
    "/vault": "card.vault", "/tax": "card.tax", "/warish": "card.warish",
    "/profit-loss": "card.profitLoss", "/land": "card.land", "/height": "card.height",
    "/solar": "card.solar", "/gadget": "card.gadget", "/converter": "card.converter",
    "/downloader": "card.downloader", "/thumbnail": "card.thumbnail", "/voice": "card.voice",
    "/scheduler": "card.scheduler", "/chat": "card.chat", "/movies": "card.movies",
    "/marketplace": "card.marketplace", "/rentals": "card.rentals",
    "/portfolio": "card.portfolio", "/blog": "card.blog", "/about": "card.about",
    "/appointment": "card.appointment",
  };
  const inlineDesc: Record<string, { bn: string; en: string }> = {
    "/railway": { bn: "অনলাইনে ট্রেনের টিকেট ও শিডিউল", en: "Train tickets & schedule online" },
    "/phone-lookup": { bn: "যেকোনো নম্বর — অপারেটর ও তথ্য", en: "Any number — operator & details" },
    "/phone-root-unlock": { bn: "রুট, বুটলোডার আনলক ও গাইড", en: "Root, bootloader unlock & guides" },
    "/ad-maker": { bn: "AI দিয়ে অ্যাড ইমেজ ও প্রমো ভিডিও", en: "AI ad images & promo videos" },
    "/policies": { bn: "প্রাইভেসি, শর্তাবলী ও রিফান্ড নীতি", en: "Privacy, terms & refund policies" },
  };
  const sectionCards = ALL_CATEGORIES
    .filter((c) => c.to !== "/")
    .map((c, i) => {
      const descKey = descKeyMap[c.to];
      const inline = inlineDesc[c.to];
      const desc = descKey ? t(descKey) : inline ? (isBn ? inline.bn : inline.en) : "";
      return {
        to: c.to,
        icon: c.icon,
        title: isBn ? c.bn : c.en,
        desc,
        color: gradients[i % gradients.length],
      };
    });


  return (
    <div>
      {/* Hero — premium informative */}
      <section className="relative overflow-hidden min-h-[88vh] flex items-center">
        <img src={PAGE_BANNERS.hero} alt="Bangladesh — Dhaka skyline at golden hour" className="absolute inset-0 w-full h-full object-cover scale-105" width={1920} height={1080} />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/85 via-primary/60 to-background/70 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-background/20" />
        <div className="blob w-[400px] h-[400px] md:w-[560px] md:h-[560px] bg-secondary/30 -top-20 -left-20 animate-float" />
        <div className="blob w-[300px] h-[300px] md:w-[440px] md:h-[440px] bg-primary/40 bottom-0 right-0 animate-float" style={{ animationDelay: "2s" }} />

        {/* Subtle grid overlay */}
        <div className="absolute inset-0 opacity-[0.06] bg-[linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] bg-[size:48px_48px]" />

        <div className="container relative z-10 py-12 md:py-16">
          <div className="grid lg:grid-cols-[1.4fr_1fr] gap-8 lg:gap-10 items-center">
            {/* LEFT — copy + CTAs */}
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="text-white">
              {/* Live status bar */}
              <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[11px] md:text-xs font-medium mb-4 shadow-lg">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                </span>
                <span className="text-emerald-200 font-bold tracking-wider uppercase">{isBn ? "লাইভ" : "Live"}</span>
                <span className="w-px h-3 bg-white/30" />
                <Clock className="w-3 h-3 text-secondary" />
                <span className="tabular-nums font-mono">{dhakaTime}</span>
                <span className="hidden sm:inline opacity-60">• {dhakaDate}</span>
              </div>

              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-card text-white border-secondary/40 text-xs md:text-sm font-medium mb-5 shadow-pink">
                <Sparkles className="w-4 h-4 text-secondary" />
                <span>{t("hero.tagline")}</span>
              </div>

              <p className="text-lg md:text-2xl font-light mb-1 text-white/90">{t("hero.greeting")}</p>
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-[88px] font-display font-bold mb-4 leading-[1.02] drop-shadow-2xl">
                <span className="bg-gradient-to-br from-white via-white to-secondary/80 bg-clip-text text-transparent">
                  {t("hero.name")}
                </span>
              </h1>

              {/* Trust pills row */}
              <div className="flex flex-wrap gap-1.5 mb-5">
                {[
                  { icon: ShieldCheck, label: isBn ? "প্রতিষ্ঠিত ২০১৪" : "EST. 2014", color: "text-secondary" },
                  { icon: Award, label: isBn ? "ভেরিফাইড" : "Verified", color: "text-emerald-300" },
                  { icon: Zap, label: isBn ? "১০০% ফ্রি" : "100% Free", color: "text-amber-300" },
                  { icon: Globe2, label: isBn ? "বাংলা + English" : "BN + EN", color: "text-sky-300" },
                ].map((p, i) => (
                  <span key={i} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[11px] font-semibold">
                    <p.icon className={`w-3 h-3 ${p.color}`} />
                    <span className="text-white/95">{p.label}</span>
                  </span>
                ))}
              </div>

              <p className="text-sm md:text-base mb-6 text-white/85 max-w-2xl leading-relaxed">{t("hero.description")}</p>

              <div className="flex flex-wrap gap-2.5">
                <Link to="/quran">
                  <Button size="lg" className="rounded-full bg-white text-primary hover:bg-white/90 font-semibold shadow-2xl border-0 group">
                    <BookOpen className="mr-2 w-4 h-4" />
                    {t("hero.cta2")} <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <a href="#explore">
                  <Button size="lg" className="rounded-full gradient-bg-warm text-white font-semibold shadow-pink border-0 group">
                    <Sparkles className="mr-2 w-4 h-4" />
                    {t("hero.cta1")} <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </a>
                <Link to="/weather">
                  <Button size="lg" variant="outline" className="rounded-full border-2 border-white/70 text-white bg-white/5 hover:bg-white hover:text-primary font-semibold backdrop-blur-md">
                    <CloudRain className="mr-2 w-4 h-4" />
                    {t("hero.cta3")}
                  </Button>
                </Link>
                <Link to="/services">
                  <Button size="lg" variant="outline" className="rounded-full border-2 border-white/70 text-white bg-white/5 hover:bg-white hover:text-primary font-semibold backdrop-blur-md">
                    <Briefcase className="mr-2 w-4 h-4" />
                    {t("hero.cta4")}
                  </Button>
                </Link>
              </div>

              {/* Premium stat strip */}
              <div className="mt-7 grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-w-2xl">
                {[
                  { v: t("hero.stat1"), icon: Sparkles, sub: isBn ? "স্মার্ট" : "Smart" },
                  { v: t("hero.stat2"), icon: BookOpen, sub: isBn ? "কুরআন" : "Quran" },
                  { v: t("hero.stat3"), icon: Users, sub: isBn ? "সাহায্য" : "Support" },
                  { v: t("hero.stat4"), icon: Zap, sub: isBn ? "ফ্রি" : "Free" },
                ].map((s, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.08 }}
                    className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-xl border border-white/25 px-3 py-3 hover:border-secondary/60 hover:from-secondary/20 hover:to-white/5 transition-all duration-300"
                  >
                    <div className="absolute -top-6 -right-6 w-16 h-16 rounded-full bg-secondary/20 blur-2xl group-hover:bg-secondary/40 transition-colors" />
                    <s.icon className="w-4 h-4 text-secondary mb-1 relative z-10" />
                    <div className="text-base md:text-lg font-display font-bold text-white leading-tight relative z-10">{s.v}</div>
                    <div className="text-[10px] uppercase tracking-wider text-white/60 font-semibold relative z-10">{s.sub}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* RIGHT — floating info cards (desktop only) */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="hidden lg:flex flex-col gap-3 relative"
            >
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-2xl border border-white/25 p-5 shadow-2xl">
                <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-secondary/30 blur-3xl" />
                <div className="flex items-center justify-between mb-3 relative z-10">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-secondary/20 border border-secondary/40 flex items-center justify-center">
                      <Clock className="w-4 h-4 text-secondary" />
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-widest text-white/60 font-bold">{isBn ? "এখন ঢাকায়" : "Now in Dhaka"}</div>
                      <div className="text-xs text-white/85 font-medium">{dhakaDate}</div>
                    </div>
                  </div>
                </div>
                <div className="text-4xl font-display font-bold text-white tabular-nums tracking-tight relative z-10">{dhakaTime}</div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { to: "/namaz", icon: Compass, t: isBn ? "নামাজের সময়" : "Prayer Times", s: isBn ? "৫ ওয়াক্ত" : "5 daily", gradient: "from-emerald-500/30 to-emerald-700/20", accent: "text-emerald-300" },
                  { to: "/weather", icon: CloudRain, t: isBn ? "আবহাওয়া" : "Weather", s: isBn ? "লাইভ আপডেট" : "Live update", gradient: "from-sky-500/30 to-sky-700/20", accent: "text-sky-300" },
                  { to: "/livetv", icon: Tv, t: isBn ? "লাইভ টিভি" : "Live TV", s: isBn ? "৫০+ চ্যানেল" : "50+ channels", gradient: "from-rose-500/30 to-rose-700/20", accent: "text-rose-300" },
                  { to: "/finance", icon: TrendingUp, t: isBn ? "ফিন্যান্স" : "Finance", s: isBn ? "রেট ও টিপস" : "Rates & tips", gradient: "from-amber-500/30 to-amber-700/20", accent: "text-amber-300" },
                ].map((c) => (
                  <Link
                    key={c.to}
                    to={c.to}
                    className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${c.gradient} backdrop-blur-xl border border-white/20 p-3.5 hover:border-white/40 hover:-translate-y-0.5 transition-all duration-300 shadow-lg`}
                  >
                    <div className="absolute -bottom-6 -right-6 w-20 h-20 rounded-full bg-white/10 blur-2xl group-hover:bg-white/20 transition-colors" />
                    <c.icon className={`w-5 h-5 ${c.accent} mb-2 relative z-10`} />
                    <div className="text-sm font-bold text-white relative z-10">{c.t}</div>
                    <div className="text-[10px] text-white/70 relative z-10">{c.s}</div>
                    <ArrowRight className="absolute top-3 right-3 w-3.5 h-3.5 text-white/40 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                  </Link>
                ))}
              </div>

              <Link
                to="/appointment"
                className="group relative overflow-hidden rounded-2xl gradient-bg-warm p-4 shadow-pink hover:scale-[1.02] transition-bounce"
              >
                <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-white/20 blur-2xl" />
                <div className="flex items-center gap-3 relative z-10">
                  <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
                    <CalendarClock className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="text-[10px] uppercase tracking-widest text-white/80 font-bold">{isBn ? "প্রিমিয়াম" : "Premium"}</div>
                    <div className="text-base font-display font-bold text-white">{isBn ? "বুক অ্যাপয়েন্টমেন্ট" : "Book Appointment"}</div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent pointer-events-none" />
      </section>


      <Marquee variant="primary" />

      <DailyWidgets />


      {/* About teaser removed — keep focus on tools */}

      {/* Sections grid */}
      <section id="explore" className="py-12 md:py-20 container scroll-mt-20">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-8 md:mb-12 max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-display font-bold mb-3">
            <span className="gradient-text">{t("section.explore")}</span>
          </h2>
          <p className="text-muted-foreground text-base md:text-lg">{t("section.exploreDesc")}</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {sectionCards.map((card, i) => (
            <motion.div key={card.to} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
              <Link to={card.to} className="group block h-full">
                <div className={`relative h-full p-6 md:p-8 rounded-3xl ${card.color} text-white shadow-elegant overflow-hidden hover:scale-[1.02] transition-bounce`}>
                  <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10 group-hover:scale-150 transition-bounce" />
                  <card.icon className="w-10 h-10 md:w-12 md:h-12 mb-3 md:mb-4 relative z-10" />
                  <h3 className="text-xl md:text-2xl font-display font-bold mb-2 relative z-10">{card.title}</h3>
                  {card.desc && <p className="text-sm md:text-base text-white/90 mb-5 relative z-10 line-clamp-2">{card.desc}</p>}

                  <div className="flex items-center gap-2 font-semibold relative z-10 group-hover:gap-3 transition-smooth text-sm md:text-base">
                    <span>{t("btn.viewDetails")}</span>
                    <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      <Marquee variant="warm" />

      {/* Featured Products — only shown when real products exist */}
      {featured.length > 0 && (
        <section className="py-12 md:py-20 container">
          <div className="flex items-end justify-between mb-8 md:mb-10 gap-4 flex-wrap">
            <div>
              <h2 className="text-3xl md:text-5xl font-display font-bold mb-2">
                <span className="gradient-text">{t("section.featured")}</span>
              </h2>
              <p className="text-muted-foreground text-base md:text-lg">{t("section.featuredDesc")}</p>
            </div>
            <Link to="/shop">
              <Button variant="outline" size="sm" className="rounded-full">
                {t("btn.viewAll")} <ArrowRight className="ml-1 w-4 h-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {featured.map((p, i) => {
              const name = language === "bn" && p.name_bn ? p.name_bn : p.name;
              const finalPrice = p.discount_price || p.price;
              return (
                <motion.div key={p.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                  <Link to={`/shop/${p.id}`}>
                    <Card className="overflow-hidden h-full hover:shadow-elegant transition-smooth group">
                      <div className="relative aspect-square bg-gradient-to-br from-primary/10 via-muted to-accent/10 overflow-hidden">
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-center p-3">
                          <ShoppingBag className="w-8 h-8 text-primary/60" />
                          <span className="text-xs font-semibold text-muted-foreground line-clamp-2">{name}</span>
                        </div>
                        {p.image ? (
                          <img
                            src={p.image}
                            alt={name}
                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-smooth"
                            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                          />
                        ) : null}
                        {p.badge && (
                          <span className={`absolute top-3 left-3 z-10 px-3 py-1 rounded-full ${badgeColorMap[p.badge_color || "red"]} text-white text-xs font-bold shadow-lg`}>
                            {p.badge}
                          </span>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-display font-bold text-base line-clamp-2 mb-2 group-hover:text-primary transition-smooth">{name}</h3>
                        <div className="flex items-baseline gap-2">
                          <span className="text-lg font-bold gradient-text">৳{finalPrice.toLocaleString()}</span>
                          {p.discount_price && <span className="text-sm text-muted-foreground line-through">৳{p.price.toLocaleString()}</span>}
                        </div>
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </section>
      )}

      {/* Featured Services — only shown when real services exist */}
      {featuredServices.length > 0 && (
        <section className="py-12 md:py-20 bg-gradient-to-br from-muted/40 via-background to-muted/40">
          <div className="container">
            <div className="flex items-end justify-between mb-8 md:mb-10 gap-4 flex-wrap">
              <div>
                <h2 className="text-3xl md:text-5xl font-display font-bold mb-2">
                  <span className="gradient-text">{t("section.services")}</span>
                </h2>
                <p className="text-muted-foreground text-base md:text-lg">{t("section.servicesDesc")}</p>
              </div>
              <Link to="/services">
                <Button variant="outline" size="sm" className="rounded-full">
                  {t("btn.viewAll")} <ArrowRight className="ml-1 w-4 h-4" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
              {featuredServices.map((s, i) => {
                const name = language === "bn" && s.name_bn ? s.name_bn : s.name;
                const desc = language === "bn" && s.short_description_bn ? s.short_description_bn : s.short_description;
                return (
                  <motion.div key={s.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                    <Link to={`/services/${s.id}`}>
                      <Card className="overflow-hidden h-full hover:shadow-elegant transition-smooth group">
                        <div className="relative aspect-video bg-gradient-to-br from-primary/10 via-muted to-accent/10 overflow-hidden">
                          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-center p-3">
                            <Briefcase className="w-8 h-8 text-primary/60" />
                            <span className="text-xs font-semibold text-muted-foreground line-clamp-2">{name}</span>
                          </div>
                          {s.image ? (
                            <img
                              src={s.image}
                              alt={name}
                              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-smooth"
                              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                            />
                          ) : null}
                          {s.badge && (
                            <span className={`absolute top-3 left-3 z-10 px-3 py-1 rounded-full ${badgeColorMap[s.badge_color || "red"]} text-white text-xs font-bold shadow-lg`}>
                              {s.badge}
                            </span>
                          )}
                        </div>
                        <div className="p-5">
                          <h3 className="font-display font-bold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-smooth">{name}</h3>
                          {desc && <p className="text-sm text-muted-foreground line-clamp-2">{desc}</p>}
                        </div>
                      </Card>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      <Marquee variant="cool" />

      {/* Reviews — only shown when approved reviews exist */}
      {reviews.length > 0 && (
        <section className="py-12 md:py-20 container">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-8 md:mb-12 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-display font-bold mb-3">
              <span className="gradient-text">{t("section.reviews")}</span>
            </h2>
            <p className="text-muted-foreground text-base md:text-lg">{t("section.reviewsDesc")}</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {reviews.map((r, i) => {
              const reviewerName = r.reviewer_name || (language === "bn" ? "ক্রেতা" : "Customer");
              return (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  whileHover={{ y: -6 }}
                  className="bg-card p-5 md:p-6 rounded-2xl shadow-card border border-border/50 h-full flex flex-col"
                >
                  <div className="flex gap-1 mb-3">
                    {Array.from({ length: r.rating }).map((_, j) => (
                      <Star key={j} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-sm text-foreground/80 mb-4 leading-relaxed line-clamp-4 flex-1">"{r.comment}"</p>
                  <div className="flex items-center justify-between pt-4 border-t border-border/50 mt-auto">
                    <span className="font-semibold text-sm truncate">{reviewerName}</span>
                    <MessageCircle className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>
      )}

      {/* Social section */}
      <section className="py-12 md:py-20 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
        <div className="container text-center">
          <h2 className="text-3xl md:text-5xl font-display font-bold mb-3">
            <span className="gradient-text">{t("section.social")}</span>
          </h2>
          <p className="text-muted-foreground text-base md:text-lg mb-8 md:mb-10">{t("section.socialDesc")}</p>

          <div className="flex justify-center gap-3 md:gap-4 flex-wrap">
            <a href="https://www.facebook.com/jnilbd" target="_blank" rel="noreferrer" className="w-16 h-16 md:w-20 md:h-20 rounded-2xl gradient-bg-cool flex items-center justify-center text-white shadow-glow hover:scale-110 transition-bounce">
              <Facebook className="w-8 h-8 md:w-10 md:h-10" />
            </a>
            <a href="https://www.instagram.com/jnil.us" target="_blank" rel="noreferrer" className="w-16 h-16 md:w-20 md:h-20 rounded-2xl gradient-bg-warm flex items-center justify-center text-white shadow-pink hover:scale-110 transition-bounce">
              <Instagram className="w-8 h-8 md:w-10 md:h-10" />
            </a>
            <a href="https://youtube.com/@jnilbd" target="_blank" rel="noreferrer" aria-label="YouTube" className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-red-600 flex items-center justify-center text-white shadow-glow hover:scale-110 transition-bounce">
              <Youtube className="w-8 h-8 md:w-10 md:h-10" />
            </a>
            <a href="https://www.linkedin.com/in/jnilit" target="_blank" rel="noreferrer" aria-label="LinkedIn" className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-[#0A66C2] flex items-center justify-center text-white shadow-glow hover:scale-110 transition-bounce">
              <Linkedin className="w-8 h-8 md:w-10 md:h-10" />
            </a>
            <a href="https://wa.me/8801774585757" target="_blank" rel="noreferrer" aria-label="WhatsApp" className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-green-500 flex items-center justify-center text-white shadow-glow hover:scale-110 transition-bounce">
              <MessageCircle className="w-8 h-8 md:w-10 md:h-10" />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
