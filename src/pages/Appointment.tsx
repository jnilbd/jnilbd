import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { format, addDays, isWeekend } from "date-fns";
import { CalendarIcon, Clock, MapPin, Video, Phone, Check, Sparkles, Briefcase } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const SLOTS = ["10:00 AM", "11:30 AM", "1:00 PM", "3:00 PM", "4:30 PM", "6:00 PM"];

const TYPES = [
  { id: "online", icon: Video, en: "Online (Zoom / Google Meet)", bn: "অনলাইন (Zoom / Google Meet)", price: 1500, durationEn: "45 min", durationBn: "৪৫ মিনিট" },
  { id: "phone", icon: Phone, en: "Phone Call Consultation", bn: "ফোন কল কনসালটেশন", price: 1000, durationEn: "30 min", durationBn: "৩০ মিনিট" },
  { id: "inperson", icon: MapPin, en: "In-Person (Baridhara, Dhaka)", bn: "সরাসরি (বারিধারা, ঢাকা)", price: 3000, durationEn: "60 min", durationBn: "৬০ মিনিট" },
  { id: "rajshahi", icon: MapPin, en: "In-Person (Own Home, Rajshahi)", bn: "সরাসরি (নিজ বাড়ি, রাজশাহী)", price: 1000, durationEn: "60 min", durationBn: "৬০ মিনিট" },
] as const;

const TOPICS_BN = ["ডিজিটাল প্রোডাক্ট স্ট্র্যাটেজি", "ই-কমার্স / শপিফাই সেটআপ", "ফ্রিল্যান্সিং ক্যারিয়ার গাইড", "সোশ্যাল মিডিয়া মার্কেটিং", "টেকনিক্যাল কনসালটেশন", "ব্যক্তিগত মেন্টরশিপ"];
const TOPICS_EN = ["Digital Product Strategy", "E-commerce / Shopify Setup", "Freelancing Career Guidance", "Social Media Marketing", "Technical Consultation", "Personal Mentorship"];

const Appointment = () => {
  const { language } = useLanguage();
  const isBn = language === "bn";
  const { add } = useCart();
  const navigate = useNavigate();

  const [type, setType] = useState<typeof TYPES[number]["id"]>("online");
  const [date, setDate] = useState<Date | undefined>();
  const [slot, setSlot] = useState<string>("");
  const [topic, setTopic] = useState(isBn ? TOPICS_BN[0] : TOPICS_EN[0]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");

  const selected = useMemo(() => TYPES.find((t) => t.id === type)!, [type]);

  const handleBook = () => {
    if (!date || !slot || !name || !phone || !email) {
      toast.error(isBn ? "সব ফিল্ড পূরণ করুন" : "Please fill all required fields");
      return;
    }
    const id = `apt-${Date.now()}`;
    const label = `${isBn ? selected.bn : selected.en} — ${format(date, "PPP")} ${slot}`;
    add({
      id,
      name: `Appointment: ${topic} — ${format(date, "PPP")} ${slot}`,
      nameBn: `অ্যাপয়েন্টমেন্ট: ${topic} — ${format(date, "PPP")} ${slot}`,
      price: selected.price,
      image: "https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=600&q=80&auto=format&fit=crop",
      type: "appointment",
      category: "appointment",
    });
    toast.success(isBn ? "বুকিং কার্টে যোগ হয়েছে — পেমেন্ট সম্পন্ন করুন" : "Booking added — please complete payment");
    sessionStorage.setItem("appointment-meta", JSON.stringify({ id, type, label, topic, date: date.toISOString(), slot, name, phone, email, notes }));
    navigate("/checkout");
  };

  return (
    <div>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-bg-warm opacity-90" />
        <div className="container relative z-10 text-white py-14 md:py-20 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card mb-3 border-white/40">
            <Sparkles className="w-3.5 h-3.5" /> <span className="text-xs font-semibold tracking-wider uppercase">{isBn ? "১:১ কনসালটেশন" : "1-on-1 Consultation"}</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-display font-bold mb-3">
            {isBn ? "অ্যাপয়েন্টমেন্ট বুক করুন" : "Book an Appointment"}
          </h1>
          <p className="text-lg opacity-90 max-w-xl mx-auto">
            {isBn ? "জন নীলের সাথে সরাসরি, ফোনে বা অনলাইনে কথা বলুন — আপনার প্রজেক্টের জন্য পরামর্শ নিন।" : "Talk to John Nil in person, by phone, or online — get personal guidance for your project."}
          </p>
        </div>
      </section>

      <section className="container py-12 max-w-5xl">
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Type */}
            <div className="bg-card rounded-3xl border border-border/60 p-6 shadow-card">
              <h2 className="font-display font-bold text-xl mb-4 flex items-center gap-2"><Briefcase className="w-5 h-5 text-primary" /> {isBn ? "মিটিং টাইপ" : "Meeting Type"}</h2>
              <div className="grid sm:grid-cols-3 gap-3">
                {TYPES.map((t) => {
                  const active = type === t.id;
                  return (
                    <button key={t.id} type="button" onClick={() => setType(t.id)}
                      className={cn("text-left rounded-2xl border-2 p-4 transition-smooth", active ? "border-primary bg-primary/5 shadow-glow" : "border-border hover:border-primary/40")}>
                      <t.icon className={cn("w-6 h-6 mb-2", active ? "text-primary" : "text-muted-foreground")} />
                      <p className="font-semibold text-sm leading-snug">{isBn ? t.bn : t.en}</p>
                      <p className="text-xs text-muted-foreground mt-1">{isBn ? t.durationBn : t.durationEn}</p>
                      <div className="mt-3 inline-flex items-baseline gap-1 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/30">
                        <span className="text-[10px] font-semibold text-primary/80">৳</span>
                        <span className="text-sm font-bold gradient-text">{t.price.toLocaleString()}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Date + Slot */}
            <div className="bg-card rounded-3xl border border-border/60 p-6 shadow-card">
              <h2 className="font-display font-bold text-xl mb-4 flex items-center gap-2"><CalendarIcon className="w-5 h-5 text-primary" /> {isBn ? "তারিখ ও সময়" : "Date & Time"}</h2>
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <Label className="mb-2">{isBn ? "তারিখ নির্বাচন করুন" : "Pick a date"}</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={cn("w-full justify-start text-left font-normal rounded-xl", !date && "text-muted-foreground")}>
                        <CalendarIcon className="w-4 h-4 mr-2" />
                        {date ? format(date, "PPP") : (isBn ? "তারিখ বাছুন" : "Select date")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={date} onSelect={setDate}
                        disabled={(d) => d < new Date(new Date().setHours(0,0,0,0)) || d > addDays(new Date(), 60) || isWeekend(d)}
                        initialFocus className={cn("p-3 pointer-events-auto")} />
                    </PopoverContent>
                  </Popover>
                  <p className="text-xs text-muted-foreground mt-2">{isBn ? "শুক্র–শনি বন্ধ" : "Closed on Fri & Sat"}</p>
                </div>
                <div>
                  <Label className="mb-2 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {isBn ? "সময়" : "Time slot"}</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {SLOTS.map((s) => (
                      <button key={s} type="button" onClick={() => setSlot(s)}
                        className={cn("py-2 rounded-lg text-xs font-semibold border-2 transition-smooth",
                          slot === s ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary/40")}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="bg-card rounded-3xl border border-border/60 p-6 shadow-card space-y-4">
              <h2 className="font-display font-bold text-xl">{isBn ? "আপনার তথ্য" : "Your Details"}</h2>
              <div>
                <Label>{isBn ? "আলোচনার বিষয়" : "Topic"}</Label>
                <select value={topic} onChange={(e) => setTopic(e.target.value)} className="w-full mt-1 rounded-xl border-2 border-border bg-background px-3 py-2 text-sm">
                  {(isBn ? TOPICS_BN : TOPICS_EN).map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="grid md:grid-cols-3 gap-3">
                <div><Label>{isBn ? "নাম *" : "Name *"}</Label><Input value={name} onChange={(e)=>setName(e.target.value)} className="rounded-xl" /></div>
                <div><Label>{isBn ? "ফোন *" : "Phone *"}</Label><Input value={phone} onChange={(e)=>setPhone(e.target.value)} className="rounded-xl" /></div>
                <div><Label>{isBn ? "ইমেইল *" : "Email *"}</Label><Input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} className="rounded-xl" /></div>
              </div>
              <div>
                <Label>{isBn ? "অতিরিক্ত নোট (ঐচ্ছিক)" : "Additional notes (optional)"}</Label>
                <Textarea rows={3} value={notes} onChange={(e)=>setNotes(e.target.value)} className="rounded-xl" />
              </div>
            </div>
          </div>

          {/* Summary */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
            className="bg-card rounded-3xl border border-border/60 p-6 shadow-elegant h-fit lg:sticky lg:top-24">
            <h3 className="font-display font-bold text-lg mb-4">{isBn ? "বুকিং সারাংশ" : "Booking Summary"}</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">{isBn ? "টাইপ" : "Type"}</span><span className="font-semibold text-right">{isBn ? selected.bn : selected.en}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">{isBn ? "সময়কাল" : "Duration"}</span><span className="font-semibold">{isBn ? selected.durationBn : selected.durationEn}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">{isBn ? "তারিখ" : "Date"}</span><span className="font-semibold">{date ? format(date, "PP") : "—"}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">{isBn ? "সময়" : "Time"}</span><span className="font-semibold">{slot || "—"}</span></div>
            </div>
            <div className="mt-5 pt-5 border-t border-border/50 flex items-center justify-between">
              <span className="font-display font-bold">{isBn ? "মোট" : "Total"}</span>
              <span className="inline-flex items-baseline gap-1 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/30">
                <span className="text-xs font-semibold text-primary/80">৳</span>
                <span className="text-xl font-bold gradient-text">{selected.price.toLocaleString()}</span>
              </span>
            </div>
            <Button onClick={handleBook} size="lg" className="w-full mt-5 rounded-full gradient-bg-primary text-white border-0 hover:opacity-90">
              <Check className="w-5 h-5 mr-2" /> {isBn ? "বুকিং নিশ্চিত করুন" : "Confirm Booking"}
            </Button>
            <p className="text-xs text-muted-foreground mt-3 text-center">
              {isBn ? "বুকিং নিশ্চিত হবে পেমেন্ট সম্পন্ন হলে।" : "Booking is confirmed only after payment."}
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Appointment;
