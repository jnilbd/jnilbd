import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ImageOff, Play, Search, ShoppingBag, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type Product = {
  id: string; name: string; name_bn?: string; slug?: string; short_description?: string; short_description_bn?: string;
  price: number; discount_price?: number; image?: string; category?: string; badge?: string; badge_color?: string;
};

const badgeColorMap: Record<string, string> = {
  red: "bg-red-500", green: "bg-green-500", blue: "bg-blue-500",
  orange: "bg-orange-500", purple: "bg-purple-500", pink: "bg-pink-500",
};

const ProductImage = ({ product, name }: { product: Product; name: string }) => {
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = Boolean(product.image) && !imageFailed;

  if (showImage) {
    return (
      <img
        src={product.image}
        alt={name}
        loading="lazy"
        onError={() => setImageFailed(true)}
        className="w-full h-full object-cover group-hover:scale-105 transition-smooth"
      />
    );
  }

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-primary/15 via-background to-secondary/20 p-4 text-center">
      <div className="relative grid h-14 w-14 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-elegant">
        {product.slug === "capcut-pro" ? <Play className="h-7 w-7 fill-current" /> : <ImageOff className="h-7 w-7" />}
        <Sparkles className="absolute -right-1 -top-1 h-5 w-5 rounded-full bg-secondary p-1 text-secondary-foreground" />
      </div>
      <div>
        <p className="text-sm font-bold text-foreground line-clamp-2">{name}</p>
        <p className="mt-1 text-[11px] font-medium text-muted-foreground">Premium Digital Product</p>
      </div>
    </div>
  );
};

const Shop = () => {
  const { t, language } = useLanguage();
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("shop_products").select("*").eq("is_active", true).order("created_at", { ascending: false });
      setProducts((data as any) || []);
      setLoading(false);
    })();
  }, []);

  const filtered = products.filter((p) => {
    const q = search.toLowerCase();
    return !q || p.name.toLowerCase().includes(q) || (p.name_bn || "").includes(search);
  });

  return (
    <div>
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 animated-gradient opacity-90" />
        <div className="container relative z-10 text-white text-center">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-5xl md:text-6xl font-display font-bold mb-3">
            {t("nav.shop")}
          </motion.h1>
          <p className="text-xl text-white/90">{language === "bn" ? "আমাদের প্রিমিয়াম প্রোডাক্ট সংগ্রহ" : "Our Premium Product Collection"}</p>
        </div>
      </section>

      <section className="container py-12">
        <div className="relative max-w-xl mx-auto mb-10">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder={t("common.search")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-12 h-12 rounded-full"
          />
        </div>

        {loading ? (
          <p className="text-center text-muted-foreground py-20">Loading...</p>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 space-y-3">
            <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto" />
            <p className="text-xl text-muted-foreground">
              {language === "bn" ? "এখনো কোনো প্রোডাক্ট যোগ করা হয়নি" : "No products yet"}
            </p>
            <p className="text-sm text-muted-foreground">
              {language === "bn" ? "শীঘ্রই আসছে — অপেক্ষা করুন!" : "Coming soon — stay tuned!"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filtered.map((p, i) => {
              const name = language === "bn" && p.name_bn ? p.name_bn : p.name;
              const desc = language === "bn" && p.short_description_bn ? p.short_description_bn : p.short_description;
              const finalPrice = p.discount_price || p.price;
              return (
                <motion.div key={p.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Link to={p.slug === "capcut-pro" ? "/capcut-pro" : `/shop/${p.id}`}>
                    <Card className="overflow-hidden h-full hover:shadow-elegant transition-smooth group">
                      <div className="relative aspect-square bg-muted overflow-hidden">
                        <ProductImage product={p} name={name} />
                        {p.badge && (
                          <span className={`absolute top-3 left-3 px-3 py-1 rounded-full ${badgeColorMap[p.badge_color || "red"]} text-white text-xs font-bold shadow-lg`}>
                            {p.badge}
                          </span>
                        )}
                        {p.discount_price && p.discount_price < p.price && (
                          <span className="absolute top-3 right-3 px-2 py-1 rounded-full bg-yellow-400 text-black text-xs font-bold">
                            -{Math.round((1 - p.discount_price / p.price) * 100)}%
                          </span>
                        )}
                      </div>
                      <div className="p-4">
                        {p.category && <p className="text-xs text-muted-foreground mb-1">{p.category}</p>}
                        <h3 className="font-display font-bold mb-1 line-clamp-1">{name}</h3>
                        {desc && <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{desc}</p>}
                        <div className="flex items-baseline gap-2">
                          <span className="text-lg font-bold gradient-text">৳{finalPrice.toLocaleString()}</span>
                          {p.discount_price && p.discount_price < p.price && (
                            <span className="text-xs text-muted-foreground line-through">৳{p.price.toLocaleString()}</span>
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

export default Shop;
