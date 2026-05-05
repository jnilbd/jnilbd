import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Mic, Music, Volume2, Play, Pause, Download, Upload, Wand2, Square } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

// AudioBuffer -> WAV blob
function bufferToWav(buf: AudioBuffer): Blob {
  const numCh = buf.numberOfChannels, sr = buf.sampleRate;
  const len = buf.length * numCh * 2 + 44;
  const ab = new ArrayBuffer(len);
  const view = new DataView(ab);
  const writeStr = (o:number,s:string)=>{ for(let i=0;i<s.length;i++) view.setUint8(o+i, s.charCodeAt(i)); };
  let p = 0;
  writeStr(p,"RIFF"); p+=4; view.setUint32(p, len-8, true); p+=4;
  writeStr(p,"WAVEfmt "); p+=8; view.setUint32(p,16,true); p+=4;
  view.setUint16(p,1,true); p+=2; view.setUint16(p,numCh,true); p+=2;
  view.setUint32(p,sr,true); p+=4; view.setUint32(p,sr*numCh*2,true); p+=4;
  view.setUint16(p,numCh*2,true); p+=2; view.setUint16(p,16,true); p+=2;
  writeStr(p,"data"); p+=4; view.setUint32(p, buf.length*numCh*2, true); p+=4;
  const channels:Float32Array[] = [];
  for (let i=0;i<numCh;i++) channels.push(buf.getChannelData(i));
  for (let i=0;i<buf.length;i++) {
    for (let c=0;c<numCh;c++) {
      let s = Math.max(-1, Math.min(1, channels[c][i]));
      view.setInt16(p, s<0?s*0x8000:s*0x7FFF, true); p+=2;
    }
  }
  return new Blob([ab], { type: "audio/wav" });
}

const VoiceEditor = () => {
  const { language } = useLanguage();
  const bn = language === "bn";
  const fileRef = useRef<HTMLInputElement>(null);
  const musicRef = useRef<HTMLInputElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const recRef = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);

  const [voiceBuf, setVoiceBuf] = useState<AudioBuffer | null>(null);
  const [voiceUrl, setVoiceUrl] = useState<string>("");
  const [musicBuf, setMusicBuf] = useState<AudioBuffer | null>(null);
  const [outputUrl, setOutputUrl] = useState<string>("");
  const [recording, setRecording] = useState(false);
  const [busy, setBusy] = useState(false);

  // settings
  const [bass, setBass] = useState(3);     // dB low
  const [treble, setTreble] = useState(4); // dB high
  const [denoise, setDenoise] = useState(60); // highpass freq
  const [compress, setCompress] = useState(true);
  const [voiceGain, setVoiceGain] = useState(1.4);
  const [musicGain, setMusicGain] = useState(0.35);
  const [pitchSemis, setPitchSemis] = useState(0);

  const ctx = () => (audioCtxRef.current ||= new AudioContext());

  const decode = async (file: File) => {
    const ab = await file.arrayBuffer();
    const c = ctx();
    return await c.decodeAudioData(ab.slice(0));
  };

  const onVoice = async (f: File) => {
    if (f.size > 30*1024*1024) { toast.error("Max 30MB"); return; }
    setBusy(true);
    try {
      const buf = await decode(f);
      setVoiceBuf(buf);
      setVoiceUrl(URL.createObjectURL(f));
      setOutputUrl("");
      toast.success(bn?"ভয়েস লোড হয়েছে":"Voice loaded");
    } catch(e){ toast.error("Decode failed"); }
    setBusy(false);
  };

  const onMusic = async (f: File) => {
    if (f.size > 30*1024*1024) { toast.error("Max 30MB"); return; }
    setBusy(true);
    try {
      const buf = await decode(f);
      setMusicBuf(buf);
      toast.success(bn?"মিউজিক লোড হয়েছে":"Music loaded");
    } catch(e){ toast.error("Decode failed"); }
    setBusy(false);
  };

  const startRec = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      chunks.current = [];
      const mr = new MediaRecorder(stream);
      mr.ondataavailable = (e) => chunks.current.push(e.data);
      mr.onstop = async () => {
        const blob = new Blob(chunks.current, { type: "audio/webm" });
        stream.getTracks().forEach(t=>t.stop());
        const f = new File([blob], "recording.webm");
        await onVoice(f);
      };
      mr.start();
      recRef.current = mr;
      setRecording(true);
    } catch (e:any) { toast.error(bn?"মাইক্রোফোন অনুমতি প্রয়োজন":"Microphone permission needed"); }
  };
  const stopRec = () => { recRef.current?.stop(); setRecording(false); };

  const process = async () => {
    if (!voiceBuf) { toast.error(bn?"আগে ভয়েস লোড করুন":"Load voice first"); return; }
    setBusy(true);
    try {
      const sr = voiceBuf.sampleRate;
      const pitchRate = Math.pow(2, pitchSemis/12);
      const length = Math.max(voiceBuf.length, musicBuf?Math.round(musicBuf.length*sr/musicBuf.sampleRate):0);
      const off = new OfflineAudioContext(2, length, sr);

      // voice chain
      const vSrc = off.createBufferSource();
      vSrc.buffer = voiceBuf;
      vSrc.playbackRate.value = pitchRate;

      const hp = off.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = denoise;
      const lp = off.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 12000;
      const bassF = off.createBiquadFilter(); bassF.type = "lowshelf"; bassF.frequency.value = 200; bassF.gain.value = bass;
      const trebF = off.createBiquadFilter(); trebF.type = "highshelf"; trebF.frequency.value = 4000; trebF.gain.value = treble;
      const comp = off.createDynamicsCompressor();
      if (compress) { comp.threshold.value = -24; comp.knee.value = 30; comp.ratio.value = 4; comp.attack.value = 0.005; comp.release.value = 0.25; }
      const vGain = off.createGain(); vGain.gain.value = voiceGain;

      vSrc.connect(hp).connect(lp).connect(bassF).connect(trebF).connect(comp).connect(vGain).connect(off.destination);
      vSrc.start(0);

      if (musicBuf) {
        const mSrc = off.createBufferSource();
        mSrc.buffer = musicBuf;
        mSrc.loop = true;
        const mGain = off.createGain(); mGain.gain.value = musicGain;
        // sidechain feel: simple ducking via slow gain envelope
        const dur = voiceBuf.duration / pitchRate;
        mGain.gain.setValueAtTime(musicGain*0.4, 0);
        mGain.gain.linearRampToValueAtTime(musicGain, Math.min(1, dur*0.05));
        mGain.gain.setValueAtTime(musicGain*0.6, Math.max(0, dur-0.5));
        mGain.gain.linearRampToValueAtTime(0, dur);
        mSrc.connect(mGain).connect(off.destination);
        mSrc.start(0);
        mSrc.stop(dur + 0.1);
      }

      const rendered = await off.startRendering();
      const blob = bufferToWav(rendered);
      if (outputUrl) URL.revokeObjectURL(outputUrl);
      setOutputUrl(URL.createObjectURL(blob));
      toast.success(bn?"প্রসেস সম্পন্ন!":"Processed!");
    } catch (e:any) {
      toast.error(e.message || "Process failed");
    } finally { setBusy(false); }
  };

  const download = () => {
    if (!outputUrl) return;
    const a = document.createElement("a");
    a.href = outputUrl; a.download = `voice-${Date.now()}.wav`; a.click();
  };

  // presets
  const applyPreset = (p:string) => {
    if (p==="podcast") { setBass(3); setTreble(4); setDenoise(80); setCompress(true); setVoiceGain(1.5); setPitchSemis(0); }
    if (p==="phone")   { setBass(-6); setTreble(-3); setDenoise(300); setCompress(true); setVoiceGain(1.3); setPitchSemis(0); }
    if (p==="cinema")  { setBass(5); setTreble(2); setDenoise(60); setCompress(true); setVoiceGain(1.6); setPitchSemis(-1); }
    if (p==="anime")   { setBass(-4); setTreble(8); setDenoise(80); setCompress(true); setVoiceGain(1.4); setPitchSemis(5); }
    if (p==="deep")    { setBass(8); setTreble(-2); setDenoise(60); setCompress(true); setVoiceGain(1.4); setPitchSemis(-4); }
    toast.success(`Preset: ${p}`);
  };

  return (
    <div className="container py-6 lg:py-10 space-y-6 max-w-5xl">
      <motion.div initial={{opacity:0,y:-10}} animate={{opacity:1,y:0}} className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl gradient-bg-cool text-white flex items-center justify-center shadow-glow">
          <Mic className="w-6 h-6" />
        </div>
        <div>
          <h1 className="font-display text-2xl lg:text-3xl font-bold">{bn?"ভয়েস এডিটর":"Voice Editor"}</h1>
          <p className="text-xs text-muted-foreground">{bn?"নয়েজ ক্যান্সেল • ভয়েস ইম্প্রুভ • মিউজিক যোগ":"Denoise • Improve • Add music"}</p>
        </div>
      </motion.div>

      <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
        <CardContent className="p-4 text-xs space-y-1">
          <p className="font-display font-bold text-sm flex items-center gap-1.5"><Wand2 className="w-4 h-4 text-secondary" />{bn?"কীভাবে ব্যবহার করবেন":"How to use"}</p>
          <ol className="list-decimal list-inside text-muted-foreground space-y-0.5">
            {bn ? (<>
              <li>"ভয়েস আপলোড" বা "রেকর্ড" বাটন থেকে অডিও দিন</li>
              <li>চাইলে একটা মিউজিক ফাইল আপলোড করুন (গান বানাতে চাইলে)</li>
              <li>"প্রিসেট" সিলেক্ট করুন (Podcast / Phone / Cinema / Anime / Deep)</li>
              <li>স্লাইডার দিয়ে আরো কাস্টমাইজ করুন</li>
              <li>"প্রসেস" → তারপর প্লে করে শুনুন → "ডাউনলোড" 🎧</li>
            </>) : (<>
              <li>Upload or record your voice</li>
              <li>Optionally upload a music track</li>
              <li>Pick a preset (Podcast/Phone/Cinema/Anime/Deep)</li>
              <li>Fine-tune with sliders</li>
              <li>Process → preview → Download 🎧</li>
            </>)}
          </ol>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Inputs */}
        <Card><CardContent className="p-4 space-y-4">
          <h3 className="font-display font-bold">{bn?"১. অডিও ইনপুট":"1. Audio Input"}</h3>
          <input ref={fileRef} type="file" accept="audio/*" hidden onChange={e=>e.target.files?.[0]&&onVoice(e.target.files[0])} />
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" onClick={()=>fileRef.current?.click()} disabled={busy}><Upload className="w-4 h-4 mr-2" />{bn?"ভয়েস আপলোড":"Upload voice"}</Button>
            {!recording ? (
              <Button onClick={startRec} className="gradient-bg-warm text-white"><Mic className="w-4 h-4 mr-2" />{bn?"রেকর্ড":"Record"}</Button>
            ) : (
              <Button onClick={stopRec} variant="destructive"><Square className="w-4 h-4 mr-2" />{bn?"থামান":"Stop"}</Button>
            )}
          </div>
          {voiceUrl && (
            <div>
              <Label className="text-xs">{bn?"আপনার ভয়েস":"Your voice"}</Label>
              <audio src={voiceUrl} controls className="w-full mt-1" />
            </div>
          )}

          <input ref={musicRef} type="file" accept="audio/*" hidden onChange={e=>e.target.files?.[0]&&onMusic(e.target.files[0])} />
          <Button variant="outline" onClick={()=>musicRef.current?.click()} disabled={busy} className="w-full"><Music className="w-4 h-4 mr-2" />{bn?"মিউজিক আপলোড (ঐচ্ছিক)":"Upload music (optional)"}</Button>
          {musicBuf && <p className="text-[11px] text-muted-foreground">✓ {bn?"মিউজিক প্রস্তুত":"Music ready"} ({musicBuf.duration.toFixed(1)}s)</p>}
        </CardContent></Card>

        {/* Settings */}
        <Card><CardContent className="p-4 space-y-3">
          <h3 className="font-display font-bold">{bn?"২. সেটিংস":"2. Settings"}</h3>
          <Tabs defaultValue="presets">
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="presets">{bn?"প্রিসেট":"Presets"}</TabsTrigger>
              <TabsTrigger value="custom">{bn?"কাস্টম":"Custom"}</TabsTrigger>
            </TabsList>
            <TabsContent value="presets" className="grid grid-cols-2 gap-2 mt-3">
              {[
                ["podcast","🎙 Podcast"],["phone","📞 Phone"],["cinema","🎬 Cinema"],
                ["anime","🐰 Anime"],["deep","🦁 Deep"],
              ].map(([k,l])=>(
                <Button key={k} variant="outline" onClick={()=>applyPreset(k)}>{l}</Button>
              ))}
            </TabsContent>
            <TabsContent value="custom" className="space-y-3 mt-3">
              <div><Label className="text-xs">{bn?"নয়েজ কাট (Hz)":"Denoise (Hz)"}: {denoise}</Label><Slider value={[denoise]} min={20} max={500} step={10} onValueChange={v=>setDenoise(v[0])} /></div>
              <div><Label className="text-xs">Bass: {bass}dB</Label><Slider value={[bass]} min={-12} max={12} step={1} onValueChange={v=>setBass(v[0])} /></div>
              <div><Label className="text-xs">Treble: {treble}dB</Label><Slider value={[treble]} min={-12} max={12} step={1} onValueChange={v=>setTreble(v[0])} /></div>
              <div><Label className="text-xs">{bn?"ভয়েস ভলিউম":"Voice gain"}: {voiceGain.toFixed(2)}x</Label><Slider value={[voiceGain*100]} min={50} max={300} step={5} onValueChange={v=>setVoiceGain(v[0]/100)} /></div>
              <div><Label className="text-xs">{bn?"মিউজিক ভলিউম":"Music gain"}: {musicGain.toFixed(2)}x</Label><Slider value={[musicGain*100]} min={0} max={100} step={5} onValueChange={v=>setMusicGain(v[0]/100)} /></div>
              <div><Label className="text-xs">{bn?"পিচ":"Pitch"}: {pitchSemis>0?"+":""}{pitchSemis} semis</Label><Slider value={[pitchSemis]} min={-12} max={12} step={1} onValueChange={v=>setPitchSemis(v[0])} /></div>
              <Button size="sm" variant={compress?"default":"outline"} onClick={()=>setCompress(!compress)} className="w-full">Compressor: {compress?"ON":"OFF"}</Button>
            </TabsContent>
          </Tabs>
        </CardContent></Card>
      </div>

      <Card><CardContent className="p-4 space-y-3">
        <h3 className="font-display font-bold">{bn?"৩. প্রসেস ও ডাউনলোড":"3. Process & Download"}</h3>
        <Button onClick={process} disabled={busy || !voiceBuf} className="w-full gradient-bg-primary text-white">
          <Wand2 className="w-4 h-4 mr-2" /> {busy?(bn?"প্রসেস হচ্ছে...":"Processing..."):(bn?"প্রসেস করুন":"Process")}
        </Button>
        {outputUrl && (
          <div className="space-y-2">
            <Label className="text-xs">{bn?"ফলাফল":"Result"}</Label>
            <audio src={outputUrl} controls className="w-full" />
            <Button onClick={download} variant="outline" className="w-full"><Download className="w-4 h-4 mr-2" />{bn?"ডাউনলোড WAV":"Download WAV"}</Button>
          </div>
        )}
      </CardContent></Card>
    </div>
  );
};

export default VoiceEditor;
