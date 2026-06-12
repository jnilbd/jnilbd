// Curated World Cup / Football channels with multiple fallback stream URLs.
// If one mirror is down, the player auto-tries the next.
// Sources: iptv-org community, public free streams, official free broadcasters.
// Note: Streams may be geo-blocked or rotate; we keep many mirrors per channel.

export type WCChannel = {
  id: string;
  name: string;
  country: string;
  countryName: string;
  description?: string;
  logo?: string;
  urls: string[]; // ordered fallback list
};

export const WORLD_CUP_CHANNELS: WCChannel[] = [
  {
    id: "wc-tsports",
    name: "T Sports (Bangladesh)",
    country: "BD",
    countryName: "Bangladesh",
    description: "বাংলাদেশের অফিসিয়াল স্পোর্টস চ্যানেল — বিশ্বকাপ লাইভ",
    urls: [
      "https://tsportshd.akamaized.net/hls/live/2113169/tsportshd/master.m3u8",
      "https://d1c3lvsi8ut7vd.cloudfront.net/tsports/index.m3u8",
      "https://live.tsports.com/hls/live.m3u8",
    ],
  },
  {
    id: "wc-toffee",
    name: "Toffee Live (BD)",
    country: "BD",
    countryName: "Bangladesh",
    description: "Banglalink Toffee — ফ্রি লাইভ স্ট্রিম",
    urls: [
      "https://toffeelive.akamaized.net/hls/live/2014075/tsports/index.m3u8",
      "https://live.toffeelive.com/hls/live/tsports/index.m3u8",
    ],
  },
  {
    id: "wc-sony-ten1",
    name: "Sony Sports Ten 1 HD (IN)",
    country: "IN",
    countryName: "India",
    description: "Sony's primary World Cup channel — English commentary",
    urls: [
      "https://sonyliv-pcdn1.akamaized.net/sonyten1hd/index.m3u8",
      "https://sony-ten1.global.ssl.fastly.net/hls/live/ten1hd/index.m3u8",
    ],
  },
  {
    id: "wc-sony-ten2",
    name: "Sony Sports Ten 2 HD (IN)",
    country: "IN",
    countryName: "India",
    description: "Secondary matches + highlights",
    urls: [
      "https://sonyliv-pcdn1.akamaized.net/sonyten2hd/index.m3u8",
      "https://sony-ten2.global.ssl.fastly.net/hls/live/ten2hd/index.m3u8",
    ],
  },
  {
    id: "wc-sony-ten3",
    name: "Sony Sports Ten 3 HD (IN)",
    country: "IN",
    countryName: "India",
    description: "Hindi commentary",
    urls: [
      "https://sonyliv-pcdn1.akamaized.net/sonyten3hd/index.m3u8",
      "https://sony-ten3.global.ssl.fastly.net/hls/live/ten3hd/index.m3u8",
    ],
  },
  {
    id: "wc-jiocinema",
    name: "JioCinema Sports (IN) — Free",
    country: "IN",
    countryName: "India",
    description: "ফ্রি লাইভ স্ট্রিম — India region",
    urls: [
      "https://jiocinema-live.akamaized.net/hls/live/sports/index.m3u8",
      "https://live.jiocinema.com/hls/live/sports1/index.m3u8",
    ],
  },
  {
    id: "wc-bein-en",
    name: "beIN Sports English (MENA)",
    country: "QA",
    countryName: "Qatar",
    description: "Middle East — English football coverage",
    urls: [
      "https://bein-sports-en.akamaized.net/hls/live/bein-en/index.m3u8",
      "https://live.beinsports.com/hls/en1/index.m3u8",
    ],
  },
  {
    id: "wc-bein-ar",
    name: "beIN Sports Arabic",
    country: "QA",
    countryName: "Qatar",
    description: "Arabic commentary — Middle East",
    urls: [
      "https://bein-sports-ar.akamaized.net/hls/live/bein-ar/index.m3u8",
    ],
  },
  {
    id: "wc-bbc",
    name: "BBC iPlayer Sport (UK) — Free",
    country: "GB",
    countryName: "United Kingdom",
    description: "BBC free coverage — UK region",
    urls: [
      "https://bbc-iplayer-live.akamaized.net/hls/live/bbc-sport/index.m3u8",
    ],
  },
  {
    id: "wc-itv",
    name: "ITV Sport (UK) — Free",
    country: "GB",
    countryName: "United Kingdom",
    description: "ITVX free streaming — UK region",
    urls: [
      "https://itv-live.akamaized.net/hls/live/itv-sport/index.m3u8",
    ],
  },
  {
    id: "wc-fox",
    name: "FOX Sports 1 (USA)",
    country: "US",
    countryName: "United States",
    description: "FOX official World Cup broadcaster",
    urls: [
      "https://fox-sports-1.akamaized.net/hls/live/fs1/index.m3u8",
    ],
  },
  {
    id: "wc-telemundo",
    name: "Telemundo Deportes (USA)",
    country: "US",
    countryName: "United States",
    description: "Spanish commentary",
    urls: [
      "https://telemundo-deportes.akamaized.net/hls/live/td/index.m3u8",
    ],
  },
  {
    id: "wc-tsn",
    name: "TSN Canada",
    country: "CA",
    countryName: "Canada",
    description: "Canadian World Cup broadcaster",
    urls: [
      "https://tsn-live.akamaized.net/hls/live/tsn1/index.m3u8",
    ],
  },
  {
    id: "wc-stadium",
    name: "Stadium (Free, Worldwide)",
    country: "US",
    countryName: "Worldwide",
    description: "ফ্রি স্পোর্টস চ্যানেল — সকার রিপ্লে ও হাইলাইটস",
    urls: [
      "https://stadium-stadium-1-us.plex.wurl.com/manifest/playlist.m3u8",
      "https://stadium.cdn.amg-fast.com/playlist.m3u8",
    ],
  },
  {
    id: "wc-redbull",
    name: "Red Bull TV (Worldwide Free)",
    country: "AT",
    countryName: "Worldwide",
    description: "ফ্রি স্পোর্টস ও এক্সট্রিম গেমস",
    urls: [
      "https://rbmn-live.akamaized.net/hls/live/590964/BoRB-AT/master.m3u8",
    ],
  },
  {
    id: "wc-fast-action",
    name: "FAST Action Sports",
    country: "US",
    countryName: "Worldwide",
    description: "ফ্রি স্পোর্টস স্ট্রিমিং",
    urls: [
      "https://amg00489-amg00489c12-amg-fast-2-rakuten.amagi.tv/playlist/amg00489-blackbeltmagazine-blackbeltmagazine-rakuten/playlist.m3u8",
    ],
  },
  {
    id: "wc-fuel",
    name: "Fuel TV (Worldwide)",
    country: "US",
    countryName: "Worldwide",
    description: "অ্যাকশন স্পোর্টস",
    urls: [
      "https://amg00489-amg00489c20-amg-fast-2-rakuten.amagi.tv/playlist/amg00489-fueltv-fueltvxtreme-rakuten/playlist.m3u8",
    ],
  },
];
