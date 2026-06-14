import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calculator, Landmark, PiggyBank, TrendingUp, Coins, Wallet, Receipt, ArrowLeftRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const fmt = (n: number) =>
  isFinite(n) && !isNaN(n)
    ? "৳ " + Math.round(n).toLocaleString("en-IN")
    : "—";

// ---------- Loan / EMI ----------
function LoanCalc({ bn }: { bn: boolean }) {
  const [P, setP] = useState(500000);
  const [r, setR] = useState(12);
  const [n, setN] = useState(36);
  const monthly = r / 12 / 100;
  const emi = monthly === 0 ? P / n : (P * monthly * Math.pow(1 + monthly, n)) / (Math.pow(1 + monthly, n) - 1);
  const total = emi * n;
  const interest = total - P;
  return (
    <Card className="p-5 space-y-3">
      <h3 className="font-bold flex items-center gap-2"><Landmark className="h-4 w-4 text-primary" />{bn ? "ঋণ / EMI ক্যালকুলেটর" : "Loan / EMI"}</h3>
      <div className="grid sm:grid-cols-3 gap-3">
        <div><Label>{bn ? "ঋণের পরিমাণ (৳)" : "Loan amount (৳)"}</Label><Input type="number" value={P} onChange={(e) => setP(+e.target.value || 0)} /></div>
        <div><Label>{bn ? "সুদের হার (%/বছর)" : "Interest (%/yr)"}</Label><Input type="number" step="0.1" value={r} onChange={(e) => setR(+e.target.value || 0)} /></div>
        <div><Label>{bn ? "মেয়াদ (মাস)" : "Term (months)"}</Label><Input type="number" value={n} onChange={(e) => setN(+e.target.value || 1)} /></div>
      </div>
      <div className="grid grid-cols-3 gap-2 pt-2 border-t">
        <Stat label={bn ? "মাসিক কিস্তি" : "Monthly EMI"} value={fmt(emi)} highlight />
        <Stat label={bn ? "মোট সুদ" : "Total interest"} value={fmt(interest)} />
        <Stat label={bn ? "মোট পরিশোধ" : "Total paid"} value={fmt(total)} />
      </div>
    </Card>
  );
}

// ---------- FD / Compound ----------
function FDCalc({ bn }: { bn: boolean }) {
  const [P, setP] = useState(100000);
  const [r, setR] = useState(8);
  const [y, setY] = useState(5);
  const [c, setC] = useState(4); // compounding per year
  const A = P * Math.pow(1 + r / 100 / c, c * y);
  return (
    <Card className="p-5 space-y-3">
      <h3 className="font-bold flex items-center gap-2"><PiggyBank className="h-4 w-4 text-primary" />{bn ? "FD / জমা (চক্রবৃদ্ধি)" : "Fixed Deposit / Compound"}</h3>
      <div className="grid sm:grid-cols-4 gap-3">
        <div><Label>{bn ? "মূলধন (৳)" : "Principal"}</Label><Input type="number" value={P} onChange={(e) => setP(+e.target.value || 0)} /></div>
        <div><Label>{bn ? "সুদের হার %" : "Rate %"}</Label><Input type="number" step="0.1" value={r} onChange={(e) => setR(+e.target.value || 0)} /></div>
        <div><Label>{bn ? "বছর" : "Years"}</Label><Input type="number" value={y} onChange={(e) => setY(+e.target.value || 0)} /></div>
        <div><Label>{bn ? "বছরে কয়বার" : "Compound/yr"}</Label><Input type="number" value={c} onChange={(e) => setC(+e.target.value || 1)} /></div>
      </div>
      <div className="grid grid-cols-2 gap-2 pt-2 border-t">
        <Stat label={bn ? "মেয়াদ শেষে পাবেন" : "Maturity"} value={fmt(A)} highlight />
        <Stat label={bn ? "শুধু সুদ" : "Interest only"} value={fmt(A - P)} />
      </div>
    </Card>
  );
}

// ---------- SIP / DPS ----------
function SIPCalc({ bn }: { bn: boolean }) {
  const [m, setM] = useState(5000);
  const [r, setR] = useState(10);
  const [y, setY] = useState(10);
  const i = r / 100 / 12;
  const n = y * 12;
  const FV = m * ((Math.pow(1 + i, n) - 1) / i) * (1 + i);
  const invested = m * n;
  return (
    <Card className="p-5 space-y-3">
      <h3 className="font-bold flex items-center gap-2"><TrendingUp className="h-4 w-4 text-primary" />{bn ? "DPS / SIP মাসিক জমা" : "Monthly SIP / DPS"}</h3>
      <div className="grid sm:grid-cols-3 gap-3">
        <div><Label>{bn ? "মাসিক জমা (৳)" : "Monthly (৳)"}</Label><Input type="number" value={m} onChange={(e) => setM(+e.target.value || 0)} /></div>
        <div><Label>{bn ? "বার্ষিক রিটার্ন %" : "Return %/yr"}</Label><Input type="number" step="0.1" value={r} onChange={(e) => setR(+e.target.value || 0)} /></div>
        <div><Label>{bn ? "বছর" : "Years"}</Label><Input type="number" value={y} onChange={(e) => setY(+e.target.value || 0)} /></div>
      </div>
      <div className="grid grid-cols-3 gap-2 pt-2 border-t">
        <Stat label={bn ? "মোট জমা" : "Invested"} value={fmt(invested)} />
        <Stat label={bn ? "লাভ" : "Gain"} value={fmt(FV - invested)} />
        <Stat label={bn ? "মেয়াদ শেষে" : "Final"} value={fmt(FV)} highlight />
      </div>
    </Card>
  );
}

// ---------- Zakat ----------
function ZakatCalc({ bn }: { bn: boolean }) {
  const [cash, setCash] = useState(0);
  const [gold, setGold] = useState(0); // grams
  const [silver, setSilver] = useState(0); // grams
  const [biz, setBiz] = useState(0);
  const [debts, setDebts] = useState(0);
  const [goldRate, setGoldRate] = useState(13000); // per gram (BD ~2025)
  const [silverRate, setSilverRate] = useState(170);
  const nisab = silver * 0; // calc below
  const totalAssets = cash + gold * goldRate + silver * silverRate + biz - debts;
  const nisabThreshold = 612.36 * silverRate; // 612.36g silver
  const zakat = totalAssets >= nisabThreshold ? totalAssets * 0.025 : 0;
  return (
    <Card className="p-5 space-y-3">
      <h3 className="font-bold flex items-center gap-2"><Coins className="h-4 w-4 text-primary" />{bn ? "যাকাত ক্যালকুলেটর" : "Zakat Calculator"}</h3>
      <div className="grid sm:grid-cols-2 gap-3">
        <div><Label>{bn ? "নগদ + ব্যাংক (৳)" : "Cash + Bank (৳)"}</Label><Input type="number" value={cash} onChange={(e) => setCash(+e.target.value || 0)} /></div>
        <div><Label>{bn ? "ব্যবসার মূলধন (৳)" : "Business assets (৳)"}</Label><Input type="number" value={biz} onChange={(e) => setBiz(+e.target.value || 0)} /></div>
        <div><Label>{bn ? "স্বর্ণ (গ্রাম)" : "Gold (g)"}</Label><Input type="number" value={gold} onChange={(e) => setGold(+e.target.value || 0)} /></div>
        <div><Label>{bn ? "স্বর্ণের দাম/গ্রাম" : "Gold rate/g"}</Label><Input type="number" value={goldRate} onChange={(e) => setGoldRate(+e.target.value || 0)} /></div>
        <div><Label>{bn ? "রূপা (গ্রাম)" : "Silver (g)"}</Label><Input type="number" value={silver} onChange={(e) => setSilver(+e.target.value || 0)} /></div>
        <div><Label>{bn ? "রূপার দাম/গ্রাম" : "Silver rate/g"}</Label><Input type="number" value={silverRate} onChange={(e) => setSilverRate(+e.target.value || 0)} /></div>
        <div className="sm:col-span-2"><Label>{bn ? "বাদ যাবে — ঋণ/দেনা (৳)" : "Subtract — debts (৳)"}</Label><Input type="number" value={debts} onChange={(e) => setDebts(+e.target.value || 0)} /></div>
      </div>
      <div className="grid grid-cols-3 gap-2 pt-2 border-t">
        <Stat label={bn ? "মোট সম্পদ" : "Net wealth"} value={fmt(totalAssets)} />
        <Stat label={bn ? "নিসাব (৬১২.৩৬g রূপা)" : "Nisab (612.36g silver)"} value={fmt(nisabThreshold)} />
        <Stat label={bn ? "প্রদেয় যাকাত (২.৫%)" : "Zakat due (2.5%)"} value={fmt(zakat)} highlight />
      </div>
      {totalAssets < nisabThreshold && totalAssets > 0 && (
        <p className="text-xs text-muted-foreground">{bn ? "আপনার সম্পদ নিসাবের নিচে — এ বছর যাকাত ফরজ নয়।" : "Below nisab — zakat not obligatory this year."}</p>
      )}
    </Card>
  );
}

// ---------- Salary breakdown ----------
function SalaryCalc({ bn }: { bn: boolean }) {
  const [gross, setGross] = useState(50000);
  const basic = gross * 0.5;
  const houseRent = basic * 0.5;
  const medical = Math.min(basic * 0.1, 10000);
  const conveyance = 3000;
  const other = gross - (basic + houseRent + medical + conveyance);
  return (
    <Card className="p-5 space-y-3">
      <h3 className="font-bold flex items-center gap-2"><Wallet className="h-4 w-4 text-primary" />{bn ? "বেতন ভাঙানো" : "Salary Breakdown"}</h3>
      <div><Label>{bn ? "মোট বেতন (৳)" : "Gross salary (৳)"}</Label><Input type="number" value={gross} onChange={(e) => setGross(+e.target.value || 0)} /></div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t">
        <Stat label={bn ? "বেসিক (৫০%)" : "Basic (50%)"} value={fmt(basic)} />
        <Stat label={bn ? "বাড়ি ভাড়া" : "House rent"} value={fmt(houseRent)} />
        <Stat label={bn ? "মেডিকেল" : "Medical"} value={fmt(medical)} />
        <Stat label={bn ? "যাতায়াত" : "Conveyance"} value={fmt(conveyance)} />
        <Stat label={bn ? "অন্যান্য" : "Other"} value={fmt(other)} />
        <Stat label={bn ? "মোট" : "Total"} value={fmt(gross)} highlight />
      </div>
    </Card>
  );
}

// ---------- Income Tax (BD individual, simplified FY 2024-25) ----------
function TaxCalc({ bn }: { bn: boolean }) {
  const [income, setIncome] = useState(600000);
  const [type, setType] = useState<"male" | "female">("male");
  const exempt = type === "male" ? 350000 : 400000;
  let taxable = Math.max(0, income - exempt);
  const slabs = [
    { lim: 100000, rate: 0.05 },
    { lim: 400000, rate: 0.10 },
    { lim: 500000, rate: 0.15 },
    { lim: 500000, rate: 0.20 },
    { lim: Infinity, rate: 0.25 },
  ];
  let tax = 0;
  for (const s of slabs) {
    const slice = Math.min(taxable, s.lim);
    tax += slice * s.rate;
    taxable -= slice;
    if (taxable <= 0) break;
  }
  const minTax = income > exempt ? 5000 : 0;
  const finalTax = Math.max(tax, minTax);
  return (
    <Card className="p-5 space-y-3">
      <h3 className="font-bold flex items-center gap-2"><Receipt className="h-4 w-4 text-primary" />{bn ? "আয়কর হিসাব (বাংলাদেশ)" : "Income Tax (BD)"}</h3>
      <div className="grid sm:grid-cols-2 gap-3">
        <div><Label>{bn ? "বার্ষিক আয় (৳)" : "Annual income (৳)"}</Label><Input type="number" value={income} onChange={(e) => setIncome(+e.target.value || 0)} /></div>
        <div>
          <Label>{bn ? "শ্রেণি" : "Category"}</Label>
          <div className="flex gap-2 mt-1">
            <button onClick={() => setType("male")} className={`flex-1 py-2 rounded border text-sm ${type === "male" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>{bn ? "পুরুষ" : "Male"}</button>
            <button onClick={() => setType("female")} className={`flex-1 py-2 rounded border text-sm ${type === "female" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>{bn ? "মহিলা / ৬৫+" : "Female / 65+"}</button>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 pt-2 border-t">
        <Stat label={bn ? "কর-মুক্ত সীমা" : "Exempt"} value={fmt(exempt)} />
        <Stat label={bn ? "করযোগ্য" : "Taxable"} value={fmt(Math.max(0, income - exempt))} />
        <Stat label={bn ? "প্রদেয় কর" : "Tax due"} value={fmt(finalTax)} highlight />
      </div>
      <p className="text-[11px] text-muted-foreground">{bn ? "সরলীকৃত হিসাব (FY 2024-25 স্ল্যাব)। বিনিয়োগ রেয়াত ও সারচার্জ আলাদা।" : "Simplified (FY 2024-25 slabs). Investment rebate & surcharge not included."}</p>
    </Card>
  );
}

// ---------- Currency converter (manual rates, editable) ----------
function CurrencyCalc({ bn }: { bn: boolean }) {
  const rates: Record<string, number> = { USD: 122, EUR: 132, GBP: 155, SAR: 32.5, AED: 33.2, INR: 1.42, MYR: 27, SGD: 90, QAR: 33.5, KWD: 397 };
  const [amount, setAmount] = useState(100);
  const [from, setFrom] = useState("USD");
  const bdt = amount * (rates[from] || 0);
  return (
    <Card className="p-5 space-y-3">
      <h3 className="font-bold flex items-center gap-2"><ArrowLeftRight className="h-4 w-4 text-primary" />{bn ? "কারেন্সি কনভার্টার" : "Currency Converter"}</h3>
      <div className="grid sm:grid-cols-2 gap-3">
        <div><Label>{bn ? "পরিমাণ" : "Amount"}</Label><Input type="number" value={amount} onChange={(e) => setAmount(+e.target.value || 0)} /></div>
        <div>
          <Label>{bn ? "কারেন্সি" : "From currency"}</Label>
          <select value={from} onChange={(e) => setFrom(e.target.value)} className="w-full h-10 px-3 rounded-md border bg-background">
            {Object.keys(rates).map((c) => <option key={c} value={c}>{c} (৳{rates[c]})</option>)}
          </select>
        </div>
      </div>
      <div className="pt-2 border-t">
        <Stat label={bn ? "টাকায় পাবেন" : "In BDT"} value={fmt(bdt)} highlight />
      </div>
      <p className="text-[11px] text-muted-foreground">{bn ? "ইঙ্গিত রেট — পাঠানোর আগে অ্যাপে যাচাই করুন।" : "Indicative — verify in remit app."}</p>
    </Card>
  );
}

// ---------- Profit margin ----------
function MarginCalc({ bn }: { bn: boolean }) {
  const [cost, setCost] = useState(1000);
  const [sell, setSell] = useState(1500);
  const profit = sell - cost;
  const margin = sell > 0 ? (profit / sell) * 100 : 0;
  const markup = cost > 0 ? (profit / cost) * 100 : 0;
  return (
    <Card className="p-5 space-y-3">
      <h3 className="font-bold flex items-center gap-2"><Calculator className="h-4 w-4 text-primary" />{bn ? "লাভ-ক্ষতি / মার্জিন" : "Profit & Margin"}</h3>
      <div className="grid sm:grid-cols-2 gap-3">
        <div><Label>{bn ? "ক্রয় মূল্য (৳)" : "Cost (৳)"}</Label><Input type="number" value={cost} onChange={(e) => setCost(+e.target.value || 0)} /></div>
        <div><Label>{bn ? "বিক্রয় মূল্য (৳)" : "Selling (৳)"}</Label><Input type="number" value={sell} onChange={(e) => setSell(+e.target.value || 0)} /></div>
      </div>
      <div className="grid grid-cols-3 gap-2 pt-2 border-t">
        <Stat label={bn ? "লাভ" : "Profit"} value={fmt(profit)} highlight />
        <Stat label={bn ? "মার্জিন %" : "Margin %"} value={margin.toFixed(2) + "%"} />
        <Stat label={bn ? "মার্কআপ %" : "Markup %"} value={markup.toFixed(2) + "%"} />
      </div>
    </Card>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-lg p-2 ${highlight ? "bg-primary/10 border border-primary/30" : "bg-muted/50"}`}>
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className={`text-sm font-bold ${highlight ? "text-primary" : ""}`}>{value}</div>
    </div>
  );
}

export default function FinanceCalculator() {
  const { language } = useLanguage();
  const bn = language === "bn";

  const tabs = useMemo(() => [
    { v: "loan", label: bn ? "ঋণ/EMI" : "Loan", el: <LoanCalc bn={bn} /> },
    { v: "fd", label: bn ? "FD" : "FD", el: <FDCalc bn={bn} /> },
    { v: "sip", label: bn ? "DPS/SIP" : "SIP", el: <SIPCalc bn={bn} /> },
    { v: "zakat", label: bn ? "যাকাত" : "Zakat", el: <ZakatCalc bn={bn} /> },
    { v: "salary", label: bn ? "বেতন" : "Salary", el: <SalaryCalc bn={bn} /> },
    { v: "tax", label: bn ? "ট্যাক্স" : "Tax", el: <TaxCalc bn={bn} /> },
    { v: "currency", label: bn ? "কারেন্সি" : "FX", el: <CurrencyCalc bn={bn} /> },
    { v: "margin", label: bn ? "লাভ" : "Profit", el: <MarginCalc bn={bn} /> },
  ], [bn]);

  return (
    <div className="space-y-3">
      <Card className="p-4 bg-gradient-to-br from-primary/10 to-transparent">
        <div className="flex items-center gap-2">
          <Calculator className="h-5 w-5 text-primary" />
          <div>
            <h2 className="font-bold">{bn ? "ফিন্যান্স ক্যালকুলেটর" : "Finance Calculator"}</h2>
            <p className="text-xs text-muted-foreground">{bn ? "ঋণ, FD, DPS, যাকাত, বেতন, কর, কারেন্সি ও লাভ — সব এক জায়গায়।" : "Loan, FD, SIP, Zakat, Salary, Tax, FX & Profit — all in one."}</p>
          </div>
        </div>
      </Card>

      <Tabs defaultValue="loan">
        <TabsList className="grid grid-cols-4 sm:grid-cols-8 w-full h-auto">
          {tabs.map((t) => <TabsTrigger key={t.v} value={t.v} className="text-xs py-2">{t.label}</TabsTrigger>)}
        </TabsList>
        {tabs.map((t) => <TabsContent key={t.v} value={t.v} className="mt-3">{t.el}</TabsContent>)}
      </Tabs>
    </div>
  );
}
