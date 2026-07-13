import { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Star, Zap, Shield, Truck, Clock, ShoppingCart, Tag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

const badgeColorMap: Record<string, string> = {
  red: "bg-red-500", green: "bg-green-500", blue: "bg-blue-500",
  orange: "bg-orange-500", purple: "bg-purple-500", pink: "bg-pink-500",
};

const OFFER_MS = 24 * 60 * 60 * 1000;

function useCountdown(startedAt?: string | null) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  if (!startedAt) return null;
  const start = new Date(startedAt).getTime();
  const elapsed = (now - start) % OFFER_MS;
  const remaining = OFFER_MS - elapsed;
  const h = Math.floor(remaining / 3600000);
  const m = Math.floor((remaining % 3600000) / 60000);
  const s = Math.floor((remaining % 60000) / 1000);
  return { h, m, s };
}

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { user } = useAuth();
  const [product, setProduct] = useState<any>(null);
  const [related, setRelated] = useState<any[]>([]);
  const [addons, setAddons] = useState<any[]>([]);
  const [selectedAddons, setSelectedAddons] = useState<Record<string, boolean>>({});
  const [reviews, setReviews] = useState<any[]>([]);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);

  // Order form
  const [orderForm, setOrderForm] = useState({ name: "", phone: "", email: "", address: "", notes: "", txnId: "", paymentMethod: "bkash" });
  const [placing, setPlacing] = useState(false);
  const isDigital = product?.product_type === "digital";

  // Review form
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });

  const countdown = useCountdown(product?.offer_enabled ? product.offer_started_at : null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      const { data: p } = await supabase.from("shop_products").select("*").eq("id", id).maybeSingle();
      setProduct(p);
      if (p) {
        const relIds = (p.related_ids as string[]) || [];
        const addIds = (p.addon_ids as string[]) || [];
        const ids = [...new Set([...relIds, ...addIds])];
        if (ids.length) {
          const { data: ext } = await supabase.from("shop_products").select("*").in("id", ids);
          setRelated((ext || []).filter((x: any) => relIds.includes(x.id)));
          setAddons((ext || []).filter((x: any) => addIds.includes(x.id)));
        }
        const { data: rv } = await supabase.from("product_reviews").select("*").eq("product_id", id).eq("is_approved", true).order("created_at", { ascending: false });
        setReviews(rv || []);
      }
      setLoading(false);
    })();
  }, [id]);

  const unitPrice = product?.discount_price || product?.price || 0;
  const addonTotal = useMemo(() =>
    addons.filter(a => selectedAddons[a.id]).reduce((s, a) => s + (a.discount_price || a.price), 0),
    [addons, selectedAddons]
  );
  const total = unitPrice * qty + addonTotal;

  const placeOrder = async () => {
    if (!orderForm.name.trim() || !orderForm.phone.trim()) {
      toast.error(language === "bn" ? "নাম এবং ফোন নাম্বার দিন" : "Name and phone are required");
      return;
    }
    setPlacing(true);
    const selectedAddonList = addons.filter(a => selectedAddons[a.id]).map(a => ({ id: a.id, name: a.name, price: a.discount_price || a.price }));
    const { data, error } = await supabase.from("shop_orders").insert({
      user_id: user?.id || null,
      product_id: product.id,
      product_name: product.name,
      quantity: qty,
      unit_price: unitPrice,
      total_amount: total,
      customer_name: orderForm.name,
      customer_phone: orderForm.phone,
      customer_email: orderForm.email || null,
      customer_address: orderForm.address || null,
      notes: orderForm.notes || null,
      addons: selectedAddonList,
    }).select().single();
    if (error) { toast.error(error.message); setPlacing(false); return; }
    // Trigger notification
    supabase.functions.invoke("notify-order", { body: { order_id: data.id } }).catch(() => {});
    toast.success(language === "bn" ? "অর্ডার সফল হয়েছে! আমরা শীঘ্রই যোগাযোগ করব।" : "Order placed! We will contact you soon.");
    setOrderForm({ name: "", phone: "", email: "", address: "", notes: "" });
    setPlacing(false);
  };

  const submitReview = async () => {
    if (!user) { toast.error(language === "bn" ? "রিভিউ দিতে লগইন করুন" : "Please log in to review"); return; }
    if (!reviewForm.comment.trim()) return;
    const { error } = await supabase.from("product_reviews").insert({
      product_id: product.id,
      user_id: user.id,
      reviewer_name: user.email?.split("@")[0] || "User",
      rating: reviewForm.rating,
      comment: reviewForm.comment,
    });
    if (error) { toast.error(error.message); return; }
    toast.success(language === "bn" ? "রিভিউ যোগ হয়েছে" : "Review posted");
    setReviewForm({ rating: 5, comment: "" });
    const { data: rv } = await supabase.from("product_reviews").select("*").eq("product_id", product.id).eq("is_approved", true).order("created_at", { ascending: false });
    setReviews(rv || []);
  };

  if (loading) return <div className="container py-20 text-center">Loading...</div>;
  if (!product) return (
    <div className="container py-20 text-center">
      <p className="text-muted-foreground">{language === "bn" ? "প্রোডাক্ট পাওয়া যায়নি" : "Product not found"}</p>
      <Link to="/shop"><Button className="mt-4">{language === "bn" ? "শপে ফিরুন" : "Back to Shop"}</Button></Link>
    </div>
  );

  const name = language === "bn" && product.name_bn ? product.name_bn : product.name;
  const shortDesc = language === "bn" && product.short_description_bn ? product.short_description_bn : product.short_description;
  const fullDesc = language === "bn" && product.full_description_bn ? product.full_description_bn : product.full_description;
  const avgRating = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

  return (
    <div>
      <section className="container py-8">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6 -ml-3">
          <ArrowLeft className="w-4 h-4 mr-1" /> {language === "bn" ? "ফিরে যান" : "Back"}
        </Button>

        <div className="grid lg:grid-cols-2 gap-10">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="relative aspect-square rounded-3xl overflow-hidden shadow-elegant bg-muted">
              {product.image && <img src={product.image} alt={name} className="w-full h-full object-cover" />}
              {product.badge && (
                <span className={`absolute top-4 left-4 px-4 py-2 rounded-full ${badgeColorMap[product.badge_color || "red"]} text-white text-sm font-bold shadow-xl`}>
                  {product.badge}
                </span>
              )}
            </div>
            {product.gallery && product.gallery.length > 0 && (
              <div className="grid grid-cols-4 gap-2 mt-3">
                {product.gallery.map((g: string, i: number) => (
                  <img key={i} src={g} className="aspect-square rounded-lg object-cover" alt="" />
                ))}
              </div>
            )}
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
            {product.category && <span className="inline-block px-3 py-1 rounded-full gradient-bg-primary text-white text-xs font-semibold">{product.category}</span>}
            <h1 className="text-4xl md:text-5xl font-display font-bold">{name}</h1>

            {reviews.length > 0 && (
              <div className="flex items-center gap-2">
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`w-5 h-5 ${i < Math.round(avgRating) ? "fill-yellow-400 text-yellow-400" : "text-muted"}`} />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">{avgRating.toFixed(1)} ({reviews.length})</span>
              </div>
            )}

            {shortDesc && <p className="text-lg text-foreground/80 leading-relaxed">{shortDesc}</p>}

            <div className="flex items-baseline gap-3">
              <span className="text-5xl font-display font-bold gradient-text">৳{unitPrice.toLocaleString()}</span>
              {product.discount_price && product.discount_price < product.price && (
                <span className="text-xl text-muted-foreground line-through">৳{product.price.toLocaleString()}</span>
              )}
            </div>

            {/* Offer countdown */}
            {product.offer_enabled && countdown && (
              <Card className="p-4 bg-gradient-to-r from-orange-500 to-red-500 text-white">
                <div className="flex items-center gap-3">
                  <Clock className="w-6 h-6" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{language === "bn" ? "⏰ সীমিত সময়ের অফার শেষ হবে" : "⏰ Limited time offer ends in"}</p>
                    <div className="flex gap-2 mt-1">
                      {(["h","m","s"] as const).map(k => (
                        <div key={k} className="bg-white/20 backdrop-blur px-3 py-1 rounded text-center min-w-[50px]">
                          <span className="text-2xl font-bold tabular-nums">{String(countdown[k]).padStart(2,"0")}</span>
                          <span className="block text-[10px] uppercase">{k === "h" ? (language === "bn" ? "ঘ" : "Hrs") : k === "m" ? (language === "bn" ? "মি" : "Min") : (language === "bn" ? "সে" : "Sec")}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            )}

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-3 rounded-xl bg-muted/50"><Zap className="w-5 h-5 mx-auto text-primary mb-1" /><p className="text-xs">{language === "bn" ? "ফাস্ট ডেলিভারি" : "Fast Delivery"}</p></div>
              <div className="p-3 rounded-xl bg-muted/50"><Shield className="w-5 h-5 mx-auto text-primary mb-1" /><p className="text-xs">{language === "bn" ? "সিকিউর" : "Secure"}</p></div>
              <div className="p-3 rounded-xl bg-muted/50"><Truck className="w-5 h-5 mx-auto text-primary mb-1" /><p className="text-xs">{language === "bn" ? "সাপোর্ট" : "Support"}</p></div>
            </div>

            {/* Add-ons */}
            {addons.length > 0 && (
              <div className="space-y-2">
                <Label className="flex items-center gap-1"><Tag className="w-4 h-4" /> {language === "bn" ? "অতিরিক্ত প্রোডাক্ট যোগ করুন" : "Add additional products"}</Label>
                {addons.map(a => (
                  <label key={a.id} className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/40">
                    <input type="checkbox" checked={!!selectedAddons[a.id]} onChange={e => setSelectedAddons({...selectedAddons, [a.id]: e.target.checked})} className="w-5 h-5" />
                    {a.image && <img src={a.image} className="w-12 h-12 rounded object-cover" alt="" />}
                    <div className="flex-1"><p className="font-semibold text-sm">{language === "bn" && a.name_bn ? a.name_bn : a.name}</p></div>
                    <span className="font-bold text-primary">+৳{(a.discount_price || a.price).toLocaleString()}</span>
                  </label>
                ))}
              </div>
            )}

            {/* Qty + Order form */}
            <Card className="p-4 space-y-3">
              <div className="flex items-center gap-4">
                <Label className="font-semibold">{language === "bn" ? "পরিমাণ" : "Quantity"}:</Label>
                <div className="flex items-center border rounded-full">
                  <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-4 py-1">-</button>
                  <span className="px-4 font-semibold">{qty}</span>
                  <button onClick={() => setQty(qty + 1)} className="px-4 py-1">+</button>
                </div>
                <span className="ml-auto text-2xl font-bold gradient-text">৳{total.toLocaleString()}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Input placeholder={language === "bn" ? "আপনার নাম *" : "Your name *"} value={orderForm.name} onChange={e => setOrderForm({...orderForm, name: e.target.value})} />
                <Input placeholder={language === "bn" ? "ফোন নাম্বার *" : "Phone *"} value={orderForm.phone} onChange={e => setOrderForm({...orderForm, phone: e.target.value})} />
              </div>
              <Input placeholder="Email (optional)" value={orderForm.email} onChange={e => setOrderForm({...orderForm, email: e.target.value})} />
              <Input placeholder={language === "bn" ? "ঠিকানা" : "Address"} value={orderForm.address} onChange={e => setOrderForm({...orderForm, address: e.target.value})} />
              <Textarea placeholder={language === "bn" ? "অতিরিক্ত নোট" : "Notes"} rows={2} value={orderForm.notes} onChange={e => setOrderForm({...orderForm, notes: e.target.value})} />
              <Button size="lg" onClick={placeOrder} disabled={placing} className="w-full gradient-bg-primary text-white">
                <ShoppingCart className="w-5 h-5 mr-2" /> {placing ? "..." : (language === "bn" ? "অর্ডার করুন" : "Place Order")}
              </Button>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Tabs: full description + reviews */}
      <section className="container py-10">
        <Tabs defaultValue="desc">
          <TabsList>
            <TabsTrigger value="desc">{language === "bn" ? "বিস্তারিত" : "Full Description"}</TabsTrigger>
            <TabsTrigger value="reviews">{language === "bn" ? "রিভিউ" : "Reviews"} ({reviews.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="desc" className="prose max-w-none dark:prose-invert mt-6">
            {fullDesc ? <ReactMarkdown>{fullDesc}</ReactMarkdown> : <p className="text-muted-foreground">{language === "bn" ? "কোন বিস্তারিত বিবরণ নেই" : "No detailed description."}</p>}
          </TabsContent>
          <TabsContent value="reviews" className="mt-6 space-y-4">
            <Card className="p-4 space-y-3">
              <h3 className="font-bold">{language === "bn" ? "রিভিউ লিখুন" : "Write a review"}</h3>
              <div className="flex items-center gap-1">
                {[1,2,3,4,5].map(n => (
                  <button key={n} onClick={() => setReviewForm({...reviewForm, rating: n})}>
                    <Star className={`w-6 h-6 ${n <= reviewForm.rating ? "fill-yellow-400 text-yellow-400" : "text-muted"}`} />
                  </button>
                ))}
              </div>
              <Textarea rows={3} placeholder={language === "bn" ? "আপনার মতামত লিখুন..." : "Share your experience..."} value={reviewForm.comment} onChange={e => setReviewForm({...reviewForm, comment: e.target.value})} />
              <Button onClick={submitReview}>{language === "bn" ? "জমা দিন" : "Submit"}</Button>
              {!user && <p className="text-xs text-muted-foreground">{language === "bn" ? "রিভিউ দিতে লগইন প্রয়োজন" : "Login required to post a review"}</p>}
            </Card>
            {reviews.map(r => (
              <Card key={r.id} className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold">{r.reviewer_name || "Anonymous"}</p>
                  <div className="flex">{Array.from({length:5}).map((_,i)=>(<Star key={i} className={`w-4 h-4 ${i<r.rating?"fill-yellow-400 text-yellow-400":"text-muted"}`}/>))}</div>
                </div>
                <p className="text-sm">{r.comment}</p>
                <p className="text-xs text-muted-foreground mt-1">{new Date(r.created_at).toLocaleDateString()}</p>
              </Card>
            ))}
            {reviews.length === 0 && <p className="text-muted-foreground text-center py-6">{language === "bn" ? "এখনো কোন রিভিউ নেই" : "No reviews yet"}</p>}
          </TabsContent>
        </Tabs>
      </section>

      {/* Related products */}
      {related.length > 0 && (
        <section className="container py-10">
          <h2 className="text-3xl font-display font-bold mb-6"><span className="gradient-text">{language === "bn" ? "সম্পর্কিত প্রোডাক্ট" : "Related Products"}</span></h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {related.map(r => (
              <Link key={r.id} to={`/shop/${r.id}`}>
                <Card className="overflow-hidden hover:shadow-elegant transition-smooth">
                  {r.image && <img src={r.image} className="aspect-square w-full object-cover" alt="" />}
                  <div className="p-3">
                    <p className="font-semibold text-sm line-clamp-1">{language === "bn" && r.name_bn ? r.name_bn : r.name}</p>
                    <p className="text-primary font-bold">৳{(r.discount_price || r.price).toLocaleString()}</p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductDetail;
