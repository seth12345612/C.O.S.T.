import { Link } from "wouter";
import { Layout } from "@/components/Layout";
import { OrbBackground } from "@/components/OrbBackground";
import { useTranslation } from "@/context/TranslationContext";

export default function NotFound() {
  const { t } = useTranslation();
  return (
    <Layout>
      <OrbBackground />
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-8xl mb-4">🗺️</div>
          <h1 className="text-4xl font-black text-main mb-2">404</h1>
          <p className="text-muted mb-6">{t("Pagina nu a fost găsită.")}</p>
          <Link href="/" className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-main rounded-xl font-semibold transition-colors">
            {t("Înapoi acasă")}
          </Link>
        </div>
      </div>
    </Layout>
  );
}
