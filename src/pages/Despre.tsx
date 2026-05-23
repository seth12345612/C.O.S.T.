import { motion } from "framer-motion";
import { OrbBackground } from "@/components/OrbBackground";
import { Layout } from "@/components/Layout";
import { GraduationCap, Target, Users, Award, Lightbulb, TrendingUp, Shield, Sparkles } from "lucide-react";

const valori = [
  { icon: GraduationCap, titlu: "Educație Financiară", descriere: "Învățăm studenții să își gestioneze banii într-un mod interactiv și distractiv." },
  { icon: Target, titlu: "Gamificare", descriere: "Transformăm educația financiară într-un joc captivant cu provocări și recompense." },
  { icon: Users, titlu: "Accesibil pentru Toți", descriere: "Platforma este gratuită și accesibilă oricărui student din România." },
  { icon: Award, titlu: "Competiție sănătoasă", descriere: "Clasamente și achievements care motivează învățarea continuă." },
];

const tehnologii = [
  { nume: "React 19", rol: "Framework frontend" },
  { nume: "TypeScript", rol: "Tipizare sigură" },
  { nume: "Vite 7", rol: "Build rapid" },
  { nume: "Supabase", rol: "Backend & Auth" },
  { nume: "Tailwind CSS 4", rol: "Stilizare" },
  { nume: "Gemini AI", rol: "Mentor inteligent" },
  { nume: "Radix UI", rol: "Componente accesibile" },
  { nume: "Framer Motion", rol: "Animații" },
];

export default function Despre() {
  return (
    <Layout>
      <OrbBackground />
      <div className="relative z-10 max-w-4xl mx-auto px-4 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs mb-4">
            <Sparkles size={12} /> Despre Proiect
          </div>
          <h1 className="text-4xl font-bold text-main mb-4">C.O.S.T.</h1>
          <p className="text-xl text-muted max-w-2xl mx-auto">
            <strong className="text-main">C</strong>ollege <strong className="text-main">O</strong>perating &{" "}
            <strong className="text-main">S</strong>urvival <strong className="text-main">T</strong>actics
          </p>
          <p className="text-dim mt-4">
            O aplicație interactivă de educație financiară pentru studenți, dezvoltată în România.
          </p>
        </motion.div>

        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-12">
          <h2 className="text-2xl font-bold text-main mb-6 flex items-center gap-2"><Lightbulb size={24} className="text-yellow-400" /> Povestea</h2>
          <div className="bg-card border border-subtle rounded-2xl p-6 space-y-4 text-strong leading-relaxed">
            <p>C.O.S.T. s-a născut din nevoia de a pregăti studenții pentru viața financiară reală. De la gestionarea primului buget de student până la decizii financiare complexe, aplicația simulează provocările cu care tinerii se confruntă în viața de zi cu zi.</p>
            <p>Fiecare scenariu este construit pe baza unor situații reale: chiria, utilitățile, transportul, mâncarea, evenimente neprevăzute. Jucătorii învață prin practică, nu prin teorie.</p>
            <p>Am folosit cele mai moderne tehnologii web pentru a crea o experiență imersivă, accesibilă de pe orice dispozitiv.</p>
          </div>
        </motion.section>

        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-12">
          <h2 className="text-2xl font-bold text-main mb-6 flex items-center gap-2"><Target size={24} className="text-purple-400" /> Valori</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {valori.map((v, i) => (
              <motion.div key={v.titlu} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.1 }} className="bg-card border border-subtle rounded-xl p-5 hover:bg-card-hover transition-colors">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-purple-500/10 shrink-0"><v.icon size={20} className="text-purple-400" /></div>
                  <div><h3 className="text-main font-semibold mb-1">{v.titlu}</h3><p className="text-dim text-sm">{v.descriere}</p></div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mb-12">
          <h2 className="text-2xl font-bold text-main mb-6 flex items-center gap-2"><TrendingUp size={24} className="text-green-400" /> Tehnologii</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {tehnologii.map((t, i) => (
              <motion.div key={t.nume} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 + i * 0.05 }} className="bg-card border border-subtle rounded-xl p-4 text-center hover:bg-card-hover transition-colors">
                <p className="text-main font-semibold text-sm">{t.nume}</p>
                <p className="text-subtle text-xs mt-1">{t.rol}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <h2 className="text-2xl font-bold text-main mb-6 flex items-center gap-2"><Shield size={24} className="text-blue-400" /> Sustenabilitate</h2>
          <div className="bg-card border border-subtle rounded-2xl p-6 text-strong space-y-3">
            <p>C.O.S.T. este un proiect open-source (licență MIT). Oricine poate contribui, poate sugera îmbunătățiri sau poate folosi codul pentru propriile proiecte educaționale.</p>
            <p>Folosim servicii gratuite (Supabase free tier, Gemini API free tier, Render free tier) pentru a menține proiectul accesibil fără costuri de operare.</p>
          </div>
        </motion.section>
      </div>
    </Layout>
  );
}
