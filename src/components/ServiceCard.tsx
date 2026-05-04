import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import { Service } from "@/data/mockData";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";

const ServiceCard = ({ service, index = 0 }: { service: Service; index?: number }) => {
  const { language, t } = useLanguage();
  const name = language === "bn" ? service.nameBn : service.name;
  const desc = language === "bn" ? service.descriptionBn : service.description;
  const features = language === "bn" ? service.featuresBn : service.features;

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
        <img src={service.image} alt={name} loading="lazy" className="w-full h-full object-cover group-hover:scale-110 transition-smooth" />
      </div>
      <div className="p-6 flex flex-col flex-1">
        <div>
          <span className="text-xs font-semibold text-primary uppercase tracking-wide">{service.category}</span>
          <h3 className="font-display font-bold text-xl mt-1 group-hover:text-primary transition-smooth line-clamp-2 min-h-[3.5rem]">{name}</h3>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2 mt-3 min-h-[2.5rem]">{desc}</p>
        <ul className="space-y-1.5 mt-4 min-h-[5.25rem]">
          {features.slice(0, 3).map((f, i) => (
            <li key={i} className="flex items-center gap-2 text-sm">
              <Check className="w-4 h-4 text-primary shrink-0" />
              <span className="line-clamp-1">{f}</span>
            </li>
          ))}
        </ul>
        <div className="flex items-center justify-between pt-4 mt-auto border-t border-border/50">
          <div>
            <div className="text-xs text-muted-foreground">{language === "bn" ? "শুরু হচ্ছে" : "Starting at"}</div>
            <div className="text-2xl font-bold gradient-text">৳{service.price.toLocaleString()}</div>
          </div>
          <Link to={`/services/${service.id}`}>
            <Button size="sm" className="rounded-full gradient-bg-primary text-white border-0 hover:opacity-90">
              {t("btn.orderNow")} <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default ServiceCard;
