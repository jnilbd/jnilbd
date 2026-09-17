import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Loader2, Mail, Plus, RefreshCw, Save, Send, Trash2 } from "lucide-react";
import { logAudit, renderTemplate } from "./shared";

const VARS = ["customer_name", "order_id", "product_name", "total", "courier", "tracking", "status"];

export default function EmailTemplatesTab() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [testTo, setTestTo] = useState("");
  const [sending, setSending] = useState("");

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("email_templates").select("*").order("created_at");
    if (error) toast.error(error.message);
    setRows(data || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const save = async (r: any) => {
    const { error } = await supabase.from("email_templates").update({
      name: r.name, subject: r.subject, html: r.html, is_active: r.is_active, trigger_event: r.trigger_event,
    }).eq("id", r.id);
    if (error) return toast.error(error.message);
    logAudit("email_template_update", "email_templates", r.id, { key: r.key });
    toast.success("সেভ হয়েছে");
  };

  const add = async () => {
    const key = `custom_${Date.now().toString(36)}`;
    const { data, error } = await supabase.from("email_templates").insert({
      key, name: "নতুন টেমপ্লেট", subject: "বিষয়", html: "<p>প্রিয় {{customer_name}},</p><p>...</p>",
    }).select().maybeSingle();
    if (error) return toast.error(error.message);
    setRows((p) => [...p, data]);
  };

  const remove = async (id: string) => {
    if (!confirm("টেমপ্লেটটি ডিলিট করবেন?")) return;
    await supabase.from("email_templates").delete().eq("id", id);
    setRows((p) => p.filter((r) => r.id !== id));
  };

  const sendTest = async (r: any) => {
    if (!testTo) return toast.error("টেস্ট ইমেইল ঠিকানা দিন");
    setSending(r.id);
    const sample = {
      customer_name: "পরীক্ষামূলক গ্রাহক", order_id: "TEST1234", product_name: "নমুনা পণ্য",
      total: "১,২০০", courier: "Steadfast", tracking: "TRK123", status: "কনফার্ম",
    };
    const { data, error } = await supabase.functions.invoke("integrations", {
      body: {
        provider: "resend", action: "send_email",
        input: { to: testTo, subject: renderTemplate(r.subject, sample), html: renderTemplate(r.html, sample) },
      },
    });
    setSending("");
    if (error || (data as any)?.error) return toast.error((data as any)?.error || error?.message || "পাঠানো যায়নি");
    toast.success("টেস্ট ইমেইল পাঠানো হয়েছে");
  };

  return (
    <div className="space-y-3">
      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle className="text-base flex-1 flex items-center gap-2"><Mail className="h-4 w-4" /> ইমেইল টেমপ্লেট</CardTitle>
            <Button size="sm" variant="outline" onClick={load}><RefreshCw className="h-3.5 w-3.5 mr-1" /> রিফ্রেশ</Button>
            <Button size="sm" onClick={add}><Plus className="h-3.5 w-3.5 mr-1" /> নতুন</Button>
          </div>
          <p className="text-[11px] text-muted-foreground pt-1">
            ব্যবহারযোগ্য শব্দ: {VARS.map((v) => `{{${v}}}`).join(" • ")} — অর্ডারের তথ্য দিয়ে নিজে থেকেই বসে যাবে।
            ইমেইল পাঠাতে "ইন্টিগ্রেশন" পাতায় Resend চালু থাকতে হবে।
          </p>
          <div className="pt-2 max-w-xs">
            <Label className="text-xs">টেস্ট ইমেইল ঠিকানা</Label>
            <Input value={testTo} onChange={(e) => setTestTo(e.target.value)} placeholder="you@example.com" className="h-9" />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading ? (
            <div className="py-10 text-center"><Loader2 className="h-5 w-5 animate-spin inline" /></div>
          ) : rows.map((r, idx) => (
            <div key={r.id} className="rounded-xl border border-border/60 p-3 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Input className="h-8 w-52" value={r.name} onChange={(e) => setRows((p) => p.map((x, i) => (i === idx ? { ...x, name: e.target.value } : x)))} />
                <Badge variant="outline" className="text-[10px]">{r.key}</Badge>
                <div className="flex items-center gap-1.5 ml-auto">
                  <Switch checked={!!r.is_active} onCheckedChange={(v) => setRows((p) => p.map((x, i) => (i === idx ? { ...x, is_active: v } : x)))} />
                  <span className="text-[11px] text-muted-foreground">অটো পাঠাও</span>
                </div>
              </div>
              <div>
                <Label className="text-xs">বিষয়</Label>
                <Input value={r.subject} onChange={(e) => setRows((p) => p.map((x, i) => (i === idx ? { ...x, subject: e.target.value } : x)))} />
              </div>
              <div>
                <Label className="text-xs">ইমেইলের লেখা (HTML)</Label>
                <Textarea rows={5} className="font-mono text-xs" value={r.html} onChange={(e) => setRows((p) => p.map((x, i) => (i === idx ? { ...x, html: e.target.value } : x)))} />
              </div>
              <details className="rounded-lg bg-muted/50 p-2">
                <summary className="text-xs cursor-pointer">প্রিভিউ</summary>
                <div className="text-sm mt-2 bg-background rounded p-2" dangerouslySetInnerHTML={{ __html: renderTemplate(r.html, { customer_name: "গ্রাহক", order_id: "AB12CD", product_name: "নমুনা পণ্য", total: "১,২০০", courier: "Steadfast", tracking: "TRK123", status: "কনফার্ম" }) }} />
              </details>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" onClick={() => save(r)}><Save className="h-3.5 w-3.5 mr-1" /> সেভ</Button>
                <Button size="sm" variant="outline" disabled={sending === r.id} onClick={() => sendTest(r)}>
                  {sending === r.id ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : <Send className="h-3.5 w-3.5 mr-1" />} টেস্ট পাঠান
                </Button>
                <Button size="sm" variant="ghost" className="text-red-500 ml-auto" onClick={() => remove(r.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
