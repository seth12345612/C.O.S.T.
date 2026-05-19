export interface Optiune {
  text: string;
  bani: number;
  fericirePct: number;
  lectie: string;
  bonusXP?: number;
}

export interface SubScenariuModificari {
  descriere?: string;
  optiuni?: Optiune[];
}

export type SubScenariuOverrides = Record<string, SubScenariuModificari>;

export interface GameEvent {
  id: string;
  titlu: string;
  descriere: string;
  optiuni: Optiune[];
  sezon?: string;
  subScenariuModificari?: SubScenariuOverrides;
  isTutorialEvent?: boolean;
}

const caminEvents: GameEvent[] = [
  {
    id: "c1",
    titlu: "Petrecere în cameră",
    descriere: "Colegii organizează o petrecere chiar la tine în cameră.",
    optiuni: [
      { text: "Mă alătur și contribui cu gustări", bani: -150, fericirePct: 15, lectie: "Socializarea costă, dar merită." },
      { text: "Îi rog să facă liniște, am de învățat", bani: 0, fericirePct: -10, lectie: "Liniștea e rară și prețioasă." },
      { text: "Mut petrecerea în sala comună", bani: -50, fericirePct: 8, lectie: "Compromisul social salvează relațiile." },
    ],
  },
  {
    id: "c2",
    titlu: "Mâncare de acasă",
    descriere: "Părinții ți-au trimis un pachet cu mâncare de casă.",
    optiuni: [
      { text: "O împart cu colegii — toată lumea mănâncă", bani: 0, fericirePct: 20, lectie: "Dărnicia îți face prieteni." },
      { text: "O păstrez pentru mine, economisesc la mâncare", bani: 100, fericirePct: 5, lectie: "Uneori e ok să grijești de tine întâi." },
    ],
    subScenariuModificari: {
      sustinator: {
        descriere: "Părinții au trimis și ceva bani în pachet. Ce faci?",
        optiuni: [
          { text: "Păstrez totul pentru cheltuieli lunare", bani: 200, fericirePct: 10, lectie: "Sprijinul parental ajută la echilibru." },
          { text: "Împart cu colegii — vor să fie recunoscători", bani: 100, fericirePct: 25, lectie: "Dărnicia consolidează relațiile." },
        ],
      },
      bursier: {
        optiuni: [
          { text: "Economisesc din ea pentru materiale", bani: 150, fericirePct: 10, lectie: "Resursele sunt limitate, planificarea e esențială." },
          { text: "O împart cu colegii — am nevoie de prieteni", bani: 0, fericirePct: 20, lectie: "Relațiile sociale sunt importante pentru burse." },
        ],
      },
    },
  },
  {
    id: "c3",
    titlu: "Coleg care nu plătește utilitățile",
    descriere: "Colegul tău de cameră refuză să contribuie la cheltuielile comune.",
    optiuni: [
      { text: "Discut calm cu el și stabilim reguli clare", bani: 0, fericirePct: 5, lectie: "Comunicarea rezolvă conflictele." },
      { text: "Plătesc eu tot ca să evit conflictul", bani: -200, fericirePct: -5, lectie: "Evitarea conflictului costă bani." },
      { text: "Raportez administratorului căminului", bani: 0, fericirePct: -10, lectie: "Autoritățile pot interveni, dar relațiile suferă." },
    ],
    subScenariuModificari: {
      sustinator: {
        descriere: "Colegul știe că părinții te pot ajuta. Consideră că nu e treaba ta să-l presez.",
        optiuni: [
          { text: "Negociem un plan de plată în rate", bani: -100, fericirePct: 0, lectie: "Compromisul rezolvă conflictul." },
          { text: "Plătesc eu și cer restituirea când pot", bani: -200, fericirePct: -5, lectie: "Generozitatea are limite." },
        ],
      },
      singur: {
        descriere: "Ești singurul care plătește. Fără sprijin, situația e critică.",
        optiuni: [
          { text: "Insist pentru plată — nu am de unde", bani: 0, fericirePct: -15, lectie: "Confruntarea e necesară uneori." },
          { text: "Plătesc totul și economisesc unde pot", bani: -200, fericirePct: -10, lectie: "Situația precară nu oferă opțiuni." },
        ],
      },
    },
  },
  {
    id: "c4",
    titlu: "Pană de curent în sesiune",
    descriere: "S-a luat curentul în tot căminul chiar când trebuia să trimiți proiectul.",
    optiuni: [
      { text: "Merg la o cafenea să terminăm proiectul", bani: -100, fericirePct: 5, lectie: "Mediul potrivit crește productivitatea." },
      { text: "Aștept să revină curentul și sper că nu depășesc deadline-ul", bani: 0, fericirePct: -15, lectie: "Adaptabilitatea e cheia în situații de criză." },
    ],
  },
  {
    id: "c5",
    titlu: "Mașina de spălat stricată",
    descriere: "Spălătoria căminului e nefuncțională de o săptămână.",
    optiuni: [
      { text: "Merg la o spălătorie publică din cartier", bani: -80, fericirePct: 5, lectie: "Serviciile externe costă mai mult." },
      { text: "Spăl manual și uscăm pe balcon", bani: 0, fericirePct: -10, lectie: "Economia e uneori incomodă." },
      { text: "Merg acasă la părinți să spăl", bani: -50, fericirePct: 10, lectie: "Familia e un fond de urgență prețios." },
    ],
  },
  {
    id: "c6",
    titlu: "Concert în campus",
    descriere: "O trupă populară cântă în campusul universității.",
    optiuni: [
      { text: "Cumpăr bilet și merg — e o amintire unică", bani: -120, fericirePct: 20, lectie: "Experiențele valorează mai mult decât lucrurile." },
      { text: "Mă uit de la fereastră — gratuit", bani: 0, fericirePct: 5, lectie: "Nu trebuie să cheltuiești ca să te bucuri." },
    ],
  },
  {
    id: "c7",
    titlu: "Colegul sforăie",
    descriere: "Nu poți dormi din cauza colegului de cameră și ești epuizat.",
    optiuni: [
      { text: "Cumpăr dopuri de urechi bune", bani: -80, fericirePct: 15, lectie: "Somnul e esențial pentru sănătate." },
      { text: "Îl trezesc de fiecare dată", bani: 0, fericirePct: -20, lectie: "Conflictele nocturne sunt epuizante pentru ambii." },
      { text: "Dorm în sala de studiu câteva nopți", bani: 0, fericirePct: -10, lectie: "Soluțiile temporare au prețul lor." },
    ],
  },
  {
    id: "c8",
    titlu: "Ziua de curățenie obligatorie",
    descriere: "Administratorul căminului organizează inspecție surpriză a camerelor.",
    optiuni: [
      { text: "Cumpăr produse de curățenie și fac totul impecabil", bani: -100, fericirePct: 5, lectie: "Igiena și ordinea contează pentru starea ta." },
      { text: "Fac curat rapid cu ce am la îndemână", bani: 0, fericirePct: 0, lectie: "Improvizația e o abilitate valoroasă." },
    ],
  },
  {
    id: "c9",
    titlu: "Examen picat",
    descriere: "Ai picat un examen important și trebuie să îl dai din nou în sesiunea restanțelor.",
    optiuni: [
      { text: "Plătesc meditații pentru a fi sigur că îl iau", bani: -400, fericirePct: 5, lectie: "Investiția în educație plătește pe termen lung." },
      { text: "Studiez singur intens", bani: 0, fericirePct: -10, lectie: "Autodisciplina e cea mai valoroasă abilitate." },
    ],
    subScenariuModificari: {
      singur: {
        descriere: "Ai picat examenul. Nu ai pe cine să întrebi pentru ajutor.",
        optiuni: [
          { text: "Caut grup de studiu online", bani: -50, fericirePct: 0, lectie: "Comunitățile online pot fi de ajutor." },
          { text: "Meditații — singura mea șansă sigură", bani: -400, fericirePct: 5, lectie: "Investiția în educație plătește pe termen lung." },
          { text: "Studiez singur — nu am alternativă", bani: 0, fericirePct: -15, lectie: "Independența totală are un preț." },
        ],
      },
      sustinator: {
        descriere: "Părinții sunt dezamăgiți de rezultat. Ce le spui?",
        optiuni: [
          { text: "Promit să mă corectez și cer sprijin", bani: 0, fericirePct: 5, lectie: "Sprijinul familiei poate face diferența." },
          { text: "Plătesc meditații fără să le spun", bani: -400, fericirePct: -5, lectie: "Autonomia are un cost emoțional." },
        ],
      },
    },
  },
  {
    id: "c10",
    titlu: "Ofertă job part-time",
    descriere: "Un coleg îți oferă un job de câteva ore pe zi, dar ar afecta cursurile.",
    optiuni: [
      { text: "Accept — banii în plus ajută mult", bani: 400, fericirePct: -10, lectie: "Banii în plus vin cu sacrificarea timpului." },
      { text: "Refuz — prioritizez studiile", bani: 0, fericirePct: 5, lectie: "Focusul pe termen lung e mai valoros." },
    ],
    subScenariuModificari: {
      bursier: {
        descriere: "Ai primit o ofertă de job part-time, dar bursa de merit necesită rezultate bune.",
        optiuni: [
          { text: "Accept și reduc timpul de studiu", bani: 400, fericirePct: -15, lectie: "Concilierea muncii cu studiile e dificilă, dar posibilă." },
          { text: "Refuz — bursa de merit necesită rezultate", bani: 0, fericirePct: 5, lectie: "Prioritizarea studiului protejează bursa." },
          { text: "Negociez un program mai scurt", bani: 250, fericirePct: -5, lectie: "Compromisul poate mulțumi ambele părți." },
        ],
      },
      singur: {
        descriere: "Ai nevoie disperată de bani, dar job-ul afectează orele de curs.",
        optiuni: [
          { text: "Accept — facturile nu așteaptă", bani: 400, fericirePct: -15, lectie: "Nevoi imediate pot afecta obiectivele pe termen lung." },
          { text: "Caut alte surse de venit", bani: 0, fericirePct: 0, lectie: "Explorarea alternativelor e importantă." },
        ],
      },
    },
  },
  {
    id: "c11",
    titlu: "Internet prea lent",
    descriere: "Internetul căminului e atât de lent că nu poți participa la cursurile online.",
    optiuni: [
      { text: "Cumpăr date extra și folosesc datele telefonului", bani: -120, fericirePct: 5, lectie: "Investiția în conectivitate e uneori necesară." },
      { text: "Merg la biblioteca universitară", bani: -30, fericirePct: 0, lectie: "Alternativele gratuite există, dar necesită efort." },
    ],
  },
  {
    id: "c12",
    titlu: "Colectă pentru fondul căminului",
    descriere: "Se strâng bani pentru renovarea băilor comune — fiecare contribuie cât poate.",
    optiuni: [
      { text: "Contribui cu suma recomandată", bani: -200, fericirePct: 8, lectie: "Investiția în spații comune îmbunătățește viața tuturor." },
      { text: "Contribui cu jumătate din sumă", bani: -100, fericirePct: -3, lectie: "Compromisul financiar e uneori necesar." },
      { text: "Nu contribui — nu am de unde", bani: 0, fericirePct: -8, lectie: "Refuzul poate crea tensiuni sociale." },
    ],
  },
  {
    id: "c13",
    titlu: "Bursa de performanță",
    descriere: "Ai obținut bursa de performanță! Bani în plus, dar și responsabilitate de a menține media.",
    optiuni: [
      { text: "Acceptă bursa și planifică bugetul inteligent", bani: 500, fericirePct: 20, lectie: "Recompensele pentru efort merită sărbătorite.", bonusXP: 50 },
      { text: "Acceptă și cheltuiești pe ceva util", bani: 200, fericirePct: 15, lectie: "Echilibrul între recompensă și responsabilitate." },
    ],
    subScenariuModificari: {
      bursier: {
        optiuni: [
          { text: "Continuu să înveți intens — merită", bani: 600, fericirePct: 25, lectie: "Bursa de merit justifică efortul suplimentar.", bonusXP: 60 },
          { text: "Stabilesc un echilibru între studiu și viață", bani: 500, fericirePct: 15, lectie: "Echilibrul previne epuizarea." },
        ],
      },
      sustinator: {
        descriere: "Ai obținut bursa de performanță. Vrei să le spui părinților?",
        optiuni: [
          { text: "Le spun — mândria familiei e importantă", bani: 500, fericirePct: 30, lectie: "Succesul împărtășit cu familia aduce bucurie dublă.", bonusXP: 40 },
          { text: "Păstrez discreția — nu vreau presiune", bani: 500, fericirePct: 10, lectie: "Anonimatul reduce presiunea socială." },
        ],
      },
    },
  },
  {
    id: "c14",
    titlu: "Proiect de grup scump",
    descriere: "Proiectul de la facultate necesită materiale și printuri costisitoare.",
    optiuni: [
      { text: "Împart costurile egal cu grupul", bani: -150, fericirePct: 5, lectie: "Munca în echipă reduce povara individuală." },
      { text: "Caut alternative mai ieftine online", bani: -50, fericirePct: 0, lectie: "Creativitatea economisește bani." },
    ],
  },
  {
    id: "c15",
    titlu: "Ziua onomasticii unui coleg",
    descriere: "Colegii organizează o cină pentru ziua unuia dintre voi.",
    optiuni: [
      { text: "Contribui la cadou și particip la cină", bani: -150, fericirePct: 15, lectie: "Relațiile sociale sunt o investiție valoroasă." },
      { text: "Dau un mesaj de felicitare — nu am budget acum", bani: 0, fericirePct: -5, lectie: "Gesturile mici contează și ele." },
    ],
  },
];

const chirieEvents: GameEvent[] = [
  {
    id: "h1",
    titlu: "Chiria crește",
    descriere: "Proprietarul anunță o creștere de chirie cu 200 RON pentru luna viitoare.",
    optiuni: [
      { text: "Accept creșterea — e un cartier bun", bani: -200, fericirePct: -10, lectie: "Piața imobiliară dictează condițiile." },
      { text: "Negociez cu proprietarul", bani: -100, fericirePct: 0, lectie: "Negocierea e o abilitate financiară valoroasă." },
      { text: "Caut alt apartament mai ieftin", bani: -500, fericirePct: -15, lectie: "Mutarea costă pe termen scurt, dar economisești pe termen lung." },
    ],
    subScenariuModificari: {
      sustinator: {
        descriere: "Chiria crește. Părinții te pot ajuta cu diferența.",
        optiuni: [
          { text: "Cer ajutorul părinților — e temporar", bani: 0, fericirePct: 5, lectie: "Familia poate fi o plasă de siguranță." },
          { text: "Accept creșterea și mă descurc", bani: -200, fericirePct: -10, lectie: "Independența completă are un preț." },
          { text: "Caut alt apartament cu chirie mai mică", bani: -500, fericirePct: -15, lectie: "Mutarea costă pe termen scurt." },
        ],
      },
      singur: {
        optiuni: [
          { text: "Accept creșterea — alternativa e să dorm pe stradă", bani: -200, fericirePct: -15, lectie: "Nu ai multe opțiuni când ești singur." },
          { text: "Caut coleg de apartament să împărțim chiria", bani: -100, fericirePct: -5, lectie: "Parteneriatele reduc costurile." },
        ],
      },
    },
    isTutorialEvent: true,
  },
  {
    id: "h2",
    titlu: "Frigider stricat",
    descriere: "Frigiderul din apartament s-a stricat. Mâncarea ta riscă să se strice.",
    optiuni: [
      { text: "Cumpăr un frigider second-hand rapid", bani: -600, fericirePct: 5, lectie: "Investițiile urgente sunt uneori inevitabile." },
      { text: "Îi cer proprietarului să îl repare", bani: 0, fericirePct: -5, lectie: "Cunoașterea drepturilor de chiriaș te protejează." },
      { text: "Cumpăr doar alimente neperisabile temporar", bani: -50, fericirePct: -10, lectie: "Adaptarea la situații dificile e esențială." },
    ],
  },
  {
    id: "h3",
    titlu: "Coleg de apartament pleacă",
    descriere: "Colegul tău de apartament se mută brusc și chiria integrală revine ție.",
    optiuni: [
      { text: "Caut urgent un nou coleg de cameră", bani: -100, fericirePct: -5, lectie: "Planificarea financiară trebuie să includă scenarii de risc." },
      { text: "Plătesc singur chiria integrală o lună", bani: -1200, fericirePct: -20, lectie: "Fondul de urgență e esențial." },
    ],
  },
  {
    id: "h4",
    titlu: "Ofertă de muncă remote",
    descriere: "O companie îți oferă un job remote cu program flexibil.",
    optiuni: [
      { text: "Accept — câștig mai mult și lucrez de acasă", bani: 800, fericirePct: 15, lectie: "Munca remote schimbă echilibrul venit-cheltuieli." },
      { text: "Negociez un program part-time", bani: 400, fericirePct: 5, lectie: "Flexibilitatea are valoare." },
      { text: "Refuz — prioritizez finalizarea facultății", bani: 0, fericirePct: 5, lectie: "Diplome pe termen lung vs bani pe termen scurt." },
    ],
    subScenariuModificari: {
      singur: {
        descriere: "Ai nevoie de bani stabili. Acest job ar putea acoperi chiria.",
        optiuni: [
          { text: "Accept full-time — am nevoie de venit sigur", bani: 800, fericirePct: 10, lectie: "Stabilitatea financiară e crucială când ești singur." },
          { text: "Accept part-time — să am timp și pentru facultate", bani: 400, fericirePct: 5, lectie: "Echilibrul e posibil cu planificare." },
        ],
      },
      sustinator: {
        optiuni: [
          { text: "Accept și trimit bani acasă", bani: 600, fericirePct: 20, lectie: "Ajutarea familiei aduce satisfacție." },
          { text: "Accept dar păstrez pentru mine", bani: 800, fericirePct: 15, lectie: "Prioritizarea propriilor nevoi e validă." },
        ],
      },
    },
  },
  {
    id: "h5",
    titlu: "Factura la electricitate uriașă",
    descriere: "Ai lăsat aparatele pornite prea mult și factura e mult mai mare decât de obicei.",
    optiuni: [
      { text: "Plătesc factura și instalez prize inteligente", bani: -450, fericirePct: -5, lectie: "Eficiența energetică economisește bani pe termen lung." },
      { text: "Plătesc facturat în rate dacă e posibil", bani: -200, fericirePct: -10, lectie: "Managementul fluxului de numerar e important." },
    ],
  },
  {
    id: "h6",
    titlu: "Vecin gălăgios",
    descriere: "Vecinul face gălăgie noaptea și nu poți dormi.",
    optiuni: [
      { text: "Discut civilizat cu vecinul", bani: 0, fericirePct: 5, lectie: "Comunicarea directă rezolvă multe probleme." },
      { text: "Sun la administrația blocului", bani: 0, fericirePct: -5, lectie: "Autoritățile sunt un ultim resort." },
      { text: "Mă mut la un prieten câteva nopți", bani: -100, fericirePct: 5, lectie: "Prietenii sunt un fond emoțional de urgență." },
    ],
  },
  {
    id: "h7",
    titlu: "Reducere la supermarket",
    descriere: "Supermarketul din cartier are promoții mari săptămâna aceasta.",
    optiuni: [
      { text: "Cumpăr în cantități mai mari și economisesc", bani: 150, fericirePct: 5, lectie: "Cumpărăturile strategice reduc cheltuielile." },
      { text: "Cumpăr doar strictul necesar", bani: 0, fericirePct: 0, lectie: "Disciplina financiară înseamnă și să reziste tentațiilor." },
    ],
  },
  {
    id: "h8",
    titlu: "Internship plătit",
    descriere: "Ai primit o ofertă de internship plătit la o firmă bună.",
    optiuni: [
      { text: "Accept — experiență + bani", bani: 600, fericirePct: 10, lectie: "Experiența timpurie valorează mai mult decât salariul inițial.", bonusXP: 30 },
      { text: "Refuz — cursurile sunt prioritare", bani: 0, fericirePct: 0, lectie: "Prioritizarea corectă depinde de obiectivele tale." },
    ],
  },
  {
    id: "h9",
    titlu: "Mașina prietenului stricată",
    descriere: "Un prieten bun are mașina stricată și îți cere un împrumut urgent.",
    optiuni: [
      { text: "Îi împrumut bani cu termen clar de returnare", bani: -500, fericirePct: 5, lectie: "Împrumuturile între prieteni trebuie documentate." },
      { text: "Îl ajut să caute alternative mai ieftine", bani: 0, fericirePct: 5, lectie: "Ajutorul nu înseamnă întotdeauna bani." },
      { text: "Nu pot — bugetul meu e la limită", bani: 0, fericirePct: -10, lectie: "E ok să spui nu când ești în dificultate financiară." },
    ],
    subScenariuModificari: {
      sustinator: {
        descriere: "Prietenul știe că părinții tăi te pot ajuta. Insistă pentru împrumut.",
        optiuni: [
          { text: "Împrumut — părinții pot acoperi dacă nu pot", bani: -500, fericirePct: 10, lectie: "Sprijinul familial ca plasă de siguranță." },
          { text: "Refuz categoric — e problema lui", bani: 0, fericirePct: -5, lectie: "E ok să spui nu." },
        ],
      },
      singur: {
        optiuni: [
          { text: "Nu am de unde — bugetul e la limită", bani: 0, fericirePct: -15, lectie: "Situația precară limitează opțiunile." },
          { text: "Împrumut și sper să îmi dea înapoi", bani: -500, fericirePct: -5, lectie: "Riscul de a nu primi banii înapoi." },
        ],
      },
    },
  },
  {
    id: "h10",
    titlu: "Abonament servicii streaming",
    descriere: "Ai abonamente la 4 platforme streaming și observi că nu le folosești pe toate.",
    optiuni: [
      { text: "Renunț la 2 abonamente — economisesc lunar", bani: 80, fericirePct: -5, lectie: "Abonamentele mici se adună într-o cheltuiala mare." },
      { text: "Păstrez toate — entertainment-ul e important", bani: 0, fericirePct: 5, lectie: "Valoarea percepută diferă de la persoana la persoana." },
      { text: "Shared plan cu prietenii — împărțim costul", bani: 40, fericirePct: 5, lectie: "Costurile împărțite reduc povara individuală." },
    ],
  },
  {
    id: "h11",
    titlu: "Reparație neprevăzută la apartament",
    descriere: "O țeavă s-a spart în apartament și trebuie reparată urgent.",
    optiuni: [
      { text: "Cer proprietarului să repare — e datoria lui", bani: 0, fericirePct: 5, lectie: "Cunoașterea drepturilor legale de chiriaș te protejează." },
      { text: "Plătesc eu și scad din chirie", bani: -300, fericirePct: -5, lectie: "Negocierea cu proprietarul e o abilitate valoroasă." },
    ],
  },
];

const garsonieraEvents: GameEvent[] = [
  {
    id: "g1",
    titlu: "Ofertă de promovare",
    descriere: "Șeful îți oferă o promovare cu salariu mai mare dar program mai lung.",
    optiuni: [
      { text: "Accept promovarea — mai mulți bani, mai multă muncă", bani: 800, fericirePct: -15, lectie: "Promovările vin cu trade-off-uri de timp și energie." },
      { text: "Negociez un program hibrid", bani: 400, fericirePct: 0, lectie: "Negocierea condițiilor e o abilitate managerială." },
      { text: "Refuz — cursurile și viața personală sunt prioritare", bani: 0, fericirePct: 5, lectie: "Echilibrul muncă-viață are o valoare reală." },
    ],
    subScenariuModificari: {
      sustinator: {
        descriere: "Părinții sunt mândri de tine. Vor să sărbătorească succesul.",
        optiuni: [
          { text: "Accept — vreau să demonstrez că pot", bani: 800, fericirePct: 5, lectie: "Succesul profesional merită celebrat." },
          { text: "Accept și încep să pun bani deoparte pentru viitor", bani: 600, fericirePct: 10, lectie: "Planificarea financiară timpurie contează." },
        ],
      },
    },
    isTutorialEvent: true,
  },
  {
    id: "g2",
    titlu: "Laptop stricat",
    descriere: "Laptopul tău de serviciu s-a stricat și ai nevoie urgent de unul nou.",
    optiuni: [
      { text: "Cumpăr un laptop nou refurbished — bun și ieftin", bani: -1500, fericirePct: 5, lectie: "Produsele refurbished oferă raport calitate-preț excelent." },
      { text: "Cumpăr nou cu garanție completă", bani: -3000, fericirePct: 10, lectie: "Calitatea costă, dar oferă siguranță." },
      { text: "Împrumut de la un coleg până găsesc soluție", bani: 0, fericirePct: -5, lectie: "Soluțiile temporare reduc presiunea imediată." },
    ],
  },
  {
    id: "g3",
    titlu: "Deadline proiect + examen în aceeași săptămână",
    descriere: "Ai deadline la job și examen la facultate în aceeași zi. Presiune maximă.",
    optiuni: [
      { text: "Lucrez nopțile și duc ambele la bun sfârșit", bani: 0, fericirePct: -25, lectie: "Suprasolicitarea are consecințe pe termen lung." },
      { text: "Negociez extensia deadline-ului la job", bani: 0, fericirePct: -5, lectie: "Comunicarea proactivă a limitelor e o abilitate profesională." },
      { text: "Iau o zi liberă și mă concentrez pe examen", bani: -200, fericirePct: 5, lectie: "Uneori sacrificiul pe termen scurt protejează viitorul." },
    ],
  },
  {
    id: "g4",
    titlu: "Colega de birou are nevoie de ajutor",
    descriere: "Colega te roagă să o ajuți cu un proiect, dar ai propriile tale task-uri.",
    optiuni: [
      { text: "O ajut — relațiile la birou contează", bani: 0, fericirePct: 10, lectie: "Rețeaua profesională e o investiție pe termen lung." },
      { text: "Îmi termin propriile sarcini — ea se descurcă", bani: 0, fericirePct: -5, lectie: "Prioritizarea propriilor responsabilități e importantă." },
    ],
  },
  {
    id: "g5",
    titlu: "Cheltuieli medicale neprevăzute",
    descriere: "Suprasolicitarea și stresul au afectat sănătatea și ai nevoie de consultații.",
    optiuni: [
      { text: "Merg la medic și urmez tratamentul complet", bani: -600, fericirePct: 10, lectie: "Sănătatea e cel mai valoros activ pe care îl ai." },
      { text: "Iau un tratament generic din farmacie", bani: -150, fericirePct: -5, lectie: "Economisirea la sănătate poate costa mai mult pe termen lung." },
    ],
  },
  {
    id: "g6",
    titlu: "Investiție în skill-uri noi",
    descriere: "O platformă de cursuri online are reduceri la cursuri de specialitate.",
    optiuni: [
      { text: "Cumpăr 2-3 cursuri relevante pentru carieră", bani: -400, fericirePct: 15, lectie: "Investiția în educație continuă are ROI ridicat.", bonusXP: 40 },
      { text: "Urmăresc cursuri gratuite pe YouTube", bani: 0, fericirePct: 5, lectie: "Conținutul gratuit de calitate există și e valorificat de cei disciplinați." },
    ],
  },
  {
    id: "g7",
    titlu: "Client dificil la job",
    descriere: "Un client important este nemulțumit și amenință că renunță la contract.",
    optiuni: [
      { text: "Muncesc extra pentru a-i depăși așteptările", bani: 200, fericirePct: -15, lectie: "Retenția clienților costă efort, dar pierderea lor costă bani." },
      { text: "Escaladez problema la manager", bani: 0, fericirePct: -5, lectie: "Delegarea problemelor complexe e o abilitate de leadership." },
    ],
  },
  {
    id: "g8",
    titlu: "Prime de performanță",
    descriere: "Ai primit o primă de performanță la job. Ce faci cu banii în plus?",
    optiuni: [
      { text: "Pun în economii / fond de urgență", bani: 500, fericirePct: 10, lectie: "Fondul de urgență te protejează de șocuri financiare.", bonusXP: 30 },
      { text: "Îmi cumpăr ceva de care am nevoie pentru job", bani: 100, fericirePct: 15, lectie: "Investițiile în productivitate se amortizează." },
      { text: "Ies cu prietenii — merit o relaxare", bani: -200, fericirePct: 25, lectie: "Recompensele ocazionale mențin motivația." },
    ],
  },
];

const navetistEvents: GameEvent[] = [
  {
    id: "n1",
    titlu: "Tren întârziat",
    descriere: "Trenul are 60 de minute întârziere și riscă să ratezi cursurile de dimineață.",
    optiuni: [
      { text: "Iau un taxi/Uber pentru a ajunge la timp", bani: -250, fericirePct: 5, lectie: "Confortul și precizia costă mai mult." },
      { text: "Aștept trenul și anunț profesorul", bani: 0, fericirePct: -10, lectie: "Comunicarea proactivă salvează situații dificile." },
    ],
  },
  {
    id: "n2",
    titlu: "Pachet de la bunici",
    descriere: "Bunicii ți-au pregătit o sacoșă plină cu mâncare bună.",
    optiuni: [
      { text: "O mănânc toată săptămâna — economisesc la masă", bani: 150, fericirePct: 15, lectie: "Sprijinul familiei reduce cheltuielile." },
      { text: "Împart cu colegii de facultate", bani: 0, fericirePct: 20, lectie: "Generozitatea consolidează prietenii." },
    ],
  },
  {
    id: "n3",
    titlu: "Abonament transport expirat",
    descriere: "Ai uitat să reînnoiești abonamentul de tren și ești prins fără bilet.",
    optiuni: [
      { text: "Cumpăr bilet pe loc la preț întreg", bani: -80, fericirePct: -5, lectie: "Neglijența mică costă mai mult decât prevenirea." },
      { text: "Plătesc amenda controlorului", bani: -200, fericirePct: -15, lectie: "Nerespectarea regulilor costă semnificativ mai mult." },
    ],
  },
  {
    id: "n4",
    titlu: "Naveta costă tot mai mult",
    descriere: "Prețul biletelor s-a majorat cu 20% față de luna trecută.",
    optiuni: [
      { text: "Caut o garsonieră în oraș — cheltuielile de navetă depășesc chiria", bani: -800, fericirePct: -5, lectie: "Analiza cost-beneficiu te ajută să iei decizii raționale." },
      { text: "Îmi cumpăr abonament anual la preț redus", bani: -600, fericirePct: 5, lectie: "Plata anticipată economisește pe termen lung." },
      { text: "Continui cu bilete zilnice", bani: -100, fericirePct: 0, lectie: "Uneori flexibilitatea costă mai mult." },
    ],
    subScenariuModificari: {
      sustinator: {
        descriere: "Părinții propun să te ajute cu chiria dacă te muți în oraș.",
        optiuni: [
          { text: "Mut în oraș cu ajutorul lor", bani: -400, fericirePct: 10, lectie: "Sprijinul familial face mutarea posibilă." },
          { text: "Rămân la navetă — vreau să fiu independent", bani: -100, fericirePct: 5, lectie: "Independența are valoare pentru unii." },
        ],
      },
      singur: {
        optiuni: [
          { text: "Caut o garsonieră ieftină — naveta costă prea mult", bani: -800, fericirePct: -10, lectie: "Nu ai de ales când banii nu ajung." },
          { text: "Continui să navetesc — nu am bani de chirie", bani: -100, fericirePct: -15, lectie: "Situația financiară limitează opțiunile." },
        ],
      },
    },
  },
  {
    id: "n5",
    titlu: "Ajutor la treburile casei",
    descriere: "Mama te roagă să o ajuți la curățenie generală sâmbătă.",
    optiuni: [
      { text: "Rămân și ajut — familia vine pe primul loc", bani: 0, fericirePct: 10, lectie: "Relațiile familiale au valoare în afara banilor." },
      { text: "Plec în oraș la activități proprii", bani: -100, fericirePct: -5, lectie: "Independența personală uneori crează tensiuni familiale." },
    ],
  },
  {
    id: "n6",
    titlu: "Mașina personală stricată",
    descriere: "Mașina cu care faci naveta s-a stricat și trebuie reparată urgent.",
    optiuni: [
      { text: "Repar mașina — investiție necesară", bani: -1500, fericirePct: -10, lectie: "Întreținerea regulată previne reparații costisitoare." },
      { text: "Folosesc transportul în comun temporar", bani: -200, fericirePct: -15, lectie: "Alternativele există, chiar dacă sunt mai incomode." },
    ],
  },
  {
    id: "n7",
    titlu: "Prieteni din facultate invitați în weekend",
    descriere: "Prietenii din grupul tău vor să vă organizeze un weekend la tine acasă.",
    optiuni: [
      { text: "Îi invit și organizez totul — merită", bani: -300, fericirePct: 25, lectie: "Experiențele sociale au valoare enormă pentru wellbeing." },
      { text: "Sugerez o alternativă mai ieftină — grătar în natură", bani: -100, fericirePct: 20, lectie: "Creativitatea reduce costurile și poate crea amintiri mai frumoase." },
    ],
  },
  {
    id: "n8",
    titlu: "Timp pierdut pe drum",
    descriere: "Naveta de 2 ore zilnic te epuizează. Găsești totuși o soluție productivă.",
    optiuni: [
      { text: "Investesc în căști bune și podcasturi educative", bani: -250, fericirePct: 10, lectie: "Transformarea timpului pierdut în timp productiv e o abilitate cheie." },
      { text: "Dorm în tren — recuperez somnul", bani: 0, fericirePct: 5, lectie: "Somnul de calitate e esențial pentru productivitate." },
    ],
  },
];

const iarnaEvents: GameEvent[] = [
  {
    id: "i1",
    titlu: "Cadouri de Crăciun",
    descriere: "Lista de cadouri crește exponențial. Toată lumea se așteaptă la ceva.",
    optiuni: [
      { text: "Stabilesc un buget fix și îl respect", bani: -400, fericirePct: 15, lectie: "Bugetele pentru sărbători trebuie planificate anticipat." },
      { text: "Fac cadouri DIY — mai personal și mai ieftin", bani: -150, fericirePct: 10, lectie: "Creativitatea poate înlocui cheltuielile mari." },
      { text: "Propun în familie să ne dăm cadouri simbolice", bani: -100, fericirePct: 5, lectie: "Comunicarea deschisă despre bani reduce presiunea." },
    ],
    sezon: "iarna",
  },
  {
    id: "i2",
    titlu: "Factura la gaz uriașă",
    descriere: "Iarna asta e deosebit de grea și factura la încălzire a explodat.",
    optiuni: [
      { text: "Plătesc și instalez termostatul inteligent", bani: -800, fericirePct: -5, lectie: "Eficiența energetică e o investiție pe termen lung." },
      { text: "Reduc temperatura și port mai multe straturi", bani: -400, fericirePct: -10, lectie: "Adaptarea la condiții dificile economisește bani." },
    ],
    sezon: "iarna",
  },
  {
    id: "i3",
    titlu: "Petrecere de Revelion",
    descriere: "Prietenii organizează o petrecere mare de Revelion.",
    optiuni: [
      { text: "Particip și contribui la cheltuieli", bani: -300, fericirePct: 25, lectie: "Momentele speciale merită să fie trăite." },
      { text: "Organizez ceva mai intim și mai ieftin acasă", bani: -150, fericirePct: 20, lectie: "Experiențele autentice nu necesită bugete mari." },
    ],
    sezon: "iarna",
  },
  {
    id: "i4",
    titlu: "Gripă în sesiune",
    descriere: "Te-ai îmbolnăvit fix în sesiunea de iarnă.",
    optiuni: [
      { text: "Merg la medic și iau tratament corect", bani: -200, fericirePct: 10, lectie: "Tratamentul corect e mai ieftin decât complicațiile." },
      { text: "Stau în pat și sper că trece singur", bani: 0, fericirePct: -20, lectie: "Ignorarea simptomelor poate agrava situația." },
    ],
    sezon: "iarna",
  },
];

const varaEvents: GameEvent[] = [
  {
    id: "v1",
    titlu: "Festival muzical",
    descriere: "Cel mai mare festival de vară e în weekend și toți prietenii merg.",
    optiuni: [
      { text: "Cumpăr bilet — e o experiență unică", bani: -400, fericirePct: 30, lectie: "Experiențele creează amintiri, lucrurile nu." },
      { text: "Urmăresc live stream-ul de acasă — gratuit", bani: 0, fericirePct: 10, lectie: "Alternativele digitale există pentru cei cu bugete limitate." },
    ],
    sezon: "vara",
  },
  {
    id: "v2",
    titlu: "Job sezonier la mare",
    descriere: "Un hotel de la mare oferă locuri de muncă sezoniere bine plătite.",
    optiuni: [
      { text: "Accept job-ul — câștig bine și stau la mare", bani: 1200, fericirePct: 20, lectie: "Job-urile sezoniere combină câștigul cu experiența." },
      { text: "Rămân în oraș și mă relaxez", bani: 0, fericirePct: 15, lectie: "Odihna după un an greu are valoare." },
    ],
    sezon: "vara",
  },
  {
    id: "v3",
    titlu: "Cheltuieli excesive pe căldură",
    descriere: "Aparatul de aer condiționat a funcționat non-stop și factura e uriașă.",
    optiuni: [
      { text: "Plătesc și programez AC-ul mai eficient", bani: -500, fericirePct: -10, lectie: "Eficiența energetică se învață și se practică." },
      { text: "Plătesc și încerc ventilatoare ca alternativă", bani: -250, fericirePct: -5, lectie: "Alternativele mai puțin confortabile economisesc bani." },
    ],
    sezon: "vara",
  },
];

const recuperareEvents: GameEvent[] = [
  {
    id: "rec1",
    titlu: "Accept job de livrare",
    descriere: "Ofertă de a lucra ca livrator pentru un restaurant local. Program flexibil, dar muncă fizică.",
    optiuni: [
      { text: "Accept jobul", bani: 300, fericirePct: -5, lectie: "Munca fizică și programul灵活性 pot fi epuizante, dar aduc venit imediat. Este o soluție de criză, nu una de lungă durată." },
      { text: "Negociez pentru program redus", bani: 150, fericirePct: 0, lectie: "Compromisul între venit și timp este o decizie personală. Fii realist cu ce poți duce." },
    ],
  },
  {
    id: "rec2",
    titlu: "Muncesc la fast-food",
    descriere: "Lanțul local de fast-food angajează. Muncă intensivă, dar venit sigur.",
    optiuni: [
      { text: "Accept full-time", bani: 400, fericirePct: -15, lectie: "Joburile de fast-food sunt epuizante dar oferă venit constant. Atenție la burnout!" },
      { text: "Accept part-time", bani: 200, fericirePct: -8, lectie: "Programul part-time îți permite să păstrezi energie pentru facultate, dar câștigul e mai mic." },
    ],
  },
  {
    id: "rec3",
    titlu: "Fac meditații",
    descriere: "Un coleg are nevoie de ajutor la un examen. Poți lua meditații pentru bani extra.",
    optiuni: [
      { text: "Accept — câștig bun", bani: 400, fericirePct: -5, lectie: "Meditațiile sunt o sursă de venit care valorifică cunoștințele tale. Dar nu uita să studiezi și tu!", bonusXP: 10 },
      { text: "Refuz — nu am timp", bani: 0, fericirePct: 5, lectie: "Uneori e mai bine să îți concentrezi energia pe propriile examene decât să adaugi mai mult stres." },
    ],
  },
  {
    id: "rec4",
    titlu: "Vând lucruri pe Viber",
    descriere: "Ai lucruri prin casă pe care nu le mai folosești. Le poți vinde online.",
    optiuni: [
      { text: "Vând tot ce nu folosesc", bani: 150, fericirePct: 0, lectie: "Vânzarea obiectelor nefolosite e o metodă rapidă de a face rost de bani. Încearcă să vinzi periodic!" },
      { text: "Vând doar electronică", bani: 200, fericirePct: -2, lectie: "Electronica se vinde mai bine, dar trebuie să verifici că funcționează înainte." },
    ],
  },
  {
    id: "rec5",
    titlu: "Cer bani de la părinți",
    descriere: "Situația ta e critică. Poți cere ajutor de la familie, dar știi că tensionează relația.",
    optiuni: [
      { text: "Cer bani cu promisiune de returnare", bani: 500, fericirePct: -10, lectie: "Familia e o plasă de siguranță, dar fiecare împrumut creează obligații. Fii recunoscător și plătește înapoi când poți." },
      { text: "Cer doar mâncare de acasă", bani: 100, fericirePct: -3, lectie: "Mâncarea de acasă e mai puțin umilitor și te ajută să economisești. E o soluție temporară bună." },
      { text: "Nu cer — mă descurc singur", bani: 0, fericirePct: 5, lectie: "Independența e admirabilă, dar uneori Pride-ul te ține blocat. Găsește echilibrul." },
    ],
  },
  {
    id: "rec6",
    titlu: "Job de curățenie",
    descriere: "O firmă de curățenie caută personal pentru clădiri de birouri dimineața.",
    optiuni: [
      { text: "Accept — trezire devreme", bani: 250, fericirePct: -8, lectie: "Joburile de curățenie sunt solicitante fizic. Programul devreme poate afecta somnul și facultatea." },
    ],
  },
  {
    id: "rec7",
    titlu: "Help la mutări",
    descriere: "O firmă de mutări caută oameni pentru ajutor fizic ocazional.",
    optiuni: [
      { text: "Accept câteva mutări", bani: 350, fericirePct: -12, lectie: "Munca fizică intensivă aduce bani快速 dar te epuizează. E potrivită pentru venituri ocazionale, nu constante." },
    ],
  },
  {
    id: "rec8",
    titlu: "Vând sânge (plasmă)",
    descriere: "Centrul de donări plătește pentru plasmă. E legal și sigur.",
    optiuni: [
      { text: "Donăm lunar", bani: 200, fericirePct: -5, lectie: "Donarea de plasmă e o sursă de venit accesibilă. Asigură-te că mănânci bine înainte și după!", bonusXP: 5 },
    ],
  },
  {
    id: "rec9",
    titlu: "Fac task-uri pe platforme freelancer",
    descriere: "Există platforme unde poți face task-uri mici online pentru bani.",
    optiuni: [
      { text: "Accept proiecte mici", bani: 180, fericirePct: -3, lectie: "Work-ul online e flexibil dar poate fi frustrant. Găsește proiecte care corespund skills-urilor tale." },
    ],
  },
  {
    id: "rec10",
    titlu: "Reduc cheltuielile la maxim",
    descriere: "Analyzezi bugetul și cauți unde poți tăia din cheltuieli.",
    optiuni: [
      { text: "Renunț la toate abonamentele", bani: 100, fericirePct: -8, lectie: "Abonamentele mici se adună. Renunțarea temporară la streaming și alte servicii poate economisi mult." },
      { text: "Cumpăr doar mâncare de bază", bani: 80, fericirePct: -10, lectie: "Mâncarea de bază e mai ieftină dar monotonia poate afecta starea de spirit și sănătatea." },
    ],
  },
];

const vacantaEvents: GameEvent[] = [
  {
    id: "vac1",
    titlu: "Zbor ieftin găsit",
    descriere: "Ai găsit bilete de avion la jumătate de preț dacă rezervi acum.",
    optiuni: [
      { text: "Rezerv imediat — e o ofertă rară", bani: -600, fericirePct: 25, lectie: "Planificarea anticipată a vacanțelor economisește bani." },
      { text: "Mai aștept să văd dacă prețul scade mai mult", bani: 0, fericirePct: -5, lectie: "Așteptarea poate face să pierzi ofertele bune." },
    ],
    sezon: "vacanta",
  },
  {
    id: "vac2",
    titlu: "Bagaj pierdut",
    descriere: "Aeroportul ți-a pierdut bagajul. Ești la destinație fără haine.",
    optiuni: [
      { text: "Cumpăr strictul necesar și raportez incidentul", bani: -300, fericirePct: -10, lectie: "Asigurarea de călătorie previne astfel de costuri." },
      { text: "Aștept bagajul și îmi împrumut de la prieteni", bani: 0, fericirePct: -15, lectie: "Rețeaua de suport reduce impactul situațiilor neprevăzute." },
    ],
    sezon: "vacanta",
  },
  {
    id: "vac3",
    titlu: "Restaurant scump la destinație",
    descriere: "Restaurantele din zona turistică sunt mult mai scumpe decât te-ai așteptat.",
    optiuni: [
      { text: "Mănânc la restaurante locale, nu turistice", bani: -150, fericirePct: 10, lectie: "Explorarea zonelor neturistice economisește și îmbogățește experiența." },
      { text: "Gătesc la cazare când e posibil", bani: -80, fericirePct: 5, lectie: "Gătitul propriu reduce semnificativ cheltuielile de vacanță." },
      { text: "Mă bucur de experiență fără să mă uit la prețuri", bani: -500, fericirePct: 20, lectie: "Vacanțele fără buget strict pot genera surprize neplăcute." },
    ],
    sezon: "vacanta",
  },
];

export const GAME_EVENTS: Record<string, GameEvent[]> = {
  camin: caminEvents,
  chirie: chirieEvents,
  garsoniera: garsonieraEvents,
  navetist: navetistEvents,
  iarna: [...iarnaEvents, ...caminEvents.slice(0, 5)],
  vara: [...varaEvents, ...chirieEvents.slice(0, 5)],
  vacanta: [...vacantaEvents, ...garsonieraEvents.slice(0, 5)],
  recuperare: recuperareEvents,
};

export function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
