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

export const SCENARII: Record<string, Scenario> = {
  camin: {
    id: "camin",
    nume: "Student la cămin",
    descriere: "Chirie mică, venituri din bursă și ocazional job part-time. Accent pe disciplina financiară.",
    emoji: "🏫",
    bgClass: "bg-scenario-camin",
    accentColor: "#7828c8",
    venitLunar: 900,
    cheltuieliFixe: [
      { nume: "Chirie cămin", suma: 350 },
      { nume: "Internet", suma: 80 },
    ],
    subScenarii: [
      {
        id: "singur",
        label: "Cameră singur",
        description: "Ai camera pentru tine. Mai scump, dar mai mult spațiu și liniște.",
        venitBonus: -100,
        cheltuieliExtra: [{ nume: "Suprataxă cameră individuală", suma: 150 }],
      },
      {
        id: "coleg",
        label: "Cu coleg de cameră",
        description: "Împarți camera cu un coleg. Economisești la cheltuieli.",
        venitBonus: 0,
        cheltuieliExtra: [],
      },
      {
        id: "bursier",
        label: "Bursier merit",
        description: "Ai bursă de merit. Venit lunar mai mare, dar presiune academică.",
        venitBonus: 300,
        cheltuieliExtra: [],
      },
    ],
    xpRequired: 0,
    isPremium: false,
  },
  navetist: {
    id: "navetist",
    nume: "Student Navetist",
    descriere: "Locuiești cu părinții, faci naveta. Economisești chiria, dar pierzi timp pe drum.",
    emoji: "🚂",
    bgClass: "bg-scenario-navetist",
    accentColor: "#0284c7",
    venitLunar: 1200,
    cheltuieliFixe: [
      { nume: "Abonament transport", suma: 400 },
      { nume: "Contribuție casă", suma: 200 },
    ],
    subScenarii: [
      {
        id: "tren",
        label: "Cu trenul",
        description: "Faci naveta cu trenul. Mai ieftin, dar mai lent.",
        venitBonus: 0,
        cheltuieliExtra: [],
      },
      {
        id: "masina",
        label: "Cu mașina personală",
        description: "Conduci la facultate. Mai rapid, dar cheltuieli mari cu carburantul.",
        venitBonus: 0,
        cheltuieliExtra: [{ nume: "Carburant", suma: 300 }, { nume: "Parcare", suma: 100 }],
      },
      {
        id: "bursier",
        label: "Bursier + navetist",
        description: "Ai bursă și locuiești acasă. Maxim de economii, minim de cheltuieli.",
        venitBonus: 350,
        cheltuieliExtra: [],
      },
    ],
    xpRequired: 0,
    isPremium: false,
  },
  chirie: {
    id: "chirie",
    nume: "Student în chirie",
    descriere: "Chirie mai mare, venit din job part-time. Echilibru între muncă și timp liber.",
    emoji: "🏢",
    bgClass: "bg-scenario-chirie",
    accentColor: "#16a34a",
    venitLunar: 2000,
    cheltuieliFixe: [
      { nume: "Chirie apartament", suma: 1200 },
      { nume: "Utilități / internet", suma: 250 },
    ],
    subScenarii: [
      {
        id: "singur",
        label: "Apartament singur",
        description: "Ai apartamentul pentru tine. Libertate totală, cheltuieli mai mari.",
        venitBonus: 0,
        cheltuieliExtra: [],
      },
      {
        id: "colegi",
        label: "Cu 2 colegi",
        description: "Împarți chiria cu doi colegi. Chiria scade, dar spațiul e limitat.",
        venitBonus: 200,
        cheltuieliExtra: [{ nume: "Chirie redusă", suma: -400 }],
      },
      {
        id: "freelancer",
        label: "Student Freelancer",
        description: "Ai job part-time online. Venit variabil dar mai mare.",
        venitBonus: 500,
        cheltuieliExtra: [{ nume: "Abonament unelte online", suma: 120 }],
      },
    ],
    xpRequired: 200,
    isPremium: false,
  },
  garsoniera: {
    id: "garsoniera",
    nume: "Student cu job full-time",
    descriere: "Garsonieră proprie, job full-time și cursuri. Venit mai mare, oboseală mai mare.",
    emoji: "🏠",
    bgClass: "bg-scenario-garsoniera",
    accentColor: "#d97706",
    venitLunar: 4000,
    cheltuieliFixe: [
      { nume: "Chirie garsonieră", suma: 1250 },
      { nume: "Utilități / internet", suma: 300 },
    ],
    subScenarii: [
      {
        id: "it",
        label: "Domeniu IT",
        description: "Lucrezi în IT. Salariu mai mare, ore flexibile.",
        venitBonus: 800,
        cheltuieliExtra: [{ nume: "Abonament software", suma: 200 }],
      },
      {
        id: "retail",
        label: "Retail / Servicii",
        description: "Lucrezi în retail. Program fix, salariu mai mic.",
        venitBonus: -500,
        cheltuieliExtra: [{ nume: "Transport zilnic", suma: 150 }],
      },
      {
        id: "startup",
        label: "Startup propriu",
        description: "Îți deschizi un mic business. Risc mare, potențial mare.",
        venitBonus: 1000,
        cheltuieliExtra: [{ nume: "Cheltuieli business", suma: 500 }, { nume: "Taxe contabil", suma: 300 }],
      },
    ],
    xpRequired: 500,
    isPremium: true,
  },
  iarna: {
    id: "iarna",
    nume: "Iarna Studentului",
    descriere: "Sezon special de iarnă cu provocări unice: frig, examene, cadouri și sărbători.",
    emoji: "❄️",
    bgClass: "bg-scenario-iarna",
    accentColor: "#38bdf8",
    venitLunar: 1500,
    cheltuieliFixe: [
      { nume: "Chirie / cămin", suma: 500 },
      { nume: "Factura gaz / căldură", suma: 350 },
      { nume: "Internet", suma: 80 },
    ],
    subScenarii: [
      {
        id: "craciun",
        label: "Sezon de Crăciun",
        description: "Crăciunul se apropie. Cadouri, petreceri și distracție — dar buzunarul suferă.",
        venitBonus: 200,
        cheltuieliExtra: [{ nume: "Buget cadouri", suma: 400 }],
      },
      {
        id: "sesiune",
        label: "Sesiunea de Iarnă",
        description: "Examene, nopți albe și cafea multă. Focusul tău e pe note, nu pe bani.",
        venitBonus: -200,
        cheltuieliExtra: [{ nume: "Materiale studiu / cafea", suma: 150 }],
      },
    ],
    xpRequired: 300,
    seasonal: true,
    seasonTag: "iarna",
    isPremium: true,
  },
  vara: {
    id: "vara",
    nume: "Vara Studentului",
    descriere: "Vacanță de vară cu job sezonier, festivaluri și aventuri. Câștiguri mari, tentații pe măsură.",
    emoji: "☀️",
    bgClass: "bg-scenario-vara",
    accentColor: "#f59e0b",
    venitLunar: 2500,
    cheltuieliFixe: [
      { nume: "Chirie vară", suma: 600 },
      { nume: "Utilități", suma: 200 },
    ],
    subScenarii: [
      {
        id: "job_sezonier",
        label: "Job sezonier plajă",
        description: "Lucrezi la mare ca barman sau animator. Tip bune, dar tentații mari.",
        venitBonus: 1000,
        cheltuieliExtra: [{ nume: "Transport / cazare", suma: 300 }],
      },
      {
        id: "internship",
        label: "Internship în companie",
        description: "Faci internship plătit. Experiență valoroasă și un salariu decent.",
        venitBonus: 500,
        cheltuieliExtra: [],
      },
    ],
    xpRequired: 400,
    seasonal: true,
    seasonTag: "vara",
    isPremium: true,
  },
  vacanta: {
    id: "vacanta",
    nume: "Vacanță & Călătorii",
    descriere: "Planifici o vacanță cu prietenii. Experiențe de neuitat — dacă bugetul permite!",
    emoji: "✈️",
    bgClass: "bg-scenario-vacanta",
    accentColor: "#06b6d4",
    venitLunar: 3000,
    cheltuieliFixe: [
      { nume: "Cazare vacanță", suma: 800 },
      { nume: "Transport", suma: 400 },
    ],
    subScenarii: [
      {
        id: "europa",
        label: "City-break Europa",
        description: "O scurtă vacanță în Europa. Ieftină dacă ești atent la oferte.",
        venitBonus: 0,
        cheltuieliExtra: [{ nume: "Bilete avion", suma: 500 }, { nume: "Vize / asigurare", suma: 150 }],
      },
      {
        id: "mare",
        label: "Vacanță la mare",
        description: "Câteva zile la Marea Neagră. Clasic și accesibil.",
        venitBonus: 0,
        cheltuieliExtra: [{ nume: "Cazare all-inclusive", suma: 700 }],
      },
    ],
    xpRequired: 600,
    seasonal: true,
    seasonTag: "vacanta",
    isPremium: true,
  },
  recuperare: {
    id: "recuperare",
    nume: "Recuperare Financiară",
    descriere: "Te afli într-o situație financiară critică. Trebuie să alegi jobsuri pentru a ieși din datorii.",
    emoji: "⚠️",
    bgClass: "bg-scenario-navetist",
    accentColor: "#dc2626",
    venitLunar: 0,
    cheltuieliFixe: [],
    subScenarii: [],
    xpRequired: 0,
    isInternal: true,
  },
};

export const DIFICULTATI: Record<DifficultyKey, { nume: string; baniMultiplier: number; fericireMultiplier: number }> = {
  usor: { nume: "Ușor", baniMultiplier: 1.3, fericireMultiplier: 1.3 },
  mediu: { nume: "Mediu", baniMultiplier: 1, fericireMultiplier: 1 },
  greu: { nume: "Greu", baniMultiplier: 0.7, fericireMultiplier: 0.7 },
};

export const START_CONFIG: Record<string, Record<DifficultyKey, { bani: number; fericire: number }>> = {
  camin: { usor: { bani: 4000, fericire: 100 }, mediu: { bani: 2500, fericire: 95 }, greu: { bani: 2000, fericire: 90 } },
  chirie: { usor: { bani: 3600, fericire: 95 }, mediu: { bani: 2900, fericire: 90 }, greu: { bani: 2400, fericire: 85 } },
  garsoniera: { usor: { bani: 3000, fericire: 90 }, mediu: { bani: 2500, fericire: 85 }, greu: { bani: 2000, fericire: 80 } },
  navetist: { usor: { bani: 3500, fericire: 95 }, mediu: { bani: 2800, fericire: 90 }, greu: { bani: 2200, fericire: 85 } },
  iarna: { usor: { bani: 3000, fericire: 90 }, mediu: { bani: 2200, fericire: 85 }, greu: { bani: 1800, fericire: 80 } },
  vara: { usor: { bani: 4000, fericire: 100 }, mediu: { bani: 3000, fericire: 95 }, greu: { bani: 2500, fericire: 90 } },
  vacanta: { usor: { bani: 5000, fericire: 100 }, mediu: { bani: 3500, fericire: 95 }, greu: { bani: 2500, fericire: 88 } },
};
