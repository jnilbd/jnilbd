import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2 } from "lucide-react";

type Block = { id: string; type: string; [k: string]: any };

export default function LandingPage() {
  const { slug } = useParams();
  const [page, setPage] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data } = await supabase.from("landing_pages").select("*").eq("slug", slug).maybeSingle();
      setPage(data || null);
      setLoading(false);
      if (data?.id) {
        supabase.from("landing_pages").update({ views: Number(data.views || 0) + 1 }).eq("id", data.id).then(() => {});
      }
    })();
  }, [slug]);

  if (loading) {
    return <div className="container py-24 text-center"><Loader2 className="h-6 w-6 animate-spin inline" /></div>;
  }
  if (!page) {
    return (
      <div className="container py-24 text-center space-y-4">
        <h1 className="text-2xl font-bold">পেজটি পাওয়া যায়নি</h1>
        <Link to="/"><Button>হোমে ফিরুন</Button></Link>
      </div>
    );
  }

  const blocks: Block[] = Array.isArray(page.blocks) ? page.blocks : [];

  return (
    <>
      <Helmet>
        <title>{(page.seo_title || page.title || "").slice(0, 60)}</title>
        {page.seo_description && <meta name="description" content={String(page.seo_description).slice(0, 158)} />}
        <meta property="og:title" content={page.seo_title || page.title} />
        {page.seo_description && <meta property="og:description" content={page.seo_description} />}
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>

      <article className="pb-20">
        {blocks.map((b) => (
          <BlockView key={b.id} block={b} />
        ))}
        {blocks.length === 0 && (
          <div className="container py-24 text-center">
            <h1 className="text-3xl font-display font-bold">{page.title}</h1>
          </div>
        )}
      </article>
    </>
  );
}

export function BlockView({ block: b }: { block: Block }) {
  switch (b.type) {
    case "hero":
      return (
        <section className="relative overflow-hidden border-b border-border/50">
          {b.image && <img src={b.image} alt={b.title || ""} className="absolute inset-0 w-full h-full object-cover opacity-20" loading="lazy" />}
          <div className="relative container py-20 text-center max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-4"><span className="gradient-text">{b.title}</span></h1>
            {b.subtitle && <p className="text-lg text-muted-foreground mb-6">{b.subtitle}</p>}
            {b.ctaText && (
              <Button asChild size="lg" className="rounded-full gradient-bg-primary text-primary-foreground border-0">
                <a href={b.ctaLink || "#order"}>{b.ctaText}</a>
              </Button>
            )}
          </div>
        </section>
      );
    case "text":
      return (
        <section className="container py-10 max-w-3xl space-y-3">
          {b.title && <h2 className="text-2xl font-display font-bold">{b.title}</h2>}
          <div className="text-muted-foreground whitespace-pre-line leading-relaxed">{b.body}</div>
        </section>
      );
    case "image":
      return (
        <section className="container py-8 max-w-4xl">
          {b.image && <img src={b.image} alt={b.title || "image"} className="w-full rounded-2xl border border-border/50" loading="lazy" />}
          {b.title && <p className="text-center text-sm text-muted-foreground mt-2">{b.title}</p>}
        </section>
      );
    case "video":
      return (
        <section className="container py-8 max-w-3xl">
          <div className="aspect-video rounded-2xl overflow-hidden border border-border/50">
            <iframe src={b.url} title={b.title || "video"} className="w-full h-full" allowFullScreen loading="lazy" />
          </div>
        </section>
      );
    case "features": {
      const items = String(b.body || "").split("\n").filter(Boolean);
      return (
        <section className="container py-10 max-w-4xl">
          {b.title && <h2 className="text-2xl font-display font-bold mb-5 text-center">{b.title}</h2>}
          <div className="grid sm:grid-cols-2 gap-3">
            {items.map((line, i) => (
              <div key={i} className="flex items-start gap-2 rounded-xl border border-border/60 bg-card p-3">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <span className="text-sm">{line}</span>
              </div>
            ))}
          </div>
        </section>
      );
    }
    case "faq": {
      const pairs = String(b.body || "").split("\n").filter(Boolean).map((l) => l.split("|"));
      return (
        <section className="container py-10 max-w-3xl">
          {b.title && <h2 className="text-2xl font-display font-bold mb-5">{b.title}</h2>}
          <div className="space-y-2">
            {pairs.map(([q, a], i) => (
              <details key={i} className="rounded-xl border border-border/60 bg-card p-3">
                <summary className="text-sm font-semibold cursor-pointer">{q}</summary>
                <p className="text-sm text-muted-foreground mt-2">{a}</p>
              </details>
            ))}
          </div>
        </section>
      );
    }
    case "cta":
      return (
        <section id="order" className="container py-12">
          <div className="rounded-3xl border border-primary/30 bg-primary/5 p-8 text-center max-w-3xl mx-auto">
            <h2 className="text-2xl font-display font-bold mb-2">{b.title}</h2>
            {b.subtitle && <p className="text-muted-foreground mb-5">{b.subtitle}</p>}
            <Button asChild size="lg" className="rounded-full gradient-bg-primary text-primary-foreground border-0">
              <a href={b.ctaLink || "/shop"}>{b.ctaText || "অর্ডার করুন"}</a>
            </Button>
          </div>
        </section>
      );
    default:
      return null;
  }
}
