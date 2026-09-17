import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader2, Plus, RotateCcw, Trash2 } from "lucide-react";
import { money, logAudit, downloadCsv } from "./shared";

const STATUSES = ["requested", "approved", "received", "refunded", "rejected"];
const STATUS_BN: Record<string, string> = {
  requested: "অনুরোধ", approved: "অনুমোদিত", received: "পণ্য ফেরত এসেছে", refunded: "টাকা ফেরত", rejected: "বাতিল",
};
const STATUS_COLOR: Record<string, string> = {
  requested: "bg-amber-500", approved: "bg-blue-500", received: "bg-purple-500", refunded: "bg-emerald-600", rejected: "bg-red-500",
};

const empty = { customer_name: "", customer_phone: "", product_name: "", reason: "", kind: "return", refund_amount: 0, refund_method: "", status: "requested", admin_note: "", order_id: "" };

export default function ReturnsTab() {
  const [rows, setRows] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<any>(empty);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const [{ data }, { data: o }] = await Promise.all([
      supabase.from("order_returns").select("*").order("created_at", { ascending: false }).limit(300),
      supabase.from("shop_orders").select("id,customer_name,customer_phone,product_name,total_amount").order("created_at", { ascending: false }).limit(200),
    ]);
    setRows(data || []); setOrders(o || []); setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const openNew = () => { setForm(empty); setOpen(true); };
  const openEdit = (r: any) => { setForm({ ...r, order_id: r.order_id || "" }); setOpen(true); };

  const pickOrder = (id: string) => {
    const o = orders.find((x) => x.id === id);
    setForm((f: any) => ({ ...f, order_id: id, customer_name: o?.customer_name || f.customer_name, customer_phone: o?.customer_phone || f.customer_phone, product_name: o?.product_name || f.product_name, refund_amount: f.refund_amount || o?.total_amount || 0 }));
  };

  const save = async () => {
    if (!form.customer_name || !form.reason) return toast.error("নাম ও কারণ লিখুন");
    setSaving(true);
    const payload: any = {
      order_id: form.order_id || null, customer_name: form.customer_name, customer_phone: form.customer_phone || null,
      product_name: form.product_name || null, reason: form.reason, kind: form.kind, status: form.status,
      refund_amount: Number(form.refund_amount || 0), refund_method: form.refund_method || null, admin_note: form.admin_note || null,
      resolved_at: ["refunded", "rejected"].includes(form.status) ? new Date().toISOString() : null,
    };
    const res = form.id
      ? await supabase.from("order_returns").update(payload).eq("id", form.id)
      : await supabase.from("order_returns").insert(payload);
    setSaving(false);
    if (res.error) return toast.error(res.error.message);
    if (form.order_id && form.status === "refunded") {
      await supabase.from("shop_orders").update({ status: "refunded" }).eq("id", form.order_id);
    }
    logAudit(form.id ? "return_update" : "return_create", "order_returns", form.id, payload);
    toast.success("সেভ হয়েছে"); setOpen(false); load();
  };

  const quick = async (r: any, status: string) => {
    await supabase.from("order_returns").update({ status, resolved_at: ["refunded", "rejected"].includes(status) ? new Date().toISOString() : null }).eq("id", r.id);
    if (status === "refunded" && r.order_id) await supabase.from("shop_orders").update({ status: "refunded" }).eq("id", r.order_id);
    logAudit("return_status", "order_returns", r.id, { status }); load();
  };

  const remove = async (id: string) => {
    if (!confirm("ডিলিট করবেন?")) return;
    await supabase.from("order_returns").delete().eq("id", id); load();
  };

  const filtered = rows.filter((r) => filter === "all" || r.status === filter);
  const totalRefunded = rows.filter((r) => r.status === "refunded").reduce((s, r) => s + Number(r.refund_amount || 0), 0);

  if (loading) return <div className="py-10 text-center"><Loader2 className="h-5 w-5 animate-spin inline" /></div>;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-xl border p-3"><p className="text-[11px] text-muted-foreground">মোট অনুরোধ</p><p className="text-xl font-bold">{rows.length}</p></div>
        <div className="rounded-xl border p-3"><p className="text-[11px] text-muted-foreground">অপেক্ষমাণ</p><p className="text-xl font-bold text-amber-600">{rows.filter((r) => ["requested", "approved", "received"].includes(r.status)).length}</p></div>
        <div className="rounded-xl border p-3"><p className="text-[11px] text-muted-foreground">ফেরত দেওয়া</p><p className="text-xl font-bold text-emerald-600">{money(totalRefunded)}</p></div>
      </div>

      <Card className="border-border/60">
        <CardHeader className="pb-3 flex-row flex-wrap items-center gap-2 space-y-0">
          <CardTitle className="text-base flex-1">রিটার্ন ও রিফান্ড</CardTitle>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="h-9 w-36"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">সব</SelectItem>
              {STATUSES.map((s) => <SelectItem key={s} value={s}>{STATUS_BN[s]}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button size="sm" variant="outline" onClick={() => downloadCsv(`returns-${Date.now()}.csv`, filtered)}>CSV</Button>
          <Button size="sm" onClick={openNew}><Plus className="h-3.5 w-3.5 mr-1" /> নতুন</Button>
        </CardHeader>
        <CardContent className="space-y-2">
          {filtered.map((r) => (
            <div key={r.id} className="rounded-xl border p-3 space-y-2">
              <div className="flex items-start gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold truncate">{r.customer_name} <span className="text-xs text-muted-foreground">{r.customer_phone}</span></p>
                  <p className="text-xs text-muted-foreground truncate">{r.product_name || "—"} • {r.kind === "refund" ? "শুধু রিফান্ড" : "পণ্য ফেরত"}</p>
                  <p className="text-xs mt-1">{r.reason}</p>
                </div>
                <div className="text-right shrink-0">
                  <Badge className={`${STATUS_COLOR[r.status]} text-white text-[10px]`}>{STATUS_BN[r.status]}</Badge>
                  <p className="text-sm font-bold mt-1">{money(r.refund_amount)}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {STATUSES.filter((s) => s !== r.status).map((s) => (
                  <Button key={s} size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => quick(r, s)}>{STATUS_BN[s]}</Button>
                ))}
                <Button size="sm" variant="ghost" className="h-7 text-[11px]" onClick={() => openEdit(r)}><RotateCcw className="h-3 w-3 mr-1" /> এডিট</Button>
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => remove(r.id)}><Trash2 className="h-3.5 w-3.5 text-red-500" /></Button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">কোনো রিটার্ন নেই</p>}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{form.id ? "রিটার্ন এডিট" : "নতুন রিটার্ন"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs">অর্ডার (ঐচ্ছিক)</Label>
              <Select value={form.order_id || "none"} onValueChange={(v) => v === "none" ? setForm({ ...form, order_id: "" }) : pickOrder(v)}>
                <SelectTrigger><SelectValue placeholder="অর্ডার বাছুন" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">— নেই —</SelectItem>
                  {orders.map((o) => <SelectItem key={o.id} value={o.id}>{o.customer_name} • {o.product_name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div><Label className="text-xs">নাম</Label><Input value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })} /></div>
              <div><Label className="text-xs">ফোন</Label><Input value={form.customer_phone || ""} onChange={(e) => setForm({ ...form, customer_phone: e.target.value })} /></div>
            </div>
            <div><Label className="text-xs">পণ্য</Label><Input value={form.product_name || ""} onChange={(e) => setForm({ ...form, product_name: e.target.value })} /></div>
            <div><Label className="text-xs">কারণ</Label><Textarea rows={2} value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">ধরন</Label>
                <Select value={form.kind} onValueChange={(v) => setForm({ ...form, kind: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="return">পণ্য ফেরত</SelectItem><SelectItem value="refund">শুধু রিফান্ড</SelectItem><SelectItem value="exchange">বদল</SelectItem></SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">স্ট্যাটাস</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{STATUS_BN[s]}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div><Label className="text-xs">ফেরতের পরিমাণ</Label><Input type="number" value={form.refund_amount} onChange={(e) => setForm({ ...form, refund_amount: e.target.value })} /></div>
              <div><Label className="text-xs">মাধ্যম</Label><Input placeholder="bKash / নগদ" value={form.refund_method || ""} onChange={(e) => setForm({ ...form, refund_method: e.target.value })} /></div>
            </div>
            <div><Label className="text-xs">অ্যাডমিন নোট</Label><Textarea rows={2} value={form.admin_note || ""} onChange={(e) => setForm({ ...form, admin_note: e.target.value })} /></div>
            <Button className="w-full" onClick={save} disabled={saving}>{saving && <Loader2 className="h-4 w-4 mr-1 animate-spin" />} সেভ</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
