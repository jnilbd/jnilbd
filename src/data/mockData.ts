// Mock data — পরবর্তীতে Lovable Cloud database থেকে আসবে

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
  image: string;
  date: string;
  category: string;
  readTime: string;
}

export interface UsedItem {
  id: string;
  title: string;
  titleBn: string;
  price: number;
  image: string;
  location: string;
  condition: string;
  postedDate: string;
  seller: string;
}

export interface Rental {
  id: string;
  title: string;
  titleBn: string;
  price: number;
  image: string;
  location: string;
  bedrooms: number;
  bathrooms: number;
  size: string;
  type: string;
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

// Direct Unsplash photo URL helper — guarantees unique, relevant imagery
const u = (id: string, w = 800) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&q=80&auto=format&fit=crop`;
// Fallback for non-product imagery (still keyword-based)
const img = (keywords: string, w = 800, h = 600, lock = 1) =>
  `https://source.unsplash.com/${w}x${h}/?${encodeURIComponent(keywords)}&sig=${lock}`;
const avatar = (seed: number) => `https://i.pravatar.cc/150?img=${seed}`;

export const products: Product[] = [
  {
    id: "p1", name: "Premium UI Kit", nameBn: "প্রিমিয়াম UI কিট",
    description: "Modern, fully customizable UI kit with 200+ components",
    descriptionBn: "২০০+ কম্পোনেন্ট সহ কাস্টমাইজেবল মডার্ন UI কিট",
    price: 1500, image: img("ui,design,figma,screen", 800, 600, 11),
    category: "digital", categoryName: "Digital", categoryNameBn: "ডিজিটাল", featured: true, rating: 4.9,
    subProducts: [
      { id: "p1-a", name: "Starter (50 components)", nameBn: "স্টার্টার (৫০ কম্পোনেন্ট)", price: 800, badge: "Basic", badgeBn: "বেসিক", image: img("ui,wireframe", 400, 300, 111) },
      { id: "p1-b", name: "Pro (200 components)", nameBn: "প্রো (২০০ কম্পোনেন্ট)", price: 1500, badge: "Popular", badgeBn: "জনপ্রিয়", image: img("ui,figma,components", 400, 300, 112) },
      { id: "p1-c", name: "Team License (5 users)", nameBn: "টিম লাইসেন্স (৫ ইউজার)", price: 3200, badge: "Best Value", badgeBn: "সেরা মূল্য", image: img("team,collaboration,design", 400, 300, 113) },
    ],
  },
  {
    id: "p2", name: "E-Book: Digital Marketing 2025", nameBn: "ই-বুক: ডিজিটাল মার্কেটিং ২০২৫",
    description: "Complete guide to mastering digital marketing in 2025",
    descriptionBn: "২০২৫ সালের ডিজিটাল মার্কেটিং মাস্টার করার সম্পূর্ণ গাইড",
    price: 800, image: img("ebook,book,reading,laptop", 800, 600, 12),
    category: "digital", categoryName: "Digital", categoryNameBn: "ডিজিটাল", featured: true, rating: 4.8,
    subProducts: [
      { id: "p2-a", name: "PDF Only", nameBn: "শুধু PDF", price: 800, image: img("pdf,ebook", 400, 300, 121) },
      { id: "p2-b", name: "PDF + Audio Book", nameBn: "PDF + অডিও বুক", price: 1400, badge: "Popular", badgeBn: "জনপ্রিয়", image: img("audiobook,headphones", 400, 300, 122) },
      { id: "p2-c", name: "Bundle + Templates", nameBn: "বান্ডেল + টেমপ্লেট", price: 2200, badge: "Best Value", badgeBn: "সেরা মূল্য", image: img("bundle,templates,marketing", 400, 300, 123) },
    ],
  },
  {
    id: "p3", name: "Branded T-Shirt", nameBn: "ব্র্যান্ডেড টি-শার্ট",
    description: "Premium cotton t-shirt with exclusive design",
    descriptionBn: "এক্সক্লুসিভ ডিজাইনের প্রিমিয়াম কটন টি-শার্ট",
    price: 600, image: img("tshirt,apparel,fashion", 800, 600, 13),
    category: "physical", categoryName: "Physical", categoryNameBn: "ফিজিক্যাল", featured: true, rating: 4.7,
    subProducts: [
      { id: "p3-s", name: "Size S", nameBn: "সাইজ S", price: 600, image: img("tshirt,white", 400, 300, 131) },
      { id: "p3-m", name: "Size M", nameBn: "সাইজ M", price: 600, image: img("tshirt,black", 400, 300, 132) },
      { id: "p3-l", name: "Size L", nameBn: "সাইজ L", price: 650, image: img("tshirt,navy", 400, 300, 133) },
      { id: "p3-xl", name: "Size XL", nameBn: "সাইজ XL", price: 700, image: img("tshirt,grey", 400, 300, 134) },
    ],
  },
  {
    id: "p4", name: "Online Course Bundle", nameBn: "অনলাইন কোর্স বান্ডেল",
    description: "10 premium courses bundled at one price",
    descriptionBn: "১০টি প্রিমিয়াম কোর্স একটি দামে",
    price: 3500, image: img("online,course,study,laptop", 800, 600, 14),
    category: "digital", categoryName: "Digital", categoryNameBn: "ডিজিটাল", featured: true, rating: 5.0,
    subProducts: [
      { id: "p4-a", name: "3 Courses", nameBn: "৩টি কোর্স", price: 1500, image: img("course,laptop", 400, 300, 141) },
      { id: "p4-b", name: "10 Courses Bundle", nameBn: "১০টি কোর্স বান্ডেল", price: 3500, badge: "Popular", badgeBn: "জনপ্রিয়", image: img("courses,study", 400, 300, 142) },
      { id: "p4-c", name: "Lifetime Access (All)", nameBn: "লাইফটাইম অ্যাক্সেস", price: 6500, badge: "Best Value", badgeBn: "সেরা মূল্য", image: img("learning,classroom", 400, 300, 143) },
    ],
  },
  {
    id: "p5", name: "Notion Templates Pack", nameBn: "নোশন টেমপ্লেট প্যাক",
    description: "50+ productivity Notion templates",
    descriptionBn: "৫০+ প্রোডাক্টিভিটি নোশন টেমপ্লেট",
    price: 1200, image: img("notebook,planner,workspace", 800, 600, 15),
    category: "digital", categoryName: "Digital", categoryNameBn: "ডিজিটাল", rating: 4.6,
    subProducts: [
      { id: "p5-a", name: "Personal Pack", nameBn: "পার্সোনাল প্যাক", price: 800, image: img("planner,personal", 400, 300, 151) },
      { id: "p5-b", name: "Business Pack", nameBn: "বিজনেস প্যাক", price: 1200, badge: "Popular", badgeBn: "জনপ্রিয়", image: img("notion,business", 400, 300, 152) },
      { id: "p5-c", name: "Ultimate (All 50+)", nameBn: "আল্টিমেট (৫০+)", price: 2000, badge: "Best Value", badgeBn: "সেরা মূল্য", image: img("workspace,planning", 400, 300, 153) },
    ],
  },
  {
    id: "p6", name: "Custom Mug", nameBn: "কাস্টম মগ",
    description: "Personalized ceramic mug with your design",
    descriptionBn: "আপনার ডিজাইনের কাস্টম সিরামিক মগ",
    price: 350, image: img("mug,coffee,ceramic", 800, 600, 16),
    category: "physical", categoryName: "Physical", categoryNameBn: "ফিজিক্যাল", rating: 4.5,
    subProducts: [
      { id: "p6-w", name: "White Mug", nameBn: "সাদা মগ", price: 350, image: img("mug,white", 400, 300, 161) },
      { id: "p6-b", name: "Black Magic Mug", nameBn: "ব্ল্যাক ম্যাজিক মগ", price: 450, badge: "Popular", badgeBn: "জনপ্রিয়", image: img("mug,black", 400, 300, 162) },
      { id: "p6-c", name: "Couple Mug Set (2)", nameBn: "কাপল মগ সেট (২টি)", price: 700, badge: "Best Value", badgeBn: "সেরা মূল্য", image: img("couple,mugs", 400, 300, 163) },
    ],
  },
  {
    id: "p7", name: "Logo Design Templates", nameBn: "লোগো ডিজাইন টেমপ্লেট",
    description: "100 premium logo templates",
    descriptionBn: "১০০টি প্রিমিয়াম লোগো টেমপ্লেট",
    price: 2000, image: img("logo,branding,design", 800, 600, 17),
    category: "digital", categoryName: "Digital", categoryNameBn: "ডিজিটাল", rating: 4.8,
    subProducts: [
      { id: "p7-a", name: "25 Logos Pack", nameBn: "২৫ লোগো প্যাক", price: 700, image: img("logo,minimal", 400, 300, 171) },
      { id: "p7-b", name: "100 Logos Pack", nameBn: "১০০ লোগো প্যাক", price: 2000, badge: "Popular", badgeBn: "জনপ্রিয়", image: img("logo,collection", 400, 300, 172) },
      { id: "p7-c", name: "100 Logos + Source Files", nameBn: "১০০ লোগো + সোর্স ফাইল", price: 3500, badge: "Best Value", badgeBn: "সেরা মূল্য", image: img("branding,vector", 400, 300, 173) },
    ],
  },
  {
    id: "p8", name: "Hoodie", nameBn: "হুডি",
    description: "Comfortable premium hoodie",
    descriptionBn: "আরামদায়ক প্রিমিয়াম হুডি",
    price: 1500, image: img("hoodie,clothing,fashion", 800, 600, 18),
    category: "physical", categoryName: "Physical", categoryNameBn: "ফিজিক্যাল", rating: 4.9,
    subProducts: [
      { id: "p8-bk", name: "Black - M", nameBn: "কালো - M", price: 1500, image: img("hoodie,black", 400, 300, 181) },
      { id: "p8-gr", name: "Grey - L", nameBn: "ধূসর - L", price: 1550, badge: "Popular", badgeBn: "জনপ্রিয়", image: img("hoodie,grey", 400, 300, 182) },
      { id: "p8-nv", name: "Navy - XL", nameBn: "নেভি - XL", price: 1650, image: img("hoodie,navy", 400, 300, 183) },
    ],
  },
];

export const services: Service[] = [
  { id: "s1", name: "Website Development", nameBn: "ওয়েবসাইট ডেভেলপমেন্ট", description: "Modern responsive website with full features", descriptionBn: "সম্পূর্ণ ফিচার সহ মডার্ন রেস্পন্সিভ ওয়েবসাইট", price: 25000, image: img("website,coding,developer,laptop", 800, 600, 21), category: "Development", features: ["Custom design", "Mobile responsive", "SEO optimized", "Fast delivery"], featuresBn: ["কাস্টম ডিজাইন", "মোবাইল রেস্পন্সিভ", "SEO অপটিমাইজড", "দ্রুত ডেলিভারি"] },
  { id: "s2", name: "Logo & Branding", nameBn: "লোগো ও ব্র্যান্ডিং", description: "Professional logo design and brand identity", descriptionBn: "প্রফেশনাল লোগো ডিজাইন ও ব্র্যান্ড আইডেন্টিটি", price: 5000, image: img("branding,logo,designer,sketch", 800, 600, 22), category: "Design", features: ["3 logo concepts", "Unlimited revisions", "All file formats", "Brand guidelines"], featuresBn: ["৩টি লোগো কনসেপ্ট", "আনলিমিটেড রিভিশন", "সব ফাইল ফরম্যাট", "ব্র্যান্ড গাইডলাইন"] },
  { id: "s3", name: "Digital Marketing", nameBn: "ডিজিটাল মার্কেটিং", description: "Complete social media marketing campaign", descriptionBn: "সম্পূর্ণ সোশ্যাল মিডিয়া মার্কেটিং ক্যাম্পেইন", price: 15000, image: img("marketing,social,analytics,chart", 800, 600, 23), category: "Marketing", features: ["FB & IG ads", "Content creation", "Analytics report", "30 days support"], featuresBn: ["FB ও IG অ্যাড", "কন্টেন্ট তৈরি", "অ্যানালিটিক্স রিপোর্ট", "৩০ দিন সাপোর্ট"] },
  { id: "s4", name: "Custom Information Request", nameBn: "কাস্টম ইনফরমেশন রিকোয়েস্ট", description: "Get any specific information you need", descriptionBn: "যেকোনো নির্দিষ্ট তথ্য পেয়ে যান", price: 500, image: img("research,documents,information,office", 800, 600, 24), category: "Consulting", features: ["Detailed research", "Verified sources", "PDF report", "Quick turnaround"], featuresBn: ["বিস্তারিত গবেষণা", "যাচাইকৃত সূত্র", "PDF রিপোর্ট", "দ্রুত সরবরাহ"] },
  { id: "s5", name: "1-on-1 Consultation", nameBn: "১-অন-১ কনসালটেশন", description: "60-minute personal consultation session", descriptionBn: "৬০ মিনিটের ব্যক্তিগত পরামর্শ সেশন", price: 2000, image: img("meeting,videocall,consultation,zoom", 800, 600, 25), category: "Consulting", features: ["Video call", "Action plan", "Follow-up email", "Resources"], featuresBn: ["ভিডিও কল", "অ্যাকশন প্ল্যান", "ফলো-আপ ইমেইল", "রিসোর্স"] },
  { id: "s6", name: "Content Writing", nameBn: "কন্টেন্ট রাইটিং", description: "SEO-optimized blog posts and articles", descriptionBn: "SEO অপটিমাইজড ব্লগ পোস্ট ও আর্টিকেল", price: 1500, image: img("writing,blog,typewriter,notebook", 800, 600, 26), category: "Content", features: ["1000+ words", "Plagiarism free", "Keyword research", "2 revisions"], featuresBn: ["১০০০+ শব্দ", "প্ল্যাজিয়ারিজম মুক্ত", "কীওয়ার্ড রিসার্চ", "২টি রিভিশন"] },
];

export const blogPosts: BlogPost[] = [
  { id: "b1", title: "10 Tips to Grow Your Online Business", titleBn: "অনলাইন ব্যবসা বাড়ানোর ১০টি টিপস", excerpt: "Practical strategies to scale your business online in 2025", excerptBn: "২০২৫ সালে আপনার ব্যবসাকে অনলাইনে স্কেল করার বাস্তব কৌশল", image: img("business,growth,startup,office", 800, 500, 31), date: "2025-04-15", category: "Business", readTime: "5 min" },
  { id: "b2", title: "Mastering Digital Marketing", titleBn: "ডিজিটাল মার্কেটিং মাস্টার করুন", excerpt: "Complete guide to digital marketing for beginners", excerptBn: "নতুনদের জন্য ডিজিটাল মার্কেটিংয়ের সম্পূর্ণ গাইড", image: img("marketing,digital,laptop,analytics", 800, 500, 32), date: "2025-04-10", category: "Marketing", readTime: "8 min" },
  { id: "b3", title: "Why Personal Branding Matters", titleBn: "পার্সোনাল ব্র্যান্ডিং কেন গুরুত্বপূর্ণ", excerpt: "Build your personal brand to unlock new opportunities", excerptBn: "নতুন সুযোগ আনলক করতে নিজের ব্র্যান্ড গড়ে তুলুন", image: img("personal,brand,portrait,professional", 800, 500, 33), date: "2025-04-05", category: "Personal Growth", readTime: "6 min" },
];

export const usedItems: UsedItem[] = [
  { id: "u1", title: "iPhone 13 Pro - Excellent Condition", titleBn: "আইফোন ১৩ প্রো - এক্সিলেন্ট কন্ডিশন", price: 65000, image: img("iphone,smartphone,apple", 800, 600, 41), location: "Dhaka", condition: "Like New", postedDate: "2025-05-01", seller: "Rakib H." },
  { id: "u2", title: "Gaming Laptop - Asus ROG", titleBn: "গেমিং ল্যাপটপ - আসুস ROG", price: 95000, image: img("gaming,laptop,rgb,computer", 800, 600, 42), location: "Chittagong", condition: "Good", postedDate: "2025-05-02", seller: "Tanvir A." },
  { id: "u3", title: "Office Chair Premium", titleBn: "অফিস চেয়ার প্রিমিয়াম", price: 8000, image: img("office,chair,furniture,ergonomic", 800, 600, 43), location: "Dhaka", condition: "Good", postedDate: "2025-04-28", seller: "Sumi K." },
  { id: "u4", title: "DSLR Camera - Canon", titleBn: "DSLR ক্যামেরা - ক্যানন", price: 45000, image: img("dslr,camera,canon,photography", 800, 600, 44), location: "Sylhet", condition: "Excellent", postedDate: "2025-04-30", seller: "Hasan M." },
];

export const rentals: Rental[] = [
  { id: "r1", title: "Modern 3BR Apartment in Baridhara", titleBn: "বারিধারায় ৩ বেডরুম মডার্ন অ্যাপার্টমেন্ট", price: 45000, image: img("apartment,interior,modern,livingroom", 800, 600, 51), location: "Baridhara, Dhaka", bedrooms: 3, bathrooms: 2, size: "1800 sqft", type: "Apartment" },
  { id: "r2", title: "Cozy 2BR in Gulshan", titleBn: "গুলশানে ২ বেডরুম কোজি ফ্ল্যাট", price: 35000, image: img("apartment,cozy,bedroom,interior", 800, 600, 52), location: "Gulshan, Dhaka", bedrooms: 2, bathrooms: 2, size: "1200 sqft", type: "Apartment" },
  { id: "r3", title: "Family House in Dhanmondi", titleBn: "ধানমন্ডিতে ফ্যামিলি বাসা", price: 60000, image: img("house,family,home,exterior", 800, 600, 53), location: "Dhanmondi, Dhaka", bedrooms: 4, bathrooms: 3, size: "2400 sqft", type: "House" },
  { id: "r4", title: "Studio in Banani", titleBn: "বনানীতে স্টুডিও", price: 20000, image: img("studio,apartment,minimal,interior", 800, 600, 54), location: "Banani, Dhaka", bedrooms: 1, bathrooms: 1, size: "600 sqft", type: "Studio" },
];

export const reviews: Review[] = [
  { id: "rv1", name: "Sarah Ahmed", text: "Amazing service! Got my custom website done in just 5 days. Highly recommended!", textBn: "অসাধারণ সার্ভিস! মাত্র ৫ দিনে আমার কাস্টম ওয়েবসাইট পেয়েছি। অত্যন্ত প্রস্তাবিত!", rating: 5, source: "facebook", avatar: avatar(47) },
  { id: "rv2", name: "Mahbub Khan", text: "Premium quality digital products. Worth every taka!", textBn: "প্রিমিয়াম কোয়ালিটির ডিজিটাল প্রোডাক্ট। প্রতিটা টাকার মূল্য আছে!", rating: 5, source: "instagram", avatar: avatar(13) },
  { id: "rv3", name: "Nusrat Jahan", text: "John Nil is the best in this industry. Professional and reliable.", textBn: "এই ইন্ডাস্ট্রিতে জন নীল সেরা। প্রফেশনাল এবং নির্ভরযোগ্য।", rating: 5, source: "whatsapp", avatar: avatar(45) },
  { id: "rv4", name: "Tanvir Hassan", text: "Used the marketplace to sell my old laptop quickly. Easy process!", textBn: "মার্কেটপ্লেস ব্যবহার করে দ্রুত আমার পুরানো ল্যাপটপ বিক্রি করেছি। সহজ প্রক্রিয়া!", rating: 5, source: "website", avatar: avatar(33) },
];

export const portfolioItems = [
  { id: "pf1", title: "E-commerce Platform", titleBn: "ই-কমার্স প্ল্যাটফর্ম", category: "Web Development", year: "2024", image: img("ecommerce,website,shop,screen", 800, 600, 61) },
  { id: "pf2", title: "Brand Identity Design", titleBn: "ব্র্যান্ড আইডেন্টিটি ডিজাইন", category: "Branding", year: "2024", image: img("branding,identity,logo,mockup", 800, 600, 62) },
  { id: "pf3", title: "Mobile App", titleBn: "মোবাইল অ্যাপ", category: "App Development", year: "2023", image: img("mobile,app,smartphone,interface", 800, 600, 63) },
  { id: "pf4", title: "SaaS Dashboard", titleBn: "SaaS ড্যাশবোর্ড", category: "UI/UX", year: "2024", image: img("dashboard,saas,analytics,ui", 800, 600, 64) },
  { id: "pf5", title: "Marketing Campaign", titleBn: "মার্কেটিং ক্যাম্পেইন", category: "Marketing", year: "2023", image: img("marketing,campaign,billboard,ad", 800, 600, 65) },
  { id: "pf6", title: "Content Strategy", titleBn: "কন্টেন্ট স্ট্র্যাটেজি", category: "Content", year: "2024", image: img("content,writing,strategy,workspace", 800, 600, 66) },
];

export const experience = [
  { year: "2024 - Present", title: "Founder & CEO", titleBn: "ফাউন্ডার ও সিইও", company: "JohnNil.com", description: "Leading an all-in-one digital platform serving thousands of customers.", descriptionBn: "হাজার হাজার গ্রাহককে সেবা দেওয়া অল-ইন-ওয়ান ডিজিটাল প্ল্যাটফর্ম পরিচালনা।" },
  { year: "2022 - 2024", title: "Senior Digital Strategist", titleBn: "সিনিয়র ডিজিটাল স্ট্র্যাটেজিস্ট", company: "Tech Agency", description: "Led digital transformation projects for 50+ brands.", descriptionBn: "৫০+ ব্র্যান্ডের জন্য ডিজিটাল ট্রান্সফরমেশন প্রকল্প পরিচালনা।" },
  { year: "2020 - 2022", title: "Creative Director", titleBn: "ক্রিয়েটিভ ডিরেক্টর", company: "Creative Studio", description: "Designed award-winning brand identities and campaigns.", descriptionBn: "পুরস্কার বিজয়ী ব্র্যান্ড আইডেন্টিটি এবং ক্যাম্পেইন ডিজাইন।" },
];
