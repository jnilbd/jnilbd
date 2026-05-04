import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, ShoppingBag, Briefcase, FolderKanban, BookOpen, Tag, Home as HomeIcon, Star, Facebook, Instagram, MessageCircle } from "lucide-react";
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
  ];

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden min-h-[92vh] flex items-center">
        <div className="absolute inset-0 animated-gradient opacity-90" />
        <div className="absolute inset-0 bg-background/10" />
        <div className="blob w-[500px] h-[500px] bg-white/30 top-10 -left-20 animate-float" />
        <div className="blob w-[400px] h-[400px] bg-secondary/40 bottom-10 right-10 animate-float" style={{ animationDelay: "2s" }} />

        <div className="container relative z-10 py-20">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="max-w-3xl text-white">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card text-white border-white/40 text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              <span>{t("hero.tagline")}</span>
            </div>
            <p className="text-2xl md:text-3xl font-light mb-2">{t("hero.greeting")}</p>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-bold mb-6 leading-none">
              {t("hero.name")}
            </h1>
            <p className="text-lg md:text-xl mb-8 text-white/90 max-w-2xl leading-relaxed">{t("hero.description")}</p>
            <div className="flex flex-wrap gap-4">
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

      {/* Sections grid */}
      <section className="py-20 container">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-3">
            <span className="gradient-text">{t("section.explore")}</span>
          </h2>
          <p className="text-muted-foreground text-lg">{t("section.exploreDesc")}</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sectionCards.map((card, i) => (
            <motion.div key={card.to} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
              <Link to={card.to} className="group block h-full">
                <div className={`relative h-full p-8 rounded-3xl ${card.color} text-white shadow-elegant overflow-hidden hover:scale-[1.02] transition-bounce`}>
                  <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10 group-hover:scale-150 transition-bounce" />
                  <card.icon className="w-12 h-12 mb-4 relative z-10" />
                  <h3 className="text-2xl font-display font-bold mb-2 relative z-10">{t(card.titleKey)}</h3>
                  <p className="text-white/90 mb-6 relative z-10">{t(card.descKey)}</p>
                  <div className="flex items-center gap-2 font-semibold relative z-10 group-hover:gap-3 transition-smooth">
                    <span>{t("btn.viewDetails")}</span>
                    <ArrowRight className="w-5 h-5" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      <Marquee variant="warm" />

      {/* Featured Products */}
      <section className="py-20 container">
        <div className="flex items-end justify-between mb-12 gap-4">
          <div>
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-2">
              <span className="gradient-text">{t("section.featured")}</span>
            </h2>
            <p className="text-muted-foreground text-lg">{t("section.featuredDesc")}</p>
          </div>
          <Link to="/shop">
            <Button variant="outline" className="rounded-full">
              {t("btn.viewAll")} <ArrowRight className="ml-1 w-4 h-4" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {featured.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
        </div>
      </section>

      {/* Featured Services */}
      <section className="py-20 bg-gradient-to-br from-muted/40 via-background to-muted/40">
        <div className="container">
          <div className="flex items-end justify-between mb-12 gap-4">
            <div>
              <h2 className="text-4xl md:text-5xl font-display font-bold mb-2">
                <span className="gradient-text">{t("section.services")}</span>
              </h2>
              <p className="text-muted-foreground text-lg">{t("section.servicesDesc")}</p>
            </div>
            <Link to="/services">
              <Button variant="outline" className="rounded-full">
                {t("btn.viewAll")} <ArrowRight className="ml-1 w-4 h-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredServices.map((s, i) => <ServiceCard key={s.id} service={s} index={i} />)}
          </div>
        </div>
      </section>

      <Marquee variant="cool" />

      {/* Reviews */}
      <section className="py-20 container">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-3">
            <span className="gradient-text">{t("section.reviews")}</span>
          </h2>
          <p className="text-muted-foreground text-lg">{t("section.reviewsDesc")}</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                className="bg-card p-6 rounded-2xl shadow-card border border-border/50"
              >
                <div className="flex gap-1 mb-3">
                  {Array.from({ length: r.rating }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-sm text-foreground/80 mb-4 leading-relaxed">"{language === "bn" ? r.textBn : r.text}"</p>
                <div className="flex items-center justify-between pt-4 border-t border-border/50">
                  <div className="flex items-center gap-2">
                    <img src={r.avatar} alt={r.name} className="w-9 h-9 rounded-full object-cover" />
                    <span className="font-semibold text-sm">{r.name}</span>
                  </div>
                  <SourceIcon className="w-4 h-4 text-muted-foreground" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Social section */}
      <section className="py-20 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
        <div className="container text-center">
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-3">
            <span className="gradient-text">{t("section.social")}</span>
          </h2>
          <p className="text-muted-foreground text-lg mb-10">{t("section.socialDesc")}</p>

          <div className="flex justify-center gap-4 flex-wrap">
            <a href="https://facebook.com" target="_blank" rel="noreferrer" className="w-20 h-20 rounded-2xl gradient-bg-cool flex items-center justify-center text-white shadow-glow hover:scale-110 transition-bounce">
              <Facebook className="w-10 h-10" />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="w-20 h-20 rounded-2xl gradient-bg-warm flex items-center justify-center text-white shadow-pink hover:scale-110 transition-bounce">
              <Instagram className="w-10 h-10" />
            </a>
            <a href="https://wa.me/8801774585757" target="_blank" rel="noreferrer" className="w-20 h-20 rounded-2xl bg-green-500 flex items-center justify-center text-white shadow-glow hover:scale-110 transition-bounce">
              <MessageCircle className="w-10 h-10" />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
