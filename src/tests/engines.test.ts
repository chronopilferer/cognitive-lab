import { describe, it, expect } from "vitest";
import { seeded, localDay, addDays } from "../shared/utils";
import { generateNback, scoreTrial } from "../features/nback/engine";
import { generateSpan } from "../features/running-span/engine";
import { scoreRecall } from "../core/training/recall";
import { generateComplex } from "../features/complex-span/engine";
import {
  generateReasoning,
  solve,
  satisfies,
} from "../features/reasoning/engine";
import { palaceWords } from "../features/memory-palace/engine";
import { scheduleCard } from "../features/spaced-repetition/engine";
import { registry } from "../core/training/registry";
import { configSchema } from "../infrastructure/storage/schema";
import { nextDifficulty, accuracy } from "../core/training/scoring";
import type { Session } from "../core/training/types";
export function sampleSession(overrides: Partial<Session> = {}): Session {
  return {
    id: "s1",
    trainingId: "nback",
    startedAt: "2026-11-15T00:00:00.000Z",
    completedAt: "2026-11-15T00:01:00.000Z",
    status: "completed",
    config: { ...registry[0].defaultConfig },
    algorithmVersion: 1,
    durationSeconds: 60,
    metrics: {
      kind: "nback",
      hit: 6,
      miss: 0,
      falseAlarm: 0,
      correctRejection: 14,
      reactionMs: [300],
    },
    inputMethod: "keyboard",
    ...overrides,
  };
}
describe("N-back generation and scoring", () => {
  it("excludes warmup and classifies all four outcomes", () => {
    expect(scoreTrial([1, 2, 1], 0, 2, true)).toBeNull();
    expect(scoreTrial([1, 2, 1], 2, 2, true)).toBe("hit");
    expect(scoreTrial([1, 2, 1], 2, 2, false)).toBe("miss");
    expect(scoreTrial([1, 2, 3], 2, 2, true)).toBe("falseAlarm");
    expect(scoreTrial([1, 2, 3], 2, 2, false)).toBe("correctRejection");
  });
  it("keeps exact target count, never adds accidental matches", () => {
    for (let seed = 0; seed < 100; seed++)
      for (let n = 1; n <= 4; n++) {
        const s = generateNback(n, 20, 9, seeded(seed));
        expect(s.length).toBe(20 + n);
        expect(s.filter((v, i) => i >= n && v === s[i - n])).toHaveLength(6);
      }
  });
  it("replays a fixed seed", () =>
    expect(generateNback(2, 20, 9, seeded(42))).toEqual(
      generateNback(2, 20, 9, seeded(42)),
    ));
});
describe("spans", () => {
  it("scores ordered partial recall rather than set membership", () => {
    expect(scoreRecall(["3", "2", "1"], ["1", "2", "3"])).toEqual({
      correct: 1,
      total: 3,
    });
    const s = generateSpan(4, seeded(8));
    expect(s.length).toBeGreaterThanOrEqual(7);
    expect(s.length).toBeLessThanOrEqual(12);
    expect(scoreRecall(s.slice(-4), s.slice(-4)).correct).toBe(4);
  });
  it("generates balanced and arithmetically valid problems", () => {
    for (let seed = 0; seed < 100; seed++) {
      const problems = generateComplex(7, seeded(seed));
      expect(new Set(problems.map((p) => p.letter)).size).toBe(7);
      expect([3, 4]).toContain(problems.filter((p) => p.truth).length);
      for (const p of problems)
        expect(p.truth).toBe(
          (p.operator === "×" ? p.a * p.b : p.a + p.b) === p.shown,
        );
    }
  });
});
describe("reasoning", () => {
  it("independently enumerates exactly one solution across levels and seeds", () => {
    for (let seed = 0; seed < 100; seed++)
      for (let level = 1; level <= 3; level++) {
        const p = generateReasoning(level, seeded(seed));
        const solutions = solve(p.people, p.clues);
        expect(solutions).toHaveLength(1);
        expect(solutions[0]).toEqual(p.order);
        expect(p.clues.every((c) => satisfies(p.order, c))).toBe(true);
      }
  });
  it("detects impossible and underconstrained problems", () => {
    expect(
      solve(
        ["A", "B"],
        [
          { before: "A", after: "B" },
          { before: "B", after: "A" },
        ],
      ),
    ).toHaveLength(0);
    expect(solve(["A", "B"], [])).toHaveLength(2);
  });
});
describe("palace and scheduling", () => {
  it("has unique recall words", () =>
    expect(new Set(palaceWords(8, seeded(1))).size).toBe(8));
  it("uses local calendar dates across month and year boundaries", () => {
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
    expect(addDays("2028-02-28", 1)).toBe("2028-02-29");
    expect(localDay(new Date(2026, 10, 15, 23, 59))).toBe("2026-11-15");
  });
  it("follows 1, 3, 7 days and resets failed recalls", () => {
    const card = {
      id: "c",
      question: "Q",
      answer: "A",
      due: "2026-11-15",
      stage: 0,
      updatedAt: "2026-11-15T00:00:00.000Z",
    };
    const first = scheduleCard(card, "good", "2026-11-15");
    expect(first.due).toBe("2026-11-16");
    const second = scheduleCard(first, "good", "2026-11-16");
    expect(second.due).toBe("2026-11-19");
    expect(scheduleCard(second, "good", "2026-11-19").due).toBe("2026-11-26");
    expect(scheduleCard(second, "again", "2026-11-19").stage).toBe(0);
  });
});
describe("difficulty and registry contracts", () => {
  it("requires two matching completed sessions and does not reward doing nothing", () => {
    const a = sampleSession(),
      b = sampleSession({ id: "s2" });
    expect(nextDifficulty([a], a, 4).level).toBe(1);
    expect(nextDifficulty([a, b], b, 4).level).toBe(2);
    const idle = sampleSession({
      id: "s3",
      metrics: {
        kind: "nback",
        hit: 0,
        miss: 6,
        falseAlarm: 0,
        correctRejection: 14,
        reactionMs: [],
      },
    });
    expect(accuracy(idle.metrics!)).toBe(0.7);
    expect(nextDifficulty([idle, { ...idle, id: "s4" }], idle, 4).level).toBe(
      1,
    );
    expect(nextDifficulty([a, { ...b, status: "aborted" }], a, 4).level).toBe(
      1,
    );
    expect(
      nextDifficulty(
        [a, { ...b, config: { ...b.config, interval: 3000 } }],
        b,
        4,
      ).level,
    ).toBe(1);
  });
  it("never promotes when math was ignored", () => {
    const a = sampleSession({
      trainingId: "complex-span",
      config: { ...registry[2].defaultConfig },
      metrics: {
        kind: "complex-span",
        correct: 3,
        total: 3,
        mathCorrect: 0,
        mathTotal: 3,
      },
    });
    expect(nextDifficulty([a, { ...a, id: "s2" }], a, 5).level).toBe(1);
  });
  it("has unique IDs and valid defaults for all six independent modules", () => {
    expect(new Set(registry.map((t) => t.id)).size).toBe(6);
    for (const t of registry) {
      expect(configSchema.safeParse(t.defaultConfig).success).toBe(true);
      expect(t.component).toBeTypeOf("function");
    }
  });
});
