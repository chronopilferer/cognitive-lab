import { useRef, useState } from "react";
import type { GameProps } from "../../core/training/types";
import { generateReasoning, satisfies } from "./engine";
import { useDeadline } from "../../shared/hooks/useDeadline";
export function ReasoningGame({ config: c, onComplete }: GameProps) {
  const [round, setRound] = useState(0);
  const [problem, setProblem] = useState(() => generateReasoning(c.level));
  const [answer, setAnswer] = useState<string[]>([]);
  const [feedback, setFeedback] = useState(false);
  const [hidden, setHidden] = useState(false);
  const totals = useRef({ correct: 0, seconds: 0 });
  const began = useRef(performance.now());
  const locked = useRef(false);
  useDeadline(
    round,
    c.variant === "memory" && c.mode === "training" ? 15000 : null,
    () => {
      setHidden(true);
      began.current = performance.now();
    },
  );
  const studying = c.variant === "memory" && !hidden && !feedback;
  function submit() {
    if (
      locked.current ||
      studying ||
      answer.length !== problem.people.length ||
      new Set(answer).size !== problem.people.length
    )
      return;
    locked.current = true;
    totals.current.correct += Number(
      problem.clues.every((clue) => satisfies(answer, clue)),
    );
    totals.current.seconds += (performance.now() - began.current) / 1000;
    setFeedback(true);
  }
  function next() {
    if (round + 1 === c.rounds) {
      onComplete({ kind: "reasoning", ...totals.current, total: c.rounds });
      return;
    }
    setProblem(generateReasoning(c.level));
    setAnswer([]);
    setFeedback(false);
    setHidden(false);
    locked.current = false;
    began.current = performance.now();
    setRound(round + 1);
  }
  return (
    <>
      <div className="trial-meta">
        <span>
          문제 {round + 1} / {c.rounds}
        </span>
        <span>
          {c.variant === "memory"
            ? c.mode === "practice"
              ? "기억 연습 · 기억했어요를 눌러 조건 숨김"
              : "기억 모드 · 15초 암기 후 회상"
            : "일반 추론 · 조건 계속 보기"}
        </span>
      </div>
      <h2>왼쪽부터 올바른 순서를 찾아보세요.</h2>
      <div className="reasoning-columns">
        <div className="clue-list">
          {hidden && !feedback ? (
            <p>기억한 조건으로 풀어보세요.</p>
          ) : (
            problem.clues.map((clue, i) => (
              <div
                className={`clue ${feedback ? (satisfies(answer, clue) ? "pass" : "fail") : ""}`}
                key={i}
              >
                <span>{String(i + 1).padStart(2, "0")}</span>
                <p>
                  <b>{clue.before}</b>은(는) <b>{clue.after}</b>보다 왼쪽에
                  있습니다.{feedback && (satisfies(answer, clue) ? " ✓" : " ✕")}
                </p>
              </div>
            ))
          )}
        </div>
        <div>
          <p className="muted">
            {studying
              ? "조건을 기억하세요. 조건이 숨겨진 뒤에 답을 입력합니다."
              : "순서대로 이름을 선택하세요."}
          </p>
          {studying && c.mode === "practice" && (
            <button
              className="primary"
              onClick={() => {
                setHidden(true);
                began.current = performance.now();
              }}
            >
              조건을 기억했어요
            </button>
          )}
          <div className="order-slots">
            {problem.people.map((_, i) => (
              <div key={i}>
                <small>{i + 1}번째</small>
                <strong>{answer[i] ?? "?"}</strong>
              </div>
            ))}
          </div>
          <div className="button-row wrap">
            {problem.people.map((p) => (
              <button
                className="secondary"
                key={p}
                disabled={studying || answer.includes(p) || feedback}
                onClick={() =>
                  setAnswer((a) =>
                    a.includes(p) || a.length >= problem.people.length
                      ? a
                      : [...a, p],
                  )
                }
              >
                {p}
              </button>
            ))}
          </div>
          {feedback ? (
            <div className="feedback">
              <h3>
                {problem.clues.every((clue) => satisfies(answer, clue))
                  ? "모든 조건에 맞아요!"
                  : "조건을 다시 살펴보세요."}
              </h3>
              <p>정답: {problem.order.join(" → ")}</p>
              <button className="primary" onClick={next}>
                {round + 1 === c.rounds ? "결과 보기" : "다음 문제"}
              </button>
            </div>
          ) : (
            <div className="button-row">
              <button
                className="secondary"
                onClick={() => setAnswer((a) => a.slice(0, -1))}
                disabled={studying || !answer.length}
              >
                하나 지우기
              </button>
              <button
                className="primary"
                disabled={studying || answer.length !== problem.people.length}
                onClick={submit}
              >
                정답 확인
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
