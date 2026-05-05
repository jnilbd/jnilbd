import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Ruler, Activity } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useLanguage } from "@/contexts/LanguageContext";

const HeightCalc = () => {
  const { language } = useLanguage();
  const t = (bn: string, en: string) => (language === "bn" ? bn : en);

  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [cm, setCm] = useState("170");
  const [ft, setFt] = useState("5");
  const [inch, setInch] = useState("7");
  const [kg, setKg] = useState("65");
  const [age, setAge] = useState("25");
  const [gender, setGender] = useState<"male" | "female">("male");

  const heightCm = useMemo(() => {
    if (unit === "metric") return parseFloat(cm) || 0;
    return ((parseFloat(ft) || 0) * 12 + (parseFloat(inch) || 0)) * 2.54;
  }, [unit, cm, ft, inch]);

  const weightKg = parseFloat(kg) || 0;
  const ageNum = parseInt(age) || 0;

  const heightM = heightCm / 100;
  const bmi = heightM > 0 ? weightKg / (heightM * heightM) : 0;
  const bmiCat = bmi < 18.5 ? t("কম ওজন", "Underweight") : bmi < 25 ? t("স্বাভাবিক", "Normal") : bmi < 30 ? t("অতিরিক্ত ওজন", "Overweight") : t("স্থূলতা", "Obese");
  const bmiColor = bmi < 18.5 ? "text-blue-600" : bmi < 25 ? "text-green-600" : bmi < 30 ? "text-amber-600" : "text-red-600";

  // Ideal weight (Devine formula)
  const inches = heightCm / 2.54;
  const overFive = Math.max(0, inches - 60);
  const idealKg = gender === "male" ? 50 + 2.3 * overFive : 45.5 + 2.3 * overFive;

  // BMR (Mifflin-St Jeor)
  const bmr = gender === "male"
    ? 10 * weightKg + 6.25 * heightCm - 5 * ageNum + 5
    : 10 * weightKg + 6.25 * heightCm - 5 * ageNum - 161;

  // Body Surface Area (Mosteller)
  const bsa = Math.sqrt((heightCm * weightKg) / 3600);

  // Frame calculation (wrist circumference – simplified: just height/wrist if user knew)

  // Convert
  const toFtIn = (c: number) => {
    const totalIn = c / 2.54;
    const f = Math.floor(totalIn / 12);
    const i = Math.round(totalIn - f * 12);
    return `${f}'${i}"`;
  };

  const fmt = (n: number) => isFinite(n) ? n.toFixed(1) : "—";

  return (
    <div className="container py-8 max-w-3xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-3">
            <Ruler className="w-3.5 h-3.5" />
            {t("উচ্চতা ও দৈহিক ক্যালকুলেটর", "Height & Body Calculator")}
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold mb-2">
            {t("BMI, আদর্শ ওজন, BMR — সব এক জায়গায়", "BMI, Ideal Weight, BMR — all-in-one")}
          </h1>
        </div>

        <Card className="p-6 space-y-4">
          <Tabs value={unit} onValueChange={(v) => setUnit(v as "metric" | "imperial")}>
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="metric">{t("মেট্রিক (cm/kg)", "Metric (cm/kg)")}</TabsTrigger>
              <TabsTrigger value="imperial">{t("ইম্পেরিয়াল (ft/in)", "Imperial (ft/in)")}</TabsTrigger>
            </TabsList>

            <TabsContent value="metric" className="mt-3">
              <label className="text-sm font-medium mb-1.5 block">{t("উচ্চতা (cm)", "Height (cm)")}</label>
              <Input type="number" value={cm} onChange={(e) => setCm(e.target.value)} />
            </TabsContent>
            <TabsContent value="imperial" className="mt-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">{t("ফুট", "Feet")}</label>
                  <Input type="number" value={ft} onChange={(e) => setFt(e.target.value)} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">{t("ইঞ্চি", "Inches")}</label>
                  <Input type="number" value={inch} onChange={(e) => setInch(e.target.value)} />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-sm font-medium mb-1.5 block">{t("ওজন (kg)", "Weight (kg)")}</label>
              <Input type="number" value={kg} onChange={(e) => setKg(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">{t("বয়স", "Age")}</label>
              <Input type="number" value={age} onChange={(e) => setAge(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">{t("লিঙ্গ", "Gender")}</label>
              <select value={gender} onChange={(e) => setGender(e.target.value as "male" | "female")}
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                <option value="male">{t("পুরুষ", "Male")}</option>
                <option value="female">{t("নারী", "Female")}</option>
              </select>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
          <Card className="p-4">
            <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><Activity className="w-3 h-3" />BMI</p>
            <p className={`text-3xl font-display font-bold ${bmiColor}`}>{fmt(bmi)}</p>
            <p className={`text-sm font-semibold ${bmiColor}`}>{bmiCat}</p>
          </Card>
          <Card className="p-4">
            <p className="text-xs text-muted-foreground mb-1">{t("আদর্শ ওজন (Devine)", "Ideal Weight (Devine)")}</p>
            <p className="text-3xl font-display font-bold gradient-text">{fmt(idealKg)} kg</p>
            <p className="text-xs text-muted-foreground">≈ {fmt(idealKg * 2.205)} lb</p>
          </Card>
          <Card className="p-4">
            <p className="text-xs text-muted-foreground mb-1">{t("BMR (বিশ্রামে ক্যালরি/দিন)", "BMR (cal/day at rest)")}</p>
            <p className="text-3xl font-display font-bold gradient-text">{fmt(bmr)}</p>
            <p className="text-xs text-muted-foreground">{t("সক্রিয়: ~", "Active: ~")}{fmt(bmr * 1.55)} cal</p>
          </Card>
          <Card className="p-4">
            <p className="text-xs text-muted-foreground mb-1">{t("দৈহিক পৃষ্ঠতল (BSA)", "Body Surface Area")}</p>
            <p className="text-3xl font-display font-bold gradient-text">{fmt(bsa)} m²</p>
            <p className="text-xs text-muted-foreground">{toFtIn(heightCm)} · {fmt(heightCm)} cm</p>
          </Card>
        </div>

        <Card className="p-5 mt-4 text-sm">
          <h3 className="font-display font-bold mb-2">{t("BMI গাইডলাইন (WHO)", "BMI Guide (WHO)")}</h3>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div><span className="text-blue-600 font-semibold">&lt; 18.5</span> {t("কম ওজন", "Underweight")}</div>
            <div><span className="text-green-600 font-semibold">18.5–24.9</span> {t("স্বাভাবিক", "Normal")}</div>
            <div><span className="text-amber-600 font-semibold">25–29.9</span> {t("অতিরিক্ত ওজন", "Overweight")}</div>
            <div><span className="text-red-600 font-semibold">≥ 30</span> {t("স্থূলতা", "Obese")}</div>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            {t(
              "নোট: BMI পেশী বনাম চর্বি পার্থক্য করে না। গর্ভবতী, বডিবিল্ডার বা শিশুদের জন্য আলাদা স্ট্যান্ডার্ড আছে।",
              "Note: BMI doesn't distinguish muscle vs fat. Pregnant women, bodybuilders & children need different scales."
            )}
          </p>
        </Card>
      </motion.div>
    </div>
  );
};

export default HeightCalc;
