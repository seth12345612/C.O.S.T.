import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from "react";
import type { Transaction, Budget, FinanceState } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { loadProfile, saveProfile } from "@/lib/syncProfile";

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

function load(): FinanceState {
  try {
    const raw = localStorage.getItem("cost_finance");
    if (raw) return JSON.parse(raw);
  } catch {}
  return DEFAULT_FINANCE;
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
  const { user } = useAuth();
  const dbSynced = useRef(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (!user?.email || dbSynced.current) return;
    dbSynced.current = true;
    loadProfile(user.email, user.sub).then((profile) => {
      if (profile?.finance && typeof profile.finance === "object" && "tranzactii" in profile.finance) {
        setFinanceState(profile.finance as FinanceState);
      }
    });
  }, [user?.email, user?.sub]);

  useEffect(() => {
    save(financeState);
    if (!user?.email) return;
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      saveProfile(user.email!, user.sub, { finance: financeState });
    }, 1000);
    return () => clearTimeout(saveTimer.current);
  }, [financeState, user?.email, user?.sub]);

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
      const t = prev.tranzactii.find((x) => x.id === id);
      let economiiCurente = prev.economiiCurente;
      if (t?.tip === "economie") economiiCurente = Math.max(0, prev.economiiCurente - t.suma);
      return { ...prev, tranzactii: prev.tranzactii.filter((x) => x.id !== id), economiiCurente };
    });
  }, []);

  const updateBudget = useCallback((categorie: string, limita: number) => {
    setFinanceState((prev) => ({
      ...prev, budgete: prev.budgete.map((b) => b.categorie === categorie ? { ...b, limita } : b),
    }));
  }, []);

  const setObiectiv = useCallback((suma: number) => {
    setFinanceState((prev) => ({ ...prev, obiectivEconomii: suma }));
  }, []);

  const totalVenituri = financeState.tranzactii.filter((t) => t.tip === "venit").reduce((s, t) => s + t.suma, 0);
  const totalCheltuieli = financeState.tranzactii.filter((t) => t.tip === "cheltuiala").reduce((s, t) => s + t.suma, 0);
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
