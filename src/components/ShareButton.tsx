import { Share2 } from "lucide-react"
import { toast } from "sonner"
import { useTranslation } from "@/context/TranslationContext"

interface ShareButtonProps {
  title: string
  text: string
  className?: string
}

export default function ShareButton({ title, text, className = "" }: ShareButtonProps) {
  const { t } = useTranslation()
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text })
      } catch {
        // user cancelled
      }
    } else {
      await navigator.clipboard.writeText(text)
      toast.success(t("Text copiat în clipboard"))
    }
  }

  return (
    <button
      onClick={handleShare}
      className={
        "inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-subtle bg-card-soft4 text-muted hover:text-main hover:border-strong transition-all text-sm font-medium " +
        className
      }
    >
      <Share2 size={16} />
      {t("Distribuie")}
    </button>
  )
}
