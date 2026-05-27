import { describe, it, expect } from "vitest";
import { shuffleArray, GAME_EVENTS } from "@/data/events";
import { SCENARII, DIFICULTATI, START_CONFIG } from "@/data/scenarios";
import { FINANCIAL_TERMS, TERMS_BY_CATEGORY } from "@/data/financial-terms";

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

describe("GAME_EVENTS data integrity", () => {
  it("all events have required fields", () => {
    for (const [scenarioId, events] of Object.entries(GAME_EVENTS)) {
      for (const ev of events) {
        expect(ev.id).toBeDefined();
        expect(ev.titlu).toBeDefined();
        expect(ev.descriere).toBeDefined();
        expect(ev.optiuni.length).toBeGreaterThanOrEqual(1);
        for (const opt of ev.optiuni) {
          expect(typeof opt.text).toBe("string");
          expect(typeof opt.bani).toBe("number");
          expect(typeof opt.fericirePct).toBe("number");
          expect(typeof opt.lectie).toBe("string");
        }
      }
    }
  });

  it("has events for all non-internal scenario IDs", () => {
    const publicScenarios = Object.values(SCENARII).filter((s) => !s.isInternal);
    for (const sc of publicScenarios) {
      expect(GAME_EVENTS[sc.id]).toBeDefined();
      expect(GAME_EVENTS[sc.id].length).toBeGreaterThan(0);
    }
  });

  it("all events have unique IDs within their category", () => {
    for (const [scenarioId, events] of Object.entries(GAME_EVENTS)) {
      const ids = events.map((e) => e.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });
});

describe("Event option reputation deltas", () => {
  it("some events have reputatiePct on options", () => {
    let foundReputation = 0;
    for (const events of Object.values(GAME_EVENTS)) {
      for (const ev of events) {
        for (const opt of ev.optiuni) {
          if (opt.reputatiePct !== undefined) foundReputation++;
        }
      }
    }
    expect(foundReputation).toBeGreaterThan(0);
  });

  it("reputation values are within valid range", () => {
    for (const events of Object.values(GAME_EVENTS)) {
      for (const ev of events) {
        for (const opt of ev.optiuni) {
          if (opt.reputatiePct !== undefined) {
            expect(opt.reputatiePct).toBeGreaterThanOrEqual(-25);
            expect(opt.reputatiePct).toBeLessThanOrEqual(25);
          }
        }
      }
    }
  });
});

describe("DIFICULTATI", () => {
  it("defines all three difficulty levels", () => {
    expect(DIFICULTATI.usor).toBeDefined();
    expect(DIFICULTATI.mediu).toBeDefined();
    expect(DIFICULTATI.greu).toBeDefined();
  });

  it("difficulties are ordered correctly by name", () => {
    expect(DIFICULTATI.usor.nume).toBe("Ușor");
    expect(DIFICULTATI.mediu.nume).toBe("Mediu");
    expect(DIFICULTATI.greu.nume).toBe("Greu");
  });
});

describe("START_CONFIG", () => {
  it("provides valid starting money for all scenarios and difficulties", () => {
    for (const [scenario, difficulties] of Object.entries(START_CONFIG)) {
      for (const [diff, config] of Object.entries(difficulties)) {
        expect(config.bani).toBeGreaterThan(0);
        expect(config.fericire).toBeGreaterThanOrEqual(80);
      }
    }
  });
});

describe("SCENARII data integrity", () => {
  it("all scenarios have valid structure", () => {
    for (const [id, sc] of Object.entries(SCENARII)) {
      expect(sc.id).toBe(id);
      expect(sc.nume).toBeDefined();
      expect(sc.descriere).toBeDefined();
      expect(sc.bgClass).toBeDefined();
      expect(sc.venitLunar).toBeGreaterThan(0);
      expect(sc.subScenarii.length).toBeGreaterThan(0);
      expect(sc.xpRequired).toBeGreaterThanOrEqual(0);
    }
  });

  it("sub-scenarios have valid structure", () => {
    for (const sc of Object.values(SCENARII)) {
      for (const sub of sc.subScenarii) {
        expect(sub.id).toBeDefined();
        expect(sub.label).toBeDefined();
        expect(Array.isArray(sub.cheltuieliExtra)).toBe(true);
      }
    }
  });

  it("sub-scenario IDs are unique within each scenario", () => {
    for (const sc of Object.values(SCENARII)) {
      const ids = sc.subScenarii.map((s) => s.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });
});

describe("FINANCIAL_TERMS", () => {
  it("has at least 10 financial terms", () => {
    expect(FINANCIAL_TERMS.length).toBeGreaterThanOrEqual(10);
  });

  it("all terms have required fields", () => {
    for (const term of FINANCIAL_TERMS) {
      expect(term.term).toBeDefined();
      expect(term.definition.length).toBeGreaterThan(10);
    }
  });

  it("terms are grouped by category", () => {
    const categoryKeys = Object.keys(TERMS_BY_CATEGORY);
    expect(categoryKeys.length).toBeGreaterThanOrEqual(3);
    let totalTerms = 0;
    for (const cat of Object.values(TERMS_BY_CATEGORY)) {
      totalTerms += cat.terms.length;
    }
    expect(totalTerms).toBe(FINANCIAL_TERMS.length);
  });
});
