import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Percent,
  Calculator,
  Landmark,
  Briefcase,
  PieChart,
  Package,
} from "lucide-react";
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

  // Mode 5: Loan/EMI (Kisti)
  const [loanAmt, setLoanAmt] = useState("100000");
  const [loanRate, setLoanRate] = useState("12");
  const [loanYears, setLoanYears] = useState("1");
  const [loanType, setLoanType] = useState<"reducing" | "flat" | "ngo">("reducing");

  // Mode 6: Business profit/loss projection (capital + %)
  const [bizCapital, setBizCapital] = useState("100000");
  const [bizPct, setBizPct] = useState("25");
  const [bizSide, setBizSide] = useState<"profit" | "loss">("profit");

  // Mode 7: ROI — cost vs revenue (find profit %)
  const [roiInvest, setRoiInvest] = useState("50000");
  const [roiRevenue, setRoiRevenue] = useState("65000");
  const [roiExpense, setRoiExpense] = useState("5000");

  // Mode 8: Product buy/sell (new/used)
  const [pCondition, setPCondition] = useState<"new" | "used">("new");
  const [pBuy, setPBuy] = useState("20000");
  const [pSell, setPSell] = useState("22000");
  const [pExtra, setPExtra] = useState("500"); // repair/transport
  const [pUsedDepr, setPUsedDepr] = useState("10"); // expected depreciation % for used

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

  // ---------- Loan / EMI ----------
  const m5 = useMemo(() => {
    const P = parseFloat(loanAmt) || 0;
    const rPct = parseFloat(loanRate) || 0;
    const years = parseFloat(loanYears) || 0;
    const months = Math.max(1, Math.round(years * 12));
    const r = rPct / 100 / 12;

    let monthly = 0, totalPay = 0, totalInterest = 0;
    if (loanType === "reducing") {
      // Standard EMI (reducing balance)
      monthly = r === 0 ? P / months : (P * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
      totalPay = monthly * months;
      totalInterest = totalPay - P;
    } else if (loanType === "flat") {
      // Flat rate (sud sorol haar) — interest = P*r*t per annum on full principal
      totalInterest = P * (rPct / 100) * years;
      totalPay = P + totalInterest;
      monthly = totalPay / months;
    } else {
      // NGO/Microcredit (declining service charge, often quoted as flat ~12-25%)
      // Most NGOs use 12.5% flat -> effective ~24-27%. We treat input as flat service charge.
      totalInterest = P * (rPct / 100) * years;
      totalPay = P + totalInterest;
      monthly = totalPay / months;
    }
    const effectiveAnnual = years > 0 ? (totalInterest / P / years) * 100 : 0;
    return { monthly, totalPay, totalInterest, months, effectiveAnnual };
  }, [loanAmt, loanRate, loanYears, loanType]);

  // ---------- Business projection ----------
  const m6 = useMemo(() => {
    const c = parseFloat(bizCapital) || 0;
    const p = parseFloat(bizPct) || 0;
    const change = c * (p / 100);
    const result = bizSide === "profit" ? c + change : c - change;
    return { change, result };
  }, [bizCapital, bizPct, bizSide]);

  // ---------- ROI ----------
  const m7 = useMemo(() => {
    const inv = parseFloat(roiInvest) || 0;
    const rev = parseFloat(roiRevenue) || 0;
    const exp = parseFloat(roiExpense) || 0;
    const totalCost = inv + exp;
    const netProfit = rev - totalCost;
    const pct = totalCost > 0 ? (netProfit / totalCost) * 100 : 0;
    return { totalCost, netProfit, pct, isProfit: netProfit >= 0 };
  }, [roiInvest, roiRevenue, roiExpense]);

  // ---------- Product buy/sell ----------
  const m8 = useMemo(() => {
    const buy = parseFloat(pBuy) || 0;
    const sellP = parseFloat(pSell) || 0;
    const extra = parseFloat(pExtra) || 0;
    const depr = parseFloat(pUsedDepr) || 0;
    const effectiveCost = buy + extra;
    // If used, expected resale considering depreciation
    const expectedResale = pCondition === "used" ? sellP * (1 - depr / 100) : sellP;
    const profit = expectedResale - effectiveCost;
    const pct = effectiveCost > 0 ? (profit / effectiveCost) * 100 : 0;
    return { effectiveCost, expectedResale, profit, pct, isProfit: profit >= 0 };
  }, [pBuy, pSell, pExtra, pUsedDepr, pCondition]);

  const fmt = (n: number) => "৳ " + n.toLocaleString("en-IN", { maximumFractionDigits: 2 });
  const fmtPct = (n: number) => n.toFixed(2) + "%";

  return (
    <div className="container py-8 max-w-3xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-3">
            <Percent className="w-3.5 h-3.5" />
            {t("লভ্যাংশ/ক্ষতি ও ব্যবসা ক্যালকুলেটর", "Profit/Loss & Business Calculator")}
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold mb-2">
            {t("সব হিসাব — এক জায়গায়", "All calculations — in one place")}
          </h1>
        </div>

        <Tabs defaultValue="profit">
          <TabsList className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 w-full mb-4 h-auto">
            <TabsTrigger value="profit" className="flex-col h-auto py-2 text-[10px]"><TrendingUp className="w-4 h-4 mb-1" />{t("লাভ/ক্ষতি", "Profit/Loss")}</TabsTrigger>
            <TabsTrigger value="margin" className="flex-col h-auto py-2 text-[10px]"><Calculator className="w-4 h-4 mb-1" />{t("মার্জিন", "Margin")}</TabsTrigger>
            <TabsTrigger value="discount" className="flex-col h-auto py-2 text-[10px]"><TrendingDown className="w-4 h-4 mb-1" />{t("ডিসকাউন্ট", "Discount")}</TabsTrigger>
            <TabsTrigger value="change" className="flex-col h-auto py-2 text-[10px]"><Percent className="w-4 h-4 mb-1" />{t("পরিবর্তন", "% Change")}</TabsTrigger>
            <TabsTrigger value="loan" className="flex-col h-auto py-2 text-[10px]"><Landmark className="w-4 h-4 mb-1" />{t("কিস্তি/সুদ", "Loan/EMI")}</TabsTrigger>
            <TabsTrigger value="biz" className="flex-col h-auto py-2 text-[10px]"><Briefcase className="w-4 h-4 mb-1" />{t("ব্যবসা %", "Business %")}</TabsTrigger>
            <TabsTrigger value="roi" className="flex-col h-auto py-2 text-[10px]"><PieChart className="w-4 h-4 mb-1" />{t("ROI/মুনাফা", "ROI")}</TabsTrigger>
            <TabsTrigger value="product" className="flex-col h-auto py-2 text-[10px]"><Package className="w-4 h-4 mb-1" />{t("প্রোডাক্ট", "Product")}</TabsTrigger>
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

          {/* Loan / EMI / Kisti */}
          <TabsContent value="loan">
            <Card className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">{t("ঋণের ধরন", "Loan Type")}</label>
                <div className="grid grid-cols-3 gap-2">
                  {([
                    ["reducing", "ব্যাংক EMI", "Bank EMI"],
                    ["flat", "ফ্ল্যাট সুদ", "Flat Rate"],
                    ["ngo", "NGO/ক্ষুদ্রঋণ", "NGO/Micro"],
                  ] as Array<[typeof loanType, string, string]>).map(([k, bn, en]) => (
                    <button key={k} onClick={() => setLoanType(k)}
                      className={`px-2 py-2 rounded-lg text-xs font-semibold border ${loanType === k ? "border-primary bg-primary/10 text-primary" : "border-border"}`}>
                      {t(bn, en)}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-medium mb-1.5 block">{t("ঋণ (৳)", "Loan (BDT)")}</label>
                  <Input type="number" value={loanAmt} onChange={(e) => setLoanAmt(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1.5 block">{t("সুদের হার (%)", "Interest (%)")}</label>
                  <Input type="number" value={loanRate} onChange={(e) => setLoanRate(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1.5 block">{t("মেয়াদ (বছর)", "Tenure (yrs)")}</label>
                  <Input type="number" value={loanYears} onChange={(e) => setLoanYears(e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-primary/10 text-center">
                  <p className="text-[10px] uppercase font-semibold text-muted-foreground mb-1">{t("মাসিক কিস্তি", "Monthly EMI")}</p>
                  <p className="text-lg font-display font-bold gradient-text">{fmt(m5.monthly)}</p>
                </div>
                <div className="p-3 rounded-xl bg-orange-500/10 text-center">
                  <p className="text-[10px] uppercase font-semibold text-muted-foreground mb-1">{t("মোট সুদ", "Total Interest")}</p>
                  <p className="text-lg font-display font-bold text-orange-600">{fmt(m5.totalInterest)}</p>
                </div>
                <div className="p-3 rounded-xl bg-secondary/15 text-center">
                  <p className="text-[10px] uppercase font-semibold text-muted-foreground mb-1">{t("মোট পরিশোধ", "Total Payable")}</p>
                  <p className="text-lg font-display font-bold">{fmt(m5.totalPay)}</p>
                </div>
                <div className="p-3 rounded-xl bg-red-500/10 text-center">
                  <p className="text-[10px] uppercase font-semibold text-muted-foreground mb-1">{t("কার্যকর হার/বছর", "Effective/yr")}</p>
                  <p className="text-lg font-display font-bold text-red-600">{fmtPct(m5.effectiveAnnual)}</p>
                </div>
              </div>
              <div className="text-xs text-muted-foreground space-y-1 p-3 rounded-lg bg-muted/40">
                <p><b>{t("ব্যাংক EMI", "Bank EMI")}:</b> {t("কমতি ব্যালেন্সে সুদ — সবচেয়ে কম খরচ।", "Reducing balance — cheapest option.")}</p>
                <p><b>{t("ফ্ল্যাট সুদ", "Flat Rate")}:</b> {t("পুরো মূল ঋণে প্রতিবছর সুদ — কার লোন/পার্সোনাল লোনে দেখা যায়।", "Interest on full principal yearly — common in car/personal loans.")}</p>
                <p><b>{t("NGO/ক্ষুদ্রঋণ", "NGO/Micro")}:</b> {t("সাধারণত ১২.৫-১৫% ফ্ল্যাট, কার্যকর হার ~২৪-২৭%।", "Usually 12.5-15% flat, effective ~24-27%.")}</p>
              </div>
            </Card>
          </TabsContent>

          {/* Business projection — capital + % */}
          <TabsContent value="biz">
            <Card className="p-6 space-y-4">
              <p className="text-sm text-muted-foreground">{t("যদি আপনি কোনো ব্যবসায় X টাকা লাগান এবং Y% লাভ/ক্ষতি হয় — তাহলে কত টাকা হবে?", "If you invest X in a business and gain/lose Y% — what's the result?")}</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">{t("পুঁজি (৳)", "Capital (BDT)")}</label>
                  <Input type="number" value={bizCapital} onChange={(e) => setBizCapital(e.target.value)} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">{t("শতাংশ (%)", "Percentage (%)")}</label>
                  <Input type="number" value={bizPct} onChange={(e) => setBizPct(e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => setBizSide("profit")} className={`py-2 rounded-lg text-sm font-semibold border ${bizSide === "profit" ? "border-green-500 bg-green-500/10 text-green-700" : "border-border"}`}>📈 {t("লাভ", "Profit")}</button>
                <button onClick={() => setBizSide("loss")} className={`py-2 rounded-lg text-sm font-semibold border ${bizSide === "loss" ? "border-red-500 bg-red-500/10 text-red-700" : "border-border"}`}>📉 {t("ক্ষতি", "Loss")}</button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className={`p-4 rounded-xl text-center ${bizSide === "profit" ? "bg-green-500/10" : "bg-red-500/10"}`}>
                  <p className="text-xs uppercase font-semibold text-muted-foreground mb-1">{bizSide === "profit" ? t("লাভের পরিমাণ", "Profit Amount") : t("ক্ষতির পরিমাণ", "Loss Amount")}</p>
                  <p className={`text-2xl font-display font-bold ${bizSide === "profit" ? "text-green-600" : "text-red-600"}`}>{bizSide === "profit" ? "+" : "−"}{fmt(m6.change)}</p>
                </div>
                <div className="p-4 rounded-xl bg-primary/10 text-center">
                  <p className="text-xs uppercase font-semibold text-muted-foreground mb-1">{t("চূড়ান্ত পরিমাণ", "Final Amount")}</p>
                  <p className="text-2xl font-display font-bold gradient-text">{fmt(m6.result)}</p>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* ROI */}
          <TabsContent value="roi">
            <Card className="p-6 space-y-4">
              <p className="text-sm text-muted-foreground">{t("ব্যবসায় কত খরচ করেছেন আর কত আয় — মুনাফার শতাংশ বের করুন।", "Calculate net profit % from total cost vs revenue.")}</p>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-medium mb-1.5 block">{t("বিনিয়োগ (৳)", "Investment")}</label>
                  <Input type="number" value={roiInvest} onChange={(e) => setRoiInvest(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1.5 block">{t("অন্যান্য খরচ (৳)", "Other Expense")}</label>
                  <Input type="number" value={roiExpense} onChange={(e) => setRoiExpense(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1.5 block">{t("মোট আয় (৳)", "Total Revenue")}</label>
                  <Input type="number" value={roiRevenue} onChange={(e) => setRoiRevenue(e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="p-4 rounded-xl bg-secondary/15 text-center">
                  <p className="text-[10px] uppercase font-semibold text-muted-foreground mb-1">{t("মোট খরচ", "Total Cost")}</p>
                  <p className="text-xl font-display font-bold">{fmt(m7.totalCost)}</p>
                </div>
                <div className={`p-4 rounded-xl text-center ${m7.isProfit ? "bg-green-500/10" : "bg-red-500/10"}`}>
                  <p className="text-[10px] uppercase font-semibold text-muted-foreground mb-1">{m7.isProfit ? t("নিট মুনাফা", "Net Profit") : t("নিট ক্ষতি", "Net Loss")}</p>
                  <p className={`text-xl font-display font-bold ${m7.isProfit ? "text-green-600" : "text-red-600"}`}>{fmt(Math.abs(m7.netProfit))}</p>
                </div>
                <div className="p-4 rounded-xl bg-primary/10 text-center">
                  <p className="text-[10px] uppercase font-semibold text-muted-foreground mb-1">{t("মুনাফার হার", "Profit Margin")}</p>
                  <p className="text-xl font-display font-bold gradient-text">{fmtPct(m7.pct)}</p>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Product buy/sell */}
          <TabsContent value="product">
            <Card className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">{t("প্রোডাক্টের অবস্থা", "Product Condition")}</label>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => setPCondition("new")} className={`py-2 rounded-lg text-sm font-semibold border ${pCondition === "new" ? "border-primary bg-primary/10 text-primary" : "border-border"}`}>✨ {t("নতুন", "New")}</button>
                  <button onClick={() => setPCondition("used")} className={`py-2 rounded-lg text-sm font-semibold border ${pCondition === "used" ? "border-primary bg-primary/10 text-primary" : "border-border"}`}>♻️ {t("পুরাতন", "Used")}</button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium mb-1.5 block">{t("ক্রয় মূল্য (৳)", "Buy Price (BDT)")}</label>
                  <Input type="number" value={pBuy} onChange={(e) => setPBuy(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1.5 block">{t("বিক্রয় মূল্য (৳)", "Sell Price (BDT)")}</label>
                  <Input type="number" value={pSell} onChange={(e) => setPSell(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1.5 block">{t("অতিরিক্ত খরচ (পরিবহন/মেরামত)", "Extra Cost (transport/repair)")}</label>
                  <Input type="number" value={pExtra} onChange={(e) => setPExtra(e.target.value)} />
                </div>
                {pCondition === "used" && (
                  <div>
                    <label className="text-xs font-medium mb-1.5 block">{t("অবচয় (%)", "Depreciation (%)")}</label>
                    <Input type="number" value={pUsedDepr} onChange={(e) => setPUsedDepr(e.target.value)} />
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-secondary/15 text-center">
                  <p className="text-[10px] uppercase font-semibold text-muted-foreground mb-1">{t("কার্যকর ক্রয়", "Effective Cost")}</p>
                  <p className="text-lg font-display font-bold">{fmt(m8.effectiveCost)}</p>
                </div>
                <div className="p-3 rounded-xl bg-primary/10 text-center">
                  <p className="text-[10px] uppercase font-semibold text-muted-foreground mb-1">{pCondition === "used" ? t("প্রত্যাশিত বিক্রয়", "Expected Resale") : t("বিক্রয় মূল্য", "Sell Price")}</p>
                  <p className="text-lg font-display font-bold gradient-text">{fmt(m8.expectedResale)}</p>
                </div>
                <div className={`p-3 rounded-xl text-center ${m8.isProfit ? "bg-green-500/10" : "bg-red-500/10"}`}>
                  <p className="text-[10px] uppercase font-semibold text-muted-foreground mb-1">{m8.isProfit ? t("লাভ", "Profit") : t("ক্ষতি", "Loss")}</p>
                  <p className={`text-lg font-display font-bold ${m8.isProfit ? "text-green-600" : "text-red-600"}`}>{fmt(Math.abs(m8.profit))}</p>
                  <p className="text-xs font-semibold">{fmtPct(Math.abs(m8.pct))}</p>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        <Card className="p-5 mt-4 text-xs text-muted-foreground">
          <p className="font-semibold text-foreground mb-1">{t("সূত্রাবলী:", "Formulas:")}</p>
          <ul className="space-y-1 font-mono">
            <li>• {t("লাভ %", "Profit %")} = (বিক্রয় − ক্রয়) ÷ ক্রয় × 100</li>
            <li>• {t("EMI", "EMI")} = P × r × (1+r)^n / ((1+r)^n − 1)</li>
            <li>• {t("ফ্ল্যাট সুদ", "Flat Interest")} = P × r × t</li>
            <li>• {t("ব্যবসা ফলাফল", "Business Result")} = পুঁজি × (1 ± %/100)</li>
            <li>• ROI = (আয় − মোট খরচ) ÷ মোট খরচ × 100</li>
          </ul>
        </Card>
      </motion.div>
    </div>
  );
};

export default ProfitLoss;
