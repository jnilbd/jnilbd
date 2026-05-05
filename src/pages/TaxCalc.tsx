import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Calculator, Receipt, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";

// Bangladesh Income Tax — FY 2024-25 slabs
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
  senior: 400000, // 65+
  disabled: 475000,
  freedomFighter: 500000,
};

const TaxCalc = () => {
  const { language } = useLanguage();
  const t = (bn: string, en: string) => (language === "bn" ? bn : en);

  const [income, setIncome] = useState("600000");
  const [category, setCategory] = useState<keyof typeof THRESHOLDS>("general");
  const [investment, setInvestment] = useState("0");

  const result = useMemo(() => {
    const annualIncome = parseFloat(income) || 0;
    const inv = parseFloat(investment) || 0;
    const baseExempt = THRESHOLDS[category];

    // Adjusted slabs based on threshold
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

    // Investment rebate: 15% of (lesser of investment, 20% of taxable income, BDT 1 crore)
    const maxRebateBase = Math.min(inv, annualIncome * 0.2, 10_000_000);
    const rebate = maxRebateBase * 0.15;
    const finalTax = Math.max(0, tax - rebate);

    // Minimum tax (Dhaka/Chattogram city corp = BDT 5,000)
    const minTax = annualIncome > baseExempt ? 5000 : 0;
    const payable = Math.max(finalTax, minTax);

    return { annualIncome, baseExempt, tax, rebate, finalTax, minTax, payable, breakdown };
  }, [income, category, investment]);

  const fmt = (n: number) => "৳ " + n.toLocaleString("en-IN", { maximumFractionDigits: 0 });

  return (
    <div className="container py-8 max-w-3xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-3">
            <Receipt className="w-3.5 h-3.5" />
            {t("ইনকাম ট্যাক্স ক্যালকুলেটর — বাংলাদেশ", "Income Tax Calculator — Bangladesh")}
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold mb-2">
            {t("ব্যক্তিগত আয়কর — FY 2024-25", "Personal Income Tax — FY 2024-25")}
          </h1>
        </div>

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

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
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

        <Card className="p-5 mt-4">
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

        <div className="flex items-start gap-2 p-3 mt-4 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span>
            {t(
              "নোট: এটি সাধারণ আনুমানিক হিসাব। প্রকৃত হিসাবের জন্য NBR-এর নিয়ম ও একজন কর পরামর্শক দেখুন।",
              "Note: General estimation. For actual filing, consult NBR rules and a tax advisor."
            )}
          </span>
        </div>
      </motion.div>
    </div>
  );
};

export default TaxCalc;
