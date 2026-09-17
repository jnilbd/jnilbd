import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { CheckCircle2, Eye, EyeOff, Loader2, PlugZap, Play, Save, XCircle } from "lucide-react";
import { logAudit } from "./shared";

type Field = { name: string; label: string; secret?: boolean; area?: boolean; ph?: string; hint?: string };
type Action = { key: string; label: string; input?: Record<string, any> };
type Provider = {
  key: string; title: string; desc: string; where: string;
  fields: Field[]; actions: Action[];
};

const PROVIDERS: Provider[] = [
  {
    key: "steadfast", title: "Steadfast কুরিয়ার", desc: "অর্ডার অটো-বুকিং ও ট্র্যাকিং",
    where: "Steadfast মার্চেন্ট প্যানেল → API সেকশন থেকে Api-Key ও Secret-Key নিন।",
    fields: [
      { name: "api_key", label: "Api Key", secret: true },
      { name: "secret_key", label: "Secret Key", secret: true },
      { name: "base_url", label: "Base URL (ঐচ্ছিক)", ph: "https://portal.packzy.com/api/v1" },
    ],
    actions: [{ key: "track", label: "ট্র্যাকিং দেখুন", input: { tracking: "" } }],
  },
  {
    key: "pathao", title: "Pathao কুরিয়ার", desc: "Pathao Courier অটো-বুকিং",
    where: "Pathao Merchant → Developer API থেকে Client ID/Secret ও Store ID নিন।",
    fields: [
      { name: "client_id", label: "Client ID", secret: true },
      { name: "client_secret", label: "Client Secret", secret: true },
      { name: "username", label: "ইউজারনেম (ইমেইল)" },
      { name: "password", label: "পাসওয়ার্ড", secret: true },
      { name: "store_id", label: "Store ID" },
      { name: "sandbox", label: "স্যান্ডবক্স (হ্যাঁ লিখলে টেস্ট মোড)", ph: "না" },
    ],
    actions: [],
  },
  {
    key: "bkash", title: "bKash পেমেন্ট", desc: "Tokenized Checkout দিয়ে অনলাইন পেমেন্ট",
    where: "bKash মার্চেন্ট পোর্টাল → API credentials (App Key, App Secret, Username, Password)।",
    fields: [
      { name: "username", label: "Username" },
      { name: "password", label: "Password", secret: true },
      { name: "app_key", label: "App Key", secret: true },
      { name: "app_secret", label: "App Secret", secret: true },
      { name: "callback_url", label: "Callback URL", ph: "https://johnnil.com/order-confirmation" },
      { name: "sandbox", label: "স্যান্ডবক্স (হ্যাঁ/না)", ph: "না" },
    ],
    actions: [],
  },
  {
    key: "sslcommerz", title: "SSLCommerz পেমেন্ট", desc: "কার্ড, মোবাইল ব্যাংকিং সব একসাথে",
    where: "SSLCommerz মার্চেন্ট প্যানেল → Store ID ও Store Password।",
    fields: [
      { name: "store_id", label: "Store ID" },
      { name: "store_passwd", label: "Store Password", secret: true },
      { name: "success_url", label: "Success URL", ph: "https://johnnil.com/order-confirmation" },
      { name: "fail_url", label: "Fail URL" },
      { name: "cancel_url", label: "Cancel URL" },
      { name: "sandbox", label: "স্যান্ডবক্স (হ্যাঁ/না)", ph: "না" },
    ],
    actions: [],
  },
  {
    key: "telegram", title: "টেলিগ্রাম প্রোডাক্ট সোর্সিং", desc: "চ্যানেলের পোস্ট থেকে পণ্য ড্রাফট",
    where: "টেলিগ্রামে @BotFather থেকে বট বানিয়ে টোকেন নিন, বটকে চ্যানেলে অ্যাডমিন করুন।",
    fields: [
      { name: "bot_token", label: "Bot Token", secret: true },
      { name: "default_category", label: "ডিফল্ট ক্যাটাগরি", ph: "সোর্সিং" },
    ],
    actions: [{ key: "fetch_products", label: "পণ্য আনুন", input: { limit: 30 } }],
  },
  {
    key: "facebook", title: "ফেসবুক পেজ ও অ্যাড", desc: "পোস্ট → ব্লগ ইমপোর্ট, ক্যাম্পেইন তৈরি",
    where: "Facebook Developers → আপনার App → Page Access Token ও Ad Account ID।",
    fields: [
      { name: "page_id", label: "Page ID" },
      { name: "page_access_token", label: "Page Access Token", secret: true, area: true },
      { name: "ad_account_id", label: "Ad Account ID", ph: "act_123456" },
      { name: "author", label: "ব্লগ লেখকের নাম", ph: "John Nil" },
      { name: "auto_publish", label: "ইমপোর্টের সাথে সাথেই প্রকাশ (হ্যাঁ/না)", ph: "না" },
    ],
    actions: [
      { key: "import_posts", label: "পোস্ট ব্লগে আনুন", input: { limit: 10 } },
      { key: "create_campaign", label: "ক্যাম্পেইন তৈরি", input: { name: "নতুন ক্যাম্পেইন", objective: "OUTCOME_SALES", status: "PAUSED" } },
    ],
  },
  {
    key: "resend", title: "অটো ইমেইল (Resend)", desc: "অর্ডার ও নোটিফিকেশন ইমেইল",
    where: "resend.com → API Keys থেকে চাবি নিন, আর নিজের ডোমেইন ভেরিফাই করুন।",
    fields: [
      { name: "api_key", label: "Resend API Key", secret: true },
      { name: "from_email", label: "পাঠানোর ঠিকানা", ph: "JOHN NIL <order@johnnil.com>" },
      { name: "order_subject", label: "অর্ডার ইমেইলের বিষয়", ph: "আপনার অর্ডার নিশ্চিত হয়েছে" },
      { name: "order_html", label: "অর্ডার ইমেইল টেমপ্লেট (HTML)", area: true, hint: "{{name}}, {{order}}, {{amount}} ব্যবহার করতে পারেন" },
    ],
    actions: [{ key: "send_email", label: "টেস্ট ইমেইল পাঠান", input: { to: "", subject: "টেস্ট", text: "এটি একটি টেস্ট ইমেইল।" } }],
  },
  {
    key: "trending", title: "ট্রেন্ডিং প্রোডাক্ট ইমপোর্ট", desc: "Daraz / AliExpress থেকে পণ্য আনুন",
    where: "RapidAPI-তে Daraz বা AliExpress API সাবস্ক্রাইব করে Key ও Host নিন।",
    fields: [
      { name: "rapidapi_key", label: "RapidAPI Key", secret: true },
      { name: "rapidapi_host", label: "RapidAPI Host", ph: "aliexpress-datahub.p.rapidapi.com" },
      { name: "search_path", label: "সার্চ URL ছক", ph: "https://{host}/item_search?q={q}" },
      { name: "default_keyword", label: "ডিফল্ট কিওয়ার্ড", ph: "gadget" },
      { name: "price_multiplier", label: "দামের গুণক", ph: "1.3" },
      { name: "default_category", label: "ডিফল্ট ক্যাটাগরি", ph: "ট্রেন্ডিং" },
    ],
    actions: [{ key: "import", label: "পণ্য ইমপোর্ট", input: { keyword: "", limit: 20 } }],
  },
];

export default function IntegrationsTab() {
  const [rows, setRows] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [show, setShow] = useState<Record<string, boolean>>({});
  const [inputs, setInputs] = useState<Record<string, any>>({});
  const [logs, setLogs] = useState<any[]>([]);

  const load = async () => {
    const [{ data: s }, { data: l }] = await Promise.all([
      supabase.from("integration_settings").select("*"),
      supabase.from("integration_logs").select("*").order("created_at", { ascending: false }).limit(25),
    ]);
    const map: Record<string, any> = {};
    (s || []).forEach((r: any) => { map[r.provider] = r; });
    setRows(map); setLogs(l || []); setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const setField = (p: string, name: string, value: string) =>
    setRows((r) => ({ ...r, [p]: { ...(r[p] || { provider: p, enabled: false }), config: { ...(r[p]?.config || {}), [name]: value } } }));

  const save = async (p: Provider) => {
    setBusy(`save-${p.key}`);
    const row = rows[p.key] || {};
    const { error } = await supabase.from("integration_settings").upsert(
      { provider: p.key, enabled: !!row.enabled, config: row.config || {} },
      { onConflict: "provider" },
    );
    setBusy("");
    if (error) return toast.error(error.message);
    logAudit("integration_save", "integration_settings", p.key, { enabled: !!row.enabled });
    toast.success("সেভ হয়েছে");
    load();
  };

  const call = async (p: Provider, action: string, input: any = {}) => {
    setBusy(`${action}-${p.key}`);
    const { data, error } = await supabase.functions.invoke("integrations", {
      body: { provider: p.key, action, input },
    });
    setBusy("");
    const msg = (data as any)?.error || error?.message;
    if (msg) { toast.error(msg); load(); return; }
    toast.success((data as any)?.message || "সম্পন্ন");
    if ((data as any)?.url) window.open((data as any).url, "_blank");
    load();
  };

  const configured = useMemo(
    () => PROVIDERS.filter((p) => Object.values(rows[p.key]?.config || {}).some((v) => String(v || "").trim())).length,
    [rows],
  );

  if (loading) return <div className="py-10 text-center"><Loader2 className="h-5 w-5 animate-spin inline" /></div>;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-xl border p-3"><PlugZap className="h-4 w-4 text-primary" /><p className="text-xl font-bold mt-1">{PROVIDERS.length}</p><p className="text-[10px] text-muted-foreground">মোট সার্ভিস</p></div>
        <div className="rounded-xl border p-3"><CheckCircle2 className="h-4 w-4 text-emerald-600" /><p className="text-xl font-bold mt-1">{configured}</p><p className="text-[10px] text-muted-foreground">তথ্য দেওয়া হয়েছে</p></div>
        <div className="rounded-xl border p-3"><Play className="h-4 w-4 text-blue-500" /><p className="text-xl font-bold mt-1">{PROVIDERS.filter((p) => rows[p.key]?.enabled).length}</p><p className="text-[10px] text-muted-foreground">চালু আছে</p></div>
      </div>

      <p className="text-[11px] text-muted-foreground rounded-lg border border-dashed p-2.5">
        প্রতিটি সার্ভিসের ঘরে চাবি বসিয়ে সেভ করুন, তারপর "সংযোগ পরীক্ষা" চাপুন। পরীক্ষা ঠিক হলে সুইচ চালু করে দিলেই কাজ শুরু হয়ে যাবে। চাবিগুলো শুধু অ্যাডমিন দেখতে পান।
      </p>

      <div className="grid lg:grid-cols-2 gap-3">
        {PROVIDERS.map((p) => {
          const row = rows[p.key] || {};
          const cfg = row.config || {};
          return (
            <Card key={p.key} className="border-border/60">
              <CardHeader className="pb-2">
                <div className="flex items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-sm">{p.title}</CardTitle>
                    <p className="text-[11px] text-muted-foreground">{p.desc}</p>
                  </div>
                  <Switch
                    checked={!!row.enabled}
                    onCheckedChange={(v) => setRows((r) => ({ ...r, [p.key]: { ...(r[p.key] || { provider: p.key, config: {} }), enabled: v } }))}
                  />
                </div>
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  {row.last_test_at && (
                    <Badge className={`${row.last_test_ok ? "bg-emerald-600" : "bg-red-500"} text-white text-[10px]`}>
                      {row.last_test_ok ? <CheckCircle2 className="h-3 w-3 mr-1" /> : <XCircle className="h-3 w-3 mr-1" />}
                      {row.last_test_message?.slice(0, 40) || (row.last_test_ok ? "ঠিক আছে" : "সমস্যা")}
                    </Badge>
                  )}
                  {!row.last_test_at && <Badge variant="outline" className="text-[10px]">এখনো পরীক্ষা হয়নি</Badge>}
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-[11px] text-muted-foreground">{p.where}</p>
                {p.fields.map((f) => {
                  const id = `${p.key}.${f.name}`;
                  const masked = f.secret && !show[id];
                  return (
                    <div key={f.name}>
                      <Label className="text-xs flex items-center gap-1">
                        {f.label}
                        {f.secret && (
                          <button type="button" className="text-muted-foreground" onClick={() => setShow((s) => ({ ...s, [id]: !s[id] }))}>
                            {masked ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                          </button>
                        )}
                      </Label>
                      {f.area ? (
                        <Textarea rows={2} placeholder={f.ph} value={cfg[f.name] || ""} onChange={(e) => setField(p.key, f.name, e.target.value)} />
                      ) : (
                        <Input type={masked ? "password" : "text"} placeholder={f.ph} value={cfg[f.name] || ""} onChange={(e) => setField(p.key, f.name, e.target.value)} />
                      )}
                      {f.hint && <p className="text-[10px] text-muted-foreground mt-0.5">{f.hint}</p>}
                    </div>
                  );
                })}

                <div className="flex flex-wrap gap-1.5 pt-1">
                  <Button size="sm" onClick={() => save(p)} disabled={busy === `save-${p.key}`}>
                    {busy === `save-${p.key}` ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : <Save className="h-3.5 w-3.5 mr-1" />} সেভ
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => call(p, "test")} disabled={busy === `test-${p.key}`}>
                    {busy === `test-${p.key}` ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : <PlugZap className="h-3.5 w-3.5 mr-1" />} সংযোগ পরীক্ষা
                  </Button>
                </div>

                {p.actions.length > 0 && (
                  <div className="space-y-1.5 rounded-lg border p-2">
                    {p.actions.map((a) => {
                      const key = `${p.key}.${a.key}`;
                      const val = inputs[key] ?? a.input ?? {};
                      const editable = Object.keys(a.input || {});
                      return (
                        <div key={a.key} className="flex flex-wrap items-end gap-1.5">
                          {editable.map((k) => (
                            <Input key={k} className="h-8 w-28" placeholder={k} value={val[k] ?? ""}
                              onChange={(e) => setInputs((s) => ({ ...s, [key]: { ...val, [k]: e.target.value } }))} />
                          ))}
                          <Button size="sm" variant="secondary" disabled={busy === `${a.key}-${p.key}`} onClick={() => call(p, a.key, val)}>
                            {busy === `${a.key}-${p.key}` ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : <Play className="h-3.5 w-3.5 mr-1" />} {a.label}
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <CheckoutPaymentCard />

      <Card className="border-border/60">
        <CardHeader className="pb-2"><CardTitle className="text-sm">সর্বশেষ কার্যক্রম</CardTitle></CardHeader>
        <CardContent className="space-y-1.5">
          {logs.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">এখনো কিছু চালানো হয়নি</p>}
          {logs.map((l) => (
            <div key={l.id} className="flex items-center gap-2 rounded-lg border p-2 text-xs">
              <Badge className={`${l.ok ? "bg-emerald-600" : "bg-red-500"} text-white text-[10px]`}>{l.provider}</Badge>
              <span className="text-muted-foreground">{l.action}</span>
              <span className="flex-1 truncate">{l.message}</span>
              <span className="text-[10px] text-muted-foreground whitespace-nowrap">{new Date(l.created_at).toLocaleString("bn-BD")}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

/** Controls which online payment buttons appear on the public checkout page. */
function CheckoutPaymentCard() {
  const [cfg, setCfg] = useState<any>({ bkash: false, sslcommerz: false });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.from("site_settings").select("value").eq("key", "payments").maybeSingle()
      .then(({ data }) => { if (data?.value) setCfg(data.value as any); });
  }, []);

  const save = async () => {
    setSaving(true);
    const { error } = await supabase.from("site_settings").upsert({ key: "payments", value: cfg }, { onConflict: "key" });
    setSaving(false);
    if (error) return toast.error(error.message);
    logAudit("settings_update", "site_settings", "payments", cfg);
    toast.success("চেকআউট পেমেন্ট সেটিংস সেভ হয়েছে");
  };

  return (
    <Card className="border-border/60">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">চেকআউটে অনলাইন পেমেন্ট</CardTitle>
        <p className="text-[11px] text-muted-foreground">উপরে সংশ্লিষ্ট সার্ভিসের চাবি দিয়ে চালু করার পর এখান থেকে চেকআউট পাতায় বাটন দেখানো যাবে।</p>
      </CardHeader>
      <CardContent className="space-y-2">
        {[{ k: "bkash", l: "bKash দিয়ে অনলাইন পেমেন্ট" }, { k: "sslcommerz", l: "কার্ড/মোবাইল ব্যাংকিং (SSLCommerz)" }].map((o) => (
          <div key={o.k} className="flex items-center gap-2 rounded-lg border p-2.5">
            <span className="text-sm flex-1">{o.l}</span>
            <Switch checked={!!cfg[o.k]} onCheckedChange={(v) => setCfg({ ...cfg, [o.k]: v })} />
          </div>
        ))}
        <Button size="sm" onClick={save} disabled={saving}><Save className="h-3.5 w-3.5 mr-1" /> সেভ</Button>
      </CardContent>
    </Card>
  );
}
