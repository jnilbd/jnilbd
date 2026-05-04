import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Upload, Smartphone, ShieldCheck } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";

const Checkout = () => {
  const { items, total, clear } = useCart();
  const { language, t } = useLanguage();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "", notes: "" });
  const [method, setMethod] = useState("bkash");
  const [trxId, setTrxId] = useState("");
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (items.length === 0) {
    return (
      <div className="container py-20 text-center">
        <p className="text-muted-foreground mb-4">{language === "bn" ? "কার্ট খালি" : "Cart is empty"}</p>
        <Link to="/shop"><Button>{language === "bn" ? "শপে যান" : "Go to Shop"}</Button></Link>
      </div>
    );
  }

  const paymentNumbers = {
    bkash: "01774585757",
    nagad: "01774585757",
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone || !form.address) {
      toast.error(language === "bn" ? "সব ফিল্ড পূরণ করুন" : "Fill all required fields");
      return;
    }
    if (!trxId) {
      toast.error(language === "bn" ? "ট্রানজেকশন আইডি দিন" : "Provide transaction ID");
      return;
    }

    setSubmitting(true);
    const orderId = `JN-${Date.now().toString(36).toUpperCase()}`;
    // Save order locally for confirmation page (will be backend later)
    const order = { id: orderId, items, total, customer: form, payment: { method, trxId }, date: new Date().toISOString() };
    localStorage.setItem(`order-${orderId}`, JSON.stringify(order));

    setTimeout(() => {
      clear();
      navigate(`/order-confirmation/${orderId}`);
    }, 800);
  };

  return (
    <div className="container py-12 max-w-5xl">
      <h1 className="text-4xl font-display font-bold mb-8">
        <span className="gradient-text">{language === "bn" ? "চেকআউট ও পেমেন্ট" : "Checkout & Payment"}</span>
      </h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Info */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-2xl p-6 shadow-card border border-border/50">
            <h2 className="font-display font-bold text-xl mb-4">{language === "bn" ? "আপনার তথ্য" : "Your Information"}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><Label>{language === "bn" ? "নাম *" : "Name *"}</Label><Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="rounded-xl" /></div>
              <div><Label>{language === "bn" ? "ইমেইল *" : "Email *"}</Label><Input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="rounded-xl" /></div>
              <div><Label>{language === "bn" ? "ফোন *" : "Phone *"}</Label><Input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="rounded-xl" /></div>
              <div><Label>{language === "bn" ? "ঠিকানা *" : "Address *"}</Label><Input required value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="rounded-xl" /></div>
              <div className="md:col-span-2"><Label>{language === "bn" ? "অতিরিক্ত নোট" : "Additional Notes"}</Label><Textarea rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="rounded-xl" /></div>
            </div>
          </motion.div>

          {/* Payment */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card rounded-2xl p-6 shadow-card border border-border/50">
            <h2 className="font-display font-bold text-xl mb-4">{language === "bn" ? "পেমেন্ট মেথড" : "Payment Method"}</h2>

            <RadioGroup value={method} onValueChange={setMethod} className="grid grid-cols-2 gap-3 mb-6">
              {(["bkash", "nagad"] as const).map((m) => (
                <Label key={m} htmlFor={m} className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-smooth ${method === m ? "border-primary bg-primary/5" : "border-border"}`}>
                  <RadioGroupItem value={m} id={m} />
                  <Smartphone className="w-5 h-5 text-primary" />
                  <span className="font-semibold capitalize">{m === "bkash" ? "bKash" : "Nagad"}</span>
                </Label>
              ))}
            </RadioGroup>

            <div className="bg-gradient-to-br from-primary/10 to-secondary/10 p-5 rounded-2xl mb-4">
              <p className="text-sm mb-2 text-muted-foreground">
                {language === "bn" ? `নিচের ${method === "bkash" ? "bKash" : "Nagad"} নম্বরে ৳${total.toLocaleString()} সেন্ড করুন (Send Money):` : `Send ৳${total.toLocaleString()} to this ${method === "bkash" ? "bKash" : "Nagad"} number (Send Money):`}
              </p>
              <div className="text-3xl font-display font-bold gradient-text">{paymentNumbers[method as keyof typeof paymentNumbers]}</div>
              <p className="text-xs text-muted-foreground mt-2">
                {language === "bn" ? "টাকা সেন্ড করার পর ট্রানজেকশন আইডি ও স্ক্রিনশট নিচে দিন।" : "After sending, provide transaction ID and screenshot below."}
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label>{language === "bn" ? "ট্রানজেকশন আইডি (TrxID) *" : "Transaction ID (TrxID) *"}</Label>
                <Input required value={trxId} onChange={(e) => setTrxId(e.target.value)} placeholder="e.g. 8N7A4B5C6D" className="rounded-xl" />
              </div>
              <div>
                <Label>{language === "bn" ? "পেমেন্ট স্ক্রিনশট (ঐচ্ছিক)" : "Payment Screenshot (optional)"}</Label>
                <div className="border-2 border-dashed border-border rounded-xl p-4 text-center hover:border-primary transition-smooth">
                  <input type="file" accept="image/*" id="screenshot" className="hidden" onChange={(e) => setScreenshot(e.target.files?.[0] || null)} />
                  <label htmlFor="screenshot" className="cursor-pointer flex flex-col items-center gap-2">
                    <Upload className="w-6 h-6 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{screenshot ? screenshot.name : (language === "bn" ? "স্ক্রিনশট আপলোড করুন" : "Upload screenshot")}</span>
                  </label>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Summary */}
        <div className="bg-card rounded-2xl p-6 shadow-elegant border border-border/50 h-fit lg:sticky lg:top-24">
          <h2 className="font-display font-bold text-xl mb-4">{language === "bn" ? "অর্ডার সারাংশ" : "Order Summary"}</h2>
          <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
            {items.map((item) => (
              <div key={item.id} className="flex gap-3 text-sm">
                <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold line-clamp-1">{language === "bn" ? item.nameBn : item.name}</p>
                  <p className="text-xs text-muted-foreground">x{item.quantity}</p>
                </div>
                <div className="font-semibold">৳{(item.price * item.quantity).toLocaleString()}</div>
              </div>
            ))}
          </div>

          <div className="border-t border-border/50 pt-4 space-y-1 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">{language === "bn" ? "সাবটোটাল" : "Subtotal"}</span><span>৳{total.toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">{language === "bn" ? "ডেলিভারি" : "Delivery"}</span><span className="text-green-600">{language === "bn" ? "ফ্রি" : "Free"}</span></div>
          </div>

          <div className="flex justify-between items-baseline py-4 mb-4 border-t border-border/50 mt-4">
            <span className="font-display font-bold">{t("common.total")}</span>
            <span className="text-2xl font-bold gradient-text">৳{total.toLocaleString()}</span>
          </div>

          <Button type="submit" disabled={submitting} className="w-full rounded-full gradient-bg-primary text-white border-0 hover:opacity-90" size="lg">
            {submitting ? (language === "bn" ? "প্রসেসিং..." : "Processing...") : (language === "bn" ? "অর্ডার নিশ্চিত করুন" : "Confirm Order")}
          </Button>

          <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
            <ShieldCheck className="w-4 h-4 text-green-600" />
            <span>{language === "bn" ? "১০০% সিকিউর পেমেন্ট" : "100% secure payment"}</span>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Checkout;
