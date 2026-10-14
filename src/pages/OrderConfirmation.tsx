import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, Mail, MessageCircle, Home } from "lucide-react";
import { useEffect, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import logoMark from "@/assets/logo-mark.png";

const OrderConfirmation = () => {
  const { id } = useParams();
  const { language } = useLanguage();
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    if (id) {
      const data = localStorage.getItem(`order-${id}`);
      if (data) setOrder(JSON.parse(data));
    }
  }, [id]);

  return (
    <div className="container py-16 max-w-2xl">
      <img src={logoMark} alt="JohnNil" width={64} height={64}
        className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-background to-muted/60 ring-1 ring-secondary/40 object-cover" />
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", duration: 0.6 }}
        className="w-24 h-24 rounded-full gradient-bg-primary mx-auto flex items-center justify-center shadow-glow mb-6">
        <CheckCircle2 className="w-12 h-12 text-white" />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-center mb-8">
        <h1 className="text-4xl font-display font-bold mb-3">
          <span className="gradient-text">{language === "bn" ? "অর্ডার সফল হয়েছে! 🎉" : "Order Placed Successfully! 🎉"}</span>
        </h1>
        <p className="text-muted-foreground">
          {language === "bn" ? "আপনার অর্ডার গ্রহণ করা হয়েছে। পেমেন্ট ভেরিফিকেশন সম্পন্ন হলে কাজ শুরু হবে।" : "Your order has been received. Work will begin after payment verification."}
        </p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="bg-card rounded-2xl p-6 shadow-elegant border border-border/50 mb-6">
        <div className="text-center pb-4 border-b border-border/50 mb-4">
          <p className="text-sm text-muted-foreground">{language === "bn" ? "অর্ডার আইডি" : "Order ID"}</p>
          <p className="text-2xl font-display font-bold gradient-text">{id}</p>
        </div>

        {order && (
          <>
            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between"><span className="text-muted-foreground">{language === "bn" ? "নাম" : "Name"}</span><span className="font-semibold">{order.customer.name}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">{language === "bn" ? "ইমেইল" : "Email"}</span><span className="font-semibold">{order.customer.email}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">{language === "bn" ? "ফোন" : "Phone"}</span><span className="font-semibold">{order.customer.phone}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">{language === "bn" ? "পেমেন্ট" : "Payment"}</span><span className="font-semibold capitalize">{order.payment.method} — {order.payment.trxId}</span></div>
            </div>
            <div className="border-t border-border/50 pt-4 flex justify-between items-baseline">
              <span className="font-display font-bold">{language === "bn" ? "মোট" : "Total"}</span>
              <span className="text-2xl font-bold gradient-text">৳{order.total.toLocaleString()}</span>
            </div>
          </>
        )}
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-2xl p-6 mb-6">
        <h3 className="font-display font-bold mb-3">{language === "bn" ? "পরবর্তী পদক্ষেপ" : "Next Steps"}</h3>
        <ul className="space-y-2 text-sm text-foreground/80">
          <li className="flex gap-2"><Mail className="w-4 h-4 text-primary mt-0.5 shrink-0" /><span>{language === "bn" ? "অর্ডার নিশ্চিতকরণ ইমেইল আপনার ইনবক্সে যাবে।" : "Order confirmation email will be sent to your inbox."}</span></li>
          <li className="flex gap-2"><MessageCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" /><span>{language === "bn" ? "প্রয়োজনে আমরা WhatsApp/ফোনে যোগাযোগ করব।" : "We will contact you via WhatsApp/phone if needed."}</span></li>
        </ul>
      </motion.div>

      <div className="flex gap-3 justify-center">
        <Link to="/"><Button variant="outline" className="rounded-full"><Home className="w-4 h-4 mr-1" />{language === "bn" ? "হোম" : "Home"}</Button></Link>
        <Link to="/shop"><Button className="rounded-full gradient-bg-primary text-white border-0">{language === "bn" ? "আরো শপিং" : "Continue Shopping"}</Button></Link>
      </div>
    </div>
  );
};

export default OrderConfirmation;
