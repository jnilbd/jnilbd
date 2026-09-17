import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, Clock, Share2, Bookmark, ArrowRight } from "lucide-react";
import { blogPosts } from "@/data/mockData";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { displayImage, fallbackImageHandler } from "@/lib/siteImages";
import { toast } from "sonner";
import SEO from "@/components/SEO";

const AUTHOR_AVATAR = "https://api.dicebear.com/7.x/initials/svg?seed=John%20Nil&backgroundColor=6366f1,a855f7,ec4899&backgroundType=gradientLinear";

const hq = (url: string, w = 1800) =>
  url?.includes("images.unsplash.com")
    ? url.replace(/[?&]w=\d+/, "").replace(/[?&]q=\d+/, "") + (url.includes("?") ? "&" : "?") + `w=${w}&q=90&auto=format&fit=crop`
    : url;

const BlogDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const bn = language === "bn";
  const t = (b: string, e: string) => (bn ? b : e);

  const post = blogPosts.find((p) => p.id === id);
  if (!post) {
    return (
      <div className="container py-20 text-center">
        <Link to="/blog"><Button>{t("ব্লগে ফিরুন", "Back to Blog")}</Button></Link>
      </div>
    );
  }

  const related = blogPosts.filter((p) => p.id !== post.id && p.category === post.category).slice(0, 3);
  const fallback = blogPosts.filter((p) => p.id !== post.id).slice(0, 3);
  const showRelated = related.length ? related : fallback;
  const paragraphs = bn ? post.contentBn : post.content;
  const formatDate = (d: string) => new Date(d).toLocaleDateString(bn ? "bn-BD" : "en-US", { year: "numeric", month: "long", day: "numeric" });
  const words = paragraphs.join(" ").split(/\s+/).length;

  const share = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    try {
      if (navigator.share) await navigator.share({ title: bn ? post.titleBn : post.title, url });
      else { await navigator.clipboard.writeText(url); toast.success(t("লিংক কপি হয়েছে", "Link copied")); }
    } catch {}
  };

  const seoImage = hq(displayImage(post.image, post.id, bn ? post.titleBn : post.title, post.category), 1200);

  return (
    <div className="bg-background">
      <SEO
        title={`${bn ? post.titleBn : post.title} | JohnNil.com ব্লগ`}
        description={(bn ? post.excerptBn : post.excerpt).replace(/\s+/g, " ").slice(0, 160)}
        path={`/blog/${post.id}`}
        image={seoImage}
        type="article"
        keywords={`${post.category}, ${post.title}, বাংলা ব্লগ, johnnil blog`}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: bn ? post.titleBn : post.title,
          description: bn ? post.excerptBn : post.excerpt,
          image: seoImage,
          datePublished: post.date,
          dateModified: post.date,
          articleSection: post.category,
          inLanguage: bn ? "bn-BD" : "en-US",
          author: { "@type": "Person", name: post.author || "John Nil" },
          publisher: {
            "@type": "Organization",
            name: "JohnNil.com",
            logo: { "@type": "ImageObject", url: "https://johnnil.com/favicon.png" },
          },
          mainEntityOfPage: `https://johnnil.com/blog/${post.id}`,
        }}
      />
      {/* Cinematic hero */}
      <section className="relative">
        <div className="absolute inset-0 h-[70vh] overflow-hidden">
          <img
            src={hq(displayImage(post.image, post.id, bn ? post.titleBn : post.title, post.category), 2000)}
            alt={post.title}
            onError={fallbackImageHandler(post.id, bn ? post.titleBn : post.title, post.category)}
            className="w-full h-full object-cover scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/60 to-background" />
        </div>

        <div className="relative container pt-8 pb-16 max-w-4xl">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-8 -ml-3 bg-background/40 backdrop-blur hover:bg-background/70">
            <ArrowLeft className="w-4 h-4 mr-1" /> {t("ফিরে যান", "Back")}
          </Button>

          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="pt-[35vh]">
            <span className="inline-block px-3 py-1.5 rounded-full gradient-bg-primary text-white text-[11px] font-bold uppercase tracking-widest mb-5 shadow-glow">
              {post.category}
            </span>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold leading-[1.05] tracking-tight mb-6">
              {bn ? post.titleBn : post.title}
            </h1>
            <p className="text-xl md:text-2xl text-foreground/80 leading-relaxed font-light mb-8 max-w-3xl">
              {bn ? post.excerptBn : post.excerpt}
            </p>

            <div className="flex items-center gap-4 flex-wrap pb-6 border-b border-border/60">
              <div className="flex items-center gap-3">
                <img src={AUTHOR_AVATAR} alt={post.author} className="w-12 h-12 rounded-full ring-2 ring-primary/30" />
                <div>
                  <p className="font-semibold text-foreground">{post.author}</p>
                  <p className="text-xs text-muted-foreground">{t("লেখক ও প্রতিষ্ঠাতা", "Writer & Founder")}</p>
                </div>
              </div>
              <div className="h-8 w-px bg-border" />
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {formatDate(post.date)}</span>
                <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {post.readTime}</span>
                <span className="hidden sm:inline">• {words} {t("শব্দ", "words")}</span>
              </div>
              <div className="ml-auto flex items-center gap-1">
                <Button variant="outline" size="icon" onClick={share} aria-label="Share"><Share2 className="w-4 h-4" /></Button>
                <Button variant="outline" size="icon" onClick={() => toast.success(t("সংরক্ষিত", "Bookmarked"))} aria-label="Bookmark"><Bookmark className="w-4 h-4" /></Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Article body — premium typography */}
      <article className="container max-w-3xl py-12">
        <div className="prose prose-lg dark:prose-invert max-w-none">
          {paragraphs.map((para, i) => {
            // First paragraph as drop-cap lead
            if (i === 0) {
              return (
                <p key={i} className="text-xl md:text-2xl leading-relaxed text-foreground/90 first-letter:text-6xl first-letter:font-display first-letter:font-bold first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:leading-none first-letter:text-primary mb-8">
                  {para}
                </p>
              );
            }
            // Periodically insert a pull-quote feel for variety
            if (i === 2 && paragraphs.length > 3) {
              return (
                <blockquote key={i} className="my-10 border-l-4 border-primary pl-6 py-2 italic text-xl md:text-2xl font-display text-foreground/90 leading-snug">
                  {para}
                </blockquote>
              );
            }
            return (
              <p key={i} className="text-lg leading-[1.85] text-foreground/85 mb-6">
                {para}
              </p>
            );
          })}
        </div>

        {/* Author bio card */}
        <div className="mt-12 p-6 rounded-2xl border border-border bg-gradient-to-br from-card to-muted/30">
          <div className="flex items-start gap-4">
            <img src={AUTHOR_AVATAR} alt={post.author} className="w-16 h-16 rounded-full ring-2 ring-primary/30 shrink-0" />
            <div>
              <p className="font-display font-bold text-lg">{post.author}</p>
              <p className="text-sm text-muted-foreground mb-2">{t("ফাউন্ডার, JohnNil.com", "Founder, JohnNil.com")}</p>
              <p className="text-sm text-foreground/80 leading-relaxed">
                {t(
                  "বাংলাদেশের একটা গ্রাম থেকে ১৮ বছর ধরে ডিজিটাল প্রোডাক্ট, কমিউনিটি ও ছোট ব্যবসা গড়ে তুলছি। সাপ্তাহিক প্রবন্ধে শেয়ার করি যা সত্যিই কাজ করে।",
                  "Building digital products, communities, and small businesses for 18 years — from a Bangladeshi village. Weekly essays on what actually works."
                )}
              </p>
            </div>
          </div>
        </div>
      </article>

      {/* Related */}
      {showRelated.length > 0 && (
        <section className="bg-gradient-to-br from-muted/40 via-background to-muted/40 py-16 border-t border-border/40">
          <div className="container max-w-6xl">
            <div className="flex items-center gap-2 mb-8">
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                {t("আরো পড়ুন", "Continue reading")}
              </span>
              <div className="flex-1 h-px bg-border/60" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {showRelated.map((p) => (
                <Link key={p.id} to={`/blog/${p.id}`} className="group bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-elegant transition-smooth">
                  <div className="aspect-[5/4] overflow-hidden">
                    <img
                      src={hq(displayImage(p.image, p.id, bn ? p.titleBn : p.title, p.category), 900)}
                      alt={p.title}
                      onError={fallbackImageHandler(p.id, bn ? p.titleBn : p.title, p.category)}
                      className="w-full h-full object-cover group-hover:scale-110 transition-[transform] duration-700"
                    />
                  </div>
                  <div className="p-5">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-primary">{p.category}</span>
                    <h3 className="font-display font-bold text-lg mt-2 mb-2 line-clamp-2 group-hover:text-primary transition-smooth leading-snug">
                      {bn ? p.titleBn : p.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{bn ? p.excerptBn : p.excerpt}</p>
                    <span className="text-xs font-semibold text-primary inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                      {t("পড়ুন", "Read")} <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default BlogDetail;
