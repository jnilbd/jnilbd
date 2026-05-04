import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Trash2, Plus, Minus, ShoppingBag } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";

const Cart = () => {
  const { items, remove, updateQty, total } = useCart();
  const { language, t } = useLanguage();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="container py-20 text-center max-w-md mx-auto">
        <div className="w-24 h-24 rounded-full gradient-bg-primary mx-auto flex items-center justify-center mb-6 opacity-50">
          <ShoppingBag className="w-12 h-12 text-white" />
        </div>
        <h2 className="text-2xl font-display font-bold mb-2">{language === "bn" ? "কার্ট খালি" : "Cart is empty"}</h2>
        <p className="text-muted-foreground mb-6">{language === "bn" ? "শপিং শুরু করুন" : "Start shopping"}</p>
        <Link to="/shop">
          <Button className="rounded-full gradient-bg-primary text-white border-0">{language === "bn" ? "শপে যান" : "Go to Shop"}</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-12 max-w-5xl">
      <h1 className="text-4xl font-display font-bold mb-8">
        <span className="gradient-text">{language === "bn" ? "আপনার কার্ট" : "Your Cart"}</span>
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          {items.map((item, i) => (
            <motion.div key={item.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-card rounded-2xl p-4 flex gap-4 items-center shadow-card border border-border/50">
              <img src={item.image} alt={item.name} className="w-20 h-20 rounded-xl object-cover" />
              <div className="flex-1 min-w-0">
                <h3 className="font-display font-bold line-clamp-1">{language === "bn" ? item.nameBn : item.name}</h3>
                <p className="text-sm text-muted-foreground capitalize">{item.type}</p>
                <div className="text-lg font-bold gradient-text mt-1">৳{(item.price * item.quantity).toLocaleString()}</div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className="flex items-center border rounded-full">
                  <button onClick={() => updateQty(item.id, item.quantity - 1)} className="px-2 py-1 hover:text-primary"><Minus className="w-3 h-3" /></button>
                  <span className="px-3 text-sm font-semibold">{item.quantity}</span>
                  <button onClick={() => updateQty(item.id, item.quantity + 1)} className="px-2 py-1 hover:text-primary"><Plus className="w-3 h-3" /></button>
                </div>
                <button onClick={() => remove(item.id)} className="text-destructive p-1 hover:scale-110 transition-bounce">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="bg-card rounded-2xl p-6 shadow-elegant border border-border/50 h-fit lg:sticky lg:top-24">
          <h2 className="font-display font-bold text-xl mb-4">{language === "bn" ? "অর্ডার সারাংশ" : "Order Summary"}</h2>
          <div className="space-y-2 text-sm pb-4 border-b border-border/50">
            <div className="flex justify-between"><span className="text-muted-foreground">{language === "bn" ? "সাবটোটাল" : "Subtotal"}</span><span>৳{total.toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">{language === "bn" ? "ডেলিভারি" : "Delivery"}</span><span className="text-green-600 font-semibold">{language === "bn" ? "ফ্রি" : "Free"}</span></div>
          </div>
          <div className="flex justify-between items-baseline py-4 mb-4">
            <span className="font-display font-bold">{t("common.total")}</span>
            <span className="text-2xl font-bold gradient-text">৳{total.toLocaleString()}</span>
          </div>
          <Button onClick={() => navigate("/checkout")} className="w-full rounded-full gradient-bg-primary text-white border-0 hover:opacity-90" size="lg">
            {t("btn.checkout")}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
