import { Link, NavLink, useLocation } from "react-router-dom";
import { Home, Store, ShoppingCart, LayoutGrid, MessageCircle, X, Briefcase, FolderKanban, BookOpen, Tag, Home as HomeIcon, User } from "lucide-react";
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
    { to: "/services", icon: Briefcase, label: t("nav.services") },
    { to: "/portfolio", icon: FolderKanban, label: t("nav.portfolio") },
    { to: "/blog", icon: BookOpen, label: t("nav.blog") },
    { to: "/marketplace", icon: Tag, label: t("nav.marketplace") },
    { to: "/rentals", icon: HomeIcon, label: t("nav.rentals") },
    { to: "/about", icon: User, label: t("nav.about") },
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
          <div className="grid grid-cols-5 items-center h-[68px] px-1">
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

            {/* WhatsApp */}
            <a
              href="https://wa.me/8801774585757"
              target="_blank"
              rel="noreferrer"
              className="relative flex flex-col items-center justify-center gap-0.5 h-full"
              aria-label="WhatsApp"
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-green-500 text-white shadow-glow">
                <MessageCircle className="w-[22px] h-[22px]" />
              </div>
              <span className="text-[10px] font-semibold text-green-600">
                WhatsApp
              </span>
            </a>
          </div>
        </div>
      </nav>

      {/* Spacer so content isn't hidden behind tab bar on mobile */}
      <div className="h-[72px] lg:hidden" aria-hidden />
    </>
  );
};

export default MobileTabBar;
