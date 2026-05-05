import { Link, NavLink, useLocation } from "react-router-dom";
import { Home, Store, ShoppingCart, LayoutGrid, MessageCircle, X, Briefcase, FolderKanban, BookOpen, Tag, Home as HomeIcon, User, CalendarClock, ShieldCheck, Wallet, Image as ImageIcon, Mic, Compass, FileType, Tv, Download, Clock, Map, Ruler, HeartPulse, Sun, Lock, Receipt, Scale, Percent } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCart } from "@/contexts/CartContext";

const MobileTabBar = () => {
  const { t, language } = useLanguage();
  const { count } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const tabs = [
    { to: "/", icon: Home, label: language === "bn" ? "হোম" : "Home" },
    { to: "/shop", icon: Store, label: language === "bn" ? "শপ" : "Shop" },
    { to: "/cart", icon: ShoppingCart, label: language === "bn" ? "কার্ট" : "Cart", badge: count },
  ];

  const menuItems = [
    { to: "/finance", icon: Wallet, label: language === "bn" ? "ফিন্যান্স" : "Finance" },
    { to: "/thumbnail", icon: ImageIcon, label: language === "bn" ? "থাম্বনেইল" : "Thumbnail" },
    { to: "/voice", icon: Mic, label: language === "bn" ? "ভয়েস" : "Voice" },
    { to: "/chat", icon: MessageCircle, label: language === "bn" ? "লাইভ চ্যাট" : "Live Chat" },
    { to: "/namaz", icon: Compass, label: language === "bn" ? "নামাজ" : "Namaz" },
    { to: "/quran", icon: BookOpen, label: language === "bn" ? "কুরআন" : "Quran" },
    { to: "/converter", icon: FileType, label: language === "bn" ? "কনভার্টার" : "Converter" },
    { to: "/livetv", icon: Tv, label: language === "bn" ? "লাইভ টিভি" : "Live TV" },
    { to: "/downloader", icon: Download, label: language === "bn" ? "ডাউনলোডার" : "Downloader" },
    { to: "/scheduler", icon: Clock, label: language === "bn" ? "শিডিউল মেসেজ" : "Scheduler" },
    { to: "/land", icon: Map, label: language === "bn" ? "ভূমি জরিপ" : "Land Survey" },
    { to: "/height", icon: Ruler, label: language === "bn" ? "উচ্চতা" : "Height" },
    { to: "/health", icon: HeartPulse, label: language === "bn" ? "স্বাস্থ্য" : "Health" },
    { to: "/solar", icon: Sun, label: language === "bn" ? "সোলার" : "Solar" },
    { to: "/vault", icon: Lock, label: language === "bn" ? "ভল্ট" : "Vault" },
    { to: "/tax", icon: Receipt, label: language === "bn" ? "ট্যাক্স" : "Tax" },
    { to: "/warish", icon: Scale, label: language === "bn" ? "ওয়ারিশ" : "Warish" },
    { to: "/profit-loss", icon: Percent, label: language === "bn" ? "লাভ/ক্ষতি" : "Profit/Loss" },
    { to: "/services", icon: Briefcase, label: t("nav.services") },
    { to: "/portfolio", icon: FolderKanban, label: t("nav.portfolio") },
    { to: "/blog", icon: BookOpen, label: t("nav.blog") },
    { to: "/marketplace", icon: Tag, label: t("nav.marketplace") },
    { to: "/rentals", icon: HomeIcon, label: t("nav.rentals") },
    { to: "/appointment", icon: CalendarClock, label: language === "bn" ? "অ্যাপয়েন্টমেন্ট" : "Appointment" },
    { to: "/about", icon: User, label: t("nav.about") },
    { to: "/policies", icon: ShieldCheck, label: language === "bn" ? "পলিসি" : "Policies" },
  ];

  return (
    <>
      {/* Backdrop sheet for menu */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
              className="fixed inset-0 bg-foreground/40 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              className="fixed bottom-[68px] left-0 right-0 z-50 lg:hidden"
            >
              <div className="mx-3 mb-2 rounded-3xl bg-card/95 backdrop-blur-xl border border-border/60 shadow-elegant overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3 border-b border-border/50">
                  <span className="font-display font-bold text-base">
                    {language === "bn" ? "সব ক্যাটাগরি" : "All Categories"}
                  </span>
                  <button
                    onClick={() => setMenuOpen(false)}
                    className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"
                    aria-label="Close"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2 p-4">
                  {menuItems.map((m) => (
                    <Link
                      key={m.to}
                      to={m.to}
                      onClick={() => setMenuOpen(false)}
                      className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl bg-muted/60 hover:bg-primary/10 hover:text-primary transition-smooth"
                    >
                      <m.icon className="w-6 h-6" />
                      <span className="text-[11px] font-semibold text-center leading-tight">
                        {m.label}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Bottom tab bar — mobile only */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden pb-[env(safe-area-inset-bottom)]">
        <div className="bg-background/90 backdrop-blur-xl border-t border-border/60 shadow-[0_-8px_24px_-12px_hsl(var(--foreground)/0.15)]">
          <div className="grid grid-cols-4 items-center h-[68px] px-1">
            {tabs.map((tab) => {
              const active = location.pathname === tab.to;
              return (
                <NavLink
                  key={tab.to}
                  to={tab.to}
                  className="relative flex flex-col items-center justify-center gap-0.5 h-full"
                >
                  <div className={`relative flex items-center justify-center w-10 h-10 rounded-2xl transition-smooth ${active ? "gradient-bg-primary text-white shadow-glow" : "text-foreground/65"}`}>
                    <tab.icon className="w-[22px] h-[22px]" />
                    {tab.badge && tab.badge > 0 && (
                      <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-secondary text-secondary-foreground text-[10px] font-bold flex items-center justify-center border-2 border-background">
                        {tab.badge}
                      </span>
                    )}
                  </div>
                  <span className={`text-[10px] font-semibold ${active ? "text-primary" : "text-muted-foreground"}`}>
                    {tab.label}
                  </span>
                </NavLink>
              );
            })}

            {/* Menu */}
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="relative flex flex-col items-center justify-center gap-0.5 h-full"
              aria-label="Menu"
            >
              <div className={`flex items-center justify-center w-10 h-10 rounded-2xl transition-smooth ${menuOpen ? "gradient-bg-warm text-white shadow-pink" : "text-foreground/65"}`}>
                {menuOpen ? <X className="w-[22px] h-[22px]" /> : <LayoutGrid className="w-[22px] h-[22px]" />}
              </div>
              <span className={`text-[10px] font-semibold ${menuOpen ? "text-secondary" : "text-muted-foreground"}`}>
                {language === "bn" ? "মেনু" : "Menu"}
              </span>
            </button>
          </div>
        </div>
      </nav>

      {/* Spacer so content isn't hidden behind tab bar on mobile */}
      <div className="h-[72px] lg:hidden" aria-hidden />
    </>
  );
};

export default MobileTabBar;
