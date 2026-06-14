// Curated BDIX / Bangladesh ISP-based streams.
// Many BDIX feeds work only when the user is on a participating ISP (Link3, Amber IT, Carnival, etc.).
// These public test endpoints are commonly shared in the BD streaming community.
export type BdixChannel = {
  id: string;
  name: string;
  provider: string;
  url: string;
  category?: "news" | "entertainment" | "sports" | "music" | "kids" | "religious";
  note?: string;
};

export const BDIX_CHANNELS: BdixChannel[] = [
  // Discovery FTP-style public streams (community)
  { id: "bdix-somoy", name: "Somoy TV", provider: "Crystal IPTV", url: "https://drm-bd2.amaderlink.xyz/SOMOYNEWS/index.m3u8", category: "news" },
  { id: "bdix-channel24", name: "Channel 24", provider: "Crystal IPTV", url: "https://drm-bd2.amaderlink.xyz/CHANNEL24/index.m3u8", category: "news" },
  { id: "bdix-jamuna", name: "Jamuna TV", provider: "Crystal IPTV", url: "https://drm-bd2.amaderlink.xyz/JAMUNATV/index.m3u8", category: "news" },
  { id: "bdix-independent", name: "Independent TV", provider: "Crystal IPTV", url: "https://drm-bd2.amaderlink.xyz/INDEPENDENT/index.m3u8", category: "news" },
  { id: "bdix-news24", name: "News24", provider: "Crystal IPTV", url: "https://drm-bd2.amaderlink.xyz/NEWS24/index.m3u8", category: "news" },
  { id: "bdix-rtv", name: "RTV", provider: "Crystal IPTV", url: "https://drm-bd2.amaderlink.xyz/RTV/index.m3u8", category: "entertainment" },
  { id: "bdix-ntv", name: "NTV", provider: "Crystal IPTV", url: "https://drm-bd2.amaderlink.xyz/NTV/index.m3u8", category: "entertainment" },
  { id: "bdix-atnnews", name: "ATN News", provider: "Crystal IPTV", url: "https://drm-bd2.amaderlink.xyz/ATNNEWS/index.m3u8", category: "news" },
  { id: "bdix-atnbangla", name: "ATN Bangla", provider: "Crystal IPTV", url: "https://drm-bd2.amaderlink.xyz/ATNBANGLA/index.m3u8", category: "entertainment" },
  { id: "bdix-channeli", name: "Channel I", provider: "Crystal IPTV", url: "https://drm-bd2.amaderlink.xyz/CHANNELI/index.m3u8", category: "entertainment" },
  { id: "bdix-dbcnews", name: "DBC News", provider: "Crystal IPTV", url: "https://drm-bd2.amaderlink.xyz/DBCNEWS/index.m3u8", category: "news" },
  { id: "bdix-ekattor", name: "Ekattor TV", provider: "Crystal IPTV", url: "https://drm-bd2.amaderlink.xyz/EKATTOR/index.m3u8", category: "news" },
  { id: "bdix-mytv", name: "My TV", provider: "Crystal IPTV", url: "https://drm-bd2.amaderlink.xyz/MYTV/index.m3u8", category: "entertainment" },
  { id: "bdix-gtv", name: "Gazi TV (GTV)", provider: "Crystal IPTV", url: "https://drm-bd2.amaderlink.xyz/GAZITV/index.m3u8", category: "sports" },
  { id: "bdix-t-sports", name: "T Sports", provider: "Crystal IPTV", url: "https://drm-bd2.amaderlink.xyz/TSPORTS/index.m3u8", category: "sports" },
  { id: "bdix-mzm", name: "Maasranga TV", provider: "Crystal IPTV", url: "https://drm-bd2.amaderlink.xyz/MAASRANGA/index.m3u8", category: "entertainment" },
  { id: "bdix-deepto", name: "Deepto TV", provider: "Crystal IPTV", url: "https://drm-bd2.amaderlink.xyz/DEEPTO/index.m3u8", category: "entertainment" },
  { id: "bdix-banglavision", name: "Bangla Vision", provider: "Crystal IPTV", url: "https://drm-bd2.amaderlink.xyz/BANGLAVISION/index.m3u8", category: "entertainment" },
  { id: "bdix-ekush", name: "Ekushey TV", provider: "Crystal IPTV", url: "https://drm-bd2.amaderlink.xyz/EKUSHEY/index.m3u8", category: "entertainment" },
  { id: "bdix-btv", name: "BTV", provider: "Crystal IPTV", url: "https://drm-bd2.amaderlink.xyz/BTV/index.m3u8", category: "news" },
  { id: "bdix-btv-world", name: "BTV World", provider: "Crystal IPTV", url: "https://drm-bd2.amaderlink.xyz/BTVWORLD/index.m3u8", category: "news" },
  { id: "bdix-duronto", name: "Duronto TV", provider: "Crystal IPTV", url: "https://drm-bd2.amaderlink.xyz/DURONTO/index.kids", category: "kids" },
  { id: "bdix-asiantv", name: "Asian TV", provider: "Crystal IPTV", url: "https://drm-bd2.amaderlink.xyz/ASIANTV/index.m3u8", category: "entertainment" },
];

export const IMPORTANT_BD_CHANNELS = [
  "somoy", "jamuna", "channel 24", "ntv", "atn news", "channel i", "ekattor", "rtv",
  "news24", "dbc", "independent", "btv", "t sports", "gazi", "maasranga", "deepto", "banglavision",
];
export const IMPORTANT_IN_CHANNELS = [
  "aaj tak", "ndtv", "republic", "india today", "abp", "zee", "star plus", "sony", "colors",
  "sun tv", "star jalsha", "zee bangla", "doordarshan", "dd national",
];
