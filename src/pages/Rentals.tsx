import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Search, MapPin, Bed, Bath, Maximize2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { rentals } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const Rentals = () => {
  const { language, t } = useLanguage();
  const [search, setSearch] = useState("");
  const [openDialog, setOpenDialog] = useState(false);

  const filtered = rentals.filter((r) => {
    const q = search.toLowerCase();
    return !q || r.title.toLowerCase().includes(q) || r.titleBn.includes(search) || r.location.toLowerCase().includes(q);
  });

  const handlePost = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(language === "bn" ? "বাসা ভাড়ার পোস্ট সফল হয়েছে!" : "Rental posted successfully!");
    setOpenDialog(false);
  };

  return (
    <div>
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 gradient-bg-cool opacity-90" />
        <div className="container relative z-10 text-white text-center">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-5xl md:text-6xl font-display font-bold mb-3">
            {language === "bn" ? "বাসা ভাড়া" : "House Rentals"}
          </motion.h1>
          <p className="text-xl text-white/90">{language === "bn" ? "বাসা ভাড়া দিন বা খুঁজুন" : "Rent or find houses"}</p>
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
                <Plus className="w-5 h-5 mr-1" /> {language === "bn" ? "বাসা পোস্ট" : "Post Rental"}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{language === "bn" ? "বাসা ভাড়ার পোস্ট" : "Post Rental"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handlePost} className="space-y-4">
                <div><Label>{language === "bn" ? "টাইটেল" : "Title"}</Label><Input required className="rounded-xl" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>{language === "bn" ? "ভাড়া (৳/মাস)" : "Rent (৳/mo)"}</Label><Input type="number" required className="rounded-xl" /></div>
                  <div><Label>{language === "bn" ? "সাইজ (sqft)" : "Size (sqft)"}</Label><Input required className="rounded-xl" /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>{language === "bn" ? "বেডরুম" : "Bedrooms"}</Label><Input type="number" required className="rounded-xl" /></div>
                  <div><Label>{language === "bn" ? "বাথরুম" : "Bathrooms"}</Label><Input type="number" required className="rounded-xl" /></div>
                </div>
                <div><Label>{language === "bn" ? "অবস্থান" : "Location"}</Label><Input required className="rounded-xl" /></div>
                <div><Label>{language === "bn" ? "বিবরণ" : "Description"}</Label><Textarea required rows={3} className="rounded-xl" /></div>
                <div><Label>{language === "bn" ? "যোগাযোগ ফোন" : "Contact Phone"}</Label><Input required className="rounded-xl" /></div>
                <Button type="submit" className="w-full rounded-full gradient-bg-primary text-white border-0">{language === "bn" ? "পোস্ট সাবমিট" : "Submit Post"}</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((r, i) => (
            <motion.div key={r.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
              whileHover={{ y: -6 }} className="bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-elegant transition-smooth border border-border/50 cursor-pointer">
              <div className="aspect-[16/10] overflow-hidden">
                <img src={r.image} alt={r.title} className="w-full h-full object-cover hover:scale-110 transition-smooth" />
              </div>
              <div className="p-5 space-y-3">
                <span className="inline-block px-2 py-0.5 rounded-full bg-accent/20 text-accent text-xs font-semibold">{r.type}</span>
                <h3 className="font-display font-bold text-lg line-clamp-2">{language === "bn" ? r.titleBn : r.title}</h3>
                <div className="flex items-center gap-1 text-sm text-muted-foreground"><MapPin className="w-4 h-4" /> {r.location}</div>
                <div className="flex items-center gap-4 text-sm text-foreground/70">
                  <span className="flex items-center gap-1"><Bed className="w-4 h-4" /> {r.bedrooms}</span>
                  <span className="flex items-center gap-1"><Bath className="w-4 h-4" /> {r.bathrooms}</span>
                  <span className="flex items-center gap-1"><Maximize2 className="w-4 h-4" /> {r.size}</span>
                </div>
                <div className="text-2xl font-bold gradient-text pt-2 border-t border-border/50">
                  ৳{r.price.toLocaleString()}<span className="text-sm font-normal text-muted-foreground">/mo</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Rentals;
