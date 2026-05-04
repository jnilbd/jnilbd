import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Sparkles, Calendar, MapPin, Mail, Phone, ArrowRight, Quote } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";

const milestones = [
  { year: "2006", bn: "ইন্টারনেট জগতে প্রথম যাত্রা শুরু", en: "Started my journey into the internet world" },
  { year: "2008–2011", bn: "ফ্রি ইন্টারনেট ও VPN Handler নিয়ে গবেষণা ও সফলতা", en: "Cracked free internet & VPN Handler techniques" },
  { year: "2011–2013", bn: "Wapka দিয়ে প্রায় ৪১টি ওয়েবসাইট তৈরি", en: "Built ~41 websites using Wapka" },
  { year: "2014–2016", bn: "ফ্রি ইন্টারনেট কমিউনিটিতে ভাইরাল; ৭৮ হাজার সদস্যের ফেসবুক গ্রুপ", en: "Went viral in the free-internet community; ran a 78K member FB group" },
  { year: "2016–2022", bn: "অফলাইনে মোবাইল ডেটা, FRP, সফটওয়্যার ও ডিজিটাল লাইসেন্স সার্ভিস", en: "Offline services: mobile data, FRP bypass, software & digital licenses" },
  { year: "2022–2023", bn: "ঢাকা, বারিধারায় চাকরি — কোম্পানি বন্ধ হওয়ায় গ্রামে ফিরে আসা", en: "Job in Baridhara, Dhaka — returned home after the company shut down" },
  { year: "2024 — Now", bn: "আবার অনলাইনে — JohnNil.com দিয়ে নতুন অধ্যায়", en: "Back online — a new chapter with JohnNil.com" },
];

const About = () => {
  const { language } = useLanguage();
  const isBn = language === "bn";

  const story = isBn
    ? [
        "আসসালামু আলাইকুম। আমার নাম আবু সাঈদ, অনেকে আমাকে চেনেন জন নীল (John Nil) নামে। ২০০৬ সাল থেকে ইন্টারনেট জগতে আছি — প্রথম থেকেই আমার আগ্রহ ছিল অনলাইন দুনিয়াকে আরও ভালো করার, সমস্যা খুঁজে সেগুলোর সমাধান বের করার।",
        "আমার শুরুটা একদম এক প্রত্যন্ত গ্রাম থেকে, যেখানে এই ধরনের কাজের কোনো পরিচিতিই ছিল না। তবু কৌতূহল আর জেদ থেকে ২০০৮ সালে ফ্রি ইন্টারনেট নিয়ে কাজ শুরু করি, ২০০৯–২০১১ এর মধ্যে এর মূল রহস্য বুঝে ফেলি। সেই সময় থেকে Free Internet ও VPN Handler নিয়ে কাজ, পাশাপাশি APK editing আর ভিডিও এডিটিংয়েও হাত দিই।",
        "২০১১ থেকে ২০১৩-এর মধ্যে Wapka ব্যবহার করে প্রায় ৪১টি ওয়েবসাইট বানাই। আফসোসের জায়গা — তখন কোনো প্রোগ্রামিং ভাষা শিখিনি, সঠিক গাইডেন্সও পাইনি। জীবনের অনেকগুলো সুযোগ মিস করেছি সেই কারণে।",
        "২০১৪–২০১৬ সালে ফ্রি ইন্টারনেট কমিউনিটিতে রীতিমতো ভাইরাল হয়ে যাই। অনেক মানুষ আমার টিপস ও পদ্ধতি শিখে উপকৃত হয়েছেন। কিন্তু এই পরিচিতি কিছু নেতিবাচক মানুষকেও আকৃষ্ট করেছিল — তারা হ্যাকিং, হেনস্তা, ব্যক্তিগত জীবনে হস্তক্ষেপ শুরু করে। আমার ৭৮ হাজার সদস্যের ফেসবুক গ্রুপ বহুবার বন্ধ হয়, প্রতিবারই আবার দাঁড় করিয়েছি। শেষমেশ পরিবারের চাপে অনলাইন কাজ থেকে কিছু সময়ের জন্য সরে আসি।",
        "অফলাইনে কাজ থামাইনি — মোবাইল ডেটা রিসেল, FRP bypass, সফটওয়্যার সার্ভিস, Windows ও হার্ডওয়্যার সমস্যার সমাধান, ডিজিটাল লাইসেন্স — সব কিছুর সাপোর্ট দিতাম বাসা থেকেই। ফেব্রুয়ারি ২০২২-এ বাবার মৃত্যুর পর ঢাকা চলে আসি, বারিধারায় একটি কোম্পানিতে চাকরি শুরু করি। সেখানে সফলতা পেলেও কোম্পানি লোকসানে বন্ধ হয়ে যায়, প্রায় ৬ মাসের বেতনও আটকে থাকে। ১০ সেপ্টেম্বর ২০২৩-এ গ্রামে ফিরে আসি।",
        "এখন আবার পুরোপুরি অনলাইনে ফিরে এসেছি। আমার পুরো যাত্রা সম্পূর্ণ self-taught — কোনো প্রতিষ্ঠান থেকে আমি ফরমাল ট্রেনিং পাইনি। যখন যেটা দরকার হয়েছে, নিজে শিখেছি, অন্যকেও শিখিয়েছি। ইনশাআল্লাহ, এই শেখার আর অনলাইন দুনিয়াকে আরও ভালো করার যাত্রা চলবেই।",
      ]
    : [
        "Greetings. I am Abu Saeed, though many know me by the nickname John Nil. My journey into the world of the internet began back in 2006 — born out of an early fascination with the online realm. From the very start my focus has been on innovation: identifying problems and trying to solve them, making the online world a little better with every effort.",
        "My origins lie in a humble village, where such pursuits were unheard of. Driven by curiosity, I began exploring the concept of free internet in 2008, and by 2009–2011 I had unlocked its secrets. That success pulled me deeper into Free Internet and VPN Handler work, alongside APK app editing and video editing.",
        "Between 2011 and 2013, I built around 41 websites using Wapka. My biggest regret from that period — I never picked up a proper coding language, and I missed several opportunities for the right guidance at the right time.",
        "From 2014 to 2016, I became a viral figure in the free-internet space. Many people embraced and benefited from the techniques I shared. But the notoriety also attracted negative attention — relentless harassment, hacking attempts, and intrusion into my personal life. My Facebook group of 78,000 members was deactivated multiple times; I rebuilt it every single time. Eventually, under family pressure, I stepped away from this line of work for a while.",
        "I never stopped offline though — mobile data reselling, FRP bypass, software provisioning, Windows & hardware support, digital licenses — all delivered from home. After my father's passing in February 2022, I moved to Dhaka for a job in Baridhara. I found success there, but the company shut down due to losses and nearly six months of my salary was withheld. On 10 September 2023, I returned home.",
        "Today I'm fully back online. My entire journey has been self-taught — no formal training, no institution. Whenever I needed something, I learned it, and shared what I knew. Insha'Allah, this pursuit of knowledge — and the mission to make the online world a little better — will continue.",
      ];

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden py-16 md:py-24">
        <div className="absolute inset-0 animated-gradient opacity-90" />
        <div className="absolute inset-0 bg-background/10" />
        <div className="container relative z-10 text-white">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-card text-white border-white/40 text-xs md:text-sm font-medium mb-5">
              <Sparkles className="w-4 h-4" />
              <span>{isBn ? "আমার গল্প" : "My Story"}</span>
            </div>
            <p className="text-xl md:text-2xl font-light mb-1.5">
              {isBn ? "আসসালামু আলাইকুম, আমি" : "Hello, I'm"}
            </p>
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-display font-bold mb-4 leading-[1.05]">
              {isBn ? "আবু সাঈদ" : "Abu Saeed"}{" "}
              <span className="block md:inline text-2xl md:text-4xl font-light opacity-90">
                ({isBn ? "জন নীল" : "John Nil"})
              </span>
            </h1>
            <p className="text-base md:text-lg text-white/90 max-w-2xl leading-relaxed">
              {isBn
                ? "২০০৬ থেকে ইন্টারনেট জগতে — একজন self-taught ক্রিয়েটর, এন্ট্রাপ্রেনিউর ও সমস্যা-সমাধানকারী।"
                : "Online since 2006 — a self-taught creator, entrepreneur, and problem solver."}
            </p>

            <div className="flex flex-wrap gap-3 mt-6 text-sm">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur border border-white/20">
                <MapPin className="w-4 h-4" /> Baridhara, Dhaka
              </span>
              <a href="mailto:jnilbd@gmail.com" className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur border border-white/20 hover:bg-white/25 transition-smooth">
                <Mail className="w-4 h-4" /> jnilbd@gmail.com
              </a>
              <a href="tel:+8801774585757" className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur border border-white/20 hover:bg-white/25 transition-smooth">
                <Phone className="w-4 h-4" /> 01774585757
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Story */}
      <section className="py-12 md:py-20 container">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
          <div className="lg:col-span-2 space-y-5">
            <div className="flex items-start gap-3">
              <Quote className="w-8 h-8 text-secondary flex-shrink-0 mt-1" />
              <h2 className="text-2xl md:text-4xl font-display font-bold">
                <span className="gradient-text">
                  {isBn ? "একটি গ্রাম থেকে শুরু — যাত্রাটা এখনো চলছে" : "From a small village — the journey continues"}
                </span>
              </h2>
            </div>
            {story.map((p, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="text-base md:text-[1.05rem] text-foreground/85 leading-relaxed"
              >
                {p}
              </motion.p>
            ))}

            <div className="pt-2">
              <p className="font-display text-lg md:text-xl">
                {isBn ? "শুভেচ্ছাসহ," : "Warm regards,"}
              </p>
              <p className="font-display font-bold text-2xl gradient-text">
                Abu Saeed (John Nil)
              </p>
            </div>
          </div>

          {/* Timeline */}
          <aside className="lg:sticky lg:top-24 self-start">
            <div className="bg-card border border-border/60 rounded-2xl p-5 md:p-6 shadow-card">
              <h3 className="font-display font-bold text-lg mb-5 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-secondary" />
                {isBn ? "টাইমলাইন" : "Timeline"}
              </h3>
              <ol className="relative border-l-2 border-secondary/30 ml-2 space-y-5">
                {milestones.map((m, i) => (
                  <li key={i} className="pl-5 relative">
                    <span className="absolute -left-[9px] top-1 w-4 h-4 rounded-full gradient-bg-warm shadow-pink" />
                    <div className="text-xs font-bold text-secondary tracking-wide">
                      {m.year}
                    </div>
                    <p className="text-sm text-foreground/80 mt-0.5 leading-snug">
                      {isBn ? m.bn : m.en}
                    </p>
                  </li>
                ))}
              </ol>
            </div>
          </aside>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 md:py-16 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
        <div className="container text-center max-w-2xl">
          <h3 className="text-2xl md:text-3xl font-display font-bold mb-3">
            {isBn ? "একসাথে কিছু তৈরি করি?" : "Let's build something together"}
          </h3>
          <p className="text-muted-foreground mb-6">
            {isBn
              ? "প্রোডাক্ট কিনুন, সার্ভিস অর্ডার করুন কিংবা সরাসরি যোগাযোগ করুন।"
              : "Shop products, order custom services, or just reach out."}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/services">
              <Button size="lg" className="rounded-full gradient-bg-primary text-white border-0 hover:opacity-90">
                {isBn ? "সার্ভিস অর্ডার" : "Order a Service"} <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link to="/shop">
              <Button size="lg" variant="outline" className="rounded-full">
                {isBn ? "শপ এক্সপ্লোর" : "Explore Shop"}
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
