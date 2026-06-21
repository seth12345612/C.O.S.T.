# 🎓 C.O.S.T. — College Operating & Survival Tactics

> **O aplicație interactivă de educație financiară pentru studenți români**

C.O.S.T. simulează viața financiară a unui student timp de 12 luni (48 de săptămâni). Jucătorii își aleg un scenariu de viață, își gestionează bugetul, reacționează la evenimente aleatorii, câștigă XP și deblochează scenarii noi.

---

## 🚀 Demo

[Aplicatia live pe Render](https://cost-financial-game.onrender.com)

---

## 🧠 Features

### Joc Principal
- **17 scenarii** de viață (Camin, Navetist, Chirie, Garsonieră, Antreprenor etc.)
- **3 dificultăți** (Ușor, Mediu, Greu) cu multiplicatori diferiți
- **Sistem de evenimente** — peste 200 de evenimente random cu alegeri multiple
- **Management dual** — bani + fericire
- **Mod recovery** — 8 săptămâni de recuperare la intrarea în datorii
- **Mod endless** — continuă jocul după victorie
- **Sursă de venit personalizabilă** la start

### Progresie
- **Sistem XP și niveluri** (200 XP/nivel)
- **Arbore de deblocare** a scenariilor bazat pe nivel
- **Scenarii premium** deblocate prin abonament

### Mentor AI
- **Asistent financiar inteligent** cu răspunsuri contextuale în română
- Integrat cu **Google Gemini API** pentru răspunsuri în timp real
- Înțelege contextul jocului (scenariu, bani, săptămâna)

### Achievements & Badges
- 20+ realizări de deblocat
- Notificări la deblocare
- Sistem de progres persistent

### Raport Financiar
- Grafic cheltuieli pe categorii
- Cash flow pe săptămâni
- Sfaturi personalizate la finalul jocului
- Export PDF/CSV

### Alte Features
- **Tutorial interactiv** de 4 săptămâni
- **Finance Tracker** personal (tranzacții, bugete, economii)
- **Clasament online** cu suport offline (localStorage fallback)
- **Autentificare Google OAuth** prin Supabase
- **Panou Admin** — gestionare utilizatori, banări, clasament
- **Sistem de teme** — 8 presetări + culoare personalizată
- **Design responsive** — funcționează pe mobil, tabletă, desktop
- **PWA** — instalabil pe telefon, funcționează offline
- **Animații** framer-motion peste tot

---

## 🛠️ Tech Stack

| Categorie | Tehnologie |
|-----------|------------|
| **Frontend** | React 19, TypeScript 5.9, Vite 7 |
| **Routing** | wouter |
| **Stilizare** | Tailwind CSS 4, Radix UI, framer-motion |
| **Autentificare** | Supabase Auth (Google OAuth) |
| **Bază de date** | Supabase PostgreSQL (REST API) |
| **AI** | Google Gemini API (Edge Function) |
| **Testare** | Vitest + React Testing Library |
| **Deploy** | Render |
| **CI/CD** | GitHub Actions |

---

## 📦 Instalare

```bash
# Clonează proiectul
git clone https://github.com/anomalyco/C.O.S.T.-main.git
cd C.O.S.T.-main

# Instalează dependențele
npm install

# Creează fișierul .env
cp .env.example .env

# Completează variabilele de mediu în .env:
# - VITE_SUPABASE_URL
# - VITE_SUPABASE_ANON_KEY
# - VITE_EMAILJS_*

# Pornește în development
npm run dev
```

### Configurare Supabase

1. Creează un proiect pe [supabase.com](https://supabase.com)
2. Activează Google OAuth în Authentication → Providers
3. Rulează SQL-ul pentru tabele:

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  picture TEXT,
  is_admin BOOLEAN DEFAULT false,
  is_banned BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE leaderboard (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  score INTEGER NOT NULL,
  months INTEGER DEFAULT 12,
  scenario TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### Configurare AI Mentor (Gemini API)

1. Mergi pe [aistudio.google.com/apikey](https://aistudio.google.com/apikey) și generează o cheie
2. Adaugă cheia în Secret-ul Edge Function-ului pe Supabase:
   ```bash
   supabase secrets set GEMINI_API_KEY=cheia_ta
   ```

---

## 📜 Scripts Disponibile

| Comandă | Descriere |
|---------|-----------|
| `npm run dev` | Pornește serverul de development |
| `npm run build` | Build pentru producție |
| `npm run preview` | Previzualizează build-ul |
| `npm test` | Rulează testele o dată |
| `npm run test:watch` | Rulează testele în mod watch |
| `npm run test:coverage` | Rulează testele cu raport de coverage |

---

## 🏗️ Arhitectură

```
src/
├── components/        # Componente reutilizabile
│   ├── ui/           # ~70+ componente Radix UI (Shadcn)
│   ├── Layout.tsx    # App shell cu header, nav, footer
│   ├── EventModal.tsx # Modal evenimente în joc
│   ├── EventModal.tsx # Evenimente generale
│   ├── GameOver.tsx  # Ecran final joc
│   ├── MentorChat.tsx # Chat AI Mentor
│   └── GoogleAuthButton.tsx # Login Google
├── context/          # State management
│   ├── AuthContext.tsx   # Autentificare + sesiune
│   ├── GameContext.tsx   # Logica centrală a jocului
│   ├── FinanceContext.tsx # Tracker financiar
│   ├── XPContext.tsx     # XP, level, deblocări
│   └── ThemeContext.tsx  # Teme și personalizare
├── data/             # Conținutul jocului
│   ├── scenarios.ts     # 17 scenarii cu config
│   ├── events.ts        # ~200+ evenimente
│   └── achievements.ts # Realizări
├── lib/              # Servicii și utilități
│   ├── supabase.ts     # Auth + REST API client
│   └── leaderboard.ts  # Clasament online/local
├── hooks/            # Hook-uri personalizate
├── pages/            # Paginile aplicației
│   ├── Home.tsx       # Landing page
│   ├── Game.tsx       # Jocul propriu-zis
│   ├── Finance.tsx    # Tracker financiar
│   ├── Leaderboard.tsx # Clasament
│   ├── Tutorial.tsx   # Tutorial interactiv
│   ├── Admin.tsx      # Panou administrare
│   ├── Premium.tsx    # Pagină premium
│   └── Contact.tsx    # Formular contact
├── types/            # Tipuri TypeScript centralizate
└── __tests__/        # Teste automate
```

---

## 📝 Licență

MIT

---

## 👥 Echipa

Proiect realizat pentru [numele competiției] — Educație Financiară prin Gamificare.
