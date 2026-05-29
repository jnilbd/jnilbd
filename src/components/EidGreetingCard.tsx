import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Moon, Star, Sparkles } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const DISMISS_KEY = "eid_greeting_dismissed_v1";

const EidGreetingCard = () => {
  const { language } = useLanguage();
  const isBn = language === "bn";
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(DISMISS_KEY)) setVisible(true);
  }, []);

  const close = () => {
    localStorage.setItem(DISMISS_KEY, "1");
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.section
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="container pt-6"
          aria-label={isBn ? "ঈদ মোবারক শুভেচ্ছা" : "Eid Mubarak greeting"}
        >
          <div className="relative overflow-hidden rounded-3xl shadow-elegant border border-amber-300/40 bg-gradient-to-br from-emerald-700 via-emerald-600 to-amber-500 text-white">
            {/* Decorative stars */}
            <div className="absolute inset-0 pointer-events-none opacity-50">
              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute"
                  style={{
                    top: `${(i * 37) % 90}%`,
                    left: `${(i * 53) % 95}%`,
                  }}
                  animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
                  transition={{ duration: 2 + (i % 3), repeat: Infinity, delay: i * 0.2 }}
                >
                  <Star className="h-2.5 w-2.5 fill-amber-200 text-amber-200" />
                </motion.div>
              ))}
            </div>

            {/* Crescent moon */}
            <motion.div
              className="absolute -top-6 -right-6 md:top-4 md:right-8"
              animate={{ rotate: [0, 8, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            >
              <Moon className="h-20 w-20 md:h-28 md:w-28 fill-amber-200/90 text-amber-200/90 drop-shadow-lg" />
            </motion.div>

            <button
              onClick={close}
              aria-label="Dismiss"
              className="absolute top-3 right-3 z-20 h-8 w-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center backdrop-blur-sm transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="relative z-10 p-6 md:p-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm border border-white/30 text-xs font-medium mb-3">
                <Sparkles className="h-3.5 w-3.5" />
                {isBn ? "ঈদের শুভেচ্ছা" : "Eid Greetings"}
              </div>

              <h2
                className="font-display font-bold leading-tight mb-2 text-4xl md:text-6xl"
                style={{ textShadow: "0 2px 20px rgba(0,0,0,0.25)" }}
              >
                {isBn ? "ঈদ মোবারক" : "Eid Mubarak"}
              </h2>

              <p className="text-base md:text-xl text-white/95 max-w-2xl leading-relaxed">
                {isBn
                  ? "ঈদের এই পবিত্র দিনে JnilBD পরিবারের পক্ষ থেকে আপনাকে ও আপনার পরিবারকে জানাই অন্তরের অন্তঃস্থল থেকে আন্তরিক শুভেচ্ছা। আল্লাহ আপনাদের সকলের জীবন সুখ, শান্তি ও সমৃদ্ধিতে ভরিয়ে দিন।"
                  : "On this blessed day of Eid, the JnilBD family sends warm and heartfelt greetings to you and your loved ones. May Allah fill your lives with joy, peace, and abundant blessings."}
              </p>

              <p className="mt-4 font-display text-lg md:text-xl text-amber-100 italic">
                {isBn
                  ? "— তাকাব্বালাল্লাহু মিন্না ওয়া মিনকুম"
                  : "— Taqabbalallahu minna wa minkum"}
              </p>
            </div>
          </div>
        </motion.section>
      )}
    </AnimatePresence>
  );
};

export default EidGreetingCard;
