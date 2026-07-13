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
import { toast } from "sonner";
import {
  Package, Plus, ArrowDownToLine, ArrowUpFromLine, Undo2, RotateCcw,
  AlertTriangle, Trash2, History, Boxes,
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

export type Movement = {
  id: string;
  product_id: string;
  type: "stock_in" | "stock_out" | "customer_return" | "supplier_return" | "damage" | "sale";
  qty: number;
  unit_price: number;
  note: string | null;
  occurred_at: string;
};

const MV_META: Record<Movement["type"], { bn: string; en: string; icon: any; tone: string; sign: 1 | -1 }> = {
  stock_in:         { bn: "স্টক ইন",         en: "Stock In",         icon: ArrowDownToLine, tone: "text-emerald-600 bg-emerald-500/10", sign: 1 },
  stock_out:        { bn: "স্টক আউট",        en: "Stock Out",        icon: ArrowUpFromLine, tone: "text-rose-600 bg-rose-500/10",       sign: -1 },
  customer_return:  { bn: "কাস্টমার রিটার্ন", en: "Customer Return",  icon: Undo2,           tone: "text-sky-600 bg-sky-500/10",         sign: 1 },
  supplier_return:  { bn: "সাপ্লায়ার রিটার্ন", en: "Supplier Return",  icon: RotateCcw,       tone: "text-amber-600 bg-amber-500/10",     sign: -1 },
  damage:           { bn: "ড্যামেজ",         en: "Damage",           icon: AlertTriangle,   tone: "text-red-600 bg-red-500/10",         sign: -1 },
  sale:             { bn: "বিক্রি",           en: "Sale",             icon: Package,         tone: "text-primary bg-primary/10",         sign: -1 },
};

const fmtBDT = (n: number, bn: boolean) =>
  new Intl.NumberFormat(bn ? "bn-BD" : "en-BD", { style: "currency", currency: "BDT", maximumFractionDigits: 0 }).format(n || 0);

export function InventoryTab({ userId, bn }: { userId: string; bn: boolean }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(true);

  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({
    name: "", sku: "", unit: "pcs", purchase_price: "", sell_price: "",
    low_stock_threshold: "5", opening_stock: "0", note: "",
  });

  const [mvSheet, setMvSheet] = useState<{ product: Product; type: Movement["type"] } | null>(null);
  const [mvForm, setMvForm] = useState({ qty: "", unit_price: "", note: "" });

  const [historyOf, setHistoryOf] = useState<Product | null>(null);

  async function loadAll() {
    setLoading(true);
    const [{ data: p }, { data: m }] = await Promise.all([
      supabase.from("inventory_products").select("*").order("name"),
      supabase.from("inventory_movements").select("id,product_id,type,qty,unit_price,note,occurred_at").order("occurred_at", { ascending: false }).limit(500),
    ]);
    setProducts((p ?? []) as Product[]);
    setMovements((m ?? []) as Movement[]);
    setLoading(false);
  }
  useEffect(() => { loadAll(); }, []);

  const totals = useMemo(() => {
    let stockValue = 0, low = 0, items = 0;
    for (const p of products) {
      stockValue += Number(p.current_stock) * Number(p.sell_price);
      items += Number(p.current_stock);
      if (Number(p.current_stock) <= Number(p.low_stock_threshold)) low++;
    }
    return { stockValue, low, items, count: products.length };
  }, [products]);

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
        unit_price: Number(form.purchase_price) || 0, note: bn ? "প্রারম্ভিক স্টক" : "Opening stock",
      });
    }
    toast.success(bn ? "পণ্য যোগ হয়েছে" : "Product added");
    setForm({ name: "", sku: "", unit: "pcs", purchase_price: "", sell_price: "", low_stock_threshold: "5", opening_stock: "0", note: "" });
    setAddOpen(false);
    loadAll();
  }

  async function submitMovement() {
    if (!mvSheet) return;
    const qty = Number(mvForm.qty);
    if (!qty || qty <= 0) { toast.error(bn ? "সঠিক পরিমাণ দিন" : "Enter valid qty"); return; }
    const { error } = await supabase.from("inventory_movements").insert({
      user_id: userId,
      product_id: mvSheet.product.id,
      type: mvSheet.type,
      qty,
      unit_price: Number(mvForm.unit_price) || 0,
      note: mvForm.note.trim() || null,
    });
    if (error) { toast.error(error.message); return; }
    toast.success(bn ? "সংরক্ষিত" : "Saved");
    setMvSheet(null);
    setMvForm({ qty: "", unit_price: "", note: "" });
    loadAll();
  }

  async function deleteProduct(p: Product) {
    if (!confirm(bn ? `"${p.name}" মুছে ফেলবেন?` : `Delete "${p.name}"?`)) return;
    const { error } = await supabase.from("inventory_products").delete().eq("id", p.id);
    if (error) { toast.error(error.message); return; }
    toast.success(bn ? "মুছে ফেলা হয়েছে" : "Deleted");
    loadAll();
  }

  const historyList = useMemo(
    () => historyOf ? movements.filter(m => m.product_id === historyOf.id) : [],
    [historyOf, movements]
  );

  return (
    <div className="space-y-4">
      {/* Summary */}
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
          <p className="text-xs text-muted-foreground">{bn ? "মোট ইউনিট" : "Total Units"}</p>
          <p className="text-lg font-semibold tabular-nums">{bn ? totals.items.toLocaleString("bn-BD") : totals.items}</p>
        </Card>
        <Card className={cn("p-3", totals.low > 0 && "bg-red-500/10 border-red-500/40")}>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" /> {bn ? "কম স্টক" : "Low Stock"}
          </p>
          <p className="text-lg font-semibold tabular-nums">{bn ? totals.low.toLocaleString("bn-BD") : totals.low}</p>
        </Card>
      </div>

      {/* Header actions */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium flex items-center gap-2"><Boxes className="h-4 w-4" /> {bn ? "পণ্য তালিকা" : "Products"}</h3>
        <Button onClick={() => setAddOpen(true)} size="sm" className="h-9 rounded-xl">
          <Plus className="h-4 w-4 mr-1" /> {bn ? "নতুন পণ্য" : "New Product"}
        </Button>
      </div>

      {/* Products grid */}
      {loading ? (
        <div className="text-center py-8 text-sm text-muted-foreground">{bn ? "লোড হচ্ছে..." : "Loading..."}</div>
      ) : products.length === 0 ? (
        <Card className="p-8 text-center text-sm text-muted-foreground">
          <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
          {bn ? "এখনো কোনো পণ্য নেই" : "No products yet"}
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {products.map(p => {
            const low = Number(p.current_stock) <= Number(p.low_stock_threshold);
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
                    <p className="text-[10px] text-muted-foreground">{bn ? "বর্তমান স্টক" : "Current Stock"}</p>
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
                  {(["stock_in", "stock_out", "customer_return", "supplier_return", "damage", "sale"] as Movement["type"][]).map(t => {
                    const M = MV_META[t];
                    return (
                      <button
                        key={t}
                        onClick={() => { setMvSheet({ product: p, type: t }); setMvForm({ qty: "", unit_price: String(t === "sale" ? p.sell_price : p.purchase_price), note: "" }); }}
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
                  <History className="h-3 w-3" /> {bn ? "ইতিহাস দেখুন" : "View History"}
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

      {/* Movement Sheet */}
      <Sheet open={!!mvSheet} onOpenChange={(o) => !o && setMvSheet(null)}>
        <SheetContent side="bottom" className="rounded-t-2xl">
          {mvSheet && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  {(() => { const I = MV_META[mvSheet.type].icon; return <I className="h-4 w-4" />; })()}
                  {bn ? MV_META[mvSheet.type].bn : MV_META[mvSheet.type].en} — <span className="text-muted-foreground text-sm">{mvSheet.product.name}</span>
                </SheetTitle>
              </SheetHeader>
              <div className="space-y-3 mt-4 max-w-md mx-auto">
                <div className="text-xs text-muted-foreground">
                  {bn ? "বর্তমান স্টক" : "Current stock"}: <b className="text-foreground">{Number(mvSheet.product.current_stock)} {mvSheet.product.unit}</b>
                </div>
                <div>
                  <Label className="text-xs">{bn ? "পরিমাণ" : "Quantity"} *</Label>
                  <Input type="number" inputMode="decimal" value={mvForm.qty} onChange={e => setMvForm({ ...mvForm, qty: e.target.value })} autoFocus />
                </div>
                <div>
                  <Label className="text-xs">{bn ? "একক দাম" : "Unit price"}</Label>
                  <Input type="number" inputMode="decimal" value={mvForm.unit_price} onChange={e => setMvForm({ ...mvForm, unit_price: e.target.value })} />
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

      {/* History Sheet */}
      <Sheet open={!!historyOf} onOpenChange={(o) => !o && setHistoryOf(null)}>
        <SheetContent side="right" className="w-full sm:max-w-md">
          {historyOf && (
            <>
              <SheetHeader>
                <SheetTitle>{historyOf.name} — {bn ? "ইতিহাস" : "History"}</SheetTitle>
              </SheetHeader>
              <div className="mt-4 space-y-2 overflow-y-auto max-h-[calc(100vh-8rem)]">
                {historyList.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">{bn ? "কোনো এন্ট্রি নেই" : "No movements yet"}</p>
                ) : historyList.map(m => {
                  const M = MV_META[m.type];
                  return (
                    <div key={m.id} className="flex items-center gap-3 p-2 rounded-lg border border-border/40">
                      <div className={cn("h-8 w-8 rounded-lg grid place-items-center", M.tone)}>
                        <M.icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{bn ? M.bn : M.en}</p>
                        <p className="text-[11px] text-muted-foreground">{new Date(m.occurred_at).toLocaleString(bn ? "bn-BD" : "en-BD")}</p>
                        {m.note && <p className="text-[11px] text-muted-foreground truncate">{m.note}</p>}
                      </div>
                      <div className="text-right">
                        <p className={cn("font-semibold tabular-nums", M.sign > 0 ? "text-emerald-600" : "text-rose-600")}>
                          {M.sign > 0 ? "+" : "−"}{Number(m.qty)}
                        </p>
                        {m.unit_price > 0 && <p className="text-[10px] text-muted-foreground">{fmtBDT(m.unit_price, bn)}</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
