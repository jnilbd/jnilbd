import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Upload, Smartphone, ShieldCheck, Truck, Banknote, CreditCard } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { useCart } from "@/contexts/CartContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";

const Checkout = () => {
  const { items, total, clear, hasPhysical } = useCart();
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  const isBn = language === "bn";

  const siteSettings = useSiteSettings();
  const onlinePay = (siteSettings?.payments || {}) as { bkash?: boolean; sslcommerz?: boolean };

  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "", notes: "" });
  const [method, setMethod] = useState<"bkash" | "nagad" | "cod" | "online_bkash" | "online_card">("bkash");
  const [trxId, setTrxId] = useState("");
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (items.length === 0) {
    return (
      <div className="container py-20 text-center">
        <p className="text-muted-foreground mb-4">{isBn ? "কার্ট খালি" : "Cart is empty"}</p>
        <Link to="/shop"><Button>{isBn ? "শপে যান" : "Go to Shop"}</Button></Link>
      </div>
    );
  }

  const [zone, setZone] = useState<"dhaka" | "outside">("dhaka");
  const paymentNumbers = { bkash: "01774585757", nagad: "01774585757" };
  const codAdvance = 100;
  const isCod = method === "cod";
  const isOnline = method === "online_bkash" || method === "online_card";
  const deliveryFee = hasPhysical ? (zone === "dhaka" ? 70 : 150) : 0;
  const deliveryEta = zone === "dhaka"
    ? (isBn ? "ঢাকার ভিতরে — ১–৩ দিন" : "Inside Dhaka — 1–3 days")
    : (isBn ? "ঢাকার বাইরে — ২–৭ দিন" : "Outside Dhaka — 2–7 days");
  const grandTotal = total + deliveryFee;
  const dueNow = isCod ? codAdvance : grandTotal;
  const dueOnDelivery = isCod ? grandTotal - codAdvance : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone || !form.address) {
      toast.error(isBn ? "সব ফিল্ড পূরণ করুন" : "Fill all required fields");
      return;
    }
    if (!isOnline && !trxId) {
      toast.error(isBn ? "ট্রানজেকশন আইডি দিন" : "Provide transaction ID");
      return;
    }

    setSubmitting(true);
    const orderId = `JN-${Date.now().toString(36).toUpperCase()}`;
    const order = { id: orderId, items, total, deliveryFee, grandTotal, zone, customer: form, payment: { method, trxId, paid: dueNow, due: dueOnDelivery }, date: new Date().toISOString() };
    localStorage.setItem(`order-${orderId}`, JSON.stringify(order));

    if (isOnline) {
      const { data, error } = await supabase.functions.invoke("public-pay", {
        body: {
          provider: method === "online_bkash" ? "bkash" : "sslcommerz",
          amount: grandTotal, invoice: orderId, name: form.name, phone: form.phone,
          email: form.email, address: form.address,
          product: items[0]?.name || "Order",
          callback: `${window.location.origin}/order-confirmation/${orderId}`,
        },
      });
      const err = (data as any)?.error || error?.message;
      if (err || !(data as any)?.url) {
        setSubmitting(false);
        toast.error(err || (isBn ? "পেমেন্ট শুরু করা যায়নি" : "Could not start payment"));
        return;
      }
      clear();
      window.location.href = (data as any).url;
      return;
    }

    setTimeout(() => {
      clear();
      navigate(`/order-confirmation/${orderId}`);
    }, 800);
  };

  const methods: { id: typeof method; label: string; icon: any; show: boolean }[] = [
    { id: "bkash", label: "bKash", icon: Smartphone, show: true },
    { id: "nagad", label: "Nagad", icon: Smartphone, show: true },
    { id: "online_bkash", label: isBn ? "bKash অনলাইন পেমেন্ট" : "bKash online payment", icon: Smartphone, show: !!onlinePay.bkash },
    { id: "online_card", label: isBn ? "কার্ড / ব্যাংক (সিকিউর)" : "Card / Bank (secure)", icon: CreditCard, show: !!onlinePay.sslcommerz },
    { id: "cod", label: isBn ? "ক্যাশ অন ডেলিভারি" : "Cash on Delivery", icon: Banknote, show: hasPhysical },
  ];

  return (
    <div className="container py-12 max-w-5xl">
      <h1 className="text-4xl font-display font-bold mb-8">
        <span className="gradient-text">{isBn ? "চেকআউট ও পেমেন্ট" : "Checkout & Payment"}</span>
      </h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-2xl p-6 shadow-card border border-border/50">
            <h2 className="font-display font-bold text-xl mb-4">{isBn ? "আপনার তথ্য" : "Your Information"}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><Label>{isBn ? "নাম *" : "Name *"}</Label><Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="rounded-xl" /></div>
              <div><Label>{isBn ? "ইমেইল *" : "Email *"}</Label><Input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="rounded-xl" /></div>
              <div><Label>{isBn ? "ফোন *" : "Phone *"}</Label><Input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="rounded-xl" /></div>
              <div><Label>{isBn ? "ঠিকানা *" : "Address *"}</Label><Input required value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="rounded-xl" /></div>
              <div className="md:col-span-2"><Label>{isBn ? "অতিরিক্ত নোট" : "Additional Notes"}</Label><Textarea rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="rounded-xl" /></div>
            </div>
          </motion.div>

          {hasPhysical && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-card rounded-2xl p-6 shadow-card border border-border/50">
              <h2 className="font-display font-bold text-xl mb-1">{isBn ? "ডেলিভারি জোন" : "Delivery Zone"}</h2>
              <p className="text-xs text-muted-foreground mb-4">{isBn ? "আপনার এলাকা সিলেক্ট করুন" : "Select your area"}</p>
              <RadioGroup value={zone} onValueChange={(v) => setZone(v as any)} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Label htmlFor="z-dhaka" className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-smooth ${zone === "dhaka" ? "border-primary bg-primary/5" : "border-border"}`}>
                  <RadioGroupItem value="dhaka" id="z-dhaka" className="mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm">{isBn ? "ঢাকার ভিতরে" : "Inside Dhaka"}</span>
                      <span className="text-xs font-bold text-primary px-2 py-0.5 rounded-full bg-primary/10">৳70</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{isBn ? "ডেলিভারি: ১–৩ দিন" : "Delivery: 1–3 days"}</p>
                  </div>
                </Label>
                <Label htmlFor="z-out" className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-smooth ${zone === "outside" ? "border-primary bg-primary/5" : "border-border"}`}>
                  <RadioGroupItem value="outside" id="z-out" className="mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm">{isBn ? "ঢাকার বাইরে" : "Outside Dhaka"}</span>
                      <span className="text-xs font-bold text-primary px-2 py-0.5 rounded-full bg-primary/10">৳150</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{isBn ? "ডেলিভারি: ২–৭ দিন" : "Delivery: 2–7 days"}</p>
                  </div>
                </Label>
              </RadioGroup>
            </motion.div>
          )}

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card rounded-2xl p-6 shadow-card border border-border/50">
            <h2 className="font-display font-bold text-xl mb-4">{isBn ? "পেমেন্ট মেথড" : "Payment Method"}</h2>

            <RadioGroup value={method} onValueChange={(v) => setMethod(v as any)} className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
              {methods.filter(m => m.show).map((m) => (
                <Label key={m.id} htmlFor={m.id} className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-smooth ${method === m.id ? "border-primary bg-primary/5" : "border-border"}`}>
                  <RadioGroupItem value={m.id} id={m.id} />
                  <m.icon className="w-5 h-5 text-primary" />
                  <span className="font-semibold text-sm">{m.label}</span>
                </Label>
              ))}
            </RadioGroup>

            {isCod ? (
              <div className="bg-gradient-to-br from-secondary/10 to-primary/10 p-5 rounded-2xl mb-4">
                <div className="flex items-start gap-3 mb-3">
                  <Truck className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold mb-1">{isBn ? "ক্যাশ অন ডেলিভারি — কীভাবে কাজ করে" : "Cash on Delivery — How it works"}</p>
                    <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                      <li>{isBn ? `অগ্রিম ৳${codAdvance} bKash/Nagad-এ পাঠাতে হবে (ভুয়া অর্ডার রোধে)।` : `Send ৳${codAdvance} advance via bKash/Nagad (anti-fraud).`}</li>
                      <li>{isBn ? `বাকি ৳${dueOnDelivery.toLocaleString()} ডেলিভারিম্যানের কাছে দিন।` : `Pay ৳${dueOnDelivery.toLocaleString()} balance to courier.`}</li>
                      <li>{isBn ? `ডেলিভারি: ${zone === "dhaka" ? "ঢাকার ভিতরে ১–৩ দিন" : "ঢাকার বাইরে ২–৭ দিন"}।` : `Delivery: ${zone === "dhaka" ? "Inside Dhaka 1–3 days" : "Outside Dhaka 2–7 days"}.`}</li>
                    </ul>
                  </div>
                </div>
                <div className="text-2xl font-display font-bold gradient-text">01774585757 (bKash/Nagad)</div>
              </div>
            ) : (
              <div className="bg-gradient-to-br from-primary/10 to-secondary/10 p-5 rounded-2xl mb-4">
                <p className="text-sm mb-2 text-muted-foreground">
                  {isBn ? `নিচের ${method === "bkash" ? "bKash" : "Nagad"} নম্বরে ৳${grandTotal.toLocaleString()} সেন্ড করুন (Send Money):` : `Send ৳${grandTotal.toLocaleString()} to this ${method === "bkash" ? "bKash" : "Nagad"} number (Send Money):`}
                </p>
                <div className="text-3xl font-display font-bold gradient-text">{paymentNumbers[method as "bkash" | "nagad"]}</div>
                <p className="text-xs text-muted-foreground mt-2">
                  {isBn ? "টাকা সেন্ড করার পর ট্রানজেকশন আইডি ও স্ক্রিনশট নিচে দিন।" : "After sending, provide TrxID and screenshot below."}
                </p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <Label>{isBn ? "ট্রানজেকশন আইডি (TrxID) *" : "Transaction ID (TrxID) *"}</Label>
                <Input required value={trxId} onChange={(e) => setTrxId(e.target.value)} placeholder="e.g. 8N7A4B5C6D" className="rounded-xl" />
                {isCod && <p className="text-xs text-muted-foreground mt-1">{isBn ? `৳${codAdvance} অগ্রিম পাঠানোর TrxID দিন।` : `Provide TrxID for ৳${codAdvance} advance.`}</p>}
              </div>
              <div>
                <Label>{isBn ? "পেমেন্ট স্ক্রিনশট (ঐচ্ছিক)" : "Payment Screenshot (optional)"}</Label>
                <div className="border-2 border-dashed border-border rounded-xl p-4 text-center hover:border-primary transition-smooth">
                  <input type="file" accept="image/*" id="screenshot" className="hidden" onChange={(e) => setScreenshot(e.target.files?.[0] || null)} />
                  <label htmlFor="screenshot" className="cursor-pointer flex flex-col items-center gap-2">
                    <Upload className="w-6 h-6 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{screenshot ? screenshot.name : (isBn ? "স্ক্রিনশট আপলোড করুন" : "Upload screenshot")}</span>
                  </label>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="bg-card rounded-2xl p-6 shadow-elegant border border-border/50 h-fit lg:sticky lg:top-24">
          <h2 className="font-display font-bold text-xl mb-4">{isBn ? "অর্ডার সারাংশ" : "Order Summary"}</h2>
          <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
            {items.map((item) => (
              <div key={item.id} className="flex gap-3 text-sm">
                <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold line-clamp-1">{isBn ? item.nameBn : item.name}</p>
                  <p className="text-xs text-muted-foreground">x{item.quantity}</p>
                </div>
                <div className="font-semibold">৳{(item.price * item.quantity).toLocaleString()}</div>
              </div>
            ))}
          </div>

          <div className="border-t border-border/50 pt-4 space-y-1 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">{isBn ? "সাবটোটাল" : "Subtotal"}</span><span>৳{total.toLocaleString()}</span></div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{isBn ? "ডেলিভারি" : "Delivery"}</span>
              {hasPhysical ? <span>৳{deliveryFee}</span> : <span className="text-green-600">{isBn ? "ফ্রি" : "Free"}</span>}
            </div>
            {hasPhysical && (
              <p className="text-[11px] text-muted-foreground">{deliveryEta}</p>
            )}
            {isCod && (
              <>
                <div className="flex justify-between text-primary font-semibold pt-1"><span>{isBn ? "এখন দিতে হবে" : "Pay now"}</span><span>৳{dueNow.toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">{isBn ? "ডেলিভারিতে দিতে হবে" : "Pay on delivery"}</span><span>৳{dueOnDelivery.toLocaleString()}</span></div>
              </>
            )}
          </div>

          <div className="flex justify-between items-baseline py-4 mb-4 border-t border-border/50 mt-4">
            <span className="font-display font-bold">{t("common.total")}</span>
            <span className="inline-flex items-baseline gap-1 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/30 shadow-sm">
              <span className="text-xs font-semibold text-primary/80">৳</span>
              <span className="text-2xl font-bold gradient-text">{grandTotal.toLocaleString()}</span>
            </span>
          </div>

          <Button type="submit" disabled={submitting} className="w-full rounded-full gradient-bg-primary text-white border-0 hover:opacity-90" size="lg">
            {submitting ? (isBn ? "প্রসেসিং..." : "Processing...") : (isBn ? "অর্ডার নিশ্চিত করুন" : "Confirm Order")}
          </Button>

          <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
            <ShieldCheck className="w-4 h-4 text-green-600" />
            <span>{isBn ? "১০০% সিকিউর পেমেন্ট" : "100% secure payment"}</span>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Checkout;
