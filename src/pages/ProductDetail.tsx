import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ShoppingCart, Star, ArrowLeft, Zap, Shield, Truck } from "lucide-react";
import { products } from "@/data/mockData";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCart } from "@/contexts/CartContext";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState } from "react";
import Marquee from "@/components/Marquee";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { language, t } = useLanguage();
  const { add } = useCart();
  const [qty, setQty] = useState(1);

  const product = products.find((p) => p.id === id);
  if (!product) {
    return (
      <div className="container py-20 text-center">
        <p className="text-muted-foreground">{t("common.empty")}</p>
        <Link to="/shop"><Button className="mt-4">{language === "bn" ? "শপে ফিরুন" : "Back to Shop"}</Button></Link>
      </div>
    );
  }

  const name = language === "bn" ? product.nameBn : product.name;
  const desc = language === "bn" ? product.descriptionBn : product.description;
  const cat = language === "bn" ? product.categoryNameBn : product.categoryName;

  const related = products.filter((p) => p.id !== product.id && p.category === product.category).slice(0, 4);

  const handleAdd = () => {
    add({ id: product.id, name: product.name, nameBn: product.nameBn, price: product.price, image: product.image, type: "product" }, qty);
    toast.success(language === "bn" ? "কার্টে যোগ হয়েছে" : "Added to cart");
  };

  const handleBuy = () => {
    add({ id: product.id, name: product.name, nameBn: product.nameBn, price: product.price, image: product.image, type: "product" }, qty);
    navigate("/checkout");
  };

  return (
    <div>
      {/* Landing area */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-bg-primary opacity-10" />
        <div className="container py-12 relative">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6 -ml-3">
            <ArrowLeft className="w-4 h-4 mr-1" /> {language === "bn" ? "ফিরে যান" : "Back"}
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} className="relative">
              <div className="aspect-square rounded-3xl overflow-hidden shadow-elegant bg-muted">
                <img src={product.image} alt={name} className="w-full h-full object-cover" />
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <div>
                <span className="inline-block px-3 py-1 rounded-full gradient-bg-primary text-white text-xs font-semibold mb-3">{cat}</span>
                <h1 className="text-4xl md:text-5xl font-display font-bold mb-3">{name}</h1>
                {product.rating && (
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`w-5 h-5 ${i < Math.floor(product.rating!) ? "fill-yellow-400 text-yellow-400" : "text-muted"}`} />
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground">{product.rating} / 5.0</span>
                  </div>
                )}
              </div>

              <p className="text-lg text-foreground/80 leading-relaxed">{desc}</p>

              <div className="flex items-baseline gap-3">
                <span className="text-5xl font-display font-bold gradient-text">৳{product.price.toLocaleString()}</span>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-3 rounded-xl bg-muted/50">
                  <Zap className="w-5 h-5 mx-auto text-primary mb-1" />
                  <p className="text-xs">{language === "bn" ? "দ্রুত ডেলিভারি" : "Fast Delivery"}</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-muted/50">
                  <Shield className="w-5 h-5 mx-auto text-primary mb-1" />
                  <p className="text-xs">{language === "bn" ? "সিকিউর পেমেন্ট" : "Secure Payment"}</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-muted/50">
                  <Truck className="w-5 h-5 mx-auto text-primary mb-1" />
                  <p className="text-xs">{language === "bn" ? "ফ্রি সাপোর্ট" : "Free Support"}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className="font-semibold">{t("common.quantity")}:</span>
                <div className="flex items-center border rounded-full">
                  <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-4 py-2 hover:text-primary">-</button>
                  <span className="px-4 font-semibold">{qty}</span>
                  <button onClick={() => setQty(qty + 1)} className="px-4 py-2 hover:text-primary">+</button>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button size="lg" onClick={handleAdd} variant="outline" className="rounded-full flex-1 min-w-[180px]">
                  <ShoppingCart className="w-5 h-5 mr-2" /> {t("btn.addCart")}
                </Button>
                <Button size="lg" onClick={handleBuy} className="rounded-full flex-1 min-w-[180px] gradient-bg-primary text-white border-0 hover:opacity-90">
                  {t("btn.buy")}
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <Marquee variant="warm" />

      {related.length > 0 && (
        <section className="container py-16">
          <h2 className="text-3xl font-display font-bold mb-8">
            <span className="gradient-text">{t("common.related")}</span>
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {related.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductDetail;
