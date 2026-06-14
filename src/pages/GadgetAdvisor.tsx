import { useState } from "react";
import { motion } from "framer-motion";
import { Smartphone, Laptop, Monitor, Tablet, Headphones, Watch, Loader2, Sparkles, Globe2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const CATEGORIES = [
  { id: "smartphone", icon: Smartphone, bn: "মোবাইল", en: "Smartphone" },
  { id: "laptop", icon: Laptop, bn: "ল্যাপটপ", en: "Laptop" },
  { id: "desktop", icon: Monitor, bn: "ডেস্কটপ পিসি", en: "Desktop PC" },
  { id: "tablet", icon: Tablet, bn: "ট্যাবলেট", en: "Tablet" },
  { id: "headphone", icon: Headphones, bn: "হেডফোন/ইয়ারবাড", en: "Headphones/Earbuds" },
  { id: "smartwatch", icon: Watch, bn: "স্মার্টওয়াচ", en: "Smartwatch" },
];

const QUICK_BUDGETS = [10000, 20000, 30000, 50000, 80000, 120000, 200000];

const GadgetAdvisor = () => {
  const { language } = useLanguage();
  const isBn = language === "bn";
  const [budget, setBudget] = useState("");
  const [category, setCategory] = useState("smartphone");
  const [requirements, setRequirements] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

  // Global price comparison state
  const COUNTRIES = [
    { id: "Bangladesh", bn: "বাংলাদেশ" },
    { id: "India", bn: "ইন্ডিয়া" },
    { id: "Nepal", bn: "নেপাল" },
    { id: "China", bn: "চায়না" },
    { id: "USA", bn: "আমেরিকা" },
    { id: "UAE", bn: "দুবাই/UAE" },
    { id: "UK", bn: "ইউকে" },
    { id: "Japan", bn: "জাপান" },
    { id: "Singapore", bn: "সিঙ্গাপুর" },
    { id: "Malaysia", bn: "মালয়েশিয়া" },
    { id: "Saudi Arabia", bn: "সৌদি আরব" },
    { id: "Pakistan", bn: "পাকিস্তান" },
  ];
  const [product, setProduct] = useState("");
  const [selectedCountries, setSelectedCountries] = useState<string[]>([
    "Bangladesh", "India", "Nepal", "China", "USA", "UAE",
  ]);
  const [cmpLoading, setCmpLoading] = useState(false);
  const [cmpResult, setCmpResult] = useState("");

  const toggleCountry = (c: string) => {
    setSelectedCountries((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
    );
  };

  const handleCompare = async () => {
    if (!product.trim()) {
      toast.error(isBn ? "প্রোডাক্ট/মডেল লিখুন" : "Enter product/model");
      return;
    }
    if (selectedCountries.length < 2) {
      toast.error(isBn ? "কমপক্ষে ২টি দেশ বাছুন" : "Pick at least 2 countries");
      return;
    }
    setCmpLoading(true);
    setCmpResult("");
    try {
      const { data, error } = await supabase.functions.invoke("global-price-compare", {
        body: { product, countries: selectedCountries, language },
      });
      if (error) throw error;
      if (data.error) throw new Error(data.error);
      setCmpResult(data.comparison);
    } catch (e: any) {
      toast.error(e.message || "Failed");
    } finally {
      setCmpLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!budget || Number(budget) < 1000) {
      toast.error(isBn ? "সঠিক বাজেট দিন (১০০০+)" : "Enter valid budget (1000+)");
      return;
    }
    setLoading(true);
    setResult("");
    try {
      const cat = CATEGORIES.find((c) => c.id === category);
      const { data, error } = await supabase.functions.invoke("gadget-advisor", {
        body: {
          budget: Number(budget),
          category: cat ? (isBn ? cat.bn : cat.en) : category,
          requirements,
          language,
        },
      });
      if (error) throw error;
      if (data.error) throw new Error(data.error);
      setResult(data.recommendation);
    } catch (e: any) {
      toast.error(e.message || "Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-8 max-w-4xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-7 h-7 text-primary" />
          <h1 className="text-3xl md:text-4xl font-display font-bold">
            {isBn ? "গ্যাজেট অ্যাডভাইজার" : "Gadget Advisor"}
          </h1>
        </div>
        <p className="text-muted-foreground mb-6">
          {isBn
            ? "আপনার বাজেট দিন — বাংলাদেশি বাজারের আপডেট প্রাইস অনুযায়ী AI সেরা মোবাইল/ল্যাপটপ সাজেস্ট করবে (নতুন + পুরোনো ভ্যালু পিকসহ)"
            : "Enter your budget — AI suggests best gadgets from BD market (new + older value picks)"}
        </p>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{isBn ? "ক্যাটাগরি বাছুন" : "Select Category"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {CATEGORIES.map((c) => (
                <Button
                  key={c.id}
                  variant={category === c.id ? "default" : "outline"}
                  onClick={() => setCategory(c.id)}
                  className="justify-start h-auto py-3"
                >
                  <c.icon className="w-4 h-4 mr-2" />
                  {isBn ? c.bn : c.en}
                </Button>
              ))}
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                {isBn ? "আপনার বাজেট (৳ BDT)" : "Your Budget (৳ BDT)"}
              </label>
              <Input
                type="number"
                placeholder={isBn ? "যেমন: ২৫০০০" : "e.g. 25000"}
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
              />
              <div className="flex flex-wrap gap-2 mt-2">
                {QUICK_BUDGETS.map((b) => (
                  <Badge
                    key={b}
                    variant={budget === String(b) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setBudget(String(b))}
                  >
                    ৳{b.toLocaleString()}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                {isBn ? "বিশেষ প্রয়োজন (ঐচ্ছিক)" : "Specific Needs (optional)"}
              </label>
              <Textarea
                placeholder={
                  isBn
                    ? "যেমন: গেমিং, ফটোগ্রাফি, ভিডিও এডিটিং, ব্যাটারি লং, পড়াশোনা..."
                    : "e.g. gaming, photography, video editing, long battery, study..."
                }
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                rows={3}
              />
            </div>

            <Button onClick={handleAnalyze} disabled={loading} className="w-full" size="lg">
              {loading ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{isBn ? "এনালাইজ হচ্ছে..." : "Analyzing..."}</>
              ) : (
                <><Sparkles className="w-4 h-4 mr-2" />{isBn ? "AI সাজেশন পান" : "Get AI Recommendations"}</>
              )}
            </Button>
          </CardContent>
        </Card>

        {result && (
          <Card>
            <CardHeader>
              <CardTitle>{isBn ? "🎯 সাজেশন" : "🎯 Recommendations"}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown>{result}</ReactMarkdown>
              </div>
              <p className="text-xs text-muted-foreground mt-4 italic">
                {isBn
                  ? "⚠️ দাম আনুমানিক — কেনার আগে Star Tech/Ryans/Daraz এ যাচাই করুন"
                  : "⚠️ Prices approximate — verify on Star Tech/Ryans/Daraz before buying"}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Global Price Comparison */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe2 className="w-5 h-5 text-primary" />
              {isBn ? "🌍 গ্লোবাল প্রাইস তুলনা (AI)" : "🌍 Global Price Comparison (AI)"}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {isBn
                ? "একই গ্যাজেট/প্রোডাক্ট বিভিন্ন দেশে কত দামে পাওয়া যাচ্ছে — বাংলাদেশ, ইন্ডিয়া, নেপাল, চায়না, আমেরিকাসহ পার্থক্য দেখুন।"
                : "Compare the same gadget/product price across Bangladesh, India, Nepal, China, USA and more."}
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                {isBn ? "প্রোডাক্ট/মডেল" : "Product / Model"}
              </label>
              <Input
                placeholder={
                  isBn
                    ? "যেমন: iPhone 16 Pro 256GB, MacBook Air M3, Samsung 55\" QLED TV, RTX 4070..."
                    : "e.g. iPhone 16 Pro 256GB, MacBook Air M3, Samsung 55\" QLED TV, RTX 4070..."
                }
                value={product}
                onChange={(e) => setProduct(e.target.value)}
              />
              <div className="flex flex-wrap gap-2 mt-2">
                {[
                  "iPhone 16 Pro 256GB",
                  "Samsung Galaxy S24 Ultra",
                  "MacBook Air M3",
                  "Dell XPS 15",
                  'Sony 65" Bravia TV',
                  "iPad Air M2",
                  "PS5 Slim",
                  "RTX 4070 GPU",
                ].map((p) => (
                  <Badge
                    key={p}
                    variant="outline"
                    className="cursor-pointer"
                    onClick={() => setProduct(p)}
                  >
                    {p}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                {isBn ? "দেশ বাছুন (২+)" : "Select Countries (2+)"}
              </label>
              <div className="flex flex-wrap gap-2">
                {COUNTRIES.map((c) => (
                  <Badge
                    key={c.id}
                    variant={selectedCountries.includes(c.id) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleCountry(c.id)}
                  >
                    {isBn ? c.bn : c.id}
                  </Badge>
                ))}
              </div>
            </div>

            <Button onClick={handleCompare} disabled={cmpLoading} className="w-full" size="lg">
              {cmpLoading ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{isBn ? "তুলনা হচ্ছে..." : "Comparing..."}</>
              ) : (
                <><Globe2 className="w-4 h-4 mr-2" />{isBn ? "প্রাইস তুলনা দেখুন" : "Compare Prices"}</>
              )}
            </Button>

            {cmpResult && (
              <div className="mt-4 border-t pt-4">
                <div className="prose prose-sm dark:prose-invert max-w-none overflow-x-auto">
                  <ReactMarkdown
                    components={{
                      table: ({ node, ...props }) => (
                        <table className="w-full border-collapse text-xs md:text-sm" {...props} />
                      ),
                      th: ({ node, ...props }) => (
                        <th className="border border-border px-2 py-1 bg-muted text-left" {...props} />
                      ),
                      td: ({ node, ...props }) => (
                        <td className="border border-border px-2 py-1" {...props} />
                      ),
                    }}
                  >
                    {cmpResult}
                  </ReactMarkdown>
                </div>
                <p className="text-xs text-muted-foreground mt-3 italic">
                  {isBn
                    ? "⚠️ দাম আনুমানিক — ট্যাক্স, কাস্টমস ও কারেন্সি রেট পরিবর্তনশীল। কেনার আগে অফিসিয়াল রিটেইলার থেকে যাচাই করুন।"
                    : "⚠️ Prices are approximate — taxes, customs & FX rates vary. Verify with official retailers before buying."}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default GadgetAdvisor;
