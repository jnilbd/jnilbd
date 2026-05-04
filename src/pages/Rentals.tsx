import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Search, MapPin, Bed, Bath, Maximize2, Phone, Trash2, Loader2, X, ImagePlus, MessageCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";
import { z } from "zod";

interface Rental {
  id: string;
  user_id: string | null;
  title: string;
  description: string;
  location: string;
  type: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  size: number;
  contact_phone: string;
  contact_name: string | null;
  images: string[];
  created_at: string;
}

const rentalSchema = z.object({
  title: z.string().trim().min(3).max(150),
  description: z.string().trim().min(10).max(2000),
  location: z.string().trim().min(2).max(150),
  type: z.string().min(1).max(50),
  price: z.coerce.number().int().positive().max(10_000_000),
  bedrooms: z.coerce.number().int().min(0).max(20),
  bathrooms: z.coerce.number().int().min(0).max(20),
  size: z.coerce.number().int().min(0).max(100000),
  contact_phone: z.string().trim().min(6).max(25),
  contact_name: z.string().trim().max(100).optional().or(z.literal("")),
});

const Rentals = () => {
  const { language, t } = useLanguage();
  const [user, setUser] = useState<User | null>(null);
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [openAuth, setOpenAuth] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [selectedRental, setSelectedRental] = useState<Rental | null>(null);
  const [tab, setTab] = useState<"all" | "mine">("all");

  // Filters
  const [search, setSearch] = useState("");
  const [locFilter, setLocFilter] = useState("");
  const [bedFilter, setBedFilter] = useState<string>("any");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  // Auth form
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null));
    return () => sub.subscription.unsubscribe();
  }, []);

  const loadRentals = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("rentals").select("*").order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    else setRentals(data as Rental[]);
    setLoading(false);
  };

  useEffect(() => {
    loadRentals();
    const channel = supabase
      .channel("rentals-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "rentals" }, loadRentals)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const filtered = useMemo(() => {
    return rentals.filter((r) => {
      if (tab === "mine" && (!user || r.user_id !== user.id)) return false;
      const q = search.toLowerCase();
      if (q && !(r.title.toLowerCase().includes(q) || r.description.toLowerCase().includes(q))) return false;
      if (locFilter && !r.location.toLowerCase().includes(locFilter.toLowerCase())) return false;
      if (bedFilter !== "any") {
        if (bedFilter === "4+") { if (r.bedrooms < 4) return false; }
        else if (r.bedrooms !== Number(bedFilter)) return false;
      }
      if (minPrice && r.price < Number(minPrice)) return false;
      if (maxPrice && r.price > Number(maxPrice)) return false;
      return true;
    });
  }, [rentals, search, locFilter, bedFilter, minPrice, maxPrice, tab, user]);

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = Array.from(e.target.files || []).slice(0, 6 - files.length);
    const valid = list.filter((f) => f.type.startsWith("image/") && f.size < 5 * 1024 * 1024);
    if (valid.length < list.length) toast.error(language === "bn" ? "শুধু ছবি (5MB এর কম)" : "Images only, under 5MB");
    setFiles((prev) => [...prev, ...valid]);
    setPreviews((prev) => [...prev, ...valid.map((f) => URL.createObjectURL(f))]);
  };

  const removeFile = (i: number) => {
    setFiles((prev) => prev.filter((_, idx) => idx !== i));
    setPreviews((prev) => prev.filter((_, idx) => idx !== i));
  };

  const uploadImages = async (): Promise<string[]> => {
    const urls: string[] = [];
    for (const file of files) {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from("rental-images").upload(path, file, { contentType: file.type });
      if (error) { toast.error(error.message); continue; }
      const { data } = supabase.storage.from("rental-images").getPublicUrl(path);
      urls.push(data.publicUrl);
    }
    return urls;
  };

  const handlePost = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = rentalSchema.safeParse(Object.fromEntries(fd));
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }
    setSubmitting(true);
    try {
      const images = files.length ? await uploadImages() : [];
      const d = parsed.data;
      const { error } = await supabase.from("rentals").insert({
        title: d.title,
        description: d.description,
        location: d.location,
        type: d.type,
        price: d.price,
        bedrooms: d.bedrooms,
        bathrooms: d.bathrooms,
        size: d.size,
        contact_phone: d.contact_phone,
        contact_name: d.contact_name || null,
        user_id: user?.id ?? null,
        images,
      });
      if (error) throw error;
      toast.success(language === "bn" ? "বাসা ভাড়ার পোস্ট সফল!" : "Rental posted!");
      setOpenDialog(false);
      setFiles([]); setPreviews([]);
      loadRentals();
    } catch (err: any) {
      toast.error(err.message || "Failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(language === "bn" ? "মুছে ফেলবেন?" : "Delete this rental?")) return;
    const { error } = await supabase.from("rentals").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success(language === "bn" ? "মুছে ফেলা হয়েছে" : "Deleted"); loadRentals(); }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (authMode === "signup") {
      const { error } = await supabase.auth.signUp({
        email, password,
        options: { emailRedirectTo: `${window.location.origin}/rentals` },
      });
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
        <div className="absolute inset-0 gradient-bg-cool opacity-90" />
        <div className="container relative z-10 text-white text-center">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl md:text-6xl font-display font-bold mb-3">
            {language === "bn" ? "বাসা ভাড়া" : "House Rentals"}
          </motion.h1>
          <p className="text-lg md:text-xl text-white/90">{language === "bn" ? "বাসা ভাড়া দিন বা খুঁজুন" : "Rent or find houses"}</p>
        </div>
      </section>

      <section className="container py-8 md:py-12">
        {/* Top bar */}
        <div className="flex flex-wrap gap-3 mb-6 items-center justify-between">
          <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
            <TabsList>
              <TabsTrigger value="all">{language === "bn" ? "সব পোস্ট" : "All"}</TabsTrigger>
              <TabsTrigger value="mine" disabled={!user}>{language === "bn" ? "আমার পোস্ট" : "My Posts"}</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="flex gap-2">
            {user ? (
              <Button variant="outline" size="sm" className="rounded-full" onClick={logout}>
                {language === "bn" ? "লগআউট" : "Logout"}
              </Button>
            ) : (
              <Button variant="outline" size="sm" className="rounded-full" onClick={() => setOpenAuth(true)}>
                {language === "bn" ? "লগইন" : "Login"}
              </Button>
            )}
            <Dialog open={openDialog} onOpenChange={setOpenDialog}>
              <DialogTrigger asChild>
                <Button size="sm" className="rounded-full gradient-bg-primary text-white border-0 hover:opacity-90">
                  <Plus className="w-4 h-4 mr-1" /> {language === "bn" ? "বাসা পোস্ট" : "Post Rental"}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[90vh] overflow-y-auto max-w-lg">
                <DialogHeader>
                  <DialogTitle>{language === "bn" ? "বাসা ভাড়ার পোস্ট" : "Post Rental"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handlePost} className="space-y-3">
                  <div><Label>{language === "bn" ? "টাইটেল" : "Title"}</Label><Input name="title" required maxLength={150} className="rounded-xl" /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>{language === "bn" ? "টাইপ" : "Type"}</Label>
                      <Select name="type" defaultValue="Apartment">
                        <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Apartment">{language === "bn" ? "অ্যাপার্টমেন্ট" : "Apartment"}</SelectItem>
                          <SelectItem value="House">{language === "bn" ? "বাড়ি" : "House"}</SelectItem>
                          <SelectItem value="Room">{language === "bn" ? "রুম" : "Room"}</SelectItem>
                          <SelectItem value="Sublet">{language === "bn" ? "সাবলেট" : "Sublet"}</SelectItem>
                          <SelectItem value="Commercial">{language === "bn" ? "কমার্শিয়াল" : "Commercial"}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div><Label>{language === "bn" ? "ভাড়া (৳/মাস)" : "Rent (৳/mo)"}</Label><Input name="price" type="number" min={1} required className="rounded-xl" /></div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div><Label>{language === "bn" ? "বেডরুম" : "Beds"}</Label><Input name="bedrooms" type="number" min={0} defaultValue={1} required className="rounded-xl" /></div>
                    <div><Label>{language === "bn" ? "বাথরুম" : "Baths"}</Label><Input name="bathrooms" type="number" min={0} defaultValue={1} required className="rounded-xl" /></div>
                    <div><Label>{language === "bn" ? "সাইজ" : "Size"}</Label><Input name="size" type="number" min={0} defaultValue={0} required className="rounded-xl" /></div>
                  </div>
                  <div><Label>{language === "bn" ? "অবস্থান" : "Location"}</Label><Input name="location" required maxLength={150} className="rounded-xl" /></div>
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
            <Input placeholder={language === "bn" ? "টাইটেল/বিবরণ" : "Search title/description"} value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 rounded-full" />
          </div>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder={language === "bn" ? "এলাকা" : "Location"} value={locFilter} onChange={(e) => setLocFilter(e.target.value)} className="pl-9 rounded-full" />
          </div>
          <Select value={bedFilter} onValueChange={setBedFilter}>
            <SelectTrigger className="rounded-full"><SelectValue placeholder="Bedrooms" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="any">{language === "bn" ? "যেকোন বেডরুম" : "Any bedrooms"}</SelectItem>
              <SelectItem value="1">1 BR</SelectItem>
              <SelectItem value="2">2 BR</SelectItem>
              <SelectItem value="3">3 BR</SelectItem>
              <SelectItem value="4+">4+ BR</SelectItem>
            </SelectContent>
          </Select>
          <div className="grid grid-cols-2 gap-2">
            <Input type="number" placeholder="Min ৳" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} className="rounded-full" />
            <Input type="number" placeholder="Max ৳" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} className="rounded-full" />
          </div>
        </div>

        {/* List */}
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            {language === "bn" ? "কোনো পোস্ট পাওয়া যায়নি" : "No rentals found"}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((r, i) => (
              <motion.div key={r.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                whileHover={{ y: -6 }}
                className="bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-elegant transition-smooth border border-border/50 cursor-pointer group"
                onClick={() => setSelectedRental(r)}>
                <div className="aspect-[16/10] overflow-hidden bg-muted relative">
                  {r.images[0] ? (
                    <img src={r.images[0]} alt={r.title} className="w-full h-full object-cover group-hover:scale-110 transition-smooth" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground"><MapPin className="w-12 h-12" /></div>
                  )}
                  {user && r.user_id === user.id && (
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(r.id); }}
                      className="absolute top-2 right-2 bg-destructive/90 text-destructive-foreground rounded-full p-1.5 hover:scale-110 transition">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <div className="p-5 space-y-2.5">
                  <span className="inline-block px-2 py-0.5 rounded-full bg-accent/20 text-accent text-xs font-semibold">{r.type}</span>
                  <div className="rounded-xl bg-muted/40 border border-border/40 px-3 py-2 min-h-[3.25rem] flex items-center">
                    <h3 className="font-display font-bold text-[0.95rem] line-clamp-2 leading-snug">{r.title}</h3>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground"><MapPin className="w-4 h-4 shrink-0" /> <span className="truncate">{r.location}</span></div>
                  <div className="flex items-center gap-3 text-sm text-foreground/70">
                    <span className="flex items-center gap-1"><Bed className="w-4 h-4" /> {r.bedrooms}</span>
                    <span className="flex items-center gap-1"><Bath className="w-4 h-4" /> {r.bathrooms}</span>
                    {r.size > 0 && <span className="flex items-center gap-1"><Maximize2 className="w-4 h-4" /> {r.size}</span>}
                  </div>
                  <div className="pt-2 border-t border-border/50 flex items-center justify-between">
                    <span className="inline-flex items-baseline gap-1 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/30 shadow-sm">
                      <span className="text-[10px] font-semibold text-primary/80">৳</span>
                      <span className="text-base font-bold gradient-text leading-none">{r.price.toLocaleString()}</span>
                    </span>
                    <span className="text-xs text-muted-foreground">/mo</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Detail dialog */}
      <Dialog open={!!selectedRental} onOpenChange={(v) => !v && setSelectedRental(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto max-w-2xl">
          {selectedRental && (
            <div className="space-y-4">
              <DialogHeader><DialogTitle className="text-2xl">{selectedRental.title}</DialogTitle></DialogHeader>
              {selectedRental.images.length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                  {selectedRental.images.map((src, i) => (
                    <img key={i} src={src} alt="" className="w-full aspect-video object-cover rounded-xl" />
                  ))}
                </div>
              )}
              <div className="flex flex-wrap gap-2 text-sm">
                <span className="px-2 py-1 rounded-full bg-accent/20 text-accent font-semibold">{selectedRental.type}</span>
                <span className="px-2 py-1 rounded-full bg-muted">{selectedRental.bedrooms} BR</span>
                <span className="px-2 py-1 rounded-full bg-muted">{selectedRental.bathrooms} Bath</span>
                {selectedRental.size > 0 && <span className="px-2 py-1 rounded-full bg-muted">{selectedRental.size} sqft</span>}
              </div>
              <div className="flex items-center gap-1 text-muted-foreground"><MapPin className="w-4 h-4" /> {selectedRental.location}</div>
              <div className="text-3xl font-bold gradient-text">৳{selectedRental.price.toLocaleString()}<span className="text-sm font-normal text-muted-foreground">/mo</span></div>
              <p className="text-foreground/80 whitespace-pre-wrap">{selectedRental.description}</p>
              <div className="flex flex-wrap gap-2 pt-3 border-t">
                <a href={`tel:${selectedRental.contact_phone}`} className="flex-1 min-w-[140px]">
                  <Button className="w-full rounded-full gradient-bg-primary text-white border-0"><Phone className="w-4 h-4 mr-2" />{selectedRental.contact_phone}</Button>
                </a>
                <a href={`https://wa.me/${selectedRental.contact_phone.replace(/[^0-9]/g, "")}`} target="_blank" rel="noreferrer" className="flex-1 min-w-[140px]">
                  <Button variant="outline" className="w-full rounded-full"><MessageCircle className="w-4 h-4 mr-2" />WhatsApp</Button>
                </a>
              </div>
              {selectedRental.contact_name && (
                <p className="text-sm text-muted-foreground">{language === "bn" ? "যোগাযোগ" : "Contact"}: {selectedRental.contact_name}</p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Auth dialog */}
      <Dialog open={openAuth} onOpenChange={setOpenAuth}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>{authMode === "login" ? (language === "bn" ? "লগইন" : "Login") : (language === "bn" ? "সাইন আপ" : "Sign Up")}</DialogTitle></DialogHeader>
          <form onSubmit={handleAuth} className="space-y-3">
            <div><Label>Email</Label><Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="rounded-xl" /></div>
            <div><Label>Password</Label><Input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="rounded-xl" /></div>
            <Button type="submit" className="w-full rounded-full gradient-bg-primary text-white border-0">
              {authMode === "login" ? (language === "bn" ? "লগইন" : "Login") : (language === "bn" ? "সাইন আপ" : "Sign Up")}
            </Button>
            <button type="button" onClick={() => setAuthMode(authMode === "login" ? "signup" : "login")} className="w-full text-sm text-primary hover:underline">
              {authMode === "login" ? (language === "bn" ? "অ্যাকাউন্ট নেই? সাইন আপ" : "No account? Sign up") : (language === "bn" ? "ইতিমধ্যে অ্যাকাউন্ট আছে? লগইন" : "Have an account? Login")}
            </button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Rentals;
