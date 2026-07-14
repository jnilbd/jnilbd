import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  Package, Plus, ArrowDownToLine, ArrowUpFromLine, Undo2, RotateCcw,
  AlertTriangle, Trash2, History, Boxes, Building2, Truck, UserRound,
  Factory, ShoppingBag, XCircle, Wallet, Phone, Search,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type Product = {
  id: string;
  user_id: string;
  name: string;
  sku: string | null;
  unit: string;
  purchase_price: number;
  sell_price: number;
  current_stock: number;
  low_stock_threshold: number;
  scope: string;
  note: string | null;
};

type MvType = "stock_in" | "stock_out" | "customer_return" | "supplier_return" | "damage" | "sale";
type MvLocation = "office" | "with_me" | "courier" | "with_person" | "supplier" | "customer" | "damaged";
type MvStatus = "completed" | "in_transit" | "pending" | "returned" | "cancelled";

export type Movement = {
  id: string;
  product_id: string;
  type: MvType;
  qty: number;
  unit_price: number;
  amount_paid: number;
  note: string | null;
  occurred_at: string;
  location: MvLocation | null;
  party_name: string | null;
  party_phone: string | null;
  courier_name: string | null;
  tracking_no: string | null;
  status: MvStatus;
};

const MV_META: Record<MvType, { bn: string; en: string; icon: any; tone: string; sign: 1 | -1; defaultLoc: MvLocation }> = {
  stock_in:        { bn: "স্টক ইন",           en: "Stock In",        icon: ArrowDownToLine, tone: "text-emerald-600 bg-emerald-500/10", sign: 1,  defaultLoc: "office" },
  stock_out:       { bn: "স্টক আউট",          en: "Stock Out",       icon: ArrowUpFromLine, tone: "text-rose-600 bg-rose-500/10",       sign: -1, defaultLoc: "with_me" },
  customer_return: { bn: "কাস্টমার রিটার্ন",   en: "Customer Return", icon: Undo2,           tone: "text-sky-600 bg-sky-500/10",         sign: 1,  defaultLoc: "office" },
  supplier_return: { bn: "সাপ্লায়ার রিটার্ন",  en: "Supplier Return", icon: RotateCcw,       tone: "text-amber-600 bg-amber-500/10",     sign: -1, defaultLoc: "supplier" },
  damage:          { bn: "ড্যামেজ",            en: "Damage",          icon: AlertTriangle,   tone: "text-red-600 bg-red-500/10",         sign: -1, defaultLoc: "damaged" },
  sale:            { bn: "বিক্রি",             en: "Sale",            icon: Package,         tone: "text-primary bg-primary/10",         sign: -1, defaultLoc: "customer" },
};

const LOC_META: Record<MvLocation, { bn: string; en: string; icon: any; tone: string }> = {
  office:      { bn: "অফিসে",         en: "At Office",     icon: Building2,   tone: "text-emerald-700 bg-emerald-500/10 border-emerald-500/30" },
  with_me:     { bn: "আমার কাছে",     en: "With Me",       icon: UserRound,   tone: "text-indigo-700 bg-indigo-500/10 border-indigo-500/30" },
  courier:     { bn: "কুরিয়ারে",      en: "In Courier",    icon: Truck,       tone: "text-amber-700 bg-amber-500/10 border-amber-500/30" },
  with_person: { bn: "ব্যক্তির কাছে",  en: "With Person",   icon: UserRound,   tone: "text-violet-700 bg-violet-500/10 border-violet-500/30" },
  supplier:    { bn: "সাপ্লায়ারে",    en: "To Supplier",   icon: Factory,     tone: "text-orange-700 bg-orange-500/10 border-orange-500/30" },
  customer:    { bn: "কাস্টমারে",      en: "To Customer",   icon: ShoppingBag, tone: "text-sky-700 bg-sky-500/10 border-sky-500/30" },
  damaged:     { bn: "নষ্ট",           en: "Damaged",       icon: XCircle,     tone: "text-red-700 bg-red-500/10 border-red-500/30" },
};

const STATUS_META: Record<MvStatus, { bn: string; en: string; tone: string }> = {
  completed:  { bn: "সম্পন্ন",     en: "Completed",  tone: "bg-emerald-500/15 text-emerald-700" },
  in_transit: { bn: "চলছে",       en: "In Transit", tone: "bg-amber-500/15 text-amber-700" },
  pending:    { bn: "বাকি",       en: "Pending",    tone: "bg-orange-500/15 text-orange-700" },
  returned:   { bn: "ফেরত",       en: "Returned",   tone: "bg-sky-500/15 text-sky-700" },
  cancelled:  { bn: "বাতিল",      en: "Cancelled",  tone: "bg-muted text-muted-foreground" },
};

const fmtBDT = (n: number, bn: boolean) =>
  new Intl.NumberFormat(bn ? "bn-BD" : "en-BD", { style: "currency", currency: "BDT", maximumFractionDigits: 0 }).format(n || 0);

export function InventoryTab({ userId, bn }: { userId: string; bn: boolean }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({
    name: "", sku: "", unit: "pcs", purchase_price: "", sell_price: "",
    low_stock_threshold: "5", opening_stock: "0", note: "",
  });

  const [mvSheet, setMvSheet] = useState<{ product: Product; type: MvType; editingId?: string } | null>(null);
  const [mvForm, setMvForm] = useState({
    qty: "", unit_price: "", amount_paid: "", note: "",
    location: "office" as MvLocation, party_name: "", party_phone: "",
    courier_name: "", tracking_no: "", status: "completed" as MvStatus,
  });

  const [historyOf, setHistoryOf] = useState<Product | null>(null);
  const [locSheet, setLocSheet] = useState<MvLocation | null>(null);

  async function loadAll() {
    setLoading(true);
    const [{ data: p }, { data: m }] = await Promise.all([
      supabase.from("inventory_products").select("*").order("name"),
      supabase.from("inventory_movements").select("*").order("occurred_at", { ascending: false }).limit(1000),
    ]);
    setProducts((p ?? []) as Product[]);
    setMovements((m ?? []) as Movement[]);
    setLoading(false);
  }
  useEffect(() => { loadAll(); }, []);

  // ---------- Aggregate breakdowns ----------
  const breakdown = useMemo(() => {
    // Show CURRENT position per location:
    //  - office comes from products.current_stock (already reflects returns via triggers)
    //  - every other location is: cumulative outbound qty tagged to that location,
    //    excluding cancelled/returned entries.
    const perLoc: Record<MvLocation, number> = {
      office: 0, with_me: 0, courier: 0, with_person: 0, supplier: 0, customer: 0, damaged: 0,
    };
    let receivable = 0;
    let inTransitValue = 0;
    let pendingCount = 0;

    for (const m of movements) {
      const meta = MV_META[m.type];
      if (meta.sign === -1 && m.location && m.status !== "cancelled" && m.status !== "returned") {
        // For transit locations (courier / with_person) only count items still in motion.
        // Once "completed" they've been delivered — remove from that bucket.
        const inTransitLoc = m.location === "courier" || m.location === "with_person";
        if (!inTransitLoc || m.status === "in_transit" || m.status === "pending") {
          perLoc[m.location] += Number(m.qty);
        }
      }
      if ((m.type === "sale" || m.type === "stock_out") && m.status !== "cancelled" && m.status !== "returned") {
        const due = Number(m.qty) * Number(m.unit_price) - Number(m.amount_paid || 0);
        if (due > 0) receivable += due;
      }
      if (m.status === "in_transit") inTransitValue += Number(m.qty) * Number(m.unit_price);
      if (m.status === "pending") pendingCount++;
    }
    perLoc.office = products.reduce((s, p) => s + Number(p.current_stock), 0);
    return { perLoc, receivable, inTransitValue, pendingCount };
  }, [movements, products]);

  const totals = useMemo(() => {
    let stockValue = 0, low = 0, items = 0;
    for (const p of products) {
      stockValue += Number(p.current_stock) * Number(p.sell_price);
      items += Number(p.current_stock);
      if (Number(p.current_stock) <= Number(p.low_stock_threshold)) low++;
    }
    return { stockValue, low, items, count: products.length };
  }, [products]);

  const filteredProducts = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter(p =>
      p.name.toLowerCase().includes(q) || (p.sku ?? "").toLowerCase().includes(q)
    );
  }, [products, query]);

  async function addProduct() {
    if (!form.name.trim()) { toast.error(bn ? "নাম দিন" : "Name required"); return; }
    const stock = Number(form.opening_stock) || 0;
    const { data, error } = await supabase.from("inventory_products").insert({
      user_id: userId,
      name: form.name.trim(),
      sku: form.sku.trim() || null,
      unit: form.unit || "pcs",
      purchase_price: Number(form.purchase_price) || 0,
      sell_price: Number(form.sell_price) || 0,
      low_stock_threshold: Number(form.low_stock_threshold) || 0,
      current_stock: 0,
      note: form.note.trim() || null,
    }).select().single();
    if (error) { toast.error(error.message); return; }
    if (stock > 0 && data) {
      await supabase.from("inventory_movements").insert({
        user_id: userId, product_id: data.id, type: "stock_in", qty: stock,
        unit_price: Number(form.purchase_price) || 0, location: "office", status: "completed",
        note: bn ? "প্রারম্ভিক স্টক" : "Opening stock",
      });
    }
    toast.success(bn ? "পণ্য যোগ হয়েছে" : "Product added");
    setForm({ name: "", sku: "", unit: "pcs", purchase_price: "", sell_price: "", low_stock_threshold: "5", opening_stock: "0", note: "" });
    setAddOpen(false);
    loadAll();
  }

  function openMv(product: Product, type: MvType) {
    const meta = MV_META[type];
    setMvSheet({ product, type });
    setMvForm({
      qty: "",
      unit_price: String(type === "sale" ? product.sell_price : product.purchase_price),
      amount_paid: "",
      note: "",
      location: meta.defaultLoc,
      party_name: "",
      party_phone: "",
      courier_name: "",
      tracking_no: "",
      status: meta.sign === -1 && (meta.defaultLoc === "courier" || meta.defaultLoc === "with_person") ? "in_transit" : "completed",
    });
  }

  function openEditMv(product: Product, m: Movement) {
    setMvSheet({ product, type: m.type, editingId: m.id });
    setMvForm({
      qty: String(m.qty),
      unit_price: String(m.unit_price ?? 0),
      amount_paid: String(m.amount_paid ?? 0),
      note: m.note ?? "",
      location: (m.location ?? MV_META[m.type].defaultLoc) as MvLocation,
      party_name: m.party_name ?? "",
      party_phone: m.party_phone ?? "",
      courier_name: m.courier_name ?? "",
      tracking_no: m.tracking_no ?? "",
      status: m.status,
    });
  }

  async function submitMovement() {
    if (!mvSheet) return;
    const qty = Number(mvForm.qty);
    if (!qty || qty <= 0) { toast.error(bn ? "সঠিক পরিমাণ দিন" : "Enter valid qty"); return; }
    const payload = {
      qty,
      unit_price: Number(mvForm.unit_price) || 0,
      amount_paid: Number(mvForm.amount_paid) || 0,
      note: mvForm.note.trim() || null,
      location: mvForm.location,
      party_name: mvForm.party_name.trim() || null,
      party_phone: mvForm.party_phone.trim() || null,
      courier_name: mvForm.courier_name.trim() || null,
      tracking_no: mvForm.tracking_no.trim() || null,
      status: mvForm.status,
    };
    const res = mvSheet.editingId
      ? await supabase.from("inventory_movements").update(payload).eq("id", mvSheet.editingId)
      : await supabase.from("inventory_movements").insert({
          user_id: userId,
          product_id: mvSheet.product.id,
          type: mvSheet.type,
          ...payload,
        });
    if (res.error) { toast.error(res.error.message); return; }
    toast.success(bn ? "সংরক্ষিত" : "Saved");
    setMvSheet(null);
    loadAll();
  }

  async function updateMvStatus(m: Movement, status: MvStatus, extraPaid = 0) {
    const patch: any = { status };
    if (extraPaid > 0) patch.amount_paid = Number(m.amount_paid || 0) + extraPaid;
    const { error } = await supabase.from("inventory_movements").update(patch).eq("id", m.id);
    if (error) { toast.error(error.message); return; }
    toast.success(bn ? "আপডেট হয়েছে" : "Updated");
    loadAll();
  }

  async function deleteProduct(p: Product) {
    if (!confirm(bn ? `"${p.name}" মুছে ফেলবেন?` : `Delete "${p.name}"?`)) return;
    const { error } = await supabase.from("inventory_products").delete().eq("id", p.id);
    if (error) { toast.error(error.message); return; }
    toast.success(bn ? "মুছে ফেলা হয়েছে" : "Deleted");
    loadAll();
  }

  async function deleteMovement(m: Movement) {
    if (!confirm(bn ? "এই এন্ট্রি মুছবেন?" : "Delete this entry?")) return;
    const { error } = await supabase.from("inventory_movements").delete().eq("id", m.id);
    if (error) { toast.error(error.message); return; }
    loadAll();
  }

  const historyList = useMemo(
    () => historyOf ? movements.filter(m => m.product_id === historyOf.id) : [],
    [historyOf, movements]
  );

  const needsLocation = mvSheet && MV_META[mvSheet.type].sign === -1;
  const needsCourier = mvForm.location === "courier";
  const needsParty = mvForm.location === "with_person" || mvForm.location === "customer" || mvForm.location === "supplier";
  const needsPayment = mvSheet && (mvSheet.type === "sale" || mvSheet.type === "stock_out");

  return (
    <div className="space-y-4">
      {/* Top summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-3 bg-gradient-to-br from-primary/10 to-background border-border/60">
          <p className="text-xs text-muted-foreground">{bn ? "স্টকের মূল্য" : "Stock Value"}</p>
          <p className="text-lg font-semibold tabular-nums">{fmtBDT(totals.stockValue, bn)}</p>
        </Card>
        <Card className="p-3">
          <p className="text-xs text-muted-foreground">{bn ? "মোট পণ্য" : "Products"}</p>
          <p className="text-lg font-semibold tabular-nums">{bn ? totals.count.toLocaleString("bn-BD") : totals.count}</p>
        </Card>
        <Card className="p-3">
          <p className="text-xs text-muted-foreground">{bn ? "মোট ইউনিট (অফিসে)" : "Units (Office)"}</p>
          <p className="text-lg font-semibold tabular-nums">{bn ? totals.items.toLocaleString("bn-BD") : totals.items}</p>
        </Card>
        <Card className={cn("p-3", totals.low > 0 && "bg-red-500/10 border-red-500/40")}>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" /> {bn ? "কম স্টক" : "Low Stock"}
          </p>
          <p className="text-lg font-semibold tabular-nums">{bn ? totals.low.toLocaleString("bn-BD") : totals.low}</p>
        </Card>
      </div>

      {/* Location breakdown — where the stock is right now */}
      <Card className="p-3 border-border/60">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium flex items-center gap-2">
            <Truck className="h-4 w-4" /> {bn ? "স্টক এখন কোথায়" : "Where the Stock Is Now"}
          </h3>
          <div className="flex items-center gap-2 text-[11px]">
            <span className="rounded-full px-2 py-0.5 bg-orange-500/10 text-orange-700 font-medium">
              {bn ? "পাওয়া বাকি" : "Receivable"}: <b className="tabular-nums">{fmtBDT(breakdown.receivable, bn)}</b>
            </span>
          </div>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {(Object.keys(LOC_META) as MvLocation[]).map(loc => {
            const L = LOC_META[loc];
            const qty = breakdown.perLoc[loc];
            return (
              <button
                type="button"
                key={loc}
                onClick={() => setLocSheet(loc)}
                className={cn(
                  "rounded-xl border p-2 flex flex-col items-center text-center transition hover:scale-[1.03] hover:shadow-md active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary/40",
                  L.tone
                )}
                title={bn ? "বিস্তারিত ও এডিট" : "View & edit"}
              >
                <L.icon className="h-4 w-4 mb-1" />
                <p className="text-[10px] leading-tight">{bn ? L.bn : L.en}</p>
                <p className="text-lg font-bold tabular-nums leading-tight">{bn ? qty.toLocaleString("bn-BD") : qty}</p>
                <p className="text-[9px] opacity-70 mt-0.5">{bn ? "ট্যাপ করুন" : "Tap to edit"}</p>
              </button>
            );
          })}
        </div>
        {(breakdown.pendingCount > 0 || breakdown.inTransitValue > 0) && (
          <div className="flex flex-wrap gap-2 mt-2 text-[11px]">
            {breakdown.inTransitValue > 0 && (
              <span className="rounded-full px-2 py-0.5 bg-amber-500/10 text-amber-700">
                {bn ? "ট্রানজিটে" : "In transit"}: <b>{fmtBDT(breakdown.inTransitValue, bn)}</b>
              </span>
            )}
            {breakdown.pendingCount > 0 && (
              <span className="rounded-full px-2 py-0.5 bg-orange-500/10 text-orange-700">
                {bn ? "বাকি এন্ট্রি" : "Pending entries"}: <b>{breakdown.pendingCount}</b>
              </span>
            )}
          </div>
        )}
      </Card>

      {/* Header actions */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={query} onChange={e => setQuery(e.target.value)}
            placeholder={bn ? "পণ্য খুঁজুন..." : "Search products..."}
            className="pl-8 h-9"
          />
        </div>
        <Button onClick={() => setAddOpen(true)} size="sm" className="h-9 rounded-xl shrink-0">
          <Plus className="h-4 w-4 mr-1" /> {bn ? "নতুন" : "New"}
        </Button>
      </div>

      {/* Products grid */}
      {loading ? (
        <div className="text-center py-8 text-sm text-muted-foreground">{bn ? "লোড হচ্ছে..." : "Loading..."}</div>
      ) : filteredProducts.length === 0 ? (
        <Card className="p-8 text-center text-sm text-muted-foreground">
          <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
          {bn ? "কোনো পণ্য নেই" : "No products"}
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredProducts.map(p => {
            const low = Number(p.current_stock) <= Number(p.low_stock_threshold);
            const pmoves = movements.filter(m => m.product_id === p.id);
            const locSum = (loc: MvLocation) =>
              pmoves.filter(m => m.location === loc && MV_META[m.type].sign === -1 && m.status !== "cancelled" && m.status !== "returned")
                    .reduce((s, m) => s + Number(m.qty), 0);
            const due = pmoves.filter(m => (m.type === "sale" || m.type === "stock_out") && m.status !== "cancelled" && m.status !== "returned")
              .reduce((s, m) => s + Math.max(0, Number(m.qty) * Number(m.unit_price) - Number(m.amount_paid || 0)), 0);

            return (
              <Card key={p.id} className={cn("p-4 border-border/60 space-y-3", low && "border-red-500/40 bg-red-500/5")}>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-medium truncate">{p.name}</p>
                    {p.sku && <p className="text-[11px] text-muted-foreground">SKU: {p.sku}</p>}
                  </div>
                  <button onClick={() => deleteProduct(p)} className="text-muted-foreground hover:text-destructive p-1">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="flex items-baseline justify-between">
                  <div>
                    <p className="text-[10px] text-muted-foreground">{bn ? "অফিসে স্টক" : "Office Stock"}</p>
                    <p className={cn("text-2xl font-bold tabular-nums", low ? "text-red-600" : "text-foreground")}>
                      {bn ? Number(p.current_stock).toLocaleString("bn-BD") : Number(p.current_stock)}
                      <span className="text-xs font-normal text-muted-foreground ml-1">{p.unit}</span>
                    </p>
                  </div>
                  {low && (
                    <Badge variant="destructive" className="text-[10px]">
                      <AlertTriangle className="h-3 w-3 mr-1" /> {bn ? "কম" : "Low"}
                    </Badge>
                  )}
                </div>

                {/* per-product breakdown chips — all non-office destinations */}
                <div className="flex flex-wrap gap-1 text-[10px]">
                  {(["with_me","with_person","courier","customer","supplier","damaged"] as MvLocation[]).map(loc => {
                    const n = locSum(loc);
                    if (n <= 0) return null;
                    const L = LOC_META[loc];
                    return (
                      <span key={loc} className={cn("rounded-full px-1.5 py-0.5 border flex items-center gap-1", L.tone)}>
                        <L.icon className="h-3 w-3" /> {bn ? L.bn : L.en}: <b>{n}</b>
                      </span>
                    );
                  })}
                  {due > 0 && (
                    <span className="rounded-full px-1.5 py-0.5 bg-orange-500/10 text-orange-700 flex items-center gap-1">
                      <Wallet className="h-3 w-3" /> {bn ? "বাকি" : "Due"}: <b>{fmtBDT(due, bn)}</b>
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="rounded-lg bg-muted/50 px-2 py-1">
                    <span className="text-muted-foreground">{bn ? "কেনা" : "Buy"}: </span>
                    <b>{fmtBDT(Number(p.purchase_price), bn)}</b>
                  </div>
                  <div className="rounded-lg bg-muted/50 px-2 py-1">
                    <span className="text-muted-foreground">{bn ? "বিক্রি" : "Sell"}: </span>
                    <b>{fmtBDT(Number(p.sell_price), bn)}</b>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-1">
                  {(Object.keys(MV_META) as MvType[]).map(t => {
                    const M = MV_META[t];
                    return (
                      <button
                        key={t}
                        onClick={() => openMv(p, t)}
                        className={cn("rounded-lg p-1.5 flex flex-col items-center gap-0.5 hover:scale-105 transition-transform", M.tone)}
                        title={bn ? M.bn : M.en}
                      >
                        <M.icon className="h-3.5 w-3.5" />
                        <span className="text-[9px] leading-tight text-center">{bn ? M.bn : M.en}</span>
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => setHistoryOf(p)}
                  className="w-full text-[11px] text-muted-foreground hover:text-primary flex items-center justify-center gap-1 pt-1 border-t border-border/40"
                >
                  <History className="h-3 w-3" /> {bn ? "বিস্তারিত ইতিহাস" : "Detailed History"} ({pmoves.length})
                </button>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add Product Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{bn ? "নতুন পণ্য" : "New Product"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs">{bn ? "পণ্যের নাম" : "Product name"} *</Label>
              <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder={bn ? "যেমন: চাল ১ কেজি" : "e.g. Rice 1kg"} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">SKU</Label>
                <Input value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} placeholder="OPTIONAL" />
              </div>
              <div>
                <Label className="text-xs">{bn ? "একক" : "Unit"}</Label>
                <Input value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} placeholder="pcs / kg / ltr" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">{bn ? "কেনা দাম" : "Purchase price"}</Label>
                <Input type="number" inputMode="decimal" value={form.purchase_price} onChange={e => setForm({ ...form, purchase_price: e.target.value })} />
              </div>
              <div>
                <Label className="text-xs">{bn ? "বিক্রয় দাম" : "Sell price"}</Label>
                <Input type="number" inputMode="decimal" value={form.sell_price} onChange={e => setForm({ ...form, sell_price: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">{bn ? "প্রারম্ভিক স্টক" : "Opening stock"}</Label>
                <Input type="number" inputMode="decimal" value={form.opening_stock} onChange={e => setForm({ ...form, opening_stock: e.target.value })} />
              </div>
              <div>
                <Label className="text-xs">{bn ? "কম স্টক সীমা" : "Low stock at"}</Label>
                <Input type="number" inputMode="decimal" value={form.low_stock_threshold} onChange={e => setForm({ ...form, low_stock_threshold: e.target.value })} />
              </div>
            </div>
            <div>
              <Label className="text-xs">{bn ? "নোট" : "Note"}</Label>
              <Textarea rows={2} value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setAddOpen(false)}>{bn ? "বাতিল" : "Cancel"}</Button>
            <Button onClick={addProduct}>{bn ? "সংরক্ষণ" : "Save"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Movement Sheet — richer form */}
      <Sheet open={!!mvSheet} onOpenChange={(o) => !o && setMvSheet(null)}>
        <SheetContent side="bottom" className="rounded-t-2xl max-h-[92vh] overflow-y-auto">
          {mvSheet && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  {(() => { const I = MV_META[mvSheet.type].icon; return <I className="h-4 w-4" />; })()}
                  {bn ? MV_META[mvSheet.type].bn : MV_META[mvSheet.type].en} — <span className="text-muted-foreground text-sm">{mvSheet.product.name}</span>
                </SheetTitle>
              </SheetHeader>
              <div className="space-y-3 mt-4 max-w-lg mx-auto pb-6">
                <div className="text-xs text-muted-foreground">
                  {bn ? "বর্তমান অফিস স্টক" : "Current office stock"}: <b className="text-foreground">{Number(mvSheet.product.current_stock)} {mvSheet.product.unit}</b>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">{bn ? "পরিমাণ" : "Quantity"} *</Label>
                    <Input type="number" inputMode="decimal" value={mvForm.qty} onChange={e => setMvForm({ ...mvForm, qty: e.target.value })} autoFocus />
                  </div>
                  <div>
                    <Label className="text-xs">{bn ? "একক দাম" : "Unit price"}</Label>
                    <Input type="number" inputMode="decimal" value={mvForm.unit_price} onChange={e => setMvForm({ ...mvForm, unit_price: e.target.value })} />
                  </div>
                </div>

                {needsLocation && (
                  <div>
                    <Label className="text-xs">{bn ? "এখন কোথায় আছে" : "Where is it now"}</Label>
                    <Select value={mvForm.location} onValueChange={(v) => setMvForm({ ...mvForm, location: v as MvLocation })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {(Object.keys(LOC_META) as MvLocation[]).map(l => (
                          <SelectItem key={l} value={l}>{bn ? LOC_META[l].bn : LOC_META[l].en}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {needsCourier && (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs">{bn ? "কুরিয়ার" : "Courier"}</Label>
                      <Input value={mvForm.courier_name} onChange={e => setMvForm({ ...mvForm, courier_name: e.target.value })} placeholder="Steadfast / RedX / Pathao" />
                    </div>
                    <div>
                      <Label className="text-xs">{bn ? "ট্র্যাকিং" : "Tracking #"}</Label>
                      <Input value={mvForm.tracking_no} onChange={e => setMvForm({ ...mvForm, tracking_no: e.target.value })} />
                    </div>
                  </div>
                )}

                {needsParty && (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs">{bn ? "কার কাছে / নাম" : "Name"}</Label>
                      <Input value={mvForm.party_name} onChange={e => setMvForm({ ...mvForm, party_name: e.target.value })} />
                    </div>
                    <div>
                      <Label className="text-xs">{bn ? "ফোন" : "Phone"}</Label>
                      <Input value={mvForm.party_phone} onChange={e => setMvForm({ ...mvForm, party_phone: e.target.value })} placeholder="01…" />
                    </div>
                  </div>
                )}

                {needsPayment && (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs">{bn ? "পেমেন্ট পাওয়া গেছে" : "Amount received"}</Label>
                      <Input type="number" inputMode="decimal" value={mvForm.amount_paid} onChange={e => setMvForm({ ...mvForm, amount_paid: e.target.value })} placeholder="0" />
                    </div>
                    <div>
                      <Label className="text-xs">{bn ? "মোট" : "Total"}</Label>
                      <div className="h-10 rounded-md border border-input bg-muted/30 px-3 flex items-center text-sm font-medium tabular-nums">
                        {fmtBDT((Number(mvForm.qty) || 0) * (Number(mvForm.unit_price) || 0), bn)}
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <Label className="text-xs">{bn ? "স্ট্যাটাস" : "Status"}</Label>
                  <Select value={mvForm.status} onValueChange={(v) => setMvForm({ ...mvForm, status: v as MvStatus })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {(Object.keys(STATUS_META) as MvStatus[]).map(s => (
                        <SelectItem key={s} value={s}>{bn ? STATUS_META[s].bn : STATUS_META[s].en}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs">{bn ? "নোট" : "Note"}</Label>
                  <Textarea rows={2} value={mvForm.note} onChange={e => setMvForm({ ...mvForm, note: e.target.value })} />
                </div>

                <Button className="w-full h-11" onClick={submitMovement}>{bn ? "সংরক্ষণ" : "Save"}</Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* History Sheet — detailed */}
      <Sheet open={!!historyOf} onOpenChange={(o) => !o && setHistoryOf(null)}>
        <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
          {historyOf && (
            <>
              <SheetHeader>
                <SheetTitle>{historyOf.name} — {bn ? "বিস্তারিত ইতিহাস" : "Detailed History"}</SheetTitle>
              </SheetHeader>
              <div className="mt-4 space-y-2 pb-6">
                {historyList.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">{bn ? "কোনো এন্ট্রি নেই" : "No movements yet"}</p>
                ) : historyList.map(m => {
                  const M = MV_META[m.type];
                  const L = m.location ? LOC_META[m.location] : null;
                  const S = STATUS_META[m.status];
                  const total = Number(m.qty) * Number(m.unit_price);
                  const paid = Number(m.amount_paid || 0);
                  const due = Math.max(0, total - paid);
                  const isMoney = m.type === "sale" || m.type === "stock_out";
                  return (
                    <div key={m.id} className="p-3 rounded-xl border border-border/60 space-y-2">
                      <div className="flex items-start gap-2">
                        <div className={cn("h-8 w-8 rounded-lg grid place-items-center shrink-0", M.tone)}>
                          <M.icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <p className="text-sm font-medium">{bn ? M.bn : M.en}</p>
                            <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full", S.tone)}>{bn ? S.bn : S.en}</span>
                            {L && (
                              <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full border flex items-center gap-1", L.tone)}>
                                <L.icon className="h-2.5 w-2.5" />{bn ? L.bn : L.en}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-muted-foreground">
                            {new Date(m.occurred_at).toLocaleString(bn ? "bn-BD" : "en-BD", { dateStyle: "medium", timeStyle: "short" })}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className={cn("font-semibold tabular-nums", M.sign > 0 ? "text-emerald-600" : "text-rose-600")}>
                            {M.sign > 0 ? "+" : "−"}{Number(m.qty)} {historyOf.unit}
                          </p>
                          {m.unit_price > 0 && <p className="text-[10px] text-muted-foreground">@ {fmtBDT(m.unit_price, bn)}</p>}
                        </div>
                      </div>

                      {(m.party_name || m.party_phone || m.courier_name || m.tracking_no) && (
                        <div className="flex flex-wrap gap-1 text-[11px] pl-10">
                          {m.party_name && (
                            <span className="rounded-md bg-muted px-1.5 py-0.5 flex items-center gap-1">
                              <UserRound className="h-3 w-3" />{m.party_name}
                            </span>
                          )}
                          {m.party_phone && (
                            <a href={`tel:${m.party_phone}`} className="rounded-md bg-muted px-1.5 py-0.5 flex items-center gap-1 hover:text-primary">
                              <Phone className="h-3 w-3" />{m.party_phone}
                            </a>
                          )}
                          {m.courier_name && (
                            <span className="rounded-md bg-muted px-1.5 py-0.5 flex items-center gap-1">
                              <Truck className="h-3 w-3" />{m.courier_name}{m.tracking_no ? ` · ${m.tracking_no}` : ""}
                            </span>
                          )}
                        </div>
                      )}

                      {isMoney && total > 0 && (
                        <div className="flex items-center justify-between gap-2 pl-10 text-[11px]">
                          <div className="flex gap-2">
                            <span>{bn ? "মোট" : "Total"}: <b className="tabular-nums">{fmtBDT(total, bn)}</b></span>
                            <span className="text-emerald-700">{bn ? "পেইড" : "Paid"}: <b className="tabular-nums">{fmtBDT(paid, bn)}</b></span>
                            {due > 0 && <span className="text-orange-700">{bn ? "বাকি" : "Due"}: <b className="tabular-nums">{fmtBDT(due, bn)}</b></span>}
                          </div>
                        </div>
                      )}

                      {m.note && <p className="text-[11px] text-muted-foreground pl-10">📝 {m.note}</p>}

                      {/* quick actions */}
                      <div className="flex gap-1 pl-10 flex-wrap">
                        <Button size="sm" variant="outline" className="h-6 text-[10px] px-2"
                          onClick={() => { openEditMv(historyOf!, m); }}>
                          {bn ? "এডিট" : "Edit"}
                        </Button>
                        {m.status !== "completed" && (
                          <Button size="sm" variant="outline" className="h-6 text-[10px] px-2"
                            onClick={() => updateMvStatus(m, "completed", due > 0 ? due : 0)}>
                            {bn ? "সম্পন্ন করো" : "Mark done"}
                          </Button>
                        )}
                        {isMoney && due > 0 && (
                          <Button size="sm" variant="outline" className="h-6 text-[10px] px-2"
                            onClick={() => { const v = prompt(bn ? "কত টাকা পেয়েছেন?" : "Amount received?"); const n = Number(v); if (n > 0) updateMvStatus(m, m.status, n); }}>
                            + {bn ? "পেমেন্ট" : "Payment"}
                          </Button>
                        )}
                        <Button size="sm" variant="ghost" className="h-6 text-[10px] px-2 text-destructive hover:text-destructive"
                          onClick={() => deleteMovement(m)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Per-location editor: shows all movements sitting at this location and lets you
          change their status (in transit / delivered / returned / pending / cancelled).
          The location counter above updates automatically from these statuses. */}
      <Dialog open={!!locSheet} onOpenChange={(o) => !o && setLocSheet(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {locSheet && (() => {
            const L = LOC_META[locSheet];
            const items = movements
              .filter(m => MV_META[m.type].sign === -1 && m.location === locSheet && m.status !== "cancelled" && m.status !== "returned")
              .map(m => ({ ...m, product: products.find(p => p.id === m.product_id) }));
            const isTransit = locSheet === "courier" || locSheet === "with_person";
            return (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <L.icon className="h-5 w-5" />
                    {bn ? L.bn : L.en}
                    <Badge variant="outline" className="ml-1">{items.length}</Badge>
                  </DialogTitle>
                </DialogHeader>
                {items.length === 0 ? (
                  <div className="py-10 text-center text-sm text-muted-foreground">
                    {bn ? "এই লোকেশনে কিছু নেই।" : "Nothing at this location."}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-[11px] text-muted-foreground">
                      {isTransit
                        ? (bn ? "স্ট্যাটাস পরিবর্তন করলেই কাউন্টার অটো আপডেট হবে। 'সম্পন্ন' করলে এখান থেকে সরে যাবে।" : "Change status to auto-update the counter. Marking 'Completed' removes it from this bucket.")
                        : (bn ? "রিটার্ন/বাতিল করলে কাউন্টার থেকে সরে যাবে।" : "Returned / cancelled removes it from the counter.")}
                    </p>
                    {items.map(m => (
                      <div key={m.id} className="rounded-lg border p-2.5 flex items-start gap-2 flex-wrap">
                        <div className="flex-1 min-w-[180px]">
                          <p className="text-sm font-medium">{m.product?.name ?? "—"}</p>
                          <p className="text-[11px] text-muted-foreground">
                            {new Date(m.occurred_at).toLocaleDateString(bn ? "bn-BD" : "en-BD")}
                            {" · "}{bn ? m.qty.toLocaleString("bn-BD") : m.qty} {m.product?.unit ?? ""}
                            {m.party_name ? ` · ${m.party_name}` : ""}
                          </p>
                          {(m.courier_name || m.tracking_no) && (
                            <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                              <Truck className="h-3 w-3" />
                              {m.courier_name}{m.tracking_no ? ` · ${m.tracking_no}` : ""}
                            </p>
                          )}
                        </div>
                        <Select value={m.status} onValueChange={(v) => updateMvStatus(m, v as MvStatus)}>
                          <SelectTrigger className="h-8 w-[140px] text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {(Object.keys(STATUS_META) as MvStatus[]).map(s => (
                              <SelectItem key={s} value={s}>{bn ? STATUS_META[s].bn : STATUS_META[s].en}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-destructive"
                          onClick={() => deleteMovement(m)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                <DialogFooter>
                  <Button variant="outline" onClick={() => setLocSheet(null)}>
                    {bn ? "বন্ধ করুন" : "Close"}
                  </Button>
                </DialogFooter>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
