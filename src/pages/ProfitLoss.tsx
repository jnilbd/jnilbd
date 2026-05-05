import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Percent, Calculator } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/contexts/LanguageContext";

const ProfitLoss = () => {
  const { language } = useLanguage();
  const t = (bn: string, en: string) => (language === "bn" ? bn : en);

  // Mode 1: Cost vs Sell
  const [cost, setCost] = useState("1000");
  const [sell, setSell] = useState("1200");

  // Mode 2: Cost + desired margin
  const [cost2, setCost2] = useState("1000");
  const [margin, setMargin] = useState("20");

  // Mode 3: Discount
  const [original, setOriginal] = useState("1500");
  const [discountPct, setDiscountPct] = useState("15");

  // Mode 4: % change
  const [oldVal, setOldVal] = useState("100");
  const [newVal, setNewVal] = useState("125");

  const m1 = useMemo(() => {
    const c = parseFloat(cost) || 0;
    const s = parseFloat(sell) || 0;
    const diff = s - c;
    const pct = c > 0 ? (diff / c) * 100 : 0;
    return { diff, pct, isProfit: diff >= 0 };
  }, [cost, sell]);

  const m2 = useMemo(() => {
    const c = parseFloat(cost2) || 0;
    const m = parseFloat(margin) || 0;
    const sellPrice = c * (1 + m / 100);
    const profit = sellPrice - c;
    return { sellPrice, profit };
  }, [cost2, margin]);

  const m3 = useMemo(() => {
    const o = parseFloat(original) || 0;
    const d = parseFloat(discountPct) || 0;
    const saved = o * (d / 100);
    const final = o - saved;
    return { saved, final };
  }, [original, discountPct]);

  const m4 = useMemo(() => {
    const o = parseFloat(oldVal) || 0;
    const n = parseFloat(newVal) || 0;
    const diff = n - o;
    const pct = o !== 0 ? (diff / Math.abs(o)) * 100 : 0;
    return { diff, pct, increased: diff >= 0 };
  }, [oldVal, newVal]);

  const fmt = (n: number) => "৳ " + n.toLocaleString("en-IN", { maximumFractionDigits: 2 });
  const fmtPct = (n: number) => n.toFixed(2) + "%";

  return (
    <div className="container py-8 max-w-3xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-3">
            <Percent className="w-3.5 h-3.5" />
            {t("লভ্যাংশ/ক্ষতি ক্যালকুলেটর", "Profit/Loss Calculator")}
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold mb-2">
            {t("পার্সেন্টেজ — সবকিছু এক ক্লিকে", "Percentage — everything in one click")}
          </h1>
        </div>

        <Tabs defaultValue="profit">
          <TabsList className="grid grid-cols-2 sm:grid-cols-4 w-full mb-4 h-auto">
            <TabsTrigger value="profit" className="flex-col h-auto py-2"><TrendingUp className="w-4 h-4 mb-1" />{t("লাভ/ক্ষতি", "Profit/Loss")}</TabsTrigger>
            <TabsTrigger value="margin" className="flex-col h-auto py-2"><Calculator className="w-4 h-4 mb-1" />{t("মার্জিন", "Margin")}</TabsTrigger>
            <TabsTrigger value="discount" className="flex-col h-auto py-2"><TrendingDown className="w-4 h-4 mb-1" />{t("ডিসকাউন্ট", "Discount")}</TabsTrigger>
            <TabsTrigger value="change" className="flex-col h-auto py-2"><Percent className="w-4 h-4 mb-1" />{t("পরিবর্তন %", "% Change")}</TabsTrigger>
          </TabsList>

          {/* Profit/Loss from cost vs sell */}
          <TabsContent value="profit">
            <Card className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">{t("ক্রয় মূল্য (৳)", "Cost price (BDT)")}</label>
                  <Input type="number" value={cost} onChange={(e) => setCost(e.target.value)} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">{t("বিক্রয় মূল্য (৳)", "Sell price (BDT)")}</label>
                  <Input type="number" value={sell} onChange={(e) => setSell(e.target.value)} />
                </div>
              </div>
              <div className={`p-4 rounded-xl text-center ${m1.isProfit ? "bg-green-500/10 text-green-700 dark:text-green-400" : "bg-red-500/10 text-red-700 dark:text-red-400"}`}>
                <p className="text-xs uppercase font-semibold mb-1">{m1.isProfit ? t("লাভ", "Profit") : t("ক্ষতি", "Loss")}</p>
                <p className="text-3xl font-display font-bold">{fmt(Math.abs(m1.diff))}</p>
                <p className="text-lg font-semibold mt-1">{fmtPct(Math.abs(m1.pct))}</p>
              </div>
            </Card>
          </TabsContent>

          {/* Margin -> Sell price */}
          <TabsContent value="margin">
            <Card className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">{t("ক্রয় মূল্য (৳)", "Cost price (BDT)")}</label>
                  <Input type="number" value={cost2} onChange={(e) => setCost2(e.target.value)} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">{t("ইচ্ছিত মার্জিন (%)", "Desired margin (%)")}</label>
                  <Input type="number" value={margin} onChange={(e) => setMargin(e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-xl bg-primary/10 text-center">
                  <p className="text-xs uppercase font-semibold text-muted-foreground mb-1">{t("বিক্রয় মূল্য", "Sell at")}</p>
                  <p className="text-2xl font-display font-bold gradient-text">{fmt(m2.sellPrice)}</p>
                </div>
                <div className="p-4 rounded-xl bg-green-500/10 text-center">
                  <p className="text-xs uppercase font-semibold text-muted-foreground mb-1">{t("লাভ", "Profit")}</p>
                  <p className="text-2xl font-display font-bold text-green-600">{fmt(m2.profit)}</p>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Discount */}
          <TabsContent value="discount">
            <Card className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">{t("আসল মূল্য (৳)", "Original price (BDT)")}</label>
                  <Input type="number" value={original} onChange={(e) => setOriginal(e.target.value)} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">{t("ডিসকাউন্ট (%)", "Discount (%)")}</label>
                  <Input type="number" value={discountPct} onChange={(e) => setDiscountPct(e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-xl bg-secondary/15 text-center">
                  <p className="text-xs uppercase font-semibold text-muted-foreground mb-1">{t("ছাড়", "You save")}</p>
                  <p className="text-2xl font-display font-bold text-secondary">{fmt(m3.saved)}</p>
                </div>
                <div className="p-4 rounded-xl bg-primary/10 text-center">
                  <p className="text-xs uppercase font-semibold text-muted-foreground mb-1">{t("দিতে হবে", "You pay")}</p>
                  <p className="text-2xl font-display font-bold gradient-text">{fmt(m3.final)}</p>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* % change */}
          <TabsContent value="change">
            <Card className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">{t("পুরাতন মান", "Old value")}</label>
                  <Input type="number" value={oldVal} onChange={(e) => setOldVal(e.target.value)} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">{t("নতুন মান", "New value")}</label>
                  <Input type="number" value={newVal} onChange={(e) => setNewVal(e.target.value)} />
                </div>
              </div>
              <div className={`p-4 rounded-xl text-center ${m4.increased ? "bg-green-500/10 text-green-700 dark:text-green-400" : "bg-red-500/10 text-red-700 dark:text-red-400"}`}>
                <p className="text-xs uppercase font-semibold mb-1">
                  {m4.increased ? t("বৃদ্ধি", "Increase") : t("হ্রাস", "Decrease")}
                </p>
                <p className="text-3xl font-display font-bold">{fmtPct(Math.abs(m4.pct))}</p>
                <p className="text-sm mt-1">
                  ({m4.increased ? "+" : ""}{m4.diff.toLocaleString()})
                </p>
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        <Card className="p-5 mt-4 text-xs text-muted-foreground">
          <p className="font-semibold text-foreground mb-1">{t("সূত্রাবলী:", "Formulas:")}</p>
          <ul className="space-y-1 font-mono">
            <li>• {t("লাভ %", "Profit %")} = (বিক্রয় − ক্রয়) ÷ ক্রয় × 100</li>
            <li>• {t("বিক্রয়", "Sell")} = ক্রয় × (1 + মার্জিন/100)</li>
            <li>• {t("ছাড়", "Discount")} = আসল × ডিসকাউন্ট/100</li>
            <li>• {t("পরিবর্তন %", "% Change")} = (নতুন − পুরাতন) ÷ |পুরাতন| × 100</li>
          </ul>
        </Card>
      </motion.div>
    </div>
  );
};

export default ProfitLoss;
