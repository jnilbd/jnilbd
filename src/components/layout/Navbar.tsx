import { Link, NavLink } from "react-router-dom";
import { Menu, X, ShoppingCart, Languages, Sparkles } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  const { t, language, toggle } = useLanguage();
  const { count } = useCart();
  const [open, setOpen] = useState(false);

  const links = [
    { to: "/", key: "nav.home" },
    { to: "/shop", key: "nav.shop" },
    { to: "/services", key: "nav.services" },
    { to: "/portfolio", key: "nav.portfolio" },
    { to: "/blog", key: "nav.blog" },
    { to: "/marketplace", key: "nav.marketplace" },
    { to: "/rentals", key: "nav.rentals" },
    { to: "/about", key: "nav.about" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-background/70 border-b border-border/50">
      <div className="container flex h-16 items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-xl gradient-bg-primary flex items-center justify-center shadow-glow group-hover:scale-110 transition-bounce">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="font-display font-bold text-xl gradient-text">JohnNil</span>
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === "/"}
              className={({ isActive }) =>
                `px-3 py-2 rounded-lg text-sm font-medium transition-smooth ${
                  isActive ? "text-primary bg-primary/10" : "text-foreground/70 hover:text-primary hover:bg-muted"
                }`
              }
            >
              {t(l.key)}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={toggle} className="gap-1.5 rounded-full">
            <Languages className="w-4 h-4" />
            <span className="font-semibold text-xs">{language === "bn" ? "EN" : "বাং"}</span>
          </Button>

          <Link to="/cart" className="relative">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ShoppingCart className="w-5 h-5" />
              {count > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full gradient-bg-primary text-white text-xs flex items-center justify-center font-bold">
                  {count}
                </span>
              )}
            </Button>
          </Link>

          <Button variant="ghost" size="icon" className="lg:hidden rounded-full" onClick={() => setOpen(!open)}>
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="lg:hidden overflow-hidden border-t border-border/50 bg-background/95"
          >
            <nav className="container py-4 flex flex-col gap-1">
              {links.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  end={l.to === "/"}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `px-4 py-3 rounded-lg font-medium transition-smooth ${
                      isActive ? "text-primary bg-primary/10" : "text-foreground/70 hover:bg-muted"
                    }`
                  }
                >
                  {t(l.key)}
                </NavLink>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
