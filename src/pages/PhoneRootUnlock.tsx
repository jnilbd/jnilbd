import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, ExternalLink, Youtube, Smartphone, Shield, Wrench, Unlock, Search as SearchIcon, Globe } from "lucide-react";
import { toast } from "sonner";

type Mode = "twrp" | "roms" | "recovery" | "unlock";

const MODE_META: Record<Mode, { bn: string; icon: any; desc: string }> = {
  twrp: { bn: "TWRP / রিকভারি", icon: Wrench, desc: "অফিসিয়াল ও আনঅফিসিয়াল কাস্টম রিকভারি (TWRP, OrangeFox, PBRP)" },
  roms: { bn: "কাস্টম রম", icon: Smartphone, desc: "LineageOS, crDroid, PixelOS, Evolution X এবং পোর্ট" },
  recovery: { bn: "ডেড/ব্রিক রিকভার", icon: Shield, desc: "ফোন ডেড হলে স্টক ফার্মওয়্যার ও ফ্ল্যাশ টুল" },
  unlock: { bn: "লক খোলা", icon: Unlock, desc: "FRP, Google, KG, Knox, কিস্তি, অ্যাডমিন লক" },
};

// Direct source URL builders — no AI needed, opens the actual authoritative site
const q = (s: string) => encodeURIComponent(s.trim());

type Src = { name: string; url: string; note?: string };

const SOURCES: Record<Mode, (model: string) => Src[]> = {
  twrp: (m) => [
    { name: "TWRP অফিসিয়াল ডিভাইস লিস্ট", url: `https://twrp.me/Devices/`, note: "twrp.me — ব্র্যান্ড থেকে মডেল বেছে নিন" },
    { name: `TWRP সার্চ — ${m}`, url: `https://www.google.com/search?q=${q(`site:twrp.me ${m}`)}`, note: "twrp.me-এর ভেতরে সরাসরি খুঁজবে" },
    { name: "OrangeFox Recovery", url: `https://orangefox.download/`, note: "আরও ফিচারওয়ালা কমিউনিটি রিকভারি" },
    { name: `OrangeFox সার্চ — ${m}`, url: `https://www.google.com/search?q=${q(`site:orangefox.download ${m}`)}` },
    { name: "PBRP (PitchBlack)", url: `https://pitchblackrecovery.com/devices`, note: "ডার্ক-থিম কাস্টম রিকভারি" },
    { name: `XDA Forums — ${m} recovery`, url: `https://xdaforums.com/search/?q=${q(`${m} TWRP recovery`)}&o=date`, note: "XDA পোর্ট / আনঅফিসিয়াল বিল্ড" },
    { name: `Google — ${m} TWRP download`, url: `https://www.google.com/search?q=${q(`${m} TWRP recovery download latest`)}` },
  ],
  roms: (m) => [
    { name: "LineageOS Devices", url: `https://wiki.lineageos.org/devices/`, note: "অফিসিয়াল সাপোর্টেড ডিভাইস" },
    { name: `LineageOS সার্চ — ${m}`, url: `https://www.google.com/search?q=${q(`site:wiki.lineageos.org ${m}`)}` },
    { name: "crDroid Downloads", url: `https://crdroid.net/downloads`, note: "জনপ্রিয় স্টক-লাইক ROM" },
    { name: "PixelOS", url: `https://pixelos.net/download`, note: "Pixel-experience ধরনের ROM" },
    { name: "Evolution X", url: `https://evolution-x.org/downloads`, note: "Google Pixel ফিচার" },
    { name: "ArrowOS", url: `https://arrowos.net/download`, note: "হালকা ও ব্যাটারি-ফ্রেন্ডলি" },
    { name: "RisingOS", url: `https://risingos.org/downloads`, note: "নতুন জনপ্রিয় ROM" },
    { name: `XDA Forums — ${m} custom ROM`, url: `https://xdaforums.com/search/?q=${q(`${m} custom ROM`)}&o=date`, note: "আনঅফিসিয়াল পোর্ট" },
    { name: `Google — ${m} best custom ROM`, url: `https://www.google.com/search?q=${q(`${m} best custom ROM 2025`)}` },
  ],
  recovery: (m) => [
    { name: `SamMobile (Samsung ফার্মওয়্যার) — ${m}`, url: `https://www.sammobile.com/samsung/firmware/?s=${q(m)}`, note: "Samsung অফিসিয়াল স্টক ROM" },
    { name: `Samfw.com — ${m}`, url: `https://samfw.com/?s=${q(m)}`, note: "ফাস্ট Samsung firmware ডাউনলোড" },
    { name: "Xiaomi Firmware Updater", url: `https://xiaomifirmwareupdater.com/`, note: "Redmi/Xiaomi/POCO স্টক" },
    { name: `MIUI ROM — ${m}`, url: `https://c.mi.com/oc/miuidownload/index?d=${q(m)}`, note: "অফিসিয়াল Xiaomi ডাউনলোড" },
    { name: "Realme Firmware", url: `https://mirrors.lolinet.com/firmware/realme/`, note: "Realme স্টক" },
    { name: "Oppo/OnePlus Firmware", url: `https://oppostockrom.com/`, note: "Oppo/OnePlus স্টক" },
    { name: "Vivo Firmware", url: `https://mirrors.lolinet.com/firmware/vivo/`, note: "Vivo/iQOO স্টক" },
    { name: "Odin (Samsung ফ্ল্যাশ টুল)", url: `https://odindownload.com/`, note: "Samsung ফ্ল্যাশিং" },
    { name: "Mi Flash Tool", url: `https://xiaomiflashtool.com/`, note: "Xiaomi ফ্ল্যাশিং" },
    { name: "SP Flash Tool (MediaTek)", url: `https://spflashtool.com/`, note: "MTK চিপসেট ফ্ল্যাশ" },
    { name: "QFIL / QPST (Qualcomm)", url: `https://qpstool.com/`, note: "Qualcomm চিপ ফ্ল্যাশ" },
    { name: `Google — ${m} stock ROM firmware`, url: `https://www.google.com/search?q=${q(`${m} stock ROM firmware download`)}` },
    { name: `XDA — ${m} unbrick`, url: `https://xdaforums.com/search/?q=${q(`${m} unbrick dead boot`)}&o=date` },
  ],
  unlock: (m) => [
    { name: "Google FRP Bypass Tools (হাব)", url: `https://frp.tools/`, note: "সাম্প্রতিক FRP মেথড ইনডেক্স" },
    { name: `${m} FRP bypass 2025`, url: `https://www.google.com/search?q=${q(`${m} FRP bypass 2025 latest method`)}` },
    { name: `${m} FRP — YouTube ভিডিও গাইড`, url: `https://www.youtube.com/results?search_query=${q(`${m} FRP bypass bangla`)}` },
    { name: "Samsung KG / MDM Lock (Z3X, Chimera)", url: `https://www.google.com/search?q=${q(`${m} KG lock remove tool`)}`, note: "Knox / KG লক টুলস সার্চ" },
    { name: `${m} MDM / Admin lock remove`, url: `https://www.google.com/search?q=${q(`${m} MDM admin lock bypass`)}` },
    { name: `${m} কিস্তি (installment) লক unlock`, url: `https://www.google.com/search?q=${q(`${m} installment lock unlock bangla`)}`, note: "⚠️ কেবল নিজের ফোনে" },
    { name: `${m} pattern / password ভুলে গেলে`, url: `https://www.google.com/search?q=${q(`${m} forgot password pattern unlock without data loss`)}` },
    { name: "XDA — লক থ্রেড", url: `https://xdaforums.com/search/?q=${q(`${m} unlock`)}&o=date` },
    { name: `${m} — YouTube সব unlock ভিডিও`, url: `https://www.youtube.com/results?search_query=${q(`${m} unlock all lock bangla`)}` },
    { name: "GSM Forum", url: `https://forum.gsmhosting.com/vbb/search.php?do=process&query=${q(m)}`, note: "প্রফেশনাল রিপেয়ার ফোরাম" },
  ],
};

const STEPS_BN: Record<Mode, string[]> = {
  twrp: [
    "Developer Options অন করুন → USB Debugging + OEM Unlock চালু করুন।",
    "প্রয়োজনে bootloader unlock করুন (Xiaomi Mi Unlock / fastboot flashing unlock)।",
    "উপরের লিংক থেকে আপনার মডেলের সঠিক TWRP/OrangeFox .img ডাউনলোড করুন।",
    "ফোনকে Fastboot mode-এ নিন (Power + Vol Down)।",
    "PC-তে: fastboot flash recovery twrp.img — তারপর fastboot boot twrp.img দিয়ে বুট করুন।",
    "TWRP থেকে Wipe → Format Data (ফোন encrypt থাকলে)।",
  ],
  roms: [
    "আগে TWRP/OrangeFox ফ্ল্যাশ করে নিন।",
    "সঠিক codename-এর ROM ZIP + Google Apps (GApps/MindTheGapps) ডাউনলোড করুন।",
    "ROM ZIP ফোনে কপি করুন → TWRP-তে বুট করুন।",
    "Wipe → Dalvik, Cache, System, Data (internal storage বাদে)।",
    "Install → ROM ZIP → তারপর GApps ZIP flash করুন।",
    "Reboot → প্রথম বুট ৫–১০ মিনিট নিতে পারে।",
  ],
  recovery: [
    "ফোনের সঠিক মডেল/CSC কোড জানুন (Samsung হলে *#1234#)।",
    "উপরের লিংক থেকে ঠিক মডেলের অফিসিয়াল স্টক ফার্মওয়্যার নামান।",
    "Samsung → Odin, Xiaomi → Mi Flash, MediaTek → SP Flash Tool দিয়ে ফ্ল্যাশ করুন।",
    "ফোনকে সঠিক মোডে দিন — Samsung: Download Mode (Vol Down + Bixby + Power), Xiaomi: EDL/Fastboot।",
    "সব partition ফ্ল্যাশ করুন (BL, AP, CP, CSC — Samsung হলে)।",
    "শেষে battery pull → Recovery → Factory Reset।",
  ],
  unlock: [
    "প্রথমে নিশ্চিত হোন ফোনটি আপনার নিজের — চুরি/কিস্তির অসম্পূর্ণ ফোন unlock করা অপরাধ।",
    "লকের ধরন বুঝুন: FRP (Google account), Pattern, KG/Knox, MDM/Admin, কিস্তি lock।",
    "উপরের লিংকে গিয়ে আপনার সঠিক মডেল ও Android version-এর সাম্প্রতিক মেথড দেখুন।",
    "YouTube-এ বাংলা টিউটোরিয়াল দেখে ধাপে ধাপে করুন।",
    "যদি নিজে না পারেন — ভালো সার্ভিসিং সেন্টারে দেখান, ডেটা যেন হারায় না বলুন।",
  ],
};

export default function PhoneRootUnlock() {
  const [model, setModel] = useState("");
  const [mode, setMode] = useState<Mode>("twrp");

  const sources = useMemo(() => {
    if (!model.trim()) return [];
    return SOURCES[mode](model.trim());
  }, [mode, model]);

  const openAll = () => {
    if (!model.trim()) { toast.error("আগে ফোনের মডেল লিখুন"); return; }
    sources.slice(0, 5).forEach((s) => window.open(s.url, "_blank", "noopener"));
    toast.success("প্রথম ৫টি সোর্স নতুন ট্যাবে খোলা হয়েছে");
  };

  return (
    <div className="container py-6 space-y-6 max-w-6xl">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Smartphone className="h-7 w-7" /> ফোন রুট ও লক খোলা
        </h1>
        <p className="text-muted-foreground text-sm">
          ফোনের মডেল দিন — সরাসরি অফিসিয়াল সোর্স (TWRP.me, LineageOS Wiki, SamMobile, XDA, YouTube) থেকে অটো-সার্চ লিংক তৈরি হবে। কোন AI লাগে না, একদম ফ্রি।
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
            <Button onClick={openAll} disabled={!model.trim()}>
              <SearchIcon className="h-4 w-4 mr-1" /> সব সোর্সে সার্চ
            </Button>
          </div>
          <p className="text-[11px] text-muted-foreground">
            💡 ব্র্যান্ড + মডেল + নাম্বার লিখলে সবচেয়ে সঠিক ফলাফল পাবেন (যেমন: <em>Redmi Note 11 Pro</em>, <em>Galaxy A52 5G</em>)।
          </p>
        </CardContent>
      </Card>

      <Tabs value={mode} onValueChange={(v) => setMode(v as Mode)}>
        <TabsList className="grid grid-cols-2 md:grid-cols-4 h-auto">
          {(Object.keys(MODE_META) as Mode[]).map((k) => {
            const I = MODE_META[k].icon;
            return (
              <TabsTrigger key={k} value={k} className="flex-col h-auto py-3 gap-1">
                <I className="h-4 w-4" />
                <span className="text-xs">{MODE_META[k].bn}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {(Object.keys(MODE_META) as Mode[]).map((k) => (
          <TabsContent key={k} value={k} className="space-y-4 mt-4">
            <p className="text-sm text-muted-foreground">{MODE_META[k].desc}</p>

            {!model.trim() ? (
              <Card>
                <CardContent className="py-10 text-center text-sm text-muted-foreground">
                  উপরের বক্সে ফোনের মডেল লিখুন — অটো লিংক দেখাবে।
                </CardContent>
              </Card>
            ) : (
              <>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Globe className="h-4 w-4" /> অটো সার্চ সোর্স ({SOURCES[k](model).length}টি)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {SOURCES[k](model).map((s, i) => (
                      <a
                        key={i}
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-start justify-between gap-3 p-3 rounded-lg border hover:bg-muted/40 hover:border-primary/40 transition group"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm group-hover:text-primary">{s.name}</div>
                          {s.note && <div className="text-[11px] text-muted-foreground mt-0.5">{s.note}</div>}
                          <div className="text-[10px] text-muted-foreground/70 mt-1 truncate">{s.url}</div>
                        </div>
                        <ExternalLink className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
                      </a>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">📖 সাধারণ ধাপ (বাংলায়)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ol className="space-y-1.5 text-sm list-decimal list-inside">
                      {STEPS_BN[k].map((s, i) => <li key={i}>{s}</li>)}
                    </ol>
                  </CardContent>
                </Card>

                <Button asChild variant="outline" className="w-full">
                  <a
                    href={`https://www.youtube.com/results?search_query=${q(`${model} ${k === "twrp" ? "TWRP install" : k === "roms" ? "custom rom install" : k === "recovery" ? "dead boot recovery" : "unlock"} bangla`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Youtube className="h-4 w-4 mr-2 text-red-500" /> YouTube-এ বাংলা ভিডিও গাইড দেখুন
                  </a>
                </Button>
              </>
            )}
          </TabsContent>
        ))}
      </Tabs>

      <Card className="border-yellow-500/40 bg-yellow-500/5">
        <CardContent className="pt-6 text-xs space-y-1">
          <p className="font-semibold flex items-center gap-1"><AlertTriangle className="h-4 w-4" /> দায়মুক্তি</p>
          <p>রুট, কাস্টম রম বা লক খোলার কাজ ওয়ারেন্টি বাতিল করতে পারে এবং ফোন স্থায়ীভাবে নষ্ট হতে পারে। চুরি/কিস্তি অসম্পূর্ণ ফোনের লক খোলা আইনত অপরাধ। নিজের ফোন ও নিজের দায়িত্বে কাজ করুন।</p>
          <p className="pt-1"><Badge variant="outline" className="text-[10px]">নোট</Badge> সব লিংক থার্ড-পার্টি সাইটে যায় — johnnil কেবল সোর্স খুঁজে দেয়, ফাইল হোস্ট করে না।</p>
        </CardContent>
      </Card>
    </div>
  );
}
