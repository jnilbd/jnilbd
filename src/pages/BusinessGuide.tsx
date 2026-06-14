import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  Briefcase, Rocket, Target, TrendingUp, Package, Truck, CreditCard, Megaphone,
  Camera, ShoppingBag, Sprout, Building2, MapPin, AlertTriangle, ShieldCheck,
  Wallet, Search, Lightbulb, CheckCircle2, ArrowRight, Globe, Phone,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

type Step = { title: string; desc: string; tips?: string[] };
type Product = { name: string; sourcing: string; sell: string; margin: string; demand: string; cat: string };
type Capital = { range: string; ideas: { name: string; need: string; profit: string; risk: string }[] };

const ROADMAP: Step[] = [
  {
    title: "১. মাইন্ডসেট ও লক্ষ্য নির্ধারণ",
    desc: "ব্যবসা মানে শুধু টাকা নয় — সমস্যা সমাধান। নিজেকে প্রশ্ন করো: আমি কোন সমস্যার সমাধান দিতে চাই? কাকে সেবা দেব? কেন মানুষ আমার কাছ থেকে কিনবে?",
    tips: [
      "SMART লক্ষ্য লেখো (Specific, Measurable, Achievable, Relevant, Time-bound)",
      "৩ মাস / ৬ মাস / ১ বছরের মাইলস্টোন ঠিক করো",
      "ব্যর্থতাকে শেখার সুযোগ হিসেবে নাও — ৯০% স্টার্টআপ প্রথম ২ বছরেই বন্ধ হয়",
    ],
  },
  {
    title: "২. মার্কেট রিসার্চ ও নিশ সিলেকশন",
    desc: "Google Trends, Facebook Ads Library, AliExpress Best Sellers, Daraz Trending, TikTok Trends — এগুলো দিয়ে দেখো মানুষ কী খুঁজছে। প্রতিযোগীদের পেজ-ওয়েবসাইট ঘেঁটে দেখো কত অর্ডার, কেমন রিভিউ।",
    tips: [
      "নিশ যত সংকীর্ণ, কনভার্সন তত বেশি (যেমন: শুধু 'মেয়েদের জুতা' নয় — 'মুসলিম মেয়েদের মোজা-ফ্রেন্ডলি জুতা')",
      "সমস্যা-ভিত্তিক প্রোডাক্ট বেশি চলে — ব্যথা কমায়, সময় বাঁচায়, সুন্দর দেখায়",
      "মৌসুমি প্রোডাক্ট (শীতের কম্বল, ঈদের পাঞ্জাবি) দিয়ে দ্রুত ক্যাশফ্লো বানাও",
    ],
  },
  {
    title: "৩. বিজনেস মডেল ও রেজিস্ট্রেশন",
    desc: "F-Commerce (Facebook Page), E-Commerce (নিজস্ব ওয়েবসাইট), Marketplace (Daraz, Pickaboo), Hybrid — যেকোনো একটা দিয়ে শুরু করো। ট্রেড লাইসেন্স, TIN, BIN দরকার হলে নাও।",
    tips: [
      "ট্রেড লাইসেন্স: সিটি কর্পোরেশন/পৌরসভা — ১,০০০-৫,০০০ টাকা",
      "TIN: NBR ওয়েবসাইট থেকে ফ্রি",
      "ই-কমার্সের জন্য DBID (Digital Business Identification) — eservice.dnetbd.gov.bd",
    ],
  },
  {
    title: "৪. ব্র্যান্ডিং ও আইডেন্টিটি",
    desc: "নাম, লোগো, কালার, ট্যাগলাইন — মানুষ যেন এক নজরে চিনতে পারে। Canva দিয়ে নিজেই বানাতে পারো অথবা Fiverr-এ ৫০০-২০০০ টাকায় প্রফেশনাল করাও।",
    tips: [
      "নাম ছোট, উচ্চারণ সহজ, .com/.com.bd ডোমেইন available কিনা চেক",
      "একই হ্যান্ডেল Facebook, Instagram, TikTok, YouTube-এ নাও",
      "ব্র্যান্ড স্টোরি লেখো — মানুষ পণ্য নয়, গল্প কিনে",
    ],
  },
  {
    title: "৫. সাপ্লাই চেইন ও সোর্সিং",
    desc: "চীন (1688, Alibaba), ভারত (IndiaMART), স্থানীয় (কেরানীগঞ্জ গার্মেন্টস, চকবাজার, নিউ মার্কেট, ইসলামপুর) — সোর্স ঠিক করো।",
    tips: [
      "১ম স্যাম্পল আনো, কোয়ালিটি যাচাই করো — তারপর বাল্ক",
      "সোর্সিং কস্ট = প্রোডাক্ট প্রাইস + শিপিং + কাস্টমস + লোকাল ট্রান্সপোর্ট",
      "মিনিমাম ৩০-৫০% মার্জিন রাখো (সেল প্রাইস − সকল খরচ)",
    ],
  },
  {
    title: "৬. ফার্স্ট সেল ও স্কেলিং",
    desc: "১ম ১০০ অর্ডার ম্যানুয়ালি হ্যান্ডেল করো — কাস্টমারের সাথে কথা বলো, ফিডব্যাক নাও। তারপর অটোমেশন, টিম, ওয়্যারহাউস।",
    tips: [
      "প্রতিটা কাস্টমারকে থ্যাংক ইউ কার্ড/মেসেজ পাঠাও — রিটার্ন কাস্টমার সবচেয়ে লাভজনক",
      "রিভিউ ও UGC (User Generated Content) সংগ্রহ করো",
      "প্রফিট রি-ইনভেস্ট করো অ্যাড + ইনভেন্টরিতে",
    ],
  },
];

const WINNING_PRODUCTS: Product[] = [
  { name: "মিনি পোর্টেবল ব্লেন্ডার", sourcing: "৳৪৫০-৬০০", sell: "৳১,১৯০-১,৪৯০", margin: "১৫০%+", demand: "অত্যন্ত উচ্চ", cat: "Gadget" },
  { name: "LED স্ট্রিপ লাইট (রিমোট)", sourcing: "৳২৫০-৪০০", sell: "৳৭৯০-৯৯০", margin: "১৮০%", demand: "উচ্চ", cat: "Home" },
  { name: "নেক ম্যাসাজার", sourcing: "৳৬০০-৯০০", sell: "৳১,৮৯০-২,৪৯০", margin: "১৭০%", demand: "উচ্চ", cat: "Health" },
  { name: "হিজাব ম্যাগনেটিক পিন (১২ পিস)", sourcing: "৳৮০-১২০", sell: "৳২৯০-৩৯০", margin: "২৫০%", demand: "অত্যন্ত উচ্চ", cat: "Fashion" },
  { name: "কার ভ্যাকুয়াম ক্লিনার", sourcing: "৳৭০০-১,০০০", sell: "৳১,৯৯০-২,৪৯০", margin: "১৫০%", demand: "উচ্চ", cat: "Auto" },
  { name: "স্কিন কেয়ার সেট (কোরিয়ান)", sourcing: "৳৪০০-৬০০", sell: "৳১,২৯০-১,৬৯০", margin: "২০০%", demand: "অত্যন্ত উচ্চ", cat: "Beauty" },
  { name: "ফোন ট্রাইপড + রিং লাইট", sourcing: "৳৩৫০-৫০০", sell: "৳৯৯০-১,২৯০", margin: "১৭০%", demand: "উচ্চ", cat: "Gadget" },
  { name: "মুসলিম প্রেয়ার ম্যাট (ফোমিং)", sourcing: "৳৩০০-৫০০", sell: "৳৮৯০-১,১৯০", margin: "১৮০%", demand: "উচ্চ (রমজানে চরম)", cat: "Religious" },
  { name: "বাচ্চাদের শিক্ষামূলক টয়", sourcing: "৳২০০-৪০০", sell: "৳৬৯০-৯৯০", margin: "২০০%", demand: "উচ্চ", cat: "Kids" },
  { name: "স্মার্ট ওয়াচ (T500/D20)", sourcing: "৳৫৫০-৮০০", sell: "৳১,৪৯০-১,৯৯০", margin: "১৬০%", demand: "অত্যন্ত উচ্চ", cat: "Gadget" },
  { name: "কিচেন অর্গানাইজার সেট", sourcing: "৳২৫০-৪০০", sell: "৳৭৯০-১,০৯০", margin: "১৮০%", demand: "উচ্চ", cat: "Home" },
  { name: "হেয়ার স্ট্রেইটনার ব্রাশ", sourcing: "৳৪৫০-৭০০", sell: "৳১,২৯০-১,৬৯০", margin: "১৭০%", demand: "উচ্চ", cat: "Beauty" },
];

const CAPITAL_TIERS: Capital[] = [
  {
    range: "০ টাকা / নো-ক্যাপিটাল",
    ideas: [
      { name: "ফ্রিল্যান্সিং (Fiverr/Upwork)", need: "ল্যাপটপ + ইন্টারনেট + স্কিল", profit: "৳১৫,০০০-২,০০,০০০/মাস", risk: "শূন্য" },
      { name: "ড্রপশিপিং (Daraz/Shopify)", need: "শুধু পেজ + অ্যাড বাজেট নাই হলে অর্গানিক", profit: "৳১০,০০০-৫০,০০০/মাস", risk: "কম" },
      { name: "অ্যাফিলিয়েট মার্কেটিং", need: "ব্লগ/ইউটিউব/ফেসবুক পেজ", profit: "৳৫,০০০-১,০০,০০০/মাস", risk: "শূন্য" },
      { name: "রি-সেলিং (No inventory)", need: "সাপ্লায়ারের প্রোডাক্ট নিজের পেজে পোস্ট", profit: "৳১০,০০০-৪০,০০০/মাস", risk: "শূন্য" },
      { name: "টিউশনি / অনলাইন কোর্স", need: "যেকোনো একটা বিষয়ে দক্ষতা", profit: "৳১০,০০০-৮০,০০০/মাস", risk: "শূন্য" },
      { name: "কনটেন্ট ক্রিয়েশন (YouTube/TikTok)", need: "ফোন + ক্রিয়েটিভিটি", profit: "৳০-৫,০০,০০০/মাস (সময় লাগে)", risk: "শূন্য" },
    ],
  },
  {
    range: "১০,০০০ - ৫০,০০০ টাকা / মাইক্রো",
    ideas: [
      { name: "ফেসবুক পেজ + ছোট ইনভেন্টরি (১০-২০ পিস)", need: "৳১৫,০০০ ইনভেন্টরি + ৳৫,০০০ অ্যাড", profit: "৳১৫,০০০-৬০,০০০/মাস", risk: "মাঝারি" },
      { name: "ফুড ক্লাউড কিচেন (বাসা থেকে)", need: "৳২০,০০০ যন্ত্রপাতি + কাঁচামাল", profit: "৳২০,০০০-৮০,০০০/মাস", risk: "মাঝারি" },
      { name: "হোমমেড বেকারি/কেক", need: "ওভেন + কাঁচামাল ৳২৫,০০০", profit: "৳১৫,০০০-৫০,০০০/মাস", risk: "কম" },
      { name: "মোবাইল রিচার্জ + bKash এজেন্ট", need: "৳৩০,০০০ ফ্লোট", profit: "৳১০,০০০-৩০,০০০/মাস", risk: "কম" },
      { name: "গিফট আইটেম / হ্যান্ডিক্রাফট", need: "৳১৫,০০০-২৫,০০০", profit: "৳১০,০০০-৪০,০০০/মাস", risk: "কম" },
      { name: "মাশরুম / হাঁস-মুরগি (ছোট আকারে)", need: "৳২০,০০০-৪০,০০০", profit: "৳১৫,০০০-৫০,০০০/মাস", risk: "মাঝারি" },
    ],
  },
  {
    range: "৫০,০০০ - ৩,০০,০০০ টাকা / স্মল",
    ideas: [
      { name: "F-Commerce স্কেল (একাধিক প্রোডাক্ট লাইন)", need: "৳১,০০,০০০ ইনভেন্টরি + ৳৫০,০০০ অ্যাড", profit: "৳৫০,০০০-৩,০০,০০০/মাস", risk: "মাঝারি" },
      { name: "ছোট রেস্টুরেন্ট / ক্যাফে", need: "৳২,৫০,০০০ সেটআপ + ভাড়া", profit: "৳৪০,০০০-১,৫০,০০০/মাস", risk: "উচ্চ" },
      { name: "কাপড়ের দোকান (লোকাল মার্কেট)", need: "৳২,০০,০০০ স্টক + ভাড়া", profit: "৳৪০,০০০-১,২০,০০০/মাস", risk: "মাঝারি" },
      { name: "মোবাইল এক্সেসরিজ + সার্ভিসিং", need: "৳১,০০,০০০", profit: "৳৩০,০০০-৮০,০০০/মাস", risk: "কম" },
      { name: "প্রিন্টিং / প্যাকেজিং সার্ভিস", need: "৳২,০০,০০০ মেশিন", profit: "৳৪০,০০০-১,৫০,০০০/মাস", risk: "কম" },
      { name: "গরু/ছাগল মোটাতাজাকরণ", need: "৳২,০০,০০০-৩,০০,০০০", profit: "ঈদে ৳১,০০,০০০+ প্রতি গরু", risk: "মাঝারি" },
    ],
  },
  {
    range: "৩,০০,০০০ - ২০,০০,০০০+ টাকা / মিড-লার্জ",
    ideas: [
      { name: "ফুল ই-কমার্স ব্র্যান্ড + ওয়্যারহাউস", need: "৳৫,০০,০০০-১০,০০,০০০", profit: "৳২,০০,০০০-১৫,০০,০০০/মাস", risk: "উচ্চ" },
      { name: "ম্যানুফ্যাকচারিং (গার্মেন্টস/ফুড)", need: "৳১০,০০,০০০+", profit: "৳৩,০০,০০০-২০,০০,০০০/মাস", risk: "উচ্চ" },
      { name: "ডেইরি ফার্ম (১০-২০ গরু)", need: "৳১৫,০০,০০০", profit: "৳১,৫০,০০০-৪,০০,০০০/মাস", risk: "মাঝারি" },
      { name: "ফিশারিজ / মাছের প্রজেক্ট", need: "৫-১০ লাখ + লিজ পুকুর", profit: "বছরে ৳৫-১৫ লাখ", risk: "মাঝারি" },
      { name: "রিয়েল এস্টেট / জমি ফ্লিপিং", need: "৳২০,০০,০০০+", profit: "বছরে ২০-৪০% ROI", risk: "মাঝারি" },
      { name: "প্রপার্টি রেন্টাল / সাবলেট বিজনেস", need: "৳১০,০০,০০০ ডিপোজিট", profit: "৳৮০,০০০-৩,০০,০০০/মাস", risk: "কম" },
      { name: "ইম্পোর্ট-এক্সপোর্ট", need: "৳২০,০০,০০০+ + LC সুবিধা", profit: "মার্জিন ৩০-৬০%", risk: "উচ্চ" },
    ],
  },
];

const FCOMMERCE_STEPS: Step[] = [
  { title: "পেজ সেটআপ", desc: "Facebook Business Page → কভার + প্রোফাইল ছবি (Canva) → About সেকশনে ফোন, WhatsApp, ঠিকানা, ডেলিভারি এরিয়া।" },
  { title: "প্রোডাক্ট ফটোগ্রাফি", desc: "ভালো লাইটে সাদা ব্যাকগ্রাউন্ডে ছবি, ৪-৬ অ্যাঙ্গেল, লাইফস্টাইল শট, ভিডিও ১৫-৩০ সেকেন্ড। ফোনেই হয়।" },
  { title: "কপিরাইটিং (পোস্ট)", desc: "Hook (প্রথম ১ লাইনে স্ক্রল থামাও) → সমস্যা → সমাধান → বেনিফিট (ফিচার নয়) → প্রাইস → CTA (অর্ডার করতে ইনবক্স/০১XXX)। ইমোজি ব্যবহার করো।" },
  { title: "ক্যাশ অন ডেলিভারি (COD)", desc: "৯০% বাংলাদেশী COD-তে অর্ডার করে। অ্যাডভান্স চাইলে ৭০% হারিয়ে যাবে। তবে COD-তে ৩০-৪০% রিটার্ন/ফেক অর্ডার হ্যান্ডেল করতে শেখো।" },
  { title: "মেসেঞ্জার অটোমেশন", desc: "ManyChat / Meta Business Suite → অটো রিপ্লাই: 'অর্ডার করতে নাম, ফোন, ঠিকানা দিন' → ফলো-আপ। ৮০% সেল মেসেঞ্জারে হয়।" },
  { title: "Facebook/Instagram Ads", desc: "Boost Post নয় — Meta Ads Manager দিয়ে Conversion ক্যাম্পেইন। বাজেট: দৈনিক ৳৩০০-৫০০ দিয়ে শুরু, CPP (Cost Per Purchase) ট্র্যাক করো।" },
  { title: "টার্গেটিং", desc: "Age: 18-45, Location: বাংলাদেশ (নির্দিষ্ট সিটি), Interest: প্রোডাক্ট রিলেটেড। Lookalike Audience বানাও ১০০+ পারচেজ পেলে।" },
];

const ECOMMERCE_STEPS: Step[] = [
  { title: "প্ল্যাটফর্ম", desc: "Shopify (৳৩,৫০০/মাস), WooCommerce (ফ্রি + হোস্টিং ৳৫,০০০/বছর), Daraz/Pickaboo সেলার, অথবা কাস্টম। নতুনদের জন্য WooCommerce + ভালো থিম বেস্ট।" },
  { title: "ডোমেইন + হোস্টিং", desc: ".com.bd ৳৮০০/বছর, .com ৳১,২০০/বছর। হোস্টিং: ExonHost, Hostever, Bdtask — ৳৩,০০০-৮,০০০/বছর।" },
  { title: "পেমেন্ট গেটওয়ে", desc: "SSLCommerz (১.৭-২.৫% ফি, সব মেথড), AamarPay, ShurjoPay, bKash Payment Gateway। সেটআপে BIN/TIN/Trade License লাগে।" },
  { title: "কুরিয়ার ইন্টিগ্রেশন", desc: "Pathao Courier API, Steadfast, RedX, Sundarban — সরাসরি অ্যাপ/ড্যাশবোর্ড থেকে অর্ডার বুক। চার্জ: ঢাকা ৳৬০-৮০, বাইরে ৳১২০-১৫০।" },
  { title: "ইনভেন্টরি ম্যানেজমেন্ট", desc: "Daraz Seller Center / নিজস্ব ERP (Odoo, Zoho)। SKU, স্টক, রি-অর্ডার পয়েন্ট সেট করো।" },
  { title: "SEO + Google Ads", desc: "Product page-এ টাইটেল-ডেসক্রিপশন-আল্ট ট্যাগ। Google Shopping Ads, Google Search Ads দিয়ে ইনটেন্ট ট্রাফিক আনো।" },
];

const COURIERS = [
  { name: "Pathao Courier", area: "ঢাকা + ৬৪ জেলা", rate: "৳৬০ (ঢাকা সিটি) / ৳১২০ (আউটসাইড)", api: "✅ ফুল API", cod: "৭ দিন" },
  { name: "Steadfast", area: "সারাদেশ", rate: "৳৬০ / ৳১১০", api: "✅ API", cod: "৪-৭ দিন" },
  { name: "RedX", area: "সারাদেশ", rate: "৳৬৫ / ৳১২০", api: "✅ API", cod: "৭ দিন" },
  { name: "Sundarban Courier", area: "সারাদেশ", rate: "৳৭০ / ৳১৩০", api: "❌ ম্যানুয়াল", cod: "১০-১৫ দিন" },
  { name: "Paperfly", area: "সারাদেশ + হোম ডেলিভারি", rate: "৳৬৫ / ৳১২০", api: "✅ API", cod: "৭ দিন" },
  { name: "eCourier", area: "ঢাকা + মেজর সিটি", rate: "৳৫৫ / ৳১১০", api: "✅ API", cod: "৭ দিন" },
];

const PAYMENT_METHODS = [
  { name: "bKash Merchant", fee: "১.৮৫%", setup: "Trade License + NID + ব্যাংক", time: "T+1", best: "F-commerce ছোট-মাঝারি" },
  { name: "Nagad Merchant", fee: "১.৪৯%", setup: "Trade License + NID", time: "T+1", best: "ছোট ব্যবসা" },
  { name: "Rocket", fee: "১.৮%", setup: "Trade License + NID", time: "T+2", best: "ছোট ব্যবসা" },
  { name: "SSLCommerz", fee: "২-২.৫%", setup: "Trade License + TIN + Bank", time: "T+3", best: "ফুল ই-কমার্স" },
  { name: "AamarPay", fee: "১.৭-২.৫%", setup: "Trade License + Bank", time: "T+2", best: "ই-কমার্স" },
  { name: "ShurjoPay", fee: "২%", setup: "Trade License", time: "T+2", best: "Subscription/SaaS" },
  { name: "Stripe (International)", fee: "২.৯% + $০.৩০", setup: "US/UK entity", time: "T+2", best: "গ্লোবাল সেল" },
];

const SOURCING_HUBS = [
  { name: "চীন - 1688.com", cat: "সবকিছু (চীনা ভাষা)", cost: "সবচেয়ে কম", lead: "১৫-৩০ দিন", note: "এজেন্ট লাগে (Yiwu, Guangzhou)" },
  { name: "চীন - Alibaba.com", cat: "B2B বাল্ক", cost: "কম", lead: "২০-৪০ দিন", note: "ইংরেজি, MOQ থাকে" },
  { name: "ভারত - IndiaMART", cat: "টেক্সটাইল, ফার্মা, হার্ডওয়্যার", cost: "মাঝারি", lead: "১০-২০ দিন", note: "শিপিং সহজ" },
  { name: "ইসলামপুর, ঢাকা", cat: "কাপড়, শাড়ি, পাঞ্জাবি (পাইকারি)", cost: "কম", lead: "একই দিন", note: "শুক্রবার বন্ধ" },
  { name: "চকবাজার, পুরান ঢাকা", cat: "কসমেটিকস, খেলনা, গৃহস্থালি", cost: "খুব কম", lead: "একই দিন", note: "ক্যাশ পেমেন্ট" },
  { name: "নিউ মার্কেট, ঢাকা", cat: "ব্যাগ, জুতা, গিফট আইটেম", cost: "কম", lead: "একই দিন", note: "দাম দরকষাকষি" },
  { name: "কেরানীগঞ্জ", cat: "গার্মেন্টস (লেফট-ওভার + নতুন)", cost: "সবচেয়ে কম", lead: "১-২ দিন", note: "বাল্কে নাও" },
  { name: "নবাবপুর", cat: "ইলেকট্রনিক্স, যন্ত্রপাতি, হার্ডওয়্যার", cost: "মাঝারি", lead: "একই দিন", note: "" },
];

const CONTENT_CHANNELS = [
  { name: "Facebook Feed Post", cost: "ফ্রি (অর্গানিক) / Boost ৳২০০-১,০০০", reach: "১,০০০-৫০,০০০", best: "B2C, সব বয়স" },
  { name: "Facebook Reels", cost: "ফ্রি / Boost ৳৩০০+", reach: "৫,০০০-৫,০০,০০০", best: "ভাইরাল পটেনশিয়াল" },
  { name: "Instagram Reels", cost: "ফ্রি / Promo", reach: "২,০০০-১,০০,০০০", best: "Fashion, Beauty, Food" },
  { name: "TikTok Bangladesh", cost: "ফ্রি", reach: "১০,০০০-১০,০০,০০০", best: "Gen Z, ভাইরাল প্রোডাক্ট" },
  { name: "YouTube Shorts", cost: "ফ্রি", reach: "৫,০০০-৫,০০,০০০", best: "টিউটোরিয়াল, রিভিউ" },
  { name: "YouTube Long-form", cost: "ফ্রি (টাইম ইনভেস্ট)", reach: "১,০০০-১,০০,০০০", best: "Trust building, SEO" },
  { name: "Meta Ads (FB+IG)", cost: "৳৩০০-৫,০০০/দিন", reach: "টার্গেটেড", best: "Direct sales, ROAS ২-৪x" },
  { name: "Google Ads", cost: "৳৫০০-৫,০০০/দিন", reach: "ইনটেন্ট", best: "High-ticket, B2B" },
  { name: "Influencer Marketing", cost: "৳৩,০০০-১,০০,০০০/পোস্ট", reach: "তাদের ফলোয়ার", best: "Trust + reach" },
  { name: "WhatsApp Broadcast", cost: "ফ্রি / API ৳০.৩০-০.৮০/মেসেজ", reach: "নিজের লিস্ট", best: "Repeat customer" },
  { name: "SMS Marketing", cost: "৳০.২৫-০.৫০/SMS", reach: "নাম্বার লিস্ট", best: "Promo, OTP" },
  { name: "Email Marketing", cost: "ফ্রি (Mailchimp ২,০০০ পর্যন্ত)", reach: "সাবস্ক্রাইবার", best: "Long-term retention" },
];

const OFFLINE_IDEAS = [
  { name: "চা/কফি স্টল", cap: "৳১৫,০০০-৩০,০০০", profit: "৳২০,০০০-৬০,০০০/মাস", spot: "অফিস পাড়া, ক্যাম্পাস" },
  { name: "স্ট্রিট ফুড (বার্গার/ফুচকা/কাবাব)", cap: "৳৩০,০০০-৮০,০০০", profit: "৳৩০,০০০-১,৫০,০০০/মাস", spot: "মার্কেট, পার্ক" },
  { name: "মুদি দোকান", cap: "৳১,০০,০০০-৩,০০,০০০", profit: "৳২৫,০০০-৭০,০০০/মাস", spot: "আবাসিক এলাকা" },
  { name: "ফার্মেসি (ড্রাগ লাইসেন্স লাগবে)", cap: "৳২,০০,০০০-৫,০০,০০০", profit: "৳৫০,০০০-২,০০,০০০/মাস", spot: "হাসপাতাল পাশে" },
  { name: "সেলুন / পার্লার", cap: "৳৫০,০০০-২,০০,০০০", profit: "৳৩০,০০০-১,৫০,০০০/মাস", spot: "মেইন রোড" },
  { name: "টেইলরিং / বুটিক", cap: "৳৪০,০০০-১,৫০,০০০", profit: "৳২৫,০০০-১,০০,০০০/মাস", spot: "মহিলা মার্কেট" },
  { name: "মোবাইল সার্ভিসিং", cap: "৳৫০,০০০-১,৫০,০০০", profit: "৳৩০,০০০-১,২০,০০০/মাস", spot: "যেকোনো বাজার" },
  { name: "জিম / ফিটনেস সেন্টার", cap: "৳৩,০০,০০০-১৫,০০,০০০", profit: "৳৫০,০০০-৩,০০,০০০/মাস", spot: "মিডল ক্লাস এরিয়া" },
  { name: "কোচিং সেন্টার", cap: "৳২০,০০০-১,৫০,০০০", profit: "৳৩০,০০০-২,০০,০০০/মাস", spot: "স্কুল-কলেজের কাছে" },
  { name: "ফটোকপি + প্রিন্টিং + কম্পিউটার সার্ভিস", cap: "৳৮০,০০০-২,০০,০০০", profit: "৳২০,০০০-৬০,০০০/মাস", spot: "অফিস/স্কুল পাশে" },
];

const AGRI_IDEAS = [
  { name: "ব্রয়লার মুরগি (৫০০-১০০০)", cap: "৳১,৫০,০০০-৩,০০,০০০", cycle: "৩০-৩৫ দিন", profit: "প্রতি সাইকেলে ৳৩০,০০০-৮০,০০০" },
  { name: "লেয়ার মুরগি (ডিম)", cap: "৳২,০০,০০০-৫,০০,০০০", cycle: "চলমান", profit: "৳৪০,০০০-১,৫০,০০০/মাস" },
  { name: "গরু মোটাতাজাকরণ (ঈদ টার্গেট)", cap: "৳৫০,০০০/গরু × ৫-১০ টা", cycle: "৬-৯ মাস", profit: "৳৩০,০০০-১,০০,০০০/গরু" },
  { name: "ছাগল পালন (ব্ল্যাক বেঙ্গল)", cap: "৳১,০০,০০০-৩,০০,০০০", cycle: "৬-৮ মাস", profit: "৩০-৫০% ROI" },
  { name: "মাছ চাষ (পুকুর লিজ)", cap: "৳২,০০,০০০-১০,০০,০০০", cycle: "৬ মাস", profit: "প্রতি সাইকেলে ৩০-৬০% মার্জিন" },
  { name: "মাশরুম চাষ", cap: "৳২৫,০০০-৮০,০০০", cycle: "চলমান (২০ দিন)", profit: "৳১৫,০০০-৬০,০০০/মাস" },
  { name: "মৌমাছি চাষ (মধু)", cap: "৳৮০,০০০-২,০০,০০০", cycle: "মৌসুমি", profit: "বছরে ৳১-৩ লাখ" },
  { name: "ছাদ বাগান / হাইড্রোপনিক", cap: "৳৫০,০০০-৩,০০,০০০", cycle: "চলমান", profit: "৳১৫,০০০-৮০,০০০/মাস" },
  { name: "ডেইরি ফার্ম (৫-১০ গাভী)", cap: "৳৮,০০,০০০-২০,০০,০০০", cycle: "চলমান", profit: "৳১,০০,০০০-৩,০০,০০০/মাস" },
  { name: "নার্সারি (চারা গাছ)", cap: "৳৫০,০০০-২,০০,০০০", cycle: "চলমান", profit: "৩০-১০০% মার্জিন" },
];

const PROPERTY_IDEAS = [
  { name: "জমি কেনা-বেচা (ফ্লিপ)", note: "৬-২৪ মাসে ২০-১০০% ROI সম্ভব। দলিল, খতিয়ান, মৌজা ম্যাপ যাচাই — অ্যাডভোকেট নাও।", risk: "মাঝারি", min: "৳১০ লাখ+" },
  { name: "প্লট ডেভেলপমেন্ট", note: "কাঁচা জমি → প্লট → বিক্রি। RAJUK/CDA অনুমোদন।", risk: "উচ্চ", min: "৳৫০ লাখ+" },
  { name: "ফ্ল্যাট কিনে ভাড়া দেওয়া", note: "ঢাকায় ৫-৭% রেন্টাল ইল্ড। লং-টার্ম অ্যাপ্রিসিয়েশন ৮-১২%/বছর।", risk: "কম", min: "৳৪০ লাখ+" },
  { name: "সাবলেট / কো-লিভিং", note: "১টা বড় ফ্ল্যাট নিয়ে রুম-বাই-রুম ভাড়া। ROI ২০-৪০%/বছর।", risk: "কম", min: "৳৫ লাখ ডিপোজিট" },
  { name: "Airbnb / হলিডে রেন্টাল", note: "কক্সবাজার, সাজেক, কুয়াকাটা। ফার্নিশড ফ্ল্যাট/রিসোর্ট রুম।", risk: "মাঝারি", min: "৳১০ লাখ+" },
  { name: "কমার্শিয়াল স্পেস ভাড়া", note: "দোকান/অফিস স্পেস কিনে কোম্পানিকে ভাড়া। স্থিতিশীল ক্যাশফ্লো।", risk: "কম", min: "৳৩০ লাখ+" },
  { name: "ওয়্যারহাউস / গোডাউন ভাড়া", note: "ই-কমার্স বুমের জন্য সাভার, গাজীপুর, কেরানীগঞ্জ হট।", risk: "কম", min: "৳২০ লাখ+" },
  { name: "বিদেশে প্রপার্টি (দুবাই, মালয়েশিয়া)", note: "Golden Visa, রেন্টাল ইল্ড ৫-৮%, USD এ আয়।", risk: "মাঝারি", min: "$৫০,০০০+" },
];

const CHALLENGES = [
  { t: "ক্যাশ ফ্লো ক্রাইসিস", s: "৩-৬ মাসের অপারেটিং কস্ট ইমার্জেন্সি ফান্ড রাখো। কাস্টমারের কাছ থেকে আগে নাও, সাপ্লায়ারকে পরে দাও।" },
  { t: "ফেক অর্ডার / COD রিটার্ন", s: "অর্ডার কনফার্মেশন কল, IP-blacklist, অ্যাডভান্স ৳১০০, কুরিয়ারের রিটার্ন রিপোর্ট দেখে রিপিট ব্লক।" },
  { t: "প্রতিযোগিতা", s: "প্রাইসে লড়ো না — ব্র্যান্ড, সার্ভিস, প্যাকেজিং, রিটার্ন পলিসিতে এগিয়ে থাকো।" },
  { t: "অ্যাড কস্ট বৃদ্ধি", s: "অর্গানিক কনটেন্ট + রিটার্গেটিং + লয়াল্টি প্রোগ্রাম। ইমেইল/SMS লিস্ট নিজের সম্পদ।" },
  { t: "টিম ম্যানেজমেন্ট", s: "প্রথমে ভার্চুয়াল অ্যাসিস্ট্যান্ট, পরে ফুল-টাইম। স্পষ্ট SOP লেখো।" },
  { t: "লিগ্যাল ঝামেলা", s: "ট্রেড লাইসেন্স, TIN, VAT, ই-কমার্স পলিসি (২০২১) মেনে চলো। ভোক্তা অধিকার আইন জানো।" },
  { t: "সাপ্লায়ার ধোঁকা", s: "প্রথমে স্যাম্পল, ছোট অর্ডার, পেমেন্ট ৫০-৫০ (অ্যাডভান্স/ডেলিভারির পরে)। চীনে এজেন্ট ভেরিফাই করো।" },
  { t: "মানসিক চাপ / বার্নআউট", s: "সপ্তাহে ১ দিন ছুটি, পরিবার-নামাজ-ব্যায়াম, mentor/community যুক্ত হও।" },
];

const POLICIES = [
  "ডিজিটাল কমার্স পরিচালনা নির্দেশিকা ২০২১ — অর্ডারের ৫ দিনের মধ্যে শিপ, ১০ দিনে ডেলিভারি; অন্যথায় রিফান্ড বাধ্যতামূলক।",
  "ভোক্তা অধিকার সংরক্ষণ আইন ২০০৯ — মিথ্যা বিজ্ঞাপন, ভেজাল পণ্যে শাস্তি।",
  "ভ্যাট: ই-কমার্সে ৫% (সার্ভিস ফি-র উপর), বিক্রয়ে ০-১৫% (পণ্যভেদে)।",
  "আয়কর: ব্যবসায়িক আয়ে ০-৩০% স্ল্যাব; কোম্পানি হলে ২২.৫-২৭.৫%।",
  "ট্রেডমার্ক রেজিস্ট্রেশন — ব্র্যান্ড সুরক্ষায় DPDT তে ৳৩,৫০০-৫,০০০।",
  "ই-কমার্স রিটার্ন পলিসি স্পষ্ট লিখে দাও — ৭ দিন রিটার্ন স্ট্যান্ডার্ড।",
];

const PRICING_FORMULA = `
সেল প্রাইস = (সোর্সিং কস্ট + প্যাকেজিং + কুরিয়ার + অ্যাড কস্ট প্রতি অর্ডার + অপারেটিং) × (১ + কাঙ্ক্ষিত মার্জিন)

উদাহরণ — মিনি ব্লেন্ডার:
• সোর্সিং (চীন থেকে): ৳৫৫০
• শিপিং + কাস্টমস: ৳১০০
• প্যাকেজিং: ৳৩০
• কুরিয়ার (গড়): ৳৮০
• অ্যাড কস্ট প্রতি অর্ডার (CPP): ৳২৫০
• অপারেটিং (ফোন, ইন্টারনেট, প্যাকার): ৳৫০
─────────────────────────
মোট কস্ট: ৳১,০৬০
মার্জিন ৪০%: ৳৪২৪
সেল প্রাইস: ৳১,৪৯০ (রাউন্ডেড)
নেট প্রফিট/অর্ডার: ৳৪৩০
১০০ অর্ডারে: ৳৪৩,০০০
`;

export default function BusinessGuide() {
  const { language } = useLanguage();
  const isBn = language === "bn";
  const [q, setQ] = useState("");

  const filteredProducts = useMemo(
    () => WINNING_PRODUCTS.filter((p) => p.name.toLowerCase().includes(q.toLowerCase()) || p.cat.toLowerCase().includes(q.toLowerCase())),
    [q]
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      {/* Hero */}
      <section className="relative overflow-hidden border-b">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
        <div className="container relative mx-auto px-4 py-16 md:py-24">
          <Badge variant="secondary" className="mb-4 gap-1">
            <Rocket className="h-3 w-3" /> {isBn ? "বিজনেস গাইড — শূন্য থেকে শীর্ষে" : "Business Guide — Zero to Top"}
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4 max-w-3xl">
            {isBn ? "শূন্য থেকে শুরু করে শীর্ষ ব্যবসায়ী হওয়ার পূর্ণাঙ্গ রোডম্যাপ" : "The Complete Roadmap From Zero to Top Entrepreneur"}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mb-6">
            {isBn
              ? "F-Commerce, E-Commerce, অফলাইন, কৃষি, ইন্ডাস্ট্রি, ল্যান্ড প্রপার্টি — প্রতিটি ক্ষেত্রের গাইডলাইন, সিস্টেম, কুরিয়ার-পেমেন্ট ইন্টিগ্রেশন, প্রোডাক্ট সোর্সিং, কনটেন্ট ও অ্যাড স্ট্র্যাটেজি, খরচ-মার্জিন হিসাব, চ্যালেঞ্জ ও নীতিমালা — সবকিছু এক জায়গায়।"
              : "F-Commerce, E-Commerce, Offline, Agri, Industry, Real Estate — every domain's guidelines, systems, courier-payment integrations, sourcing, content & ad strategy, cost-margin math, challenges and policies — all in one place."}
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              { i: Target, t: "Roadmap" },
              { i: ShoppingBag, t: "F-Commerce" },
              { i: Globe, t: "E-Commerce" },
              { i: Package, t: "Sourcing" },
              { i: Megaphone, t: "Marketing" },
              { i: Building2, t: "Offline" },
              { i: Sprout, t: "Agri" },
              { i: MapPin, t: "Property" },
            ].map((c) => (
              <Badge key={c.t} variant="outline" className="gap-1 py-1.5 px-3">
                <c.i className="h-3.5 w-3.5" /> {c.t}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-10">
        <Tabs defaultValue="roadmap" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-8 h-auto gap-1">
            <TabsTrigger value="roadmap" className="text-xs md:text-sm"><Target className="h-3.5 w-3.5 mr-1" />রোডম্যাপ</TabsTrigger>
            <TabsTrigger value="products" className="text-xs md:text-sm"><TrendingUp className="h-3.5 w-3.5 mr-1" />উইনিং প্রোডাক্ট</TabsTrigger>
            <TabsTrigger value="fcommerce" className="text-xs md:text-sm"><ShoppingBag className="h-3.5 w-3.5 mr-1" />F-Commerce</TabsTrigger>
            <TabsTrigger value="ecommerce" className="text-xs md:text-sm"><Globe className="h-3.5 w-3.5 mr-1" />E-Commerce</TabsTrigger>
            <TabsTrigger value="sourcing" className="text-xs md:text-sm"><Package className="h-3.5 w-3.5 mr-1" />সোর্সিং</TabsTrigger>
            <TabsTrigger value="marketing" className="text-xs md:text-sm"><Megaphone className="h-3.5 w-3.5 mr-1" />মার্কেটিং</TabsTrigger>
            <TabsTrigger value="capital" className="text-xs md:text-sm"><Wallet className="h-3.5 w-3.5 mr-1" />ক্যাপিটাল-ভিত্তিক</TabsTrigger>
            <TabsTrigger value="more" className="text-xs md:text-sm"><Briefcase className="h-3.5 w-3.5 mr-1" />অন্যান্য</TabsTrigger>
          </TabsList>

          {/* Roadmap */}
          <TabsContent value="roadmap" className="mt-8 space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              {ROADMAP.map((s, i) => (
                <Card key={i} className="p-6 hover:shadow-lg transition-all border-l-4 border-l-primary">
                  <h3 className="text-xl font-bold mb-2 flex items-start gap-2">
                    <span className="text-primary">{s.title}</span>
                  </h3>
                  <p className="text-muted-foreground mb-3">{s.desc}</p>
                  {s.tips && (
                    <ul className="space-y-1.5">
                      {s.tips.map((t, j) => (
                        <li key={j} className="flex gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" /> {t}
                        </li>
                      ))}
                    </ul>
                  )}
                </Card>
              ))}
            </div>

            <Card className="p-6 bg-primary/5 border-primary/20">
              <h3 className="text-xl font-bold mb-3 flex items-center gap-2"><Lightbulb className="h-5 w-5 text-primary" /> প্রাইসিং ফর্মুলা ও উদাহরণ</h3>
              <pre className="text-sm bg-background p-4 rounded-md whitespace-pre-wrap font-mono overflow-x-auto">{PRICING_FORMULA}</pre>
            </Card>
          </TabsContent>

          {/* Winning Products */}
          <TabsContent value="products" className="mt-8 space-y-4">
            <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="প্রোডাক্ট/ক্যাটাগরি সার্চ..."
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Badge variant="outline" className="px-3 py-1.5">মোট {filteredProducts.length} টি প্রোডাক্ট</Badge>
            </div>
            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-3 font-semibold">প্রোডাক্ট</th>
                    <th className="text-left p-3 font-semibold">ক্যাটাগরি</th>
                    <th className="text-left p-3 font-semibold">সোর্সিং কস্ট</th>
                    <th className="text-left p-3 font-semibold">সেল প্রাইস</th>
                    <th className="text-left p-3 font-semibold">মার্জিন</th>
                    <th className="text-left p-3 font-semibold">চাহিদা</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((p, i) => (
                    <tr key={i} className="border-t hover:bg-muted/30">
                      <td className="p-3 font-medium">{p.name}</td>
                      <td className="p-3"><Badge variant="secondary">{p.cat}</Badge></td>
                      <td className="p-3 text-muted-foreground">{p.sourcing}</td>
                      <td className="p-3 font-semibold text-primary">{p.sell}</td>
                      <td className="p-3 text-green-600 dark:text-green-400 font-semibold">{p.margin}</td>
                      <td className="p-3">{p.demand}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Card className="p-5 bg-amber-500/10 border-amber-500/30">
              <p className="text-sm flex gap-2"><Lightbulb className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" /> <span><b>উইনিং প্রোডাক্ট খুঁজবে যেভাবে:</b> Facebook Ads Library → টপ অ্যাডভার্টাইজার দেখো, AliExpress → "Sort by Orders", TikTok Shop → trending, Google Trends → rising queries। যে প্রোডাক্ট একসাথে অনেকে অ্যাড চালাচ্ছে = ডিমান্ড আছে।</span></p>
            </Card>
          </TabsContent>

          {/* F-Commerce */}
          <TabsContent value="fcommerce" className="mt-8 space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              {FCOMMERCE_STEPS.map((s, i) => (
                <Card key={i} className="p-5">
                  <div className="flex items-start gap-3">
                    <div className="h-9 w-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold shrink-0">{i + 1}</div>
                    <div>
                      <h3 className="font-bold mb-1">{s.title}</h3>
                      <p className="text-sm text-muted-foreground">{s.desc}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
            <Card className="p-6">
              <h3 className="font-bold mb-3 flex items-center gap-2"><Camera className="h-4 w-4" /> বিজয়ী পোস্ট ফর্মুলা</h3>
              <div className="text-sm bg-muted/40 p-4 rounded-md space-y-2">
                <p>🔥 <b>Hook:</b> "এই ব্লেন্ডারটা আমার লাইফ চেঞ্জ করে দিল! 😱"</p>
                <p>❌ <b>সমস্যা:</b> "বাইরে গেলে ফ্রেশ জুস পেতাম না, বড় ব্লেন্ডার বহন করা যায় না..."</p>
                <p>✅ <b>সমাধান:</b> "এই মিনি পোর্টেবল ব্লেন্ডার USB তে চার্জ হয়, ব্যাগে রাখা যায়।"</p>
                <p>🎯 <b>বেনিফিট:</b> অফিসে, জিমে, ট্যুরে — যেকোনো জায়গায় ৩০ সেকেন্ডে ফ্রেশ জুস।</p>
                <p>💰 <b>প্রাইস:</b> মাত্র ১,৪৯০৳ (ফ্রি ডেলিভারি ঢাকার ভেতরে)।</p>
                <p>📞 <b>CTA:</b> অর্ডার করতে ইনবক্স অথবা কল 01XXX-XXXXXX</p>
              </div>
            </Card>
          </TabsContent>

          {/* E-Commerce */}
          <TabsContent value="ecommerce" className="mt-8 space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              {ECOMMERCE_STEPS.map((s, i) => (
                <Card key={i} className="p-5 border-l-4 border-l-accent">
                  <h3 className="font-bold mb-1 flex items-center gap-2"><ArrowRight className="h-4 w-4 text-accent" />{s.title}</h3>
                  <p className="text-sm text-muted-foreground">{s.desc}</p>
                </Card>
              ))}
            </div>

            <Card className="p-6">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Truck className="h-5 w-5" /> কুরিয়ার ইন্টিগ্রেশন</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50"><tr>
                    <th className="text-left p-2">কুরিয়ার</th><th className="text-left p-2">এরিয়া</th><th className="text-left p-2">রেট</th><th className="text-left p-2">API</th><th className="text-left p-2">COD রিটার্ন</th>
                  </tr></thead>
                  <tbody>
                    {COURIERS.map((c) => (
                      <tr key={c.name} className="border-t"><td className="p-2 font-medium">{c.name}</td><td className="p-2">{c.area}</td><td className="p-2">{c.rate}</td><td className="p-2">{c.api}</td><td className="p-2">{c.cod}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><CreditCard className="h-5 w-5" /> পেমেন্ট মেথড</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50"><tr>
                    <th className="text-left p-2">গেটওয়ে</th><th className="text-left p-2">ফি</th><th className="text-left p-2">সেটআপ</th><th className="text-left p-2">সেটেলমেন্ট</th><th className="text-left p-2">বেস্ট ফিট</th>
                  </tr></thead>
                  <tbody>
                    {PAYMENT_METHODS.map((p) => (
                      <tr key={p.name} className="border-t"><td className="p-2 font-medium">{p.name}</td><td className="p-2">{p.fee}</td><td className="p-2 text-xs">{p.setup}</td><td className="p-2">{p.time}</td><td className="p-2">{p.best}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          {/* Sourcing */}
          <TabsContent value="sourcing" className="mt-8 space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              {SOURCING_HUBS.map((h) => (
                <Card key={h.name} className="p-5">
                  <div className="flex items-start justify-between mb-2 gap-2">
                    <h3 className="font-bold">{h.name}</h3>
                    <Badge variant="outline">{h.lead}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{h.cat}</p>
                  <div className="flex flex-wrap gap-3 text-xs">
                    <span><b>কস্ট:</b> {h.cost}</span>
                    {h.note && <span className="text-muted-foreground">📝 {h.note}</span>}
                  </div>
                </Card>
              ))}
            </div>
            <Card className="p-6 bg-blue-500/10 border-blue-500/30">
              <h3 className="font-bold mb-3">স্টক ম্যানেজমেন্ট টিপস</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" /> ABC Analysis — A (২০% প্রোডাক্ট = ৮০% সেল) তে বেশি স্টক রাখো</li>
                <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" /> Re-order point = (Avg daily sale × Lead time) + Safety stock</li>
                <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" /> Dead stock এর জন্য মাসিক ক্লিয়ারেন্স সেল — ক্যাশ ফেরত আনো</li>
                <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" /> FIFO (First In First Out) — বিশেষ করে কসমেটিকস/ফুডে এক্সপায়ারি বাঁচাতে</li>
              </ul>
            </Card>
          </TabsContent>

          {/* Marketing */}
          <TabsContent value="marketing" className="mt-8 space-y-4">
            <Card className="p-6">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Megaphone className="h-5 w-5" /> চ্যানেল-ভিত্তিক খরচ ও রিচ</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50"><tr>
                    <th className="text-left p-2">চ্যানেল</th><th className="text-left p-2">খরচ</th><th className="text-left p-2">রিচ (গড়)</th><th className="text-left p-2">বেস্ট ফর</th>
                  </tr></thead>
                  <tbody>
                    {CONTENT_CHANNELS.map((c) => (
                      <tr key={c.name} className="border-t"><td className="p-2 font-medium">{c.name}</td><td className="p-2">{c.cost}</td><td className="p-2">{c.reach}</td><td className="p-2">{c.best}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            <Accordion type="single" collapsible className="bg-card border rounded-lg">
              <AccordionItem value="content" className="border-b">
                <AccordionTrigger className="px-4">📸 কনটেন্ট তৈরি ফর্মুলা</AccordionTrigger>
                <AccordionContent className="px-4 space-y-2 text-sm">
                  <p>• দৈনিক ১-২ পোস্ট, সপ্তাহে ৩-৫ রিল/শর্টস</p>
                  <p>• ৬০% এডুকেশনাল, ২০% সেলস, ২০% বিহাইন্ড-দ্য-সিন</p>
                  <p>• Hook → Story → Value → CTA — প্রতিটি কনটেন্টে</p>
                  <p>• CapCut, InShot দিয়ে এডিট — ফোনেই হয়</p>
                  <p>• 9:16 ভিডিও (Reels/TikTok), 1:1 ফিড পোস্ট, 4:5 ক্যারোসেল</p>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="boost" className="border-b">
                <AccordionTrigger className="px-4">🚀 বুস্টিং / অ্যাড স্ট্র্যাটেজি</AccordionTrigger>
                <AccordionContent className="px-4 space-y-2 text-sm">
                  <p>• Meta Ads Manager → Sales/Conversion ক্যাম্পেইন (Boost Post নয়)</p>
                  <p>• দৈনিক বাজেট: শুরুতে ৳৩০০-৫০০, ROAS 2x+ হলে স্কেল</p>
                  <p>• Audience: Bangladesh, Age 18-45, Interest-based</p>
                  <p>• Creative: ৩-৫ ভ্যারিয়েশন টেস্ট, ৭২ ঘণ্টায় winning বের</p>
                  <p>• Retargeting: পেজ ভিজিটর, ভিডিও ভিউয়ার, কার্ট অ্যাবান্ডনার</p>
                  <p>• Pixel/Conversion API অবশ্যই সেটআপ করো</p>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="post">
                <AccordionTrigger className="px-4">📍 পোস্টিং প্ল্যাটফর্ম রেট</AccordionTrigger>
                <AccordionContent className="px-4 space-y-2 text-sm">
                  <p>• <b>Facebook Boost:</b> ৳২০০-১,০০০ — কম এনগেজমেন্ট</p>
                  <p>• <b>Meta Ads Manager:</b> ৳৩০০-৫,০০০/দিন — হাই কনভার্সন</p>
                  <p>• <b>Google Ads:</b> ৳৫০০-৫,০০০/দিন — ইনটেন্ট ট্রাফিক</p>
                  <p>• <b>TikTok Ads BD:</b> ৳৪০০-৩,০০০/দিন — ইয়ং অডিয়েন্স</p>
                  <p>• <b>Influencer (Micro):</b> ৳৩,০০০-১৫,০০০/পোস্ট</p>
                  <p>• <b>Influencer (Macro):</b> ৳২৫,০০০-১,০০,০০০/পোস্ট</p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </TabsContent>

          {/* Capital-Based */}
          <TabsContent value="capital" className="mt-8 space-y-6">
            {CAPITAL_TIERS.map((tier) => (
              <Card key={tier.range} className="p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-primary" /> {tier.range}
                </h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {tier.ideas.map((idea) => (
                    <div key={idea.name} className="p-4 rounded-lg border bg-muted/20 hover:bg-muted/40 transition-colors">
                      <h4 className="font-semibold mb-2">{idea.name}</h4>
                      <div className="space-y-1 text-xs">
                        <p><b>প্রয়োজন:</b> {idea.need}</p>
                        <p className="text-green-600 dark:text-green-400"><b>সম্ভাব্য আয়:</b> {idea.profit}</p>
                        <p><b>ঝুঁকি:</b> {idea.risk}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </TabsContent>

          {/* More */}
          <TabsContent value="more" className="mt-8 space-y-6">
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Building2 className="h-5 w-5" /> অফলাইন বিজনেস আইডিয়া</h3>
              <div className="grid md:grid-cols-2 gap-3">
                {OFFLINE_IDEAS.map((i) => (
                  <div key={i.name} className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-1">{i.name}</h4>
                    <div className="text-xs space-y-0.5 text-muted-foreground">
                      <p><b>ক্যাপিটাল:</b> {i.cap}</p>
                      <p className="text-green-600 dark:text-green-400"><b>আয়:</b> {i.profit}</p>
                      <p><b>লোকেশন:</b> {i.spot}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Sprout className="h-5 w-5 text-green-600" /> কৃষি / খামার / ইন্ডাস্ট্রি</h3>
              <div className="grid md:grid-cols-2 gap-3">
                {AGRI_IDEAS.map((i) => (
                  <div key={i.name} className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-1">{i.name}</h4>
                    <div className="text-xs space-y-0.5 text-muted-foreground">
                      <p><b>ক্যাপিটাল:</b> {i.cap}</p>
                      <p><b>সাইকেল:</b> {i.cycle}</p>
                      <p className="text-green-600 dark:text-green-400"><b>আয়:</b> {i.profit}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><MapPin className="h-5 w-5" /> ল্যান্ড / প্রপার্টি বিজনেস (বাংলাদেশ + বিদেশ)</h3>
              <div className="space-y-3">
                {PROPERTY_IDEAS.map((p) => (
                  <div key={p.name} className="p-4 border rounded-lg flex flex-col md:flex-row gap-3 md:items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold">{p.name}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{p.note}</p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Badge variant="outline">ঝুঁকি: {p.risk}</Badge>
                      <Badge>{p.min}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6 bg-destructive/5 border-destructive/30">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-destructive" /> চ্যালেঞ্জ ও সমাধান</h3>
              <div className="grid md:grid-cols-2 gap-3">
                {CHALLENGES.map((c) => (
                  <div key={c.t} className="p-4 border rounded-lg bg-background">
                    <h4 className="font-semibold text-destructive mb-1">{c.t}</h4>
                    <p className="text-sm text-muted-foreground">{c.s}</p>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><ShieldCheck className="h-5 w-5" /> ব্যবসা নীতিমালা ও আইন (বাংলাদেশ)</h3>
              <ul className="space-y-2">
                {POLICIES.map((p, i) => (
                  <li key={i} className="flex gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-primary/10 to-accent/10 border-primary/30">
              <h3 className="text-xl font-bold mb-2 flex items-center gap-2"><Phone className="h-5 w-5" /> ১:১ বিজনেস মেন্টরশিপ দরকার?</h3>
              <p className="text-sm text-muted-foreground mb-4">
                আপনার আইডিয়া, বাজেট ও লক্ষ্য অনুযায়ী কাস্টম রোডম্যাপ, প্রোডাক্ট রিসার্চ, সাপ্লায়ার কানেকশন, অ্যাড স্ট্র্যাটেজি — সরাসরি সেশনের মাধ্যমে।
              </p>
              <div className="flex flex-wrap gap-2">
                <Button asChild>
                  <a href="/appointment"><CalendarIcon /> অ্যাপয়েন্টমেন্ট বুক করো</a>
                </Button>
                <Button asChild variant="outline">
                  <a href="/chat">লাইভ চ্যাটে কথা বলো</a>
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function CalendarIcon() {
  return <Briefcase className="h-4 w-4 mr-1" />;
}
