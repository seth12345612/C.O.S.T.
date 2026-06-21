import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Layout } from "@/components/Layout";
import { OrbBackground } from "@/components/OrbBackground";
import { useAuth } from "@/context/AuthContext";
import { UserCircle, Save, School, Heart, Smartphone, MapPin, Hash } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "@/context/TranslationContext";

const PROFILE_KEY = "cost_profile_custom";

interface ProfileCustom {
  facultate: string;
  hobby: string;
  telefon: string;
  oras: string;
  an: string;
}

function loadProfile(): ProfileCustom {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { facultate: "", hobby: "", telefon: "", oras: "", an: "" };
}

function saveProfile(p: ProfileCustom) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(p));
}

const FIELDS: { key: keyof ProfileCustom; label: string; icon: typeof School; placeholder: string }[] = [
  { key: "facultate", label: "Facultate", icon: School, placeholder: "ex. Facultatea de Automatică" },
  { key: "an", label: "An universitar", icon: Hash, placeholder: "ex. Anul II" },
  { key: "oras", label: "Oraș", icon: MapPin, placeholder: "ex. București" },
  { key: "hobby", label: "Hobby-uri", icon: Heart, placeholder: "ex. sport, muzică" },
  { key: "telefon", label: "Telefon", icon: Smartphone, placeholder: "ex. 07xx xxx xxx" },
];

export default function ProfilePage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileCustom>(loadProfile);
  const [saved, setSaved] = useState(false);

  useEffect(() => { setProfile(loadProfile()); }, []);

  const handleSave = () => {
    saveProfile(profile);
    setSaved(true);
    toast.success(t("Profil salvat!"));
    setTimeout(() => setSaved(false), 2000);
  };

  const greeting = user?.name?.split(" ")[0] || t("Student");

  return (
    <Layout>
      <OrbBackground />
      <div className="max-w-lg mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Header */}
          <div className="text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500/30 to-fuchsia-500/30 flex items-center justify-center mx-auto mb-3 border-2 border-purple-500/40">
              <UserCircle size={48} className="text-purple-400" />
            </div>
            <h1 className="text-2xl font-black text-main">{t(`Salut, ${greeting}!`)}</h1>
            <p className="text-sm text-muted mt-1">{t("Personalizează-ți profilul")}</p>
          </div>

          {/* Fields */}
          <div className="rounded-2xl border border-subtle bg-card p-5 space-y-4">
            {FIELDS.map(({ key, label, icon: Icon, placeholder }) => (
              <div key={key}>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-muted mb-1.5">
                  <Icon size={12} />
                  {t(label)}
                </label>
                <input
                  value={profile[key]}
                  onChange={(e) => setProfile({ ...profile, [key]: e.target.value })}
                  placeholder={t(placeholder)}
                  className="w-full px-3 py-2.5 rounded-xl bg-card border border-medium text-main text-sm placeholder:text-faintest focus:outline-none focus:border-purple-500/50 transition-colors"
                />
              </div>
            ))}
          </div>

          {/* Save */}
          <button
            onClick={handleSave}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-main font-bold text-sm transition-all shadow-lg shadow-purple-900/30 flex items-center justify-center gap-2"
          >
            <Save size={16} />
            {saved ? t("Salvat!") : t("Salvează profilul")}
          </button>

          {/* Info */}
          <p className="text-xs text-faint text-center">
            {t("Informațiile sunt stocate local și nu sunt partajate.")}
          </p>
        </motion.div>
      </div>
    </Layout>
  );
}
