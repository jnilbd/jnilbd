import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Trash2, Plus, Edit, ShoppingBag, Bell, Package, Wrench, Inbox } from "lucide-react";

type Product = {
  id?: string;
  name: string;
  name_bn?: string;
  slug?: string;
  short_description?: string;
  short_description_bn?: string;
  full_description?: string;
  full_description_bn?: string;
  price: number;
  discount_price?: number | null;
  category?: string;
  image?: string;
  gallery?: string[];
  badge?: string;
  badge_color?: string;
  stock?: number;
  is_active?: boolean;
  is_featured?: boolean;
  offer_enabled?: boolean;
  offer_started_at?: string | null;
  related_ids?: string[];
  addon_ids?: string[];
};

const emptyProduct: Product = {
  name: "", name_bn: "", short_description: "", short_description_bn: "",
  full_description: "", full_description_bn: "", price: 0, discount_price: null,
  category: "", image: "", badge: "", badge_color: "red", stock: 999,
  is_active: true, is_featured: false, offer_enabled: false,
  related_ids: [], addon_ids: [], gallery: [],
};

const Admin = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [editing, setEditing] = useState<Product>(emptyProduct);
  const [settings, setSettings] = useState<any>({
    whatsapp_number: "", sms_number: "", telegram_chat_id: "",
    enable_whatsapp: true, enable_sms: false, enable_telegram: false,
  });

  useEffect(() => {
    if (loading) return;
    if (!user) { navigate("/auth"); return; }
    (async () => {
      const { data } = await supabase.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin").maybeSingle();
      setIsAdmin(!!data);
    })();
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!isAdmin) return;
    loadAll();
  }, [isAdmin]);

  const loadAll = async () => {
    const [pRes, oRes, sRes] = await Promise.all([
      supabase.from("shop_products").select("*").order("created_at", { ascending: false }),
      supabase.from("shop_orders").select("*").order("created_at", { ascending: false }).limit(100),
      supabase.from("admin_notification_settings").select("*").eq("admin_user_id", user!.id).maybeSingle(),
    ]);
    setProducts((pRes.data as any) || []);
    setOrders(oRes.data || []);
    if (sRes.data) setSettings(sRes.data);
  };

  const saveProduct = async () => {
    const payload: any = { ...editing };
    payload.price = Number(payload.price) || 0;
    payload.discount_price = payload.discount_price ? Number(payload.discount_price) : null;
    payload.stock = Number(payload.stock) || 0;
    if (typeof payload.related_ids === "string") payload.related_ids = (payload.related_ids as any).split(",").map((s: string) => s.trim()).filter(Boolean);
    if (typeof payload.addon_ids === "string") payload.addon_ids = (payload.addon_ids as any).split(",").map((s: string) => s.trim()).filter(Boolean);
    if (typeof payload.gallery === "string") payload.gallery = (payload.gallery as any).split("\n").map((s: string) => s.trim()).filter(Boolean);
    if (payload.offer_enabled && !payload.offer_started_at) payload.offer_started_at = new Date().toISOString();

    const { error } = editing.id
      ? await supabase.from("shop_products").update(payload).eq("id", editing.id)
      : await supabase.from("shop_products").insert(payload);
    if (error) { toast.error(error.message); return; }
    toast.success("Saved");
    setEditing(emptyProduct);
    loadAll();
  };

  const deleteProduct = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    await supabase.from("shop_products").delete().eq("id", id);
    loadAll();
  };

  const saveSettings = async () => {
    const payload = { ...settings, admin_user_id: user!.id };
    delete payload.id; delete payload.updated_at;
    const { error } = await supabase
      .from("admin_notification_settings")
      .upsert(payload, { onConflict: "admin_user_id" });
    if (error) { toast.error(error.message); return; }
    toast.success("Settings saved");
    loadAll();
  };

  const restartOffer = async (id: string) => {
    await supabase.from("shop_products").update({ offer_started_at: new Date().toISOString(), offer_enabled: true }).eq("id", id);
    loadAll();
    toast.success("Offer countdown reset");
  };

  if (loading || isAdmin === null) return <div className="container py-20 text-center">Loading...</div>;
  if (!isAdmin) return (
    <div className="container py-20 text-center space-y-4">
      <h1 className="text-3xl font-bold">Admin Access Required</h1>
      <p className="text-muted-foreground">Your account does not have admin privileges.</p>
      <p className="text-xs text-muted-foreground">User ID: {user?.id}</p>
      <p className="text-sm">Ask the developer to grant your account the <code>admin</code> role in <code>user_roles</code>.</p>
    </div>
  );

  return (
    <div className="container py-10">
      <h1 className="text-4xl font-display font-bold mb-6">Shop Admin Panel</h1>
      <Tabs defaultValue="products">
        <TabsList className="grid grid-cols-3 max-w-md">
          <TabsTrigger value="products"><Package className="w-4 h-4 mr-1" />Products</TabsTrigger>
          <TabsTrigger value="orders"><ShoppingBag className="w-4 h-4 mr-1" />Orders</TabsTrigger>
          <TabsTrigger value="settings"><Bell className="w-4 h-4 mr-1" />Notify</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-6 mt-6">
          <Card className="p-6 space-y-3">
            <h2 className="text-xl font-bold">{editing.id ? "Edit Product" : "Add New Product"}</h2>
            <div className="grid md:grid-cols-2 gap-3">
              <div><Label>Name (EN)</Label><Input value={editing.name} onChange={e => setEditing({...editing, name: e.target.value})} /></div>
              <div><Label>Name (BN)</Label><Input value={editing.name_bn || ""} onChange={e => setEditing({...editing, name_bn: e.target.value})} /></div>
              <div><Label>Category</Label><Input value={editing.category || ""} onChange={e => setEditing({...editing, category: e.target.value})} /></div>
              <div><Label>Slug (optional)</Label><Input value={editing.slug || ""} onChange={e => setEditing({...editing, slug: e.target.value})} /></div>
              <div><Label>Price (৳)</Label><Input type="number" value={editing.price} onChange={e => setEditing({...editing, price: Number(e.target.value)})} /></div>
              <div><Label>Discount Price (optional)</Label><Input type="number" value={editing.discount_price || ""} onChange={e => setEditing({...editing, discount_price: e.target.value ? Number(e.target.value) : null})} /></div>
              <div><Label>Stock</Label><Input type="number" value={editing.stock || 0} onChange={e => setEditing({...editing, stock: Number(e.target.value)})} /></div>
              <div><Label>Main Image URL</Label><Input value={editing.image || ""} onChange={e => setEditing({...editing, image: e.target.value})} /></div>
              <div><Label>Badge text (e.g. NEW, HOT, SALE)</Label><Input value={editing.badge || ""} onChange={e => setEditing({...editing, badge: e.target.value})} /></div>
              <div><Label>Badge color</Label>
                <select className="w-full h-10 rounded-md border bg-background px-3" value={editing.badge_color || "red"} onChange={e => setEditing({...editing, badge_color: e.target.value})}>
                  <option value="red">Red</option><option value="green">Green</option><option value="blue">Blue</option>
                  <option value="orange">Orange</option><option value="purple">Purple</option><option value="pink">Pink</option>
                </select>
              </div>
            </div>
            <div><Label>Short Description (EN)</Label><Textarea rows={2} value={editing.short_description || ""} onChange={e => setEditing({...editing, short_description: e.target.value})} /></div>
            <div><Label>Short Description (BN)</Label><Textarea rows={2} value={editing.short_description_bn || ""} onChange={e => setEditing({...editing, short_description_bn: e.target.value})} /></div>
            <div><Label>Full Description (EN) — supports Markdown</Label><Textarea rows={5} value={editing.full_description || ""} onChange={e => setEditing({...editing, full_description: e.target.value})} /></div>
            <div><Label>Full Description (BN)</Label><Textarea rows={5} value={editing.full_description_bn || ""} onChange={e => setEditing({...editing, full_description_bn: e.target.value})} /></div>
            <div><Label>Gallery image URLs (one per line)</Label><Textarea rows={3} value={Array.isArray(editing.gallery) ? editing.gallery.join("\n") : (editing.gallery || "")} onChange={e => setEditing({...editing, gallery: e.target.value as any})} /></div>
            <div className="grid md:grid-cols-2 gap-3">
              <div><Label>Related Product IDs (comma separated)</Label><Input value={Array.isArray(editing.related_ids) ? editing.related_ids.join(",") : (editing.related_ids || "")} onChange={e => setEditing({...editing, related_ids: e.target.value as any})} /></div>
              <div><Label>Add-on Product IDs (comma separated)</Label><Input value={Array.isArray(editing.addon_ids) ? editing.addon_ids.join(",") : (editing.addon_ids || "")} onChange={e => setEditing({...editing, addon_ids: e.target.value as any})} /></div>
            </div>
            <div className="flex flex-wrap gap-6">
              <label className="flex items-center gap-2"><Switch checked={editing.is_active ?? true} onCheckedChange={v => setEditing({...editing, is_active: v})} /> Active</label>
              <label className="flex items-center gap-2"><Switch checked={editing.is_featured ?? false} onCheckedChange={v => setEditing({...editing, is_featured: v})} /> Featured</label>
              <label className="flex items-center gap-2"><Switch checked={editing.offer_enabled ?? false} onCheckedChange={v => setEditing({...editing, offer_enabled: v})} /> 24h Offer Countdown</label>
            </div>
            <div className="flex gap-2">
              <Button onClick={saveProduct} className="gradient-bg-primary text-white"><Plus className="w-4 h-4 mr-1" />{editing.id ? "Update" : "Add"} Product</Button>
              {editing.id && <Button variant="outline" onClick={() => setEditing(emptyProduct)}>Cancel</Button>}
            </div>
          </Card>

          <h2 className="text-xl font-bold">All Products ({products.length})</h2>
          <div className="grid gap-3">
            {products.map(p => (
              <Card key={p.id} className="p-4 flex items-center gap-3">
                {p.image && <img src={p.image} alt="" className="w-16 h-16 rounded object-cover" />}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{p.name} <span className="text-xs text-muted-foreground">৳{p.price}</span></p>
                  <p className="text-xs text-muted-foreground truncate">{p.short_description}</p>
                  <p className="text-[10px] text-muted-foreground">ID: {p.id}</p>
                </div>
                {p.offer_enabled && <Button size="sm" variant="outline" onClick={() => restartOffer(p.id!)}>Reset Offer</Button>}
                <Button size="sm" variant="outline" onClick={() => setEditing(p as any)}><Edit className="w-4 h-4" /></Button>
                <Button size="sm" variant="destructive" onClick={() => deleteProduct(p.id!)}><Trash2 className="w-4 h-4" /></Button>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="orders" className="space-y-3 mt-6">
          <h2 className="text-xl font-bold">Recent Orders ({orders.length})</h2>
          {orders.map(o => (
            <Card key={o.id} className="p-4">
              <div className="flex justify-between flex-wrap gap-2">
                <div>
                  <p className="font-semibold">{o.product_name} × {o.quantity}</p>
                  <p className="text-sm">{o.customer_name} — {o.customer_phone}</p>
                  {o.customer_email && <p className="text-xs text-muted-foreground">{o.customer_email}</p>}
                  {o.customer_address && <p className="text-xs">{o.customer_address}</p>}
                  {o.notes && <p className="text-xs italic">"{o.notes}"</p>}
                </div>
                <div className="text-right">
                  <p className="font-bold text-primary">৳{o.total_amount}</p>
                  <p className="text-xs">{new Date(o.created_at).toLocaleString()}</p>
                  <span className="text-xs px-2 py-0.5 rounded bg-muted">{o.status}</span>
                  {o.notified && <span className="ml-1 text-xs text-green-600">✓ notified</span>}
                </div>
              </div>
            </Card>
          ))}
          {orders.length === 0 && <p className="text-muted-foreground">No orders yet.</p>}
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <Card className="p-6 space-y-4 max-w-2xl">
            <h2 className="text-xl font-bold">Order Notification Settings</h2>
            <p className="text-sm text-muted-foreground">
              Get notified instantly when a customer places an order. WhatsApp & SMS use Twilio; Telegram requires a Telegram bot connection.
            </p>

            <div className="space-y-3 border-l-4 border-green-500 pl-4">
              <div className="flex items-center justify-between">
                <Label className="font-semibold">WhatsApp Notifications</Label>
                <Switch checked={settings.enable_whatsapp} onCheckedChange={v => setSettings({...settings, enable_whatsapp: v})} />
              </div>
              <Input placeholder="+8801XXXXXXXXX (with country code)" value={settings.whatsapp_number || ""} onChange={e => setSettings({...settings, whatsapp_number: e.target.value})} />
            </div>

            <div className="space-y-3 border-l-4 border-blue-500 pl-4">
              <div className="flex items-center justify-between">
                <Label className="font-semibold">SMS Notifications</Label>
                <Switch checked={settings.enable_sms} onCheckedChange={v => setSettings({...settings, enable_sms: v})} />
              </div>
              <Input placeholder="+8801XXXXXXXXX" value={settings.sms_number || ""} onChange={e => setSettings({...settings, sms_number: e.target.value})} />
            </div>

            <div className="space-y-3 border-l-4 border-sky-500 pl-4">
              <div className="flex items-center justify-between">
                <Label className="font-semibold">Telegram Notifications</Label>
                <Switch checked={settings.enable_telegram} onCheckedChange={v => setSettings({...settings, enable_telegram: v})} />
              </div>
              <Input placeholder="Telegram chat_id (start your bot, then get chat_id)" value={settings.telegram_chat_id || ""} onChange={e => setSettings({...settings, telegram_chat_id: e.target.value})} />
              <p className="text-xs text-muted-foreground">Telegram connector must be linked in Settings → Connectors first.</p>
            </div>

            <Button onClick={saveSettings} className="gradient-bg-primary text-white">Save Settings</Button>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Admin;
