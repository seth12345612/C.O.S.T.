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

export function exportReportToHTML(
  report: FinancialReport,
  filename = "cost_raport_financiar.html"
) {
  const { totalVenituri, totalCheltuieli, balanta, cheltuieliPeCategorii, venituriPeCategorii, cashFlow, sfaturi, scorSanatateFinanciara } = report;

  const pieRows = Object.entries(cheltuieliPeCategorii)
    .map(([cat, val]) => `<tr><td style="padding:4px 8px">${cat}</td><td style="padding:4px 8px;text-align:right">${val} RON</td></tr>`)
    .join("");

  const cfRows = cashFlow
    .map((cf) => `<tr><td style="padding:4px 8px">Săptămâna ${cf.saptamana}</td><td style="padding:4px 8px;text-align:right">${cf.valoare} RON</td></tr>`)
    .join("");

  const sfaturiList = sfaturi.map((s) => `<li style="margin-bottom:6px;padding:8px 12px;background:#1a1035;border-radius:8px;border:1px solid rgba(255,255,255,0.06)">${s}</li>`).join("");

  const html = `<!DOCTYPE html>
<html lang="ro">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Raport Financiar C.O.S.T.</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif; background:#0f0a1e; color:#e8e0f0; padding:20px; }
    .container { max-width:700px; margin:0 auto; }
    h1 { font-size:24px; text-align:center; margin-bottom:24px; background:linear-gradient(135deg,#7c3aed,#f59e0b); -webkit-background-clip:text; -webkit-text-fill-color:transparent; }
    .score-card { background:linear-gradient(135deg,rgba(16,185,129,0.15),rgba(5,150,105,0.1)); border:1px solid rgba(16,185,129,0.25); border-radius:12px; padding:16px; text-align:center; margin-bottom:24px; }
    .score-card h2 { font-size:12px; color:rgba(255,255,255,0.4); margin-bottom:4px; }
    .score-card .value { font-size:36px; font-weight:900; color:#34d399; }
    .grid { display:grid; grid-template-columns:1fr 1fr 1fr; gap:12px; margin-bottom:24px; }
    .card { border-radius:12px; padding:12px; text-align:center; }
    .card.venituri { background:rgba(16,185,129,0.1); border:1px solid rgba(16,185,129,0.2); }
    .card.cheltuieli { background:rgba(239,68,68,0.1); border:1px solid rgba(239,68,68,0.2); }
    .card.balanta { background:rgba(59,130,246,0.1); border:1px solid rgba(59,130,246,0.2); }
    .card .icon { font-size:16px; margin-bottom:4px; }
    .card .val { font-size:18px; font-weight:700; }
    .card .label { font-size:10px; color:rgba(255,255,255,0.35); }
    .section { margin-bottom:24px; }
    .section h3 { font-size:14px; font-weight:600; color:#c8c0d8; margin-bottom:12px; }
    table { width:100%; border-collapse:collapse; }
    th { text-align:left; padding:4px 8px; color:rgba(255,255,255,0.35); font-size:11px; font-weight:400; border-bottom:1px solid rgba(255,255,255,0.06); }
    td { padding:4px 8px; font-size:13px; }
    ul { list-style:none; }
  </style>
</head>
<body>
  <div class="container">
    <h1>📊 Raport Financiar C.O.S.T.</h1>

    <div class="score-card">
      <h2>Scor Sănătate Financiară</h2>
      <div class="value">${scorSanatateFinanciara}/100</div>
    </div>

    <div class="grid">
      <div class="card venituri">
        <div class="icon" style="color:#34d399">📈</div>
        <div class="val" style="color:#6ee7b7">${totalVenituri} RON</div>
        <div class="label">Venituri</div>
      </div>
      <div class="card cheltuieli">
        <div class="icon" style="color:#f87171">📉</div>
        <div class="val" style="color:#fca5a5">${totalCheltuieli} RON</div>
        <div class="label">Cheltuieli</div>
      </div>
      <div class="card balanta">
        <div class="icon" style="color:${balanta >= 0 ? "#60a5fa" : "#f87171"}">⚖️</div>
        <div class="val" style="color:${balanta >= 0 ? "#93c5fd" : "#fca5a5"}">${balanta >= 0 ? "+" : ""}${balanta} RON</div>
        <div class="label">Balanta</div>
      </div>
    </div>

    ${Object.keys(cheltuieliPeCategorii).length > 0 ? `
    <div class="section">
      <h3>💰 Cheltuieli pe Categorii</h3>
      <table>
        <tr><th>Categorie</th><th style="text-align:right">Suma (RON)</th></tr>
        ${pieRows}
      </table>
    </div>` : ""}

    ${cashFlow.length > 1 ? `
    <div class="section">
      <h3>📆 Cash Flow (Săptămânal)</h3>
      <table>
        <tr><th>Săptămâna</th><th style="text-align:right">Valoare (RON)</th></tr>
        ${cfRows}
      </table>
    </div>` : ""}

    ${sfaturi.length > 0 ? `
    <div class="section">
      <h3>💡 Sfaturi Personalizate</h3>
      <ul>${sfaturiList}</ul>
    </div>` : ""}

    <p style="text-align:center;font-size:10px;color:rgba(255,255,255,0.2);margin-top:32px">Generat de C.O.S.T. — Financial Literacy Game</p>
  </div>
</body>
</html>`;

  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
