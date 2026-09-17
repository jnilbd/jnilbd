import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type SiteSettings = Record<string, any>;

const PUBLIC_KEYS = ["store", "tracking", "theme", "popup", "menu", "payments"];

let cache: SiteSettings | null = null;
const listeners = new Set<(s: SiteSettings) => void>();

export async function loadSiteSettings(force = false): Promise<SiteSettings> {
  if (cache && !force) return cache;
  const { data } = await supabase.from("site_settings").select("key,value").in("key", PUBLIC_KEYS);
  const out: SiteSettings = {};
  (data || []).forEach((r: any) => { out[r.key] = r.value || {}; });
  cache = out;
  listeners.forEach((l) => l(out));
  return out;
}

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings>(cache || {});
  useEffect(() => {
    listeners.add(setSettings);
    loadSiteSettings();
    return () => { listeners.delete(setSettings); };
  }, []);
  return settings;
}
