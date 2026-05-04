import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, Clock } from "lucide-react";
import { blogPosts } from "@/data/mockData";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";

const BlogDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { language } = useLanguage();

  const post = blogPosts.find((p) => p.id === id);
  if (!post) {
    return (
      <div className="container py-20 text-center">
        <Link to="/blog"><Button>{language === "bn" ? "ব্লগে ফিরুন" : "Back to Blog"}</Button></Link>
      </div>
    );
  }

  const related = blogPosts.filter((p) => p.id !== post.id).slice(0, 3);

  return (
    <div>
      <article className="container py-12 max-w-3xl">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6 -ml-3">
          <ArrowLeft className="w-4 h-4 mr-1" /> {language === "bn" ? "ফিরে যান" : "Back"}
        </Button>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <span className="inline-block px-3 py-1 rounded-full gradient-bg-primary text-white text-xs font-semibold mb-4">{post.category}</span>
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4 leading-tight">
            {language === "bn" ? post.titleBn : post.title}
          </h1>
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-8">
            <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {post.date}</span>
            <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {post.readTime}</span>
          </div>

          <div className="aspect-video rounded-2xl overflow-hidden shadow-elegant mb-8">
            <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
          </div>

          <div className="prose prose-lg max-w-none text-foreground/80 leading-relaxed space-y-4">
            <p className="text-xl font-medium text-foreground">{language === "bn" ? post.excerptBn : post.excerpt}</p>
            {(language === "bn" ? post.contentBn : post.content).map((para, i) => (
              <p key={i}>{para}</p>
            ))}
            <p className="text-sm text-muted-foreground pt-4 border-t border-border/50 mt-6">
              {language === "bn" ? "লেখক: " : "Author: "}<span className="font-semibold text-foreground">{post.author}</span>
            </p>
          </div>
        </motion.div>
      </article>

      {related.length > 0 && (
        <section className="bg-gradient-to-br from-muted/40 via-background to-muted/40 py-16">
          <div className="container max-w-5xl">
            <h2 className="text-2xl font-display font-bold mb-6">
              <span className="gradient-text">{language === "bn" ? "আরো পড়ুন" : "Read More"}</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {related.map((p) => (
                <Link key={p.id} to={`/blog/${p.id}`} className="bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-elegant transition-smooth group">
                  <div className="aspect-[4/3] overflow-hidden">
                    <img src={p.image} alt={p.title} className="w-full h-full object-cover group-hover:scale-110 transition-smooth" />
                  </div>
                  <div className="p-4">
                    <span className="text-xs font-semibold text-primary">{p.category}</span>
                    <h3 className="font-display font-bold mt-1 line-clamp-2 group-hover:text-primary transition-smooth">
                      {language === "bn" ? p.titleBn : p.title}
                    </h3>
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
