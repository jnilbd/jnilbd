import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Download, Loader2, Sparkles, FileBarChart } from "lucide-react";
import { money, downloadCsv } from "./shared";

export function ReportsTab() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [ai, setAi] = useState("");
  const [aiBusy, setAiBusy] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("shop_orders").select("*").order("created_at", { ascending: false }).limit(1000);
      setOrders(data || []); setLoading(false);
    })();
  }, []);

  const stats = useMemo(() => {
    const ok = orders.filter((o) => !["cancelled", "refunded"].includes(o.status));
    const rev = ok.reduce((s, o) => s + Number(o.total_amount || 0), 0);
    const digital = ok.filter((o) => o.product_type === "digital");
    const physical = ok.filter((o) => o.product_type === "physical");
    const months: Record<string, number> = {};
    ok.forEach((o) => {
      const k = new Date(o.created_at).toLocaleDateString("bn-BD", { year: "numeric", month: "short" });
      months[k] = (months[k] || 0) + Number(o.total_amount || 0);
    });
    return {
      rev, count: ok.length, aov: ok.length ? rev / ok.length : 0,
      digitalRev: digital.reduce((s, o) => s + Number(o.total_amount || 0), 0),
      physicalRev: physical.reduce((s, o) => s + Number(o.total_amount || 0), 0),
      cancelRate: orders.length ? (orders.filter((o) => o.status === "cancelled").length / orders.length) * 100 : 0,
      months: Object.entries(months).slice(0, 6),
    };
  }, [orders]);

  const runAi = async () => {
    setAiBusy(true);
    const { data, error } = await supabase.functions.invoke("admin-ai", {
      body: {
        task: "insight",
        input: {
          totalRevenue: stats.rev, orders: stats.count, aov: Math.round(stats.aov),
          digitalRevenue: stats.digitalRev, physicalRevenue: stats.physicalRev,
          cancelRate: stats.cancelRate.toFixed(1),
          topProducts: Object.entries(orders.reduce((m: any, o) => { m[o.product_name] = (m[o.product_name] || 0) + Number(o.total_amount || 0); return m; }, {}))
            .sort((a: any, b: any) => b[1] - a[1]).slice(0, 5),
        },
      },
    });
    setAiBusy(false);
    if (error) return toast.error("AI রিপোর্ট আনা যায়নি");
    setAi(data?.text || "");
  };

  if (loading) return <div className="py-10 text-center"><Loader2 className="h-5 w-5 animate-spin inline" /></div>;

  const cards = [
    { l: "মোট আয়", v: money(stats.rev) }, { l: "মোট অর্ডার", v: stats.count },
    { l: "গড় অর্ডার মূল্য", v: money(Math.round(stats.aov)) }, { l: "বাতিলের হার", v: `${stats.cancelRate.toFixed(1)}%` },
    { l: "ডিজিটাল আয়", v: money(stats.digitalRev) }, { l: "ফিজিক্যাল আয়", v: money(stats.physicalRev) },
  ];

  return (
    <div className="space-y-3">
      <Card className="border-border/60">
        <CardHeader className="pb-3 flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base flex items-center gap-2"><FileBarChart className="h-4 w-4 text-primary" /> স্মার্ট রিপোর্ট</CardTitle>
          <Button size="sm" variant="outline" onClick={() => downloadCsv(`report-${Date.now()}.csv`, orders)}><Download className="h-3.5 w-3.5 mr-1" /> CSV এক্সপোর্ট</Button>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {cards.map((c) => (
              <div key={c.l} className="rounded-xl border p-3">
                <p className="text-[11px] text-muted-foreground">{c.l}</p>
                <p className="text-lg font-bold tabular-nums">{c.v}</p>
              </div>
            ))}
          </div>
          <div className="space-y-1">
            {stats.months.map(([m, v]) => (
              <div key={m} className="flex items-center gap-2 text-xs">
                <span className="w-24 text-muted-foreground">{m}</span>
                <div className="h-2 flex-1 rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary to-purple-500" style={{ width: `${Math.min(100, (Number(v) / (stats.rev || 1)) * 100 * 3)}%` }} />
                </div>
                <span className="tabular-nums font-medium">{money(v)}</span>
              </div>
            ))}
          </div>
          <Button size="sm" onClick={runAi} disabled={aiBusy} className="w-full">
            {aiBusy ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : <Sparkles className="h-3.5 w-3.5 mr-1" />} AI বিজনেস পরামর্শ
          </Button>
          {ai && <div className="rounded-xl border bg-muted/40 p-3 text-sm whitespace-pre-wrap">{ai}</div>}
        </CardContent>
      </Card>
    </div>
  );
}

export function AuditLogTab() {
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("admin_audit_log").select("*").order("created_at", { ascending: false }).limit(300);
      setRows(data || []);
    })();
  }, []);

  return (
    <Card className="border-border/60">
      <CardHeader className="pb-3"><CardTitle className="text-base">অডিট লগ ({rows.length})</CardTitle></CardHeader>
      <CardContent className="space-y-1.5 max-h-[70vh] overflow-y-auto">
        {rows.map((r) => (
          <div key={r.id} className="flex items-center gap-2 rounded-lg border p-2 text-xs">
            <Badge variant="outline" className="text-[10px]">{r.action}</Badge>
            <span className="text-muted-foreground truncate flex-1">{r.entity} {r.entity_id ? `#${String(r.entity_id).slice(0, 8)}` : ""}</span>
            <span className="text-muted-foreground hidden sm:inline">{r.actor_email}</span>
            <span className="text-[10px] text-muted-foreground whitespace-nowrap">{new Date(r.created_at).toLocaleString("bn-BD")}</span>
          </div>
        ))}
        {rows.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">এখনো কোনো কার্যক্রম নেই</p>}
      </CardContent>
    </Card>
  );
}
