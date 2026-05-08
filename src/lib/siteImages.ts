import type { SyntheticEvent } from "react";
import bdHero from "@/assets/bd-hero.jpg";
import bdWeather from "@/assets/bd-weather.jpg";
import bdRailway from "@/assets/bd-railway.jpg";
import bdQuran from "@/assets/bd-quran.jpg";
import bdHealth from "@/assets/bd-health.jpg";
import bdTravel from "@/assets/bd-travel.jpg";
import bdRural from "@/assets/bd-rural.jpg";
import bdShop from "@/assets/bd-shop.jpg";
import bdServices from "@/assets/bd-services.jpg";
import bdFinance from "@/assets/bd-finance.jpg";

// Curated Bangladeshi realistic photo pool — used as deterministic fallback.
export const BD_PHOTOS = [bdHero, bdWeather, bdRailway, bdQuran, bdHealth, bdTravel, bdRural, bdShop, bdServices, bdFinance];

// Per-category banner photos for tool pages.
export const PAGE_BANNERS: Record<string, string> = {
  weather: bdWeather,
  railway: bdRailway,
  quran: bdQuran,
  namaz: bdQuran,
  health: bdHealth,
  travel: bdTravel,
  finance: bdFinance,
  shop: bdShop,
  services: bdServices,
  rural: bdRural,
  hero: bdHero,
};

const hash = (value: string) =>
  [...value].reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) >>> 0, 7);

// Deterministic Bangladeshi photo for a given id — used when source missing/broken.
export const visualImage = (id: string, _label?: string, _eyebrow?: string) =>
  BD_PHOTOS[hash(id) % BD_PHOTOS.length];

export const displayImage = (source: string | undefined, id: string, label?: string, eyebrow?: string) => {
  // Trust real source URLs (e.g. curated unsplash photos for products/services so each item
  // shows its own topical image). Only fall back when no source was provided at all — runtime
  // load failures are handled separately via fallbackImageHandler's onError.
  if (!source) return visualImage(id, label, eyebrow);
  return source;
};

export const fallbackImageHandler = (id: string, label?: string, eyebrow?: string) =>
  (event: SyntheticEvent<HTMLImageElement>) => {
    const fallback = visualImage(id, label, eyebrow);
    if (event.currentTarget.src !== fallback) event.currentTarget.src = fallback;
  };
