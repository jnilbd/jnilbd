// Mock data — 10+ realistic items per category

export interface SubProduct {
  id: string;
  name: string;
  nameBn: string;
  price: number;
  image?: string;
  badge?: string;
  badgeBn?: string;
}

export interface Product {
  id: string;
  name: string;
  nameBn: string;
  description: string;
  descriptionBn: string;
  price: number;
  image: string;
  category: "digital" | "physical";
  categoryName: string;
  categoryNameBn: string;
  featured?: boolean;
  rating?: number;
  subProducts?: SubProduct[];
}

export interface Service {
  id: string;
  name: string;
  nameBn: string;
  description: string;
  descriptionBn: string;
  price: number;
  image: string;
  category: string;
  features: string[];
  featuresBn: string[];
}

export interface BlogPost {
  id: string;
  title: string;
  titleBn: string;
  excerpt: string;
  excerptBn: string;
  content: string[];
  contentBn: string[];
  image: string;
  date: string;
  category: string;
  readTime: string;
  author: string;
}

export interface Review {
  id: string;
  name: string;
  text: string;
  textBn: string;
  rating: number;
  source: "facebook" | "instagram" | "whatsapp" | "website";
  avatar: string;
}

const u = (id: string, w = 800) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&q=80&auto=format&fit=crop`;
const avatar = (seed: number) => `https://i.pravatar.cc/150?img=${seed}`;

export const products: Product[] = [
  {
    id: "p1", name: "Premium UI Kit", nameBn: "প্রিমিয়াম UI কিট",
    description: "Modern, fully customizable UI kit with 200+ components",
    descriptionBn: "২০০+ কম্পোনেন্ট সহ কাস্টমাইজেবল মডার্ন UI কিট",
    price: 1500, image: u("1559028012-481c04fa702d"),
    category: "digital", categoryName: "Digital", categoryNameBn: "ডিজিটাল", featured: true, rating: 4.9,
    subProducts: [
      { id: "p1-a", name: "Starter (50 components)", nameBn: "স্টার্টার (৫০ কম্পোনেন্ট)", price: 800, badge: "Basic", badgeBn: "বেসিক", image: u("1581291518857-4e27b48ff24e", 500) },
      { id: "p1-b", name: "Pro (200 components)", nameBn: "প্রো (২০০ কম্পোনেন্ট)", price: 1500, badge: "Popular", badgeBn: "জনপ্রিয়", image: u("1545235617-9465d2a55698", 500) },
      { id: "p1-c", name: "Team License (5 users)", nameBn: "টিম লাইসেন্স (৫ ইউজার)", price: 3200, badge: "Best Value", badgeBn: "সেরা মূল্য", image: u("1522202176988-66273c2fd55f", 500) },
    ],
  },
  {
    id: "p2", name: "E-Book: Digital Marketing 2025", nameBn: "ই-বুক: ডিজিটাল মার্কেটিং ২০২৫",
    description: "Complete guide to mastering digital marketing in 2025",
    descriptionBn: "২০২৫ সালের ডিজিটাল মার্কেটিং মাস্টার করার সম্পূর্ণ গাইড",
    price: 800, image: u("1544716278-ca5e3f4abd8c"),
    category: "digital", categoryName: "Digital", categoryNameBn: "ডিজিটাল", featured: true, rating: 4.8,
    subProducts: [
      { id: "p2-a", name: "PDF Only", nameBn: "শুধু PDF", price: 800, image: u("1456513080510-7bf3a84b82f8", 500) },
      { id: "p2-b", name: "PDF + Audio Book", nameBn: "PDF + অডিও বুক", price: 1400, badge: "Popular", badgeBn: "জনপ্রিয়", image: u("1505740420928-5e560c06d30e", 500) },
      { id: "p2-c", name: "Bundle + Templates", nameBn: "বান্ডেল + টেমপ্লেট", price: 2200, badge: "Best Value", badgeBn: "সেরা মূল্য", image: u("1460925895917-afdab827c52f", 500) },
    ],
  },
  {
    id: "p3", name: "Branded T-Shirt", nameBn: "ব্র্যান্ডেড টি-শার্ট",
    description: "Premium cotton t-shirt with exclusive design",
    descriptionBn: "এক্সক্লুসিভ ডিজাইনের প্রিমিয়াম কটন টি-শার্ট",
    price: 600, image: u("1521572163474-6864f9cf17ab"),
    category: "physical", categoryName: "Physical", categoryNameBn: "ফিজিক্যাল", featured: true, rating: 4.7,
    subProducts: [
      { id: "p3-s", name: "Size S - White", nameBn: "সাইজ S - সাদা", price: 600, image: u("1581655353564-df123a1eb820", 500) },
      { id: "p3-m", name: "Size M - Black", nameBn: "সাইজ M - কালো", price: 600, image: u("1503341504253-dff4815485f1", 500) },
      { id: "p3-l", name: "Size L - Navy", nameBn: "সাইজ L - নেভি", price: 650, image: u("1622445275576-721325763afe", 500) },
      { id: "p3-xl", name: "Size XL - Grey", nameBn: "সাইজ XL - ধূসর", price: 700, image: u("1583743814966-8936f5b7be1a", 500) },
    ],
  },
  {
    id: "p4", name: "Online Course Bundle", nameBn: "অনলাইন কোর্স বান্ডেল",
    description: "10 premium courses bundled at one price",
    descriptionBn: "১০টি প্রিমিয়াম কোর্স একটি দামে",
    price: 3500, image: u("1503676260728-1c00da094a0b"),
    category: "digital", categoryName: "Digital", categoryNameBn: "ডিজিটাল", featured: true, rating: 5.0,
    subProducts: [
      { id: "p4-a", name: "3 Courses", nameBn: "৩টি কোর্স", price: 1500, image: u("1516321318423-f06f85e504b3", 500) },
      { id: "p4-b", name: "10 Courses Bundle", nameBn: "১০টি কোর্স বান্ডেল", price: 3500, badge: "Popular", badgeBn: "জনপ্রিয়", image: u("1513258496099-48168024aec0", 500) },
      { id: "p4-c", name: "Lifetime Access (All)", nameBn: "লাইফটাইম অ্যাক্সেস", price: 6500, badge: "Best Value", badgeBn: "সেরা মূল্য", image: u("1524178232363-1fb2b075b655", 500) },
    ],
  },
  {
    id: "p5", name: "Notion Templates Pack", nameBn: "নোশন টেমপ্লেট প্যাক",
    description: "50+ productivity Notion templates",
    descriptionBn: "৫০+ প্রোডাক্টিভিটি নোশন টেমপ্লেট",
    price: 1200, image: u("1517842645767-c639042777db"),
    category: "digital", categoryName: "Digital", categoryNameBn: "ডিজিটাল", rating: 4.6,
  },
  {
    id: "p6", name: "Custom Mug", nameBn: "কাস্টম মগ",
    description: "Personalized ceramic mug with your design",
    descriptionBn: "আপনার ডিজাইনের কাস্টম সিরামিক মগ",
    price: 350, image: u("1514228742587-6b1558fcca3d"),
    category: "physical", categoryName: "Physical", categoryNameBn: "ফিজিক্যাল", rating: 4.5,
  },
  {
    id: "p7", name: "Logo Design Templates", nameBn: "লোগো ডিজাইন টেমপ্লেট",
    description: "100 premium logo templates with source files",
    descriptionBn: "সোর্স ফাইল সহ ১০০টি প্রিমিয়াম লোগো টেমপ্লেট",
    price: 2000, image: u("1626785774573-4b799315345d"),
    category: "digital", categoryName: "Digital", categoryNameBn: "ডিজিটাল", rating: 4.8,
  },
  {
    id: "p8", name: "Premium Hoodie", nameBn: "প্রিমিয়াম হুডি",
    description: "Comfortable cotton blend hoodie with embroidered logo",
    descriptionBn: "এমব্রয়ডারি লোগো সহ আরামদায়ক কটন ব্লেন্ড হুডি",
    price: 1500, image: u("1556821840-3a63f95609a7"),
    category: "physical", categoryName: "Physical", categoryNameBn: "ফিজিক্যাল", rating: 4.9,
  },
  {
    id: "p9", name: "Social Media Graphics Pack", nameBn: "সোশ্যাল মিডিয়া গ্রাফিক্স প্যাক",
    description: "300+ ready-to-edit Canva templates for Facebook, Instagram & TikTok",
    descriptionBn: "ফেসবুক, ইনস্টাগ্রাম ও টিকটকের জন্য ৩০০+ এডিটেবল ক্যানভা টেমপ্লেট",
    price: 1100, image: u("1611162617213-7d7a39e9b1d7"),
    category: "digital", categoryName: "Digital", categoryNameBn: "ডিজিটাল", rating: 4.7, featured: true,
  },
  {
    id: "p10", name: "Lightroom Presets — Cinematic", nameBn: "লাইটরুম প্রিসেট — সিনেম্যাটিক",
    description: "40 professional Lightroom presets for mobile & desktop",
    descriptionBn: "মোবাইল ও ডেস্কটপের জন্য ৪০টি প্রফেশনাল লাইটরুম প্রিসেট",
    price: 700, image: u("1542038784456-1ea8e935640e"),
    category: "digital", categoryName: "Digital", categoryNameBn: "ডিজিটাল", rating: 4.8,
  },
  {
    id: "p11", name: "Custom Phone Case", nameBn: "কাস্টম ফোন কেস",
    description: "Tough polycarbonate case printed with your photo or design",
    descriptionBn: "আপনার ছবি/ডিজাইনে প্রিন্টেড টেকসই পলিকার্বনেট ফোন কেস",
    price: 450, image: u("1601593346740-925612772716"),
    category: "physical", categoryName: "Physical", categoryNameBn: "ফিজিক্যাল", rating: 4.6,
  },
  {
    id: "p12", name: "Wireless Earbuds Pro", nameBn: "ওয়্যারলেস ইয়ারবাড প্রো",
    description: "Bluetooth 5.3 earbuds with active noise cancellation & 30hr battery",
    descriptionBn: "অ্যাক্টিভ নয়েজ ক্যান্সেলেশন ও ৩০ ঘণ্টা ব্যাটারির ব্লুটুথ ৫.৩ ইয়ারবাড",
    price: 2200, image: u("1606220588913-b3aacb4d2f46"),
    category: "physical", categoryName: "Physical", categoryNameBn: "ফিজিক্যাল", rating: 4.7,
  },
];

export const services: Service[] = [
  { id: "s1", name: "Website Development", nameBn: "ওয়েবসাইট ডেভেলপমেন্ট", description: "Modern responsive website with full features", descriptionBn: "সম্পূর্ণ ফিচার সহ মডার্ন রেস্পন্সিভ ওয়েবসাইট", price: 25000, image: u("1547658719-da2b51169166"), category: "Development", features: ["Custom design", "Mobile responsive", "SEO optimized", "Fast delivery"], featuresBn: ["কাস্টম ডিজাইন", "মোবাইল রেস্পন্সিভ", "SEO অপটিমাইজড", "দ্রুত ডেলিভারি"] },
  { id: "s2", name: "Logo & Branding", nameBn: "লোগো ও ব্র্যান্ডিং", description: "Professional logo design and brand identity", descriptionBn: "প্রফেশনাল লোগো ডিজাইন ও ব্র্যান্ড আইডেন্টিটি", price: 5000, image: u("1611532736597-de2d4265fba3"), category: "Design", features: ["3 logo concepts", "Unlimited revisions", "All file formats", "Brand guidelines"], featuresBn: ["৩টি লোগো কনসেপ্ট", "আনলিমিটেড রিভিশন", "সব ফাইল ফরম্যাট", "ব্র্যান্ড গাইডলাইন"] },
  { id: "s3", name: "Digital Marketing", nameBn: "ডিজিটাল মার্কেটিং", description: "Complete social media marketing campaign", descriptionBn: "সম্পূর্ণ সোশ্যাল মিডিয়া মার্কেটিং ক্যাম্পেইন", price: 15000, image: u("1611926653458-09294b3142bf"), category: "Marketing", features: ["FB & IG ads", "Content creation", "Analytics report", "30 days support"], featuresBn: ["FB ও IG অ্যাড", "কন্টেন্ট তৈরি", "অ্যানালিটিক্স রিপোর্ট", "৩০ দিন সাপোর্ট"] },
  { id: "s4", name: "Custom Information Request", nameBn: "কাস্টম ইনফরমেশন রিকোয়েস্ট", description: "Get any specific information you need", descriptionBn: "যেকোনো নির্দিষ্ট তথ্য পেয়ে যান", price: 500, image: u("1450101499163-c8848c66ca85"), category: "Consulting", features: ["Detailed research", "Verified sources", "PDF report", "Quick turnaround"], featuresBn: ["বিস্তারিত গবেষণা", "যাচাইকৃত সূত্র", "PDF রিপোর্ট", "দ্রুত সরবরাহ"] },
  { id: "s5", name: "1-on-1 Consultation", nameBn: "১-অন-১ কনসালটেশন", description: "60-minute personal consultation session", descriptionBn: "৬০ মিনিটের ব্যক্তিগত পরামর্শ সেশন", price: 2000, image: u("1587825140708-dfaf72ae4b04"), category: "Consulting", features: ["Video call", "Action plan", "Follow-up email", "Resources"], featuresBn: ["ভিডিও কল", "অ্যাকশন প্ল্যান", "ফলো-আপ ইমেইল", "রিসোর্স"] },
  { id: "s6", name: "Content Writing", nameBn: "কন্টেন্ট রাইটিং", description: "SEO-optimized blog posts and articles", descriptionBn: "SEO অপটিমাইজড ব্লগ পোস্ট ও আর্টিকেল", price: 1500, image: u("1455390582262-044cdead277a"), category: "Content", features: ["1000+ words", "Plagiarism free", "Keyword research", "2 revisions"], featuresBn: ["১০০০+ শব্দ", "প্ল্যাজিয়ারিজম মুক্ত", "কীওয়ার্ড রিসার্চ", "২টি রিভিশন"] },
  { id: "s7", name: "Mobile App Development", nameBn: "মোবাইল অ্যাপ ডেভেলপমেন্ট", description: "Cross-platform mobile app for iOS & Android using React Native", descriptionBn: "React Native দিয়ে iOS ও Android-এর জন্য ক্রস-প্ল্যাটফর্ম মোবাইল অ্যাপ", price: 60000, image: u("1512941937669-90a1b58e7e9c"), category: "Development", features: ["iOS + Android build", "Push notifications", "Backend integration", "Play Store / App Store submission"], featuresBn: ["iOS + Android বিল্ড", "পুশ নোটিফিকেশন", "ব্যাকএন্ড ইন্টিগ্রেশন", "প্লে স্টোর / অ্যাপ স্টোর সাবমিশন"] },
  { id: "s8", name: "SEO Optimization", nameBn: "SEO অপটিমাইজেশন", description: "On-page + technical SEO audit and 3-month optimization plan", descriptionBn: "অন-পেজ + টেকনিক্যাল SEO অডিট এবং ৩ মাসের অপটিমাইজেশন প্ল্যান", price: 8000, image: u("1432888622747-4eb9a8efeb07"), category: "Marketing", features: ["Keyword research", "On-page SEO", "Backlink strategy", "Monthly ranking report"], featuresBn: ["কীওয়ার্ড রিসার্চ", "অন-পেজ SEO", "ব্যাকলিংক স্ট্র্যাটেজি", "মাসিক র‌্যাংকিং রিপোর্ট"] },
  { id: "s9", name: "Video Editing", nameBn: "ভিডিও এডিটিং", description: "Professional editing for YouTube, reels & ads — color grade, sound, motion graphics", descriptionBn: "ইউটিউব, রিলস ও অ্যাডের জন্য প্রফেশনাল এডিটিং — কালার গ্রেড, সাউন্ড, মোশন গ্রাফিক্স", price: 3000, image: u("1574717024653-61fd2cf4d44d"), category: "Content", features: ["Up to 10 min final video", "Color grading", "Sound design", "2 revisions"], featuresBn: ["সর্বোচ্চ ১০ মিনিটের ভিডিও", "কালার গ্রেডিং", "সাউন্ড ডিজাইন", "২টি রিভিশন"] },
  { id: "s10", name: "Facebook Ads Management", nameBn: "ফেসবুক অ্যাডস ম্যানেজমেন্ট", description: "Full-funnel Meta ads setup, audience research & monthly management", descriptionBn: "ফুল-ফানেল মেটা অ্যাড সেটআপ, অডিয়েন্স রিসার্চ ও মাসিক ম্যানেজমেন্ট", price: 7000, image: u("1556761175-5973dc0f32e7"), category: "Marketing", features: ["Pixel + Conversion API setup", "3 ad creatives", "A/B testing", "Weekly report"], featuresBn: ["পিক্সেল + কনভার্সন API সেটআপ", "৩টি অ্যাড ক্রিয়েটিভ", "A/B টেস্টিং", "সাপ্তাহিক রিপোর্ট"] },
  { id: "s11", name: "E-commerce Setup", nameBn: "ই-কমার্স সেটআপ", description: "Complete Shopify / WooCommerce store with payment & shipping", descriptionBn: "পেমেন্ট ও শিপিং সহ সম্পূর্ণ Shopify / WooCommerce স্টোর", price: 18000, image: u("1556742049-0cfed4f6a45d"), category: "Development", features: ["Up to 50 products", "bKash/Nagad gateway", "Shipping setup", "1-month support"], featuresBn: ["সর্বোচ্চ ৫০টি প্রোডাক্ট", "বিকাশ/নগদ গেটওয়ে", "শিপিং সেটআপ", "১ মাসের সাপোর্ট"] },
  { id: "s12", name: "WhatsApp Business Automation", nameBn: "হোয়াটসঅ্যাপ বিজনেস অটোমেশন", description: "Auto-reply, catalog and order chatbot for WhatsApp Business API", descriptionBn: "হোয়াটসঅ্যাপ বিজনেস API-এর জন্য অটো-রিপ্লাই, ক্যাটালগ ও অর্ডার চ্যাটবট", price: 12000, image: u("1611605698335-8b1569810432"), category: "Development", features: ["Greeting + away messages", "Product catalog", "Order chatbot", "Training session"], featuresBn: ["গ্রিটিং + অ্যাওয়ে মেসেজ", "প্রোডাক্ট ক্যাটালগ", "অর্ডার চ্যাটবট", "ট্রেনিং সেশন"] },
];

export const blogPosts: BlogPost[] = [
  {
    id: "b1", title: "10 Tips to Grow Your Online Business in Bangladesh", titleBn: "বাংলাদেশে অনলাইন ব্যবসা বাড়ানোর ১০টি টিপস",
    excerpt: "Practical, locally-tested strategies — from Facebook ads to bKash conversion — to scale in 2025.",
    excerptBn: "ফেসবুক অ্যাড থেকে শুরু করে বিকাশ কনভার্সন পর্যন্ত — ২০২৫ সালে স্কেল করার বাস্তব কৌশল।",
    image: u("1556761175-5973dc0f32e7"), date: "2025-04-15", category: "Business", readTime: "6 min", author: "John Nil",
    content: [
      "Most online businesses in Bangladesh fail not because of bad products but because of weak fundamentals: unclear positioning, poor checkout flow, and inconsistent follow-up. The fix is rarely a new tactic — it is execution.",
      "1) Pick one customer, one problem. A clear niche beats a generic catalog every time. 2) Lock down your offer. Price + bonus + guarantee should fit on a single Facebook ad image. 3) Use bKash/Nagad as the primary payment, but always offer COD on the first order.",
      "4) Track every taka with the Meta Pixel + Conversion API. 5) Run a Reels-first content plan; short videos still win cheapest reach in BD. 6) Reply within 5 minutes on WhatsApp — speed alone beats half your competition.",
      "7) Build a re-order list. Repeat customers cost nothing and convert 4x. 8) Add reviews on every product page; even 3 honest reviews lift conversion. 9) Use a delivery partner with proof-of-delivery. 10) Reinvest 30% of profit back into ads every month — compounding is the real growth hack.",
    ],
    contentBn: [
      "বাংলাদেশের বেশিরভাগ অনলাইন ব্যবসা প্রোডাক্ট খারাপ বলে ফেল করে না — ফেল করে দুর্বল ফাউন্ডেশনের জন্য: অস্পষ্ট পজিশনিং, খারাপ চেকআউট ফ্লো, আর ফলো-আপের অভাব। সমাধানটা সাধারণত নতুন কৌশল না, এক্সিকিউশন।",
      "১) একজন কাস্টমার, একটা সমস্যা বেছে নিন। ২) অফার পরিষ্কার রাখুন — দাম + বোনাস + গ্যারান্টি একটা ফেসবুক অ্যাড ইমেজেই দেখা যাবে। ৩) প্রাইমারি পেমেন্ট বিকাশ/নগদ, কিন্তু প্রথম অর্ডারে COD সবসময় রাখুন।",
      "৪) মেটা পিক্সেল + Conversion API দিয়ে প্রতিটা টাকা ট্র্যাক করুন। ৫) Reels-first কন্টেন্ট প্ল্যান — শর্ট ভিডিও এখনো বাংলাদেশে সবচেয়ে সস্তা রিচ দেয়। ৬) WhatsApp-এ ৫ মিনিটের মধ্যে রিপ্লাই দিন — শুধু এই কারণেই অর্ধেক প্রতিযোগীকে হারাবেন।",
      "৭) Re-order লিস্ট বানান। ৮) প্রতিটি প্রোডাক্ট পেজে ৩টা সৎ রিভিউ যোগ করুন। ৯) Proof-of-delivery দেয় এমন কুরিয়ার ব্যবহার করুন। ১০) প্রতি মাসের প্রফিটের ৩০% আবার অ্যাডে বিনিয়োগ — কম্পাউন্ডিংই আসল গ্রোথ হ্যাক।",
    ],
  },
  {
    id: "b2", title: "Mastering Digital Marketing — A 2025 Beginner Roadmap", titleBn: "ডিজিটাল মার্কেটিং মাস্টার করুন — ২০২৫ বিগিনার রোডম্যাপ",
    excerpt: "A clear, no-fluff path from zero to running profitable campaigns in 90 days.",
    excerptBn: "শূন্য থেকে ৯০ দিনে প্রফিটেবল ক্যাম্পেইন চালানোর পরিষ্কার, ফালতু-কথা-মুক্ত পথ।",
    image: u("1432888622747-4eb9a8efeb07"), date: "2025-04-10", category: "Marketing", readTime: "8 min", author: "John Nil",
    content: [
      "Digital marketing in 2025 has matured. The winners are not the loudest — they are the ones who understand basics deeply: audience, message, offer, channel, and measurement.",
      "Days 1–30: master the fundamentals. Learn Meta Ads Manager, Google Tag Manager, and basic copywriting. Build one landing page and run a $5/day test for 7 days. The goal is not profit — it is data.",
      "Days 31–60: scale what worked. Find one creative with CTR > 1.5% and CPM < ৳150. Duplicate it across 3 audiences. Add an upsell. Track CAC vs LTV — anything under 1:3 is unhealthy.",
      "Days 61–90: build systems. A weekly creative pipeline (3 new ads/week), a re-targeting flow for 7/14/30-day windows, and an email/WhatsApp sequence. By day 90 you should have a repeatable funnel — not a hobby.",
    ],
    contentBn: [
      "২০২৫-এ ডিজিটাল মার্কেটিং পরিপক্ক হয়েছে। যারা জিতছে তারা সবচেয়ে জোরে কথা বলে না — তারা বেসিক গভীরভাবে বোঝে: অডিয়েন্স, মেসেজ, অফার, চ্যানেল, মেজারমেন্ট।",
      "১–৩০ দিন: ফাউন্ডেশন। Meta Ads Manager, GTM, বেসিক কপি — শিখুন। একটা ল্যান্ডিং পেজ বানিয়ে দিনে $৫ করে ৭ দিন টেস্ট চালান। লক্ষ্য প্রফিট না — ডেটা।",
      "৩১–৬০ দিন: যেটা কাজ করেছে স্কেল করুন। CTR > ১.৫% এবং CPM < ৳১৫০ এমন একটা ক্রিয়েটিভ খুঁজে ৩টা অডিয়েন্সে ডুপ্লিকেট করুন। আপসেল যোগ করুন। CAC vs LTV ট্র্যাক করুন — ১:৩ এর কম হলে আনহেলদি।",
      "৬১–৯০ দিন: সিস্টেম। সাপ্তাহিক ৩টা নতুন ক্রিয়েটিভ, ৭/১৪/৩০ দিনের রিটার্গেটিং, এবং ইমেইল/WhatsApp সিকোয়েন্স। ৯০ দিনের মধ্যে পুনরাবৃত্তিযোগ্য ফানেল থাকবে — হবি না।",
    ],
  },
  {
    id: "b3", title: "Why Personal Branding Matters in 2025", titleBn: "২০২৫-এ পার্সোনাল ব্র্যান্ডিং কেন গুরুত্বপূর্ণ",
    excerpt: "Your name is the only asset that compounds across jobs, projects, and platforms.",
    excerptBn: "আপনার নামই একমাত্র সম্পদ যা চাকরি, প্রজেক্ট ও প্ল্যাটফর্ম জুড়ে বাড়তে থাকে।",
    image: u("1507003211169-0a1dd7228f2d"), date: "2025-04-05", category: "Personal Growth", readTime: "5 min", author: "John Nil",
    content: [
      "Companies fail. Tech stacks change. Social platforms die. The one asset that survives every transition is your name and the trust attached to it.",
      "A personal brand is not about being loud — it is about being consistently useful in public. Pick one topic, share what you actually know, and do it for 12 months without measuring vanity metrics.",
      "The compounding is invisible until it is undeniable. Three years of public work usually produces more opportunities than three years of resume polishing.",
    ],
    contentBn: [
      "কোম্পানি ফেল করে। টেক স্ট্যাক বদলায়। সোশ্যাল প্ল্যাটফর্ম মরে যায়। প্রতিটা পরিবর্তনের মধ্যে যে সম্পদটা টিকে থাকে — সেটা আপনার নাম এবং সেটার সাথে জড়িত বিশ্বাস।",
      "পার্সোনাল ব্র্যান্ড মানে জোরে কথা বলা না — পাবলিকলি ধারাবাহিকভাবে কাজে আসা। একটা বিষয় বেছে নিন, যা সত্যিই জানেন শেয়ার করুন, এবং ১২ মাস vanity metric না দেখে চালিয়ে যান।",
      "কম্পাউন্ডিং অদৃশ্য — যতক্ষণ না অস্বীকার করা যায় না। ৩ বছর পাবলিক কাজ সাধারণত ৩ বছর CV পলিশ করার চেয়ে বেশি সুযোগ আনে।",
    ],
  },
  {
    id: "b4", title: "How to Set Up bKash Payment for Your Online Store", titleBn: "অনলাইন স্টোরে বিকাশ পেমেন্ট কীভাবে সেট করবেন",
    excerpt: "Step-by-step: merchant account, PGW integration, and reconciliation.",
    excerptBn: "ধাপে ধাপে: মার্চেন্ট অ্যাকাউন্ট, PGW ইন্টিগ্রেশন, এবং রিকনসিলিয়েশন।",
    image: u("1563013544-824ae1b704d3"), date: "2025-03-28", category: "E-commerce", readTime: "7 min", author: "John Nil",
    content: [
      "bKash drives the majority of e-commerce payments in Bangladesh. You have three integration options: personal/agent number (manual), Merchant Account (manual but trusted), and bKash PGW (full automation).",
      "For under 100 orders/month, a verified merchant account with a TrxID + screenshot upload at checkout is enough. Above that, the PGW is worth the documentation hassle — settlements happen in 2 working days.",
      "Always reconcile daily: order ID ↔ TrxID ↔ bKash statement. A 5-minute habit prevents weeks of disputes later.",
    ],
    contentBn: [
      "বাংলাদেশের ই-কমার্স পেমেন্টের সিংহভাগ চালায় বিকাশ। তিনটা ইন্টিগ্রেশন অপশন: পার্সোনাল/এজেন্ট নম্বর (ম্যানুয়াল), মার্চেন্ট অ্যাকাউন্ট (ম্যানুয়াল কিন্তু বিশ্বস্ত), এবং bKash PGW (ফুল অটোমেশন)।",
      "মাসে ১০০ অর্ডারের নিচে — ভেরিফাইড মার্চেন্ট অ্যাকাউন্ট + চেকআউটে TrxID + স্ক্রিনশট আপলোডই যথেষ্ট। তার বেশি হলে PGW নেওয়া উচিত, সেটেলমেন্ট ২ কর্মদিবসে।",
      "প্রতিদিন রিকনসাইল করুন: order ID ↔ TrxID ↔ bKash স্টেটমেন্ট। ৫ মিনিটের অভ্যাস পরে সপ্তাহের ঝামেলা ঠেকায়।",
    ],
  },
  {
    id: "b5", title: "Lovable, Bolt, v0 — Which AI Builder is Right for You?", titleBn: "Lovable, Bolt, v0 — আপনার জন্য কোন AI বিল্ডার?",
    excerpt: "An honest comparison of the three biggest AI app builders of 2025.",
    excerptBn: "২০২৫ সালের তিনটা বড় AI অ্যাপ বিল্ডারের সৎ তুলনা।",
    image: u("1517694712202-14dd9538aa97"), date: "2025-03-20", category: "Technology", readTime: "9 min", author: "John Nil",
    content: [
      "All three can ship a polished web app in a weekend. The differences show up the moment you need a real backend, auth, or to take the code out.",
      "Lovable shines for full-stack apps with built-in Cloud, RLS, edge functions, and instant publishing. Best when you want one tool from idea to production.",
      "Bolt is great for fast prototypes and StackBlitz portability. v0 is unmatched for crafting individual UI components from a Vercel-native workflow.",
      "If you build products that need to live for years and grow — Lovable. If you build demos and design systems — Bolt or v0.",
    ],
    contentBn: [
      "তিনটা টুলই উইকেন্ডে একটা পলিশড ওয়েব অ্যাপ ডেলিভার করতে পারে। পার্থক্য দেখা যায় যখন আপনি রিয়েল ব্যাকএন্ড, অথ, বা কোডটা বের করতে চান।",
      "Lovable জ্বলে ফুল-স্ট্যাক অ্যাপের জন্য — বিল্ট-ইন Cloud, RLS, edge functions, instant publish। আইডিয়া থেকে প্রোডাকশন একটাই টুলে।",
      "Bolt ফাস্ট প্রোটোটাইপ আর StackBlitz পোর্টেবিলিটির জন্য সেরা। v0 — Vercel-native ওয়ার্কফ্লোতে আলাদা UI কম্পোনেন্ট বানাতে অতুলনীয়।",
      "বছরের পর বছর টিকবে এমন প্রোডাক্ট চাইলে — Lovable। ডেমো আর ডিজাইন সিস্টেম চাইলে — Bolt বা v0।",
    ],
  },
  {
    id: "b6", title: "From Village to Online: My 18-Year Journey", titleBn: "গ্রাম থেকে অনলাইন: আমার ১৮ বছরের যাত্রা",
    excerpt: "Lessons learned building 41 Wapka sites, a 78K-member community, and starting again at 30.",
    excerptBn: "৪১টি Wapka সাইট, ৭৮ হাজার সদস্যের কমিউনিটি, এবং ৩০ বছর বয়সে আবার শুরু — শেখা পাঠ।",
    image: u("1499750310107-5fef28a66643"), date: "2025-03-12", category: "Personal Growth", readTime: "10 min", author: "John Nil",
    content: [
      "I started online in 2006 from a village where nobody knew what 'internet work' even meant. No mentor, no roadmap — only curiosity and a bad GPRS connection.",
      "Between 2008 and 2013 I figured out free internet, VPN handlers, and APK editing — then built 41 Wapka sites. My biggest regret: I never learned a real programming language back then.",
      "The 78K-member Facebook group taught me the hardest lesson: virality without infrastructure is fragile. The group was deactivated many times; I rebuilt it every time.",
      "At 30, after my father passed and a Dhaka company shut down owing me 6 months of salary, I came back to the village and started again — this time with proper tools. The biggest difference is not skill — it is patience.",
    ],
    contentBn: [
      "২০০৬ সালে আমি অনলাইনে শুরু করি — এমন একটা গ্রাম থেকে যেখানে 'ইন্টারনেট ওয়ার্ক' মানে কেউ জানতই না। মেন্টর নেই, রোডম্যাপ নেই — শুধু কৌতূহল আর একটা খারাপ GPRS।",
      "২০০৮–২০১৩-এর মধ্যে ফ্রি ইন্টারনেট, VPN handler, APK editing বুঝে ফেলি — এরপর ৪১টা Wapka সাইট। সবচেয়ে বড় আফসোস: তখন একটাও প্রোগ্রামিং ভাষা শিখিনি।",
      "৭৮ হাজার সদস্যের ফেসবুক গ্রুপ থেকে কঠিনতম পাঠ পাই: ইনফ্রাস্ট্রাকচার ছাড়া ভাইরালিটি ভঙ্গুর। গ্রুপ বহুবার বন্ধ হয়েছে, প্রতিবার আবার দাঁড় করিয়েছি।",
      "৩০ বছর বয়সে, বাবা চলে যাওয়ার পর এবং ঢাকার কোম্পানি ৬ মাসের বেতন আটকে বন্ধ হয়ে যাওয়ার পর — গ্রামে ফিরে আবার শুরু করি, এবার ঠিক টুল নিয়ে। সবচেয়ে বড় পার্থক্য স্কিল না — ধৈর্য।",
    ],
  },
  {
    id: "b7", title: "Why Most Bangladeshi Freelancers Quit in Year 1", titleBn: "কেন বেশিরভাগ বাংলাদেশি ফ্রিল্যান্সার প্রথম বছরেই ছেড়ে দেয়",
    excerpt: "It is not skill. It is positioning, pricing, and follow-through.",
    excerptBn: "স্কিলের সমস্যা না। সমস্যা পজিশনিং, প্রাইসিং, আর ফলো-থ্রু।",
    image: u("1521737711867-e3b97375f902"), date: "2025-03-05", category: "Career", readTime: "6 min", author: "John Nil",
    content: [
      "70% of Bangladeshi freelancers earn less than $300 in their first year. Almost none of them are 'unskilled' — they are unpositioned and underpriced.",
      "Stop competing on $5 jobs. Pick a vertical (e.g. 'WooCommerce speed optimization for fashion brands'), price at the market rate, and become known for that one thing.",
      "Always send a Loom video with every proposal. 80% of buyers make decisions in the first 30 seconds — give them a reason to trust you in those 30 seconds.",
    ],
    contentBn: [
      "বাংলাদেশের ৭০% ফ্রিল্যান্সার প্রথম বছরে $৩০০-এর কম আয় করে। তাদের প্রায় কেউই 'স্কিলহীন' না — তারা আন-পজিশনড আর আন্ডারপ্রাইসড।",
      "$৫ জবে কম্পিটিশন বন্ধ করুন। একটা ভার্টিক্যাল বেছে নিন (যেমন 'ফ্যাশন ব্র্যান্ডের জন্য WooCommerce স্পিড অপটিমাইজেশন'), মার্কেট রেটে প্রাইস করুন, ঐ একটা জিনিসের জন্য পরিচিত হন।",
      "প্রতিটা প্রপোজালে Loom ভিডিও দিন। ৮০% বায়ার প্রথম ৩০ সেকেন্ডে সিদ্ধান্ত নেয় — ঐ ৩০ সেকেন্ডে তাদের আপনাকে বিশ্বাস করার কারণ দিন।",
    ],
  },
  {
    id: "b8", title: "The Real Cost of Building a Startup MVP in 2025", titleBn: "২০২৫-এ স্টার্টআপ MVP বানানোর সত্যিকারের খরচ",
    excerpt: "Honest numbers from 12 MVPs we shipped this year.",
    excerptBn: "এই বছর ডেলিভার করা ১২টা MVP-র সৎ সংখ্যা।",
    image: u("1551288049-bebda4e38f71"), date: "2025-02-25", category: "Startups", readTime: "7 min", author: "John Nil",
    content: [
      "A real MVP — landing page, auth, one core feature, payments — costs ৳40K–৳120K to build in 2025. The variation is mostly design polish and how 'unique' your core feature is.",
      "Hidden costs people forget: domain (৳1,200/yr), email infra (৳600/mo), SMS OTP (৳0.40 each), payment gateway setup (৳5,000), and 6+ hours/week of founder time on support.",
      "Use AI builders for everything that is not your moat. Save your real engineering budget for the 10% that actually differentiates you.",
    ],
    contentBn: [
      "একটা রিয়েল MVP — ল্যান্ডিং পেজ, অথ, একটা কোর ফিচার, পেমেন্ট — ২০২৫-এ বানাতে ৳৪০K–৳১২০K লাগে। পার্থক্যটা মূলত ডিজাইন পলিশ আর আপনার ফিচার কতটা 'ইউনিক'।",
      "যে খরচগুলো মানুষ ভুলে যায়: ডোমেইন (৳১,২০০/বছর), ইমেইল ইনফ্রা (৳৬০০/মাস), SMS OTP (প্রতিটা ৳০.৪০), পেমেন্ট গেটওয়ে সেটআপ (৳৫,০০০), এবং সাপ্তাহে ৬+ ঘণ্টা ফাউন্ডারের সাপোর্ট সময়।",
      "যেটা আপনার moat না — সব কিছুর জন্য AI বিল্ডার ব্যবহার করুন। রিয়েল ইঞ্জিনিয়ারিং বাজেট ১০%-এর জন্য রাখুন যেটা সত্যিই আপনাকে আলাদা করে।",
    ],
  },
  {
    id: "b9", title: "Free Internet to Cybersecurity: A Hacker's Confession", titleBn: "ফ্রি ইন্টারনেট থেকে সাইবারসিকিউরিটি: একজন হ্যাকারের স্বীকারোক্তি",
    excerpt: "What 7 years of VPN handlers and APK editing taught me about real security.",
    excerptBn: "৭ বছর VPN handler আর APK editing থেকে রিয়েল সিকিউরিটি সম্পর্কে যা শিখেছি।",
    image: u("1550751827-4bd374c3f58b"), date: "2025-02-18", category: "Technology", readTime: "8 min", author: "John Nil",
    content: [
      "Most 'free internet' tricks worked because telcos misconfigured their billing layers. The same misconfigurations exist today — they just got more expensive to exploit.",
      "Real security is boring: rotate API keys, never commit secrets, use RLS on every table, and assume any client-side check will be bypassed.",
      "The teenagers writing handlers in 2014 are the senior security engineers of 2025. The path is real — just point that curiosity at defense, not offense.",
    ],
    contentBn: [
      "বেশিরভাগ 'ফ্রি ইন্টারনেট' ট্রিক কাজ করত কারণ টেলকোরা তাদের বিলিং লেয়ার ভুলভাবে কনফিগার করত। একই ভুল কনফিগারেশন আজও আছে — শুধু এক্সপ্লয়েট করা ব্যয়বহুল হয়েছে।",
      "রিয়েল সিকিউরিটি বোরিং: API key রোটেট করুন, secret কখনো commit করবেন না, প্রতিটা টেবিলে RLS ব্যবহার করুন, ধরে নিন যেকোনো ক্লায়েন্ট-সাইড চেক বাইপাস হবে।",
      "২০১৪-এ যারা handler লিখত — তারাই আজ ২০২৫-এর সিনিয়র সিকিউরিটি ইঞ্জিনিয়ার। পথ আছে — শুধু কৌতূহলটা ডিফেন্সে ব্যবহার করুন, অফেন্সে না।",
    ],
  },
  {
    id: "b10", title: "How I Use AI to Write 10x Faster (Without Sounding Like a Bot)", titleBn: "AI দিয়ে ১০x দ্রুত কীভাবে লিখি (বটের মতো না শোনাতে)",
    excerpt: "My exact workflow for blog posts, captions, and product descriptions.",
    excerptBn: "ব্লগ পোস্ট, ক্যাপশন, এবং প্রোডাক্ট ডিসক্রিপশনের জন্য আমার এক্সাক্ট ওয়ার্কফ্লো।",
    image: u("1620712943543-bcc4688e7485"), date: "2025-02-10", category: "Productivity", readTime: "5 min", author: "John Nil",
    content: [
      "AI is great at structure and bad at voice. So I use it for the first 70% (outline, draft, fact list) and write the last 30% by hand — the part that sounds like me.",
      "Three rules: never publish what AI wrote unedited, always add one personal anecdote, and always cut at least 20% on the final pass. Cutting is what separates writing from generating.",
      "Practical setup: Gemini 2.5 Flash for outlines, GPT-5 for first drafts, then a manual pass with track-changes. Total time per 1000-word post: 25 minutes instead of 2 hours.",
    ],
    contentBn: [
      "AI স্ট্রাকচারে দারুণ, ভয়েসে খারাপ। তাই প্রথম ৭০% (আউটলাইন, ড্রাফট, ফ্যাক্ট লিস্ট) AI দিয়ে করি, শেষ ৩০% হাতে — যে অংশটা আমার মতো শোনায়।",
      "তিনটা নিয়ম: AI যা লিখেছে সেটা না-এডিট করে কখনো পাবলিশ করবেন না, একটা পার্সোনাল অ্যানেকডোট সবসময় যোগ করুন, এবং ফাইনাল পাসে কমপক্ষে ২০% কাটুন। কাটাই writing-কে generating থেকে আলাদা করে।",
      "প্র্যাকটিক্যাল সেটআপ: আউটলাইনের জন্য Gemini 2.5 Flash, প্রথম ড্রাফটের জন্য GPT-5, তারপর ম্যানুয়াল পাস। ১০০০ শব্দের পোস্টে মোট সময়: ২ ঘণ্টার বদলে ২৫ মিনিট।",
    ],
  },
  {
    id: "b11", title: "Top 7 Side Hustles for Bangladeshi Students in 2025", titleBn: "২০২৫-এ বাংলাদেশি ছাত্রদের জন্য ৭টি সাইড হাসেল",
    excerpt: "Realistic income ranges and how to start each with under ৳2,000.",
    excerptBn: "বাস্তব আয়ের পরিসর এবং প্রতিটা ৳২,০০০-এর কমে কীভাবে শুরু করবেন।",
    image: u("1543269865-cbf427effbad"), date: "2025-02-02", category: "Career", readTime: "6 min", author: "John Nil",
    content: [
      "Forget '$1000/day' YouTube promises. Realistic side income for a student in Bangladesh is ৳5,000–৳25,000/month in the first 6 months — and that is fantastic if you stay consistent.",
      "Best 7: 1) Canva graphics for local businesses, 2) Reels editing on Fiverr, 3) Selling Notion templates, 4) Local product reselling on Facebook, 5) English tutoring on Preply, 6) Voiceover work, 7) Junior virtual assistant on OnlineJobs.ph.",
      "Pick one. Spend 90 days on it before judging. The students who fail are the ones who switch every two weeks.",
    ],
    contentBn: [
      "'প্রতিদিন $১০০০' YouTube প্রতিশ্রুতি ভুলে যান। বাংলাদেশি ছাত্রের জন্য বাস্তব সাইড আয় প্রথম ৬ মাসে ৳৫,০০০–৳২৫,০০০/মাস — এটাই দারুণ যদি ধারাবাহিক থাকেন।",
      "সেরা ৭: ১) লোকাল ব্যবসার জন্য ক্যানভা গ্রাফিক্স, ২) Fiverr-এ Reels এডিটিং, ৩) Notion টেমপ্লেট বিক্রি, ৪) ফেসবুকে লোকাল প্রোডাক্ট রিসেলিং, ৫) Preply-তে ইংরেজি টিউটরিং, ৬) ভয়েসওভার কাজ, ৭) OnlineJobs.ph-এ জুনিয়র VA।",
      "একটা বেছে নিন। বিচার করার আগে ৯০ দিন দিন। যারা ফেল করে — তারা প্রতি দুই সপ্তাহে সুইচ করে।",
    ],
  },
  {
    id: "b12", title: "What I Learned After 100+ Customer Calls", titleBn: "১০০+ কাস্টমার কলের পর যা শিখেছি",
    excerpt: "Pricing objections are almost never about price.",
    excerptBn: "প্রাইসিং অবজেকশন প্রায় কখনোই দাম নিয়ে না।",
    image: u("1573164574572-cb89e39749b4"), date: "2025-01-25", category: "Business", readTime: "5 min", author: "John Nil",
    content: [
      "After 100+ discovery calls, the pattern is brutal: 'too expensive' almost always means 'I don't trust the outcome'. Drop your price and you confirm the doubt.",
      "Instead, raise specificity. Replace 'we'll build your website' with 'we'll launch a Next.js storefront with bKash + COD checkout, indexed in Google Search Console, in 14 days'. Specificity sells.",
      "End every call by writing the next step in chat — date, deliverable, owner. Calls without a next step are entertainment, not business.",
    ],
    contentBn: [
      "১০০+ ডিসকভারি কলের পর প্যাটার্ন কঠোর: 'too expensive' প্রায় সবসময় মানে 'আউটকামে বিশ্বাস নেই'। দাম কমালে সন্দেহটা কনফার্ম করেন।",
      "এর বদলে স্পেসিফিসিটি বাড়ান। 'আমরা আপনার ওয়েবসাইট বানাব' এর জায়গায় বলুন 'বিকাশ + COD চেকআউট, Google Search Console-এ ইনডেক্সড — ১৪ দিনে Next.js স্টোরফ্রন্ট লঞ্চ করব'। স্পেসিফিসিটি বিক্রি হয়।",
      "প্রতিটা কল চ্যাটে next step লিখে শেষ করুন — তারিখ, ডেলিভারেবল, ওনার। next step ছাড়া কল entertainment, business না।",
    ],
  },
];

export const reviews: Review[] = [
  { id: "rv1", name: "Sarah Ahmed", text: "Amazing service! Got my custom website done in just 5 days. Highly recommended!", textBn: "অসাধারণ সার্ভিস! মাত্র ৫ দিনে আমার কাস্টম ওয়েবসাইট পেয়েছি। অত্যন্ত প্রস্তাবিত!", rating: 5, source: "facebook", avatar: avatar(47) },
  { id: "rv2", name: "Mahbub Khan", text: "Premium quality digital products. Worth every taka!", textBn: "প্রিমিয়াম কোয়ালিটির ডিজিটাল প্রোডাক্ট। প্রতিটা টাকার মূল্য আছে!", rating: 5, source: "instagram", avatar: avatar(13) },
  { id: "rv3", name: "Nusrat Jahan", text: "John Nil is the best in this industry. Professional and reliable.", textBn: "এই ইন্ডাস্ট্রিতে জন নীল সেরা। প্রফেশনাল এবং নির্ভরযোগ্য।", rating: 5, source: "whatsapp", avatar: avatar(45) },
  { id: "rv4", name: "Tanvir Hassan", text: "Used the marketplace to sell my old laptop quickly. Easy process!", textBn: "মার্কেটপ্লেস ব্যবহার করে দ্রুত আমার পুরানো ল্যাপটপ বিক্রি করেছি। সহজ প্রক্রিয়া!", rating: 5, source: "website", avatar: avatar(33) },
  { id: "rv5", name: "Rumana Akter", text: "The Notion templates pack saved me weeks of work. Very thoughtful design.", textBn: "Notion টেমপ্লেট প্যাকটা আমার সপ্তাহের কাজ বাঁচিয়েছে। ভাবনাচিন্তা করে ডিজাইন করা।", rating: 5, source: "facebook", avatar: avatar(20) },
  { id: "rv6", name: "Imran Hossain", text: "Bought the UI Kit for my agency — the team loves it. Worth 10x the price.", textBn: "এজেন্সির জন্য UI Kit কিনেছিলাম — টিম অসাধারণ পছন্দ করেছে। দামের ১০ গুণ মূল্য।", rating: 5, source: "instagram", avatar: avatar(12) },
  { id: "rv7", name: "Sharmin Sultana", text: "Quick reply on WhatsApp, transparent pricing, and on-time delivery. Rare combo!", textBn: "WhatsApp-এ দ্রুত রিপ্লাই, স্বচ্ছ প্রাইসিং, সময়মতো ডেলিভারি। বিরল কম্বো!", rating: 5, source: "whatsapp", avatar: avatar(31) },
  { id: "rv8", name: "Faisal Ahmed", text: "Hired for Facebook Ads — went from 1.2x ROAS to 4.8x in two months.", textBn: "ফেসবুক অ্যাডসের জন্য হায়ার করেছিলাম — দুই মাসে ১.২x ROAS থেকে ৪.৮x।", rating: 5, source: "website", avatar: avatar(8) },
  { id: "rv9", name: "Tasnim Jahan", text: "The e-book on digital marketing is the most practical guide I've read in Bangla.", textBn: "ডিজিটাল মার্কেটিং-এর e-book — বাংলায় পড়া সবচেয়ে কাজের গাইড।", rating: 5, source: "facebook", avatar: avatar(36) },
  { id: "rv10", name: "Rakibul Islam", text: "Got my Shopify store live in 9 days. Smooth experience throughout.", textBn: "৯ দিনে আমার Shopify স্টোর লাইভ পেয়েছি। পুরো প্রক্রিয়াটাই মসৃণ।", rating: 5, source: "instagram", avatar: avatar(53) },
  { id: "rv11", name: "Anika Rahman", text: "Booked a 1-on-1 consultation — actionable, no fluff. Already saw results.", textBn: "১-অন-১ কনসালটেশন বুক করেছিলাম — কাজে লাগানোর মতো, ফালতু কথা নেই। ফলাফল পেয়েছি।", rating: 5, source: "whatsapp", avatar: avatar(25) },
  { id: "rv12", name: "Nasir Uddin", text: "The hoodie quality genuinely surprised me. Better than imported brands at this price.", textBn: "হুডির কোয়ালিটি সত্যিই অবাক করেছে। এই দামে ইম্পোর্টেড ব্র্যান্ডের চেয়েও ভালো।", rating: 5, source: "facebook", avatar: avatar(60) },
];

export const portfolioItems = [
  { id: "pf1", title: "Aarong-style E-commerce Platform", titleBn: "Aarong-স্টাইল ই-কমার্স প্ল্যাটফর্ম", category: "Web Development", year: "2024", image: u("1556742049-0cfed4f6a45d") },
  { id: "pf2", title: "FreshBD Brand Identity", titleBn: "FreshBD ব্র্যান্ড আইডেন্টিটি", category: "Branding", year: "2024", image: u("1626785774573-4b799315345d") },
  { id: "pf3", title: "RideDhaka Mobile App", titleBn: "RideDhaka মোবাইল অ্যাপ", category: "App Development", year: "2024", image: u("1512941937669-90a1b58e7e9c") },
  { id: "pf4", title: "FinTrack SaaS Dashboard", titleBn: "FinTrack SaaS ড্যাশবোর্ড", category: "UI/UX", year: "2024", image: u("1551288049-bebda4e38f71") },
  { id: "pf5", title: "Eid Festival Marketing Campaign", titleBn: "ঈদ ফেস্টিভ্যাল মার্কেটিং ক্যাম্পেইন", category: "Marketing", year: "2024", image: u("1542744173-8e7e53415bb0") },
  { id: "pf6", title: "Bangla Tech Blog Content System", titleBn: "বাংলা টেক ব্লগ কন্টেন্ট সিস্টেম", category: "Content", year: "2024", image: u("1499750310107-5fef28a66643") },
  { id: "pf7", title: "Chaldal-style Grocery PWA", titleBn: "Chaldal-স্টাইল গ্রোসারি PWA", category: "Web Development", year: "2025", image: u("1542838132-92c53300491e") },
  { id: "pf8", title: "Pathao Driver Training Microsite", titleBn: "Pathao ড্রাইভার ট্রেনিং মাইক্রোসাইট", category: "UI/UX", year: "2024", image: u("1517336714731-489689fd1ca8") },
  { id: "pf9", title: "Banglalink Ramadan Reels", titleBn: "Banglalink রমজান রিলস", category: "Video Production", year: "2025", image: u("1574717024653-61fd2cf4d44d") },
  { id: "pf10", title: "Daraz Seller Onboarding Bot", titleBn: "Daraz সেলার অনবোর্ডিং বট", category: "Automation", year: "2025", image: u("1611605698335-8b1569810432") },
  { id: "pf11", title: "BRAC University Alumni Portal", titleBn: "BRAC University অ্যালামনাই পোর্টাল", category: "Web Development", year: "2025", image: u("1498243691581-b145c3f54a5a") },
  { id: "pf12", title: "Kacchi Bhai Online Ordering", titleBn: "Kacchi Bhai অনলাইন অর্ডারিং", category: "E-commerce", year: "2025", image: u("1565299624946-b28f40a0ae38") },
];

export const experience = [
  { year: "2024 - Present", title: "Founder & CEO", titleBn: "ফাউন্ডার ও সিইও", company: "JohnNil.com", description: "Leading an all-in-one digital platform serving thousands of customers across Bangladesh.", descriptionBn: "বাংলাদেশজুড়ে হাজার হাজার গ্রাহককে সেবা দেওয়া অল-ইন-ওয়ান ডিজিটাল প্ল্যাটফর্ম পরিচালনা।" },
  { year: "2022 - 2023", title: "Senior Digital Strategist", titleBn: "সিনিয়র ডিজিটাল স্ট্র্যাটেজিস্ট", company: "Baridhara Tech Agency", description: "Led digital transformation for 50+ local brands; managed ৳2cr+ in ad spend.", descriptionBn: "৫০+ লোকাল ব্র্যান্ডের ডিজিটাল ট্রান্সফরমেশন; ৳২ কোটি+ অ্যাড স্পেন্ড ম্যানেজ।" },
  { year: "2016 - 2022", title: "Independent Service Provider", titleBn: "ইনডিপেনডেন্ট সার্ভিস প্রোভাইডার", company: "Self-employed", description: "Mobile data, FRP bypass, software & digital licenses — fully offline operation from home.", descriptionBn: "মোবাইল ডেটা, FRP বাইপাস, সফটওয়্যার ও ডিজিটাল লাইসেন্স — বাসা থেকেই অফলাইন অপারেশন।" },
  { year: "2014 - 2016", title: "Community Lead", titleBn: "কমিউনিটি লিড", company: "Free Internet BD (FB Group, 78K members)", description: "Built and moderated one of Bangladesh's largest free-internet communities.", descriptionBn: "বাংলাদেশের অন্যতম বড় ফ্রি ইন্টারনেট কমিউনিটি গঠন ও মডারেশন।" },
  { year: "2011 - 2013", title: "Wapka Web Builder", titleBn: "Wapka ওয়েব বিল্ডার", company: "Self-taught", description: "Built ~41 websites on Wapka — first taste of web development without formal training.", descriptionBn: "Wapka-তে ~৪১টি ওয়েবসাইট — ফরমাল ট্রেনিং ছাড়াই ওয়েব ডেভেলপমেন্টের প্রথম স্বাদ।" },
  { year: "2008 - 2011", title: "Self-taught Network Researcher", titleBn: "সেলফ-টট নেটওয়ার্ক গবেষক", company: "—", description: "Cracked free internet, VPN handler & APK editing techniques in a Bangladeshi village.", descriptionBn: "একটা বাংলাদেশি গ্রামে বসে ফ্রি ইন্টারনেট, VPN handler ও APK editing রহস্য সমাধান।" },
];

