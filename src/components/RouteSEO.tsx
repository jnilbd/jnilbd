import { useLocation } from "react-router-dom";
import SEO from "@/components/SEO";
import { getRouteMeta, SITE_NAME, SITE_URL } from "@/lib/seoRoutes";

/**
 * Renders per-route title/description/canonical/OG + JSON-LD for every
 * public route listed in seoRoutes.ts. Pages that render their own <SEO />
 * (Home, Giveaway, product/service/blog detail) are not listed there, so
 * they keep full control of their own tags.
 */
const RouteSEO = () => {
  const { pathname } = useLocation();
  const meta = getRouteMeta(pathname);
  if (!meta) return null;

  const url = `${SITE_URL}${pathname === "/" ? "/" : pathname.replace(/\/+$/, "")}`;
  const plainTitle = meta.title.split("|")[0].trim();

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: plainTitle,
      description: meta.description,
      url,
      inLanguage: "bn-BD",
      isPartOf: { "@type": "WebSite", name: SITE_NAME, url: `${SITE_URL}/` },
      publisher: { "@type": "Organization", name: SITE_NAME, url: `${SITE_URL}/` },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "হোম", item: `${SITE_URL}/` },
        { "@type": "ListItem", position: 2, name: plainTitle, item: url },
      ],
    },
  ];

  return (
    <SEO
      title={meta.title}
      description={meta.description}
      path={pathname}
      keywords={meta.keywords}
      type={meta.type || "website"}
      jsonLd={jsonLd}
    />
  );
};

export default RouteSEO;
