import { motion } from "framer-motion";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { blogPosts } from "@/data/mockData";

const Blog = () => {
  const { language } = useLanguage();

  return (
    <div>
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 gradient-bg-primary opacity-90" />
        <div className="container relative z-10 text-white text-center">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-5xl md:text-6xl font-display font-bold mb-3">
            {language === "bn" ? "ব্লগ" : "Blog"}
          </motion.h1>
          <p className="text-xl text-white/90">{language === "bn" ? "টিপস, গাইড ও ইনসাইট" : "Tips, Guides & Insights"}</p>
        </div>
      </section>

      <section className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogPosts.map((post, i) => (
            <motion.article key={post.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
              whileHover={{ y: -6 }} className="group bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-elegant transition-smooth border border-border/50">
              <Link to={`/blog/${post.id}`}>
                <div className="aspect-[4/3] overflow-hidden">
                  <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-110 transition-smooth" />
                </div>
                <div className="p-6">
                  <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-3">{post.category}</span>
                  <h2 className="font-display font-bold text-xl mb-2 group-hover:text-primary transition-smooth line-clamp-2">
                    {language === "bn" ? post.titleBn : post.title}
                  </h2>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{language === "bn" ? post.excerptBn : post.excerpt}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {post.date}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {post.readTime}</span>
                    <ArrowRight className="w-4 h-4 ml-auto group-hover:text-primary group-hover:translate-x-1 transition-smooth" />
                  </div>
                </div>
              </Link>
            </motion.article>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Blog;
