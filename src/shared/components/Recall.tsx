import { useEffect, useState } from "react";
export function Recall({
  length,
  alphabet,
  onSubmit,
}: {
  length: number;
  alphabet: string[];
  onSubmit: (answer: string[]) => void;
}) {
  const [answer, setAnswer] = useState<string[]>([]);
  const add = (s: string) =>
    setAnswer((a) => (a.length < length ? [...a, s] : a));
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (alphabet.includes(e.key.toUpperCase())) {
        e.preventDefault();
        add(e.key.toUpperCase());
      } else if (e.key === "Backspace") {
        e.preventDefault();
        setAnswer((a) => a.slice(0, -1));
      } else if (e.key === "Enter" && answer.length === length) {
        e.preventDefault();
        onSubmit(answer);
      }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [answer, alphabet, length, onSubmit]);
  return (
    <div className="recall">
      <div className="answer-slots" aria-live="polite">
        {Array.from({ length }, (_, i) => (
          <span key={i} className={answer[i] ? "filled" : ""}>
            {answer[i] === "" ? "?" : (answer[i] ?? "·")}
          </span>
        ))}
      </div>
      <div className="keypad">
        {alphabet.map((s) => (
          <button
            className="key"
            key={s}
            onClick={() => add(s)}
            disabled={answer.length === length}
          >
            {s}
          </button>
        ))}
      </div>
      <button
        className="secondary answer-wide"
        disabled={answer.length === length}
        onClick={() => add("")}
      >
        이 자리는 모르겠어요
      </button>
      <p className="hint">
        모르는 자리도 순서에 포함됩니다. 건너뛴 자리는 오답으로 기록해요.
      </p>
      <div className="button-row">
        <button
          className="secondary"
          disabled={!answer.length}
          onClick={() => setAnswer((a) => a.slice(0, -1))}
        >
          하나 지우기
        </button>
        <button
          className="primary"
          disabled={answer.length !== length}
          onClick={() => onSubmit(answer)}
        >
          제출하기
        </button>
      </div>
    </div>
  );
}
