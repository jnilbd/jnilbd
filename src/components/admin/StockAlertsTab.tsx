import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { AlertTriangle, Loader2, PackageX, Save, TrendingDown } from "lucide-react";
import { money, downloadCsv } from "./shared";

export default function StockAlertsTab() {
  const [products, setProducts] = useState<any[]>([]);
  const [sold, setSold] = useState<Record<string, number>>({});
  const [threshold, setThreshold] = useState(5);
  const [loading, setLoading] = useState(true);
  const [edits, setEdits] = useState<Record<string, string>>({});

  const load = async () => {
    const [{ data: p }, { data: o }] = await Promise.all([
      supabase.from("shop_products").select("id,name,name_bn,stock,price,discount_price,product_type,is_active,image").eq("product_type", "physical"),
      supabase.from("shop_orders").select("product_id,quantity,status,created_at").gte("created_at", new Date(Date.now() - 30 * 864e5).toISOString()),
    ]);
    const s: Record<string, number> = {};
    (o || []).forEach((r: any) => {
      if (!r.product_id || ["cancelled", "refunded"].includes(r.status)) return;
      s[r.product_id] = (s[r.product_id] || 0) + Number(r.quantity || 1);
    });
    setProducts(p || []); setSold(s); setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const rows = useMemo(() => products.map((p) => {
    const sold30 = sold[p.id] || 0;
    const daily = sold30 / 30;
    const days = daily > 0 ? Math.floor(Number(p.stock || 0) / daily) : null;
    return { ...p, sold30, days };
  }).sort((a, b) => Number(a.stock || 0) - Number(b.stock || 0)), [products, sold]);

  const out = rows.filter((r) => Number(r.stock || 0) <= 0);
  const low = rows.filter((r) => Number(r.stock || 0) > 0 && Number(r.stock || 0) <= threshold);
  const stockValue = rows.reduce((s, r) => s + Number(r.stock || 0) * Number(r.discount_price || r.price || 0), 0);

  const saveStock = async (id: string) => {
    const v = Number(edits[id]);
    if (Number.isNaN(v)) return;
    const { error } = await supabase.from("shop_products").update({ stock: v }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("স্টক আপডেট"); setEdits((e) => { const n = { ...e }; delete n[id]; return n; }); load();
  };

  if (loading) return <div className="py-10 text-center"><Loader2 className="h-5 w-5 animate-spin inline" /></div>;

  const Row = ({ r }: { r: any }) => (
    <div className="flex items-center gap-2 rounded-xl border p-2.5">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium truncate">{r.name}</p>
        <p className="text-[11px] text-muted-foreground">
          ৩০ দিনে বিক্রি {r.sold30} • {r.days !== null ? `আর ~${r.days} দিনের স্টক` : "বিক্রি নেই"}
        </p>
      </div>
      <Badge className={`${Number(r.stock) <= 0 ? "bg-red-500" : Number(r.stock) <= threshold ? "bg-amber-500" : "bg-emerald-600"} text-white text-[10px]`}>
        স্টক {r.stock ?? 0}
      </Badge>
      <Input className="h-8 w-20" type="number" placeholder="নতুন" value={edits[r.id] ?? ""} onChange={(e) => setEdits({ ...edits, [r.id]: e.target.value })} />
      <Button size="icon" variant="outline" className="h-8 w-8" disabled={edits[r.id] === undefined || edits[r.id] === ""} onClick={() => saveStock(r.id)}>
        <Save className="h-3.5 w-3.5" />
      </Button>
    </div>
  );

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="rounded-xl border p-3"><PackageX className="h-4 w-4 text-red-500" /><p className="text-xl font-bold mt-1">{out.length}</p><p className="text-[10px] text-muted-foreground">স্টক শেষ</p></div>
        <div className="rounded-xl border p-3"><AlertTriangle className="h-4 w-4 text-amber-500" /><p className="text-xl font-bold mt-1">{low.length}</p><p className="text-[10px] text-muted-foreground">কম স্টক</p></div>
        <div className="rounded-xl border p-3"><TrendingDown className="h-4 w-4 text-primary" /><p className="text-xl font-bold mt-1">{rows.length}</p><p className="text-[10px] text-muted-foreground">ফিজিক্যাল পণ্য</p></div>
        <div className="rounded-xl border p-3"><p className="text-[10px] text-muted-foreground">স্টকের মূল্য</p><p className="text-lg font-bold">{money(stockValue)}</p></div>
      </div>

      <Card className="border-border/60">
        <CardHeader className="pb-3 flex-row flex-wrap items-center gap-2 space-y-0">
          <CardTitle className="text-base flex-1">স্টক অ্যালার্ট</CardTitle>
          <div className="flex items-center gap-1.5">
            <Label className="text-xs whitespace-nowrap">কম স্টক সীমা</Label>
            <Input className="h-8 w-16" type="number" value={threshold} onChange={(e) => setThreshold(Number(e.target.value) || 0)} />
          </div>
          <Button size="sm" variant="outline" onClick={() => downloadCsv(`stock-${Date.now()}.csv`, rows.map((r) => ({ name: r.name, stock: r.stock, sold_30d: r.sold30, days_left: r.days })))}>CSV</Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {out.length > 0 && <div className="space-y-1.5"><p className="text-xs font-semibold text-red-500">স্টক শেষ ({out.length})</p>{out.map((r) => <Row key={r.id} r={r} />)}</div>}
          {low.length > 0 && <div className="space-y-1.5"><p className="text-xs font-semibold text-amber-600">কম স্টক ({low.length})</p>{low.map((r) => <Row key={r.id} r={r} />)}</div>}
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-muted-foreground">সব পণ্য</p>
            {rows.map((r) => <Row key={r.id} r={r} />)}
            {rows.length === 0 && <p className="text-sm text-muted-foreground text-center py-6">কোনো ফিজিক্যাল পণ্য নেই</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
