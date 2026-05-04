import { motion } from "framer-motion";
import { services } from "@/data/mockData";
import { useLanguage } from "@/contexts/LanguageContext";
import ServiceCard from "@/components/ServiceCard";

const Services = () => {
  const { t, language } = useLanguage();
  return (
    <div>
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 gradient-bg-warm opacity-90" />
        <div className="container relative z-10 text-white text-center">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-5xl md:text-6xl font-display font-bold mb-3">
            {t("nav.services")}
          </motion.h1>
          <p className="text-xl text-white/90">{language === "bn" ? "প্রিমিয়াম সার্ভিস, প্রফেশনাল ডেলিভারি" : "Premium services, professional delivery"}</p>
        </div>
      </section>

      <section className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((s, i) => <ServiceCard key={s.id} service={s} index={i} />)}
        </div>
      </section>
    </div>
  );
};

export default Services;
