import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Sparkles, Copy } from "lucide-react";

const TOOLS = [
  { key: "ad", title: "AI অ্যাড কপি", desc: "ফেসবুক/টিকটক বিজ্ঞাপনের কপি ও হেডলাইন", ph: "প্রোডাক্টের নাম ও অফার লিখুন" },
  { key: "campaign", title: "AI ক্যাম্পেইন প্ল্যান", desc: "বাজেট, অডিয়েন্স ও ৭ দিনের প্ল্যান", ph: "যেমন: মিনি প্রজেক্টর, বাজেট ৫০০০৳/সপ্তাহ" },
  { key: "market", title: "AI মার্কেট রিসার্চ", desc: "বাংলাদেশের বাজারে চাহিদা ও দাম", ph: "পণ্যের নাম বা ক্যাটাগরি" },
  { key: "reply", title: "AI কাস্টমার রিপ্লাই", desc: "ভদ্র বাংলা উত্তর তৈরি", ph: "গ্রাহকের প্রশ্ন পেস্ট করুন" },
];

export default function AiToolsTab() {
  const [tool, setTool] = useState(TOOLS[0].key);
  const [input, setInput] = useState("");
  const [out, setOut] = useState("");
  const [busy, setBusy] = useState(false);

  const active = TOOLS.find((t) => t.key === tool)!;

  const run = async () => {
    if (!input.trim()) return toast.error("কিছু লিখুন");
    setBusy(true); setOut("");
    const { data, error } = await supabase.functions.invoke("admin-ai", { body: { task: tool, input: { prompt: input } } });
    setBusy(false);
    if (error) return toast.error("AI সাড়া দেয়নি");
    setOut(data?.text || "");
  };

  return (
    <div className="space-y-3">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2">
        {TOOLS.map((t) => (
          <button key={t.key} onClick={() => { setTool(t.key); setOut(""); }}
            className={`text-left rounded-xl border p-3 transition-all ${tool === t.key ? "border-primary bg-primary/5 shadow-sm" : "hover:bg-muted"}`}>
            <p className="text-sm font-semibold flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5 text-primary" />{t.title}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">{t.desc}</p>
          </button>
        ))}
      </div>

      <Card className="border-border/60">
        <CardHeader className="pb-2"><CardTitle className="text-base">{active.title}</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <div><Label className="text-xs">ইনপুট</Label><Textarea rows={4} placeholder={active.ph} value={input} onChange={(e) => setInput(e.target.value)} /></div>
          <Button onClick={run} disabled={busy} className="w-full">
            {busy ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Sparkles className="h-4 w-4 mr-1" />} তৈরি করুন
          </Button>
          {out && (
            <div className="rounded-xl border bg-muted/40 p-3 space-y-2">
              <p className="text-sm whitespace-pre-wrap">{out}</p>
              <Button size="sm" variant="outline" onClick={() => { navigator.clipboard?.writeText(out); toast.success("কপি হয়েছে"); }}>
                <Copy className="h-3.5 w-3.5 mr-1" /> কপি
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
