import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Send, Trash2, Users, Phone } from "lucide-react";

// ⚙️ আপনার নাম্বার/ইউজারনেম এখানে এডিট করুন
const OWNER_WHATSAPP = "8801XXXXXXXXX"; // country code সহ, + ছাড়া
const OWNER_TELEGRAM = "johnnil";        // @ ছাড়া username
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
    </div>
  );
};

export default LiveChat;
