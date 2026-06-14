import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Type } from "lucide-react";

type Props = { imageSrc: string; defaultHeadline?: string; defaultCta?: string };

const POSITIONS = [
  { id: "bottom", label: "নিচে" },
  { id: "top", label: "উপরে" },
  { id: "center", label: "মাঝখানে" },
];

export default function BanglaImageOverlay({ imageSrc, defaultHeadline = "", defaultCta = "" }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const [headline, setHeadline] = useState(defaultHeadline);
  const [cta, setCta] = useState(defaultCta);
  const [fontSize, setFontSize] = useState(72);
  const [position, setPosition] = useState("bottom");
  const [color, setColor] = useState("#ffffff");
  const [bgColor, setBgColor] = useState("#000000");
  const [bgOpacity, setBgOpacity] = useState(60);
  const [ready, setReady] = useState(false);

  // Load Hind Siliguri before drawing so canvas can render Bangla glyphs.
  useEffect(() => {
    const ensure = async () => {
      try {
        // @ts-ignore
        await document.fonts.load(`700 ${fontSize}px "Hind Siliguri"`);
        // @ts-ignore
        await document.fonts.load(`600 ${Math.round(fontSize * 0.6)}px "Hind Siliguri"`);
      } catch {}
      setReady(true);
    };
    ensure();
  }, [fontSize]);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => { imgRef.current = img; draw(); };
    img.src = imageSrc;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageSrc]);

  useEffect(() => { if (ready) draw(); /* eslint-disable-next-line */ }, [headline, cta, fontSize, position, color, bgColor, bgOpacity, ready]);

  const wrapText = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] => {
    const words = text.split(/\s+/);
    const lines: string[] = [];
    let line = "";
    for (const w of words) {
      const test = line ? line + " " + w : w;
      if (ctx.measureText(test).width > maxWidth && line) {
        lines.push(line);
        line = w;
      } else line = test;
    }
    if (line) lines.push(line);
    return lines;
  };

  const draw = () => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(img, 0, 0);

    const W = canvas.width;
    const H = canvas.height;
    const pad = Math.round(W * 0.05);
    const maxW = W - pad * 2;
    const headFont = `700 ${fontSize}px "Hind Siliguri", "Noto Sans Bengali", sans-serif`;
    const ctaSize = Math.round(fontSize * 0.55);
    const ctaFont = `600 ${ctaSize}px "Hind Siliguri", "Noto Sans Bengali", sans-serif`;

    ctx.font = headFont;
    ctx.textBaseline = "top";
    const headLines = headline ? wrapText(ctx, headline, maxW) : [];
    const lineH = Math.round(fontSize * 1.35);
    const headBlock = headLines.length * lineH;
    const ctaBlock = cta ? Math.round(ctaSize * 2.2) : 0;
    const gap = cta && headLines.length ? Math.round(fontSize * 0.4) : 0;
    const totalH = headBlock + gap + ctaBlock;

    let y = position === "top" ? pad
          : position === "center" ? Math.round((H - totalH) / 2)
          : H - totalH - pad;

    // Background band
    if (bgOpacity > 0 && (headLines.length || cta)) {
      const bandPad = Math.round(fontSize * 0.5);
      ctx.fillStyle = hexToRgba(bgColor, bgOpacity / 100);
      ctx.fillRect(0, y - bandPad, W, totalH + bandPad * 2);
    }

    // Headline
    ctx.font = headFont;
    ctx.fillStyle = color;
    ctx.textAlign = "center";
    for (const ln of headLines) {
      ctx.fillText(ln, W / 2, y);
      y += lineH;
    }
    if (cta) {
      y += gap;
      // CTA pill
      ctx.font = ctaFont;
      const ctaW = ctx.measureText(cta).width;
      const padX = Math.round(ctaSize * 0.9);
      const padY = Math.round(ctaSize * 0.4);
      const pillW = ctaW + padX * 2;
      const pillH = ctaSize + padY * 2;
      const pillX = (W - pillW) / 2;
      ctx.fillStyle = color;
      roundRect(ctx, pillX, y, pillW, pillH, pillH / 2);
      ctx.fill();
      ctx.fillStyle = bgColor;
      ctx.fillText(cta, W / 2, y + padY);
    }
  };

  const download = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `ad-creative-${Date.now()}.png`;
    a.click();
  };

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h3 className="font-semibold flex items-center gap-2">
          <Type className="h-4 w-4" /> বাংলা টেক্সট ওভারলে (Hind Siliguri)
        </h3>
        <Button size="sm" onClick={download} className="gap-1">
          <Download className="h-3 w-3" /> ডাউনলোড
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        AI ইমেজে সরাসরি বাংলা ফন্ট রেন্ডার হয় না, তাই এখানে আপনার বাংলা হেডলাইন/CTA যোগ করুন — Hind Siliguri ফন্টে পরিষ্কার আসবে।
      </p>

      <div className="grid md:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">হেডলাইন</Label>
          <Input value={headline} onChange={(e) => setHeadline(e.target.value)} placeholder="যেমন: ৫০% ছাড় চলছে" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">CTA</Label>
          <Input value={cta} onChange={(e) => setCta(e.target.value)} placeholder="যেমন: অর্ডার করুন" />
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-3">
        <div className="space-y-1.5 md:col-span-2">
          <Label className="text-xs">ফন্ট সাইজ: {fontSize}px</Label>
          <Slider value={[fontSize]} min={32} max={160} step={2} onValueChange={(v) => setFontSize(v[0])} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">পজিশন</Label>
          <Select value={position} onValueChange={setPosition}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {POSITIONS.map((p) => <SelectItem key={p.id} value={p.id}>{p.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">ব্যান্ড অপাসিটি: {bgOpacity}%</Label>
          <Slider value={[bgOpacity]} min={0} max={100} step={5} onValueChange={(v) => setBgOpacity(v[0])} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">টেক্সট কালার</Label>
          <Input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-10 p-1" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">ব্যাকগ্রাউন্ড কালার</Label>
          <Input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="h-10 p-1" />
        </div>
      </div>

      <div className="rounded-md border bg-muted/30 overflow-hidden">
        <canvas ref={canvasRef} className="w-full h-auto block" />
      </div>
    </Card>
  );
}

function hexToRgba(hex: string, a: number) {
  const m = hex.replace("#", "");
  const r = parseInt(m.substring(0, 2), 16);
  const g = parseInt(m.substring(2, 4), 16);
  const b = parseInt(m.substring(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
