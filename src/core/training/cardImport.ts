import { deckName } from "./decks";

export interface CardDraft {
  subject?: string;
  type?: string;
  deck?: string;
  question: string;
  answer: string;
}
export function parseCardText(text: string): CardDraft[] {
  const rows = text
    .split(/\r?\n/)
    .map((line, i) => ({ line, number: i + 1 }))
    .filter((r) => r.line.trim());
  if (!rows.length) throw Error("질문과 정답을 한 줄 이상 입력하세요.");
  if (rows.length > 200)
    throw Error("한 번에 최대 200장까지 추가할 수 있습니다.");
  return rows.map(({ line, number }) => {
    const parts = line.split("\t");
    if (parts.length !== 2 || !parts[0].trim() || !parts[1].trim())
      throw Error(`${number}번째 줄: 질문과 정답을 탭 하나로 구분하세요.`);
    const [question, answer] = parts.map((s) => s.trim());
    if (question.length > 1000 || answer.length > 2000)
      throw Error(
        `${number}번째 줄: 질문 1,000자, 정답 2,000자 이내로 입력하세요.`,
      );
    return { question, answer };
  });
}
export function uniqueDrafts(drafts: CardDraft[], existing: CardDraft[]) {
  const key = (c: CardDraft) =>
    JSON.stringify([
      c.subject ?? "미분류",
      c.type ?? "memorization",
      deckName(c),
      c.question.trim(),
      c.answer.trim(),
    ]);
  const seen = new Set(existing.map(key));
  return drafts.filter((c) => {
    const k = key(c);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}
