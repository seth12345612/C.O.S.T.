import { useState, useEffect, useCallback } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Coins, Smile, Calendar, ArrowLeft, BookOpen, Sparkles, GraduationCap } from "lucide-react";
import { OrbBackground } from "@/components/OrbBackground";
import { Layout } from "@/components/Layout";
import { useXP } from "@/context/XPContext";

interface TutorialDecision {
  id: string;
  week: number;
  title: string;
  choice: string;
  lesson: string;
  moneyChange: number;
  happinessChange: number;
}

interface TutorialState {
  money: number;
  happiness: number;
  week: number;
  decisions: TutorialDecision[];
  currentEvent: TutorialEvent | null;
  isComplete: boolean;
}

interface TutorialEvent {
  id: string;
  title: string;
  description: string;
  options: {
    text: string;
    money: number;
    happiness: number;
    lesson: string;
  }[];
}

const TUTORIAL_EVENTS: TutorialEvent[] = [
  {
    id: "tutorial_1",
    title: "Prima săptămână la cămin",
    description: "Colegul tău îți propune să ieșiți în oraș pentru a socializa. E prima oară când vei cheltui pentru distracție.",
    options: [
      { text: "Merg cu el, dar doar la o cafea", money: -30, happiness: 15, lesson: "Poți să te distrezi și cu buget redus. Socializarea nu trebuie să coste mult." },
      { text: "Refuz, să economisesc", money: 0, happiness: -5, lesson: "E important să economisești, dar uneori puțină socializare te ajută să te simți mai bine." },
      { text: "Merg și platesc eu pentru amândoi", money: -80, happiness: 25, lesson: "Generozitatea e frumoasă, dar cu buget de student trebuie să fii atent." },
    ],
  },
  {
    id: "tutorial_2",
    title: "Cheltuieli neprevăzute",
    description: "Ai descoperit că îți trebuie materiale noi pentru cursuri. Cărțile costă mai mult decât ai planificat.",
    options: [
      { text: "Cumperi tot nou", money: -200, happiness: 10, lesson: "Materialele noi sunt bune, dar poți găsi și variante mai ieftine." },
      { text: "Cumperi second-hand", money: -80, happiness: 0, lesson: "Cărțile second-hand sunt la fel de bune și economisesc bani." },
      { text: "Împrumut de la bibliotecă", money: 0, happiness: -5, lesson: "Biblioteca e o resursă gratuită. Folosește-o când poți!" },
    ],
  },
  {
    id: "tutorial_3",
    title: "Ocazie de muncă part-time",
    description: "Un prieten îți spune că există un job part-time la un restaurant. Salariul e mic, dar câștigi experiență.",
    options: [
      { text: "Accept jobul", money: 400, happiness: -10, lesson: "Munca part-time adaugă bani, dar ia din timpul de studiu." },
      { text: "Nu accept, să mă focusez pe facultate", money: 0, happiness: 5, lesson: "Concentrarea pe facultate e importantă, dar un job part-time light poate ajuta." },
    ],
  },
  {
    id: "tutorial_4",
    title: "Criza de mijloc de lună",
    description: "E deja mijlocul lunii și banii încep să se termine. Trebuie să decizi cum gestionezi restul lunii.",
    options: [
      { text: "Reduc cheltuielile la minim", money: 50, happiness: -15, lesson: "Reducerea cheltuielilor te ajută să treci luna, dar afectează fericirea." },
      { text: "Caut activități gratuite", money: 20, happiness: 5, lesson: "Poți să te distrezi și gratuit: parcul, evenimente studențești, etc." },
      { text: "Recurg la mâncare de la părinți", money: 100, happiness: 0, lesson: "Ajutorul familiei e ok, dar nu te baza permanent pe el." },
    ],
  },
];

const LESSONS_LEARNED = [
  "✅ Bugetarea e esențială - știi pe ce cheltuiești banii",
  "✅ Cheltuielile mici se adună - cafeaua zilnică costă 900 lei/lună",
  "✅ Fericirea nu depinde de bani - activități gratuite există",
  "✅ Planificarea lunară te ajută să nu intri în criză",
  "✅ Echilibrul între economie și distracție e cheia",
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.4 } }),
};

function TutorialGame() {
  const [, navigate] = useLocation();
  const { addXP } = useXP();
  const [state, setState] = useState<TutorialState>({
    money: 1500,
    happiness: 70,
    week: 0,
    decisions: [],
    currentEvent: null,
    isComplete: false,
  });
  const [showLesson, setShowLesson] = useState<string | null>(null);

  const startTutorial = useCallback(() => {
    setState((prev) => ({
      ...prev,
      week: 1,
      currentEvent: TUTORIAL_EVENTS[0],
    }));
  }, []);

  const handleChoice = useCallback((optionIndex: number) => {
    if (!state.currentEvent) return;
    const option = state.currentEvent.options[optionIndex];

    const decision: TutorialDecision = {
      id: `${state.currentEvent.id}-${Date.now()}`,
      week: state.week,
      title: state.currentEvent.title,
      choice: option.text,
      lesson: option.lesson,
      moneyChange: option.money,
      happinessChange: option.happiness,
    };

    const nextWeekIndex = state.week;
    const nextEvent = nextWeekIndex < 4 ? TUTORIAL_EVENTS[nextWeekIndex] : null;

    setState((prev) => ({
      ...prev,
      money: Math.max(0, Math.min(10000, prev.money + option.money)),
      happiness: Math.max(0, Math.min(100, prev.happiness + option.happiness)),
      week: prev.week + 1,
      decisions: [...prev.decisions, decision],
      currentEvent: nextEvent,
      isComplete: nextEvent === null,
    }));

    setShowLesson(option.lesson);

    setTimeout(() => setShowLesson(null), 3000);
  }, [state.currentEvent, state.week]);

  useEffect(() => {
    if (state.isComplete && state.decisions.length > 0) {
      addXP(10);
    }
  }, [state.isComplete, state.decisions.length, addXP]);

  if (state.week === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-300 text-sm font-medium mb-6">
            <Sparkles size={14} />
            Mod Practică
          </div>
          <h1 className="text-4xl font-black text-main mb-4">Tutorial Financiar</h1>
          <p className="text-muted max-w-md mx-auto">
            Învață cum să gestionezi banii de student în 4 săptămâni simulate. 
            Primești 10 XP la final și niciun ban nu va fi transferat în viața reală!
          </p>
        </div>

        <div className="space-y-4 mb-8">
          {[
            { emoji: "📅", title: "4 săptămâni", desc: "Simulare rapidă de o lună" },
            { emoji: "🎓", title: "Decizii reale", desc: "Situații pe care le vei întâlni" },
            { emoji: "💡", title: "Lecții utile", desc: "Sfaturi pentru viața ta de student" },
            { emoji: "🏆", title: "10 XP", desc: "Recompensă mică pentru învățare" },
          ].map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center gap-4 p-4 rounded-2xl border border-subtle bg-card"
            >
              <span className="text-2xl">{item.emoji}</span>
              <div>
                <div className="font-bold text-main text-sm">{item.title}</div>
                <div className="text-xs text-dim">{item.desc}</div>
              </div>
            </motion.div>
          ))}
        </div>

        <button
          onClick={startTutorial}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-main font-black text-lg transition-all shadow-lg shadow-purple-900/30 flex items-center justify-center gap-2"
        >
          Începe tutorialul <ChevronRight size={20} />
        </button>

        <Link
          href="/"
          className="block text-center mt-4 text-subtle hover:text-main text-sm transition-colors"
        >
          Înapoi la meniu
        </Link>
      </div>
    );
  }

  if (state.isComplete) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center mb-8"
        >
          <div className="text-6xl mb-4">🎓</div>
          <h1 className="text-3xl font-black text-main mb-2">Felicitări!</h1>
          <p className="text-muted">Ai terminat tutorialul financiar</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-6 rounded-2xl border border-purple-500/30 bg-purple-500/10 mb-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <Sparkles size={18} className="text-purple-400" />
            <h2 className="font-bold text-main"> Rezultatele tale</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-card border border-subtle text-center">
              <Coins size={20} className="text-yellow-400 mx-auto mb-2" />
              <div className="text-2xl font-black text-main">{state.money} RON</div>
              <div className="text-xs text-subtle">Bani rămași</div>
            </div>
            <div className="p-4 rounded-xl bg-card border border-subtle text-center">
              <Smile size={20} className="text-green-400 mx-auto mb-2" />
              <div className="text-2xl font-black text-main">{state.happiness}%</div>
              <div className="text-xs text-subtle">Nivel fericire</div>
            </div>
          </div>
          <div className="mt-4 p-3 rounded-xl bg-purple-600/20 border border-purple-500/30 text-center">
            <span className="text-purple-300 font-bold">+10 XP câștigat!</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-6 rounded-2xl border border-subtle bg-card mb-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <BookOpen size={18} className="text-yellow-400" />
            <h2 className="font-bold text-main">Lecții învățate</h2>
          </div>
          <div className="space-y-2">
            {LESSONS_LEARNED.map((lesson, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="text-sm text-strong"
              >
                {lesson}
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="space-y-3"
        >
          <button
            onClick={() => {
              setState({
                money: 1500,
                happiness: 70,
                week: 0,
                decisions: [],
                currentEvent: null,
                isComplete: false,
              });
            }}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-main font-bold transition-all"
          >
            Repetă tutorialul
          </button>
          <Link
            href="/game"
            className="block w-full py-3 rounded-2xl border border-strong hover:border-strongest text-bright hover:text-main text-center font-semibold transition-all"
          >
            Joacă acum pe bune
          </Link>
          <Link
            href="/"
            className="block w-full py-3 rounded-2xl bg-card hover:bg-card-hover text-muted hover:text-main text-center font-medium transition-all text-sm"
          >
            Înapoi la meniu
          </Link>
        </motion.div>
      </div>
    );
  }

  const progressPct = ((state.week - 1) / 4) * 100;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <Link href="/" className="inline-flex items-center gap-1.5 text-dim hover:text-main text-sm transition-colors">
          <ArrowLeft size={14} /> Ieșire
        </Link>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-300 text-xs font-medium">
          <Sparkles size={12} />
          Practice Mode
        </div>
      </div>

      <div className="p-4 rounded-2xl border border-subtle bg-card mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-purple-400" />
            <span className="font-bold text-main text-sm">Săptămâna {state.week} din 4</span>
          </div>
        </div>
        <div className="w-full h-2 bg-card-hover rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-purple-500 to-orange-500 rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="p-4 rounded-2xl border border-subtle bg-card">
          <div className="flex items-center gap-2 mb-2">
            <Coins size={16} className="text-yellow-400" />
            <span className="text-xs text-muted">Bani</span>
          </div>
          <div className="text-xl font-black text-main">{state.money} RON</div>
        </div>
        <div className="p-4 rounded-2xl border border-subtle bg-card">
          <div className="flex items-center gap-2 mb-2">
            <Smile size={16} className="text-green-400" />
            <span className="text-xs text-muted">Fericire</span>
          </div>
          <div className="text-xl font-black text-main">{state.happiness}%</div>
        </div>
      </div>

      <AnimatePresence>
        {showLesson && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4 p-4 rounded-2xl border border-yellow-500/30 bg-yellow-500/10"
          >
            <div className="flex items-center gap-2 mb-2">
              <BookOpen size={14} className="text-yellow-400" />
              <span className="font-bold text-yellow-300 text-sm">Lecție</span>
            </div>
            <p className="text-sm text-bright">{showLesson}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {state.currentEvent && (
        <motion.div
          key={state.currentEvent.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-2xl border border-medium bg-card"
        >
          <div className="flex items-center gap-2 mb-4">
            <GraduationCap size={18} className="text-purple-400" />
            <span className="text-xs text-purple-300 font-medium">Eveniment</span>
          </div>
          <h2 className="text-xl font-bold text-main mb-2">{state.currentEvent.title}</h2>
          <p className="text-muted text-sm mb-6">{state.currentEvent.description}</p>

          <div className="space-y-3">
            {state.currentEvent.options.map((option, i) => (
              <button
                key={i}
                onClick={() => handleChoice(i)}
                className="w-full p-4 rounded-xl border border-subtle bg-card hover:bg-card-hover hover:border-strong text-left transition-all group"
              >
                <div className="font-semibold text-main text-sm mb-1">{option.text}</div>
                <div className="flex gap-3 text-xs">
                  <span className={option.money >= 0 ? "text-green-400" : "text-red-400"}>
                    {option.money >= 0 ? "+" : ""}{option.money} RON
                  </span>
                  <span className={option.happiness >= 0 ? "text-blue-400" : "text-orange-400"}>
                    {option.happiness >= 0 ? "+" : ""}{option.happiness}% fericire
                  </span>
                </div>
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default function Tutorial() {
  return (
    <Layout>
      <OrbBackground />
      <TutorialGame />
    </Layout>
  );
}