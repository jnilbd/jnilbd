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

  // Hero
  "hero.greeting": { bn: "হ্যালো, আমি", en: "Hello, I'm" },
  "hero.name": { bn: "জন নীল", en: "John Nil" },
  "hero.tagline": { bn: "ক্রিয়েটর • এন্ট্রাপ্রেনিউর • ডিজিটাল প্রোডাক্ট মেকার", en: "Creator • Entrepreneur • Digital Product Maker" },
  "hero.description": { bn: "আপনার সব ধরনের ডিজিটাল ও ফিজিক্যাল প্রয়োজনের জন্য একটি অল-ইন-ওয়ান প্ল্যাটফর্ম। প্রোডাক্ট, সার্ভিস, পোর্টফোলিও, ব্লগ, ইউজড মার্কেট এবং বাসা ভাড়া — সব এক জায়গায়।", en: "An all-in-one platform for all your digital and physical needs. Products, services, portfolio, blog, used marketplace and rentals — all in one place." },
  "hero.cta1": { bn: "এক্সপ্লোর শপ", en: "Explore Shop" },
  "hero.cta2": { bn: "অর্ডার সার্ভিস", en: "Order Service" },

  // Marquee
  "marquee.text": { bn: "✨ ১০০% সিকিউর পেমেন্ট ✦ দ্রুত ডেলিভারি ✦ ২৪/৭ সাপোর্ট ✦ প্রিমিয়াম কোয়ালিটি ✦ কাস্টম অর্ডার ✦", en: "✨ 100% Secure Payment ✦ Fast Delivery ✦ 24/7 Support ✦ Premium Quality ✦ Custom Orders ✦" },

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
