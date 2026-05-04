import { MessageCircle } from "lucide-react";
import { motion } from "framer-motion";

const WhatsAppButton = () => {
  return (
    <motion.a
      href="https://wa.me/8801774585757"
      target="_blank"
      rel="noreferrer"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 1, type: "spring" }}
      className="hidden lg:flex fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-green-500 text-white items-center justify-center shadow-2xl hover:scale-110 transition-bounce animate-pulse-glow"
      aria-label="WhatsApp"
    >
      <MessageCircle className="w-7 h-7" />
    </motion.a>
  );
};

export default WhatsAppButton;
