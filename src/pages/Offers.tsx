import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, RefreshCw, ExternalLink, Tag, Gift, Percent, Copy, Sparkles, ShoppingBag } from "lucide-react";
import { toast } from "sonner";

type Offer = {
  store: string;
  category?: string;
  product?: string;
  type?: string;
  title_bn?: string;
  details_bn?: string;
  original_price?: number;
  offer_price?: number;
  discount_pct?: number;
  coupon?: string;
  valid_till?: string;
  link?: string;
};

const STORES = [
  "all", "Chaldal", "Shwapno", "Meena Bazar", "Agora", "Daraz", "Foodpanda",
  "Pathao", "Pickaboo", "Othoba", "Rokomari", "PriyoShop", "Unimart",
  "Transcom Digital", "MyOne", "Singer", "Walton", "Pizza Hut BD", "KFC BD",
];

const typeIcon = (t?: string) => {
  if (!t) return Tag;
  if (t.includes("free")) return Gift;
  if (t.includes("discount") || t.includes("cashback")) return Percent;
  return Sparkles;
};

const typeColor = (t?: string) => {
  if (t === "free") return "bg-green-600";
  if (t === "discount") return "bg-orange-500";
  if (t === "cashback") return "bg-blue-600";
  if (t === "bundle") return "bg-purple-600";
  return "bg-primary";
};

export default function Offers() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(false);
  const [updated, setUpdated] = useState<string>("");
  const [store, setStore] = useState("all");
  const [q, setQ] = useState("");

  const load = async (s: string = store) => {
    setLoading(true);
    try {
      const cacheKey = `offers-bd-${s}`;
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const { ts, data } = JSON.parse(cached);
        if (Date.now() - ts < 1000 * 60 * 60 * 3) {
          setOffers(data.offers || []);
          setUpdated(data.updated || "");
          setLoading(false);
          return;
        }
      }
      const { data, error } = await supabase.functions.invoke("offers-bd", { body: { store: s } });
      if (error) throw error;
      setOffers(data.offers || []);
      setUpdated(data.updated || new Date().toLocaleDateString("bn-BD"));
      localStorage.setItem(cacheKey, JSON.stringify({ ts: Date.now(), data }));
    } catch (e: any) {
      toast.error(e.message || "অফার লোড করতে সমস্যা");
    } finally {
      setLoading(false);
    }
  };

  const refresh = async () => {
    localStorage.removeItem(`offers-bd-${store}`);
    await load(store);
    toast.success("অফার আপডেট হয়েছে");
  };

  useEffect(() => { load(store); /* eslint-disable-next-line */ }, [store]);

  const filtered = useMemo(() => {
    if (!q.trim()) return offers;
    const k = q.toLowerCase();
    return offers.filter(o =>
      [o.title_bn, o.details_bn, o.product, o.category, o.store, o.coupon]
        .filter(Boolean).some(v => v!.toString().toLowerCase().includes(k))
    );
  }, [offers, q]);

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`কপি হয়েছে: ${text}`);
  };

  return (
    <div className="container py-6 space-y-5 max-w-6xl">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <ShoppingBag className="h-7 w-7" /> অফার ও ডিসকাউন্ট
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            বাংলাদেশের চলমান সুপারমার্কেট, ই-কমার্স ও গ্রোসারি অফার {updated && `• আপডেট: ${updated}`}
          </p>
        </div>
        <Button onClick={refresh} disabled={loading} variant="outline" size="sm">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-1" />}
          রিফ্রেশ
        </Button>
      </div>

      <Card>
        <CardContent className="pt-4 flex gap-2 flex-col sm:flex-row">
          <Select value={store} onValueChange={setStore}>
            <SelectTrigger className="sm:w-56"><SelectValue /></SelectTrigger>
            <SelectContent>
              {STORES.map(s => (
                <SelectItem key={s} value={s}>{s === "all" ? "সব স্টোর" : s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            placeholder="অফার খুঁজুন... (যেমন: চাল, তেল, ডাল, ফ্রি)"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="flex-1"
          />
        </CardContent>
      </Card>

      {loading && (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <Card><CardContent className="py-12 text-center text-sm text-muted-foreground">কোন অফার পাওয়া যায়নি।</CardContent></Card>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((o, i) => {
          const Icon = typeIcon(o.type);
          return (
            <Card key={i} className="overflow-hidden hover:shadow-md transition">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <Badge className={typeColor(o.type)}>
                    <Icon className="h-3 w-3 mr-1" />
                    {o.type === "free" ? "ফ্রি" : o.type === "discount" ? "ডিসকাউন্ট" : o.type === "cashback" ? "ক্যাশব্যাক" : o.type === "bundle" ? "বান্ডেল" : "অফার"}
                  </Badge>
                  {o.discount_pct ? (
                    <Badge variant="destructive">-{o.discount_pct}%</Badge>
                  ) : null}
                </div>
                <div className="font-semibold text-base">{o.title_bn || o.product}</div>
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <ShoppingBag className="h-3 w-3" />
                  <span className="font-medium">{o.store}</span>
                  {o.category && <span>• {o.category}</span>}
                </div>
                {o.details_bn && <p className="text-sm">{o.details_bn}</p>}
                {(o.offer_price || o.original_price) && (
                  <div className="flex items-baseline gap-2">
                    {o.offer_price && <span className="text-lg font-bold text-primary">৳{o.offer_price}</span>}
                    {o.original_price && o.original_price !== o.offer_price && (
                      <span className="text-xs line-through text-muted-foreground">৳{o.original_price}</span>
                    )}
                  </div>
                )}
                {o.coupon && (
                  <button
                    onClick={() => copy(o.coupon!)}
                    className="flex items-center gap-1 text-xs bg-muted px-2 py-1 rounded border border-dashed hover:bg-muted/70 w-full justify-center"
                  >
                    <Copy className="h-3 w-3" /> কুপন: <span className="font-mono font-bold">{o.coupon}</span>
                  </button>
                )}
                <div className="flex items-center justify-between pt-1">
                  {o.valid_till && <span className="text-[11px] text-muted-foreground">⏳ {o.valid_till}</span>}
                  {o.link && (
                    <Button asChild size="sm" variant="ghost" className="h-7 ml-auto">
                      <a href={o.link} target="_blank" rel="noopener noreferrer">
                        দেখুন <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <p className="text-[11px] text-muted-foreground text-center pt-4">
        ⚠️ অফার AI-জেনারেটেড — কেনার আগে সংশ্লিষ্ট স্টোরে দাম ও ভ্যালিডিটি যাচাই করুন।
      </p>
    </div>
  );
}
