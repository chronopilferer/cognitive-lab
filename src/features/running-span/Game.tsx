import { useRef, useState } from "react";
import type { GameProps } from "../../core/training/types";
import { generateSpan } from "./engine";
import { scoreRecall } from "../../core/training/recall";
import { Recall } from "../../shared/components/Recall";
import { useDeadline } from "../../shared/hooks/useDeadline";
import { useStimulus } from "../../shared/hooks/useStimulus";
export function RunningSpanGame({ config: c, onComplete }: GameProps) {
  const k = c.level + 2;
  const [round, setRound] = useState(0);
  const [sequence, setSequence] = useState(() => generateSpan(k));
  const [index, setIndex] = useState(0);
  const [feedback, setFeedback] = useState<null | {
    answer: string[];
    score: number;
  }>(null);
  const totals = useRef({ correct: 0, total: 0, perfect: 0 });
  const locked = useRef(false);
  const showing = index < sequence.length;
  const visible = useStimulus(
    `${round}-${index}`,
    c.interval,
    c.mode === "training",
  );
  const next = () => setIndex(index + 1);
  useDeadline(
    `${round}-${index}`,
    showing && c.mode === "training" ? c.interval : null,
    next,
  );
  function submit(answer: string[]) {
    if (locked.current) return;
    locked.current = true;
    const result = scoreRecall(answer, sequence.slice(-k));
    totals.current.correct += result.correct;
    totals.current.total += k;
    totals.current.perfect += Number(result.correct === k);
    setFeedback({ answer, score: result.correct });
  }
  function proceed() {
    if (round + 1 === c.rounds) {
      onComplete({ kind: "running-span", ...totals.current, rounds: c.rounds });
      return;
    }
    setSequence(generateSpan(k));
    setIndex(0);
    setFeedback(null);
    locked.current = false;
    setRound(round + 1);
  }
  return (
    <>
      <div className="trial-meta">
        <span>
          라운드 {round + 1} / {c.rounds}
        </span>
        <span>마지막 {k}개 기억</span>
      </div>
      {feedback ? (
        <div className="feedback">
          <h2>
            {feedback.score} / {k}개를 기억했어요
          </h2>
          <p>정답: {sequence.slice(-k).join(" · ")}</p>
          <p>내 답: {feedback.answer.join(" · ")}</p>
          <button className="primary" onClick={proceed}>
            {round + 1 === c.rounds ? "결과 보기" : "다음 라운드"}
          </button>
        </div>
      ) : showing ? (
        <>
          <div className="stimulus-zone">
            <div className="big-stimulus" key={`${round}-${index}`}>
              {visible ? (
                sequence[index]
              ) : (
                <span className="stimulus-blank" aria-label="자극 사이 빈 구간">
                  +
                </span>
              )}
            </div>
          </div>
          <p className="center muted">
            계속 갱신하며 마지막 {k}개만 기억하세요.
          </p>
          {c.mode === "practice" && (
            <button className="primary answer-wide" onClick={next}>
              다음 숫자
            </button>
          )}
        </>
      ) : (
        <>
          <h2 className="center">마지막 {k}개는 무엇이었나요?</h2>
          <p className="center muted">나온 순서대로 입력하세요.</p>
          <Recall
            key={round}
            length={k}
            alphabet={"0123456789".split("")}
            onSubmit={submit}
          />
        </>
      )}
    </>
  );
}
