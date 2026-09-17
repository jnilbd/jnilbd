import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";
import { logAudit } from "./shared";

type Field = { name: string; label: string; area?: boolean; ph?: string };

const GROUPS: { key: string; title: string; desc: string; fields: Field[] }[] = [
  {
    key: "store", title: "সাইট ও ডেলিভারি", desc: "দোকানের মূল তথ্য ও ডেলিভারি চার্জ",
    fields: [
      { name: "site_name", label: "সাইটের নাম" },
      { name: "support_phone", label: "সাপোর্ট ফোন" },
      { name: "support_email", label: "সাপোর্ট ইমেইল" },
      { name: "delivery_inside", label: "ঢাকার ভিতরে ডেলিভারি (৳)" },
      { name: "delivery_outside", label: "ঢাকার বাইরে ডেলিভারি (৳)" },
      { name: "free_delivery_over", label: "এই টাকার উপরে ফ্রি ডেলিভারি (৳)" },
      { name: "announcement", label: "সাইটে ঘোষণা", area: true },
    ],
  },
  {
    key: "payment", title: "পেমেন্ট", desc: "গ্রাহক যে নম্বরে টাকা পাঠাবে",
    fields: [
      { name: "bkash", label: "bKash নম্বর" },
      { name: "nagad", label: "Nagad নম্বর" },
      { name: "rocket", label: "Rocket নম্বর" },
      { name: "bank_info", label: "ব্যাংক তথ্য", area: true },
      { name: "payment_note", label: "পেমেন্ট নির্দেশনা", area: true },
    ],
  },
  {
    key: "integrations", title: "ইন্টিগ্রেশন", desc: "কুরিয়ার, মেসেজিং ও নোটিফিকেশন",
    fields: [
      { name: "courier_default", label: "ডিফল্ট কুরিয়ার" },
      { name: "whatsapp_number", label: "WhatsApp নম্বর" },
      { name: "telegram_chat_id", label: "Telegram Chat ID" },
      { name: "sms_sender", label: "SMS Sender ID" },
      { name: "order_notify_numbers", label: "অর্ডার নোটিফিকেশন নম্বর (কমা দিয়ে)" },
    ],
  },
  {
    key: "tracking", title: "ট্র্যাকিং ও পিক্সেল", desc: "Analytics ও বিজ্ঞাপন ট্র্যাকিং",
    fields: [
      { name: "ga_id", label: "Google Analytics ID", ph: "G-XXXXXXX" },
      { name: "fb_pixel", label: "Facebook Pixel ID" },
      { name: "tiktok_pixel", label: "TikTok Pixel ID" },
      { name: "gtm_id", label: "Google Tag Manager ID" },
      { name: "head_scripts", label: "কাস্টম হেড কোড", area: true },
    ],
  },
];

export default function SettingsTab() {
  const [values, setValues] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState("");

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("site_settings").select("*");
      const v: Record<string, any> = {};
      (data || []).forEach((r: any) => { v[r.key] = r.value || {}; });
      setValues(v);
      setLoading(false);
    })();
  }, []);

  const save = async (key: string) => {
    setSaving(key);
    const { error } = await supabase.from("site_settings").upsert({ key, value: values[key] || {} });
    setSaving("");
    if (error) return toast.error(error.message);
    logAudit("settings_update", "site_settings", key, values[key]);
    toast.success("সেভ হয়েছে");
  };

  if (loading) return <div className="py-10 text-center"><Loader2 className="h-5 w-5 animate-spin inline" /></div>;

  return (
    <div className="grid lg:grid-cols-2 gap-3">
      {GROUPS.map((g) => (
        <Card key={g.key} className="border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">{g.title}</CardTitle>
            <p className="text-[11px] text-muted-foreground">{g.desc}</p>
          </CardHeader>
          <CardContent className="space-y-2">
            {g.fields.map((f) => (
              <div key={f.name}>
                <Label className="text-xs">{f.label}</Label>
                {f.area ? (
                  <Textarea rows={2} placeholder={f.ph} value={values[g.key]?.[f.name] || ""}
                    onChange={(e) => setValues({ ...values, [g.key]: { ...(values[g.key] || {}), [f.name]: e.target.value } })} />
                ) : (
                  <Input placeholder={f.ph} value={values[g.key]?.[f.name] || ""}
                    onChange={(e) => setValues({ ...values, [g.key]: { ...(values[g.key] || {}), [f.name]: e.target.value } })} />
                )}
              </div>
            ))}
            <Button size="sm" onClick={() => save(g.key)} disabled={saving === g.key} className="w-full">
              {saving === g.key ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : <Save className="h-3.5 w-3.5 mr-1" />} সেভ করুন
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
