import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Briefcase, Save, Trash2, Plus, ArrowLeft, Loader2, EyeOff, Eye, GripVertical } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

type Project = {
  id: string; title: string; title_bn: string | null; category: string | null;
  year: string | null; image: string | null; link: string | null;
  description: string | null; description_bn: string | null;
  sort_order: number; is_active: boolean;
};
type Experience = {
  id: string; year: string | null; title: string; title_bn: string | null;
  company: string | null; description: string | null; description_bn: string | null;
  sort_order: number; is_active: boolean;
};

const AdminPortfolio = () => {
  const { user, loading: authLoading } = useAuth();
  const { language } = useLanguage();
  const nav = useNavigate();
  const bn = language === "bn";
  const t = (b: string, e: string) => (bn ? b : e);

  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [exps, setExps] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { nav("/auth?next=/admin/portfolio", { replace: true }); return; }
    supabase.rpc("has_role", { _user_id: user.id, _role: "admin" }).then(({ data }) => {
      setAllowed(!!data);
    });
  }, [user, authLoading, nav]);

  const load = async () => {
    setLoading(true);
    const [{ data: pj }, { data: ex }] = await Promise.all([
      supabase.from("portfolio_projects").select("*").order("sort_order"),
      supabase.from("portfolio_experience").select("*").order("sort_order"),
    ]);
    setProjects((pj as Project[]) || []);
    setExps((ex as Experience[]) || []);
    setLoading(false);
  };

  useEffect(() => { if (allowed) load(); }, [allowed]);

  const updateProject = (id: string, patch: Partial<Project>) =>
    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...patch } : p));
  const updateExp = (id: string, patch: Partial<Experience>) =>
    setExps(prev => prev.map(p => p.id === id ? { ...p, ...patch } : p));

  const saveProject = async (p: Project) => {
    setSavingId(p.id);
    const { error } = await supabase.from("portfolio_projects").update({
      title: p.title, title_bn: p.title_bn, category: p.category, year: p.year,
      image: p.image, link: p.link, description: p.description, description_bn: p.description_bn,
      sort_order: p.sort_order, is_active: p.is_active,
    }).eq("id", p.id);
    setSavingId(null);
    if (error) toast.error(error.message);
    else toast.success(t("সেভ হয়েছে", "Saved"));
  };
  const saveExp = async (e: Experience) => {
    setSavingId(e.id);
    const { error } = await supabase.from("portfolio_experience").update({
      year: e.year, title: e.title, title_bn: e.title_bn, company: e.company,
      description: e.description, description_bn: e.description_bn,
      sort_order: e.sort_order, is_active: e.is_active,
    }).eq("id", e.id);
    setSavingId(null);
    if (error) toast.error(error.message);
    else toast.success(t("সেভ হয়েছে", "Saved"));
  };

  const deleteProject = async (id: string) => {
    if (!confirm(t("ডিলিট করবেন?", "Delete this project?"))) return;
    const { error } = await supabase.from("portfolio_projects").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success(t("ডিলিট হয়েছে", "Deleted")); load(); }
  };
  const deleteExp = async (id: string) => {
    if (!confirm(t("ডিলিট করবেন?", "Delete this entry?"))) return;
    const { error } = await supabase.from("portfolio_experience").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success(t("ডিলিট হয়েছে", "Deleted")); load(); }
  };

  const addProject = async () => {
    const maxOrder = Math.max(0, ...projects.map(p => p.sort_order));
    const { error } = await supabase.from("portfolio_projects").insert({
      title: t("নতুন প্রজেক্ট", "New Project"), sort_order: maxOrder + 1,
    });
    if (error) toast.error(error.message); else load();
  };
  const addExp = async () => {
    const maxOrder = Math.max(0, ...exps.map(p => p.sort_order));
    const { error } = await supabase.from("portfolio_experience").insert({
      title: t("নতুন এক্সপেরিয়েন্স", "New Experience"), sort_order: maxOrder + 1,
    });
    if (error) toast.error(error.message); else load();
  };

  if (authLoading || allowed === null) {
    return <div className="container py-20 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" /></div>;
  }
  if (allowed === false) {
    return (
      <div className="container py-20 text-center">
        <Card className="max-w-md mx-auto p-8">
          <EyeOff className="w-12 h-12 mx-auto text-rose-500 mb-3" />
          <h2 className="font-display font-bold text-2xl mb-2">{t("অ্যাক্সেস নেই", "Access Denied")}</h2>
          <p className="text-muted-foreground text-sm mb-4">{t("এই পেজ শুধুমাত্র অ্যাডমিনদের জন্য।", "This page is for admins only.")}</p>
          <Button onClick={() => nav("/portfolio")} variant="outline"><ArrowLeft className="w-4 h-4 mr-1" /> {t("ফিরে যান", "Go back")}</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-5xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-bg-primary flex items-center justify-center text-white">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold">{t("পোর্টফোলিও অ্যাডমিন", "Portfolio Admin")}</h1>
              <p className="text-xs text-muted-foreground">{t("শুধুমাত্র আপনার জন্য • রান্নাঘর মোড 🍳", "Owner-only • kitchen mode 🍳")}</p>
            </div>
          </div>
          <Button variant="outline" onClick={() => nav("/portfolio")} size="sm">
            <ArrowLeft className="w-4 h-4 mr-1" /> {t("পোর্টফোলিও দেখুন", "View portfolio")}
          </Button>
        </div>

        {loading ? (
          <div className="py-12 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div>
        ) : (
          <Tabs defaultValue="projects">
            <TabsList className="grid grid-cols-2 w-full max-w-md mb-4">
              <TabsTrigger value="projects">{t(`প্রজেক্ট (${projects.length})`, `Projects (${projects.length})`)}</TabsTrigger>
              <TabsTrigger value="experience">{t(`এক্সপেরিয়েন্স (${exps.length})`, `Experience (${exps.length})`)}</TabsTrigger>
            </TabsList>

            <TabsContent value="projects" className="space-y-4">
              <Button onClick={addProject} className="gradient-bg-primary text-white">
                <Plus className="w-4 h-4 mr-1" /> {t("নতুন প্রজেক্ট", "Add project")}
              </Button>
              {projects.map(p => (
                <Card key={p.id} className={p.is_active ? "" : "opacity-60"}>
                  <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                    <CardTitle className="text-base flex items-center gap-2">
                      <GripVertical className="w-4 h-4 text-muted-foreground" />
                      <Input className="h-8 w-16" type="number" value={p.sort_order} onChange={e => updateProject(p.id, { sort_order: parseInt(e.target.value) || 0 })} />
                      <span className="truncate">{p.title || "—"}</span>
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Switch checked={p.is_active} onCheckedChange={v => updateProject(p.id, { is_active: v })} />
                      <Button size="icon" variant="ghost" onClick={() => deleteProject(p.id)}><Trash2 className="w-4 h-4 text-rose-500" /></Button>
                    </div>
                  </CardHeader>
                  <CardContent className="grid sm:grid-cols-2 gap-3">
                    <div><Label className="text-xs">{t("টাইটেল (EN)", "Title (EN)")}</Label><Input value={p.title} onChange={e => updateProject(p.id, { title: e.target.value })} /></div>
                    <div><Label className="text-xs">{t("টাইটেল (BN)", "Title (BN)")}</Label><Input value={p.title_bn || ""} onChange={e => updateProject(p.id, { title_bn: e.target.value })} /></div>
                    <div><Label className="text-xs">{t("ক্যাটাগরি", "Category")}</Label><Input value={p.category || ""} onChange={e => updateProject(p.id, { category: e.target.value })} /></div>
                    <div><Label className="text-xs">{t("সাল", "Year")}</Label><Input value={p.year || ""} onChange={e => updateProject(p.id, { year: e.target.value })} /></div>
                    <div className="sm:col-span-2"><Label className="text-xs">{t("ইমেজ URL", "Image URL")}</Label><Input value={p.image || ""} onChange={e => updateProject(p.id, { image: e.target.value })} placeholder="https://..." /></div>
                    <div className="sm:col-span-2"><Label className="text-xs">{t("লিংক (ঐচ্ছিক)", "Link (optional)")}</Label><Input value={p.link || ""} onChange={e => updateProject(p.id, { link: e.target.value })} placeholder="https://..." /></div>
                    <div className="sm:col-span-2"><Label className="text-xs">{t("বর্ণনা (EN)", "Description (EN)")}</Label><Textarea rows={2} value={p.description || ""} onChange={e => updateProject(p.id, { description: e.target.value })} /></div>
                    <div className="sm:col-span-2"><Label className="text-xs">{t("বর্ণনা (BN)", "Description (BN)")}</Label><Textarea rows={2} value={p.description_bn || ""} onChange={e => updateProject(p.id, { description_bn: e.target.value })} /></div>
                    {p.image && <img src={p.image} alt="" className="sm:col-span-2 max-h-32 w-auto rounded object-cover" onError={(e) => ((e.target as HTMLImageElement).style.display = "none")} />}
                    <Button onClick={() => saveProject(p)} disabled={savingId === p.id} className="sm:col-span-2 gradient-bg-primary text-white">
                      {savingId === p.id ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Save className="w-4 h-4 mr-1" />}
                      {t("সেভ", "Save")}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="experience" className="space-y-4">
              <Button onClick={addExp} className="gradient-bg-primary text-white">
                <Plus className="w-4 h-4 mr-1" /> {t("নতুন এক্সপেরিয়েন্স", "Add experience")}
              </Button>
              {exps.map(e => (
                <Card key={e.id} className={e.is_active ? "" : "opacity-60"}>
                  <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Input className="h-8 w-16" type="number" value={e.sort_order} onChange={ev => updateExp(e.id, { sort_order: parseInt(ev.target.value) || 0 })} />
                      <span className="truncate">{e.title || "—"}</span>
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Switch checked={e.is_active} onCheckedChange={v => updateExp(e.id, { is_active: v })} />
                      <Button size="icon" variant="ghost" onClick={() => deleteExp(e.id)}><Trash2 className="w-4 h-4 text-rose-500" /></Button>
                    </div>
                  </CardHeader>
                  <CardContent className="grid sm:grid-cols-2 gap-3">
                    <div><Label className="text-xs">{t("সময়কাল", "Year/Period")}</Label><Input value={e.year || ""} onChange={ev => updateExp(e.id, { year: ev.target.value })} placeholder="2024 - Present" /></div>
                    <div><Label className="text-xs">{t("কোম্পানি", "Company")}</Label><Input value={e.company || ""} onChange={ev => updateExp(e.id, { company: ev.target.value })} /></div>
                    <div><Label className="text-xs">{t("পদ (EN)", "Title (EN)")}</Label><Input value={e.title} onChange={ev => updateExp(e.id, { title: ev.target.value })} /></div>
                    <div><Label className="text-xs">{t("পদ (BN)", "Title (BN)")}</Label><Input value={e.title_bn || ""} onChange={ev => updateExp(e.id, { title_bn: ev.target.value })} /></div>
                    <div className="sm:col-span-2"><Label className="text-xs">{t("বর্ণনা (EN)", "Description (EN)")}</Label><Textarea rows={3} value={e.description || ""} onChange={ev => updateExp(e.id, { description: ev.target.value })} /></div>
                    <div className="sm:col-span-2"><Label className="text-xs">{t("বর্ণনা (BN)", "Description (BN)")}</Label><Textarea rows={3} value={e.description_bn || ""} onChange={ev => updateExp(e.id, { description_bn: ev.target.value })} /></div>
                    <Button onClick={() => saveExp(e)} disabled={savingId === e.id} className="sm:col-span-2 gradient-bg-primary text-white">
                      {savingId === e.id ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Save className="w-4 h-4 mr-1" />}
                      {t("সেভ", "Save")}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        )}
      </motion.div>
    </div>
  );
};

export default AdminPortfolio;
