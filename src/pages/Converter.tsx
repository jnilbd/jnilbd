import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Upload, Download, FileType, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";
import jsPDF from "jspdf";

type Category = "image" | "document" | "audio" | "video" | "text";

const FORMATS: Record<Category, string[]> = {
  image: ["png", "jpg", "webp", "pdf"],
  document: ["pdf", "txt", "html"],
  text: ["txt", "html", "md", "json"],
  audio: ["wav", "mp3-original", "webm"],
  video: ["webm-original", "mp4-original"],
};

const Converter = () => {
  const { language } = useLanguage();
  const [file, setFile] = useState<File | null>(null);
  const [target, setTarget] = useState<string>("png");
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const t = (bn: string, en: string) => (language === "bn" ? bn : en);

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
    const cat = detectCategory(f);
    setTarget(FORMATS[cat][0]);
  };

  const downloadBlob = (blob: Blob, name: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  };

  const baseName = (n: string) => n.replace(/\.[^.]+$/, "");

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
      try {
        out = JSON.stringify({ content: text }, null, 2);
      } catch {}
      mime = "application/json";
    } else if (target === "md") {
      mime = "text/markdown";
    }
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
    convertText();
  };

  const convertAudio = async () => {
    if (!file) return;
    if (target === "wav") {
      const ac = new AudioContext();
      const buf = await ac.decodeAudioData(await file.arrayBuffer());
      const wav = audioBufferToWav(buf);
      downloadBlob(new Blob([wav], { type: "audio/wav" }), `${baseName(file.name)}.wav`);
      return;
    }
    downloadBlob(file, `${baseName(file.name)}.${target.split("-")[0]}`);
    toast.info(t("ফরম্যাট রি-প্যাকেজ করা হয়েছে", "Repackaged with new extension"));
  };

  const convertVideo = async () => {
    if (!file) return;
    downloadBlob(file, `${baseName(file.name)}.${target.split("-")[0]}`);
    toast.info(
      t(
        "ভিডিও ট্রান্সকোডিং ব্রাউজারে সীমিত — শুধু এক্সটেনশন পরিবর্তন",
        "Video transcoding is limited in browser — extension changed only"
      )
    );
  };

  const handleConvert = async () => {
    if (!file) return;
    setBusy(true);
    try {
      if (category === "image") await convertImage();
      else if (category === "text") await convertText();
      else if (category === "document") await convertDocument();
      else if (category === "audio") await convertAudio();
      else if (category === "video") await convertVideo();
      toast.success(t("কনভার্ট সম্পন্ন!", "Conversion complete!"));
    } catch (e) {
      console.error(e);
      toast.error(t("কনভার্ট করা যায়নি", "Conversion failed"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container py-8 max-w-3xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-3">
            <FileType className="w-3.5 h-3.5" />
            {t("ফাইল কনভার্টার", "File Converter")}
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold mb-2">
            {t("যেকোনো ফাইল — যেকোনো ফরম্যাটে", "Any file — to any format")}
          </h1>
          <p className="text-muted-foreground">
            {t(
              "ছবি, ডকুমেন্ট, অডিও, ভিডিও — ব্রাউজারেই কনভার্ট, ১০০% প্রাইভেট",
              "Image, document, audio, video — convert in browser, 100% private"
            )}
          </p>
        </div>

        <Card className="p-6 space-y-5">
          <div
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const f = e.dataTransfer.files[0];
              if (f) onSelectFile(f);
            }}
            className="border-2 border-dashed border-border rounded-2xl p-8 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-smooth"
          >
            <input
              ref={inputRef}
              type="file"
              hidden
              onChange={(e) => e.target.files?.[0] && onSelectFile(e.target.files[0])}
            />
            <Upload className="w-10 h-10 mx-auto mb-3 text-primary" />
            <p className="font-semibold mb-1">
              {file ? file.name : t("ফাইল আপলোড করুন বা টেনে আনুন", "Upload or drag a file here")}
            </p>
            <p className="text-xs text-muted-foreground">
              {t("Image • PDF • Text • Audio • Video", "Image • PDF • Text • Audio • Video")}
            </p>
          </div>

          {file && (
            <>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                <FileType className="w-5 h-5 text-primary" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(file.size / 1024).toFixed(1)} KB · {category}
                  </p>
                </div>
                <button onClick={() => setFile(null)} className="p-1 rounded hover:bg-background">
                  <X className="w-4 h-4" />
                </button>
              </div>

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

        <p className="text-xs text-center text-muted-foreground mt-4">
          {t(
            "ছবি ও টেক্সট সম্পূর্ণ কনভার্ট হয়। অডিও/ভিডিও কোডেক ব্রাউজারে সীমিত।",
            "Images and text fully convert. Audio/video codec support is limited in browser."
          )}
        </p>
      </motion.div>
    </div>
  );
};

function audioBufferToWav(buffer: AudioBuffer): ArrayBuffer {
  const numCh = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const samples = buffer.length;
  const blockAlign = numCh * 2;
  const dataSize = samples * blockAlign;
  const ab = new ArrayBuffer(44 + dataSize);
  const view = new DataView(ab);
  const writeStr = (o: number, s: string) => { for (let i = 0; i < s.length; i++) view.setUint8(o + i, s.charCodeAt(i)); };
  writeStr(0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeStr(8, "WAVE");
  writeStr(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numCh, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true);
  writeStr(36, "data");
  view.setUint32(40, dataSize, true);
  let offset = 44;
  const channels: Float32Array[] = [];
  for (let c = 0; c < numCh; c++) channels.push(buffer.getChannelData(c));
  for (let i = 0; i < samples; i++) {
    for (let c = 0; c < numCh; c++) {
      let s = Math.max(-1, Math.min(1, channels[c][i]));
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
      offset += 2;
    }
  }
  return ab;
}

export default Converter;
