import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Calculator,
  Receipt,
  AlertCircle,
  Package,
  BookOpen,
  Building2,
  ShieldCheck,
  FileText,
  Landmark,
  Lightbulb,
  TrendingUp,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/contexts/LanguageContext";

// ===================== Income Tax — FY 2024-25 =====================
const SLABS = [
  { upto: 350000, rate: 0 },
  { upto: 100000, rate: 0.05 },
  { upto: 400000, rate: 0.10 },
  { upto: 500000, rate: 0.15 },
  { upto: 500000, rate: 0.20 },
  { upto: Infinity, rate: 0.25 },
];

const THRESHOLDS = {
  general: 350000,
  female: 400000,
  senior: 400000,
  disabled: 475000,
  freedomFighter: 500000,
};

// ===================== Product VAT / Tax presets (Bangladesh, indicative) =====================
// Standard VAT in Bangladesh = 15%. Many goods/services have reduced rates (5%, 7.5%, 10%).
// Supplementary Duty (SD) and Customs Duty (CD) apply to specific goods, especially imports.
const PRODUCT_PRESETS: Array<{
  key: string;
  bn: string;
  en: string;
  vat: number;
  sd?: number;
  cd?: number;
  ait?: number;
  note?: string;
}> = [
  { key: "general", bn: "সাধারণ পণ্য/সেবা", en: "General Goods/Services", vat: 15 },
  { key: "restaurant_ac", bn: "এসি রেস্তোরাঁ", en: "AC Restaurant", vat: 10 },
  { key: "restaurant_nonac", bn: "নন-এসি রেস্তোরাঁ", en: "Non-AC Restaurant", vat: 5 },
  { key: "ecommerce", bn: "ই-কমার্স", en: "E-commerce", vat: 5 },
  { key: "ride_share", bn: "রাইড শেয়ারিং", en: "Ride Sharing", vat: 5 },
  { key: "internet", bn: "ইন্টারনেট সেবা", en: "Internet Service", vat: 5 },
  { key: "mobile", bn: "মোবাইল কল/ডেটা", en: "Mobile (Call/Data)", vat: 15, sd: 20, note: "SD + 1% Surcharge" },
  { key: "electronics", bn: "ইলেকট্রনিক্স (আমদানি)", en: "Electronics (Imported)", vat: 15, cd: 25, sd: 10, ait: 5 },
  { key: "car", bn: "প্রাইভেট কার (১৫০০cc)", en: "Private Car (≤1500cc)", vat: 15, cd: 25, sd: 30, ait: 5 },
  { key: "cosmetics", bn: "কসমেটিক্স", en: "Cosmetics", vat: 15, sd: 20 },
  { key: "tobacco", bn: "সিগারেট/তামাক", en: "Cigarette/Tobacco", vat: 15, sd: 65 },
  { key: "medicine", bn: "ওষুধ (দেশীয়)", en: "Medicine (Local)", vat: 2.4 },
  { key: "books", bn: "বই", en: "Books", vat: 0, note: "VAT Exempted" },
  { key: "construction", bn: "নির্মাণ ফার্ম", en: "Construction Firm", vat: 7.5 },
  { key: "transport", bn: "পরিবহন ঠিকাদার", en: "Transport Contractor", vat: 5 },
  { key: "consultancy", bn: "কনসালট্যান্সি/ফার্ম", en: "Consultancy/Legal", vat: 15 },
  { key: "saas", bn: "সফটওয়্যার/SaaS (আমদানি)", en: "Software/SaaS (Import)", vat: 15, ait: 10 },
  { key: "rent", bn: "অফিস ভাড়া", en: "Office Rent", vat: 15 },
  { key: "freight", bn: "ফ্রেইট ফরওয়ার্ডার", en: "Freight Forwarder", vat: 15 },
];

const TaxCalc = () => {
  const { language } = useLanguage();
  const t = (bn: string, en: string) => (language === "bn" ? bn : en);

  // ---------- Income tax state ----------
  const [income, setIncome] = useState("600000");
  const [category, setCategory] = useState<keyof typeof THRESHOLDS>("general");
  const [investment, setInvestment] = useState("0");

  const result = useMemo(() => {
    const annualIncome = parseFloat(income) || 0;
    const inv = parseFloat(investment) || 0;
    const baseExempt = THRESHOLDS[category];
    const slabs = [...SLABS];
    slabs[0] = { upto: baseExempt, rate: 0 };

    let remaining = annualIncome;
    let tax = 0;
    const breakdown: Array<{ from: number; to: number; rate: number; tax: number }> = [];
    let cursor = 0;
    for (const slab of slabs) {
      if (remaining <= 0) break;
      const slice = Math.min(slab.upto, remaining);
      const slabTax = slice * slab.rate;
      tax += slabTax;
      breakdown.push({ from: cursor, to: cursor + slice, rate: slab.rate, tax: slabTax });
      cursor += slice;
      remaining -= slice;
    }
    const maxRebateBase = Math.min(inv, annualIncome * 0.2, 10_000_000);
    const rebate = maxRebateBase * 0.15;
    const finalTax = Math.max(0, tax - rebate);
    const minTax = annualIncome > baseExempt ? 5000 : 0;
    const payable = Math.max(finalTax, minTax);
    return { annualIncome, baseExempt, tax, rebate, finalTax, minTax, payable, breakdown };
  }, [income, category, investment]);

  // ---------- Product VAT/Tax state ----------
  const [presetKey, setPresetKey] = useState("general");
  const [productPrice, setProductPrice] = useState("1000");
  const [customVat, setCustomVat] = useState("");
  const [customSd, setCustomSd] = useState("");
  const [customCd, setCustomCd] = useState("");
  const [customAit, setCustomAit] = useState("");
  const [priceMode, setPriceMode] = useState<"exclusive" | "inclusive">("exclusive");

  const productResult = useMemo(() => {
    const preset = PRODUCT_PRESETS.find((p) => p.key === presetKey) || PRODUCT_PRESETS[0];
    const vat = customVat !== "" ? parseFloat(customVat) : preset.vat;
    const sd = customSd !== "" ? parseFloat(customSd) : preset.sd || 0;
    const cd = customCd !== "" ? parseFloat(customCd) : preset.cd || 0;
    const ait = customAit !== "" ? parseFloat(customAit) : preset.ait || 0;
    const price = parseFloat(productPrice) || 0;

    // For imports: CD on assessable value -> + SD -> + VAT -> + AIT
    // Simplified cascading model
    let base = price;
    let totalTax = 0;
    let cdAmt = 0, sdAmt = 0, vatAmt = 0, aitAmt = 0, finalPrice = 0;

    if (priceMode === "exclusive") {
      cdAmt = (base * cd) / 100;
      const afterCd = base + cdAmt;
      sdAmt = (afterCd * sd) / 100;
      const afterSd = afterCd + sdAmt;
      vatAmt = (afterSd * vat) / 100;
      const afterVat = afterSd + vatAmt;
      aitAmt = (base * ait) / 100; // AIT on assessable / base
      totalTax = cdAmt + sdAmt + vatAmt + aitAmt;
      finalPrice = afterVat + aitAmt;
    } else {
      // Reverse: extract VAT from gross price (only VAT for simplicity)
      vatAmt = (base * vat) / (100 + vat);
      finalPrice = base;
      base = base - vatAmt;
      totalTax = vatAmt;
    }

    const effective = price > 0 ? (totalTax / price) * 100 : 0;
    return { preset, vat, sd, cd, ait, base, cdAmt, sdAmt, vatAmt, aitAmt, totalTax, finalPrice, effective };
  }, [presetKey, productPrice, customVat, customSd, customCd, customAit, priceMode]);

  const fmt = (n: number) => "৳ " + n.toLocaleString("en-IN", { maximumFractionDigits: 2 });

  return (
    <div className="container py-8 max-w-5xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-3">
            <Receipt className="w-3.5 h-3.5" />
            {t("ট্যাক্স ও ভ্যাট সেন্টার — বাংলাদেশ", "Tax & VAT Center — Bangladesh")}
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold mb-2">
            {t("ট্যাক্স ক্যালকুলেটর ও গাইডলাইন", "Tax Calculator & Guidelines")}
          </h1>
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
            {t(
              "ব্যক্তিগত আয়কর, পণ্য/সেবার ভ্যাট, ট্যাক্স পরিশোধ পদ্ধতি ও ব্যবসায়িক ট্যাক্স গাইডলাইন — এক জায়গায়।",
              "Personal income tax, product/service VAT, payment process & business tax guidelines — all in one place."
            )}
          </p>
        </div>

        <Tabs defaultValue="income" className="w-full">
          <TabsList className="grid grid-cols-2 md:grid-cols-5 w-full h-auto">
            <TabsTrigger value="income" className="text-xs md:text-sm"><Calculator className="w-3.5 h-3.5 mr-1" />{t("আয়কর", "Income")}</TabsTrigger>
            <TabsTrigger value="product" className="text-xs md:text-sm"><Package className="w-3.5 h-3.5 mr-1" />{t("পণ্য ভ্যাট", "Product VAT")}</TabsTrigger>
            <TabsTrigger value="payment" className="text-xs md:text-sm"><Landmark className="w-3.5 h-3.5 mr-1" />{t("পরিশোধ", "Payment")}</TabsTrigger>
            <TabsTrigger value="guide" className="text-xs md:text-sm"><BookOpen className="w-3.5 h-3.5 mr-1" />{t("গাইডলাইন", "Guidelines")}</TabsTrigger>
            <TabsTrigger value="vat" className="text-xs md:text-sm"><FileText className="w-3.5 h-3.5 mr-1" />{t("ভ্যাট তথ্য", "VAT Info")}</TabsTrigger>
          </TabsList>

          {/* ============== INCOME TAX ============== */}
          <TabsContent value="income" className="mt-4 space-y-4">
            <Card className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">{t("বার্ষিক করযোগ্য আয় (৳)", "Annual taxable income (BDT)")}</label>
                <Input type="number" value={income} onChange={(e) => setIncome(e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">{t("ক্যাটাগরি", "Category")}</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {([
                    ["general", "সাধারণ পুরুষ", "General Male"],
                    ["female", "নারী/৬৫+", "Female / 65+"],
                    ["senior", "প্রবীণ ৬৫+", "Senior 65+"],
                    ["disabled", "প্রতিবন্ধী", "Disabled"],
                    ["freedomFighter", "মুক্তিযোদ্ধা", "Freedom Fighter"],
                  ] as Array<[keyof typeof THRESHOLDS, string, string]>).map(([k, bn, en]) => (
                    <button key={k} onClick={() => setCategory(k)}
                      className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-smooth ${category === k ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/50"}`}>
                      {language === "bn" ? bn : en}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">{t("বিনিয়োগ/সঞ্চয়পত্র (রেবেট-যোগ্য)", "Eligible investment (for rebate)")}</label>
                <Input type="number" value={investment} onChange={(e) => setInvestment(e.target.value)} />
              </div>
            </Card>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Card className="p-4 text-center">
                <p className="text-xs text-muted-foreground">{t("আয়কর (স্ল্যাব)", "Tax (slabs)")}</p>
                <p className="text-2xl font-display font-bold">{fmt(result.tax)}</p>
              </Card>
              <Card className="p-4 text-center">
                <p className="text-xs text-muted-foreground">{t("রেবেট", "Rebate")}</p>
                <p className="text-2xl font-display font-bold text-green-600">−{fmt(result.rebate)}</p>
              </Card>
              <Card className="p-4 text-center bg-primary/5 border-primary/30">
                <p className="text-xs text-muted-foreground">{t("প্রদেয় কর", "Payable Tax")}</p>
                <p className="text-2xl font-display font-bold gradient-text">{fmt(result.payable)}</p>
              </Card>
            </div>

            <Card className="p-5">
              <h3 className="font-display font-bold mb-2 flex items-center gap-2"><Calculator className="w-4 h-4" />{t("স্ল্যাব ব্রেকডাউন", "Slab Breakdown")}</h3>
              <div className="space-y-1.5 text-sm">
                {result.breakdown.map((b, i) => (
                  <div key={i} className="flex justify-between border-b last:border-0 pb-1">
                    <span className="text-muted-foreground">{fmt(b.from)} – {fmt(b.to)} @ {(b.rate * 100).toFixed(0)}%</span>
                    <span className="font-semibold">{fmt(b.tax)}</span>
                  </div>
                ))}
                {result.minTax > 0 && result.finalTax < result.minTax && (
                  <p className="text-xs text-amber-600 mt-2">
                    {t("সর্বনিম্ন কর প্রযোজ্য (সিটি কর্পোরেশন): ৳ ৫,০০০", "Minimum tax applies (City Corporation): ৳ 5,000")}
                  </p>
                )}
              </div>
            </Card>
          </TabsContent>

          {/* ============== PRODUCT VAT/TAX ============== */}
          <TabsContent value="product" className="mt-4 space-y-4">
            <Card className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">{t("পণ্য/সেবার ধরন", "Product/Service Type")}</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-64 overflow-auto">
                  {PRODUCT_PRESETS.map((p) => (
                    <button key={p.key}
                      onClick={() => { setPresetKey(p.key); setCustomVat(""); setCustomSd(""); setCustomCd(""); setCustomAit(""); }}
                      className={`px-3 py-2 rounded-lg text-xs font-semibold border text-left transition-smooth ${presetKey === p.key ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/50"}`}>
                      <div>{language === "bn" ? p.bn : p.en}</div>
                      <div className="text-[10px] text-muted-foreground font-normal mt-0.5">
                        VAT {p.vat}% {p.sd ? `· SD ${p.sd}%` : ""} {p.cd ? `· CD ${p.cd}%` : ""}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">{t("পণ্যের মূল্য (৳)", "Product Price (BDT)")}</label>
                  <Input type="number" value={productPrice} onChange={(e) => setProductPrice(e.target.value)} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">{t("মূল্যের ধরন", "Price Mode")}</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => setPriceMode("exclusive")}
                      className={`px-3 py-2 rounded-lg text-xs font-semibold border ${priceMode === "exclusive" ? "border-primary bg-primary/10 text-primary" : "border-border"}`}>
                      {t("ভ্যাট ছাড়া", "Excl. VAT")}
                    </button>
                    <button onClick={() => setPriceMode("inclusive")}
                      className={`px-3 py-2 rounded-lg text-xs font-semibold border ${priceMode === "inclusive" ? "border-primary bg-primary/10 text-primary" : "border-border"}`}>
                      {t("ভ্যাট সহ", "Incl. VAT")}
                    </button>
                  </div>
                </div>
              </div>

              <details className="text-sm">
                <summary className="cursor-pointer font-semibold text-primary">{t("কাস্টম রেট (ঐচ্ছিক)", "Custom rates (optional)")}</summary>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3">
                  <div><label className="text-xs">VAT %</label><Input type="number" value={customVat} placeholder={String(productResult.preset.vat)} onChange={(e) => setCustomVat(e.target.value)} /></div>
                  <div><label className="text-xs">SD %</label><Input type="number" value={customSd} placeholder={String(productResult.preset.sd || 0)} onChange={(e) => setCustomSd(e.target.value)} /></div>
                  <div><label className="text-xs">CD %</label><Input type="number" value={customCd} placeholder={String(productResult.preset.cd || 0)} onChange={(e) => setCustomCd(e.target.value)} /></div>
                  <div><label className="text-xs">AIT %</label><Input type="number" value={customAit} placeholder={String(productResult.preset.ait || 0)} onChange={(e) => setCustomAit(e.target.value)} /></div>
                </div>
              </details>
            </Card>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Card className="p-4 text-center"><p className="text-xs text-muted-foreground">{t("কাস্টমস ডিউটি", "Customs Duty")}</p><p className="text-lg font-bold">{fmt(productResult.cdAmt)}</p></Card>
              <Card className="p-4 text-center"><p className="text-xs text-muted-foreground">{t("সম্পূরক শুল্ক", "Supp. Duty")}</p><p className="text-lg font-bold">{fmt(productResult.sdAmt)}</p></Card>
              <Card className="p-4 text-center"><p className="text-xs text-muted-foreground">{t("ভ্যাট", "VAT")}</p><p className="text-lg font-bold">{fmt(productResult.vatAmt)}</p></Card>
              <Card className="p-4 text-center"><p className="text-xs text-muted-foreground">{t("অগ্রিম আয়কর", "Advance IT")}</p><p className="text-lg font-bold">{fmt(productResult.aitAmt)}</p></Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Card className="p-4 text-center"><p className="text-xs text-muted-foreground">{t("মোট কর", "Total Tax")}</p><p className="text-2xl font-display font-bold text-orange-600">{fmt(productResult.totalTax)}</p></Card>
              <Card className="p-4 text-center bg-primary/5 border-primary/30"><p className="text-xs text-muted-foreground">{t("চূড়ান্ত মূল্য", "Final Price")}</p><p className="text-2xl font-display font-bold gradient-text">{fmt(productResult.finalPrice)}</p></Card>
              <Card className="p-4 text-center"><p className="text-xs text-muted-foreground">{t("কার্যকর কর হার", "Effective Tax Rate")}</p><p className="text-2xl font-display font-bold">{productResult.effective.toFixed(2)}%</p></Card>
            </div>

            <Card className="p-5">
              <h3 className="font-bold mb-2 flex items-center gap-2"><Lightbulb className="w-4 h-4 text-yellow-500" />{t("কীভাবে হিসাব হয়?", "How it's calculated")}</h3>
              <ol className="list-decimal list-inside text-sm space-y-1 text-muted-foreground">
                <li>{t("আমদানিকৃত পণ্যে প্রথমে কাস্টমস ডিউটি (CD) যোগ হয় অ্যাসেসেবল ভ্যালুর উপর।", "Imported goods: Customs Duty (CD) is applied on assessable value first.")}</li>
                <li>{t("এরপর সম্পূরক শুল্ক (SD) যোগ হয় (CD সহ মূল্যের উপর)।", "Then Supplementary Duty (SD) on (value + CD).")}</li>
                <li>{t("তারপর ভ্যাট (VAT) যোগ হয় (CD + SD সহ মূল্যের উপর)।", "Then VAT on (value + CD + SD).")}</li>
                <li>{t("অগ্রিম আয়কর (AIT) সাধারণত মূল মূল্যের উপর ৫% হারে আমদানিতে প্রযোজ্য।", "Advance Income Tax (AIT) ~5% on assessable value for imports.")}</li>
                <li>{t("দেশীয় সেবা/পণ্যে শুধু VAT (এবং কিছু ক্ষেত্রে SD) প্রযোজ্য।", "Local services/goods: only VAT (and SD in some cases).")}</li>
              </ol>
            </Card>
          </TabsContent>

          {/* ============== PAYMENT GUIDE ============== */}
          <TabsContent value="payment" className="mt-4 space-y-4">
            <Card className="p-6">
              <h2 className="text-xl font-display font-bold mb-3 flex items-center gap-2">
                <Landmark className="w-5 h-5 text-primary" />
                {t("ট্যাক্স পরিশোধের সম্পূর্ণ গাইডলাইন", "Complete Tax Payment Guide")}
              </h2>
              <div className="space-y-4 text-sm">
                <div>
                  <h3 className="font-bold mb-1">{t("১. TIN রেজিস্ট্রেশন", "1. TIN Registration")}</h3>
                  <p className="text-muted-foreground">{t(
                    "প্রথমে NBR এর e-TIN পোর্টালে (secure.incometax.gov.bd) গিয়ে বিনামূল্যে ১২-ডিজিট TIN নিন। জাতীয় পরিচয়পত্র, মোবাইল নম্বর ও ইমেইল লাগবে।",
                    "Visit NBR e-TIN portal (secure.incometax.gov.bd) and obtain a free 12-digit TIN. Need NID, mobile, and email."
                  )}</p>
                </div>
                <div>
                  <h3 className="font-bold mb-1">{t("২. রিটার্ন ফাইলিং সময়সীমা", "2. Return Filing Deadline")}</h3>
                  <p className="text-muted-foreground">{t(
                    "ব্যক্তি: ১ জুলাই – ৩০ নভেম্বর (Tax Day)। কোম্পানি: অর্থবছর শেষ হওয়ার ৬ মাসের মধ্যে। বিলম্ব ফি ও সুদ এড়াতে সময়মতো ফাইল করুন।",
                    "Individuals: 1 July – 30 November (Tax Day). Companies: within 6 months of FY end. File on time to avoid penalty & interest."
                  )}</p>
                </div>
                <div>
                  <h3 className="font-bold mb-1">{t("৩. অনলাইন রিটার্ন (e-Return)", "3. Online Return (e-Return)")}</h3>
                  <p className="text-muted-foreground">{t(
                    "etaxnbr.gov.bd এ লগইন করে IT-11GA ফর্ম পূরণ করুন। আয়, সম্পদ-দায়, বিনিয়োগ — সব তথ্য দিন। পাসওয়ার্ড OTP-এর মাধ্যমে যাচাই।",
                    "Login to etaxnbr.gov.bd and fill IT-11GA. Provide income, asset-liability, investment details. OTP-based verification."
                  )}</p>
                </div>
                <div>
                  <h3 className="font-bold mb-1">{t("৪. পেমেন্ট মাধ্যম (A-Challan)", "4. Payment Methods (A-Challan)")}</h3>
                  <ul className="list-disc list-inside text-muted-foreground space-y-0.5">
                    <li>{t("ব্যাংকে A-Challan (সোনালী, জনতা, রূপালী, অগ্রণী ইত্যাদি)", "A-Challan in bank (Sonali, Janata, Rupali, Agrani, etc.)")}</li>
                    <li>{t("অনলাইন: ipayment.bb.org.bd, ekarbd.org", "Online: ipayment.bb.org.bd, ekarbd.org")}</li>
                    <li>{t("মোবাইল ব্যাংকিং: bKash, Nagad, Rocket এর মাধ্যমে A-Challan", "Mobile Banking: A-Challan via bKash, Nagad, Rocket")}</li>
                    <li>{t("ডেবিট/ক্রেডিট কার্ড — e-Payment গেটওয়ে", "Debit/Credit card via e-Payment gateway")}</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-bold mb-1">{t("৫. প্রয়োজনীয় ডকুমেন্ট", "5. Required Documents")}</h3>
                  <ul className="list-disc list-inside text-muted-foreground space-y-0.5">
                    <li>{t("বেতন সার্টিফিকেট / বেতন-স্লিপ", "Salary certificate / Pay slips")}</li>
                    <li>{t("ব্যাংক স্টেটমেন্ট (সকল হিসাব)", "Bank statements (all accounts)")}</li>
                    <li>{t("সঞ্চয়পত্র, FDR, DPS এর কপি", "Sanchayapatra, FDR, DPS copies")}</li>
                    <li>{t("সম্পত্তির দলিল, গাড়ির রেজিস্ট্রেশন", "Property deeds, vehicle registration")}</li>
                    <li>{t("পূর্ববর্তী বছরের রিটার্নের কপি", "Previous year return copy")}</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-bold mb-1">{t("৬. PSR (Proof of Submission Return)", "6. PSR (Proof of Submission of Return)")}</h3>
                  <p className="text-muted-foreground">{t(
                    "৪৩টি সেবার জন্য PSR বাধ্যতামূলক — যেমন: গাড়ি কেনা, ক্রেডিট কার্ড, ট্রেড লাইসেন্স নবায়ন, ব্যাংক ঋণ ২০ লাখের বেশি, ৫ লাখের বেশি জমির রেজিস্ট্রেশন ইত্যাদি।",
                    "PSR is mandatory for 43 services — car purchase, credit card, trade license renewal, bank loan >20L, land registration >5L etc."
                  )}</p>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* ============== GUIDELINES ============== */}
          <TabsContent value="guide" className="mt-4 space-y-4">
            <Card className="p-6">
              <h2 className="text-xl font-display font-bold mb-3 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-green-600" />
                {t("ব্যক্তির জন্য ট্যাক্স টিপস", "Personal Tax Tips")}
              </h2>
              <ul className="space-y-2 text-sm">
                {[
                  ["সঞ্চয়পত্র, DPS, FDR, জীবন বীমায় বিনিয়োগ করে ১৫% রেবেট নিন (সর্বোচ্চ ২০% করযোগ্য আয় বা ১ কোটি)।", "Invest in Sanchayapatra, DPS, FDR, Life Insurance for 15% rebate (up to 20% of taxable income or 1Cr)."],
                  ["ZIS/Zakat, দান-অনুদান কর-ছাড়ের আওতায় আনুন।", "Charitable donations / Zakat can be tax deductible."],
                  ["EPF/CPF, প্রভিডেন্ট ফান্ডে কন্ট্রিবিউট করুন — দ্বৈত সুবিধা।", "Contribute to EPF/Provident Fund — double benefit."],
                  ["সম্পদ বিবরণী (IT-10B) সঠিকভাবে পূরণ করুন — গরমিল থাকলে পেনাল্টি।", "Fill Statement of Assets (IT-10B) accurately — mismatch leads to penalty."],
                  ["কর-মুক্ত আয় (কৃষি, রপ্তানি ইত্যাদি) আলাদা দেখান।", "Show tax-free income (agriculture, export etc.) separately."],
                  ["প্রতি বছর সময়মতো রিটার্ন দিন — দেরিতে ফাইল করলে মাসিক ২% সুদ।", "File returns on time — late filing incurs 2% monthly interest."],
                  ["ই-চালান রসিদ অন্তত ৬ বছর সংরক্ষণ করুন।", "Keep e-challan receipts at least for 6 years."],
                ].map(([bn, en], i) => (
                  <li key={i} className="flex gap-2"><span className="text-primary">✓</span><span>{t(bn, en)}</span></li>
                ))}
              </ul>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-display font-bold mb-3 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary" />
                {t("কোম্পানির জন্য ট্যাক্স গাইডলাইন", "Company Tax Guidelines")}
              </h2>
              <div className="space-y-3 text-sm">
                <div>
                  <h4 className="font-semibold mb-1">{t("কর্পোরেট ট্যাক্স রেট (FY 2024-25)", "Corporate Tax Rates (FY 2024-25)")}</h4>
                  <ul className="list-disc list-inside text-muted-foreground space-y-0.5">
                    <li>{t("পাবলিক লিমিটেড (তালিকাভুক্ত): ২২.৫%", "Public Listed: 22.5%")}</li>
                    <li>{t("নন-লিস্টেড কোম্পানি: ২৭.৫%", "Non-Listed Company: 27.5%")}</li>
                    <li>{t("ওয়ান পার্সন কোম্পানি (OPC): ২২.৫%", "One Person Company (OPC): 22.5%")}</li>
                    <li>{t("ব্যাংক/বীমা/NBFI (লিস্টেড): ৩৭.৫%, নন-লিস্টেড: ৪০%", "Bank/Insurance/NBFI listed: 37.5%, non-listed: 40%")}</li>
                    <li>{t("সিগারেট/তামাক কোম্পানি: ৪৫%", "Tobacco companies: 45%")}</li>
                    <li>{t("টেলিকম/মোবাইল অপারেটর: ৪৫% (লিস্টেড ৪০%)", "Telecom/Mobile operator: 45% (listed 40%)")}</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">{t("সুবিধাজনক পদক্ষেপ", "Best Practices")}</h4>
                  <ul className="list-disc list-inside text-muted-foreground space-y-0.5">
                    <li>{t("BIN (VAT রেজিস্ট্রেশন) নিন যদি বার্ষিক টার্নওভার ৩ কোটির বেশি।", "Take BIN (VAT registration) if annual turnover > 3Cr.")}</li>
                    <li>{t("Mushak-6.3 চালান ইস্যু করুন প্রতিটি বিক্রয়ে।", "Issue Mushak-6.3 invoice on every sale.")}</li>
                    <li>{t("মাসিক VAT রিটার্ন (Mushak-9.1) ১৫ তারিখের মধ্যে দাখিল।", "Submit monthly VAT return (Mushak-9.1) by 15th.")}</li>
                    <li>{t("Withholding Tax (উৎসে কর) সঠিকভাবে কাটুন ও জমা দিন।", "Deduct & deposit Withholding Tax (TDS) correctly.")}</li>
                    <li>{t("অডিটেড আর্থিক প্রতিবেদন (CA Firm) তৈরি করুন।", "Prepare audited financial statements (CA firm).")}</li>
                    <li>{t("Transfer Pricing ডকুমেন্টেশন রাখুন (যদি বিদেশি লেনদেন থাকে)।", "Maintain Transfer Pricing docs (if foreign transactions).")}</li>
                    <li>{t("সকল ব্যয়ের সমর্থনে চালান/রসিদ রাখুন (Allowable expense)।", "Keep invoices for all expenses (Allowable expense).")}</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-1 text-red-600">{t("যেগুলো এড়াবেন (Penalty)", "Avoid These (Penalty)")}</h4>
                  <ul className="list-disc list-inside text-muted-foreground space-y-0.5">
                    <li>{t("VAT রিটার্ন দেরি — ১০,০০০ টাকা + ২% মাসিক সুদ।", "Late VAT return — BDT 10,000 + 2% monthly interest.")}</li>
                    <li>{t("ভুয়া চালান — ফাঁকি দেওয়া করের ২ গুণ জরিমানা।", "Fake invoice — 2x penalty on evaded tax.")}</li>
                    <li>{t("TIN ছাড়া বড় লেনদেন — ব্যাংক/সরকারি সেবা ব্লক।", "Large transactions without TIN — bank/govt services blocked.")}</li>
                    <li>{t("আয় গোপন — ৫০% জরিমানা + ফৌজদারি মামলা।", "Hiding income — 50% penalty + criminal proceedings.")}</li>
                  </ul>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-display font-bold mb-3 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                {t("সচেতনতা ও জরুরি তথ্য", "Awareness & Key Info")}
              </h2>
              <ul className="space-y-2 text-sm">
                {[
                  ["কর প্রদান নাগরিক দায়িত্ব — শিক্ষা, স্বাস্থ্য, অবকাঠামোর তহবিল আসে এখান থেকে।", "Paying tax is a civic duty — funds education, health, infrastructure."],
                  ["TIN থাকা মানেই রিটার্ন দিতে হবে — না দিলে PSR পাবেন না।", "Having a TIN means you must file a return — otherwise no PSR."],
                  ["ভুয়া তথ্য / সম্পদ গোপন বড় অপরাধ — Money Laundering Act এ মামলা হতে পারে।", "Hiding wealth is a serious crime — Money Laundering Act applies."],
                  ["NBR Helpline: 09666-733-555 | ই-মেইল: info@nbr.gov.bd", "NBR Helpline: 09666-733-555 | Email: info@nbr.gov.bd"],
                  ["ভ্যাট হেল্পলাইন: 16555 (১২ ঘন্টা সেবা)।", "VAT Helpline: 16555 (12-hour service)."],
                  ["প্রতারক থেকে সাবধান — NBR কখনো ফোনে OTP বা পাসওয়ার্ড চায় না।", "Beware of scams — NBR never asks OTP or password by phone."],
                ].map(([bn, en], i) => (
                  <li key={i} className="flex gap-2"><span className="text-amber-500">★</span><span>{t(bn, en)}</span></li>
                ))}
              </ul>
            </Card>
          </TabsContent>

          {/* ============== VAT INFO ============== */}
          <TabsContent value="vat" className="mt-4 space-y-4">
            <Card className="p-6">
              <h2 className="text-xl font-display font-bold mb-3 flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                {t("ভ্যাট (VAT) সম্পূর্ণ তথ্য — বাংলাদেশ", "VAT Complete Information — Bangladesh")}
              </h2>
              <div className="space-y-4 text-sm">
                <div>
                  <h3 className="font-bold mb-1">{t("ভ্যাট কী?", "What is VAT?")}</h3>
                  <p className="text-muted-foreground">{t(
                    "মূল্য সংযোজন কর (Value Added Tax) — পণ্য ও সেবার উপর প্রযোজ্য পরোক্ষ কর। বাংলাদেশে আদর্শ হার ১৫%। ভ্যাট আইন, ২০১২ অনুসারে পরিচালিত।",
                    "Indirect tax on value added to goods/services. Standard rate in Bangladesh is 15%. Governed by VAT Act, 2012."
                  )}</p>
                </div>

                <div>
                  <h3 className="font-bold mb-1">{t("ভ্যাট রেট (সংক্ষিপ্ত)", "VAT Rates (Quick)")}</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs border-collapse">
                      <thead><tr className="bg-muted"><th className="p-2 text-left">{t("খাত", "Sector")}</th><th className="p-2 text-left">{t("হার", "Rate")}</th></tr></thead>
                      <tbody>
                        {[
                          ["সাধারণ পণ্য/সেবা", "General Goods/Services", "15%"],
                          ["এসি রেস্তোরাঁ", "AC Restaurant", "10%"],
                          ["নন-এসি রেস্তোরাঁ / ই-কমার্স", "Non-AC Restaurant / E-commerce", "5%"],
                          ["নির্মাণ ফার্ম", "Construction Firm", "7.5%"],
                          ["ওষুধ (দেশীয়)", "Medicine (Local)", "2.4%"],
                          ["বই, পত্রিকা, কৃষিপণ্য", "Books, Newspapers, Agro-products", "0% (Exempt)"],
                          ["আমদানি পণ্য", "Imported Goods", "15% + SD + CD"],
                        ].map(([bn, en, r], i) => (
                          <tr key={i} className="border-b"><td className="p-2">{language === "bn" ? bn : en}</td><td className="p-2 font-semibold">{r}</td></tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold mb-1">{t("BIN ও মুশক ফর্ম", "BIN & Mushak Forms")}</h3>
                  <ul className="list-disc list-inside text-muted-foreground space-y-0.5">
                    <li><b>BIN</b> — {t("ব্যবসা সনাক্তকরণ নম্বর (vatonline.gov.bd এ আবেদন)।", "Business Identification Number (apply at vatonline.gov.bd).")}</li>
                    <li><b>Mushak-6.3</b> — {t("কর চালান (Tax invoice) প্রতি বিক্রয়ে।", "Tax invoice for every sale.")}</li>
                    <li><b>Mushak-6.1</b> — {t("ক্রয়-বিক্রয় হিসাব।", "Purchase-Sales register.")}</li>
                    <li><b>Mushak-9.1</b> — {t("মাসিক ভ্যাট রিটার্ন (প্রতি মাসের ১৫ তারিখের মধ্যে)।", "Monthly VAT return (by 15th of next month).")}</li>
                    <li><b>Mushak-4.3</b> — {t("টার্নওভার ভ্যাট (Turnover tax) — ছোট ব্যবসা।", "Turnover tax — small businesses.")}</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-bold mb-1">{t("ইনপুট ট্যাক্স ক্রেডিট (ITC)", "Input Tax Credit (ITC)")}</h3>
                  <p className="text-muted-foreground">{t(
                    "ক্রয়ের সময় প্রদত্ত ভ্যাট বিক্রয়ের ভ্যাট থেকে বাদ দিয়ে নিট ভ্যাট জমা দিতে হয়। সঠিক Mushak-6.3 চালান ছাড়া ITC দাবি করা যাবে না।",
                    "VAT paid on purchase can be deducted from VAT on sales. ITC cannot be claimed without proper Mushak-6.3 invoice."
                  )}</p>
                </div>

                <div>
                  <h3 className="font-bold mb-1">{t("ভ্যাট-মুক্ত পণ্য", "VAT-Exempt Items")}</h3>
                  <p className="text-muted-foreground">{t(
                    "চাল, ডাল, আটা, সবজি, কাঁচা মাছ-মাংস, দুধ, ডিম, শিক্ষাসামগ্রী, বই, ওষুধের কাঁচামাল, কৃষি যন্ত্রপাতি ইত্যাদি ভ্যাট-মুক্ত।",
                    "Rice, lentils, flour, vegetables, raw meat/fish, milk, eggs, educational materials, books, pharma raw materials, agro machinery are VAT exempt."
                  )}</p>
                </div>

                <div>
                  <h3 className="font-bold mb-1">{t("ই-ভ্যাট সিস্টেম", "e-VAT System")}</h3>
                  <p className="text-muted-foreground">{t(
                    "vatonline.gov.bd এ অনলাইনে BIN, রিটার্ন, পেমেন্ট সব সম্ভব। EFD/SDC (Electronic Fiscal Device) ব্যবহার বাধ্যতামূলক বড় দোকান/রেস্তোরাঁয়।",
                    "All BIN, returns, payments online at vatonline.gov.bd. EFD/SDC mandatory for big shops/restaurants."
                  )}</p>
                </div>

                <div>
                  <h3 className="font-bold mb-1 text-red-600">{t("ভ্যাট ফাঁকির শাস্তি", "Penalty for VAT Evasion")}</h3>
                  <ul className="list-disc list-inside text-muted-foreground space-y-0.5">
                    <li>{t("ফাঁকি দেওয়া ভ্যাটের সমপরিমাণ বা ২ গুণ জরিমানা।", "Penalty equal to or 2x the evaded VAT.")}</li>
                    <li>{t("মাসিক ২% সুদ অনাদায়ী ভ্যাটের উপর।", "2% monthly interest on unpaid VAT.")}</li>
                    <li>{t("বড় ফাঁকিতে কারাদণ্ড পর্যন্ত হতে পারে (১ বছর পর্যন্ত)।", "Major evasion may lead to imprisonment (up to 1 year).")}</li>
                    <li>{t("ব্যবসা বন্ধ ও BIN বাতিলের আদেশ।", "Business closure & BIN cancellation possible.")}</li>
                  </ul>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex items-start gap-2 p-3 mt-6 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span>
            {t(
              "নোট: এটি সাধারণ আনুমানিক হিসাব ও তথ্য। হার ও নিয়ম পরিবর্তনশীল। প্রকৃত হিসাবের জন্য NBR-এর সর্বশেষ SRO ও একজন কর/ভ্যাট পরামর্শক দেখুন।",
              "Note: General estimation and info. Rates & rules may change. For actual filing, consult latest NBR SROs and a tax/VAT advisor."
            )}
          </span>
        </div>
      </motion.div>
    </div>
  );
};

export default TaxCalc;
