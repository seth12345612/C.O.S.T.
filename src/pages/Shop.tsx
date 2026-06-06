import { useMemo, useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Store, ShoppingBag, Palette, Sparkles, Zap, Star, Check, X, Clock } from "lucide-react";
import { OrbBackground } from "@/components/OrbBackground";
import { Layout } from "@/components/Layout";
import { useXP } from "@/context/XPContext";
import { useTheme } from "@/context/ThemeContext";
import { SHOP_ITEMS } from "@/data/shop";
import { useEquipped, loadActiveBooster } from "@/lib/shop-equip";
import type { ShopItem } from "@/types";

const SHOP_THEME_TO_PRESET: Record<string, string> = {
  theme_polar: "polar",
  theme_gold: "gold",
  theme_emerald: "green",
  theme_neon: "neon",
};

const TIP_LABEL: Record<ShopItem["tip"], { label: string; icon: typeof Store }> = {
  tema: { label: "Teme", icon: Palette },
  avatar: { label: "Avataruri", icon: ShoppingBag },
  booster: { label: "Boostere", icon: Zap },
  badge: { label: "Insigne", icon: Star },
};

function loadOwned(): string[] {
  try {
    const raw = localStorage.getItem("cost_shop_owned");
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

function saveOwned(ids: string[]) {
  try { localStorage.setItem("cost_shop_owned", JSON.stringify(ids)); } catch {}
}

export default function Shop() {
  const { xpState, addXP } = useXP();
  const { setPreset } = useTheme();
  const { equipped, equipTheme, equipAvatar, equipBadge, activateBooster, isBoosterActive } = useEquipped();
  const [owned, setOwned] = useState<string[]>(loadOwned);

  useEffect(() => { saveOwned(owned); }, [owned]);

  const [, forceUpdate] = useState(0);
  useEffect(() => {
    const id = setInterval(() => forceUpdate((n) => n + 1), 60000);
    return () => clearInterval(id);
  }, []);

  const grouped = useMemo(() => {
    const groups: Record<ShopItem["tip"], ShopItem[]> = {
      tema: [], avatar: [], booster: [], badge: [],
    };
    for (const item of SHOP_ITEMS) {
      groups[item.tip].push(item);
    }
    return groups;
  }, []);

  const handleBuy = useCallback((item: ShopItem) => {
    if (item.tip !== "booster" && owned.includes(item.id)) return;
    if (xpState.xp < item.pretXP) {
      toast.error("XP insuficient!", { description: `Ai nevoie de ${item.pretXP} XP pentru a cumpăra ${item.nume}.` });
      return;
    }
    addXP(-item.pretXP);
    if (item.tip === "booster") {
      activateBooster(item.id, item.durataZile ?? 1);
      toast.success("Booster activat!", { description: `${item.emoji} ${item.nume} — ${item.efect ?? "activ"} pentru ${item.durataZile ?? 1} zi(le).` });
    } else {
      setOwned((prev) => [...prev, item.id]);
      toast.success("AI CUMPĂRAT!", {
        description: `${item.emoji} ${item.nume} — ai plătit ${item.pretXP} XP.`,
      });
    }
  }, [owned, xpState.xp, addXP, activateBooster]);

  const handleApply = useCallback((item: ShopItem) => {
    if (item.tip === "tema") {
      const presetId = SHOP_THEME_TO_PRESET[item.id];
      if (presetId) {
        setPreset(presetId);
        equipTheme(item.id);
        toast.success("Temă aplicată!", { description: `${item.emoji} ${item.nume} este acum activă.` });
      }
    } else if (item.tip === "avatar") {
      equipAvatar(item.id);
      toast.success("Avatar echipat!", { description: `${item.emoji} ${item.nume} este acum avatarul tău.` });
    } else if (item.tip === "badge") {
      equipBadge(item.id);
      toast.success("Insignă echipată!", { description: `${item.emoji} ${item.nume} este acum afișată.` });
    }
  }, [setPreset, equipTheme, equipAvatar, equipBadge]);

  const sectionVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
      opacity: 1, y: 0,
      transition: { delay: i * 0.12, duration: 0.5 },
    }),
  };

  return (
    <Layout>
      <OrbBackground bgClass="bg-gradient-to-br from-amber-950 via-slate-900 to-purple-950" />
      <div className="relative z-10 max-w-5xl mx-auto px-4 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs mb-4">
            <Store size={12} /> Magazin
          </div>
          <h1 className="text-3xl font-bold text-main mb-2">Magazin cosmetic</h1>
          <p className="text-muted text-sm">
            Balanța ta: <span className="font-bold text-amber-400">{xpState.xp} XP</span>
          </p>
        </motion.div>

        {(Object.entries(grouped) as [ShopItem["tip"], ShopItem[]][]).map(([tip, items], gi) => {
          const info = TIP_LABEL[tip];
          const Icon = info.icon;
          return (
            <motion.section
              key={tip}
              custom={gi}
              variants={sectionVariants}
              initial="hidden"
              animate="visible"
              className="mb-10"
            >
              <h2 className="text-xl font-bold text-main mb-1 flex items-center gap-2">
                <Icon size={18} className="text-amber-400" />
                {info.label}
                <span className="text-sm font-normal text-faint">({items.length})</span>
              </h2>
              <p className="text-xs text-muted mb-4">
                {tip === "tema" && "Deblochează teme noi pentru interfață."}
                {tip === "avatar" && "Schimbă-ți avatarul din setări."}
                {tip === "booster" && "Boostere active temporar în profilul tău."}
                {tip === "badge" && "Insigne speciale de colecționat."}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((item) => {
                  const isBooster = item.tip === "booster";
                  const isOwned = !isBooster && owned.includes(item.id);
                  const insuficient = xpState.xp < item.pretXP;
                  const isEquipped =
                    (item.tip === "tema" && equipped.themeId === item.id) ||
                    (item.tip === "avatar" && equipped.avatarId === item.id) ||
                    (item.tip === "badge" && equipped.badgeId === item.id) ||
                    (isBooster && isBoosterActive(item.id));

                  const showApply = isOwned && !isEquipped;

                  const boosterRemaining = isBooster && isBoosterActive(item.id)
                    ? (() => {
                        const b = loadActiveBooster();
                        if (!b) return "";
                        const h = Math.floor((b.expiresAt - Date.now()) / 3600000);
                        if (h < 1) return "< 1h";
                        return `${h}h`;
                      })()
                    : null;

                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05 }}
                      className={`relative group rounded-2xl border overflow-hidden transition-all ${
                        isEquipped
                          ? "border-green-500/50 bg-green-500/5 shadow-lg shadow-green-500/10"
                          : "border-subtle bg-card hover:border-amber-500/40 hover:shadow-lg hover:shadow-amber-500/5"
                      }`}
                    >
                      <div className="p-5">
                        <div className="flex items-start justify-between mb-3">
                          <span className="text-3xl">{item.emoji}</span>
                          {isEquipped && (
                            <span className="flex items-center gap-1 text-xs font-bold text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/20">
                              <Check size={10} />
                              Activ
                              {boosterRemaining && (
                                <span className="flex items-center gap-0.5 ml-1 text-green-400/70">
                                  <Clock size={9} /> {boosterRemaining}
                                </span>
                              )}
                            </span>
                          )}
                          {isOwned && !isEquipped && (
                            <span className="flex items-center gap-1 text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                              Deținut
                            </span>
                          )}
                        </div>
                        <h3 className="text-base font-bold text-main mb-1">{item.nume}</h3>
                        <p className="text-xs text-muted mb-3 leading-relaxed">{item.descriere}</p>
                        {item.efect && (
                          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 text-[10px] font-semibold mb-3">
                            <Zap size={10} />
                            {item.efect}
                          </div>
                        )}
                        <div className="flex items-center gap-3 text-xs">
                          <span className="flex items-center gap-1 font-semibold text-amber-400">
                            <Star size={11} />
                            {item.pretXP} XP
                          </span>
                          {item.pretBani > 0 && (
                            <span className="flex items-center gap-1 text-green-400 font-semibold">
                              <span className="text-sm">$</span>
                              {item.pretBani}
                            </span>
                          )}
                        </div>
                        {showApply ? (
                          <button
                            onClick={() => handleApply(item)}
                            className="mt-4 w-full py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 bg-blue-500/15 text-blue-300 border border-blue-500/30 hover:bg-blue-500/25 hover:text-blue-200 cursor-pointer"
                          >
                            <Sparkles size={12} /> Aplică
                          </button>
                        ) : isEquipped && !isBooster ? (
                          <div className="mt-4 w-full py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 bg-green-500/10 text-green-400 border border-green-500/20">
                            <Check size={12} /> Echipat
                          </div>
                        ) : (
                          <button
                            onClick={() => handleBuy(item)}
                            disabled={insuficient}
                            className={`mt-4 w-full py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                              insuficient
                                ? "bg-red-500/10 text-red-400 border border-red-500/20 cursor-not-allowed"
                                : "bg-amber-500/15 text-amber-300 border border-amber-500/30 hover:bg-amber-500/25 hover:text-amber-200 cursor-pointer"
                            }`}
                          >
                            {insuficient ? (
                              <><X size={12} /> Insuficient</>
                            ) : isBooster && isEquipped ? (
                              <><ShoppingBag size={12} /> Cumpără +{item.durataZile ?? 1}z</>
                            ) : (
                              <><ShoppingBag size={12} /> Cumpără</>
                            )}
                          </button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.section>
          );
        })}
      </div>
    </Layout>
  );
}
