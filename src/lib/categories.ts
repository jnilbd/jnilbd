import { Home, Store, BookOpen, Compass, CloudRain, Wifi, HeartPulse, Wallet, Lock, Receipt, Scale, Percent, Map, Ruler, Sun, Smartphone, FileType, Download, Image as ImageIcon, Mic, Clock, Tv, MessageCircle, Briefcase, Tag, Home as HomeIcon, FolderKanban, User, ShieldCheck, CalendarClock, Send, Film } from "lucide-react";

export type CategoryItem = {
  to: string;
  icon: any;
  bn: string;
  en: string;
  highlight?: boolean;
};

// Priority-ordered categories — sensitive/spiritual first, daily essentials, calculators,
// tools, commerce. Appointment is intentionally last and highlighted.
export const ALL_CATEGORIES: CategoryItem[] = [
  { to: "/", icon: Home, bn: "হোম", en: "Home" },
  // Spiritual (highest priority)
  { to: "/quran", icon: BookOpen, bn: "কুরআন", en: "Quran" },
  { to: "/namaz", icon: Compass, bn: "নামাজ", en: "Namaz" },
  // Daily essentials
  { to: "/weather", icon: CloudRain, bn: "আবহাওয়া", en: "Weather" },
  { to: "/free-internet", icon: Wifi, bn: "ফ্রি ইন্টারনেট", en: "Free Internet" },
  { to: "/health", icon: HeartPulse, bn: "স্বাস্থ্য", en: "Health" },
  { to: "/finance", icon: Wallet, bn: "ফিন্যান্স", en: "Finance" },
  { to: "/vault", icon: Lock, bn: "ভল্ট", en: "Vault" },
  // Commerce
  { to: "/shop", icon: Store, bn: "শপ", en: "Shop" },
  { to: "/services", icon: Briefcase, bn: "সার্ভিস", en: "Services" },
  { to: "/request-service", icon: Send, bn: "সার্ভিস রিকোয়েস্ট", en: "Request Service" },
  { to: "/movies", icon: Film, bn: "মুভি ও সিরিজ", en: "Movies & Series" },
  { to: "/marketplace", icon: Tag, bn: "ইউজড মার্কেট", en: "Used Market" },
  { to: "/rentals", icon: HomeIcon, bn: "বাসা ভাড়া", en: "Rentals" },
  // Calculators
  { to: "/tax", icon: Receipt, bn: "ট্যাক্স", en: "Tax" },
  { to: "/warish", icon: Scale, bn: "ওয়ারিশ", en: "Warish" },
  { to: "/profit-loss", icon: Percent, bn: "লাভ/ক্ষতি", en: "Profit/Loss" },
  { to: "/land", icon: Map, bn: "ভূমি জরিপ", en: "Land Survey" },
  { to: "/height", icon: Ruler, bn: "উচ্চতা", en: "Height" },
  { to: "/solar", icon: Sun, bn: "সোলার", en: "Solar" },
  { to: "/gadget", icon: Smartphone, bn: "গ্যাজেট", en: "Gadget" },
  // Tools
  { to: "/converter", icon: FileType, bn: "কনভার্টার", en: "Converter" },
  { to: "/downloader", icon: Download, bn: "ডাউনলোডার", en: "Downloader" },
  { to: "/thumbnail", icon: ImageIcon, bn: "থাম্বনেইল", en: "Thumbnail" },
  { to: "/voice", icon: Mic, bn: "ভয়েস", en: "Voice" },
  { to: "/scheduler", icon: Clock, bn: "শিডিউল মেসেজ", en: "Scheduler" },
  { to: "/livetv", icon: Tv, bn: "লাইভ টিভি", en: "Live TV" },
  { to: "/chat", icon: MessageCircle, bn: "লাইভ চ্যাট", en: "Live Chat" },
  // Community / about
  { to: "/portfolio", icon: FolderKanban, bn: "পোর্টফোলিও", en: "Portfolio" },
  { to: "/blog", icon: BookOpen, bn: "ব্লগ", en: "Blog" },
  { to: "/about", icon: User, bn: "আমার গল্প", en: "About" },
  { to: "/policies", icon: ShieldCheck, bn: "পলিসি", en: "Policies" },
  // Highlighted CTA — last
  { to: "/appointment", icon: CalendarClock, bn: "বুক অ্যাপয়েন্টমেন্ট", en: "Book Appointment", highlight: true },
];
