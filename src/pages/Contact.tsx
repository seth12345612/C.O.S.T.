import { useState } from 'react';
import { send } from '@emailjs/browser';
import { motion, AnimatePresence } from 'framer-motion';
import { OrbBackground } from '@/components/OrbBackground';
import { Layout } from '@/components/Layout';
import { useTranslation } from '@/context/TranslationContext';
import { ChevronDown, Send, Lightbulb, Bug, Handshake, HelpCircle, CheckCircle } from 'lucide-react';

type MainCategory = 'sugestie' | 'problema' | 'colaborare' | 'altele';
type SubCategory = string;

const CATEGORIES: Record<MainCategory, { label: string; icon: React.ElementType; color: string; subcategories: SubCategory[] }> = {
  sugestie: { label: 'Sugestie', icon: Lightbulb, color: 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10', subcategories: ['Scenariu nou', 'Eveniment nou', 'Funcționalitate nouă', 'Îmbunătățire design', 'Altă sugestie'] },
  problema: { label: 'Problemă', icon: Bug, color: 'text-red-400 border-red-500/30 bg-red-500/10', subcategories: ['Problemă site (bug)', 'Problemă de conexiune', 'Problemă de afișare pe ecran', 'Problemă la login / cont', 'Scor nesalvat', 'Altă problemă tehnică'] },
  colaborare: { label: 'Colaborare', icon: Handshake, color: 'text-blue-400 border-blue-500/30 bg-blue-500/10', subcategories: ['Parteneriat educațional', 'Contribuție conținut', 'Sponsorizare', 'Media / Presă', 'Altă colaborare'] },
  altele: { label: 'Altele', icon: HelpCircle, color: 'text-muted border-strong bg-card', subcategories: ['Întrebare generală', 'Feedback general', 'Altceva'] },
};

const FAQ = [
  { q: 'Cum funcționează sistemul de XP?', a: 'Câștigați XP la finalul fiecărui joc. Cu cât supraviețuiți mai multe săptămâni, cu atât câștigați mai mult XP. XP-ul deblocheaza scenarii noi.' },
  { q: 'Progresul meu se salvează?', a: 'XP-ul și finanțele personale se salvează local în browserul tău. Nu este necesar un cont pentru a juca.' },
  { q: 'Pot juca pe telefon?', a: 'Da! Jocul este optimizat pentru telefoane, tablete și desktop-uri.' },
  { q: 'Cum deblochez scenarii noi?', a: 'Acumulează XP jucând scenarii existente. Fiecare scenariu are un prag minim de XP necesar pentru deblocare.' },
];

export default function Contact() {
  const { t } = useTranslation();
  const [mainCat, setMainCat] = useState<MainCategory | null>(null);
  const [subCat, setSubCat] = useState<SubCategory | null>(null);
  const [formData, setFormData] = useState({ nume: '', email: '', mesaj: '' });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!mainCat || !subCat) return;
    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID || "service_cll8fqr";
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || "template_k70b7il";
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || "K1DO0d7ijOFwe3znB";
    if (!serviceId || !templateId || !publicKey) { setError(t('Lipsesc setările EmailJS.')); return; }
    setSending(true); setError(null);
    try {
      await send(serviceId, templateId, { from_name: formData.nume, reply_to: formData.email, from_email: formData.email, message: formData.mesaj, categorie: CATEGORIES[mainCat].label, subcategorie: subCat, to_email: 'alexandruaoglagioaie@gmail.com' }, publicKey);
      setSent(true);
    } catch (error) {
      const details = (error as any)?.text || (error as any)?.statusText || JSON.stringify(error);
      console.error('EmailJS error:', error);
      setError(t('A apărut o problemă la trimiterea mesajului.') + ' ' + details);
    } finally { setSending(false); }
  }

  return (
    <Layout>
      <OrbBackground />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-main mb-2">{t('Contact & Suport')}</h1>
          <p className="text-dim text-sm">{t('Ai o întrebare, o problemă sau o idee? Trimite-ne un mesaj.')}</p>
        </div>
        <div className="grid lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3">
            <div className="p-5 rounded-2xl border border-subtle bg-card">
              {sent ? (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-12">
                  <CheckCircle size={48} className="text-green-400 mx-auto mb-4" />
                  <h3 className="text-xl font-black text-main mb-2">{t('Mesaj trimis!')}</h3>
                  <p className="text-dim text-sm mb-4">{t('Îți mulțumim. Vom răspunde cât mai curând posibil.')}</p>
                  <button onClick={() => { setSent(false); setMainCat(null); setSubCat(null); setFormData({ nume: '', email: '', mesaj: '' }); }} className="px-5 py-2 rounded-xl border border-strong text-strong hover:text-main hover:border-strongest text-sm font-semibold transition-all">{t('Trimite alt mesaj')}</button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-100">{error}</div>}
                  <div>
                    <label className="text-xs font-bold text-dim uppercase tracking-wider block mb-2">{t('Categorie *')}</label>
                    <div className="grid grid-cols-2 gap-2">
                      {(Object.entries(CATEGORIES) as [MainCategory, typeof CATEGORIES[MainCategory]][]).map(([key, cat]) => (
                        <button key={key} type="button" onClick={() => { setMainCat(key); setSubCat(null); }}
                          className={'p-3 rounded-xl border text-left transition-all ' + (mainCat === key ? cat.color : 'border-subtle bg-card hover:border-strong')}>
                          <div className="flex items-center gap-2">
                            <cat.icon size={14} className={mainCat === key ? '' : 'text-subtle'} />
                            <span className={'text-sm font-semibold ' + (mainCat === key ? '' : 'text-muted')}>{t(cat.label)}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                  <AnimatePresence>
                    {mainCat && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                        <label className="text-xs font-bold text-dim uppercase tracking-wider block mb-2">{t('Sub-categorie *')}</label>
                        <div className="flex flex-wrap gap-2">
                          {CATEGORIES[mainCat].subcategories.map((sub) => (
                            <button key={sub} type="button" onClick={() => setSubCat(sub)}
                              className={'px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ' + (subCat === sub ? 'border-purple-500/60 bg-purple-600/20 text-purple-300' : 'border-subtle bg-card text-dim hover:text-main hover:border-strong')}>
                              {t(sub)}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-dim block mb-1.5">{t('Numele tău *')}</label>
                      <input type="text" required value={formData.nume} onChange={(e) => setFormData((p) => ({ ...p, nume: e.target.value }))} placeholder={t('Ion Popescu')} className="w-full px-3 py-2.5 rounded-xl border border-medium bg-card text-main placeholder:text-fainter text-sm focus:outline-none focus:border-purple-500/50 focus:bg-card-soft8 transition-all" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-dim block mb-1.5">{t('Email *')}</label>
                      <input type="email" required value={formData.email} onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))} placeholder={t('exemplu@email.com')} className="w-full px-3 py-2.5 rounded-xl border border-medium bg-card text-main placeholder:text-fainter text-sm focus:outline-none focus:border-purple-500/50 focus:bg-card-soft8 transition-all" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-dim block mb-1.5">{t('Mesajul tău *')}</label>
                    <textarea required rows={5} value={formData.mesaj} onChange={(e) => setFormData((p) => ({ ...p, mesaj: e.target.value }))} placeholder={t('Descrie în detaliu...')} className="w-full px-3 py-2.5 rounded-xl border border-medium bg-card text-main placeholder:text-fainter text-sm focus:outline-none focus:border-purple-500/50 focus:bg-card-soft8 transition-all resize-none" />
                  </div>
                  <button type="submit" disabled={!mainCat || !subCat || sending}
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 disabled:opacity-40 disabled:cursor-not-allowed text-main font-bold transition-all flex items-center justify-center gap-2">
                    {sending ? <div className="w-5 h-5 border-2 border-stronger border-t-white rounded-full animate-spin" /> : <><Send size={16} />{t('Trimite mesajul')}</>}
                  </button>
                </form>
              )}
            </div>
          </div>
          <div className="lg:col-span-2 space-y-4">
            <div className="p-4 rounded-2xl border border-subtle bg-card">
              <h3 className="text-sm font-bold text-main mb-1">{t('Contact direct')}</h3>
              <p className="text-xs text-dim mb-3">{t('Preferi să ne scrii direct?')}</p>
              <a href="mailto:alexandruaoglagioaie@gmail.com" className="text-sm font-semibold text-purple-400 hover:text-purple-300 transition-colors">alexandruaoglagioaie@gmail.com</a>
            </div>
            <div className="p-4 rounded-2xl border border-subtle bg-card">
              <h3 className="text-sm font-bold text-main mb-3">{t('Întrebări frecvente')}</h3>
              <div className="space-y-2">
                {FAQ.map((faq, i) => (
                  <div key={i} className="border border-subtle8 rounded-xl overflow-hidden">
                    <button onClick={() => setExpandedFaq(expandedFaq === i ? null : i)} className="w-full flex items-center justify-between p-3 text-left hover:bg-card transition-colors">
                      <span className="text-xs font-semibold text-bright pr-2">{t(faq.q)}</span>
                      <ChevronDown size={14} className={'text-subtle shrink-0 transition-transform ' + (expandedFaq === i ? 'rotate-180' : '')} />
                    </button>
                    <AnimatePresence>
                      {expandedFaq === i && (
                        <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                          <div className="px-3 pb-3 text-xs text-dim leading-relaxed border-t border-subtle8 pt-2">{t(faq.a)}</div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
