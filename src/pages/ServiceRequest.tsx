import { useState } from "react";
import { motion } from "framer-motion";
import { Send, Sparkles, AlertCircle, CheckCircle2, MessageCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const SERVICE_TYPES_BN = [
  "ওয়েবসাইট ডিজাইন/ডেভেলপমেন্ট",
  "মোবাইল অ্যাপ",
  "গ্রাফিক্স / লোগো ডিজাইন",
  "ভিডিও এডিটিং / অ্যানিমেশন",
  "ডিজিটাল মার্কেটিং",
  "SEO / কন্টেন্ট",
  "AI / অটোমেশন",
  "নতুন ফিচার রিকোয়েস্ট (এই সাইটে)",
  "অন্যান্য",
];
const SERVICE_TYPES_EN = [
  "Website Design/Development",
  "Mobile App",
  "Graphics / Logo Design",
  "Video Editing / Animation",
  "Digital Marketing",
  "SEO / Content",
  "AI / Automation",
  "New Feature Request (this site)",
  "Other",
];

const ServiceRequest = () => {
  const { language } = useLanguage();
  const bn = language === "bn";
  const types = bn ? SERVICE_TYPES_BN : SERVICE_TYPES_EN;

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [serviceType, setServiceType] = useState(types[0]);
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("");
  const [urgent, setUrgent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !description.trim()) {
      toast.error(bn ? "নাম, ফোন ও বিবরণ আবশ্যক" : "Name, phone & description required");
      return;
    }
    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from("service_requests").insert({
        user_id: user?.id ?? null,
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || null,
        service_type: serviceType,
        description: description.trim(),
        budget: budget.trim() || null,
        urgent,
      });
      if (error) throw error;
      setSubmitted(true);
      toast.success(bn ? "✅ আপনার রিকোয়েস্ট পাঠানো হয়েছে" : "✅ Your request was sent");
    } catch (err: any) {
      toast.error(err.message || "Failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="container py-16 max-w-2xl">
        <Card className="text-center">
          <CardContent className="p-10">
            <CheckCircle2 className="w-16 h-16 mx-auto text-green-500 mb-4" />
            <h2 className="text-2xl font-display font-bold mb-2">
              {bn ? "ধন্যবাদ!" : "Thank you!"}
            </h2>
            <p className="text-muted-foreground mb-6">
              {bn
                ? "আমি ২৪ ঘণ্টার মধ্যে আপনাকে কল/মেসেজ করব। জরুরি হলে সরাসরি WhatsApp করুন।"
                : "I'll call/message you within 24 hours. For urgent matters, WhatsApp me directly."}
            </p>
            <a
              href={`https://wa.me/8801774585757?text=${encodeURIComponent(`Hi, I just submitted a service request. ${serviceType}: ${description}`)}`}
              target="_blank"
              rel="noreferrer"
            >
              <Button className="rounded-full bg-green-500 hover:bg-green-600 text-white">
                <MessageCircle className="w-4 h-4 mr-2" />
                {bn ? "WhatsApp এ যোগাযোগ" : "WhatsApp Now"}
              </Button>
            </a>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8 lg:py-12 max-w-3xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 text-secondary text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            {bn ? "কাস্টম রিকোয়েস্ট" : "Custom Request"}
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold mb-2">
            {bn ? "🛠️ সার্ভিস রিকোয়েস্ট পাঠান" : "🛠️ Send a Service Request"}
          </h1>
          <p className="text-muted-foreground">
            {bn
              ? "নতুন সার্ভিস, কাস্টম প্রজেক্ট, অথবা এই ওয়েবসাইটে নতুন কোনো ফিচার চান? আমাকে জানান — যত দ্রুত সম্ভব রিপ্লাই দিব।"
              : "Need a new service, custom project, or a new feature on this site? Tell me — I'll reply as soon as possible."}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="w-5 h-5 text-primary" />
              {bn ? "রিকোয়েস্ট ফর্ম" : "Request Form"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label>{bn ? "আপনার নাম *" : "Your Name *"}</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div>
                  <Label>{bn ? "ফোন / WhatsApp *" : "Phone / WhatsApp *"}</Label>
                  <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+8801XXXXXXXXX" required />
                </div>
              </div>

              <div>
                <Label>{bn ? "ইমেইল (ঐচ্ছিক)" : "Email (optional)"}</Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>

              <div>
                <Label>{bn ? "কী ধরনের সার্ভিস?" : "Service Type"}</Label>
                <select
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value)}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                >
                  {types.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label>{bn ? "বিস্তারিত বিবরণ *" : "Detailed Description *"}</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={5}
                  placeholder={bn ? "আপনার প্রয়োজন বিস্তারিত লিখুন..." : "Describe what you need in detail..."}
                  required
                />
              </div>

              <div>
                <Label>{bn ? "আনুমানিক বাজেট (ঐচ্ছিক)" : "Approx. Budget (optional)"}</Label>
                <Input value={budget} onChange={(e) => setBudget(e.target.value)} placeholder={bn ? "যেমন: ১০,০০০ টাকা" : "e.g. 10,000 BDT"} />
              </div>

              <div className="flex items-center gap-2 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                <Checkbox id="urgent" checked={urgent} onCheckedChange={(v) => setUrgent(!!v)} />
                <Label htmlFor="urgent" className="cursor-pointer flex items-center gap-1.5 text-sm">
                  <AlertCircle className="w-4 h-4 text-yellow-600" />
                  {bn ? "জরুরি — দ্রুত যোগাযোগ চাই" : "Urgent — need quick contact"}
                </Label>
              </div>

              <Button type="submit" disabled={submitting} size="lg" className="w-full gradient-bg-primary text-white rounded-full">
                {submitting ? (bn ? "পাঠানো হচ্ছে..." : "Sending...") : (bn ? "📨 রিকোয়েস্ট পাঠান" : "📨 Send Request")}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                {bn
                  ? "আপনার তথ্য নিরাপদ — শুধু আমার কাছে পৌঁছাবে।"
                  : "Your info is safe — only reaches me."}
              </p>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default ServiceRequest;
