import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Facebook, Instagram, MessageCircle, Youtube, Linkedin, Send, Sparkles, BookOpen, CloudRain, HeartPulse, Wifi } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useState } from "react";
import logoMark from "@/assets/logo-mark.png";

const Footer = () => {
  const { t, language } = useLanguage();
  const [email, setEmail] = useState("");

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      toast.error(language === "bn" ? "সঠিক ইমেইল দিন" : "Please enter a valid email");
      return;
    }
    toast.success(language === "bn" ? "ধন্যবাদ! সাবস্ক্রাইব হয়েছে।" : "Thank you! You're subscribed.");
    setEmail("");
  };

  const trustItems = [
    { icon: BookOpen, label: language === "bn" ? "১১৪ সূরা — সম্পূর্ণ কুরআন" : "114 Surahs — Full Quran" },
    { icon: CloudRain, label: language === "bn" ? "লাইভ আবহাওয়া ও অ্যালার্ট" : "Live Weather & Alerts" },
    { icon: HeartPulse, label: language === "bn" ? "AI স্বাস্থ্য পরামর্শ" : "AI Health Guidance" },
    { icon: Wifi, label: language === "bn" ? "ফ্রি ইন্টারনেট গাইড" : "Free Internet Guide" },
  ];

  return (
    <footer className="relative mt-24 bg-primary text-primary-foreground overflow-hidden">
      {/* Decorative gold line */}
      <div className="h-[3px] w-full bg-gradient-to-r from-transparent via-secondary to-transparent" />

      {/* Trust strip */}
      <div className="border-b border-primary-foreground/10">
        <div className="container py-6 grid grid-cols-2 md:grid-cols-4 gap-5">
          {trustItems.map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-secondary/15 border border-secondary/30 flex items-center justify-center shrink-0">
                <item.icon className="w-4 h-4 text-secondary" />
              </div>
              <span className="text-xs md:text-sm font-medium opacity-90">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="container relative py-14 grid grid-cols-1 md:grid-cols-12 gap-10">
        {/* Brand column */}
        <div className="md:col-span-4">
          <Link to="/" className="flex items-center gap-3 mb-5">
            <img src={logoMark} alt="JohnNil" width={48} height={48} className="w-12 h-12 object-contain" loading="lazy" />
            <div className="flex flex-col leading-none">
              <span className="font-display font-bold text-2xl tracking-tight">
                JohnNil<span className="text-secondary">.</span>
              </span>
              <span className="text-[10px] tracking-[0.3em] uppercase text-secondary/80 font-semibold mt-1.5">
                {language === "bn" ? "অল-ইন-ওয়ান প্ল্যাটফর্ম" : "All-In-One Platform"}
              </span>
            </div>
          </Link>
          <p className="text-sm leading-relaxed opacity-75 max-w-md mb-6">
            {language === "bn"
              ? "ডিজিটাল প্রোডাক্ট, কোর্স, সার্ভিস, ইউজড মার্কেট ও বাসা ভাড়া — বাংলাদেশের জন্য তৈরি একটি প্রিমিয়াম ডিজিটাল ইকোসিস্টেম।"
              : "Digital products, courses, services, used marketplace & rentals — a premium digital ecosystem crafted for Bangladesh."}
          </p>
          <div className="flex gap-2.5">
            {[
              { Icon: Facebook, href: "https://facebook.com", color: "hover:bg-[#1877F2]" },
              { Icon: Instagram, href: "https://instagram.com", color: "hover:bg-gradient-to-br hover:from-[#F58529] hover:to-[#DD2A7B]" },
              { Icon: Youtube, href: "https://youtube.com", color: "hover:bg-[#FF0000]" },
              { Icon: Linkedin, href: "https://linkedin.com", color: "hover:bg-[#0A66C2]" },
              { Icon: MessageCircle, href: "https://wa.me/8801774585757", color: "hover:bg-[#25D366]" },
            ].map(({ Icon, href, color }, i) => (
              <a
                key={i}
                href={href}
                target="_blank"
                rel="noreferrer"
                className={`w-9 h-9 rounded-full bg-primary-foreground/10 border border-primary-foreground/15 flex items-center justify-center transition-smooth hover:scale-110 hover:border-transparent ${color}`}
              >
                <Icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>

        {/* Quick links */}
        <div className="md:col-span-2">
          <h3 className="font-display font-bold text-sm tracking-[0.2em] uppercase text-secondary mb-5">
            {t("footer.quickLinks")}
          </h3>
          <ul className="space-y-2.5 text-sm">
            {[
              { to: "/shop", key: "nav.shop" },
              { to: "/services", key: "nav.services" },
              { to: "/portfolio", key: "nav.portfolio" },
              { to: "/blog", key: "nav.blog" },
            ].map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="opacity-70 hover:opacity-100 hover:text-secondary transition-smooth">
                  {t(l.key)}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-2">
          <h3 className="font-display font-bold text-sm tracking-[0.2em] uppercase text-secondary mb-5">
            {language === "bn" ? "অন্যান্য" : "Discover"}
          </h3>
          <ul className="space-y-2.5 text-sm">
            {[
              { to: "/marketplace", label: t("nav.marketplace") },
              { to: "/rentals", label: t("nav.rentals") },
              { to: "/appointment", label: language === "bn" ? "অ্যাপয়েন্টমেন্ট" : "Appointment" },
              { to: "/about", label: t("nav.about") },
              { to: "/policies", label: language === "bn" ? "পলিসি" : "Policies" },
            ].map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="opacity-70 hover:opacity-100 hover:text-secondary transition-smooth">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Newsletter */}
        <div className="md:col-span-4">
          <h3 className="font-display font-bold text-sm tracking-[0.2em] uppercase text-secondary mb-5">
            {language === "bn" ? "নিউজলেটার" : "Newsletter"}
          </h3>
          <p className="text-sm opacity-75 mb-4 leading-relaxed">
            {language === "bn"
              ? "এক্সক্লুসিভ অফার, নতুন প্রোডাক্ট ও টিপস সবার আগে পেতে সাবস্ক্রাইব করুন।"
              : "Get exclusive offers, new launches & insider tips delivered to your inbox."}
          </p>
          <form onSubmit={handleSubscribe} className="flex gap-2 mb-6">
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={language === "bn" ? "your@email.com" : "your@email.com"}
              className="rounded-full bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50 focus-visible:ring-secondary"
            />
            <Button
              type="submit"
              size="icon"
              className="rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/90 shrink-0"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>

          <ul className="space-y-2.5 text-sm">
            <li className="flex items-start gap-2.5 opacity-80">
              <Phone className="w-4 h-4 mt-0.5 shrink-0 text-secondary" />
              <a href="tel:01774585757" className="hover:text-secondary transition-smooth">+880 1774-585757</a>
            </li>
            <li className="flex items-start gap-2.5 opacity-80">
              <Mail className="w-4 h-4 mt-0.5 shrink-0 text-secondary" />
              <a href="mailto:jnilbd@gmail.com" className="hover:text-secondary transition-smooth">jnilbd@gmail.com</a>
            </li>
            <li className="flex items-start gap-2.5 opacity-80">
              <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-secondary" />
              <span>Baridhara, Dhaka, Bangladesh</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-primary-foreground/10">
        <div className="container py-5 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
          <p className="opacity-60">
            © {new Date().getFullYear()} JohnNil.com — {language === "bn" ? "সর্বস্বত্ব সংরক্ষিত" : "All rights reserved"}.
          </p>
          <div className="flex items-center gap-5 opacity-60">
            <Link to="/policies?tab=privacy" className="hover:text-secondary transition-smooth">{language === "bn" ? "প্রাইভেসি" : "Privacy"}</Link>
            <Link to="/policies?tab=terms" className="hover:text-secondary transition-smooth">{language === "bn" ? "শর্তাবলী" : "Terms"}</Link>
            <Link to="/policies?tab=refund" className="hover:text-secondary transition-smooth">{language === "bn" ? "রিফান্ড" : "Refund"}</Link>
            <Link to="/policies?tab=shipping" className="hover:text-secondary transition-smooth">{language === "bn" ? "শিপিং" : "Shipping"}</Link>
          </div>
          <p className="opacity-50 text-[11px] tracking-wider">
            {language === "bn" ? "ভালোবাসায় তৈরি 🇧🇩 ঢাকায়" : "Crafted with ♥ in Dhaka, Bangladesh"}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
