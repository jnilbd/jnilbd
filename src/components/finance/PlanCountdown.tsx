import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Clock, AlertTriangle, CheckCircle2 } from "lucide-react";

interface Props {
  targetDate: string | null | undefined;
  bn?: boolean;
  className?: string;
  compact?: boolean;    // shows just "12d 4h" style
  label?: string;       // optional prefix label
}

const bnNum = (n: number, bn: boolean) =>
  bn ? new Intl.NumberFormat("bn-BD").format(n) : String(n);

const pad = (n: number) => String(n).padStart(2, "0");

export const PlanCountdown = ({ targetDate, bn = false, className, compact = false, label }: Props) => {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!targetDate) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  if (!targetDate) {
    return (
      <span className={cn("inline-flex items-center gap-1 text-[11px] text-muted-foreground", className)}>
        <Clock className="h-3 w-3" />
        {bn ? "তারিখ নেই" : "No deadline"}
      </span>
    );
  }

  const target = new Date(targetDate).getTime();
  let diff = Math.floor((target - now) / 1000);
  const past = diff < 0;
  diff = Math.abs(diff);

  const d = Math.floor(diff / 86400);
  const h = Math.floor((diff % 86400) / 3600);
  const m = Math.floor((diff % 3600) / 60);
  const s = diff % 60;

  const tone = past
    ? "text-rose-500 bg-rose-500/10 border-rose-500/30"
    : d <= 3
    ? "text-amber-500 bg-amber-500/10 border-amber-500/30"
    : d <= 14
    ? "text-primary bg-primary/10 border-primary/30"
    : "text-emerald-500 bg-emerald-500/10 border-emerald-500/30";

  const Icon = past ? AlertTriangle : d === 0 ? CheckCircle2 : Clock;

  // Big-scale: show months+days once very far
  let mainText: string;
  if (d >= 60) {
    const months = Math.floor(d / 30);
    const rd = d % 30;
    mainText = bn
      ? `${bnNum(months, bn)} মাস ${bnNum(rd, bn)} দিন`
      : `${months}mo ${rd}d`;
  } else if (compact || d >= 3) {
    mainText = bn
      ? `${bnNum(d, bn)} দিন ${bnNum(h, bn)} ঘঃ`
      : `${d}d ${h}h`;
  } else {
    // live ticking for < 3 days
    mainText = bn
      ? `${bnNum(d, bn)}দিন ${pad(h)}:${pad(m)}:${pad(s)}`
      : `${d}d ${pad(h)}:${pad(m)}:${pad(s)}`;
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[11px] font-medium tabular-nums",
        tone,
        className
      )}
      title={new Date(targetDate).toLocaleString(bn ? "bn-BD" : "en-BD")}
    >
      <Icon className="h-3 w-3" />
      {label && <span className="opacity-70 font-normal">{label}</span>}
      {past ? (bn ? `${mainText} পার` : `${mainText} overdue`) : mainText}
    </span>
  );
};
