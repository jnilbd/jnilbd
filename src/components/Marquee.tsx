import { useLanguage } from "@/contexts/LanguageContext";

interface MarqueeProps {
  variant?: "primary" | "warm" | "cool";
  textKey?: string;
}

const Marquee = ({ variant = "primary", textKey = "marquee.text" }: MarqueeProps) => {
  const { t } = useLanguage();
  const text = t(textKey);
  const bg = variant === "warm" ? "gradient-bg-warm" : variant === "cool" ? "gradient-bg-cool" : "gradient-bg-primary";

  return (
    <div className={`${bg} py-3 overflow-hidden text-white`}>
      <div className="marquee-track">
        {Array.from({ length: 4 }).map((_, i) => (
          <span key={i} className="font-display font-semibold text-sm md:text-base whitespace-nowrap px-8">
            {text}
          </span>
        ))}
      </div>
    </div>
  );
};

export default Marquee;
