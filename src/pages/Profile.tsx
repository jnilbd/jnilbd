import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, User as UserIcon, Mail, Phone, Save, LogOut, ShoppingCart, Briefcase } from "lucide-react";
import { toast } from "sonner";

type Profile = {
  id?: string;
  user_id: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  monthly_income?: number;
  currency?: string;
};

export default function ProfilePage() {
  const { user, loading: authLoading, signOut } = useAuth();
  const { language } = useLanguage();
  const isBn = language === "bn";
  const navigate = useNavigate();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate("/auth");
      return;
    }
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (error) {
        toast.error(error.message);
      } else if (data) {
        setProfile(data);
        setFullName(data.full_name ?? "");
        setPhone(data.phone ?? "");
        setAvatarUrl(data.avatar_url ?? "");
      } else {
        setProfile({ user_id: user.id, full_name: null, phone: null, avatar_url: null });
      }
      setLoading(false);
    })();
  }, [user, authLoading, navigate]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const payload = {
      user_id: user.id,
      full_name: fullName.trim() || null,
      phone: phone.trim() || null,
      avatar_url: avatarUrl.trim() || null,
    };
    const { error } = await supabase
      .from("profiles")
      .upsert(payload, { onConflict: "user_id" });
    setSaving(false);
    if (error) toast.error(error.message);
    else toast.success(isBn ? "প্রোফাইল আপডেট হয়েছে ✅" : "Profile updated ✅");
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const initials = (fullName || user?.email || "U").slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <section className="border-b bg-gradient-to-br from-primary/10 via-transparent to-accent/10">
        <div className="container mx-auto px-4 py-10">
          <div className="flex items-center gap-5">
            <div className="relative">
              {avatarUrl ? (
                <img src={avatarUrl} alt="avatar" className="w-20 h-20 rounded-full object-cover ring-4 ring-primary/30 shadow-lg" />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary/60 text-primary-foreground flex items-center justify-center text-2xl font-bold ring-4 ring-primary/30 shadow-lg">
                  {initials}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl md:text-3xl font-bold truncate">
                {fullName || (isBn ? "আমার প্রোফাইল" : "My Profile")}
              </h1>
              <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1 truncate">
                <Mail className="w-3.5 h-3.5" /> {user?.email}
              </p>
              <Badge variant="secondary" className="mt-2 gap-1">
                <UserIcon className="w-3 h-3" /> {isBn ? "সাইন ইন করা আছে" : "Signed in"}
              </Badge>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 grid md:grid-cols-[1fr_300px] gap-6">
        <Card className="p-6 space-y-5">
          <h2 className="font-bold text-lg flex items-center gap-2">
            <UserIcon className="w-4 h-4 text-primary" />
            {isBn ? "ব্যক্তিগত তথ্য" : "Personal Information"}
          </h2>

          <div className="space-y-2">
            <Label>{isBn ? "পূর্ণ নাম" : "Full Name"}</Label>
            <Input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder={isBn ? "আপনার নাম লিখুন" : "Enter your name"}
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" />{isBn ? "ইমেইল" : "Email"}</Label>
            <Input value={user?.email ?? ""} disabled />
            <p className="text-xs text-muted-foreground">
              {isBn ? "ইমেইল পরিবর্তন করা যাবে না" : "Email cannot be changed"}
            </p>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" />{isBn ? "মোবাইল নম্বর" : "Phone"}</Label>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+880 1XXX-XXXXXX"
              maxLength={20}
            />
          </div>

          <div className="space-y-2">
            <Label>{isBn ? "প্রোফাইল ছবির URL" : "Avatar URL"}</Label>
            <Input
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://..."
              maxLength={500}
            />
          </div>

          <Button onClick={handleSave} disabled={saving} className="w-full gap-2" size="lg">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isBn ? "সেভ করো" : "Save Changes"}
          </Button>
        </Card>

        <div className="space-y-4">
          <Card className="p-4 space-y-2">
            <h3 className="font-semibold text-sm">{isBn ? "দ্রুত লিংক" : "Quick Links"}</h3>
            <Button variant="outline" className="w-full justify-start gap-2" onClick={() => navigate("/cart")}>
              <ShoppingCart className="w-4 h-4" /> {isBn ? "আমার কার্ট" : "My Cart"}
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2" onClick={() => navigate("/portfolio")}>
              <Briefcase className="w-4 h-4" /> {isBn ? "পোর্টফোলিও" : "Portfolio"}
            </Button>
          </Card>

          <Card className="p-4">
            <Button variant="destructive" className="w-full gap-2" onClick={handleSignOut}>
              <LogOut className="w-4 h-4" /> {isBn ? "সাইন আউট" : "Sign Out"}
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
