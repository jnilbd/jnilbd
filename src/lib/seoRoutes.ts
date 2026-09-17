// Per-route SEO metadata (Bangla + English keyword rich).
// Used by <RouteSEO /> in Layout so every public page gets a unique
// title, description, keywords and canonical URL.

export type RouteMeta = {
  title: string;
  description: string;
  keywords?: string;
  type?: "website" | "article";
};

export const SITE_URL = "https://johnnil.com";
export const SITE_NAME = "JohnNil.com";

const B = " | JohnNil.com";

export const ROUTE_SEO: Record<string, RouteMeta> = {
  "/shop": {
    title: "অনলাইন শপ — ডিজিটাল ও ফিজিক্যাল প্রোডাক্ট কিনুন | Online Shop Bangladesh" + B,
    description:
      "JohnNil শপ থেকে কিনুন ডিজিটাল সাবস্ক্রিপশন, সফটওয়্যার, গ্যাজেট ও ফিজিক্যাল প্রোডাক্ট — সারা বাংলাদেশে ক্যাশ অন ডেলিভারি, bKash/Nagad পেমেন্ট ও দ্রুত কুরিয়ার। Buy digital & physical products online in Bangladesh.",
    keywords:
      "অনলাইন শপ বাংলাদেশ, ডিজিটাল প্রোডাক্ট, সাবস্ক্রিপশন কিনুন, গ্যাজেট শপ, online shop bangladesh, buy digital products bd, cash on delivery",
  },
  "/services": {
    title: "আইটি ও ডিজিটাল সার্ভিস — ওয়েবসাইট, অ্যাপ, মার্কেটিং | IT Services BD" + B,
    description:
      "ওয়েবসাইট ডেভেলপমেন্ট, মোবাইল অ্যাপ, গ্রাফিক ডিজাইন, ডিজিটাল মার্কেটিং, সিসিটিভি ও সোলার সার্ভিস — ঢাকা ও সারা বাংলাদেশে। Professional IT and digital services in Bangladesh.",
    keywords:
      "আইটি সার্ভিস ঢাকা, ওয়েবসাইট ডেভেলপমেন্ট বাংলাদেশ, ডিজিটাল মার্কেটিং, গ্রাফিক ডিজাইন, it services bangladesh, web development dhaka",
  },
  "/quran": {
    title: "সম্পূর্ণ আল-কুরআন বাংলা অনুবাদ ও অডিও তিলাওয়াত | Al Quran Bangla" + B,
    description:
      "১১৪ সূরা সহ সম্পূর্ণ আল-কুরআন — আরবি টেক্সট, বাংলা অনুবাদ, উচ্চারণ ও অডিও তিলাওয়াত অনলাইনে ফ্রি পড়ুন ও শুনুন। Full Al Quran with Bangla translation and audio.",
    keywords:
      "আল কুরআন বাংলা, কুরআন অনুবাদ, সূরা, অডিও তিলাওয়াত, quran bangla translation, al quran online",
  },
  "/namaz": {
    title: "আজকের নামাজের সময়সূচি ঢাকা ও সারা বাংলাদেশ | Namaz Time BD" + B,
    description:
      "ফজর, যোহর, আসর, মাগরিব ও এশার সঠিক নামাজের সময়, সেহরি-ইফতার ও নামাজ শিক্ষা — আপনার জেলা অনুযায়ী আজকের সময়সূচি। Today prayer times in Bangladesh.",
    keywords:
      "নামাজের সময়সূচি, আজকের নামাজের সময়, সেহরি ইফতার, ঢাকা নামাজ টাইম, namaz time dhaka, prayer time bangladesh",
  },
  "/hadith": {
    title: "সহিহ হাদিস বাংলা — বুখারি, মুসলিম, তিরমিজি | Hadith Bangla" + B,
    description:
      "বিষয়ভিত্তিক সহিহ হাদিস বাংলা অনুবাদসহ — সহিহ বুখারি, সহিহ মুসলিম ও অন্যান্য কিতাব থেকে নির্বাচিত হাদিস পড়ুন ফ্রি।",
    keywords: "হাদিস বাংলা, সহিহ বুখারি, সহিহ মুসলিম, hadith bangla, sahih bukhari bangla",
  },
  "/ruqyah": {
    title: "রুকইয়াহ শরইয়াহ — বদনজর, জাদু ও জিনের চিকিৎসা | Ruqyah Bangla" + B,
    description:
      "কুরআন-সুন্নাহ ভিত্তিক রুকইয়াহ শরইয়াহ আয়াত, দোয়া ও নিয়ম — বদনজর, জাদু, জিন ও মানসিক সমস্যার শরয়ী চিকিৎসা গাইড বাংলায়।",
    keywords: "রুকইয়াহ, রুকিয়া শরইয়াহ, বদনজর, জাদু চিকিৎসা, ruqyah bangla",
  },
  "/weather": {
    title: "আজকের আবহাওয়ার খবর ও পূর্বাভাস — ঢাকা ও ৬৪ জেলা | Weather BD" + B,
    description:
      "লাইভ তাপমাত্রা, বৃষ্টি, ঝড় ও ঘূর্ণিঝড়ের সতর্কতা সহ বাংলাদেশের ৬৪ জেলার আজকের ও ৭ দিনের আবহাওয়ার পূর্বাভাস। Live Bangladesh weather forecast.",
    keywords:
      "আজকের আবহাওয়া, আবহাওয়ার খবর, ঢাকার আবহাওয়া, ঘূর্ণিঝড় সতর্কতা, weather bangladesh, dhaka weather today",
  },
  "/finance": {
    title: "ফাইন্যান্স ম্যানেজার — আয় ব্যয় হিসাব ও বাজেট | Finance Manager BD" + B,
    description:
      "দৈনিক আয়-ব্যয়, ধার-দেনা, বাজেট, ইনভেন্টরি ও ব্যবসার হিসাব রাখুন এক জায়গায় — ফ্রি বাংলা ফাইন্যান্স ম্যানেজার ও রিপোর্ট।",
    keywords:
      "আয় ব্যয় হিসাব, বাজেট অ্যাপ, ব্যবসার হিসাব, হিসাব রাখার সফটওয়্যার, expense tracker bangla, finance manager bd",
  },
  "/offers": {
    title: "মোবাইল অফার — GP, Robi, Banglalink, Airtel ইন্টারনেট প্যাক" + B,
    description:
      "গ্রামীণফোন, রবি, বাংলালিংক, এয়ারটেল ও টেলিটকের সেরা ইন্টারনেট, মিনিট ও বান্ডেল অফার এক জায়গায় — দাম ও মেয়াদসহ আপডেট।",
    keywords:
      "জিপি ইন্টারনেট অফার, রবি অফার, বাংলালিংক অফার, এমবি অফার, gp internet offer, robi mb offer",
  },
  "/livetv": {
    title: "লাইভ টিভি বাংলাদেশ — ২০০০+ চ্যানেল ফ্রি দেখুন | Live TV BD" + B,
    description:
      "বাংলা নিউজ, খেলা, বিনোদন ও ইসলামিক চ্যানেল সহ ২০০০+ লাইভ টিভি চ্যানেল মোবাইলে ফ্রি দেখুন — BDIX সাপোর্টেড।",
    keywords: "লাইভ টিভি, বাংলা টিভি চ্যানেল, খেলা লাইভ, live tv bangladesh, bdix live tv",
  },
  "/business-guide": {
    title: "ব্যবসার আইডিয়া ও গাইড — অল্প পুঁজিতে ব্যবসা | Business Guide BD" + B,
    description:
      "অল্প পুঁজিতে লাভজনক ব্যবসার আইডিয়া, পুঁজি-লাভের হিসাব, লাইসেন্স, সাপ্লায়ার ও মার্কেটিং কৌশল — বাংলাদেশের জন্য পূর্ণাঙ্গ ব্যবসা গাইড।",
    keywords:
      "ব্যবসার আইডিয়া, অল্প পুঁজিতে ব্যবসা, লাভজনক ব্যবসা, business idea bangla, small business bd",
  },
  "/health": {
    title: "স্বাস্থ্য গাইড — রোগ, লক্ষণ ও ঘরোয়া চিকিৎসা বাংলা | Health BD" + B,
    description:
      "সাধারণ রোগের লক্ষণ, প্রতিকার, খাদ্যতালিকা, ডায়াবেটিস ও প্রেশার নিয়ন্ত্রণসহ বাংলায় নির্ভরযোগ্য স্বাস্থ্য পরামর্শ ও ঘরোয়া চিকিৎসা।",
    keywords:
      "স্বাস্থ্য টিপস বাংলা, রোগের লক্ষণ, ঘরোয়া চিকিৎসা, ডায়াবেটিস, health tips bangla",
  },
  "/travel": {
    title: "ভ্রমণ গাইড বাংলাদেশ — দর্শনীয় স্থান, খরচ ও প্যাকেজ | Travel BD" + B,
    description:
      "কক্সবাজার, সাজেক, সুন্দরবন, বান্দরবানসহ বাংলাদেশের সেরা ভ্রমণ স্থানের গাইড — যাওয়ার উপায়, খরচ, হোটেল ও টিপস।",
    keywords: "ভ্রমণ গাইড, কক্সবাজার ট্যুর, সাজেক, ঘুরতে যাওয়ার জায়গা, travel guide bangladesh",
  },
  "/politics": {
    title: "রাজনীতির খবর — বাংলাদেশ ও বিশ্ব রাজনীতি আপডেট | Politics News" + B,
    description: "বাংলাদেশ ও আন্তর্জাতিক রাজনীতির সর্বশেষ খবর, নির্বাচন আপডেট ও বিশ্লেষণ বাংলায়।",
    keywords: "রাজনীতির খবর, নির্বাচন আপডেট, বাংলাদেশ রাজনীতি, politics news bangla",
  },
  "/war": {
    title: "যুদ্ধ ও সংঘাতের সর্বশেষ খবর | War Updates Bangla" + B,
    description: "বিশ্বজুড়ে চলমান যুদ্ধ, সংঘাত ও ভূরাজনৈতিক উত্তেজনার লাইভ আপডেট বাংলায়।",
    keywords: "যুদ্ধের খবর, আন্তর্জাতিক সংঘাত, war news bangla",
  },
  "/stocks": {
    title: "শেয়ার বাজার আপডেট — DSE, CSE ও স্বর্ণের দাম | Stock Market BD" + B,
    description:
      "ঢাকা ও চট্টগ্রাম স্টক এক্সচেঞ্জের সূচক, শেয়ারের দাম, ডলার রেট ও আজকের স্বর্ণের দাম এক পাতায়।",
    keywords: "শেয়ার বাজার, ডিএসই, স্বর্ণের দাম আজ, ডলার রেট, dse share price, gold price bd",
  },
  "/newspapers": {
    title: "সব বাংলা পত্রিকা এক জায়গায় | All Bangla Newspapers" + B,
    description:
      "প্রথম আলো, কালের কণ্ঠ, যুগান্তর, ইত্তেফাকসহ বাংলাদেশের সব জাতীয় ও আঞ্চলিক পত্রিকা এবং অনলাইন নিউজ পোর্টালের লিংক।",
    keywords: "বাংলা পত্রিকা, অনলাইন নিউজ, প্রথম আলো, bangla newspaper all",
  },
  "/free-internet": {
    title: "ফ্রি ইন্টারনেট পাওয়ার উপায় ২০২৬ | Free Internet BD" + B,
    description:
      "জিপি, রবি, বাংলালিংকে ফ্রি এমবি, ফ্রি ওয়াইফাই ও ডাটা বাঁচানোর বৈধ উপায় ও সর্বশেষ কোড — বাংলায় বিস্তারিত গাইড।",
    keywords: "ফ্রি ইন্টারনেট, ফ্রি এমবি, ফ্রি ওয়াইফাই, free internet bd, free mb offer",
  },
  "/marketplace": {
    title: "মার্কেটপ্লেস — কেনাবেচার বিজ্ঞাপন | Buy Sell Marketplace BD" + B,
    description: "পুরাতন ও নতুন পণ্য কেনাবেচার ফ্রি বিজ্ঞাপন — মোবাইল, গাড়ি, ইলেকট্রনিক্স ও আরও অনেক কিছু।",
    keywords: "কেনাবেচা, পুরাতন মোবাইল, ফ্রি বিজ্ঞাপন, buy sell bd, marketplace bangladesh",
  },
  "/rentals": {
    title: "ভাড়া — বাসা, দোকান ও যন্ত্রপাতি ভাড়া | Rentals Bangladesh" + B,
    description: "বাসা, ফ্ল্যাট, দোকান, অফিস ও যন্ত্রপাতি ভাড়ার তালিকা ও যোগাযোগ — এলাকা অনুযায়ী খুঁজুন।",
    keywords: "বাসা ভাড়া, ফ্ল্যাট ভাড়া, দোকান ভাড়া, house rent dhaka, to let",
  },
  "/portfolio": {
    title: "আমাদের কাজের পোর্টফোলিও | Portfolio — JohnNil",
    description: "সম্পন্ন করা ওয়েবসাইট, অ্যাপ, ডিজাইন ও আইটি প্রজেক্টের নমুনা ও কেস স্টাডি।",
    keywords: "পোর্টফোলিও, ওয়েব ডিজাইন নমুনা, portfolio johnnil",
  },
  "/blog": {
    title: "ব্লগ — টেক, ব্যবসা ও লাইফস্টাইল টিপস বাংলা" + B,
    description: "প্রযুক্তি, ব্যবসা, ইসলাম, স্বাস্থ্য ও লাইফস্টাইল নিয়ে নিয়মিত বাংলা আর্টিকেল ও গাইড।",
    keywords: "বাংলা ব্লগ, টেক টিপস, ব্যবসা টিপস, bangla blog",
  },
  "/about": {
    title: "আমাদের সম্পর্কে — John Nil | About JohnNil.com",
    description:
      "JohnNil.com — বাংলাদেশের অল-ইন-ওয়ান ডিজিটাল প্ল্যাটফর্ম। আমাদের লক্ষ্য, সেবা ও যোগাযোগের তথ্য।",
    keywords: "john nil, johnnil about, জন নীল",
  },
  "/appointment": {
    title: "অ্যাপয়েন্টমেন্ট বুকিং — সরাসরি পরামর্শ নিন" + B,
    description: "আইটি, ব্যবসা বা সার্ভিস নিয়ে পরামর্শের জন্য অনলাইনে সময় বুক করুন — দ্রুত কনফার্মেশন।",
    keywords: "অ্যাপয়েন্টমেন্ট বুকিং, consultation booking bd",
  },
  "/policies": {
    title: "নীতিমালা — প্রাইভেসি, রিটার্ন ও শর্তাবলী" + B,
    description: "প্রাইভেসি পলিসি, রিফান্ড ও রিটার্ন নীতি, ডেলিভারি নীতি এবং ব্যবহারের শর্তাবলী।",
    keywords: "privacy policy, return policy, terms bangla",
  },
  "/business-tools": {
    title: "ব্যবসার টুলস — ইনভয়েস, কুরিয়ার ও হিসাব | Business Tools BD" + B,
    description:
      "ইনভয়েস তৈরি, কুরিয়ার চার্জ হিসাব, প্রফিট ক্যালকুলেটর ও স্টক ম্যানেজমেন্টসহ ব্যবসার প্রয়োজনীয় ফ্রি টুলস।",
    keywords: "ইনভয়েস মেকার, কুরিয়ার চার্জ, ব্যবসার টুলস, business tools bangla",
  },
  "/ad-maker": {
    title: "AI বিজ্ঞাপন মেকার — পোস্টার ও প্রমোশনাল ভিডিও তৈরি" + B,
    description:
      "AI দিয়ে সেকেন্ডে ফেসবুক বিজ্ঞাপনের পোস্টার, ক্যাপশন ও প্রমোশনাল ভিডিও বানান — বাংলা ও ইংরেজি দুই ভাষায়।",
    keywords: "বিজ্ঞাপন তৈরি, ফেসবুক অ্যাড ডিজাইন, ai ad maker bangla",
  },
  "/thumbnail": {
    title: "থাম্বনেইল মেকার — YouTube থাম্বনেইল ডিজাইন ফ্রি" + B,
    description: "ইউটিউব ও ফেসবুক ভিডিওর জন্য আকর্ষণীয় থাম্বনেইল বানান অনলাইনে ফ্রি — বাংলা লেখা সাপোর্ট।",
    keywords: "থাম্বনেইল মেকার, youtube thumbnail maker bangla",
  },
  "/voice": {
    title: "ভয়েস এডিটর ও টেক্সট টু স্পিচ বাংলা" + B,
    description: "বাংলা ও ইংরেজি ভয়েস রেকর্ড, এডিট ও টেক্সট থেকে ভয়েস তৈরি করুন অনলাইনে।",
    keywords: "টেক্সট টু স্পিচ বাংলা, ভয়েস এডিটর, bangla text to speech",
  },
  "/converter": {
    title: "ফাইল কনভার্টার — PDF, ছবি ও ভিডিও কনভার্ট ফ্রি" + B,
    description: "PDF থেকে Word, ছবি রিসাইজ ও কমপ্রেস, ভিডিও-অডিও কনভার্টসহ সব ফরম্যাট কনভার্টার এক জায়গায়।",
    keywords: "pdf converter, ছবি কমপ্রেস, ফাইল কনভার্টার, image resize online",
  },
  "/downloader": {
    title: "ভিডিও ডাউনলোডার — YouTube, Facebook, TikTok" + B,
    description: "ইউটিউব, ফেসবুক, টিকটক ও ইনস্টাগ্রামের ভিডিও HD কোয়ালিটিতে ডাউনলোড করুন ফ্রি।",
    keywords: "ভিডিও ডাউনলোডার, facebook video download, youtube downloader bangla",
  },
  "/scheduler": {
    title: "মেসেজ ও পোস্ট শিডিউলার" + B,
    description: "ফেসবুক পোস্ট, SMS ও WhatsApp মেসেজ আগে থেকে শিডিউল করে রাখুন।",
    keywords: "post scheduler, message scheduler bangla",
  },
  "/land": {
    title: "জমি জরিপ ও পরিমাপ ক্যালকুলেটর — শতাংশ, কাঠা, বিঘা" + B,
    description:
      "শতাংশ, কাঠা, বিঘা, একর ও বর্গফুট রূপান্তর, জমির দাগ-খতিয়ান ও দলিল সংক্রান্ত তথ্যসহ জমি পরিমাপ গাইড।",
    keywords: "জমি পরিমাপ, শতাংশ কাঠা বিঘা, খতিয়ান, land calculator bangla",
  },
  "/height": {
    title: "উচ্চতা ও BMI ক্যালকুলেটর — ওজন অনুযায়ী আদর্শ উচ্চতা" + B,
    description: "ফুট-ইঞ্চি থেকে সেন্টিমিটার, আদর্শ ওজন ও BMI হিসাব করুন সহজে।",
    keywords: "bmi ক্যালকুলেটর, উচ্চতা ওজন চার্ট, height converter",
  },
  "/solar": {
    title: "সোলার প্যানেল ক্যালকুলেটর ও খরচ হিসাব বাংলাদেশ" + B,
    description: "কত ওয়াট সোলার প্যানেল, ব্যাটারি ও ইনভার্টার লাগবে এবং মোট খরচ কত — হিসাব করুন এখনই।",
    keywords: "সোলার প্যানেল দাম, solar calculator bd, সোলার খরচ",
  },
  "/tax": {
    title: "ইনকাম ট্যাক্স ক্যালকুলেটর বাংলাদেশ ২০২৬ | Income Tax BD" + B,
    description:
      "সর্বশেষ কর হার অনুযায়ী আয়কর হিসাব করুন — বেতনভোগী, ব্যবসায়ী ও মহিলা করদাতার জন্য রিটার্ন গাইডসহ।",
    keywords: "ইনকাম ট্যাক্স ক্যালকুলেটর, আয়কর রিটার্ন, income tax calculator bangladesh",
  },
  "/warish": {
    title: "ওয়ারিশ সম্পত্তি বণ্টন ক্যালকুলেটর — ইসলামী উত্তরাধিকার আইন" + B,
    description:
      "কুরআন ও মুসলিম উত্তরাধিকার আইন অনুযায়ী ওয়ারিশদের মধ্যে সম্পত্তির অংশ হিসাব করুন — সহজ বাংলা ক্যালকুলেটর।",
    keywords: "ওয়ারিশ হিসাব, সম্পত্তি বণ্টন, উত্তরাধিকার আইন, warish calculator bangla",
  },
  "/profit-loss": {
    title: "লাভ-ক্ষতি ক্যালকুলেটর — ব্যবসার প্রফিট হিসাব" + B,
    description: "ক্রয়মূল্য, বিক্রয়মূল্য ও খরচ দিয়ে লাভ-ক্ষতি ও মার্জিন হিসাব করুন সেকেন্ডে।",
    keywords: "লাভ ক্ষতি হিসাব, profit calculator bangla",
  },
  "/gadget": {
    title: "গ্যাজেট অ্যাডভাইজার — বাজেটে সেরা মোবাইল ও ল্যাপটপ" + B,
    description: "আপনার বাজেট অনুযায়ী সেরা মোবাইল, ল্যাপটপ ও গ্যাজেট সাজেশন — দাম ও ফিচার তুলনাসহ।",
    keywords: "মোবাইল দাম বাংলাদেশ, ল্যাপটপ সাজেশন, best phone under budget bd",
  },
  "/movies": {
    title: "মুভি ও ওয়েব সিরিজ আপডেট | Movies Update BD" + B,
    description: "নতুন বাংলা, হিন্দি ও ইংরেজি মুভি, ওয়েব সিরিজের রিলিজ, রিভিউ ও রেটিং আপডেট।",
    keywords: "নতুন মুভি, ওয়েব সিরিজ, movie update bangla",
  },
  "/railway": {
    title: "ট্রেনের সময়সূচি ও টিকিট — বাংলাদেশ রেলওয়ে | Train Schedule BD" + B,
    description:
      "সব আন্তঃনগর ট্রেনের সময়সূচি, ভাড়া, সিট খালি আছে কিনা ও লাইভ ট্রেন ট্র্যাকিং — বাংলাদেশ রেলওয়ে।",
    keywords:
      "ট্রেনের সময়সূচি, ট্রেন টিকিট, বাংলাদেশ রেলওয়ে, train schedule bangladesh, train ticket bd",
  },
  "/phone-lookup": {
    title: "ফোন নম্বর চেক — অপারেটর ও তথ্য লুকআপ" + B,
    description: "মোবাইল নম্বরের অপারেটর, এলাকা ও প্রয়োজনীয় তথ্য চেক করুন সহজে।",
    keywords: "নম্বর চেক, অপারেটর চেক, phone number lookup bd",
  },
  "/phone-root-unlock": {
    title: "ফোন রুট ও আনলক গাইড | Phone Root Unlock BD" + B,
    description: "অ্যান্ড্রয়েড ফোন রুট, FRP আনলক ও প্যাটার্ন লক খোলার নিরাপদ গাইড ও সার্ভিস।",
    keywords: "ফোন রুট, frp unlock, প্যাটার্ন লক খোলা, phone unlock bd",
  },
  "/capcut-pro": {
    title: "CapCut Pro — ফিচার, দাম ও ব্যবহারের গাইড" + B,
    description: "CapCut Pro এর ফিচার, দাম, সাবস্ক্রিপশন ও ভিডিও এডিটিং টিপস বাংলায়।",
    keywords: "capcut pro, ভিডিও এডিটিং, capcut bangla",
  },
  "/mini-projector": {
    title: "মিনি প্রজেক্টর দাম ও রিভিউ বাংলাদেশ | Mini Projector BD" + B,
    description: "বাংলাদেশে মিনি প্রজেক্টরের দাম, ফিচার তুলনা, রিভিউ ও কেনার গাইড।",
    keywords: "মিনি প্রজেক্টর দাম, projector price bangladesh",
  },
  "/chat": {
    title: "লাইভ চ্যাট সাপোর্ট — সরাসরি কথা বলুন" + B,
    description: "যেকোনো সার্ভিস, অর্ডার বা পরামর্শের জন্য আমাদের সাথে সরাসরি লাইভ চ্যাট করুন।",
    keywords: "লাইভ চ্যাট, customer support bd",
  },
};

export function getRouteMeta(pathname: string): RouteMeta | null {
  const clean = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  return ROUTE_SEO[clean] || null;
}
