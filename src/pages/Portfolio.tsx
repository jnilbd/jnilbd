import { motion } from "framer-motion";
import { Briefcase, Award, Users, Zap } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { portfolioItems, experience } from "@/data/mockData";
import { displayImage, fallbackImageHandler } from "@/lib/siteImages";

const Portfolio = () => {
  const { language } = useLanguage();

  const stats = [
    { icon: Briefcase, value: "100+", label: language === "bn" ? "প্রজেক্ট" : "Projects" },
    { icon: Users, value: "5K+", label: language === "bn" ? "কাস্টমার" : "Customers" },
    { icon: Award, value: "15+", label: language === "bn" ? "অ্যাওয়ার্ড" : "Awards" },
    { icon: Zap, value: "5+", label: language === "bn" ? "বছর অভিজ্ঞতা" : "Years Exp." },
  ];

  return (
    <div>
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 gradient-bg-cool opacity-90" />
        <div className="container relative z-10 text-white text-center">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-5xl md:text-6xl font-display font-bold mb-3">
            {language === "bn" ? "পোর্টফোলিও" : "Portfolio"}
          </motion.h1>
          <p className="text-xl text-white/90">{language === "bn" ? "আমার কাজ ও অভিজ্ঞতা" : "My Work & Experience"}</p>
        </div>
      </section>

      {/* Stats */}
      <section className="container -mt-10 relative z-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
              className="bg-card rounded-2xl p-6 text-center shadow-elegant border border-border/50">
              <s.icon className="w-8 h-8 mx-auto text-primary mb-2" />
              <div className="text-3xl font-bold gradient-text">{s.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Projects */}
      <section className="container py-16">
        <h2 className="text-3xl md:text-4xl font-display font-bold mb-8">
          <span className="gradient-text">{language === "bn" ? "প্রজেক্ট" : "Projects"}</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {portfolioItems.map((p, i) => (
            <motion.div key={p.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
              whileHover={{ y: -6 }} className="group relative rounded-2xl overflow-hidden shadow-card hover:shadow-elegant transition-smooth">
              <div className="aspect-[4/3]">
                <img src={displayImage(p.image, p.id, language === "bn" ? p.titleBn : p.title, p.category)} alt={p.title} onError={fallbackImageHandler(p.id, language === "bn" ? p.titleBn : p.title, p.category)} className="w-full h-full object-cover group-hover:scale-110 transition-smooth" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-6 flex flex-col justify-end text-white">
                <span className="text-xs font-semibold uppercase tracking-wide opacity-80">{p.category} • {p.year}</span>
                <h3 className="text-xl font-display font-bold mt-1">{language === "bn" ? p.titleBn : p.title}</h3>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Experience */}
      <section className="bg-gradient-to-br from-muted/40 via-background to-muted/40 py-16">
        <div className="container">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-10">
            <span className="gradient-text">{language === "bn" ? "ওয়ার্ক এক্সপেরিয়েন্স" : "Work Experience"}</span>
          </h2>
          <div className="max-w-3xl mx-auto space-y-6">
            {experience.map((e, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="bg-card rounded-2xl p-6 shadow-card border border-border/50 relative pl-8">
                <div className="absolute left-0 top-6 bottom-6 w-1 rounded-full gradient-bg-primary" />
                <span className="text-xs font-semibold text-primary uppercase tracking-wide">{e.year}</span>
                <h3 className="text-xl font-display font-bold mt-1">{language === "bn" ? e.titleBn : e.title}</h3>
                <p className="text-sm font-semibold text-muted-foreground mb-2">{e.company}</p>
                <p className="text-foreground/80">{language === "bn" ? e.descriptionBn : e.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Portfolio;
