import { Link, NavLink, useNavigate } from "react-router-dom";
import { Menu, X, ShoppingCart, Globe, Phone, Mail, MapPin, LayoutGrid, CalendarClock, Sparkles, CloudSun, HeartPulse, Calculator, ShieldCheck, Wifi, Tv, Newspaper, Wallet, Search } from "lucide-react";
import { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCart } from "@/contexts/CartContext";
import { useMenu } from "@/contexts/MenuContext";
import { Button } from "@/components/ui/button";
import { ALL_CATEGORIES } from "@/lib/categories";
import logoMark from "@/assets/logo-mark.png";

const Navbar = () => {
  const { t, language, toggle } = useLanguage();
  const { count } = useCart();
  const { openMenu, toggleMenu, setOpenMenu } = useMenu();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const isBn = language === "bn";
  const topOpen = openMenu === "top";

  // Inline primary links (top priority — always visible on lg+)
  const primary = [
    { to: "/", key: "nav.home" },
    { to: "/quran", key: "nav.quran" },
    { to: "/hadith", key: "nav.hadith" },
    { to: "/namaz", key: "nav.namaz" },
    { to: "/shop", key: "nav.shop" },
    { to: "/offers", key: "nav.offers" },
    { to: "/ad-maker", key: "nav.adMaker" },
    { to: "/services", key: "nav.services" },
  ];

  // Categories panel = all categories (priority order, Appointment last/highlighted)
  const categories = ALL_CATEGORIES;

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Top utility strip */}
      <div className="hidden md:block bg-primary text-primary-foreground text-xs">
        <div className="container flex h-9 items-center justify-between">
          <div className="flex items-center gap-5 opacity-90">
            <a href="tel:01774585757" className="flex items-center gap-1.5 hover:text-secondary transition-smooth">
              <Phone className="w-3 h-3" /> +880 1774-585757
            </a>
            <a href="mailto:jnilbd@gmail.com" className="flex items-center gap-1.5 hover:text-secondary transition-smooth">
              <Mail className="w-3 h-3" /> jnilbd@gmail.com
            </a>
            <span className="hidden lg:flex items-center gap-1.5 opacity-80">
              <MapPin className="w-3 h-3" /> Baridhara, Dhaka
            </span>
          </div>
          <div className="flex items-center gap-3 opacity-95 text-[11px]">
            <span className="hidden xl:inline-flex items-center gap-1.5 text-secondary">
              <Sparkles className="w-3 h-3" />
              <span className="font-semibold">{isBn ? "৩০+ স্মার্ট টুল" : "30+ Smart Tools"}</span>
            </span>
            <a href="/weather" className="hidden xl:inline-flex items-center gap-1.5 opacity-80 hover:opacity-100 hover:text-secondary transition-smooth">
              <CloudSun className="w-3 h-3" /> {isBn ? "আবহাওয়া" : "Weather"}
            </a>
            <a href="/free-internet" className="hidden xl:inline-flex items-center gap-1.5 opacity-80 hover:opacity-100 hover:text-secondary transition-smooth">
              <Wifi className="w-3 h-3" /> {isBn ? "ফ্রি নেট" : "Free Net"}
            </a>
            <a href="/health" className="hidden xl:inline-flex items-center gap-1.5 opacity-80 hover:opacity-100 hover:text-secondary transition-smooth">
              <HeartPulse className="w-3 h-3" /> {isBn ? "স্বাস্থ্য" : "Health"}
            </a>
            <a href="/politics" className="hidden 2xl:inline-flex items-center gap-1.5 opacity-80 hover:opacity-100 hover:text-secondary transition-smooth">
              <Newspaper className="w-3 h-3" /> {isBn ? "রাজনীতি" : "Politics"}
            </a>
            <a href="/finance" className="hidden 2xl:inline-flex items-center gap-1.5 opacity-80 hover:opacity-100 hover:text-secondary transition-smooth">
              <Wallet className="w-3 h-3" /> {isBn ? "ফিন্যান্স" : "Finance"}
            </a>
            <a href="/livetv" className="hidden xl:inline-flex items-center gap-1.5 opacity-80 hover:opacity-100 hover:text-secondary transition-smooth">
              <Tv className="w-3 h-3" /> {isBn ? "লাইভ টিভি" : "Live TV"}
            </a>
            <a href="/tax" className="hidden 2xl:inline-flex items-center gap-1.5 opacity-80 hover:opacity-100 hover:text-secondary transition-smooth">
              <Calculator className="w-3 h-3" /> {isBn ? "ক্যালকুলেটর" : "Calculators"}
            </a>
            <span className="hidden xl:inline-block w-px h-3.5 bg-primary-foreground/25" />
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-secondary/15 border border-secondary/30 text-secondary text-[10px] font-bold tracking-[0.18em]">
              <ShieldCheck className="w-3 h-3" /> EST. 2014
            </span>
          </div>
        </div>
      </div>

      {/* Main nav */}
      <div className="backdrop-blur-xl bg-background/80 border-b border-border/60 supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-[72px] items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3.5 group shrink-0" onClick={() => setOpenMenu(null)}>
            <div className="relative">
              <span className="absolute inset-0 rounded-full bg-gradient-to-br from-secondary/30 via-secondary/10 to-transparent blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-background to-muted/60 ring-1 ring-secondary/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.6),0_4px_14px_-4px_rgba(180,140,60,0.35)] flex items-center justify-center group-hover:ring-secondary/70 transition-all duration-500">
                <img
                  src={logoMark}
                  alt="JohnNil monogram"
                  width={44}
                  height={44}
                  className="w-9 h-9 object-contain group-hover:scale-110 transition-bounce"
                />
              </div>
            </div>
            <div className="flex flex-col leading-none whitespace-nowrap">
              <span className="font-display font-bold text-[24px] tracking-tight bg-gradient-to-r from-foreground via-foreground to-foreground/80 bg-clip-text text-transparent">
                JohnNil<span className="bg-gradient-to-br from-secondary to-secondary/60 bg-clip-text text-transparent">.com</span>
              </span>
              <span className="flex items-center gap-1 text-[8.5px] tracking-[0.22em] uppercase text-muted-foreground font-semibold mt-1.5 whitespace-nowrap">
                <span className="text-secondary">{isBn ? "মান" : "Quality"}</span>
                <span className="opacity-40">•</span>
                <span className="text-secondary">{isBn ? "বিশ্বাস" : "Trust"}</span>
                <span className="opacity-40">•</span>
                <span className="text-secondary">{isBn ? "শান্তি" : "Peace"}</span>
              </span>
            </div>
          </Link>


          <nav className="hidden lg:flex items-center gap-0.5">
            {primary.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === "/"}
                onClick={() => setOpenMenu(null)}
                className={({ isActive }) =>
                  `relative px-3 py-2 rounded-md text-[13px] font-medium tracking-wide transition-smooth ${
                    isActive ? "text-foreground" : "text-foreground/65 hover:text-foreground"
                  } group`
                }
              >
                {({ isActive }) => (
                  <>
                    {t(l.key)}
                    <span
                      className={`absolute left-3 right-3 -bottom-0.5 h-[2px] bg-secondary transition-all duration-300 ${
                        isActive ? "opacity-100 scale-x-100" : "opacity-0 scale-x-0 group-hover:opacity-60 group-hover:scale-x-100"
                      }`}
                    />
                  </>
                )}
              </NavLink>
            ))}

            {/* Categories trigger */}
            <button
              onClick={() => toggleMenu("top")}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-[13px] font-semibold tracking-wide transition-smooth ${
                topOpen ? "bg-primary/10 text-primary" : "text-foreground/65 hover:text-foreground"
              }`}
              aria-expanded={topOpen}
            >
              <LayoutGrid className="w-4 h-4" />
              {isBn ? "সব ক্যাটাগরি" : "All Categories"}
            </button>

            {/* Highlighted Appointment CTA — last */}
            <Link
              to="/appointment"
              onClick={() => setOpenMenu(null)}
              className="ml-2 flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[12px] font-bold gradient-bg-warm text-white shadow-pink hover:scale-105 transition-bounce"
            >
              <CalendarClock className="w-3.5 h-3.5" />
              {isBn ? "বুক অ্যাপয়েন্টমেন্ট" : "Book Appointment"}
            </Link>
          </nav>

          <div className="flex items-center gap-1.5">
            <button
              onClick={toggle}
              aria-label="Switch language"
              className="group relative flex items-center gap-1.5 h-9 px-1 pr-3 rounded-full border border-border/60 bg-gradient-to-r from-background to-muted/40 hover:border-primary/50 hover:shadow-md transition-all"
            >
              <span className="relative flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 ring-1 ring-primary/30">
                <Globe className="w-3.5 h-3.5 text-primary" strokeWidth={2.5} />
              </span>
              <span className="flex items-center text-[11px] font-bold tracking-wider">
                <span className={language === "en" ? "text-primary" : "text-muted-foreground/60"}>EN</span>
                <span className="mx-1 text-muted-foreground/40">|</span>
                <span className={language === "bn" ? "text-primary font-display" : "text-muted-foreground/60 font-display"}>বাং</span>
              </span>
            </button>

            <Link to="/cart" className="relative" onClick={() => setOpenMenu(null)}>
              <Button variant="ghost" size="icon" className="rounded-full">
                <ShoppingCart className="w-[18px] h-[18px]" />
                {count > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-secondary text-secondary-foreground text-[10px] flex items-center justify-center font-bold">
                    {count}
                  </span>
                )}
              </Button>
            </Link>

            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden rounded-full"
              onClick={() => {
                setOpenMenu(null);
                setMobileNavOpen((o) => !o);
              }}
              aria-label="Menu"
            >
              {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Desktop Categories dropdown panel */}
      <AnimatePresence>
        {topOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpenMenu(null)}
              className="fixed inset-0 bg-foreground/30 backdrop-blur-sm z-40 hidden lg:block"
            />
            <motion.div
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -10, opacity: 0 }}
              className="hidden lg:block absolute left-0 right-0 z-50 border-b border-border/60 bg-background/98 backdrop-blur-xl shadow-elegant"
            >
              <div className="container py-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display font-bold text-lg">
                    {isBn ? "সব ক্যাটাগরি" : "All Categories"}
                  </h3>
                  <button
                    onClick={() => setOpenMenu(null)}
                    className="w-8 h-8 rounded-full bg-muted hover:bg-muted/70 flex items-center justify-center"
                    aria-label="Close"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-4 xl:grid-cols-6 gap-2">
                  {categories.map((c) => (
                    <Link
                      key={c.to}
                      to={c.to}
                      onClick={() => setOpenMenu(null)}
                      className={`flex flex-col items-center justify-center gap-2 p-3 rounded-2xl border transition-smooth ${
                        c.highlight
                          ? "gradient-bg-warm text-white border-transparent shadow-pink hover:scale-[1.03]"
                          : "bg-muted/40 border-border/40 hover:bg-primary/10 hover:text-primary hover:border-primary/30"
                      }`}
                    >
                      <c.icon className="w-6 h-6" />
                      <span className="text-[12px] font-semibold text-center leading-tight">
                        {isBn ? c.bn : c.en}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Mobile small primary nav (hamburger) */}
      <AnimatePresence>
        {mobileNavOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="lg:hidden overflow-hidden border-b border-border/60 bg-background/98 backdrop-blur-xl"
          >
            <nav className="container py-4 flex flex-col gap-0.5">
              {primary.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  end={l.to === "/"}
                  onClick={() => setMobileNavOpen(false)}
                  className={({ isActive }) =>
                    `px-4 py-3 rounded-lg font-medium transition-smooth border-l-2 ${
                      isActive
                        ? "text-foreground bg-muted border-secondary"
                        : "text-foreground/70 hover:bg-muted border-transparent"
                    }`
                  }
                >
                  {t(l.key)}
                </NavLink>
              ))}
              <Link
                to="/appointment"
                onClick={() => setMobileNavOpen(false)}
                className="mt-2 px-4 py-3 rounded-lg font-bold gradient-bg-warm text-white text-center shadow-pink"
              >
                {isBn ? "বুক অ্যাপয়েন্টমেন্ট" : "Book Appointment"}
              </Link>
              <div className="mt-3 pt-3 border-t border-border/50 flex flex-col gap-2 text-xs text-muted-foreground px-2">
                <a href="tel:01774585757" className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-secondary" /> +880 1774-585757</a>
                <a href="mailto:jnilbd@gmail.com" className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-secondary" /> jnilbd@gmail.com</a>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
