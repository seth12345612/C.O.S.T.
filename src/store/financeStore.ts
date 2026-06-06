import { create } from "zustand";
import type { Transaction, Budget, FinanceState } from "@/types";
import { loadActiveBooster } from "@/lib/shop-equip";

const DEFAULT_BUDGETE: Budget[] = [
  { categorie: "Mâncare", limita: 600 },
  { categorie: "Transport", limita: 300 },
  { categorie: "Divertisment", limita: 200 },
  { categorie: "Îmbrăcăminte", limita: 150 },
  { categorie: "Sănătate", limita: 100 },
  { categorie: "Educație", limita: 200 },
  { categorie: "Utilități", limita: 250 },
  { categorie: "Altele", limita: 300 },
];

const DEFAULT_FINANCE: FinanceState = {
  tranzactii: [], budgete: DEFAULT_BUDGETE, obiectivEconomii: 5000, economiiCurente: 0,
};

interface FinanceStore {
  financeState: FinanceState;
  setFinanceState: (state: FinanceState) => void;
  addTransaction: (t: Omit<Transaction, "id">) => void;
  deleteTransaction: (id: string) => void;
  updateBudget: (categorie: string, limita: number) => void;
  setObiectiv: (suma: number) => void;
  totalVenituri: () => number;
  totalCheltuieli: () => number;
  sold: () => number;
  cheltuieliPerCategorie: () => Record<string, number>;
}

export const useFinanceStore = create<FinanceStore>((set, get) => ({
  financeState: DEFAULT_FINANCE,

  setFinanceState: (state) => set({ financeState: state }),

  addTransaction: (t) => {
    set((s) => {
      const newT: Transaction = { ...t, id: `t-${Date.now()}-${Math.random()}` };
      let economiiCurente = s.financeState.economiiCurente;
      if (t.tip === "economie") {
        const active = loadActiveBooster();
        const bonus = active?.itemId === "booster_economii" ? 1.2 : 1;
        economiiCurente += Math.round(t.suma * bonus);
      }
      return { financeState: { ...s.financeState, tranzactii: [newT, ...s.financeState.tranzactii], economiiCurente } };
    });
  },

  deleteTransaction: (id) => {
    set((s) => {
      const t = s.financeState.tranzactii.find((x) => x.id === id);
      let economiiCurente = s.financeState.economiiCurente;
      if (t?.tip === "economie") economiiCurente = Math.max(0, s.financeState.economiiCurente - t.suma);
      return { financeState: { ...s.financeState, tranzactii: s.financeState.tranzactii.filter((x) => x.id !== id), economiiCurente } };
    });
  },

  updateBudget: (categorie, limita) => {
    set((s) => ({
      financeState: {
        ...s.financeState,
        budgete: s.financeState.budgete.map((b) => b.categorie === categorie ? { ...b, limita } : b),
      }
    }));
  },

  setObiectiv: (suma) => {
    set((s) => ({ financeState: { ...s.financeState, obiectivEconomii: suma } }));
  },

  totalVenituri: () => {
    return get().financeState.tranzactii.filter((t) => t.tip === "venit").reduce((sum, t) => sum + t.suma, 0);
  },

  totalCheltuieli: () => {
    return get().financeState.tranzactii.filter((t) => t.tip === "cheltuiala").reduce((sum, t) => sum + t.suma, 0);
  },

  sold: () => {
    const { totalVenituri, totalCheltuieli } = get();
    return totalVenituri() - totalCheltuieli();
  },

  cheltuieliPerCategorie: () => {
    const map: Record<string, number> = {};
    for (const t of get().financeState.tranzactii.filter((t) => t.tip === "cheltuiala")) {
      map[t.categorie] = (map[t.categorie] ?? 0) + t.suma;
    }
    return map;
  }
}));
