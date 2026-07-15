import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import {
  LayoutDashboard, ShoppingCart, Wrench, Inbox, Users, Package, Briefcase,
  Tag, Home as HomeIcon, Star, FolderKanban, Code2, Trash2, RefreshCw,
  ExternalLink, DollarSign, TrendingUp, Loader2, Sparkles, Activity,
  ArrowUpRight, LogOut, Zap, Eye,
} from "lucide-react";
import {
  Area, AreaChart, ResponsiveContainer, Tooltip as RTooltip, XAxis, YAxis,
  PieChart, Pie, Cell, BarChart, Bar,
} from "recharts";

type Section = "overview" | "orders" | "service-orders" | "requests" | "customers" |
  "products" | "services" | "marketplace" | "rentals" | "reviews" | "portfolio" | "site";

const NAV: { key: Section; label: string; icon: any; hint?: string }[] = [
  { key: "overview", label: "ওভারভিউ", icon: LayoutDashboard, hint: "Live KPIs" },
  { key: "orders", label: "শপ অর্ডার", icon: ShoppingCart },
  { key: "service-orders", label: "সার্ভিস অর্ডার", icon: Wrench },
  { key: "requests", label: "সার্ভিস রিকোয়েস্ট", icon: Inbox },
  { key: "customers", label: "কাস্টমার", icon: Users },
  { key: "products", label: "প্রোডাক্ট", icon: Package },
  { key: "services", label: "সার্ভিস ক্যাটালগ", icon: Briefcase },
  { key: "marketplace", label: "মার্কেটপ্লেস", icon: Tag },
  { key: "rentals", label: "রেন্টাল", icon: HomeIcon },
  { key: "reviews", label: "রিভিউ", icon: Star },
  { key: "portfolio", label: "পোর্টফোলিও", icon: FolderKanban },
  { key: "site", label: "সাইট ও ডিজাইন", icon: Code2 },
];

const ORDER_STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled", "refunded"];
const REQ_STATUSES = ["pending", "in_progress", "completed", "cancelled"];

const statusColor = (s: string) => ({
  pending: "bg-yellow-500", processing: "bg-blue-500", shipped: "bg-purple-500",
  delivered: "bg-green-600", completed: "bg-green-600", in_progress: "bg-blue-500",
  cancelled: "bg-red-500", refunded: "bg-gray-500",
}[s] || "bg-gray-400");

export default function AdminDashboard() {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [section, setSection] = useState<Section>("overview");

  useEffect(() => {
    if (loading) return;
    if (!user) { navigate("/auth"); return; }
    (async () => {
      const { data } = await supabase.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin").maybeSingle();
      setIsAdmin(!!data);
    })();
  }, [user, loading, navigate]);

  if (loading || isAdmin === null) return <div className="container py-20 text-center"><Loader2 className="h-6 w-6 animate-spin inline" /></div>;
  if (!isAdmin) return (
    <div className="container py-20 text-center space-y-2">
      <h1 className="text-2xl font-bold">অ্যাকসেস নেই</h1>
      <p className="text-sm text-muted-foreground">আপনার অ্যাকাউন্টে <code>admin</code> রোল নেই।</p>
    </div>
  );

  const activeNav = NAV.find(n => n.key === section)!;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      {/* Premium top bar */}
      <div className="sticky top-0 z-30 border-b border-border/60 bg-background/70 backdrop-blur-xl">
        <div className="container py-3 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary via-primary/80 to-purple-500 grid place-items-center shadow-lg shadow-primary/30">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-base sm:text-lg font-bold leading-tight truncate flex items-center gap-2">
              কন্ট্রোল সেন্টার
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 gap-1"><span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" /> Live</Badge>
            </h1>
            <p className="text-[11px] text-muted-foreground truncate">{user?.email} • Super Admin</p>
          </div>
          <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex"><Link to="/"><Eye className="h-4 w-4 mr-1" />সাইট দেখুন</Link></Button>
          <Button variant="ghost" size="icon" onClick={signOut} title="Logout"><LogOut className="h-4 w-4" /></Button>
        </div>
      </div>

      <div className="container py-5">
        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-5">
          {/* Sidebar */}
          <aside className="lg:sticky lg:top-[76px] lg:self-start">
            <Card className="overflow-hidden border-border/60 shadow-sm">
              <div className="p-2 space-y-0.5 max-h-[70vh] overflow-y-auto">
                {NAV.map((n) => {
                  const I = n.icon;
                  const active = section === n.key;
                  return (
                    <button
                      key={n.key}
                      onClick={() => setSection(n.key)}
                      className={`group relative w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                        active
                          ? "bg-gradient-to-r from-primary to-primary/70 text-primary-foreground shadow-md shadow-primary/20"
                          : "hover:bg-muted text-foreground/70 hover:text-foreground"
                      }`}
                    >
                      <I className={`h-4 w-4 shrink-0 ${active ? "" : "text-muted-foreground group-hover:text-primary"}`} />
                      <span className="flex-1 text-left truncate">{n.label}</span>
                      {active && <ArrowUpRight className="h-3.5 w-3.5 opacity-70" />}
                    </button>
                  );
                })}
              </div>
              <div className="border-t border-border/60 p-3 bg-muted/30 space-y-2">
                <Button asChild size="sm" variant="outline" className="w-full justify-start text-xs">
                  <Link to="/admin"><Package className="h-3.5 w-3.5 mr-1.5" /> পুরনো প্যানেল</Link>
                </Button>
                <Button asChild size="sm" variant="outline" className="w-full justify-start text-xs">
                  <Link to="/admin/portfolio"><FolderKanban className="h-3.5 w-3.5 mr-1.5" /> পোর্টফোলিও এডিট</Link>
                </Button>
              </div>
            </Card>
          </aside>

          {/* Main */}
          <main className="min-w-0 space-y-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <activeNav.icon className="h-3.5 w-3.5" />
              <span>Dashboard</span>
              <span>/</span>
              <span className="text-foreground font-medium">{activeNav.label}</span>
            </div>

            {section === "overview" && <Overview onNav={setSection} />}
            {section === "orders" && <OrdersTab />}
            {section === "service-orders" && <ServiceOrdersTab />}
            {section === "requests" && <RequestsTab />}
            {section === "customers" && <CustomersTab />}
            {section === "products" && <SimpleEntityTab table="shop_products" label="প্রোডাক্ট" editPath="/admin" />}
            {section === "services" && <SimpleEntityTab table="services_catalog" label="সার্ভিস" editPath="/admin" />}
            {section === "marketplace" && <SimpleEntityTab table="marketplace_items" label="মার্কেটপ্লেস আইটেম" editPath="/marketplace" />}
            {section === "rentals" && <SimpleEntityTab table="rentals" label="রেন্টাল" editPath="/rentals" />}
            {section === "reviews" && <ReviewsTab />}
            {section === "portfolio" && <PortfolioRedirect />}
            {section === "site" && <SiteEditingNote />}
          </main>
        </div>
      </div>
    </div>
  );
}

/* ============== Overview ============== */
function Overview({ onNav }: { onNav: (s: Section) => void }) {
  const [stats, setStats] = useState<any>(null);
  const [recent, setRecent] = useState<any[]>([]);
  const [trend, setTrend] = useState<any[]>([]);
  const [statusMix, setStatusMix] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const [orders, sOrders, reqs, products, services, customers, marketplace, rentals, recentOrders] = await Promise.all([
        supabase.from("shop_orders").select("total_amount,status,created_at,product_name"),
        supabase.from("service_orders").select("quoted_amount,status,created_at"),
        supabase.from("service_requests").select("id,status"),
        supabase.from("shop_products").select("id", { count: "exact", head: true }),
        supabase.from("services_catalog").select("id", { count: "exact", head: true }),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("marketplace_items").select("id", { count: "exact", head: true }),
        supabase.from("rentals").select("id", { count: "exact", head: true }),
        supabase.from("shop_orders").select("id,customer_name,product_name,total_amount,status,created_at").order("created_at", { ascending: false }).limit(6),
      ]);

      const oData = orders.data || [];
      const sData = sOrders.data || [];
      const totalRev = oData.reduce((s, o: any) => s + Number(o.total_amount || 0), 0)
        + sData.reduce((s, o: any) => s + Number(o.quoted_amount || 0), 0);
      const pending = oData.filter((o: any) => o.status === "pending").length
        + sData.filter((o: any) => o.status === "pending").length;

      // 14-day trend
      const days: any[] = [];
      const now = new Date();
      for (let i = 13; i >= 0; i--) {
        const d = new Date(now); d.setDate(now.getDate() - i); d.setHours(0, 0, 0, 0);
        const next = new Date(d); next.setDate(d.getDate() + 1);
        const rev = oData.filter((o: any) => {
          const t = new Date(o.created_at).getTime();
          return t >= d.getTime() && t < next.getTime();
        }).reduce((s, o: any) => s + Number(o.total_amount || 0), 0);
        const cnt = oData.filter((o: any) => {
          const t = new Date(o.created_at).getTime();
          return t >= d.getTime() && t < next.getTime();
        }).length;
        days.push({ day: d.toLocaleDateString("bn-BD", { day: "numeric", month: "short" }), revenue: rev, orders: cnt });
      }

      // Status mix
      const mix: Record<string, number> = {};
      oData.forEach((o: any) => { const k = o.status || "pending"; mix[k] = (mix[k] || 0) + 1; });
      const mixArr = Object.entries(mix).map(([name, value]) => ({ name, value }));

      // Top products
      const prodMap: Record<string, { name: string; count: number; revenue: number }> = {};
      oData.forEach((o: any) => {
        const k = o.product_name || "—";
        if (!prodMap[k]) prodMap[k] = { name: k, count: 0, revenue: 0 };
        prodMap[k].count++; prodMap[k].revenue += Number(o.total_amount || 0);
      });
      const topArr = Object.values(prodMap).sort((a, b) => b.revenue - a.revenue).slice(0, 5);

      setStats({
        revenue: totalRev, orders: oData.length, serviceOrders: sData.length,
        requests: (reqs.data || []).length, pending,
        products: products.count || 0, services: services.count || 0,
        customers: customers.count || 0, marketplace: marketplace.count || 0, rentals: rentals.count || 0,
      });
      setRecent(recentOrders.data || []);
      setTrend(days);
      setStatusMix(mixArr);
      setTopProducts(topArr);
    })();
  }, []);

  if (!stats) return <div className="text-center py-20"><Loader2 className="h-6 w-6 animate-spin inline text-primary" /></div>;

  const kpis = [
    { label: "মোট আয়", value: `৳${stats.revenue.toLocaleString()}`, icon: DollarSign, tone: "from-emerald-500 to-green-600", chip: "All-time" },
    { label: "পেন্ডিং অর্ডার", value: stats.pending, icon: Activity, tone: "from-amber-500 to-orange-600", chip: "Needs action" },
    { label: "মোট অর্ডার", value: stats.orders + stats.serviceOrders, icon: ShoppingCart, tone: "from-blue-500 to-indigo-600", chip: `Shop ${stats.orders} • Svc ${stats.serviceOrders}` },
    { label: "কাস্টমার", value: stats.customers, icon: Users, tone: "from-purple-500 to-pink-600", chip: "Signed-up" },
  ];

  const invCards = [
    { k: "products", label: "প্রোডাক্ট", value: stats.products, icon: Package },
    { k: "services", label: "সার্ভিস", value: stats.services, icon: Briefcase },
    { k: "marketplace", label: "মার্কেটপ্লেস", value: stats.marketplace, icon: Tag },
    { k: "rentals", label: "রেন্টাল", value: stats.rentals, icon: HomeIcon },
    { k: "requests", label: "রিকোয়েস্ট", value: stats.requests, icon: Inbox },
  ] as const;

  const PIE_COLORS = ["#f59e0b", "#3b82f6", "#a855f7", "#10b981", "#ef4444", "#6b7280"];

  return (
    <div className="space-y-4">
      {/* Hero KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {kpis.map((c) => {
          const I = c.icon;
          return (
            <div key={c.label} className="relative overflow-hidden rounded-2xl border border-border/60 bg-card p-4 shadow-sm hover:shadow-lg transition-shadow group">
              <div className={`absolute -top-6 -right-6 h-20 w-20 rounded-full bg-gradient-to-br ${c.tone} opacity-20 blur-xl group-hover:opacity-40 transition-opacity`} />
              <div className={`inline-flex items-center justify-center h-9 w-9 rounded-xl bg-gradient-to-br ${c.tone} text-white shadow-md`}>
                <I className="h-4 w-4" />
              </div>
              <p className="text-[11px] text-muted-foreground mt-3">{c.label}</p>
              <p className="text-xl sm:text-2xl font-bold mt-0.5 tabular-nums">{c.value}</p>
              <p className="text-[10px] text-muted-foreground mt-1 truncate">{c.chip}</p>
            </div>
          );
        })}
      </div>

      {/* Revenue trend + status mix */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <Card className="lg:col-span-2 border-border/60">
          <CardHeader className="pb-2 flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-sm font-semibold flex items-center gap-2"><TrendingUp className="h-4 w-4 text-primary" /> ১৪ দিনের রেভিনিউ</CardTitle>
              <p className="text-[11px] text-muted-foreground mt-0.5">Shop orders মিলে দৈনিক আয়</p>
            </div>
            <Badge variant="secondary" className="text-[10px]">Live</Badge>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trend} margin={{ left: 0, right: 8, top: 4, bottom: 0 }}>
                  <defs>
                    <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} width={40} />
                  <RTooltip
                    contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                    formatter={(v: any) => [`৳${Number(v).toLocaleString()}`, "রেভিনিউ"]}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#rev)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">অর্ডার স্ট্যাটাস</CardTitle>
            <p className="text-[11px] text-muted-foreground">Shop orders breakdown</p>
          </CardHeader>
          <CardContent>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusMix} dataKey="value" nameKey="name" innerRadius={40} outerRadius={65} paddingAngle={2}>
                    {statusMix.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <RTooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-1 mt-2">
              {statusMix.slice(0, 4).map((s, i) => (
                <div key={s.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} /><span className="capitalize">{s.name}</span></div>
                  <span className="font-semibold tabular-nums">{s.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Inventory quick nav */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
        {invCards.map((c) => {
          const I = c.icon;
          return (
            <button key={c.k} onClick={() => onNav(c.k as Section)}
              className="group rounded-xl border border-border/60 bg-card p-3 text-left hover:border-primary/50 hover:shadow-md transition-all">
              <I className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              <p className="text-[11px] text-muted-foreground mt-2">{c.label}</p>
              <p className="text-lg font-bold tabular-nums">{c.value}</p>
            </button>
          );
        })}
      </div>

      {/* Recent orders + top products */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
        <Card className="lg:col-span-3 border-border/60">
          <CardHeader className="pb-2 flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-semibold flex items-center gap-2"><Zap className="h-4 w-4 text-amber-500" /> সাম্প্রতিক অর্ডার</CardTitle>
            <Button size="sm" variant="ghost" className="text-xs h-7" onClick={() => onNav("orders")}>সব দেখুন <ArrowUpRight className="h-3 w-3 ml-0.5" /></Button>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-1.5">
              {recent.map((o) => (
                <div key={o.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/60 transition-colors">
                  <div className={`h-8 w-8 rounded-lg grid place-items-center text-white text-xs font-bold ${statusColor(o.status)}`}>
                    {(o.customer_name || "?").charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold truncate">{o.customer_name || "—"}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{o.product_name}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-bold tabular-nums">৳{Number(o.total_amount).toLocaleString()}</p>
                    <p className="text-[10px] text-muted-foreground">{new Date(o.created_at).toLocaleDateString("bn-BD")}</p>
                  </div>
                </div>
              ))}
              {recent.length === 0 && <p className="text-center text-xs text-muted-foreground py-8">কোন অর্ডার নেই</p>}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">টপ প্রোডাক্ট</CardTitle>
            <p className="text-[11px] text-muted-foreground">রেভিনিউ অনুসারে</p>
          </CardHeader>
          <CardContent>
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProducts} layout="vertical" margin={{ left: 0, right: 8 }}>
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={80} stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} />
                  <RTooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} formatter={(v: any) => [`৳${Number(v).toLocaleString()}`, "রেভিনিউ"]} />
                  <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            {topProducts.length === 0 && <p className="text-center text-xs text-muted-foreground py-4">ডাটা নেই</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/* ============== Orders ============== */
function OrdersTab() {
  const [rows, setRows] = useState<any[]>([]);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("shop_orders").select("*").order("created_at", { ascending: false }).limit(200);
    setRows(data || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("shop_orders").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("স্ট্যাটাস আপডেট হয়েছে");
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("ডিলিট করবেন?")) return;
    await supabase.from("shop_orders").delete().eq("id", id);
    load();
  };

  const filtered = rows.filter(r =>
    (filter === "all" || r.status === filter) &&
    (!q || [r.customer_name, r.customer_phone, r.product_name].some(v => v?.toLowerCase().includes(q.toLowerCase())))
  );

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between gap-2 items-center flex-wrap">
          <CardTitle className="text-base">শপ অর্ডার ({filtered.length})</CardTitle>
          <Button size="sm" variant="ghost" onClick={load}><RefreshCw className="h-4 w-4" /></Button>
        </div>
        <div className="flex gap-2 flex-wrap pt-2">
          <Input placeholder="সার্চ..." value={q} onChange={(e) => setQ(e.target.value)} className="max-w-xs" />
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">সব</SelectItem>
              {ORDER_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        {loading ? <Loader2 className="h-6 w-6 animate-spin mx-auto" /> : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>তারিখ</TableHead><TableHead>কাস্টমার</TableHead><TableHead>প্রোডাক্ট</TableHead>
                <TableHead>মোট</TableHead><TableHead>স্ট্যাটাস</TableHead><TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="text-xs">{new Date(r.created_at).toLocaleDateString("bn-BD")}</TableCell>
                  <TableCell className="text-xs">
                    <div className="font-medium">{r.customer_name}</div>
                    <div className="text-muted-foreground">{r.customer_phone}</div>
                  </TableCell>
                  <TableCell className="text-xs">{r.product_name} ×{r.quantity}</TableCell>
                  <TableCell className="text-xs font-semibold">৳{Number(r.total_amount).toLocaleString()}</TableCell>
                  <TableCell>
                    <Select value={r.status || "pending"} onValueChange={(v) => updateStatus(r.id, v)}>
                      <SelectTrigger className="h-8 w-32"><Badge className={statusColor(r.status)}>{r.status}</Badge></SelectTrigger>
                      <SelectContent>{ORDER_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Button size="icon" variant="ghost" onClick={() => remove(r.id)}><Trash2 className="h-3 w-3 text-red-500" /></Button>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-6">কোন অর্ডার নেই</TableCell></TableRow>}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

/* ============== Service Orders ============== */
function ServiceOrdersTab() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("service_orders").select("*").order("created_at", { ascending: false }).limit(200);
    setRows(data || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("service_orders").update({ status }).eq("id", id);
    toast.success("আপডেট হয়েছে"); load();
  };

  return (
    <Card>
      <CardHeader><CardTitle className="text-base">সার্ভিস অর্ডার ({rows.length})</CardTitle></CardHeader>
      <CardContent className="overflow-x-auto">
        {loading ? <Loader2 className="h-6 w-6 animate-spin mx-auto" /> : (
          <Table>
            <TableHeader><TableRow>
              <TableHead>তারিখ</TableHead><TableHead>কাস্টমার</TableHead><TableHead>সার্ভিস</TableHead>
              <TableHead>কোট</TableHead><TableHead>স্ট্যাটাস</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="text-xs">{new Date(r.created_at).toLocaleDateString("bn-BD")}</TableCell>
                  <TableCell className="text-xs"><div className="font-medium">{r.customer_name}</div><div className="text-muted-foreground">{r.customer_phone}</div></TableCell>
                  <TableCell className="text-xs">{r.service_name}</TableCell>
                  <TableCell className="text-xs">৳{Number(r.quoted_amount || 0).toLocaleString()}</TableCell>
                  <TableCell>
                    <Select value={r.status || "pending"} onValueChange={(v) => updateStatus(r.id, v)}>
                      <SelectTrigger className="h-8 w-32"><Badge className={statusColor(r.status)}>{r.status}</Badge></SelectTrigger>
                      <SelectContent>{REQ_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
              {rows.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-6">কোন অর্ডার নেই</TableCell></TableRow>}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

/* ============== Requests ============== */
function RequestsTab() {
  const [rows, setRows] = useState<any[]>([]);
  const load = async () => {
    const { data } = await supabase.from("service_requests").select("*").order("created_at", { ascending: false }).limit(200);
    setRows(data || []);
  };
  useEffect(() => { load(); }, []);

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("service_requests").update({ status }).eq("id", id);
    toast.success("আপডেট হয়েছে"); load();
  };

  return (
    <Card>
      <CardHeader><CardTitle className="text-base">সার্ভিস রিকোয়েস্ট ({rows.length})</CardTitle></CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader><TableRow>
            <TableHead>তারিখ</TableHead><TableHead>নাম</TableHead><TableHead>সার্ভিস</TableHead>
            <TableHead>বাজেট</TableHead><TableHead>স্ট্যাটাস</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="text-xs">{new Date(r.created_at).toLocaleDateString("bn-BD")}</TableCell>
                <TableCell className="text-xs"><div className="font-medium">{r.name}</div><div className="text-muted-foreground">{r.phone}</div></TableCell>
                <TableCell className="text-xs">{r.service_type}{r.urgent && <Badge variant="destructive" className="ml-1 text-[10px]">জরুরি</Badge>}</TableCell>
                <TableCell className="text-xs">{r.budget}</TableCell>
                <TableCell>
                  <Select value={r.status || "pending"} onValueChange={(v) => updateStatus(r.id, v)}>
                    <SelectTrigger className="h-8 w-32"><Badge className={statusColor(r.status)}>{r.status}</Badge></SelectTrigger>
                    <SelectContent>{REQ_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

/* ============== Customers ============== */
function CustomersTab() {
  const [rows, setRows] = useState<any[]>([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("profiles").select("*").order("created_at", { ascending: false }).limit(500);
      setRows(data || []);
    })();
  }, []);

  const filtered = rows.filter(r => !q || [r.full_name, r.phone].some(v => v?.toLowerCase().includes(q.toLowerCase())));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">কাস্টমার ({filtered.length})</CardTitle>
        <Input placeholder="নাম/ফোন সার্চ..." value={q} onChange={(e) => setQ(e.target.value)} className="max-w-xs mt-2" />
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader><TableRow>
            <TableHead>নাম</TableHead><TableHead>ফোন</TableHead><TableHead>আয় (মাসিক)</TableHead><TableHead>জয়েন</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {filtered.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="text-sm font-medium">{r.full_name || "—"}</TableCell>
                <TableCell className="text-xs">{r.phone || "—"}</TableCell>
                <TableCell className="text-xs">{r.monthly_income ? `৳${r.monthly_income.toLocaleString()}` : "—"}</TableCell>
                <TableCell className="text-xs">{new Date(r.created_at).toLocaleDateString("bn-BD")}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

/* ============== Simple list with delete + edit link ============== */
function SimpleEntityTab({ table, label, editPath }: { table: any; label: string; editPath: string }) {
  const [rows, setRows] = useState<any[]>([]);
  const load = async () => {
    const { data } = await supabase.from(table).select("*").order("created_at", { ascending: false }).limit(200);
    setRows(data || []);
  };
  useEffect(() => { load(); }, [table]);

  const remove = async (id: string) => {
    if (!confirm("ডিলিট করবেন?")) return;
    await supabase.from(table).delete().eq("id", id);
    load();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-base">{label} ({rows.length})</CardTitle>
          <Button asChild size="sm" variant="outline"><Link to={editPath}><ExternalLink className="h-3 w-3 mr-1" /> এডিট পেজ</Link></Button>
        </div>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader><TableRow><TableHead>নাম/টাইটেল</TableHead><TableHead>মূল্য</TableHead><TableHead>তৈরি</TableHead><TableHead></TableHead></TableRow></TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="text-sm font-medium">{r.name || r.title || "—"}</TableCell>
                <TableCell className="text-xs">৳{(r.price ?? r.starting_price ?? 0).toLocaleString()}</TableCell>
                <TableCell className="text-xs">{new Date(r.created_at).toLocaleDateString("bn-BD")}</TableCell>
                <TableCell><Button size="icon" variant="ghost" onClick={() => remove(r.id)}><Trash2 className="h-3 w-3 text-red-500" /></Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

/* ============== Reviews ============== */
function ReviewsTab() {
  const [rows, setRows] = useState<any[]>([]);
  const load = async () => {
    const { data } = await supabase.from("product_reviews").select("*").order("created_at", { ascending: false }).limit(200);
    setRows(data || []);
  };
  useEffect(() => { load(); }, []);

  const toggle = async (id: string, is_approved: boolean) => {
    await supabase.from("product_reviews").update({ is_approved: !is_approved }).eq("id", id);
    load();
  };
  const remove = async (id: string) => {
    if (!confirm("ডিলিট করবেন?")) return;
    await supabase.from("product_reviews").delete().eq("id", id);
    load();
  };

  return (
    <Card>
      <CardHeader><CardTitle className="text-base">রিভিউ ({rows.length})</CardTitle></CardHeader>
      <CardContent className="space-y-2">
        {rows.map((r) => (
          <div key={r.id} className="border rounded-lg p-3 flex justify-between items-start gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex gap-2 items-center text-xs">
                <span className="font-semibold">{r.reviewer_name}</span>
                <span>{"⭐".repeat(r.rating)}</span>
                {r.is_approved && <Badge variant="default" className="text-[10px]">approved</Badge>}
              </div>
              <p className="text-sm mt-1">{r.comment}</p>
            </div>
            <div className="flex gap-1">
              <Button size="sm" variant="outline" onClick={() => toggle(r.id, r.is_approved)}>{r.is_approved ? "Unapprove" : "Approve"}</Button>
              <Button size="icon" variant="ghost" onClick={() => remove(r.id)}><Trash2 className="h-3 w-3 text-red-500" /></Button>
            </div>
          </div>
        ))}
        {rows.length === 0 && <p className="text-center text-muted-foreground py-6 text-sm">কোন রিভিউ নেই</p>}
      </CardContent>
    </Card>
  );
}

function PortfolioRedirect() {
  return (
    <Card>
      <CardContent className="py-8 text-center space-y-3">
        <FolderKanban className="h-10 w-10 mx-auto text-muted-foreground" />
        <p>পোর্টফোলিও প্রজেক্ট ও এক্সপেরিয়েন্স এডিট করুন:</p>
        <Button asChild><Link to="/admin/portfolio"><ExternalLink className="h-4 w-4 mr-1" /> পোর্টফোলিও অ্যাডমিন</Link></Button>
      </CardContent>
    </Card>
  );
}

function SiteEditingNote() {
  return (
    <Card>
      <CardHeader><CardTitle className="text-base">সাইট কোড ও ডিজাইন এডিটিং</CardTitle></CardHeader>
      <CardContent className="space-y-3 text-sm">
        <p>এই ওয়েবসাইটের কোড, ডিজাইন, লেআউট, রঙ, ফন্ট, নতুন পেজ/সেকশন যোগ — সবকিছু সরাসরি Lovable চ্যাট প্যানেল থেকে করা যায়।</p>
        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
          <li>চ্যাটে লিখুন কী চান (যেমন: "হোমে নতুন ব্যানার যোগ করো"), AI কোড পরিবর্তন করে দিবে।</li>
          <li>প্রতিটি পরিবর্তনের আগে প্রিভিউ দেখা যায়।</li>
          <li>GitHub-এ পুশ করে নিজে কোড এডিট করতে পারেন (Project Settings → GitHub)।</li>
        </ul>
        <div className="flex gap-2 flex-wrap pt-2">
          <Button asChild size="sm" variant="outline"><Link to="/admin"><Package className="h-4 w-4 mr-1" /> প্রোডাক্ট/সার্ভিস এডিট</Link></Button>
          <Button asChild size="sm" variant="outline"><Link to="/admin/portfolio"><FolderKanban className="h-4 w-4 mr-1" /> পোর্টফোলিও</Link></Button>
        </div>
        <p className="text-xs text-muted-foreground border-t pt-3">
          💡 ডাটা/অর্ডার/কাস্টমার সব ম্যানেজ করুন এই কন্ট্রোল প্যানেল থেকে। কোড/ডিজাইন পরিবর্তন চ্যাটে অনুরোধ করুন।
        </p>
      </CardContent>
    </Card>
  );
}
