// === SCENARIOS ===
export type DifficultyKey = "usor" | "mediu" | "greu";

export interface SubScenario {
  id: string;
  label: string;
  description: string;
  venitBonus: number;
  cheltuieliExtra: { nume: string; suma: number }[];
}

export interface Scenario {
  id: string;
  nume: string;
  descriere: string;
  emoji: string;
  bgClass: string;
  accentColor: string;
  venitLunar: number;
  cheltuieliFixe: { nume: string; suma: number }[];
  subScenarii: SubScenario[];
  xpRequired: number;
  seasonal?: boolean;
  seasonTag?: string;
  isPremium?: boolean;
  isInternal?: boolean;
}

// === EVENTS ===
export interface Optiune {
  text: string;
  bani: number;
  fericirePct: number;
  reputatiePct?: number;
  lectie: string;
  bonusXP?: number;
}

export interface SubScenariuModificari {
  descriere?: string;
  optiuni?: Optiune[];
}

export type SubScenariuOverrides = Record<string, SubScenariuModificari>;

export interface GameEvent {
  id: string;
  titlu: string;
  descriere: string;
  optiuni: Optiune[];
  sezon?: string;
  subScenariuModificari?: SubScenariuOverrides;
  isTutorialEvent?: boolean;
  isPremium?: boolean;
}

// === GAME STATE ===
export interface DecizieIstorica {
  id: string;
  luna: number;
  saptamana: number;
  titluEveniment: string;
  alegere: string;
  lectie: string;
  baniDelta: number;
  fericireDelta: number;
  reputatieDelta?: number;
  timestamp: number;
}

export interface GameState {
  scenariuId: string;
  subScenariuId: string;
  dificultateKey: DifficultyKey;
  bani: number;
  fericire: number;
  reputatie: number;
  venitLunar: number;
  saptamana: number;
  luna: number;
  saptamanaInLuna: number;
  istoricDecizii: DecizieIstorica[];
  isGameOver: boolean;
  gameOverTitle: string;
  gameOverReason: string;
  isEndless: boolean;
  evenimentCurent: GameEvent | null;
  evenimenteRamase: GameEvent[];
  aiQuestion: AiQuestion | null;
  isRecoveryMode: boolean;
  recoveryWeeksRemaining: number;
  originalScenarioId?: string;
}

export interface Investment {
  id: string;
  tip: "actiuni" | "fond_mutual" | "depozit";
  nume: string;
  sumaInvestita: number;
  valoareCurenta: number;
  randamentAnual: number;
  dataCumpararii: number;
  risc: "scazut" | "mediu" | "ridicat";
}

export interface ObiectivTermenLung {
  id: string;
  nume: string;
  tip: "masina" | "casa" | "calatorie" | "educatie" | "personalizat";
  sumaTinta: number;
  sumaAcumulata: number;
  termenLuni: number;
  prioritate: "scazuta" | "medie" | "ridicata";
}

export interface MiniGameResult {
  id: string;
  tip: "quiz" | "bursa";
  scor: number;
  maxim: number;
  xpCastigat: number;
  baniCastigati: number;
  timestamp: number;
}

// === FINANCE ===
export type TransactionType = "venit" | "cheltuiala" | "economie";

export interface Transaction {
  id: string;
  tip: TransactionType;
  descriere: string;
  suma: number;
  categorie: string;
  data: string;
}

export interface Budget {
  categorie: string;
  limita: number;
}

export interface FinanceState {
  tranzactii: Transaction[];
  budgete: Budget[];
  obiectivEconomii: number;
  economiiCurente: number;
}

// === XP ===
export interface XPState {
  xp: number;
  level: number;
  scenariiDeblocate: string[];
}

// === AUTH ===
export interface AuthUser {
  sub: string;
  name: string;
  email: string;
  picture?: string;
}

// === THEME ===
export interface ThemePreset {
  id: string;
  label: string;
  primary: string;
  primaryH: number;
  primaryS: number;
  primaryL: number;
  secondary: string;
  secondaryH: number;
  secondaryS: number;
  secondaryL: number;
  bg: string;
  bgH: number;
  bgS: number;
  bgL: number;
}

export interface ThemeState {
  presetId: string;
  customColor: string | null;
}

// === CHALLENGES ===
export interface ChallengeStats {
  xpCastigat: number
  baniEconomisiti: number
  evenimenteCompletate: number
  aiAnswersDate: number
  fericireMedie: number
  reputatieMedie: number
  scenariiFinalizate: string[]
  investitiiActive: number
  saptamaniJucate: number
}

export interface Challenge {
  id: string
  titlu: string
  descriere: string
  tip: "saptamanala" | "lunara"
  obiectiv: string
  conditie: (stats: ChallengeStats) => boolean
  recompensaXP: number
  recompensaBani: number
  emoji: string
  dificultate: "usor" | "mediu" | "greu"
  isPremium?: boolean
}

// === SHOP ===
export interface ShopItem {
  id: string
  tip: "tema" | "avatar" | "booster" | "badge"
  nume: string
  descriere: string
  pretXP: number
  pretBani: number
  emoji: string
  durataZile?: number
  efect?: string
}

// === DATABASE (Supabase) ===
export interface DBUser {
  id: string;
  email: string;
  name: string;
  picture: string | null;
  is_admin: boolean;
  is_banned: boolean;
  created_at: string;
}

export interface DBLeaderboardEntry {
  id: string;
  user_id: string;
  username: string;
  score: number;
  months: number;
  scenario: string;
  created_at: string;
}

// === LEADERBOARD ===
export interface LeaderboardEntry {
  id: string;
  username: string;
  score: number;
  months: number;
  scenario: string;
  date: number;
}

// === TUTORIAL ===
export interface TutorialEvent {
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

export interface TutorialState {
  money: number;
  happiness: number;
  week: number;
  decisions: TutorialDecision[];
  currentEvent: TutorialEvent | null;
  isComplete: boolean;
}

export interface TutorialDecision {
  id: string;
  week: number;
  title: string;
  choice: string;
  lesson: string;
  moneyChange: number;
  happinessChange: number;
}

// === GAME HELPERS ===
export interface SursaVenit {
  id: string;
  nume: string;
  suma: number;
}

export type HistoryFilter = "tutto" | "luna" | "saptamana";

// === AI QUESTIONS ===
export interface AiAnswerResult {
  corect: boolean;
  baniDelta: number;
  fericireDelta: number;
  reputatieDelta?: number;
  explicatie: string;
}

export interface AiQuestion {
  intrebare: string;
  status: "generating" | "available" | "evaluating" | "evaluated";
  rezultat: AiAnswerResult | null;
}

export type SubscriptionTier = "free" | "premium_basic" | "premium_advanced";

// Achievements
export interface Achievement {
  id: string;
  titlu: string;
  descriere: string;
  icon: string;
  categorie: "joc" | "social" | "progresie" | "ascuns";
  conditie: (stats: AchievementStats) => boolean;
  xpReward: number;
}

export interface AchievementStats {
  totalJocuri: number;
  totalVictorii: number;
  scenariiDeblocate: number;
  scenariiJucate: string[];
  nivelCurent: number;
  baniTotaliCastigati: number;
  evenimenteCompletate: number;
  tutorialCompletat: boolean;
  premiumActiv: boolean;
  utilizatorConectat: boolean;
  achievementIds: string[];
}

export interface BadgeData {
  id: string;
  titlu: string;
  descriere: string;
  icon: string;
  deblocatLa: number | null;
}

// Raport financiar
export interface FinancialReport {
  totalVenituri: number;
  totalCheltuieli: number;
  balanta: number;
  cheltuieliPeCategorii: Record<string, number>;
  venituriPeCategorii: Record<string, number>;
  cashFlow: { saptamana: number; valoare: number }[];
  sfaturi: string[];
  scorSanatateFinanciara: number;
}

// PWA
export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}
