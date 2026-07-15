import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Loader2, User as UserIcon, Mail, Phone, Save, LogOut, ShoppingCart, Briefcase,
  Camera, MapPin, Cake, Globe, Facebook, MessageCircle, Wallet, Package, Heart,
  Shield, Bell, Palette, KeyRound, Sparkles, TrendingUp, ExternalLink, Copy,
  Trash2, ImageIcon, Star, Edit3, Award, CalendarDays,
} from "lucide-react";
import { toast } from "sonner";

type Profile = {
  user_id: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  cover_url?: string | null;
  bio?: string | null;
  address?: string | null;
  city?: string | null;
  country?: string | null;
  date_of_birth?: string | null;
  gender?: string | null;
  occupation?: string | null;
  website?: string | null;
  facebook?: string | null;
  whatsapp?: string | null;
  monthly_income?: number | null;
  currency?: string | null;
  language_pref?: string | null;
  theme_pref?: string | null;
  notifications_enabled?: boolean | null;
  created_at?: string;
};

type Stats = {
  orders: number;
  cartValue: number;
  netWorth: number;
  portfolio: number;
  vault: number;
  services: number;
};

export default function ProfilePage() {
  const { user, loading: authLoading, signOut } = useAuth();
  const { language } = useLanguage();
  const isBn = language === "bn";
  const navigate = useNavigate();

  const [p, setP] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<"avatar" | "cover" | null>(null);
  const [stats, setStats] = useState<Stats>({ orders: 0, cartValue: 0, netWorth: 0, portfolio: 0, vault: 0, services: 0 });
  const [newPassword, setNewPassword] = useState("");
  const avatarInput = useRef<HTMLInputElement>(null);
  const coverInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate("/auth"); return; }
    (async () => {
      setLoading(true);
      const { data } = await supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle();
      setP(data ?? { user_id: user.id, full_name: null, phone: null, avatar_url: null });

      // Aggregate stats in parallel
      const [orders, wallets, portfolio, vault, services] = await Promise.all([
        supabase.from("shop_orders").select("id", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("finance_wallets").select("balance").eq("user_id", user.id),
        supabase.from("portfolio_projects").select("id", { count: "exact", head: true }),
        supabase.from("vault_items").select("id", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("service_orders").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      ]);
      const netWorth = (wallets.data ?? []).reduce((s: number, w: any) => s + Number(w.balance || 0), 0);
      setStats({
        orders: orders.count ?? 0,
        cartValue: 0,
        netWorth,
        portfolio: portfolio.count ?? 0,
        vault: vault.count ?? 0,
        services: services.count ?? 0,
      });
      setLoading(false);
    })();
  }, [user, authLoading, navigate]);

  const update = (patch: Partial<Profile>) => setP((prev) => (prev ? { ...prev, ...patch } : prev));

  const handleSave = async () => {
    if (!user || !p) return;
    setSaving(true);
    const payload = {
      user_id: user.id,
      full_name: p.full_name?.trim() || null,
      phone: p.phone?.trim() || null,
      avatar_url: p.avatar_url?.trim() || null,
      cover_url: p.cover_url?.trim() || null,
      bio: p.bio?.trim() || null,
      address: p.address?.trim() || null,
      city: p.city?.trim() || null,
      country: p.country?.trim() || null,
      date_of_birth: p.date_of_birth || null,
      gender: p.gender || null,
      occupation: p.occupation?.trim() || null,
      website: p.website?.trim() || null,
      facebook: p.facebook?.trim() || null,
      whatsapp: p.whatsapp?.trim() || null,
      monthly_income: p.monthly_income ?? null,
      currency: p.currency || "BDT",
      language_pref: p.language_pref || "bn",
      theme_pref: p.theme_pref || "system",
      notifications_enabled: p.notifications_enabled ?? true,
    };
    const { error } = await supabase.from("profiles").upsert(payload, { onConflict: "user_id" });
    setSaving(false);
    if (error) toast.error(error.message);
    else toast.success(isBn ? "প্রোফাইল সেভ হয়েছে ✅" : "Profile saved ✅");
  };

  const uploadImage = async (file: File, kind: "avatar" | "cover") => {
    if (!user) return;
    setUploading(kind);
    try {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/${kind}-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
      if (upErr) throw upErr;
      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      const url = data.publicUrl;
      update(kind === "avatar" ? { avatar_url: url } : { cover_url: url });
      await supabase.from("profiles").upsert(
        { user_id: user.id, ...(kind === "avatar" ? { avatar_url: url } : { cover_url: url }) },
        { onConflict: "user_id" }
      );
      toast.success(isBn ? "ছবি আপলোড হয়েছে" : "Image uploaded");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setUploading(null);
    }
  };

  const handlePasswordChange = async () => {
    if (newPassword.length < 6) { toast.error(isBn ? "পাসওয়ার্ড কমপক্ষে ৬ অক্ষর" : "Min 6 characters"); return; }
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) toast.error(error.message);
    else { toast.success(isBn ? "পাসওয়ার্ড পরিবর্তন হয়েছে" : "Password updated"); setNewPassword(""); }
  };

  const handleSignOut = async () => { await signOut(); navigate("/"); };

  const copyReferral = () => {
    const link = `${window.location.origin}/auth?ref=${user?.id.slice(0, 8)}`;
    navigator.clipboard.writeText(link);
    toast.success(isBn ? "রেফারেল লিংক কপি হয়েছে" : "Referral link copied");
  };

  if (authLoading || loading || !p) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  const initials = (p.full_name || user?.email || "U").slice(0, 2).toUpperCase();
  const completeness = [p.full_name, p.phone, p.avatar_url, p.bio, p.address, p.date_of_birth, p.occupation].filter(Boolean).length;
  const completePct = Math.round((completeness / 7) * 100);
  const joined = p.created_at ? new Date(p.created_at).toLocaleDateString(isBn ? "bn-BD" : "en-US", { month: "short", year: "numeric" }) : "—";
  const fmt = (n: number) => n.toLocaleString(isBn ? "bn-BD" : "en-US");

  const quickLinks = [
    { icon: ShoppingCart, label: isBn ? "কার্ট" : "Cart", to: "/cart", color: "from-sky-500 to-blue-600" },
    { icon: Package, label: isBn ? "অর্ডার" : "Orders", to: "/dashboard", color: "from-indigo-500 to-purple-600" },
    { icon: Wallet, label: isBn ? "ফাইন্যান্স" : "Finance", to: "/finance", color: "from-emerald-500 to-teal-600" },
    { icon: Briefcase, label: isBn ? "পোর্টফোলিও" : "Portfolio", to: "/portfolio", color: "from-amber-500 to-orange-600" },
    { icon: Shield, label: isBn ? "ভল্ট" : "Vault", to: "/vault", color: "from-rose-500 to-pink-600" },
    { icon: Heart, label: isBn ? "প্রিয়" : "Favorites", to: "/shop", color: "from-red-500 to-rose-600" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30">
      {/* Cover + Avatar */}
      <div className="relative">
        <div
          className="h-48 md:h-64 w-full bg-gradient-to-br from-primary via-purple-600 to-pink-500 relative overflow-hidden"
          style={p.cover_url ? { backgroundImage: `url(${p.cover_url})`, backgroundSize: "cover", backgroundPosition: "center" } : {}}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
          <button
            onClick={() => coverInput.current?.click()}
            className="absolute top-4 right-4 bg-background/80 backdrop-blur px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 hover:bg-background transition shadow-lg"
          >
            {uploading === "cover" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ImageIcon className="w-3.5 h-3.5" />}
            {isBn ? "কভার বদলাও" : "Change cover"}
          </button>
          <input ref={coverInput} type="file" accept="image/*" className="hidden"
            onChange={(e) => e.target.files?.[0] && uploadImage(e.target.files[0], "cover")} />
        </div>

        <div className="container mx-auto px-4">
          <div className="relative -mt-16 md:-mt-20 flex flex-col md:flex-row md:items-end gap-4 md:gap-6 pb-4">
            <div className="relative group">
              {p.avatar_url ? (
                <img src={p.avatar_url} alt="avatar" className="w-32 h-32 md:w-40 md:h-40 rounded-2xl object-cover ring-4 ring-background shadow-2xl" />
              ) : (
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl bg-gradient-to-br from-primary to-purple-600 text-primary-foreground flex items-center justify-center text-4xl md:text-5xl font-bold ring-4 ring-background shadow-2xl">
                  {initials}
                </div>
              )}
              <button
                onClick={() => avatarInput.current?.click()}
                className="absolute bottom-2 right-2 bg-primary text-primary-foreground p-2 rounded-full shadow-lg hover:scale-110 transition"
              >
                {uploading === "avatar" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
              </button>
              <input ref={avatarInput} type="file" accept="image/*" className="hidden"
                onChange={(e) => e.target.files?.[0] && uploadImage(e.target.files[0], "avatar")} />
            </div>

            <div className="flex-1 min-w-0 md:pb-2">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-2xl md:text-3xl font-bold truncate bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                  {p.full_name || (isBn ? "আপনার নাম যোগ করুন" : "Add your name")}
                </h1>
                {completePct === 100 && (
                  <Badge className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white gap-1 border-0">
                    <Award className="w-3 h-3" /> {isBn ? "ভেরিফাইড" : "Verified"}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground flex items-center gap-3 flex-wrap">
                <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" />{user?.email}</span>
                {p.city && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{p.city}</span>}
                <span className="flex items-center gap-1"><CalendarDays className="w-3.5 h-3.5" />{isBn ? "যোগদান" : "Joined"} {joined}</span>
              </p>
              {p.bio && <p className="text-sm mt-2 max-w-2xl text-foreground/80">{p.bio}</p>}
            </div>

            <div className="flex gap-2 md:pb-2">
              <Button variant="outline" size="sm" onClick={copyReferral} className="gap-1.5">
                <Copy className="w-3.5 h-3.5" /> {isBn ? "রেফার" : "Refer"}
              </Button>
              <Button variant="destructive" size="sm" onClick={handleSignOut} className="gap-1.5">
                <LogOut className="w-3.5 h-3.5" /> {isBn ? "সাইন আউট" : "Sign out"}
              </Button>
            </div>
          </div>

          {/* Completeness bar */}
          {completePct < 100 && (
            <Card className="mb-6 p-4 border-primary/20 bg-gradient-to-r from-primary/5 to-purple-500/5">
              <div className="flex items-center justify-between mb-2 text-sm">
                <span className="flex items-center gap-1.5 font-medium"><Sparkles className="w-4 h-4 text-primary" />
                  {isBn ? "প্রোফাইল সম্পূর্ণতা" : "Profile completeness"}
                </span>
                <span className="font-bold text-primary">{completePct}%</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-gradient-to-r from-primary via-purple-500 to-pink-500 transition-all duration-500" style={{ width: `${completePct}%` }} />
              </div>
            </Card>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 pb-12">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
          {[
            { label: isBn ? "নেট সম্পদ" : "Net worth", value: `৳${fmt(stats.netWorth)}`, icon: TrendingUp, color: "from-emerald-500/20 to-teal-500/10 text-emerald-600" },
            { label: isBn ? "মোট অর্ডার" : "Orders", value: fmt(stats.orders), icon: Package, color: "from-blue-500/20 to-indigo-500/10 text-blue-600" },
            { label: isBn ? "পোর্টফোলিও" : "Projects", value: fmt(stats.portfolio), icon: Briefcase, color: "from-amber-500/20 to-orange-500/10 text-amber-600" },
            { label: isBn ? "ভল্ট আইটেম" : "Vault items", value: fmt(stats.vault), icon: Shield, color: "from-rose-500/20 to-pink-500/10 text-rose-600" },
          ].map((s) => (
            <Card key={s.label} className={`p-4 bg-gradient-to-br ${s.color} border-0 shadow-sm hover:shadow-lg transition`}>
              <s.icon className="w-5 h-5 mb-2 opacity-70" />
              <div className="text-lg md:text-2xl font-bold">{s.value}</div>
              <div className="text-xs opacity-80">{s.label}</div>
            </Card>
          ))}
        </div>

        {/* Quick links */}
        <Card className="p-4 mb-6">
          <h3 className="font-semibold text-sm mb-3 flex items-center gap-1.5"><Star className="w-4 h-4 text-primary" />{isBn ? "দ্রুত লিংক" : "Quick access"}</h3>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2 md:gap-3">
            {quickLinks.map((q) => (
              <button key={q.to} onClick={() => navigate(q.to)}
                className="group flex flex-col items-center gap-1.5 p-3 rounded-xl border hover:border-primary/40 hover:shadow-md transition bg-card">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${q.color} text-white flex items-center justify-center shadow group-hover:scale-110 transition`}>
                  <q.icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-medium">{q.label}</span>
              </button>
            ))}
          </div>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="personal" className="w-full">
          <TabsList className="grid grid-cols-4 mb-6 h-auto">
            <TabsTrigger value="personal" className="gap-1.5 py-2"><UserIcon className="w-3.5 h-3.5" /><span className="hidden sm:inline">{isBn ? "ব্যক্তিগত" : "Personal"}</span></TabsTrigger>
            <TabsTrigger value="contact" className="gap-1.5 py-2"><Phone className="w-3.5 h-3.5" /><span className="hidden sm:inline">{isBn ? "যোগাযোগ" : "Contact"}</span></TabsTrigger>
            <TabsTrigger value="prefs" className="gap-1.5 py-2"><Palette className="w-3.5 h-3.5" /><span className="hidden sm:inline">{isBn ? "পছন্দ" : "Prefs"}</span></TabsTrigger>
            <TabsTrigger value="security" className="gap-1.5 py-2"><Shield className="w-3.5 h-3.5" /><span className="hidden sm:inline">{isBn ? "নিরাপত্তা" : "Security"}</span></TabsTrigger>
          </TabsList>

          <TabsContent value="personal">
            <Card className="p-6 space-y-5">
              <h2 className="font-bold text-lg flex items-center gap-2"><Edit3 className="w-4 h-4 text-primary" />{isBn ? "ব্যক্তিগত তথ্য" : "Personal information"}</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{isBn ? "পূর্ণ নাম" : "Full name"}</Label>
                  <Input value={p.full_name ?? ""} onChange={(e) => update({ full_name: e.target.value })} maxLength={100} />
                </div>
                <div className="space-y-2">
                  <Label>{isBn ? "পেশা" : "Occupation"}</Label>
                  <Input value={p.occupation ?? ""} onChange={(e) => update({ occupation: e.target.value })} placeholder={isBn ? "যেমন: উদ্যোক্তা" : "e.g. Entrepreneur"} />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5"><Cake className="w-3.5 h-3.5" />{isBn ? "জন্ম তারিখ" : "Date of birth"}</Label>
                  <Input type="date" value={p.date_of_birth ?? ""} onChange={(e) => update({ date_of_birth: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>{isBn ? "লিঙ্গ" : "Gender"}</Label>
                  <Select value={p.gender ?? ""} onValueChange={(v) => update({ gender: v })}>
                    <SelectTrigger><SelectValue placeholder={isBn ? "নির্বাচন করুন" : "Select"} /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">{isBn ? "পুরুষ" : "Male"}</SelectItem>
                      <SelectItem value="female">{isBn ? "মহিলা" : "Female"}</SelectItem>
                      <SelectItem value="other">{isBn ? "অন্যান্য" : "Other"}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>{isBn ? "সংক্ষিপ্ত পরিচিতি (Bio)" : "Bio"}</Label>
                <Textarea rows={3} value={p.bio ?? ""} onChange={(e) => update({ bio: e.target.value })} maxLength={280} placeholder={isBn ? "নিজেকে কয়েক লাইনে পরিচয় দিন" : "A few lines about you"} />
                <p className="text-xs text-muted-foreground text-right">{(p.bio?.length ?? 0)}/280</p>
              </div>
              <Button onClick={handleSave} disabled={saving} className="w-full gap-2" size="lg">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {isBn ? "সেভ করো" : "Save changes"}
              </Button>
            </Card>
          </TabsContent>

          <TabsContent value="contact">
            <Card className="p-6 space-y-5">
              <h2 className="font-bold text-lg flex items-center gap-2"><Phone className="w-4 h-4 text-primary" />{isBn ? "যোগাযোগ ও ঠিকানা" : "Contact & address"}</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" />{isBn ? "ইমেইল" : "Email"}</Label>
                  <Input value={user?.email ?? ""} disabled />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" />{isBn ? "মোবাইল" : "Phone"}</Label>
                  <Input value={p.phone ?? ""} onChange={(e) => update({ phone: e.target.value })} placeholder="+880 1XXX-XXXXXX" />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5"><MessageCircle className="w-3.5 h-3.5" />WhatsApp</Label>
                  <Input value={p.whatsapp ?? ""} onChange={(e) => update({ whatsapp: e.target.value })} placeholder="+880 1XXX-XXXXXX" />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5"><Facebook className="w-3.5 h-3.5" />Facebook</Label>
                  <Input value={p.facebook ?? ""} onChange={(e) => update({ facebook: e.target.value })} placeholder="facebook.com/username" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5" />{isBn ? "ওয়েবসাইট" : "Website"}</Label>
                  <Input value={p.website ?? ""} onChange={(e) => update({ website: e.target.value })} placeholder="https://" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />{isBn ? "ঠিকানা" : "Address"}</Label>
                  <Textarea rows={2} value={p.address ?? ""} onChange={(e) => update({ address: e.target.value })} placeholder={isBn ? "রাস্তা, বাসা, এলাকা" : "Street, house, area"} />
                </div>
                <div className="space-y-2">
                  <Label>{isBn ? "শহর" : "City"}</Label>
                  <Input value={p.city ?? ""} onChange={(e) => update({ city: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>{isBn ? "দেশ" : "Country"}</Label>
                  <Input value={p.country ?? ""} onChange={(e) => update({ country: e.target.value })} />
                </div>
              </div>
              <Button onClick={handleSave} disabled={saving} className="w-full gap-2" size="lg">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {isBn ? "সেভ করো" : "Save changes"}
              </Button>
            </Card>
          </TabsContent>

          <TabsContent value="prefs">
            <Card className="p-6 space-y-5">
              <h2 className="font-bold text-lg flex items-center gap-2"><Palette className="w-4 h-4 text-primary" />{isBn ? "পছন্দ ও সেটিংস" : "Preferences"}</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{isBn ? "ভাষা" : "Language"}</Label>
                  <Select value={p.language_pref ?? "bn"} onValueChange={(v) => update({ language_pref: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bn">বাংলা</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{isBn ? "থিম" : "Theme"}</Label>
                  <Select value={p.theme_pref ?? "system"} onValueChange={(v) => update({ theme_pref: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="system">{isBn ? "সিস্টেম" : "System"}</SelectItem>
                      <SelectItem value="light">{isBn ? "আলো" : "Light"}</SelectItem>
                      <SelectItem value="dark">{isBn ? "গাঢ়" : "Dark"}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{isBn ? "মুদ্রা" : "Currency"}</Label>
                  <Select value={p.currency ?? "BDT"} onValueChange={(v) => update({ currency: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BDT">৳ BDT</SelectItem>
                      <SelectItem value="USD">$ USD</SelectItem>
                      <SelectItem value="EUR">€ EUR</SelectItem>
                      <SelectItem value="INR">₹ INR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{isBn ? "মাসিক আয় (৳)" : "Monthly income (৳)"}</Label>
                  <Input type="number" value={p.monthly_income ?? ""} onChange={(e) => update({ monthly_income: e.target.value ? Number(e.target.value) : null })} placeholder="0" />
                </div>
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-primary" />
                  <div>
                    <div className="font-medium text-sm">{isBn ? "নোটিফিকেশন" : "Notifications"}</div>
                    <div className="text-xs text-muted-foreground">{isBn ? "গুরুত্বপূর্ণ আপডেট পাবেন" : "Get important updates"}</div>
                  </div>
                </div>
                <Switch checked={p.notifications_enabled ?? true} onCheckedChange={(v) => update({ notifications_enabled: v })} />
              </div>
              <Button onClick={handleSave} disabled={saving} className="w-full gap-2" size="lg">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {isBn ? "সেভ করো" : "Save changes"}
              </Button>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <div className="space-y-4">
              <Card className="p-6 space-y-4">
                <h2 className="font-bold text-lg flex items-center gap-2"><KeyRound className="w-4 h-4 text-primary" />{isBn ? "পাসওয়ার্ড পরিবর্তন" : "Change password"}</h2>
                <div className="space-y-2">
                  <Label>{isBn ? "নতুন পাসওয়ার্ড" : "New password"}</Label>
                  <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" />
                </div>
                <Button onClick={handlePasswordChange} disabled={!newPassword} className="gap-2">
                  <KeyRound className="w-4 h-4" />{isBn ? "পাসওয়ার্ড আপডেট" : "Update password"}
                </Button>
              </Card>

              <Card className="p-6 space-y-3">
                <h2 className="font-bold text-lg flex items-center gap-2"><Shield className="w-4 h-4 text-primary" />{isBn ? "অ্যাকাউন্ট তথ্য" : "Account info"}</h2>
                <div className="grid md:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/40">
                    <span className="text-muted-foreground">User ID</span>
                    <code className="text-xs truncate max-w-[140px]">{user?.id.slice(0, 12)}…</code>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/40">
                    <span className="text-muted-foreground">{isBn ? "যোগদান" : "Joined"}</span>
                    <span className="font-medium">{joined}</span>
                  </div>
                </div>
                <Button variant="outline" className="w-full gap-2" onClick={() => window.open("mailto:support@johnnil.com")}>
                  <ExternalLink className="w-4 h-4" />{isBn ? "সাপোর্টে যোগাযোগ" : "Contact support"}
                </Button>
              </Card>

              <Card className="p-6 space-y-3 border-destructive/30 bg-destructive/5">
                <h2 className="font-bold text-lg flex items-center gap-2 text-destructive"><Trash2 className="w-4 h-4" />{isBn ? "বিপদজনক জোন" : "Danger zone"}</h2>
                <p className="text-sm text-muted-foreground">{isBn ? "অ্যাকাউন্ট মুছে ফেলতে সাপোর্টে যোগাযোগ করুন।" : "To delete your account, contact support."}</p>
                <Button variant="destructive" className="gap-2" onClick={handleSignOut}>
                  <LogOut className="w-4 h-4" />{isBn ? "সাইন আউট" : "Sign out"}
                </Button>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
