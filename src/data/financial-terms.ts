export interface FinancialTerm {
  term: string;
  definition: string;
  example?: string;
}

export const FINANCIAL_TERMS: FinancialTerm[] = [
  {
    term: "Buget",
    definition: "Un plan care arată câți bani ai (venituri) și cât cheltuiești (cheltuieli) într-o perioadă de timp, de obicei o lună.",
    example: "Dacă ai un venit lunar de 1000 RON și cheltuieli de 800 RON, bugetul tău are un surplus de 200 RON.",
  },
  {
    term: "Venit",
    definition: "Banii pe care îi primești, fie din salariu, bursă, ajutor de la părinți sau alte surse.",
    example: "Salariul de 500 RON pe lună de la un job part-time este un venit.",
  },
  {
    term: "Cheltuială",
    definition: "Banii pe care îi plătești pentru diverse lucruri precum chirie, mâncare, transport, facturi sau distracție.",
    example: "Chiria de 300 RON pe lună este o cheltuială fixă.",
  },
  {
    term: "Economii",
    definition: "Banii pe care îi pui deoparte pentru a-i folosi mai târziu, în loc să îi cheltuiești imediat.",
    example: "Dacă economisești 100 RON în fiecare lună, după 6 luni vei avea 600 RON strânși.",
  },
  {
    term: "Dobândă",
    definition: "Un procent din banii economisiți pe care banca ți-i plătește ca recompensă pentru că ți-ai lăsat banii la ea. Sau, invers, un procent pe care îl plătești băncii când împrumuți bani.",
    example: "Dacă ai 1000 RON într-un cont cu dobândă de 5% pe an, după un an vei avea 1050 RON.",
  },
  {
    term: "Inflație",
    definition: "Creșterea generală a prețurilor de-a lungul timpului. Cu aceiași bani poți cumpăra mai puține lucruri decât înainte.",
    example: "Dacă o pizza costa 20 RON anul trecut și acum costă 22 RON, inflația a fost de 10%.",
  },
  {
    term: "Investiție",
    definition: "Folosirea banilor pentru a cumpăra ceva care speri că va crește în valoare sau va genera venit în viitor.",
    example: "Cumpărarea de acțiuni la o companie sau investiția într-o afacere sunt forme de investiție.",
  },
  {
    term: "Datorie",
    definition: "Banii pe care îi datorezi altcuiva și pe care trebuie să îi returnezi, de obicei cu dobândă.",
    example: "Un credit bancar de 5000 RON pe care trebuie să îl rambursezi în 12 luni este o datorie.",
  },
  {
    term: "Rating de credit",
    definition: "Un scor care arată cât de responsabil ești cu banii împrumutați. Un scor bun te ajută să obții credite mai ieftine.",
    example: "Dacă îți plătești facturile la timp, ratingul tău de credit va fi bun.",
  },
  {
    term: "Fond de urgență",
    definition: "O sumă de bani pe care o păstrezi deoparte pentru situații neprevăzute, precum o reparație sau o problemă medicală.",
    example: "Un fond de urgență ideal acoperă 3-6 luni de cheltuieli de bază.",
  },
  {
    term: "Credit",
    definition: "O sumă de bani împrumutată de la o bancă sau instituție financiară, pe care trebuie să o returneziîn rate, plus dobândă.",
    example: "Un credit pentru laptop de 3000 RON pe 12 luni cu o dobândă de 10%.",
  },
  {
    term: "Activ",
    definition: "Un bun care are valoare și poate fi transformat în bani. Poate fi un lucru pe care îl deții (casă, mașină) sau o investiție.",
    example: "Un apartament sau acțiunile la o companie sunt active.",
  },
  {
    term: "Risc financiar",
    definition: "Posibilitatea de a pierde bani sau de a nu obține randamentul așteptat de la o investiție sau decizie financiară.",
    example: "Investiția în criptomonede are un risc financiar mai mare decât depozitul bancar.",
  },
  {
    term: "Lichiditate",
    definition: "Cât de repede poți transforma un activ în bani lichizi (numerar). Cu cât poți vinde mai repede, cu atât lichiditatea e mai mare.",
    example: "Banii dintr-un cont curent au lichiditate mare, o casă are lichiditate scăzută.",
  },
  {
    term: "Diversificare",
    definition: "Strategia de a repartiza banii în mai multe tipuri de investiții pentru a reduce riscul de a pierde totul.",
    example: "În loc să investești toți banii într-o singură acțiune, îi împarți între acțiuni, obligațiuni și depozite.",
  },
  {
    term: "Randament",
    definition: "Câștigul sau pierderea dintr-o investiție, exprimat de obicei ca procent din suma investită.",
    example: "Dacă investești 1000 RON și primești 100 RON în plus, randamentul este de 10%.",
  },
  {
    term: "Rate",
    definition: "Sume fixe plătite periodic (de obicei lunar) pentru rambursarea unui credit sau împrumut.",
    example: "Un credit de 3000 RON rambursat în 12 rate lunare de câte 275 RON fiecare.",
  },
  {
    term: "Capital",
    definition: "Totalul banilor și activelor pe care îi deții, folosit adesea pentru a genera venit sau a investi.",
    example: "Dacă ai 5000 RON în bancă și o mașină de 10000 RON, capitalul tău total este de 15000 RON.",
  },
  {
    term: "Asigurare",
    definition: "Un contract prin care plătești o sumă mică (prima) pentru a fi protejat financiar împotriva unor pierderi mari neprevăzute.",
    example: "Asigurarea de sănătate te ajută să acoperi costurile medicale neașteptate.",
  },
  {
    term: "Taxă",
    definition: "O sumă de bani pe care trebuie să o plătești statului sau unei instituții pentru un serviciu sau drept.",
    example: "Taxa de școlarizare sau impozitul pe venit sunt exemple de taxe.",
  },
];

export const TERMS_BY_CATEGORY: Record<string, { label: string; terms: string[] }> = {
  baza: { label: "Noțiuni de bază", terms: ["Buget", "Venit", "Cheltuială", "Economii"] },
  banca: { label: "Bancă și credite", terms: ["Dobândă", "Credit", "Datorie", "Rate", "Rating de credit"] },
  investitii: { label: "Investiții", terms: ["Investiție", "Activ", "Randament", "Diversificare", "Lichiditate", "Risc financiar"] },
  protectie: { label: "Protecție financiară", terms: ["Fond de urgență", "Asigurare", "Inflație"] },
  legal: { label: "Taxe și capital", terms: ["Capital", "Taxă"] },
};
