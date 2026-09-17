import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import {
  LayoutGrid, List, Loader2, Printer, RefreshCw, Search, ShieldAlert, Trash2, Download, Truck, KeyRound,
} from "lucide-react";
import { ORDER_STATUSES, statusBn, statusColor, money, logAudit, downloadCsv, sendTemplateEmail } from "./shared";

const STATUS_EMAIL: Record<string, string> = {
  confirmed: "order_confirmed",
  shipped: "order_shipped",
  delivered: "order_delivered",
};

export const orderVars = (o: any) => ({
  customer_name: o.customer_name || "গ্রাহক",
  order_id: String(o.id || "").slice(0, 8).toUpperCase(),
  product_name: o.product_name || "",
  total: Number(o.total_amount || 0).toLocaleString("en-BD"),
  courier: o.courier_name || "—",
  tracking: o.tracking_no || "—",
  status: statusBn(o.status),
});

type Order = any;

export default function OrdersPipeline() {
  const [rows, setRows] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [view, setView] = useState<"board" | "list">("board");
  const [active, setActive] = useState<Order | null>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("shop_orders").select("*").order("created_at", { ascending: false }).limit(500);
    if (error) toast.error(error.message);
    setRows(data || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  // fraud/risk: same phone with 2+ cancelled orders
  const riskPhones = useMemo(() => {
    const m: Record<string, number> = {};
    rows.forEach((r) => {
      if (r.status === "cancelled" && r.customer_phone) m[r.customer_phone] = (m[r.customer_phone] || 0) + 1;
    });
    return new Set(Object.entries(m).filter(([, c]) => c >= 2).map(([p]) => p));
  }, [rows]);

  const filtered = rows.filter((r) => {
    const t = q.trim().toLowerCase();
    const matchQ = !t || [r.customer_name, r.customer_phone, r.product_name, r.tracking_no, r.id].some((v: any) => String(v || "").toLowerCase().includes(t));
    const matchS = statusFilter === "all" || (r.status || "pending") === statusFilter;
    const matchT = typeFilter === "all" || r.product_type === typeFilter;
    return matchQ && matchS && matchT;
  });

  const setStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("shop_orders").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    logAudit("order_status", "shop_orders", id, { status });
    toast.success(`স্ট্যাটাস: ${statusBn(status)}`);
    setRows((p) => p.map((r) => (r.id === id ? { ...r, status } : r)));
    setActive((a) => (a && a.id === id ? { ...a, status } : a));

    const key = STATUS_EMAIL[status];
    const order = rows.find((r) => r.id === id);
    if (key && order?.customer_email) {
      const res = await sendTemplateEmail(key, order.customer_email, orderVars({ ...order, status }));
      if (res.ok) toast.success("গ্রাহককে ইমেইল পাঠানো হয়েছে");
    }
  };

  const remove = async (id: string) => {
    if (!confirm("অর্ডারটি ডিলিট করবেন?")) return;
    await supabase.from("shop_orders").delete().eq("id", id);
    logAudit("order_delete", "shop_orders", id);
    setRows((p) => p.filter((r) => r.id !== id));
    setActive(null);
  };

  const totals = useMemo(() => {
    const rev = filtered.filter((r) => !["cancelled", "refunded"].includes(r.status)).reduce((s, r) => s + Number(r.total_amount || 0), 0);
    return { count: filtered.length, rev };
  }, [filtered]);

  return (
    <div className="space-y-3">
      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle className="text-base flex-1">অর্ডার পাইপলাইন <span className="text-xs font-normal text-muted-foreground">({totals.count} • {money(totals.rev)})</span></CardTitle>
            <Button size="sm" variant="outline" onClick={load}><RefreshCw className="h-3.5 w-3.5 mr-1" /> রিফ্রেশ</Button>
            <Button size="sm" variant="outline" onClick={() => downloadCsv(`orders-${Date.now()}.csv`, filtered)}><Download className="h-3.5 w-3.5 mr-1" /> CSV</Button>
            <div className="flex rounded-lg border border-border overflow-hidden">
              <button onClick={() => setView("board")} className={`px-2.5 py-1.5 ${view === "board" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}><LayoutGrid className="h-3.5 w-3.5" /></button>
              <button onClick={() => setView("list")} className={`px-2.5 py-1.5 ${view === "list" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}><List className="h-3.5 w-3.5" /></button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 pt-2">
            <div className="relative flex-1 min-w-[180px]">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input className="pl-8 h-9" placeholder="নাম, ফোন, প্রোডাক্ট, ট্র্যাকিং..." value={q} onChange={(e) => setQ(e.target.value)} />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-9 w-36"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">সব স্ট্যাটাস</SelectItem>
                {ORDER_STATUSES.map((s) => <SelectItem key={s} value={s}>{statusBn(s)}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="h-9 w-36"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">সব ধরন</SelectItem>
                <SelectItem value="digital">ডিজিটাল</SelectItem>
                <SelectItem value="physical">ফিজিক্যাল</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-10 text-center"><Loader2 className="h-5 w-5 animate-spin inline" /></div>
          ) : view === "board" ? (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {ORDER_STATUSES.map((st) => {
                const col = filtered.filter((r) => (r.status || "pending") === st);
                return (
                  <div key={st} className="min-w-[230px] w-[230px] shrink-0">
                    <div className="flex items-center gap-2 mb-2 px-1">
                      <span className={`h-2 w-2 rounded-full ${statusColor(st)}`} />
                      <span className="text-xs font-semibold">{statusBn(st)}</span>
                      <span className="text-[10px] text-muted-foreground ml-auto">{col.length}</span>
                    </div>
                    <div className="space-y-2 max-h-[62vh] overflow-y-auto pr-1">
                      {col.map((r) => (
                        <button key={r.id} onClick={() => setActive(r)} className="w-full text-left rounded-xl border border-border/60 bg-card p-2.5 hover:shadow-md transition-shadow">
                          <div className="flex items-start gap-1.5">
                            <p className="text-xs font-semibold flex-1 truncate">{r.customer_name}</p>
                            {riskPhones.has(r.customer_phone) && <ShieldAlert className="h-3.5 w-3.5 text-red-500 shrink-0" />}
                          </div>
                          <p className="text-[11px] text-muted-foreground truncate">{r.product_name} × {r.quantity}</p>
                          <div className="flex items-center justify-between mt-1.5">
                            <span className="text-xs font-bold text-primary">{money(r.total_amount)}</span>
                            <Badge variant="outline" className="text-[9px] px-1 py-0">{r.product_type === "digital" ? "ডিজিটাল" : "ফিজিক্যাল"}</Badge>
                          </div>
                        </button>
                      ))}
                      {col.length === 0 && <p className="text-[11px] text-muted-foreground text-center py-4">—</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader><TableRow>
                  <TableHead>তারিখ</TableHead><TableHead>কাস্টমার</TableHead><TableHead>প্রোডাক্ট</TableHead>
                  <TableHead>টাকা</TableHead><TableHead>স্ট্যাটাস</TableHead><TableHead></TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {filtered.map((r) => (
                    <TableRow key={r.id} className="cursor-pointer" onClick={() => setActive(r)}>
                      <TableCell className="text-xs whitespace-nowrap">{new Date(r.created_at).toLocaleDateString("bn-BD")}</TableCell>
                      <TableCell className="text-xs">
                        <div className="font-medium flex items-center gap-1">{r.customer_name}{riskPhones.has(r.customer_phone) && <ShieldAlert className="h-3 w-3 text-red-500" />}</div>
                        <div className="text-muted-foreground">{r.customer_phone}</div>
                      </TableCell>
                      <TableCell className="text-xs">{r.product_name} × {r.quantity}</TableCell>
                      <TableCell className="text-xs font-semibold">{money(r.total_amount)}</TableCell>
                      <TableCell><Badge className={`${statusColor(r.status)} text-white text-[10px]`}>{statusBn(r.status)}</Badge></TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Button size="icon" variant="ghost" onClick={() => remove(r.id)}><Trash2 className="h-3.5 w-3.5 text-red-500" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filtered.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-6">কোন অর্ডার নেই</TableCell></TableRow>}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <OrderDetail order={active} onClose={() => setActive(null)} onStatus={setStatus} onDelete={remove} onSaved={(o) => { setRows((p) => p.map((r) => (r.id === o.id ? o : r))); setActive(o); }} risky={active ? riskPhones.has(active.customer_phone) : false} />
    </div>
  );
}

function OrderDetail({ order, onClose, onStatus, onDelete, onSaved, risky }: any) {
  const [form, setForm] = useState<any>({});
  useEffect(() => {
    if (order) setForm({
      courier_name: order.courier_name || "", tracking_no: order.tracking_no || "",
      admin_note: order.admin_note || "", delivery_payload: order.delivery_payload || "",
    });
  }, [order?.id]);

  if (!order) return null;

  const save = async () => {
    const { error } = await supabase.from("shop_orders").update(form).eq("id", order.id);
    if (error) return toast.error(error.message);
    logAudit("order_update", "shop_orders", order.id, form);
    toast.success("সেভ হয়েছে");
    onSaved({ ...order, ...form });
  };

  const print = () => {
    const w = window.open("", "_blank", "width=800,height=900");
    if (!w) return;
    const addons = Array.isArray(order.addons) ? order.addons : [];
    w.document.write(`<html><head><title>Invoice ${order.id.slice(0, 8)}</title>
      <style>body{font-family:system-ui,'Noto Sans Bengali',sans-serif;padding:32px;color:#111}
      h1{margin:0;font-size:22px}table{width:100%;border-collapse:collapse;margin-top:18px}
      th,td{border:1px solid #ddd;padding:8px;font-size:13px;text-align:left}
      .muted{color:#666;font-size:12px}.tot{font-size:16px;font-weight:700;text-align:right;margin-top:14px}</style></head><body>
      <h1>JOHN NIL — ইনভয়েস</h1>
      <p class="muted">Invoice #${order.id.slice(0, 8).toUpperCase()} • ${new Date(order.created_at).toLocaleString("bn-BD")}</p>
      <p><b>${order.customer_name}</b><br/>${order.customer_phone || ""}<br/>${order.customer_address || ""}</p>
      <table><tr><th>পণ্য</th><th>পরিমাণ</th><th>দর</th><th>মোট</th></tr>
      <tr><td>${order.product_name}</td><td>${order.quantity}</td><td>${order.unit_price}</td><td>${order.total_amount}</td></tr>
      ${addons.map((a: any) => `<tr><td>${a.name || a}</td><td>1</td><td>${a.price || ""}</td><td>${a.price || ""}</td></tr>`).join("")}
      </table>
      ${order.delivery_charge ? `<p class="muted">ডেলিভারি চার্জ: ৳${order.delivery_charge}</p>` : ""}
      <p class="tot">সর্বমোট: ৳${Number(order.total_amount || 0).toLocaleString()}</p>
      <p class="muted">${order.courier_name ? `কুরিয়ার: ${order.courier_name} • ট্র্যাকিং: ${order.tracking_no || "—"}` : ""}</p>
      <p class="muted">ধন্যবাদ — johnnil.com</p>
      </body></html>`);
    w.document.close();
    w.focus();
    w.print();
  };

  return (
    <Dialog open={!!order} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[88vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base flex items-center gap-2">
            অর্ডার #{order.id.slice(0, 8).toUpperCase()}
            <Badge className={`${statusColor(order.status)} text-white text-[10px]`}>{statusBn(order.status)}</Badge>
            {risky && <Badge variant="destructive" className="text-[10px] gap-1"><ShieldAlert className="h-3 w-3" /> ঝুঁকিপূর্ণ</Badge>}
          </DialogTitle>
        </DialogHeader>

        <div className="grid sm:grid-cols-2 gap-3 text-sm">
          <div className="rounded-xl border p-3 space-y-1">
            <p className="text-[11px] text-muted-foreground">কাস্টমার</p>
            <p className="font-semibold">{order.customer_name}</p>
            <p className="text-xs">{order.customer_phone}</p>
            <p className="text-xs text-muted-foreground">{order.customer_email}</p>
            <p className="text-xs">{order.customer_address}</p>
          </div>
          <div className="rounded-xl border p-3 space-y-1">
            <p className="text-[11px] text-muted-foreground">পণ্য</p>
            <p className="font-semibold">{order.product_name}</p>
            <p className="text-xs">{order.quantity} × {money(order.unit_price)} = <b>{money(order.total_amount)}</b></p>
            <p className="text-xs text-muted-foreground">ধরন: {order.product_type === "digital" ? "ডিজিটাল" : "ফিজিক্যাল"}</p>
            {order.coupon_code && <p className="text-xs">কুপন: <b>{order.coupon_code}</b></p>}
            {order.payment_txn_id && <p className="text-xs">TxnID: {order.payment_txn_id}</p>}
          </div>
        </div>

        {order.notes && <p className="text-xs rounded-lg bg-muted p-2">গ্রাহকের নোট: {order.notes}</p>}
        {order.payment_proof && <a href={order.payment_proof} target="_blank" rel="noreferrer" className="text-xs text-primary underline">পেমেন্ট প্রুফ দেখুন</a>}

        <div className="space-y-2">
          <Label className="text-xs">স্ট্যাটাস</Label>
          <div className="flex flex-wrap gap-1.5">
            {ORDER_STATUSES.map((s) => (
              <button key={s} onClick={() => onStatus(order.id, s)}
                className={`px-2.5 py-1 rounded-full text-[11px] font-medium border transition-colors ${order.status === s ? `${statusColor(s)} text-white border-transparent` : "hover:bg-muted"}`}>
                {statusBn(s)}
              </button>
            ))}
          </div>
        </div>

        {order.product_type === "physical" ? (
          <div className="grid sm:grid-cols-2 gap-2">
            <div><Label className="text-xs flex items-center gap-1"><Truck className="h-3 w-3" /> কুরিয়ার</Label>
              <Input value={form.courier_name} onChange={(e) => setForm({ ...form, courier_name: e.target.value })} placeholder="Steadfast / Pathao / RedX" /></div>
            <div><Label className="text-xs">ট্র্যাকিং নম্বর</Label>
              <Input value={form.tracking_no} onChange={(e) => setForm({ ...form, tracking_no: e.target.value })} /></div>
          </div>
        ) : (
          <div>
            <Label className="text-xs flex items-center gap-1"><KeyRound className="h-3 w-3" /> ডিজিটাল ডেলিভারি (লাইসেন্স/লিংক/নির্দেশনা)</Label>
            <Textarea rows={3} value={form.delivery_payload} onChange={(e) => setForm({ ...form, delivery_payload: e.target.value })} placeholder="অ্যাকাউন্ট তথ্য, ডাউনলোড লিংক বা কী..." />
          </div>
        )}

        <div>
          <Label className="text-xs">অ্যাডমিন নোট</Label>
          <Textarea rows={2} value={form.admin_note} onChange={(e) => setForm({ ...form, admin_note: e.target.value })} />
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          <Button size="sm" onClick={save}>সেভ করুন</Button>
          <Button size="sm" variant="outline" onClick={print}><Printer className="h-3.5 w-3.5 mr-1" /> ইনভয়েস প্রিন্ট</Button>
          {order.customer_phone && (
            <Button size="sm" variant="outline" asChild>
              <a target="_blank" rel="noreferrer" href={`https://wa.me/${String(order.customer_phone).replace(/[^0-9]/g, "").replace(/^0/, "88")}`}>WhatsApp</a>
            </Button>
          )}
          <Button size="sm" variant="ghost" className="text-red-500 ml-auto" onClick={() => onDelete(order.id)}><Trash2 className="h-3.5 w-3.5 mr-1" /> ডিলিট</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
