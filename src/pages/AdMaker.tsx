import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  Sparkles, Loader2, Copy, Check, Download, Wand2, Megaphone, Target,
  DollarSign, Palette, Image as ImageIcon, AlertTriangle, Facebook, Instagram,
  Youtube, Linkedin, Twitter, Globe, RefreshCw, Film,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import BanglaImageOverlay from "@/components/BanglaImageOverlay";

type Pack = any;

const PLATFORMS = [
  { id: "all", label: "সব প্ল্যাটফর্ম", icon: Globe },
  { id: "facebook", label: "Facebook", icon: Facebook },
  { id: "instagram", label: "Instagram", icon: Instagram },
  { id: "google", label: "Google Ads", icon: Globe },
  { id: "tiktok", label: "TikTok", icon: Megaphone },
  { id: "youtube", label: "YouTube", icon: Youtube },
  { id: "linkedin", label: "LinkedIn", icon: Linkedin },
  { id: "twitter", label: "Twitter/X", icon: Twitter },
];

function CopyBtn({ text, label = "" }: { text: string; label?: string }) {
  const [done, setDone] = useState(false);
  return (
    <Button
      size="sm"
      variant="ghost"
      className="h-7 px-2"
      onClick={() => {
        navigator.clipboard.writeText(text);
        setDone(true);
        toast.success("কপি হয়েছে");
        setTimeout(() => setDone(false), 1500);
      }}
    >
      {done ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
      {label && <span className="ml-1 text-xs">{label}</span>}
    </Button>
  );
}

function CopyCard({ title, text }: { title: string; text: string }) {
  return (
    <Card className="p-3">
      <div className="flex items-start justify-between gap-2 mb-1">
        <p className="text-xs font-semibold text-muted-foreground">{title}</p>
        <CopyBtn text={text} />
      </div>
      <p className="text-sm whitespace-pre-wrap">{text}</p>
    </Card>
  );
}

export default function AdMaker() {
  const [idea, setIdea] = useState("");
  const [product, setProduct] = useState("");
  const [price, setPrice] = useState("");
  const [audience, setAudience] = useState("");
  const [tone, setTone] = useState("persuasive, urgent");
  const [language, setLanguage] = useState<"bn" | "en" | "both">("bn");
  const [platform, setPlatform] = useState("all");
  const [imageUrl, setImageUrl] = useState("");
  const [generateImage, setGenerateImage] = useState(true);

  const [loading, setLoading] = useState(false);
  const [pack, setPack] = useState<Pack | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [activePlat, setActivePlat] = useState("facebook");
  const [regenLoading, setRegenLoading] = useState(false);
  const [videoLoading, setVideoLoading] = useState(false);
  const [videoFrames, setVideoFrames] = useState<string[]>([]);
  const [videoShots, setVideoShots] = useState<string[]>([]);
  const [videoFrameIdx, setVideoFrameIdx] = useState(0);
  const [videoPlaying, setVideoPlaying] = useState(false);

  const handleGenerate = async () => {
    if (idea.trim().length < 5) {
      toast.error("আপনার আইডিয়া অন্তত ৫ অক্ষরের লিখুন");
      return;
    }
    setLoading(true);
    setPack(null);
    setGeneratedImage(null);
    try {
      const { data, error } = await supabase.functions.invoke("ad-content-maker", {
        body: { idea, product, price, audience, tone, language, platform, imageUrl: imageUrl || undefined, generateImage },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setPack(data?.pack ?? null);
      setGeneratedImage(data?.generatedImage ?? null);
      toast.success("অ্যাড কনটেন্ট তৈরি হয়েছে! 🎉");
    } catch (e: any) {
      const msg = String(e?.message ?? e);
      if (msg.includes("429")) toast.error("রেট লিমিট — কিছুক্ষণ পরে চেষ্টা করুন");
      else if (msg.includes("402")) toast.error("AI ক্রেডিট শেষ — ওয়ার্কস্পেসে টপ আপ করুন");
      else toast.error("ত্রুটি: " + msg);
    } finally {
      setLoading(false);
    }
  };

  const downloadJson = () => {
    if (!pack) return;
    const blob = new Blob([JSON.stringify(pack, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ad-content-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <section className="border-b bg-gradient-to-br from-primary/10 via-transparent to-accent/10">
        <div className="container mx-auto px-4 py-10 md:py-14">
          <Badge variant="secondary" className="mb-3 gap-1"><Sparkles className="h-3 w-3" />AI-Powered • Lovable AI</Badge>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-3 flex items-center gap-3">
            <Wand2 className="h-8 w-8 md:h-12 md:w-12 text-primary" />
            অ্যাড কনটেন্ট মেকার AI
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            শুধু আপনার আইডিয়া বা প্রোডাক্ট লিখুন — AI মুহূর্তে তৈরি করে দিবে হেডলাইন, কপি, ডেসক্রিপশন, হ্যাশট্যাগ, টার্গেটিং, বাজেট, ক্রিয়েটিভ ব্রিফ এবং রেডি ইমেজ। Facebook, Instagram, Google, TikTok, YouTube, LinkedIn — সব প্ল্যাটফর্মের জন্য একসাথে।
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 grid lg:grid-cols-[420px_1fr] gap-6">
        {/* Input panel */}
        <Card className="p-5 space-y-4 h-fit lg:sticky lg:top-20">
          <h2 className="font-bold flex items-center gap-2"><Megaphone className="h-4 w-4" />আপনার আইডিয়া</h2>

          <div className="space-y-2">
            <Label>প্রোডাক্ট/সার্ভিসের আইডিয়া *</Label>
            <Textarea
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              placeholder="যেমন: পোর্টেবল মিনি ব্লেন্ডার — USB চার্জ, ব্যাগে রাখা যায়, ৩০ সেকেন্ডে ফ্রেশ জুস"
              rows={4}
              maxLength={2000}
            />
            <p className="text-xs text-muted-foreground">{idea.length}/২০০০</p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1.5">
              <Label className="text-xs">প্রোডাক্ট নাম</Label>
              <Input value={product} onChange={(e) => setProduct(e.target.value)} placeholder="Brand X" maxLength={80} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">দাম</Label>
              <Input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="৳১,৪৯০" maxLength={40} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">টার্গেট অডিয়েন্স</Label>
            <Input value={audience} onChange={(e) => setAudience(e.target.value)} placeholder="যেমন: ২২-৪০ বছরের কর্মজীবী মেয়ে" maxLength={200} />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">টোন</Label>
            <Input value={tone} onChange={(e) => setTone(e.target.value)} placeholder="persuasive, urgent, fun" maxLength={100} />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1.5">
              <Label className="text-xs">ভাষা</Label>
              <Select value={language} onValueChange={(v: any) => setLanguage(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="bn">বাংলা</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="both">দুটোই</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">প্রাইমারি প্ল্যাটফর্ম</Label>
              <Select value={platform} onValueChange={setPlatform}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PLATFORMS.map((p) => <SelectItem key={p.id} value={p.id}>{p.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">রেফারেন্স ইমেজ URL (ঐচ্ছিক)</Label>
            <Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." maxLength={500} />
            <p className="text-xs text-muted-foreground">আপনার প্রোডাক্টের ছবির লিংক দিলে AI সেটার ভিজ্যুয়াল স্টাইল বুঝে কপি লিখবে</p>
          </div>

          <div className="flex items-center justify-between p-3 rounded-md bg-muted/40">
            <div>
              <Label className="text-sm">AI ইমেজ জেনারেট করো</Label>
              <p className="text-xs text-muted-foreground">রেডি অ্যাড ক্রিয়েটিভ তৈরি হবে</p>
            </div>
            <Switch checked={generateImage} onCheckedChange={setGenerateImage} />
          </div>

          <Button onClick={handleGenerate} disabled={loading} className="w-full gap-2" size="lg">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {loading ? "তৈরি হচ্ছে..." : "অ্যাড কনটেন্ট তৈরি করো"}
          </Button>
        </Card>

        {/* Output panel */}
        <div className="space-y-6">
          {!pack && !loading && (
            <Card className="p-12 text-center bg-gradient-to-br from-muted/20 to-muted/5">
              <Wand2 className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
              <h3 className="font-bold mb-1">আপনার আইডিয়া দিন, বাকিটা AI করবে</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                হেডলাইন, কপি, ডেসক্রিপশন, CTA, হ্যাশট্যাগ, টার্গেটিং, বাজেট, ক্রিয়েটিভ ব্রিফ — সব এক ক্লিকে।
              </p>
            </Card>
          )}

          {loading && (
            <Card className="p-12 text-center">
              <Loader2 className="h-12 w-12 mx-auto text-primary animate-spin mb-3" />
              <p className="font-semibold">আপনার অ্যাড কনটেন্ট তৈরি হচ্ছে...</p>
              <p className="text-sm text-muted-foreground mt-1">৩০-৬০ সেকেন্ড সময় লাগতে পারে</p>
            </Card>
          )}

          {pack && (
            <>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />আপনার অ্যাড রেডি!
                </h2>
                <Button size="sm" variant="outline" onClick={downloadJson} className="gap-1">
                  <Download className="h-3 w-3" />JSON ডাউনলোড
                </Button>
              </div>

              {pack.summary && (
                <Card className="p-4 bg-primary/5 border-primary/30">
                  <p className="text-sm"><b>কনসেপ্ট:</b> {pack.summary}</p>
                </Card>
              )}

              {generatedImage && (
                <BanglaImageOverlay
                  imageSrc={generatedImage}
                  defaultHeadline={pack?.headlines?.[0] || ""}
                  defaultCta={pack?.ctas?.[0] || "অর্ডার করুন"}
                />
              )}

              {/* Hook angles & headlines */}
              {pack.hook_angles?.length > 0 && (
                <Card className="p-4">
                  <h3 className="font-semibold mb-2">🎯 হুক অ্যাঙ্গেল (টেস্টের জন্য)</h3>
                  <div className="grid sm:grid-cols-3 gap-2">
                    {pack.hook_angles.map((h: string, i: number) => (
                      <div key={i} className="p-3 bg-muted/40 rounded text-sm flex justify-between items-start gap-2">
                        <span>{h}</span><CopyBtn text={h} />
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {pack.headlines?.length > 0 && (
                <Card className="p-4">
                  <h3 className="font-semibold mb-3">📰 হেডলাইন (৫টি ভ্যারিয়েশন)</h3>
                  <div className="space-y-2">
                    {pack.headlines.map((h: string, i: number) => (
                      <div key={i} className="flex items-center justify-between gap-2 p-2 bg-muted/30 rounded">
                        <span className="font-medium">{h}</span>
                        <CopyBtn text={h} />
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {pack.primary_texts?.length > 0 && (
                <Card className="p-4">
                  <h3 className="font-semibold mb-3">📝 প্রাইমারি টেক্সট (৩টি কপি)</h3>
                  <div className="grid md:grid-cols-3 gap-3">
                    {pack.primary_texts.map((t: string, i: number) => (
                      <CopyCard key={i} title={`ভ্যারিয়েশন ${i + 1}`} text={t} />
                    ))}
                  </div>
                </Card>
              )}

              {/* CTAs + Hashtags */}
              <div className="grid md:grid-cols-2 gap-4">
                {pack.ctas?.length > 0 && (
                  <Card className="p-4">
                    <h3 className="font-semibold mb-2">🔘 CTA বাটন</h3>
                    <div className="flex flex-wrap gap-2">
                      {pack.ctas.map((c: string, i: number) => (
                        <Badge key={i} variant="outline" className="cursor-pointer hover:bg-primary/10" onClick={() => { navigator.clipboard.writeText(c); toast.success("কপি"); }}>{c}</Badge>
                      ))}
                    </div>
                  </Card>
                )}
                {pack.hashtags?.length > 0 && (
                  <Card className="p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-semibold"># হ্যাশট্যাগ</h3>
                      <CopyBtn text={pack.hashtags.join(" ")} label="সব কপি" />
                    </div>
                    <p className="text-sm text-primary leading-relaxed">{pack.hashtags.map((h: string) => h.startsWith("#") ? h : `#${h}`).join(" ")}</p>
                  </Card>
                )}
              </div>

              {/* Platform-specific tabs */}
              {pack.platform_specs && (
                <Card className="p-4">
                  <h3 className="font-semibold mb-3 flex items-center gap-2"><Globe className="h-4 w-4" />প্ল্যাটফর্ম-ভিত্তিক কনটেন্ট</h3>
                  <Tabs value={activePlat} onValueChange={setActivePlat}>
                    <TabsList className="grid w-full grid-cols-3 md:grid-cols-7 h-auto gap-1">
                      {["facebook", "instagram", "google", "tiktok", "youtube", "linkedin", "twitter"].map((p) => (
                        <TabsTrigger key={p} value={p} className="text-xs capitalize py-2">{p}</TabsTrigger>
                      ))}
                    </TabsList>
                    {["facebook", "instagram", "google", "tiktok", "youtube", "linkedin", "twitter"].map((p) => {
                      const spec = pack.platform_specs?.[p];
                      if (!spec) return <TabsContent key={p} value={p} className="mt-4"><p className="text-sm text-muted-foreground">এই প্ল্যাটফর্মের ডেটা নেই</p></TabsContent>;
                      return (
                        <TabsContent key={p} value={p} className="mt-4 space-y-2">
                          {Object.entries(spec).map(([key, val]: any) => (
                            <CopyCard key={key} title={key.replace(/_/g, " ")} text={Array.isArray(val) ? val.join("\n") : String(val)} />
                          ))}
                        </TabsContent>
                      );
                    })}
                  </Tabs>
                </Card>
              )}

              {/* Targeting + Budget */}
              <div className="grid md:grid-cols-2 gap-4">
                {pack.targeting && (
                  <Card className="p-4">
                    <h3 className="font-semibold mb-3 flex items-center gap-2"><Target className="h-4 w-4" />টার্গেটিং</h3>
                    <div className="space-y-2 text-sm">
                      {pack.targeting.age_range && <p><b>বয়স:</b> {pack.targeting.age_range}</p>}
                      {pack.targeting.gender && <p><b>লিঙ্গ:</b> {pack.targeting.gender}</p>}
                      {pack.targeting.locations && <p><b>লোকেশন:</b> {pack.targeting.locations.join(", ")}</p>}
                      {pack.targeting.interests && (
                        <div><b>Interests:</b> <div className="flex flex-wrap gap-1 mt-1">{pack.targeting.interests.map((i: string, idx: number) => <Badge key={idx} variant="secondary" className="text-xs">{i}</Badge>)}</div></div>
                      )}
                      {pack.targeting.behaviors && <p><b>Behaviors:</b> {pack.targeting.behaviors.join(", ")}</p>}
                      {pack.targeting.lookalike_seed && <p className="text-muted-foreground"><b>Lookalike seed:</b> {pack.targeting.lookalike_seed}</p>}
                    </div>
                  </Card>
                )}

                {pack.budget_recommendation && (
                  <Card className="p-4">
                    <h3 className="font-semibold mb-3 flex items-center gap-2"><DollarSign className="h-4 w-4" />বাজেট সুপারিশ</h3>
                    <div className="space-y-2 text-sm">
                      <p><b>টেস্ট দৈনিক বাজেট:</b> {pack.budget_recommendation.test_daily_budget_bdt}</p>
                      <p><b>স্কেল বাজেট:</b> {pack.budget_recommendation.scale_daily_budget_bdt}</p>
                      <p><b>প্রত্যাশিত CPP:</b> {pack.budget_recommendation.expected_cpp_bdt}</p>
                      <p className="text-green-600 font-semibold"><b>প্রত্যাশিত ROAS:</b> {pack.budget_recommendation.expected_roas}</p>
                    </div>
                  </Card>
                )}
              </div>

              {/* Creative Brief */}
              {pack.creative_brief && (
                <Card className="p-4">
                  <h3 className="font-semibold mb-3 flex items-center gap-2"><Palette className="h-4 w-4" />ক্রিয়েটিভ ব্রিফ</h3>
                  <div className="space-y-3">
                    {pack.creative_brief.image_prompt && (
                      <CopyCard title="ইমেজ জেনারেশন প্রম্পট" text={pack.creative_brief.image_prompt} />
                    )}
                    {pack.creative_brief.video_storyboard && (
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground mb-2">ভিডিও স্টোরিবোর্ড</p>
                        <ol className="space-y-1.5 text-sm list-decimal pl-5">
                          {pack.creative_brief.video_storyboard.map((s: string, i: number) => <li key={i}>{s}</li>)}
                        </ol>
                      </div>
                    )}
                    {pack.creative_brief.color_palette && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-muted-foreground">কালার প্যালেট:</span>
                        {pack.creative_brief.color_palette.map((c: string, i: number) => (
                          <div key={i} className="flex items-center gap-1">
                            <div className="w-6 h-6 rounded border" style={{ background: c }} />
                            <span className="text-xs font-mono">{c}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {pack.creative_brief.music_mood && <p className="text-sm"><b>মিউজিক মুড:</b> {pack.creative_brief.music_mood}</p>}
                  </div>
                </Card>
              )}

              {/* A/B test + compliance */}
              <Accordion type="multiple" className="bg-card border rounded-lg">
                {pack.ab_test_plan?.length > 0 && (
                  <AccordionItem value="ab" className="border-b">
                    <AccordionTrigger className="px-4">🧪 A/B টেস্ট প্ল্যান</AccordionTrigger>
                    <AccordionContent className="px-4">
                      <ol className="space-y-1.5 text-sm list-decimal pl-5">
                        {pack.ab_test_plan.map((t: string, i: number) => <li key={i}>{t}</li>)}
                      </ol>
                    </AccordionContent>
                  </AccordionItem>
                )}
                {pack.compliance_warnings?.length > 0 && (
                  <AccordionItem value="comp">
                    <AccordionTrigger className="px-4"><span className="flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-amber-600" />অ্যাড পলিসি সতর্কতা</span></AccordionTrigger>
                    <AccordionContent className="px-4">
                      <ul className="space-y-1.5 text-sm list-disc pl-5">
                        {pack.compliance_warnings.map((c: string, i: number) => <li key={i}>{c}</li>)}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                )}
              </Accordion>

              <Card className="p-4 bg-gradient-to-br from-primary/10 to-accent/10 border-primary/30">
                <h3 className="font-semibold mb-2">🔗 ইন্টিগ্রেশন গাইড</h3>
                <ul className="text-sm space-y-1.5 text-muted-foreground">
                  <li>• <b>Facebook/Instagram:</b> Meta Ads Manager → Create → Paste primary text, headline, description, upload image/video → Set audience using targeting suggestions</li>
                  <li>• <b>Google Ads:</b> Search Campaign → New Ad → Use 15-char headlines and 90-char descriptions, paste callouts and sitelinks</li>
                  <li>• <b>TikTok Ads Manager:</b> Spark Ads → Use the 3s hook + 30s script as creative direction</li>
                  <li>• <b>YouTube:</b> Upload video with the title/description/tags/thumbnail text provided</li>
                  <li>• Sister tools: <a className="text-primary underline" href="/scheduler">শিডিউল মেসেজ</a> দিয়ে অ্যাড লঞ্চের পর কাস্টমারকে ফলো-আপ পাঠাও</li>
                </ul>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
