import { createContext, useContext, useState, ReactNode, useEffect } from "react";

export type Language = "bn" | "en";

type Translations = Record<string, { bn: string; en: string }>;

export const translations: Translations = {
  // Nav
  "nav.home": { bn: "হোম", en: "Home" },
  "nav.shop": { bn: "শপ", en: "Shop" },
  "nav.services": { bn: "সার্ভিস", en: "Services" },
  "nav.portfolio": { bn: "পোর্টফোলিও", en: "Portfolio" },
  "nav.blog": { bn: "ব্লগ", en: "Blog" },
  "nav.marketplace": { bn: "ইউজড মার্কেট", en: "Used Market" },
  "nav.rentals": { bn: "বাসা ভাড়া", en: "Rentals" },
  "nav.contact": { bn: "যোগাযোগ", en: "Contact" },
  "nav.about": { bn: "আমার গল্প", en: "About" },
  "nav.appointment": { bn: "অ্যাপয়েন্টমেন্ট", en: "Appointment" },
  "nav.cart": { bn: "কার্ট", en: "Cart" },
  "nav.finance": { bn: "ফিন্যান্স", en: "Finance" },
  "nav.thumbnail": { bn: "থাম্বনেইল", en: "Thumbnail" },
  "nav.voice": { bn: "ভয়েস এডিটর", en: "Voice Editor" },
  "nav.chat": { bn: "লাইভ চ্যাট", en: "Live Chat" },
  "nav.namaz": { bn: "নামাজের সময়", en: "Prayer Times" },
  "nav.quran": { bn: "কুরআন", en: "Al-Quran" },
  "nav.hadith": { bn: "হাদিস", en: "Hadith" },
  "nav.offers": { bn: "অফার", en: "Offers" },
  "nav.adMaker": { bn: "অ্যাড মেকার AI", en: "Ad Maker AI" },
  "nav.converter": { bn: "ফাইল কনভার্টার", en: "Converter" },
  "nav.livetv": { bn: "লাইভ টিভি/রেডিও", en: "Live TV/Radio" },
  "nav.downloader": { bn: "ভিডিও ডাউনলোডার", en: "Downloader" },
  "nav.scheduler": { bn: "শিডিউলড মেসেজ", en: "Scheduled SMS" },
  "nav.land": { bn: "ভূমি জরিপ", en: "Land Survey" },
  "nav.height": { bn: "উচ্চতা ক্যালকুলেটর", en: "Height Calculator" },
  
  "nav.solar": { bn: "সোলার ক্যালকুলেটর", en: "Solar Calculator" },
  
  "nav.tax": { bn: "ট্যাক্স ক্যালকুলেটর", en: "Tax Calculator" },
  "nav.warish": { bn: "ওয়ারিশ", en: "Inheritance" },
  "nav.profitLoss": { bn: "লাভ/ক্ষতি", en: "Profit/Loss" },
  "nav.health": { bn: "স্বাস্থ্য গাইড", en: "Health Guide" },
  "nav.vault": { bn: "পার্সোনাল ভল্ট", en: "Personal Vault" },
  "nav.weather": { bn: "আবহাওয়া", en: "Weather" },
  "card.weather": { bn: "BD/IN নির্ভুল আবহাওয়া + ঝড়/বৃষ্টি/তাপ সতর্কতা", en: "Accurate BD/IN weather + storm/rain/heat alerts" },
  "nav.gadget": { bn: "গ্যাজেট অ্যাডভাইজার", en: "Gadget Advisor" },
 "card.gadget": { bn: "বাজেট দিন — BD মার্কেটে সেরা মোবাইল/ল্যাপটপ AI সাজেশন", en: "Set budget — AI picks best phone/laptop from BD market" },
 "nav.freeNet": { bn: "ফ্রি ইন্টারনেট", en: "Free Internet" },
 "card.freeNet": { bn: "GP/Robi/BL/Airtel/Teletalk — সব সিমের সস্তা ও ফ্রি নেট অফার, USSD ও সেটআপ গাইড", en: "GP/Robi/BL/Airtel/Teletalk — cheap & free net offers, USSD codes & setup guide" },
 "nav.requestService": { bn: "সার্ভিস রিকোয়েস্ট", en: "Request Service" },
 "card.requestService": { bn: "নতুন সার্ভিস বা ফিচার চান? সরাসরি আমাকে জানান", en: "Need a new service or feature? Tell me directly" },
 "nav.movies": { bn: "মুভি ও সিরিজ", en: "Movies & Series" },
 "card.movies": { bn: "জনপ্রিয় মুভি ও TV সিরিজ — থার্ড-পার্টি স্ট্রিমিং", en: "Popular movies & TV series — third-party streaming" },

  // Hero
  "hero.greeting": { bn: "হ্যালো, আমি", en: "Hello, I'm" },
  "hero.name": { bn: "জন নীল", en: "John Nil" },
 "hero.tagline": { bn: "৩০+ স্মার্ট টুল • কুরআন • আবহাওয়া • স্বাস্থ্য • ক্যালকুলেটর — এক ছাদের নিচে", en: "30+ Smart Tools • Quran • Weather • Health • Calculators — all under one roof" },
 "hero.description": { bn: "কুরআন তিলাওয়াত, নামাজের সময়, লাইভ আবহাওয়া ও ঝড়ের অ্যালার্ট, স্বাস্থ্য পরামর্শ, ভূমি জরিপ, ট্যাক্স–ওয়ারিশ–সোলার ক্যালকুলেটর, পাসওয়ার্ড ভল্ট, গ্যাজেট অ্যাডভাইজার, AI ফিনান্স, লাইভ টিভি, ডাউনলোডার, কনভার্টার — আপনার দৈনন্দিন প্রয়োজনের সবকিছু একটি অ্যাপেই।", en: "Quran recitation, prayer times, live weather & storm alerts, health guidance, land survey, tax–inheritance–solar calculators, password vault, gadget advisor, AI finance, live TV, downloader, converter — everything you need, in one app." },
 "hero.cta1": { bn: "টুলস এক্সপ্লোর করুন", en: "Explore Tools" },
 "hero.cta2": { bn: "কুরআন পড়ুন ও শুনুন", en: "Read & Listen Quran" },
 "hero.cta3": { bn: "আবহাওয়া দেখুন", en: "Check Weather" },
 "hero.cta4": { bn: "অর্ডার সার্ভিস", en: "Order Service" },
 "hero.stat1": { bn: "৩০+ টুল", en: "30+ Tools" },
 "hero.stat2": { bn: "১১৪ সূরা", en: "114 Surahs" },
 "hero.stat3": { bn: "AI সহায়তা", en: "AI Assist" },
 "hero.stat4": { bn: "১০০% ফ্রি", en: "100% Free" },

  // Marquee
 "marquee.text": { bn: "১০০% সিকিউর পেমেন্ট ✦ দ্রুত ডেলিভারি ✦ ২৪/৭ সাপোর্ট ✦ প্রিমিয়াম কোয়ালিটি ✦ কাস্টম অর্ডার", en: "100% Secure Payment ✦ Fast Delivery ✦ 24/7 Support ✦ Premium Quality ✦ Custom Orders" },
 "marquee.primary": { bn: "৩০+ স্মার্ট টুল ✦ ১১৪ সূরা অডিও ✦ লাইভ আবহাওয়া ✦ নামাজের সময় ✦ AI সহায়তা ✦ ফ্রি ইন্টারনেট গাইড ✦ লাইভ টিভি ✦ ১০০% ফ্রি", en: "30+ Smart Tools ✦ 114 Surah Audio ✦ Live Weather ✦ Prayer Times ✦ AI Assistant ✦ Free Internet Guide ✦ Live TV ✦ 100% Free" },
 "marquee.warm": { bn: "নতুন অফার চলছে ✦ অর্ডারে ফ্রি ডেলিভারি ✦ প্রিমিয়াম সার্ভিস ✦ অ্যাপয়েন্টমেন্ট বুক করুন ✦ কাস্টম অর্ডার ✦ EST. ২০১৪ ✦ ভেরিফাইড ব্র্যান্ড", en: "New Offers Live ✦ Free Delivery on Orders ✦ Premium Services ✦ Book Your Appointment ✦ Custom Orders ✦ EST. 2014 ✦ Verified Brand" },
 "marquee.cool": { bn: "ট্যাক্স • ওয়ারিশ • সোলার ক্যালকুলেটর ✦ ভূমি জরিপ ✦ ফোন লুকআপ ✦ গ্যাজেট অ্যাডভাইজার ✦ পাসওয়ার্ড ভল্ট ✦ কনভার্টার ✦ ডাউনলোডার", en: "Tax • Warish • Solar Calculators ✦ Land Survey ✦ Phone Lookup ✦ Gadget Advisor ✦ Password Vault ✦ Converters ✦ Downloaders" },

  // Sections
  "section.explore": { bn: "এক্সপ্লোর করুন", en: "Explore" },
  "section.exploreDesc": { bn: "যা কিছু আপনার প্রয়োজন, এক প্ল্যাটফর্মেই পাবেন", en: "Everything you need, all on one platform" },
  "section.featured": { bn: "ফিচার্ড প্রোডাক্ট", en: "Featured Products" },
  "section.featuredDesc": { bn: "জনপ্রিয় ও সেরা প্রোডাক্টগুলো", en: "Popular and top-rated products" },
  "section.services": { bn: "আমাদের সার্ভিস", en: "Our Services" },
  "section.servicesDesc": { bn: "প্রিমিয়াম সার্ভিস, প্রফেশনাল ডেলিভারি", en: "Premium services, professional delivery" },
  "section.reviews": { bn: "কাস্টমার রিভিউ", en: "Customer Reviews" },
  "section.reviewsDesc": { bn: "যা বলছেন আমাদের সন্তুষ্ট কাস্টমাররা", en: "What our happy customers are saying" },
  "section.social": { bn: "সোশ্যাল মিডিয়া", en: "Social Media" },
  "section.socialDesc": { bn: "ফলো করুন আমাদের সোশ্যাল প্ল্যাটফর্মে", en: "Follow us on social platforms" },

  // Cards
  "card.shop": { bn: "ডিজিটাল ও ফিজিক্যাল প্রোডাক্ট", en: "Digital & Physical Products" },
  "card.services": { bn: "কাস্টম সার্ভিস অর্ডার করুন", en: "Order Custom Services" },
  "card.portfolio": { bn: "আমার কাজ ও অভিজ্ঞতা", en: "My Work & Experience" },
  "card.blog": { bn: "টিপস, গাইড ও ইনসাইট", en: "Tips, Guides & Insights" },
  "card.marketplace": { bn: "পুরাতন প্রোডাক্ট কিনুন বা বিক্রি করুন", en: "Buy or Sell Used Products" },
  "card.rentals": { bn: "বাসা ভাড়া দিন বা খুঁজুন", en: "Rent or Find Houses" },
  "card.appointment": { bn: "১:১ পরামর্শ ও কনসালটেশন বুক করুন", en: "Book a 1:1 consultation" },
  "card.finance": { bn: "ব্যক্তিগত আয়-ব্যয়, ধার, বাজেট ও AI পরামর্শ", en: "Personal income, expense, debts, budget & AI advice" },
  "card.thumbnail": { bn: "YouTube/Insta/FB থাম্বনেইল ১ ক্লিকে তৈরি", en: "Create YouTube/Insta/FB thumbnails in 1 click" },
  "card.voice": { bn: "ভয়েস ইম্প্রুভ, নয়েজ ক্যান্সেল, মিউজিক যোগ", en: "Voice improve, denoise, add music" },
  "card.chat": { bn: "সব রেজিস্টার্ড ইউজারের সাথে লাইভ আড্ডা", en: "Live chat with all registered users" },
  "card.namaz": { bn: "লোকেশন অনুযায়ী নামাজের সঠিক সময়", en: "Accurate prayer times by location" },
  "card.quran": { bn: "৩০ পারা কুরআন — পড়ুন ও শুনুন", en: "30 Para Quran — read & listen" },
  "card.converter": { bn: "যেকোনো ফাইল — যেকোনো ফরম্যাটে কনভার্ট", en: "Convert any file to any format" },
  "card.livetv": { bn: "BD ও ইন্ডিয়ান টিভি/রেডিও সরাসরি", en: "BD & Indian TV/Radio live" },
  "card.downloader": { bn: "YouTube/TikTok/Insta/FB ভিডিও/MP3 ডাউনলোড", en: "YouTube/TikTok/Insta/FB video/MP3 downloader" },
  "card.scheduler": { bn: "নির্দিষ্ট সময়ে WhatsApp/SMS উইশ পাঠান", en: "Send WhatsApp/SMS at the perfect time" },
  "card.land": { bn: "খতিয়ান, নামজারি, কর, কনভার্টার", en: "Khatian, Mutation, Tax, Converter" },
  "card.height": { bn: "BMI, আদর্শ ওজন, BMR, দৈনিক ক্যালরি, শরীরের ফ্যাট % এবং বয়সভিত্তিক স্বাস্থ্যকর উচ্চতার বিস্তারিত হিসাব", en: "BMI, ideal weight, BMR, daily calories, body-fat %, and age-based healthy height estimates" },
  "card.health": { bn: "AI স্বাস্থ্য পরামর্শ, রুটিন, অসুখ গাইড", en: "AI health advice, routine, ailment guide" },
  "card.solar": { bn: "দৈনিক বিদ্যুৎ ব্যবহার থেকে প্যানেল, ব্যাটারি, ইনভার্টার, চার্জ কন্ট্রোলার, খরচ ও পে-ব্যাক হিসাব", en: "Estimate panels, battery, inverter, charge controller, cost, and payback from daily power use" },
  "card.vault": { bn: "WiFi, ব্যাংক, পাসওয়ার্ড — এন্ড-টু-এন্ড এন্ক্রিপ্টেড", en: "WiFi, bank, passwords — end-to-end encrypted" },
  "card.tax": { bn: "বাংলাদেশ FY 2024-25 আয়কর স্ল্যাব, রিবেট, ইনভেস্টমেন্ট অ্যালাউন্স, মিনিমাম ট্যাক্স ও রিটার্ন অনুমান", en: "BD FY 2024-25 tax slabs, rebate, investment allowance, minimum tax, and return estimate" },
  "card.warish": { bn: "ইসলামি উত্তরাধিকার বণ্টন (ফারাইজ)", en: "Islamic inheritance distribution" },
  "card.profitLoss": { bn: "লাভ, ক্ষতি, মার্জিন, ডিসকাউন্ট, % পরিবর্তন", en: "Profit, loss, margin, discount, % change" },

  // Buttons
  "btn.viewAll": { bn: "সব দেখুন", en: "View All" },
  "btn.viewDetails": { bn: "ডিটেইলস দেখুন", en: "View Details" },
  "btn.orderNow": { bn: "অর্ডার করুন", en: "Order Now" },
  "btn.addCart": { bn: "কার্টে যোগ করুন", en: "Add to Cart" },
  "btn.buy": { bn: "কিনুন", en: "Buy Now" },
  "btn.checkout": { bn: "চেকআউট", en: "Checkout" },
  "btn.continue": { bn: "চালিয়ে যান", en: "Continue" },
  "btn.submit": { bn: "সাবমিট", en: "Submit" },
  "btn.postAd": { bn: "পোস্ট করুন", en: "Post Ad" },
  "btn.contact": { bn: "যোগাযোগ", en: "Contact" },

  // Common
  "common.related": { bn: "রিলেটেড প্রোডাক্ট", en: "Related Products" },
  "common.relatedServices": { bn: "অন্যান্য সার্ভিস", en: "Other Services" },
  "common.price": { bn: "মূল্য", en: "Price" },
  "common.amount": { bn: "অ্যামাউন্ট", en: "Amount" },
  "common.quantity": { bn: "পরিমাণ", en: "Quantity" },
  "common.total": { bn: "মোট", en: "Total" },
  "common.description": { bn: "বিবরণ", en: "Description" },
  "common.category": { bn: "ক্যাটাগরি", en: "Category" },
  "common.location": { bn: "অবস্থান", en: "Location" },
  "common.search": { bn: "খুঁজুন...", en: "Search..." },
  "common.empty": { bn: "কিছু পাওয়া যায়নি", en: "Nothing found" },

  // Footer
  "footer.about": { bn: "আমাদের সম্পর্কে", en: "About Us" },
  "footer.aboutText": { bn: "জন নীল — একজন ক্রিয়েটর, এন্ট্রাপ্রেনিউর। বাংলাদেশের অন্যতম প্রিমিয়াম অল-ইন-ওয়ান ডিজিটাল প্ল্যাটফর্ম।", en: "John Nil — Creator, Entrepreneur. One of Bangladesh's premium all-in-one digital platforms." },
  "footer.quickLinks": { bn: "কুইক লিংকস", en: "Quick Links" },
  "footer.contact": { bn: "যোগাযোগ", en: "Contact" },
  "footer.rights": { bn: "© ২০২৫ JohnNil.com — সকল অধিকার সংরক্ষিত", en: "© 2025 JohnNil.com — All Rights Reserved" },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  toggle: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("lang") as Language) || "bn";
    }
    return "bn";
  });

  useEffect(() => {
    localStorage.setItem("lang", language);
    document.documentElement.lang = language;
    if (language === "bn") {
      document.body.classList.add("font-bangla");
    } else {
      document.body.classList.remove("font-bangla");
    }
  }, [language]);

  const setLanguage = (lang: Language) => setLanguageState(lang);
  const toggle = () => setLanguageState((l) => (l === "bn" ? "en" : "bn"));
  const t = (key: string) => translations[key]?.[language] || key;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, toggle }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
};
