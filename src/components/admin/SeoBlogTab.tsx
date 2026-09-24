import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, Sparkles, Save, Send } from "lucide-react";

const IDEAS = [
  "ঢাকায় সেরা অনলাইন শপ",
  "বাংলাদেশে ফ্রি ইন্টারনেট পাওয়ার উপায়",
  "আজকের নামাজের সময় ঢাকা",
  "ট্যাক্স ক্যালকুলেটর বাংলাদেশ ২০২৬",
  "ওয়েবসাইট তৈরি সার্ভিস ঢাকা",
  "মোবাইল রুট আনলক বাংলাদেশ",
];

type Post = {
  title: string; title_bn: string; slug: string; excerpt: string; excerpt_bn: string;
  content: string; content_bn: string; category: string; tags: string[];
};

const SeoBlogTab = () => {
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [post, setPost] = useState<Post | null>(null);

  const generate = async () => {
    if (!topic.trim()) return toast.error("বিষয় বা কিওয়ার্ড লিখুন");
    setLoading(true);
    const { data, error } = await supabase.functions.invoke("admin-ai", { body: { task: "seo_blog", input: { prompt: topic } } });
    setLoading(false);
    if (error || data?.error) {
      const e = data?.error || error?.message;
      return toast.error(e === "rate_limited" ? "একটু পরে আবার চেষ্টা করুন" : e === "payment_required" ? "AI ক্রেডিট শেষ" : "তৈরি করা যায়নি");
    }
    const r = data?.result || {};
    if (!r.title_bn) return toast.error("AI ঠিক উত্তর দেয়নি, আবার চেষ্টা করুন");
    setPost({ ...r, tags: Array.isArray(r.tags) ? r.tags : [] });
    toast.success("আর্টিকেল তৈরি হয়েছে");
  };

  const save = async (publish: boolean) => {
    if (!post) return;
    setSaving(true);
    const slug = (post.slug || post.title).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + "-" + Date.now().toString(36);
    const { error } = await supabase.from("blog_posts").insert({
      title: post.title || post.title_bn, title_bn: post.title_bn, slug,
      excerpt: post.excerpt, excerpt_bn: post.excerpt_bn,
      content: post.content, content_bn: post.content_bn,
      category: post.category || "SEO", tags: post.tags, author: "JohnNil",
      is_published: publish, published_at: publish ? new Date().toISOString() : null,
    });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(publish ? "ব্লগে প্রকাশিত হয়েছে" : "ড্রাফট হিসেবে রাখা হয়েছে");
    setPost(null); setTopic("");
  };

  const set = (k: keyof Post, v: string) => post && setPost({ ...post, [k]: v });

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold">SEO ব্লগ জেনারেটর</h2>
        <p className="text-sm text-muted-foreground">কিওয়ার্ড দিন — AI বাংলা + ইংরেজি গুগল-ফ্রেন্ডলি আর্টিকেল লিখে দেবে, এক ক্লিকে ব্লগে প্রকাশ।</p>
      </div>
      <div className="rounded-xl border bg-card p-4 space-y-3">
        <div className="flex gap-2">
          <Input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="যেমন: ঢাকায় সস্তায় মিনি প্রজেক্টর" onKeyDown={(e) => e.key === "Enter" && generate()} />
          <Button onClick={generate} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />} তৈরি করুন
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {IDEAS.map((i) => (
            <button key={i} onClick={() => setTopic(i)} className="text-xs rounded-full border px-3 py-1 hover:bg-muted">{i}</button>
          ))}
        </div>
      </div>

      {post && (
        <div className="rounded-xl border bg-card p-4 space-y-3">
          <label className="text-xs text-muted-foreground">বাংলা শিরোনাম</label>
          <Input value={post.title_bn} onChange={(e) => set("title_bn", e.target.value)} />
          <label className="text-xs text-muted-foreground">English title</label>
          <Input value={post.title} onChange={(e) => set("title", e.target.value)} />
          <label className="text-xs text-muted-foreground">গুগলে দেখানো বর্ণনা</label>
          <Textarea rows={2} value={post.excerpt_bn} onChange={(e) => set("excerpt_bn", e.target.value)} />
          <label className="text-xs text-muted-foreground">বাংলা আর্টিকেল</label>
          <Textarea rows={14} value={post.content_bn} onChange={(e) => set("content_bn", e.target.value)} />
          <label className="text-xs text-muted-foreground">English article</label>
          <Textarea rows={6} value={post.content} onChange={(e) => set("content", e.target.value)} />
          <div className="flex flex-wrap gap-1">
            {post.tags.map((t) => <span key={t} className="text-xs rounded bg-muted px-2 py-0.5">#{t}</span>)}
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => save(false)} disabled={saving}><Save className="h-4 w-4" /> ড্রাফট</Button>
            <Button onClick={() => save(true)} disabled={saving}><Send className="h-4 w-4" /> প্রকাশ করুন</Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SeoBlogTab;
