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
    xpRequired: 200,
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
    xpRequired: 150,
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
  supermarket: {
    id: "supermarket",
    nume: "Student la Supermarket",
    descriere: "Lucrezi part-time la supermarket. Program stabil, venit modest dar sigur.",
    emoji: "🛒",
    bgClass: "bg-scenario-camin",
    accentColor: "#7c3aed",
    venitLunar: 1100,
    cheltuieliFixe: [
      { nume: "Chirie cămin", suma: 400 },
      { nume: "Mâncare", suma: 300 },
    ],
    subScenarii: [
      {
        id: "raion",
        label: "Angajat raion",
        description: "Lucrezi în raionul de produse. Program de 8 ore, uneori weekenduri.",
        venitBonus: 0,
        cheltuieliExtra: [{ nume: "Uniformă / echipament", suma: 80 }],
      },
      {
        id: "casier",
        label: "Casier",
        description: "Ești casier. Program fix, dar situații tensionate cu clienții.",
        venitBonus: 100,
        cheltuieliExtra: [],
      },
      {
        id: "manager_asistent",
        label: "Asistent manager",
        description: "Ai responsabilități mai mari. Salariu mai bun, dar și stres mai mult.",
        venitBonus: 300,
        cheltuieliExtra: [{ nume: "Cursuri profesionale", suma: 100 }],
      },
    ],
    xpRequired: 300,
    isPremium: false,
  },
  bursa_sociala: {
    id: "bursa_sociala",
    nume: "Student cu Bursă Socială",
    descriere: "Ai bursă socială și locuiești acasă sau la cămin ieftin. Resurse limitate, dar stabilitate.",
    emoji: "📚",
    bgClass: "bg-scenario-navetist",
    accentColor: "#0891b2",
    venitLunar: 700,
    cheltuieliFixe: [
      { nume: "Chirie cămin redusă", suma: 200 },
      { nume: "Transport", suma: 150 },
    ],
    subScenarii: [
      {
        id: "acasa",
        label: "Locuiesc acasă",
        description: "Stai cu părinții. Cheltuieli minime, dar drum lung zilnic.",
        venitBonus: 0,
        cheltuieliExtra: [{ nume: "Navetă", suma: 200 }],
      },
      {
        id: "camin",
        label: "Cămin social",
        description: "Ai loc în căminul social. Costuri reduse, dar condiții basic.",
        venitBonus: 0,
        cheltuieliExtra: [{ nume: "Cheltuieli personale", suma: 100 }],
      },
      {
        id: "internat",
        label: "Internat studențesc",
        description: "Facultatea oferă internat. Acces la cantină, condiții ok.",
        venitBonus: 50,
        cheltuieliExtra: [{ nume: "Cantină", suma: 150 }],
      },
    ],
    xpRequired: 150,
    isPremium: false,
  },
  rude: {
    id: "rude",
    nume: "Student la Rude",
    descriere: "Locuiești temporar la rude în alt oraș. Scapi de chirie, dar trebuie să te integrezi.",
    emoji: "🏡",
    bgClass: "bg-scenario-camin",
    accentColor: "#be185d",
    venitLunar: 1000,
    cheltuieliFixe: [
      { nume: "Contribuție la gospodărie", suma: 200 },
      { nume: "Transport facultate", suma: 250 },
    ],
    subScenarii: [
      {
        id: "unchi",
        label: "La unchi / mătușă",
        description: "Stai la rude îndepărtate. Independență limitată, trebuie să te porți frumos.",
        venitBonus: 0,
        cheltuieliExtra: [{ nume: "Cadouri / ajutor", suma: 150 }],
      },
      {
        id: "bunici",
        label: "La bunici",
        description: "Bunicii te găzduiesc. Mâncare bună, dar reguli stricte.",
        venitBonus: 100,
        cheltuieliExtra: [{ nume: "Medicamente / ajutor", suma: 80 }],
      },
      {
        id: "familia_extinsa",
        label: "Familie extinsă",
        description: "Stai la o familie înrudită. Situație neobișnuită, dar poate fi ok.",
        venitBonus: -100,
        cheltuieliExtra: [{ nume: "Adaptare", suma: 100 }],
      },
    ],
    xpRequired: 100,
    isPremium: false,
  },
  meditatii: {
    id: "meditatii",
    nume: "Student Meditator",
    descriere: "Faci meditații la elevi de liceu. Venituri bune, dar programul e solicitant.",
    emoji: "🎓",
    bgClass: "bg-scenario-navetist",
    accentColor: "#0f766e",
    venitLunar: 1400,
    cheltuieliFixe: [
      { nume: "Chirie cămin", suma: 450 },
      { nume: "Materiale meditații", suma: 100 },
    ],
    subScenarii: [
      {
        id: "matematica",
        label: "Medită matematică",
        description: "Ești bun la mate și meditezi elevi. Cerere mare, tarif bun.",
        venitBonus: 400,
        cheltuieliExtra: [{ nume: "Tablete / resurse", suma: 80 }],
      },
      {
        id: "limbi",
        label: "Medită limbi străine",
        description: "Predai engleză sau germană. Cerere constantă, poți face și online.",
        venitBonus: 350,
        cheltuieliExtra: [{ nume: "Cărți / platforme", suma: 60 }],
      },
      {
        id: "mate_final",
        label: "Medită pentru Bac / Evaluare",
        description: "Pregătești elevi pentru examene naționale. Sezon intens, câștiguri mari.",
        venitBonus: 500,
        cheltuieliExtra: [{ nume: "Pregătire materiale", suma: 120 }],
      },
],
    xpRequired: 250,
    isPremium: false,
  },
  antreprenor: {
    id: "antreprenor",
    nume: "Student Antreprenor",
    descriere: "Ai propria ta afacere pe lângă facultate. Risc mare, libertate mare, câștiguri potențial mari.",
    emoji: "💼",
    bgClass: "bg-scenario-garsoniera",
    accentColor: "#ea580c",
    venitLunar: 3500,
    cheltuieliFixe: [
      { nume: "Chirie spațiu lucru", suma: 600 },
      { nume: "Utilități / internet", suma: 200 },
    ],
    subScenarii: [
      {
        id: "e-commerce",
        label: "E-commerce",
        description: "Vinzi online produse. Investiție inițială, darscale rapid.",
        venitBonus: 800,
        cheltuieliExtra: [{ nume: "Stocuri / shipping", suma: 500 }, { nume: "Marketing", suma: 200 }],
      },
      {
        id: "servicii",
        label: "Servicii freelance",
        description: "Oferi servicii de design, programare, copywriting.",
        venitBonus: 600,
        cheltuieliExtra: [{ nume: "Abonamente software", suma: 150 }],
      },
      {
        id: "content",
        label: "Content Creator",
        description: "Faci content pe YouTube / TikTok. Venituri din reclame și sponsorizări.",
        venitBonus: 400,
        cheltuieliExtra: [{ nume: "Echipament / software", suma: 300 }],
      },
    ],
    xpRequired: 900,
    isPremium: true,
  },
  privat: {
    id: "privat",
    nume: "Student la Facultate Privată",
    descriere: "Facultatea ta e privată, dar oferă oportunități mai bune. Costuri mari, investiție în viitor.",
    emoji: "🎓",
    bgClass: "bg-scenario-navetist",
    accentColor: "#1d4ed8",
    venitLunar: 1800,
    cheltuieliFixe: [
      { nume: "Taxă facultate privată", suma: 1200 },
      { nume: "Materiale / cărți", suma: 200 },
    ],
    subScenarii: [
      {
        id: "medicina",
        label: "Medicină",
        description: "Facultatea de medicină e scumpă, dar promițătoare. Statistici aproape 100% angajare.",
        venitBonus: -400,
        cheltuieliExtra: [{ nume: "Instrumentar medical", suma: 300 }],
      },
      {
        id: "business",
        label: "Business / Economie",
        description: "Facultate de profil economic. Networking bun, dar costuri ridicate.",
        venitBonus: -200,
        cheltuieliExtra: [{ nume: "Evenimente networking", suma: 200 }],
      },
      {
        id: "drept",
        label: "Drept",
        description: "Facultatea de drept. Prestigiu, dar drum lung până la licență.",
        venitBonus: -100,
        cheltuieliExtra: [{ nume: "Licență / barem", suma: 150 }],
      },
    ],
    xpRequired: 1100,
    isPremium: true,
  },
  erasmus: {
    id: "erasmus",
    nume: "Student Erasmus",
    descriere: "Ești în strainătate cu program Erasmus. Experiență unică, dar provocări financiare și logistice.",
    emoji: "🌍",
    bgClass: "bg-scenario-garsoniera",
    accentColor: "#0d9488",
    venitLunar: 2500,
    cheltuieliFixe: [
      { nume: "Cazare în străinătate", suma: 800 },
      { nume: "Asigurare / vize", suma: 200 },
    ],
    subScenarii: [
      {
        id: "germania",
        label: "Germania",
        description: "Ești în Germania. Costuri moderate, oportunități bune.",
        venitBonus: 0,
        cheltuieliExtra: [{ nume: "Banking / asigurări", suma: 100 }],
      },
      {
        id: "spania",
        label: "Spania",
        description: "Ești în Spania. Viață scumpă în orașe mari, ieftină în provincie.",
        venitBonus: 100,
        cheltuieliExtra: [{ nume: "Transport local", suma: 80 }],
      },
      {
        id: "franta",
        label: "Franța",
        description: "Ești în Franța. Costuri mari la Paris, dar bursă Erasmus acoperă mult.",
        venitBonus: 200,
        cheltuieliExtra: [{ nume: "Viață pariziană", suma: 300 }],
      },
    ],
    xpRequired: 1000,
    isPremium: true,
  },
  masina: {
    id: "masina",
    nume: "Student cu Mașină",
    descriere: "Ai mașină proprie. Libertate în mișcare, dar costuri de întreținere și combustibil.",
    emoji: "🚗",
    bgClass: "bg-scenario-navetist",
    accentColor: "#475569",
    venitLunar: 1500,
    cheltuieliFixe: [
      { nume: "Mașină / combustibil", suma: 500 },
      { nume: "Parcare / asigurare", suma: 300 },
    ],
    subScenarii: [
      {
        id: "second_hand",
        label: "Mașină second-hand",
        description: "Ai o mașină veche dar funcțională. Risc de defecțiuni, dar economie la achiziție.",
        venitBonus: 0,
        cheltuieliExtra: [{ nume: "Reparații ocazionale", suma: 200 }],
      },
      {
        id: "electric",
        label: "Mașină electrică",
        description: "Ai o mașină electrică. Economie la combustibil, dar incarcare e o problemă.",
        venitBonus: -200,
        cheltuieliExtra: [{ nume: "Stație încărcare", suma: 150 }],
      },
      {
        id: "premium",
        label: "Mașină premium",
        description: "Părinții ți-au dat o mașină scumpă. Prestigiu, dar responsabilități.",
        venitBonus: 300,
        cheltuieliExtra: [{ nume: "Întreținere premium", suma: 250 }],
      },
    ],
    xpRequired: 1000,
    isPremium: true,
  },
  parinte: {
    id: "parinte",
    nume: "Student Părinte Single",
    descriere: "Ești student și părinte singur. Provocări imense, dar și motivație puternică.",
    emoji: "👶",
    bgClass: "bg-scenario-camin",
    accentColor: "#db2777",
    venitLunar: 1600,
    cheltuieliFixe: [
      { nume: "Chirie cameră adaptată", suma: 600 },
      { nume: "Îngrijire copil", suma: 400 },
    ],
    subScenarii: [
      {
        id: "bunici",
        label: "Ajutor de la bunici",
        description: "Bunicii ajută cu copilul când ești la cursuri.",
        venitBonus: 200,
        cheltuieliExtra: [{ nume: "Contribuție bunici", suma: 150 }],
      },
      {
        id: "cresa",
        label: "Creșă / grădiniță",
        description: "Copilul merge la creșă. Costuri mari, dar independență.",
        venitBonus: -100,
        cheltuieliExtra: [{ nume: "Taxă cresă", suma: 300 }],
      },
      {
        id: "part_time",
        label: "Job part-time adaptat",
        description: "Lucrezi doar când copilul e cu cineva. Venit limitat, dar timp pentru studiu.",
        venitBonus: 0,
        cheltuieliExtra: [{ nume: "Baby-sitter ocazional", suma: 200 }],
      },
    ],
    xpRequired: 950,
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
xpRequired: 650,
    isPremium: true,
  },
  schimbari: {
    id: "schimbari",
    nume: "Student în Schimbare",
    descriere: "Viața ta e în continuă schimbare: mutări, job-uri, situații neprevăzute.",
    emoji: "🔄",
    bgClass: "bg-scenario-camin",
    accentColor: "#9333ea",
    venitLunar: 1200,
    cheltuieliFixe: [
      { nume: "Chirie temporară", suma: 350 },
      { nume: "Cheltuieli diverse", suma: 200 },
    ],
    subScenarii: [
      {
        id: "subinchiriere",
        label: "Subînchiriere",
        description: "Subînchiriezi o cameră pe termen scurt. Flexibilitate, dar nesiguranță.",
        venitBonus: -100,
        cheltuieliExtra: [{ nume: "Mobilat / utilat", suma: 150 }],
      },
      {
        id: "hotel_pensiune",
        label: "Hotel / Pensiune",
        description: "Stai la pensiune temporar. Scump, dar nu necesită angajamente.",
        venitBonus: -200,
        cheltuieliExtra: [{ nume: "Chirie zilnică", suma: 300 }],
      },
      {
        id: "casa_de_ochi",
        label: "Casa de oaspeți",
        description: "Un prieten te primește temporar. Situație de criză, dar ajutor reciproc.",
        venitBonus: 0,
        cheltuieliExtra: [{ nume: "Contribuție", suma: 100 }],
      },
    ],
    xpRequired: 500,
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
    xpRequired: 750,
    seasonal: true,
    seasonTag: "vacanta",
    isPremium: true,
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