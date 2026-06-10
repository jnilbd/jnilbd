import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { HADITHS, HADITH_CATEGORIES } from "@/data/hadiths";

const Hadith = () => {
  const [cat, setCat] = useState("সব");
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return HADITHS.filter(h =>
      (cat === "সব" || h.cat === cat) &&
      (!qq || h.bn.toLowerCase().includes(qq) || h.source.toLowerCase().includes(qq) || (h.tafsir || "").toLowerCase().includes(qq))
    );
  }, [cat, q]);

  return (
    <div className="container py-6 lg:py-10 max-w-5xl space-y-5">
      <motion.div initial={{opacity:0,y:-10}} animate={{opacity:1,y:0}} className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center shadow-glow">
          <BookOpen className="w-6 h-6" />
        </div>
        <div>
          <h1 className="font-display text-2xl lg:text-3xl font-bold">হাদিস ও তরজমা</h1>
          <p className="text-xs text-muted-foreground">জীবনঘনিষ্ঠ বিষয়ে নবী ﷺ-এর কথা — {HADITHS.length}টি সহিহ হাদিস</p>
        </div>
      </motion.div>

      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-9" placeholder="হাদিস বা সূত্রে খুঁজুন..." value={q} onChange={e=>setQ(e.target.value)} />
          </div>
          <div className="flex flex-wrap gap-2">
            {HADITH_CATEGORIES.map(c => (
              <button key={c} onClick={()=>setCat(c)}
                className={`text-xs px-3 py-1.5 rounded-full border transition ${cat===c?"gradient-bg-primary text-white border-transparent":"bg-muted hover:bg-muted/80 border-border"}`}>
                {c}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="text-xs text-muted-foreground">{filtered.length}টি হাদিস</div>

      <div className="grid gap-3">
        {filtered.map((h, i) => (
          <motion.div key={h.id} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:Math.min(i*0.02,0.3)}}>
            <Card className="border-l-4 border-l-primary/60">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <Badge variant="secondary" className="text-[10px]">{h.cat}</Badge>
                  <span className="text-[11px] text-muted-foreground font-semibold">📖 {h.source}</span>
                </div>
                <p className="text-base leading-relaxed">{h.bn}</p>
                {h.tafsir && (
                  <div className="text-xs text-muted-foreground bg-muted/40 rounded-md p-2.5 border-l-2 border-primary/40">
                    <span className="font-bold text-primary">💡 ব্যাখ্যা: </span>{h.tafsir}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
        {filtered.length === 0 && (
          <Card><CardContent className="p-8 text-center text-muted-foreground text-sm">কোনো হাদিস পাওয়া যায়নি</CardContent></Card>
        )}
      </div>

      <p className="text-center text-[11px] text-muted-foreground mt-6">
        সূত্র: সহিহ বুখারী, সহিহ মুসলিম, তিরমিজি, আবু দাউদ, ইবনে মাজাহ, নাসাই — যাচাইকৃত বঙ্গানুবাদ
      </p>
    </div>
  );
};

export default Hadith;
