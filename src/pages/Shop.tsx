import { useState } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { products } from "@/data/mockData";
import { useLanguage } from "@/contexts/LanguageContext";
import ProductCard from "@/components/ProductCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const Shop = () => {
  const { t, language } = useLanguage();
  const [filter, setFilter] = useState<"all" | "digital" | "physical">("all");
  const [search, setSearch] = useState("");

  const filtered = products.filter((p) => {
    const matchCat = filter === "all" || p.category === filter;
    const q = search.toLowerCase();
    const matchSearch = !q || p.name.toLowerCase().includes(q) || p.nameBn.includes(search);
    return matchCat && matchSearch;
  });

  return (
    <div>
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 animated-gradient opacity-90" />
        <div className="container relative z-10 text-white text-center">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-5xl md:text-6xl font-display font-bold mb-3">
            {t("nav.shop")}
          </motion.h1>
          <p className="text-xl text-white/90">{language === "bn" ? "ডিজিটাল ও ফিজিক্যাল প্রোডাক্টস" : "Digital & Physical Products"}</p>
        </div>
      </section>

      <section className="container py-12">
        <div className="flex flex-col md:flex-row gap-4 mb-10">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder={t("common.search")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-12 h-12 rounded-full"
            />
          </div>
          <div className="flex gap-2">
            {(["all", "digital", "physical"] as const).map((cat) => (
              <Button
                key={cat}
                onClick={() => setFilter(cat)}
                variant={filter === cat ? "default" : "outline"}
                className={`rounded-full ${filter === cat ? "gradient-bg-primary text-white border-0" : ""}`}
              >
                {cat === "all" ? (language === "bn" ? "সব" : "All") : cat === "digital" ? (language === "bn" ? "ডিজিটাল" : "Digital") : (language === "bn" ? "ফিজিক্যাল" : "Physical")}
              </Button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <p className="text-center text-muted-foreground py-20">{t("common.empty")}</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filtered.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
          </div>
        )}
      </section>
    </div>
  );
};

export default Shop;
