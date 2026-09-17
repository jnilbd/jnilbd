import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { GripVertical, Loader2, Plus, Save, Trash2 } from "lucide-react";
import { logAudit } from "./shared";
import { loadSiteSettings } from "@/hooks/useSiteSettings";

const PRESETS = [
  { name: "রয়াল ব্লু", primary: "221 83% 53%", secondary: "262 83% 58%", accent: "199 89% 48%" },
  { name: "বাংলা সবুজ", primary: "150 70% 32%", secondary: "45 93% 47%", accent: "150 60% 45%" },
  { name: "সানসেট", primary: "20 90% 52%", secondary: "340 82% 52%", accent: "40 95% 55%" },
  { name: "মিডনাইট", primary: "250 70% 60%", secondary: "190 80% 50%", accent: "280 70% 60%" },
];

export default function AppearanceTab() {
  const [theme, setTheme] = useState<any>({});
  const [popup, setPopup] = useState<any>({});
  const [menu, setMenu] = useState<any>({ items: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState("");

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("site_settings").select("key,value").in("key", ["theme", "popup", "menu"]);
      (data || []).forEach((r: any) => {
        if (r.key === "theme") setTheme(r.value || {});
        if (r.key === "popup") setPopup(r.value || {});
        if (r.key === "menu") setMenu(r.value || { items: [] });
      });
      setLoading(false);
    })();
  }, []);

  const save = async (key: string, value: any) => {
    setSaving(key);
    const { error } = await supabase.from("site_settings").upsert({ key, value });
    setSaving("");
    if (error) return toast.error(error.message);
    logAudit("settings_update", "site_settings", key, value);
    await loadSiteSettings(true);
    toast.success("সেভ হয়েছে — সাইটে দেখুন");
  };

  const items: any[] = menu.items || [];
  const setItems = (v: any[]) => setMenu({ ...menu, items: v });

  if (loading) return <div className="py-10 text-center"><Loader2 className="h-5 w-5 animate-spin inline" /></div>;

  return (
    <div className="space-y-3">
      {/* THEME */}
      <Card className="border-border/60">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">থিম ও কালার</CardTitle>
          <p className="text-[11px] text-muted-foreground">HSL ফরম্যাটে লিখুন, যেমন <code>221 83% 53%</code></p>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button key={p.name} onClick={() => setTheme({ ...theme, ...p, name: p.name })}
                className="flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-xs hover:border-primary">
                <span className="h-4 w-4 rounded-full" style={{ background: `hsl(${p.primary})` }} />
                <span className="h-4 w-4 rounded-full -ml-3" style={{ background: `hsl(${p.secondary})` }} />
                {p.name}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {["primary", "secondary", "accent", "background", "foreground", "radius"].map((k) => (
              <div key={k}>
                <Label className="text-xs capitalize">{k}</Label>
                <div className="flex items-center gap-1.5">
                  {k !== "radius" && <span className="h-7 w-7 shrink-0 rounded-md border" style={{ background: theme[k] ? `hsl(${theme[k]})` : "transparent" }} />}
                  <Input className="h-8" value={theme[k] || ""} placeholder={k === "radius" ? "0.75rem" : "221 83% 53%"} onChange={(e) => setTheme({ ...theme, [k]: e.target.value })} />
                </div>
              </div>
            ))}
          </div>
          <Button size="sm" onClick={() => save("theme", theme)} disabled={saving === "theme"}>
            {saving === "theme" ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : <Save className="h-3.5 w-3.5 mr-1" />} থিম সেভ
          </Button>
        </CardContent>
      </Card>

      {/* POPUP */}
      <Card className="border-border/60">
        <CardHeader className="pb-2 flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">পপআপ / অফার নোটিশ</CardTitle>
          <Switch checked={!!popup.enabled} onCheckedChange={(v) => setPopup({ ...popup, enabled: v })} />
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div><Label className="text-xs">টাইটেল</Label><Input value={popup.title || ""} onChange={(e) => setPopup({ ...popup, title: e.target.value })} /></div>
            <div><Label className="text-xs">কত সেকেন্ড পরে</Label><Input type="number" value={popup.delay ?? 4} onChange={(e) => setPopup({ ...popup, delay: Number(e.target.value) })} /></div>
          </div>
          <div><Label className="text-xs">বার্তা</Label><Textarea rows={3} value={popup.message || ""} onChange={(e) => setPopup({ ...popup, message: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-2">
            <div><Label className="text-xs">বাটন লেখা</Label><Input value={popup.cta_text || ""} onChange={(e) => setPopup({ ...popup, cta_text: e.target.value })} /></div>
            <div><Label className="text-xs">বাটন লিংক</Label><Input placeholder="/shop" value={popup.cta_link || ""} onChange={(e) => setPopup({ ...popup, cta_link: e.target.value })} /></div>
          </div>
          <div><Label className="text-xs">ছবির লিংক (ঐচ্ছিক)</Label><Input value={popup.image || ""} onChange={(e) => setPopup({ ...popup, image: e.target.value })} /></div>
          <div className="flex items-center gap-2"><Switch checked={!!popup.once} onCheckedChange={(v) => setPopup({ ...popup, once: v })} /><Label className="text-xs">একজনকে একবারই দেখাও</Label></div>
          <Button size="sm" onClick={() => save("popup", popup)} disabled={saving === "popup"}>
            {saving === "popup" ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : <Save className="h-3.5 w-3.5 mr-1" />} পপআপ সেভ
          </Button>
        </CardContent>
      </Card>

      {/* MENU */}
      <Card className="border-border/60">
        <CardHeader className="pb-2 flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-base">অতিরিক্ত মেনু লিংক</CardTitle>
            <p className="text-[11px] text-muted-foreground">নেভিগেশনে যোগ হবে</p>
          </div>
          <Button size="sm" variant="outline" onClick={() => setItems([...items, { label: "", href: "" }])}><Plus className="h-3.5 w-3.5 mr-1" /> লিংক</Button>
        </CardHeader>
        <CardContent className="space-y-2">
          {items.map((it, i) => (
            <div key={i} className="flex items-center gap-2">
              <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
              <Input className="h-9" placeholder="নাম" value={it.label} onChange={(e) => setItems(items.map((x, j) => j === i ? { ...x, label: e.target.value } : x))} />
              <Input className="h-9" placeholder="/shop" value={it.href} onChange={(e) => setItems(items.map((x, j) => j === i ? { ...x, href: e.target.value } : x))} />
              <Button size="icon" variant="ghost" className="h-9 w-9 shrink-0" onClick={() => setItems(items.filter((_, j) => j !== i))}><Trash2 className="h-3.5 w-3.5 text-red-500" /></Button>
            </div>
          ))}
          {items.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">কোনো অতিরিক্ত লিংক নেই</p>}
          <Button size="sm" onClick={() => save("menu", { items })} disabled={saving === "menu"}>
            {saving === "menu" ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : <Save className="h-3.5 w-3.5 mr-1" />} মেনু সেভ
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
