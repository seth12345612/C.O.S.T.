import { useEffect } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function LoginSuccess() {
  const [, setLocation] = useLocation();
  const { isVerified } = useAuth();

  useEffect(() => {
    if (!isVerified) {
      setLocation("/login");
      return;
    }
    const timer = setTimeout(() => setLocation("/"), 2500);
    return () => clearTimeout(timer);
  }, [isVerified, setLocation]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#080518]">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className="text-center space-y-4"
      >
        <div className="w-20 h-20 mx-auto rounded-full bg-green-500/20 flex items-center justify-center">
          <CheckCircle2 size={48} className="text-green-400" />
        </div>
        <h1 className="text-2xl font-bold text-white">Logare reușită</h1>
        <p className="text-white/50">Te redirecționăm acum...</p>
        <div className="flex justify-center gap-1.5 mt-4">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-purple-500"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}
