import {
  render,
  screen,
  fireEvent,
  act,
  cleanup,
} from "@testing-library/react";
import { afterEach, beforeEach, it, expect, vi } from "vitest";
import App from "../app/App";
import { repository } from "../infrastructure/storage/repository";
import { registry } from "../core/training/registry";
import { NbackGame } from "../features/nback/Game";
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});
beforeEach(() => {
  localStorage.clear();
  window.location.hash = "#/training/reasoning";
});
it("completes, persists and reloads a real reasoning session", async () => {
  render(<App />);
  await screen.findByText("이렇게 훈련해요");
  fireEvent.change(screen.getByLabelText("라운드 수"), {
    target: { value: "1" },
  });
  fireEvent.click(screen.getByRole("button", { name: "정식 훈련 시작" }));
  await screen.findByText("왼쪽부터 올바른 순서를 찾아보세요.");
  for (const name of ["가람", "나래", "다온"])
    fireEvent.click(screen.getByRole("button", { name }));
  fireEvent.click(screen.getByRole("button", { name: "정답 확인" }));
  fireEvent.click(screen.getByRole("button", { name: "결과 보기" }));
  await screen.findByText("기록이 이 브라우저에 저장되었습니다.");
  expect(
    (await repository.read()).sessions.filter((s) => s.status === "completed"),
  ).toHaveLength(1);
  cleanup();
  window.location.hash = "#/statistics";
  render(<App />);
  await screen.findByRole("heading", { name: "나의 기록" });
  fireEvent.click(screen.getByRole("button", { name: "조건 누적 추론" }));
  await screen.findByText("완료한 정식 훈련 1회 · 중단 기록 0회");
});
it("invalidates a hidden timed session and excludes its result", async () => {
  render(<App />);
  await screen.findByText("이렇게 훈련해요");
  fireEvent.click(screen.getByRole("button", { name: "정식 훈련 시작" }));
  await screen.findByText("왼쪽부터 올바른 순서를 찾아보세요.");
  Object.defineProperty(document, "hidden", {
    configurable: true,
    value: true,
  });
  fireEvent(document, new Event("visibilitychange"));
  await screen.findByText("잠시 쉬어가요");
  expect((await repository.read()).sessions[0].status).toBe("aborted");
  Object.defineProperty(document, "hidden", {
    configurable: true,
    value: false,
  });
});
it("N-back timer completes once and warmup cannot be answered", async () => {
  vi.useFakeTimers();
  const done = vi.fn();
  render(
    <NbackGame
      config={{ ...registry[0].defaultConfig, rounds: 3, interval: 1000 }}
      onComplete={done}
    />,
  );
  expect(screen.getByRole("button", { name: /같아요/ })).toBeDisabled();
  for (let i = 0; i < 4; i++)
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });
  expect(done).toHaveBeenCalledTimes(1);
  const m = done.mock.calls[0][0];
  expect(m.hit + m.miss + m.falseAlarm + m.correctRejection).toBe(3);
});
