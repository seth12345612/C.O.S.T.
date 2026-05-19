import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";

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

function load(): FinanceState {
  try {
    const raw = localStorage.getItem("cost_finance");
    if (raw) return JSON.parse(raw);
  } catch {}
  return { tranzactii: [], budgete: DEFAULT_BUDGETE, obiectivEconomii: 5000, economiiCurente: 0 };
}

function save(state: FinanceState) {
  try { localStorage.setItem("cost_finance", JSON.stringify(state)); } catch {}
}

interface FinanceContextType {
  financeState: FinanceState;
  addTransaction: (t: Omit<Transaction, "id">) => void;
  deleteTransaction: (id: string) => void;
  updateBudget: (categorie: string, limita: number) => void;
  setObiectiv: (suma: number) => void;
  totalVenituri: number;
  totalCheltuieli: number;
  sold: number;
  cheltuieliPerCategorie: Record<string, number>;
}

const FinanceContext = createContext<FinanceContextType | null>(null);

export function FinanceProvider({ children }: { children: ReactNode }) {
  const [financeState, setFinanceState] = useState<FinanceState>(load);

  useEffect(() => { save(financeState); }, [financeState]);

  const addTransaction = useCallback((t: Omit<Transaction, "id">) => {
    setFinanceState((prev) => {
      const newT: Transaction = { ...t, id: `t-${Date.now()}-${Math.random()}` };
      let economiiCurente = prev.economiiCurente;
      if (t.tip === "economie") economiiCurente += t.suma;
      return { ...prev, tranzactii: [newT, ...prev.tranzactii], economiiCurente };
    });
  }, []);

  const deleteTransaction = useCallback((id: string) => {
    setFinanceState((prev) => {
      const transactionToDelete = prev.tranzactii.find((t) => t.id === id);
      let economiiCurente = prev.economiiCurente;
      if (transactionToDelete?.tip === "economie") {
        economiiCurente = Math.max(0, prev.economiiCurente - transactionToDelete.suma);
      }
      return {
        ...prev,
        tranzactii: prev.tranzactii.filter((t) => t.id !== id),
        economiiCurente,
      };
    });
  }, []);

  const updateBudget = useCallback((categorie: string, limita: number) => {
    setFinanceState((prev) => ({
      ...prev,
      budgete: prev.budgete.map((b) => b.categorie === categorie ? { ...b, limita } : b),
    }));
  }, []);

  const setObiectiv = useCallback((suma: number) => {
    setFinanceState((prev) => ({ ...prev, obiectivEconomii: suma }));
  }, []);

  const totalVenituri = financeState.tranzactii
    .filter((t) => t.tip === "venit")
    .reduce((s, t) => s + t.suma, 0);
  const totalCheltuieli = financeState.tranzactii
    .filter((t) => t.tip === "cheltuiala")
    .reduce((s, t) => s + t.suma, 0);
  const sold = totalVenituri - totalCheltuieli;
  const cheltuieliPerCategorie: Record<string, number> = {};
  for (const t of financeState.tranzactii.filter((t) => t.tip === "cheltuiala")) {
    cheltuieliPerCategorie[t.categorie] = (cheltuieliPerCategorie[t.categorie] ?? 0) + t.suma;
  }

  return (
    <FinanceContext.Provider value={{
      financeState, addTransaction, deleteTransaction, updateBudget, setObiectiv,
      totalVenituri, totalCheltuieli, sold, cheltuieliPerCategorie,
    }}>
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance() {
  const ctx = useContext(FinanceContext);
  if (!ctx) throw new Error("useFinance must be inside FinanceProvider");
  return ctx;
}
