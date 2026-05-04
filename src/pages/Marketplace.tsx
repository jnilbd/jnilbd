import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Search, MapPin, Calendar } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { usedItems } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const Marketplace = () => {
  const { language, t } = useLanguage();
  const [search, setSearch] = useState("");
  const [openDialog, setOpenDialog] = useState(false);

  const filtered = usedItems.filter((i) => {
    const q = search.toLowerCase();
    return !q || i.title.toLowerCase().includes(q) || i.titleBn.includes(search) || i.location.toLowerCase().includes(q);
  });

  const handlePost = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(language === "bn" ? "পোস্ট সফল হয়েছে! রিভিউয়ের পর প্রকাশ হবে।" : "Posted! Will appear after review.");
    setOpenDialog(false);
  };

  return (
    <div>
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 gradient-bg-warm opacity-90" />
        <div className="container relative z-10 text-white text-center">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-5xl md:text-6xl font-display font-bold mb-3">
            {language === "bn" ? "ইউজড মার্কেটপ্লেস" : "Used Marketplace"}
          </motion.h1>
          <p className="text-xl text-white/90">{language === "bn" ? "পুরাতন প্রোডাক্ট কিনুন বা বিক্রি করুন" : "Buy or sell used products"}</p>
        </div>
      </section>

      <section className="container py-12">
        <div className="flex flex-col md:flex-row gap-4 mb-10">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input placeholder={t("common.search")} value={search} onChange={(e) => setSearch(e.target.value)} className="pl-12 h-12 rounded-full" />
          </div>
          <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogTrigger asChild>
              <Button size="lg" className="rounded-full gradient-bg-primary text-white border-0 hover:opacity-90">
                <Plus className="w-5 h-5 mr-1" /> {language === "bn" ? "পোস্ট করুন" : "Post Item"}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{language === "bn" ? "ইউজড আইটেম পোস্ট করুন" : "Post Used Item"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handlePost} className="space-y-4">
                <div><Label>{language === "bn" ? "টাইটেল" : "Title"}</Label><Input required className="rounded-xl" /></div>
                <div><Label>{language === "bn" ? "মূল্য (৳)" : "Price (৳)"}</Label><Input type="number" required className="rounded-xl" /></div>
                <div><Label>{language === "bn" ? "অবস্থান" : "Location"}</Label><Input required className="rounded-xl" /></div>
                <div><Label>{language === "bn" ? "বিবরণ" : "Description"}</Label><Textarea required rows={3} className="rounded-xl" /></div>
                <div><Label>{language === "bn" ? "যোগাযোগ ফোন" : "Contact Phone"}</Label><Input required className="rounded-xl" /></div>
                <Button type="submit" className="w-full rounded-full gradient-bg-primary text-white border-0">{language === "bn" ? "পোস্ট সাবমিট" : "Submit Post"}</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filtered.map((item, i) => (
            <motion.div key={item.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
              whileHover={{ y: -6 }} className="bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-elegant transition-smooth border border-border/50 cursor-pointer">
              <div className="aspect-square overflow-hidden">
                <img src={item.image} alt={item.title} className="w-full h-full object-cover hover:scale-110 transition-smooth" />
              </div>
              <div className="p-4 space-y-2">
                <span className="inline-block px-2 py-0.5 rounded-full bg-secondary/20 text-secondary text-xs font-semibold">{item.condition}</span>
                <h3 className="font-display font-bold line-clamp-2">{language === "bn" ? item.titleBn : item.title}</h3>
                <div className="text-xl font-bold gradient-text">৳{item.price.toLocaleString()}</div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="w-3 h-3" /> {item.location}</div>
                <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/50">
                  <span>{item.seller}</span>
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {item.postedDate}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Marketplace;
