import { useRef, useState } from "react";
import type { GameProps } from "../../core/training/types";
import { generateComplex } from "./engine";
import { scoreRecall } from "../../core/training/recall";
import { Recall } from "../../shared/components/Recall";
import { useDeadline } from "../../shared/hooks/useDeadline";
import { RecallFeedback } from "../../shared/components/RecallFeedback";
export function ComplexSpanGame({ config: c, onComplete }: GameProps) {
  const [items] = useState(() => generateComplex(c.level + 2));
  const [step, setStep] = useState(0);
  const [recalled, setRecalled] = useState<string[] | null>(null);
  const answered = useRef(-1);
  const mathCorrect = useRef(0);
  const current = items[Math.floor(step / 2)];
  const recalling = step >= items.length * 2;
  function math(v: boolean | null) {
    if (answered.current === step) return;
    answered.current = step;
    if (v === current.truth) mathCorrect.current++;
    setStep(step + 1);
  }
  useDeadline(
    step,
    c.mode === "practice" || recalling
      ? null
      : step % 2 === 0
        ? c.interval
        : 5000,
    () => (step % 2 === 0 ? setStep(step + 1) : math(null)),
  );
  if (recalled)
    return (
      <RecallFeedback
        answer={recalled}
        expected={items.map((x) => x.letter)}
        onContinue={() =>
          onComplete({
            kind: "complex-span",
            ...scoreRecall(
              recalled,
              items.map((x) => x.letter),
            ),
            mathCorrect: mathCorrect.current,
            mathTotal: items.length,
          })
        }
      />
    );
  return (
    <>
      <div className="trial-meta">
        <span>
          {recalling
            ? "순서 회상"
            : `${Math.floor(step / 2) + 1} / ${items.length}`}
        </span>
        <span>
          {recalling
            ? "기억 단계"
            : step % 2 === 0
              ? "문자를 기억하세요"
              : "계산을 판단하세요"}
        </span>
      </div>
      {recalling ? (
        <>
          <h2 className="center">문자를 나온 순서대로 입력하세요</h2>
          <Recall
            length={items.length}
            alphabet={"ABCDEFGH".split("")}
            onSubmit={(answer) => {
              if (answered.current === step) return;
              answered.current = step;
              setRecalled(answer);
            }}
          />
        </>
      ) : step % 2 === 0 ? (
        <>
          <div className="stimulus-zone">
            <div className="big-stimulus">{current.letter}</div>
          </div>
          {c.mode === "practice" && (
            <button
              className="primary answer-wide"
              onClick={() => setStep(step + 1)}
            >
              기억했어요
            </button>
          )}
        </>
      ) : (
        <>
          <div className="stimulus-zone">
            <div className="math-stimulus">
              {current.a} {current.operator} {current.b} = {current.shown}
            </div>
          </div>
          <p className="center muted">
            {c.mode === "training"
              ? "5초 안에 판단하세요. 시간 초과는 오답입니다."
              : "계산이 맞는지 판단하세요."}
          </p>
          <div className="button-row">
            <button className="primary" onClick={() => math(true)}>
              참
            </button>
            <button className="secondary" onClick={() => math(false)}>
              거짓
            </button>
          </div>
        </>
      )}
    </>
  );
}
