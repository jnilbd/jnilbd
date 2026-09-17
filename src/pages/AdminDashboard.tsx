import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard, ShoppingCart, Wrench, Inbox, Users, Package, Briefcase, Tag, Home as HomeIcon,
  Star, FolderKanban, Loader2, Sparkles, Activity, LogOut, Eye, DollarSign, TrendingUp, Ticket,
  LifeBuoy, ShieldCheck, Image as ImageIcon, FileText, Settings, FileBarChart, ScrollText, Zap,
  Layers, Bot, Menu as MenuIcon, X, RotateCcw, AlertTriangle, Gift, Palette, Globe, PlugZap, Mail,
} from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip as RTooltip, XAxis, YAxis, PieChart, Pie, Cell, BarChart, Bar } from "recharts";

import OrdersPipeline from "@/components/admin/OrdersPipeline";
import ProductsTab from "@/components/admin/ProductsTab";
import CouponsTab from "@/components/admin/CouponsTab";
import InboxTab from "@/components/admin/InboxTab";
import RolesTab from "@/components/admin/RolesTab";
import SettingsTab from "@/components/admin/SettingsTab";
import IntegrationsTab from "@/components/admin/IntegrationsTab";
import LandingPagesTab from "@/components/admin/LandingPagesTab";
import EmailTemplatesTab from "@/components/admin/EmailTemplatesTab";
import MediaLibrary from "@/components/admin/MediaLibrary";
import CustomersTab from "@/components/admin/CustomersTab";
import AiToolsTab from "@/components/admin/AiToolsTab";
import ReturnsTab from "@/components/admin/ReturnsTab";
import StockAlertsTab from "@/components/admin/StockAlertsTab";
import TrafficTab from "@/components/admin/TrafficTab";
import AppearanceTab from "@/components/admin/AppearanceTab";
import GiveawayTab from "@/components/admin/GiveawayTab";
import { HomepageBlocksTab, BlogTab } from "@/components/admin/ContentTab";
import { ReportsTab, AuditLogTab } from "@/components/admin/ReportsTab";
import { ServiceOrdersTab, ServiceRequestsTab, ReviewsTab, SimpleEntityTab } from "@/components/admin/MiscTabs";
import { money, statusBn, statusColor } from "@/components/admin/shared";

type Section =
  | "overview" | "orders" | "returns" | "service-orders" | "requests"
  | "products" | "stock" | "coupons" | "services" | "marketplace" | "rentals" | "reviews"
  | "ai"
  | "customers" | "tickets" | "product-requests" | "giveaway" | "roles"
  | "homepage" | "blog" | "portfolio" | "media" | "appearance"
  | "landing" | "emails"
  | "reports" | "traffic" | "audit" | "integrations" | "settings";

const GROUPS: { group: string; items: { key: Section; label: string; icon: any }[] }[] = [
  {
    group: "ওভারভিউ", items: [
      { key: "overview", label: "ড্যাশবোর্ড", icon: LayoutDashboard },
    ],
  },
  {
    group: "বিক্রি ও অর্ডার", items: [
      { key: "orders", label: "অর্ডার পাইপলাইন", icon: ShoppingCart },
      { key: "returns", label: "রিটার্ন ও রিফান্ড", icon: RotateCcw },
      { key: "service-orders", label: "সার্ভিস অর্ডার", icon: Wrench },
      { key: "requests", label: "সার্ভিস রিকোয়েস্ট", icon: Inbox },
    ],
  },
  {
    group: "পণ্য ও ইনভেন্টরি", items: [
      { key: "products", label: "প্রোডাক্ট", icon: Package },
      { key: "stock", label: "স্টক অ্যালার্ট", icon: AlertTriangle },
      { key: "coupons", label: "কুপন", icon: Ticket },
      { key: "services", label: "সার্ভিস ক্যাটালগ", icon: Briefcase },
      { key: "marketplace", label: "মার্কেটপ্লেস", icon: Tag },
      { key: "rentals", label: "রেন্টাল", icon: HomeIcon },
      { key: "reviews", label: "রিভিউ", icon: Star },
    ],
  },
  {
    group: "AI ইঞ্জিন", items: [
      { key: "ai", label: "AI টুলস", icon: Bot },
    ],
  },
  {
    group: "কাস্টমার", items: [
      { key: "customers", label: "কাস্টমার", icon: Users },
      { key: "tickets", label: "সাপোর্ট টিকিট", icon: LifeBuoy },
      { key: "product-requests", label: "প্রোডাক্ট রিকোয়েস্ট", icon: Layers },
      { key: "giveaway", label: "গিভঅ্যাওয়ে / ফ্রি ড্রপ", icon: Gift },
      { key: "roles", label: "রোল ও অ্যাকসেস", icon: ShieldCheck },
    ],
  },
  {
    group: "কনটেন্ট ও সাইট", items: [
      { key: "homepage", label: "হোমপেজ ও ব্যানার", icon: FileText },
      { key: "appearance", label: "থিম, পপআপ ও মেনু", icon: Palette },
      { key: "blog", label: "ব্লগ", icon: ScrollText },
      { key: "portfolio", label: "পোর্টফোলিও", icon: FolderKanban },
      { key: "landing", label: "ল্যান্ডিং পেজ বিল্ডার", icon: Layers },
      { key: "emails", label: "ইমেইল টেমপ্লেট", icon: Mail },
      { key: "media", label: "মিডিয়া লাইব্রেরি", icon: ImageIcon },
    ],
  },
  {
    group: "রিপোর্ট ও সিস্টেম", items: [
      { key: "reports", label: "স্মার্ট রিপোর্ট", icon: FileBarChart },
      { key: "traffic", label: "ভিজিটর ও অ্যাড সোর্স", icon: Globe },
      { key: "audit", label: "অডিট লগ", icon: Activity },
      { key: "integrations", label: "ইন্টিগ্রেশন ও API কী", icon: PlugZap },
      { key: "settings", label: "সেটিংস", icon: Settings },
    ],
  },
];

const ALL_ITEMS = GROUPS.flatMap((g) => g.items);

export default function AdminDashboard() {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [section, setSection] = useState<Section>("overview");
  const [navOpen, setNavOpen] = useState(false);

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

  const active = ALL_ITEMS.find((i) => i.key === section)!;

  const Nav = (
    <div className="p-2 space-y-3 max-h-[75vh] overflow-y-auto">
      {GROUPS.map((g) => (
        <div key={g.group}>
          <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{g.group}</p>
          <div className="space-y-0.5">
            {g.items.map((n) => {
              const I = n.icon;
              const on = section === n.key;
              return (
                <button key={n.key} onClick={() => { setSection(n.key); setNavOpen(false); }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    on ? "bg-gradient-to-r from-primary to-primary/70 text-primary-foreground shadow-md shadow-primary/20" : "hover:bg-muted text-foreground/70 hover:text-foreground"
                  }`}>
                  <I className={`h-4 w-4 shrink-0 ${on ? "" : "text-muted-foreground"}`} />
                  <span className="flex-1 text-left truncate">{n.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <div className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="container py-3 flex items-center gap-3">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setNavOpen((v) => !v)}>
            {navOpen ? <X className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
          </Button>
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
        {navOpen && <div className="lg:hidden border-t border-border/60 bg-background">{Nav}</div>}
      </div>

      <div className="container py-5">
        <div className="grid grid-cols-1 lg:grid-cols-[250px_1fr] gap-5">
          <aside className="hidden lg:block lg:sticky lg:top-[76px] lg:self-start">
            <Card className="overflow-hidden border-border/60 shadow-sm">
              {Nav}
              <div className="border-t border-border/60 p-3 bg-muted/30 space-y-2">
                <Button asChild size="sm" variant="outline" className="w-full justify-start text-xs">
                  <Link to="/admin"><Package className="h-3.5 w-3.5 mr-1.5" /> পুরনো প্যানেল</Link>
                </Button>
              </div>
            </Card>
          </aside>

          <main className="min-w-0 space-y-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <active.icon className="h-3.5 w-3.5" />
              <span>কন্ট্রোল সেন্টার</span><span>/</span>
              <span className="text-foreground font-medium">{active.label}</span>
            </div>

            {section === "overview" && <Overview onNav={setSection} />}
            {section === "orders" && <OrdersPipeline />}
            {section === "returns" && <ReturnsTab />}
            {section === "stock" && <StockAlertsTab />}
            {section === "giveaway" && <GiveawayTab />}
            {section === "appearance" && <AppearanceTab />}
            {section === "traffic" && <TrafficTab />}
            {section === "service-orders" && <ServiceOrdersTab />}
            {section === "requests" && <ServiceRequestsTab />}
            {section === "products" && <ProductsTab />}
            {section === "coupons" && <CouponsTab />}
            {section === "services" && <SimpleEntityTab table="services_catalog" label="সার্ভিস ক্যাটালগ" editPath="/services" />}
            {section === "marketplace" && <SimpleEntityTab table="marketplace_items" label="মার্কেটপ্লেস আইটেম" editPath="/marketplace" />}
            {section === "rentals" && <SimpleEntityTab table="rentals" label="রেন্টাল" editPath="/rentals" />}
            {section === "reviews" && <ReviewsTab />}
            {section === "ai" && <AiToolsTab />}
            {section === "customers" && <CustomersTab />}
            {section === "tickets" && <InboxTab kind="tickets" />}
            {section === "product-requests" && <InboxTab kind="product-requests" />}
            {section === "roles" && <RolesTab />}
            {section === "homepage" && <HomepageBlocksTab />}
            {section === "blog" && <BlogTab />}
            {section === "portfolio" && (
              <Card className="border-border/60"><CardContent className="py-10 text-center space-y-3">
                <FolderKanban className="h-8 w-8 mx-auto text-primary" />
                <p className="text-sm text-muted-foreground">পোর্টফোলিও প্রজেক্ট ও অভিজ্ঞতা আলাদা পেজে এডিট করুন।</p>
                <Button asChild size="sm"><Link to="/admin/portfolio">পোর্টফোলিও এডিটর খুলুন</Link></Button>
              </CardContent></Card>
            )}
            {section === "media" && <MediaLibrary />}
            {section === "reports" && <ReportsTab />}
            {section === "audit" && <AuditLogTab />}
            {section === "integrations" && <IntegrationsTab />}
            {section === "settings" && <SettingsTab />}
          </main>
        </div>
      </div>
    </div>
  );
}

/* ================= Overview ================= */
function Overview({ onNav }: { onNav: (s: Section) => void }) {
  const [stats, setStats] = useState<any>(null);
  const [recent, setRecent] = useState<any[]>([]);
  const [trend, setTrend] = useState<any[]>([]);
  const [statusMix, setStatusMix] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const [orders, sOrders, reqs, products, services, customers, marketplace, rentals, tickets, recentOrders] = await Promise.all([
        supabase.from("shop_orders").select("total_amount,status,created_at,product_name,product_type"),
        supabase.from("service_orders").select("quoted_amount,status,created_at"),
        supabase.from("service_requests").select("id,status"),
        supabase.from("shop_products").select("id", { count: "exact", head: true }),
        supabase.from("services_catalog").select("id", { count: "exact", head: true }),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("marketplace_items").select("id", { count: "exact", head: true }),
        supabase.from("rentals").select("id", { count: "exact", head: true }),
        supabase.from("support_tickets").select("id,status"),
        supabase.from("shop_orders").select("id,customer_name,product_name,total_amount,status,created_at").order("created_at", { ascending: false }).limit(6),
      ]);

      const oData = orders.data || [];
      const sData = sOrders.data || [];
      const live = oData.filter((o: any) => !["cancelled", "refunded"].includes(o.status));
      const sum = (arr: any[], k: string) => arr.reduce((s, o) => s + Number(o[k] || 0), 0);

      const days: any[] = [];
      const now = new Date();
      for (let i = 13; i >= 0; i--) {
        const d = new Date(now); d.setDate(now.getDate() - i); d.setHours(0, 0, 0, 0);
        const next = new Date(d); next.setDate(d.getDate() + 1);
        const inDay = live.filter((o: any) => { const t = new Date(o.created_at).getTime(); return t >= d.getTime() && t < next.getTime(); });
        days.push({ day: d.toLocaleDateString("bn-BD", { day: "numeric", month: "short" }), revenue: sum(inDay, "total_amount"), orders: inDay.length });
      }

      const mix: Record<string, number> = {};
      oData.forEach((o: any) => { const k = o.status || "pending"; mix[k] = (mix[k] || 0) + 1; });

      const prodMap: Record<string, { name: string; revenue: number }> = {};
      live.forEach((o: any) => {
        const k = o.product_name || "—";
        if (!prodMap[k]) prodMap[k] = { name: k, revenue: 0 };
        prodMap[k].revenue += Number(o.total_amount || 0);
      });

      setStats({
        revenue: sum(live, "total_amount") + sum(sData.filter((o: any) => o.status !== "cancelled"), "quoted_amount"),
        digitalRev: sum(live.filter((o: any) => o.product_type === "digital"), "total_amount"),
        physicalRev: sum(live.filter((o: any) => o.product_type === "physical"), "total_amount"),
        serviceRev: sum(sData.filter((o: any) => o.status !== "cancelled"), "quoted_amount"),
        orders: oData.length, serviceOrders: sData.length,
        pending: oData.filter((o: any) => o.status === "pending").length + sData.filter((o: any) => o.status === "pending").length,
        requests: (reqs.data || []).length,
        openTickets: (tickets.data || []).filter((t: any) => t.status === "open").length,
        products: products.count || 0, services: services.count || 0, customers: customers.count || 0,
        marketplace: marketplace.count || 0, rentals: rentals.count || 0,
      });
      setRecent(recentOrders.data || []);
      setTrend(days);
      setStatusMix(Object.entries(mix).map(([name, value]) => ({ name, value })));
      setTopProducts(Object.values(prodMap).sort((a, b) => b.revenue - a.revenue).slice(0, 5));
    })();
  }, []);

  if (!stats) return <div className="text-center py-20"><Loader2 className="h-6 w-6 animate-spin inline text-primary" /></div>;

  const kpis = [
    { label: "মোট আয়", value: money(stats.revenue), icon: DollarSign, tone: "from-emerald-500 to-green-600", chip: "সব চ্যানেল" },
    { label: "পেন্ডিং অর্ডার", value: stats.pending, icon: Activity, tone: "from-amber-500 to-orange-600", chip: "ব্যবস্থা দরকার", go: "orders" },
    { label: "মোট অর্ডার", value: stats.orders + stats.serviceOrders, icon: ShoppingCart, tone: "from-blue-500 to-indigo-600", chip: `শপ ${stats.orders} • সার্ভিস ${stats.serviceOrders}`, go: "orders" },
    { label: "কাস্টমার", value: stats.customers, icon: Users, tone: "from-purple-500 to-pink-600", chip: "রেজিস্টার্ড", go: "customers" },
  ] as const;

  const split = [
    { label: "ডিজিটাল", value: stats.digitalRev, icon: Zap, tone: "from-cyan-500 to-blue-600" },
    { label: "ফিজিক্যাল", value: stats.physicalRev, icon: Package, tone: "from-orange-500 to-rose-600" },
    { label: "সার্ভিস", value: stats.serviceRev, icon: Wrench, tone: "from-violet-500 to-fuchsia-600" },
  ];

  const invCards = [
    { k: "products", label: "প্রোডাক্ট", value: stats.products, icon: Package },
    { k: "services", label: "সার্ভিস", value: stats.services, icon: Briefcase },
    { k: "marketplace", label: "মার্কেটপ্লেস", value: stats.marketplace, icon: Tag },
    { k: "rentals", label: "রেন্টাল", value: stats.rentals, icon: HomeIcon },
    { k: "tickets", label: "খোলা টিকিট", value: stats.openTickets, icon: LifeBuoy },
  ] as const;

  const PIE = ["#f59e0b", "#3b82f6", "#a855f7", "#10b981", "#ef4444", "#6b7280", "#06b6d4"];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {kpis.map((c) => {
          const I = c.icon;
          return (
            <button key={c.label} onClick={() => (c as any).go && onNav((c as any).go)}
              className="relative overflow-hidden rounded-2xl border border-border/60 bg-card p-4 shadow-sm hover:shadow-lg transition-shadow text-left group">
              <div className={`absolute -top-6 -right-6 h-20 w-20 rounded-full bg-gradient-to-br ${c.tone} opacity-20 blur-xl group-hover:opacity-40 transition-opacity`} />
              <div className={`inline-flex items-center justify-center h-9 w-9 rounded-xl bg-gradient-to-br ${c.tone} text-white shadow-md`}><I className="h-4 w-4" /></div>
              <p className="text-[11px] text-muted-foreground mt-3">{c.label}</p>
              <p className="text-xl sm:text-2xl font-bold mt-0.5 tabular-nums">{c.value}</p>
              <p className="text-[10px] text-muted-foreground mt-1 truncate">{c.chip}</p>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-3 gap-3">
        {split.map((s) => {
          const I = s.icon;
          const pct = stats.revenue ? Math.round((s.value / stats.revenue) * 100) : 0;
          return (
            <div key={s.label} className="rounded-2xl border border-border/60 bg-card p-3">
              <div className="flex items-center gap-2">
                <div className={`h-7 w-7 rounded-lg bg-gradient-to-br ${s.tone} grid place-items-center text-white`}><I className="h-3.5 w-3.5" /></div>
                <span className="text-xs font-medium">{s.label}</span>
              </div>
              <p className="text-base font-bold mt-1.5 tabular-nums">{money(s.value)}</p>
              <div className="h-1.5 rounded-full bg-muted mt-1.5 overflow-hidden">
                <div className={`h-full bg-gradient-to-r ${s.tone}`} style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <Card className="lg:col-span-2 border-border/60">
          <CardHeader className="pb-2 flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-sm font-semibold flex items-center gap-2"><TrendingUp className="h-4 w-4 text-primary" /> ১৪ দিনের রেভিনিউ</CardTitle>
              <p className="text-[11px] text-muted-foreground mt-0.5">বাতিল বাদে দৈনিক আয়</p>
            </div>
            <Badge variant="secondary" className="text-[10px]">Live</Badge>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trend} margin={{ left: 0, right: 8, top: 4, bottom: 0 }}>
                  <defs><linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient></defs>
                  <XAxis dataKey="day" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} width={40} />
                  <RTooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                    formatter={(v: any) => [money(v), "রেভিনিউ"]} />
                  <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#rev)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">অর্ডার স্ট্যাটাস</CardTitle></CardHeader>
          <CardContent>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusMix} dataKey="value" nameKey="name" innerRadius={34} outerRadius={60} paddingAngle={3}>
                    {statusMix.map((_, i) => <Cell key={i} fill={PIE[i % PIE.length]} />)}
                  </Pie>
                  <RTooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-1.5 justify-center">
              {statusMix.map((s, i) => (
                <span key={s.name} className="inline-flex items-center gap-1 text-[10px]">
                  <span className="h-2 w-2 rounded-full" style={{ background: PIE[i % PIE.length] }} />{statusBn(s.name)} ({s.value})
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <Card className="border-border/60">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">টপ ৫ প্রোডাক্ট</CardTitle></CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProducts} layout="vertical" margin={{ left: 8, right: 12 }}>
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                  <RTooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                    formatter={(v: any) => [money(v), "আয়"]} />
                  <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader className="pb-2 flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-semibold">সাম্প্রতিক অর্ডার</CardTitle>
            <Button size="sm" variant="ghost" className="text-xs h-7" onClick={() => onNav("orders")}>সব দেখুন</Button>
          </CardHeader>
          <CardContent className="space-y-1.5">
            {recent.map((o) => (
              <div key={o.id} className="flex items-center gap-2 rounded-lg border p-2">
                <div className="h-7 w-7 rounded-full bg-gradient-to-br from-primary to-purple-500 text-white grid place-items-center text-[10px] font-bold">
                  {String(o.customer_name || "?").charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium truncate">{o.customer_name}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{o.product_name}</p>
                </div>
                <span className="text-xs font-semibold">{money(o.total_amount)}</span>
                <Badge className={`${statusColor(o.status)} text-white text-[9px]`}>{statusBn(o.status)}</Badge>
              </div>
            ))}
            {recent.length === 0 && <p className="text-xs text-muted-foreground text-center py-6">কোনো অর্ডার নেই</p>}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {invCards.map((c) => {
          const I = c.icon;
          return (
            <button key={c.k} onClick={() => onNav(c.k as Section)} className="rounded-xl border border-border/60 bg-card p-3 text-left hover:border-primary/50 hover:shadow-sm transition-all">
              <I className="h-4 w-4 text-primary" />
              <p className="text-lg font-bold mt-1 tabular-nums">{c.value}</p>
              <p className="text-[10px] text-muted-foreground">{c.label}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
