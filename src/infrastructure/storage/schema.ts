import { z } from "zod";
const count = z.number().int().min(0).max(1000000);
const ratioCount = count;
export const configSchema = z.object({
  level: z.number().int().min(1).max(8),
  interval: z.number().int().min(500).max(10000),
  rounds: z.number().int().min(1).max(100),
  variant: z.string().max(40),
  mode: z.enum(["practice", "training"]),
  auto: z.boolean(),
  deck: z.string().trim().min(1).max(40).optional(),
  locations: z.array(z.string().min(1).max(40)).max(12),
});
export const metricSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("nback"),
    hit: count,
    miss: count,
    falseAlarm: count,
    correctRejection: count,
    reactionMs: z.array(z.number().min(0).max(60000)).max(100),
  }),
  z.object({
    kind: z.literal("running-span"),
    correct: count,
    total: count,
    perfect: count,
    rounds: count,
  }),
  z.object({
    kind: z.literal("complex-span"),
    correct: count,
    total: count,
    mathCorrect: count,
    mathTotal: count,
  }),
  z.object({
    kind: z.literal("reasoning"),
    correct: count,
    total: count,
    seconds: z.number().min(0).max(86400),
  }),
  z.object({
    kind: z.literal("memory-palace"),
    correct: count,
    total: count,
    delaySeconds: count,
  }),
  z.object({
    kind: z.literal("spaced-repetition"),
    remembered: ratioCount,
    reviewed: count,
  }),
]);
const limits: Record<string, { max: number; variants: string[] }> = {
  nback: { max: 4, variants: ["position", "letter"] },
  "running-span": { max: 5, variants: ["default"] },
  "complex-span": { max: 5, variants: ["default"] },
  reasoning: { max: 3, variants: ["visible", "memory"] },
  "memory-palace": { max: 6, variants: ["immediate", "delayed"] },
  "spaced-repetition": { max: 1, variants: ["default"] },
};
function validConfig(id: string, c: z.infer<typeof configSchema>) {
  const l = limits[id];
  return (
    !!l &&
    c.level <= l.max &&
    l.variants.includes(c.variant) &&
    (id !== "memory-palace" || c.locations.length >= c.level + 2)
  );
}
export const sessionSchema = z
  .object({
    id: z.string().min(1).max(100),
    trainingId: z.enum([
      "nback",
      "running-span",
      "complex-span",
      "reasoning",
      "memory-palace",
      "spaced-repetition",
    ]),
    startedAt: z.iso.datetime(),
    completedAt: z.iso.datetime(),
    status: z.enum(["completed", "aborted"]),
    config: configSchema,
    algorithmVersion: z.union([z.literal(1), z.literal(2)]),
    durationSeconds: z.number().min(0).max(86400),
    metrics: metricSchema.nullable(),
    inputMethod: z.enum(["keyboard", "pointer", "mixed", "unknown"]),
  })
  .superRefine((s, c) => {
    if (!validConfig(s.trainingId, s.config))
      c.addIssue({ code: "custom", message: "훈련 설정 범위 오류" });
    if (
      (s.status === "completed" && !s.metrics) ||
      (s.metrics && s.metrics.kind !== s.trainingId)
    )
      c.addIssue({
        code: "custom",
        message: "훈련과 결과가 일치하지 않습니다.",
      });
    const m = s.metrics;
    if (m && "correct" in m && m.correct > m.total)
      c.addIssue({ code: "custom", message: "정답 수가 전체 수보다 큽니다." });
    if (m?.kind === "complex-span" && m.mathCorrect > m.mathTotal)
      c.addIssue({ code: "custom", message: "계산 결과 오류" });
    if (m?.kind === "spaced-repetition" && m.remembered > m.reviewed)
      c.addIssue({ code: "custom", message: "복습 결과 오류" });
    if (s.completedAt < s.startedAt)
      c.addIssue({ code: "custom", message: "시각 순서 오류" });
  });
export const cardSchema = z.object({
  id: z.string().min(1).max(100),
  deck: z.string().trim().min(1).max(40).optional(),
  question: z.string().min(1).max(1000),
  answer: z.string().min(1).max(2000),
  due: z.iso.date(),
  stage: z.number().int().min(0).max(8),
  updatedAt: z.iso.datetime(),
});
export const dataSchema = z
  .object({
    schemaVersion: z.literal(1),
    sessions: z.array(sessionSchema).max(5000),
    cards: z.array(cardSchema).max(2000),
    settings: z.object({
      theme: z.enum(["light", "dark"]),
      configs: z.record(z.string(), configSchema),
    }),
  })
  .superRefine((d, c) => {
    if (
      new Set(d.sessions.map((s) => s.id)).size !== d.sessions.length ||
      new Set(d.cards.map((s) => s.id)).size !== d.cards.length
    )
      c.addIssue({ code: "custom", message: "중복 ID가 있습니다." });
    for (const [id, config] of Object.entries(d.settings.configs))
      if (!validConfig(id, config))
        c.addIssue({
          code: "custom",
          message: "설정이 지원 범위를 벗어납니다.",
        });
  });
export type Data = z.infer<typeof dataSchema>;
export type Card = z.infer<typeof cardSchema>;
export function validateData(raw: unknown): Data {
  return dataSchema.parse(raw);
}
/** v1 is the initial schema. Unknown versions are rejected, never silently downgraded. */
export function migrate(raw: unknown): Data {
  return validateData(raw);
}
export const emptyData = (): Data => ({
  schemaVersion: 1,
  sessions: [],
  cards: [],
  settings: { theme: "light", configs: {} },
});
