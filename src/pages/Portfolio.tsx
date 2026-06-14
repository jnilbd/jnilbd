import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Briefcase, Award, Users, Zap, Settings } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { portfolioItems as mockProjects, experience as mockExperience } from "@/data/mockData";
import { displayImage, fallbackImageHandler } from "@/lib/siteImages";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

type Project = {
  id: string; title: string; title_bn: string | null; category: string | null;
  year: string | null; image: string | null; link: string | null;
};
type Experience = {
  id: string; year: string | null; title: string; title_bn: string | null;
  company: string | null; description: string | null; description_bn: string | null;
};

const Portfolio = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [experience, setExperience] = useState<Experience[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    (async () => {
      const [{ data: pj }, { data: ex }] = await Promise.all([
        supabase.from("portfolio_projects").select("*").eq("is_active", true).order("sort_order"),
        supabase.from("portfolio_experience").select("*").eq("is_active", true).order("sort_order"),
      ]);
      setProjects((pj as Project[]) || []);
      setExperience((ex as Experience[]) || []);
    })();
  }, []);

  useEffect(() => {
    if (!user) { setIsAdmin(false); return; }
    supabase.rpc("has_role", { _user_id: user.id, _role: "admin" }).then(({ data }) => setIsAdmin(!!data));
  }, [user]);

  // Fallback to mock data if DB empty
  const showProjects = projects.length ? projects.map(p => ({
    id: p.id, title: p.title, titleBn: p.title_bn || p.title,
    category: p.category || "", year: p.year || "", image: p.image || "",
  })) : mockProjects;
  const showExperience = experience.length ? experience.map(e => ({
    year: e.year || "", title: e.title, titleBn: e.title_bn || e.title,
    company: e.company || "", description: e.description || "",
    descriptionBn: e.description_bn || e.description || "",
  })) : mockExperience;

  const stats = [
    { icon: Briefcase, value: `${showProjects.length}+`, label: language === "bn" ? "প্রজেক্ট" : "Projects" },
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
          {isAdmin && (
            <Link to="/admin/portfolio" className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-full bg-white/15 backdrop-blur hover:bg-white/25 text-sm font-semibold transition-smooth">
              <Settings className="w-4 h-4" /> {language === "bn" ? "পোর্টফোলিও এডিট" : "Edit Portfolio"}
            </Link>
          )}
        </div>
      </section>

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

      <section className="container py-16">
        <h2 className="text-3xl md:text-4xl font-display font-bold mb-8">
          <span className="gradient-text">{language === "bn" ? "প্রজেক্ট" : "Projects"}</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {showProjects.map((p, i) => (
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

      <section className="bg-gradient-to-br from-muted/40 via-background to-muted/40 py-16">
        <div className="container">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-10">
            <span className="gradient-text">{language === "bn" ? "ওয়ার্ক এক্সপেরিয়েন্স" : "Work Experience"}</span>
          </h2>
          <div className="max-w-3xl mx-auto space-y-6">
            {showExperience.map((e, i) => (
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
