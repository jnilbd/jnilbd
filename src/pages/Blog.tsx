import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, ArrowRight, Search, BookOpen, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { blogPosts } from "@/data/mockData";
import { displayImage, fallbackImageHandler } from "@/lib/siteImages";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const AUTHOR_AVATAR = "https://api.dicebear.com/7.x/initials/svg?seed=John%20Nil&backgroundColor=6366f1,a855f7,ec4899&backgroundType=gradientLinear";

// Upgrade unsplash thumbnails to high-res editorial quality
const hq = (url: string, w = 1600) =>
  url?.includes("images.unsplash.com")
    ? url.replace(/[?&]w=\d+/, "").replace(/[?&]q=\d+/, "") + (url.includes("?") ? "&" : "?") + `w=${w}&q=85&auto=format&fit=crop`
    : url;

const Blog = () => {
  const { language } = useLanguage();
  const bn = language === "bn";
  const t = (b: string, e: string) => (bn ? b : e);

  const [search, setSearch] = useState("");
  const [cat, setCat] = useState<string>("all");

  const categories = useMemo(() => {
    const s = new Set<string>();
    blogPosts.forEach(p => s.add(p.category));
    return ["all", ...Array.from(s)];
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return blogPosts.filter(p =>
      (cat === "all" || p.category === cat) &&
      (!q || (bn ? p.titleBn : p.title).toLowerCase().includes(q) || (bn ? p.excerptBn : p.excerpt).toLowerCase().includes(q))
    );
  }, [search, cat, bn]);

  const [featured, ...rest] = filtered.length ? filtered : blogPosts;
  const formatDate = (d: string) => new Date(d).toLocaleDateString(bn ? "bn-BD" : "en-US", { year: "numeric", month: "short", day: "numeric" });

  return (
    <div className="bg-gradient-to-b from-background via-background to-muted/20 min-h-screen">
      {/* Editorial header */}
      <section className="relative pt-16 pb-12 overflow-hidden border-b border-border/50">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--primary)/0.12),transparent_50%),radial-gradient(circle_at_70%_60%,hsl(var(--accent)/0.1),transparent_50%)]" />
        <div className="container relative z-10">
          <div className="max-w-3xl">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest mb-4">
                <BookOpen className="w-3.5 h-3.5" />
                {t("জনিল জার্নাল", "JohnNil Journal")}
              </div>
              <h1 className="text-5xl md:text-7xl font-display font-bold leading-[0.95] tracking-tight mb-4">
                {t("চিন্তা, কৌশল ও", "Ideas, strategy &")}
                <br />
                <span className="gradient-text italic font-display">{t("যেগুলো কাজ করে।", "what actually works.")}</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl">
                {t(
                  "বাংলাদেশের ডিজিটাল জগৎ থেকে গভীর প্রবন্ধ — ব্যবসা, প্রযুক্তি, ক্যারিয়ার ও ব্যক্তিগত অভিজ্ঞতা। ১৮ বছরের রিয়েল-ওয়ার্ল্ড অনুশীলন থেকে সংকলিত।",
                  "Deep essays from Bangladesh's digital frontier — business, technology, career, and personal experience. Curated from 18 years of real-world practice."
                )}
              </p>
            </motion.div>

            {/* search + filter */}
            <div className="mt-8 flex flex-col sm:flex-row gap-3 max-w-2xl">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t("আর্টিকেল খুঁজুন...", "Search articles...")}
                  className="pl-10 h-11 rounded-full bg-card/80 backdrop-blur border-border/60"
                />
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {categories.map(c => (
                <button
                  key={c}
                  onClick={() => setCat(c)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-smooth ${
                    cat === c ? "gradient-bg-primary text-white shadow-glow" : "bg-card border border-border/60 hover:border-primary/50"
                  }`}
                >
                  {c === "all" ? t("সব", "All") : c}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured hero post */}
      {featured && (
        <section className="container py-12">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              {t("ফিচার্ড স্টোরি", "Featured story")}
            </span>
            <div className="flex-1 h-px bg-border/60" />
          </div>

          <motion.article
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid lg:grid-cols-12 gap-8 items-center group"
          >
            <Link to={`/blog/${featured.id}`} className="lg:col-span-7 block relative overflow-hidden rounded-3xl shadow-elegant">
              <div className="aspect-[16/10]">
                <img
                  src={hq(displayImage(featured.image, featured.id, bn ? featured.titleBn : featured.title, featured.category), 1800)}
                  alt={featured.title}
                  onError={fallbackImageHandler(featured.id, bn ? featured.titleBn : featured.title, featured.category)}
                  className="w-full h-full object-cover group-hover:scale-105 transition-[transform] duration-700"
                />
              </div>
              <div className="absolute top-4 left-4">
                <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-background/90 backdrop-blur text-xs font-bold text-primary">
                  {featured.category}
                </span>
              </div>
            </Link>

            <div className="lg:col-span-5">
              <div className="flex items-center gap-3 mb-4 text-xs text-muted-foreground">
                <img src={AUTHOR_AVATAR} alt={featured.author} className="w-8 h-8 rounded-full" />
                <span className="font-semibold text-foreground">{featured.author}</span>
                <span>•</span>
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDate(featured.date)}</span>
                <span>•</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{featured.readTime}</span>
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold leading-tight tracking-tight mb-4">
                <Link to={`/blog/${featured.id}`} className="hover:text-primary transition-smooth">
                  {bn ? featured.titleBn : featured.title}
                </Link>
              </h2>
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed mb-6 line-clamp-4">
                {bn ? featured.excerptBn : featured.excerpt}
              </p>
              {/* Show first paragraph as preview */}
              <p className="text-sm text-foreground/70 leading-relaxed mb-6 line-clamp-3 italic border-l-2 border-primary/40 pl-4">
                {(bn ? featured.contentBn : featured.content)[0]}
              </p>
              <Link to={`/blog/${featured.id}`}>
                <Button className="gradient-bg-primary text-white rounded-full px-6 group/btn">
                  {t("পুরো পড়ুন", "Read full story")}
                  <ArrowRight className="w-4 h-4 ml-1 group-hover/btn:translate-x-1 transition-smooth" />
                </Button>
              </Link>
            </div>
          </motion.article>
        </section>
      )}

      {/* Rest of articles — magazine grid */}
      {rest.length > 0 && (
        <section className="container pb-20">
          <div className="flex items-center gap-2 mb-8">
            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              {t("সব আর্টিকেল", "All articles")}
            </span>
            <div className="flex-1 h-px bg-border/60" />
            <span className="text-xs text-muted-foreground">{rest.length}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {rest.map((post, i) => {
              const firstPara = (bn ? post.contentBn : post.content)[0];
              return (
                <motion.article
                  key={post.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: (i % 6) * 0.05 }}
                  className="group flex flex-col"
                >
                  <Link to={`/blog/${post.id}`} className="relative overflow-hidden rounded-2xl mb-5 shadow-card hover:shadow-elegant transition-smooth">
                    <div className="aspect-[5/4]">
                      <img
                        src={displayImage(post.image, post.id, bn ? post.titleBn : post.title, post.category)}
                        alt={post.title}
                        onError={fallbackImageHandler(post.id, bn ? post.titleBn : post.title, post.category)}
                        className="w-full h-full object-cover group-hover:scale-110 transition-[transform] duration-700"
                      />
                    </div>
                    <div className="absolute top-3 left-3">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-background/90 backdrop-blur text-[10px] font-bold uppercase tracking-wide text-primary">
                        {post.category}
                      </span>
                    </div>
                  </Link>

                  <div className="flex-1 flex flex-col">
                    <div className="flex items-center gap-2 mb-3 text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDate(post.date)}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{post.readTime}</span>
                    </div>

                    <h2 className="font-display font-bold text-xl md:text-2xl leading-snug tracking-tight mb-3 group-hover:text-primary transition-smooth line-clamp-2">
                      <Link to={`/blog/${post.id}`}>{bn ? post.titleBn : post.title}</Link>
                    </h2>

                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 mb-3">
                      {bn ? post.excerptBn : post.excerpt}
                    </p>

                    <p className="text-[13px] text-foreground/60 leading-relaxed line-clamp-2 italic border-l-2 border-border pl-3 mb-4">
                      {firstPara}
                    </p>

                    <div className="mt-auto flex items-center justify-between pt-3 border-t border-border/40">
                      <div className="flex items-center gap-2">
                        <img src={AUTHOR_AVATAR} alt={post.author} className="w-6 h-6 rounded-full" />
                        <span className="text-xs font-semibold">{post.author}</span>
                      </div>
                      <Link to={`/blog/${post.id}`} className="text-xs font-semibold text-primary flex items-center gap-1 hover:gap-2 transition-all">
                        {t("পড়ুন", "Read")} <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        </section>
      )}

      {filtered.length === 0 && (
        <div className="container py-20 text-center text-muted-foreground">
          {t("কোনো আর্টিকেল পাওয়া যায়নি।", "No articles found.")}
        </div>
      )}

      {/* Newsletter footer */}
      <section className="border-t border-border/50 bg-card/30">
        <div className="container py-12 text-center max-w-2xl">
          <h3 className="font-display font-bold text-2xl md:text-3xl mb-2">
            {t("নতুন আর্টিকেল মিস করবেন না", "Never miss a new article")}
          </h3>
          <p className="text-muted-foreground mb-6">
            {t("প্রতি সপ্তাহে একটি নতুন প্রবন্ধ — সরাসরি ইনবক্সে।", "One new essay per week — straight to your inbox.")}
          </p>
          <form
            onSubmit={(e) => { e.preventDefault(); }}
            className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto"
          >
            <Input type="email" placeholder={t("আপনার ইমেইল", "Your email")} className="rounded-full bg-background" required />
            <Button type="submit" className="gradient-bg-primary text-white rounded-full px-6">
              {t("সাবস্ক্রাইব", "Subscribe")}
            </Button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default Blog;
