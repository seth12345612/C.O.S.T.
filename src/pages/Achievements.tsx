import { useMemo } from "react";
import { motion } from "framer-motion";
import { OrbBackground } from "@/components/OrbBackground";
import { Layout } from "@/components/Layout";
import { useAchievements } from "@/context/AchievementContext";
import { ACHIEVEMENTS } from "@/data/achievements";
import { Lock, Sparkles, Trophy } from "lucide-react";
import { useTranslation } from "@/context/TranslationContext";

const categorieIcone: Record<string, string> = {
  joc: "🎮",
  social: "👥",
  progresie: "📈",
  ascuns: "🤫",
};

const categorieLabel: Record<string, string> = {
  joc: "Joc",
  social: "Social",
  progresie: "Progresie",
  ascuns: "Ascunse",
};

function useCategorieLabel() {
  const { t } = useTranslation();
  return {
    joc: t("Joc"),
    social: t("Social"),
    progresie: t("Progresie"),
    ascuns: t("Ascunse"),
  };
}

export default function Achievements() {
  const { t } = useTranslation();
  const { deblocate, stats } = useAchievements();

  const grouped = useMemo(() => {
    const groups: Record<string, typeof ACHIEVEMENTS> = {};
    for (const a of ACHIEVEMENTS) {
      if (!groups[a.categorie]) groups[a.categorie] = [];
      groups[a.categorie].push(a);
    }
    return groups;
  }, []);

  const procentaj = Math.round((deblocate.length / ACHIEVEMENTS.length) * 100);

  return (
    <Layout>
      <OrbBackground />
      <div className="relative z-10 max-w-4xl mx-auto px-4 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-300 text-xs mb-4">
            <Sparkles size={12} /> {t("Realizări")}
          </div>
          <h1 className="text-3xl font-bold text-main mb-2">{t("Achievements")}</h1>
          <p className="text-dim">{deblocate.length} / {ACHIEVEMENTS.length} {t("deblocate")}</p>
          <div className="max-w-md mx-auto mt-4">
            <div className="h-2 bg-card-hover rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${procentaj}%` }}
                className="h-full rounded-full bg-gradient-to-r from-yellow-500 to-amber-500"
              />
            </div>
          </div>
        </motion.div>

        {Object.entries(grouped).map(([cat, items], gi) => (
          <motion.section
            key={cat}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: gi * 0.1 }}
            className="mb-8"
          >
            <h2 className="text-xl font-bold text-main mb-4 flex items-center gap-2">
              <span>{categorieIcone[cat]}</span>
              <span>{useCategorieLabel()[cat]}</span>
              <span className="text-sm font-normal text-faint">
                ({items.filter((a) => deblocate.includes(a.id)).length}/{items.length})
              </span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {items.map((a, i) => {
                const deblocat = deblocate.includes(a.id);
                return (
                  <motion.div
                    key={a.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: gi * 0.1 + i * 0.03 }}
                    className={`relative rounded-xl p-4 border transition-all ${
                      deblocat
                        ? "bg-gradient-to-br from-yellow-500/10 to-amber-500/5 border-yellow-500/30"
                        : "bg-card border-subtle opacity-60"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className={`text-2xl ${!deblocat ? "grayscale" : ""}`}>{a.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className={`font-semibold text-sm ${deblocat ? "text-main" : "text-muted"}`}>
                            {t(a.titlu)}
                          </p>
                          {deblocat && <Trophy size={12} className="text-yellow-400 shrink-0" />}
                          {!deblocat && <Lock size={10} className="text-faint shrink-0" />}
                        </div>
                        {a.categorie !== "ascuns" && (
                          <p className="text-xs text-subtle mt-0.5">{t(a.descriere)}</p>
                        )}
                        {deblocat && (
                          <span className="text-xs text-yellow-400/70 mt-1 inline-block">+{a.xpReward} XP</span>
                        )}
                        {!deblocat && a.categorie === "ascuns" && (
                          <span className="text-xs text-faintest mt-1 inline-block">???</span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.section>
        ))}
      </div>
    </Layout>
  );
}
