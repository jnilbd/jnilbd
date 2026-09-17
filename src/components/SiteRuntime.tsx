import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { X, Megaphone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const sid = () => {
  try {
    let v = sessionStorage.getItem("jn_sid");
    if (!v) { v = Math.random().toString(36).slice(2) + Date.now().toString(36); sessionStorage.setItem("jn_sid", v); }
    return v;
  } catch { return "anon"; }
};

const injectOnce = (id: string, build: () => HTMLElement) => {
  if (document.getElementById(id)) return;
  const el = build();
  el.id = id;
  document.head.appendChild(el);
};

/** Injects tracking pixels, applies admin theme colors, logs visits, and renders announcement bar + popup. */
const SiteRuntime = () => {
  const settings = useSiteSettings();
  const location = useLocation();
  const tracking = settings.tracking || {};
  const theme = settings.theme || {};
  const popup = settings.popup || {};
  const [barClosed, setBarClosed] = useState(false);
  const [popupOpen, setPopupOpen] = useState(false);

  /* ---------- pixels ---------- */
  useEffect(() => {
    if (tracking.ga_id) {
      injectOnce("ga-src", () => {
        const s = document.createElement("script");
        s.async = true;
        s.src = `https://www.googletagmanager.com/gtag/js?id=${tracking.ga_id}`;
        return s;
      });
      injectOnce("ga-init", () => {
        const s = document.createElement("script");
        s.innerHTML = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${tracking.ga_id}');`;
        return s;
      });
    }
    if (tracking.gtm_id) {
      injectOnce("gtm", () => {
        const s = document.createElement("script");
        s.innerHTML = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${tracking.gtm_id}');`;
        return s;
      });
    }
    if (tracking.fb_pixel) {
      injectOnce("fb-pixel", () => {
        const s = document.createElement("script");
        s.innerHTML = `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${tracking.fb_pixel}');fbq('track','PageView');`;
        return s;
      });
    }
    if (tracking.tiktok_pixel) {
      injectOnce("tt-pixel", () => {
        const s = document.createElement("script");
        s.innerHTML = `!function(w,d,t){w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"];ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{};ttq._i[e]=[];ttq._i[e]._u=r;ttq._t=ttq._t||{};ttq._t[e]=+new Date;ttq._o=ttq._o||{};ttq._o[e]=n||{};var o=d.createElement("script");o.type="text/javascript";o.async=!0;o.src=r+"?sdkid="+e+"&lib="+t;var a=d.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};ttq.load('${tracking.tiktok_pixel}');ttq.page();}(window,document,'ttq');`;
        return s;
      });
    }
    if (tracking.head_scripts) {
      injectOnce("custom-head", () => {
        const s = document.createElement("script");
        s.innerHTML = String(tracking.head_scripts);
        return s;
      });
    }
  }, [tracking.ga_id, tracking.gtm_id, tracking.fb_pixel, tracking.tiktok_pixel, tracking.head_scripts]);

  /* ---------- theme ---------- */
  useEffect(() => {
    const root = document.documentElement;
    const map: Record<string, string> = {
      primary: "--primary", secondary: "--secondary", accent: "--accent", background: "--background", foreground: "--foreground",
    };
    Object.entries(map).forEach(([k, cssVar]) => {
      const v = theme[k];
      if (v && /^\d/.test(String(v).trim())) root.style.setProperty(cssVar, String(v).trim());
    });
    if (theme.radius) root.style.setProperty("--radius", String(theme.radius));
  }, [theme.primary, theme.secondary, theme.accent, theme.background, theme.foreground, theme.radius]);

  /* ---------- visit + ad source logging ---------- */
  useEffect(() => {
    const p = new URLSearchParams(location.search);
    const persist = (k: string) => {
      const v = p.get(k);
      if (v) { try { sessionStorage.setItem(`jn_${k}`, v); } catch { /* ignore */ } return v; }
      try { return sessionStorage.getItem(`jn_${k}`); } catch { return null; }
    };
    const payload = {
      path: location.pathname,
      referrer: document.referrer || null,
      utm_source: persist("utm_source") || (document.referrer ? new URL(document.referrer, window.location.href).hostname : null),
      utm_medium: persist("utm_medium"),
      utm_campaign: persist("utm_campaign"),
      utm_content: persist("utm_content"),
      device: window.innerWidth < 768 ? "mobile" : "desktop",
      session_id: sid(),
    };
    supabase.from("site_visits").insert(payload).then(() => {}, () => {});
  }, [location.pathname, location.search]);

  /* ---------- popup timing ---------- */
  useEffect(() => {
    if (!popup.enabled || !popup.message) return;
    try { if (popup.once && localStorage.getItem("jn_popup_seen") === String(popup.message)) return; } catch { /* ignore */ }
    const t = setTimeout(() => setPopupOpen(true), Number(popup.delay || 4) * 1000);
    return () => clearTimeout(t);
  }, [popup.enabled, popup.message, popup.delay, popup.once]);

  const closePopup = () => {
    setPopupOpen(false);
    try { if (popup.once) localStorage.setItem("jn_popup_seen", String(popup.message)); } catch { /* ignore */ }
  };

  const bar = settings.store?.announcement;

  return (
    <>
      {bar && !barClosed && (
        <div className="relative z-40 bg-gradient-to-r from-primary via-primary/90 to-secondary text-primary-foreground">
          <div className="container flex items-center gap-2 py-1.5 text-[11px] sm:text-xs font-medium">
            <Megaphone className="h-3.5 w-3.5 shrink-0" />
            <p className="flex-1 truncate">{bar}</p>
            <button onClick={() => setBarClosed(true)} aria-label="বন্ধ করুন"><X className="h-3.5 w-3.5 opacity-80" /></button>
          </div>
        </div>
      )}

      {popupOpen && (
        <div className="fixed inset-0 z-[80] grid place-items-center bg-black/50 p-4" onClick={closePopup}>
          <div className="w-full max-w-sm rounded-2xl bg-card p-5 shadow-2xl border" onClick={(e) => e.stopPropagation()}>
            {popup.image && <img src={popup.image} alt="" className="w-full rounded-xl mb-3" />}
            {popup.title && <h3 className="text-lg font-bold mb-1">{popup.title}</h3>}
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{popup.message}</p>
            <div className="mt-4 flex gap-2">
              {popup.cta_link && (
                <a href={popup.cta_link} onClick={closePopup} className="flex-1 text-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
                  {popup.cta_text || "দেখুন"}
                </a>
              )}
              <button onClick={closePopup} className="rounded-lg border px-4 py-2 text-sm">বন্ধ</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SiteRuntime;
