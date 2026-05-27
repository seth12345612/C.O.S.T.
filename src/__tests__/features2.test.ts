import { describe, it, expect } from "vitest";
import { ACHIEVEMENTS, HIDDEN_ACHIEVEMENT_IDS } from "@/data/achievements";
import { SHOP_ITEMS } from "@/data/shop";
import { FINANCIAL_TERMS } from "@/data/financial-terms";
import { TIERS, hasTierAccess } from "@/data/tiers";
import type { AchievementStats, SubscriptionTier } from "@/types";

describe("Achievements data integrity", () => {
  it("has at least 30 achievements", () => {
    expect(ACHIEVEMENTS.length).toBeGreaterThanOrEqual(30);
  });

  it("all achievements have unique IDs", () => {
    const ids = ACHIEVEMENTS.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("all achievements have required fields", () => {
    for (const a of ACHIEVEMENTS) {
      expect(a.id).toBeDefined();
      expect(a.titlu).toBeDefined();
      expect(a.descriere).toBeDefined();
      expect(a.icon).toBeDefined();
      expect(["joc", "social", "progresie", "ascuns"]).toContain(a.categorie);
      expect(a.xpReward).toBeGreaterThan(0);
      expect(typeof a.conditie).toBe("function");
    }
  });

  it("hidden achievements are correctly categorized", () => {
    const hiddenFromCategory = ACHIEVEMENTS
      .filter((a) => a.categorie === "ascuns")
      .map((a) => a.id)
      .sort();
    expect(hiddenFromCategory).toEqual([...HIDDEN_ACHIEVEMENT_IDS].sort());
  });
});

describe("Achievement conditions", () => {
  const baseStats: AchievementStats = {
    totalJocuri: 0, totalVictorii: 0, scenariiDeblocate: 0,
    scenariiJucate: [], nivelCurent: 1, baniTotaliCastigati: 0,
    evenimenteCompletate: 0, tutorialCompletat: false,
    premiumActiv: false, utilizatorConectat: false,
    limitedEventsCompletate: 0, achievementIds: [],
  };

  it("primul_pas unlocks after first game", () => {
    const ach = ACHIEVEMENTS.find((a) => a.id === "first_game")!;
    expect(ach.conditie(baseStats)).toBe(false);
    expect(ach.conditie({ ...baseStats, totalJocuri: 1 })).toBe(true);
  });

  it("milionar_ascuns requires 10000 bani", () => {
    const ach = ACHIEVEMENTS.find((a) => a.id === "milionar_ascuns")!;
    expect(ach.conditie({ ...baseStats, baniTotaliCastigati: 9999 })).toBe(false);
    expect(ach.conditie({ ...baseStats, baniTotaliCastigati: 10000 })).toBe(true);
  });

  it("all_achievements requires all other achievements", () => {
    const ach = ACHIEVEMENTS.find((a) => a.id === "all_achievements")!;
    const allIds = ACHIEVEMENTS.map((a) => a.id).filter((id) => id !== "all_achievements");
    expect(ach.conditie({ ...baseStats, achievementIds: allIds })).toBe(true);
  });

  it("nivel_up unlocks at level 5", () => {
    const ach = ACHIEVEMENTS.find((a) => a.id === "level_5")!;
    expect(ach.conditie({ ...baseStats, nivelCurent: 4 })).toBe(false);
    expect(ach.conditie({ ...baseStats, nivelCurent: 5 })).toBe(true);
  });
});

describe("Shop data", () => {
  it("has at least 10 shop items", () => {
    expect(SHOP_ITEMS.length).toBeGreaterThanOrEqual(10);
  });

  it("all shop items have valid structure", () => {
    for (const item of SHOP_ITEMS) {
      expect(item.id).toBeDefined();
      expect(item.nume).toBeDefined();
      expect(item.descriere).toBeDefined();
      expect(item.emoji).toBeDefined();
      expect(["tema", "avatar", "booster", "badge"]).toContain(item.tip);
      expect(item.pretXP).toBeGreaterThan(0);
      expect(item.pretBani).toBeGreaterThanOrEqual(0);
    }
  });

  it("has at least 3 themes", () => {
    const themes = SHOP_ITEMS.filter((i) => i.tip === "tema");
    expect(themes.length).toBeGreaterThanOrEqual(3);
  });

  it("has at least 2 boosters", () => {
    const boosters = SHOP_ITEMS.filter((i) => i.tip === "booster");
    expect(boosters.length).toBeGreaterThanOrEqual(2);
  });

  it("all shop items have unique IDs", () => {
    const ids = SHOP_ITEMS.map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("Tier data", () => {
  it("has 3 tiers", () => {
    expect(TIERS.length).toBe(3);
  });

  it("tiers are ordered free -> basic -> advanced", () => {
    expect(TIERS[0].id).toBe("free");
    expect(TIERS[1].id).toBe("premium_basic");
    expect(TIERS[2].id).toBe("premium_advanced");
  });

  it("tier pricing is correct", () => {
    expect(TIERS[0].priceRON).toBe(0);
    expect(TIERS[1].priceRON).toBe(9);
    expect(TIERS[2].priceRON).toBe(19);
  });

  it("basic tier is marked as popular", () => {
    expect(TIERS[1].popular).toBe(true);
  });

  it("hasTierAccess works correctly", () => {
    expect(hasTierAccess("free", "free")).toBe(true);
    expect(hasTierAccess("free", "premium_basic")).toBe(false);
    expect(hasTierAccess("free", "premium_advanced")).toBe(false);
    expect(hasTierAccess("premium_basic", "free")).toBe(true);
    expect(hasTierAccess("premium_basic", "premium_basic")).toBe(true);
    expect(hasTierAccess("premium_basic", "premium_advanced")).toBe(false);
    expect(hasTierAccess("premium_advanced", "premium_basic")).toBe(true);
    expect(hasTierAccess("premium_advanced", "premium_advanced")).toBe(true);
  });
});
