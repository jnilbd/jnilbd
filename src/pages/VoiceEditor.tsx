import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Mic, Music, Play, Download, Upload, Wand2, Square, Sparkles, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

// ---------- WAV encoder ----------
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

// ---------- Music theory helpers ----------
const NOTE_TO_SEMI: Record<string, number> = { C:0, "C#":1, Db:1, D:2, "D#":3, Eb:3, E:4, F:5, "F#":6, Gb:6, G:7, "G#":8, Ab:8, A:9, "A#":10, Bb:10, B:11 };
const noteFreq = (semi: number) => 440 * Math.pow(2, (semi - 9) / 12); // semi from C0 mapping; use A4=440

function parseChord(name: string) {
  // e.g. "Am", "C", "F#m", "G7", "Bb"
  const m = name.trim().match(/^([A-G][#b]?)(.*)$/);
  if (!m) return null;
  const root = NOTE_TO_SEMI[m[1]];
  const qual = m[2].toLowerCase();
  const isMinor = qual.startsWith("m") && !qual.startsWith("maj");
  const isDim = qual.includes("dim");
  const has7 = qual.includes("7");
  const intervals = isDim ? [0,3,6] : isMinor ? [0,3,7] : [0,4,7];
  if (has7) intervals.push(isMinor ? 10 : (qual.includes("maj7") ? 11 : 10));
  return { root, intervals };
}

function chordFreqs(name: string, octave = 4) {
  const c = parseChord(name);
  if (!c) return [];
  const base = 12 * octave; // C in given octave (relative; offset to A4)
  return c.intervals.map(i => 440 * Math.pow(2, (base + c.root + i - 57) / 12));
}

// ---------- Procedural music synthesis ----------
type GenOpts = {
  bpm: number;
  bars: number;
  chords: string[];
  scale: "major" | "minor";
  genre: string;
  drums: boolean;
  bass: boolean;
  pad: boolean;
  arp: boolean;
  intensity: number; // 0..1
  duration: number; // seconds
  sampleRate: number;
};

async function generateMusic(opts: GenOpts): Promise<AudioBuffer> {
  const { bpm, chords, drums, bass, pad, arp, intensity, duration, sampleRate } = opts;
  const beat = 60 / bpm;
  const barDur = beat * 4;
  const totalBars = Math.max(opts.bars, Math.ceil(duration / barDur));
  const off = new OfflineAudioContext(2, Math.ceil(duration * sampleRate), sampleRate);

  const master = off.createGain();
  master.gain.value = 0.85;
  const masterComp = off.createDynamicsCompressor();
  masterComp.threshold.value = -16; masterComp.ratio.value = 3; masterComp.attack.value = 0.005; masterComp.release.value = 0.2;
  master.connect(masterComp).connect(off.destination);

  // reverb (simple convolver with synthetic IR)
  const reverbBuf = off.createBuffer(2, sampleRate * 1.8, sampleRate);
  for (let c=0;c<2;c++) {
    const d = reverbBuf.getChannelData(c);
    for (let i=0;i<d.length;i++) d[i] = (Math.random()*2-1) * Math.pow(1 - i/d.length, 2.2);
  }
  const conv = off.createConvolver(); conv.buffer = reverbBuf;
  const wet = off.createGain(); wet.gain.value = 0.18;
  conv.connect(wet).connect(master);

  const playOsc = (type: OscillatorType, freq: number, t0: number, dur: number, gain: number, attack=0.01, release=0.2, dest: AudioNode = master) => {
    const o = off.createOscillator();
    o.type = type;
    o.frequency.value = freq;
    const g = off.createGain();
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(gain, t0 + attack);
    g.gain.setValueAtTime(gain, t0 + Math.max(attack, dur - release));
    g.gain.linearRampToValueAtTime(0, t0 + dur);
    o.connect(g).connect(dest);
    o.start(t0); o.stop(t0 + dur + 0.05);
  };

  const playKick = (t0: number, vol = 0.9) => {
    const o = off.createOscillator(); const g = off.createGain();
    o.frequency.setValueAtTime(140, t0);
    o.frequency.exponentialRampToValueAtTime(40, t0 + 0.15);
    g.gain.setValueAtTime(vol, t0);
    g.gain.exponentialRampToValueAtTime(0.001, t0 + 0.25);
    o.connect(g).connect(master);
    o.start(t0); o.stop(t0 + 0.3);
  };
  const playSnare = (t0: number, vol = 0.5) => {
    const buf = off.createBuffer(1, sampleRate * 0.2, sampleRate);
    const d = buf.getChannelData(0);
    for (let i=0;i<d.length;i++) d[i] = (Math.random()*2-1) * Math.pow(1 - i/d.length, 2);
    const n = off.createBufferSource(); n.buffer = buf;
    const f = off.createBiquadFilter(); f.type = "bandpass"; f.frequency.value = 1800;
    const g = off.createGain(); g.gain.value = vol;
    n.connect(f).connect(g).connect(master);
    n.start(t0);
  };
  const playHat = (t0: number, vol = 0.2) => {
    const buf = off.createBuffer(1, sampleRate * 0.05, sampleRate);
    const d = buf.getChannelData(0);
    for (let i=0;i<d.length;i++) d[i] = (Math.random()*2-1);
    const n = off.createBufferSource(); n.buffer = buf;
    const f = off.createBiquadFilter(); f.type = "highpass"; f.frequency.value = 7000;
    const g = off.createGain(); g.gain.value = vol;
    n.connect(f).connect(g).connect(master);
    n.start(t0);
  };

  for (let bar = 0; bar < totalBars; bar++) {
    const t0 = bar * barDur;
    if (t0 >= duration) break;
    const chordName = chords[bar % chords.length] || "C";
    const freqs = chordFreqs(chordName, 4);
    const root = freqs[0] || 261.63;

    // Pad (sustained chord)
    if (pad) {
      for (const f of freqs) {
        playOsc("sawtooth", f, t0, barDur, 0.06 * intensity, 0.4, 0.6, conv);
        playOsc("sine", f, t0, barDur, 0.05 * intensity, 0.3, 0.5);
      }
    }
    // Bass on beat 1 & 3
    if (bass) {
      playOsc("triangle", root/2, t0, beat*1.8, 0.35 * intensity, 0.01, 0.15);
      playOsc("triangle", root/2, t0 + beat*2, beat*1.8, 0.3 * intensity, 0.01, 0.15);
    }
    // Arp 8th notes
    if (arp && freqs.length) {
      for (let s=0; s<8; s++) {
        const f = freqs[s % freqs.length] * 2;
        playOsc("sine", f, t0 + s*beat/2, beat/2 * 0.8, 0.05 * intensity, 0.005, 0.1, conv);
      }
    }
    // Drums
    if (drums) {
      for (let b=0; b<4; b++) {
        const tb = t0 + b*beat;
        if (b === 0 || b === 2) playKick(tb, 0.9 * intensity);
        if (b === 1 || b === 3) playSnare(tb, 0.5 * intensity);
        for (let h=0; h<2; h++) playHat(tb + h*beat/2, 0.18 * intensity);
      }
    }
  }

  // fade out last 1s
  master.gain.setValueAtTime(0.85, duration - 1);
  master.gain.linearRampToValueAtTime(0, duration);

  return await off.startRendering();
}

// ---------- Component ----------
const GENRE_PRESETS: Record<string, Partial<GenOpts> & { chords?: string[]; bpm?: number }> = {
  lofi:     { bpm: 75,  chords: ["Am7","Dm7","Gmaj7","Cmaj7"], drums: true, bass: true, pad: true, arp: false },
  pop:      { bpm: 100, chords: ["C","G","Am","F"],            drums: true, bass: true, pad: true, arp: true  },
  cinematic:{ bpm: 80,  chords: ["Am","F","C","G"],            drums: false, bass: true, pad: true, arp: true  },
  folk:     { bpm: 90,  chords: ["G","D","Em","C"],            drums: true, bass: true, pad: true, arp: true  },
  edm:      { bpm: 124, chords: ["Fm","Ab","Eb","Bb"],          drums: true, bass: true, pad: true, arp: true  },
  rock:     { bpm: 110, chords: ["E","A","D","A"],              drums: true, bass: true, pad: true, arp: false },
  devotional:{ bpm: 70, chords: ["Dm","Gm","C","F"],            drums: false, bass: true, pad: true, arp: true  },
  ambient:  { bpm: 60,  chords: ["Cmaj7","Em7","Fmaj7","G"],   drums: false, bass: false, pad: true, arp: true  },
  hiphop:   { bpm: 88,  chords: ["Cm","Ab","Fm","G"],           drums: true, bass: true, pad: true, arp: false },
};

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
  const [voiceFormat, setVoiceFormat] = useState<string>("webm");
  const [musicBuf, setMusicBuf] = useState<AudioBuffer | null>(null);
  const [musicUrl, setMusicUrl] = useState<string>("");
  const [outputUrl, setOutputUrl] = useState<string>("");
  const [recording, setRecording] = useState(false);
  const [busy, setBusy] = useState(false);
  const [aiBusy, setAiBusy] = useState(false);
  const [genBusy, setGenBusy] = useState(false);

  // Voice settings
  const [bass, setBass] = useState(3);
  const [treble, setTreble] = useState(4);
  const [denoise, setDenoise] = useState(60);
  const [compress, setCompress] = useState(true);
  const [voiceGain, setVoiceGain] = useState(1.4);
  const [musicGain, setMusicGain] = useState(0.35);
  const [pitchSemis, setPitchSemis] = useState(0);
  const [reverbAmt, setReverbAmt] = useState(0.15);
  const [autotune, setAutotune] = useState(false);

  // AI / Music params
  const [analysis, setAnalysis] = useState<any>(null);
  const [genre, setGenre] = useState<string>("pop");
  const [bpm, setBpm] = useState<number>(100);
  const [chords, setChords] = useState<string>("C,G,Am,F");
  const [musicDur, setMusicDur] = useState<number>(30);
  const [drums, setDrums] = useState(true);
  const [bassLayer, setBassLayer] = useState(true);
  const [padLayer, setPadLayer] = useState(true);
  const [arpLayer, setArpLayer] = useState(true);
  const [intensity, setIntensity] = useState(0.8);

  const ctx = () => (audioCtxRef.current ||= new AudioContext());
  const decode = async (file: File) => {
    const ab = await file.arrayBuffer();
    return await ctx().decodeAudioData(ab.slice(0));
  };

  const onVoice = async (f: File) => {
    if (f.size > 30*1024*1024) { toast.error("Max 30MB"); return; }
    setBusy(true);
    try {
      const buf = await decode(f);
      setVoiceBuf(buf);
      setVoiceUrl(URL.createObjectURL(f));
      setOutputUrl("");
      setVoiceFormat(f.type.includes("mp4") ? "m4a" : f.type.includes("wav") ? "wav" : f.type.includes("mpeg") ? "mp3" : "webm");
      setMusicDur(Math.max(15, Math.ceil(buf.duration)));
      toast.success(bn?"ভয়েস লোড হয়েছে":"Voice loaded");
    } catch { toast.error("Decode failed"); }
    setBusy(false);
  };

  const onMusic = async (f: File) => {
    if (f.size > 30*1024*1024) { toast.error("Max 30MB"); return; }
    setBusy(true);
    try {
      const buf = await decode(f);
      setMusicBuf(buf);
      setMusicUrl(URL.createObjectURL(f));
      toast.success(bn?"মিউজিক লোড হয়েছে":"Music loaded");
    } catch { toast.error("Decode failed"); }
    setBusy(false);
  };

  const startRec = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
      chunks.current = [];
      const mr = new MediaRecorder(stream);
      mr.ondataavailable = (e) => chunks.current.push(e.data);
      mr.onstop = async () => {
        const blob = new Blob(chunks.current, { type: "audio/webm" });
        stream.getTracks().forEach(t=>t.stop());
        const f = new File([blob], "recording.webm", { type: "audio/webm" });
        await onVoice(f);
      };
      mr.start();
      recRef.current = mr;
      setRecording(true);
    } catch { toast.error(bn?"মাইক্রোফোন অনুমতি প্রয়োজন":"Microphone permission needed"); }
  };
  const stopRec = () => { recRef.current?.stop(); setRecording(false); };

  // ---------- AI analyze ----------
  const blobToBase64 = (blob: Blob): Promise<string> => new Promise((res, rej) => {
    const r = new FileReader();
    r.onloadend = () => res((r.result as string).split(",")[1]);
    r.onerror = rej;
    r.readAsDataURL(blob);
  });

  const analyzeAI = async () => {
    if (!voiceUrl) { toast.error(bn?"আগে ভয়েস দিন":"Add voice first"); return; }
    setAiBusy(true);
    try {
      const r = await fetch(voiceUrl);
      const blob = await r.blob();
      // limit size to ~5MB for analysis
      const b64 = await blobToBase64(blob);
      const { data, error } = await supabase.functions.invoke("voice-analyze", {
        body: { audioBase64: b64, format: voiceFormat, language: bn ? "bn" : "en" },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setAnalysis(data);
      if (data?.bpm) setBpm(Math.round(data.bpm));
      if (data?.genre && GENRE_PRESETS[data.genre]) setGenre(data.genre);
      if (Array.isArray(data?.chords) && data.chords.length) setChords(data.chords.join(","));
      toast.success(bn?"AI বিশ্লেষণ সম্পন্ন":"AI analysis done");
    } catch (e:any) {
      toast.error(e.message || "AI failed");
    } finally { setAiBusy(false); }
  };

  // ---------- Generate music ----------
  const generateAIMusic = async () => {
    setGenBusy(true);
    try {
      const sr = 44100;
      const chordList = chords.split(",").map(s=>s.trim()).filter(Boolean);
      const buf = await generateMusic({
        bpm, bars: Math.ceil((musicDur * bpm) / (4*60)),
        chords: chordList.length ? chordList : ["C","G","Am","F"],
        scale: (analysis?.scale === "minor" ? "minor" : "major"),
        genre, drums, bass: bassLayer, pad: padLayer, arp: arpLayer,
        intensity, duration: musicDur, sampleRate: sr,
      });
      setMusicBuf(buf);
      const wav = bufferToWav(buf);
      if (musicUrl) URL.revokeObjectURL(musicUrl);
      setMusicUrl(URL.createObjectURL(wav));
      toast.success(bn?"মিউজিক জেনারেট হয়েছে":"Music generated");
    } catch (e:any) {
      toast.error(e.message || "Generate failed");
    } finally { setGenBusy(false); }
  };

  const applyGenrePreset = (g: string) => {
    setGenre(g);
    const p = GENRE_PRESETS[g];
    if (!p) return;
    if (p.bpm) setBpm(p.bpm);
    if (p.chords) setChords(p.chords.join(","));
    if (typeof p.drums === "boolean") setDrums(p.drums);
    if (typeof p.bass === "boolean") setBassLayer(p.bass);
    if (typeof p.pad === "boolean") setPadLayer(p.pad);
    if (typeof p.arp === "boolean") setArpLayer(p.arp);
  };

  // ---------- Final mix ----------
  const process = async () => {
    if (!voiceBuf) { toast.error(bn?"আগে ভয়েস লোড করুন":"Load voice first"); return; }
    setBusy(true);
    try {
      const sr = voiceBuf.sampleRate;
      const pitchRate = Math.pow(2, pitchSemis/12);
      const voiceDur = voiceBuf.duration / pitchRate;
      const musicDurEff = musicBuf ? musicBuf.duration : 0;
      const totalDur = Math.max(voiceDur, musicDurEff) + 0.5;
      const length = Math.ceil(totalDur * sr);
      const off = new OfflineAudioContext(2, length, sr);

      // ---- Voice chain ----
      const vSrc = off.createBufferSource();
      vSrc.buffer = voiceBuf;
      vSrc.playbackRate.value = pitchRate;

      const hp = off.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = denoise;
      const lp = off.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 14000;
      const deess = off.createBiquadFilter(); deess.type = "peaking"; deess.frequency.value = 6500; deess.Q.value = 3; deess.gain.value = -4;
      const bassF = off.createBiquadFilter(); bassF.type = "lowshelf"; bassF.frequency.value = 200; bassF.gain.value = bass;
      const trebF = off.createBiquadFilter(); trebF.type = "highshelf"; trebF.frequency.value = 4000; trebF.gain.value = treble;
      const presence = off.createBiquadFilter(); presence.type = "peaking"; presence.frequency.value = 2500; presence.Q.value = 1.2; presence.gain.value = autotune ? 4 : 2;
      const comp = off.createDynamicsCompressor();
      if (compress) { comp.threshold.value = -22; comp.knee.value = 30; comp.ratio.value = 4; comp.attack.value = 0.005; comp.release.value = 0.25; }
      const vGain = off.createGain(); vGain.gain.value = voiceGain;

      // Reverb send
      const revBuf = off.createBuffer(2, sr * 1.5, sr);
      for (let c=0;c<2;c++) {
        const d = revBuf.getChannelData(c);
        for (let i=0;i<d.length;i++) d[i] = (Math.random()*2-1) * Math.pow(1 - i/d.length, 2.5);
      }
      const conv = off.createConvolver(); conv.buffer = revBuf;
      const wet = off.createGain(); wet.gain.value = reverbAmt;

      vSrc.connect(hp).connect(lp).connect(deess).connect(bassF).connect(trebF).connect(presence).connect(comp).connect(vGain);
      vGain.connect(off.destination);
      vGain.connect(conv).connect(wet).connect(off.destination);
      vSrc.start(0);

      // ---- Music ----
      if (musicBuf) {
        const mSrc = off.createBufferSource();
        mSrc.buffer = musicBuf;
        const mGain = off.createGain(); mGain.gain.value = musicGain;
        // sidechain-style ducking under voice
        mGain.gain.setValueAtTime(musicGain*0.5, 0);
        mGain.gain.linearRampToValueAtTime(musicGain, 1.0);
        mGain.gain.setValueAtTime(musicGain*0.45, Math.max(0, voiceDur-0.3));
        mGain.gain.linearRampToValueAtTime(0, totalDur);
        mSrc.connect(mGain).connect(off.destination);
        mSrc.start(0);
      }

      const rendered = await off.startRendering();
      const blob = bufferToWav(rendered);
      if (outputUrl) URL.revokeObjectURL(outputUrl);
      setOutputUrl(URL.createObjectURL(blob));
      toast.success(bn?"ফাইনাল মিক্স তৈরি!":"Final mix ready!");
    } catch (e:any) {
      toast.error(e.message || "Process failed");
    } finally { setBusy(false); }
  };

  const download = (url: string, name: string) => {
    if (!url) return;
    const a = document.createElement("a");
    a.href = url; a.download = name; a.click();
  };

  const applyPreset = (p:string) => {
    if (p==="podcast") { setBass(3); setTreble(4); setDenoise(80); setCompress(true); setVoiceGain(1.5); setPitchSemis(0); setReverbAmt(0.08); }
    if (p==="singer")  { setBass(2); setTreble(5); setDenoise(70); setCompress(true); setVoiceGain(1.5); setPitchSemis(0); setReverbAmt(0.25); setAutotune(true); }
    if (p==="phone")   { setBass(-6); setTreble(-3); setDenoise(300); setCompress(true); setVoiceGain(1.3); setPitchSemis(0); setReverbAmt(0); }
    if (p==="cinema")  { setBass(5); setTreble(2); setDenoise(60); setCompress(true); setVoiceGain(1.6); setPitchSemis(-1); setReverbAmt(0.3); }
    if (p==="anime")   { setBass(-4); setTreble(8); setDenoise(80); setCompress(true); setVoiceGain(1.4); setPitchSemis(5); setReverbAmt(0.15); }
    if (p==="deep")    { setBass(8); setTreble(-2); setDenoise(60); setCompress(true); setVoiceGain(1.4); setPitchSemis(-4); setReverbAmt(0.2); }
    toast.success(`Preset: ${p}`);
  };

  return (
    <div className="container py-6 lg:py-10 space-y-6 max-w-6xl">
      <motion.div initial={{opacity:0,y:-10}} animate={{opacity:1,y:0}} className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl gradient-bg-cool text-white flex items-center justify-center shadow-glow">
          <Mic className="w-6 h-6" />
        </div>
        <div>
          <h1 className="font-display text-2xl lg:text-3xl font-bold">{bn?"AI ভয়েস + মিউজিক স্টুডিও":"AI Voice + Music Studio"}</h1>
          <p className="text-xs text-muted-foreground">{bn?"ভয়েস ইম্প্রুভ • AI বিশ্লেষণ • অটো মিউজিক জেনারেট • মিক্স":"Voice enhance • AI analysis • Auto music gen • Mix"}</p>
        </div>
      </motion.div>

      <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
        <CardContent className="p-4 text-xs space-y-1">
          <p className="font-display font-bold text-sm flex items-center gap-1.5"><Wand2 className="w-4 h-4 text-secondary" />{bn?"কীভাবে কাজ করে (Suno/ElevenLabs টাইপ)":"How it works (Suno/ElevenLabs style)"}</p>
          <ol className="list-decimal list-inside text-muted-foreground space-y-0.5">
            {bn ? (<>
              <li>খালি গলায় গান/হামিং রেকর্ড করুন বা আপলোড করুন</li>
              <li>"AI বিশ্লেষণ" → মুড, কী, BPM, কর্ড, জনরা, লিরিক্স সাজেস্ট</li>
              <li>"অটো মিউজিক জেনারেট" → আপনার ভয়েস অনুযায়ী মিউজিক তৈরি</li>
              <li>প্রিসেট/স্লাইডার দিয়ে ভয়েস ইম্প্রুভ করুন (Autotune, Reverb)</li>
              <li>"ফাইনাল মিক্স" → ডাউনলোড 🎧</li>
            </>) : (<>
              <li>Record or upload your raw vocal/hum</li>
              <li>"AI Analyze" detects mood, key, BPM, chords, genre, lyrics</li>
              <li>"Auto Generate Music" creates a backing track matched to your voice</li>
              <li>Tune voice (Autotune-like, Reverb, EQ)</li>
              <li>"Final Mix" → download 🎧</li>
            </>)}
          </ol>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* INPUT */}
        <Card><CardContent className="p-4 space-y-4">
          <h3 className="font-display font-bold flex items-center gap-2"><Mic className="w-4 h-4" />{bn?"১. ভয়েস ইনপুট":"1. Voice Input"}</h3>
          <input ref={fileRef} type="file" accept="audio/*" hidden onChange={e=>e.target.files?.[0]&&onVoice(e.target.files[0])} />
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" onClick={()=>fileRef.current?.click()} disabled={busy}><Upload className="w-4 h-4 mr-2" />{bn?"আপলোড":"Upload"}</Button>
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

          <Button onClick={analyzeAI} disabled={aiBusy || !voiceBuf} className="w-full gradient-bg-primary text-white">
            {aiBusy ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
            {bn?"AI বিশ্লেষণ (গান ডিজাইন)":"AI Analyze (design song)"}
          </Button>

          {analysis && (
            <div className="text-xs space-y-1 p-3 rounded-lg border bg-muted/30">
              {analysis.title_suggestion && <p className="font-bold">🎵 {analysis.title_suggestion}</p>}
              <div className="flex flex-wrap gap-1">
                {analysis.mood && <Badge variant="secondary">Mood: {analysis.mood}</Badge>}
                {analysis.genre && <Badge variant="secondary">{analysis.genre}</Badge>}
                {analysis.bpm && <Badge variant="secondary">{analysis.bpm} BPM</Badge>}
                {analysis.key && <Badge variant="secondary">Key: {analysis.key}</Badge>}
              </div>
              {analysis.transcript && <p className="text-muted-foreground"><b>Transcript:</b> {analysis.transcript}</p>}
              {analysis.lyrics_suggestion && <pre className="whitespace-pre-wrap text-muted-foreground border-t pt-1 mt-1">{analysis.lyrics_suggestion}</pre>}
              {analysis.production_notes && <p className="italic text-[10px] text-muted-foreground">💡 {analysis.production_notes}</p>}
            </div>
          )}
        </CardContent></Card>

        {/* MUSIC GENERATOR */}
        <Card><CardContent className="p-4 space-y-3">
          <h3 className="font-display font-bold flex items-center gap-2"><Music className="w-4 h-4" />{bn?"২. AI মিউজিক জেনারেটর":"2. AI Music Generator"}</h3>

          <div className="space-y-2">
            <Label className="text-xs">{bn?"জনরা":"Genre"}</Label>
            <Select value={genre} onValueChange={applyGenrePreset}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.keys(GENRE_PRESETS).map(g=> <SelectItem key={g} value={g}>{g}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">BPM: {bpm}</Label>
              <Slider value={[bpm]} min={60} max={180} step={1} onValueChange={v=>setBpm(v[0])} />
            </div>
            <div>
              <Label className="text-xs">{bn?"সময় (সেকেন্ড)":"Duration (s)"}: {musicDur}</Label>
              <Slider value={[musicDur]} min={10} max={120} step={5} onValueChange={v=>setMusicDur(v[0])} />
            </div>
          </div>

          <div>
            <Label className="text-xs">{bn?"কর্ড প্রগ্রেশন (কমা দিয়ে)":"Chord progression (comma)"}</Label>
            <Input value={chords} onChange={e=>setChords(e.target.value)} placeholder="C,G,Am,F" className="text-xs" />
          </div>

          <div>
            <Label className="text-xs">{bn?"ইন্টেনসিটি":"Intensity"}: {intensity.toFixed(2)}</Label>
            <Slider value={[intensity*100]} min={20} max={100} step={5} onValueChange={v=>setIntensity(v[0]/100)} />
          </div>

          <div className="grid grid-cols-4 gap-1 text-[11px]">
            <Button size="sm" variant={drums?"default":"outline"} onClick={()=>setDrums(!drums)}>🥁 Drums</Button>
            <Button size="sm" variant={bassLayer?"default":"outline"} onClick={()=>setBassLayer(!bassLayer)}>🎸 Bass</Button>
            <Button size="sm" variant={padLayer?"default":"outline"} onClick={()=>setPadLayer(!padLayer)}>🎹 Pad</Button>
            <Button size="sm" variant={arpLayer?"default":"outline"} onClick={()=>setArpLayer(!arpLayer)}>✨ Arp</Button>
          </div>

          <Button onClick={generateAIMusic} disabled={genBusy} className="w-full gradient-bg-cool text-white">
            {genBusy ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
            {bn?"অটো মিউজিক জেনারেট":"Auto Generate Music"}
          </Button>

          <input ref={musicRef} type="file" accept="audio/*" hidden onChange={e=>e.target.files?.[0]&&onMusic(e.target.files[0])} />
          <Button variant="outline" onClick={()=>musicRef.current?.click()} disabled={busy} className="w-full" size="sm">
            <Upload className="w-3 h-3 mr-2" />{bn?"অথবা নিজের মিউজিক আপলোড":"Or upload your own music"}
          </Button>

          {musicUrl && (
            <div>
              <Label className="text-xs">{bn?"জেনারেটেড মিউজিক":"Generated music"}</Label>
              <audio src={musicUrl} controls className="w-full mt-1" />
              <Button size="sm" variant="ghost" onClick={()=>download(musicUrl, `music-${Date.now()}.wav`)} className="w-full mt-1"><Download className="w-3 h-3 mr-1" />Music WAV</Button>
            </div>
          )}
        </CardContent></Card>
      </div>

      {/* VOICE TUNE */}
      <Card><CardContent className="p-4 space-y-3">
        <h3 className="font-display font-bold flex items-center gap-2"><Wand2 className="w-4 h-4" />{bn?"৩. ভয়েস টিউনিং":"3. Voice Tuning"}</h3>
        <Tabs defaultValue="presets">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="presets">{bn?"প্রিসেট":"Presets"}</TabsTrigger>
            <TabsTrigger value="custom">{bn?"কাস্টম":"Custom"}</TabsTrigger>
          </TabsList>
          <TabsContent value="presets" className="grid grid-cols-3 md:grid-cols-6 gap-2 mt-3">
            {[["singer","🎤 Singer"],["podcast","🎙 Podcast"],["phone","📞 Phone"],["cinema","🎬 Cinema"],["anime","🐰 Anime"],["deep","🦁 Deep"]].map(([k,l])=>(
              <Button key={k} variant="outline" size="sm" onClick={()=>applyPreset(k)}>{l}</Button>
            ))}
          </TabsContent>
          <TabsContent value="custom" className="grid md:grid-cols-2 gap-3 mt-3">
            <div><Label className="text-xs">{bn?"নয়েজ কাট (Hz)":"Denoise (Hz)"}: {denoise}</Label><Slider value={[denoise]} min={20} max={500} step={10} onValueChange={v=>setDenoise(v[0])} /></div>
            <div><Label className="text-xs">Bass: {bass}dB</Label><Slider value={[bass]} min={-12} max={12} step={1} onValueChange={v=>setBass(v[0])} /></div>
            <div><Label className="text-xs">Treble: {treble}dB</Label><Slider value={[treble]} min={-12} max={12} step={1} onValueChange={v=>setTreble(v[0])} /></div>
            <div><Label className="text-xs">{bn?"ভয়েস ভলিউম":"Voice gain"}: {voiceGain.toFixed(2)}x</Label><Slider value={[voiceGain*100]} min={50} max={300} step={5} onValueChange={v=>setVoiceGain(v[0]/100)} /></div>
            <div><Label className="text-xs">{bn?"মিউজিক ভলিউম":"Music gain"}: {musicGain.toFixed(2)}x</Label><Slider value={[musicGain*100]} min={0} max={100} step={5} onValueChange={v=>setMusicGain(v[0]/100)} /></div>
            <div><Label className="text-xs">{bn?"পিচ":"Pitch"}: {pitchSemis>0?"+":""}{pitchSemis} semis</Label><Slider value={[pitchSemis]} min={-12} max={12} step={1} onValueChange={v=>setPitchSemis(v[0])} /></div>
            <div><Label className="text-xs">Reverb: {(reverbAmt*100).toFixed(0)}%</Label><Slider value={[reverbAmt*100]} min={0} max={60} step={2} onValueChange={v=>setReverbAmt(v[0]/100)} /></div>
            <div className="flex gap-2">
              <Button size="sm" variant={compress?"default":"outline"} onClick={()=>setCompress(!compress)} className="flex-1">Comp: {compress?"ON":"OFF"}</Button>
              <Button size="sm" variant={autotune?"default":"outline"} onClick={()=>setAutotune(!autotune)} className="flex-1">Vocal Boost</Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent></Card>

      {/* MIX */}
      <Card><CardContent className="p-4 space-y-3">
        <h3 className="font-display font-bold flex items-center gap-2"><Play className="w-4 h-4" />{bn?"৪. ফাইনাল মিক্স ও ডাউনলোড":"4. Final Mix & Download"}</h3>
        <Button onClick={process} disabled={busy || !voiceBuf} className="w-full gradient-bg-primary text-white">
          {busy ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Wand2 className="w-4 h-4 mr-2" />}
          {busy?(bn?"মিক্স হচ্ছে...":"Mixing..."):(bn?"ফাইনাল মিক্স তৈরি করুন":"Render Final Mix")}
        </Button>
        {outputUrl && (
          <div className="space-y-2">
            <Label className="text-xs">{bn?"ফাইনাল ফলাফল":"Final result"}</Label>
            <audio src={outputUrl} controls className="w-full" />
            <Button onClick={()=>download(outputUrl, `song-${Date.now()}.wav`)} variant="outline" className="w-full"><Download className="w-4 h-4 mr-2" />{bn?"ডাউনলোড WAV":"Download WAV"}</Button>
          </div>
        )}
      </CardContent></Card>
    </div>
  );
};

export default VoiceEditor;
