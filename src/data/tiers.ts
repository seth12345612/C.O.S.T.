import type { SubscriptionTier } from "@/types"
import { Crown, Sparkles, BarChart3, MessageCircle, Shield, Zap, Star, Target, Unlock, Calendar } from "lucide-react"

export interface TierInfo {
  id: SubscriptionTier
  label: string
  priceRON: number
  priceLabel: string
  icon: typeof Crown
  color: string
  gradient: string
  popular: boolean
  benefits: { icon: typeof Crown; text: string }[]
}

export const TIERS: TierInfo[] = [
  {
    id: "free",
    label: "Free",
    priceRON: 0,
    priceLabel: "Gratuit",
    icon: Star,
    color: "text-gray-400",
    gradient: "from-gray-600 to-gray-500",
    popular: false,
    benefits: [
      { icon: Zap, text: "3 scenarii gratuite" },
      { icon: MessageCircle, text: "10 întrebări AI / zi" },
      { icon: Target, text: "Urmărire finanțe personale" },
    ],
  },
  {
    id: "premium_basic",
    label: "Premium Basic",
    priceRON: 9,
    priceLabel: "9 RON / lună",
    icon: Crown,
    color: "text-yellow-400",
    gradient: "from-yellow-500 to-orange-500",
    popular: true,
    benefits: [
      { icon: Unlock, text: "Toate scenariile deblocate" },
      { icon: MessageCircle, text: "Chat AI nelimitat" },
      { icon: Calendar, text: "Scenarii sezoniere oricând" },
      { icon: Sparkles, text: "Evenimente exclusive" },
    ],
  },
  {
    id: "premium_advanced",
    label: "Premium Advanced",
    priceRON: 19,
    priceLabel: "19 RON / lună",
    icon: Shield,
    color: "text-purple-400",
    gradient: "from-purple-500 to-pink-500",
    popular: false,
    benefits: [
      { icon: Unlock, text: "Toate beneficiile Basic" },
      { icon: BarChart3, text: "Analize financiare detaliate" },
      { icon: MessageCircle, text: "Mentorat AI personalizat" },
      { icon: Shield, text: "Suport prioritar 24/7" },
      { icon: Zap, text: "XP boost +20%" },
      { icon: Target, text: "Provocări premium exclusive" },
    ],
  },
]

export function hasTierAccess(userTier: SubscriptionTier, requiredTier: SubscriptionTier): boolean {
  const order: SubscriptionTier[] = ["free", "premium_basic", "premium_advanced"]
  return order.indexOf(userTier) >= order.indexOf(requiredTier)
}
