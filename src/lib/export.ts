import type { Transaction, FinancialReport } from "@/types";

export function exportToCSV(tranzactii: Transaction[], filename = "cost_tranzactii.csv") {
  const header = "Data,Descriere,Categorie,Tip,Suma (RON)";
  const rows = tranzactii.map((t) =>
    `"${t.data}","${t.descriere}","${t.categorie}","${t.tip}",${t.suma}`
  );
  const csv = [header, ...rows].join("\n");
  const bom = "\uFEFF";
  download(`${bom}${csv}`, filename, "text/csv;charset=utf-8;");
}

export function exportReportToCSV(report: FinancialReport, filename = "cost_raport_financiar.csv") {
  const lines = [
    "Raport Financiar C.O.S.T.",
    "========================",
    "",
    `Total Venituri,${report.totalVenituri} RON`,
    `Total Cheltuieli,${report.totalCheltuieli} RON`,
    `Balanta,${report.balanta} RON`,
    `Scor Sănătate Financiară,${report.scorSanatateFinanciara}/100`,
    "",
    "Cheltuieli pe Categorii",
    "Categorie,Suma (RON)",
    ...Object.entries(report.cheltuieliPeCategorii).map(([cat, s]) => `"${cat}",${s}`),
    "",
    "Cash Flow (Săptămânal)",
    "Săptămâna,Valoare (RON)",
    ...report.cashFlow.map((cf) => `${cf.saptamana},${cf.valoare}`),
    "",
    "Sfaturi Personalizate",
    ...report.sfaturi.map((s) => `"${s}"`),
  ];
  const bom = "\uFEFF";
  download(`${bom}${lines.join("\n")}`, filename, "text/csv;charset=utf-8;");
}

export function generateReport(
  tranzactii: Transaction[],
  totalVenituri: number,
  totalCheltuieli: number,
  cheltuieliPeCategorii: Record<string, number>,
): FinancialReport {
  const cashFlow: { saptamana: number; valoare: number }[] = [];
  const sorted = [...tranzactii].sort((a, b) => a.data.localeCompare(b.data));
  let running = 0;
  sorted.forEach((t, i) => {
    if (t.tip === "venit") running += t.suma;
    else if (t.tip === "cheltuiala") running -= t.suma;
    if (i % 5 === 0 || i === sorted.length - 1) {
      cashFlow.push({ saptamana: Math.floor(i / 5) + 1, valoare: running });
    }
  });

  const balanta = totalVenituri - totalCheltuieli;
  const raportCheltuieliVenituri = totalVenituri > 0 ? totalCheltuieli / totalVenituri : 1;
  const scorSanatateFinanciara = Math.round(
    Math.max(0, Math.min(100,
      (balanta > 0 ? 40 : 10) +
      (raportCheltuieliVenituri < 0.7 ? 30 : raportCheltuieliVenituri < 0.9 ? 20 : 5) +
      (cashFlow.length > 0 && cashFlow[cashFlow.length - 1]?.valoare > 0 ? 30 : 10)
    ))
  );

  const sfaturi: string[] = [];
  if (balanta < 0) sfaturi.push("⚠️ Cheltuielile tale depășesc veniturile. Încearcă să reduci cheltuielile sau să găsești surse suplimentare de venit.");
  if (raportCheltuieliVenituri > 0.8) sfaturi.push("📊 Peste 80% din venituri se duc pe cheltuieli. Țintește un raport de maxim 70%.");
  if (balanta > 0 && balanta < 500) sfaturi.push("💪 Ai un buget echilibrat! Încearcă să economisești măcar 10% din venituri lunar.");
  if (balanta >= 500) sfaturi.push("🌟 Excelent! Ai un surplus financiar sănătos. Ia în considerare să investești diferența.");
  if (Object.keys(cheltuieliPeCategorii).length === 0) sfaturi.push("📝 Înregistrează-ți cheltuielile pentru a vedea unde se duc banii.");
  if (scorSanatateFinanciara < 40) sfaturi.push("🆘 Scorul tău financiar este scăzut. Consultă secțiunea Tutorial pentru sfaturi de bază.");
  if (scorSanatateFinanciara >= 80) sfaturi.push("🏆 Scor financiar excelent! Continuă pe acest drum.");
  if (sfaturi.length === 0) sfaturi.push("✅ Finanțele tale sunt într-o stare bună. Monitorizează-ți constant cheltuielile.");

  const venituriPeCategorii: Record<string, number> = {};
  for (const t of tranzactii.filter((t) => t.tip === "venit")) {
    venituriPeCategorii[t.categorie] = (venituriPeCategorii[t.categorie] ?? 0) + t.suma;
  }

  return { totalVenituri, totalCheltuieli, balanta, cheltuieliPeCategorii, venituriPeCategorii, cashFlow, sfaturi, scorSanatateFinanciara };
}

function download(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
