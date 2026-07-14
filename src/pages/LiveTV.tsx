import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { Tv, Radio, Search, Play, Loader2, Trophy, Star, CheckCircle2, XCircle, Activity, Globe2, Flag, Wifi, Layers, ChevronDown, Zap } from "lucide-react";
import Hls from "hls.js";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";
import SportsSchedule from "@/components/SportsSchedule";
import WorldCupChannels from "@/components/WorldCupChannels";
import LiveScoreBoard from "@/components/LiveScoreBoard";
import { BDIX_CHANNELS, IMPORTANT_BD_CHANNELS, IMPORTANT_IN_CHANNELS } from "@/data/bdixChannels";

const DEAD_KEY = "livetv:dead:v2";
const WORKING_KEY = "livetv:working:v1";
const FAV_KEY = "livetv:favorites:v2";
const RECENT_KEY = "livetv:recent:v1";

type Tab = "mrgify" | "tv" | "bdix" | "world" | "sports" | "radio" | "offline" | "working";
type Health = "unknown" | "checking" | "live" | "dead";

type Channel = {
  id: string;
  name: string;
  country: string;
  countryName?: string;
  category: Exclude<Tab, "scores">;
  categories?: string[];
  subCategory?: string;
  logo?: string;
  url: string;          // current/primary
  urls?: string[];      // all alternate URLs
  provider?: string;
  isFallback?: boolean;
};

const FALLBACK_TV: Channel[] = [
  { id: "fb-aje", name: "Al Jazeera English", country: "QA", category: "tv", url: "https://live-hls-web-aje.getaj.net/AJE/index.m3u8", isFallback: true },
  { id: "fb-dw", name: "DW English", country: "DE", category: "tv", url: "https://dwamdstream102.akamaized.net/hls/live/2015525/dwstream102/index.m3u8", isFallback: true },
  { id: "fb-france24", name: "France 24 English", country: "FR", category: "tv", url: "https://static.france24.com/live/F24_EN_LO_HLS/live_web.m3u8", isFallback: true },
  { id: "fb-nhk", name: "NHK World Japan", country: "JP", category: "tv", url: "https://nhkwlive-ojp.akamaized.net/hls/live/2003459/nhkwlive-ojp-en/index.m3u8", isFallback: true },
  { id: "fb-bloomberg", name: "Bloomberg TV", country: "US", category: "tv", url: "https://liveproduseast.global.ssl.fastly.net/atishay-public/3/index.m3u8", isFallback: true },
];

const FALLBACK_SPORTS: Channel[] = [
  { id: "fb-redbull", name: "Red Bull TV", country: "AT", category: "sports", url: "https://rbmn-live.akamaized.net/hls/live/590964/BoRB-AT/master.m3u8", isFallback: true },
  { id: "fb-fast-action", name: "FAST Action Sports", country: "US", category: "sports", url: "https://amg00489-amg00489c12-amg-fast-2-rakuten.amagi.tv/playlist/amg00489-blackbeltmagazine-blackbeltmagazine-rakuten/playlist.m3u8", isFallback: true },
  { id: "fb-stadium", name: "Stadium", country: "US", category: "sports", url: "https://stadium-stadium-1-us.plex.wurl.com/manifest/playlist.m3u8", isFallback: true },
  { id: "fb-fuel", name: "Fuel TV", country: "US", category: "sports", url: "https://amg00489-amg00489c20-amg-fast-2-rakuten.amagi.tv/playlist/amg00489-fueltv-fueltvxtreme-rakuten/playlist.m3u8", isFallback: true },
];

// One-click direct play channels (user-curated, premium quality)
const DIRECT_CHANNELS: Channel[] = [
  { id: "dir-fox-hq", name: "Fox (HQ)", country: "US", category: "direct" as any, url: "http://84.17.50.102/fox/index.m3u8" },
  { id: "dir-tv-azteca", name: "TV Azteca", country: "MX", category: "direct" as any, url: "https://1nyaler.streamhostingcdn.top/stream/117/index.m3u8" },
  { id: "dir-tyc", name: "TyC Sports", country: "AR", category: "direct" as any, url: "https://1nyaler.streamhostingcdn.top/stream/84/index.m3u8" },
  { id: "dir-dsports", name: "D Sports", country: "AR", category: "direct" as any, url: "https://1nyaler.streamhostingcdn.top/stream/106/index.m3u8" },
  { id: "dir-tvp", name: "TVP", country: "PL", category: "direct" as any, url: "https://1nyaler.streamhostingcdn.top/stream/89/index.m3u8" },
  { id: "dir-dazn", name: "DAZN", country: "US", category: "direct" as any, url: "https://1nyaler.streamhostingcdn.top/stream/94/index.m3u8" },
  { id: "dir-bein", name: "beIN Sports", country: "QA", category: "direct" as any, url: "https://1nyaler.streamhostingcdn.top/stream/23/index.m3u8" },
  { id: "dir-somoy", name: "Somoy TV", country: "BD", category: "direct" as any, url: "http://114.130.57.224:8080/Somoy-TV-3Mb/tracks-v1a1/mono.m3u8?token=SkQuhAXZxgBan1" },
  { id: "dir-welcome-to-playz-tv", name: "Welcome to PlayZ TV", country: "BD", category: "direct" as any, url: "https://playztv.pages.dev/promo/master.m3u8" },
  { id: "dir-ekushey-tv", name: "Ekushey TV", country: "BD", category: "direct" as any, url: "http://210.4.72.204/hls-live/livepkgr/_definst_/liveevent/livestream3.m3u8" },
  { id: "dir-deepto-tv", name: "Deepto TV", country: "BD", category: "direct" as any, url: "https://byphdgllyk.gpcdn.net/hls/deeptotv/0_1/index.m3u8" },
  { id: "dir-srk-tv", name: "SRK TV", country: "BD", category: "direct" as any, url: "https://srknowapp.ncare.live/srktvhlswodrm/srktv.stream/playlist.m3u8" },
  { id: "dir-dd-sports", name: "DD Sports", country: "BD", category: "direct" as any, url: "https://cdn-6.pishow.tv/live/13/master.m3u8" },
  { id: "dir-deshi-tv-720p", name: "Deshi TV (720p)", country: "BD", category: "direct" as any, url: "https://deshitv.deshitv24.net/live/myStream/playlist.m3u8" },
  { id: "dir-atn-music-360p", name: "ATN Music (360p)", country: "BD", category: "direct" as any, url: "https://app.ncare.live/c3VydmVyX8RpbEU9Mi8xNy8yMDE0GIDU6RgzQ6NTAgdEoaeFzbF92YWxIZTO0U0ezN1IzMyfvcGVMZEJCTEFWeVN3PTOmdFsaWRtaW51aiPhnPTI/atnmusic.stream/playlist.m3u8" },
  { id: "dir-ekushey-tv-480p", name: "Ekushey TV (480p)", country: "BD", category: "direct" as any, url: "https://ekusheyserver.com/etvlivesn.m3u8" },
  { id: "dir-sports", name: "Sports", country: "BD", category: "direct" as any, url: "http://84.17.50.102/fox/index.m3u8" },
  { id: "dir-t-sports-hd", name: "T Sports HD", country: "BD", category: "direct" as any, url: "http://rgkkw.live/live/1Aoen7elp5/IgMJ60tmAa/130714.ts" },
  { id: "dir-waz-tv", name: "WAZ TV", country: "BD", category: "direct" as any, url: "https://tplay.live/originals/ilm-tv/index.m3u8" },
  { id: "dir-max1", name: "Max1", country: "BD", category: "direct" as any, url: "http://go8knm.optikl.ink/X/index.php/Besyria2/video.m3u8" },
  { id: "dir-motor-vision", name: "Motor Vision", country: "BD", category: "direct" as any, url: "https://mvg-mv-xumo.otteravision.com/mvg/mv/mv.m3u8" },
  { id: "dir-g-series-drama", name: "G Series Drama", country: "BD", category: "direct" as any, url: "https://vods2.aynaott.com/gseriesDrama/tracks-v1a1/mono.ts.m3u8" },
  { id: "dir-live-quran-tv", name: "Live Quran TV", country: "BD", category: "direct" as any, url: "https://live.kwikmotion.com/sharjahtvquranlive/shqurantv.smil/playlist.m3u8" },
  { id: "dir-fm-radio", name: "FM Radio", country: "BD", category: "direct" as any, url: "https://stream.spicefmbd.com/stream.m3u8" },
  { id: "dir-bein-sports-direct", name: "Bein Sports Direct", country: "BD", category: "direct" as any, url: "https://1nyaler.streamhostingcdn.top/stream/23/index.m3u8" },
  { id: "dir-india-a-vs-afghanistan-a-shamshad-tv", name: "India A vs Afghanistan A Shamshad TV", country: "BD", category: "direct" as any, url: "https://5a1178b42cc03.streamlock.net/shamshadtelevision/shamshadtelevision/playlist.m3u8" },
  { id: "dir-saudia-arabia", name: "Saudia Arabia", country: "BD", category: "direct" as any, url: "https://shd-gcp-live.edgenextcdn.net/live/bitmovin-saudi-tv/2ad66056b51fd8c1b624854623112e43/index.m3u8" },
  { id: "dir-quran", name: "QURAN", country: "BD", category: "direct" as any, url: "http://m.live.net.sa:1935/live/quran/playlist.m3u8" },
  { id: "dir-sunnah-tv", name: "Sunnah Tv", country: "BD", category: "direct" as any, url: "http://m.live.net.sa:1935/live/sunnah/chunklist.m3u8?v=1" },
  { id: "dir-pbs-kids", name: "PBS Kids", country: "BD", category: "direct" as any, url: "https://2-fss-2.streamhoster.com/pl_140/amlst:200914-1298290/playlist.m3u8" },
  { id: "dir-cartoon-network", name: "Cartoon Network", country: "BD", category: "direct" as any, url: "https://live20.bozztv.com/giatvplayout7/giatv-209624/index.m3u8" },
  { id: "dir-bbc-cbeebies", name: "BBC Cbeebies", country: "BD", category: "direct" as any, url: "https://live20.bozztv.com/giatvplayout7/giatv-209622/index.m3u8" },
  { id: "dir-9xm-tv", name: "9XM TV", country: "BD", category: "direct" as any, url: "https://wiselp.wiseplayout.com/9XM/HD1080/HD1080.m3u8" },
  { id: "dir-bein-sports-1", name: "Bein Sports 1", country: "BD", category: "direct" as any, url: "https://cdn-uw2-prod.tsv2.amagi.tv/linear/amg02873-kravemedia-mtrspt1-distrotv/playlist.m3u8" },
  { id: "dir-unknown", name: "Unknown", country: "BD", category: "direct" as any, url: "https://cdn-globecast.akamaized.net/live/eds/saudi_sunnah/hls_roku/index.m3u8" },
  { id: "dir-arabica-tv", name: "Arabica TV", country: "BD", category: "direct" as any, url: "http://istream.binarywaves.com:8081/hls/arabica/playlist.m3u8" },
  { id: "dir-al-sunnah-tv", name: "AL SUNNAH TV", country: "BD", category: "direct" as any, url: "http://m.live.net.sa:1935/live/sunnah/playlist.m3u8" },
  { id: "dir-unknown-2", name: "Unknown", country: "BD", category: "direct" as any, url: "https://dzkyvlfyge.erbvr.com/PeaceTvBangla/tracks-v3a1/mono.m3u8?sid=s7AaNdTzDE2912wNcPLejQ" },
  { id: "dir-quran-radiotv-smc", name: "QURAN RADIOTV SMC", country: "BD", category: "direct" as any, url: "https://live.kwikmotion.com/smcquranlive/quranradiolive/playlist.m3u8" },
  { id: "dir-al-ekhbaria", name: "AL EKHBARIA", country: "BD", category: "direct" as any, url: "https://cdn-globecast.akamaized.net/live/eds/al_ekhbariya/hls_roku/index.m3u8" },
  { id: "dir-saudi-quran", name: "Saudi Quran", country: "BD", category: "direct" as any, url: "https://cdn-globecast.akamaized.net/live/eds/saudi_quran/hls_roku/index.m3u8" },
  { id: "dir-travel-xp-english", name: "Travel XP English", country: "BD", category: "direct" as any, url: "https://travelxp-travelxp-1-eu.rakuten.wurl.tv/playlist.m3u8" },
  { id: "dir-travel-xp-english-nz", name: "Travel XP English NZ", country: "BD", category: "direct" as any, url: "https://travelxp-travelxp-1-nz.samsung.wurl.tv/playlist.m3u8" },
  { id: "dir-al-ekhbaria-2", name: "AL EKHBARIA", country: "BD", category: "direct" as any, url: "https://shd-gcp-live.edgenextcdn.net/live/bitmovin-al-ekhbaria/297b3ef1cd0633ad9cfba7473a686a06/index.m3u8" },
  { id: "dir-almasira-mubasher", name: "ALMASIRA MUBASHER", country: "BD", category: "direct" as any, url: "https://live2.cdnbridge.tv/AlmasirahMubasher/Mubasher_All/playlist.m3u8" },
  { id: "dir-bein-sports", name: "Bein Sports", country: "BD", category: "direct" as any, url: "http://ua.online24.pm/play/1101/350B326FB34F4B8/video.m3u8" },
  { id: "dir-rongeen-tv", name: "Rongeen TV", country: "BD", category: "direct" as any, url: "https://server.thelegitpro.in/rongeentv/rongeentv/tracks-v1a1/mono.m3u8" },
  { id: "dir-madani-tv", name: "Madani Tv", country: "BD", category: "direct" as any, url: "https://streaming.madanichannel.tv/static/streaming-playlists/hls/d3e49b76-ac06-4689-a641-9200445b647f/master.m3u8" },
  { id: "dir-real-wild", name: "REAL WILD", country: "BD", category: "direct" as any, url: "https://cdn-ue1-prod.tsv2.amagi.tv/linear/amg00426-littledotstudio-realwild-tcl/playlist.m3u8" },
  { id: "dir-al-istiqama", name: "AL ISTIQAMA", country: "BD", category: "direct" as any, url: "https://jmc-live.ercdn.net/alistiqama/alistiqama.m3u8" },
  { id: "dir-bein-sports-tekrar", name: "Bein Sports Tekrar", country: "BD", category: "direct" as any, url: "https://ua.online24.pm/play/1103/350B326FB34F4B8/video.m3u8" },
  { id: "dir-zb-cartoon", name: "ZB Cartoon", country: "BD", category: "direct" as any, url: "https://server.zillarbarta.com/zbcatun/video.m3u8" },
  { id: "dir-pcv", name: "pcv", country: "BD", category: "direct" as any, url: "https://padmaonline.duckdns.org:8088/pcv/index.m3u8" },
  { id: "dir-dw-news", name: "DW NEWS", country: "BD", category: "direct" as any, url: "https://dwamdstream102.akamaized.net/hls/live/2015525/dwstream102/stream02/streamPlaylist.m3u8" },
  { id: "dir-sochi-24-hd", name: "Sochi 24 HD", country: "BD", category: "direct" as any, url: "http://serv30.vintera.tv:8081/sochi/sochi24_tv/playlist.m3u8" },
  { id: "dir-insight", name: "Insight", country: "BD", category: "direct" as any, url: "https://insighttv-samsung-us.amagi.tv/playlist.m3u8" },
  { id: "dir-france-news-24", name: "France News 24", country: "BD", category: "direct" as any, url: "https://live.france24.com/hls/live/2037179/F24_FR_HI_HLS/master_5000.m3u8" },
  { id: "dir-france-24-english-720p", name: "France 24 English (720p)", country: "BD", category: "direct" as any, url: "https://live.france24.com/hls/live/2037218-b/F24_EN_HI_HLS/master_2300.m3u8" },
  { id: "dir-t-global-news-canada", name: "T Global News (Canada)", country: "BD", category: "direct" as any, url: "https://live.corusdigitaldev.com/groupd/live/49a91e7f-1023-430f-8d66-561055f3d0f7/live.isml/master.m3u8" },
  { id: "dir-a-spor", name: "A SPOR", country: "BD", category: "direct" as any, url: "https://rnttwmjcin.turknet.ercdn.net/lcpmvefbyo/aspor/aspor_480p.m3u8" },
  { id: "dir-dw-english", name: "DW English _", country: "BD", category: "direct" as any, url: "https://dwamdstream102.akamaized.net/hls/live/2015525/dwstream102/index.m3u8" },
  { id: "dir-global-news-us", name: "Global News (US)", country: "BD", category: "direct" as any, url: "https://live.corusdigitaldev.com/groupb/live/3062d0e3-ed4c-4f47-8482-95648250f4b8/live.isml/.m3u8" },
  { id: "dir-cnn-us", name: "CNN (US)", country: "BD", category: "direct" as any, url: "https://turnerlive.warnermediacdn.com/hls/live/586495/cnngo/cnn_slate/VIDEO_0_3564000.m3u8" },
  { id: "dir-iran-international-en", name: "Iran International(EN)", country: "BD", category: "direct" as any, url: "https://dev-live.livetvstream.co.uk/LS-63503-4/chunklist_b1196000.m3u8" },
  { id: "dir-fashion-one", name: "FASHION ONE", country: "BD", category: "direct" as any, url: "https://b01c02nl.mediatriple.net/videoonlylive/mtkgeuihrlfwlive/u_stream_5c9e2ee6997cb_1/playlist.m3u8" },
  { id: "dir-fashion-one-2", name: "FASHION ONE", country: "BD", category: "direct" as any, url: "https://b01c02nl.mediatriple.net/videoonlylive/mtkgeuihrlfwlive/broadcast_5c9e2ee690051.smil/playlist.m3u8" },
  { id: "dir-digital-fashion", name: "Digital Fashion", country: "BD", category: "direct" as any, url: "http://115.187.41.216:8080/hls/digitalfashion/index.m3u8" },
  { id: "dir-colors-infinity-sd", name: "Colors Infinity SD", country: "BD", category: "direct" as any, url: "https://livecdn.live247stream.com/joomusic/tv/playlist.m3u8" },
  { id: "dir-quran-2", name: "Quran", country: "BD", category: "direct" as any, url: "https://download.quranicaudio.com/qdc/abdurrahmaan_as_sudais/murattal/96.mp3" },
  { id: "dir-dw-english-2", name: "DW English", country: "BD", category: "direct" as any, url: "https://dwamdstream102.akamaized.net/hls/live/2015525/dwstream102/index.m3u8?v=1" },
  { id: "dir-al-quran-radio", name: "Al Quran Radio", country: "BD", category: "direct" as any, url: "http://66.45.232.131:9994/;stream.mp3" },
  { id: "dir-press-tv-iran", name: "Press TV Iran", country: "BD", category: "direct" as any, url: "https://live.presstv.ir/hls/presstv_5_482/index.m3u8" },
  { id: "dir-gopal-bhar-tv", name: "Gopal Bhar TV", country: "BD", category: "direct" as any, url: "https://live20.bozztv.com/giatvplayout7/giatv-209611/tracks-v1a1/mono.ts.m3u8" },
  { id: "dir-trt-world", name: "TRT WORLD", country: "BD", category: "direct" as any, url: "https://tv-trtworld.medya.trt.com.tr/master.m3u8" },
  { id: "dir-arihant-tv", name: "Arihant TV", country: "BD", category: "direct" as any, url: "https://aasthaott.akamaized.net/110923/smil:arihant.smil/chunklist_b1928000.m3u8" },
  { id: "dir-doraemon-tv", name: "Doraemon TV", country: "BD", category: "direct" as any, url: "https://live20.bozztv.com/giatvplayout7/giatv-209902/tracks-v1a1/mono.ts.m3u8" },
  { id: "dir-tom-jerry-tv", name: "Tom & Jerry TV", country: "BD", category: "direct" as any, url: "https://live20.bozztv.com/giatvplayout7/giatv-208314/tracks-v1a1/mono.ts.m3u8" },
  { id: "dir-dhoom-music", name: "Dhoom Music", country: "BD", category: "direct" as any, url: "http://103.175.73.12:8080/live/378/378_0.m3u8" },
  { id: "dir-motu-patlu", name: "Motu Patlu", country: "BD", category: "direct" as any, url: "https://live20.bozztv.com/giatvplayout7/giatv-209622/tracks-v1a1/mono.ts.m3u8" },
  { id: "dir-ndtv-news", name: "NDTV NEWS", country: "BD", category: "direct" as any, url: "https://ndtv24x7elemarchana.akamaized.net/hls/live/2003678-b/ndtv24x7/master.m3u8" },
  { id: "dir-r-plus-gold", name: "R Plus Gold", country: "BD", category: "direct" as any, url: "https://cdn-4.pishow.tv/live/1231/1231_1.m3u8" },
  { id: "dir-aakash-aath", name: "AAKASH AATH", country: "BD", category: "direct" as any, url: "https://cdn-4.pishow.tv/live/969/master.m3u8" },
  { id: "dir-kolkata-tv", name: "Kolkata TV", country: "BD", category: "direct" as any, url: "https://cdn.ottlive.co.in/kolkatatv/index.m3u8" },
  { id: "dir-zee-action", name: "Zee Action", country: "BD", category: "direct" as any, url: "http://103.175.73.12:8080/live/270/270_0.m3u8" },
  { id: "dir-times-of-india", name: "Times Of India", country: "BD", category: "direct" as any, url: "https://live.sli.ke/live/npnhm84gz9/master.m3u8" },
  { id: "dir-zee-anmol-tv", name: "Zee Anmol TV", country: "BD", category: "direct" as any, url: "http://103.175.73.12:8080/live/256/256_0.m3u8" },
  { id: "dir-big-magic", name: "Big Magic", country: "BD", category: "direct" as any, url: "http://103.175.73.12:8080/live/13/13_0.m3u8" },
  { id: "dir-sheemaroo-bollywood", name: "Sheemaroo Bollywood", country: "BD", category: "direct" as any, url: "https://cdn-uw2-prod.tsv2.amagi.tv/linear/amg00864-shemarooenterta-shemabollywood-ono/playlist.m3u8" },
  { id: "dir-r-plus-news", name: "R Plus News", country: "BD", category: "direct" as any, url: "https://thelegitpro.in/pntv/rplusnews24x7/tracks-v1a1/mono.m3u8" },
  { id: "dir-ndtv-hindi", name: "NDTV Hindi", country: "BD", category: "direct" as any, url: "https://ndtvindiaelemarchana.akamaized.net/hls/live/2003679/ndtvindia/master.m3u8" },
  { id: "dir-tom-jarry", name: "Tom & Jarry", country: "BD", category: "direct" as any, url: "https://live20.bozztv.com/giatvplayout7/giatv-208314/playlist.m3u8" },
  { id: "dir-hinde-movies-3", name: "Hinde Movies 3", country: "BD", category: "direct" as any, url: "https://vods2.aynaott.com/hindimovies/index.m3u8" },
  { id: "dir-goldmines-bollywood", name: "Goldmines Bollywood", country: "BD", category: "direct" as any, url: "http://103.175.73.12:8080/live/52/52_0.m3u8" },
  { id: "dir-star-sports-1-hd", name: "Star Sports 1 HD", country: "BD", category: "direct" as any, url: "http://41.205.93.154/STARSPORTS1/index.m3u8" },
  { id: "dir-hindi-hits-hd", name: "Hindi Hits HD", country: "BD", category: "direct" as any, url: "http://146.59.253.52:8080/hindihitshd/index.m3u8" },
  { id: "dir-freelancer", name: "Freelancer", country: "BD", category: "direct" as any, url: "http://premimum.online/movie/jen12345/jen54321/353751.mp4" },
  { id: "dir-greenland-2-migration-2026-hindi", name: "Greenland 2: Migration (2026) (Hindi)", country: "BD", category: "direct" as any, url: "http://premimum.online/movie/jen12345/jen54321/717746.mp4" },
  { id: "dir-food-food", name: "Food Food", country: "BD", category: "direct" as any, url: "http://103.175.73.12:8080/live/143/143_0.m3u8" },
  { id: "dir-action-hollywood-movies", name: "Action Hollywood Movies", country: "BD", category: "direct" as any, url: "https://amg01076-lightningintern-actionhollywood-samsungnz-82rry.amagi.tv/playlist/amg01076-lightningintern-actionhollywood-samsungnz/playlist.m3u8" },
  { id: "dir-e24", name: "E24", country: "BD", category: "direct" as any, url: "http://103.175.73.12:8080/live/159/159_0.m3u8" },
  { id: "dir-jana-nayagan-2026-hindi", name: "Jana Nayagan (2026) (Hindi)", country: "BD", category: "direct" as any, url: "http://premimum.online/movie/jen12345/jen54321/724489.mp4" },
  { id: "dir-b4u-kadak", name: "B4U Kadak", country: "BD", category: "direct" as any, url: "https://cdn-2.pishow.tv/live/227/master.m3u8" },
  { id: "dir-9xm", name: "9XM", country: "BD", category: "direct" as any, url: "http://103.175.73.12:8080/live/155/155_0.m3u8" },
  { id: "dir-animal-planet-hd", name: "Animal Planet HD", country: "BD", category: "direct" as any, url: "https://tiger-hub.vercel.app@vodzong.mjunoon.tv:8087/streamtest/Animal-Planet-158-3/playlist.m3u8" },
  { id: "dir-goldmines-movies", name: "Goldmines Movies", country: "BD", category: "direct" as any, url: "https://cdn-2.pishow.tv/live/1461/master.m3u8" },
  { id: "dir-goldmines-movies-2", name: "Goldmines Movies 2", country: "BD", category: "direct" as any, url: "https://cdn-2.pishow.tv/live/1460/master.m3u8" },
  { id: "dir-goldmines", name: "Goldmines", country: "BD", category: "direct" as any, url: "https://cdn-2.pishow.tv/live/1459/master.m3u8" },
  { id: "dir-music-india", name: "Music India", country: "BD", category: "direct" as any, url: "http://103.175.73.12:8080/live/158/158_0.m3u8" },
  { id: "dir-baallee", name: "Baallee", country: "BD", category: "direct" as any, url: "https://mcncdndigital.com/balleballetv/tracks-v1a1/mono.ts.m3u8" },
  { id: "dir-flix-hd", name: "&Flix HD", country: "BD", category: "direct" as any, url: "http://212.102.34.8:9080/AndFlixHD/video.m3u8" },
  { id: "dir-antarjal", name: "Antarjal", country: "BD", category: "direct" as any, url: "http://103.225.94.27/Infobase/hdd-2/Bangla/Antarjal%20(2023)%201080p%20WEBDL.mp4" },
  { id: "dir-mbc-tv", name: "MBC tv", country: "BD", category: "direct" as any, url: "http://93.184.10.248/MBCBollywood/index.m3u8" },
  { id: "dir-mardaani-3", name: "Mardaani 3", country: "BD", category: "direct" as any, url: "http://103.225.94.27/Infobase/hdd-3/hindi/Mardaani%203%20(2026)%201080p%20DVDRip.mp4" },
  { id: "dir-test", name: "Test", country: "BD", category: "direct" as any, url: "http://103.225.94.27/Infobase/hdd-3/Hindi%20Dub/Test%20(2025)%201080p%20WEBDL.mp4" },
  { id: "dir-cowboy-tv", name: "Cowboy tv", country: "BD", category: "direct" as any, url: "https://amg17292-amg17292c1-distrotv-us-4170.playouts.now.amagi.tv/playlist/amg17292-tetonridgellc-tetonridgefast-distrotvus/playlist.m3u8" },
  { id: "dir-desh-tv", name: "Desh TV", country: "BD", category: "direct" as any, url: "https://app24.jagobd.com.bd/c3VydmVyX8RpbEU9Mi8xNy8yMFDEEHGcfRgzQ6NTAgdEoaeFzbF92YWxIZTO0U0ezN1IzMyfvcEdsEfeDeKiNkVN3PTOmdFseWRtaW51aiPhnPTI2/deshtv.stream/tracks-v1/mono.m3u8" },
  { id: "dir-yrf-music-hd", name: "YRF Music HD", country: "BD", category: "direct" as any, url: "https://cdn-uw2-prod.tsv2.amagi.tv/linear/amg01412-xiaomiasia-yrfmusic-xiaomi/playlist.m3u8" },
  { id: "dir-r-plus-gould", name: "R Plus Gould", country: "BD", category: "direct" as any, url: "https://cdn-4.pishow.tv/live/1231/1231_2.m3u8" },
  { id: "dir-ptv-sports-2", name: "PTV Sports", country: "BD", category: "direct" as any, url: "http://119.156.228.231:9983/stream/channelid/679185749?ticket=DED82FB8AE85893524A1035AAE7CD187020FFA04&profile=pass" },
  { id: "dir-mk-six", name: "MK Six", country: "BD", category: "direct" as any, url: "https://cdn-3.pishow.tv/live/1253/master.m3u8" },
  { id: "dir-sony-max-2", name: "SONY MAX-2", country: "BD", category: "direct" as any, url: "http://maxotts.maxdigitaltv.com/x-media/C111/master.m3u8" },
  { id: "dir-live-sports-3", name: "Live Sports-3", country: "BD", category: "direct" as any, url: "https://1nyaler.streamhostingcdn.top/stream/30/index.m3u8" },
  { id: "dir-hindi-movies", name: "Hindi Movies", country: "BD", category: "direct" as any, url: "https://live20.bozztv.com/giatvplayout7/giatv-209612/tracks-v1a1/mono.ts.m3u8" },
  { id: "dir-south-movies", name: "South Movies", country: "BD", category: "direct" as any, url: "https://live20.bozztv.com/giatvplayout7/giatv-209593/tracks-v1a1/mono.ts.m3u8" },
  { id: "dir-bpl-2024-middle-east", name: "BPL 2024 Middle East", country: "BD", category: "direct" as any, url: "https://bpl24middleeast.akamaized.net/hls/live/2109311/P2s6L-E2-W3o5r7l9d_Feed/master.m3u8" },
  { id: "dir-bnt1", name: "BNT1", country: "BD", category: "direct" as any, url: "http://85.11.189.178:8080/BNT1/index.m3u8" },
  { id: "dir-bnt1-hd", name: "BNT1 HD", country: "BD", category: "direct" as any, url: "http://85.11.189.178:8080/BNT1HD/index.m3u8" },
  { id: "dir-bnt3-hd", name: "BNT3 HD", country: "BD", category: "direct" as any, url: "http://85.11.189.178:8080/BNTHD/index.m3u8" },
  { id: "dir-btv-2", name: "bTV", country: "BD", category: "direct" as any, url: "http://85.11.189.178:8080/bTV/index.m3u8" },
  { id: "dir-btv-action", name: "bTV Action", country: "BD", category: "direct" as any, url: "http://85.11.189.178:8080/bTVAction/index.m3u8" },
  { id: "dir-btv-cinema", name: "bTV Cinema", country: "BD", category: "direct" as any, url: "http://85.11.189.178:8080/bTVCinema/index.m3u8" },
  { id: "dir-btv-comedy", name: "bTV Comedy", country: "BD", category: "direct" as any, url: "http://85.11.189.178:8080/bTVComedy/index.m3u8" },
  { id: "dir-btv-story", name: "bTV Story", country: "BD", category: "direct" as any, url: "http://85.11.189.178:8080/bTVLady/index.m3u8" },
  { id: "dir-history2-hd", name: "History2 HD", country: "BD", category: "direct" as any, url: "http://85.11.189.178:8080/JimJam/index.m3u8" },
];

const COUNTRY_NAMES: Record<string, string> = {
  BD: "Bangladesh", IN: "India", PK: "Pakistan", US: "United States", UK: "United Kingdom",
  GB: "United Kingdom", QA: "Qatar", AE: "UAE", SA: "Saudi Arabia", DE: "Germany", FR: "France",
  JP: "Japan", CN: "China", KR: "Korea", TR: "Turkey", BR: "Brazil", MX: "Mexico", ES: "Spain",
  IT: "Italy", RU: "Russia", AT: "Austria", AU: "Australia", CA: "Canada", NP: "Nepal", LK: "Sri Lanka",
  MY: "Malaysia", ID: "Indonesia", TH: "Thailand", PH: "Philippines", SG: "Singapore", EG: "Egypt",
};

// Priority: BD = 0, IN = 1, all others = 2
const countryPriority = (c: string) => (c === "BD" ? 0 : c === "IN" ? 1 : 2);

// Important-channel boost based on name
const importanceScore = (ch: Channel) => {
  const n = ch.name.toLowerCase();
  if (ch.country === "BD" && IMPORTANT_BD_CHANNELS.some(k => n.includes(k))) return 0;
  if (ch.country === "IN" && IMPORTANT_IN_CHANNELS.some(k => n.includes(k))) return 0;
  return 1;
};

const LiveTV = () => {
  const { language } = useLanguage();
  const t = (bn: string, en: string) => (language === "bn" ? bn : en);

  const [tab, setTab] = useState<Tab>("mrgify");
  const [search, setSearch] = useState("");
  const [countryFilter, setCountryFilter] = useState<string>("all");
  const [onlyFavs, setOnlyFavs] = useState(false);
  const [active, setActive] = useState<Channel | null>(null);
  const [expandedWorld, setExpandedWorld] = useState<string | null>(null);
  const [worldCountriesShown, setWorldCountriesShown] = useState(6);
  const [worldExpandedCountries, setWorldExpandedCountries] = useState<Set<string>>(new Set());

  const [tvChannels, setTvChannels] = useState<Channel[]>([]);
  const [worldChannels, setWorldChannels] = useState<Channel[]>([]);
  const [sportsChannels, setSportsChannels] = useState<Channel[]>([]);
  const [radioChannels, setRadioChannels] = useState<Channel[]>([]);
  const [mrgifyChannels, setMrgifyChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);

  const [favs, setFavs] = useState<Set<string>>(() => {
    try { return new Set(JSON.parse(localStorage.getItem(FAV_KEY) || "[]")); } catch { return new Set(); }
  });
  const [dead, setDead] = useState<Set<string>>(() => {
    try { return new Set(JSON.parse(localStorage.getItem(DEAD_KEY) || "[]")); } catch { return new Set(); }
  });
  const [working, setWorking] = useState<Set<string>>(() => {
    try { return new Set(JSON.parse(localStorage.getItem(WORKING_KEY) || "[]")); } catch { return new Set(); }
  });
  const [recent, setRecent] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]"); } catch { return []; }
  });
  const [health, setHealth] = useState<Record<string, Health>>({});

  useEffect(() => { localStorage.setItem(DEAD_KEY, JSON.stringify([...dead])); }, [dead]);
  useEffect(() => { localStorage.setItem(WORKING_KEY, JSON.stringify([...working])); }, [working]);
  useEffect(() => { localStorage.setItem(FAV_KEY, JSON.stringify([...favs])); }, [favs]);
  useEffect(() => { localStorage.setItem(RECENT_KEY, JSON.stringify(recent.slice(0, 20))); }, [recent]);

  const markWorking = useCallback((id: string) => {
    setWorking(prev => (prev.has(id) ? prev : new Set(prev).add(id)));
    setDead(prev => {
      if (!prev.has(id)) return prev;
      const next = new Set(prev); next.delete(id); return next;
    });
    setHealth(h => (h[id] === "live" ? h : { ...h, [id]: "live" }));
  }, []);

  const reportDead = (id: string, name: string) => {
    setDead(prev => new Set(prev).add(id));
    setHealth(h => ({ ...h, [id]: "dead" }));
    toast.success(t(`${name} ডেড হিসেবে চিহ্নিত — নিচে চলে গেছে`, `${name} marked offline — moved to bottom`));
  };
  const restoreDead = () => {
    setDead(new Set());
    toast.success(t("ডেড লিস্ট রিকভার হয়েছে", "Recovered all dead streams"));
  };

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const playerRef = useRef<HTMLDivElement | null>(null);
  const fallbackIdxRef = useRef(0);
  const filteredRef = useRef<Channel[]>([]);
  const deadRef = useRef<Set<string>>(new Set());


  const toggleFav = (id: string) => {
    setFavs(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  // ----- Fetch TV (BD/IN) + World grouped + Sports from iptv-org -----
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [streamsRes, channelsRes, logosRes] = await Promise.all([
          fetch("https://iptv-org.github.io/api/streams.json"),
          fetch("https://iptv-org.github.io/api/channels.json"),
          fetch("https://iptv-org.github.io/api/logos.json").catch(() => null),
        ]);
        const streams = await streamsRes.json();
        const channels = await channelsRes.json();
        const logos: any[] = logosRes && logosRes.ok ? await logosRes.json() : [];
        // Pick best logo per channel (prefer square PNG/SVG)
        const logoMap = new Map<string, string>();
        for (const l of logos) {
          if (!l?.channel || !l?.url) continue;
          const existing = logoMap.get(l.channel);
          const isSquare = l.width && l.height && Math.abs(l.width - l.height) < 20;
          if (!existing || isSquare) logoMap.set(l.channel, l.url);
        }
        const chMap = new Map<string, any>(channels.map((c: any) => [c.id, { ...c, logo: c.logo || logoMap.get(c.id) }]));


        // Group streams by channel id (for World multi-link)
        const grouped = new Map<string, { meta: any; urls: string[] }>();
        const sportsList: Channel[] = [];
        const seenSports = new Set<string>();

        for (const s of streams) {
          if (!s.channel || !s.url) continue;
          if (s.user_agent || s.referrer) continue;
          if (!s.url.startsWith("https://")) continue;
          const meta = chMap.get(s.channel);
          if (!meta || meta.is_nsfw) continue;

          if (!grouped.has(meta.id)) grouped.set(meta.id, { meta, urls: [] });
          grouped.get(meta.id)!.urls.push(s.url);

          const cats: string[] = meta.categories || [];
          if (cats.includes("sports")) {
            const k = `${meta.country}:${meta.name.toLowerCase()}`;
            if (!seenSports.has(k)) {
              seenSports.add(k);
              sportsList.push({
                id: `s-${meta.id}`,
                name: meta.name,
                country: meta.country || "Other",
                countryName: COUNTRY_NAMES[meta.country] || meta.country,
                category: "sports",
                logo: meta.logo,
                url: s.url,
                urls: [s.url],
              });
            }
          }
        }

        // Attach all URLs to sports
        sportsList.forEach(sp => {
          const id = sp.id.replace(/^s-/, "");
          const g = grouped.get(id);
          if (g) sp.urls = g.urls;
        });

        const detectTvSub = (meta: any): string => {
          const cats: string[] = (meta.categories || []).map((c: string) => c.toLowerCase());
          const name = (meta.name || "").toLowerCase();
          const hay = cats.join(" ") + " " + name;
          if (cats.includes("news") || /news|khabar|24|bulletin|আজতক|সংবাদ/.test(hay)) return "news";
          if (cats.includes("sports") || /sport|cricket|football|star sport|sony sport|ten sport|willow/.test(hay)) return "sports";
          if (cats.includes("movies") || /movie|cinema|film|pix|max|hbo|zee cinema|set max|romedy/.test(hay)) return "movies";
          if (cats.includes("music") || /music|song|mtv|9xm|b4u|mastiii|zoom|vh1|gaan/.test(hay)) return "music";
          if (cats.includes("kids") || /kids|cartoon|pogo|nick|hungama|disney|baby|chuchu/.test(hay)) return "kids";
          if (cats.includes("religious") || /religio|islam|quran|hindu|christian|bhakti|aastha|sanskar|peace tv/.test(hay)) return "religious";
          if (cats.includes("documentary") || /discovery|nat geo|animal planet|history|tlc|knowledge|science|epic/.test(hay)) return "documentary";
          if (cats.includes("entertainment") || cats.includes("general") || /entertain|drama|serial|show|star plus|colors|zee tv|sony|sab tv/.test(hay)) return "entertainment";
          if (/bolly|filmi/.test(hay)) return "bollywood";
          if (cats.includes("business")) return "news";
          if (cats.includes("education")) return "documentary";
          return "other";
        };

        const tvList: Channel[] = [];
        const worldList: Channel[] = [];
        for (const { meta, urls } of grouped.values()) {
          const ch: Channel = {
            id: meta.id,
            name: meta.name,
            country: meta.country || "Other",
            countryName: COUNTRY_NAMES[meta.country] || meta.country,
            category: "tv",
            categories: meta.categories,
            subCategory: detectTvSub(meta),
            logo: meta.logo,
            url: urls[0],
            urls,
          };
          if (meta.country === "IN") tvList.push(ch);
          worldList.push({ ...ch, category: "world" as any });
        }


        if (!cancelled) {
          setTvChannels(tvList);
          setWorldChannels(worldList);
          setSportsChannels([...sportsList, ...FALLBACK_SPORTS]);
        }
      } catch (e) {
        console.error("iptv-org fetch failed", e);
        if (!cancelled) {
          setTvChannels([]);
          setSportsChannels(FALLBACK_SPORTS);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Radio
  useEffect(() => {
    let cancelled = false;
    const fetchCountry = async (cc: string) => {
      const mirrors = [
        "https://de1.api.radio-browser.info", "https://de2.api.radio-browser.info", "https://nl1.api.radio-browser.info",
      ];
      for (const base of mirrors) {
        try {
          const r = await fetch(`${base}/json/stations/bycountrycodeexact/${cc}?hidebroken=true&order=votes&reverse=true&limit=150`);
          if (!r.ok) continue;
          return (await r.json()) as any[];
        } catch {}
      }
      return [];
    };
    (async () => {
      const codes = ["BD", "IN", "PK", "SA", "AE", "US", "GB", "TR", "MY", "ID"];
      const results = await Promise.all(codes.map(fetchCountry));

      const detectSub = (s: any): string => {
        const tags = (s.tags || "").toLowerCase() + " " + (s.name || "").toLowerCase();
        if (/news|talk|khabar|খবর|সংবাদ|bulletin/.test(tags)) return "news";
        if (/quran|islam|religio|hindu|christ|gospel|bhajan|naat|ধর্ম|nasheed/.test(tags)) return "religious";
        if (/sport|cricket|football/.test(tags)) return "sports";
        if (/kid|children|শিশু/.test(tags)) return "kids";
        if (/classic|ghazal|folk|rabindra|nazrul|লোক/.test(tags)) return "classical";
        if (/pop|rock|dance|hits|top 40|edm|electronic|hip hop|rap|remix/.test(tags)) return "pop";
        if (/bolly|filmi|movie|cinema|film/.test(tags)) return "bollywood";
        if (/music|song|fm|radio/.test(tags)) return "music";
        return "other";
      };

      const map = (arr: any[], cc: string): Channel[] =>
        arr.filter((s) => s.url_resolved && s.lastcheckok === 1).map((s, i) => ({
          id: `r-${cc}-${s.stationuuid || i}`,
          name: s.name?.trim() || "Unknown",
          country: cc,
          countryName: COUNTRY_NAMES[cc] || cc,
          category: "radio" as const,
          subCategory: detectSub(s),
          logo: s.favicon || undefined,
          url: s.url_resolved,
          urls: [s.url_resolved],
        }));

      const all = codes.flatMap((cc, i) => map(results[i], cc));
      if (!cancelled) setRadioChannels(all);
    })();
    return () => { cancelled = true; };
  }, []);


  // ----- Merge external M3U playlist (Mrgify BDIX IPTV — 715+ channels) into TV tab -----
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const M3U_URLS = [
        "https://raw.githubusercontent.com/abusaeeidx/Mrgify-BDIX-IPTV/main/playlist.m3u",
        "https://github.com/abusaeeidx/Mrgify-BDIX-IPTV/raw/main/playlist.m3u",
      ];
      let text = "";
      for (const u of M3U_URLS) {
        try {
          const r = await fetch(u, { cache: "no-store" });
          if (r.ok) { text = await r.text(); if (text.includes("#EXTINF")) break; }
        } catch {}
      }
      if (!text || cancelled) return;

      const lines = text.split(/\r?\n/);
      const parsed: Channel[] = [];
      const seen = new Set<string>();
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (!line.startsWith("#EXTINF")) continue;
        const commaIdx = line.lastIndexOf(",");
        const name = commaIdx >= 0 ? line.slice(commaIdx + 1).trim() : "Unknown";
        const logo = /tvg-logo="([^"]+)"/.exec(line)?.[1];
        const group = /group-title="([^"]+)"/.exec(line)?.[1];
        // find next non-comment, non-empty line as URL
        let url = "";
        for (let j = i + 1; j < lines.length; j++) {
          const l = lines[j].trim();
          if (!l || l.startsWith("#")) continue;
          url = l; break;
        }
        if (!url || !name) continue;
        const key = `${name.toLowerCase()}|${url}`;
        if (seen.has(key)) continue;
        seen.add(key);

        // Country detection from name
        const IN_NAME_RE = /\b(star|sony|zee|colors|aaj tak|abp|ndtv|india today|republic|times now|dd national|dd sports|set max|sab|discovery india|jaya|sun tv|asianet|vijay|kalaignar|udaya|gemini|kairali|surya|mazhavil|manorama|amrita|tv9|etv|abp ananda|zee bangla|colors bangla|akash aath|sony aath|sony sab|movies now|romedy|max2|pix|hbo india|zee cinema|zee anmol|utsav|bindass|sony yay|pogo|nick india|cartoon network india|hungama|disney india|animal planet india|nat geo india|tlc india|history india|fox life|axn india|comedy central india|mtv india|vh1 india|9xm|mastiii|b4u|zoom|et now|cnbc india|news nation|india tv|zee news|abp news|republic bharat|dd bharati|dd urdu|aaj|india)\b/i;
        const PK_RE = /\b(ary|geo|hum|ptv|dunya|samaa|92 news|express news|dawn)\b/i;
        const AR_RE = /\b(al jazeera|mbc|dubai|abu dhabi|saudi|quran|makkah|madinah|iqra|sunnah|arabic|arabica|almasira|al ekhbaria|al sunnah|peace tv)\b/i;
        const US_RE = /\b(cnn|fox|nbc|cbs|abc news|bloomberg|hbo|espn|cartoon network|nickelodeon|discovery|history|nat geo|animal planet)\b/i;
        const UK_RE = /\b(bbc|itv|sky|channel 4|channel4)\b/i;
        const TR_RE = /\b(trt|show tv|kanal d|atv turk)\b/i;
        const lname = name.toLowerCase();
        const grp = (group || "").toLowerCase();
        let country = "BD";
        if (IN_NAME_RE.test(lname) || /\b(india|indian|hindi|bengali\s*india|tamil|telugu|kannada|malayalam)\b/.test(grp)) country = "IN";
        else if (PK_RE.test(lname) || /pakistan|urdu/.test(grp)) country = "PK";
        else if (AR_RE.test(lname) || /arab|islamic|quran|saudi|makkah/.test(grp)) country = "SA";
        else if (US_RE.test(lname) || /\busa\b|american/.test(grp)) country = "US";
        else if (UK_RE.test(lname) || /\buk\b|british/.test(grp)) country = "GB";
        else if (TR_RE.test(lname) || /turk/.test(grp)) country = "TR";

        // Sub-category detection from group + name
        const gl = grp + " " + lname;
        let subCategory = "other";
        if (/news|খবর|সংবাদ|24|bulletin/i.test(gl)) subCategory = "news";
        else if (/sport|খেলা|cricket|football|soccer|espn|ten sport|star sport|sony sport|t sport|willow/i.test(gl)) subCategory = "sports";
        else if (/movie|cinema|film|hbo|max|pix|romedy|utsav|zee cinema|set max|movies/i.test(gl)) subCategory = "movies";
        else if (/music|song|mtv|9xm|mastiii|b4u|zoom|vh1|gaan|গান/i.test(gl)) subCategory = "music";
        else if (/kids|cartoon|pogo|nick|hungama|disney|baby|শিশু|children/i.test(gl)) subCategory = "kids";
        else if (/religio|islam|quran|hindu|christian|peace tv|madani|sunnah|makkah|iqra|ধর্ম/i.test(gl)) subCategory = "religious";
        else if (/entertain|drama|serial|natok|নাটক|বিনোদন|show/i.test(gl)) subCategory = "entertainment";
        else if (/discovery|nat geo|animal planet|history|tlc|knowledge|science/i.test(gl)) subCategory = "documentary";

        parsed.push({
          id: `mrg-${parsed.length}-${name.replace(/[^a-z0-9]/gi, "").slice(0, 20).toLowerCase()}`,
          name,
          country,
          countryName: COUNTRY_NAMES[country] || country,
          category: "tv",
          categories: group ? [group] : undefined,
          subCategory,
          logo,
          provider: group || "Mrgify BDIX",
          url,
          urls: [url],
        });
      }

      if (parsed.length && !cancelled) {
        setMrgifyChannels(parsed);
      }

    })();
    return () => { cancelled = true; };
  }, []);


  const bdixChannels: Channel[] = useMemo(() => {
    // Only keep TV9 and Sony 8 from BDIX imports — everything else is dropped.
    const KEEP_RE = /\b(tv[\s-]?9|sony[\s-]?(8|aath))\b/i;
    return BDIX_CHANNELS.filter(b => KEEP_RE.test(b.name)).map(b => ({
      id: b.id,
      name: b.name,
      country: "IN",
      countryName: "India",
      category: "tv" as any,
      subCategory: b.category || "entertainment",
      provider: b.provider,
      url: b.url,
      urls: [b.url],
    }));
  }, []);


  const checkHealth = useCallback(async (ch: Channel) => {
    setHealth(h => ({ ...h, [ch.id]: "checking" }));
    try {
      const ctrl = new AbortController();
      const tId = setTimeout(() => ctrl.abort(), 6000);
      const res = await fetch(ch.url, { method: "GET", signal: ctrl.signal });
      clearTimeout(tId);
      if (!res.ok) throw new Error("bad");
      const txt = (await res.text()).slice(0, 200);
      const ok = txt.includes("#EXTM3U") || ch.category === "radio";
      setHealth(h => ({ ...h, [ch.id]: ok ? "live" : "dead" }));
      if (ok) markWorking(ch.id);
      else setDead(prev => (prev.has(ch.id) ? prev : new Set(prev).add(ch.id)));
    } catch {
      setHealth(h => ({ ...h, [ch.id]: "unknown" }));
    }
  }, [markWorking]);

  const offlineChannels = useMemo(() => {
    const pool = [
      ...mrgifyChannels, ...tvChannels, ...worldChannels,
      ...bdixChannels, ...sportsChannels, ...radioChannels,
    ];
    const seen = new Set<string>();
    return pool.filter(c => dead.has(c.id) && !seen.has(c.id) && seen.add(c.id));
  }, [mrgifyChannels, tvChannels, worldChannels, bdixChannels, sportsChannels, radioChannels, dead]);

  const workingChannels = useMemo(() => {
    const pool = [
      ...mrgifyChannels, ...tvChannels, ...worldChannels,
      ...bdixChannels, ...sportsChannels, ...radioChannels,
    ];
    const seen = new Set<string>();
    return pool.filter(c => working.has(c.id) && !dead.has(c.id) && !seen.has(c.id) && seen.add(c.id));
  }, [mrgifyChannels, tvChannels, worldChannels, bdixChannels, sportsChannels, radioChannels, working, dead]);

  // Merge duplicate channels across all tabs: same channel (normalized name + country)
  // appears only in its FIRST-seen tab, but collects backup URLs from every other pool.
  const mergedByTab = useMemo(() => {
    const normalize = (n: string) =>
      n.toLowerCase()
        .replace(/\[[^\]]*\]|\([^)]*\)/g, " ")
        .replace(/\b(hd|fhd|uhd|4k|sd|tv|channel|live|bd|bangla|bangladesh|india|world|sports?|news|radio|fm|am|official|network)\b/g, " ")
        .replace(/[^a-z0-9]+/g, "")
        .trim();
    // Build a global name→logo index from iptv-org pools (they carry most logos).
    const logoIndex = new Map<string, string>();
    for (const c of [...tvChannels, ...worldChannels, ...sportsChannels]) {
      if (!c.logo) continue;
      const k = normalize(c.name);
      if (k && !logoIndex.has(k)) logoIndex.set(k, c.logo);
    }

    // Consolidate ALL Bangladesh channels into Bangladesh (mrgify) tab.
    // Promote Mrgify's Indian → India (tv), non-BD/IN → World.
    const mrgifyIN = mrgifyChannels.filter(c => c.country === "IN");
    const mrgifyWorld = mrgifyChannels.filter(c => c.country !== "IN" && c.country !== "BD")
      .map(c => ({ ...c, category: "world" as any }));
    const mrgifyBD = mrgifyChannels.filter(c => c.country === "BD");
    const worldBD = worldChannels.filter(c => c.country === "BD");
    const worldRest = worldChannels.filter(c => c.country !== "BD");

    // Route EVERY sports-like channel (from any source) into the Sports tab.
    const SPORTS_RE = /\b(sport|sports|espn|willow|cricket|bein|fox\s*sport|sky\s*sport|nbc\s*sport|star\s*sport|sony\s*sport|ten\s*sport|ptv\s*sport|dd\s*sport|t\s*sport|geo\s*super|a\s*sport|gtv|nagin|tsn|eurosport|supersport|setanta|dazn)\b/i;
    const isSports = (c: Channel) =>
      c.category === "sports" ||
      (c as any).subCategory === "sports" ||
      SPORTS_RE.test(c.name);
    const split = (list: Channel[]) => {
      const s: Channel[] = [], r: Channel[] = [];
      for (const c of list) {
        if (isSports(c)) s.push({ ...c, category: "sports" as any });
        else r.push(c);
      }
      return { s, r };
    };
    const p1 = split(mrgifyBD), p2 = split(worldBD);
    const p3 = split(tvChannels), p4 = split(mrgifyIN), p5 = split(bdixChannels);
    const p6 = split(worldRest), p7 = split(mrgifyWorld);

    const pools: { key: Tab; list: Channel[] }[] = [
      // Sports FIRST so any sports-like channel dedupes into the Sports tab.
      { key: "sports", list: [...sportsChannels, ...p1.s, ...p2.s, ...p3.s, ...p4.s, ...p5.s, ...p6.s, ...p7.s] },
      // mrgify (Bangladesh) next so BD channels dedupe here.
      { key: "mrgify", list: [...p1.r, ...p2.r] },
      { key: "tv", list: [...p3.r, ...p4.r, ...p5.r] },
      { key: "world", list: [...p6.r, ...p7.r] },
      { key: "radio", list: radioChannels },
    ];

    const map = new Map<string, { primary: Tab; ch: Channel }>();
    for (const { key, list } of pools) {
      for (const c of list) {
        const norm = normalize(c.name);
        const k = norm || c.id;
        const existing = map.get(k);
        if (!existing) {
          const logo = c.logo || (norm ? logoIndex.get(norm) : undefined);
          map.set(k, { primary: key, ch: { ...c, logo, urls: [...(c.urls || [c.url])] } });
        } else {
          const merged = new Set([...(existing.ch.urls || []), ...(c.urls || [c.url])]);
          existing.ch.urls = [...merged];
          if (!existing.ch.logo && c.logo) existing.ch.logo = c.logo;
          if (!existing.ch.logo && norm) existing.ch.logo = logoIndex.get(norm);
        }
      }
    }

    const byTab: Record<string, Channel[]> = {};
    for (const { primary, ch } of map.values()) {
      (byTab[primary] ||= []).push(ch);
    }
    return byTab;
  }, [mrgifyChannels, tvChannels, worldChannels, bdixChannels, sportsChannels, radioChannels]);

  const allChannels =
    tab === "mrgify" ? (mergedByTab.mrgify || []) :
    tab === "tv" ? (mergedByTab.tv || []) :
    tab === "world" ? (mergedByTab.world || []) :
    tab === "bdix" ? (mergedByTab.bdix || []) :
    
    tab === "sports" ? (mergedByTab.sports || []) :
    tab === "offline" ? offlineChannels :
    tab === "working" ? workingChannels :
    tab === "radio" ? (mergedByTab.radio || []) : [];

  const availableCountries = useMemo(() => {
    const set = new Set<string>();
    allChannels.forEach(c => set.add(c.country));
    return [...set].sort((a, b) => countryPriority(a) - countryPriority(b) || a.localeCompare(b));
  }, [allChannels]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    const base = allChannels.filter((c) =>
      (!q || c.name.toLowerCase().includes(q)) &&
      (countryFilter === "all" || c.country === countryFilter) &&
      (!onlyFavs || favs.has(c.id))
    );
    const recentRank = (id: string) => {
      const i = recent.indexOf(id);
      return i === -1 ? 999 : i; // lower = more recent
    };
    return base.sort((a, b) => {
      // Dead always at bottom (except in Offline tab where all are dead)
      if (tab !== "offline") {
        const da = dead.has(a.id) ? 1 : 0;
        const db = dead.has(b.id) ? 1 : 0;
        if (da !== db) return da - db;
      }
      // Confirmed LIVE / working channels first (auto-checked on load)
      const la = (working.has(a.id) || health[a.id] === "live") ? 0 : 1;
      const lb = (working.has(b.id) || health[b.id] === "live") ? 0 : 1;
      if (la !== lb) return la - lb;
      // Recently-played next
      const ra = recentRank(a.id);
      const rb = recentRank(b.id);
      if (ra !== rb) return ra - rb;
      // Favourites next
      const fa = favs.has(a.id) ? 0 : 1;
      const fb = favs.has(b.id) ? 0 : 1;
      if (fa !== fb) return fa - fb;
      // Country priority (BD > IN > others)
      const pa = countryPriority(a.country);
      const pb = countryPriority(b.country);
      if (pa !== pb) return pa - pb;
      // Important channels boost
      const ia = importanceScore(a);
      const ib = importanceScore(b);
      if (ia !== ib) return ia - ib;
      return a.name.localeCompare(b.name);
    });
  }, [allChannels, search, countryFilter, onlyFavs, favs, dead, recent, working, health, tab]);


  useEffect(() => {
    const targets = filtered.slice(0, 12).filter(c => !(c.id in health));
    targets.forEach(c => checkHealth(c));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtered]);

  // Auto-sweep on site load: check a wide sample of channels in the background
  // with limited concurrency so live/working ones bubble to the top automatically.
  const sweptRef = useRef(false);
  useEffect(() => {
    if (sweptRef.current) return;
    if (loading) return;
    const pool = [
      ...mrgifyChannels, ...tvChannels, ...worldChannels,
      ...bdixChannels, ...sportsChannels, ...radioChannels,
    ];
    if (pool.length === 0) return;
    sweptRef.current = true;

    // Dedupe + skip known-dead + skip already-checked
    const seen = new Set<string>();
    const queue = pool.filter(c => {
      if (seen.has(c.id)) return false;
      seen.add(c.id);
      if (dead.has(c.id)) return false;
      if (health[c.id]) return false;
      return true;
    });

    // Prioritise: favourites → recent → BD → IN → important → rest
    queue.sort((a, b) => {
      const fa = favs.has(a.id) ? 0 : 1, fb = favs.has(b.id) ? 0 : 1;
      if (fa !== fb) return fa - fb;
      const ra = recent.indexOf(a.id), rb = recent.indexOf(b.id);
      const rra = ra === -1 ? 999 : ra, rrb = rb === -1 ? 999 : rb;
      if (rra !== rrb) return rra - rrb;
      const pa = countryPriority(a.country), pb = countryPriority(b.country);
      if (pa !== pb) return pa - pb;
      return importanceScore(a) - importanceScore(b);
    });

    const MAX = Math.min(queue.length, 400);
    const CONCURRENCY = 6;
    let idx = 0;
    let cancelled = false;

    const runNext = async (): Promise<void> => {
      if (cancelled) return;
      const my = idx++;
      if (my >= MAX) return;
      try { await checkHealth(queue[my]); } catch { /* ignore */ }
      // small stagger to avoid hammering
      await new Promise(r => setTimeout(r, 40));
      return runNext();
    };
    for (let i = 0; i < CONCURRENCY; i++) runNext();

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, mrgifyChannels, tvChannels, worldChannels, bdixChannels, sportsChannels, radioChannels]);


  // Try a given URL index, auto-fallback on error
  const playUrl = useCallback((ch: Channel, urlIdx: number) => {
    const urls = ch.urls && ch.urls.length ? ch.urls : [ch.url];
    if (urlIdx >= urls.length) {
      toast.error(t(`${ch.name} এর সব লিংক ডেড — নিচে সরিয়ে দিচ্ছি`, `All links for ${ch.name} are dead — moving down`));
      setDead(prev => new Set(prev).add(ch.id));
      setHealth(h => ({ ...h, [ch.id]: "dead" }));
      return;
    }
    const url = urls[urlIdx];
    fallbackIdxRef.current = urlIdx;
    hlsRef.current?.destroy();
    hlsRef.current = null;
    const isHls = url.includes(".m3u8");
    const mediaEl = ch.category === "radio" ? audioRef.current : videoRef.current;
    if (!mediaEl) return;
    if (isHls && Hls.isSupported() && ch.category !== "radio") {
      const hls = new Hls({ enableWorker: true });
      hls.loadSource(url);
      hls.attachMedia(mediaEl as HTMLMediaElement);
      hls.on(Hls.Events.MANIFEST_PARSED, () => markWorking(ch.id));
      hls.on(Hls.Events.ERROR, (_e, data) => {
        if (data.fatal) {
          if (urlIdx + 1 < urls.length) {
            toast.message(t(`লিংক ${urlIdx + 1} ফেল — অটো ব্যাকআপ চালু হচ্ছে...`, `Link ${urlIdx + 1} failed — trying backup...`));
            playUrl(ch, urlIdx + 1);
          } else {
            toast.error(t("সব ব্যাকআপ ফেল — অন্য চ্যানেল চেষ্টা করুন", "All backups failed — try another channel"));
            setDead(prev => new Set(prev).add(ch.id));
            setHealth(h => ({ ...h, [ch.id]: "dead" }));
          }
        }
      });
      hlsRef.current = hls;
    } else {
      (mediaEl as HTMLMediaElement).src = url;
      (mediaEl as HTMLMediaElement).onerror = () => {
        if (urlIdx + 1 < urls.length) playUrl(ch, urlIdx + 1);
        else setDead(prev => new Set(prev).add(ch.id));
      };
    }
    const el = mediaEl as HTMLMediaElement;
    const onPlaying = () => markWorking(ch.id);
    el.addEventListener("playing", onPlaying, { once: true });
    el.play().catch(() => {});
  }, [t, markWorking]);

  const openChannel = (ch: Channel) => {
    setActive(ch);
    setRecent(prev => [ch.id, ...prev.filter(x => x !== ch.id)].slice(0, 20));
    // Scroll player into view
    requestAnimationFrame(() => {
      playerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  useEffect(() => {
    if (!active) return;
    playUrl(active, 0);
    return () => { hlsRef.current?.destroy(); hlsRef.current = null; };
  }, [active, playUrl]);

  const healthBadge = (id: string) => {
    const h = health[id] || "unknown";
    if (h === "live") return <span title="Live" className="inline-flex items-center gap-0.5 text-emerald-600 text-[10px] font-semibold"><CheckCircle2 className="w-3 h-3" />LIVE</span>;
    if (h === "dead") return <span title="Offline" className="inline-flex items-center gap-0.5 text-rose-600 text-[10px] font-semibold"><XCircle className="w-3 h-3" />OFF</span>;
    if (h === "checking") return <Activity className="w-3 h-3 text-muted-foreground animate-pulse" />;
    return null;
  };

  return (
    <div className="container py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-3">
            <Tv className="w-3.5 h-3.5" />
            {t("লাইভ স্ট্রিমিং", "Live Streaming")}
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold mb-2">
            {t("লাইভ টিভি • BDIX • ওয়ার্ল্ড • স্পোর্টস • রেডিও", "Live TV • BDIX • World • Sports • Radio")}
          </h1>
          <p className="text-muted-foreground text-sm">
            {t("অটো ব্যাকআপ লিংক • ডেড স্ট্রিম রিকভারি • BD/IN প্রাধান্য",
               "Auto-backup links • dead stream recovery • BD/IN priority")}
          </p>
        </div>

        <div className="mb-5 -mx-4 px-4 overflow-x-auto scrollbar-hide">
          <div className="inline-flex md:flex md:justify-center rounded-full bg-muted p-1 mx-auto w-max md:w-auto">

            {([
              { k: "mrgify", label: t("বাংলাদেশ","Bangladesh"), icon: Flag, count: (mergedByTab.mrgify || []).length },
              { k: "tv", label: t("ইন্ডিয়া","India"), icon: Tv, count: (mergedByTab.tv || []).length },
              
              { k: "world", label: t("ওয়ার্ল্ড","World"), icon: Globe2, count: (mergedByTab.world || []).length },
              { k: "sports", label: t("স্পোর্টস","Sports"), icon: Trophy, count: (mergedByTab.sports || []).length },
              { k: "radio", label: t("রেডিও","Radio"), icon: Radio, count: (mergedByTab.radio || []).length },
              { k: "working", label: t("ওয়ার্কিং ✅","Working ✅"), icon: CheckCircle2, count: workingChannels.length },
              { k: "offline", label: t("অফলাইন","Offline"), icon: XCircle, count: offlineChannels.length },
            ] as { k: Tab; label: string; icon: any; count: number }[]).map(({ k, label, icon: Icon, count }) => (
              <button
                key={k}
                onClick={() => { setTab(k); setActive(null); setCountryFilter("all"); setExpandedWorld(null); }}
                className={`px-3 py-2 rounded-full text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-smooth whitespace-nowrap ${tab === k ? "gradient-bg-primary text-white shadow-glow" : ""}`}
              >
                <Icon className="w-4 h-4" /> {label}
                {count > 0 && (
                  <span className={`ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${tab === k ? "bg-white/25 text-white" : "bg-primary/15 text-primary"}`}>
                    {count}
                  </span>
                )}
              </button>

            ))}
          </div>
        </div>

        {false ? null : (
          <>
            <div ref={playerRef}>
              {active && (
                <Card className="p-4 mb-6 overflow-hidden">
                  <div className="flex items-center justify-between mb-3 gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                      {active.logo && (
                        <img src={active.logo} alt="" className="w-10 h-10 rounded object-contain bg-muted shrink-0" onError={(e) => ((e.target as HTMLImageElement).style.display = "none")} />
                      )}
                      <div className="min-w-0">
                        <p className="font-display font-bold text-lg truncate">{active.name}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {active.countryName || active.country}
                          {active.provider ? ` • ${active.provider}` : ""}
                          {active.urls && active.urls.length > 1 ? ` • ${active.urls.length} ${t("লিংক", "links")}` : ""}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {active.urls && active.urls.length > 1 && (
                        <Button variant="outline" size="sm" onClick={() => playUrl(active, (fallbackIdxRef.current + 1) % active.urls!.length)}>
                          {t("পরের লিংক", "Next link")}
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" onClick={() => setActive(null)}>×</Button>
                    </div>
                  </div>
                  {active.category === "radio" ? (
                    <div className="bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl p-8 flex flex-col items-center gap-4">
                      <Radio className="w-16 h-16 text-primary animate-pulse" />
                      <audio ref={audioRef} controls autoPlay className="w-full max-w-md" />
                    </div>
                  ) : (
                    <video ref={videoRef} controls autoPlay playsInline className="w-full aspect-video bg-black rounded-xl" />
                  )}
                  <p className="text-[11px] text-muted-foreground mt-2">
                    {t("না চললে অটো ব্যাকআপ লিংক চেষ্টা করা হবে। BDIX চ্যানেল শুধু অংশগ্রহণকারী ISP-তে কাজ করে।",
                       "If a stream fails, backup links auto-try. BDIX channels only work on participating ISPs.")}
                  </p>
                </Card>
              )}
            </div>

            <div className="grid sm:grid-cols-[1fr_auto_auto] gap-2 mb-5 max-w-3xl mx-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t("চ্যানেল খুঁজুন...", "Search channels...")} className="pl-9 rounded-full" />
              </div>
              {availableCountries.length > 1 && (
                <Select value={countryFilter} onValueChange={setCountryFilter}>
                  <SelectTrigger className="rounded-full min-w-[140px]"><Globe2 className="w-4 h-4 mr-1" /><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("সব দেশ", "All countries")}</SelectItem>
                    {availableCountries.map(c => (
                      <SelectItem key={c} value={c}>{COUNTRY_NAMES[c] || c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <Button variant={onlyFavs ? "default" : "outline"} className="rounded-full" onClick={() => setOnlyFavs(v => !v)}>
                <Star className={`w-4 h-4 ${onlyFavs ? "fill-current" : ""}`} />
                <span className="ml-1">{favs.size}</span>
              </Button>
            </div>

            {tab === "sports" && <SportsSchedule />}

            {tab === "bdix" && (
              <Card className="p-3 mb-4 bg-amber-500/5 border-amber-500/30">
                <p className="text-xs text-muted-foreground">
                  <Wifi className="inline w-3.5 h-3.5 mr-1 text-amber-600" />
                  {t("BDIX চ্যানেল শুধু বাংলাদেশী ISP (Link3, Amber IT, Carnival ইত্যাদি) এর গ্রাহকদের জন্য কাজ করে। মোবাইল ডেটায় কাজ নাও করতে পারে।",
                     "BDIX channels work only on Bangladesh ISP networks (Link3, Amber IT, Carnival etc.). May not work on mobile data.")}
                </p>
              </Card>
            )}

            {dead.size > 0 && (
              <div className="flex justify-center mb-4 gap-2">
                <Button variant="ghost" size="sm" className="text-xs" onClick={restoreDead}>
                  <RefreshIcon /> {t(`${dead.size}টি ডেড স্ট্রিম রিকভার করো`, `Recover ${dead.size} dead stream${dead.size>1?"s":""}`)}
                </Button>
              </div>
            )}

            {loading && tab !== "radio" && tab !== "bdix" && tab !== "mrgify" && (
              <div className="flex flex-col items-center py-12 text-muted-foreground">
                <Loader2 className="w-8 h-8 animate-spin mb-2" />
                <p className="text-sm">{t("সর্বশেষ চ্যানেল লোড হচ্ছে...", "Loading latest channels...")}</p>
              </div>
            )}

            {!loading && filtered.length === 0 && (
              <p className="text-center text-muted-foreground py-8">{t("কোনো চ্যানেল পাওয়া যায়নি।", "No channels found.")}</p>
            )}

            {(() => {
              const renderCard = (c: typeof filtered[number]) => {
                const isFav = favs.has(c.id);
                const isDead = dead.has(c.id);
                const isExpanded = expandedWorld === c.id;
                const linkCount = c.urls?.length || 1;
                return (
                  <div key={c.id} className={`group relative p-4 rounded-2xl border bg-card hover:border-primary hover:shadow-elegant transition-smooth ${active?.id === c.id ? "border-primary shadow-glow" : "border-border"} ${isDead ? "opacity-50" : ""}`}>
                    <button onClick={(e) => { e.stopPropagation(); toggleFav(c.id); }} className="absolute top-2 right-2 p-1 rounded-full hover:bg-muted z-10" aria-label="Favorite">
                      <Star className={`w-4 h-4 ${isFav ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`} />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); reportDead(c.id, c.name); }} className="absolute top-2 right-9 p-1 rounded-full hover:bg-rose-500/10 z-10 opacity-0 group-hover:opacity-100 transition-opacity" aria-label="Report dead" title={t("ডেড রিপোর্ট", "Report dead")}>
                      <Flag className="w-3.5 h-3.5 text-rose-500" />
                    </button>
                    <button onClick={() => openChannel(c)} className="w-full text-left">
                      <div className="flex items-center gap-2 mb-2">
                        {c.logo ? (
                          <img src={c.logo} alt="" className="w-8 h-8 rounded object-contain bg-muted" onError={(e) => ((e.target as HTMLImageElement).style.visibility = "hidden")} />
                        ) : (
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white ${c.category === "radio" ? "gradient-bg-warm" : c.category === "sports" ? "bg-gradient-to-br from-amber-500 to-orange-600" : (c.category as string) === "bdix" ? "bg-gradient-to-br from-emerald-500 to-teal-600" : (c.category as string) === "direct" ? "bg-gradient-to-br from-yellow-400 to-pink-500" : "gradient-bg-primary"}`}>
                            {c.category === "sports" ? <Trophy className="w-4 h-4" /> : c.category === "radio" ? <Radio className="w-4 h-4" /> : (c.category as string) === "bdix" ? <Wifi className="w-4 h-4" /> : (c.category as string) === "direct" ? <Zap className="w-4 h-4" /> : <Tv className="w-4 h-4" />}
                          </div>
                        )}
                        <Play className="w-4 h-4 text-muted-foreground group-hover:text-primary ml-auto" />
                      </div>
                      <p className="font-semibold text-sm leading-tight line-clamp-2 pr-4">{c.name}</p>
                      <div className="flex items-center justify-between mt-1.5">
                        <span className="text-[10px] text-muted-foreground">
                          {COUNTRY_NAMES[c.country] || c.country}
                          {linkCount > 1 && <span className="ml-1 text-primary">• {linkCount} {t("লিংক", "links")}</span>}
                        </span>
                        {healthBadge(c.id)}
                      </div>
                    </button>

                    {tab === "world" && linkCount > 1 && (
                      <button
                        onClick={(e) => { e.stopPropagation(); setExpandedWorld(isExpanded ? null : c.id); }}
                        className="mt-2 w-full text-[10px] text-primary flex items-center justify-center gap-1 hover:underline"
                      >
                        <Layers className="w-3 h-3" />
                        {isExpanded ? t("লিংক লুকাও", "Hide links") : t(`সব ${linkCount}টি লিংক`, `All ${linkCount} links`)}
                        <ChevronDown className={`w-3 h-3 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                      </button>
                    )}

                    {tab === "world" && isExpanded && c.urls && (
                      <div className="mt-2 space-y-1 max-h-40 overflow-y-auto border-t pt-2">
                        {c.urls.map((u, i) => (
                          <button
                            key={i}
                            onClick={(e) => { e.stopPropagation(); openChannel({ ...c, url: u, urls: [u, ...c.urls!.filter(x => x !== u)] }); }}
                            className="w-full text-left text-[10px] px-2 py-1 rounded hover:bg-muted flex items-center gap-1"
                          >
                            <Play className="w-2.5 h-2.5 shrink-0" />
                            <span className="truncate">{t(`লিংক ${i + 1}`, `Link ${i + 1}`)}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              };

              // World tab: group channels by country
              if (tab === "world" && countryFilter === "all") {
                const groups = new Map<string, typeof filtered>();
                for (const c of filtered) {
                  const arr = groups.get(c.country) || [];
                  arr.push(c);
                  groups.set(c.country, arr);
                }
                const countryEntries = [...groups.entries()].sort((a, b) =>
                  countryPriority(a[0]) - countryPriority(b[0]) || (COUNTRY_NAMES[a[0]] || a[0]).localeCompare(COUNTRY_NAMES[b[0]] || b[0])
                );
                return (
                  <div className="space-y-8">
                    {/* Quick country jump bar */}
                    <div className="sticky top-0 z-20 -mx-2 px-2 py-2 bg-background/90 backdrop-blur border-b">
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground shrink-0">
                          <Globe2 className="w-3.5 h-3.5" />
                          {t("দেশ:", "Jump:")}
                        </div>
                        <Select
                          onValueChange={(code) => {
                            const idx = countryEntries.findIndex(([c]) => c === code);
                            if (idx >= worldCountriesShown) setWorldCountriesShown(idx + 1);
                            setTimeout(() => document.getElementById(`world-country-${code}`)?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
                          }}
                        >
                          <SelectTrigger className="h-8 rounded-full text-xs min-w-[180px] w-auto">
                            <SelectValue placeholder={t("দেশ বেছে নিন...", "Select country...")} />
                          </SelectTrigger>
                          <SelectContent className="max-h-80">
                            {countryEntries.map(([code, list]) => (
                              <SelectItem key={code} value={code}>
                                {COUNTRY_NAMES[code] || code} ({list.length})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <div className="hidden md:flex items-center gap-1.5 flex-wrap">
                          {countryEntries.slice(0, 12).map(([code, list]) => (
                            <button
                              key={code}
                              onClick={() => {
                                const idx = countryEntries.findIndex(([c]) => c === code);
                                if (idx >= worldCountriesShown) setWorldCountriesShown(idx + 1);
                                setTimeout(() => document.getElementById(`world-country-${code}`)?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
                              }}
                              className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-muted hover:bg-primary hover:text-white transition-smooth"
                            >
                              {COUNTRY_NAMES[code] || code} <span className="opacity-70">({list.length})</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {countryEntries.slice(0, worldCountriesShown).map(([code, list]) => {
                      const isCountryExpanded = worldExpandedCountries.has(code);
                      const PER_COUNTRY = 15;
                      const visible = isCountryExpanded ? list : list.slice(0, PER_COUNTRY);
                      return (
                      <section key={code} id={`world-country-${code}`} className="scroll-mt-24">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-8 h-8 rounded-lg gradient-bg-primary flex items-center justify-center text-white">
                            <Globe2 className="w-4 h-4" />
                          </div>
                          <h3 className="font-display font-bold text-lg">
                            {COUNTRY_NAMES[code] || code}
                          </h3>
                          <span className="text-xs text-muted-foreground">({list.length})</span>
                          <div className="flex-1 h-px bg-border ml-2" />
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                          {visible.map(renderCard)}
                        </div>
                        {list.length > PER_COUNTRY && (
                          <div className="mt-3 flex justify-center">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setWorldExpandedCountries(prev => {
                                  const n = new Set(prev);
                                  if (n.has(code)) n.delete(code); else n.add(code);
                                  return n;
                                });
                              }}
                            >
                              {isCountryExpanded
                                ? t("কম দেখান", "Show less")
                                : t(`আরো ${list.length - PER_COUNTRY} টি দেখান`, `Show ${list.length - PER_COUNTRY} more`)}
                            </Button>
                          </div>
                        )}
                      </section>
                    );})}
                    {worldCountriesShown < countryEntries.length && (
                      <div className="flex justify-center pt-4">
                        <Button onClick={() => setWorldCountriesShown(n => n + 6)} variant="secondary">
                          {t(`আরো দেশ লোড করুন (${countryEntries.length - worldCountriesShown} বাকি)`, `Load more countries (${countryEntries.length - worldCountriesShown} left)`)}
                        </Button>
                      </div>
                    )}
                  </div>
                );
              }

              // BDIX & Mrgify tabs: group by category with country jump
              if ((tab === "bdix" || tab === "mrgify" || tab === "radio" || tab === "tv") && countryFilter === "all") {
                const CAT_LABELS: Record<string, { bn: string; en: string; icon: any }> = {
                  news: { bn: "নিউজ", en: "News", icon: Activity },
                  entertainment: { bn: "বিনোদন", en: "Entertainment", icon: Tv },
                  movies: { bn: "মুভি", en: "Movies", icon: Play },
                  sports: { bn: "স্পোর্টস", en: "Sports", icon: Trophy },
                  music: { bn: "মিউজিক", en: "Music", icon: Radio },
                  pop: { bn: "পপ/হিটস", en: "Pop / Hits", icon: Radio },
                  bollywood: { bn: "বলিউড/ফিল্মি", en: "Bollywood / Filmi", icon: Play },
                  classical: { bn: "ক্লাসিক্যাল/লোক", en: "Classical / Folk", icon: Radio },
                  kids: { bn: "কিডস", en: "Kids", icon: Star },
                  religious: { bn: "ধর্মীয়", en: "Religious", icon: Star },
                  documentary: { bn: "ডকুমেন্টারি", en: "Documentary", icon: Globe2 },
                  other: { bn: "অন্যান্য", en: "Other", icon: Layers },
                };
                const ORDER = (tab === "mrgify" || tab === "tv")
                  ? ["entertainment", "news", "movies", "sports", "music", "pop", "bollywood", "classical", "kids", "religious", "documentary", "other"]
                  : ["news", "music", "pop", "bollywood", "classical", "entertainment", "movies", "sports", "kids", "religious", "documentary", "other"];




                const groups = new Map<string, typeof filtered>();
                for (const c of filtered) {
                  const key = (c.subCategory || "other").toLowerCase();
                  const arr = groups.get(key) || [];
                  arr.push(c);
                  groups.set(key, arr);
                }
                const catEntries = ORDER
                  .filter(k => groups.has(k))
                  .map(k => [k, groups.get(k)!] as const);
                // Country summary chips
                const countryCounts = new Map<string, number>();
                filtered.forEach(c => countryCounts.set(c.country, (countryCounts.get(c.country) || 0) + 1));
                return (
                  <div className="space-y-8">
                    <div className="sticky top-0 z-20 -mx-2 px-2 py-2 bg-background/90 backdrop-blur border-b">
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground shrink-0">
                          <Layers className="w-3.5 h-3.5" />
                          {t("ক্যাটাগরি:", "Category:")}
                        </div>
                        <Select
                          onValueChange={(key) => {
                            setTimeout(() => document.getElementById(`cat-jump-${key}`)?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
                          }}
                        >
                          <SelectTrigger className="h-8 rounded-full text-xs min-w-[180px] w-auto">
                            <SelectValue placeholder={t("ক্যাটাগরি বেছে নিন...", "Select category...")} />
                          </SelectTrigger>
                          <SelectContent className="max-h-80 z-50 bg-popover">
                            {catEntries.map(([key, list]) => {
                              const meta = CAT_LABELS[key] || CAT_LABELS.other;
                              return (
                                <SelectItem key={key} value={key}>
                                  {t(meta.bn, meta.en)} ({list.length})
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                        <div className="hidden md:flex items-center gap-1.5 flex-wrap">
                          {catEntries.map(([key, list]) => {
                            const meta = CAT_LABELS[key] || CAT_LABELS.other;
                            return (
                              <button
                                key={key}
                                onClick={() => document.getElementById(`cat-jump-${key}`)?.scrollIntoView({ behavior: "smooth", block: "start" })}
                                className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-muted hover:bg-primary hover:text-white transition-smooth"
                              >
                                {t(meta.bn, meta.en)} <span className="opacity-70">({list.length})</span>
                              </button>
                            );
                          })}
                        </div>

                        {countryCounts.size > 1 && (
                          <>
                            <div className="mx-2 h-4 w-px bg-border" />
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground shrink-0">
                              <Globe2 className="w-3.5 h-3.5" />
                              {t("দেশ:", "Country:")}
                            </div>
                            {[...countryCounts.entries()].sort((a,b) => countryPriority(a[0]) - countryPriority(b[0])).map(([code, n]) => (
                              <button
                                key={code}
                                onClick={() => setCountryFilter(code)}
                                className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500 hover:text-white transition-smooth"
                              >
                                {COUNTRY_NAMES[code] || code} <span className="opacity-70">({n})</span>
                              </button>
                            ))}
                          </>
                        )}
                      </div>
                    </div>

                    {catEntries.map(([key, list]) => {
                      const meta = CAT_LABELS[key] || CAT_LABELS.other;
                      const Icon = meta.icon;
                      return (
                        <section key={key} id={`cat-jump-${key}`} className="scroll-mt-24">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white">
                              <Icon className="w-4 h-4" />
                            </div>
                            <h3 className="font-display font-bold text-lg">
                              {t(meta.bn, meta.en)}
                            </h3>
                            <span className="text-xs text-muted-foreground">({list.length})</span>
                            <div className="flex-1 h-px bg-border ml-2" />
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                            {list.map(renderCard)}
                          </div>
                        </section>
                      );
                    })}
                  </div>
                );
              }

              return (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {filtered.map(renderCard)}
                </div>
              );
            })()}

            <p className="text-xs text-center text-muted-foreground mt-8">
              {t("সোর্স: iptv-org + radio-browser.info + BDIX কমিউনিটি — অটো ব্যাকআপ ও ডেড রিকভারি সহ।",
                 "Sources: iptv-org + radio-browser.info + BDIX community — auto-backup & dead recovery.")}
            </p>
          </>
        )}
      </motion.div>
    </div>
  );
};

const RefreshIcon = () => (
  <svg className="w-3.5 h-3.5 mr-1 inline" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5" /></svg>
);

export default LiveTV;
