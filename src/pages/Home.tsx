import { Link, useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { Clock, Star, Lock, Zap, TrendingUp, Users, Gamepad2, Crown, X, Calendar, Brain, BarChart3 } from 'lucide-react';
import { OrbBackground } from '@/components/OrbBackground';
import { Layout } from '@/components/Layout';
import { useXP } from '@/context/XPContext';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from '@/context/TranslationContext';
import { SCENARII } from '@/data/scenarios';
import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { OnboardingModal, isTutorialCompleted } from '@/components/OnboardingModal';
import { GlossaryModal } from '@/components/GlossaryModal';

const fadeUp = { hidden: { opacity: 0, y: 24 }, visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.45 } }) };

function isInSeason(seasonTag: string | undefined): boolean {
  if (!seasonTag) return true;
  const month = new Date().getMonth();
  if (seasonTag === 'iarna') return month === 11 || month === 0 || month === 1;
  if (seasonTag === 'vara') return month === 5 || month === 6 || month === 7;
  return true;
}

function getSeasonName(seasonTag: string | undefined): string {
  if (!seasonTag) return '';
  if (seasonTag === 'iarna') return 'iarnă';
  if (seasonTag === 'vara') return 'vară';
  return seasonTag;
}

function PremiumModal({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-overlay-strong backdrop-blur-sm" />
      <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
        className="relative w-full max-w-md p-6 rounded-3xl border border-purple-500/30 bg-gradient-to-br from-purple-900/90 to-fuchsia-900/90 backdrop-blur-xl" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full bg-card-hover hover:bg-card-strong transition-colors"><X size={18} className="text-main" /></button>
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500"><Crown size={32} className="text-main" /></div>
          <h2 className="text-2xl font-black text-main mb-2">{t('Dorești Premium?')}</h2>
          <p className="text-strong mb-6">{t('Deblochează toate scenariile sezoniere și caracteristici exclusive!')}</p>
          <div className="space-y-3 mb-6">
            {[
              t('✨ Toate scenariile sezoniere (iarna, vara)'),
              t('🎯 Acces nelimitat la evenimente'),
              t('💬 Chat cu mentorul'),
              t('🔓 Toate scenariile premium'),
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-3 text-bright text-sm"><span className="text-purple-300">✓</span>{feature}</div>
            ))}
          </div>
          <Link href="/premium" className="block w-full py-3 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 text-main font-bold transition-all hover:shadow-lg hover:shadow-yellow-500/30">{t('Vezi Varianta Premium')}</Link>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function Home() {
  const { t } = useTranslation();
  const { xpState, isUnlocked, xpRequiredFor } = useXP();
  const { isPremium, premiumTrialEndsAt, user } = useAuth();
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [, navigate] = useLocation();
  const isPremiumActive = isPremium && premiumTrialEndsAt && premiumTrialEndsAt > Date.now();
  const [showOnboarding, setShowOnboarding] = useState(() => user ? !isTutorialCompleted() : false);
  const [showGlossary, setShowGlossary] = useState(false);

  const scenariiList = Object.values(SCENARII);
  const freeScenarii = scenariiList.filter((sc) => !sc.isPremium).sort((a, b) => a.xpRequired - b.xpRequired);
  const premiumScenarii = scenariiList.filter((sc) => sc.isPremium).sort((a, b) => a.xpRequired - b.xpRequired);

  return (
    <Layout>
      <OrbBackground />
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-16">
        <motion.section className="text-center pt-8 pb-4" initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
          <motion.div variants={fadeUp} custom={0} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-sm font-medium mb-6">
            <Zap size={14} />{t('Joc de Educație Financiară')}
          </motion.div>
          <motion.h1 variants={fadeUp} custom={1} className="text-5xl sm:text-6xl md:text-7xl font-black leading-tight mb-4">
            <span className="bg-gradient-to-r from-purple-400 via-fuchsia-300 to-orange-400 bg-clip-text text-transparent">C.O.S.T.</span>
          </motion.h1>
          <motion.p variants={fadeUp} custom={2} className="text-lg sm:text-xl text-muted max-w-2xl mx-auto mb-2 font-medium">College Operating &amp; Survival Tactics</motion.p>
          <motion.p variants={fadeUp} custom={3} className="text-subtle max-w-xl mx-auto mb-10 text-sm">{t('Simulează viața financiară a unui student, ia decizii inteligente și deblochează noi scenarii prin XP.')}</motion.p>
          <motion.div variants={fadeUp} custom={4} className="flex flex-wrap gap-3 justify-center">
            <Link href="/game" className="px-8 py-3 bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-main rounded-2xl font-bold text-lg transition-all shadow-lg shadow-purple-900/30 hover:shadow-purple-900/50 hover:-translate-y-0.5 active:translate-y-0">{t('Joacă acum')}</Link>
            <Link href="/tutorial" className="px-8 py-3 border border-blue-400/40 hover:border-blue-400 bg-blue-500/10 text-blue-300 hover:text-blue-200 rounded-2xl font-bold text-lg transition-all hover:bg-blue-500/20">{t('Tutorial')}</Link>
            <Link href="/finance" className="px-8 py-3 border border-strong hover:border-strongest text-bright hover:text-main rounded-2xl font-bold text-lg transition-all hover:bg-card">{t('Finanțele mele')}</Link>
            <button onClick={() => setShowGlossary(true)} className="px-8 py-3 border border-purple-500/40 hover:border-purple-500 bg-purple-500/10 text-purple-300 hover:text-purple-200 rounded-2xl font-bold text-lg transition-all hover:bg-purple-500/20">{t('Vocabular')}</button>
            <Link href="/mini-game/quiz" className="px-5 py-3 border border-fuchsia-500/40 hover:border-fuchsia-500 bg-fuchsia-500/10 text-fuchsia-300 hover:text-fuchsia-200 rounded-2xl font-bold text-sm transition-all hover:bg-fuchsia-500/20 flex items-center gap-2"><Brain size={16} />{t('Quiz')}</Link>
            <Link href="/mini-game/bursa" className="px-5 py-3 border border-emerald-500/40 hover:border-emerald-500 bg-emerald-500/10 text-emerald-300 hover:text-emerald-200 rounded-2xl font-bold text-sm transition-all hover:bg-emerald-500/20 flex items-center gap-2"><BarChart3 size={16} />{t('Bursa')}</Link>
          </motion.div>
        </motion.section>



        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="grid grid-cols-3 gap-3">
          {[
            { labelKey: 'XP Total', value: xpState.xp.toString(), icon: Star, color: 'text-yellow-400' },
            { labelKey: 'Nivel', value: xpState.level.toString(), icon: TrendingUp, color: 'text-purple-400' },
            { labelKey: 'Scenarii deblocate', value: xpState.scenariiDeblocate.filter(id => !SCENARII[id]?.isPremium).length + '/' + freeScenarii.length, icon: Users, color: 'text-orange-400' },
          ].map((stat) => (
            <div key={stat.labelKey} className="p-4 rounded-2xl border border-subtle bg-card text-center">
              <stat.icon size={20} className={stat.color + ' mx-auto mb-2'} />
              <div className="text-2xl font-black text-main">{stat.value}</div>
              <div className="text-xs text-subtle mt-0.5">{t(stat.labelKey)}</div>
            </div>
          ))}
        </motion.div>

        <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
          <div className="flex items-center gap-2 mb-6"><Gamepad2 size={18} className="text-green-400" /><h2 className="text-xl font-bold text-main">{t('Scenarii Gratuite')}</h2><span className="ml-2 text-xs text-subtle">{t('Ordonate după XP necesar')}</span></div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {freeScenarii.map((sc, i) => {
              const unlocked = isUnlocked(sc.id);
              const xpNeeded = xpRequiredFor(sc.id);
              const inSeason = isInSeason(sc.seasonTag);
              return (
                <motion.div key={sc.id} custom={i} variants={fadeUp} initial="hidden" animate="visible"
                  whileHover={unlocked && inSeason ? { scale: 1.03, y: -4 } : {}}
                  onClick={() => { if (unlocked && inSeason) navigate('/game?scenario=' + sc.id); }}
                  className={'relative rounded-2xl border overflow-hidden transition-all ' + (unlocked && inSeason ? 'border-medium bg-card cursor-pointer hover:border-stronger' : 'border-subtle8 bg-card-soft cursor-not-allowed') + (!inSeason ? ' opacity-50' : '')}>
                  <div className={'absolute inset-0 ' + sc.bgClass + ' opacity-40'} />
                  <div className="relative p-4">
                    <div className="flex items-start justify-between mb-3"><span className="text-3xl">{sc.emoji}</span>
                      <div className="flex flex-col items-end gap-1">{sc.seasonal && <span className="text-xs px-2 py-0.5 rounded-full border border-orange-500/40 text-orange-300 bg-orange-500/10 flex items-center gap-1"><Calendar size={10} />{t('Sezonier')}</span>}</div>
                    </div>
                    <h3 className="font-bold text-main text-sm mb-1">{t(sc.nume)}</h3>
                     <p className="text-xs text-dim line-clamp-2 mb-3">{t(sc.descriere)}</p>
                     <div className="flex items-center gap-2 flex-wrap">
                       <span className="text-xs text-subtle">{sc.cheltuieliFixe.length} {t('cheltuieli fixe')}</span>
                      <span className="text-xs text-subtle">·</span>
                      <span className="text-xs text-subtle">{sc.subScenarii.length} {t('sub-scenarii')}</span>
                      {!unlocked && <><span className="text-xs text-subtle">·</span><span className="text-xs text-yellow-400 flex items-center gap-1"><Lock size={10} />{xpNeeded} XP</span></>}
                    </div>
                    {!inSeason && <div className="mt-2 text-xs text-orange-300 flex items-center gap-1"><Clock size={10} />{t('Revine în sezonul')} {t(getSeasonName(sc.seasonTag))}</div>}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}>
          <div className="flex items-center gap-2 mb-6"><Crown size={18} className="text-yellow-400" /><h2 className="text-xl font-bold text-main">{t('Scenarii Premium')}</h2><span className="ml-2 text-xs text-subtle">{t('Necesită abonament PRO')}</span></div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {premiumScenarii.map((sc, i) => {
              const unlocked = isUnlocked(sc.id);
              const inSeason = isInSeason(sc.seasonTag);
              const isPremiumLocked = !unlocked && !isPremiumActive;
              return (
                <motion.div key={sc.id} custom={i} variants={fadeUp} initial="hidden" animate="visible"
                  whileHover={unlocked || isPremiumActive ? { scale: 1.03, y: -4 } : {}}
                  onClick={() => { if (isPremiumLocked) setShowPremiumModal(true); else if (unlocked || isPremiumActive) navigate('/game?scenario=' + sc.id); }}
                  className={'relative rounded-2xl border overflow-hidden transition-all ' + (unlocked || isPremiumActive ? 'border-yellow-500/30 bg-yellow-500/5 cursor-pointer hover:border-yellow-500/50' : 'border-yellow-500/20 bg-yellow-500/5 cursor-pointer hover:border-yellow-500/40') + (!inSeason ? ' opacity-50' : '')}>
                  <div className={'absolute inset-0 ' + sc.bgClass + ' opacity-40'} />
                  <div className="relative p-4">
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-3xl">{sc.emoji}</span>
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-xs px-2 py-0.5 rounded-full border border-yellow-500/40 text-yellow-300 bg-yellow-500/10 flex items-center gap-1"><Crown size={10} />{t('PRO')}</span>
                        {sc.seasonal && <span className="text-xs px-2 py-0.5 rounded-full border border-orange-500/40 text-orange-300 bg-orange-500/10 flex items-center gap-1"><Calendar size={10} />{t('Sezonier')}</span>}
                      </div>
                    </div>
                    <h3 className="font-bold text-main text-sm mb-1">{t(sc.nume)}</h3>
                     <p className="text-xs text-dim line-clamp-2 mb-3">{t(sc.descriere)}</p>
                     <div className="flex items-center gap-2 flex-wrap">
                       <span className="text-xs text-yellow-300/60">{sc.cheltuieliFixe.length} {t('cheltuieli fixe')}</span>
                      <span className="text-xs text-yellow-300/60">·</span>
                      <span className="text-xs text-yellow-300/60">{sc.subScenarii.length} {t('sub-scenarii')}</span>
                      {isPremiumLocked && <><span className="text-xs text-yellow-300/60">·</span><span className="text-xs text-yellow-400 flex items-center gap-1"><Lock size={10} />{t('PRO')}</span></>}
                    </div>
                    {!inSeason && <div className="mt-2 text-xs text-orange-300 flex items-center gap-1"><Clock size={10} />{t('Revine în sezonul')} {t(getSeasonName(sc.seasonTag))}</div>}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="grid sm:grid-cols-3 gap-4">
          {[
            { emoji: '🎯', titleKey: 'Alege scenariul', descKey: 'Student la cămin, chiriaș, navetist sau cu job full-time — tu decizi.' },
            { emoji: '🧠', titleKey: 'Ia decizii financiare', descKey: 'Fiecare săptămână aduce evenimente reale. Alegerile tale contează.' },
            { emoji: '📈', titleKey: 'Câștigă XP și deblochează', descKey: 'Cu fiecare joc câștigat, primești XP și deblochezi scenarii noi.' },
          ].map((step) => (
            <div key={step.titleKey} className="p-5 rounded-2xl border border-subtle bg-card text-center">
              <div className="text-3xl mb-3">{step.emoji}</div>
              <h3 className="font-bold text-main mb-1 text-sm">{t(step.titleKey)}</h3>
              <p className="text-xs text-dim">{t(step.descKey)}</p>
            </div>
          ))}
        </motion.section>

        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }}>
          <div className="relative overflow-hidden rounded-3xl border border-yellow-500/30 bg-gradient-to-r from-purple-900/80 to-fuchsia-900/80">
            <div className="absolute inset-0 opacity-20" style={{ background: 'radial-gradient(circle at 30% 50%, rgba(234, 179, 8, 0.3) 0%, transparent 50%), radial-gradient(circle at 70% 50%, rgba(217, 70, 239, 0.3) 0%, transparent 50%)' }} />
            <div className="relative p-6 md:p-8">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="shrink-0"><div className="w-20 h-20 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg shadow-yellow-500/30"><Crown size={40} className="text-main" /></div></div>
                <div className="flex-1 text-center md:text-left">
                  <h2 className="text-2xl md:text-3xl font-black text-main mb-2">{t('🌟 Varianta Premium')}</h2>
                  <p className="text-strong mb-4 max-w-xl">{t('Deblochează toate scenariile sezoniere, evenimente exclusive și chat cu mentorul!')}</p>
                  <div className="flex flex-wrap justify-center md:justify-start gap-3 mb-4">
                    {[
                      t('Mai multe evenimente'),
                      t('Chat cu mentorul'),
                      t('Scenarii sezoniere oricând'),
                    ].map((feature) => (<span key={feature} className="px-3 py-1 rounded-full bg-card-hover text-bright text-xs border border-strong">{feature}</span>))}
                  </div>
                  <Link href="/premium" className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 text-main font-bold transition-all hover:shadow-lg hover:shadow-yellow-500/30 hover:-translate-y-0.5"><Crown size={16} />{t('Vrei Premium?')}</Link>
                </div>
              </div>
            </div>
          </div>
        </motion.section>
      </div>
      <AnimatePresence>{showPremiumModal && <PremiumModal onClose={() => setShowPremiumModal(false)} />}</AnimatePresence>
      <AnimatePresence>{showOnboarding && <OnboardingModal open={showOnboarding} onClose={() => setShowOnboarding(false)} />}</AnimatePresence>
      <GlossaryModal open={showGlossary} onClose={() => setShowGlossary(false)} />
    </Layout>
  );
}
