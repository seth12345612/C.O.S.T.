import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { MessageCircle, X, Send, Loader2, Sparkles, Crown } from "lucide-react";
import { useGame } from "@/context/GameContext";
import { useAuth } from "@/context/AuthContext";
import { useTranslation } from "@/context/TranslationContext";

const FUNC_URL = "https://twdvhkwrlwhadbmortqk.supabase.co/functions/v1/mentor";
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3ZHZoa3dybHdoYWRibW9ydHFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyMDM4OTAsImV4cCI6MjA5NDc3OTg5MH0.mvQkXjYR3YDChjbuGmmm006QOTjw6rQz6UdAKZYG-lQ";

const TIMEOUT_MS = 15000;
const FREE_DAILY_LIMIT = 10;
const MENTOR_LIMIT_KEY = "cost_mentor_limit";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

function getDailyUsage(): { used: number; date: string } {
  try {
    const raw = localStorage.getItem(MENTOR_LIMIT_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      const today = new Date().toISOString().split("T")[0];
      if (data.date === today) return data;
    }
  } catch {}
  return { used: 0, date: new Date().toISOString().split("T")[0] };
}

function incrementDailyUsage() {
  const usage = getDailyUsage();
  usage.used++;
  localStorage.setItem(MENTOR_LIMIT_KEY, JSON.stringify(usage));
  return usage;
}

export function MentorChat() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { state } = useGame();
  const { isPremium, subscriptionTier } = useAuth();
  const isAdvanced = subscriptionTier === "premium_advanced";
  const [, setLocation] = useLocation();

  const usage = getDailyUsage();
  const remaining = Math.max(0, FREE_DAILY_LIMIT - usage.used);
  const limitReached = !isPremium && usage.used >= FREE_DAILY_LIMIT;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const askMentor = async (question: string, history: Message[]) => {
    const context = state
      ? {
          scenariu: state.scenariuId,
          dificultate: state.dificultateKey,
          bani: state.bani,
          fericire: state.fericire,
          reputatie: state.reputatie,
          saptamana: state.saptamana,
          personalized: isAdvanced,
        }
      : undefined;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const res = await fetch(FUNC_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${ANON_KEY}` },
        body: JSON.stringify({
          messages: [...history, { role: "user", content: question }],
          context,
        }),
        signal: controller.signal,
      });
      clearTimeout(timer);

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || `HTTP ${res.status}`);
      }
      return data.reply ?? t("Scuze, nu pot răspunde acum.");
    } catch (err) {
      clearTimeout(timer);
      if (err instanceof DOMException && err.name === "AbortError") {
        return t("Cererea a durat prea mult. Încearcă din nou.");
      }
      return t(`Eroare: ${err instanceof Error ? err.message : "conexiune eșuată"}. Încearcă din nou.`);
    }
  };

  const handleQuestion = async (question: string) => {
    const userMsg: Message = { id: crypto.randomUUID(), role: "user", content: question };
    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    if (!isPremium) incrementDailyUsage();

    const currentMessages = messages;
    const reply = await askMentor(question, currentMessages);

    const aiMsg: Message = { id: crypto.randomUUID(), role: "assistant", content: reply };
    setMessages((prev) => [...prev, aiMsg]);
    setIsTyping(false);
  };

  const handleSend = () => {
    if (!input.trim() || isTyping) return;
    if (limitReached) {
      setIsOpen(false);
      setLocation("/premium");
      return;
    }
    handleQuestion(input);
    setInput("");
  };

  return (
    <>
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-gradient-to-r from-purple-600 to-fuchsia-600 text-main shadow-lg shadow-purple-900/50 flex items-center justify-center"
      >
        <MessageCircle size={24} />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 w-[360px] max-w-[calc(100vw-3rem)] h-[500px] rounded-2xl border border-subtle bg-card-strong shadow-2xl flex flex-col overflow-hidden"
          >
            <div className="flex items-center justify-between p-4 border-b border-subtle bg-gradient-to-r from-purple-600/20 to-fuchsia-600/20">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-fuchsia-500 flex items-center justify-center">
                  <Sparkles size={16} className="text-main" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-main">{t("Mentorul C.O.S.T.")}</h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {isAdvanced ? (
                      <span className="flex items-center gap-1 text-[10px] text-purple-400 font-medium">
                        <Sparkles size={10} />
        {t("Mentor AI personalizat")}
                      </span>
                    ) : isPremium ? (
                      <span className="flex items-center gap-1 text-[10px] text-yellow-400 font-medium">
                        <Crown size={10} />
                        {t("Acces nelimitat")}
                      </span>
                    ) : (
                      <span className="text-[10px] text-subtle">
                        {t(`${remaining}/${FREE_DAILY_LIMIT} întrebări azi`)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-dim hover:text-main hover:bg-card-hover transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 && (
                <p className="text-subtle text-sm text-center py-8">
                  {t("Bună! Cu ce te pot ajuta cu finanțele tale?")}
                </p>
              )}

              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-3 rounded-xl text-sm whitespace-pre-wrap ${
                    msg.role === "user"
                      ? "bg-purple-600/20 border border-purple-500/30 text-purple-100 ml-8"
                      : "bg-card border border-subtle text-bright mr-8"
                  }`}
                >
                  {msg.content}
                </div>
              ))}
              {isTyping && (
                <div className="flex items-center gap-2 text-subtle text-sm ml-8">
                  <Loader2 size={14} className="animate-spin" />
                  {t("Scrie...")}
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            <div className="p-3 border-t border-subtle flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder={t("Întreabă ceva...")}
                className="flex-1 px-3 py-2 rounded-xl border border-medium bg-card text-main placeholder:text-fainter text-sm focus:outline-none focus:border-purple-500/50"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className="p-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-main transition-colors"
              >
                <Send size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
