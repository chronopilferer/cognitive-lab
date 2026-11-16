import type { Metrics, Session, Config } from "./types";
export function accuracy(m: Metrics): number {
  switch (m.kind) {
    case "nback":
      return (
        (m.hit + m.correctRejection) /
        Math.max(1, m.hit + m.miss + m.falseAlarm + m.correctRejection)
      );
    case "spaced-repetition":
      return m.remembered / Math.max(1, m.reviewed);
    default:
      return m.correct / Math.max(1, m.total);
  }
}
export function performance(m: Metrics): number {
  if (m.kind === "nback")
    return Math.min(
      m.hit / Math.max(1, m.hit + m.miss),
      1 - m.falseAlarm / Math.max(1, m.falseAlarm + m.correctRejection),
    );
  if (m.kind === "complex-span")
    return Math.min(accuracy(m), m.mathCorrect / Math.max(1, m.mathTotal));
  return accuracy(m);
}
export function conditionKey(c: Config) {
  return JSON.stringify([
    c.level,
    c.interval,
    c.rounds,
    c.variant,
    c.mode,
    c.locations,
    c.deck ?? null,
  ]);
}
export function nextDifficulty(
  sessions: Session[],
  current: Session,
  max: number,
) {
  const c = current.config;
  if (!c.auto || c.mode === "practice")
    return { level: c.level, reason: "직접 선택한 난이도를 유지합니다." };
  // Only consecutive completed training attempts count. A different condition
  // or algorithm breaks the pair instead of searching backwards for old successes.
  const recent = sessions
    .filter(
      (s) =>
        s.trainingId === current.trainingId &&
        s.status === "completed" &&
        s.config.mode === "training" &&
        s.metrics &&
        s.completedAt <= current.completedAt,
    )
    .sort((a, b) => a.completedAt.localeCompare(b.completedAt))
    .slice(-2);
  const eligible = recent.filter(
    (s) =>
      s.algorithmVersion === current.algorithmVersion &&
      s.inputMethod === current.inputMethod &&
      conditionKey(s.config) === conditionKey(c),
  );
  const ceiling =
    current.trainingId === "memory-palace"
      ? Math.min(max, Math.max(1, c.locations.length - 2))
      : max;
  if (eligible.length < 2)
    return {
      level: c.level,
      reason: "같은 조건의 정식 기록 두 번을 모은 뒤 조절합니다.",
    };
  const scores = eligible.map((s) => performance(s.metrics!));
  if (scores.every((s) => s >= 0.8))
    return {
      level: Math.min(ceiling, c.level + 1),
      reason:
        "최근 두 번 모두 목표 수준을 달성했습니다. (N-back은 적중률·오경보율, Complex Span은 계산·기억을 함께 확인)",
    };
  if (scores.every((s) => s < 0.6))
    return {
      level: Math.max(1, c.level - 1),
      reason: "최근 두 번 어려움이 있어 난이도를 낮춥니다.",
    };
  return { level: c.level, reason: "현재 난이도에서 조금 더 연습해 보세요." };
}
export const pct = (n: number) => `${Math.round(n * 100)}%`;
