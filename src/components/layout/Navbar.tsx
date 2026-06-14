import { Link, NavLink, useNavigate } from "react-router-dom";
import { Menu, X, ShoppingCart, Globe, Phone, Mail, MapPin, LayoutGrid, CalendarClock, Sparkles, CloudSun, HeartPulse, Calculator, ShieldCheck, Wifi, Tv, Newspaper, Wallet, Search, Home, BookOpen, ScrollText, Compass, Store, Gift, Wand2, Briefcase, LogIn, UserPlus, LogOut, User as UserIcon } from "lucide-react";
import { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCart } from "@/contexts/CartContext";
import { useMenu } from "@/contexts/MenuContext";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ALL_CATEGORIES } from "@/lib/categories";
import logoMark from "@/assets/logo-mark.png";

const Navbar = () => {
  const { t, language, toggle } = useLanguage();
  const { count } = useCart();
  const { openMenu, toggleMenu, setOpenMenu } = useMenu();
  const { user, signOut } = useAuth();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const isBn = language === "bn";
  const topOpen = openMenu === "top";

  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return ALL_CATEGORIES.filter(
      (c) => c.en.toLowerCase().includes(q) || c.bn.includes(q) || c.to.includes(q)
    ).slice(0, 8);
  }, [searchQuery]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const goToResult = (to: string) => {
    setSearchQuery("");
    setSearchOpen(false);
    setMobileSearchOpen(false);
    setMobileNavOpen(false);
    navigate(to);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchResults.length > 0) goToResult(searchResults[0].to);
  };


  // Inline primary links (top priority — always visible on lg+)
  const primary = [
    { to: "/", key: "nav.home", icon: Home },
    { to: "/quran", key: "nav.quran", icon: BookOpen },
    { to: "/hadith", key: "nav.hadith", icon: ScrollText },
    { to: "/namaz", key: "nav.namaz", icon: Compass },
    { to: "/shop", key: "nav.shop", icon: Store },
    { to: "/offers", key: "nav.offers", icon: Gift },
    { to: "/ad-maker", key: "nav.adMaker", icon: Wand2 },
    { to: "/services", key: "nav.services", icon: Briefcase },
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
        <div className="container flex h-[64px] sm:h-[72px] items-center justify-between gap-2 sm:gap-4 px-3 sm:px-4">
          <Link to="/" className="flex items-center gap-2 sm:gap-3.5 group shrink-0 min-w-0" onClick={() => setOpenMenu(null)}>
            <div className="relative shrink-0">
              <span className="absolute inset-0 rounded-full bg-gradient-to-br from-secondary/30 via-secondary/10 to-transparent blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-background to-muted/60 ring-1 ring-secondary/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.6),0_4px_14px_-4px_rgba(180,140,60,0.35)] flex items-center justify-center group-hover:ring-secondary/70 transition-all duration-500">
                <img
                  src={logoMark}
                  alt="JohnNil monogram"
                  width={44}
                  height={44}
                  className="w-7 h-7 sm:w-9 sm:h-9 object-contain group-hover:scale-110 transition-bounce"
                />
              </div>
            </div>
            <div className="flex flex-col leading-none whitespace-nowrap min-w-0">
              <span className="font-display font-bold text-[16px] sm:text-[24px] tracking-[0.06em] sm:tracking-[0.08em] bg-gradient-to-r from-foreground via-foreground to-foreground/80 bg-clip-text text-transparent">
                JOHN NIL
              </span>


              <span className="hidden sm:flex items-center gap-1 text-[8.5px] tracking-[0.22em] uppercase text-muted-foreground font-semibold mt-1.5 whitespace-nowrap">
                <span className="text-secondary">{isBn ? "মান" : "Quality"}</span>
                <span className="opacity-40">•</span>
                <span className="text-secondary">{isBn ? "বিশ্বাস" : "Trust"}</span>
                <span className="opacity-40">•</span>
                <span className="text-secondary">{isBn ? "শান্তি" : "Peace"}</span>
              </span>
            </div>
          </Link>

          {/* Search bar — desktop/tablet */}
          <div ref={searchRef} className="hidden md:flex flex-1 max-w-md mx-2 relative">
            <form onSubmit={handleSearchSubmit} className="w-full">
              <div className="relative group">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setSearchOpen(true);
                  }}
                  onFocus={() => setSearchOpen(true)}
                  placeholder={isBn ? "টুল, ক্যাটাগরি বা পেজ খুঁজুন..." : "Search tools, categories or pages..."}
                  className="w-full h-10 pl-10 pr-4 rounded-full bg-muted/50 border border-border/60 text-sm placeholder:text-muted-foreground/70 focus:outline-none focus:bg-background focus:border-primary/50 focus:ring-2 focus:ring-primary/15 transition-all"
                />
              </div>
            </form>
            <AnimatePresence>
              {searchOpen && searchResults.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="absolute top-full left-0 right-0 mt-2 rounded-2xl border border-border/60 bg-background/98 backdrop-blur-xl shadow-elegant overflow-hidden z-50"
                >
                  <ul className="max-h-80 overflow-y-auto py-1.5">
                    {searchResults.map((r) => (
                      <li key={r.to}>
                        <button
                          type="button"
                          onClick={() => goToResult(r.to)}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-primary/10 hover:text-primary transition-colors"
                        >
                          <r.icon className="w-4 h-4 text-secondary" />
                          <span className="text-sm font-medium">{isBn ? r.bn : r.en}</span>
                          <span className="ml-auto text-[11px] text-muted-foreground">{r.to}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}
              {searchOpen && searchQuery.trim() && searchResults.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute top-full left-0 right-0 mt-2 rounded-2xl border border-border/60 bg-background/98 backdrop-blur-xl shadow-elegant z-50 px-4 py-3 text-sm text-muted-foreground"
                >
                  {isBn ? "কোনো ফলাফল পাওয়া যায়নি" : "No results found"}
                </motion.div>
              )}
            </AnimatePresence>
          </div>



          <div className="flex items-center gap-0.5 sm:gap-1.5 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden rounded-full h-8 w-8 sm:h-9 sm:w-9"
              onClick={() => setMobileSearchOpen((o) => !o)}
              aria-label="Search"
            >
              <Search className="w-[18px] h-[18px]" />
            </Button>

            <button
              onClick={toggle}
              aria-label={`Switch language (current: ${language === "bn" ? "Bangla" : "English"})`}
              title={language === "bn" ? "Switch to English" : "বাংলায় দেখুন"}
              className="group relative flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-border/60 bg-gradient-to-br from-primary/15 to-secondary/15 ring-1 ring-primary/30 hover:border-primary/60 hover:shadow-md hover:scale-105 transition-all"
            >
              <Globe className="w-4 h-4 text-primary" strokeWidth={2.5} />
              <span className="absolute -bottom-1 -right-1 text-[8px] font-bold bg-primary text-primary-foreground rounded-full px-1 leading-tight ring-1 ring-background">
                {language === "bn" ? "বাং" : "EN"}
              </span>
            </button>


            <Link to="/cart" className="relative" onClick={() => setOpenMenu(null)}>
              <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 sm:h-9 sm:w-9">
                <ShoppingCart className="w-[18px] h-[18px]" />
                {count > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-secondary text-secondary-foreground text-[10px] flex items-center justify-center font-bold">
                    {count}
                  </span>
                )}
              </Button>
            </Link>

            {/* Auth: Login + Register (desktop) or user menu */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    aria-label="Account"
                    className="flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-br from-primary to-primary/70 text-primary-foreground font-bold text-xs uppercase shadow-md ring-1 ring-primary/40 hover:scale-105 transition-transform"
                  >
                    {(user.email?.[0] || "U").toUpperCase()}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{isBn ? "লগইন আছেন" : "Signed in"}</div>
                    <div className="text-sm font-semibold truncate">{user.email}</div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/profile")}>
                    <UserIcon className="w-4 h-4 mr-2" /> {isBn ? "প্রোফাইল" : "Profile"}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/cart")}>
                    <ShoppingCart className="w-4 h-4 mr-2" /> {isBn ? "কার্ট" : "Cart"}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={async () => { await signOut(); navigate("/"); }} className="text-destructive focus:text-destructive">
                    <LogOut className="w-4 h-4 mr-2" /> {isBn ? "লগআউট" : "Sign out"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden sm:flex items-center gap-1.5">
                <Link to="/auth">
                  <Button variant="ghost" size="sm" className="rounded-full h-9 px-3 text-[12px] font-semibold gap-1.5">
                    <LogIn className="w-3.5 h-3.5" />
                    {isBn ? "লগইন" : "Login"}
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button size="sm" className="rounded-full h-9 px-3.5 text-[12px] font-bold gap-1.5 bg-gradient-to-br from-primary to-primary/85 hover:from-primary hover:to-primary text-primary-foreground shadow-md">
                    <UserPlus className="w-3.5 h-3.5" />
                    {isBn ? "রেজিস্টার" : "Register"}
                  </Button>
                </Link>
              </div>
            )}

            {!user && (
              <Link to="/auth" className="sm:hidden">
                <Button variant="ghost" size="icon" className="rounded-full" aria-label="Login">
                  <LogIn className="w-[18px] h-[18px]" />
                </Button>
              </Link>
            )}

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

      {/* Secondary nav strip — stylish category boxes */}
      <div className="hidden lg:block border-b border-border/60 bg-gradient-to-b from-background/95 via-muted/30 to-background/80 backdrop-blur-xl">
        <div className="container py-2.5">
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {primary.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === "/"}
                onClick={() => setOpenMenu(null)}
                className={({ isActive }) =>
                  `group relative flex items-center gap-2 px-4 py-2 rounded-xl border text-[12.5px] font-semibold tracking-wide transition-all duration-300 ${
                    isActive
                      ? "bg-gradient-to-br from-primary/15 to-secondary/10 border-secondary/50 text-primary shadow-[0_4px_14px_-6px_hsl(var(--secondary)/0.4)]"
                      : "bg-background/70 border-border/50 text-foreground/75 hover:text-primary hover:border-secondary/40 hover:bg-gradient-to-br hover:from-primary/5 hover:to-secondary/5 hover:-translate-y-0.5 hover:shadow-[0_6px_16px_-8px_hsl(var(--primary)/0.3)]"
                  }`
                }
              >
                <l.icon className="w-3.5 h-3.5 text-secondary group-hover:scale-110 transition-transform" />
                <span>{t(l.key)}</span>
              </NavLink>
            ))}

            {/* Categories trigger */}
            <button
              onClick={() => toggleMenu("top")}
              aria-expanded={topOpen}
              className={`group flex items-center gap-2 px-4 py-2 rounded-xl border text-[12.5px] font-semibold tracking-wide transition-all duration-300 ${
                topOpen
                  ? "bg-primary text-primary-foreground border-primary shadow-elegant"
                  : "bg-background/70 border-border/50 text-foreground/75 hover:text-primary hover:border-secondary/40 hover:-translate-y-0.5 hover:shadow-[0_6px_16px_-8px_hsl(var(--primary)/0.3)]"
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
              <span>{isBn ? "সব ক্যাটাগরি" : "All Categories"}</span>
            </button>

            {/* Appointment CTA — highlighted */}
            <Link
              to="/appointment"
              onClick={() => setOpenMenu(null)}
              className="group ml-1 flex items-center gap-2 px-4 py-2 rounded-xl text-[12.5px] font-bold gradient-bg-warm text-white shadow-pink hover:scale-[1.04] hover:-translate-y-0.5 transition-all duration-300"
            >
              <CalendarClock className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform" />
              <span>{isBn ? "বুক অ্যাপয়েন্টমেন্ট" : "Book Appointment"}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile search panel */}

      <AnimatePresence>
        {mobileSearchOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden border-b border-border/60 bg-background/98 backdrop-blur-xl"
          >
            <div className="container py-3">
              <form onSubmit={handleSearchSubmit}>
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    autoFocus
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={isBn ? "টুল, ক্যাটাগরি বা পেজ খুঁজুন..." : "Search tools, categories or pages..."}
                    className="w-full h-11 pl-10 pr-4 rounded-full bg-muted/50 border border-border/60 text-sm focus:outline-none focus:bg-background focus:border-primary/50 focus:ring-2 focus:ring-primary/15"
                  />
                </div>
              </form>
              {searchQuery.trim() && (
                <ul className="mt-2 max-h-72 overflow-y-auto rounded-2xl border border-border/60 bg-background/95 divide-y divide-border/40">
                  {searchResults.length === 0 && (
                    <li className="px-4 py-3 text-sm text-muted-foreground">
                      {isBn ? "কোনো ফলাফল পাওয়া যায়নি" : "No results found"}
                    </li>
                  )}
                  {searchResults.map((r) => (
                    <li key={r.to}>
                      <button
                        type="button"
                        onClick={() => goToResult(r.to)}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-primary/10 hover:text-primary"
                      >
                        <r.icon className="w-4 h-4 text-secondary" />
                        <span className="text-sm font-medium">{isBn ? r.bn : r.en}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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

              {/* Auth — mobile */}
              {user ? (
                <div className="mt-2 flex flex-col gap-2">
                  <div className="px-4 py-2.5 rounded-lg bg-muted/60 border border-border/50">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">{isBn ? "লগইন আছেন" : "Signed in"}</div>
                    <div className="text-sm font-semibold truncate">{user.email}</div>
                  </div>
                  <button
                    onClick={async () => { await signOut(); setMobileNavOpen(false); navigate("/"); }}
                    className="px-4 py-3 rounded-lg font-semibold border border-destructive/40 text-destructive flex items-center justify-center gap-2"
                  >
                    <LogOut className="w-4 h-4" /> {isBn ? "লগআউট" : "Sign out"}
                  </button>
                </div>
              ) : (
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <Link
                    to="/auth"
                    onClick={() => setMobileNavOpen(false)}
                    className="px-4 py-3 rounded-lg font-bold border-2 border-primary/50 text-primary text-center flex items-center justify-center gap-2"
                  >
                    <LogIn className="w-4 h-4" /> {isBn ? "লগইন" : "Login"}
                  </Link>
                  <Link
                    to="/auth"
                    onClick={() => setMobileNavOpen(false)}
                    className="px-4 py-3 rounded-lg font-bold bg-gradient-to-br from-primary to-primary/80 text-primary-foreground text-center shadow-md flex items-center justify-center gap-2"
                  >
                    <UserPlus className="w-4 h-4" /> {isBn ? "রেজিস্টার" : "Register"}
                  </Link>
                </div>
              )}

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
