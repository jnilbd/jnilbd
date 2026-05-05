import { useState } from "react";
import { motion } from "framer-motion";
import { Smartphone, Laptop, Monitor, Tablet, Headphones, Watch, Loader2, Sparkles } from "lucide-react";
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
      </motion.div>
    </div>
  );
};

export default GadgetAdvisor;
