import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { afterEach, it, expect, vi } from "vitest";
import { RunningSpanGame } from "../features/running-span";
import { ComplexSpanGame } from "../features/complex-span";
import { PalaceGame } from "../features/memory-palace";
import { RepetitionGame } from "../features/spaced-repetition";
import { registry } from "../core/training/registry";
import { DataProvider } from "../app/DataProvider";
import { repository } from "../infrastructure/storage/repository";
import { localDay } from "../shared/utils";
afterEach(() => {
  cleanup();
  localStorage.clear();
});
it("running span presents one digit at a time and scores last K in order", () => {
  const done = vi.fn();
  const { container } = render(
    <RunningSpanGame
      config={{ ...registry[1].defaultConfig, mode: "practice", rounds: 1 }}
      onComplete={done}
    />,
  );
  const seen: string[] = [];
  while (container.querySelector(".big-stimulus")) {
    seen.push(container.querySelector(".big-stimulus")!.textContent!);
    fireEvent.click(screen.getByRole("button", { name: "다음 숫자" }));
  }
  for (const digit of seen.slice(-3))
    fireEvent.click(screen.getByRole("button", { name: digit }));
  fireEvent.click(screen.getByRole("button", { name: "제출하기" }));
  expect(screen.getByText("3 / 3개를 기억했어요")).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "결과 보기" }));
  expect(done).toHaveBeenCalledWith({
    kind: "running-span",
    correct: 3,
    total: 3,
    perfect: 1,
    rounds: 1,
  });
});
it("complex span separates arithmetic and memory and recalls the actual letters", () => {
  const done = vi.fn();
  const { container } = render(
    <ComplexSpanGame
      config={{ ...registry[2].defaultConfig, mode: "practice" }}
      onComplete={done}
    />,
  );
  const letters: string[] = [];
  for (let i = 0; i < 3; i++) {
    letters.push(container.querySelector(".big-stimulus")!.textContent!);
    fireEvent.click(screen.getByRole("button", { name: "기억했어요" }));
    const nums = container
      .querySelector(".math-stimulus")!
      .textContent!.match(/\d+/g)!
      .map(Number);
    fireEvent.click(
      screen.getByRole("button", {
        name: nums[0] + nums[1] === nums[2] ? "참" : "거짓",
      }),
    );
  }
  for (const letter of letters)
    fireEvent.click(screen.getByRole("button", { name: letter }));
  fireEvent.click(screen.getByRole("button", { name: "제출하기" }));
  fireEvent.click(screen.getByRole("button", { name: "결과 보기" }));
  expect(done).toHaveBeenCalledWith({
    kind: "complex-span",
    correct: 3,
    total: 3,
    mathCorrect: 3,
    mathTotal: 3,
  });
});
it("palace words disappear during recall and partial answers are scored", () => {
  const done = vi.fn();
  const { container } = render(
    <PalaceGame
      config={{ ...registry[4].defaultConfig, mode: "practice" }}
      onComplete={done}
    />,
  );
  const words: string[] = [];
  for (let i = 0; i < 3; i++) {
    words.push(container.querySelector(".palace-word")!.textContent!);
    fireEvent.click(
      screen.getByRole("button", {
        name: i === 2 ? "회상 시작" : "다음 장소로",
      }),
    );
  }
  expect(container.querySelector(".palace-word")).toBeNull();
  const inputs = screen.getAllByPlaceholderText("기억나는 단어");
  fireEvent.change(inputs[0], { target: { value: words[0] } });
  fireEvent.change(inputs[2], { target: { value: words[2] } });
  fireEvent.click(screen.getByRole("button", { name: "회상 결과 확인" }));
  fireEvent.click(screen.getByRole("button", { name: "결과 보기" }));
  expect(done).toHaveBeenCalledWith({
    kind: "memory-palace",
    correct: 2,
    total: 3,
    delaySeconds: 0,
  });
});
it("retrieval reveals answer only on request and schedules a due card", async () => {
  const done = vi.fn();
  await repository.saveCard({
    id: "card",
    question: "BFS 자료구조?",
    answer: "큐",
    due: localDay(),
    stage: 0,
    updatedAt: new Date().toISOString(),
  });
  render(
    <DataProvider>
      <RepetitionGame config={registry[5].defaultConfig} onComplete={done} />
    </DataProvider>,
  );
  await screen.findByText("BFS 자료구조?");
  expect(screen.queryByText("큐")).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "정답 확인" }));
  expect(screen.getByText("큐")).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: /기억함/ }));
  await vi.waitFor(() => expect(done).toHaveBeenCalledTimes(1));
  expect((await repository.read()).cards[0].stage).toBe(1);
  expect((await repository.read()).cards[0].due > localDay()).toBe(true);
});
