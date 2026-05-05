import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, ShoppingBag, Briefcase, FolderKanban, BookOpen, Tag, Home as HomeIcon, Star, Facebook, Instagram, MessageCircle, Youtube, Linkedin, CalendarClock, Wallet } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import Marquee from "@/components/Marquee";
import ProductCard from "@/components/ProductCard";
import ServiceCard from "@/components/ServiceCard";
import { products, services, reviews } from "@/data/mockData";

const Home = () => {
  const { t, language } = useLanguage();
  const featured = products.filter((p) => p.featured).slice(0, 4);
  const featuredServices = services.slice(0, 3);

  const sectionCards = [
    { to: "/shop", icon: ShoppingBag, titleKey: "nav.shop", descKey: "card.shop", color: "gradient-bg-primary" },
    { to: "/services", icon: Briefcase, titleKey: "nav.services", descKey: "card.services", color: "gradient-bg-warm" },
    { to: "/portfolio", icon: FolderKanban, titleKey: "nav.portfolio", descKey: "card.portfolio", color: "gradient-bg-cool" },
    { to: "/blog", icon: BookOpen, titleKey: "nav.blog", descKey: "card.blog", color: "gradient-bg-primary" },
    { to: "/marketplace", icon: Tag, titleKey: "nav.marketplace", descKey: "card.marketplace", color: "gradient-bg-warm" },
    { to: "/rentals", icon: HomeIcon, titleKey: "nav.rentals", descKey: "card.rentals", color: "gradient-bg-cool" },
    { to: "/appointment", icon: CalendarClock, titleKey: "nav.appointment", descKey: "card.appointment", color: "gradient-bg-primary" },
    { to: "/finance", icon: Wallet, titleKey: "nav.finance", descKey: "card.finance", color: "gradient-bg-warm" },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden min-h-[78vh] md:min-h-[88vh] flex items-center">
        <div className="absolute inset-0 animated-gradient opacity-90" />
        <div className="absolute inset-0 bg-background/10" />
        <div className="blob w-[320px] h-[320px] md:w-[500px] md:h-[500px] bg-white/30 top-10 -left-20 animate-float" />
        <div className="blob w-[260px] h-[260px] md:w-[400px] md:h-[400px] bg-secondary/40 bottom-10 right-10 animate-float" style={{ animationDelay: "2s" }} />

        <div className="container relative z-10 py-14 md:py-20">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="max-w-3xl text-white">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-card text-white border-white/40 text-xs md:text-sm font-medium mb-5">
              <Sparkles className="w-4 h-4" />
              <span>{t("hero.tagline")}</span>
            </div>
            <p className="text-xl md:text-3xl font-light mb-1.5">{t("hero.greeting")}</p>
            <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-display font-bold mb-5 leading-[1.05]">
              {t("hero.name")}
            </h1>
            <p className="text-base md:text-xl mb-7 text-white/90 max-w-2xl leading-relaxed">{t("hero.description")}</p>
            <div className="flex flex-wrap gap-3">
              <Link to="/shop">
                <Button size="lg" className="rounded-full bg-white text-primary hover:bg-white/90 font-semibold shadow-2xl border-0">
                  {t("hero.cta1")} <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link to="/services">
                <Button size="lg" variant="outline" className="rounded-full border-2 border-white text-white bg-white/10 hover:bg-white hover:text-primary font-semibold backdrop-blur-sm">
                  {t("hero.cta2")}
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Marquee variant="primary" />

      {/* About teaser - moved to top */}
      <section className="py-12 md:py-20 bg-gradient-to-br from-primary/5 via-secondary/10 to-accent/5">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative max-w-4xl mx-auto rounded-3xl overflow-hidden shadow-elegant border border-border/60 bg-card"
          >
            <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full gradient-bg-warm opacity-20 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full gradient-bg-cool opacity-20 blur-3xl" />
            <div className="relative p-6 md:p-12">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/15 text-secondary text-xs font-semibold mb-4">
                <Sparkles className="w-3.5 h-3.5" />
                {language === "bn" ? "আমার গল্প" : "My Story"}
              </div>
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
                <span className="gradient-text">
                  {language === "bn"
                    ? "একটি গ্রাম থেকে শুরু — ২০০৬ থেকে এখনো অনলাইনে"
                    : "From a small village — online since 2006"}
                </span>
              </h2>
              <p className="text-base md:text-lg text-foreground/80 leading-relaxed mb-3">
                {language === "bn"
                  ? "আমি আবু সাঈদ, অনেকে আমাকে চেনেন জন নীল নামে। self-taught একজন ক্রিয়েটর — Free Internet, VPN Handler, ৪১টি Wapka সাইট, ৭৮ হাজার সদস্যের কমিউনিটি, অফলাইন সার্ভিস থেকে শুরু করে আবার এই নতুন অধ্যায় পর্যন্ত — প্রতিটা ধাপ নিজে শিখে এসেছি।"
                  : "I'm Abu Saeed — most people know me as John Nil. A self-taught creator: free internet, VPN Handler, 41 Wapka sites, a 78K-member community, offline services, and now this new chapter — every step learned on my own."}
              </p>
              <p className="text-sm md:text-base text-muted-foreground mb-6 italic">
                {language === "bn"
                  ? "“যখন যেটা দরকার, সেটাই শিখেছি — আর অন্যদের সাথে শেয়ার করেছি।”"
                  : "“I learned what I needed, when I needed it — and shared it with others.”"}
              </p>
              <Link to="/about">
                <Button size="lg" className="rounded-full gradient-bg-primary text-white border-0 hover:opacity-90">
                  {language === "bn" ? "পুরো গল্প পড়ুন" : "Read full story"}{" "}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Sections grid */}
      <section className="py-12 md:py-20 container">
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
                  <h3 className="text-xl md:text-2xl font-display font-bold mb-2 relative z-10">{t(card.titleKey)}</h3>
                  <p className="text-sm md:text-base text-white/90 mb-5 relative z-10 line-clamp-2">{t(card.descKey)}</p>
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

      {/* Featured Products */}
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
          {featured.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
        </div>
      </section>

      {/* Featured Services */}
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
            {featuredServices.map((s, i) => <ServiceCard key={s.id} service={s} index={i} />)}
          </div>
        </div>
      </section>

      <Marquee variant="cool" />

      {/* Reviews */}
      <section className="py-12 md:py-20 container">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-8 md:mb-12 max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-display font-bold mb-3">
            <span className="gradient-text">{t("section.reviews")}</span>
          </h2>
          <p className="text-muted-foreground text-base md:text-lg">{t("section.reviewsDesc")}</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {reviews.map((r, i) => {
            const SourceIcon = r.source === "facebook" ? Facebook : r.source === "instagram" ? Instagram : MessageCircle;
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
                <p className="text-sm text-foreground/80 mb-4 leading-relaxed line-clamp-4 flex-1">"{language === "bn" ? r.textBn : r.text}"</p>
                <div className="flex items-center justify-between pt-4 border-t border-border/50 mt-auto">
                  <div className="flex items-center gap-2 min-w-0">
                    <img src={r.avatar} alt={r.name} className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
                    <span className="font-semibold text-sm truncate">{r.name}</span>
                  </div>
                  <SourceIcon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Social section */}
      <section className="py-12 md:py-20 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
        <div className="container text-center">
          <h2 className="text-3xl md:text-5xl font-display font-bold mb-3">
            <span className="gradient-text">{t("section.social")}</span>
          </h2>
          <p className="text-muted-foreground text-base md:text-lg mb-8 md:mb-10">{t("section.socialDesc")}</p>

          <div className="flex justify-center gap-3 md:gap-4 flex-wrap">
            <a href="https://facebook.com" target="_blank" rel="noreferrer" className="w-16 h-16 md:w-20 md:h-20 rounded-2xl gradient-bg-cool flex items-center justify-center text-white shadow-glow hover:scale-110 transition-bounce">
              <Facebook className="w-8 h-8 md:w-10 md:h-10" />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="w-16 h-16 md:w-20 md:h-20 rounded-2xl gradient-bg-warm flex items-center justify-center text-white shadow-pink hover:scale-110 transition-bounce">
              <Instagram className="w-8 h-8 md:w-10 md:h-10" />
            </a>
            <a href="https://youtube.com" target="_blank" rel="noreferrer" aria-label="YouTube" className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-red-600 flex items-center justify-center text-white shadow-glow hover:scale-110 transition-bounce">
              <Youtube className="w-8 h-8 md:w-10 md:h-10" />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" aria-label="LinkedIn" className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-[#0A66C2] flex items-center justify-center text-white shadow-glow hover:scale-110 transition-bounce">
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
