import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { ReasoningGame } from "../features/reasoning";
import { NbackGame } from "../features/nback";
import { PalaceGame } from "../features/memory-palace";
import { ComplexSpanGame } from "../features/complex-span";
import { Recall } from "../shared/components/Recall";
import { registry } from "../core/training/registry";
import { nextDifficulty } from "../core/training/scoring";
import { scheduleCard } from "../features/spaced-repetition/engine";
import { satisfies } from "../features/reasoning/engine";
import type { Session } from "../core/training/types";
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});
const config = (id: string) => registry.find((t) => t.id === id)!.defaultConfig;
const session = (id: string, level = 1): Session => ({
  id,
  trainingId: "nback",
  startedAt: `2026-11-15T00:0${id}:00.000Z`,
  completedAt: `2026-11-15T00:0${id}:30.000Z`,
  status: "completed",
  algorithmVersion: 2,
  durationSeconds: 30,
  inputMethod: "pointer",
  config: { ...config("nback"), level },
  metrics: {
    kind: "nback",
    hit: 6,
    miss: 0,
    falseAlarm: 0,
    correctRejection: 14,
    reactionMs: [],
  },
});
it("memory reasoning locks all answer entry until clues disappear", async () => {
  vi.useFakeTimers();
  const { container } = render(
    <ReasoningGame
      config={{ ...config("reasoning"), variant: "memory" }}
      onComplete={vi.fn()}
    />,
  );
  expect(screen.getByRole("button", { name: "가람" })).toBeDisabled();
  expect(container.querySelectorAll(".clue").length).toBeGreaterThan(0);
  await act(async () => {
    await vi.advanceTimersByTimeAsync(14999);
  });
  expect(screen.getByRole("button", { name: "가람" })).toBeDisabled();
  await act(async () => {
    await vi.advanceTimersByTimeAsync(1);
  });
  expect(container.querySelectorAll(".clue")).toHaveLength(0);
  expect(screen.getByRole("button", { name: "가람" })).toBeEnabled();
});
it("memory reasoning practice explicitly hides clues before answering", () => {
  const { container } = render(
    <ReasoningGame
      config={{ ...config("reasoning"), variant: "memory", mode: "practice" }}
      onComplete={vi.fn()}
    />,
  );
  expect(screen.getByRole("button", { name: "가람" })).toBeDisabled();
  fireEvent.click(screen.getByRole("button", { name: "조건을 기억했어요" }));
  expect(container.querySelectorAll(".clue")).toHaveLength(0);
  expect(screen.getByRole("button", { name: "가람" })).toBeEnabled();
});
it("timed N-back has a blank boundary even for identical stimuli and retains full response window", async () => {
  vi.useFakeTimers();
  const { container } = render(
    <NbackGame
      config={{ ...config("nback"), interval: 1000 }}
      onComplete={vi.fn()}
    />,
  );
  expect(container.querySelector(".nback-grid")).not.toBeNull();
  await act(async () => {
    await vi.advanceTimersByTimeAsync(750);
  });
  expect(screen.getByLabelText("자극 사이 빈 구간")).toBeInTheDocument();
  await act(async () => {
    await vi.advanceTimersByTimeAsync(250);
  });
  expect(container.querySelector(".nback-grid")).not.toBeNull();
  expect(screen.getByRole("button", { name: /같아요/ })).toBeEnabled();
});
it("N-back practice gives feedback before moving, and scores only once", () => {
  const done = vi.fn();
  render(
    <NbackGame
      config={{ ...config("nback"), mode: "practice", rounds: 1 }}
      onComplete={done}
    />,
  );
  fireEvent.click(screen.getByRole("button", { name: "판정 확인" }));
  expect(screen.getByRole("status")).toHaveTextContent("준비 자극");
  fireEvent.click(screen.getByRole("button", { name: "다음 자극 →" }));
  fireEvent.click(screen.getByRole("button", { name: /같아요/ }));
  fireEvent.click(screen.getByRole("button", { name: "판정 확인" }));
  expect(screen.getByRole("status")).toHaveTextContent("정답");
  fireEvent.click(screen.getByRole("button", { name: "다음 자극 →" }));
  expect(done).toHaveBeenCalledTimes(1);
  expect(done.mock.calls[0][0].hit).toBe(1);
});
it("timed palace ends encoding automatically and gives no manual unlimited study", async () => {
  vi.useFakeTimers();
  const { container } = render(
    <PalaceGame
      config={{ ...config("memory-palace"), interval: 1000 }}
      onComplete={vi.fn()}
    />,
  );
  expect(screen.queryByRole("button", { name: "다음 장소로" })).toBeNull();
  for (let i = 0; i < 3; i++)
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });
  expect(container.querySelector(".palace-word")).toBeNull();
  expect(screen.getAllByPlaceholderText("기억나는 단어")).toHaveLength(3);
});
it("complex-span arithmetic timeout cannot be counted as a correct calculation", async () => {
  vi.useFakeTimers();
  const done = vi.fn();
  render(
    <ComplexSpanGame
      config={{ ...config("complex-span"), interval: 1000 }}
      onComplete={done}
    />,
  );
  for (let i = 0; i < 3; i++) {
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(5000);
    });
  }
  for (let i = 0; i < 3; i++)
    fireEvent.click(
      screen.getByRole("button", { name: "이 자리는 모르겠어요" }),
    );
  fireEvent.click(screen.getByRole("button", { name: "제출하기" }));
  fireEvent.click(screen.getByRole("button", { name: "결과 보기" }));
  expect(done.mock.calls[0][0].mathCorrect).toBe(0);
  expect(done.mock.calls[0][0].correct).toBe(0);
});
it("unknown recall positions do not shift later known answers", () => {
  const done = vi.fn();
  render(<Recall length={3} alphabet={["1", "2", "3"]} onSubmit={done} />);
  fireEvent.click(screen.getByRole("button", { name: "1" }));
  fireEvent.click(screen.getByRole("button", { name: "이 자리는 모르겠어요" }));
  fireEvent.click(screen.getByRole("button", { name: "3" }));
  fireEvent.click(screen.getByRole("button", { name: "제출하기" }));
  expect(done).toHaveBeenCalledWith(["1", "", "3"]);
});
it("a different-condition completed attempt breaks a difficulty promotion pair", () => {
  const a = session("1"),
    b = session("2", 2),
    c = session("3");
  expect(nextDifficulty([a, b, c], c, 4).level).toBe(1);
  expect(nextDifficulty([a, c], c, 4).level).toBe(2);
  expect(nextDifficulty([a, { ...c, algorithmVersion: 1 }], c, 4).level).toBe(
    1,
  );
});
it("palace auto-level never exceeds available location count", () => {
  const a = {
    ...session("1"),
    trainingId: "memory-palace" as const,
    config: { ...config("memory-palace"), locations: ["현관", "거실", "주방"] },
    metrics: {
      kind: "memory-palace" as const,
      correct: 3,
      total: 3,
      delaySeconds: 0,
    },
  };
  const b = { ...a, id: "2", completedAt: "2026-11-15T00:02:30.000Z" };
  expect(nextDifficulty([a, b], b, 6).level).toBe(1);
});
it("a hard card returns to short intervals instead of jumping straight back to months", () => {
  const c = {
    id: "c",
    question: "q",
    answer: "a",
    due: "2026-11-15",
    updatedAt: "2026-11-15T00:00:00.000Z",
    stage: 8,
  };
  const hard = scheduleCard(c, "hard", "2026-11-15");
  expect(hard.stage).toBe(0);
  expect(scheduleCard(hard, "good", "2026-11-16").due).toBe("2026-11-17");
});
it("missing names cannot satisfy an ordering clue", () => {
  expect(satisfies(["나래"], { before: "가람", after: "나래" })).toBe(false);
});
