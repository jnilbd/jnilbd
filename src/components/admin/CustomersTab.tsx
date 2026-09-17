import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Loader2, Search, Download, Crown } from "lucide-react";
import { money, downloadCsv } from "./shared";

export default function CustomersTab() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  useEffect(() => {
    (async () => {
      const [{ data: p }, { data: o }] = await Promise.all([
        supabase.from("profiles").select("*").order("created_at", { ascending: false }).limit(1000),
        supabase.from("shop_orders").select("customer_name,customer_phone,total_amount,status,created_at,user_id").limit(2000),
      ]);
      setProfiles(p || []); setOrders(o || []); setLoading(false);
    })();
  }, []);

  const list = useMemo(() => {
    const byPhone: Record<string, any> = {};
    profiles.forEach((p) => {
      const key = p.phone || p.user_id;
      byPhone[key] = { key, name: p.full_name || "—", phone: p.phone || "—", joined: p.created_at, orders: 0, spent: 0, last: null as any, registered: true };
    });
    orders.forEach((o) => {
      const key = o.customer_phone || o.customer_name;
      if (!byPhone[key]) byPhone[key] = { key, name: o.customer_name, phone: o.customer_phone || "—", joined: o.created_at, orders: 0, spent: 0, last: null, registered: false };
      const c = byPhone[key];
      c.orders++;
      if (!["cancelled", "refunded"].includes(o.status)) c.spent += Number(o.total_amount || 0);
      if (!c.last || new Date(o.created_at) > new Date(c.last)) c.last = o.created_at;
    });
    return Object.values(byPhone).sort((a: any, b: any) => b.spent - a.spent);
  }, [profiles, orders]);

  const filtered = list.filter((c: any) => !q || [c.name, c.phone].some((v) => String(v || "").toLowerCase().includes(q.toLowerCase())));

  if (loading) return <div className="py-10 text-center"><Loader2 className="h-5 w-5 animate-spin inline" /></div>;

  return (
    <Card className="border-border/60">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle className="text-base flex-1">কাস্টমার ({filtered.length})</CardTitle>
          <Button size="sm" variant="outline" onClick={() => downloadCsv(`customers-${Date.now()}.csv`, filtered as any[])}><Download className="h-3.5 w-3.5 mr-1" /> CSV</Button>
        </div>
        <div className="relative pt-2">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input className="pl-8 h-9" placeholder="নাম বা ফোন সার্চ..." value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
      </CardHeader>
      <CardContent className="grid sm:grid-cols-2 xl:grid-cols-3 gap-2">
        {filtered.map((c: any, i: number) => (
          <div key={c.key} className="rounded-xl border p-3 space-y-1">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-purple-500 text-white grid place-items-center text-xs font-bold">
                {String(c.name).charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold truncate flex items-center gap-1">{c.name}{i < 3 && c.spent > 0 && <Crown className="h-3 w-3 text-amber-500" />}</p>
                <p className="text-[11px] text-muted-foreground">{c.phone}</p>
              </div>
              {c.registered && <Badge variant="secondary" className="text-[9px]">রেজিস্টার্ড</Badge>}
            </div>
            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span>অর্ডার {c.orders}</span>
              <span className="font-bold text-primary">{money(c.spent)}</span>
            </div>
            {c.last && <p className="text-[10px] text-muted-foreground">শেষ অর্ডার: {new Date(c.last).toLocaleDateString("bn-BD")}</p>}
          </div>
        ))}
        {filtered.length === 0 && <p className="text-sm text-muted-foreground col-span-full text-center py-8">কেউ নেই</p>}
      </CardContent>
    </Card>
  );
}
