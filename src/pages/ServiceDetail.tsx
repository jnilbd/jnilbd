import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Check, ShoppingCart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

const badgeColorMap: Record<string, string> = {
  red: "bg-red-500", green: "bg-green-500", blue: "bg-blue-500",
  orange: "bg-orange-500", purple: "bg-purple-500", pink: "bg-pink-500",
};

const ServiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { user } = useAuth();
  const [service, setService] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: "", phone: "", email: "", address: "", details: "", amount: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const { data } = await supabase.from("services_catalog").select("*").eq("id", id).maybeSingle();
      setService(data);
      setLoading(false);
    })();
  }, [id]);

  if (loading) return <div className="container py-20 text-center">Loading...</div>;
  if (!service) return (
    <div className="container py-20 text-center">
      <p className="text-muted-foreground">{language === "bn" ? "সার্ভিস পাওয়া যায়নি" : "Service not found"}</p>
      <Link to="/services"><Button className="mt-4">{language === "bn" ? "ফিরে যান" : "Back"}</Button></Link>
    </div>
  );

  const name = language === "bn" && service.name_bn ? service.name_bn : service.name;
  const shortDesc = language === "bn" && service.short_description_bn ? service.short_description_bn : service.short_description;
  const fullDesc = language === "bn" && service.full_description_bn ? service.full_description_bn : service.full_description;
  const features = (language === "bn" && service.features_bn?.length ? service.features_bn : service.features) as string[];
  const minPrice = Number(service.starting_price) || 0;

  const placeOrder = async () => {
    if (!form.name.trim() || !form.phone.trim() || !form.details.trim()) {
      toast.error(language === "bn" ? "নাম, ফোন এবং বিস্তারিত প্রয়োজন" : "Name, phone and details required");
      return;
    }
    const quoted = form.amount ? Number(form.amount) : minPrice;
    if (quoted < minPrice) {
      toast.error(language === "bn" ? `সর্বনিম্ন ৳${minPrice}` : `Minimum ৳${minPrice}`);
      return;
    }
    setSubmitting(true);
    const { data, error } = await supabase.from("service_orders").insert({
      user_id: user?.id || null,
      service_id: service.id,
      service_name: service.name,
      customer_name: form.name,
      customer_phone: form.phone,
      customer_email: form.email || null,
      customer_address: form.address || null,
      project_details: form.details,
      quoted_amount: quoted,
    }).select().single();
    if (error) { toast.error(error.message); setSubmitting(false); return; }
    supabase.functions.invoke("notify-order", { body: { service_order_id: data.id } }).catch(() => {});
    toast.success(language === "bn" ? "সার্ভিস রিকোয়েস্ট পাঠানো হয়েছে! আমরা শীঘ্রই যোগাযোগ করব।" : "Request submitted! We will contact you soon.");
    setForm({ name: "", phone: "", email: "", address: "", details: "", amount: "" });
    setSubmitting(false);
  };

  return (
    <div>
      <section className="container py-8">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6 -ml-3">
          <ArrowLeft className="w-4 h-4 mr-1" /> {language === "bn" ? "ফিরে যান" : "Back"}
        </Button>

        <div className="grid lg:grid-cols-2 gap-10">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="relative aspect-video rounded-3xl overflow-hidden shadow-elegant bg-muted mb-4">
              {service.image && <img src={service.image} alt={name} className="w-full h-full object-cover" />}
              {service.badge && (
                <span className={`absolute top-4 left-4 px-4 py-2 rounded-full ${badgeColorMap[service.badge_color || "red"]} text-white text-sm font-bold shadow-xl`}>
                  {service.badge}
                </span>
              )}
            </div>

            {service.category && <span className="inline-block px-3 py-1 rounded-full gradient-bg-warm text-white text-xs font-semibold mb-3">{service.category}</span>}
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-3">{name}</h1>
            {shortDesc && <p className="text-lg text-foreground/80 leading-relaxed mb-6">{shortDesc}</p>}

            {features && features.length > 0 && (
              <Card className="p-6">
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
              </Card>
            )}
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} className="lg:sticky lg:top-24 self-start">
            <Card className="p-6 space-y-4">
              <div>
                <Label className="text-xs">{language === "bn" ? "শুরু হচ্ছে" : "Starting at"}</Label>
                <div className="text-4xl font-bold gradient-text">৳{minPrice.toLocaleString()}</div>
                {service.delivery_days && <p className="text-xs text-muted-foreground">{language === "bn" ? `ডেলিভারি ${service.delivery_days} দিন` : `Delivery in ${service.delivery_days} days`}</p>}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Input placeholder={language === "bn" ? "নাম *" : "Name *"} value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                <Input placeholder={language === "bn" ? "ফোন *" : "Phone *"} value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
              </div>
              <Input placeholder="Email (optional)" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
              <Input placeholder={language === "bn" ? "ঠিকানা" : "Address"} value={form.address} onChange={e => setForm({...form, address: e.target.value})} />
              <Textarea rows={4} placeholder={language === "bn" ? "প্রজেক্টের বিস্তারিত লিখুন *" : "Describe your requirement *"} value={form.details} onChange={e => setForm({...form, details: e.target.value})} />
              <div>
                <Label className="text-xs">{language === "bn" ? "বাজেট (ঐচ্ছিক)" : "Your budget (optional)"}</Label>
                <Input type="number" min={minPrice} placeholder={`${minPrice}+`} value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} />
              </div>
              <Button size="lg" onClick={placeOrder} disabled={submitting} className="w-full gradient-bg-primary text-white">
                <ShoppingCart className="w-5 h-5 mr-2" /> {submitting ? "..." : (language === "bn" ? "রিকোয়েস্ট পাঠান" : "Submit Request")}
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                {language === "bn" ? "অর্ডার পাওয়ার সাথে সাথে আমরা WhatsApp/ফোনে যোগাযোগ করব।" : "We will contact you via WhatsApp/phone immediately."}
              </p>
            </Card>
          </motion.div>
        </div>
      </section>

      {fullDesc && (
        <section className="container py-10">
          <Tabs defaultValue="desc">
            <TabsList><TabsTrigger value="desc">{language === "bn" ? "বিস্তারিত" : "Full Description"}</TabsTrigger></TabsList>
            <TabsContent value="desc" className="prose max-w-none dark:prose-invert mt-6">
              <ReactMarkdown>{fullDesc}</ReactMarkdown>
            </TabsContent>
          </Tabs>
        </section>
      )}
    </div>
  );
};

export default ServiceDetail;
