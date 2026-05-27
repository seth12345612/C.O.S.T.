import type { Investment, ObiectivTermenLung } from "@/types";

export const ACTIUNI: Investment[] = [
  { id: "actiuni_tech", tip: "actiuni", nume: "TechCorp (acțiuni tech)", sumaInvestita: 0, valoareCurenta: 100, randamentAnual: 0.12, dataCumpararii: 0, risc: "ridicat" },
  { id: "actiuni_energie", tip: "actiuni", nume: "EcoEnergy (energie verde)", sumaInvestita: 0, valoareCurenta: 80, randamentAnual: 0.08, dataCumpararii: 0, risc: "mediu" },
  { id: "actiuni_banca", tip: "actiuni", nume: "BancaNațională (acțiuni bancare)", sumaInvestita: 0, valoareCurenta: 120, randamentAnual: 0.06, dataCumpararii: 0, risc: "scazut" },
];

export const FONDURI_MUTUALE: Investment[] = [
  { id: "fond_echilibrat", tip: "fond_mutual", nume: "Fond Echilibrat (50% acțiuni, 50% obligațiuni)", sumaInvestita: 0, valoareCurenta: 100, randamentAnual: 0.07, dataCumpararii: 0, risc: "mediu" },
  { id: "fond_cu_venit", tip: "fond_mutual", nume: "Fond cu Venit Fix (obligațiuni guvernamentale)", sumaInvestita: 0, valoareCurenta: 95, randamentAnual: 0.04, dataCumpararii: 0, risc: "scazut" },
  { id: "fond_agresiv", tip: "fond_mutual", nume: "Fond Agresiv (acțiuni growth)", sumaInvestita: 0, valoareCurenta: 110, randamentAnual: 0.15, dataCumpararii: 0, risc: "ridicat" },
];

export const OBIECTIVE_DEFAULT: ObiectivTermenLung[] = [
  { id: "obj_masina", nume: "Avans pentru o mașină", tip: "masina", sumaTinta: 5000, sumaAcumulata: 0, termenLuni: 24, prioritate: "medie" },
  { id: "obj_calatorie", nume: "Vacanță de vară", tip: "calatorie", sumaTinta: 2000, sumaAcumulata: 0, termenLuni: 12, prioritate: "scazuta" },
  { id: "obj_cursuri", nume: "Cursuri de specializare", tip: "educatie", sumaTinta: 1500, sumaAcumulata: 0, termenLuni: 6, prioritate: "ridicata" },
  { id: "obj_casa", nume: "Avans pentru o casă", tip: "casa", sumaTinta: 15000, sumaAcumulata: 0, termenLuni: 60, prioritate: "scazuta" },
];

export const EVENIMENTE_BURSA = [
  { id: "bursa_bull", titlu: "Piața e în creștere!", descriere: "Acțiunile tale au crescut cu 15% în această lună.", multiplicator: 1.15, probabil: 0.4 },
  { id: "bursa_bear", titlu: "Corecție pe piață", descriere: "Acțiunile au scăzut cu 10% din cauza incertitudinii economice.", multiplicator: 0.9, probabil: 0.3 },
  { id: "bursa_stable", titlu: "Piață stabilă", descriere: "Fără schimbări majore în această perioadă.", multiplicator: 1.0, probabil: 0.3 },
];

function randomFactor(): number {
  const r = Math.random();
  if (r < 0.4) return 1.05 + Math.random() * 0.1;
  if (r < 0.7) return 0.95 - Math.random() * 0.05;
  return 1 + (Math.random() - 0.5) * 0.06;
}

export function simuleazaPiata(investitii: Investment[]): Investment[] {
  return investitii.map((inv) => ({
    ...inv,
    valoareCurenta: Math.max(10, Math.round(inv.valoareCurenta * randomFactor() * 100) / 100),
  }));
}

export const INVESTMENTS_KEY = "cost_investments";
export const OBJECTIVE_KEY = "cost_objectives";
