import { Link, Navigate } from "react-router-dom";
import { ArrowLeft, Truck, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { CourierTrackerTab } from "@/components/finance/CourierTrackerTab";

const Courier = () => {
  const { user, loading } = useAuth();
  const { language } = useLanguage();
  const bn = language === "bn";

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (!user) return <Navigate to="/auth" replace />;

  const title = bn ? "স্মার্ট কুরিয়ার ট্র্যাকার" : "Smart Courier Tracker";
  const desc = bn
    ? "Pathao, Steadfast, RedX, Sundarban সহ সকল কুরিয়ার একসাথে ট্র্যাক করুন।"
    : "Track Pathao, Steadfast, RedX, Sundarban and more in one place.";

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30 pb-24">

      <div className="sticky top-0 z-30 border-b border-border/60 bg-background/70 backdrop-blur-xl">
        <div className="container mx-auto px-3 sm:px-6 py-3 flex items-center gap-2">
          <Link
            to="/"
            className="h-9 w-9 rounded-xl grid place-items-center hover:bg-muted transition-colors"
            aria-label="Back"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-primary/60 text-primary-foreground grid place-items-center shadow-sm">
            <Truck className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <h1 className="text-sm sm:text-base font-semibold leading-tight truncate">{title}</h1>
            <p className="text-[10px] text-muted-foreground">{desc}</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-3 sm:px-6 pt-4">
        <CourierTrackerTab userId={user.id} bn={bn} />
      </div>
    </div>
  );
};

export default Courier;
