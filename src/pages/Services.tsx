import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Wrench } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import ServiceRequest from "@/pages/ServiceRequest";
import { Card } from "@/components/ui/card";
import { PAGE_BANNERS } from "@/lib/siteImages";

const badgeColorMap: Record<string, string> = {
  red: "bg-red-500", green: "bg-green-500", blue: "bg-blue-500",
  orange: "bg-orange-500", purple: "bg-purple-500", pink: "bg-pink-500",
};

const Services = () => {
  const { t, language } = useLanguage();
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("services_catalog")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true })
        .order("created_at", { ascending: false });
      setServices(data || []);
      setLoading(false);
    })();
  }, []);

  return (
    <div>
      <section className="relative py-20 overflow-hidden">
        <img src={PAGE_BANNERS.services} alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 gradient-bg-warm opacity-80" />
        <div className="container relative z-10 text-white text-center">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-5xl md:text-6xl font-display font-bold mb-3">
            {t("nav.services")}
          </motion.h1>
          <p className="text-xl text-white/90">{language === "bn" ? "প্রিমিয়াম সার্ভিস, প্রফেশনাল ডেলিভারি" : "Premium services, professional delivery"}</p>
        </div>
      </section>

      <section id="request-service" className="bg-muted/30 border-b border-border/50 scroll-mt-20">
        <ServiceRequest />
      </section>

      <section className="container py-12">
        {loading ? (
          <p className="text-center text-muted-foreground py-12">Loading...</p>
        ) : services.length === 0 ? (
          <div className="text-center py-20 space-y-3">
            <Wrench className="w-16 h-16 mx-auto text-muted-foreground" />
            <p className="text-xl text-muted-foreground">
              {language === "bn" ? "এখনো কোনো সার্ভিস যোগ করা হয়নি" : "No services yet"}
            </p>
            <p className="text-sm text-muted-foreground">
              {language === "bn" ? "শীঘ্রই আসছে — উপরের ফর্ম থেকে কাস্টম সার্ভিস রিকোয়েস্ট করতে পারেন।" : "Coming soon — meanwhile you can submit a custom request above."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((s, i) => {
              const name = language === "bn" && s.name_bn ? s.name_bn : s.name;
              const desc = language === "bn" && s.short_description_bn ? s.short_description_bn : s.short_description;
              return (
                <motion.div key={s.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Link to={`/services/${s.id}`}>
                    <Card className="overflow-hidden h-full hover:shadow-elegant transition-smooth group">
                      <div className="relative aspect-video bg-muted overflow-hidden">
                        {s.image && <img src={s.image} alt={name} className="w-full h-full object-cover group-hover:scale-105 transition-smooth" />}
                        {s.badge && (
                          <span className={`absolute top-3 left-3 px-3 py-1 rounded-full ${badgeColorMap[s.badge_color || "red"]} text-white text-xs font-bold shadow-lg`}>
                            {s.badge}
                          </span>
                        )}
                      </div>
                      <div className="p-5">
                        {s.category && <p className="text-xs text-muted-foreground mb-1">{s.category}</p>}
                        <h3 className="font-display font-bold text-lg mb-1">{name}</h3>
                        {desc && <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{desc}</p>}
                        <div className="flex items-baseline justify-between">
                          <div>
                            <span className="text-xs text-muted-foreground">{language === "bn" ? "শুরু" : "From"}</span>
                            <p className="text-xl font-bold gradient-text">৳{Number(s.starting_price).toLocaleString()}</p>
                          </div>
                          {s.delivery_days && (
                            <span className="text-xs px-2 py-1 rounded-full bg-muted">{s.delivery_days} {language === "bn" ? "দিন" : "days"}</span>
                          )}
                        </div>
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default Services;
