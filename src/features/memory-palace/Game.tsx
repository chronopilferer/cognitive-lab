import { useRef, useState } from "react";
import { MapPin } from "lucide-react";
import type { GameProps } from "../../core/training/types";
import { palaceWords } from "./engine";
import { scoreRecall } from "../../core/training/recall";
import { useDeadline } from "../../shared/hooks/useDeadline";
import { RecallFeedback } from "../../shared/components/RecallFeedback";
export function PalaceGame({ config: c, onComplete }: GameProps) {
  const n = Math.min(c.level + 2, c.locations.length);
  const [words] = useState(() => palaceWords(n));
  const [step, setStep] = useState(0);
  const [answer, setAnswer] = useState<string[]>(Array(n).fill(""));
  const [waiting, setWaiting] = useState(false);
  const [ready, setReady] = useState(false);
  const done = useRef(false);
  const [review, setReview] = useState(false);
  useDeadline(waiting ? "wait" : "study", waiting ? 30000 : null, () => {
    setWaiting(false);
    setReady(true);
  });
  useDeadline(
    `place-${step}`,
    c.mode === "training" && !waiting && !ready ? c.interval : null,
    next,
  );
  function next() {
    if (step + 1 === n && c.variant === "delayed") {
      setWaiting(true);
    } else if (step + 1 === n) setReady(true);
    setStep(step + 1);
  }
  if (review)
    return (
      <RecallFeedback
        answer={answer}
        expected={words}
        labels={c.locations}
        onContinue={() =>
          onComplete({
            kind: "memory-palace",
            ...scoreRecall(answer, words),
            delaySeconds: c.variant === "delayed" ? 30 : 0,
          })
        }
      />
    );
  return (
    <>
      <div className="trial-meta">
        <span>
          {ready
            ? "장소를 따라 회상하세요"
            : waiting
              ? "지연 회상 준비"
              : `장소 ${step + 1} / ${n}`}
        </span>
        <span>{c.variant === "delayed" ? "30초 지연 회상" : "즉시 회상"}</span>
      </div>
      {waiting ? (
        <div className="stimulus-zone">
          <div className="center">
            <MapPin size={48} />
            <h2>잠시 다른 곳을 바라보세요.</h2>
            <p>30초 후 회상을 시작합니다. 이 탭은 유지해 주세요.</p>
          </div>
        </div>
      ) : !ready ? (
        <>
          <div className="palace-scene">
            <span className="eyebrow">나의 기억 경로</span>
            <MapPin size={40} />
            <h2>{c.locations[step]}</h2>
            <div className="palace-word">{words[step]}</div>
            <p>이 장소에 커다란 ‘{words[step]}’이(가) 있다고 상상해 보세요.</p>
          </div>
          {c.mode === "practice" ? (
            <button className="primary answer-wide" onClick={next}>
              {step + 1 === n ? "회상 시작" : "다음 장소로"}
            </button>
          ) : (
            <p className="center muted">
              장소마다 {c.interval / 1000}초 동안 기억하세요. 자동으로
              넘어갑니다.
            </p>
          )}
        </>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (done.current) return;
            done.current = true;
            setReview(true);
          }}
        >
          <div className="palace-inputs">
            {words.map((_, i) => (
              <label key={i}>
                <span>
                  {i + 1}. {c.locations[i]}
                </span>
                <input
                  autoComplete="off"
                  value={answer[i]}
                  onChange={(e) =>
                    setAnswer((a) =>
                      a.map((v, j) => (i === j ? e.target.value : v)),
                    )
                  }
                  placeholder="기억나는 단어"
                  maxLength={30}
                />
              </label>
            ))}
          </div>
          <p className="hint">
            기억나지 않는 곳은 비워 두어도 됩니다. 띄어쓰기 앞뒤만 무시하여
            채점합니다.
          </p>
          <button className="primary answer-wide" type="submit">
            회상 결과 확인
          </button>
        </form>
      )}
    </>
  );
}
