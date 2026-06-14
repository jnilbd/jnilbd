import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Image as ImageIcon, Type, Download, Wand2, Layers, Sparkles, Upload, Loader2, Bot } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";

const PRESETS = [
  { name: "YouTube 16:9", w: 1280, h: 720 },
  { name: "Instagram Post 1:1", w: 1080, h: 1080 },
  { name: "Story / Reel 9:16", w: 1080, h: 1920 },
  { name: "Facebook Cover", w: 1640, h: 859 },
  { name: "LinkedIn Post", w: 1200, h: 627 },
];

const FONTS = ["Bebas Neue","Anton","Impact","Oswald","Poppins","Playfair Display","Montserrat","Hind Siliguri"];
const OVERLAYS = [
  { name: "None", css: "transparent" },
  { name: "Dark Bottom", css: "linear-gradient(to top, rgba(0,0,0,0.85), transparent 60%)" },
  { name: "Dark Full", css: "rgba(0,0,0,0.45)" },
  { name: "Vignette", css: "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.7))" },
  { name: "Sunset", css: "linear-gradient(135deg, rgba(251,113,133,0.45), rgba(251,191,36,0.35))" },
  { name: "Ocean", css: "linear-gradient(135deg, rgba(56,189,248,0.35), rgba(139,92,246,0.45))" },
];

const ThumbnailEditor = () => {
  const { language } = useLanguage();
  const bn = language === "bn";
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [preset, setPreset] = useState(0);

  const [title, setTitle] = useState(bn?"আপনার টাইটেল":"YOUR TITLE");
  const [subtitle, setSubtitle] = useState("");
  const [titleColor, setTitleColor] = useState("#ffffff");
  const [titleFont, setTitleFont] = useState("Bebas Neue");
  const [titleSize, setTitleSize] = useState(120);
  const [titleStroke, setTitleStroke] = useState(8);
  const [strokeColor, setStrokeColor] = useState("#000000");
  const [titleShadow, setTitleShadow] = useState(true);
  const [textAlign, setTextAlign] = useState<"left"|"center"|"right">("center");
  const [textY, setTextY] = useState(50);

  const [filter, setFilter] = useState({ brightness:100, contrast:110, saturate:120, blur:0 });
  const [overlay, setOverlay] = useState(1);
  const [bgColor, setBgColor] = useState("#0f172a");

  const [badge, setBadge] = useState("NEW");
  const [badgeColor, setBadgeColor] = useState("#ef4444");
  const [showBadge, setShowBadge] = useState(false);

  // AI generator state
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiStyle, setAiStyle] = useState("youtube");
  const [aiBusy, setAiBusy] = useState(false);

  const generateAI = async () => {
    if (!aiPrompt.trim()) { toast.error(bn ? "প্রম্পট লিখুন" : "Enter a prompt"); return; }
    setAiBusy(true);
    try {
      const p = PRESETS[preset];
      const aspect = p.w === p.h ? "1:1" : p.w > p.h ? "16:9" : "9:16";
      const { data, error } = await supabase.functions.invoke("ai-thumbnail", {
        body: { prompt: aiPrompt.trim(), style: aiStyle, aspect, title },
      });
      if (error) throw error;
      if (!data?.image) throw new Error(data?.error || "Failed");
      const i = new Image();
      i.crossOrigin = "anonymous";
      i.onload = () => {
        setImg(i);
        toast.success(bn ? "AI থাম্বনেইল তৈরি হয়েছে — এখন এডিট করুন!" : "AI thumbnail ready — now customize!");
      };
      i.src = data.image;
    } catch (e: any) {
      toast.error(e?.message || (bn ? "ব্যর্থ" : "Failed"));
    } finally {
      setAiBusy(false);
    }
  };

  const onUpload = (f: File) => {
    if (f.size > 20*1024*1024) { toast.error("Max 20MB"); return; }
    const url = URL.createObjectURL(f);
    const i = new Image();
    i.crossOrigin = "anonymous";
    i.onload = () => setImg(i);
    i.src = url;
  };

  // draw
  useEffect(() => {
    const c = canvasRef.current; if (!c) return;
    const p = PRESETS[preset];
    c.width = p.w; c.height = p.h;
    const ctx = c.getContext("2d"); if (!ctx) return;

    // bg
    ctx.fillStyle = bgColor;
    ctx.fillRect(0,0,p.w,p.h);

    // image with filter
    if (img) {
      ctx.filter = `brightness(${filter.brightness}%) contrast(${filter.contrast}%) saturate(${filter.saturate}%) blur(${filter.blur}px)`;
      const scale = Math.max(p.w/img.width, p.h/img.height);
      const dw = img.width*scale, dh = img.height*scale;
      ctx.drawImage(img, (p.w-dw)/2, (p.h-dh)/2, dw, dh);
      ctx.filter = "none";
    }

    // overlay
    const ov = OVERLAYS[overlay].css;
    if (ov !== "transparent") {
      if (ov.startsWith("linear-gradient")) {
        const g = ctx.createLinearGradient(0, p.h, 0, 0);
        g.addColorStop(0, "rgba(0,0,0,0.85)");
        g.addColorStop(0.6, "rgba(0,0,0,0)");
        if (overlay === 4) { // sunset
          const g2 = ctx.createLinearGradient(0,0,p.w,p.h);
          g2.addColorStop(0,"rgba(251,113,133,0.45)"); g2.addColorStop(1,"rgba(251,191,36,0.35)");
          ctx.fillStyle = g2;
        } else if (overlay === 5) {
          const g2 = ctx.createLinearGradient(0,0,p.w,p.h);
          g2.addColorStop(0,"rgba(56,189,248,0.35)"); g2.addColorStop(1,"rgba(139,92,246,0.45)");
          ctx.fillStyle = g2;
        } else { ctx.fillStyle = g; }
        ctx.fillRect(0,0,p.w,p.h);
      } else if (ov.startsWith("radial")) {
        const g = ctx.createRadialGradient(p.w/2, p.h/2, p.w*0.2, p.w/2, p.h/2, p.w*0.7);
        g.addColorStop(0, "rgba(0,0,0,0)"); g.addColorStop(1, "rgba(0,0,0,0.7)");
        ctx.fillStyle = g; ctx.fillRect(0,0,p.w,p.h);
      } else {
        ctx.fillStyle = ov; ctx.fillRect(0,0,p.w,p.h);
      }
    }

    // badge
    if (showBadge && badge) {
      ctx.save();
      ctx.translate(p.w - 80, 80);
      ctx.rotate(-0.15);
      ctx.fillStyle = badgeColor;
      ctx.beginPath();
      const bw = 220, bh = 80;
      ctx.roundRect(-bw, -bh/2, bw, bh, 12);
      ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.font = `bold 42px ${titleFont}`;
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(badge, -bw/2, 0);
      ctx.restore();
    }

    // text
    const x = textAlign==="left"? p.w*0.06 : textAlign==="right"? p.w*0.94 : p.w/2;
    const y = p.h * (textY/100);
    ctx.font = `900 ${titleSize}px ${titleFont}, sans-serif`;
    ctx.textAlign = textAlign as CanvasTextAlign;
    ctx.textBaseline = "middle";
    if (titleShadow) {
      ctx.shadowColor = "rgba(0,0,0,0.7)";
      ctx.shadowBlur = 24; ctx.shadowOffsetY = 6;
    }
    // word wrap
    const wrap = (text:string, max:number) => {
      const words = text.split(" "); const lines:string[] = []; let line="";
      words.forEach(w=>{
        const test = line? line+" "+w : w;
        if (ctx.measureText(test).width > max) { lines.push(line); line = w; } else line = test;
      });
      if (line) lines.push(line);
      return lines;
    };
    const lines = wrap(title, p.w*0.88);
    lines.forEach((ln,i)=>{
      const ly = y + (i - (lines.length-1)/2) * titleSize * 1.05;
      if (titleStroke > 0) {
        ctx.lineWidth = titleStroke;
        ctx.strokeStyle = strokeColor;
        ctx.strokeText(ln, x, ly);
      }
      ctx.fillStyle = titleColor;
      ctx.fillText(ln, x, ly);
    });
    ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;

    if (subtitle) {
      ctx.font = `600 ${Math.round(titleSize*0.4)}px ${titleFont}, sans-serif`;
      ctx.fillStyle = titleColor;
      ctx.fillText(subtitle, x, y + (lines.length/2 + 0.6) * titleSize);
    }
  }, [img, preset, title, subtitle, titleColor, titleFont, titleSize, titleStroke, strokeColor, titleShadow, textAlign, textY, filter, overlay, bgColor, badge, badgeColor, showBadge]);

  const download = () => {
    const c = canvasRef.current; if (!c) return;
    const link = document.createElement("a");
    link.download = `thumbnail-${Date.now()}.png`;
    link.href = c.toDataURL("image/png");
    link.click();
    toast.success(bn?"ডাউনলোড শুরু হয়েছে":"Download started");
  };

  return (
    <div className="container py-6 lg:py-10 space-y-6">
      <motion.div initial={{opacity:0,y:-10}} animate={{opacity:1,y:0}} className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl gradient-bg-warm text-white flex items-center justify-center shadow-pink">
          <ImageIcon className="w-6 h-6" />
        </div>
        <div>
          <h1 className="font-display text-2xl lg:text-3xl font-bold">{bn?"থাম্বনেইল মেকার":"Thumbnail Maker"}</h1>
          <p className="text-xs text-muted-foreground">{bn?"AI দিয়ে তৈরি করুন, তারপর মন মতো এডিট করুন":"Generate with AI, then customize freely"}</p>
        </div>
      </motion.div>

      {/* AI Thumbnail Generator */}
      <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/10 via-secondary/5 to-background">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl gradient-bg-primary text-white flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <p className="font-display font-bold text-sm">{bn ? "AI থাম্বনেইল মেকার (অ্যাডভান্স)" : "AI Thumbnail Maker (Advanced)"}</p>
              <p className="text-[11px] text-muted-foreground">{bn ? "শুধু বর্ণনা লিখুন — AI জেনারেট করার পর পুরোপুরি এডিট করতে পারবেন" : "Describe your scene — AI generates, then you can fully edit & extend"}</p>
            </div>
          </div>
          <Textarea
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            placeholder={bn
              ? "যেমন: একজন তরুণ ছেলে অবাক চেহারায় ল্যাপটপের সামনে, পেছনে বিস্ফোরণ ও সোনার কয়েন উড়ছে, dramatic lighting"
              : "e.g. A shocked young man in front of a laptop, explosions and gold coins flying behind, dramatic lighting"}
            rows={3}
            maxLength={500}
            className="resize-none text-sm"
          />
          <div className="grid grid-cols-2 gap-2">
            <Select value={aiStyle} onValueChange={setAiStyle}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="youtube">YouTube Viral</SelectItem>
                <SelectItem value="cinematic">Cinematic Poster</SelectItem>
                <SelectItem value="minimal">Minimal / Editorial</SelectItem>
                <SelectItem value="tech">Tech / Product</SelectItem>
                <SelectItem value="vlog">Vlog / Lifestyle</SelectItem>
                <SelectItem value="gaming">Gaming</SelectItem>
                <SelectItem value="educational">Educational</SelectItem>
                <SelectItem value="news">News / Documentary</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={generateAI} disabled={aiBusy} className="gradient-bg-primary text-white">
              {aiBusy ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
              {bn ? "AI দিয়ে তৈরি করুন" : "Generate with AI"}
            </Button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {[
              bn ? "ব্যবসা সফলতার গল্প, dramatic" : "Business success story, dramatic",
              bn ? "নতুন প্রোডাক্ট রিভিউ, studio light" : "New product review, studio light",
              bn ? "ভ্রমণ ভ্লগ, কক্সবাজার সমুদ্র" : "Travel vlog, Bali beach sunset",
              bn ? "গেমিং highlight, neon RGB" : "Gaming highlight, neon RGB",
            ].map((s) => (
              <button
                key={s}
                onClick={() => setAiPrompt(s)}
                className="text-[11px] px-2 py-1 rounded-full bg-muted hover:bg-primary/20"
              >
                {s}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground italic">
            {bn
              ? "টিপ: AI ইমেজে টেক্সট লেখা হবে না — নিচের টেক্সট ট্যাব দিয়ে টাইটেল বসান এবং ফিল্টার/ওভারলে দিয়ে আরো সাজান।"
              : "Tip: AI won't add text — use the Text tab below to add titles and Filter/Overlay to refine further."}
          </p>
        </CardContent>
      </Card>

      {/* Bangla guideline card */}
      <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
        <CardContent className="p-4 space-y-1.5">
          <p className="font-display font-bold text-sm flex items-center gap-1.5"><Sparkles className="w-4 h-4 text-secondary" />{bn?"সহজ গাইডলাইন (A-Z)":"Quick Guide"}</p>
          <ol className="text-xs text-muted-foreground space-y-0.5 list-decimal list-inside">
            {bn ? (<>
              <li>উপরে সাইজ প্রিসেট সিলেক্ট করুন (YouTube 16:9 ইত্যাদি)</li>
              <li>"AI দিয়ে তৈরি করুন" — বা নিজের ছবি "আপলোড" করুন</li>
              <li>"টেক্সট" ট্যাব থেকে টাইটেল/সাবটাইটেল, ফন্ট, কালার দিন</li>
              <li>"ফিল্টার" দিয়ে brightness/contrast ঠিক করুন, ওভারলে দিন</li>
              <li>"ব্যাজ" অন করে NEW/HOT/SALE লেখা যোগ করুন</li>
              <li>"ডাউনলোড HD" বাটনে ক্লিক করে PNG সেভ করুন ✅</li>
            </>) : (<>
              <li>Pick a size preset (YouTube 16:9, etc.)</li>
              <li>Generate with AI — or upload your own image</li>
              <li>Add title/subtitle, font and color in the Text tab</li>
              <li>Adjust filters and overlay for clarity</li>
              <li>Optionally add a NEW/HOT/SALE badge</li>
              <li>Click Download HD to save PNG ✅</li>
            </>)}
          </ol>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-[1fr_360px] gap-4">
        {/* Canvas preview */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Select value={String(preset)} onValueChange={v=>setPreset(Number(v))}>
              <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
              <SelectContent>{PRESETS.map((p,i)=>(<SelectItem key={i} value={String(i)}>{p.name}</SelectItem>))}</SelectContent>
            </Select>
            <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={e=>e.target.files?.[0]&&onUpload(e.target.files[0])} />
            <Button variant="outline" onClick={()=>fileInputRef.current?.click()}><Upload className="w-4 h-4 mr-2" />{bn?"ছবি আপলোড":"Upload"}</Button>
            <Button onClick={download} className="gradient-bg-primary text-white ml-auto"><Download className="w-4 h-4 mr-2" />{bn?"ডাউনলোড HD":"Download HD"}</Button>
          </div>
          <div className="rounded-3xl border-2 border-border/60 bg-muted/30 p-2 lg:p-4 overflow-auto">
            <canvas ref={canvasRef} className="max-w-full h-auto rounded-xl shadow-elegant mx-auto block bg-black" style={{ maxHeight: "70vh" }} />
          </div>
        </div>

        {/* Controls */}
        <Tabs defaultValue="text" className="lg:sticky lg:top-20 lg:self-start">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="text"><Type className="w-3.5 h-3.5" /></TabsTrigger>
            <TabsTrigger value="filter"><Wand2 className="w-3.5 h-3.5" /></TabsTrigger>
            <TabsTrigger value="overlay"><Layers className="w-3.5 h-3.5" /></TabsTrigger>
            <TabsTrigger value="badge">★</TabsTrigger>
          </TabsList>

          <TabsContent value="text" className="space-y-3 mt-3">
            <Card><CardContent className="p-3 space-y-3">
              <div><Label>{bn?"টাইটেল":"Title"}</Label><Input value={title} onChange={e=>setTitle(e.target.value)} maxLength={80} /></div>
              <div><Label>{bn?"সাবটাইটেল":"Subtitle"}</Label><Input value={subtitle} onChange={e=>setSubtitle(e.target.value)} maxLength={60} /></div>
              <div><Label>{bn?"ফন্ট":"Font"}</Label>
                <Select value={titleFont} onValueChange={setTitleFont}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{FONTS.map(f=>(<SelectItem key={f} value={f}>{f}</SelectItem>))}</SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div><Label className="text-xs">{bn?"টেক্সট কালার":"Color"}</Label><Input type="color" value={titleColor} onChange={e=>setTitleColor(e.target.value)} className="h-10 p-1" /></div>
                <div><Label className="text-xs">{bn?"স্ট্রোক":"Stroke"}</Label><Input type="color" value={strokeColor} onChange={e=>setStrokeColor(e.target.value)} className="h-10 p-1" /></div>
              </div>
              <div><Label className="text-xs">{bn?"ফন্ট সাইজ":"Font size"}: {titleSize}</Label><Slider value={[titleSize]} min={40} max={260} step={2} onValueChange={v=>setTitleSize(v[0])} /></div>
              <div><Label className="text-xs">{bn?"স্ট্রোক পুরুত্ব":"Stroke width"}: {titleStroke}</Label><Slider value={[titleStroke]} min={0} max={20} step={1} onValueChange={v=>setTitleStroke(v[0])} /></div>
              <div><Label className="text-xs">{bn?"টেক্সট পজিশন (Y)":"Text Y"}: {textY}%</Label><Slider value={[textY]} min={10} max={90} step={1} onValueChange={v=>setTextY(v[0])} /></div>
              <div className="flex gap-1">
                {(["left","center","right"] as const).map(a=>(
                  <Button key={a} size="sm" variant={textAlign===a?"default":"outline"} onClick={()=>setTextAlign(a)} className="flex-1 capitalize">{a}</Button>
                ))}
              </div>
              <Button size="sm" variant={titleShadow?"default":"outline"} onClick={()=>setTitleShadow(!titleShadow)} className="w-full">{bn?"টেক্সট শ্যাডো":"Text shadow"}: {titleShadow?"ON":"OFF"}</Button>
            </CardContent></Card>
          </TabsContent>

          <TabsContent value="filter" className="space-y-3 mt-3">
            <Card><CardContent className="p-3 space-y-3">
              <div><Label className="text-xs">{bn?"ব্যাকগ্রাউন্ড কালার":"Background"}</Label><Input type="color" value={bgColor} onChange={e=>setBgColor(e.target.value)} className="h-10 p-1" /></div>
              {(["brightness","contrast","saturate","blur"] as const).map(k=>(
                <div key={k}><Label className="text-xs capitalize">{k}: {filter[k]}{k==="blur"?"px":"%"}</Label>
                  <Slider value={[filter[k]]} min={0} max={k==="blur"?20:200} step={1} onValueChange={v=>setFilter({...filter,[k]:v[0]})} />
                </div>
              ))}
            </CardContent></Card>
          </TabsContent>

          <TabsContent value="overlay" className="space-y-3 mt-3">
            <Card><CardContent className="p-3 space-y-2">
              <Label className="text-xs">{bn?"ওভারলে স্টাইল":"Overlay style"}</Label>
              <div className="grid grid-cols-2 gap-2">
                {OVERLAYS.map((o,i)=>(
                  <button key={i} onClick={()=>setOverlay(i)} className={`p-3 rounded-xl border-2 text-xs font-semibold ${overlay===i?"border-primary bg-primary/10":"border-border"}`}>{o.name}</button>
                ))}
              </div>
            </CardContent></Card>
          </TabsContent>

          <TabsContent value="badge" className="space-y-3 mt-3">
            <Card><CardContent className="p-3 space-y-3">
              <Button size="sm" variant={showBadge?"default":"outline"} onClick={()=>setShowBadge(!showBadge)} className="w-full">{bn?"ব্যাজ দেখান":"Show badge"}: {showBadge?"ON":"OFF"}</Button>
              <Input value={badge} onChange={e=>setBadge(e.target.value)} maxLength={12} placeholder="NEW / HOT / SALE" />
              <Input type="color" value={badgeColor} onChange={e=>setBadgeColor(e.target.value)} className="h-10 p-1" />
            </CardContent></Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ThumbnailEditor;
