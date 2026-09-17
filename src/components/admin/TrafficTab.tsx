import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Globe, Users, MousePointerClick, Smartphone } from "lucide-react";
import { Area, AreaChart, Bar, BarChart, ResponsiveContainer, Tooltip as RTooltip, XAxis, YAxis } from "recharts";
import { downloadCsv } from "./shared";

const RANGES = [7, 30, 90];

export default function TrafficTab() {
  const [days, setDays] = useState(30);
  const [visits, setVisits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data } = await supabase.from("site_visits").select("*")
        .gte("created_at", new Date(Date.now() - days * 864e5).toISOString())
        .order("created_at", { ascending: false }).limit(5000);
      setVisits(data || []); setLoading(false);
    })();
  }, [days]);

  const stats = useMemo(() => {
    const sessions = new Set(visits.map((v) => v.session_id)).size;
    const mobile = visits.filter((v) => v.device === "mobile").length;
    const group = (k: string) => {
      const m: Record<string, number> = {};
      visits.forEach((v) => { const key = v[k] || "সরাসরি"; m[key] = (m[key] || 0) + 1; });
      return Object.entries(m).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 8);
    };
    const byDay: any[] = [];
    for (let i = Math.min(days, 30) - 1; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i); d.setHours(0, 0, 0, 0);
      const next = new Date(d); next.setDate(d.getDate() + 1);
      byDay.push({
        day: d.toLocaleDateString("bn-BD", { day: "numeric", month: "short" }),
        views: visits.filter((v) => { const t = new Date(v.created_at).getTime(); return t >= d.getTime() && t < next.getTime(); }).length,
      });
    }
    return { sessions, mobile, sources: group("utm_source"), campaigns: group("utm_campaign"), pages: group("path"), byDay };
  }, [visits, days]);

  if (loading) return <div className="py-10 text-center"><Loader2 className="h-5 w-5 animate-spin inline" /></div>;

  const kpi = [
    { label: "পেজ ভিউ", value: visits.length, icon: Globe },
    { label: "ভিজিটর (সেশন)", value: stats.sessions, icon: Users },
    { label: "মোবাইল", value: `${visits.length ? Math.round((stats.mobile / visits.length) * 100) : 0}%`, icon: Smartphone },
    { label: "টপ সোর্স", value: stats.sources[0]?.name || "—", icon: MousePointerClick },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        {RANGES.map((d) => (
          <Button key={d} size="sm" variant={days === d ? "default" : "outline"} onClick={() => setDays(d)}>{d} দিন</Button>
        ))}
        <div className="flex-1" />
        <Button size="sm" variant="outline" onClick={() => downloadCsv(`traffic-${Date.now()}.csv`, visits)}>CSV</Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        {kpi.map((k) => {
          const I = k.icon;
          return (
            <div key={k.label} className="rounded-xl border p-3">
              <I className="h-4 w-4 text-primary" />
              <p className="text-lg font-bold mt-1 truncate">{k.value}</p>
              <p className="text-[10px] text-muted-foreground">{k.label}</p>
            </div>
          );
        })}
      </div>

      <Card className="border-border/60">
        <CardHeader className="pb-2"><CardTitle className="text-sm">দৈনিক ভিজিট</CardTitle></CardHeader>
        <CardContent>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.byDay}>
                <defs><linearGradient id="vis" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient></defs>
                <XAxis dataKey="day" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10 }} width={32} tickLine={false} axisLine={false} />
                <RTooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                <Area type="monotone" dataKey="views" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#vis)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {[
          { title: "কোথা থেকে এসেছে (সোর্স)", data: stats.sources },
          { title: "ক্যাম্পেইন", data: stats.campaigns },
          { title: "জনপ্রিয় পেজ", data: stats.pages },
        ].map((b) => (
          <Card key={b.title} className="border-border/60">
            <CardHeader className="pb-2"><CardTitle className="text-sm">{b.title}</CardTitle></CardHeader>
            <CardContent>
              {b.data.length === 0 ? <p className="text-xs text-muted-foreground py-6 text-center">ডেটা নেই</p> : (
                <div className="h-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={b.data} layout="vertical" margin={{ left: 4, right: 10 }}>
                      <XAxis type="number" hide />
                      <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                      <RTooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                      <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 6, 6, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      <p className="text-[11px] text-muted-foreground">
        টিপ: বিজ্ঞাপনের লিংকে <code>?utm_source=facebook&amp;utm_campaign=eid</code> যোগ করলে কোন বিজ্ঞাপন থেকে কত ভিজিট এলো এখানে দেখা যাবে।
      </p>
    </div>
  );
}
