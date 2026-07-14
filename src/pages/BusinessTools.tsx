import { Link, Navigate } from "react-router-dom";
import { ArrowLeft, Briefcase, Loader2, ShoppingBag, Truck, Boxes } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { SalesTab } from "@/components/finance/SalesTab";
import { CourierTrackerTab } from "@/components/finance/CourierTrackerTab";
import { InventoryTab } from "@/components/finance/InventoryTab";

const BusinessTools = () => {
  const { user, loading } = useAuth();
  const { language } = useLanguage();
  const bn = language === "bn";
  const [tab, setTab] = useState("sales");

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (!user) return <Navigate to="/auth" replace />;

  const title = bn ? "স্মার্ট বিজনেস টুলস" : "Smart Business Tools";
  const desc = bn
    ? "বিক্রয় ও কুরিয়ার ট্র্যাকিং — এক জায়গায়।"
    : "Sales and courier tracking — all in one place.";

  const items = [
    { v: "sales", label: bn ? "বিক্রয়" : "Sales", Icon: ShoppingBag },
    { v: "courier", label: bn ? "কুরিয়ার ট্র্যাকার" : "Courier Tracker", Icon: Truck },
  ];

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
            <Briefcase className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <h1 className="text-sm sm:text-base font-semibold leading-tight truncate">{title}</h1>
            <p className="text-[10px] text-muted-foreground truncate">{desc}</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-3 sm:px-6 pt-4">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="h-auto w-full bg-transparent p-0 grid grid-cols-2 gap-1.5">
            {items.map(({ v, label, Icon }) => (
              <TabsTrigger
                key={v}
                value={v}
                className="flex flex-col items-center justify-center gap-1 h-auto py-2.5 px-2 rounded-xl border border-border/50 bg-muted/40 hover:bg-muted/70 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:border-primary data-[state=active]:shadow-md transition-all"
              >
                <Icon className="h-4 w-4" />
                <span className="text-[11px] font-medium">{label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="sales" className="mt-4">
            <SalesTab userId={user.id} bn={bn} />
          </TabsContent>
          <TabsContent value="courier" className="mt-4">
            <CourierTrackerTab userId={user.id} bn={bn} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default BusinessTools;
