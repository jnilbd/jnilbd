import { useState } from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { HeartPulse, Loader2, Search, Sparkles, Pill, Apple, AlertTriangle, Heart, Brain, Shield } from "lucide-react";
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
  { bn: "হাঁপানি/শ্বাসকষ্ট", en: "Asthma" },
  { bn: "কাশি", en: "Cough" },
  { bn: "চুলকানি/র‍্যাশ", en: "Skin rash" },
  { bn: "কোষ্ঠকাঠিন্য", en: "Constipation" },
  { bn: "জন্ডিস", en: "Jaundice" },
  { bn: "টাইফয়েড", en: "Typhoid" },
  { bn: "ডেঙ্গু", en: "Dengue" },
  { bn: "ইউরিন ইনফেকশন", en: "UTI" },
  { bn: "কোমর ব্যথা", en: "Back pain" },
  { bn: "হাঁটু ব্যথা", en: "Knee pain" },
  { bn: "মাইগ্রেন", en: "Migraine" },
  { bn: "অনিদ্রা", en: "Insomnia" },
  { bn: "চুল পড়া", en: "Hair fall" },
  { bn: "ব্রণ", en: "Acne" },
  { bn: "থাইরয়েড", en: "Thyroid" },
  { bn: "কোলেস্টেরল", en: "Cholesterol" },
  { bn: "এসিডিটি", en: "Acidity" },
];

const SEX_TOPICS = [
  { bn: "সম্পূর্ণ গাইড (বিবাহিতদের জন্য)", en: "Complete guide (married)" },
  { bn: "বাচ্চা পেতে চাই", en: "Want to conceive" },
  { bn: "ছেলে বাচ্চা পেতে চাই", en: "Want a boy" },
  { bn: "মেয়ে বাচ্চা পেতে চাই", en: "Want a girl" },
  { bn: "জন্মনিয়ন্ত্রণের সেরা উপায়", en: "Best contraception" },
  { bn: "কনডম তুলনা ও কোনটা ভালো", en: "Condom comparison" },
  { bn: "দ্রুত বীর্যপাত সমস্যা", en: "Premature ejaculation" },
  { bn: "যৌন দুর্বলতা / ED", en: "Erectile dysfunction" },
  { bn: "যৌনাঙ্গে ব্যথা", en: "Painful intercourse" },
  { bn: "যৌন আকাঙ্ক্ষা কম", en: "Low libido" },
];

const MENTAL_TOPICS = [
  { bn: "দুশ্চিন্তা / অ্যাংজাইটি", en: "Anxiety" },
  { bn: "বিষণ্ণতা / ডিপ্রেশন", en: "Depression" },
  { bn: "প্যানিক অ্যাটাক", en: "Panic attacks" },
  { bn: "OCD / শুচিবাই", en: "OCD" },
  { bn: "অনিদ্রা / ঘুমের সমস্যা", en: "Insomnia" },
  { bn: "একাকীত্ব", en: "Loneliness" },
  { bn: "পরীক্ষার চাপ", en: "Exam stress" },
  { bn: "সম্পর্কের সমস্যা", en: "Relationship issues" },
  { bn: "আত্মহত্যার চিন্তা আসে", en: "Suicidal thoughts" },
  { bn: "PTSD / ট্রমা", en: "PTSD / trauma" },
  { bn: "রাগ নিয়ন্ত্রণ", en: "Anger management" },
  { bn: "আত্মবিশ্বাস কম", en: "Low self-esteem" },
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

const AILMENTS = [
  { n: { bn: "জ্বর (১০০°F+)", en: "Fever" }, home: { bn: "প্যারাসিটামল ৫০০mg ৬ ঘণ্টা পর পর; প্রচুর পানি; বিশ্রাম", en: "Paracetamol 500mg every 6h; lots of water; rest" }, see: { bn: "৩ দিনের বেশি বা ১০৩°F-এর উপরে গেলে", en: ">3 days or above 103°F" } },
  { n: { bn: "ডায়রিয়া", en: "Diarrhea" }, home: { bn: "ORS, পান্তা/কাঁচকলা, কম মশলা, জিঙ্ক সিরাপ", en: "ORS, plain rice, zinc syrup" }, see: { bn: "রক্ত পড়লে, ২৪ ঘণ্টা পরও না কমলে", en: "Blood or no improvement in 24h" } },
  { n: { bn: "ঠান্ডা/সর্দি", en: "Cold/Flu" }, home: { bn: "আদা-লেবু-মধু চা; ভাপ; বিশ্রাম", en: "Ginger-lemon-honey tea; steam; rest" }, see: { bn: "শ্বাসকষ্ট বা ৫ দিনের বেশি", en: "Breathing trouble or >5 days" } },
  { n: { bn: "গ্যাস্ট্রিক", en: "Gastric" }, home: { bn: "নিয়মিত খাবার, কম তেল, অ্যান্টাসিড/Seclo", en: "Regular meals, antacid/Seclo 20mg" }, see: { bn: "বমি/রক্তবমি/তীব্র ব্যথা", en: "Vomiting blood / severe pain" } },
  { n: { bn: "উচ্চ রক্তচাপ", en: "High BP" }, home: { bn: "লবণ কমান, ব্যায়াম, ওজন নিয়ন্ত্রণ", en: "Reduce salt, exercise" }, see: { bn: "BP > 140/90 বারবার", en: "BP >140/90 repeatedly" } },
  { n: { bn: "ডায়াবেটিস", en: "Diabetes" }, home: { bn: "চিনি/মিষ্টি কম, ৩০ মিনিট হাঁটা, ফাইবার বেশি", en: "Less sugar, walk 30min" }, see: { bn: "FBS > ১২৬ বা PPBS > ২০০", en: "FBS >126 or PPBS >200" } },
  { n: { bn: "মাইগ্রেন", en: "Migraine" }, home: { bn: "অন্ধকার ঘরে বিশ্রাম, Napa Extra, ঠান্ডা সেঁক", en: "Dark room rest, Napa Extra, cold pack" }, see: { bn: "সপ্তাহে ৩+ বার বা চোখে সমস্যা", en: "3+ times/week or vision issue" } },
  { n: { bn: "ডেঙ্গু", en: "Dengue" }, home: { bn: "প্রচুর পানি + ORS, শুধু প্যারাসিটামল (আইবুপ্রোফেন না)", en: "Lots of water + ORS, Paracetamol only" }, see: { bn: "প্লাটিলেট কমে, রক্তপাত, পেটব্যথা — অবিলম্বে", en: "Low platelets, bleeding — urgent" } },
  { n: { bn: "টাইফয়েড", en: "Typhoid" }, home: { bn: "হালকা খাবার, প্রচুর পানি, পরিষ্কার পানি পান", en: "Light food, clean water" }, see: { bn: "১০৩°F+ ৩ দিনের বেশি — কালচার পরীক্ষা", en: "High fever 3+ days — blood culture" } },
  { n: { bn: "ইউরিন ইনফেকশন (UTI)", en: "UTI" }, home: { bn: "প্রচুর পানি, ক্র্যানবেরি, পরিষ্কার থাকুন", en: "Lots of water, cranberry, hygiene" }, see: { bn: "জ্বর+ব্যথা / ৩ দিনের বেশি", en: "Fever+pain / >3 days — needs antibiotic" } },
  { n: { bn: "হাঁপানি/অ্যাজমা", en: "Asthma" }, home: { bn: "ইনহেলার (Salbutamol), ধুলো/ধোঁয়া এড়ান", en: "Inhaler, avoid dust/smoke" }, see: { bn: "ইনহেলারে কাজ না হলে — ER", en: "If inhaler doesn't help — ER" } },
  { n: { bn: "অ্যালার্জি/র‍্যাশ", en: "Allergy/Rash" }, home: { bn: "Antihistamine (Alatrol/Fexofast), ট্রিগার এড়ান", en: "Antihistamine, avoid trigger" }, see: { bn: "মুখ ফুলে গেলে / শ্বাসকষ্ট — ER", en: "Face swelling / breathing — ER" } },
  { n: { bn: "কোষ্ঠকাঠিন্য", en: "Constipation" }, home: { bn: "ফাইবার বেশি, পানি, ইসবগুলের ভুসি", en: "Fiber, water, isabgol husk" }, see: { bn: "রক্ত পড়লে / ২ সপ্তাহের বেশি", en: "Blood / >2 weeks" } },
  { n: { bn: "জন্ডিস", en: "Jaundice" }, home: { bn: "বিশ্রাম, হালকা খাবার, প্রচুর পানি — কোনো ভেষজ না", en: "Rest, light food, no herbal" }, see: { bn: "অবশ্যই ডাক্তার + LFT পরীক্ষা", en: "Always doctor + LFT test" } },
  { n: { bn: "ব্রণ", en: "Acne" }, home: { bn: "মুখ পরিষ্কার, তেল কম, Benzoyl Peroxide জেল", en: "Wash face, less oil, BPO gel" }, see: { bn: "গভীর/সিস্টিক ব্রণ — ডার্মাটোলজিস্ট", en: "Cystic acne — dermatologist" } },
  { n: { bn: "চুল পড়া", en: "Hair fall" }, home: { bn: "প্রোটিন, আয়রন, বায়োটিন, কম স্ট্রেস", en: "Protein, iron, biotin, less stress" }, see: { bn: "৩+ মাস ধরে অতিরিক্ত — থাইরয়েড টেস্ট", en: "3+ months excessive — thyroid test" } },
];

const mdClass = `
  max-w-none text-[15px] leading-relaxed
  [&_h2]:text-lg [&_h2]:font-bold [&_h2]:mt-5 [&_h2]:mb-2 [&_h2]:text-primary
  [&_h3]:text-base [&_h3]:font-semibold [&_h3]:mt-4 [&_h3]:mb-2
  [&_p]:my-2 [&_p]:leading-7
  [&_ul]:my-2 [&_ul]:space-y-1.5 [&_ul]:pl-5 [&_ul]:list-disc [&_ul]:marker:text-primary
  [&_ol]:my-2 [&_ol]:space-y-1.5 [&_ol]:pl-5 [&_ol]:list-decimal [&_ol]:marker:text-primary [&_ol]:marker:font-bold
  [&_li]:pl-1
  [&_strong]:text-foreground [&_strong]:font-semibold
  [&_code]:bg-primary/10 [&_code]:text-primary [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-[13px] [&_code]:font-mono
  [&_table]:my-3 [&_table]:w-full [&_table]:text-sm [&_table]:border-collapse
  [&_th]:bg-muted [&_th]:p-2 [&_th]:text-left [&_th]:font-semibold [&_th]:border [&_th]:border-border
  [&_td]:p-2 [&_td]:border [&_td]:border-border [&_td]:align-top
  [&_hr]:my-4 [&_hr]:border-border
`;

const HealthGuide = () => {
  const { language } = useLanguage();
  const isBn = language === "bn";
  const t = (bn: string, en: string) => (isBn ? bn : en);

  const useAdvice = () => {
    const [q, setQ] = useState("");
    const [busy, setBusy] = useState(false);
    const [advice, setAdvice] = useState("");
    const ask = async (question: string, category: string) => {
      setQ(question);
      setBusy(true);
      setAdvice("");
      try {
        const { data, error } = await supabase.functions.invoke("health-advice", {
          body: { question, language, category },
        });
        if (error) throw error;
        if (data?.error) throw new Error(data.error);
        setAdvice(data?.advice || "");
      } catch (e: any) {
        toast.error(e.message || "Failed");
      } finally {
        setBusy(false);
      }
    };
    return { q, setQ, busy, advice, ask };
  };

  const general = useAdvice();
  const sex = useAdvice();
  const mental = useAdvice();

  const Disclaimer = ({ kind = "general" }: { kind?: "general" | "sex" | "mental" }) => (
    <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs">
      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
      <span>
        {kind === "sex"
          ? t("এই তথ্য শুধুমাত্র প্রাপ্তবয়স্ক বিবাহিত দম্পতিদের জন্য শিক্ষামূলক — চিকিৎসা পরামর্শ নয়।", "Educational info for adult married couples — not medical advice.")
          : kind === "mental"
          ? t("সংকটে থাকলে এখনই কল করুন — Kaan Pete Roi: 9612119911 (২৪/৭)", "In crisis? Call now — Kaan Pete Roi: 9612119911 (24/7)")
          : t("এটি সাধারণ পরামর্শ। গুরুতর সমস্যায় ডাক্তার দেখান।", "General advice only. See a doctor for serious issues.")}
      </span>
    </div>
  );

  const AdviceCard = ({ state, suggestions, placeholder, category, kind }: any) => (
    <Card className="p-6 space-y-4">
      <div>
        <label className="text-sm font-medium mb-1.5 block">{t("আপনার প্রশ্ন/সমস্যা লিখুন", "Describe your question")}</label>
        <div className="flex gap-2">
          <Input
            value={state.q}
            onChange={(e) => state.setQ(e.target.value)}
            placeholder={placeholder}
            onKeyDown={(e) => e.key === "Enter" && state.q.trim() && state.ask(state.q, category)}
          />
          <Button onClick={() => state.q.trim() && state.ask(state.q, category)} disabled={state.busy || !state.q.trim()}>
            {state.busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          </Button>
        </div>
        <p className="text-[11px] text-muted-foreground mt-1.5">
          {t("নিচের কোনো বিষয় নেই? উপরে নিজের প্রশ্ন লিখে সার্চ করুন — AI তাৎক্ষণিক উত্তর দেবে।", "Topic not listed? Type your own question above — AI answers instantly.")}
        </p>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {suggestions.map((i: any) => (
          <button
            key={i.en}
            onClick={() => state.ask(isBn ? i.bn : i.en, category)}
            className="px-3 py-1 rounded-full bg-muted text-xs font-medium hover:bg-primary hover:text-primary-foreground transition-smooth"
          >
            {isBn ? i.bn : i.en}
          </button>
        ))}
      </div>

      {state.busy && (
        <div className="flex items-center justify-center gap-2 py-6 text-muted-foreground text-sm">
          <Loader2 className="w-4 h-4 animate-spin" /> {t("উত্তর তৈরি হচ্ছে...", "Generating answer...")}
        </div>
      )}

      {state.advice && (
        <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
          <article className={mdClass}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{state.advice}</ReactMarkdown>
          </article>
        </div>
      )}

      <Disclaimer kind={kind} />
    </Card>
  );

  return (
    <div className="container py-8 max-w-3xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-3">
            <HeartPulse className="w-3.5 h-3.5" />
            {t("স্বাস্থ্য গাইড", "Health Guide")}
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold mb-2">
            {t("শরীর, মন ও যৌন স্বাস্থ্য — সম্পূর্ণ গাইড", "Body, Mind & Sexual Health — Complete Guide")}
          </h1>
          <p className="text-muted-foreground text-sm">
            {t("AI পরামর্শ + অসুখ গাইড + মেন্টাল হেলথ + যৌন স্বাস্থ্য + দৈনন্দিন রুটিন", "AI advice + ailments + mental + sexual health + daily routine")}
          </p>
        </div>

        <Tabs defaultValue="ai">
          <TabsList className="grid grid-cols-3 sm:grid-cols-5 w-full mb-4 h-auto">
            <TabsTrigger value="ai" className="flex flex-col sm:flex-row gap-1 py-2 text-xs"><Sparkles className="w-4 h-4" />{t("AI", "AI")}</TabsTrigger>
            <TabsTrigger value="common" className="flex flex-col sm:flex-row gap-1 py-2 text-xs"><Pill className="w-4 h-4" />{t("অসুখ", "Ailments")}</TabsTrigger>
            <TabsTrigger value="mental" className="flex flex-col sm:flex-row gap-1 py-2 text-xs"><Brain className="w-4 h-4" />{t("মন", "Mental")}</TabsTrigger>
            <TabsTrigger value="sex" className="flex flex-col sm:flex-row gap-1 py-2 text-xs"><Heart className="w-4 h-4" />{t("যৌন", "Sexual")}</TabsTrigger>
            <TabsTrigger value="routine" className="flex flex-col sm:flex-row gap-1 py-2 text-xs"><Apple className="w-4 h-4" />{t("রুটিন", "Routine")}</TabsTrigger>
          </TabsList>

          <TabsContent value="ai">
            <AdviceCard
              state={general}
              suggestions={COMMON_ILLNESSES}
              category="general"
              placeholder={t("যেমন: ৩ দিন ধরে জ্বর + মাথাব্যথা", "e.g. 3 days fever + headache")}
              kind="general"
            />
          </TabsContent>

          <TabsContent value="common">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {AILMENTS.map((c) => (
                <Card key={c.n.en} className="p-4 text-sm">
                  <p className="font-display font-bold text-base mb-2">{isBn ? c.n.bn : c.n.en}</p>
                  <div className="space-y-1.5">
                    <p><span className="text-green-600 font-semibold">{t("ঘরোয়া:", "Home:")}</span> {isBn ? c.home.bn : c.home.en}</p>
                    <p><span className="text-amber-600 font-semibold">{t("ডাক্তার:", "Doctor:")}</span> {isBn ? c.see.bn : c.see.en}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full mt-3 h-8 text-xs"
                    onClick={() => {
                      const q = isBn ? c.n.bn : c.n.en;
                      general.ask(q, "general");
                      const tab = document.querySelector('[value="ai"]') as HTMLElement;
                      tab?.click();
                    }}
                  >
                    <Sparkles className="w-3 h-3 mr-1" /> {t("বিস্তারিত AI পরামর্শ", "Detailed AI advice")}
                  </Button>
                </Card>
              ))}
            </div>
            <p className="text-center text-xs text-muted-foreground mt-4">
              {t("তালিকায় নেই এমন অসুখ? AI ট্যাবে নিজের প্রশ্ন লিখুন — বিস্তারিত সমাধান পাবেন।", "Ailment not listed? Type your own in AI tab for detailed solution.")}
            </p>
          </TabsContent>

          <TabsContent value="mental">
            <AdviceCard
              state={mental}
              suggestions={MENTAL_TOPICS}
              category="mental"
              placeholder={t("যেমন: রাতে ঘুম আসছে না, খুব দুশ্চিন্তা হচ্ছে", "e.g. can't sleep, anxious all the time")}
              kind="mental"
            />
            <Card className="p-4 mt-4 bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900">
              <div className="flex items-start gap-2">
                <Brain className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div className="text-sm space-y-1">
                  <p className="font-semibold">{t("জরুরি হেল্পলাইন (বাংলাদেশ)", "Emergency Helplines (Bangladesh)")}</p>
                  <p>📞 <strong>Kaan Pete Roi</strong>: 9612119911 ({t("২৪/৭", "24/7")})</p>
                  <p>📞 <strong>National Mental Health</strong>: 09611677777</p>
                  <p>📞 <strong>Moner Bondhu</strong>: 01776632344</p>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="sex">
            <Card className="p-4 mb-3 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
              <div className="flex items-start gap-2">
                <Shield className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <p className="text-xs">
                  {t(
                    "এই সেকশনটি প্রাপ্তবয়স্ক বিবাহিত দম্পতিদের শিক্ষামূলক স্বাস্থ্য তথ্যের জন্য — ইসলামিক ও মেডিকেল দৃষ্টিকোণে।",
                    "Educational health info for adult married couples — from Islamic & medical perspective."
                  )}
                </p>
              </div>
            </Card>
            <AdviceCard
              state={sex}
              suggestions={SEX_TOPICS}
              category="sex"
              placeholder={t("যেমন: কনডম নাকি পিল ভালো? / বাচ্চা পেতে চাই", "e.g. condom vs pill? / want to conceive")}
              kind="sex"
            />
          </TabsContent>

          <TabsContent value="routine">
            <Card className="p-6">
              <h3 className="font-display font-bold mb-3">{t("দৈনন্দিন স্বাস্থ্যকর রুটিন", "Healthy daily routine")}</h3>
              <div className="space-y-2">
                {DAILY_PLAN.map((p) => (
                  <div key={p.time} className="flex gap-3 p-3 rounded-xl bg-muted/40">
                    <div className="w-24 shrink-0 font-mono text-sm font-semibold text-primary">{p.time}</div>
                    <div className="text-sm">{isBn ? p.bn : p.en}</div>
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
        </Tabs>
      </motion.div>
    </div>
  );
};

export default HealthGuide;
