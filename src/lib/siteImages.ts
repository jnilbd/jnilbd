import type { SyntheticEvent } from "react";

const PALETTES = [
  ["hsl(220 18% 14%)", "hsl(38 55% 52%)", "hsl(40 30% 97%)"],
  ["hsl(175 40% 32%)", "hsl(30 55% 60%)", "hsl(30 15% 95%)"],
  ["hsl(220 12% 35%)", "hsl(38 70% 65%)", "hsl(40 30% 97%)"],
  ["hsl(220 22% 8%)", "hsl(175 40% 50%)", "hsl(30 15% 95%)"],
];

const escapeSvg = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const hash = (value: string) =>
  [...value].reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) >>> 0, 7);

export const visualImage = (id: string, label: string, eyebrow = "JohnNil") => {
  const palette = PALETTES[hash(id) % PALETTES.length];
  const safeLabel = escapeSvg(label).slice(0, 34);
  const safeEyebrow = escapeSvg(eyebrow).slice(0, 18);
  const mark = escapeSvg(label.trim().slice(0, 1) || "J");

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="675" viewBox="0 0 900 675">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${palette[0]}"/><stop offset="1" stop-color="${palette[1]}"/></linearGradient>
      <pattern id="p" width="72" height="72" patternUnits="userSpaceOnUse"><path d="M0 72H72M72 0V72" stroke="${palette[2]}" stroke-opacity=".10" stroke-width="1"/></pattern>
    </defs>
    <rect width="900" height="675" fill="url(#g)"/>
    <rect width="900" height="675" fill="url(#p)"/>
    <circle cx="710" cy="120" r="170" fill="${palette[2]}" fill-opacity=".12"/>
    <circle cx="150" cy="560" r="210" fill="${palette[2]}" fill-opacity=".10"/>
    <text x="76" y="112" fill="${palette[2]}" fill-opacity=".78" font-family="Arial, sans-serif" font-size="28" font-weight="700" letter-spacing="5">${safeEyebrow}</text>
    <text x="76" y="380" fill="${palette[2]}" font-family="Arial, sans-serif" font-size="70" font-weight="800">${mark}</text>
    <text x="76" y="468" fill="${palette[2]}" font-family="Arial, sans-serif" font-size="46" font-weight="800">${safeLabel}</text>
    <path d="M76 520H390" stroke="${palette[2]}" stroke-opacity=".65" stroke-width="8" stroke-linecap="round"/>
  </svg>`;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

export const displayImage = (source: string | undefined, id: string, label: string, eyebrow?: string) => {
  if (!source || source.includes("images.unsplash.com") || source.includes("pravatar.cc")) {
    return visualImage(id, label, eyebrow);
  }
  return source;
};

export const fallbackImageHandler = (id: string, label: string, eyebrow?: string) =>
  (event: SyntheticEvent<HTMLImageElement>) => {
    const fallback = visualImage(id, label, eyebrow);
    if (event.currentTarget.src !== fallback) event.currentTarget.src = fallback;
  };