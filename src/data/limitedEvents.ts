<<<<<<< HEAD
export interface Optiune {
  text: string;
  bani: number;
  fericirePct: number;
  lectie: string;
  explicatie: string;
  bonusXP?: number;
}

=======
>>>>>>> bca33c6a3a6b536a83ed88053ea89ffdd976de0f
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
<<<<<<< HEAD
  optiuni?: Optiune[];
  sezon?: "iarna" | "vara";
=======
>>>>>>> bca33c6a3a6b536a83ed88053ea89ffdd976de0f
}

function endOfDay(daysFromNow: number): number {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  d.setHours(23, 59, 59, 999);
  return d.getTime();
}

<<<<<<< HEAD
function getCurrentSezon(): "iarna" | "vara" | null {
  const month = new Date().getMonth();
  if (month === 11 || month === 0 || month === 1) return "iarna";
  if (month === 5 || month === 6 || month === 7) return "vara";
  return null;
}

=======
>>>>>>> bca33c6a3a6b536a83ed88053ea89ffdd976de0f
export const LIMITED_EVENTS: LimitedEvent[] = [
  {
    id: "black_friday",
    titlu: "Black Friday",
    descriere: "Reduceri masive! Dacă faci alegeri înțelepte azi, câștigi bonus XP și economii.",
    emoji: "🛍️",
    endsAt: endOfDay(3),
    bonusXP: 150,
    bonusBani: 200,
    bonusFericire: 10,
    scenariuCompatibil: ["chirie", "garsoniera", "camin", "navetist"],
    culoare: "#1a1a1a",
<<<<<<< HEAD
    sezon: "iarna",
    optiuni: [
      {
        text: "Cumpăr în cantități mari — economisesc mai mult",
        bani: 200,
        fericirePct: 5,
        lectie: "Cumpărăturile în cantități mari reduc costul per unitate.",
        explicatie: "Supermarketurile oferă reduceri de până la 30% pentru achiziții în vrac. Totuși, asigură-te că produsele nu se vor strica înainte de a le consuma. De exemplu, pastele și orezul se păstrează luni de zile, dar fructele nu.",
        bonusXP: 20,
      },
      {
        text: "Folosesc reducerile pentru rechizite esențiale",
        bani: 100,
        fericirePct: 10,
        lectie: "Investiția în materiale educaționale are randament pe termen lung.",
        explicatie: "Black Friday e momentul ideal să cumperi caiete, stilouri și laptopuri cu discount-uri de 20-40%. Un student care își ia o tastatură externă la reducere va fi mai productiv tot semestru.",
      },
      {
        text: "Ignor reducerile și păstrez banii",
        bani: 0,
        fericirePct: -5,
        lectie: "Nu toate reduceri merită - uneori economisești mai mult neducând.",
        explicatie: "Multe 'oferte' sunt prețuri umflate înainte de Black Friday. Studiază prețurile cu câteva săptămâni înainte. Unele produse sunt mai ieftine chiar și în mod normal, nu doar în perioada reducerilor.",
      },
    ],
=======
>>>>>>> bca33c6a3a6b536a83ed88053ea89ffdd976de0f
  },
  {
    id: "sesiune_examene",
    titlu: "Sesiunea de Examene",
    descriere: "Perioada de examene e grea! Supraviețuiește cu bugetul intact și primești recompense speciale.",
    emoji: "📚",
    endsAt: endOfDay(7),
    bonusXP: 200,
    bonusBani: -300,
    bonusFericire: -15,
    scenariuCompatibil: ["camin", "chirie", "navetist"],
    culoare: "#1e3a5f",
<<<<<<< HEAD
    optiuni: [
      {
        text: "Investesc în materiale de studiu și meditații",
        bani: -200,
        fericirePct: 10,
        lectie: "Investiția în educație se amortizează prin note mai bune.",
        explicatie: "O meditație la matematică sau fizică costă 50-100 lei/oră, dar poate însemna diferența dintre 5 și 8. Un student care ia meditații are șanse cu 40% mai mari să treacă examenele din prima încercare.",
        bonusXP: 30,
      },
      {
        text: "Măresc bugetul pentru cafea și snacks — energie pentru studiu",
        bani: -100,
        fericirePct: 15,
        lectie: "Corpul are nevoie de combustibil în perioade intense de studiu.",
        explicatie: "În sesiune, corpul consumă multă energie cerebrală. O cafea și un covrig costă 10 lei și te pot ține treaz 2 ore în plus. Însă evităenergy drinks-urile - sunt scumpe și te pot deshidrata.",
      },
      {
        text: "Studiez în bibliotecă publică — gratuit și eficient",
        bani: 50,
        fericirePct: -5,
        lectie: "Mediile gratuite pot fi la fel de productive ca cele plătite.",
        explicatie: "Bibliotecile publice și universitare sunt gratuite și au conexiune Wi-Fi rapidă. Sigur, nu ai cafea la discretie, dar economia de 50-100 lei pe săptămână înseamnă mâncare pentru încă 3 zile.",
      },
    ],
=======
>>>>>>> bca33c6a3a6b536a83ed88053ea89ffdd976de0f
  },
  {
    id: "revelion",
    titlu: "Revelion",
    descriere: "Noaptea de Revelion e aproape! Petrece smart și câștigă bonus la fericire.",
    emoji: "🎆",
    endsAt: endOfDay(2),
    bonusXP: 100,
    bonusFericire: 25,
    scenariuCompatibil: ["camin", "chirie", "garsoniera", "navetist", "iarna", "craciun"],
    culoare: "#4a0080",
<<<<<<< HEAD
    sezon: "iarna",
    optiuni: [
      {
        text: "Organizez petrecere acasă — economisesc și distracție maximă",
        bani: 100,
        fericirePct: 20,
        lectie: "Petrecerile acasă sunt mai ieftine și uneori mai memorabile.",
        explicatie: "O petrecere acasă cu 5-10 prieteni costă 200-300 lei în total (mâncare + băuturi). În club, doar intrarea e 50-100 lei, iar berea e 15-20 lei. Plus, nu stai la coadă la bar și muzica o alegi tu.",
        bonusXP: 25,
      },
      {
        text: "Merg în oraș la club — experiență de neuitat",
        bani: -300,
        fericirePct: 25,
        lectie: "Uneori experiențele merită investiția, chiar dacă sunt scumpe.",
        explicatie: "Revelionul în club e scump - 150-300 lei bilet, plus băuturi. Dar atmosfera e unică, conta directă și focurile de artificii la miezul nopții. E o dată pe an, deci poate fi o excepție acceptabilă.",
      },
      {
        text: "Petrec acasă cu familia — liniște și economii",
        bani: 50,
        fericirePct: 5,
        lectie: "Calitatea timpului cu familia nu se măsoară în bani.",
        explicatie: "Nu toată lumea vrea să petreacă în club. Unii studiați preferă să fie acasă cu familia, să mănânce pizza și să se uite la TV. Economisești 300+ lei și ești odihnit pentru 1 ianuarie.",
      },
    ],
=======
>>>>>>> bca33c6a3a6b536a83ed88053ea89ffdd976de0f
  },
  {
    id: "bursa",
    titlu: "Bursă de Excelență",
    descriere: "Ai ocazia să aplici pentru o bursă specială. Bonus XP dacă finalizezi scenariul cu succes!",
    emoji: "🏆",
    endsAt: endOfDay(5),
    bonusXP: 300,
    bonusBani: 500,
    scenariuCompatibil: ["camin", "navetist"],
    culoare: "#7c4a00",
<<<<<<< HEAD
    optiuni: [
      {
        text: "Aplic pentru bursă — investesc timp pentru succes",
        bani: 0,
        fericirePct: 10,
        lectie: "Efortul de a aplica este mic comparativ cu recompensa potențială.",
        explicatie: "Bursele de excelență în România ajung la 500-1500 lei/lună. Cerințele sunt de obicei media peste 8.50 și activități extracurriculare. Aplică - procesul durează 2-3 ore și poate schimba semnificativ bugetul semestrial.",
        bonusXP: 40,
      },
      {
        text: "Pregătesc un dosar solid cu recomandări",
        bani: -50,
        fericirePct: 15,
        lectie: "Investiția în documentație crește șansele de acceptare.",
        explicatie: "Să trimiți dosarul cu o recomandare de la un profesor și un CV bine structurat costă timp, nu bani. Dar crește șansele cu 30-50%. Un dosar incomplet are șanse de acceptare de sub 20%, în timp ce unul complet ajunge la 60%.",
      },
      {
        text: "Nu aplic — e prea complicat",
        bani: 0,
        fericirePct: -10,
        lectie: "Oportunitățile pierdute sunt adesea cele mai scumpe.",
        explicatie: "Mulți studiați nu aplică pentru că 'nu au șanse' sau 'e prea multă muncă'. Dar bursele rămân uneori neacordate pentru că nu sunt suficiente aplicații calificate. Dacă îndeplinești măcar 70% din cerințe, încearcă.",
      },
    ],
=======
>>>>>>> bca33c6a3a6b536a83ed88053ea89ffdd976de0f
  },
  {
    id: "festival_vara",
    titlu: "Festival de Vară",
    descriere: "Festivalul muzical al anului! Mergi sau economisești? Alege înțelept.",
    emoji: "🎵",
    endsAt: endOfDay(4),
    bonusXP: 120,
    bonusFericire: 20,
    bonusBani: -400,
    scenariuCompatibil: ["vara", "vacanta", "chirie", "garsoniera"],
    culoare: "#2a4a00",
<<<<<<< HEAD
    sezon: "vara",
    optiuni: [
      {
        text: "Merg la festival cu prietenii — experiență de vară",
        bani: -400,
        fericirePct: 30,
        lectie: "Experiențele de vară creează amintiri pentru totdeauna.",
        explicatie: "Un festival de 3 zile cu cort, mâncare și bilet costă 400-600 lei. Dar vezi 5-10 trupe live, faci prieteni noi și ai experiențe unice. Dacă ești student, poți cumpăra bilete early bird cu 20-30% reducere.",
        bonusXP: 30,
      },
      {
        text: "Lucrez extra la summer job — investesc în viitor",
        bani: 500,
        fericirePct: -10,
        lectie: "Munca în vară poate finanța toamna fără griji.",
        explicatie: "Un job de vară în restaurant sau hotel plătește 2000-3000 lei/lună. Două luni de muncă = 4000-6000 lei pentru toamnă. Poți acoperi chiria, cărțile și mâncarea fără să ceri bani de acasă.",
      },
      {
        text: "Merg doar în ziua de festival — compromis smart",
        bani: -150,
        fericirePct: 15,
        lectie: "Poți să te bucuri de experiență și cu buget redus.",
        explicatie: "Multe festivaluri au bilete și pentru o singură zi, la 100-150 lei. Nu stai în cort, nu mănânci acolo, dar vezi artiștii principali și simți atmosfera. Alternativ, multe festivaluri au voluntari care primesc acces gratuit.",
      },
    ],
=======
>>>>>>> bca33c6a3a6b536a83ed88053ea89ffdd976de0f
  },
];

export function getActiveLimitedEvents(): LimitedEvent[] {
  const now = Date.now();
<<<<<<< HEAD
  const currentSezon = getCurrentSezon();

  return LIMITED_EVENTS.filter((e) => {
    if (e.endsAt <= now) return false;
    if (e.sezon && currentSezon && e.sezon !== currentSezon) return false;
    return true;
  });
=======
  return LIMITED_EVENTS.filter((e) => e.endsAt > now);
>>>>>>> bca33c6a3a6b536a83ed88053ea89ffdd976de0f
}

export function getTimeRemaining(endsAt: number): string {
  const diff = endsAt - Date.now();
  if (diff <= 0) return "Expirat";
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  if (days > 0) return `${days}z ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
<<<<<<< HEAD
}
=======
}
>>>>>>> bca33c6a3a6b536a83ed88053ea89ffdd976de0f
