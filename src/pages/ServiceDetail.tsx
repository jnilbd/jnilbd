import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useState } from "react";
import { ArrowLeft, Check, ShoppingCart } from "lucide-react";
import { services } from "@/data/mockData";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCart } from "@/contexts/CartContext";
import ServiceCard from "@/components/ServiceCard";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import Marquee from "@/components/Marquee";

const ServiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { language, t } = useLanguage();
  const { add } = useCart();

  const [details, setDetails] = useState("");
  const [customAmount, setCustomAmount] = useState("");

  const service = services.find((s) => s.id === id);
  if (!service) {
    return (
      <div className="container py-20 text-center">
        <p className="text-muted-foreground">{t("common.empty")}</p>
        <Link to="/services"><Button className="mt-4">{language === "bn" ? "ফিরে যান" : "Back"}</Button></Link>
      </div>
    );
  }

  const name = language === "bn" ? service.nameBn : service.name;
  const desc = language === "bn" ? service.descriptionBn : service.description;
  const features = language === "bn" ? service.featuresBn : service.features;
  const related = services.filter((s) => s.id !== service.id).slice(0, 3);

  const handleOrder = () => {
    if (!details.trim()) {
      toast.error(language === "bn" ? "অনুগ্রহ করে বিস্তারিত লিখুন" : "Please add details");
      return;
    }
    const finalPrice = customAmount ? Number(customAmount) : service.price;
    if (finalPrice < service.price) {
      toast.error(language === "bn" ? `সর্বনিম্ন মূল্য ৳${service.price}` : `Minimum price ৳${service.price}`);
      return;
    }
    add({
      id: `${service.id}-${Date.now()}`,
      name: `${service.name} — ${details.slice(0, 50)}`,
      nameBn: `${service.nameBn} — ${details.slice(0, 50)}`,
      price: finalPrice,
      image: service.image,
      type: "service",
      category: "service",
    });
    toast.success(language === "bn" ? "সার্ভিস কার্টে যোগ হয়েছে" : "Service added to cart");
    navigate("/checkout");
  };

  return (
    <div>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-bg-warm opacity-10" />
        <div className="container py-12 relative">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6 -ml-3">
            <ArrowLeft className="w-4 h-4 mr-1" /> {language === "bn" ? "ফিরে যান" : "Back"}
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}>
              <div className="aspect-video rounded-3xl overflow-hidden shadow-elegant mb-6">
                <img src={service.image} alt={name} className="w-full h-full object-cover" />
              </div>

              <span className="inline-block px-3 py-1 rounded-full gradient-bg-warm text-white text-xs font-semibold mb-3">{service.category}</span>
              <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">{name}</h1>
              <p className="text-lg text-foreground/80 mb-6 leading-relaxed">{desc}</p>

              <div className="bg-muted/50 rounded-2xl p-6">
                <h3 className="font-display font-bold mb-4">{language === "bn" ? "যা পাচ্ছেন" : "What's Included"}</h3>
                <ul className="space-y-3">
                  {features.map((f, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full gradient-bg-primary flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3.5 h-3.5 text-white" />
                      </div>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} className="lg:sticky lg:top-24 self-start">
              <div className="bg-card rounded-3xl shadow-elegant p-8 border border-border/50">
                <h2 className="text-2xl font-display font-bold mb-6">
                  <span className="gradient-text">{language === "bn" ? "অর্ডার করুন" : "Order Service"}</span>
                </h2>

                <div className="space-y-5">
                  <div>
                    <Label className="mb-2">{language === "bn" ? "শুরু হচ্ছে" : "Starting at"}</Label>
                    <div className="text-4xl font-bold gradient-text">৳{service.price.toLocaleString()}</div>
                  </div>

                  <div>
                    <Label htmlFor="details" className="mb-2">{language === "bn" ? "আপনার চাহিদার বিস্তারিত লিখুন *" : "Describe your requirement *"}</Label>
                    <Textarea
                      id="details"
                      value={details}
                      onChange={(e) => setDetails(e.target.value)}
                      placeholder={language === "bn" ? "আপনার প্রজেক্ট সম্পর্কে বিস্তারিত লিখুন..." : "Describe your project in detail..."}
                      rows={5}
                      className="rounded-xl"
                    />
                  </div>

                  <div>
                    <Label htmlFor="amount" className="mb-2">{language === "bn" ? "কাস্টম অ্যামাউন্ট (ঐচ্ছিক)" : "Custom amount (optional)"}</Label>
                    <Input
                      id="amount"
                      type="number"
                      min={service.price}
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      placeholder={`${service.price}+`}
                      className="rounded-xl"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {language === "bn" ? `সর্বনিম্ন ৳${service.price.toLocaleString()}` : `Minimum ৳${service.price.toLocaleString()}`}
                    </p>
                  </div>

                  <Button size="lg" onClick={handleOrder} className="w-full rounded-full gradient-bg-primary text-white border-0 hover:opacity-90">
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    {language === "bn" ? "অর্ডার ও পেমেন্ট" : "Order & Pay"}
                  </Button>

                  <p className="text-xs text-center text-muted-foreground">
                    {language === "bn" ? "অর্ডার নিশ্চিত করতে পেমেন্ট সম্পন্ন করতে হবে" : "Payment required to confirm order"}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <Marquee variant="cool" />

      {related.length > 0 && (
        <section className="container py-16">
          <h2 className="text-3xl font-display font-bold mb-8">
            <span className="gradient-text">{t("common.relatedServices")}</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {related.map((s, i) => <ServiceCard key={s.id} service={s} index={i} />)}
          </div>
        </section>
      )}
    </div>
  );
};

export default ServiceDetail;
