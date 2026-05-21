import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const PREDEFINED_QUESTIONS = [
  "Cum să economisesc mai mult?",
  "Cum să-mi planific bugetul?",
  "Ce să fac dacă sunt pe minus?",
];

const AI_RESPONSES: Record<string, string> = {
  "Cum să economisesc mai mult?":
    "💡 Sfat rapid pentru economii:\n\n1. **Regula 50/30/20** - Alocă 50% pentru nevoi, 30% pentru dorințe și 20% pentru economii.\n\n2. **Economisește automat** - Setează un transfer lunar automat către un cont de economii.\n\n3. **Reduce cheltuielile mici** - Cafeaua zilnică de 15 RON = 450 RON/lună!\n\n4. **Compară prețurile** - Folosește aplicații de comparare pentru facturi și abonamente.\n\n5. **Stabilește un obiectiv** - Fiecare econmie are un scop (ex: o vacanță, un laptop).",
  "Cum să-mi planific bugetul?":
    "📊 Ghid pentru bugetul lunar:\n\n**Pasul 1: Calculează venitul net** (salariu - taxe - contribuții)\n\n**Pasul 2: Listează cheltuielile fixe**\n• Chirie/utilități\n• Transport\n• Abonamente\n• Mâncare\n\n**Pasul 3: Stabilește limite**\n• Pentru fiecare categorie, pune o sumă maximă\n• Lasă și un buffer de 10% pentru urgențe\n\n**Pasul 4: Urmărește și ajustează**\n• Verifică săptămânal progresul\n• ajustează pentru luna următoare",
  "Ce să fac dacă sunt pe minus?":
    "⚠️ Situație dificilă? Iată pașii:\n\n**1. Oprește cheltuielile**\n• Anulează abonamentele neesențiale\n• Renunță temporar la ieșiri\n• Gătește acasă în loc de restaurant\n\n**2. Identifică surse de venit**\n• Job part-time\n• Vânzări de lucruri nefolosite\n• Freelance/proiecte ocazionale\n\n**3. Prioritizează cheltuielile**\n• Urgente: mâncare, utilități, transport\n• Amânabile: abonamente, divertisment\n\n**4. Solicită ajutor**\n• Vorbește cu familia\n• Verifică programele de suport pentru studenți\n\nNu e rușin să ceri ajutor temporar!",
};

export function MentorChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleQuestion = (question: string) => {
    const userMsg: Message = { id: Date.now().toString(), role: "user", content: question };
    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    setTimeout(() => {
      const response = AI_RESPONSES[question] ?? "Scrie-mi mai multe detalii!";
      const aiMsg: Message = { id: (Date.now() + 1).toString(), role: "assistant", content: response };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1500);
  };

  const handleSend = () => {
    if (!input.trim()) return;
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
                  <span className="text-sm">🎓</span>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Mentorul C.O.S.T.</h3>
                  <p className="text-xs text-white/50">Asistent financiar AI</p>
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
              {messages.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-white/40 text-sm mb-4">Bună! Cum te pot ajuta azi?</p>
                  <div className="flex flex-col gap-2">
                    {PREDEFINED_QUESTIONS.map((q) => (
                      <button
                        key={q}
                        onClick={() => handleQuestion(q)}
                        className="p-3 rounded-xl border border-white/10 bg-white/5 text-left text-sm text-white/70 hover:bg-white/10 hover:border-white/20 transition-all"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <>
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
                </>
              )}
            </div>

            {messages.length > 0 && (
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
                  disabled={!input.trim()}
                  className="p-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-colors"
                >
                  <Send size={18} />
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}