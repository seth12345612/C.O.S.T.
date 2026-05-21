import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Loader2, Sparkles } from "lucide-react";
import { useGame } from "@/context/GameContext";

const FUNC_URL = "https://twdvhkwrlwhadbmortqk.supabase.co/functions/v1/mentor";
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3ZHZoa3dybHdoYWRibW9ydHFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyMDM4OTAsImV4cCI6MjA5NDc3OTg5MH0.mvQkXjYR3YDChjbuGmmm006QOTjw6rQz6UdAKZYG-lQ";

const TIMEOUT_MS = 15000;

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export function MentorChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { state } = useGame();

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
          saptamana: state.saptamana,
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
      return data.reply ?? "Scuze, nu pot răspunde acum.";
    } catch (err) {
      clearTimeout(timer);
      if (err instanceof DOMException && err.name === "AbortError") {
        return "Cererea a durat prea mult. Încearcă din nou.";
      }
      return `Eroare: ${err instanceof Error ? err.message : "conexiune eșuată"}. Încearcă din nou.`;
    }
  };

  const handleQuestion = async (question: string) => {
    const userMsg: Message = { id: crypto.randomUUID(), role: "user", content: question };
    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    const currentMessages = messages;
    const reply = await askMentor(question, currentMessages);

    const aiMsg: Message = { id: crypto.randomUUID(), role: "assistant", content: reply };
    setMessages((prev) => [...prev, aiMsg]);
    setIsTyping(false);
  };

  const handleSend = () => {
    if (!input.trim() || isTyping) return;
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
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white shadow-lg shadow-purple-900/50 flex items-center justify-center"
      >
        <MessageCircle size={24} />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 w-[360px] max-w-[calc(100vw-3rem)] h-[500px] rounded-2xl border border-white/10 bg-[#0d0820] shadow-2xl flex flex-col overflow-hidden"
          >
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-gradient-to-r from-purple-600/20 to-fuchsia-600/20">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-fuchsia-500 flex items-center justify-center">
                  <Sparkles size={16} className="text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Mentorul C.O.S.T.</h3>
                  <p className="text-xs text-white/50">AI</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 && (
                <p className="text-white/40 text-sm text-center py-8">
                  Bună! Cu ce te pot ajuta cu finanțele tale?
                </p>
              )}

              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-3 rounded-xl text-sm whitespace-pre-wrap ${
                    msg.role === "user"
                      ? "bg-purple-600/20 border border-purple-500/30 text-purple-100 ml-8"
                      : "bg-white/5 border border-white/10 text-white/80 mr-8"
                  }`}
                >
                  {msg.content}
                </div>
              ))}
              {isTyping && (
                <div className="flex items-center gap-2 text-white/40 text-sm ml-8">
                  <Loader2 size={14} className="animate-spin" />
                  Scrie...
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-3 border-t border-white/10 flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Întreabă ceva..."
                className="flex-1 px-3 py-2 rounded-xl border border-white/15 bg-white/5 text-white placeholder:text-white/25 text-sm focus:outline-none focus:border-purple-500/50"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className="p-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-colors"
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
