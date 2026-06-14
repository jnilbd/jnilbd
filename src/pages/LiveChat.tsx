import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Send, Trash2, Users, Phone } from "lucide-react";

// ⚙️ আপনার নাম্বার/ইউজারনেম এখানে এডিট করুন
const OWNER_WHATSAPP = "8801774585757"; // country code সহ, + ছাড়া
const OWNER_TELEGRAM = "jnilbd";        // @ ছাড়া username
const OWNER_DEFAULT_MSG = "Hi! Johnnil সাইট থেকে যোগাযোগ করছি 🙂";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

type Msg = { id: string; user_id: string; display_name: string; message: string; created_at: string };
const schema = z.object({ message: z.string().trim().min(1).max(500) });

const LiveChat = () => {
  const { user, loading } = useAuth();
  const { language } = useLanguage();
  const nav = useNavigate();
  const bn = language === "bn";
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [name, setName] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading && !user) nav("/auth?next=/chat", { replace: true });
  }, [user, loading, nav]);

  // load + realtime
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: prof } = await supabase.from("profiles").select("full_name").eq("user_id", user.id).maybeSingle();
      setName(prof?.full_name || user.email?.split("@")[0] || "User");
      const { data } = await supabase.from("chat_messages").select("*").order("created_at", { ascending: true }).limit(200);
      setMsgs((data as Msg[]) || []);
    })();

    const ch = supabase.channel("public:chat_messages")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages" }, (p) => {
        setMsgs(prev => [...prev, p.new as Msg]);
      })
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "chat_messages" }, (p) => {
        setMsgs(prev => prev.filter(m => m.id !== (p.old as any).id));
      })
      .subscribe();

    return () => { supabase.removeChannel(ch); };
  }, [user]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs]);

  const send = async () => {
    if (!user) return;
    const parsed = schema.safeParse({ message: text });
    if (!parsed.success) { toast.error(bn?"মেসেজ লিখুন (১-৫০০ অক্ষর)":"Type a message (1-500)"); return; }
    const { error } = await supabase.from("chat_messages").insert({
      user_id: user.id, display_name: name.slice(0,40) || "User", message: parsed.data.message,
    });
    if (error) toast.error(error.message);
    else setText("");
  };
  const del = async (id: string) => {
    await supabase.from("chat_messages").delete().eq("id", id);
  };

  if (loading || !user) return <div className="min-h-[60vh] flex items-center justify-center">Loading…</div>;

  return (
    <div className="container py-6 lg:py-10 max-w-3xl">
      <motion.div initial={{opacity:0,y:-10}} animate={{opacity:1,y:0}} className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-2xl gradient-bg-warm text-white flex items-center justify-center shadow-pink">
          <MessageCircle className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <h1 className="font-display text-2xl font-bold">{bn?"লাইভ কমিউনিটি চ্যাট":"Live Community Chat"}</h1>
          <p className="text-xs text-muted-foreground flex items-center gap-1.5"><Users className="w-3 h-3" />{bn?"সবাই একসাথে":"Everyone together"}</p>
        </div>
      </motion.div>

      <Card className="overflow-hidden">
        <div ref={scrollRef} className="h-[58vh] overflow-y-auto p-3 space-y-2 bg-gradient-to-b from-background to-muted/30">
          {msgs.length===0 && <div className="text-center text-sm text-muted-foreground py-10">{bn?"আপনার প্রথম মেসেজ পাঠান!":"Send the first message!"}</div>}
          <AnimatePresence initial={false}>
            {msgs.map(m => {
              const mine = m.user_id === user.id;
              return (
                <motion.div key={m.id} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0}} className={`flex ${mine?"justify-end":"justify-start"} group`}>
                  <div className={`max-w-[78%] ${mine?"order-2":""}`}>
                    {!mine && <div className="text-[10px] font-semibold text-muted-foreground mb-0.5 ml-2">{m.display_name}</div>}
                    <div className={`relative px-3.5 py-2 rounded-2xl text-sm shadow-sm ${mine?"gradient-bg-primary text-white rounded-tr-sm":"bg-card border border-border rounded-tl-sm"}`}>
                      {m.message}
                      <div className={`text-[9px] mt-1 ${mine?"text-white/70":"text-muted-foreground"}`}>{new Date(m.created_at).toLocaleTimeString(bn?"bn-BD":"en-US",{hour:"2-digit",minute:"2-digit"})}</div>
                      {mine && (
                        <button onClick={()=>del(m.id)} className="absolute -left-7 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition">
                          <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
        <CardContent className="p-3 border-t border-border bg-card">
          <div className="flex gap-2">
            <Input
              value={text} onChange={e=>setText(e.target.value)}
              onKeyDown={e=>{ if (e.key==="Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
              placeholder={bn?"মেসেজ লিখুন...":"Type a message..."} maxLength={500}
            />
            <Button onClick={send} className="gradient-bg-primary text-white"><Send className="w-4 h-4" /></Button>
          </div>
          <p className="text-[10px] text-muted-foreground mt-1.5">{bn?"আপনি হিসেবে":"You are"}: <strong>{name}</strong> • {text.length}/500</p>
        </CardContent>
      </Card>

      {/* Direct contact section */}
      <Card className="mt-4">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Phone className="w-4 h-4 text-primary" />
            <h3 className="font-display font-bold text-sm">
              {bn ? "সরাসরি যোগাযোগ করুন" : "Contact directly"}
            </h3>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            {bn
              ? "কোনো প্রশ্ন বা সাহায্যের জন্য সরাসরি WhatsApp বা Telegram-এ মেসেজ পাঠান।"
              : "For any question or help, message directly on WhatsApp or Telegram."}
          </p>
          <div className="grid grid-cols-2 gap-2">
            <a
              href={`https://wa.me/${OWNER_WHATSAPP}?text=${encodeURIComponent(OWNER_DEFAULT_MSG)}`}
              target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-[#25D366] text-white font-semibold text-sm hover:opacity-90 transition-smooth"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 018.413 3.488 11.824 11.824 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.71.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z"/></svg>
              WhatsApp
            </a>
            <a
              href={`https://t.me/${OWNER_TELEGRAM}?text=${encodeURIComponent(OWNER_DEFAULT_MSG)}`}
              target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-[#0088cc] text-white font-semibold text-sm hover:opacity-90 transition-smooth"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005-.002l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.643.135-.953l11.566-4.458c.538-.196 1.006.128.832.941z"/></svg>
              Telegram
            </a>
          </div>
          <p className="text-[10px] text-muted-foreground mt-2 text-center">
            {bn ? "ব্যবসায়িক ঘণ্টা: প্রতিদিন সকাল ৯টা — রাত ১১টা" : "Business hours: 9 AM – 11 PM daily"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default LiveChat;
