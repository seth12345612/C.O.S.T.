import { describe, it, expect } from "vitest";
import type { GameState, DecizieIstorica, AiAnswerResult } from "@/types";

describe("GameState type invariants", () => {
  const validState: GameState = {
    scenariuId: "camin",
    subScenariuId: "coleg",
    dificultateKey: "mediu",
    bani: 1000,
    fericire: 80,
    reputatie: 50,
    venitLunar: 900,
    saptamana: 4,
    luna: 1,
    saptamanaInLuna: 4,
    istoricDecizii: [],
    isGameOver: false,
    gameOverTitle: "",
    gameOverReason: "",
    isEndless: false,
    evenimentCurent: null,
    evenimenteRamase: [],
    aiQuestion: null,
    isRecoveryMode: false,
    recoveryWeeksRemaining: 0,
  };

  it("reputatie starts at 50", () => {
    expect(validState.reputatie).toBe(50);
  });

  it("reputatie is clamped between 0 and 100", () => {
    const clamped = Math.max(0, Math.min(100, validState.reputatie));
    expect(clamped).toBeGreaterThanOrEqual(0);
    expect(clamped).toBeLessThanOrEqual(100);
  });

  it("fericire and bani are non-negative", () => {
    expect(validState.bani).toBeGreaterThanOrEqual(0);
    expect(validState.fericire).toBeGreaterThanOrEqual(0);
  });
});

describe("Game over conditions", () => {
  function checkGameOver(
    bani: number, fericire: number, reputatie: number,
    saptamana: number, isEndless: boolean,
    isRecovery: boolean, recoveryWeeks: number
  ) {
    if (bani < 0 && !isRecovery) return "enterRecovery";
    if (bani < 0 && recoveryWeeks <= 0) return "faliment";
    if (fericire <= 0) return "epuizare";
    if (reputatie <= 0) return "reputatie";
    if (!isEndless && saptamana >= 48 && bani >= 0 && fericire > 0) return "victorie";
    return "continua";
  }

  it("game ends when reputatie reaches 0", () => {
    expect(checkGameOver(1000, 80, 0, 20, false, false, 0)).toBe("reputatie");
  });

  it("game enters recovery when bani goes negative", () => {
    expect(checkGameOver(-100, 80, 50, 20, false, false, 0)).toBe("enterRecovery");
  });

  it("game ends when recovery fails", () => {
    expect(checkGameOver(-100, 50, 50, 24, false, true, 0)).toBe("faliment");
  });

  it("game ends when fericire is 0", () => {
    expect(checkGameOver(500, 0, 50, 20, false, false, 0)).toBe("epuizare");
  });

  it("player wins after 48 weeks with positive stats", () => {
    expect(checkGameOver(1000, 80, 50, 48, false, false, 0)).toBe("victorie");
  });

  it("game continues in endless mode after 48 weeks", () => {
    expect(checkGameOver(1000, 80, 50, 60, true, false, 0)).toBe("continua");
  });
});

describe("DecizieIstorica with reputation", () => {
  const decizie: DecizieIstorica = {
    id: "test-1",
    luna: 1,
    saptamana: 2,
    titluEveniment: "Test",
    alegere: "Option A",
    lectie: "Lesson learned",
    baniDelta: 100,
    fericireDelta: 10,
    reputatieDelta: 5,
    timestamp: Date.now(),
  };

  it("includes reputatieDelta field", () => {
    expect(decizie.reputatieDelta).toBeDefined();
    expect(decizie.reputatieDelta).toBe(5);
  });

  it("sums deltas correctly for scoring", () => {
    const score = decizie.baniDelta + decizie.fericireDelta * 10 + (decizie.reputatieDelta ?? 0) * 15;
    expect(score).toBe(100 + 100 + 75);
  });
});

describe("AiAnswerResult with reputation", () => {
  const result: AiAnswerResult = {
    corect: true,
    baniDelta: 150,
    fericireDelta: 10,
    reputatieDelta: 5,
    explicatie: "Bun răspuns!",
  };

  it("includes reputatieDelta", () => {
    expect(result.reputatieDelta).toBe(5);
  });

  it("correct answer has positive deltas", () => {
    expect(result.corect).toBe(true);
    expect(result.baniDelta).toBeGreaterThan(0);
    expect(result.fericireDelta).toBeGreaterThan(0);
  });

  const wrongResult: AiAnswerResult = {
    corect: false,
    baniDelta: -150,
    fericireDelta: -15,
    reputatieDelta: -10,
    explicatie: "Mai încearcă!",
  };

  it("wrong answer has negative deltas", () => {
    expect(wrongResult.corect).toBe(false);
    expect(wrongResult.baniDelta).toBeLessThan(0);
    expect(wrongResult.fericireDelta).toBeLessThan(0);
    expect(wrongResult.reputatieDelta).toBeLessThan(0);
  });
});

describe("Difficulty multipliers", () => {
  function applyDifficulty(value: number, diff: "usor" | "mediu" | "greu", isNegative: boolean): number {
    if (diff === "usor") return isNegative ? value * 0.8 : value * 1.1;
    if (diff === "greu") return isNegative ? value * 1.0 : value * 0.8;
    return value;
  }

  it("usor reduces negative impact", () => {
    expect(applyDifficulty(-100, "usor", true)).toBe(-80);
  });

  it("usor boosts positive impact", () => {
    expect(applyDifficulty(100, "usor", false)).toBeCloseTo(110);
  });

  it("greu reduces positive impact", () => {
    expect(applyDifficulty(100, "greu", false)).toBe(80);
  });

  it("mediu passes through unchanged", () => {
    expect(applyDifficulty(100, "mediu", false)).toBe(100);
    expect(applyDifficulty(-100, "mediu", true)).toBe(-100);
  });
});

describe("Subscription tier access", () => {
  const order = ["free", "premium_basic", "premium_advanced"] as const;
  function hasAccess(user: string, required: string): boolean {
    return order.indexOf(user as any) >= order.indexOf(required as any);
  }

  it("free user cannot access basic features", () => {
    expect(hasAccess("free", "premium_basic")).toBe(false);
  });

  it("free user cannot access advanced features", () => {
    expect(hasAccess("free", "premium_advanced")).toBe(false);
  });

  it("basic user can access basic but not advanced", () => {
    expect(hasAccess("premium_basic", "premium_basic")).toBe(true);
    expect(hasAccess("premium_basic", "premium_advanced")).toBe(false);
  });

  it("advanced user can access everything", () => {
    expect(hasAccess("premium_advanced", "premium_basic")).toBe(true);
    expect(hasAccess("premium_advanced", "premium_advanced")).toBe(true);
  });
});
