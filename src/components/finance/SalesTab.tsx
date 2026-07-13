import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  Plus, Package, Truck, CheckCircle2, Undo2, Loader2, Trash2,
  Phone, MapPin, Search, ShoppingBag, CreditCard
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type PayStatus = "pending" | "partial" | "paid";
type DelStatus = "pending" | "dispatched" | "in_transit" | "delivered" | "returned" | "cancelled";

interface SaleRow {
  id: string;
  order_no: string | null;
  customer_name: string;
  customer_phone: string | null;
  customer_address: string | null;
  product_name: string;
  quantity: number;
  unit_price: number;
  cost_price: number;
  discount: number;
  courier_charge: number;
  total_amount: number;
  paid_amount: number;
  payment_method: string | null;
  payment_status: PayStatus;
  courier_name: string | null;
  tracking_id: string | null;
  delivery_status: DelStatus;
  return_reason: string | null;
  notes: string | null;
  occurred_at: string;
}

const fmt = (n: number, bn: boolean) =>
  "৳" + Math.round(n).toLocaleString(bn ? "bn-BD" : "en-BD");

const PAY_LABEL: Record<PayStatus, { bn: string; en: string; cls: string }> = {
  pending: { bn: "বাকি", en: "Pending", cls: "bg-amber-500/10 text-amber-600 border-amber-500/30" },
  partial: { bn: "আংশিক", en: "Partial", cls: "bg-sky-500/10 text-sky-600 border-sky-500/30" },
  paid: { bn: "পরিশোধিত", en: "Paid", cls: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30" },
};
const DEL_LABEL: Record<DelStatus, { bn: string; en: string; cls: string; icon: any }> = {
  pending: { bn: "অপেক্ষমান", en: "Pending", cls: "bg-muted text-muted-foreground border-border", icon: Package },
  dispatched: { bn: "প্রেরিত", en: "Dispatched", cls: "bg-indigo-500/10 text-indigo-600 border-indigo-500/30", icon: Truck },
  in_transit: { bn: "পথে আছে", en: "In Transit", cls: "bg-sky-500/10 text-sky-600 border-sky-500/30", icon: Truck },
  delivered: { bn: "ডেলিভার্ড", en: "Delivered", cls: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30", icon: CheckCircle2 },
  returned: { bn: "রিটার্ন", en: "Returned", cls: "bg-rose-500/10 text-rose-600 border-rose-500/30", icon: Undo2 },
  cancelled: { bn: "বাতিল", en: "Cancelled", cls: "bg-rose-500/10 text-rose-600 border-rose-500/30", icon: Undo2 },
};

export function SalesTab({ userId, bn }: { userId: string; bn: boolean }) {
  const [rows, setRows] = useState<SaleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [openNew, setOpenNew] = useState(false);
  const [openDetail, setOpenDetail] = useState<SaleRow | null>(null);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | PayStatus | DelStatus>("all");

  // form
  const [form, setForm] = useState({
    customer_name: "", customer_phone: "", customer_address: "",
    product_name: "", quantity: "1", unit_price: "", cost_price: "",
    discount: "0", courier_charge: "0",
    payment_method: "cash", paid_amount: "",
    courier_name: "", tracking_id: "",
    notes: "",
  });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await (supabase as any)
      .from("finance_sales").select("*")
      .eq("user_id", userId)
      .order("occurred_at", { ascending: false });
    if (error) toast.error(error.message);
    setRows((data as SaleRow[]) || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, [userId]);

  const totals = useMemo(() => {
    const t = { orders: rows.length, sales: 0, paid: 0, due: 0, profit: 0, delivered: 0, pending: 0, returned: 0 };
    for (const r of rows) {
      t.sales += Number(r.total_amount || 0);
      t.paid += Number(r.paid_amount || 0);
      t.due += Number(r.total_amount || 0) - Number(r.paid_amount || 0);
      t.profit += (Number(r.unit_price) - Number(r.cost_price)) * Number(r.quantity) - Number(r.discount || 0);
      if (r.delivery_status === "delivered") t.delivered++;
      else if (r.delivery_status === "returned") t.returned++;
      else t.pending++;
    }
    return t;
  }, [rows]);

  const visible = useMemo(() => {
    const term = q.trim().toLowerCase();
    return rows.filter(r => {
      if (term) {
        const hay = `${r.customer_name} ${r.customer_phone ?? ""} ${r.product_name} ${r.tracking_id ?? ""} ${r.order_no ?? ""}`.toLowerCase();
        if (!hay.includes(term)) return false;
      }
      if (filter === "all") return true;
      return r.payment_status === filter || r.delivery_status === filter;
    });
  }, [rows, q, filter]);

  const submit = async () => {
    if (!form.customer_name || !form.product_name || !form.unit_price) {
      toast.error(bn ? "গ্রাহক, পণ্য ও দাম দিন" : "Customer, product and price required");
      return;
    }
    const qty = Number(form.quantity) || 1;
    const up = Number(form.unit_price) || 0;
    const cp = Number(form.cost_price) || 0;
    const disc = Number(form.discount) || 0;
    const cc = Number(form.courier_charge) || 0;
    const total = qty * up - disc + cc;
    const paid = Number(form.paid_amount) || 0;
    const payStatus: PayStatus = paid >= total ? "paid" : paid > 0 ? "partial" : "pending";
    setSaving(true);
    const { error } = await (supabase as any).from("finance_sales").insert({
      user_id: userId,
      customer_name: form.customer_name,
      customer_phone: form.customer_phone || null,
      customer_address: form.customer_address || null,
      product_name: form.product_name,
      quantity: qty, unit_price: up, cost_price: cp,
      discount: disc, courier_charge: cc, total_amount: total,
      paid_amount: paid,
      payment_method: form.payment_method || null,
      payment_status: payStatus,
      courier_name: form.courier_name || null,
      tracking_id: form.tracking_id || null,
      notes: form.notes || null,
    });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(bn ? "অর্ডার তৈরি হয়েছে" : "Order created");
    setOpenNew(false);
    setForm({ ...form, customer_name: "", customer_phone: "", customer_address: "", product_name: "", quantity: "1", unit_price: "", cost_price: "", discount: "0", courier_charge: "0", paid_amount: "", tracking_id: "", notes: "" });
    load();
  };

  const updateStatus = async (id: string, patch: Partial<SaleRow>) => {
    const { error } = await (supabase as any).from("finance_sales").update(patch).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(bn ? "আপডেট হয়েছে" : "Updated");
    load();
    if (openDetail?.id === id) setOpenDetail({ ...openDetail, ...patch } as SaleRow);
  };

  const addPayment = async (r: SaleRow, amount: number) => {
    const newPaid = Number(r.paid_amount) + amount;
    const ps: PayStatus = newPaid >= r.total_amount ? "paid" : newPaid > 0 ? "partial" : "pending";
    await updateStatus(r.id, { paid_amount: newPaid, payment_status: ps });
  };

  const remove = async (id: string) => {
    if (!confirm(bn ? "মুছে ফেলবেন?" : "Delete this order?")) return;
    const { error } = await (supabase as any).from("finance_sales").delete().eq("id", id);
    if (error) return toast.error(error.message);
    setOpenDetail(null);
    load();
  };

  return (
    <div className="space-y-3">
      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <StatBox label={bn ? "মোট অর্ডার" : "Orders"} value={bn ? totals.orders.toLocaleString("bn-BD") : totals.orders} icon={ShoppingBag} />
        <StatBox label={bn ? "মোট বিক্রি" : "Total Sales"} value={fmt(totals.sales, bn)} icon={CreditCard} tone="emerald" />
        <StatBox label={bn ? "বাকি" : "Due"} value={fmt(totals.due, bn)} icon={CreditCard} tone={totals.due > 0 ? "rose" : undefined} />
        <StatBox label={bn ? "লাভ" : "Profit"} value={fmt(totals.profit, bn)} icon={CheckCircle2} tone={totals.profit >= 0 ? "emerald" : "rose"} />
      </div>

      <div className="grid grid-cols-3 gap-2 text-[11px]">
        <span className="rounded-lg px-2 py-1.5 border border-emerald-500/30 bg-emerald-500/5 text-center">
          <b className="text-emerald-600">{totals.delivered}</b> {bn ? "ডেলিভার্ড" : "Delivered"}
        </span>
        <span className="rounded-lg px-2 py-1.5 border border-amber-500/30 bg-amber-500/5 text-center">
          <b className="text-amber-600">{totals.pending}</b> {bn ? "অপেক্ষমান" : "Pending"}
        </span>
        <span className="rounded-lg px-2 py-1.5 border border-rose-500/30 bg-rose-500/5 text-center">
          <b className="text-rose-600">{totals.returned}</b> {bn ? "রিটার্ন" : "Returned"}
        </span>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button onClick={() => setOpenNew(true)} className="h-11 rounded-xl flex-1">
          <Plus className="h-4 w-4 mr-1" /> {bn ? "নতুন অর্ডার" : "New Order"}
        </Button>
      </div>

      {/* Search + filter */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input value={q} onChange={e => setQ(e.target.value)}
          placeholder={bn ? "গ্রাহক / পণ্য / ট্র্যাকিং খুঁজুন..." : "Search customer / product / tracking..."}
          className="pl-9 rounded-xl" />
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar -mx-1 px-1 py-1">
        {([
          ["all", bn ? "সব" : "All"],
          ["pending", bn ? "অপেক্ষমান" : "Pending"],
          ["dispatched", bn ? "প্রেরিত" : "Dispatched"],
          ["in_transit", bn ? "পথে" : "In Transit"],
          ["delivered", bn ? "ডেলিভার্ড" : "Delivered"],
          ["returned", bn ? "রিটার্ন" : "Returned"],
          ["paid", bn ? "পরিশোধিত" : "Paid"],
          ["partial", bn ? "আংশিক" : "Partial"],
        ] as const).map(([k, l]) => (
          <button key={k} onClick={() => setFilter(k as any)}
            className={cn(
              "shrink-0 text-[11px] px-3 py-1.5 rounded-full border transition-all",
              filter === k ? "border-primary bg-primary text-primary-foreground shadow-sm" : "border-border/60 bg-card/50 hover:bg-muted"
            )}>{l}</button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="py-16 text-center"><Loader2 className="h-5 w-5 animate-spin mx-auto text-muted-foreground" /></div>
      ) : visible.length === 0 ? (
        <Card className="p-8 text-center text-sm text-muted-foreground">
          <ShoppingBag className="h-8 w-8 mx-auto mb-2 opacity-40" />
          {bn ? "কোনো অর্ডার নেই" : "No orders yet"}
        </Card>
      ) : (
        <div className="space-y-2">
          {visible.map(r => {
            const del = DEL_LABEL[r.delivery_status];
            const pay = PAY_LABEL[r.payment_status];
            const due = Number(r.total_amount) - Number(r.paid_amount);
            const DelIcon = del.icon;
            return (
              <button key={r.id} onClick={() => setOpenDetail(r)}
                className="w-full text-left rounded-xl border border-border/60 bg-card/70 backdrop-blur p-3 hover:shadow-md transition-all">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm truncate">{r.product_name}</p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {r.customer_name}{r.customer_phone ? ` · ${r.customer_phone}` : ""}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold tabular-nums">{fmt(r.total_amount, bn)}</p>
                    {due > 0 && <p className="text-[10px] text-rose-500 tabular-nums">{bn ? "বাকি" : "Due"} {fmt(due, bn)}</p>}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  <Badge className={cn("text-[10px] border gap-1", del.cls)} variant="outline">
                    <DelIcon className="h-2.5 w-2.5" />{bn ? del.bn : del.en}
                  </Badge>
                  <Badge className={cn("text-[10px] border", pay.cls)} variant="outline">
                    {bn ? pay.bn : pay.en}
                  </Badge>
                  {r.courier_name && (
                    <span className="text-[10px] text-muted-foreground">
                      <Truck className="h-2.5 w-2.5 inline" /> {r.courier_name}
                      {r.tracking_id ? ` · ${r.tracking_id}` : ""}
                    </span>
                  )}
                  <span className="ml-auto text-[10px] text-muted-foreground">
                    {new Date(r.occurred_at).toLocaleDateString(bn ? "bn-BD" : "en-BD", { day: "numeric", month: "short" })}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* New order sheet */}
      <Sheet open={openNew} onOpenChange={setOpenNew}>
        <SheetContent side="bottom" className="rounded-t-3xl max-h-[90vh] overflow-y-auto">
          <SheetHeader><SheetTitle>{bn ? "নতুন অর্ডার" : "New Order"}</SheetTitle></SheetHeader>
          <div className="mt-4 space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div className="col-span-2">
                <Label className="text-xs">{bn ? "গ্রাহকের নাম *" : "Customer Name *"}</Label>
                <Input value={form.customer_name} onChange={e => setForm({ ...form, customer_name: e.target.value })} className="rounded-xl mt-1" />
              </div>
              <div>
                <Label className="text-xs">{bn ? "ফোন" : "Phone"}</Label>
                <Input value={form.customer_phone} onChange={e => setForm({ ...form, customer_phone: e.target.value })} className="rounded-xl mt-1" />
              </div>
              <div>
                <Label className="text-xs">{bn ? "পেমেন্ট" : "Payment"}</Label>
                <Select value={form.payment_method} onValueChange={v => setForm({ ...form, payment_method: v })}>
                  <SelectTrigger className="mt-1 rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="bkash">bKash</SelectItem>
                    <SelectItem value="nagad">Nagad</SelectItem>
                    <SelectItem value="bank">Bank</SelectItem>
                    <SelectItem value="cod">Cash on Delivery</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Label className="text-xs">{bn ? "ঠিকানা" : "Address"}</Label>
                <Textarea rows={2} value={form.customer_address} onChange={e => setForm({ ...form, customer_address: e.target.value })} className="rounded-xl mt-1 resize-none" />
              </div>
              <div className="col-span-2">
                <Label className="text-xs">{bn ? "পণ্য *" : "Product *"}</Label>
                <Input value={form.product_name} onChange={e => setForm({ ...form, product_name: e.target.value })} className="rounded-xl mt-1" />
              </div>
              <div>
                <Label className="text-xs">{bn ? "পরিমাণ" : "Qty"}</Label>
                <Input type="number" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} className="rounded-xl mt-1" />
              </div>
              <div>
                <Label className="text-xs">{bn ? "বিক্রয় মূল্য *" : "Sell Price *"}</Label>
                <Input type="number" value={form.unit_price} onChange={e => setForm({ ...form, unit_price: e.target.value })} className="rounded-xl mt-1" />
              </div>
              <div>
                <Label className="text-xs">{bn ? "ক্রয় মূল্য" : "Cost Price"}</Label>
                <Input type="number" value={form.cost_price} onChange={e => setForm({ ...form, cost_price: e.target.value })} className="rounded-xl mt-1" />
              </div>
              <div>
                <Label className="text-xs">{bn ? "ডিসকাউন্ট" : "Discount"}</Label>
                <Input type="number" value={form.discount} onChange={e => setForm({ ...form, discount: e.target.value })} className="rounded-xl mt-1" />
              </div>
              <div>
                <Label className="text-xs">{bn ? "কুরিয়ার চার্জ" : "Courier Charge"}</Label>
                <Input type="number" value={form.courier_charge} onChange={e => setForm({ ...form, courier_charge: e.target.value })} className="rounded-xl mt-1" />
              </div>
              <div>
                <Label className="text-xs">{bn ? "পরিশোধিত" : "Paid Amount"}</Label>
                <Input type="number" value={form.paid_amount} onChange={e => setForm({ ...form, paid_amount: e.target.value })} className="rounded-xl mt-1" />
              </div>
              <div>
                <Label className="text-xs">{bn ? "কুরিয়ার" : "Courier"}</Label>
                <Input value={form.courier_name} onChange={e => setForm({ ...form, courier_name: e.target.value })} placeholder="Pathao / Steadfast / Sundarban" className="rounded-xl mt-1" />
              </div>
              <div>
                <Label className="text-xs">{bn ? "ট্র্যাকিং ID" : "Tracking ID"}</Label>
                <Input value={form.tracking_id} onChange={e => setForm({ ...form, tracking_id: e.target.value })} className="rounded-xl mt-1" />
              </div>
              <div className="col-span-2">
                <Label className="text-xs">{bn ? "নোট" : "Notes"}</Label>
                <Textarea rows={2} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} className="rounded-xl mt-1 resize-none" />
              </div>
            </div>
            <div className="rounded-xl bg-muted/50 p-3 text-sm flex justify-between">
              <span className="text-muted-foreground">{bn ? "মোট" : "Total"}</span>
              <b className="tabular-nums">
                {fmt((Number(form.quantity) || 0) * (Number(form.unit_price) || 0) - (Number(form.discount) || 0) + (Number(form.courier_charge) || 0), bn)}
              </b>
            </div>
            <Button onClick={submit} disabled={saving} className="w-full h-12 rounded-xl">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : (bn ? "অর্ডার তৈরি করুন" : "Create Order")}
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Detail sheet */}
      <Sheet open={!!openDetail} onOpenChange={(o) => !o && setOpenDetail(null)}>
        <SheetContent side="bottom" className="rounded-t-3xl max-h-[90vh] overflow-y-auto">
          {openDetail && (
            <>
              <SheetHeader>
                <SheetTitle className="truncate">{openDetail.product_name}</SheetTitle>
              </SheetHeader>
              <div className="mt-4 space-y-4">
                <Card className="p-3 space-y-1.5 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">{bn ? "গ্রাহক" : "Customer"}</span><b>{openDetail.customer_name}</b></div>
                  {openDetail.customer_phone && (
                    <div className="flex justify-between"><span className="text-muted-foreground"><Phone className="h-3 w-3 inline" /> {bn ? "ফোন" : "Phone"}</span><b>{openDetail.customer_phone}</b></div>
                  )}
                  {openDetail.customer_address && (
                    <div className="flex justify-between gap-4"><span className="text-muted-foreground shrink-0"><MapPin className="h-3 w-3 inline" /> {bn ? "ঠিকানা" : "Address"}</span><span className="text-right text-xs">{openDetail.customer_address}</span></div>
                  )}
                </Card>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-xl border border-border/60 bg-card/50 p-2">
                    <p className="text-[10px] text-muted-foreground">{bn ? "মোট" : "Total"}</p>
                    <p className="text-sm font-semibold tabular-nums">{fmt(openDetail.total_amount, bn)}</p>
                  </div>
                  <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-2">
                    <p className="text-[10px] text-muted-foreground">{bn ? "পরিশোধিত" : "Paid"}</p>
                    <p className="text-sm font-semibold text-emerald-600 tabular-nums">{fmt(openDetail.paid_amount, bn)}</p>
                  </div>
                  <div className="rounded-xl border border-rose-500/30 bg-rose-500/5 p-2">
                    <p className="text-[10px] text-muted-foreground">{bn ? "বাকি" : "Due"}</p>
                    <p className="text-sm font-semibold text-rose-600 tabular-nums">
                      {fmt(Number(openDetail.total_amount) - Number(openDetail.paid_amount), bn)}
                    </p>
                  </div>
                </div>

                {/* Payment quick actions */}
                {openDetail.payment_status !== "paid" && (
                  <div>
                    <Label className="text-xs">{bn ? "পেমেন্ট যোগ করুন" : "Add Payment"}</Label>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {[500, 1000, 2000, 5000].map(v => (
                        <Button key={v} size="sm" variant="outline" className="h-8 rounded-full text-xs"
                          onClick={() => addPayment(openDetail, v)}>+৳{v}</Button>
                      ))}
                      <Button size="sm" className="h-8 rounded-full text-xs"
                        onClick={() => addPayment(openDetail, Number(openDetail.total_amount) - Number(openDetail.paid_amount))}>
                        {bn ? "সম্পূর্ণ" : "Full"}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Delivery status update */}
                <div>
                  <Label className="text-xs">{bn ? "ডেলিভারি স্ট্যাটাস" : "Delivery Status"}</Label>
                  <div className="grid grid-cols-3 gap-1.5 mt-1">
                    {(["pending", "dispatched", "in_transit", "delivered", "returned", "cancelled"] as DelStatus[]).map(s => {
                      const info = DEL_LABEL[s];
                      const active = openDetail.delivery_status === s;
                      return (
                        <button key={s} onClick={() => updateStatus(openDetail.id, { delivery_status: s, ...(s === "delivered" ? { delivered_at: new Date().toISOString() } : {}) })}
                          className={cn("text-[11px] px-2 py-2 rounded-lg border transition-all",
                            active ? info.cls + " ring-2 ring-primary/30" : "border-border/60 bg-card/50 hover:bg-muted")}>
                          {bn ? info.bn : info.en}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {openDetail.courier_name && (
                  <Card className="p-3 text-sm">
                    <div className="flex items-center gap-2 mb-1"><Truck className="h-4 w-4 text-primary" /><b>{bn ? "কুরিয়ার" : "Courier"}</b></div>
                    <p className="text-xs text-muted-foreground">{openDetail.courier_name}
                      {openDetail.tracking_id ? ` · ${bn ? "ট্র্যাকিং" : "Tracking"}: ${openDetail.tracking_id}` : ""}
                    </p>
                  </Card>
                )}

                {openDetail.notes && (
                  <p className="text-xs text-muted-foreground rounded-lg bg-muted/50 p-3">{openDetail.notes}</p>
                )}

                <Button variant="ghost" className="w-full text-rose-500 hover:text-rose-600" onClick={() => remove(openDetail.id)}>
                  <Trash2 className="h-4 w-4 mr-1" /> {bn ? "মুছে ফেলুন" : "Delete Order"}
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function StatBox({ label, value, icon: Icon, tone }: { label: string; value: any; icon: any; tone?: "emerald" | "rose" }) {
  return (
    <div className="rounded-xl border border-border/60 bg-card/70 backdrop-blur p-2.5">
      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
        <Icon className="h-3 w-3" />{label}
      </div>
      <p className={cn("text-base font-semibold tabular-nums mt-0.5",
        tone === "emerald" && "text-emerald-500",
        tone === "rose" && "text-rose-500")}>{value}</p>
    </div>
  );
}
