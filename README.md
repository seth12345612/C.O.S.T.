# 🎮 C.O.S.T. — College Operating & Survival Tactics

Joc de educație financiară pentru studenți, construit cu React + Vite + Tailwind CSS.

---

## ▶️ Cum rulezi local

### 1. Cerințe
- **Node.js** v18 sau mai nou → [nodejs.org](https://nodejs.org)
- **npm** (vine cu Node.js) — sau `pnpm` / `yarn`

### 2. Instalează dependențele

```bash
npm install
```

### 3. Pornește aplicația

```bash
npm run dev
```

Deschide browserul la **http://localhost:5173** și joacă!

---

## 📦 Comenzi disponibile

| Comandă | Descriere |
|---------|-----------|
| `npm run dev` | Pornește serverul de dezvoltare (cu hot reload) |
| `npm run build` | Compilează pentru producție (în folderul `dist/`) |
| `npm run preview` | Previzualizează build-ul de producție local |

---

## 📁 Structura proiectului

```
cost-financial-game/
├── src/
│   ├── components/       # Componente UI reutilizabile
│   │   └── ui/           # Shadcn/Radix UI components
│   ├── context/          # State global (Game, XP, Finance, Theme)
│   ├── data/             # Date joc: scenarii, events
│   ├── hooks/            # Hooks personalizate
│   ├── lib/              # Utilitare
│   ├── pages/            # Pagini: Home, Game, Finance, Leaderboard, Contact
│   ├── App.tsx           # Router principal
│   ├── main.tsx          # Entry point
│   └── index.css         # Stiluri globale Tailwind
├── public/               # Fișiere statice
├── index.html            # HTML template
├── vite.config.ts        # Configurare Vite
├── tsconfig.json         # Configurare TypeScript
└── package.json          # Dependențe și scripturi
```

---

## 🎯 Despre joc

**C.O.S.T.** simulează viața financiară a unui student:
- Alege un **scenariu** (cămin, chirie, navetist, job full-time)
- Gestionează **bugetul săptămânal**
- Reacționează la **evenimente aleatorii** (cheltuieli neprevăzute, oportunități)
- Câștigă **XP** și deblochează scenarii noi

---

## 🛠️ Tehnologii folosite

- **React 19** + **TypeScript**
- **Vite 7** (build tool)
- **Tailwind CSS 4**
- **Framer Motion** (animații)
- **Wouter** (routing)
- **Shadcn/Radix UI** (componente)
- **Recharts** (grafice)
- **TanStack Query**
