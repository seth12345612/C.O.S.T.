import { describe, it, expect } from "vitest";
import { ACTIUNI, FONDURI_MUTUALE, OBIECTIVE_DEFAULT, simuleazaPiata } from "@/data/investments";
import { WEEKLY_CHALLENGES, MONTHLY_CHALLENGES, PREMIUM_CHALLENGES } from "@/data/challenges";
import type { ChallengeStats } from "@/types";

describe("Investment data", () => {
  it("has at least 3 stock types available", () => {
    expect(ACTIUNI.length).toBeGreaterThanOrEqual(3);
  });

  it("has at least 3 mutual funds available", () => {
    expect(FONDURI_MUTUALE.length).toBeGreaterThanOrEqual(3);
  });

  it("all ACTIUNI have valid structure", () => {
    for (const a of ACTIUNI) {
      expect(a.id).toBeDefined();
      expect(a.nume).toBeDefined();
      expect(a.valoareCurenta).toBeGreaterThan(0);
      expect(["scazut", "mediu", "ridicat"]).toContain(a.risc);
    }
  });

  it("all FONDURI_MUTUALE have valid structure", () => {
    for (const f of FONDURI_MUTUALE) {
      expect(f.id).toBeDefined();
      expect(f.nume).toBeDefined();
      expect(f.valoareCurenta).toBeGreaterThan(0);
      expect(["scazut", "mediu", "ridicat"]).toContain(f.risc);
    }
  });

  it("simuleazaPiata returns same number of investments", () => {
    const result = simuleazaPiata(ACTIUNI);
    expect(result).toHaveLength(ACTIUNI.length);
  });

  it("simuleazaPiata changes current values", () => {
    const original = ACTIUNI.map((a) => a.valoareCurenta);
    const result = simuleazaPiata(ACTIUNI);
    let changed = false;
    for (let i = 0; i < original.length; i++) {
      if (result[i].valoareCurenta !== original[i]) changed = true;
    }
    expect(changed).toBe(true);
  });

  it("simuleazaPiata keeps values above 10", () => {
    for (let i = 0; i < 50; i++) {
      const result = simuleazaPiata(ACTIUNI);
      for (const inv of result) {
        expect(inv.valoareCurenta).toBeGreaterThanOrEqual(10);
      }
    }
  });

  it("OBIECTIVE_DEFAULT has at least 3 long-term goals", () => {
    expect(OBIECTIVE_DEFAULT.length).toBeGreaterThanOrEqual(3);
  });

  it("all OBIECTIVE_DEFAULT have valid structure", () => {
    for (const obj of OBIECTIVE_DEFAULT) {
      expect(obj.id).toBeDefined();
      expect(obj.nume).toBeDefined();
      expect(obj.sumaTinta).toBeGreaterThan(0);
      expect(obj.termenLuni).toBeGreaterThan(0);
      expect(["scazuta", "medie", "ridicata"]).toContain(obj.prioritate);
    }
  });
});

describe("Challenge data", () => {
  it("has at least 5 weekly challenges", () => {
    expect(WEEKLY_CHALLENGES.length).toBeGreaterThanOrEqual(5);
  });

  it("has at least 4 monthly challenges", () => {
    expect(MONTHLY_CHALLENGES.length).toBeGreaterThanOrEqual(4);
  });

  it("has at least 3 premium challenges", () => {
    expect(PREMIUM_CHALLENGES.length).toBeGreaterThanOrEqual(3);
  });

  it("all challenges have valid structure", () => {
    const all = [...WEEKLY_CHALLENGES, ...MONTHLY_CHALLENGES, ...PREMIUM_CHALLENGES];
    for (const c of all) {
      expect(c.id).toBeDefined();
      expect(c.titlu).toBeDefined();
      expect(c.descriere).toBeDefined();
      expect(c.obiectiv).toBeDefined();
      expect(c.recompensaXP).toBeGreaterThan(0);
      expect(["usor", "mediu", "greu"]).toContain(c.dificultate);
      expect(typeof c.conditie).toBe("function");
    }
  });

  it("all challenge IDs are unique", () => {
    const all = [...WEEKLY_CHALLENGES, ...MONTHLY_CHALLENGES, ...PREMIUM_CHALLENGES];
    const ids = all.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("premium challenges have isPremium flag", () => {
    for (const c of PREMIUM_CHALLENGES) {
      expect(c.isPremium).toBe(true);
    }
  });

  it("non-premium challenges do not have isPremium flag", () => {
    const nonPremium = [...WEEKLY_CHALLENGES, ...MONTHLY_CHALLENGES];
    for (const c of nonPremium) {
      expect(c.isPremium).toBeUndefined();
    }
  });
});

describe("Challenge conditions", () => {
  const baseStats: ChallengeStats = {
    xpCastigat: 0, baniEconomisiti: 0, evenimenteCompletate: 0,
    aiAnswersDate: 0, fericireMedie: 50, reputatieMedie: 50,
    scenariiFinalizate: [], investitiiActive: 0, saptamaniJucate: 0,
  };

  it("weekly_save_200 requires 200 savings", () => {
    const weekly = WEEKLY_CHALLENGES.find((c) => c.id === "weekly_save_200")!;
    expect(weekly.conditie(baseStats)).toBe(false);
    expect(weekly.conditie({ ...baseStats, baniEconomisiti: 200 })).toBe(true);
  });

  it("weekly_events requires 3 events completed", () => {
    const weekly = WEEKLY_CHALLENGES.find((c) => c.id === "weekly_events")!;
    expect(weekly.conditie({ ...baseStats, evenimenteCompletate: 2 })).toBe(false);
    expect(weekly.conditie({ ...baseStats, evenimenteCompletate: 3 })).toBe(true);
  });

  it("monthly_capital requires 5000 savings", () => {
    const monthly = MONTHLY_CHALLENGES.find((c) => c.id === "monthly_capital")!;
    expect(monthly.conditie({ ...baseStats, baniEconomisiti: 4999 })).toBe(false);
    expect(monthly.conditie({ ...baseStats, baniEconomisiti: 5000 })).toBe(true);
  });

  it("monthly_scenarios requires 2 scenarios", () => {
    const monthly = MONTHLY_CHALLENGES.find((c) => c.id === "monthly_scenarios")!;
    expect(monthly.conditie({ ...baseStats, scenariiFinalizate: ["camin"] })).toBe(false);
    expect(monthly.conditie({ ...baseStats, scenariiFinalizate: ["camin", "navetist"] })).toBe(true);
  });

  it("monthly_investments requires 3 active investments", () => {
    const monthly = MONTHLY_CHALLENGES.find((c) => c.id === "monthly_investments")!;
    expect(monthly.conditie({ ...baseStats, investitiiActive: 2 })).toBe(false);
    expect(monthly.conditie({ ...baseStats, investitiiActive: 3 })).toBe(true);
  });

  it("premium challenges can be completed with sufficient stats", () => {
    for (const c of PREMIUM_CHALLENGES) {
      expect(typeof c.conditie(baseStats)).toBe("boolean");
    }
  });
});
