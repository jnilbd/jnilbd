import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Lock, Plus, Trash2, Eye, EyeOff, Wifi, CreditCard, KeyRound, FileText, Mail, Copy, Unlock } from "lucide-react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type VaultItem = {
  id: string;
  title: string;
  category: string;
  encrypted_data: string;
  iv: string;
};

const CATEGORIES = [
  { id: "wifi", icon: Wifi, bn: "WiFi", en: "WiFi" },
  { id: "bank", icon: CreditCard, bn: "ব্যাংক/কার্ড", en: "Bank/Card" },
  { id: "password", icon: KeyRound, bn: "পাসওয়ার্ড", en: "Password" },
  { id: "email", icon: Mail, bn: "ইমেইল", en: "Email" },
  { id: "note", icon: FileText, bn: "নোট", en: "Note" },
];

// Derive AES-GCM key from passphrase using PBKDF2
async function deriveKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const baseKey = await crypto.subtle.importKey(
    "raw", new TextEncoder().encode(passphrase), "PBKDF2", false, ["deriveKey"]
  );
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: 100_000, hash: "SHA-256" },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

const b64 = (buf: ArrayBuffer) => btoa(String.fromCharCode(...new Uint8Array(buf)));
const fromB64 = (s: string) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));

const Vault = () => {
  const { language } = useLanguage();
  const { user, loading: authLoading } = useAuth();
  const t = (bn: string, en: string) => (language === "bn" ? bn : en);

  const [master, setMaster] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [items, setItems] = useState<VaultItem[]>([]);
  const [decrypted, setDecrypted] = useState<Record<string, string>>({});
  const [showOpen, setShowOpen] = useState<Record<string, boolean>>({});

  const [newOpen, setNewOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCat, setNewCat] = useState("password");
  const [newData, setNewData] = useState("");

  const salt = user ? new TextEncoder().encode(user.id.padEnd(16, "x")) : new Uint8Array(16);

  const load = async () => {
    if (!user) return;
    const { data, error } = await supabase.from("vault_items").select("*").order("created_at", { ascending: false });
    if (!error && data) setItems(data as VaultItem[]);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [user?.id]);

  const handleUnlock = async () => {
    if (!master) { toast.error(t("মাস্টার পাসওয়ার্ড দিন", "Enter master password")); return; }
    if (master.length < 6) { toast.error(t("কমপক্ষে ৬ অক্ষর", "At least 6 characters")); return; }
    setUnlocked(true);
    toast.success(t("ভল্ট আনলকড", "Vault unlocked"));
  };

  const decryptOne = async (item: VaultItem): Promise<string> => {
    try {
      const key = await deriveKey(master, salt);
      const plain = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv: fromB64(item.iv) },
        key,
        fromB64(item.encrypted_data)
      );
      return new TextDecoder().decode(plain);
    } catch {
      return "";
    }
  };

  const reveal = async (item: VaultItem) => {
    if (decrypted[item.id]) {
      setShowOpen((s) => ({ ...s, [item.id]: !s[item.id] }));
      return;
    }
    const text = await decryptOne(item);
    if (!text) { toast.error(t("ভুল মাস্টার পাসওয়ার্ড", "Wrong master password")); return; }
    setDecrypted((d) => ({ ...d, [item.id]: text }));
    setShowOpen((s) => ({ ...s, [item.id]: true }));
  };

  const handleSave = async () => {
    if (!user) return;
    if (!newTitle || !newData) { toast.error(t("টাইটেল ও ডেটা দিন", "Title & data required")); return; }
    try {
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const key = await deriveKey(master, salt);
      const cipher = await crypto.subtle.encrypt(
        { name: "AES-GCM", iv },
        key,
        new TextEncoder().encode(newData)
      );
      const { error } = await supabase.from("vault_items").insert({
        user_id: user.id,
        title: newTitle.slice(0, 200),
        category: newCat,
        encrypted_data: b64(cipher),
        iv: b64(iv.buffer),
      });
      if (error) throw error;
      toast.success(t("সেভ হয়েছে!", "Saved!"));
      setNewTitle(""); setNewData(""); setNewOpen(false);
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  };

  const handleDelete = async (id: string) => {
    await supabase.from("vault_items").delete().eq("id", id);
    setDecrypted((d) => { const c = { ...d }; delete c[id]; return c; });
    load();
  };

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success(t("কপি হয়েছে", "Copied"));
  };

  const lock = () => {
    setMaster("");
    setUnlocked(false);
    setDecrypted({});
    setShowOpen({});
    toast.success(t("ভল্ট লকড", "Vault locked"));
  };

  if (authLoading) return <div className="container py-12 text-center">Loading...</div>;
  if (!user) {
    return (
      <div className="container py-12 max-w-md text-center">
        <Lock className="w-12 h-12 mx-auto mb-4 text-primary" />
        <h1 className="text-2xl font-display font-bold mb-2">{t("লগইন প্রয়োজন", "Login required")}</h1>
        <Link to="/auth"><Button size="lg" className="mt-3">{t("লগইন করুন", "Login")}</Button></Link>
      </div>
    );
  }

  if (!unlocked) {
    return (
      <div className="container py-12 max-w-md">
        <Card className="p-6 text-center">
          <div className="w-16 h-16 rounded-2xl gradient-bg-primary mx-auto flex items-center justify-center mb-4">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-display font-bold mb-1">{t("পার্সোনাল ভল্ট", "Personal Vault")}</h1>
          <p className="text-sm text-muted-foreground mb-5">
            {t(
              "মাস্টার পাসওয়ার্ড দিয়ে এন্ক্রিপ্ট করা হয় — শুধু আপনিই খুলতে পারবেন",
              "Encrypted with your master password — only you can decrypt"
            )}
          </p>
          <Input
            type="password"
            value={master}
            onChange={(e) => setMaster(e.target.value)}
            placeholder={t("মাস্টার পাসওয়ার্ড", "Master password")}
            onKeyDown={(e) => e.key === "Enter" && handleUnlock()}
            className="mb-3"
          />
          <Button onClick={handleUnlock} size="lg" className="w-full">
            <Unlock className="w-4 h-4 mr-2" />
            {t("ভল্ট খুলুন", "Unlock Vault")}
          </Button>
          <p className="text-xs text-amber-600 mt-4 flex items-start gap-1.5 text-left">
            <KeyRound className="w-3.5 h-3.5 mt-0.5 shrink-0" />
            {t(
              "সতর্কতা: মাস্টার পাসওয়ার্ড কোথাও সেভ হয় না। হারালে ডেটা পুনরুদ্ধার অসম্ভব।",
              "Warning: Master password is never saved. If lost, data is unrecoverable."
            )}
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-3xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold flex items-center gap-2">
              <Lock className="w-6 h-6 text-primary" /> {t("পার্সোনাল ভল্ট", "Personal Vault")}
            </h1>
            <p className="text-xs text-muted-foreground">{items.length} {t("আইটেম", "items")}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={lock}><Lock className="w-4 h-4 mr-1" />{t("লক", "Lock")}</Button>
            <Dialog open={newOpen} onOpenChange={setNewOpen}>
              <DialogTrigger asChild>
                <Button size="sm"><Plus className="w-4 h-4 mr-1" />{t("নতুন", "New")}</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>{t("নতুন আইটেম", "New item")}</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <Input placeholder={t("টাইটেল (যেমন: ঘরের WiFi)", "Title (e.g. Home WiFi)")} value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
                  <Select value={newCat} onValueChange={setNewCat}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{language === "bn" ? c.bn : c.en}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Textarea
                    placeholder={t("ডেটা (পাসওয়ার্ড, কার্ড নং, পিন, নোট...)", "Data (password, card no, PIN, note...)")}
                    value={newData} onChange={(e) => setNewData(e.target.value)} rows={5}
                  />
                  <Button onClick={handleSave} className="w-full">{t("এন্ক্রিপ্ট করে সেভ", "Encrypt & Save")}</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {items.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">{t("এখনো কিছু সেভ করেননি", "Nothing saved yet")}</p>
        ) : (
          <div className="space-y-3">
            {items.map((item) => {
              const cat = CATEGORIES.find((c) => c.id === item.category) || CATEGORIES[4];
              const Icon = cat.icon;
              const open = showOpen[item.id];
              return (
                <Card key={item.id} className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl gradient-bg-primary flex items-center justify-center text-white shrink-0">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{item.title}</p>
                      <p className="text-xs text-muted-foreground">{language === "bn" ? cat.bn : cat.en}</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => reveal(item)}>
                      {open ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)}>
                      <Trash2 className="w-4 h-4 text-muted-foreground" />
                    </Button>
                  </div>
                  {open && decrypted[item.id] && (
                    <div className="mt-3 p-3 rounded-lg bg-muted/60 font-mono text-sm whitespace-pre-wrap break-all relative">
                      {decrypted[item.id]}
                      <button onClick={() => copy(decrypted[item.id])} className="absolute top-2 right-2 p-1.5 rounded bg-background hover:bg-primary hover:text-primary-foreground">
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Vault;
