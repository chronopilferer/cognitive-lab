import type { Card } from "../../infrastructure/storage/schema";
import { localDay } from "../../shared/utils";
import { isReviewable } from "../../core/training/decks";

export function studyProgress(cards: Card[], today = localDay()) {
  const subjects = new Map<
    string,
    { total: number; due: number; done: number }
  >();
  let due = 0,
    done = 0,
    again = 0,
    latest = "";
  for (const card of cards) {
    const name = card.subject || "미분류";
    const group = subjects.get(name) ?? { total: 0, due: 0, done: 0 };
    group.total++;
    if (isReviewable(card) && card.due <= today) {
      due++;
      group.due++;
    }
    let reviewed = false,
      missed = false;
    for (const review of card.reviews ?? []) {
      const day = localDay(new Date(review.at));
      if (day > latest) latest = day;
      if (day === today) {
        reviewed = true;
        missed ||= review.rating === "again";
      }
    }
    if (reviewed) {
      done++;
      group.done++;
    }
    if (missed) again++;
    subjects.set(name, group);
  }
  return { due, done, again, latest, subjects };
}

export function StudyProgress({
  progress,
  detailed = false,
}: {
  progress: ReturnType<typeof studyProgress>;
  detailed?: boolean;
}) {
  return (
    <section className="panel">
      <h2>카드 복습 현황</h2>
      <p>
        오늘 복습 완료 {progress.done}장 · 복습 예정 {progress.due}장
      </p>
      <p>최근 복습일 {progress.latest || "기록 없음"}</p>
      {detailed && (
        <p>오늘 ‘기억 못함’으로 자기평가한 카드 {progress.again}장</p>
      )}
      {progress.subjects.size > 0 && (
        <details open={detailed || undefined}>
          <summary>과목별 현황</summary>
          <ul>
            {Array.from(progress.subjects, ([name, group]) => (
              <li key={name}>
                {name} · 전체 {group.total}장 · 예정 {group.due}장 · 오늘 완료{" "}
                {group.done}장
              </li>
            ))}
          </ul>
        </details>
      )}
    </section>
  );
}
