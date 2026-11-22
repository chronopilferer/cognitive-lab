import { expect, it } from "vitest";
import { parseStudyPack } from "../core/training/studyPack";
import { reviewCards } from "../core/training/decks";
import { LocalStorageRepository } from "../infrastructure/storage/repository";
import { registry } from "../core/training/registry";
const source = {
  subject: "자료구조",
  deck: "AVL",
  type: "application",
  contentVersion: 1,
  content: { question: "30, 10, 20?", answer: "LR", hints: ["경로 확인"] },
};
const pack = (cards: unknown[]) => JSON.stringify({ formatVersion: 1, cards });
it("validates the entire pack before insertion and rejects caller-supplied progress", () => {
  expect(() =>
    parseStudyPack(pack([source, { ...source, stage: 7 }])),
  ).toThrow();
  expect(() =>
    parseStudyPack(pack([{ ...source, type: "speaking" }])),
  ).toThrow();
  expect(
    parseStudyPack(
      pack([
        {
          ...source,
          type: "speaking",
          content: {
            situation: "영화 추천",
            sampleAnswers: ["Try this movie."],
          },
        },
      ]),
    )[0].question,
  ).toBe("영화 추천");
});
it("preserves content, ID and schedule across archive, restore and JSON backup", async () => {
  localStorage.clear();
  const repo = new LocalStorageRepository();
  const drafts = parseStudyPack(pack([source, source]));
  const {
    cards: [card],
  } = await repo.addCards(drafts);
  expect((await repo.read()).cards).toHaveLength(1);
  const config = registry[5].defaultConfig;
  const archived = await repo.updateCardGroup([card], { status: "archived" });
  expect(reviewCards(archived.cards, config)).toEqual([]);
  const saved = JSON.parse(await repo.exportData());
  await repo.importData(saved, "replace");
  const restored = await repo.updateCardGroup(saved.cards, {
    status: "active",
  });
  expect(reviewCards(restored.cards, config)[0]).toMatchObject({
    id: card.id,
    stage: card.stage,
    due: card.due,
    hints: ["경로 확인"],
  });
});
