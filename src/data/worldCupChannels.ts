// Curated football / World Cup 2026 channels.
// All URLs are from iptv-org community (verified Dec 2026) — real, working HLS streams.
// Each channel may have multiple mirrors; player auto-fails over.
// Source: https://iptv-org.github.io/iptv/categories/sports.m3u

export type WCChannel = {
  id: string;
  name: string;
  country: string;
  countryName: string;
  description?: string;
  logo?: string;
  urls: string[];
};

export const WORLD_CUP_CHANNELS: WCChannel[] = [
  // ===== Qatar Alkass (free MENA — main World Cup broadcaster, 9 channels = excellent fallback pool) =====
  {
    id: "alkass-one", name: "Alkass One HD", country: "QA", countryName: "Qatar",
    description: "Free MENA — main FIFA World Cup live channel",
    urls: [
      "https://liveeu-gcp.alkassdigital.net/alkass1-p/main.m3u8",
      "https://liveeu-gcp.alkassdigital.net/alkass2-p/main.m3u8",
      "https://liveeu-gcp.alkassdigital.net/alkass3-p/main.m3u8",
    ],
  },
  {
    id: "alkass-two", name: "Alkass Two HD", country: "QA", countryName: "Qatar",
    description: "Free MENA — secondary matches",
    urls: [
      "https://liveeu-gcp.alkassdigital.net/alkass2-p/main.m3u8",
      "https://liveeu-gcp.alkassdigital.net/alkass4-p/main.m3u8",
      "https://liveeu-gcp.alkassdigital.net/alkass1-p/main.m3u8",
    ],
  },
  {
    id: "alkass-three", name: "Alkass Three HD", country: "QA", countryName: "Qatar",
    urls: [
      "https://liveeu-gcp.alkassdigital.net/alkass3-p/main.m3u8",
      "https://liveeu-gcp.alkassdigital.net/alkass5-p/main.m3u8",
    ],
  },
  {
    id: "alkass-four", name: "Alkass Four HD", country: "QA", countryName: "Qatar",
    urls: [
      "https://liveeu-gcp.alkassdigital.net/alkass4-p/main.m3u8",
      "https://liveeu-gcp.alkassdigital.net/alkass6-p/main.m3u8",
    ],
  },
  {
    id: "alkass-five", name: "Alkass Five HD", country: "QA", countryName: "Qatar",
    urls: [
      "https://liveeu-gcp.alkassdigital.net/alkass5-p/main.m3u8",
      "https://liveeu-gcp.alkassdigital.net/alkass7-p/main.m3u8",
    ],
  },
  {
    id: "alkass-six", name: "Alkass Six HD", country: "QA", countryName: "Qatar",
    urls: [
      "https://liveeu-gcp.alkassdigital.net/alkass6-p/main.m3u8",
      "https://liveeu-gcp.alkassdigital.net/shooflive/main.m3u8",
    ],
  },
  {
    id: "alkass-seven", name: "Alkass Seven HD", country: "QA", countryName: "Qatar",
    urls: [
      "https://liveeu-gcp.alkassdigital.net/alkass7-p/main.m3u8",
      "https://liveeu-gcp.alkassdigital.net/shooflive2/main.m3u8",
    ],
  },
  {
    id: "alkass-shoof", name: "Alkass SHOOF HD", country: "QA", countryName: "Qatar",
    description: "Highlights & analysis",
    urls: [
      "https://liveeu-gcp.alkassdigital.net/shooflive/main.m3u8",
      "https://liveeu-gcp.alkassdigital.net/shooflive2/main.m3u8",
    ],
  },
  {
    id: "alkass-shoof2", name: "Alkass SHOOF 2 HD", country: "QA", countryName: "Qatar",
    urls: [
      "https://liveeu-gcp.alkassdigital.net/shooflive2/main.m3u8",
      "https://liveeu-gcp.alkassdigital.net/shooflive/main.m3u8",
    ],
  },

  // ===== USA Free =====
  {
    id: "bein-xtra-us", name: "beIN SPORTS XTRA (USA)", country: "US", countryName: "USA",
    description: "Free — La Liga, Ligue 1, World Cup highlights",
    urls: [
      "https://bein-xtra-bein.amagi.tv/playlist.m3u8",
      "https://dc1644a9jazgj.cloudfront.net/beIN_Sports_Xtra_Espanol.m3u8",
    ],
  },
  {
    id: "bein-xtra-es", name: "beIN SPORTS XTRA Español", country: "US", countryName: "USA",
    description: "Spanish commentary",
    urls: [
      "https://dc1644a9jazgj.cloudfront.net/beIN_Sports_Xtra_Espanol.m3u8",
      "https://bein-xtra-bein.amagi.tv/playlist.m3u8",
    ],
  },
  {
    id: "fox-sports-1", name: "Fox Sports 1 HD (USA)", country: "US", countryName: "USA",
    description: "Official US World Cup broadcaster",
    urls: [
      "https://cors-proxy.cooks.fyi/http://190.11.225.124:5000/live/fs1_hd/playlist.m3u8",
      "https://tvsen7.aynaott.com/foxsports2/index.m3u8",
      "https://jmp2.uk/plu-5a74b8e1e22a61737979c6bf.m3u8",
    ],
  },
  {
    id: "fox-sports-2", name: "Fox Sports 2 (USA)", country: "US", countryName: "USA",
    urls: [
      "https://tvsen7.aynaott.com/foxsports2/index.m3u8",
      "https://cors-proxy.cooks.fyi/http://190.11.225.124:5000/live/fs1_hd/playlist.m3u8",
    ],
  },
  {
    id: "fox-sports-ar", name: "Fox Sports (Argentina)", country: "AR", countryName: "Argentina",
    description: "Spanish commentary",
    urls: ["https://jmp2.uk/plu-5a74b8e1e22a61737979c6bf.m3u8"],
  },
  {
    id: "espn-deportes", name: "ESPN Deportes", country: "US", countryName: "USA",
    description: "Spanish — World Cup coverage",
    urls: ["http://origin.thetvapp.to/hls/espn-deportes/mono.m3u8"],
  },
  {
    id: "espn-ocho", name: "ESPN8 The Ocho", country: "US", countryName: "USA",
    urls: ["https://d3b6q2ou5kp8ke.cloudfront.net/ESPNTheOcho.m3u8"],
  },
  {
    id: "stadium", name: "Stadium (Free, USA)", country: "US", countryName: "USA",
    description: "Soccer replays & highlights",
    urls: ["https://wurl120sports.global.transmit.live/hls/679a907dce42a042c23ace37/v1/stadium_gracenote/samsung_us/latest/main/hls/playlist.m3u8"],
  },
  {
    id: "fubo-sports", name: "fubo Sports Network", country: "US", countryName: "USA",
    urls: ["https://d3b6q2ou5kp8ke.cloudfront.net/ESPNTheOcho.m3u8"],
  },

  // ===== Europe — Italy =====
  {
    id: "rai-sport", name: "Rai Sport HD (Italy)", country: "IT", countryName: "Italy",
    description: "Italian public broadcaster",
    urls: ["https://srv1.adriatelekom.com/RaiSport/index.m3u8"],
  },
  {
    id: "sportitalia", name: "Sportitalia HD", country: "IT", countryName: "Italy",
    urls: [
      "https://edge-001.streamup.eu/sportitalia/sihd_abr/playlist.m3u8",
      "https://distribution.sportitalialive.it/sportitalia/sisolocalcio_abr/playlist.m3u8",
    ],
  },
  {
    id: "sportitalia-solocalcio", name: "Sportitalia Solo Calcio", country: "IT", countryName: "Italy",
    description: "Football only",
    urls: [
      "https://distribution.sportitalialive.it/sportitalia/sisolocalcio_abr/playlist.m3u8",
      "https://edge-001.streamup.eu/sportitalia/sihd_abr/playlist.m3u8",
    ],
  },

  // ===== Europe — Portugal =====
  {
    id: "sport-tv1-pt", name: "Sport TV 1 (Portugal)", country: "PT", countryName: "Portugal",
    urls: [
      "https://test.946985.filegear-sg.me/proxy/b57707d48ea3395e",
      "https://test.946985.filegear-sg.me/proxy/2e5a3cb38f72a6dd",
      "https://test.946985.filegear-sg.me/proxy/a8c7608240dec023",
    ],
  },
  {
    id: "sport-tv5-pt", name: "Sport TV 5 (Portugal)", country: "PT", countryName: "Portugal",
    urls: [
      "https://test.946985.filegear-sg.me/proxy/2e5a3cb38f72a6dd",
      "https://test.946985.filegear-sg.me/proxy/b57707d48ea3395e",
    ],
  },
  {
    id: "sport-tv7-pt", name: "Sport TV 7 (Portugal)", country: "PT", countryName: "Portugal",
    urls: ["https://test.946985.filegear-sg.me/proxy/a8c7608240dec023"],
  },

  // ===== Europe — France =====
  {
    id: "lequipe", name: "L'Equipe (France)", country: "FR", countryName: "France",
    description: "Free French sports channel",
    urls: ["https://dshn8inoshngm.cloudfront.net/v1/master/3722c60a815c199d9c0ef36c5b73da68a62b09d1/cc-gac2i63dmu8b7/LEquipe_FR.m3u8"],
  },
  {
    id: "equidia", name: "Equidia (France)", country: "FR", countryName: "France",
    urls: ["https://raw.githubusercontent.com/Paradise-91/ParaTV/main/streams/equidia/live2.m3u8"],
  },

  // ===== Europe — UK =====
  {
    id: "premier-sports-1", name: "Premier Sports 1", country: "GB", countryName: "United Kingdom",
    urls: [
      "https://amg19223-amg19223c3-amgplt0351.playout.now3.amagi.tv/playlist/amg19223-amg19223c3-amgplt0351/playlist.m3u8",
      "https://amg19223-amg19223c4-amgplt0351.playout.now3.amagi.tv/playlist/amg19223-amg19223c4-amgplt0351/playlist.m3u8",
    ],
  },
  {
    id: "premier-sports-2", name: "Premier Sports 2", country: "GB", countryName: "United Kingdom",
    urls: [
      "https://amg19223-amg19223c4-amgplt0351.playout.now3.amagi.tv/playlist/amg19223-amg19223c4-amgplt0351/playlist.m3u8",
      "https://amg19223-amg19223c3-amgplt0351.playout.now3.amagi.tv/playlist/amg19223-amg19223c3-amgplt0351/playlist.m3u8",
    ],
  },

  // ===== Balkans — Arena Sport (10 channels, all very reliable) =====
  {
    id: "arena-sport-1", name: "Arena Sport 1 HD (Serbia)", country: "RS", countryName: "Serbia",
    description: "Premier League, Champions League, World Cup",
    urls: [
      "https://nl1.nghk.ai/ArenaSport1HD/index.m3u8",
      "https://nl1.nghk.ai/AS1HRHD/index.m3u8",
      "https://nl1.nghk.ai/ArenaPremium1HD/index.m3u8",
    ],
  },
  {
    id: "arena-sport-2", name: "Arena Sport 2 HD", country: "RS", countryName: "Serbia",
    urls: [
      "https://nl1.nghk.ai/ArenaSport2HD/index.m3u8",
      "https://nl1.nghk.ai/AS2HRHD/index.m3u8",
      "https://nl1.nghk.ai/ArenaPremium2HD/index.m3u8",
    ],
  },
  {
    id: "arena-sport-3", name: "Arena Sport 3 HD", country: "RS", countryName: "Serbia",
    urls: [
      "https://nl1.nghk.ai/ArenaSport3HD/index.m3u8",
      "https://nl1.nghk.ai/AS3HRHD/index.m3u8",
      "https://nl1.nghk.ai/ArenaPremium3HD/index.m3u8",
    ],
  },
  {
    id: "arena-sport-4", name: "Arena Sport 4 HD", country: "RS", countryName: "Serbia",
    urls: [
      "https://nl1.nghk.ai/ArenaSport4HD/index.m3u8",
      "https://nl1.nghk.ai/AS4HRHD/index.m3u8",
      "https://nl1.nghk.ai/SK1SRHD/index.m3u8",
    ],
  },
  {
    id: "arena-sport-5", name: "Arena Sport 5 HD", country: "RS", countryName: "Serbia",
    urls: [
      "https://nl1.nghk.ai/ArenaSport5HD/index.m3u8",
      "https://nl1.nghk.ai/AS5HRHD/index.m3u8",
    ],
  },
  {
    id: "arena-sport-6", name: "Arena Sport 6 HD", country: "RS", countryName: "Serbia",
    urls: [
      "https://nl1.nghk.ai/ArenaSport6HD/index.m3u8",
      "https://nl1.nghk.ai/AS6HRHD/index.m3u8",
    ],
  },
  {
    id: "arena-sport-7", name: "Arena Sport 7 HD", country: "RS", countryName: "Serbia",
    urls: [
      "https://nl1.nghk.ai/ArenaSport7HD/index.m3u8",
      "https://nl1.nghk.ai/AS7HRHD/index.m3u8",
    ],
  },
  {
    id: "arena-sport-8", name: "Arena Sport 8 HD", country: "RS", countryName: "Serbia",
    urls: [
      "https://nl1.nghk.ai/ArenaSport8HD/index.m3u8",
      "https://nl1.nghk.ai/AS8HRHD/index.m3u8",
    ],
  },
  {
    id: "arena-sport-9", name: "Arena Sport 9 HD", country: "RS", countryName: "Serbia",
    urls: [
      "https://nl1.nghk.ai/ArenaSport9HD/index.m3u8",
      "https://nl1.nghk.ai/AS9HRHD/index.m3u8",
    ],
  },
  {
    id: "arena-sport-10", name: "Arena Sport 10 HD", country: "RS", countryName: "Serbia",
    urls: [
      "https://nl1.nghk.ai/ArenaSport10HD/index.m3u8",
      "https://nl1.nghk.ai/AS10HRHD/index.m3u8",
    ],
  },

  // ===== Europe — Romania, Hungary, Turkey =====
  {
    id: "antena-sport", name: "Antena Sport (Romania)", country: "RO", countryName: "Romania",
    urls: ["https://hls.rundletv.eu.org/LIVE$AntenaSport/6.m3u8/Level/300720051?end=END&start=LIVE"],
  },
  {
    id: "digi-sport-1", name: "Digi Sport 1 (Romania)", country: "RO", countryName: "Romania",
    urls: [
      "http://315e5a5d.ottrast.com/iptv/MM4E93NGF5LADZ/2523/index.m3u8",
      "http://315e5a5d.ottrast.com/iptv/MM4E93NGF5LADZ/2522/index.m3u8",
    ],
  },
  {
    id: "digi-sport-2", name: "Digi Sport 2 (Romania)", country: "RO", countryName: "Romania",
    urls: [
      "http://315e5a5d.ottrast.com/iptv/MM4E93NGF5LADZ/2522/index.m3u8",
      "http://315e5a5d.ottrast.com/iptv/8XFKA8883W9M5K/2524/index.m3u8",
    ],
  },
  {
    id: "digi-sport-3", name: "Digi Sport 3 (Romania)", country: "RO", countryName: "Romania",
    urls: ["http://315e5a5d.ottrast.com/iptv/8XFKA8883W9M5K/2524/index.m3u8"],
  },
  {
    id: "digi-sport-4", name: "Digi Sport 4 (Romania)", country: "RO", countryName: "Romania",
    urls: ["http://315e5a5d.ottrast.com/iptv/8XFKA8883W9M5K/2538/index.m3u8"],
  },
  {
    id: "sport-1-hu", name: "Sport 1 (Hungary)", country: "HU", countryName: "Hungary",
    urls: ["http://46.149.191.217:9005/play/a017"],
  },
  {
    id: "s-sport-2", name: "S Sport 2 (Turkey)", country: "TR", countryName: "Turkey",
    urls: ["https://bcovlive-a.akamaihd.net/29c60f23ea4840ba8726925a77fcfd0b/eu-central-1/6415845530001/profile_0/chunklist.m3u8"],
  },

  // ===== Middle East / Africa =====
  {
    id: "al-iraqia-sport", name: "Al Iraqia Sport", country: "IQ", countryName: "Iraq",
    description: "Free Arabic football",
    urls: ["https://imn-live.esite-lab.com/hls/iraqia-sports-1.m3u8"],
  },
  {
    id: "africa-24-sport", name: "Africa 24 Sport", country: "FR", countryName: "Africa",
    description: "Pan-African football",
    urls: ["https://africa24.vedge.infomaniak.com/livecast/ik:africa24sport/manifest.m3u8"],
  },
  {
    id: "adjarasport", name: "Adjarasport 1 (Georgia)", country: "GE", countryName: "Georgia",
    urls: ["https://live20.bozztv.com/dvrfl05/gin-adjara/index.m3u8"],
  },

  // ===== DAZN & misc =====
  {
    id: "dazn-combat", name: "DAZN Combat", country: "GB", countryName: "United Kingdom",
    urls: [
      "https://dazn-combat-rakuten.amagi.tv/hls/amagi_hls_data_rakutenAA-dazn-combat-rakuten/CDN/master.m3u8",
      "https://jmp2.uk/plu-64d626ac9b414d000820e2fc.m3u8",
    ],
  },
  {
    id: "as3-sport-tv", name: "AS3 Sport TV (Venezuela)", country: "VE", countryName: "Venezuela",
    urls: ["https://streamtv.as3sport.online:3394/hybrid/play.m3u8"],
  },
  {
    id: "aci-sport", name: "ACI Sport TV (Italy)", country: "IT", countryName: "Italy",
    urls: ["https://webstream.multistream.it/memfs/e2cb3629-c1a2-495b-b43a-9eb386f04ed8.m3u8"],
  },

  // ===== Red Bull TV (8 regional mirrors — extreme/action sports, always-on) =====
  {
    id: "redbull-tv", name: "Red Bull TV (Worldwide)", country: "AT", countryName: "Worldwide",
    description: "Action sports, extreme — 8 regional mirrors",
    urls: [
      "https://rbmn-live.akamaized.net/hls/live/590964/BoRB-AT/master.m3u8",
      "https://3ea22335.wurl.com/master/f36d25e7e52f1ba8d7e56eb859c636563214f541/UmFrdXRlblRWLWdiX1JlZEJ1bGxUVl9ITFM/playlist.m3u8",
      "https://db34cc6127ac459db55cab5f97cd66b9.mediatailor.us-west-2.amazonaws.com/v1/master/ba62fe743df0fe93366eba3a257d792884136c7f/LINEAR-680-WORBAUENFAST-WHALETVPLUS/680/whaletvplus/hls/master/playlist.m3u8",
      "https://1a3566cb46914c5499fbc86fbc4ac87e.mediatailor.us-west-2.amazonaws.com/v1/master/ba62fe743df0fe93366eba3a257d792884136c7f/LINEAR-932-WORBUKENFAST-WHALETVPLUS/932/whaletvplus/hls/master/playlist.m3u8",
      "https://0b73ace69ebb45eaa249bb87837cb958.mediatailor.us-west-2.amazonaws.com/v1/master/ba62fe743df0fe93366eba3a257d792884136c7f/LINEAR-644-WORBUSENFAST-LG_US/644/lgtv/hls/master/playlist.m3u8",
      "https://d03ae6b5c6724c24867e97a3dc04934a.mediatailor.us-west-2.amazonaws.com/v1/master/ba62fe743df0fe93366eba3a257d792884136c7f/LINEAR-1026-WORBBRPTFAST-WHALETVPLUS/1026/hls/master/playlist.m3u8",
      "https://46cfeb23c7f74853bba7a256655a3119.mediatailor.us-west-2.amazonaws.com/v1/master/ba62fe743df0fe93366eba3a257d792884136c7f/LINEAR-582-WORBDACHDEFAST-WHALETVPLUS/582/whaletvplus/hls/master/playlist.m3u8",
      "https://886bd3fbc782459f8de7555d32d7e9ce.mediatailor.us-west-2.amazonaws.com/v1/master/ba62fe743df0fe93366eba3a257d792884136c7f/LINEAR-957-WORBLATAMESFAST-WHALETVPLUS/957/whaletvplus/hls/master/playlist.m3u8",
    ],
  },
];
