import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Send, Clock, MessageSquare, Phone, Trash2, ExternalLink, CheckCircle2, AlertCircle, Hourglass, Sparkles, Loader2, Copy, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const OCCASIONS = [
  { value: "birthday",        bn: "জন্মদিন",                 en: "Birthday",            emoji: "🎂" },
  { value: "anniversary",     bn: "বিবাহ বার্ষিকী",         en: "Anniversary",         emoji: "💍" },
  { value: "love",            bn: "ভালোবাসা / প্রিয়তম(া)",  en: "Love / Sweetheart",   emoji: "❤️" },
  { value: "valentine",       bn: "ভ্যালেন্টাইন ডে",         en: "Valentine's Day",     emoji: "💘" },
  { value: "miss_you",        bn: "তোমাকে মিস করছি",         en: "Miss You",            emoji: "🥺" },
  { value: "good_morning",    bn: "শুভ সকাল",                 en: "Good Morning",        emoji: "🌅" },
  { value: "good_night",      bn: "শুভ রাত্রি",               en: "Good Night",          emoji: "🌙" },
  { value: "sorry",           bn: "ক্ষমা চাওয়া",             en: "Sorry / Apology",     emoji: "🙏" },
  { value: "thank_you",       bn: "ধন্যবাদ",                  en: "Thank You",           emoji: "🌸" },
  { value: "get_well",        bn: "সুস্থতা কামনা",            en: "Get Well Soon",       emoji: "🌿" },
  { value: "condolence",      bn: "শোক বার্তা",               en: "Condolence",          emoji: "🤍" },
  { value: "congratulations", bn: "অভিনন্দন",                 en: "Congratulations",     emoji: "🎉" },
  { value: "new_job",         bn: "নতুন চাকরি",               en: "New Job",             emoji: "💼" },
  { value: "exam_result",     bn: "পরীক্ষার ফলাফল",           en: "Exam Result",         emoji: "📚" },
  { value: "engagement",      bn: "বাগদান",                   en: "Engagement",          emoji: "💞" },
  { value: "wedding",         bn: "বিয়ে",                    en: "Wedding",             emoji: "👰" },
  { value: "baby_born",       bn: "নবজাতক",                   en: "New Baby",            emoji: "👶" },
  { value: "eid",             bn: "ঈদ মোবারক",               en: "Eid Mubarak",         emoji: "🌙" },
  { value: "ramadan",         bn: "রমজান শুভেচ্ছা",           en: "Ramadan Kareem",      emoji: "🕌" },
  { value: "puja",            bn: "পূজা শুভেচ্ছা",            en: "Puja Greetings",      emoji: "🪔" },
  { value: "new_year",        bn: "নববর্ষ",                   en: "New Year",            emoji: "🎊" },
  { value: "pohela_boishakh", bn: "পহেলা বৈশাখ",              en: "Pohela Boishakh",     emoji: "🌼" },
  { value: "mothers_day",     bn: "মা দিবস",                  en: "Mother's Day",        emoji: "👩" },
  { value: "fathers_day",     bn: "বাবা দিবস",                en: "Father's Day",        emoji: "👨" },
  { value: "friendship",      bn: "বন্ধুত্ব দিবস",            en: "Friendship Day",      emoji: "🤝" },
  { value: "meeting_reminder",bn: "মিটিং রিমাইন্ডার",         en: "Meeting Reminder",    emoji: "📅" },
  { value: "payment_reminder",bn: "পেমেন্ট রিমাইন্ডার",       en: "Payment Reminder",    emoji: "💸" },
];

const RELATIONSHIPS = [
  { value: "lover",     bn: "প্রিয়তম(া)",    en: "Sweetheart" },
  { value: "spouse",    bn: "স্ত্রী/স্বামী",  en: "Spouse" },
  { value: "friend",    bn: "বন্ধু",          en: "Friend" },
  { value: "family",    bn: "পরিবার",         en: "Family" },
  { value: "parent",    bn: "বাবা/মা",        en: "Parent" },
  { value: "sibling",   bn: "ভাই/বোন",       en: "Sibling" },
  { value: "child",     bn: "সন্তান",         en: "Child" },
  { value: "colleague", bn: "সহকর্মী",        en: "Colleague" },
  { value: "client",    bn: "ক্লায়েন্ট",      en: "Client" },
  { value: "teacher",   bn: "শিক্ষক",         en: "Teacher" },
];

type AITemplate = { title: string; text: string };

type ScheduledMessage = {
  id: string;
  recipient_name: string;
  recipient_phone: string;
  channel: string;
  message: string;
  send_at: string;
  status: string;
  sent_at: string | null;
  error: string | null;
};

const Scheduler = () => {
  const { language } = useLanguage();
  const { user, loading: authLoading } = useAuth();
  const t = (bn: string, en: string) => (language === "bn" ? bn : en);

  const [items, setItems] = useState<ScheduledMessage[]>([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [channel, setChannel] = useState("whatsapp");
  const [message, setMessage] = useState("");
  const [sendAt, setSendAt] = useState("");
  const [busy, setBusy] = useState(false);

  const load = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("scheduled_messages")
      .select("*")
      .order("send_at", { ascending: false });
    if (!error && data) setItems(data as ScheduledMessage[]);
  };

  useEffect(() => {
    load();
    const ch = supabase
      .channel("sm-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "scheduled_messages" }, load)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const handleSchedule = async () => {
    if (!user) return;
    if (!name || !phone || !message || !sendAt) {
      toast.error(t("সব ফিল্ড পূরণ করুন", "Please fill all fields"));
      return;
    }
    const when = new Date(sendAt);
    if (isNaN(when.getTime()) || when.getTime() < Date.now() - 60_000) {
      toast.error(t("ভবিষ্যতের সময় দিন", "Pick a future time"));
      return;
    }
    setBusy(true);
    const { error } = await supabase.from("scheduled_messages").insert({
      user_id: user.id,
      recipient_name: name.trim().slice(0, 100),
      recipient_phone: phone.trim().slice(0, 20),
      channel,
      message: message.trim().slice(0, 1000),
      send_at: when.toISOString(),
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(t("শিডিউল করা হয়েছে!", "Scheduled successfully!"));
      setName(""); setPhone(""); setMessage(""); setSendAt("");
      load();
    }
  };

  const handleDelete = async (id: string) => {
    await supabase.from("scheduled_messages").delete().eq("id", id);
    load();
  };

  const buildWaLink = (m: ScheduledMessage) => {
    const phone = m.recipient_phone.replace(/\D/g, "");
    return `https://wa.me/${phone}?text=${encodeURIComponent(m.message)}`;
  };
  const buildSmsLink = (m: ScheduledMessage) => {
    return `sms:${m.recipient_phone}?body=${encodeURIComponent(m.message)}`;
  };

  if (authLoading) return <div className="container py-12 text-center text-muted-foreground">Loading...</div>;
  if (!user) {
    return (
      <div className="container py-12 max-w-md text-center">
        <Clock className="w-12 h-12 mx-auto mb-4 text-primary" />
        <h1 className="text-2xl font-display font-bold mb-2">
          {t("লগইন প্রয়োজন", "Login required")}
        </h1>
        <p className="text-muted-foreground mb-4">
          {t("শিডিউলড মেসেজ ব্যবহার করতে লগইন করুন", "Login to use scheduled messages")}
        </p>
        <Link to="/auth"><Button size="lg">{t("লগইন করুন", "Login")}</Button></Link>
      </div>
    );
  }

  const statusBadge = (s: string) => {
    const map: Record<string, { c: string; icon: React.ElementType; bn: string; en: string }> = {
      pending: { c: "bg-amber-500/15 text-amber-700 dark:text-amber-400", icon: Hourglass, bn: "অপেক্ষমান", en: "Pending" },
      sent: { c: "bg-green-500/15 text-green-700 dark:text-green-400", icon: CheckCircle2, bn: "পাঠানো হয়েছে", en: "Sent" },
      ready: { c: "bg-blue-500/15 text-blue-700 dark:text-blue-400", icon: Send, bn: "পাঠাতে প্রস্তুত", en: "Ready to send" },
      failed: { c: "bg-red-500/15 text-red-700 dark:text-red-400", icon: AlertCircle, bn: "ব্যর্থ", en: "Failed" },
    };
    const v = map[s] || map.pending;
    const Icon = v.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${v.c}`}>
        <Icon className="w-3 h-3" />
        {language === "bn" ? v.bn : v.en}
      </span>
    );
  };

  return (
    <div className="container py-8 max-w-3xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-3">
            <Clock className="w-3.5 h-3.5" />
            {t("শিডিউলড মেসেজ", "Scheduled Messages")}
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold mb-2">
            {t("নির্দিষ্ট সময়ে উইশ/মেসেজ পাঠান", "Send wishes/messages at the perfect time")}
          </h1>
          <p className="text-muted-foreground text-sm">
            {t(
              "জন্মদিন, এনিভার্সারি, রিমাইন্ডার — WhatsApp বা SMS-এ অটোমেটিক রেডি",
              "Birthdays, anniversaries, reminders — auto-ready on WhatsApp or SMS"
            )}
          </p>
        </div>

        <Card className="p-6 space-y-4 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">{t("প্রাপকের নাম", "Recipient name")}</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={t("যেমন: রাহিম", "e.g. Rahim")} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">{t("ফোন নম্বর (+ সহ)", "Phone (with +country)")}</label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+8801XXXXXXXXX" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">{t("চ্যানেল", "Channel")}</label>
              <Select value={channel} onValueChange={setChannel}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  <SelectItem value="sms">SMS</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">{t("কখন পাঠাবে", "Send at")}</label>
              <Input type="datetime-local" value={sendAt} onChange={(e) => setSendAt(e.target.value)} />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block">{t("মেসেজ", "Message")}</label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t("শুভ জন্মদিন! অনেক অনেক শুভেচ্ছা...", "Happy birthday! Wishing you all the best...")}
              rows={4}
              maxLength={1000}
            />
            <p className="text-xs text-muted-foreground mt-1">{message.length}/1000</p>
          </div>

          <Button onClick={handleSchedule} disabled={busy} size="lg" className="w-full">
            <Clock className="w-4 h-4 mr-2" />
            {t("শিডিউল করো", "Schedule")}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            {t(
              "সময় হলে আমরা চেষ্টা করব অটো-পাঠাতে। অটো-সেন্ড সেট না থাকলে \"প্রস্তুত\" দেখাবে — এক ক্লিকে WhatsApp/SMS-এ পাঠাবেন।",
              "We'll try to auto-send when due. Without auto-send, it shows \"Ready\" — one click to send via WhatsApp/SMS."
            )}
          </p>
        </Card>

        <h2 className="text-xl font-display font-bold mb-3 flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          {t("আপনার শিডিউল", "Your schedule")} ({items.length})
        </h2>

        {items.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-8">
            {t("এখনো কিছু শিডিউল করেননি", "No scheduled messages yet")}
          </p>
        ) : (
          <div className="space-y-3">
            {items.map((m) => (
              <Card key={m.id} className="p-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold truncate">{m.recipient_name}</p>
                      {statusBadge(m.status)}
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <Phone className="w-3 h-3" />{m.recipient_phone} · {m.channel}
                    </p>
                  </div>
                  <button onClick={() => handleDelete(m.id)} className="p-1 rounded hover:bg-muted">
                    <Trash2 className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
                <p className="text-sm bg-muted/50 rounded-lg p-2.5 mb-2 whitespace-pre-wrap">{m.message}</p>
                <div className="flex items-center justify-between flex-wrap gap-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(m.send_at).toLocaleString(language === "bn" ? "bn-BD" : "en-US")}
                  </span>
                  {(m.status === "ready" || m.status === "pending") && (
                    <a
                      href={m.channel === "whatsapp" ? buildWaLink(m) : buildSmsLink(m)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary text-primary-foreground font-semibold hover:opacity-90"
                    >
                      <ExternalLink className="w-3 h-3" />
                      {t("এখন পাঠাও", "Send now")}
                    </a>
                  )}
                </div>
                {m.error && <p className="text-xs text-red-600 mt-1">{m.error}</p>}
              </Card>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Scheduler;
