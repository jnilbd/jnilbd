import { useState } from "react";
import { motion } from "framer-motion";
import { HeartPulse, Loader2, Search, Sparkles, Pill, Apple, AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const COMMON_ILLNESSES = [
  { bn: "জ্বর", en: "Fever" },
  { bn: "মাথাব্যথা", en: "Headache" },
  { bn: "ঠান্ডা/সর্দি", en: "Cold/Flu" },
  { bn: "পেটব্যথা", en: "Stomach pain" },
  { bn: "ডায়রিয়া", en: "Diarrhea" },
  { bn: "গ্যাস্ট্রিক", en: "Gastric" },
  { bn: "উচ্চ রক্তচাপ", en: "High BP" },
  { bn: "ডায়াবেটিস", en: "Diabetes" },
  { bn: "অ্যালার্জি", en: "Allergy" },
];

const DAILY_PLAN = [
  { time: "৬:০০–৭:০০", bn: "পানি ১-২ গ্লাস + হালকা ব্যায়াম/হাঁটা", en: "1–2 glasses water + light walk" },
  { time: "৭:৩০–৮:৩০", bn: "নাশতা: রুটি/পরোটা, ডিম, সবজি, ফল", en: "Breakfast: bread, egg, veggies, fruit" },
  { time: "১০:৩০–১১:০০", bn: "মিড-মর্নিং স্ন্যাক: ফল, বাদাম", en: "Mid-morning: fruit, nuts" },
  { time: "১:০০–২:০০", bn: "দুপুরের খাবার: ভাত/রুটি + মাছ/মাংস + সবজি + ডাল", en: "Lunch: rice/bread + fish/meat + veggies + dal" },
  { time: "৪:৩০–৫:৩০", bn: "বিকেলের নাশতা: চা + বিস্কুট/মুড়ি (অল্প)", en: "Tea time: light snack" },
  { time: "৭:৩০–৮:৩০", bn: "রাতের খাবার (হালকা): রুটি/সবজি/স্যুপ", en: "Dinner (light): roti/veg/soup" },
  { time: "১০:০০–১১:০০", bn: "ঘুম: ৭-৮ ঘণ্টা", en: "Sleep: 7–8 hours" },
];

const HealthGuide = () => {
  const { language } = useLanguage();
  const t = (bn: string, en: string) => (language === "bn" ? bn : en);
  const [symptom, setSymptom] = useState("");
  const [busy, setBusy] = useState(false);
  const [advice, setAdvice] = useState<string>("");

  const askAI = async (q: string) => {
    setBusy(true);
    setAdvice("");
    try {
      const { data, error } = await supabase.functions.invoke("health-advice", {
        body: { question: q, language },
      });
      if (error) throw error;
      setAdvice(data?.advice || "");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container py-8 max-w-3xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-3">
            <HeartPulse className="w-3.5 h-3.5" />
            {t("স্বাস্থ্য গাইড", "Health Guide")}
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold mb-2">
            {t("কখন কী খাবেন, কখন কী চিকিৎসা", "When to eat, when to seek care")}
          </h1>
          <p className="text-muted-foreground text-sm">
            {t("AI পরামর্শ + দৈনন্দিন রুটিন + সাধারণ অসুখের গাইড", "AI advice + daily routine + common ailment guide")}
          </p>
        </div>

        <Tabs defaultValue="ai">
          <TabsList className="grid grid-cols-3 w-full mb-4">
            <TabsTrigger value="ai"><Sparkles className="w-4 h-4 mr-1.5" />{t("AI পরামর্শ", "AI Advice")}</TabsTrigger>
            <TabsTrigger value="routine"><Apple className="w-4 h-4 mr-1.5" />{t("রুটিন", "Routine")}</TabsTrigger>
            <TabsTrigger value="common"><Pill className="w-4 h-4 mr-1.5" />{t("অসুখ", "Ailments")}</TabsTrigger>
          </TabsList>

          <TabsContent value="ai">
            <Card className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  {t("আপনার সমস্যা/প্রশ্ন লিখুন", "Describe your issue/question")}
                </label>
                <div className="flex gap-2">
                  <Input
                    value={symptom}
                    onChange={(e) => setSymptom(e.target.value)}
                    placeholder={t("যেমন: ৩ দিন ধরে জ্বর + মাথাব্যথা", "e.g. 3 days fever + headache")}
                    onKeyDown={(e) => e.key === "Enter" && symptom.trim() && askAI(symptom)}
                  />
                  <Button onClick={() => symptom.trim() && askAI(symptom)} disabled={busy || !symptom.trim()}>
                    {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {COMMON_ILLNESSES.map((i) => (
                  <button
                    key={i.en}
                    onClick={() => { const q = language === "bn" ? i.bn : i.en; setSymptom(q); askAI(q); }}
                    className="px-3 py-1 rounded-full bg-muted text-xs font-medium hover:bg-primary hover:text-primary-foreground transition-smooth"
                  >
                    {language === "bn" ? i.bn : i.en}
                  </button>
                ))}
              </div>

              {advice && (
                <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 whitespace-pre-wrap text-sm leading-relaxed">
                  {advice}
                </div>
              )}

              <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  {t(
                    "এটি শুধু সাধারণ পরামর্শ। গুরুতর বা দীর্ঘস্থায়ী সমস্যায় অবশ্যই ডাক্তার দেখান।",
                    "This is general advice only. For serious or persistent issues, always see a doctor."
                  )}
                </span>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="routine">
            <Card className="p-6">
              <h3 className="font-display font-bold mb-3">{t("দৈনন্দিন স্বাস্থ্যকর রুটিন", "Healthy daily routine")}</h3>
              <div className="space-y-2">
                {DAILY_PLAN.map((p) => (
                  <div key={p.time} className="flex gap-3 p-3 rounded-xl bg-muted/40">
                    <div className="w-24 shrink-0 font-mono text-sm font-semibold text-primary">{p.time}</div>
                    <div className="text-sm">{language === "bn" ? p.bn : p.en}</div>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 rounded-lg bg-primary/5 text-xs text-muted-foreground">
                {t(
                  "টিপস: দিনে অন্তত ৮ গ্লাস পানি, লবণ ও চিনি কম, প্রতিদিন ৩০ মিনিট হাঁটা।",
                  "Tips: 8+ glasses water, low salt & sugar, 30 min walk daily."
                )}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="common">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { name: t("জ্বর (১০০°F+)", "Fever (100°F+)"), home: t("প্যারাসিটামল ৫০০ mg, ৬ ঘণ্টা পর পর; প্রচুর পানি; বিশ্রাম", "Paracetamol 500mg every 6h; lots of water; rest"), see: t("৩ দিনের বেশি বা ১০৩°F-এর উপরে গেলে", "If >3 days or above 103°F") },
                { name: t("ডায়রিয়া", "Diarrhea"), home: t("ORS, পান্তা/কাঁচকলা, কম মশলা, দস্তা সিরাপ", "ORS, plain rice, less spice, zinc syrup"), see: t("রক্ত পড়লে, ২৪ ঘণ্টা পরও না কমলে", "If blood appears or no improvement in 24h") },
                { name: t("ঠান্ডা/সর্দি", "Cold/Flu"), home: t("আদা-লেবু-মধু চা; গরম পানির ভাপ; বিশ্রাম", "Ginger-lemon-honey tea; steam; rest"), see: t("শ্বাসকষ্ট বা ৫ দিনের বেশি", "Breathing issue or >5 days") },
                { name: t("গ্যাস্ট্রিক", "Gastric"), home: t("নিয়মিত খাবার, কম তেল-মশলা, অ্যান্টাসিড", "Regular meals, less oil/spice, antacid"), see: t("বমি/রক্তবমি/তীব্র ব্যথা", "Vomiting blood / severe pain") },
                { name: t("উচ্চ রক্তচাপ", "High BP"), home: t("লবণ কমান, ব্যায়াম, ওজন নিয়ন্ত্রণ", "Reduce salt, exercise, weight control"), see: t("BP > 140/90 বার বার", "BP repeatedly >140/90") },
                { name: t("ডায়াবেটিস", "Diabetes"), home: t("চিনি/মিষ্টি কম, ৩০ মিনিট হাঁটা, ফাইবার বেশি", "Less sugar, 30min walk, more fiber"), see: t("FBS > ১২৬ বা PPBS > ২০০", "FBS >126 or PPBS >200") },
              ].map((c) => (
                <Card key={c.name} className="p-4 text-sm">
                  <p className="font-display font-bold text-base mb-2">{c.name}</p>
                  <div className="space-y-1.5">
                    <p><span className="text-green-600 font-semibold">{t("ঘরোয়া:", "Home:")}</span> {c.home}</p>
                    <p><span className="text-amber-600 font-semibold">{t("ডাক্তার:", "Doctor:")}</span> {c.see}</p>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
};

export default HealthGuide;
