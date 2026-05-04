import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ShoppingCart, Star } from "lucide-react";
import { Product } from "@/data/mockData";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const ProductCard = ({ product, index = 0 }: { product: Product; index?: number }) => {
  const { language, t } = useLanguage();
  const { add } = useCart();

  const name = language === "bn" ? product.nameBn : product.name;
  const cat = language === "bn" ? product.categoryNameBn : product.categoryName;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    add({ id: product.id, name: product.name, nameBn: product.nameBn, price: product.price, image: product.image, type: "product" });
    toast.success(language === "bn" ? "কার্টে যোগ হয়েছে" : "Added to cart");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -8 }}
    >
      <Link to={`/shop/${product.id}`} className="group block">
        <div className="bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-elegant transition-smooth border border-border/50">
          <div className="aspect-[4/3] overflow-hidden bg-muted relative">
            <img src={product.image} alt={name} loading="lazy" className="w-full h-full object-cover group-hover:scale-110 transition-smooth" />
            <span className="absolute top-3 left-3 px-3 py-1 rounded-full glass-card text-xs font-semibold">{cat}</span>
            {product.rating && (
              <span className="absolute top-3 right-3 px-2 py-1 rounded-full bg-black/60 text-white text-xs font-semibold flex items-center gap-1">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                {product.rating}
              </span>
            )}
          </div>
          <div className="p-4 space-y-3">
            <h3 className="font-display font-bold line-clamp-2 group-hover:text-primary transition-smooth">{name}</h3>
            <div className="flex items-center justify-between">
              <span className="text-xl font-bold gradient-text">৳{product.price.toLocaleString()}</span>
              <Button size="sm" onClick={handleAdd} className="rounded-full gradient-bg-primary text-white hover:opacity-90 border-0">
                <ShoppingCart className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;
