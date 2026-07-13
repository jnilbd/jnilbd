import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ImageOff, Package, Play, Search, ShoppingBag, Sparkles, Zap, LayoutGrid } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

type Product = {
  id: string; name: string; name_bn?: string; slug?: string; short_description?: string; short_description_bn?: string;
  price: number; discount_price?: number; image?: string; category?: string; badge?: string; badge_color?: string;
  product_type?: "digital" | "physical" | string;
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
        <p className="mt-1 text-[11px] font-medium text-muted-foreground">Premium Product</p>
      </div>
    </div>
  );
};

type FilterType = "all" | "digital" | "physical";

const Shop = () => {
  const { t, language } = useLanguage();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<FilterType>("all");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("shop_products").select("*").eq("is_active", true).order("created_at", { ascending: false });
      setProducts((data as any) || []);
      setLoading(false);
    })();
  }, []);

  const digitalCount = products.filter((p) => p.product_type === "digital").length;
  const physicalCount = products.filter((p) => p.product_type === "physical").length;

  const filtered = products.filter((p) => {
    const q = search.toLowerCase();
    const matchesSearch = !q || p.name.toLowerCase().includes(q) || (p.name_bn || "").includes(search);
    const matchesType = typeFilter === "all" || p.product_type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div>
      {/* Premium Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-secondary" />
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.25) 0%, transparent 40%), radial-gradient(circle at 80% 60%, rgba(255,215,0,0.25) 0%, transparent 45%)" }} />
        <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-yellow-400/20 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-white/10 blur-3xl" />

        <div className="container relative z-10 py-6 md:py-14 text-white text-center">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-[10px] md:text-sm font-medium mb-2 md:mb-4">
            <Sparkles className="w-3 h-3 text-yellow-300" />
            {language === "bn" ? "প্রিমিয়াম কালেকশন" : "Premium Collection"}
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-2xl md:text-5xl font-display font-bold mb-1.5 md:mb-3 bg-gradient-to-b from-white to-white/70 bg-clip-text text-transparent">
            {t("nav.shop")}
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="text-xs md:text-lg text-white/85 max-w-md mx-auto">
            {language === "bn" ? "ডিজিটাল ও ফিজিক্যাল প্রোডাক্টের সংগ্রহ" : "Curated digital & physical products"}
          </motion.p>

          {/* Stat pills */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="mt-3 md:mt-5 flex flex-wrap items-center justify-center gap-2">
            <div className="px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[10px] md:text-sm">
              <Zap className="inline w-3 h-3 mr-1 text-yellow-300" />
              {digitalCount} {language === "bn" ? "ডিজিটাল" : "Digital"}
            </div>
            <div className="px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[10px] md:text-sm">
              <Package className="inline w-3 h-3 mr-1 text-yellow-300" />
              {physicalCount} {language === "bn" ? "ফিজিক্যাল" : "Physical"}
            </div>
          </motion.div>
        </div>

      </section>

      <section className="container py-8 md:py-12">
        {/* Search */}
        <div className="relative max-w-xl mx-auto mb-5">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder={t("common.search")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-12 h-12 rounded-full shadow-sm"
          />
        </div>

        {/* Type Filter — Digital / Physical */}
        <div className="max-w-xl mx-auto mb-10 grid grid-cols-3 gap-2 p-1.5 rounded-2xl bg-muted/60 border border-border">
          {([
            { key: "all", label: language === "bn" ? "সব" : "All", icon: LayoutGrid, count: products.length },
            { key: "digital", label: language === "bn" ? "ডিজিটাল" : "Digital", icon: Zap, count: digitalCount },
            { key: "physical", label: language === "bn" ? "ফিজিক্যাল" : "Physical", icon: Package, count: physicalCount },
          ] as const).map((opt) => {
            const active = typeFilter === opt.key;
            const Icon = opt.icon;
            return (
              <button
                key={opt.key}
                onClick={() => setTypeFilter(opt.key as FilterType)}
                className={`relative flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 py-2.5 px-2 rounded-xl text-xs md:text-sm font-semibold transition-all ${
                  active
                    ? "bg-gradient-to-br from-primary to-secondary text-white shadow-elegant"
                    : "text-muted-foreground hover:text-foreground hover:bg-background/60"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{opt.label}</span>
                <span className={`text-[10px] md:text-xs px-1.5 py-0.5 rounded-full ${active ? "bg-white/20" : "bg-background"}`}>
                  {opt.count}
                </span>
              </button>
            );
          })}
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
                  <Link to={p.slug === "capcut-pro" ? "/capcut-pro" : p.slug === "mini-hd-projector" ? "/mini-projector" : `/shop/${p.id}`}>
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
