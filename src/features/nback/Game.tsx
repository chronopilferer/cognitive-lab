import { useEffect, useRef, useState } from "react";
import type { GameProps, Metrics } from "../../core/training/types";
import { generateNback, scoreTrial } from "./engine";
import { useDeadline } from "../../shared/hooks/useDeadline";
import { useStimulus } from "../../shared/hooks/useStimulus";
export function NbackGame({ config: c, onComplete }: GameProps) {
  const [stimuli] = useState(() => generateNback(c.level, c.rounds));
  const [index, setIndex] = useState(0);
  const [pressed, setPressed] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const visible = useStimulus(index, c.interval, c.mode === "training");
  const lastScored = useRef(-1);
  const respond = useRef(false);
  const began = useRef(performance.now());
  const done = useRef(false);
  const metrics = useRef<Extract<Metrics, { kind: "nback" }>>({
    kind: "nback",
    hit: 0,
    miss: 0,
    falseAlarm: 0,
    correctRejection: 0,
    reactionMs: [],
  });
  function answer() {
    if (index < c.level || respond.current || done.current || feedback) return;
    respond.current = true;
    setPressed(true);
    metrics.current.reactionMs.push(performance.now() - began.current);
  }
  useEffect(() => {
    function key(e: KeyboardEvent) {
      if (e.code === "Space") {
        e.preventDefault();
        if (!e.repeat) answer();
      }
    }
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  });
  function next() {
    if (done.current) return;
    if (c.mode === "practice" && !feedback) {
      const result = scoreTrial(stimuli, index, c.level, respond.current);
      setFeedback(
        result === null
          ? "준비 자극입니다. 기억만 하세요."
          : result === "hit"
            ? "정답! 이전 자극과 같습니다."
            : result === "correctRejection"
              ? "정답! 다른 자극이라 누르지 않는 것이 맞습니다."
              : result === "miss"
                ? "같은 자극입니다. 같아요를 눌러야 했어요."
                : "다른 자극입니다. 누르지 않아야 했어요.",
      );
      return;
    }
    if (lastScored.current === index) return;
    lastScored.current = index;
    const outcome = scoreTrial(stimuli, index, c.level, respond.current);
    if (outcome) metrics.current[outcome]++;
    if (index === stimuli.length - 1) {
      done.current = true;
      onComplete(metrics.current);
      return;
    }
    setFeedback(null);
    respond.current = false;
    setPressed(false);
    began.current = performance.now();
    setIndex(index + 1);
  }
  useDeadline(index, c.mode === "practice" ? null : c.interval, next);
  return (
    <>
      <div className="trial-meta">
        <span>
          {index < c.level
            ? "준비 자극 · 채점하지 않아요"
            : `${index - c.level + 1} / ${c.rounds} 시행`}
        </span>
        <span>
          {c.level}-back ·{" "}
          {c.mode === "practice"
            ? "직접 넘기기"
            : `${c.interval / 1000}초 간격`}
        </span>
      </div>
      <div className="stimulus-zone">
        {c.variant === "position" ? (
          <div
            className="nback-grid"
            aria-label={
              visible ? `현재 위치 ${stimuli[index] + 1}` : "자극 사이 빈 구간"
            }
          >
            {Array.from({ length: 9 }, (_, i) => (
              <div
                key={i}
                className={visible && i === stimuli[index] ? "lit" : ""}
              />
            ))}
          </div>
        ) : !visible ? (
          <span className="stimulus-blank" aria-label="자극 사이 빈 구간">
            +
          </span>
        ) : (
          <div className="big-stimulus" key={index}>
            {"ABCDEFGHK"[stimuli[index]]}
          </div>
        )}
      </div>
      <p className="center muted">
        {index < c.level
          ? "먼저 기억하세요. 아직 비교할 자극이 없습니다."
          : `${c.level}개 전과 같으면 버튼을 누르세요. 다르면 기다리세요.`}
      </p>
      <button
        className="primary answer-wide"
        disabled={index < c.level || pressed || !!feedback}
        onClick={answer}
      >
        {pressed ? "응답했어요 ✓" : "같아요"} <kbd>Space</kbd>
      </button>
      {c.mode === "practice" && (
        <button className="secondary" onClick={next}>
          {feedback ? "다음 자극 →" : "판정 확인"}
        </button>
      )}
      {feedback && (
        <p role="status" className="quiet-note">
          {feedback}
        </p>
      )}
      <p className="hint">같음 응답은 자극마다 한 번만 기록됩니다.</p>
    </>
  );
}
