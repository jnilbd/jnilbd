import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Sun, Zap, Battery, Plus, Trash2, Search, ShoppingBag, Loader2, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";

type Appliance = { id: string; name: string; watt: number; qty: number; hours: number };

const PRESETS: Array<Omit<Appliance, "id">> = [
  { name: "LED Light", watt: 9, qty: 4, hours: 6 },
  { name: "Ceiling Fan", watt: 75, qty: 2, hours: 8 },
  { name: "TV (LED)", watt: 80, qty: 1, hours: 4 },
  { name: "Refrigerator", watt: 150, qty: 1, hours: 24 },
  { name: "Mobile Charger", watt: 10, qty: 2, hours: 3 },
  { name: "Water Pump (0.5HP)", watt: 400, qty: 1, hours: 1 },
  { name: "Iron", watt: 1000, qty: 1, hours: 0.5 },
  { name: "AC (1 Ton)", watt: 1000, qty: 1, hours: 6 },
];

const SolarCalc = () => {
  const { language } = useLanguage();
  const t = (bn: string, en: string) => (language === "bn" ? bn : en);

  const [items, setItems] = useState<Appliance[]>(
    PRESETS.slice(0, 4).map((p, i) => ({ ...p, id: `${i}` }))
  );
  const [sunHours, setSunHours] = useState("4.5"); // BD avg
  const [autonomyDays, setAutonomyDays] = useState("1");
  const [systemVoltage, setSystemVoltage] = useState("24");

  // Equipment price lookup
  const [priceQuery, setPriceQuery] = useState("");
  const [priceLoading, setPriceLoading] = useState(false);
  const [priceAnswer, setPriceAnswer] = useState<string>("");

  const quickItems = [
    t("সোলার প্যানেল ১০০W", "100W Solar Panel"),
    t("লিথিয়াম ব্যাটারি ১০০Ah", "100Ah Lithium Battery"),
    t("IPS ১.৫ KVA", "1.5 KVA IPS"),
    t("চার্জ কন্ট্রোলার MPPT 60A", "MPPT 60A Controller"),
    t("ওয়ালটন ১.৫ টন AC", "Walton 1.5 Ton AC"),
    t("ফ্রিজ ১৫ ঘনফুট", "Refrigerator 15 cft"),
    t("সিলিং ফ্যান", "Ceiling Fan"),
    t("ওয়াটার পাম্প ০.৫HP", "Water Pump 0.5HP"),
    t("জেনারেটর ২KVA", "2KVA Generator"),
    t("LED টিভি ৪৩\"", "43\" LED TV"),
  ];

  const lookupPrice = async (q?: string) => {
    const query = (q ?? priceQuery).trim();
    if (!query) return;
    if (q) setPriceQuery(q);
    setPriceLoading(true);
    setPriceAnswer("");
    try {
      const { data, error } = await supabase.functions.invoke("equipment-price", {
        body: { query, language },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setPriceAnswer(data?.answer || "");
    } catch (e: any) {
      const msg = String(e?.message || e);
      if (msg.includes("429")) toast.error(t("অনেক বেশি রিকোয়েস্ট — কিছুক্ষণ পর চেষ্টা করুন।", "Too many requests — try again later."));
      else if (msg.includes("402")) toast.error(t("AI ক্রেডিট শেষ — Workspace এ ক্রেডিট যোগ করুন।", "AI credits exhausted — add credits in workspace."));
      else toast.error(t("দাম আনতে সমস্যা হয়েছে।", "Failed to fetch price info."));
    } finally {
      setPriceLoading(false);
    }
  };

  const update = (id: string, patch: Partial<Appliance>) =>
    setItems((arr) => arr.map((a) => (a.id === id ? { ...a, ...patch } : a)));
  const remove = (id: string) => setItems((arr) => arr.filter((a) => a.id !== id));
  const add = (p: Omit<Appliance, "id">) =>
    setItems((arr) => [...arr, { ...p, id: crypto.randomUUID() }]);

  const calc = useMemo(() => {
    const totalWatt = items.reduce((s, a) => s + a.watt * a.qty, 0);
    const dailyWh = items.reduce((s, a) => s + a.watt * a.qty * a.hours, 0);
    const sun = parseFloat(sunHours) || 4.5;
    const auto = parseFloat(autonomyDays) || 1;
    const volt = parseFloat(systemVoltage) || 24;

    // Panel sizing (with 25% loss buffer)
    const panelWp = Math.ceil((dailyWh / sun) * 1.3);
    // Battery (50% DoD, lead-acid)
    const batteryAh = Math.ceil((dailyWh * auto) / (volt * 0.5));
    // Inverter (30% surge headroom)
    const inverterW = Math.ceil(totalWatt * 1.3);
    // Charge controller (panel current * 1.25)
    const chargerA = Math.ceil((panelWp / volt) * 1.25);

    const monthlyKwh = (dailyWh * 30) / 1000;
    // Approx cost in BDT (rough estimates — varies by brand)
    const panelCost = panelWp * 60;
    const batteryCost = batteryAh * 200;
    const inverterCost = inverterW * 8;
    const totalCost = panelCost + batteryCost + inverterCost + 5000;

    return { totalWatt, dailyWh, panelWp, batteryAh, inverterW, chargerA, monthlyKwh, panelCost, batteryCost, inverterCost, totalCost };
  }, [items, sunHours, autonomyDays, systemVoltage]);

  const fmt = (n: number) => n.toLocaleString();

  return (
    <div className="container py-8 max-w-4xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400 text-xs font-semibold mb-3">
            <Sun className="w-3.5 h-3.5" />
            {t("সোলার সিস্টেম ক্যালকুলেটর", "Solar System Calculator")}
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold mb-2">
            {t("আপনার বাড়ির জন্য সঠিক সোলার সেটাপ", "Right solar setup for your home")}
          </h1>
        </div>

        <Card className="p-5 mb-4 space-y-3">
          <h3 className="font-display font-bold flex items-center gap-2"><Zap className="w-4 h-4" /> {t("লোড লিস্ট", "Load List")}</h3>
          {items.map((a) => (
            <div key={a.id} className="grid grid-cols-12 gap-2 items-center">
              <Input className="col-span-12 sm:col-span-4" value={a.name} onChange={(e) => update(a.id, { name: e.target.value })} />
              <div className="col-span-3 sm:col-span-2">
                <label className="text-[10px] text-muted-foreground">W</label>
                <Input type="number" value={a.watt} onChange={(e) => update(a.id, { watt: +e.target.value })} />
              </div>
              <div className="col-span-3 sm:col-span-2">
                <label className="text-[10px] text-muted-foreground">{t("সংখ্যা", "Qty")}</label>
                <Input type="number" value={a.qty} onChange={(e) => update(a.id, { qty: +e.target.value })} />
              </div>
              <div className="col-span-4 sm:col-span-3">
                <label className="text-[10px] text-muted-foreground">{t("ঘণ্টা/দিন", "Hours/day")}</label>
                <Input type="number" step="0.5" value={a.hours} onChange={(e) => update(a.id, { hours: +e.target.value })} />
              </div>
              <button onClick={() => remove(a.id)} className="col-span-2 sm:col-span-1 p-2 rounded hover:bg-muted self-end">
                <Trash2 className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          ))}

          <div className="flex flex-wrap gap-1.5 pt-2 border-t">
            <span className="text-xs text-muted-foreground self-center mr-1">{t("দ্রুত যোগ:", "Quick add:")}</span>
            {PRESETS.map((p) => (
              <button key={p.name} onClick={() => add(p)}
                className="px-2.5 py-1 rounded-full bg-muted text-xs font-medium hover:bg-primary hover:text-primary-foreground transition-smooth">
                <Plus className="w-3 h-3 inline -mt-0.5 mr-0.5" />{p.name}
              </button>
            ))}
          </div>
        </Card>

        <Card className="p-5 mb-4">
          <h3 className="font-display font-bold mb-3 flex items-center gap-2"><Sun className="w-4 h-4" /> {t("সিস্টেম প্যারামিটার", "System Parameters")}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">{t("দৈনিক রোদ (ঘণ্টা)", "Sun hours/day")}</label>
              <Input type="number" step="0.1" value={sunHours} onChange={(e) => setSunHours(e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">{t("ব্যাকআপ দিন", "Backup days")}</label>
              <Input type="number" step="0.5" value={autonomyDays} onChange={(e) => setAutonomyDays(e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">{t("সিস্টেম ভোল্ট", "System volt")}</label>
              <select value={systemVoltage} onChange={(e) => setSystemVoltage(e.target.value)}
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                <option value="12">12V</option><option value="24">24V</option><option value="48">48V</option>
              </select>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          <Card className="p-3 text-center"><Sun className="w-5 h-5 mx-auto mb-1 text-amber-500" /><p className="text-[10px] text-muted-foreground">{t("সোলার প্যানেল", "Solar Panel")}</p><p className="text-xl font-display font-bold gradient-text">{fmt(calc.panelWp)}<span className="text-xs">W</span></p></Card>
          <Card className="p-3 text-center"><Battery className="w-5 h-5 mx-auto mb-1 text-green-600" /><p className="text-[10px] text-muted-foreground">{t("ব্যাটারি", "Battery")}</p><p className="text-xl font-display font-bold gradient-text">{fmt(calc.batteryAh)}<span className="text-xs">Ah</span></p></Card>
          <Card className="p-3 text-center"><Zap className="w-5 h-5 mx-auto mb-1 text-blue-600" /><p className="text-[10px] text-muted-foreground">{t("ইনভার্টার", "Inverter")}</p><p className="text-xl font-display font-bold gradient-text">{fmt(calc.inverterW)}<span className="text-xs">W</span></p></Card>
          <Card className="p-3 text-center"><Zap className="w-5 h-5 mx-auto mb-1 text-fuchsia-600" /><p className="text-[10px] text-muted-foreground">{t("চার্জ কন্ট্রোলার", "Controller")}</p><p className="text-xl font-display font-bold gradient-text">{fmt(calc.chargerA)}<span className="text-xs">A</span></p></Card>
        </div>

        <Card className="p-5">
          <h3 className="font-display font-bold mb-3">{t("সারাংশ ও আনুমানিক খরচ", "Summary & Estimated Cost")}</h3>
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">{t("মোট লোড", "Total load")}</span><span className="font-semibold">{fmt(calc.totalWatt)} W</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">{t("দৈনিক ব্যবহার", "Daily usage")}</span><span className="font-semibold">{fmt(calc.dailyWh)} Wh ({calc.monthlyKwh.toFixed(1)} kWh/mo)</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">{t("প্যানেল খরচ", "Panel cost")}</span><span className="font-semibold">৳ {fmt(calc.panelCost)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">{t("ব্যাটারি খরচ", "Battery cost")}</span><span className="font-semibold">৳ {fmt(calc.batteryCost)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">{t("ইনভার্টার খরচ", "Inverter cost")}</span><span className="font-semibold">৳ {fmt(calc.inverterCost)}</span></div>
            <div className="flex justify-between border-t pt-2 mt-2 text-base"><span className="font-display font-bold">{t("মোট আনুমানিক খরচ", "Total estimated cost")}</span><span className="font-display font-bold gradient-text">৳ {fmt(calc.totalCost)}</span></div>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            {t(
              "নোট: খরচ ব্র্যান্ড, কোয়ালিটি ও বাজার অনুযায়ী পরিবর্তিত হবে। ইনস্টলেশন আলাদা।",
              "Note: Cost varies by brand, quality & market. Installation extra."
            )}
          </p>
        </Card>

        {/* ============== Live Equipment Price Lookup (AI) ============== */}
        <Card className="p-5 mt-6 border-primary/30 bg-gradient-to-br from-primary/5 to-amber-500/5">
          <div className="flex items-center gap-2 mb-1">
            <ShoppingBag className="w-5 h-5 text-primary" />
            <h3 className="font-display font-bold text-lg">
              {t("লাইভ ইকুইপমেন্ট প্রাইস — বাংলাদেশ", "Live Equipment Price — Bangladesh")}
            </h3>
            <span className="ml-auto inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-primary/15 text-primary font-semibold">
              <Sparkles className="w-3 h-3" /> AI
            </span>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            {t(
              "সোলার ইকুইপমেন্ট, ইলেকট্রনিক্স, AC, ফ্রিজ, IPS, জেনারেটর — যেকোনো আইটেমের সর্বশেষ বাজার মূল্য জিজ্ঞেস করুন।",
              "Ask current Bangladesh market price for solar, electronics, AC, fridge, IPS, generator — anything."
            )}
          </p>

          <div className="flex gap-2 mb-3">
            <Input
              placeholder={t("যেমন: ২০০W সোলার প্যানেল, ১.৫ টন AC, ১০০Ah ব্যাটারি…", "e.g. 200W solar panel, 1.5 ton AC, 100Ah battery…")}
              value={priceQuery}
              onChange={(e) => setPriceQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && lookupPrice()}
              disabled={priceLoading}
            />
            <Button onClick={() => lookupPrice()} disabled={priceLoading || !priceQuery.trim()} className="shrink-0">
              {priceLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              <span className="ml-1.5 hidden sm:inline">{t("দেখুন", "Check")}</span>
            </Button>
          </div>

          <div className="flex flex-wrap gap-1.5 mb-3">
            {quickItems.map((q) => (
              <button
                key={q}
                onClick={() => lookupPrice(q)}
                disabled={priceLoading}
                className="px-2.5 py-1 rounded-full bg-muted text-xs font-medium hover:bg-primary hover:text-primary-foreground transition-smooth disabled:opacity-50"
              >
                {q}
              </button>
            ))}
          </div>

          {priceLoading && (
            <div className="flex items-center gap-2 p-4 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              {t("সর্বশেষ বাজার মূল্য আনা হচ্ছে…", "Fetching latest market prices…")}
            </div>
          )}

          {priceAnswer && !priceLoading && (
            <div className="p-4 rounded-xl bg-card border prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{priceAnswer}</ReactMarkdown>
              <p className="text-[10px] text-muted-foreground border-t pt-2 mt-3 not-prose">
                {t(
                  "⚠️ AI দ্বারা প্রদত্ত আনুমানিক মূল্য। কেনার আগে অবশ্যই দোকানে কনফার্ম করুন।",
                  "⚠️ AI-estimated prices. Always confirm with the shop before purchase."
                )}
              </p>
            </div>
          )}
        </Card>
      </motion.div>
    </div>
  );
};

export default SolarCalc;
