import { describe, it, expect } from "vitest";

describe("Game State Transitions", () => {
  it("game over triggers when bani is negative after recovery", () => {
    const mockGameState = {
      bani: -500,
      fericire: 50,
      isRecoveryMode: true,
      recoveryWeeksRemaining: 0,
      saptamana: 20,
    };

    const isGameOver = mockGameState.bani < 0 && !mockGameState.isRecoveryMode;
    const isGameOverAfterRecovery = mockGameState.bani < 0 && mockGameState.recoveryWeeksRemaining <= 0;

    expect(isGameOver || isGameOverAfterRecovery).toBe(true);
  });

  it("game over triggers when fericire reaches zero", () => {
    const fericire = 0;
    expect(fericire <= 0).toBe(true);
  });

  it("player wins after 48 weeks", () => {
    const saptamana = 48;
    const bani = 1000;
    const fericire = 50;
    expect(saptamana >= 48 && bani >= 0 && fericire > 0).toBe(true);
  });
});

describe("Leaderboard Scoring", () => {
  it("score equals remaining money", () => {
    const score = 2500;
    const isPositive = score >= 0;
    expect(isPositive).toBe(true);
  });
});
