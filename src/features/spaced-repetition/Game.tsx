import { studyTypes } from "../../core/training/studyPack";
import { useRef, useState } from "react";
import type { GameProps } from "../../core/training/types";
import { useData } from "../../app/DataProvider";
import { repository } from "../../infrastructure/storage/repository";
import { reviewCards } from "../../core/training/decks";
import { scheduleCard } from "./engine";
export function RepetitionGame({ config: c, onComplete }: GameProps) {
  const { data, act } = useData();
  const [cards] = useState(() => reviewCards(data.cards, c));
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [written, setWritten] = useState("");
  const [writeMode, setWriteMode] = useState(false);
  const [busy, setBusy] = useState(false);
  const remembered = useRef(0);
  const locked = useRef(false);
  const [hint, setHint] = useState(0);
  const card = cards[index];
  const behavior =
    studyTypes[(card?.type ?? "memorization") as keyof typeof studyTypes];
  async function rate(rating: "again" | "hard" | "good") {
    if (locked.current) return;
    locked.current = true;
    setBusy(true);
    if (
      c.mode === "training" &&
      !(await act(() =>
        repository.saveCard(
          {
            ...scheduleCard(card, rating),
            reviews: [
              ...(card.reviews ?? []),
              {
                rating,
                at: new Date().toISOString(),
                hintUsed: hint > 0,
                assessment: "self",
              },
            ],
          },
          card.updatedAt,
        ),
      ))
    ) {
      locked.current = false;
      setBusy(false);
      return;
    }
    remembered.current += Number(rating === "good");
    if (index + 1 === cards.length) {
      onComplete({
        kind: "spaced-repetition",
        remembered: remembered.current,
        reviewed: cards.length,
      });
      return;
    }
    setIndex((i) => i + 1);
    setRevealed(false);
    setHint(0);
    setWritten("");
    locked.current = false;
    setBusy(false);
  }
  if (!card)
    return (
      <div className="empty-state">
        <h2>지금 복습할 카드가 없습니다.</h2>
        <p>
          훈련을 나가서 카드를 추가하거나, 연습 모드로 모든 카드를 복습할 수
          있어요.
        </p>
      </div>
    );
  return (
    <>
      <div className="trial-meta">
        <span>
          카드 {index + 1} / {cards.length}
        </span>
        <span>
          {c.mode === "practice" ? "연습 · 복습 일정 변경 없음" : "인출 연습"}
        </span>
      </div>
      {!revealed && (
        <label className="check-label">
          <input
            type="checkbox"
            checked={writeMode}
            onChange={(e) => setWriteMode(e.target.checked)}
          />
          답을 직접 적어 보기
        </label>
      )}
      <div className="flashcard">
        <span className="eyebrow">{behavior?.prompt}</span>
        <h2>{card.question}</h2>
        {(writeMode || card.type === "explanation") && (
          <label className="written-recall">
            내가 떠올린 답
            <textarea
              value={written}
              maxLength={2000}
              readOnly={revealed}
              onChange={(e) => setWritten(e.target.value)}
              placeholder="기억나는 만큼 적어보세요. 빈칸이어도 정답을 확인할 수 있어요."
            />
            <small>이번 카드에서만 표시하며 저장·자동 채점하지 않습니다.</small>
          </label>
        )}
        {!revealed && card.type === "application" && !!card.hints?.length && (
          <div>
            {card.hints.slice(0, hint).map((h, i) => (
              <p key={i}>{h}</p>
            ))}
            {hint < card.hints.length && (
              <button onClick={() => setHint(hint + 1)}>다음 힌트</button>
            )}
          </div>
        )}
        {revealed ? (
          <div className="revealed-answer">
            {card.answer}
            {[
              ...(card.alternatives ?? []),
              ...(card.expressions ?? []),
              card.explanation,
            ]
              .filter(Boolean)
              .map((v, i) => (
                <p key={i}>{v}</p>
              ))}
          </div>
        ) : (
          <button className="primary" onClick={() => setRevealed(true)}>
            정답 확인
          </button>
        )}
      </div>
      {revealed && (
        <>
          <p className="center muted">
            정답을 보기 전에 얼마나 기억했나요? 표현이 달라도 핵심 내용이 맞는지
            직접 비교하세요.
          </p>
          <div className="button-row wrap">
            {(
              [
                ["again", "기억 못함", "1일 후"],
                ["hard", "어려움", "1일 후"],
                ["good", "기억함", "간격 늘리기"],
              ] as const
            ).map(([value, label]) => (
              <button
                className={value === "good" ? "primary" : "secondary"}
                key={value}
                onClick={() => void rate(value)}
                disabled={busy}
              >
                {label}
                <small>
                  {c.mode === "practice"
                    ? "일정 유지"
                    : `${scheduleCard(card, value).due} 복습`}
                </small>
              </button>
            ))}
          </div>
        </>
      )}
    </>
  );
}
