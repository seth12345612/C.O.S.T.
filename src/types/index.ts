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
  lectie: string;
  bonusXP?: number;
}

export interface LimitedEventOptiune extends Optiune {
  explicatie: string;
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

export interface LimitedEvent {
  id: string;
  titlu: string;
  descriere: string;
  emoji: string;
  endsAt: number;
  bonusXP: number;
  bonusBani?: number;
  bonusFericire?: number;
  scenariuCompatibil: string[];
  culoare: string;
  optiuni?: LimitedEventOptiune[];
  sezon?: "iarna" | "vara";
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
  timestamp: number;
}

export interface GameState {
  scenariuId: string;
  subScenariuId: string;
  dificultateKey: DifficultyKey;
  bani: number;
  fericire: number;
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
  limitedEventBonus?: { xp: number; bani?: number; fericire?: number };
  isRecoveryMode: boolean;
  recoveryWeeksRemaining: number;
  originalScenarioId?: string;
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

export interface CompletedChoice {
  eventId: string;
  optionIndex: number;
  bani: number;
  fericirePct: number;
  lectie: string;
  timestamp: number;
}
