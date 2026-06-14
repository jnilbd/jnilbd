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

        <Tabs defaultValue="converter">
          <TabsList className="grid grid-cols-3 w-full mb-4">
            <TabsTrigger value="converter"><Calculator className="w-4 h-4 mr-1.5" />{t("কনভার্টার", "Converter")}</TabsTrigger>
            <TabsTrigger value="services"><Landmark className="w-4 h-4 mr-1.5" />{t("সেবা", "Services")}</TabsTrigger>
            <TabsTrigger value="guide"><FileText className="w-4 h-4 mr-1.5" />{t("গাইড", "Guide")}</TabsTrigger>
          </TabsList>

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
