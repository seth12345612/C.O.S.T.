import { useState } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Sparkles, TrendingUp, X } from "lucide-react";
import { OrbBackground } from "@/components/OrbBackground";
import { Layout } from "@/components/Layout";
import { useXP } from "@/context/XPContext";
import { useTranslation } from "@/context/TranslationContext";
import { toast } from "sonner";
import type { MiniGameResult } from "@/types";

interface Question {
  intrebare: string;
  optiuni: string[];
  corect: number;
  explicatie: string;
}

const INTREBARI: Question[] = [
  {
    intrebare: "Ce este dobânda compusă?",
    optiuni: [
      "Dobânda calculată doar pe suma inițială",
      "Dobânda calculată atât pe suma inițială, cât și pe dobânda acumulată",
      "O taxă plătită băncii pentru împrumuturi",
      "O dobândă fixă pe toată perioada creditului",
    ],
    corect: 1,
    explicatie: "Dobânda compusă se calculează pe suma inițială plus dobânda deja acumulată, generând un efect de bulgăre de zăpadă.",
  },
  {
    intrebare: "Dacă investești 1000 RON cu o dobândă anuală de 10%, cât vei avea după 2 ani (dobândă compusă)?",
    optiuni: ["1100 RON", "1200 RON", "1210 RON", "1300 RON"],
    corect: 2,
    explicatie: "Anul 1: 1000 + 10% = 1100. Anul 2: 1100 + 10% = 1210 RON. Efectul compunerii aduce 10 RON în plus față de dobânda simplă.",
  },
  {
    intrebare: "Care este regula 72?",
    optiuni: [
      "Înmulțești 72 cu rata dobânzii pentru a estima randamentul",
      "Împărți 72 la rata anuală a dobânzii pentru a estima timpul de dublare",
      "72 este vârsta ideală de pensionare",
      "Regula spune că trebuie să economisești 72% din venit",
    ],
    corect: 1,
    explicatie: "Regula 72: 72 / rata anuală a dobânzii ≈ numărul de ani în care investiția se dublează. La 9%, se dublează în ~8 ani.",
  },
  {
    intrebare: "Ce înseamnă diversificat investiții?",
    optiuni: [
      "Pui toți banii într-un singur activ",
      "Împarți banii în mai multe active diferite",
      "Schimbi frecvent între diferite bănci",
      "Investești doar în străinătate",
    ],
    corect: 1,
    explicatie: "Diversificarea reduce riscul: dacă un activ pierde valoare, altele pot compensa. Nu pune toate ouăle în același coș!",
  },
  {
    intrebare: "Care e cea mai sigură investiție dintre următoarele?",
    optiuni: ["Acțiuni la bursă", "Criptomonede", "Depozit bancar", "Fonduri mutuale speculative"],
    corect: 2,
    explicatie: "Depozitul bancar este garantat de stat (FGDB) până la 100.000 EUR, fiind cea mai sigură opțiune, deși cu randament mic.",
  },
  {
    intrebare: "Ce este inflația?",
    optiuni: [
      "Scăderea prețurilor de-a lungul timpului",
      "Creșterea generală a prețurilor de-a lungul timpului",
      "O taxă specială pe produse importate",
      "Reducerea masei monetare de către bancă",
    ],
    corect: 1,
    explicatie: "Inflația înseamnă creșterea generală a prețurilor. Banii tăi își pierd din puterea de cumpărare în timp dacă nu sunt investiți.",
  },
  {
    intrebare: "Dacă inflația e 5% și dobânda la depozit e 3%, ce se întâmplă cu puterea de cumpărare?",
    optiuni: ["Crește", "Scade", "Rămâne la fel", "Se dublează"],
    corect: 1,
    explicatie: "Dobânda (3%) nu acoperă inflația (5%), deci puterea de cumpărare scade cu ~2% pe an. Banii pierd valoare reală.",
  },
  {
    intrebare: "Ce este un ETF?",
    optiuni: [
      "Un tip de depozit bancar",
      "Un fond care urmărește un indice și se tranzacționează ca o acțiune",
      "O criptomonedă",
      "Un împrumut guvernamental",
    ],
    corect: 1,
    explicatie: "ETF-urile (Exchange Traded Funds) urmăresc indici precum BET sau S&P 500 și se cumpără/vând la bursă ca acțiunile, având comisioane mici.",
  },
  {
    intrebare: "Care e principala diferență între acțiuni și obligațiuni?",
    optiuni: [
      "Nu există diferențe",
      "Acțiunile oferă proprietate, obligațiunile sunt împrumuturi",
      "Acțiunile sunt mai sigure decât obligațiunile",
      "Obligațiunile oferă proprietate, acțiunile sunt împrumuturi",
    ],
    corect: 1,
    explicatie: "Acționarii dețin o parte din companie. Obligațiunile sunt împrumuturi către companie/stat, cu rambursare la scadență plus dobândă.",
  },
  {
    intrebare: "Ce înseamnă randament?",
    optiuni: [
      "Valoarea nominală a investiției",
      "Câștigul procentual dintr-o investiție",
      "Riscul asociat unei investiții",
      "Taxa plătită brokerului",
    ],
    corect: 1,
    explicatie: "Randamentul măsoară câștigul sau pierderea procentuală a unei investiții într-o perioadă. Spre exemplu, un randament de 7% pe an.",
  },
];

const STORAGE_KEY = "cost_quiz_results";

function StartScreen({ onStart }: { onStart: () => void }) {
  const { t } = useTranslation();
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-sm font-medium mb-6">
          <Brain size={14} />
          {t("Chestionar")}
        </div>
        <h1 className="text-4xl font-black text-main mb-4">{t("Quiz financiar")}</h1>
        <p className="text-muted max-w-md mx-auto">
          {t("Testează-ți cunoștințele despre dobândă compusă, investiții și educație financiară.")}
        </p>
      </div>

      <div className="space-y-4 mb-8">
        {[
          { emoji: <Brain size={20} className="text-purple-400" />, title: t("10 întrebări"), desc: t("Dobândă compusă, inflație, investiții") },
          { emoji: <Sparkles size={20} className="text-yellow-400" />, title: t("Explicații după fiecare răspuns"), desc: t("Înveți pe parcurs") },
          { emoji: <TrendingUp size={20} className="text-green-400" />, title: t("Câștigă XP și RON"), desc: t("Recompensă bazată pe scor") },
        ].map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex items-center gap-4 p-4 rounded-2xl border border-subtle bg-card"
          >
            <div className="shrink-0">{item.emoji}</div>
            <div>
              <div className="font-bold text-main text-sm">{item.title}</div>
              <div className="text-xs text-dim">{item.desc}</div>
            </div>
          </motion.div>
        ))}
      </div>

      <button
        onClick={onStart}
        className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-main font-black text-lg transition-all shadow-lg shadow-purple-900/30 flex items-center justify-center gap-2"
      >
        {t("Începe quizul")} <Brain size={20} />
      </button>

      <Link
        href="/"
        className="block text-center mt-4 text-subtle hover:text-main text-sm transition-colors"
      >
        {t("Înapoi la meniu")}
      </Link>
    </div>
  );
}

function ResultScreen({
  scor,
  total,
  xpCastigat,
  baniCastigati,
  raspunsuri,
  onRetry,
}: {
  scor: number;
  total: number;
  xpCastigat: number;
  baniCastigati: number;
  raspunsuri: { corect: boolean }[];
  onRetry: () => void;
}) {
  const { t } = useTranslation();
  const procent = Math.round((scor / total) * 100);
  const mesaj =
    procent === 100
      ? t("Perfect! Ești un expert financiar!")
      : procent >= 80
      ? t("Excelent! Cunoștințe solide!")
      : procent >= 60
      ? t("Bine! Mai ai de învățat dar ești pe drumul cel bun.")
      : procent >= 40
      ? t("Ok. Mai studiază conceptele financiare.")
      : t("Mai ai mult de învățat. Nu te descuraja!");

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center mb-8"
      >
        <div className="text-6xl mb-4">
          {procent === 100 ? "🏆" : procent >= 80 ? "🎉" : procent >= 60 ? "👏" : "💪"}
        </div>
        <h1 className="text-3xl font-black text-main mb-2">{t("Quiz complet!")}</h1>
        <p className="text-muted">{mesaj}</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="p-6 rounded-2xl border border-purple-500/30 bg-purple-500/10 mb-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <Brain size={18} className="text-purple-400" />
          <h2 className="font-bold text-main">{t("Rezultatele tale")}</h2>
        </div>
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="p-4 rounded-xl bg-card border border-subtle text-center">
            <div className="text-3xl font-black text-main">{scor}/{total}</div>
            <div className="text-xs text-subtle">{t("Scor")}</div>
          </div>
          <div className="p-4 rounded-xl bg-card border border-subtle text-center">
            <div className="text-3xl font-black text-purple-400">+{xpCastigat}</div>
            <div className="text-xs text-subtle">{t("XP")}</div>
          </div>
          <div className="p-4 rounded-xl bg-card border border-subtle text-center">
            <div className="text-3xl font-black text-green-400">+{baniCastigati}</div>
            <div className="text-xs text-subtle">{t("RON")}</div>
          </div>
        </div>
        <div className="flex gap-1 justify-center">
          {raspunsuri.map((r, i) => (
            <div
              key={i}
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                r.corect ? "bg-green-500/20 text-green-400 border border-green-500/40" : "bg-red-500/20 text-red-400 border border-red-500/40"
              }`}
            >
              {r.corect ? "✓" : "✗"}
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="space-y-3"
      >
        <button
          onClick={onRetry}
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-main font-bold transition-all"
        >
          {t("Încearcă din nou")}
        </button>
        <Link
          href="/"
          className="block w-full py-3 rounded-2xl border border-strong hover:border-strongest text-bright hover:text-main text-center font-semibold transition-all"
        >
          {t("Înapoi la meniu")}
        </Link>
      </motion.div>
    </div>
  );
}

export default function QuizGame() {
  const { t } = useTranslation();
  const { addXP } = useXP();
  const [screen, setScreen] = useState<"start" | "quiz" | "result">("start");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [raspunsuri, setRaspunsuri] = useState<{ corect: boolean }[]>([]);

  function startQuiz() {
    setScreen("quiz");
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setAnswered(false);
    setCorrectCount(0);
    setRaspunsuri([]);
  }

  function handleAnswer(index: number) {
    if (answered) return;
    setSelectedAnswer(index);
    setAnswered(true);
    const isCorrect = index === INTREBARI[currentQuestion].corect;
    if (isCorrect) setCorrectCount((c) => c + 1);
    setRaspunsuri((prev) => [...prev, { corect: isCorrect }]);

    if (isCorrect) {
      toast.success(t("Corect! 🎉"), { description: t(INTREBARI[currentQuestion].explicatie) });
    } else {
      toast.error(t("Incorect!"), { description: t(INTREBARI[currentQuestion].explicatie) });
    }
  }

  function nextQuestion() {
    if (currentQuestion < INTREBARI.length - 1) {
      setCurrentQuestion((q) => q + 1);
      setSelectedAnswer(null);
      setAnswered(false);
    } else {
      finishQuiz();
    }
  }

  function finishQuiz() {
    const total = INTREBARI.length;
    const xpCastigat = Math.round((correctCount / total) * 50);
    const baniCastigati = Math.round((correctCount / total) * 200);

    addXP(xpCastigat);

    const rezultat: MiniGameResult = {
      id: crypto.randomUUID(),
      tip: "quiz",
      scor: correctCount,
      maxim: total,
      xpCastigat,
      baniCastigati,
      timestamp: Date.now(),
    };

    try {
      const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      existing.push(rezultat);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
    } catch {}

    setScreen("result");
  }

  function retry() {
    setScreen("start");
  }

  const progress = ((currentQuestion) / INTREBARI.length) * 100;

  return (
    <Layout>
      <OrbBackground bgClass="bg-gradient-to-br from-purple-950 via-slate-900 to-indigo-950" />
      {screen === "start" && <StartScreen onStart={startQuiz} />}
      {screen === "quiz" && (
        <div className="max-w-2xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <Link href="/" className="inline-flex items-center gap-1.5 text-dim hover:text-main text-sm transition-colors">
              <X size={14} /> {t("Înapoi")}
            </Link>
            <span className="text-xs text-subtle">{t("Întrebarea")} {currentQuestion + 1} / {INTREBARI.length}</span>
          </div>

          <div className="w-full h-1.5 bg-card-hover rounded-full overflow-hidden mb-6">
            <div className="h-full bg-gradient-to-r from-purple-500 to-fuchsia-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.3 }}
            >
              <div className="p-6 rounded-2xl border border-medium bg-card mb-4">
                <div className="flex items-center gap-2 mb-4">
                  <Brain size={18} className="text-purple-400" />
                  <span className="text-xs text-purple-300 font-medium">{t("Întrebarea")} {currentQuestion + 1}</span>
                </div>
                <h2 className="text-lg font-bold text-main mb-6">{t(INTREBARI[currentQuestion].intrebare)}</h2>
                <div className="space-y-3">
                  {INTREBARI[currentQuestion].optiuni.map((optiune, i) => {
                    let cls = "border-subtle bg-card hover:bg-card-hover hover:border-strong text-left";
                    if (answered) {
                      if (i === INTREBARI[currentQuestion].corect) {
                        cls = "border-green-500/60 bg-green-600/20 text-left";
                      } else if (i === selectedAnswer && i !== INTREBARI[currentQuestion].corect) {
                        cls = "border-red-500/60 bg-red-600/20 text-left";
                      } else {
                        cls = "border-subtle bg-card opacity-50 text-left";
                      }
                    }
                    return (
                      <button
                        key={i}
                        onClick={() => handleAnswer(i)}
                        disabled={answered}
                        className={`w-full p-4 rounded-xl border transition-all group ${cls}`}
                      >
                        <div className="font-semibold text-main text-sm">{t(optiune)}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {answered && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-2xl border mb-4 ${
                    selectedAnswer === INTREBARI[currentQuestion].corect
                      ? "border-green-500/30 bg-green-500/10"
                      : "border-red-500/30 bg-red-500/10"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`font-bold text-sm ${selectedAnswer === INTREBARI[currentQuestion].corect ? "text-green-300" : "text-red-300"}`}>
                      {selectedAnswer === INTREBARI[currentQuestion].corect ? t("Corect!") : t("Incorect!")}
                    </span>
                  </div>
                  <p className="text-xs text-muted">{t(INTREBARI[currentQuestion].explicatie)}</p>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>

          {answered && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={nextQuestion}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-main font-bold text-base transition-all shadow-lg shadow-purple-900/30"
            >
              {currentQuestion < INTREBARI.length - 1 ? t("Următoarea întrebare") : t("Vezi rezultatul")}
            </motion.button>
          )}
        </div>
      )}
      {screen === "result" && (
        <ResultScreen
          scor={correctCount}
          total={INTREBARI.length}
          xpCastigat={Math.round((correctCount / INTREBARI.length) * 50)}
          baniCastigati={Math.round((correctCount / INTREBARI.length) * 200)}
          raspunsuri={raspunsuri}
          onRetry={retry}
        />
      )}
    </Layout>
  );
}
