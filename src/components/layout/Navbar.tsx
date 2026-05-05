import { Link, NavLink } from "react-router-dom";
import { Menu, X, ShoppingCart, Globe, Phone, Mail, MapPin } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import logoMark from "@/assets/logo-mark.png";

const Navbar = () => {
  const { t, language, toggle } = useLanguage();
  const { count } = useCart();
  const [open, setOpen] = useState(false);

  const links = [
    { to: "/", key: "nav.home" },
    { to: "/quran", key: "nav.quran" },
    { to: "/namaz", key: "nav.namaz" },
    { to: "/weather", key: "nav.weather" },
    { to: "/health", key: "nav.health" },
    { to: "/finance", key: "nav.finance" },
    { to: "/shop", key: "nav.shop" },
    { to: "/services", key: "nav.services" },
    { to: "/marketplace", key: "nav.marketplace" },
    { to: "/blog", key: "nav.blog" },
    { to: "/about", key: "nav.about" },
  ];

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
          <div className="flex items-center gap-4 opacity-90">
            <span className="hidden lg:inline tracking-[0.2em] uppercase text-[10px] text-secondary font-semibold">
              {language === "bn" ? "প্রিমিয়াম অল-ইন-ওয়ান প্ল্যাটফর্ম" : "Premium All-in-One Platform"}
            </span>
            <span className="text-[10px] tracking-wider uppercase opacity-70">EST. 2018</span>
          </div>
        </div>
      </div>

      {/* Main nav */}
      <div className="backdrop-blur-xl bg-background/80 border-b border-border/60 supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-[72px] items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3 group shrink-0">
            <div className="relative">
              <img
                src={logoMark}
                alt="JohnNil monogram"
                width={44}
                height={44}
                className="w-11 h-11 object-contain drop-shadow-sm group-hover:scale-105 transition-bounce"
              />
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-display font-bold text-[22px] tracking-tight text-foreground">
                JohnNil<span className="text-secondary">.</span>
              </span>
              <span className="text-[9.5px] tracking-[0.32em] uppercase text-muted-foreground font-semibold mt-1">
                {language === "bn" ? "ক্রাফটেড ইন ঢাকা" : "Crafted in Dhaka"}
              </span>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-0.5">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === "/"}
                className={({ isActive }) =>
                  `relative px-3 py-2 rounded-md text-[13px] font-medium tracking-wide transition-smooth ${
                    isActive
                      ? "text-foreground"
                      : "text-foreground/65 hover:text-foreground"
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

            <Link to="/cart" className="relative">
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
              onClick={() => setOpen(!open)}
              aria-label="Menu"
            >
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="lg:hidden overflow-hidden border-b border-border/60 bg-background/98 backdrop-blur-xl"
          >
            <nav className="container py-4 flex flex-col gap-0.5">
              {links.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  end={l.to === "/"}
                  onClick={() => setOpen(false)}
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
