import { useEffect, useState } from "react";
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
  ExternalLink, DollarSign, TrendingUp, Loader2,
} from "lucide-react";

type Section = "overview" | "orders" | "service-orders" | "requests" | "customers" |
  "products" | "services" | "marketplace" | "rentals" | "reviews" | "portfolio" | "site";

const NAV: { key: Section; label: string; icon: any }[] = [
  { key: "overview", label: "ওভারভিউ", icon: LayoutDashboard },
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
  const { user, loading } = useAuth();
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

  return (
    <div className="container py-6">
      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2"><LayoutDashboard className="h-7 w-7" /> কন্ট্রোল প্যানেল</h1>
          <p className="text-sm text-muted-foreground">পুরো ওয়েবসাইটের কেন্দ্রীয় অ্যাডমিন ড্যাশবোর্ড</p>
        </div>
        <Button asChild variant="outline" size="sm"><Link to="/admin"><Package className="h-4 w-4 mr-1" /> পুরনো প্যানেল</Link></Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-4">
        <aside>
          <Card>
            <CardContent className="p-2 space-y-1">
              {NAV.map((n) => {
                const I = n.icon;
                return (
                  <button
                    key={n.key}
                    onClick={() => setSection(n.key)}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition ${section === n.key ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
                  >
                    <I className="h-4 w-4" /> {n.label}
                  </button>
                );
              })}
            </CardContent>
          </Card>
        </aside>

        <main className="min-w-0">
          {section === "overview" && <Overview />}
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
  );
}

/* ============== Overview ============== */
function Overview() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const [orders, sOrders, reqs, products, services, customers, marketplace, rentals] = await Promise.all([
        supabase.from("shop_orders").select("total_amount,status,created_at"),
        supabase.from("service_orders").select("quoted_amount,status,created_at"),
        supabase.from("service_requests").select("id,status"),
        supabase.from("shop_products").select("id", { count: "exact", head: true }),
        supabase.from("services_catalog").select("id", { count: "exact", head: true }),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("marketplace_items").select("id", { count: "exact", head: true }),
        supabase.from("rentals").select("id", { count: "exact", head: true }),
      ]);

      const totalRev = (orders.data || []).reduce((s, o: any) => s + Number(o.total_amount || 0), 0)
        + (sOrders.data || []).reduce((s, o: any) => s + Number(o.quoted_amount || 0), 0);
      const pending = (orders.data || []).filter((o: any) => o.status === "pending").length
        + (sOrders.data || []).filter((o: any) => o.status === "pending").length;

      setStats({
        revenue: totalRev,
        orders: (orders.data || []).length,
        serviceOrders: (sOrders.data || []).length,
        requests: (reqs.data || []).length,
        pending,
        products: products.count || 0,
        services: services.count || 0,
        customers: customers.count || 0,
        marketplace: marketplace.count || 0,
        rentals: rentals.count || 0,
      });
    })();
  }, []);

  if (!stats) return <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin inline" /></div>;

  const cards = [
    { label: "মোট আয়", value: `৳${stats.revenue.toLocaleString()}`, icon: DollarSign, color: "text-green-600" },
    { label: "পেন্ডিং অর্ডার", value: stats.pending, icon: TrendingUp, color: "text-orange-600" },
    { label: "শপ অর্ডার", value: stats.orders, icon: ShoppingCart },
    { label: "সার্ভিস অর্ডার", value: stats.serviceOrders, icon: Wrench },
    { label: "রিকোয়েস্ট", value: stats.requests, icon: Inbox },
    { label: "কাস্টমার", value: stats.customers, icon: Users },
    { label: "প্রোডাক্ট", value: stats.products, icon: Package },
    { label: "সার্ভিস", value: stats.services, icon: Briefcase },
    { label: "মার্কেটপ্লেস", value: stats.marketplace, icon: Tag },
    { label: "রেন্টাল", value: stats.rentals, icon: HomeIcon },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
      {cards.map((c) => {
        const I = c.icon;
        return (
          <Card key={c.label}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">{c.label}</p>
                <I className={`h-4 w-4 ${c.color || "text-muted-foreground"}`} />
              </div>
              <p className="text-2xl font-bold mt-1">{c.value}</p>
            </CardContent>
          </Card>
        );
      })}
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
