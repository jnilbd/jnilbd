import { useLanguage } from "@/contexts/LanguageContext";
import { Sparkles, Flame, Snowflake, Zap, Star, Gift, ShieldCheck, Rocket } from "lucide-react";

interface MarqueeProps {
  variant?: "primary" | "warm" | "cool";
  textKey?: string;
}

const variantConfig = {
  primary: {
    bg: "gradient-bg-primary",
    icon: Sparkles,
    pillIcon: Rocket,
    pillLabel: { bn: "ফিচার", en: "Features" },
    defaultKey: "marquee.primary",
    accent: "from-secondary/30 via-secondary/10 to-transparent",
    reverse: false,
  },
  warm: {
    bg: "gradient-bg-warm",
    icon: Flame,
    pillIcon: Gift,
    pillLabel: { bn: "অফার", en: "Offers" },
    defaultKey: "marquee.warm",
    accent: "from-white/30 via-white/10 to-transparent",
    reverse: true,
  },
  cool: {
    bg: "gradient-bg-cool",
    icon: Snowflake,
    pillIcon: Zap,
    pillLabel: { bn: "টুলস", en: "Tools" },
    defaultKey: "marquee.cool",
    accent: "from-white/30 via-white/10 to-transparent",
    reverse: false,
  },
} as const;

const Marquee = ({ variant = "primary", textKey }: MarqueeProps) => {
  const { t, language } = useLanguage();
  const cfg = variantConfig[variant];
  const text = t(textKey || cfg.defaultKey);
  const PillIcon = cfg.pillIcon;
  const Icon = cfg.icon;
  const isBn = language === "bn";

  // Split text into pieces by the ✦ separator so we can decorate each
  const pieces = text.split("✦").map((s) => s.trim()).filter(Boolean);

  return (
    <div className={`relative ${cfg.bg} text-white overflow-hidden border-y border-white/10`}>
      {/* Decorative shimmer */}
      <div className={`absolute inset-y-0 left-0 w-32 bg-gradient-to-r ${cfg.accent} pointer-events-none z-10`} />
      <div className={`absolute inset-y-0 right-0 w-32 bg-gradient-to-l ${cfg.accent} pointer-events-none z-10`} />

      <div className="flex items-stretch">
        {/* Sticky label pill */}
        <div className="relative z-20 hidden sm:flex items-center gap-2 px-4 md:px-5 bg-black/25 backdrop-blur-md border-r border-white/20 shrink-0">
          <span className="flex items-center justify-center w-7 h-7 rounded-full bg-white/15 border border-white/30">
            <PillIcon className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
          </span>
          <span className="text-[10px] md:text-[11px] font-bold uppercase tracking-[0.2em] whitespace-nowrap">
            {isBn ? cfg.pillLabel.bn : cfg.pillLabel.en}
          </span>
        </div>

        {/* Scrolling track */}
        <div className="flex-1 overflow-hidden py-2.5">
          <div className={`marquee-track ${cfg.reverse ? "[animation-direction:reverse]" : ""}`}>
            {Array.from({ length: 3 }).map((_, loopIdx) => (
              <div key={loopIdx} className="flex items-center shrink-0">
                {pieces.map((piece, i) => (
                  <span key={`${loopIdx}-${i}`} className="flex items-center gap-2.5 px-5 md:px-7 whitespace-nowrap">
                    <Icon className="w-3.5 h-3.5 text-white/70 shrink-0" />
                    <span className="font-display font-semibold text-[13px] md:text-sm tracking-wide">
                      {piece}
                    </span>
                    <Star className="w-2.5 h-2.5 text-white/40 fill-white/40 shrink-0" />
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Marquee;
