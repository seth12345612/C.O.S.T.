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
}

function endOfDay(daysFromNow: number): number {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  d.setHours(23, 59, 59, 999);
  return d.getTime();
}

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
  },
];

export function getActiveLimitedEvents(): LimitedEvent[] {
  const now = Date.now();
  return LIMITED_EVENTS.filter((e) => e.endsAt > now);
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
}
