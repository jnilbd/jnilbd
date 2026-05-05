import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import { Service } from "@/data/mockData";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { displayImage, fallbackImageHandler } from "@/lib/siteImages";

const ServiceCard = ({ service, index = 0 }: { service: Service; index?: number }) => {
  const { language, t } = useLanguage();
  const name = language === "bn" ? service.nameBn : service.name;
  const desc = language === "bn" ? service.descriptionBn : service.description;
  const features = language === "bn" ? service.featuresBn : service.features;
  const image = displayImage(service.image, service.id, name, service.category);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -6 }}
      className="group relative bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-elegant transition-smooth border border-border/50 h-full flex flex-col"
    >
      <div className="aspect-video overflow-hidden flex-shrink-0">
        <img src={image} alt={name} loading="lazy" onError={fallbackImageHandler(service.id, name, service.category)} className="w-full h-full object-cover group-hover:scale-110 transition-smooth" />
      </div>
      <div className="p-5 flex flex-col flex-1 gap-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-primary uppercase tracking-[0.18em]">{service.category}</span>
        </div>
        <div className="rounded-xl bg-muted/40 border border-border/40 px-3 py-2 min-h-[3.5rem] flex items-center">
          <h3 className="font-display font-bold text-[1.05rem] leading-snug line-clamp-2 group-hover:text-primary transition-smooth">{name}</h3>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem]">{desc}</p>
        <ul className="space-y-1.5 min-h-[5.25rem]">
          {features.slice(0, 3).map((f, i) => (
            <li key={i} className="flex items-center gap-2 text-sm">
              <Check className="w-4 h-4 text-primary shrink-0" />
              <span className="line-clamp-1">{f}</span>
            </li>
          ))}
        </ul>
        <div className="flex items-center justify-between pt-3 mt-auto border-t border-border/50 gap-2">
          <span className="inline-flex items-baseline gap-1 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/30 shadow-sm">
            <span className="text-[10px] font-semibold text-primary/80">{language === "bn" ? "শুরু ৳" : "From ৳"}</span>
            <span className="text-base font-bold gradient-text leading-none">{service.price.toLocaleString()}</span>
          </span>
          <Link to={`/services/${service.id}`}>
            <Button size="sm" className="rounded-full gradient-bg-primary text-white border-0 hover:opacity-90 shadow-md">
              {t("btn.orderNow")} <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default ServiceCard;
