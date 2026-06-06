import { useEffect, useRef, type ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";
import { loadProfile, saveProfile } from "@/lib/syncProfile";
import { useFinanceStore } from "@/store/financeStore";
import type { FinanceState } from "@/types";

function save(state: FinanceState) {
  try { localStorage.setItem("cost_finance", JSON.stringify(state)); } catch {}
}

export function FinanceProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const financeState = useFinanceStore((s) => s.financeState);
  const setFinanceState = useFinanceStore((s) => s.setFinanceState);

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
  }, [user?.email, user?.sub, setFinanceState]);

  useEffect(() => {
    save(financeState);
    if (!user?.email) return;
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      saveProfile(user.email!, user.sub, { finance: financeState });
    }, 1000);
    return () => clearTimeout(saveTimer.current);
  }, [financeState, user?.email, user?.sub]);

  return <>{children}</>;
}

export function useFinance() {
  const store = useFinanceStore();

  return {
    financeState: store.financeState,
    addTransaction: store.addTransaction,
    deleteTransaction: store.deleteTransaction,
    updateBudget: store.updateBudget,
    setObiectiv: store.setObiectiv,
    totalVenituri: store.totalVenituri(),
    totalCheltuieli: store.totalCheltuieli(),
    sold: store.sold(),
    cheltuieliPerCategorie: store.cheltuieliPerCategorie(),
  };
}
