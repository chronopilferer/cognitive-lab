import { beforeEach, expect, it, vi } from "vitest";
import {
  fireEvent,
  render,
  screen,
  waitFor,
  cleanup,
} from "@testing-library/react";
import { parseCardText, uniqueDrafts } from "../core/training/cardImport";
import {
  LocalStorageRepository,
  repository,
} from "../infrastructure/storage/repository";
import { DataProvider } from "../app/DataProvider";
import { RepetitionGame } from "../features/spaced-repetition/Game";
import { registry } from "../core/training/registry";
import { localDay } from "../shared/utils";
beforeEach(() => {
  cleanup();
  localStorage.clear();
});
it("parses spreadsheet CRLF and rejects incomplete rows before saving", () => {
  expect(parseCardText(" 질문\t 정답\r\n\n두번째\t답")).toEqual([
    { question: "질문", answer: "정답" },
    { question: "두번째", answer: "답" },
  ]);
  expect(() => parseCardText("ok\tanswer\nbad")).toThrow("2번째");
  expect(() => parseCardText("a\tb\tc")).toThrow();
  expect(() => parseCardText(Array(201).fill("a\tb").join("\n"))).toThrow(
    "200",
  );
});
it("deduplicates pairs while preserving different answers to the same question", () => {
  expect(
    uniqueDrafts(
      [
        { question: "q", answer: "a" },
        { question: "q", answer: "b" },
        { question: "q", answer: "b" },
      ],
      [{ question: "q", answer: "a" }],
    ),
  ).toEqual([{ question: "q", answer: "b" }]);
});
it("adds a batch once and preserves old schedules and records", async () => {
  const r = new LocalStorageRepository();
  await r.saveCard({
    id: "old",
    question: "q",
    answer: "a",
    stage: 3,
    due: "2030-01-01",
    updatedAt: new Date().toISOString(),
  });
  await r.addCards([
    { question: "q", answer: "a" },
    { question: "new", answer: "answer" },
  ]);
  await r.addCards([{ question: "new", answer: "answer" }]);
  const d = await r.read();
  expect(d.cards).toHaveLength(2);
  expect(d.cards[0].due).toBe("2030-01-01");
  expect(d.cards[1].due).toBe(localDay());
});
it("does not partially write an invalid batch", async () => {
  const r = new LocalStorageRepository();
  await r.addCards([{ question: "existing", answer: "a" }]);
  await expect(
    r.addCards([
      { question: "valid", answer: "answer" },
      { question: "", answer: "invalid" },
    ]),
  ).rejects.toThrow();
  expect((await r.read()).cards).toHaveLength(1);
});
it("keeps a typed retrieval answer for comparison, clears it on the next card, and practice leaves schedules unchanged", async () => {
  await repository.addCards([
    { question: "first question", answer: "first answer" },
    { question: "second question", answer: "second answer" },
  ]);
  const before = (await repository.read()).cards;
  const done = vi.fn();
  render(
    <DataProvider>
      <RepetitionGame
        config={{
          ...registry.find((t) => t.id === "spaced-repetition")!.defaultConfig,
          mode: "practice",
        }}
        onComplete={done}
      />
    </DataProvider>,
  );
  await screen.findByRole("checkbox", { name: "답을 직접 적어 보기" });
  fireEvent.click(
    screen.getByRole("checkbox", { name: "답을 직접 적어 보기" }),
  );
  fireEvent.change(screen.getByRole("textbox", { name: /내가 떠올린 답/ }), {
    target: { value: "my own answer" },
  });
  fireEvent.click(screen.getByRole("button", { name: "정답 확인" }));
  expect(screen.getByRole("textbox")).toHaveValue("my own answer");
  expect(screen.getByRole("textbox")).toHaveAttribute("readonly");
  fireEvent.click(screen.getByRole("button", { name: /^기억함/ }));
  await waitFor(() => expect(screen.getByRole("textbox")).toHaveValue(""));
  expect((await repository.read()).cards).toEqual(before);
  expect(done).not.toHaveBeenCalled();
});
