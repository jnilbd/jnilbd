import { useEffect, useMemo, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Truck, Search, ExternalLink, Copy, Phone, MapPin, RefreshCw, PackageCheck, PackageX, Clock, PackageSearch, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

/**
 * Smart Courier Tracker – aggregates every sale + inventory movement that has
 * a tracking ID and lets the user one-click-check status on the correct
 * Bangladeshi courier portal. Auto-detects courier from name / tracking format.
 */

type Courier = {
  id: string;
  name: string;
  bn: string;
  color: string;
  trackUrl: (id: string) => string;
  merchantUrl?: string;
  phone?: string;
  match: (name: string, id: string) => boolean;
};

const COURIERS: Courier[] = [
  {
    id: "steadfast",
    name: "Steadfast",
    bn: "স্টেডফাস্ট",
    color: "bg-blue-500/10 text-blue-700 border-blue-500/30",
    trackUrl: (id) => `https://steadfast.com.bd/t/${encodeURIComponent(id)}`,
    merchantUrl: "https://steadfast.com.bd/user/login",
    phone: "09610-002222",
    match: (n) => /stead/i.test(n),
  },
  {
    id: "pathao",
    name: "Pathao Courier",
    bn: "পাঠাও কুরিয়ার",
    color: "bg-emerald-500/10 text-emerald-700 border-emerald-500/30",
    trackUrl: (id) => `https://merchant.pathao.com/tracking?consignment_id=${encodeURIComponent(id)}`,
    merchantUrl: "https://merchant.pathao.com/",
    phone: "09617-000600",
    match: (n) => /pathao/i.test(n),
  },
  {
    id: "redx",
    name: "RedX",
    bn: "রেডএক্স",
    color: "bg-rose-500/10 text-rose-700 border-rose-500/30",
    trackUrl: (id) => `https://redx.com.bd/track-parcel/?trackingId=${encodeURIComponent(id)}`,
    merchantUrl: "https://redx.com.bd/",
    phone: "09610-990100",
    match: (n) => /red\s*x|redx/i.test(n),
  },
  {
    id: "sundarban",
    name: "Sundarban Courier",
    bn: "সুন্দরবন কুরিয়ার",
    color: "bg-amber-500/10 text-amber-700 border-amber-500/30",
    trackUrl: (id) => `https://sundarbancourierltd.com/tracking?tracking_no=${encodeURIComponent(id)}`,
    merchantUrl: "https://sundarbancourierltd.com/",
    phone: "09611-333888",
    match: (n) => /sundar/i.test(n),
  },
  {
    id: "paperfly",
    name: "Paperfly",
    bn: "পেপারফ্লাই",
    color: "bg-violet-500/10 text-violet-700 border-violet-500/30",
    trackUrl: (id) => `https://go.paperfly.com.bd/tracking/?consignment_id=${encodeURIComponent(id)}`,
    merchantUrl: "https://go.paperfly.com.bd/",
    phone: "09612-202020",
    match: (n) => /paperfly/i.test(n),
  },
  {
    id: "ecourier",
    name: "eCourier",
    bn: "ই-কুরিয়ার",
    color: "bg-cyan-500/10 text-cyan-700 border-cyan-500/30",
    trackUrl: (id) => `https://ecourier.com.bd/track/${encodeURIComponent(id)}`,
    merchantUrl: "https://ecourier.com.bd/",
    phone: "09609-100100",
    match: (n) => /ecourier|e-courier/i.test(n),
  },
  {
    id: "sa_paribahan",
    name: "SA Paribahan",
    bn: "এস.এ. পরিবহন",
    color: "bg-orange-500/10 text-orange-700 border-orange-500/30",
    trackUrl: (id) => `https://saparibahan.com/tracking.php?consignment=${encodeURIComponent(id)}`,
    merchantUrl: "https://saparibahan.com/",
    phone: "16260",
    match: (n) => /s\.?\s*a\.?\s*paribahan|sa\s*paribahan/i.test(n),
  },
  {
    id: "janani",
    name: "Janani Express",
    bn: "জননী এক্সপ্রেস",
    color: "bg-pink-500/10 text-pink-700 border-pink-500/30",
    trackUrl: (id) => `https://jananiexpress.com/?trackingId=${encodeURIComponent(id)}`,
    merchantUrl: "https://jananiexpress.com/",
    match: (n) => /janani/i.test(n),
  },
];

function detectCourier(name: string | null | undefined, id: string): Courier | null {
  const n = (name || "").trim();
  const t = (id || "").trim();
  if (!n && !t) return null;
  for (const c of COURIERS) if (c.match(n, t)) return c;
  return null;
}

type Row = {
  key: string;
  source: "sale" | "inventory";
  date: string;
  customer: string | null;
  phone: string | null;
  address: string | null;
  product: string;
  qty: number;
  amount: number | null;
  courierName: string | null;
  trackingId: string;
  status: string | null;
  notes: string | null;
  refId: string;
  sourceTable: "finance_sales" | "inventory_movements";
};

const STATUS_TONE: Record<string, string> = {
  delivered: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30",
  in_transit: "bg-amber-500/15 text-amber-700 border-amber-500/30",
  pending: "bg-slate-500/15 text-slate-700 border-slate-500/30",
  returned: "bg-rose-500/15 text-rose-700 border-rose-500/30",
  hold: "bg-blue-500/15 text-blue-700 border-blue-500/30",
};

export function CourierTrackerTab({ userId, bn }: { userId: string; bn: boolean }) {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [courierFilter, setCourierFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [addOpen, setAddOpen] = useState(false);
  const [checkOpen, setCheckOpen] = useState(false);
  const [checkId, setCheckId] = useState("");
  const [checkCourier, setCheckCourier] = useState<string>("steadfast");

  const load = useCallback(async () => {
    setLoading(true);
    const [salesRes, mvRes] = await Promise.all([
      supabase.from("finance_sales")
        .select("id, created_at, customer_name, customer_phone, customer_address, product_name, quantity, total_amount, courier_name, tracking_id, delivery_status, notes")
        .eq("user_id", userId)
        .not("tracking_id", "is", null)
        .order("created_at", { ascending: false }),
      supabase.from("inventory_movements")
        .select("id, created_at, party_name, party_phone, notes, product_id, qty, courier_name, tracking_no, status, inventory_products(name)")
        .eq("user_id", userId)
        .not("tracking_no", "is", null)
        .order("created_at", { ascending: false }),
    ]);

    const out: Row[] = [];
    (salesRes.data || []).forEach((s: any) => {
      if (!s.tracking_id) return;
      out.push({
        key: `s-${s.id}`,
        source: "sale",
        date: s.created_at,
        customer: s.customer_name,
        phone: s.customer_phone,
        address: s.customer_address,
        product: s.product_name,
        qty: Number(s.quantity) || 1,
        amount: Number(s.total_amount) || 0,
        courierName: s.courier_name,
        trackingId: s.tracking_id,
        status: s.delivery_status,
        notes: s.notes,
        refId: s.id,
        sourceTable: "finance_sales",
      });
    });
    (mvRes.data || []).forEach((m: any) => {
      if (!m.tracking_no) return;
      out.push({
        key: `m-${m.id}`,
        source: "inventory",
        date: m.created_at,
        customer: m.party_name,
        phone: m.party_phone,
        address: null,
        product: m.inventory_products?.name || "—",
        qty: Number(m.qty) || 1,
        amount: null,
        courierName: m.courier_name,
        trackingId: m.tracking_no,
        status: m.status,
        notes: m.notes,
        refId: m.id,
        sourceTable: "inventory_movements",
      });
    });
    setRows(out);
    setLoading(false);
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  const stats = useMemo(() => {
    const s = { total: rows.length, delivered: 0, transit: 0, pending: 0, returned: 0 };
    rows.forEach(r => {
      const st = (r.status || "").toLowerCase();
      if (st === "delivered") s.delivered++;
      else if (st === "in_transit") s.transit++;
      else if (st === "returned") s.returned++;
      else s.pending++;
    });
    return s;
  }, [rows]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return rows.filter(r => {
      if (courierFilter !== "all") {
        const c = detectCourier(r.courierName, r.trackingId);
        if (c?.id !== courierFilter) return false;
      }
      if (statusFilter !== "all") {
        const st = (r.status || "pending").toLowerCase();
        if (st !== statusFilter) return false;
      }
      if (!term) return true;
      return `${r.customer ?? ""} ${r.phone ?? ""} ${r.product} ${r.trackingId} ${r.courierName ?? ""}`.toLowerCase().includes(term);
    });
  }, [rows, q, courierFilter, statusFilter]);

  const copy = (v: string) => {
    navigator.clipboard.writeText(v);
    toast.success(bn ? "কপি হয়েছে" : "Copied");
  };

  const openTracking = (row: Row) => {
    const c = detectCourier(row.courierName, row.trackingId);
    if (!c) {
      toast.error(bn ? "কুরিয়ার সনাক্ত করা যায়নি — নাম যোগ করুন" : "Courier not recognized — add name");
      return;
    }
    window.open(c.trackUrl(row.trackingId), "_blank", "noopener,noreferrer");
  };

  const updateStatus = async (row: Row, next: string) => {
    const res = row.sourceTable === "finance_sales"
      ? await supabase.from("finance_sales").update({ delivery_status: next }).eq("id", row.refId)
      : await supabase.from("inventory_movements").update({ status: next as any }).eq("id", row.refId);
    if (res.error) { toast.error(res.error.message); return; }
    toast.success(bn ? "আপডেট হয়েছে" : "Updated");
    load();
  };

  return (
    <div className="space-y-4">
      {/* Hero + quick check */}
      <Card className="relative overflow-hidden border-border/60 bg-gradient-to-br from-primary/10 via-background to-background p-5">
        <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-primary/20 blur-3xl" />
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-primary/15"><Truck className="h-5 w-5 text-primary" /></div>
              <div>
                <h2 className="text-lg font-semibold">{bn ? "স্মার্ট কুরিয়ার ট্র্যাকার" : "Smart Courier Tracker"}</h2>
                <p className="text-xs text-muted-foreground">
                  {bn ? "সব বিক্রি ও স্টক আউট এক জায়গায় — এক ক্লিকে কুরিয়ার স্ট্যাটাস" : "All sales & stock-outs in one place — one-click courier status"}
                </p>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="rounded-xl" onClick={() => setCheckOpen(true)}>
              <PackageSearch className="h-4 w-4 mr-1" /> {bn ? "কুইক চেক" : "Quick Check"}
            </Button>
            <Button size="sm" className="rounded-xl" onClick={load} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-1" />}
              {bn ? "রিফ্রেশ" : "Refresh"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-4">
          {[
            { label: bn ? "মোট" : "Total", v: stats.total, tone: "bg-primary/10 text-primary" },
            { label: bn ? "ডেলিভার্ড" : "Delivered", v: stats.delivered, tone: "bg-emerald-500/10 text-emerald-700" },
            { label: bn ? "ট্রানজিটে" : "In Transit", v: stats.transit, tone: "bg-amber-500/10 text-amber-700" },
            { label: bn ? "পেন্ডিং" : "Pending", v: stats.pending, tone: "bg-slate-500/10 text-slate-700" },
            { label: bn ? "রিটার্ন" : "Returned", v: stats.returned, tone: "bg-rose-500/10 text-rose-700" },
          ].map(s => (
            <div key={s.label} className={cn("rounded-xl p-3 border border-border/50", s.tone)}>
              <p className="text-[11px] opacity-80">{s.label}</p>
              <p className="text-xl font-bold tabular-nums">{s.v}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Courier portals grid */}
      <Card className="p-4 border-border/60">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold">{bn ? "কুরিয়ার পোর্টাল" : "Courier Portals"}</h3>
          <p className="text-[11px] text-muted-foreground">{bn ? "সরাসরি ওপেন করুন" : "Open directly"}</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {COURIERS.map(c => (
            <div key={c.id} className={cn("rounded-xl border p-3 flex flex-col gap-1.5", c.color)}>
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold truncate">{bn ? c.bn : c.name}</p>
                <a href={c.merchantUrl} target="_blank" rel="noopener noreferrer" className="opacity-70 hover:opacity-100">
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
              {c.phone && (
                <a href={`tel:${c.phone}`} className="text-[11px] flex items-center gap-1 opacity-80 hover:opacity-100">
                  <Phone className="h-3 w-3" /> {c.phone}
                </a>
              )}
              <Button
                size="sm"
                variant="outline"
                className="mt-auto rounded-lg h-7 text-[11px] bg-background/60"
                onClick={() => { setCheckCourier(c.id); setCheckOpen(true); }}
              >
                <Search className="h-3 w-3 mr-1" /> {bn ? "ট্র্যাক করুন" : "Track"}
              </Button>
            </div>
          ))}
        </div>
      </Card>

      {/* Filters */}
      <Card className="p-3 border-border/60">
        <div className="flex flex-wrap gap-2">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="h-4 w-4 absolute left-2.5 top-2.5 text-muted-foreground" />
            <Input value={q} onChange={e => setQ(e.target.value)}
              placeholder={bn ? "গ্রাহক / ফোন / ট্র্যাকিং" : "Customer / phone / tracking"}
              className="pl-8 rounded-xl h-9" />
          </div>
          <Select value={courierFilter} onValueChange={setCourierFilter}>
            <SelectTrigger className="w-[150px] rounded-xl h-9"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{bn ? "সব কুরিয়ার" : "All couriers"}</SelectItem>
              {COURIERS.map(c => <SelectItem key={c.id} value={c.id}>{bn ? c.bn : c.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px] rounded-xl h-9"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{bn ? "সব স্ট্যাটাস" : "All status"}</SelectItem>
              <SelectItem value="pending">{bn ? "পেন্ডিং" : "Pending"}</SelectItem>
              <SelectItem value="in_transit">{bn ? "ট্রানজিটে" : "In Transit"}</SelectItem>
              <SelectItem value="delivered">{bn ? "ডেলিভার্ড" : "Delivered"}</SelectItem>
              <SelectItem value="returned">{bn ? "রিটার্ন" : "Returned"}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Shipments */}
      <div className="space-y-2">
        {loading && <Card className="p-6 text-center text-sm text-muted-foreground">{bn ? "লোড হচ্ছে..." : "Loading..."}</Card>}
        {!loading && filtered.length === 0 && (
          <Card className="p-8 text-center border-dashed">
            <Truck className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              {bn ? "কোনো ট্র্যাকিং যুক্ত শিপমেন্ট নেই। বিক্রয় বা স্টক আউটে কুরিয়ার নাম ও ট্র্যাকিং যোগ করুন।" : "No shipments with tracking. Add a courier name & tracking id in Sales or Stock Out."}
            </p>
          </Card>
        )}
        {filtered.map(row => {
          const c = detectCourier(row.courierName, row.trackingId);
          const st = (row.status || "pending").toLowerCase();
          return (
            <Card key={row.key} className="p-3 border-border/60 hover:border-primary/40 transition-colors">
              <div className="flex items-start gap-3 flex-wrap">
                <div className="flex-1 min-w-[200px]">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold">{row.customer || (bn ? "নামহীন গ্রাহক" : "Unnamed")}</p>
                    <Badge variant="outline" className={cn("text-[10px]", row.source === "sale" ? "border-primary/40" : "border-amber-500/40")}>
                      {row.source === "sale" ? (bn ? "বিক্রয়" : "Sale") : (bn ? "স্টক" : "Stock")}
                    </Badge>
                    {c ? (
                      <Badge variant="outline" className={cn("text-[10px]", c.color)}>{bn ? c.bn : c.name}</Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px] bg-slate-500/10 text-slate-600">{row.courierName || "?"}</Badge>
                    )}
                    <Badge variant="outline" className={cn("text-[10px]", STATUS_TONE[st] || STATUS_TONE.pending)}>{st}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {row.product} × {row.qty}
                    {row.amount != null && ` · ৳${row.amount.toLocaleString()}`}
                  </p>
                  <div className="flex items-center gap-3 mt-1 text-[11px] text-muted-foreground flex-wrap">
                    {row.phone && (
                      <a href={`tel:${row.phone}`} className="flex items-center gap-1 hover:text-foreground">
                        <Phone className="h-3 w-3" /> {row.phone}
                      </a>
                    )}
                    {row.address && (
                      <span className="flex items-center gap-1 truncate max-w-[240px]">
                        <MapPin className="h-3 w-3" /> {row.address}
                      </span>
                    )}
                    <button onClick={() => copy(row.trackingId)} className="flex items-center gap-1 hover:text-foreground">
                      <Copy className="h-3 w-3" /> {row.trackingId}
                    </button>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Button size="sm" className="rounded-lg h-7 text-[11px]" onClick={() => openTracking(row)}>
                    <ExternalLink className="h-3 w-3 mr-1" /> {bn ? "স্ট্যাটাস চেক" : "Check Status"}
                  </Button>
                  <Select value={st} onValueChange={(v) => updateStatus(row, v)}>
                    <SelectTrigger className="h-7 text-[11px] rounded-lg w-[130px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">{bn ? "পেন্ডিং" : "Pending"}</SelectItem>
                      <SelectItem value="in_transit">{bn ? "ট্রানজিটে" : "In Transit"}</SelectItem>
                      <SelectItem value="delivered">{bn ? "ডেলিভার্ড" : "Delivered"}</SelectItem>
                      <SelectItem value="returned">{bn ? "রিটার্ন" : "Returned"}</SelectItem>
                      <SelectItem value="hold">{bn ? "হোল্ড" : "Hold"}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Quick check dialog */}
      <Dialog open={checkOpen} onOpenChange={setCheckOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{bn ? "কুইক ট্র্যাকিং চেক" : "Quick Tracking Check"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs">{bn ? "কুরিয়ার" : "Courier"}</Label>
              <Select value={checkCourier} onValueChange={setCheckCourier}>
                <SelectTrigger className="rounded-xl mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {COURIERS.map(c => <SelectItem key={c.id} value={c.id}>{bn ? c.bn : c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">{bn ? "ট্র্যাকিং / কনসাইনমেন্ট আইডি" : "Tracking / Consignment ID"}</Label>
              <Input value={checkId} onChange={e => setCheckId(e.target.value)} className="rounded-xl mt-1" placeholder="e.g. 15A2B7C" />
            </div>
            <Button
              className="w-full rounded-xl"
              onClick={() => {
                const c = COURIERS.find(x => x.id === checkCourier);
                if (!c || !checkId.trim()) { toast.error(bn ? "আইডি দিন" : "Enter tracking ID"); return; }
                window.open(c.trackUrl(checkId.trim()), "_blank", "noopener,noreferrer");
              }}
            >
              <ExternalLink className="h-4 w-4 mr-1" /> {bn ? "পোর্টালে ট্র্যাক করুন" : "Track on Portal"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
