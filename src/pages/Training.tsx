import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Info,
} from "lucide-react";
import { getTraining } from "../core/training/registry";
import type {
  Config,
  Metrics,
  Session,
  TrainingDefinition,
} from "../core/training/types";
import {
  accuracy,
  pct,
  nextDifficulty,
  conditionKey,
} from "../core/training/scoring";
import { useData } from "../app/DataProvider";
import { repository } from "../infrastructure/storage/repository";
import { uniqueId, localDay } from "../shared/utils";
import { CardManager } from "../features/spaced-repetition/CardManager";
import { MetricDetails } from "../shared/components/MetricDetails";
import { TrainingIcon } from "../shared/components/Icon";
export function Training() {
  const { id = "" } = useParams();
  const t = getTraining(id);
  if (!t)
    return (
      <div className="empty-state">
        <h1>훈련을 찾을 수 없습니다.</h1>
        <Link to="/training">전체 훈련으로</Link>
      </div>
    );
  return <TrainingInner key={id} training={t} />;
}
function TrainingInner({ training: t }: { training: TrainingDefinition }) {
  const { data, act } = useData();
  const [config, setConfig] = useState<Config>(
    () => data.settings.configs[t.id] ?? t.defaultConfig,
  );
  const [phase, setPhase] = useState<
    "setup" | "running" | "stopped" | "result"
  >("setup");
  const [session, setSession] = useState<Session | null>(null);
  const [result, setResult] = useState<Session | null>(null);
  const [saved, setSaved] = useState(false);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const started = useRef(0);
  const completeLock = useRef(false);
  const input = useRef<Session["inputMethod"]>("unknown");
  const methods = useRef(new Set<string>());
  const change = (patch: Partial<Config>) =>
    setConfig((c) => ({ ...c, ...patch }));
  useEffect(() => {
    if (phase !== "running") return;
    document.body.dataset.training = "true";
    const visibility = () => {
      if (document.hidden) {
        completeLock.current = true;
        setReason(
          "탭 또는 앱 전환으로 훈련이 중단되었습니다. 측정 조건을 지키기 위해 새 세션으로 시작합니다.",
        );
        setPhase("stopped");
      }
    };
    const key = () => {
      methods.current.add("keyboard");
      input.current = methods.current.size > 1 ? "mixed" : "keyboard";
    };
    const pointer = () => {
      methods.current.add("pointer");
      input.current = methods.current.size > 1 ? "mixed" : "pointer";
    };
    const unload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    document.addEventListener("visibilitychange", visibility);
    window.addEventListener("keydown", key);
    window.addEventListener("pointerdown", pointer);
    window.addEventListener("beforeunload", unload);
    return () => {
      delete document.body.dataset.training;
      document.removeEventListener("visibilitychange", visibility);
      window.removeEventListener("keydown", key);
      window.removeEventListener("pointerdown", pointer);
      window.removeEventListener("beforeunload", unload);
    };
  }, [phase]);
  async function start(mode: Config["mode"]) {
    if (busy) return;
    if (
      t.id === "spaced-repetition" &&
      !data.cards.some((card) => mode === "practice" || card.due <= localDay())
    ) {
      setPhase("setup");
      return;
    }
    setBusy(true);
    const c = { ...config, mode };
    if (c.locations.length < c.level + 2 && t.id === "memory-palace") {
      setBusy(false);
      return;
    }
    const s: Session = {
      id: uniqueId(),
      trainingId: t.id,
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      status: "aborted",
      config: c,
      algorithmVersion: 2,
      durationSeconds: 0,
      metrics: null,
      inputMethod: "unknown",
    };
    const ok = await act(async () => {
      await repository.saveConfig(t.id, c);
      if (mode === "training") await repository.saveSession(s);
    });
    if (ok) {
      setConfig(c);
      setSession(s);
      setSaved(false);
      setResult(null);
      completeLock.current = false;
      methods.current.clear();
      input.current = "unknown";
      started.current = performance.now();
      setPhase("running");
    }
    setBusy(false);
  }
  async function finish(metrics: Metrics) {
    if (completeLock.current || !session) return;
    completeLock.current = true;
    setBusy(true);
    const s: Session = {
      ...session,
      status: "completed",
      completedAt: new Date().toISOString(),
      durationSeconds: (performance.now() - started.current) / 1000,
      metrics,
      inputMethod: input.current,
    };
    setResult(s);
    setPhase("result");
    if (s.config.mode === "training") {
      const ok = await act(() => repository.saveSession(s));
      setSaved(ok);
      if (ok) {
        const fresh = await repository.read();
        const next = nextDifficulty(fresh.sessions, s, t.maxLevel);
        await act(() =>
          repository.saveConfig(t.id, { ...s.config, level: next.level }),
        );
        setConfig((c) => ({ ...c, level: next.level }));
      }
    }
    setBusy(false);
  }
  const Game = t.component;
  const activeCards = data.cards.filter((c) => c.due <= localDay()).length;
  const canStart = t.id !== "spaced-repetition" || activeCards > 0;
  const locationValid =
    t.id !== "memory-palace" || config.locations.length >= config.level + 2;
  const currentResult = result;
  const adjustment = currentResult
    ? nextDifficulty(data.sessions, currentResult, t.maxLevel)
    : null;
  const previous = currentResult
    ? data.sessions
        .filter(
          (s) =>
            s.id !== currentResult.id &&
            s.trainingId === t.id &&
            s.status === "completed" &&
            s.metrics &&
            s.algorithmVersion === currentResult.algorithmVersion &&
            s.inputMethod === currentResult.inputMethod &&
            conditionKey(s.config) === conditionKey(currentResult.config),
        )
        .sort((a, b) => b.completedAt.localeCompare(a.completedAt))[0]
    : null;
  return (
    <div
      className={`page training-page ${phase === "running" ? "focus-page" : ""}`}
    >
      {phase !== "running" && (
        <Link className="back-link" to="/training">
          <ArrowLeft size={17} /> 전체 훈련
        </Link>
      )}
      {phase === "setup" && (
        <>
          <div className="training-title">
            <div className={`large-icon ${t.accent}`}>
              <TrainingIcon name={t.icon} size={32} />
            </div>
            <div>
              <span className="eyebrow">{t.english}</span>
              <h1>{t.name}</h1>
              <p>{t.description}</p>
            </div>
          </div>
          <div className="setup-grid">
            <section className="panel instructions">
              <span className="eyebrow">HOW TO PLAY</span>
              <h2>이렇게 훈련해요</h2>
              <p>{t.rule}</p>
              <div className="example-box">
                <b>예를 들어</b>
                <p>{t.example}</p>
              </div>
              <div className="instruction-step">
                <span>1</span>
                <div>
                  <b>먼저 가볍게 연습</b>
                  <p>시간 압박 없이 직접 넘기며 규칙을 익혀요.</p>
                </div>
              </div>
              <div className="instruction-step">
                <span>2</span>
                <div>
                  <b>나에게 맞게 설정</b>
                  <p>조금 어려워도 괜찮은 난이도를 골라요.</p>
                </div>
              </div>
              <div className="instruction-step">
                <span>3</span>
                <div>
                  <b>기록하며 이어가기</b>
                  <p>같은 조건의 이전 기록과 나를 비교해요.</p>
                </div>
              </div>
              <p className="hint">
                <Info size={15} />
                {t.limitation}
              </p>
            </section>
            <section className="panel settings-panel">
              <h2>훈련 설정</h2>
              {t.maxLevel > 1 && (
                <>
                  <label>
                    난이도 <strong>Level {config.level}</strong>
                    <input
                      aria-label="난이도"
                      type="range"
                      min={1}
                      max={t.maxLevel}
                      value={config.level}
                      onChange={(e) =>
                        change({ level: Number(e.target.value) })
                      }
                    />
                  </label>
                  <p className="hint">
                    {t.id === "nback"
                      ? `${config.level}개 전과 비교`
                      : t.id === "reasoning"
                        ? `${config.level + 2}명의 순서 추론`
                        : `${config.level + 2}개 항목 기억`}
                  </p>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={config.auto}
                      onChange={(e) => change({ auto: e.target.checked })}
                    />
                    결과에 따라 다음 난이도 조절
                  </label>
                </>
              )}
              {t.variants.length > 0 && (
                <label>
                  훈련 방식
                  <select
                    value={config.variant}
                    onChange={(e) => change({ variant: e.target.value })}
                  >
                    {t.variants.map((v) => (
                      <option value={v.value} key={v.value}>
                        {v.label}
                      </option>
                    ))}
                  </select>
                </label>
              )}
              {[
                "nback",
                "running-span",
                "complex-span",
                "memory-palace",
              ].includes(t.id) && (
                <label>
                  자극 제시 간격
                  <select
                    value={config.interval}
                    onChange={(e) =>
                      change({ interval: Number(e.target.value) })
                    }
                  >
                    {[1000, 1500, 2000, 3000, 5000, 8000].map((ms) => (
                      <option value={ms} key={ms}>
                        {ms / 1000}초
                      </option>
                    ))}
                  </select>
                </label>
              )}
              {!["memory-palace", "complex-span"].includes(t.id) && (
                <label>
                  {t.id === "nback"
                    ? "채점 시행 수"
                    : t.id === "spaced-repetition"
                      ? "최대 복습 카드 수"
                      : "라운드 수"}
                  <select
                    value={config.rounds}
                    onChange={(e) => change({ rounds: Number(e.target.value) })}
                  >
                    {(t.id === "nback" || t.id === "spaced-repetition"
                      ? [10, 20, 30]
                      : [1, 3, 4, 5]
                    ).map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </label>
              )}
              {t.id === "memory-palace" && (
                <label>
                  나의 장소 경로 (쉼표로 구분)
                  <textarea
                    value={config.locations.join(", ")}
                    onChange={(e) =>
                      change({
                        locations: e.target.value
                          .split(",")
                          .map((s) => s.trim())
                          .slice(0, 12),
                      })
                    }
                  />
                  <small>
                    현재 난이도에 {config.level + 2}개 이상 필요합니다.
                  </small>
                </label>
              )}
              {!locationValid && (
                <p className="error">
                  장소를 더 입력하거나 난이도를 낮춰주세요.
                </p>
              )}
              <button
                className="primary answer-wide"
                disabled={busy || !canStart || !locationValid}
                onClick={() => void start("training")}
              >
                <Play size={17} />
                정식 훈련 시작
              </button>
              <button
                className="secondary answer-wide"
                disabled={
                  busy ||
                  !locationValid ||
                  (t.id === "spaced-repetition" && !data.cards.length)
                }
                onClick={() => void start("practice")}
              >
                먼저 연습해 보기
              </button>
              <p className="hint">
                연습은 기록과 난이도 조절에 반영하지 않아요.
                <br />
                중단·탭 전환 시 새 세션으로 다시 시작합니다.
              </p>
              {!canStart && (
                <p className="hint">
                  오늘 예정된 복습이 없습니다. 아래에서 카드를 추가하거나 연습
                  모드를 이용하세요.
                </p>
              )}
            </section>
          </div>
          {t.id === "spaced-repetition" && <CardManager />}
        </>
      )}
      {phase === "running" && session && (
        <>
          <header className="game-header">
            <span className="brand-symbol">
              <TrainingIcon name={t.icon} />
            </span>
            <div>
              <h1>{t.name}</h1>
              <span>
                {session.config.mode === "practice"
                  ? "연습 모드 · 기록되지 않아요"
                  : `정식 훈련 · Level ${session.config.level}`}
              </span>
            </div>
            <button
              className="secondary"
              onClick={() => {
                completeLock.current = true;
                setReason(
                  "일시정지한 세션은 비교 기록에서 제외됩니다. 기억 과제의 조건을 유지하기 위해 새로 시작해 주세요.",
                );
                setPhase("stopped");
              }}
            >
              <Pause size={16} />
              일시정지
            </button>
          </header>
          <section className="game-panel">
            <Game
              key={session.id}
              config={session.config}
              onComplete={(m) => void finish(m)}
            />
          </section>
          <p className="focus-note">지금은 이 순간에만 집중해 보세요.</p>
        </>
      )}
      {phase === "stopped" && (
        <section className="panel stopped-panel">
          <Pause size={40} />
          <h1>잠시 쉬어가요</h1>
          <p>{reason}</p>
          <div className="button-row">
            <button
              className="primary"
              onClick={() => void start(config.mode)}
              disabled={busy}
            >
              <RotateCcw size={17} />새 세션 시작
            </button>
            <button className="secondary" onClick={() => setPhase("setup")}>
              설정으로 돌아가기
            </button>
          </div>
        </section>
      )}
      {phase === "result" && currentResult?.metrics && (
        <section className="panel result-panel">
          <CheckCircle2 size={42} />
          <span className="eyebrow">SESSION COMPLETE</span>
          <h1>한 번의 연습이 쌓였어요.</h1>
          <p>
            {t.name} · Level {currentResult.config.level} ·{" "}
            {Math.round(currentResult.durationSeconds)}초
          </p>
          <div className="result-score">
            {pct(accuracy(currentResult.metrics))}
            <span>{t.metricsLabel}</span>
          </div>
          <MetricDetails metrics={currentResult.metrics} />
          <div className="result-note">
            {previous?.metrics
              ? `이전 동일 조건: ${pct(accuracy(previous.metrics))} → 이번 ${pct(accuracy(currentResult.metrics))}`
              : "같은 조건·입력 방식의 이전 정식 기록이 아직 없습니다."}
          </div>
          <p>
            {currentResult.config.mode === "practice"
              ? "연습을 마쳤습니다. 결과는 저장하지 않았습니다."
              : saved
                ? "기록이 이 브라우저에 저장되었습니다."
                : "기록을 아직 저장하지 못했습니다."}
          </p>
          {!saved && currentResult.config.mode === "training" && (
            <button
              className="secondary"
              onClick={async () =>
                setSaved(await act(() => repository.saveSession(currentResult)))
              }
            >
              저장 다시 시도
            </button>
          )}
          {adjustment && t.maxLevel > 1 && (
            <div className="quiet-note">
              다음 난이도 Level {adjustment.level}
              <p>{adjustment.reason}</p>
            </div>
          )}
          <div className="button-row wrap">
            <button
              className="primary"
              onClick={() => void start(currentResult.config.mode)}
              disabled={busy}
            >
              한 번 더 훈련
            </button>
            {currentResult.config.mode === "practice" && (
              <button
                className="secondary"
                onClick={() => void start("training")}
              >
                정식 훈련 시작
              </button>
            )}
            <button className="secondary" onClick={() => setPhase("setup")}>
              설정 변경
            </button>
            <Link className="ghost" to="/training">
              다른 훈련 선택
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
