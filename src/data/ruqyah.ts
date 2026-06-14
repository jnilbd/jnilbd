// Ruqyah Shar'iyyah — Qur'anic & prophetic remedies
// Audio sourced from cdn.islamic.network (open Islamic CDN, 128kbps mp3)
// Reciter ID matches alquran.cloud identifiers (ar.alafasy = Mishary Alafasy)

export type RuqyahCategory =
  | "সব"
  | "কালো জাদু / সিহর"
  | "বদনজর / চোখ লাগা"
  | "জ্বিন / শয়তানি ওয়াসওয়াসা"
  | "অসুস্থতা ও রোগ"
  | "দুঃস্বপ্ন / ঘুমের সমস্যা"
  | "মানসিক চাপ ও দুশ্চিন্তা"
  | "সাধারণ সুরক্ষা";

export type RuqyahItem = {
  id: string;
  surahNo: number;     // for full surah audio
  surahName: string;
  bnName: string;
  ayahFrom?: number;   // global ayah number range (optional, only when specific verses)
  ayahTo?: number;
  categories: RuqyahCategory[];
  use: string;         // when/how to recite (Bangla)
  benefit: string;     // benefits/description (Bangla)
  howOften: string;    // recommended count (Bangla)
  reference: string;   // hadith/source reference
};

// Build CDN audio URL for full surah recitation
export const surahAudio = (surahNo: number, reciter = "ar.alafasy") =>
  `https://cdn.islamic.network/quran/audio-surah/128/${reciter}/${surahNo}.mp3`;

// Reciter options
export const RUQYAH_RECITERS = [
  { id: "ar.alafasy", name: "Mishary Alafasy" },
  { id: "ar.husary", name: "Mahmoud Al-Husary" },
  { id: "ar.minshawi", name: "Muhammad Minshawi" },
  { id: "ar.abdulbasitmurattal", name: "Abdul Basit (Murattal)" },
  { id: "ar.hudhaify", name: "Ali Al-Hudhaify" },
  { id: "ar.muhammadayyoub", name: "Muhammad Ayyoub" },
];

export const RUQYAH_CATEGORIES: RuqyahCategory[] = [
  "সব",
  "কালো জাদু / সিহর",
  "বদনজর / চোখ লাগা",
  "জ্বিন / শয়তানি ওয়াসওয়াসা",
  "অসুস্থতা ও রোগ",
  "দুঃস্বপ্ন / ঘুমের সমস্যা",
  "মানসিক চাপ ও দুশ্চিন্তা",
  "সাধারণ সুরক্ষা",
];

export const RUQYAH_ITEMS: RuqyahItem[] = [
  {
    id: "fatihah",
    surahNo: 1,
    surahName: "Al-Fatihah",
    bnName: "সূরা ফাতিহা",
    categories: ["অসুস্থতা ও রোগ", "সাধারণ সুরক্ষা"],
    use: "অসুস্থ ব্যক্তির গায়ে হাত রেখে অথবা পানিতে ফুঁ দিয়ে পান করানো যায়।",
    benefit: "নবী ﷺ এটিকে 'প্রত্যেক রোগের শিফা' বলেছেন। সাহাবীগণ এক বিচ্ছু-দংশিত ব্যক্তিকে শুধু এই সূরা পড়েই সম্পূর্ণ সুস্থ করে দিয়েছিলেন।",
    howOften: "৭ বার",
    reference: "সহিহ বুখারী ২২৭৬",
  },
  {
    id: "baqarah-255",
    surahNo: 2,
    surahName: "Ayatul Kursi (2:255)",
    bnName: "আয়াতুল কুরসি",
    ayahFrom: 262, ayahTo: 262,
    categories: ["জ্বিন / শয়তানি ওয়াসওয়াসা", "দুঃস্বপ্ন / ঘুমের সমস্যা", "সাধারণ সুরক্ষা"],
    use: "ঘুমানোর আগে, বাসায় ঢুকে, বের হওয়ার আগে এবং প্রতি ফরজ নামাজের পর পড়ুন।",
    benefit: "যে রাতে ঘুমানোর আগে আয়াতুল কুরসি পড়ে, আল্লাহর পক্ষ থেকে একজন পাহারাদার সারা রাত তার রক্ষা করে এবং শয়তান কাছে আসতে পারে না।",
    howOften: "১–৩ বার",
    reference: "সহিহ বুখারী ২৩১১",
  },
  {
    id: "baqarah-last-2",
    surahNo: 2,
    surahName: "Al-Baqarah last 2 verses (285-286)",
    bnName: "সূরা বাকারার শেষ দুই আয়াত",
    categories: ["সাধারণ সুরক্ষা", "জ্বিন / শয়তানি ওয়াসওয়াসা"],
    use: "প্রতিদিন রাতে ঘুমানোর আগে পড়ুন।",
    benefit: "যে রাতে এই দুটি আয়াত পড়ে, তার জন্য তা যথেষ্ট হয়ে যায় — সকল বিপদ থেকে রক্ষা করে।",
    howOften: "১ বার",
    reference: "সহিহ বুখারী ৫০০৯",
  },
  {
    id: "baqarah-full",
    surahNo: 2,
    surahName: "Surah Al-Baqarah (full)",
    bnName: "সূরা বাকারা (পূর্ণাঙ্গ)",
    categories: ["কালো জাদু / সিহর", "জ্বিন / শয়তানি ওয়াসওয়াসা", "সাধারণ সুরক্ষা"],
    use: "ঘরে নিয়মিত (অন্তত সপ্তাহে একবার) তিলাওয়াত বা শোনার ব্যবস্থা করুন। জাদু-আক্রান্ত হলে টানা ৭ দিন শুনুন।",
    benefit: "যে ঘরে সূরা বাকারা পড়া হয়, সেই ঘরে শয়তান ৩ দিন প্রবেশ করতে পারে না। জাদু কাটাতে এটি সর্বশ্রেষ্ঠ সূরা।",
    howOften: "ঘরে দৈনিক শোনা উত্তম",
    reference: "সহিহ মুসলিম ৭৮০",
  },
  {
    id: "ikhlas",
    surahNo: 112,
    surahName: "Al-Ikhlas",
    bnName: "সূরা ইখলাস",
    categories: ["সাধারণ সুরক্ষা", "অসুস্থতা ও রোগ"],
    use: "সকাল-সন্ধ্যা এবং ঘুমানোর আগে ৩ বার পড়ে শরীরে ফুঁ দিন।",
    benefit: "এটি কুরআনের এক-তৃতীয়াংশের সমান। ফালাক ও নাস-এর সাথে পড়লে সব ক্ষতি থেকে রক্ষা করে।",
    howOften: "৩ বার",
    reference: "সহিহ বুখারী ৫০১৭",
  },
  {
    id: "falaq",
    surahNo: 113,
    surahName: "Al-Falaq",
    bnName: "সূরা ফালাক",
    categories: ["কালো জাদু / সিহর", "বদনজর / চোখ লাগা", "জ্বিন / শয়তানি ওয়াসওয়াসা", "সাধারণ সুরক্ষা"],
    use: "ইখলাস ও নাস-এর সাথে সকাল-সন্ধ্যায় ৩ বার ও ঘুমের আগে পড়ুন।",
    benefit: "এই সূরা বিশেষভাবে জাদু, হিংসুকের হিংসা ও রাতের অন্ধকারের অনিষ্ট থেকে রক্ষা করার জন্য নাজিল হয়েছে। নবী ﷺ-কে জাদু করার পর জিবরাঈল (আ.) এই সূরা পড়েই সেই জাদু কাটান।",
    howOften: "৩ বার",
    reference: "সহিহ বুখারী ৫০৭৩",
  },
  {
    id: "nas",
    surahNo: 114,
    surahName: "An-Nas",
    bnName: "সূরা নাস",
    categories: ["জ্বিন / শয়তানি ওয়াসওয়াসা", "মানসিক চাপ ও দুশ্চিন্তা", "সাধারণ সুরক্ষা"],
    use: "ফালাক-এর সাথে সকাল-সন্ধ্যা ৩ বার এবং ঘুমের আগে পড়ুন।",
    benefit: "মনের কুমন্ত্রণা, ওয়াসওয়াসা, জ্বিন ও মানুষের অনিষ্ট থেকে রক্ষা করে। দুশ্চিন্তা ও বিষণ্ণতা দূর করে।",
    howOften: "৩ বার",
    reference: "সহিহ বুখারী ৫০১৭",
  },
  {
    id: "kafirun",
    surahNo: 109,
    surahName: "Al-Kafirun",
    bnName: "সূরা কাফিরুন",
    categories: ["সাধারণ সুরক্ষা", "দুঃস্বপ্ন / ঘুমের সমস্যা"],
    use: "ঘুমানোর আগে পড়ুন।",
    benefit: "নবী ﷺ বলেন, এই সূরা শিরক থেকে মুক্তি দেয়। ঘুমের আগে পড়লে শান্তির ঘুম হয়।",
    howOften: "১ বার",
    reference: "তিরমিজি ৩৪০৩",
  },
  {
    id: "yaseen",
    surahNo: 36,
    surahName: "Ya-Seen",
    bnName: "সূরা ইয়াসিন",
    categories: ["অসুস্থতা ও রোগ", "মানসিক চাপ ও দুশ্চিন্তা"],
    use: "ভোরে বা রোগীর পাশে পড়ুন/শোনান।",
    benefit: "এটিকে কুরআনের 'হৃদয়' বলা হয়। যে ভোরে এটি পড়ে, তার সারাদিনের প্রয়োজন পূর্ণ হয়।",
    howOften: "১ বার",
    reference: "দারিমি ৩৪১৭",
  },
  {
    id: "mulk",
    surahNo: 67,
    surahName: "Al-Mulk",
    bnName: "সূরা মুলক",
    categories: ["সাধারণ সুরক্ষা", "দুঃস্বপ্ন / ঘুমের সমস্যা"],
    use: "প্রতি রাতে ঘুমানোর আগে পড়ুন।",
    benefit: "এই সূরা কবরের আযাব থেকে রক্ষা করে এবং পাঠকারীর জন্য সুপারিশ করবে যতক্ষণ না তাকে ক্ষমা করা হয়।",
    howOften: "১ বার",
    reference: "তিরমিজি ২৮৯১",
  },
  {
    id: "rahman",
    surahNo: 55,
    surahName: "Ar-Rahman",
    bnName: "সূরা রাহমান",
    categories: ["অসুস্থতা ও রোগ", "মানসিক চাপ ও দুশ্চিন্তা"],
    use: "অসুস্থতা বা মানসিক কষ্টে নিয়মিত শুনুন।",
    benefit: "মন ও দেহের শান্তি আনে, রহমত নাজিল হয়, রিজিকে বরকত আসে।",
    howOften: "দৈনিক ১ বার",
    reference: "ইবনু কাসির",
  },
  {
    id: "waqiah",
    surahNo: 56,
    surahName: "Al-Waqi'ah",
    bnName: "সূরা ওয়াকিয়া",
    categories: ["মানসিক চাপ ও দুশ্চিন্তা", "সাধারণ সুরক্ষা"],
    use: "প্রতি রাতে পড়ুন।",
    benefit: "যে প্রতি রাতে এই সূরা পড়ে, তার উপর কখনো দারিদ্র্য আসবে না।",
    howOften: "১ বার",
    reference: "বায়হাকি",
  },
  {
    id: "kahf",
    surahNo: 18,
    surahName: "Al-Kahf",
    bnName: "সূরা কাহাফ",
    categories: ["জ্বিন / শয়তানি ওয়াসওয়াসা", "সাধারণ সুরক্ষা"],
    use: "প্রতি শুক্রবার পড়ুন বা শুনুন।",
    benefit: "দাজ্জালের ফিতনা ও জাদু থেকে রক্ষা করে। দুই জুমার মধ্যবর্তী সময়ের গুনাহ ক্ষমা হয়।",
    howOften: "সপ্তাহে ১ বার",
    reference: "সহিহ মুসলিম ৮০৯",
  },
  {
    id: "jinn",
    surahNo: 72,
    surahName: "Al-Jinn",
    bnName: "সূরা জ্বিন",
    categories: ["জ্বিন / শয়তানি ওয়াসওয়াসা", "কালো জাদু / সিহর"],
    use: "জ্বিন-আক্রান্ত ব্যক্তির ওপর পড়ুন বা শোনান।",
    benefit: "জ্বিনের দখল, ভর ও শয়তানি প্রভাব দূর করতে অত্যন্ত কার্যকর।",
    howOften: "৩–৭ বার",
    reference: "তাফসিরে কুরতুবি",
  },
  {
    id: "saffat",
    surahNo: 37,
    surahName: "As-Saffat (1-10)",
    bnName: "সূরা সাফফাত (১-১০)",
    categories: ["জ্বিন / শয়তানি ওয়াসওয়াসা", "কালো জাদু / সিহর"],
    use: "শয়তান বা জ্বিন আক্রান্ত হলে পড়ুন।",
    benefit: "শয়তানদের তাড়িয়ে দেয় ও শয়তানি প্রভাব দূর করে।",
    howOften: "৭ বার",
    reference: "তাফসিরে ইবনু কাসির",
  },
  {
    id: "duhan",
    surahNo: 44,
    surahName: "Ad-Dukhan (1-8)",
    bnName: "সূরা দুখান (১-৮)",
    categories: ["কালো জাদু / সিহর", "অসুস্থতা ও রোগ"],
    use: "জাদু বা দীর্ঘ অসুস্থতায় তিলাওয়াত করুন/শোনান।",
    benefit: "সিহর (কালো জাদু) ভেঙে দিতে অত্যন্ত শক্তিশালী আয়াত।",
    howOften: "৭ বার",
    reference: "আলিমদের অভিজ্ঞতা",
  },
];
