import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Wallet, Mail, Lock, User as UserIcon, ArrowRight, MessageCircle } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const schema = z.object({
  email: z.string().trim().email().max(255),
  password: z.string().min(6).max(72),
  full_name: z.string().trim().min(1).max(80).optional(),
});

const Auth = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const nav = useNavigate();
  const [params] = useSearchParams();
  const next = useMemo(() => {
    const n = params.get("next");
    if (!n || !n.startsWith("/") || n.startsWith("//")) return "/finance";
    return n;
  }, [params]);
  const isChatAuth = next === "/chat";
  const AuthIcon = isChatAuth ? MessageCircle : Wallet;
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user) nav(next, { replace: true });
  }, [user, nav, next]);

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ email, password, full_name: fullName || undefined });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}${next}`,
            data: { full_name: fullName },
          },
        });
        if (error) throw error;
        toast.success(language === "bn" ? "অ্যাকাউন্ট তৈরি হয়েছে! ইমেইল ভেরিফাই করুন।" : "Account created! Check your email.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success(language === "bn" ? "স্বাগতম!" : "Welcome back!");
        nav(next, { replace: true });
      }
    } catch (err: any) {
      toast.error(err.message || "Error");
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    setBusy(true);
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: `${window.location.origin}${next}` });
    if (r.error) {
      toast.error(r.error.message || "Google sign-in failed");
      setBusy(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-10 bg-gradient-to-br from-background via-muted/30 to-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl gradient-bg-primary text-primary-foreground shadow-glow mb-3">
            <AuthIcon className="w-7 h-7" />
          </div>
          <h1 className="font-display text-3xl font-bold">
            {isChatAuth ? (language === "bn" ? "লাইভ চ্যাট" : "Live Chat") : (language === "bn" ? "ফিন্যান্স ম্যানেজার" : "Finance Manager")}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isChatAuth
              ? (language === "bn" ? "চ্যাটে যেতে আগে লগইন করুন।" : "Log in first to open chat.")
              : (language === "bn" ? "আপনার দৈনন্দিন হিসাব, এক জায়গায়।" : "Your daily money, all in one place.")}
          </p>
        </div>

        <div className="bg-card rounded-3xl border border-border/60 shadow-elegant p-6">
          <Tabs value={mode} onValueChange={(v) => setMode(v as any)}>
            <TabsList className="grid grid-cols-2 w-full mb-4">
              <TabsTrigger value="login">{language === "bn" ? "লগইন" : "Login"}</TabsTrigger>
              <TabsTrigger value="signup">{language === "bn" ? "সাইনআপ" : "Sign up"}</TabsTrigger>
            </TabsList>

            <form onSubmit={handle} className="space-y-3">
              {mode === "signup" && (
                <div>
                  <Label>{language === "bn" ? "পুরো নাম" : "Full name"}</Label>
                  <div className="relative mt-1">
                    <UserIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input className="pl-9" value={fullName} onChange={(e) => setFullName(e.target.value)} maxLength={80} />
                  </div>
                </div>
              )}
              <div>
                <Label>Email</Label>
                <div className="relative mt-1">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input className="pl-9" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
              </div>
              <div>
                <Label>{language === "bn" ? "পাসওয়ার্ড" : "Password"}</Label>
                <div className="relative mt-1">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input className="pl-9" type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={6} required />
                </div>
              </div>
              <Button type="submit" disabled={busy} className="w-full gradient-bg-primary text-white">
                {busy ? "..." : mode === "login" ? (language === "bn" ? "লগইন করুন" : "Log in") : (language === "bn" ? "অ্যাকাউন্ট তৈরি" : "Create account")}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </form>

            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground">{language === "bn" ? "অথবা" : "OR"}</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <Button type="button" variant="outline" className="w-full" onClick={google} disabled={busy}>
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.83z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.83C6.71 7.31 9.14 5.38 12 5.38z"/></svg>
              {language === "bn" ? "Google দিয়ে চালিয়ে যান" : "Continue with Google"}
            </Button>
          </Tabs>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-4">
          <Link to="/" className="hover:text-primary">← {language === "bn" ? "হোমে ফিরুন" : "Back to home"}</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Auth;
