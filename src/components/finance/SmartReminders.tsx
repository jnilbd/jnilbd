import { AlertTriangle, Info, TrendingDown, Target, Bell } from "lucide-react";
import { cn } from "@/lib/utils";

interface Reminder {
  id: string;
  icon: "warn" | "info" | "trend" | "target";
  title: string;
  desc?: string;
  tone: "amber" | "rose" | "sky" | "emerald";
}

export const SmartReminders = ({ reminders, bn }: { reminders: Reminder[]; bn: boolean }) => {
  if (reminders.length === 0) return null;
  const Icon = (t: Reminder["icon"]) =>
    t === "warn" ? AlertTriangle : t === "trend" ? TrendingDown : t === "target" ? Target : Info;
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground px-1">
        <Bell className="h-3.5 w-3.5" />
        <span>{bn ? "স্মার্ট রিমাইন্ডার" : "Smart Reminders"}</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {reminders.map((r) => {
          const I = Icon(r.icon);
          return (
            <div
              key={r.id}
              className={cn(
                "rounded-2xl border p-3 flex items-start gap-2.5 backdrop-blur",
                r.tone === "amber" && "border-amber-500/30 bg-amber-500/5",
                r.tone === "rose" && "border-rose-500/30 bg-rose-500/5",
                r.tone === "sky" && "border-sky-500/30 bg-sky-500/5",
                r.tone === "emerald" && "border-emerald-500/30 bg-emerald-500/5"
              )}
            >
              <div
                className={cn(
                  "h-8 w-8 rounded-xl grid place-items-center shrink-0",
                  r.tone === "amber" && "bg-amber-500/15 text-amber-600 dark:text-amber-400",
                  r.tone === "rose" && "bg-rose-500/15 text-rose-500",
                  r.tone === "sky" && "bg-sky-500/15 text-sky-500",
                  r.tone === "emerald" && "bg-emerald-500/15 text-emerald-500"
                )}
              >
                <I className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium leading-tight">{r.title}</p>
                {r.desc && <p className="text-[11px] text-muted-foreground mt-0.5">{r.desc}</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export type { Reminder };
