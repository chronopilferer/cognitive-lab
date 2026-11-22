import { z } from "zod";
const line = (n: number) => z.string().trim().min(1).max(n);
const strings = (n: number) => z.array(line(n)).max(20);
const qa = z
  .object({
    question: line(1000),
    answer: line(2000),
    explanation: line(4000).optional(),
  })
  .strict();
const speaking = z
  .object({
    situation: line(1000),
    sampleAnswers: z.array(line(1000)).min(1).max(5),
    expressions: strings(200).optional(),
  })
  .strict();
export const studyTypes = {
  memorization: { schema: qa, label: "암기형", prompt: "답을 떠올려 보세요" },
  explanation: {
    schema: qa,
    label: "설명형",
    prompt: "자신의 말로 설명해 보세요",
  },
  application: {
    schema: qa.extend({ hints: strings(500).optional() }),
    label: "응용형",
    prompt: "먼저 직접 풀어 보세요",
  },
  speaking: {
    schema: speaking,
    label: "회화형",
    prompt: "상황에 맞게 영어로 말해 보세요",
  },
};
export const typeSchema = z.enum([
  "memorization",
  "explanation",
  "application",
  "speaking",
]);
const envelope = z
  .object({
    formatVersion: z.literal(1),
    cards: z
      .array(
        z
          .object({
            subject: line(40),
            deck: line(40),
            type: typeSchema,
            contentVersion: z.literal(1),
            content: z.unknown(),
            tags: strings(40).optional(),
          })
          .strict(),
      )
      .min(1)
      .max(200),
  })
  .strict();
export function parseStudyPack(text: string) {
  const parsed = envelope.safeParse(JSON.parse(text));
  if (!parsed.success)
    throw Error(
      "formatVersion 1, 과목·묶음·유형·contentVersion 1을 확인하세요. 한 번에 최대 200장입니다.",
    );
  return parsed.data.cards.map(({ content, ...meta }, i) => {
    const result = studyTypes[meta.type].schema.safeParse(content);
    if (!result.success)
      throw Error(
        `${i + 1}번째 카드의 ${result.error.issues[0].path.join(".")} 항목을 확인하세요.`,
      );
    const v = result.data;
    if ("situation" in v)
      return {
        ...meta,
        question: v.situation,
        answer: v.sampleAnswers[0],
        alternatives: v.sampleAnswers.slice(1),
        expressions: v.expressions,
      };
    return {
      ...meta,
      question: v.question,
      answer: v.answer,
      explanation: v.explanation,
      hints: "hints" in v ? v.hints : undefined,
    };
  });
}
