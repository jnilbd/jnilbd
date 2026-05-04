import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Facebook, Instagram, MessageCircle, Sparkles, Youtube, Linkedin } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const Footer = () => {
  const { t } = useLanguage();
  return (
    <footer className="relative mt-20 border-t border-border/50 bg-gradient-to-br from-background via-muted/30 to-background overflow-hidden">
      <div className="blob w-96 h-96 bg-primary/20 -top-20 -left-20" />
      <div className="blob w-96 h-96 bg-secondary/20 bottom-0 right-0" />

      <div className="container relative py-16 grid grid-cols-1 md:grid-cols-4 gap-10">
        <div className="md:col-span-2">
          <Link to="/" className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl gradient-bg-primary flex items-center justify-center shadow-glow">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-2xl gradient-text">JohnNil.com</span>
          </Link>
          <p className="text-muted-foreground max-w-md mb-4">{t("footer.aboutText")}</p>
          <div className="flex gap-3">
            <a href="https://facebook.com" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-muted hover:gradient-bg-primary hover:text-white flex items-center justify-center transition-smooth">
              <Facebook className="w-5 h-5" />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-muted hover:gradient-bg-warm hover:text-white flex items-center justify-center transition-smooth">
              <Instagram className="w-5 h-5" />
            </a>
            <a href="https://wa.me/8801774585757" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-muted hover:bg-green-500 hover:text-white flex items-center justify-center transition-smooth">
              <MessageCircle className="w-5 h-5" />
            </a>
          </div>
        </div>

        <div>
          <h3 className="font-display font-bold mb-4">{t("footer.quickLinks")}</h3>
          <ul className="space-y-2 text-sm">
            <li><Link to="/shop" className="text-muted-foreground hover:text-primary transition-smooth">{t("nav.shop")}</Link></li>
            <li><Link to="/services" className="text-muted-foreground hover:text-primary transition-smooth">{t("nav.services")}</Link></li>
            <li><Link to="/portfolio" className="text-muted-foreground hover:text-primary transition-smooth">{t("nav.portfolio")}</Link></li>
            <li><Link to="/blog" className="text-muted-foreground hover:text-primary transition-smooth">{t("nav.blog")}</Link></li>
            <li><Link to="/marketplace" className="text-muted-foreground hover:text-primary transition-smooth">{t("nav.marketplace")}</Link></li>
            <li><Link to="/rentals" className="text-muted-foreground hover:text-primary transition-smooth">{t("nav.rentals")}</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="font-display font-bold mb-4">{t("footer.contact")}</h3>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-2 text-muted-foreground">
              <Phone className="w-4 h-4 mt-0.5 shrink-0 text-primary" />
              <a href="tel:01774585757">01774585757</a>
            </li>
            <li className="flex items-start gap-2 text-muted-foreground">
              <Mail className="w-4 h-4 mt-0.5 shrink-0 text-primary" />
              <a href="mailto:jnilbd@gmail.com">jnilbd@gmail.com</a>
            </li>
            <li className="flex items-start gap-2 text-muted-foreground">
              <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-primary" />
              <span>Baridhara, Dhaka</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border/50 py-6 text-center text-sm text-muted-foreground">
        {t("footer.rights")}
      </div>
    </footer>
  );
};

export default Footer;
