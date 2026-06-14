import { useState } from "react";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { ShieldCheck, FileText, RefreshCw, Truck, Cookie, Lock } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

type PolicyKey = "privacy" | "terms" | "refund" | "shipping" | "cookies";

const Policies = () => {
  const { language } = useLanguage();
  const isBn = language === "bn";
  const location = useLocation();
  const initial = (new URLSearchParams(location.search).get("tab") as PolicyKey) || "privacy";
  const [tab, setTab] = useState<PolicyKey>(initial);

  const sections: { key: PolicyKey; icon: any; titleBn: string; titleEn: string; bn: string[]; en: string[] }[] = [
    {
      key: "privacy",
      icon: Lock,
      titleBn: "প্রাইভেসি পলিসি",
      titleEn: "Privacy Policy",
      bn: [
        "**সর্বশেষ আপডেট:** ৪ মে, ২০২৬",
        "JohnNil.com (\"আমরা\", \"আমাদের\") আপনার ব্যক্তিগত তথ্যের গোপনীয়তা রক্ষায় ১০০% প্রতিশ্রুতিবদ্ধ। এই পলিসিতে ব্যাখ্যা করা হয়েছে আমরা কোন তথ্য সংগ্রহ করি, কেন করি, কীভাবে রক্ষা করি ও কখন শেয়ার করি।",
        "**১. যে তথ্য সংগ্রহ করি:** নাম, ইমেইল, ফোন নাম্বার, শিপিং ঠিকানা, পেমেন্ট ট্রানজেকশন আইডি, IP ঠিকানা ও ব্রাউজিং প্যাটার্ন (Analytics-এর জন্য)।",
        "**২. কেন সংগ্রহ করি:** অর্ডার প্রসেসিং, কাস্টমার সাপোর্ট, ডেলিভারি সমন্বয়, ফ্রড প্রতিরোধ এবং সার্ভিস উন্নয়নের জন্য।",
        "**৩. তথ্য শেয়ারিং:** আপনার তথ্য কখনোই তৃতীয় পক্ষের কাছে বিক্রি করা হবে না। শুধু ডেলিভারি পার্টনার (Steadfast, Pathao, Sundarban, RedX) ও পেমেন্ট গেটওয়ে (bKash, Nagad)-এর সাথে অর্ডার পূরণের জন্য শেয়ার করা হবে।",
        "**৪. ডেটা সিকিউরিটি:** সব তথ্য SSL এনক্রিপশন ও Supabase-এর secure infrastructure-এ সংরক্ষিত।",
        "**৫. আপনার অধিকার:** আপনি যেকোনো সময় আপনার ডেটা ডিলিট করতে jnilbd@gmail.com-এ ইমেইল পাঠাতে পারবেন। আমরা ৭ কর্মদিবসের মধ্যে ব্যবস্থা নেব।",
        "**৬. কুকিজ:** আমরা সাইটের পারফরমেন্স ও ইউজার এক্সপেরিয়েন্স উন্নয়নে কুকিজ ব্যবহার করি। আপনি ব্রাউজার সেটিংসে এটি বন্ধ করতে পারেন।",
      ],
      en: [
        "**Last updated:** May 4, 2026",
        "JohnNil.com (\"we\", \"our\") is 100% committed to protecting your personal information. This policy explains what we collect, why, how we protect it, and when we share it.",
        "**1. Information we collect:** Name, email, phone, shipping address, payment transaction ID, IP address & browsing patterns (analytics).",
        "**2. Why we collect it:** Order processing, customer support, delivery coordination, fraud prevention and service improvement.",
        "**3. Sharing:** Your data is never sold. We share only with delivery partners (Steadfast, Pathao, Sundarban, RedX) and payment gateways (bKash, Nagad) to fulfill your orders.",
        "**4. Security:** All data is stored under SSL encryption on Supabase secure infrastructure.",
        "**5. Your rights:** You can request deletion at any time by emailing jnilbd@gmail.com. We act within 7 business days.",
        "**6. Cookies:** We use cookies for performance & UX. You can disable them in your browser settings.",
      ],
    },
    {
      key: "terms",
      icon: FileText,
      titleBn: "শর্তাবলী",
      titleEn: "Terms of Service",
      bn: [
        "**সর্বশেষ আপডেট:** ৪ মে, ২০২৬",
        "এই সাইটে অর্ডার করার মাধ্যমে আপনি নিম্নলিখিত শর্তাবলীতে সম্মত হচ্ছেন।",
        "**১. অ্যাকাউন্ট:** ১৮ বছরের কম বয়সীদের জন্য পিতামাতা/অভিভাবকের অনুমতি প্রয়োজন। ভুল তথ্য দিয়ে অ্যাকাউন্ট খোলা নিষিদ্ধ।",
        "**২. পেমেন্ট:** bKash/Nagad এ ম্যানুয়াল পেমেন্ট আবশ্যক। ট্রানজেকশন আইডি (TrxID) ছাড়া অর্ডার কনফার্ম হবে না। Cash on Delivery শুধু ফিজিক্যাল প্রোডাক্টে প্রযোজ্য।",
        "**৩. মূল্য:** সব মূল্য বাংলাদেশি টাকা (৳) তে এবং VAT অন্তর্ভুক্ত। ছাড় ও অফার নির্দিষ্ট সময়ের জন্য বৈধ।",
        "**৪. ইনটেলেকচুয়াল প্রপার্টি:** সকল ডিজিটাল প্রোডাক্ট (UI Kit, eBook, Course) JohnNil.com-এর সম্পত্তি — পুনরায় বিক্রি, পুনঃবিতরণ ও কপিরাইট লঙ্ঘন কঠোরভাবে নিষিদ্ধ।",
        "**৫. ইউজার কন্টেন্ট (Marketplace/Rentals):** আপনার পোস্ট করা কন্টেন্টের জন্য আপনি দায়ী। ভুয়া, প্রতারণামূলক বা অবৈধ পোস্ট পাওয়া গেলে অ্যাকাউন্ট স্থায়ীভাবে বন্ধ করা হবে।",
        "**৬. দায়বদ্ধতার সীমা:** আমরা সাইট ব্যবহারের ফলে সৃষ্ট পরোক্ষ ক্ষতির জন্য দায়ী নই।",
        "**৭. বিরোধ নিষ্পত্তি:** যেকোনো বিরোধ বাংলাদেশের আইন অনুযায়ী এবং ঢাকার আদালতে নিষ্পত্তি হবে।",
      ],
      en: [
        "**Last updated:** May 4, 2026",
        "By placing an order on this site you agree to the following terms.",
        "**1. Accounts:** Under 18 requires parental consent. Fake or misleading registrations are prohibited.",
        "**2. Payment:** Manual bKash/Nagad transfer required. Orders are not confirmed without a valid TrxID. Cash on Delivery applies only to physical products.",
        "**3. Pricing:** All prices in BDT (৳), VAT inclusive. Promotional pricing is time-bound.",
        "**4. IP rights:** All digital products (UI kits, eBooks, courses) are JohnNil.com property. Reselling, redistribution and copyright violation are strictly prohibited.",
        "**5. User content (Marketplace/Rentals):** You are responsible for content you post. Fraudulent, misleading or illegal posts will result in permanent account termination.",
        "**6. Liability:** We are not liable for indirect damages arising from site use.",
        "**7. Disputes:** All disputes are governed by Bangladeshi law and the courts of Dhaka.",
      ],
    },
    {
      key: "refund",
      icon: RefreshCw,
      titleBn: "রিফান্ড পলিসি",
      titleEn: "Refund Policy",
      bn: [
        "**সর্বশেষ আপডেট:** ৪ মে, ২০২৬",
        "আমাদের রিফান্ড নীতি স্বচ্ছ ও কাস্টমার-বান্ধব।",
        "**ফিজিক্যাল প্রোডাক্ট:**",
        "• ত্রুটিপূর্ণ বা ভুল প্রোডাক্ট ডেলিভারির ক্ষেত্রে ৭ দিনের মধ্যে ১০০% রিফান্ড বা প্রতিস্থাপন।",
        "• প্রোডাক্ট অবশ্যই ব্যবহার না করা ও মূল প্যাকেজিংয়ে ফেরত দিতে হবে।",
        "• রিফান্ড ৫–৭ কর্মদিবসে bKash/Nagad-এ পাঠানো হবে।",
        "**ডিজিটাল প্রোডাক্ট (eBook, Course, UI Kit, Templates):**",
        "• ডাউনলোড/একসেস দেওয়ার পর কোনো রিফান্ড নেই — কারণ ডিজিটাল কন্টেন্ট কপি করা সম্ভব।",
        "• ফাইল ত্রুটিপূর্ণ বা ভাঙা হলে আমরা সংশোধিত ফাইল পাঠাব।",
        "**সার্ভিস:**",
        "• কাজ শুরুর আগে ক্যান্সেল করলে ১০০% রিফান্ড।",
        "• ৫০% কাজ সম্পন্ন হলে ৫০% রিফান্ড।",
        "• সম্পূর্ণ ডেলিভারির পর কোনো রিফান্ড নেই।",
        "**অ্যাপয়েন্টমেন্ট:**",
        "• ২৪ ঘণ্টা আগে বাতিল করলে ১০০% রিফান্ড।",
        "• ১২ ঘণ্টা আগে বাতিলে ৫০% রিফান্ড।",
        "• এর কম সময়ে কোনো রিফান্ড নেই।",
        "**যোগাযোগ:** jnilbd@gmail.com বা +880 1774-585757",
      ],
      en: [
        "**Last updated:** May 4, 2026",
        "Our refund policy is transparent and customer-friendly.",
        "**Physical products:**",
        "• Defective or wrong delivery → 100% refund or replacement within 7 days.",
        "• Product must be unused and in original packaging.",
        "• Refund processed via bKash/Nagad within 5–7 business days.",
        "**Digital products (eBooks, Courses, UI kits, Templates):**",
        "• No refunds once downloaded/accessed — digital content is copyable.",
        "• Corrupt/broken files → we'll send a corrected version.",
        "**Services:**",
        "• Cancel before work starts → 100% refund.",
        "• 50% completion → 50% refund.",
        "• Fully delivered → no refund.",
        "**Appointments:**",
        "• 24h+ notice → 100% refund.",
        "• 12h notice → 50% refund.",
        "• Less → no refund.",
        "**Contact:** jnilbd@gmail.com or +880 1774-585757",
      ],
    },
    {
      key: "shipping",
      icon: Truck,
      titleBn: "শিপিং ও ডেলিভারি",
      titleEn: "Shipping & Delivery",
      bn: [
        "**ডেলিভারি এরিয়া:** সারা বাংলাদেশ — ৬৪ জেলা।",
        "**ডেলিভারি পার্টনার:** Steadfast Courier, Pathao Courier, Sundarban Courier, RedX Express।",
        "**সময়সীমা:**",
        "• ঢাকা সিটি: ১–২ কর্মদিবস",
        "• ঢাকার বাইরে: ৩–৫ কর্মদিবস",
        "• প্রত্যন্ত এলাকা: ৫–৭ কর্মদিবস",
        "**ডেলিভারি চার্জ:**",
        "• ঢাকা সিটি: ৳৬০",
        "• ঢাকার বাইরে: ৳১২০",
        "• ৳৫,০০০+ অর্ডারে ১০০% ফ্রি ডেলিভারি",
        "**Cash on Delivery (COD):**",
        "• ফিজিক্যাল প্রোডাক্টে প্রযোজ্য।",
        "• অগ্রিম ৳১০০ অ্যাডভান্স bKash/Nagad-এ পাঠাতে হবে (ভুয়া অর্ডার রোধে)।",
        "• ডেলিভারিম্যানের কাছে বাকি টাকা প্রদান।",
        "**ডিজিটাল প্রোডাক্ট:** পেমেন্ট কনফার্ম হওয়ার সাথে সাথে ইমেইলে ডাউনলোড লিংক পাঠানো হবে।",
      ],
      en: [
        "**Coverage:** All of Bangladesh — 64 districts.",
        "**Partners:** Steadfast Courier, Pathao Courier, Sundarban Courier, RedX Express.",
        "**Timelines:**",
        "• Dhaka city: 1–2 business days",
        "• Outside Dhaka: 3–5 business days",
        "• Remote areas: 5–7 business days",
        "**Shipping charges:**",
        "• Dhaka city: ৳60",
        "• Outside Dhaka: ৳120",
        "• Orders ৳5,000+: 100% FREE delivery",
        "**Cash on Delivery (COD):**",
        "• Applies to physical products.",
        "• Advance ৳100 via bKash/Nagad required (anti-fraud).",
        "• Pay the balance to the courier.",
        "**Digital products:** Download link emailed instantly upon payment confirmation.",
      ],
    },
    {
      key: "cookies",
      icon: Cookie,
      titleBn: "কুকিজ পলিসি",
      titleEn: "Cookies Policy",
      bn: [
        "JohnNil.com আপনার ব্রাউজিং অভিজ্ঞতা উন্নত করতে কুকিজ ব্যবহার করে।",
        "**ব্যবহার করা কুকিজ:** essential (লগইন/কার্ট), performance (analytics), preference (ভাষা/থিম)।",
        "আপনি ব্রাউজার সেটিংস থেকে যেকোনো সময় কুকিজ ম্যানেজ বা ব্লক করতে পারবেন।",
      ],
      en: [
        "JohnNil.com uses cookies to enhance browsing experience.",
        "**Cookies used:** essential (login/cart), performance (analytics), preference (language/theme).",
        "You can manage or block cookies from your browser settings at any time.",
      ],
    },
  ];

  return (
    <div>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-bg-cool opacity-90" />
        <div className="container relative z-10 text-white py-14 md:py-20 text-center">
          <ShieldCheck className="w-12 h-12 mx-auto mb-3" />
          <h1 className="text-4xl md:text-6xl font-display font-bold mb-2">
            {isBn ? "পলিসি ও শর্তাবলী" : "Policies & Terms"}
          </h1>
          <p className="opacity-90">{isBn ? "স্বচ্ছ, ন্যায্য, বাংলাদেশ-উপযোগী" : "Transparent, fair, made for Bangladesh"}</p>
        </div>
      </section>

      <section className="container py-10 md:py-14 max-w-4xl">
        <Tabs value={tab} onValueChange={(v) => setTab(v as PolicyKey)}>
          <TabsList className="flex flex-wrap h-auto p-1.5 mb-8 bg-muted/60 rounded-2xl gap-1">
            {sections.map((s) => (
              <TabsTrigger key={s.key} value={s.key} className="flex-1 min-w-[120px] gap-1.5 data-[state=active]:gradient-bg-primary data-[state=active]:text-white rounded-xl">
                <s.icon className="w-4 h-4" />
                <span className="text-xs md:text-sm">{isBn ? s.titleBn : s.titleEn}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {sections.map((s) => (
            <TabsContent key={s.key} value={s.key}>
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                className="bg-card rounded-3xl border border-border/60 shadow-card p-6 md:p-10">
                <div className="flex items-center gap-3 mb-6 pb-5 border-b border-border/50">
                  <div className="w-12 h-12 rounded-2xl gradient-bg-primary flex items-center justify-center text-white shadow-glow">
                    <s.icon className="w-6 h-6" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-display font-bold">
                    <span className="gradient-text">{isBn ? s.titleBn : s.titleEn}</span>
                  </h2>
                </div>
                <div className="space-y-3 text-foreground/85 leading-relaxed text-[15px]">
                  {(isBn ? s.bn : s.en).map((p, i) => (
                    <p key={i} dangerouslySetInnerHTML={{ __html: p.replace(/\*\*(.+?)\*\*/g, '<strong class="text-foreground">$1</strong>') }} />
                  ))}
                </div>
              </motion.div>
            </TabsContent>
          ))}
        </Tabs>
      </section>
    </div>
  );
};

export default Policies;
