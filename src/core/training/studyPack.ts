import { z } from "zod";
import type { CardDraft } from "./cardImport";

const line = (n: number) => z.string().trim().min(1).max(n);
const strings = (n: number) => z.array(line(n)).max(20);

const qa = z
  .object({
    question: line(1000),
    answer: line(2000),
    explanation: line(4000).optional(),
  })
  .passthrough();

const speaking = z
  .object({
    situation: line(1000),
    sampleAnswers: z.array(line(1000)).min(1).max(5),
    expressions: strings(200).optional(),
  })
  .passthrough();

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

const cardEnvelope = z
  .object({
    subject: line(40),
    deck: line(40),
    type: typeSchema,
    contentVersion: z.number().int().positive(),
    content: z.unknown(),
    tags: strings(40).optional(),
  })
  .passthrough()
  .superRefine((card, context) => {
    const reserved = ["id", "due", "stage", "reviews", "status", "mastered", "updatedAt"];
    if (reserved.some((key) => key in card))
      context.addIssue({
        code: "custom",
        message: "복습 상태와 식별자는 가져오기 파일에서 지정할 수 없습니다.",
      });
  });

const envelope = z
  .object({
    formatVersion: z.literal(1),
    cards: z.array(cardEnvelope).min(1).max(200),
  })
  .passthrough();

export function parseStudyPack(text: string): CardDraft[] {
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    throw Error("올바른 JSON 형식인지 확인하세요.");
  }

  const parsed = envelope.safeParse(json);
  if (!parsed.success)
    throw Error(
      "formatVersion 1과 과목·묶음·유형·contentVersion을 확인하세요. 한 번에 최대 200장입니다.",
    );

  return parsed.data.cards.map(({ content, ...meta }, i) => {
    const result = studyTypes[meta.type].schema.safeParse(content);
    if (!result.success)
      throw Error(
        `${i + 1}번째 카드의 ${result.error.issues[0].path.join(".")} 항목을 확인하세요.`,
      );

    const knownMeta = {
      subject: meta.subject,
      deck: meta.deck,
      type: meta.type,
      contentVersion: meta.contentVersion,
      tags: meta.tags,
    };
    const extensions = Object.fromEntries(
      Object.entries(meta).filter(
        ([key]) => !["subject", "deck", "type", "contentVersion", "tags"].includes(key),
      ),
    );
    const value = result.data as Record<string, unknown>;

    if (meta.type === "speaking") {
      const sampleAnswers = value.sampleAnswers as string[];
      return {
        ...knownMeta,
        content: value,
        extensions,
        question: value.situation as string,
        answer: sampleAnswers[0],
        alternatives: sampleAnswers.slice(1),
        expressions: value.expressions as string[] | undefined,
      };
    }

    return {
      ...knownMeta,
      content: value,
      extensions,
      question: value.question as string,
      answer: value.answer as string,
      explanation: value.explanation as string | undefined,
      hints: value.hints as string[] | undefined,
    };
  });
}
