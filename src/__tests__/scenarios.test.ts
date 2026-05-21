import { shuffleArray } from "@/data/events";
import { describe, it, expect } from "vitest";

describe("shuffleArray", () => {
  it("returns an array of the same length", () => {
    const input = [1, 2, 3, 4, 5];
    const result = shuffleArray(input);
    expect(result).toHaveLength(input.length);
  });

  it("contains the same elements", () => {
    const input = [1, 2, 3, 4, 5];
    const result = shuffleArray(input);
    expect(result.sort()).toEqual(input.sort());
  });

  it("does not mutate the original array", () => {
    const input = [1, 2, 3, 4, 5];
    const original = [...input];
    shuffleArray(input);
    expect(input).toEqual(original);
  });
});

describe("DIFICULTATI", () => {
  it("defines all three difficulty levels", async () => {
    const { DIFICULTATI } = await import("@/data/scenarios");
    expect(DIFICULTATI.usor).toBeDefined();
    expect(DIFICULTATI.mediu).toBeDefined();
    expect(DIFICULTATI.greu).toBeDefined();
  });
});

describe("GAME_EVENTS", () => {
  it("contains events for all scenarios", async () => {
    const { GAME_EVENTS } = await import("@/data/events");
    const { SCENARII } = await import("@/data/scenarios");
    const scenarioIds = Object.keys(SCENARII);
    for (const id of scenarioIds) {
      expect(GAME_EVENTS[id]).toBeDefined();
    }
  });
});

describe("START_CONFIG", () => {
  it("provides valid starting money for all scenarios and difficulties", async () => {
    const { START_CONFIG } = await import("@/data/scenarios");
    for (const [scenario, difficulties] of Object.entries(START_CONFIG)) {
      for (const [diff, config] of Object.entries(difficulties)) {
        expect(config.bani).toBeGreaterThan(0);
        expect(config.fericire).toBeGreaterThanOrEqual(80);
      }
    }
  });
});
