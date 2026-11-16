import { afterEach, beforeEach, expect, it } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import App from "../app/App";
import { repository } from "../infrastructure/storage/repository";
import {
  emptyData,
  validateData,
  type Card,
} from "../infrastructure/storage/schema";
import { cardsInDeck, deckName, reviewCards } from "../core/training/decks";
import { registry } from "../core/training/registry";
import { conditionKey } from "../core/training/scoring";
const config = registry.find(
  (t) => t.id === "spaced-repetition",
)!.defaultConfig;
const legacy: Card = {
  id: "legacy",
  question: "기존 질문",
  answer: "기존 답",
  due: "2026-01-01",
  stage: 4,
  updatedAt: "2026-01-01T00:00:00.000Z",
};
beforeEach(() => {
  localStorage.clear();
  window.location.hash = "#/training/spaced-repetition";
});
afterEach(cleanup);
it("loads old backups into the default deck and round-trips deck data", async () => {
  await repository.importData(
    validateData({ ...emptyData(), cards: [legacy] }),
    "replace",
  );
  expect(deckName((await repository.read()).cards[0])).toBe("기본 묶음");
  await repository.saveCard({ ...legacy, deck: "자료구조" }, legacy.updatedAt);
  const restored = validateData(JSON.parse(await repository.exportData()));
  expect(restored.cards[0]).toEqual({ ...legacy, deck: "자료구조" });
  expect(cardsInDeck(restored.cards, "기본 묶음")).toHaveLength(0);
});
it("filters by deck before limiting, keeps future cards out of training, and distinguishes conditions", () => {
  const cards = [
    legacy,
    { ...legacy, id: "sql", deck: "SQL" },
    { ...legacy, id: "future", deck: "SQL", due: "2030-01-01" },
  ];
  expect(
    reviewCards(
      cards,
      { ...config, deck: "SQL", mode: "training" },
      "2026-11-16",
    ).map((c) => c.id),
  ).toEqual(["sql"]);
  expect(
    reviewCards(
      cards,
      { ...config, deck: "SQL", mode: "practice" },
      "2026-11-16",
    ),
  ).toHaveLength(2);
  expect(reviewCards(cards, { ...config, deck: "없는 묶음" })).toHaveLength(0);
  expect(conditionKey({ ...config, deck: "SQL" })).not.toBe(
    conditionKey(config),
  );
});
it("deduplicates only inside the same deck including legacy default cards", async () => {
  await repository.saveCard(legacy);
  await repository.addCards([
    { question: legacy.question, answer: legacy.answer, deck: "기본 묶음" },
    { question: legacy.question, answer: legacy.answer, deck: "SQL" },
    { question: legacy.question, answer: legacy.answer, deck: "SQL" },
  ]);
  expect((await repository.read()).cards).toHaveLength(2);
});
it("rejects stale updates and never resurrects a deleted card", async () => {
  await repository.saveCard(legacy);
  const newer = {
    ...legacy,
    deck: "SQL",
    updatedAt: "2026-11-16T00:00:00.000Z",
  };
  await repository.saveCard(newer, legacy.updatedAt);
  await expect(repository.saveCard(legacy, legacy.updatedAt)).rejects.toThrow(
    "변경되거나 삭제",
  );
  expect((await repository.read()).cards[0]).toEqual(newer);
  await repository.deleteCard(legacy.id);
  await expect(repository.saveCard(newer, newer.updatedAt)).rejects.toThrow();
  expect((await repository.read()).cards).toHaveLength(0);
});
it("moves an existing card without resetting its schedule and practices only that deck", async () => {
  await repository.saveCard(legacy);
  await repository.addCards([
    { question: "다른 질문", answer: "다른 답", deck: "영어" },
  ]);
  render(<App />);
  fireEvent.click(
    await screen.findByRole("button", { name: "기존 질문 수정" }),
  );
  fireEvent.change(screen.getByRole("combobox", { name: /저장할 묶음/ }), {
    target: { value: "자료구조" },
  });
  fireEvent.click(screen.getByRole("button", { name: "수정 저장" }));
  await screen.findByText("학습 카드를 저장했습니다.");
  const card = (await repository.read()).cards.find((c) => c.id === legacy.id)!;
  expect(card).toMatchObject({
    deck: "자료구조",
    due: legacy.due,
    stage: legacy.stage,
  });
  expect(
    screen.getByRole("combobox", { name: /훈련할 카드 묶음/ }),
  ).toHaveValue("자료구조");
  fireEvent.click(screen.getByRole("button", { name: "먼저 연습해 보기" }));
  await screen.findByText("카드 1 / 1");
  fireEvent.click(screen.getByRole("button", { name: "정답 확인" }));
  fireEvent.click(screen.getByRole("button", { name: /^기억함/ }));
  await screen.findByText("연습을 마쳤습니다. 결과는 저장하지 않았습니다.");
  expect(
    (await repository.read()).cards.find((c) => c.id === legacy.id),
  ).toEqual(card);
});
it("prevents repeated single-card submissions", async () => {
  render(<App />);
  fireEvent.change(
    await screen.findByRole("textbox", { name: "질문" }),
    { target: { value: "한 장" } },
  );
  fireEvent.change(screen.getByRole("textbox", { name: "정답" }), {
    target: { value: "정답" },
  });
  const button = screen.getByRole("button", { name: "카드 추가" });
  fireEvent.click(button);
  fireEvent.click(button);
  await waitFor(async () =>
    expect((await repository.read()).cards).toHaveLength(1),
  );
});
