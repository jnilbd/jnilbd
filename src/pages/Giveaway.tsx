import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Gift, Loader2, PartyPopper, Users } from "lucide-react";
import SEO from "@/components/SEO";

export default function Giveaway() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", phone: "", email: "" });
  const [busy, setBusy] = useState("");
  const [joined, setJoined] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("giveaways").select("*").eq("is_active", true).order("created_at", { ascending: false });
      setRows(data || []); setLoading(false);
      try { setJoined(JSON.parse(localStorage.getItem("jn_giveaways") || "[]")); } catch { /* ignore */ }
    })();
  }, []);

  const join = async (id: string) => {
    if (!form.name.trim() || !form.phone.trim()) return toast.error("নাম ও ফোন নম্বর দিন");
    setBusy(id);
    const { error } = await supabase.from("giveaway_entries").insert({
      giveaway_id: id, name: form.name.trim(), phone: form.phone.trim(), email: form.email.trim() || null,
    });
    setBusy("");
    if (error) return toast.error(error.message.includes("duplicate") ? "এই নম্বরে আগেই অংশ নেওয়া হয়েছে" : error.message);
    const next = [...joined, id];
    setJoined(next);
    try { localStorage.setItem("jn_giveaways", JSON.stringify(next)); } catch { /* ignore */ }
    toast.success("অংশগ্রহণ সফল! বিজয়ী হলে ফোনে জানানো হবে।");
  };

  return (
    <div>
      <SEO title="ফ্রি গিভঅ্যাওয়ে ও ফ্রি ড্রপ | John Nil" description="বিনামূল্যে পুরস্কার জিতুন — নাম ও ফোন দিয়ে অংশ নিন।" />
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-secondary text-primary-foreground">
        <div className="container py-10 text-center">
          <Gift className="h-10 w-10 mx-auto mb-2" />
          <h1 className="text-2xl md:text-4xl font-display font-bold">ফ্রি গিভঅ্যাওয়ে</h1>
          <p className="text-sm opacity-90 mt-1">নাম ও ফোন দিয়ে অংশ নিন — সম্পূর্ণ ফ্রি</p>
        </div>
      </section>

      <section className="container py-8 space-y-4">
        {loading ? <div className="text-center py-10"><Loader2 className="h-6 w-6 animate-spin inline" /></div> :
          rows.length === 0 ? (
            <div className="text-center py-16 space-y-2">
              <PartyPopper className="h-12 w-12 mx-auto text-muted-foreground" />
              <p className="text-muted-foreground">এখন কোনো গিভঅ্যাওয়ে চালু নেই — শীঘ্রই আসছে!</p>
            </div>
          ) : (
            <>
              <Card className="max-w-lg mx-auto">
                <CardContent className="pt-5 grid sm:grid-cols-3 gap-2">
                  <div><Label className="text-xs">আপনার নাম</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
                  <div><Label className="text-xs">ফোন</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
                  <div><Label className="text-xs">ইমেইল (ঐচ্ছিক)</Label><Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
                </CardContent>
              </Card>

              <div className="grid md:grid-cols-2 gap-4">
                {rows.map((g) => (
                  <Card key={g.id} className="overflow-hidden">
                    {g.image && <img src={g.image} alt={g.title} className="w-full aspect-video object-cover" />}
                    <CardContent className="pt-4 space-y-2">
                      <h2 className="font-display font-bold text-lg">{g.title_bn || g.title}</h2>
                      {g.prize && <p className="text-sm"><span className="text-muted-foreground">পুরস্কার:</span> <span className="font-semibold">{g.prize}</span></p>}
                      {g.description && <p className="text-sm text-muted-foreground whitespace-pre-wrap">{g.description}</p>}
                      {g.rules && <p className="text-xs text-muted-foreground whitespace-pre-wrap">নিয়ম: {g.rules}</p>}
                      {g.ends_at && <p className="text-xs text-muted-foreground">শেষ তারিখ: {new Date(g.ends_at).toLocaleDateString("bn-BD")}</p>}
                      <Button className="w-full" disabled={busy === g.id || joined.includes(g.id)} onClick={() => join(g.id)}>
                        {busy === g.id ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Users className="h-4 w-4 mr-1" />}
                        {joined.includes(g.id) ? "অংশ নেওয়া হয়েছে ✓" : "অংশ নিন"}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
      </section>
    </div>
  );
}
