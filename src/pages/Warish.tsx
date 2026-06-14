import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Users, AlertCircle, Scale } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";

/**
 * Simplified Islamic inheritance (Faraid) calculator covering common cases.
 * For complex cases (grandchildren via deceased child, distant kindred, etc.)
 * an Islamic scholar should be consulted.
 *
 * Rules implemented:
 * - Spouse share (husband 1/4 with children, 1/2 without; wife 1/8 with, 1/4 without — split among multiple wives)
 * - Mother & Father shares (1/6 each when there are children; mother 1/3 of remainder otherwise)
 * - Sons/daughters: residue 2:1 (son : daughter) when there are sons
 * - Daughters only: 1 daughter = 1/2, 2+ daughters = 2/3 (split equally), residue back to other heirs
 */

type AssetMode = "money" | "land";
type LandUnit = "bigha" | "katha" | "decimal" | "kani" | "acre";

// 1 Bigha = 33 Decimal = 20 Katha; 1 Katha = 1.65 Decimal; 1 Acre = 100 Decimal; 1 Kani = 120 Decimal
const TO_DECIMAL: Record<LandUnit, number> = {
  decimal: 1,
  katha: 1.65,
  bigha: 33,
  acre: 100,
  kani: 120,
};

const Warish = () => {
  const { language } = useLanguage();
  const t = (bn: string, en: string) => (language === "bn" ? bn : en);

  const [mode, setMode] = useState<AssetMode>("money");
  const [estate, setEstate] = useState("1000000");
  const [landAmount, setLandAmount] = useState("10");
  const [landUnit, setLandUnit] = useState<LandUnit>("bigha");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [spouse, setSpouse] = useState(1);
  const [sons, setSons] = useState(0);
  const [daughters, setDaughters] = useState(0);
  const [father, setFather] = useState(false);
  const [mother, setMother] = useState(false);

  const calc = useMemo(() => {
    const total = mode === "money"
      ? (parseFloat(estate) || 0)
      : (parseFloat(landAmount) || 0) * TO_DECIMAL[landUnit];
    if (total <= 0) return null;

    const hasChildren = sons + daughters > 0;
    const shares: Array<{ heir: string; share: string; amount: number }> = [];
    let used = 0;

    // Spouse
    if (gender === "male" && spouse > 0) {
      const fraction = hasChildren ? 1 / 8 : 1 / 4;
      const total_spouse = total * fraction;
      const per = total_spouse / spouse;
      for (let i = 0; i < spouse; i++) {
        shares.push({ heir: t(`স্ত্রী ${spouse > 1 ? i + 1 : ""}`, `Wife ${spouse > 1 ? i + 1 : ""}`), share: spouse === 1 ? `1/${hasChildren ? 8 : 4}` : `1/${hasChildren ? 8 : 4} ÷ ${spouse}`, amount: per });
      }
      used += total_spouse;
    } else if (gender === "female" && spouse > 0) {
      const fraction = hasChildren ? 1 / 4 : 1 / 2;
      const amt = total * fraction;
      shares.push({ heir: t("স্বামী", "Husband"), share: `1/${hasChildren ? 4 : 2}`, amount: amt });
      used += amt;
    }

    // Mother & Father (when present alongside children, each gets 1/6)
    if (mother) {
      const fraction = hasChildren ? 1 / 6 : 1 / 3;
      const amt = total * fraction;
      shares.push({ heir: t("মা", "Mother"), share: `1/${hasChildren ? 6 : 3}`, amount: amt });
      used += amt;
    }
    if (father) {
      const fraction = 1 / 6; // father always 1/6 minimum, plus residue if no sons
      const amt = total * fraction;
      shares.push({ heir: t("বাবা", "Father"), share: "1/6", amount: amt });
      used += amt;
    }

    // Children: residue distributed 2:1 (son:daughter); if only daughters, 1=1/2 or 2+=2/3
    let residue = total - used;

    if (sons > 0) {
      // Each son = 2 parts, each daughter = 1 part
      const totalParts = sons * 2 + daughters;
      const perPart = residue / totalParts;
      if (sons === 1) {
        shares.push({ heir: t("ছেলে", "Son"), share: t("অবশিষ্টের অংশ", "share of residue"), amount: perPart * 2 });
      } else {
        for (let i = 0; i < sons; i++)
          shares.push({ heir: t(`ছেলে ${i + 1}`, `Son ${i + 1}`), share: t("অবশিষ্টের অংশ", "share of residue"), amount: perPart * 2 });
      }
      for (let i = 0; i < daughters; i++)
        shares.push({ heir: daughters === 1 ? t("মেয়ে", "Daughter") : t(`মেয়ে ${i + 1}`, `Daughter ${i + 1}`), share: t("অবশিষ্টের অংশ", "share of residue"), amount: perPart });
      residue = 0;
    } else if (daughters > 0) {
      // Only daughters: 1 = 1/2, 2+ = 2/3 split equally
      const fraction = daughters === 1 ? 1 / 2 : 2 / 3;
      const total_d = total * fraction;
      const per = total_d / daughters;
      for (let i = 0; i < daughters; i++)
        shares.push({ heir: daughters === 1 ? t("মেয়ে", "Daughter") : t(`মেয়ে ${i + 1}`, `Daughter ${i + 1}`), share: daughters === 1 ? "1/2" : "2/3 ÷ " + daughters, amount: per });
      residue -= total_d;
    }

    // If father exists & residue remains (no sons), father takes residue (asaba)
    if (residue > 0.01 && father) {
      const last = shares.find((s) => s.heir === t("বাবা", "Father"));
      if (last) {
        last.amount += residue;
        last.share += t(" + অবশিষ্ট", " + residue");
      }
      residue = 0;
    }

    // Round money to whole, keep land precise
    if (mode === "money") shares.forEach((s) => (s.amount = Math.round(s.amount)));
    const totalDistributed = shares.reduce((s, x) => s + x.amount, 0);

    return { shares, residue, totalDistributed, total };
  }, [mode, estate, landAmount, landUnit, gender, spouse, sons, daughters, father, mother, language]);

  const fmtMoney = (n: number) => "৳ " + n.toLocaleString("en-IN");

  // Convert decimal -> Bigha + Katha + Decimal breakdown (Bangladesh)
  const fmtLand = (dec: number) => {
    if (dec <= 0) return "0";
    const bigha = Math.floor(dec / 33);
    let rem = dec - bigha * 33;
    const katha = Math.floor(rem / 1.65);
    rem = rem - katha * 1.65;
    const decRemain = rem; // remaining decimal
    const parts: string[] = [];
    if (bigha) parts.push(`${bigha} ${t("বিঘা", "Bigha")}`);
    if (katha) parts.push(`${katha} ${t("কাঠা", "Katha")}`);
    if (decRemain >= 0.01) parts.push(`${decRemain.toFixed(2)} ${t("শতক", "Decimal")}`);
    return parts.length ? parts.join(" ") : `${dec.toFixed(3)} ${t("শতক", "Decimal")}`;
  };

  const fmt = (n: number) => (mode === "money" ? fmtMoney(n) : fmtLand(n));

  return (
    <div className="container py-8 max-w-3xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-3">
            <Scale className="w-3.5 h-3.5" />
            {t("ওয়ারিশ/ফারাইজ ক্যালকুলেটর", "Inheritance (Faraid) Calculator")}
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold mb-2">
            {t("ইসলামি উত্তরাধিকার বণ্টন", "Islamic Inheritance Distribution")}
          </h1>
          <p className="text-muted-foreground text-sm">
            {t("সাধারণ ক্ষেত্রের জন্য — জটিল ক্ষেত্রে আলেমের পরামর্শ নিন", "For common cases — consult a scholar for complex situations")}
          </p>
        </div>

        <Card className="p-6 space-y-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">{t("সম্পত্তির ধরন", "Asset Type")}</label>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => setMode("money")} className={`py-2 rounded-lg text-sm font-semibold border ${mode === "money" ? "border-primary bg-primary/10 text-primary" : "border-border"}`}>
                💰 {t("টাকা/সম্পদ", "Money / Cash")}
              </button>
              <button onClick={() => setMode("land")} className={`py-2 rounded-lg text-sm font-semibold border ${mode === "land" ? "border-primary bg-primary/10 text-primary" : "border-border"}`}>
                🌾 {t("জমি", "Land")}
              </button>
            </div>
          </div>

          {mode === "money" ? (
            <div>
              <label className="text-sm font-medium mb-1.5 block">{t("মোট সম্পত্তি (৳)", "Total estate (BDT)")}</label>
              <Input type="number" value={estate} onChange={(e) => setEstate(e.target.value)} />
              <p className="text-xs text-muted-foreground mt-1">
                {t("দাফন খরচ, ঋণ ও ওসিয়ত (১/৩ পর্যন্ত) বাদ দেওয়ার পর", "After funeral, debts and bequests (up to 1/3)")}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <label className="text-sm font-medium mb-1.5 block">{t("মোট জমির পরিমাণ", "Total land amount")}</label>
              <div className="grid grid-cols-2 gap-2">
                <Input type="number" value={landAmount} onChange={(e) => setLandAmount(e.target.value)} />
                <select value={landUnit} onChange={(e) => setLandUnit(e.target.value as LandUnit)} className="h-10 rounded-md border border-input bg-background px-3 text-sm">
                  <option value="bigha">{t("বিঘা", "Bigha")} (33 dec)</option>
                  <option value="katha">{t("কাঠা", "Katha")} (1.65 dec)</option>
                  <option value="decimal">{t("শতক/ডেসিমেল", "Decimal / Shotok")}</option>
                  <option value="acre">{t("একর", "Acre")} (100 dec)</option>
                  <option value="kani">{t("কানি", "Kani")} (120 dec)</option>
                </select>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {t(
                  `মোট = ${((parseFloat(landAmount) || 0) * TO_DECIMAL[landUnit]).toFixed(2)} শতক (Decimal)। দাফন/ঋণ/ওসিয়ত বাদ দেওয়ার পর হিসাব।`,
                  `Total = ${((parseFloat(landAmount) || 0) * TO_DECIMAL[landUnit]).toFixed(2)} decimal. After funeral/debts/bequests.`
                )}
              </p>
            </div>
          )}


          <div>
            <label className="text-sm font-medium mb-1.5 block">{t("মৃত ব্যক্তি", "Deceased was")}</label>
            <div className="flex gap-2">
              <button onClick={() => setGender("male")} className={`flex-1 py-2 rounded-lg text-sm font-semibold border ${gender === "male" ? "border-primary bg-primary/10 text-primary" : "border-border"}`}>
                {t("পুরুষ", "Male")}
              </button>
              <button onClick={() => setGender("female")} className={`flex-1 py-2 rounded-lg text-sm font-semibold border ${gender === "female" ? "border-primary bg-primary/10 text-primary" : "border-border"}`}>
                {t("নারী", "Female")}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-1.5 block">
                {gender === "male" ? t("স্ত্রীর সংখ্যা", "Number of wives") : t("স্বামী", "Husband")}
              </label>
              <Input type="number" min="0" max={gender === "male" ? 4 : 1} value={spouse}
                onChange={(e) => setSpouse(Math.min(gender === "male" ? 4 : 1, Math.max(0, parseInt(e.target.value) || 0)))} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">{t("ছেলের সংখ্যা", "Number of sons")}</label>
              <Input type="number" min="0" value={sons} onChange={(e) => setSons(Math.max(0, parseInt(e.target.value) || 0))} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">{t("মেয়ের সংখ্যা", "Number of daughters")}</label>
              <Input type="number" min="0" value={daughters} onChange={(e) => setDaughters(Math.max(0, parseInt(e.target.value) || 0))} />
            </div>
            <div className="space-y-2 pt-1">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={mother} onChange={(e) => setMother(e.target.checked)} className="rounded" />
                {t("মা জীবিত", "Mother alive")}
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={father} onChange={(e) => setFather(e.target.checked)} className="rounded" />
                {t("বাবা জীবিত", "Father alive")}
              </label>
            </div>
          </div>
        </Card>

        {calc && calc.shares.length > 0 && (
          <Card className="p-5 mt-4">
            <h3 className="font-display font-bold mb-3 flex items-center gap-2">
              <Users className="w-4 h-4" />{t("বণ্টন", "Distribution")}
            </h3>
            <div className="space-y-2">
              {calc.shares.map((s, i) => (
                <div key={i} className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                  <div>
                    <p className="font-semibold">{s.heir}</p>
                    <p className="text-xs text-muted-foreground">{s.share}</p>
                  </div>
                  <p className="font-display font-bold gradient-text">{fmt(s.amount)}</p>
                </div>
              ))}
              <div className="flex justify-between border-t pt-2 mt-2">
                <span className="text-sm text-muted-foreground">{t("বণ্টিত মোট", "Total distributed")}</span>
                <span className="font-bold">{fmt(calc.totalDistributed)}</span>
              </div>
              {calc.residue > 0.01 && (
                <p className="text-xs text-amber-600 pt-1">
                  {t(`অবশিষ্ট ${fmt(calc.residue)} — অন্য আত্মীয়দের (চাচা/ভাই) মধ্যে যাবে; আলেমের পরামর্শ নিন।`,
                     `Residue ${fmt(calc.residue)} — goes to other relatives (asaba); consult a scholar.`)}
                </p>
              )}
            </div>
          </Card>
        )}

        <div className="flex items-start gap-2 p-3 mt-4 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span>
            {t(
              "নোট: এটি সরলীকৃত হিসাব। ভাই-বোন, দাদা-দাদি, নাতি-নাতনি ইত্যাদি জটিল ক্ষেত্রে অভিজ্ঞ আলেম/মুফতির সাথে পরামর্শ করুন।",
              "Note: Simplified calculation. For complex cases involving siblings, grandparents, grandchildren etc., consult a qualified scholar/mufti."
            )}
          </span>
        </div>
      </motion.div>
    </div>
  );
};

export default Warish;
