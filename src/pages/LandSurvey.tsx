import { useState } from "react";
import { motion } from "framer-motion";
import { Map, Calculator, ExternalLink, FileText, Search, Landmark, ScrollText, Home, ShoppingCart, Tag, Receipt, UserCheck, AlertTriangle, Shield, Phone } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/contexts/LanguageContext";

// Bangladesh land area unit conversions
const UNITS = {
  shotok: 435.6,        // 1 শতক = 435.6 sq ft
  katha_dhaka: 720,     // 1 কাঠা (Dhaka) = 720 sq ft
  katha_chitt: 1440,    // 1 কাঠা (Chittagong) = 1440 sq ft
  bigha: 14400,         // 1 বিঘা = 33 শতক
  acre: 43560,
  sqft: 1,
  sqm: 10.7639,
  sqyd: 9,
  hectare: 107639,
};

const LandSurvey = () => {
  const { language } = useLanguage();
  const t = (bn: string, en: string) => (language === "bn" ? bn : en);
  const [val, setVal] = useState("1");
  const [from, setFrom] = useState<keyof typeof UNITS>("katha_dhaka");

  const baseSqft = (parseFloat(val) || 0) * UNITS[from];

  const services = [
    { name: t("ই-পর্চা / RS খতিয়ান", "e-Porcha / RS Khatian"), url: "https://eporcha.gov.bd", icon: ScrollText },
    { name: t("ভূমি সেবা পোর্টাল", "Land Services Portal"), url: "https://land.gov.bd", icon: Landmark },
    { name: t("ভূমি উন্নয়ন কর (অনলাইন)", "Land Development Tax"), url: "https://ldtax.gov.bd", icon: FileText },
    { name: t("নামজারি (mutation)", "Mutation (Namjari)"), url: "https://mutation.land.gov.bd", icon: FileText },
    { name: t("দলিল রেজিস্ট্রেশন", "Deed Registration"), url: "https://land.gov.bd/site/page/79078eed-0bbe-4d77-b5e3-c69a1faabcb0", icon: ScrollText },
    { name: t("DLR মৌজা ম্যাপ", "DLR Mouza Map"), url: "https://eservice.dlrms.land.gov.bd", icon: Map },
    { name: t("ভূমি কর পরিশোধ যাচাই", "Tax Payment Verification"), url: "https://ldtax.gov.bd", icon: Search },
    { name: t("জমির রেকর্ড সংশোধন", "Record Correction"), url: "https://land.gov.bd", icon: FileText },
  ];

  const unitLabels: Record<keyof typeof UNITS, { bn: string; en: string }> = {
    shotok: { bn: "শতক (Decimal)", en: "Decimal/Shotok" },
    katha_dhaka: { bn: "কাঠা (ঢাকা)", en: "Katha (Dhaka)" },
    katha_chitt: { bn: "কাঠা (চট্টগ্রাম)", en: "Katha (Chittagong)" },
    bigha: { bn: "বিঘা", en: "Bigha" },
    acre: { bn: "একর", en: "Acre" },
    sqft: { bn: "বর্গফুট", en: "Sq Feet" },
    sqm: { bn: "বর্গমিটার", en: "Sq Meter" },
    sqyd: { bn: "বর্গগজ", en: "Sq Yard" },
    hectare: { bn: "হেক্টর", en: "Hectare" },
  };

  const fmt = (n: number) => n.toLocaleString(undefined, { maximumFractionDigits: 4 });

  return (
    <div className="container py-8 max-w-4xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-3">
            <Map className="w-3.5 h-3.5" />
            {t("ভূমি জরিপ ও সেবা", "Land Survey & Services")}
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold mb-2">
            {t("বাংলাদেশের ভূমি — সব এক জায়গায়", "Bangladesh Land — All in one")}
          </h1>
          <p className="text-muted-foreground text-sm">
            {t("খতিয়ান, নামজারি, ভূমি কর, দলিল, কনভার্টার ও ক্যালকুলেটর", "Khatian, Mutation, Tax, Deed, Converter & Calculator")}
          </p>
        </div>

        <Tabs defaultValue="jomi">
          <TabsList className="grid grid-cols-2 sm:grid-cols-4 w-full mb-4 h-auto">
            <TabsTrigger value="jomi" className="text-xs"><Home className="w-3.5 h-3.5 mr-1" />{t("জমি জমা", "Land Affairs")}</TabsTrigger>
            <TabsTrigger value="converter" className="text-xs"><Calculator className="w-3.5 h-3.5 mr-1" />{t("কনভার্টার", "Converter")}</TabsTrigger>
            <TabsTrigger value="services" className="text-xs"><Landmark className="w-3.5 h-3.5 mr-1" />{t("সেবা", "Services")}</TabsTrigger>
            <TabsTrigger value="guide" className="text-xs"><FileText className="w-3.5 h-3.5 mr-1" />{t("গাইড", "Guide")}</TabsTrigger>
          </TabsList>

          {/* ============== JOMI JOMA — Comprehensive Land Affairs ============== */}
          <TabsContent value="jomi">
            <div className="space-y-4">
              {/* Hero intro */}
              <Card className="p-5 bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/30">
                <h2 className="text-xl font-display font-bold mb-2 flex items-center gap-2">
                  <Home className="w-5 h-5 text-primary" />
                  {t("জমি জমা — পূর্ণাঙ্গ গাইডলাইন", "Land Affairs — Complete Guideline")}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {t(
                    "জমি কেনা, বিক্রি, রেজিস্ট্রেশন, নামজারি, খাজনা, খতিয়ান সংশোধন, বিরোধ মীমাংসা — বাংলাদেশের প্রেক্ষাপটে সব কিছু এক জায়গায়।",
                    "Buying, selling, registration, mutation, tax, record correction, disputes — everything for Bangladesh in one place."
                  )}
                </p>
              </Card>

              {/* ========== ১. জমি কেনা ========== */}
              <Card className="p-5">
                <h3 className="font-display font-bold text-base mb-2 flex items-center gap-2 text-green-700 dark:text-green-400">
                  <ShoppingCart className="w-4 h-4" />
                  {t("১. জমি কেনার ধাপসমূহ", "1. How to Buy Land")}
                </h3>
                <ol className="list-decimal pl-5 text-sm space-y-2 text-muted-foreground">
                  <li>{t("পছন্দের জমি নির্বাচন — অবস্থান, রাস্তা, পানি, বিদ্যুৎ, ভবিষ্যৎ মূল্য বিবেচনা করুন।", "Select land — check location, road, water, electricity, future value.")}</li>
                  <li>{t("মালিকানা যাচাই — eporcha.gov.bd থেকে CS, SA, RS, BS, মহানগর খতিয়ান বের করে দাগ-খতিয়ান মেলান।", "Verify ownership — pull CS/SA/RS/BS/City Khatian from eporcha.gov.bd, match Dag-Khatian.")}</li>
                  <li>{t("DCR / ১২ বছরের রেকর্ড দেখুন — পূর্ববর্তী বিক্রি, দান, বন্ধক, মামলা আছে কি না।", "Check 12-year DCR — past sales, gifts, mortgages, or lawsuits.")}</li>
                  <li>{t("সাব-রেজিস্ট্রি অফিসে গিয়ে দলিল সার্চ — বিক্রেতা একই জমি অন্যকে দেননি তো?", "Search Sub-Registry — confirm seller hasn't sold same land elsewhere.")}</li>
                  <li>{t("খাজনা/ভূমি উন্নয়ন কর হালনাগাদ — ldtax.gov.bd এ চেক করুন।", "LD Tax up-to-date — verify at ldtax.gov.bd.")}</li>
                  <li>{t("বায়না দলিল (Bayna) — অগ্রিম দিয়ে ৬ মাসের চুক্তি; নোটারি/সাব-রেজিস্ট্রার অফিসে।", "Bayna deed — advance + 6-month agreement at notary/sub-registrar.")}</li>
                  <li>{t("সাফ-কবলা দলিল রেজিস্ট্রেশন — উভয় পক্ষ, সাক্ষী ২ জন, NID, ছবি, স্ট্যাম্প।", "Saf-Kabla registration — both parties, 2 witnesses, NID, photos, stamp.")}</li>
                  <li>{t("রেজিস্ট্রেশন ফি ও কর পরিশোধ (নিচে বিস্তারিত)।", "Pay registration fees & taxes (details below).")}</li>
                  <li>{t("দলিলের মূল কপি গ্রহণ ও নামজারির জন্য আবেদন (mutation.land.gov.bd)।", "Receive original deed & apply for mutation at mutation.land.gov.bd.")}</li>
                </ol>
                <div className="mt-3 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-xs">
                  <p className="font-semibold mb-1 flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5 text-yellow-600" /> {t("সাবধান", "Caution")}</p>
                  <p>{t("জমির বর্তমান দখলদার (অবস্থান) সরেজমিনে যাচাই করুন। কাগজে এক, বাস্তবে আরেক হতে পারে।", "Physically inspect actual possession — paper and ground may differ.")}</p>
                </div>
              </Card>

              {/* ========== ২. জমি বিক্রি ========== */}
              <Card className="p-5">
                <h3 className="font-display font-bold text-base mb-2 flex items-center gap-2 text-blue-700 dark:text-blue-400">
                  <Tag className="w-4 h-4" />
                  {t("২. জমি বিক্রির ধাপসমূহ", "2. How to Sell Land")}
                </h3>
                <ol className="list-decimal pl-5 text-sm space-y-2 text-muted-foreground">
                  <li>{t("নিজের নামে নামজারি ও খতিয়ান নিশ্চিত করুন।", "Ensure mutation & khatian in your own name.")}</li>
                  <li>{t("খাজনা/কর সর্বশেষ পরিশোধের রসিদ প্রস্তুত রাখুন।", "Keep latest tax payment receipts ready.")}</li>
                  <li>{t("দলিল, পর্চা, মৌজা ম্যাপ, NID, ছবি একসাথে রাখুন।", "Keep deed, porcha, mouza map, NID, photos together.")}</li>
                  <li>{t("ক্রেতার সাথে দাম ও শর্ত চূড়ান্ত করে বায়না (Earnest) নিন।", "Finalize price/terms and accept Bayna from buyer.")}</li>
                  <li>{t("সাব-রেজিস্ট্রি অফিসে সাফ-কবলা সম্পাদন ও রেজিস্ট্রেশন।", "Execute and register Saf-Kabla at Sub-Registry.")}</li>
                  <li>{t("আয়কর রিটার্নে বিক্রয় আয় উল্লেখ করুন (গেইন ট্যাক্স প্রযোজ্য)।", "Report sale income in tax return (capital gains apply).")}</li>
                  <li>{t("চেক/ব্যাংক ট্রান্সফারে টাকা নিন — নগদে নয়।", "Receive payment via cheque/bank transfer — never cash.")}</li>
                </ol>
              </Card>

              {/* ========== ৩. দলিল রেজিস্ট্রেশন (খরচ) ========== */}
              <Card className="p-5">
                <h3 className="font-display font-bold text-base mb-2 flex items-center gap-2 text-purple-700 dark:text-purple-400">
                  <ScrollText className="w-4 h-4" />
                  {t("৩. দলিল রেজিস্ট্রেশন — খরচ ও ফি", "3. Deed Registration — Fees & Costs")}
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs border-collapse">
                    <thead><tr className="bg-muted">
                      <th className="p-2 text-left">{t("খাত", "Item")}</th>
                      <th className="p-2 text-right">{t("হার", "Rate")}</th>
                    </tr></thead>
                    <tbody>
                      {[
                        ["স্ট্যাম্প ডিউটি", "Stamp Duty", "১.৫% (জমির মূল্যের)"],
                        ["রেজিস্ট্রেশন ফি", "Registration Fee", "১% (জমির মূল্যের)"],
                        ["স্থানীয় সরকার কর (LGT)", "Local Govt Tax", "৩% (পৌর/সিটি কর্প)"],
                        ["উৎসে আয়কর (AIT)", "Source Tax (AIT)", "১-৪% (এলাকাভেদে)"],
                        ["VAT (নির্মিত সম্পত্তি)", "VAT (built property)", "১.৫-৩%"],
                        ["E ও N ফি", "E & N Fee", "নির্ধারিত"],
                        ["মোট আনুমানিক", "Total Approx.", "৭-১২% মূল্যের"],
                      ].map(([bn, en, r], i) => (
                        <tr key={i} className="border-b">
                          <td className="p-2">{language === "bn" ? bn : en}</td>
                          <td className="p-2 text-right font-semibold">{r}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-muted-foreground mt-2">{t("নোট: ঢাকার গুলশান/বনানী/উত্তরা এলাকায় AIT সর্বোচ্চ ৪%। গ্রামাঞ্চলে কম।", "Note: AIT up to 4% in Dhaka prime areas; lower in rural areas.")}</p>
              </Card>

              {/* ========== ৪. নামজারি (Mutation) ========== */}
              <Card className="p-5">
                <h3 className="font-display font-bold text-base mb-2 flex items-center gap-2 text-orange-700 dark:text-orange-400">
                  <UserCheck className="w-4 h-4" />
                  {t("৪. নামজারি (Mutation/Namjari)", "4. Mutation (Namjari)")}
                </h3>
                <p className="text-sm text-muted-foreground mb-2">
                  {t("কেনা/উত্তরাধিকার/দান সূত্রে পাওয়া জমি নিজের নামে রেকর্ড করার প্রক্রিয়া। mutation.land.gov.bd এ অনলাইনে আবেদন।", "Process to record acquired land in your own name. Apply online at mutation.land.gov.bd.")}
                </p>
                <h4 className="font-semibold text-sm mb-1">{t("প্রয়োজনীয় কাগজ:", "Required Documents:")}</h4>
                <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-0.5 mb-3">
                  <li>{t("দলিলের মূল কপি ও সার্টিফাইড কপি", "Original & certified copy of deed")}</li>
                  <li>{t("সর্বশেষ খতিয়ান (RS/BS)", "Latest Khatian (RS/BS)")}</li>
                  <li>{t("খাজনার দাখিলা (সর্বশেষ)", "Latest tax payment receipt")}</li>
                  <li>{t("ক্রেতা ও বিক্রেতার NID, ছবি", "NID & photo of buyer/seller")}</li>
                  <li>{t("ওয়ারিশ সনদ (উত্তরাধিকার হলে)", "Heirship certificate (if inherited)")}</li>
                  <li>{t("আবেদন ফি — ১১৭০ টাকা (অনলাইন)", "Application fee — BDT 1,170 online")}</li>
                </ul>
                <h4 className="font-semibold text-sm mb-1">{t("ফি কাঠামো:", "Fee Structure:")}</h4>
                <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-0.5">
                  <li>{t("কোর্ট ফি: ২০ টাকা", "Court fee: BDT 20")}</li>
                  <li>{t("নোটিশ জারি ফি: ৫০ টাকা", "Notice fee: BDT 50")}</li>
                  <li>{t("রেকর্ড সংশোধন ফি: ১০০০ টাকা", "Record correction: BDT 1,000")}</li>
                  <li>{t("খতিয়ান ফি: ১০০ টাকা", "Khatian fee: BDT 100")}</li>
                  <li>{t("সময়: ২৮-৪৫ কর্মদিবস", "Time: 28-45 working days")}</li>
                </ul>
              </Card>

              {/* ========== ৫. খাজনা / ভূমি উন্নয়ন কর ========== */}
              <Card className="p-5">
                <h3 className="font-display font-bold text-base mb-2 flex items-center gap-2 text-teal-700 dark:text-teal-400">
                  <Receipt className="w-4 h-4" />
                  {t("৫. খাজনা / ভূমি উন্নয়ন কর পরিশোধ", "5. Land Tax (Khajna) Payment")}
                </h3>
                <p className="text-sm text-muted-foreground mb-2">
                  {t("প্রতি বছর ldtax.gov.bd এ অনলাইনে পরিশোধ করুন। দাখিলা ছাড়া জমি বিক্রি বা নামজারি হয় না।", "Pay yearly at ldtax.gov.bd. Without receipt (Dakhila), you can't sell or mutate land.")}
                </p>
                <h4 className="font-semibold text-sm mb-1">{t("হার (বার্ষিক):", "Rate (Yearly):")}</h4>
                <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-0.5 mb-2">
                  <li>{t("কৃষি জমি ২৫ বিঘা পর্যন্ত — মুক্ত (০ টাকা)", "Agricultural land up to 25 Bigha — Free (BDT 0)")}</li>
                  <li>{t("কৃষি ২৫+ বিঘা — ১০ টাকা/শতক/বছর", "Agri 25+ Bigha — BDT 10/decimal/year")}</li>
                  <li>{t("আবাসিক (গ্রাম) — ১৫ টাকা/শতক", "Residential (rural) — BDT 15/decimal")}</li>
                  <li>{t("আবাসিক (পৌর/শহর) — ২৫-৬০ টাকা/শতক", "Residential (city/municipal) — BDT 25-60/decimal")}</li>
                  <li>{t("বাণিজ্যিক — ১০০-৫০০ টাকা/শতক (এলাকাভেদে)", "Commercial — BDT 100-500/decimal (varies)")}</li>
                </ul>
                <h4 className="font-semibold text-sm mb-1">{t("পরিশোধের ধাপ:", "Payment Steps:")}</h4>
                <ol className="list-decimal pl-5 text-sm text-muted-foreground space-y-0.5">
                  <li>{t("ldtax.gov.bd এ NID + মোবাইল দিয়ে রেজিস্ট্রেশন", "Register at ldtax.gov.bd with NID + mobile")}</li>
                  <li>{t("\"জমির খতিয়ান যুক্ত করুন\" → বিভাগ/জেলা/উপজেলা/মৌজা/দাগ", "Add Khatian → Division/District/Upazila/Mouza/Dag")}</li>
                  <li>{t("বকেয়া দেখাবে → bKash/Nagad/Rocket/কার্ডে পরিশোধ", "Pending dues shown → pay via bKash/Nagad/Rocket/Card")}</li>
                  <li>{t("ডিজিটাল দাখিলা ডাউনলোড ও সংরক্ষণ", "Download & save digital receipt (Dakhila)")}</li>
                </ol>
              </Card>

              {/* ========== ৬. খতিয়ান ও রেকর্ড সংশোধন ========== */}
              <Card className="p-5">
                <h3 className="font-display font-bold text-base mb-2 flex items-center gap-2 text-indigo-700 dark:text-indigo-400">
                  <FileText className="w-4 h-4" />
                  {t("৬. খতিয়ান সংগ্রহ ও সংশোধন", "6. Khatian Collection & Correction")}
                </h3>
                <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                  <li><b>{t("অনলাইন খতিয়ান:", "Online Khatian:")}</b> eporcha.gov.bd → {t("বিভাগ/জেলা/উপজেলা/মৌজা সিলেক্ট → খতিয়ান/দাগ নং দিয়ে সার্চ", "Select division/district/upazila/mouza → search by khatian/dag")}</li>
                  <li><b>{t("সার্টিফাইড কপি:", "Certified Copy:")}</b> {t("অনলাইন আবেদন → ১০০ টাকা ফি → ১৪ দিনে ডাকযোগে", "Apply online → BDT 100 fee → delivered in 14 days")}</li>
                  <li><b>{t("রেকর্ড সংশোধন (Section 150):", "Record Correction:")}</b> {t("ভুল থাকলে AC Land / Settlement Office এ আবেদন", "If errors — apply to AC Land / Settlement Office")}</li>
                  <li><b>{t("জরিপ সমস্যা:", "Survey Issue:")}</b> {t("BS জরিপে ভুল হলে আপিল ৩০ দিনের মধ্যে", "Appeal within 30 days of BS survey error")}</li>
                </ul>
              </Card>

              {/* ========== ৭. উত্তরাধিকার / ওয়ারিশ ========== */}
              <Card className="p-5">
                <h3 className="font-display font-bold text-base mb-2 flex items-center gap-2 text-pink-700 dark:text-pink-400">
                  <UserCheck className="w-4 h-4" />
                  {t("৭. উত্তরাধিকার ও বণ্টন", "7. Inheritance & Partition")}
                </h3>
                <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                  <li>{t("ইউনিয়ন পরিষদ/পৌরসভা থেকে ওয়ারিশ সনদ নিন।", "Get heirship certificate from Union Parishad/Municipality.")}</li>
                  <li>{t("সব ওয়ারিশের সম্মতিতে বণ্টননামা দলিল করুন (সাব-রেজিস্ট্রি)।", "Execute Bantonnama deed with all heirs' consent (Sub-Registry).")}</li>
                  <li>{t("বিরোধ থাকলে দেওয়ানি আদালতে আংশিক বণ্টন (Partition Suit)।", "If disputed — Partition Suit in civil court.")}</li>
                  <li>{t("নামজারি প্রত্যেক ওয়ারিশের নামে আলাদাভাবে করুন।", "Mutate separately under each heir's name.")}</li>
                  <li>{t("ইসলামি ফারায়েজ অনুসারে অংশ নির্ধারণ — আমাদের ওয়ারিশ ক্যালকুলেটর দেখুন।", "Calculate Islamic shares — see our Inheritance Calculator.")}</li>
                </ul>
              </Card>

              {/* ========== ৮. বিরোধ মীমাংসা ========== */}
              <Card className="p-5">
                <h3 className="font-display font-bold text-base mb-2 flex items-center gap-2 text-red-700 dark:text-red-400">
                  <Shield className="w-4 h-4" />
                  {t("৮. জমি বিরোধ মীমাংসা", "8. Land Dispute Resolution")}
                </h3>
                <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                  <li><b>{t("গ্রাম আদালত:", "Village Court:")}</b> {t("ছোট বিরোধ — ২ লাখ টাকা পর্যন্ত, ৬০ দিনে নিষ্পত্তি", "Small disputes up to BDT 2L, settled in 60 days")}</li>
                  <li><b>{t("সালিশ:", "Salish:")}</b> {t("স্থানীয় মুরুব্বি/UP চেয়ারম্যানের মাধ্যমে", "Through local elders / UP Chairman")}</li>
                  <li><b>{t("AC Land:", "AC Land:")}</b> {t("রেকর্ড/দখল সংক্রান্ত প্রশাসনিক বিরোধ", "Record/possession admin disputes")}</li>
                  <li><b>{t("দেওয়ানি আদালত:", "Civil Court:")}</b> {t("Title Suit, Partition Suit, Declaration Suit", "Title, Partition, Declaration Suits")}</li>
                  <li><b>{t("Land Survey Tribunal:", "Land Survey Tribunal:")}</b> {t("জরিপ-সংক্রান্ত মামলা", "Survey-related cases")}</li>
                  <li><b>{t("আইনগত সহায়তা:", "Legal Aid:")}</b> {t("জেলা লিগ্যাল এইড অফিস — হটলাইন ১৬৪৩০", "District Legal Aid Office — Hotline 16430")}</li>
                </ul>
              </Card>

              {/* ========== ৯. প্রতারণা থেকে সাবধান ========== */}
              <Card className="p-5 border-red-500/40 bg-red-500/5">
                <h3 className="font-display font-bold text-base mb-2 flex items-center gap-2 text-red-600">
                  <AlertTriangle className="w-4 h-4" />
                  {t("৯. প্রতারণা থেকে সাবধান", "9. Beware of Fraud")}
                </h3>
                <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                  <li>{t("একই জমি একাধিক জনের কাছে বিক্রি (Double Selling) — সাব-রেজিস্ট্রিতে সার্চ করুন।", "Double selling — verify at Sub-Registry.")}</li>
                  <li>{t("ভুয়া দলিল / জাল NID — সরকারি ডাটাবেস থেকে যাচাই।", "Fake deed/NID — verify from govt database.")}</li>
                  <li>{t("খাস জমি বা সরকারি জমি বিক্রি — অবৈধ।", "Selling khas/govt land — illegal.")}</li>
                  <li>{t("দালাল এড়িয়ে সরাসরি অফিসে যান। অনলাইন সেবা বিনামূল্যে।", "Avoid brokers, go to office directly. Online services are free.")}</li>
                  <li>{t("নগদে বড় লেনদেন এড়ান — চেক/ব্যাংক ট্রান্সফার ব্যবহার করুন।", "Avoid cash for big payments — use cheque/bank.")}</li>
                </ul>
              </Card>

              {/* ========== ১০. হেল্পলাইন ========== */}
              <Card className="p-5 bg-primary/5 border-primary/30">
                <h3 className="font-display font-bold text-base mb-2 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-primary" />
                  {t("১০. জরুরি যোগাযোগ", "10. Important Contacts")}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                  <div className="p-2 rounded bg-card border"><b>{t("ভূমি সেবা কল সেন্টার", "Land Service Call Center")}</b><br /><a href="tel:16122" className="text-primary">📞 16122</a></div>
                  <div className="p-2 rounded bg-card border"><b>{t("জাতীয় হেল্পলাইন", "National Helpline")}</b><br /><a href="tel:333" className="text-primary">📞 333</a></div>
                  <div className="p-2 rounded bg-card border"><b>{t("লিগ্যাল এইড", "Legal Aid")}</b><br /><a href="tel:16430" className="text-primary">📞 16430</a></div>
                  <div className="p-2 rounded bg-card border"><b>{t("দুদক হটলাইন (ঘুষ)", "ACC Hotline (bribe)")}</b><br /><a href="tel:106" className="text-primary">📞 106</a></div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {[
                    ["eporcha.gov.bd", "https://eporcha.gov.bd"],
                    ["ldtax.gov.bd", "https://ldtax.gov.bd"],
                    ["mutation.land.gov.bd", "https://mutation.land.gov.bd"],
                    ["land.gov.bd", "https://land.gov.bd"],
                    ["dlrms.land.gov.bd", "https://eservice.dlrms.land.gov.bd"],
                  ].map(([label, url]) => (
                    <a key={url} href={url} target="_blank" rel="noopener noreferrer" className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20">
                      <ExternalLink className="w-3 h-3 inline mr-1" />{label}
                    </a>
                  ))}
                </div>
              </Card>
            </div>
          </TabsContent>


          <TabsContent value="converter">
            <Card className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">{t("পরিমাণ", "Amount")}</label>
                  <Input type="number" value={val} onChange={(e) => setVal(e.target.value)} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">{t("একক", "From unit")}</label>
                  <select value={from} onChange={(e) => setFrom(e.target.value as keyof typeof UNITS)}
                    className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                    {(Object.keys(UNITS) as Array<keyof typeof UNITS>).map((k) => (
                      <option key={k} value={k}>{language === "bn" ? unitLabels[k].bn : unitLabels[k].en}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
                {(Object.keys(UNITS) as Array<keyof typeof UNITS>).map((k) => (
                  <div key={k} className="p-3 rounded-xl bg-muted/50 border">
                    <p className="text-xs text-muted-foreground">{language === "bn" ? unitLabels[k].bn : unitLabels[k].en}</p>
                    <p className="font-display font-bold text-lg">{fmt(baseSqft / UNITS[k])}</p>
                  </div>
                ))}
              </div>

              <div className="text-xs text-muted-foreground border-t pt-3">
                {t(
                  "নোট: কাঠার মাপ অঞ্চলভেদে আলাদা। ১ শতক = ৪৩৫.৬ বর্গফুট, ১ বিঘা = ৩৩ শতক।",
                  "Note: Katha varies by region. 1 Shotok = 435.6 sqft, 1 Bigha = 33 Shotok."
                )}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="services">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {services.map((s) => (
                <a key={s.name} href={s.url} target="_blank" rel="noopener noreferrer"
                   className="flex items-center gap-3 p-4 rounded-xl border bg-card hover:border-primary hover:shadow-elegant transition-smooth">
                  <div className="w-10 h-10 rounded-lg gradient-bg-primary flex items-center justify-center text-white shrink-0">
                    <s.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">{s.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{s.url.replace("https://", "")}</p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-muted-foreground" />
                </a>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="guide">
            <Card className="p-6 space-y-4 text-sm">
              <div>
                <h3 className="font-display font-bold text-base mb-1">{t("খতিয়ান কী?", "What is a Khatian?")}</h3>
                <p className="text-muted-foreground">
                  {t(
                    "জমির মালিকানা ও বিবরণের সরকারি দলিল। CS, SA, RS, BS/মহানগর — বিভিন্ন জরিপের আলাদা খতিয়ান হয়।",
                    "An official record of land ownership. CS, SA, RS, BS/City — different surveys have different khatians."
                  )}
                </p>
              </div>
              <div>
                <h3 className="font-display font-bold text-base mb-1">{t("নামজারি (Mutation)", "Namjari (Mutation)")}</h3>
                <p className="text-muted-foreground">
                  {t("কেনা/উত্তরাধিকার সূত্রে জমির মালিকানা নিজের নামে আনার প্রক্রিয়া। mutation.land.gov.bd-এ আবেদন করা যায়।",
                     "Process of transferring land ownership to your name. Apply at mutation.land.gov.bd.")}
                </p>
              </div>
              <div>
                <h3 className="font-display font-bold text-base mb-1">{t("ভূমি উন্নয়ন কর", "Land Development Tax")}</h3>
                <p className="text-muted-foreground">
                  {t("প্রতি বছর ldtax.gov.bd থেকে অনলাইনে পরিশোধ করা যায়। দাখিলা (রসিদ) সংরক্ষণ করুন।",
                     "Pay yearly online at ldtax.gov.bd. Keep your receipt (Dakhila) safe.")}
                </p>
              </div>
              <div>
                <h3 className="font-display font-bold text-base mb-1">{t("দলিল কয়েক প্রকার", "Deed Types")}</h3>
                <ul className="list-disc pl-5 text-muted-foreground space-y-1">
                  <li>{t("সাফ-কবলা — সাধারণ বিক্রয়", "Saf-Kabla — regular sale")}</li>
                  <li>{t("দান দলিল — উপহার", "Daan — gift deed")}</li>
                  <li>{t("হেবা দলিল — ইসলামী উপহার", "Heba — Islamic gift")}</li>
                  <li>{t("বণ্টননামা — উত্তরাধিকার ভাগ", "Bantonnama — inheritance partition")}</li>
                </ul>
              </div>
              <div>
                <h3 className="font-display font-bold text-base mb-1">{t("দলিল যাচাই করার আগে", "Before buying land")}</h3>
                <ul className="list-disc pl-5 text-muted-foreground space-y-1">
                  <li>{t("খতিয়ান ও দাগ নম্বর মিলিয়ে দেখুন", "Verify Khatian & Dag number")}</li>
                  <li>{t("CS, SA, RS, BS — সব সিরিজ মিলান", "Check all CS, SA, RS, BS records")}</li>
                  <li>{t("খাজনা/কর হালনাগাদ আছে কি না", "Tax up-to-date?")}</li>
                  <li>{t("ব্যাংক বা মামলা বন্ধক নেই কি না", "Free of mortgage/case?")}</li>
                  <li>{t("বিক্রেতার NID ও মালিকানা প্রমাণ", "Seller NID & ownership proof")}</li>
                </ul>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
};

export default LandSurvey;
