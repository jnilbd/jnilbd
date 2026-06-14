import { useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  Upload,
  Download,
  FileType,
  Loader2,
  X,
  FileImage,
  FileText,
  Combine,
  Scissors,
  Minimize2,
  Image as ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";
import jsPDF from "jspdf";
import { PDFDocument } from "pdf-lib";
import JSZip from "jszip";

// pdfjs setup
import * as pdfjsLib from "pdfjs-dist";
// @ts-ignore
import pdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";
(pdfjsLib as any).GlobalWorkerOptions.workerSrc = pdfWorker;

type Category = "image" | "document" | "audio" | "video" | "text";

const FORMATS: Record<Category, string[]> = {
  image: ["png", "jpg", "webp", "pdf"],
  document: ["pdf", "txt", "html"],
  text: ["txt", "html", "md", "json"],
  audio: ["wav", "mp3-original", "webm"],
  video: ["webm-original", "mp4-original"],
};

// ===== helpers =====
const downloadBlob = (blob: Blob, name: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
};
const baseName = (n: string) => n.replace(/\.[^.]+$/, "");
const fmtSize = (n: number) =>
  n > 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(2)} MB` : `${(n / 1024).toFixed(1)} KB`;

async function renderPdfPageToCanvas(
  pdf: any,
  pageNum: number,
  scale = 2
): Promise<HTMLCanvasElement> {
  const page = await pdf.getPage(pageNum);
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement("canvas");
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  const ctx = canvas.getContext("2d")!;
  await page.render({ canvasContext: ctx, viewport, canvas }).promise;
  return canvas;
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  q: number
): Promise<Blob> {
  return new Promise((res, rej) =>
    canvas.toBlob((b) => (b ? res(b) : rej(new Error("toBlob failed"))), type, q)
  );
}

// Compress canvas to fit target size by iterating quality + scale
async function compressCanvasToTarget(
  canvas: HTMLCanvasElement,
  targetBytes: number,
  mime = "image/jpeg"
): Promise<Blob> {
  let q = 0.92;
  let blob = await canvasToBlob(canvas, mime, q);
  while (blob.size > targetBytes && q > 0.2) {
    q -= 0.1;
    blob = await canvasToBlob(canvas, mime, q);
  }
  if (blob.size <= targetBytes) return blob;
  // still too big — downscale
  let scale = 0.85;
  while (blob.size > targetBytes && scale > 0.2) {
    const c2 = document.createElement("canvas");
    c2.width = Math.max(100, Math.floor(canvas.width * scale));
    c2.height = Math.max(100, Math.floor(canvas.height * scale));
    const ctx = c2.getContext("2d")!;
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, c2.width, c2.height);
    ctx.drawImage(canvas, 0, 0, c2.width, c2.height);
    blob = await canvasToBlob(c2, mime, 0.7);
    scale -= 0.15;
  }
  return blob;
}

const Converter = () => {
  const { language } = useLanguage();
  const t = (bn: string, en: string) => (language === "bn" ? bn : en);

  return (
    <div className="container py-8 max-w-4xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-3">
            <FileType className="w-3.5 h-3.5" />
            {t("ফাইল কনভার্টার ও পিডিএফ টুলস", "File Converter & PDF Tools")}
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold mb-2">
            {t("সব ফাইল — এক জায়গায়", "All-in-one File Toolkit")}
          </h1>
          <p className="text-muted-foreground text-sm">
            {t(
              "কনভার্ট • কম্প্রেস • মার্জ • স্প্লিট • PDF↔JPG — সবকিছু ব্রাউজারেই, ১০০% প্রাইভেট",
              "Convert • Compress • Merge • Split • PDF↔JPG — all in browser, 100% private"
            )}
          </p>
        </div>

        <Tabs defaultValue="convert" className="w-full">
          <TabsList className="grid grid-cols-3 md:grid-cols-6 w-full h-auto">
            <TabsTrigger value="convert" className="text-xs">
              <FileType className="w-3 h-3 mr-1" />
              {t("কনভার্ট", "Convert")}
            </TabsTrigger>
            <TabsTrigger value="pdf2img" className="text-xs">
              <FileImage className="w-3 h-3 mr-1" />
              PDF→JPG
            </TabsTrigger>
            <TabsTrigger value="img2pdf" className="text-xs">
              <FileText className="w-3 h-3 mr-1" />
              JPG→PDF
            </TabsTrigger>
            <TabsTrigger value="compress" className="text-xs">
              <Minimize2 className="w-3 h-3 mr-1" />
              {t("কম্প্রেস", "Compress")}
            </TabsTrigger>
            <TabsTrigger value="merge" className="text-xs">
              <Combine className="w-3 h-3 mr-1" />
              {t("মার্জ", "Merge")}
            </TabsTrigger>
            <TabsTrigger value="split" className="text-xs">
              <Scissors className="w-3 h-3 mr-1" />
              {t("স্প্লিট", "Split")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="convert"><ConvertTab t={t} /></TabsContent>
          <TabsContent value="pdf2img"><PdfToImagesTab t={t} /></TabsContent>
          <TabsContent value="img2pdf"><ImagesToPdfTab t={t} /></TabsContent>
          <TabsContent value="compress"><CompressTab t={t} /></TabsContent>
          <TabsContent value="merge"><MergePdfTab t={t} /></TabsContent>
          <TabsContent value="split"><SplitPdfTab t={t} /></TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
};

// =================== TAB: Convert (legacy) ===================
function ConvertTab({ t }: { t: (bn: string, en: string) => string }) {
  const [file, setFile] = useState<File | null>(null);
  const [target, setTarget] = useState<string>("png");
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const detectCategory = (f: File): Category => {
    const m = f.type;
    if (m.startsWith("image/")) return "image";
    if (m.startsWith("audio/")) return "audio";
    if (m.startsWith("video/")) return "video";
    if (m === "application/pdf") return "document";
    if (m.startsWith("text/") || /\.(json|md|csv|html|txt)$/i.test(f.name)) return "text";
    return "document";
  };
  const category = file ? detectCategory(file) : null;
  const options = category ? FORMATS[category] : [];

  const onSelectFile = (f: File) => {
    setFile(f);
    setTarget(FORMATS[detectCategory(f)][0]);
  };

  const convertImage = async () => {
    if (!file) return;
    const img = new Image();
    img.src = URL.createObjectURL(file);
    await new Promise((r) => (img.onload = r));
    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext("2d")!;
    if (target === "jpg") {
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    ctx.drawImage(img, 0, 0);
    if (target === "pdf") {
      const pdf = new jsPDF({
        orientation: img.width > img.height ? "l" : "p",
        unit: "px",
        format: [img.width, img.height],
      });
      pdf.addImage(canvas.toDataURL("image/jpeg", 0.95), "JPEG", 0, 0, img.width, img.height);
      pdf.save(`${baseName(file.name)}.pdf`);
      return;
    }
    const mime = target === "jpg" ? "image/jpeg" : `image/${target}`;
    canvas.toBlob((b) => b && downloadBlob(b, `${baseName(file.name)}.${target}`), mime, 0.95);
  };

  const convertText = async () => {
    if (!file) return;
    const text = await file.text();
    let out = text;
    let mime = "text/plain";
    if (target === "html") {
      out = `<!doctype html><html><body><pre>${text.replace(/[<>&]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" }[c]!))}</pre></body></html>`;
      mime = "text/html";
    } else if (target === "json") {
      out = JSON.stringify({ content: text }, null, 2);
      mime = "application/json";
    } else if (target === "md") mime = "text/markdown";
    downloadBlob(new Blob([out], { type: mime }), `${baseName(file.name)}.${target}`);
  };

  const convertDocument = async () => {
    if (!file) return;
    if (target === "pdf") {
      const text = await file.text().catch(() => "");
      const pdf = new jsPDF();
      const lines = pdf.splitTextToSize(text || file.name, 180);
      pdf.text(lines, 15, 20);
      pdf.save(`${baseName(file.name)}.pdf`);
      return;
    }
    if (file.type === "application/pdf") {
      // PDF → text
      const buf = await file.arrayBuffer();
      const pdf = await (pdfjsLib as any).getDocument({ data: buf }).promise;
      let text = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const c = await page.getTextContent();
        text += c.items.map((it: any) => it.str).join(" ") + "\n\n";
      }
      let out = text;
      let mime = "text/plain";
      if (target === "html") {
        out = `<!doctype html><html><body><pre>${text.replace(/[<>&]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" }[c]!))}</pre></body></html>`;
        mime = "text/html";
      }
      downloadBlob(new Blob([out], { type: mime }), `${baseName(file.name)}.${target}`);
      return;
    }
    convertText();
  };

  const handleConvert = async () => {
    if (!file) return;
    setBusy(true);
    try {
      if (category === "image") await convertImage();
      else if (category === "text") await convertText();
      else if (category === "document") await convertDocument();
      else if (category === "audio") {
        downloadBlob(file, `${baseName(file.name)}.${target.split("-")[0]}`);
      } else if (category === "video") {
        downloadBlob(file, `${baseName(file.name)}.${target.split("-")[0]}`);
      }
      toast.success(t("কনভার্ট সম্পন্ন!", "Conversion complete!"));
    } catch (e: any) {
      console.error(e);
      toast.error(t("কনভার্ট করা যায়নি", "Conversion failed"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className="p-6 space-y-5 mt-4">
      <Dropzone onFile={onSelectFile} fileName={file?.name} inputRef={inputRef} t={t} />
      {file && (
        <>
          <FileChip file={file} onRemove={() => setFile(null)} extra={category || ""} />
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3">
            <div>
              <label className="text-sm font-medium mb-1.5 block">
                {t("টার্গেট ফরম্যাট", "Target format")}
              </label>
              <Select value={target} onValueChange={setTarget}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {options.map((o) => (
                    <SelectItem key={o} value={o}>{o.toUpperCase()}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={handleConvert} disabled={busy} className="w-full md:w-auto" size="lg">
                {busy ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
                {t("কনভার্ট ও ডাউনলোড", "Convert & Download")}
              </Button>
            </div>
          </div>
        </>
      )}
    </Card>
  );
}

// =================== TAB: PDF → Images ===================
function PdfToImagesTab({ t }: { t: (bn: string, en: string) => string }) {
  const [file, setFile] = useState<File | null>(null);
  const [format, setFormat] = useState("jpg");
  const [quality, setQuality] = useState(2); // scale
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const run = async () => {
    if (!file) return;
    setBusy(true);
    try {
      const buf = await file.arrayBuffer();
      const pdf = await (pdfjsLib as any).getDocument({ data: buf }).promise;
      const zip = new JSZip();
      const mime = format === "png" ? "image/png" : "image/jpeg";
      for (let i = 1; i <= pdf.numPages; i++) {
        const canvas = await renderPdfPageToCanvas(pdf, i, quality);
        const blob = await canvasToBlob(canvas, mime, 0.92);
        zip.file(`${baseName(file.name)}-page-${String(i).padStart(3, "0")}.${format}`, blob);
      }
      const out = await zip.generateAsync({ type: "blob" });
      downloadBlob(out, `${baseName(file.name)}-images.zip`);
      toast.success(t("ZIP ডাউনলোড হয়েছে", "ZIP downloaded"));
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || t("ব্যর্থ", "Failed"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className="p-6 space-y-4 mt-4">
      <h3 className="font-semibold">{t("PDF → JPG/PNG (ZIP)", "PDF → JPG/PNG (ZIP)")}</h3>
      <Dropzone
        onFile={(f) => setFile(f)}
        fileName={file?.name}
        inputRef={inputRef}
        t={t}
        accept="application/pdf"
        hint="PDF only"
      />
      {file && <FileChip file={file} onRemove={() => setFile(null)} extra="PDF" />}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium mb-1.5 block">{t("ফরম্যাট", "Format")}</label>
          <Select value={format} onValueChange={setFormat}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="jpg">JPG</SelectItem>
              <SelectItem value="png">PNG</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium mb-1.5 block">{t("কোয়ালিটি", "Quality")}</label>
          <Select value={String(quality)} onValueChange={(v) => setQuality(Number(v))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="1">{t("কম (ছোট)", "Low (small)")}</SelectItem>
              <SelectItem value="2">{t("মিডিয়াম", "Medium")}</SelectItem>
              <SelectItem value="3">{t("হাই", "High")}</SelectItem>
              <SelectItem value="4">{t("আল্ট্রা", "Ultra")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <Button onClick={run} disabled={!file || busy} className="w-full" size="lg">
        {busy ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
        {t("কনভার্ট ও ডাউনলোড (ZIP)", "Convert & Download (ZIP)")}
      </Button>
    </Card>
  );
}

// =================== TAB: Images → PDF ===================
function ImagesToPdfTab({ t }: { t: (bn: string, en: string) => string }) {
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const run = async () => {
    if (!files.length) return;
    setBusy(true);
    try {
      const pdfDoc = await PDFDocument.create();
      for (const f of files) {
        const bytes = new Uint8Array(await f.arrayBuffer());
        let img;
        if (/png$/i.test(f.name) || f.type === "image/png") img = await pdfDoc.embedPng(bytes);
        else if (/jpe?g$/i.test(f.name) || f.type === "image/jpeg") img = await pdfDoc.embedJpg(bytes);
        else {
          // fallback: re-encode as JPEG via canvas
          const url = URL.createObjectURL(f);
          const im = new Image();
          im.src = url;
          await new Promise((r) => (im.onload = r));
          const c = document.createElement("canvas");
          c.width = im.width; c.height = im.height;
          const ctx = c.getContext("2d")!;
          ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, c.width, c.height);
          ctx.drawImage(im, 0, 0);
          const blob = await canvasToBlob(c, "image/jpeg", 0.92);
          img = await pdfDoc.embedJpg(new Uint8Array(await blob.arrayBuffer()));
          URL.revokeObjectURL(url);
        }
        const page = pdfDoc.addPage([img.width, img.height]);
        page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
      }
      const bytes = await pdfDoc.save();
      downloadBlob(new Blob([new Uint8Array(bytes)], { type: "application/pdf" }), `images-${Date.now()}.pdf`);
      toast.success(t("PDF তৈরি হয়েছে", "PDF created"));
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || t("ব্যর্থ", "Failed"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className="p-6 space-y-4 mt-4">
      <h3 className="font-semibold">{t("JPG/PNG → PDF (একাধিক ছবি)", "JPG/PNG → PDF (multiple images)")}</h3>
      <div
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed border-border rounded-2xl p-8 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-smooth"
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*"
          hidden
          onChange={(e) => e.target.files && setFiles(Array.from(e.target.files))}
        />
        <Upload className="w-10 h-10 mx-auto mb-3 text-primary" />
        <p className="font-semibold">{t("একাধিক ছবি বাছুন", "Pick multiple images")}</p>
        <p className="text-xs text-muted-foreground">{files.length ? `${files.length} files` : "JPG / PNG / WebP"}</p>
      </div>
      {files.length > 0 && (
        <div className="space-y-1 max-h-40 overflow-auto text-xs">
          {files.map((f, i) => (
            <div key={i} className="flex justify-between p-2 rounded bg-muted/40">
              <span className="truncate">{i + 1}. {f.name}</span>
              <span className="text-muted-foreground">{fmtSize(f.size)}</span>
            </div>
          ))}
        </div>
      )}
      <Button onClick={run} disabled={!files.length || busy} className="w-full" size="lg">
        {busy ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
        {t("PDF তৈরি ও ডাউনলোড", "Create & Download PDF")}
      </Button>
    </Card>
  );
}

// =================== TAB: Compress (PDF / Image) ===================
function CompressTab({ t }: { t: (bn: string, en: string) => string }) {
  const [file, setFile] = useState<File | null>(null);
  const [targetKB, setTargetKB] = useState("700");
  const [busy, setBusy] = useState(false);
  const [outInfo, setOutInfo] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);

  const run = async () => {
    if (!file) return;
    setBusy(true);
    setOutInfo("");
    try {
      const target = Math.max(50, Number(targetKB) || 700) * 1024;

      // ===== Image input
      if (file.type.startsWith("image/")) {
        const url = URL.createObjectURL(file);
        const im = new Image();
        im.src = url;
        await new Promise((r) => (im.onload = r));
        const c = document.createElement("canvas");
        c.width = im.width; c.height = im.height;
        const ctx = c.getContext("2d")!;
        ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, c.width, c.height);
        ctx.drawImage(im, 0, 0);
        URL.revokeObjectURL(url);
        const blob = await compressCanvasToTarget(c, target, "image/jpeg");
        downloadBlob(blob, `${baseName(file.name)}-compressed.jpg`);
        setOutInfo(`${fmtSize(file.size)} → ${fmtSize(blob.size)}`);
        toast.success(t("ছবি কম্প্রেস হয়েছে", "Image compressed"));
        return;
      }

      // ===== PDF input: rasterize each page → JPEG (compressed) → rebuild PDF
      if (file.type === "application/pdf") {
        const buf = await file.arrayBuffer();
        const pdf = await (pdfjsLib as any).getDocument({ data: buf }).promise;
        const pageCount = pdf.numPages;
        // distribute target budget per page (with small overhead)
        const perPageBudget = Math.max(20 * 1024, Math.floor(target / pageCount) - 2048);

        const pdfDoc = await PDFDocument.create();
        for (let i = 1; i <= pageCount; i++) {
          const canvas = await renderPdfPageToCanvas(pdf, i, 1.5);
          const blob = await compressCanvasToTarget(canvas, perPageBudget, "image/jpeg");
          const jpgBytes = new Uint8Array(await blob.arrayBuffer());
          const img = await pdfDoc.embedJpg(jpgBytes);
          // keep original page aspect ratio in points (PDF: 1pt = 1/72in). Use canvas dims as points-ish
          const page = pdfDoc.addPage([canvas.width, canvas.height]);
          page.drawImage(img, { x: 0, y: 0, width: canvas.width, height: canvas.height });
        }
        const outBytes = await pdfDoc.save();
        const outBlob = new Blob([new Uint8Array(outBytes)], { type: "application/pdf" });
        downloadBlob(outBlob, `${baseName(file.name)}-compressed.pdf`);
        setOutInfo(`${fmtSize(file.size)} → ${fmtSize(outBlob.size)}`);
        toast.success(t("PDF কম্প্রেস হয়েছে", "PDF compressed"));
        return;
      }

      toast.error(t("শুধু PDF বা ছবি দিন", "Only PDF or image supported"));
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || t("ব্যর্থ", "Failed"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className="p-6 space-y-4 mt-4">
      <h3 className="font-semibold">
        {t("PDF / ছবি কম্প্রেস (টার্গেট সাইজ)", "PDF / Image Compress (target size)")}
      </h3>
      <p className="text-xs text-muted-foreground">
        {t(
          "৭ MB PDF কে ৭০০ KB তে আনতে চাও? টার্গেট দাও — PDF পেজ JPG তে রি-রেন্ডার করে আবার PDF বানিয়ে দেবে।",
          "Want 7MB PDF → 700KB? Set target — PDF pages will be rasterized to JPG and rebuilt as PDF."
        )}
      </p>
      <Dropzone
        onFile={(f) => { setFile(f); setOutInfo(""); }}
        fileName={file?.name}
        inputRef={inputRef}
        t={t}
        accept="application/pdf,image/*"
        hint="PDF / JPG / PNG"
      />
      {file && <FileChip file={file} onRemove={() => setFile(null)} extra={fmtSize(file.size)} />}
      <div>
        <label className="text-sm font-medium mb-1.5 block">
          {t("টার্গেট সাইজ (KB)", "Target size (KB)")}
        </label>
        <Input
          type="number"
          min={50}
          value={targetKB}
          onChange={(e) => setTargetKB(e.target.value)}
          placeholder="700"
        />
        <div className="flex gap-2 mt-2 flex-wrap">
          {["200", "500", "700", "1024", "2048"].map((k) => (
            <Button
              key={k}
              variant="outline"
              size="sm"
              onClick={() => setTargetKB(k)}
            >
              {k} KB
            </Button>
          ))}
        </div>
      </div>
      <Button onClick={run} disabled={!file || busy} className="w-full" size="lg">
        {busy ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Minimize2 className="w-4 h-4 mr-2" />}
        {t("কম্প্রেস ও ডাউনলোড", "Compress & Download")}
      </Button>
      {outInfo && (
        <div className="text-center text-sm text-primary font-semibold">{outInfo}</div>
      )}
    </Card>
  );
}

// =================== TAB: Merge PDFs ===================
function MergePdfTab({ t }: { t: (bn: string, en: string) => string }) {
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const run = async () => {
    if (files.length < 2) {
      toast.error(t("কমপক্ষে ২টি PDF দিন", "Pick at least 2 PDFs"));
      return;
    }
    setBusy(true);
    try {
      const merged = await PDFDocument.create();
      for (const f of files) {
        const src = await PDFDocument.load(await f.arrayBuffer());
        const pages = await merged.copyPages(src, src.getPageIndices());
        pages.forEach((p) => merged.addPage(p));
      }
      const bytes = await merged.save();
      downloadBlob(new Blob([new Uint8Array(bytes)], { type: "application/pdf" }), `merged-${Date.now()}.pdf`);
      toast.success(t("মার্জ সম্পন্ন", "Merged"));
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || t("ব্যর্থ", "Failed"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className="p-6 space-y-4 mt-4">
      <h3 className="font-semibold">{t("একাধিক PDF → ১টি PDF", "Merge multiple PDFs → one")}</h3>
      <div
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed border-border rounded-2xl p-8 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-smooth"
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="application/pdf"
          hidden
          onChange={(e) => e.target.files && setFiles(Array.from(e.target.files))}
        />
        <Combine className="w-10 h-10 mx-auto mb-3 text-primary" />
        <p className="font-semibold">{t("একাধিক PDF বাছুন", "Pick multiple PDFs")}</p>
        <p className="text-xs text-muted-foreground">{files.length ? `${files.length} files` : "PDF only"}</p>
      </div>
      {files.length > 0 && (
        <div className="space-y-1 max-h-40 overflow-auto text-xs">
          {files.map((f, i) => (
            <div key={i} className="flex justify-between p-2 rounded bg-muted/40">
              <span className="truncate">{i + 1}. {f.name}</span>
              <span className="text-muted-foreground">{fmtSize(f.size)}</span>
            </div>
          ))}
        </div>
      )}
      <Button onClick={run} disabled={files.length < 2 || busy} className="w-full" size="lg">
        {busy ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
        {t("মার্জ ও ডাউনলোড", "Merge & Download")}
      </Button>
    </Card>
  );
}

// =================== TAB: Split PDF ===================
function SplitPdfTab({ t }: { t: (bn: string, en: string) => string }) {
  const [file, setFile] = useState<File | null>(null);
  const [ranges, setRanges] = useState("1-3, 5, 7-9");
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const parseRanges = (s: string, max: number): number[][] => {
    const groups = s.split(",").map((g) => g.trim()).filter(Boolean);
    return groups.map((g) => {
      const m = g.match(/^(\d+)\s*-\s*(\d+)$/);
      if (m) {
        const a = Math.max(1, Math.min(max, Number(m[1])));
        const b = Math.max(1, Math.min(max, Number(m[2])));
        const [lo, hi] = a < b ? [a, b] : [b, a];
        return Array.from({ length: hi - lo + 1 }, (_, i) => lo + i - 1);
      }
      const n = Math.max(1, Math.min(max, Number(g)));
      return [n - 1];
    });
  };

  const run = async () => {
    if (!file) return;
    setBusy(true);
    try {
      const src = await PDFDocument.load(await file.arrayBuffer());
      const total = src.getPageCount();
      const groups = parseRanges(ranges, total).filter((g) => g.length);
      if (!groups.length) throw new Error("No valid pages");
      const zip = new JSZip();
      let idx = 1;
      for (const g of groups) {
        const out = await PDFDocument.create();
        const pages = await out.copyPages(src, g);
        pages.forEach((p) => out.addPage(p));
        const bytes = await out.save();
        zip.file(
          `${baseName(file.name)}-part-${idx}-(p${g[0] + 1}-${g[g.length - 1] + 1}).pdf`,
          bytes
        );
        idx++;
      }
      const blob = await zip.generateAsync({ type: "blob" });
      downloadBlob(blob, `${baseName(file.name)}-split.zip`);
      toast.success(t("স্প্লিট সম্পন্ন", "Split done"));
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || t("ব্যর্থ", "Failed"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className="p-6 space-y-4 mt-4">
      <h3 className="font-semibold">{t("PDF স্প্লিট (নির্দিষ্ট পেজ)", "Split PDF (specific pages)")}</h3>
      <Dropzone
        onFile={(f) => setFile(f)}
        fileName={file?.name}
        inputRef={inputRef}
        t={t}
        accept="application/pdf"
        hint="PDF only"
      />
      {file && <FileChip file={file} onRemove={() => setFile(null)} extra="PDF" />}
      <div>
        <label className="text-sm font-medium mb-1.5 block">
          {t("পেজ রেঞ্জ", "Page ranges")}{" "}
          <span className="text-xs text-muted-foreground">e.g. 1-3, 5, 7-9</span>
        </label>
        <Input value={ranges} onChange={(e) => setRanges(e.target.value)} placeholder="1-3, 5, 7-9" />
      </div>
      <Button onClick={run} disabled={!file || busy} className="w-full" size="lg">
        {busy ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Scissors className="w-4 h-4 mr-2" />}
        {t("স্প্লিট ও ডাউনলোড (ZIP)", "Split & Download (ZIP)")}
      </Button>
    </Card>
  );
}

// =================== shared sub-components ===================
function Dropzone({
  onFile,
  fileName,
  inputRef,
  t,
  accept,
  hint,
}: {
  onFile: (f: File) => void;
  fileName?: string;
  inputRef: React.RefObject<HTMLInputElement>;
  t: (bn: string, en: string) => string;
  accept?: string;
  hint?: string;
}) {
  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        const f = e.dataTransfer.files[0];
        if (f) onFile(f);
      }}
      className="border-2 border-dashed border-border rounded-2xl p-8 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-smooth"
    >
      <input
        ref={inputRef}
        type="file"
        hidden
        accept={accept}
        onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
      />
      <Upload className="w-10 h-10 mx-auto mb-3 text-primary" />
      <p className="font-semibold mb-1">
        {fileName || t("ফাইল আপলোড করুন বা টেনে আনুন", "Upload or drag a file here")}
      </p>
      <p className="text-xs text-muted-foreground">
        {hint || t("Image • PDF • Text • Audio • Video", "Image • PDF • Text • Audio • Video")}
      </p>
    </div>
  );
}

function FileChip({ file, onRemove, extra }: { file: File; onRemove: () => void; extra?: string }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
      <FileType className="w-5 h-5 text-primary" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{file.name}</p>
        <p className="text-xs text-muted-foreground">
          {fmtSize(file.size)} {extra ? `· ${extra}` : ""}
        </p>
      </div>
      <button onClick={onRemove} className="p-1 rounded hover:bg-background">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export default Converter;
