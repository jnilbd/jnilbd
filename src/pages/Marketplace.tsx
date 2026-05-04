import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Search, MapPin, Phone, Trash2, Loader2, X, ImagePlus, MessageCircle, Tag } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";
import { z } from "zod";

interface Item {
  id: string;
  user_id: string | null;
  title: string;
  description: string;
  category: string;
  condition: string;
  price: number;
  location: string;
  contact_phone: string;
  contact_name: string | null;
  images: string[];
  created_at: string;
}

const CATEGORIES = ["Electronics", "Furniture", "Vehicles", "Fashion", "Books", "Home", "Mobile", "Other"];
const CONDITIONS = ["New", "Like New", "Used", "For Parts"];

const itemSchema = z.object({
  title: z.string().trim().min(3).max(150),
  description: z.string().trim().min(10).max(2000),
  category: z.string().min(1).max(50),
  condition: z.string().min(1).max(50),
  price: z.coerce.number().int().nonnegative().max(10_000_000),
  location: z.string().trim().min(2).max(150),
  contact_phone: z.string().trim().min(6).max(25),
  contact_name: z.string().trim().max(100).optional().or(z.literal("")),
});

const Marketplace = () => {
  const { language } = useLanguage();
  const [user, setUser] = useState<User | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [openAuth, setOpenAuth] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [selected, setSelected] = useState<Item | null>(null);
  const [tab, setTab] = useState<"all" | "mine">("all");

  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("any");
  const [condFilter, setCondFilter] = useState("any");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setUser(s?.user ?? null));
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null));
    return () => sub.subscription.unsubscribe();
  }, []);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("marketplace_items").select("*").order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    else setItems(data as Item[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
    const channel = supabase
      .channel("marketplace-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "marketplace_items" }, load)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const filtered = useMemo(() => {
    return items.filter((r) => {
      if (tab === "mine" && (!user || r.user_id !== user.id)) return false;
      const q = search.toLowerCase();
      if (q && !(r.title.toLowerCase().includes(q) || r.description.toLowerCase().includes(q) || r.location.toLowerCase().includes(q))) return false;
      if (catFilter !== "any" && r.category !== catFilter) return false;
      if (condFilter !== "any" && r.condition !== condFilter) return false;
      if (minPrice && r.price < Number(minPrice)) return false;
      if (maxPrice && r.price > Number(maxPrice)) return false;
      return true;
    });
  }, [items, search, catFilter, condFilter, minPrice, maxPrice, tab, user]);

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = Array.from(e.target.files || []).slice(0, 6 - files.length);
    const valid = list.filter((f) => f.type.startsWith("image/") && f.size < 5 * 1024 * 1024);
    if (valid.length < list.length) toast.error(language === "bn" ? "শুধু ছবি (5MB এর কম)" : "Images only, under 5MB");
    setFiles((prev) => [...prev, ...valid]);
    setPreviews((prev) => [...prev, ...valid.map((f) => URL.createObjectURL(f))]);
  };

  const removeFile = (i: number) => {
    setFiles((p) => p.filter((_, idx) => idx !== i));
    setPreviews((p) => p.filter((_, idx) => idx !== i));
  };

  const uploadImages = async (): Promise<string[]> => {
    const urls: string[] = [];
    for (const file of files) {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from("marketplace-images").upload(path, file, { contentType: file.type });
      if (error) { toast.error(error.message); continue; }
      const { data } = supabase.storage.from("marketplace-images").getPublicUrl(path);
      urls.push(data.publicUrl);
    }
    return urls;
  };

  const handlePost = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = itemSchema.safeParse(Object.fromEntries(fd));
    if (!parsed.success) { toast.error(parsed.error.errors[0].message); return; }
    setSubmitting(true);
    try {
      const images = files.length ? await uploadImages() : [];
      const d = parsed.data;
      const { error } = await supabase.from("marketplace_items").insert({
        title: d.title,
        description: d.description,
        category: d.category,
        condition: d.condition,
        price: d.price,
        location: d.location,
        contact_phone: d.contact_phone,
        contact_name: d.contact_name || null,
        user_id: user?.id ?? null,
        images,
      });
      if (error) throw error;
      toast.success(language === "bn" ? "পোস্ট সফল!" : "Posted!");
      setOpenDialog(false);
      setFiles([]); setPreviews([]);
      load();
    } catch (err: any) {
      toast.error(err.message || "Failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(language === "bn" ? "মুছে ফেলবেন?" : "Delete?")) return;
    const { error } = await supabase.from("marketplace_items").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success(language === "bn" ? "মুছে ফেলা হয়েছে" : "Deleted"); load(); }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (authMode === "signup") {
      const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/marketplace` } });
      if (error) return toast.error(error.message);
      toast.success(language === "bn" ? "ইমেইল চেক করুন" : "Check your email");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return toast.error(error.message);
      toast.success(language === "bn" ? "লগইন সফল" : "Logged in");
      setOpenAuth(false);
    }
  };

  const logout = async () => { await supabase.auth.signOut(); toast.success("Logged out"); };

  return (
    <div>
      <section className="relative py-16 md:py-20 overflow-hidden">
        <div className="absolute inset-0 gradient-bg-warm opacity-90" />
        <div className="container relative z-10 text-white text-center">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl md:text-6xl font-display font-bold mb-3">
            {language === "bn" ? "ইউজড মার্কেটপ্লেস" : "Used Marketplace"}
          </motion.h1>
          <p className="text-lg md:text-xl text-white/90">{language === "bn" ? "পুরাতন প্রোডাক্ট কিনুন বা বিক্রি করুন" : "Buy or sell used products"}</p>
        </div>
      </section>

      <section className="container py-8 md:py-12">
        <div className="flex flex-wrap gap-3 mb-6 items-center justify-between">
          <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
            <TabsList>
              <TabsTrigger value="all">{language === "bn" ? "সব আইটেম" : "All"}</TabsTrigger>
              <TabsTrigger value="mine" disabled={!user}>{language === "bn" ? "আমার পোস্ট" : "My Posts"}</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="flex gap-2">
            {user ? (
              <Button variant="outline" size="sm" className="rounded-full" onClick={logout}>{language === "bn" ? "লগআউট" : "Logout"}</Button>
            ) : (
              <Button variant="outline" size="sm" className="rounded-full" onClick={() => setOpenAuth(true)}>{language === "bn" ? "লগইন" : "Login"}</Button>
            )}
            <Dialog open={openDialog} onOpenChange={setOpenDialog}>
              <DialogTrigger asChild>
                <Button size="sm" className="rounded-full gradient-bg-primary text-white border-0 hover:opacity-90">
                  <Plus className="w-4 h-4 mr-1" /> {language === "bn" ? "পোস্ট করুন" : "Post Item"}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[90vh] overflow-y-auto max-w-lg">
                <DialogHeader>
                  <DialogTitle>{language === "bn" ? "ইউজড আইটেম পোস্ট" : "Post Used Item"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handlePost} className="space-y-3">
                  <div><Label>{language === "bn" ? "টাইটেল" : "Title"}</Label><Input name="title" required maxLength={150} className="rounded-xl" /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>{language === "bn" ? "ক্যাটাগরি" : "Category"}</Label>
                      <Select name="category" defaultValue="Other">
                        <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>{language === "bn" ? "অবস্থা" : "Condition"}</Label>
                      <Select name="condition" defaultValue="Used">
                        <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {CONDITIONS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>{language === "bn" ? "মূল্য (৳)" : "Price (৳)"}</Label><Input name="price" type="number" min={0} required className="rounded-xl" /></div>
                    <div><Label>{language === "bn" ? "অবস্থান" : "Location"}</Label><Input name="location" required maxLength={150} className="rounded-xl" /></div>
                  </div>
                  <div><Label>{language === "bn" ? "বিবরণ" : "Description"}</Label><Textarea name="description" required rows={3} maxLength={2000} className="rounded-xl" /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>{language === "bn" ? "যোগাযোগ ফোন" : "Contact Phone"}</Label><Input name="contact_phone" required maxLength={25} className="rounded-xl" /></div>
                    <div><Label>{language === "bn" ? "নাম (ঐচ্ছিক)" : "Name (optional)"}</Label><Input name="contact_name" maxLength={100} className="rounded-xl" /></div>
                  </div>
                  <div>
                    <Label>{language === "bn" ? "ছবি (সর্বোচ্চ ৬টি)" : "Photos (max 6)"}</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {previews.map((src, i) => (
                        <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border">
                          <img src={src} alt="" className="w-full h-full object-cover" />
                          <button type="button" onClick={() => removeFile(i)} className="absolute top-0 right-0 bg-black/60 text-white rounded-bl p-0.5">
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                      {files.length < 6 && (
                        <label className="w-20 h-20 rounded-lg border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:bg-muted/50">
                          <ImagePlus className="w-5 h-5 text-muted-foreground" />
                          <input type="file" accept="image/*" multiple className="hidden" onChange={handleFiles} />
                        </label>
                      )}
                    </div>
                  </div>
                  {!user && (
                    <p className="text-xs text-muted-foreground">
                      {language === "bn" ? "লগইন ছাড়া পোস্ট করছেন — পরে এডিট/মুছতে পারবেন না।" : "Posting without login — you won't be able to edit or delete later."}
                    </p>
                  )}
                  <Button type="submit" disabled={submitting} className="w-full rounded-full gradient-bg-primary text-white border-0">
                    {submitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                    {language === "bn" ? "পোস্ট সাবমিট" : "Submit Post"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-8 p-4 rounded-2xl bg-muted/40 border border-border/50">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder={language === "bn" ? "সার্চ..." : "Search..."} value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 rounded-full" />
          </div>
          <Select value={catFilter} onValueChange={setCatFilter}>
            <SelectTrigger className="rounded-full"><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="any">{language === "bn" ? "সব ক্যাটাগরি" : "All categories"}</SelectItem>
              {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={condFilter} onValueChange={setCondFilter}>
            <SelectTrigger className="rounded-full"><SelectValue placeholder="Condition" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="any">{language === "bn" ? "যেকোন অবস্থা" : "Any condition"}</SelectItem>
              {CONDITIONS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <div className="grid grid-cols-2 gap-2">
            <Input type="number" placeholder="Min ৳" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} className="rounded-full" />
            <Input type="number" placeholder="Max ৳" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} className="rounded-full" />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            {language === "bn" ? "কোনো আইটেম পাওয়া যায়নি" : "No items found"}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {filtered.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                whileHover={{ y: -6 }}
                onClick={() => setSelected(item)}
                className="bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-elegant transition-smooth border border-border/50 cursor-pointer group"
              >
                <div className="aspect-square overflow-hidden bg-muted">
                  {item.images[0] ? (
                    <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-smooth" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground"><Tag className="w-10 h-10" /></div>
                  )}
                </div>
                <div className="p-3 md:p-4 space-y-1.5">
                  <div className="flex flex-wrap gap-1">
                    <span className="px-2 py-0.5 rounded-full bg-secondary/20 text-secondary text-[10px] font-semibold">{item.condition}</span>
                    <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-semibold">{item.category}</span>
                  </div>
                  <h3 className="font-display font-bold text-sm md:text-base line-clamp-2">{item.title}</h3>
                  <div className="text-lg md:text-xl font-bold gradient-text">৳{item.price.toLocaleString()}</div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="w-3 h-3" /> {item.location}</div>
                  {user && item.user_id === user.id && (
                    <Button size="sm" variant="ghost" className="text-destructive w-full mt-1" onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}>
                      <Trash2 className="w-3 h-3 mr-1" /> {language === "bn" ? "মুছুন" : "Delete"}
                    </Button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">{selected.title}</DialogTitle>
              </DialogHeader>
              {selected.images.length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                  {selected.images.map((src, i) => (
                    <img key={i} src={src} alt="" className="w-full h-40 object-cover rounded-lg" />
                  ))}
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">{selected.category}</span>
                <span className="px-3 py-1 rounded-full bg-secondary/20 text-secondary text-xs font-semibold">{selected.condition}</span>
              </div>
              <div className="text-3xl font-bold gradient-text">৳{selected.price.toLocaleString()}</div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground"><MapPin className="w-4 h-4" /> {selected.location}</div>
              <p className="text-sm whitespace-pre-wrap">{selected.description}</p>
              {selected.contact_name && <p className="text-sm"><strong>{language === "bn" ? "বিক্রেতা" : "Seller"}:</strong> {selected.contact_name}</p>}
              <div className="flex gap-2 pt-2">
                <Button asChild className="flex-1 rounded-full gradient-bg-primary text-white border-0">
                  <a href={`tel:${selected.contact_phone}`}><Phone className="w-4 h-4 mr-2" /> {language === "bn" ? "কল করুন" : "Call"}</a>
                </Button>
                <Button asChild variant="outline" className="flex-1 rounded-full">
                  <a href={`https://wa.me/${selected.contact_phone.replace(/[^0-9]/g, "")}`} target="_blank" rel="noreferrer">
                    <MessageCircle className="w-4 h-4 mr-2" /> WhatsApp
                  </a>
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Auth Dialog */}
      <Dialog open={openAuth} onOpenChange={setOpenAuth}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{authMode === "login" ? (language === "bn" ? "লগইন" : "Login") : (language === "bn" ? "সাইন আপ" : "Sign Up")}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAuth} className="space-y-3">
            <div><Label>Email</Label><Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="rounded-xl" /></div>
            <div><Label>Password</Label><Input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="rounded-xl" /></div>
            <Button type="submit" className="w-full rounded-full gradient-bg-primary text-white border-0">
              {authMode === "login" ? (language === "bn" ? "লগইন" : "Login") : (language === "bn" ? "সাইন আপ" : "Sign Up")}
            </Button>
            <button type="button" onClick={() => setAuthMode(authMode === "login" ? "signup" : "login")} className="text-xs text-primary underline w-full text-center">
              {authMode === "login" ? (language === "bn" ? "অ্যাকাউন্ট নেই? সাইন আপ" : "No account? Sign up") : (language === "bn" ? "আগে থেকে অ্যাকাউন্ট আছে? লগইন" : "Have account? Login")}
            </button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Marketplace;
