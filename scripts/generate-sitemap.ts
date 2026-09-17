// Runs before `vite dev` and `vite build` (predev/prebuild hooks); writes public/sitemap.xml.
import { writeFileSync } from "fs";
import { resolve } from "path";

const BASE_URL = "https://johnnil.com";

interface SitemapEntry {
  path: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

const entries: SitemapEntry[] = [
  { path: "/", changefreq: "daily", priority: "1.0" },
  { path: "/quran", changefreq: "weekly", priority: "0.9" },
  { path: "/namaz", changefreq: "daily", priority: "0.9" },
  { path: "/hadith", changefreq: "weekly", priority: "0.8" },
  { path: "/ruqyah", changefreq: "monthly", priority: "0.7" },
  { path: "/weather", changefreq: "hourly", priority: "0.9" },
  { path: "/finance", changefreq: "weekly", priority: "0.8" },
  { path: "/offers", changefreq: "daily", priority: "0.8" },
  { path: "/livetv", changefreq: "daily", priority: "0.9" },
  { path: "/business-guide", changefreq: "weekly", priority: "0.7" },
  { path: "/health", changefreq: "weekly", priority: "0.8" },
  { path: "/travel", changefreq: "weekly", priority: "0.7" },
  { path: "/politics", changefreq: "hourly", priority: "0.8" },
  { path: "/war", changefreq: "hourly", priority: "0.7" },
  { path: "/stocks", changefreq: "hourly", priority: "0.8" },
  { path: "/newspapers", changefreq: "daily", priority: "0.8" },
  { path: "/shop", changefreq: "daily", priority: "0.9" },
  { path: "/services", changefreq: "weekly", priority: "0.9" },
  { path: "/free-internet", changefreq: "weekly", priority: "0.8" },
  { path: "/marketplace", changefreq: "daily", priority: "0.7" },
  { path: "/rentals", changefreq: "weekly", priority: "0.7" },
  { path: "/portfolio", changefreq: "monthly", priority: "0.6" },
  { path: "/blog", changefreq: "weekly", priority: "0.8" },
  { path: "/about", changefreq: "monthly", priority: "0.5" },
  { path: "/appointment", changefreq: "monthly", priority: "0.6" },
  { path: "/policies", changefreq: "yearly", priority: "0.3" },
  { path: "/business-tools", changefreq: "monthly", priority: "0.6" },
  { path: "/ad-maker", changefreq: "monthly", priority: "0.6" },
  { path: "/thumbnail", changefreq: "monthly", priority: "0.5" },
  { path: "/voice", changefreq: "monthly", priority: "0.5" },
  { path: "/converter", changefreq: "monthly", priority: "0.6" },
  { path: "/downloader", changefreq: "monthly", priority: "0.6" },
  { path: "/scheduler", changefreq: "monthly", priority: "0.5" },
  { path: "/land", changefreq: "monthly", priority: "0.6" },
  { path: "/height", changefreq: "monthly", priority: "0.5" },
  { path: "/solar", changefreq: "monthly", priority: "0.6" },
  { path: "/tax", changefreq: "monthly", priority: "0.7" },
  { path: "/warish", changefreq: "monthly", priority: "0.7" },
  { path: "/profit-loss", changefreq: "monthly", priority: "0.6" },
  { path: "/gadget", changefreq: "monthly", priority: "0.6" },
  { path: "/movies", changefreq: "weekly", priority: "0.6" },
  { path: "/railway", changefreq: "weekly", priority: "0.7" },
  { path: "/phone-lookup", changefreq: "monthly", priority: "0.6" },
  { path: "/phone-root-unlock", changefreq: "monthly", priority: "0.5" },
  { path: "/capcut-pro", changefreq: "monthly", priority: "0.5" },
  { path: "/mini-projector", changefreq: "monthly", priority: "0.5" },
  { path: "/chat", changefreq: "monthly", priority: "0.5" },
  { path: "/giveaway", changefreq: "weekly", priority: "0.5" },
];

// Pull published products, services and blog posts so every public detail
// page is discoverable by search engines.
async function dynamicEntries(): Promise<SitemapEntry[]> {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) return [];
  const headers = { apikey: key, Authorization: `Bearer ${key}` };

  const grab = async (
    table: string,
    query: string,
    prefix: string,
    changefreq: SitemapEntry["changefreq"],
    priority: string,
  ): Promise<SitemapEntry[]> => {
    try {
      const res = await fetch(`${url}/rest/v1/${table}?${query}`, { headers });
      if (!res.ok) return [];
      const rows = (await res.json()) as { id: string }[];
      return rows.map((r) => ({ path: `${prefix}/${r.id}`, changefreq, priority }));
    } catch {
      return [];
    }
  };

  const [products, services, posts] = await Promise.all([
    grab("shop_products", "select=id&is_active=eq.true&limit=2000", "/shop", "weekly", "0.8"),
    grab("services", "select=id&limit=500", "/services", "monthly", "0.8"),
    grab("blog_posts", "select=id&is_published=eq.true&limit=1000", "/blog", "monthly", "0.7"),
  ]);
  return [...products, ...services, ...posts];
}

function generateSitemap(entries: SitemapEntry[]) {
  const urls = entries.map((e) =>
    [
      `  <url>`,
      `    <loc>${BASE_URL}${e.path}</loc>`,
      e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
      e.priority ? `    <priority>${e.priority}</priority>` : null,
      `  </url>`,
    ]
      .filter(Boolean)
      .join("\n"),
  );

  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    ...urls,
    `</urlset>`,
  ].join("\n");
}

writeFileSync(resolve("public/sitemap.xml"), generateSitemap(entries));
console.log(`sitemap.xml written (${entries.length} entries)`);
