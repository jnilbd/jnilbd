import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Loader2, Download, ExternalLink, AlertTriangle, Youtube, Smartphone, Shield, Wrench, Unlock } from "lucide-react";
import { toast } from "sonner";

type Mode = "twrp" | "roms" | "recovery" | "unlock";

const MODE_META: Record<Mode, { bn: string; en: string; icon: any; desc: string }> = {
  twrp: { bn: "TWRP / রিকভারি", en: "TWRP", icon: Wrench, desc: "অফিসিয়াল ও আনঅফিসিয়াল কাস্টম রিকভারি" },
  roms: { bn: "কাস্টম রম", en: "Custom ROMs", icon: Smartphone, desc: "LineageOS, crDroid, PixelOS, Evolution X এবং পোর্ট" },
  recovery: { bn: "ডেড/ব্রিক রিকভার", en: "Recovery", icon: Shield, desc: "ফোন ডেড হলে স্টক ফার্মওয়্যার ও মেথড" },
  unlock: { bn: "লক খোলা", en: "Unlock", icon: Unlock, desc: "FRP, Google, KG, Knox, কিস্তি, অ্যাডমিন লক" },
};

export default function PhoneRootUnlock() {
  const [model, setModel] = useState("");
  const [mode, setMode] = useState<Mode>("twrp");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);

  const search = async (m: Mode) => {
    if (!model.trim()) {
      toast.error("ফোনের মডেল লিখুন (যেমন: Redmi Note 11, Samsung A52, Realme 9 Pro)");
      return;
    }
    setMode(m);
    setLoading(true);
    setData(null);
    try {
      const { data: res, error } = await supabase.functions.invoke("phone-root-unlock", {
        body: { model: model.trim(), mode: m },
      });
      if (error) throw error;
      setData(res);
    } catch (e: any) {
      toast.error(e.message || "AI সার্চে সমস্যা");
    } finally {
      setLoading(false);
    }
  };

  const ytUrl = (q: string) => `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`;

  return (
    <div className="container py-6 space-y-6 max-w-6xl">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Smartphone className="h-7 w-7" /> ফোন রুট ও লক খোলা
        </h1>
        <p className="text-muted-foreground text-sm">
          ফোনের মডেল দিন — AI খুঁজে দিবে TWRP, কাস্টম রম, ডেড রিকভারি ও সকল ধরনের লক খোলার সমাধান। ⚠️ নিজের ঝুঁকিতে ব্যবহার করুন।
        </p>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-3">
          <div className="flex gap-2 flex-col sm:flex-row">
            <Input
              placeholder="ফোনের মডেল লিখুন... (যেমন: Redmi Note 12 Pro, Samsung Galaxy A52, Realme 9, Vivo Y22)"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="flex-1"
            />
            <Button onClick={() => search(mode)} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "AI সার্চ"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs value={mode} onValueChange={(v) => setMode(v as Mode)}>
        <TabsList className="grid grid-cols-2 md:grid-cols-4 h-auto">
          {(Object.keys(MODE_META) as Mode[]).map((k) => {
            const I = MODE_META[k].icon;
            return (
              <TabsTrigger key={k} value={k} onClick={() => model && search(k)} className="flex-col h-auto py-3 gap-1">
                <I className="h-4 w-4" />
                <span className="text-xs">{MODE_META[k].bn}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {(Object.keys(MODE_META) as Mode[]).map((k) => (
          <TabsContent key={k} value={k} className="space-y-4 mt-4">
            <p className="text-sm text-muted-foreground">{MODE_META[k].desc}</p>

            {loading && mode === k && (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}

            {!loading && mode === k && data && <ResultView mode={k} data={data} ytUrl={ytUrl} />}

            {!loading && mode === k && !data && (
              <Card>
                <CardContent className="py-10 text-center text-sm text-muted-foreground">
                  উপরের বক্সে ফোনের মডেল লিখে "AI সার্চ" চাপুন।
                </CardContent>
              </Card>
            )}
          </TabsContent>
        ))}
      </Tabs>

      <Card className="border-yellow-500/40 bg-yellow-500/5">
        <CardContent className="pt-6 text-xs space-y-1">
          <p className="font-semibold flex items-center gap-1"><AlertTriangle className="h-4 w-4" /> দায়মুক্তি</p>
          <p>রুট, কাস্টম রম বা লক খোলার কাজ ওয়ারেন্টি বাতিল করতে পারে এবং ফোন স্থায়ীভাবে নষ্ট হতে পারে। চুরি/কিস্তি অসম্পূর্ণ ফোনের লক খোলা আইনত অপরাধ। নিজের ফোন ও নিজের দায়িত্বে কাজ করুন।</p>
        </CardContent>
      </Card>
    </div>
  );
}

function LinkList({ items }: { items: any[] }) {
  if (!items?.length) return <p className="text-sm text-muted-foreground">কোন তথ্য পাওয়া যায়নি।</p>;
  return (
    <div className="space-y-2">
      {items.map((it, i) => (
        <div key={i} className="border rounded-lg p-3 hover:bg-muted/30 transition">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div className="flex-1 min-w-0">
              <div className="font-medium">{it.name}</div>
              {(it.version || it.android || it.maintainer) && (
                <div className="text-xs text-muted-foreground mt-0.5">
                  {it.version && <span>v{it.version}</span>}
                  {it.android && <span> • Android {it.android}</span>}
                  {it.maintainer && <span> • by {it.maintainer}</span>}
                </div>
              )}
              {it.notes && <p className="text-xs text-muted-foreground mt-1">{it.notes}</p>}
            </div>
            {it.url && (
              <Button asChild size="sm" variant="outline">
                <a href={it.url} target="_blank" rel="noopener noreferrer">
                  <Download className="h-3 w-3 mr-1" /> ডাউনলোড
                </a>
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function StepsList({ steps, title }: { steps?: string[]; title: string }) {
  if (!steps?.length) return null;
  return (
    <Card>
      <CardHeader className="pb-3"><CardTitle className="text-base">{title}</CardTitle></CardHeader>
      <CardContent>
        <ol className="space-y-1.5 text-sm list-decimal list-inside">
          {steps.map((s, i) => <li key={i}>{s}</li>)}
        </ol>
      </CardContent>
    </Card>
  );
}

function YoutubeBtn({ q, ytUrl }: { q?: string; ytUrl: (q: string) => string }) {
  if (!q) return null;
  return (
    <Button asChild variant="outline" className="w-full">
      <a href={ytUrl(q)} target="_blank" rel="noopener noreferrer">
        <Youtube className="h-4 w-4 mr-2 text-red-500" /> YouTube ভিডিও গাইড দেখুন
      </a>
    </Button>
  );
}

function ResultView({ mode, data, ytUrl }: { mode: Mode; data: any; ytUrl: (q: string) => string }) {
  if (data.raw) {
    return <Card><CardContent className="pt-6"><pre className="text-xs whitespace-pre-wrap">{data.raw}</pre></CardContent></Card>;
  }

  if (mode === "twrp" || mode === "roms") {
    return (
      <div className="space-y-4">
        {data.codename && (
          <Badge variant="secondary">Codename: {data.codename}</Badge>
        )}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Badge className="bg-green-600">অফিসিয়াল</Badge>
              {mode === "twrp" ? "TWRP / OrangeFox Official" : "Official Custom ROMs"}
            </CardTitle>
          </CardHeader>
          <CardContent><LinkList items={data.official || []} /></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Badge variant="outline">আনঅফিসিয়াল / পোর্ট</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent><LinkList items={data.unofficial || []} /></CardContent>
        </Card>
        <StepsList steps={data.flashing_guide_bn || data.install_guide_bn} title="ইনস্টল গাইড (বাংলায়)" />
        <YoutubeBtn q={data.youtube_search} ytUrl={ytUrl} />
      </div>
    );
  }

  if (mode === "recovery") {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">স্টক ফার্মওয়্যার সোর্স</CardTitle></CardHeader>
          <CardContent>
            <LinkList items={(data.stock_firmware || []).map((s: any) => ({ name: s.source, url: s.url, notes: s.notes }))} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">ফ্ল্যাশ টুল</CardTitle></CardHeader>
          <CardContent>
            <LinkList items={(data.tools || []).map((t: any) => ({ name: t.name, url: t.url, notes: t.use }))} />
          </CardContent>
        </Card>
        <StepsList steps={data.recovery_steps_bn} title="রিকভারি স্টেপ" />
        {data.warnings_bn?.length > 0 && (
          <Card className="border-destructive/40 bg-destructive/5">
            <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><AlertTriangle className="h-4 w-4" /> সতর্কতা</CardTitle></CardHeader>
            <CardContent><ul className="list-disc list-inside text-sm space-y-1">{data.warnings_bn.map((w: string, i: number) => <li key={i}>{w}</li>)}</ul></CardContent>
          </Card>
        )}
        <YoutubeBtn q={data.youtube_search} ytUrl={ytUrl} />
      </div>
    );
  }

  if (mode === "unlock") {
    return (
      <div className="space-y-4">
        {(data.solutions || []).map((s: any, i: number) => (
          <Card key={i}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2 flex-wrap">
                <Unlock className="h-4 w-4" /> {s.lock_type}
                {s.difficulty && <Badge variant={s.difficulty === 'easy' ? 'default' : s.difficulty === 'hard' ? 'destructive' : 'secondary'}>{s.difficulty}</Badge>}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {s.tools?.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {s.tools.map((t: string, j: number) => <Badge key={j} variant="outline">{t}</Badge>)}
                </div>
              )}
              {s.steps_bn?.length > 0 && (
                <ol className="text-sm list-decimal list-inside space-y-1">
                  {s.steps_bn.map((st: string, j: number) => <li key={j}>{st}</li>)}
                </ol>
              )}
              {s.download_links?.length > 0 && <LinkList items={s.download_links} />}
              {s.youtube_search && (
                <Button asChild size="sm" variant="outline">
                  <a href={ytUrl(s.youtube_search)} target="_blank" rel="noopener noreferrer">
                    <Youtube className="h-3 w-3 mr-1 text-red-500" /> YouTube
                  </a>
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
        {data.warnings_bn?.length > 0 && (
          <Card className="border-destructive/40 bg-destructive/5">
            <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><AlertTriangle className="h-4 w-4" /> আইনি সতর্কতা</CardTitle></CardHeader>
            <CardContent><ul className="list-disc list-inside text-sm space-y-1">{data.warnings_bn.map((w: string, i: number) => <li key={i}>{w}</li>)}</ul></CardContent>
          </Card>
        )}
      </div>
    );
  }

  return null;
}
