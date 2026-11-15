import { Link } from "react-router-dom";
import {
  ExternalLink,
  BookOpen,
  FlaskConical,
  Focus,
  Lightbulb,
} from "lucide-react";
const sources = [
  {
    title: "Yang et al. (2021) · 메타분석",
    subtitle: "Testing (quizzing) boosts classroom learning",
    url: "https://pubmed.ncbi.nlm.nih.gov/33683913/",
    note: "교실 연구 222건, 학생 48,478명의 결과를 통합했습니다. 학습한 자료의 인출 연습을 지지하지만 효과는 피드백·문제 형식 등 조건에 따라 다릅니다. 이 앱의 효과를 검증한 연구는 아닙니다.",
  },
  {
    title: "Mawson & Kang (2025) · 메타분석",
    subtitle: "The Distributed Practice Effect on Classroom Learning",
    url: "https://pubmed.ncbi.nlm.nih.gov/40564553/",
    note: "교실 연구 22편에서 몰아서 공부하기보다 나누어 공부하기의 기억 유지 이점을 검토했습니다. 사람마다 최적인 간격이나 이 앱의 1·3·7일 규칙을 입증한 것은 아닙니다.",
  },
  {
    title: "Wagner et al. (2021) · 실험 연구",
    subtitle:
      "Durable memories and efficient neural coding through mnemonic training using the method of loci",
    url: "https://pubmed.ncbi.nlm.nih.gov/33658191/",
    note: "장소법 훈련 후 단어 기억 유지의 개선을 관찰했습니다. 소규모 집단 연구이며 이 앱의 짧은 즉시·30초 회상과 연구 프로토콜은 다릅니다. 전반적인 기억 용량 증가를 보장하지 않습니다.",
  },
  {
    title: "Melby-Lervåg, Redick & Hulme (2016)",
    subtitle:
      "Working Memory Training Does Not Improve Performance on Measures of Intelligence or Other Measures of “Far Transfer”",
    url: "https://pubmed.ncbi.nlm.nih.gov/27474138/",
    note: "작업기억 훈련의 원거리 전이를 검토한 메타분석. 일반 지능 향상을 약속할 근거로 사용하지 않습니다.",
  },
  {
    title: "Examining Working Memory Training for Healthy Adults (2024)",
    subtitle: "A Second-Order Meta-Analysis",
    url: "https://pubmed.ncbi.nlm.nih.gov/39590641/",
    note: "작업기억 수행 개선 가능성을 검토합니다. 훈련·표본·대조군의 차이가 있어 실생활 변화로 그대로 일반화하기 어렵습니다.",
  },
  {
    title: "McDermott (2021)",
    subtitle: "Practicing Retrieval Facilitates Learning",
    url: "https://pubmed.ncbi.nlm.nih.gov/33006925/",
    note: "답을 다시 읽기 전에 스스로 인출하는 연습과 학습 자료의 기억 유지를 다룹니다.",
  },
  {
    title: "Cepeda et al. (2006)",
    subtitle: "Distributed practice in verbal recall tasks",
    url: "https://pubmed.ncbi.nlm.nih.gov/16719566/",
    note: "분산 학습 간격과 기억 유지의 관계를 검토합니다. 모든 사람에게 최적인 고정 간격을 뜻하지 않습니다.",
  },
];
export function Research() {
  return (
    <div className="page narrow-page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">EVIDENCE, NOT PROMISES</span>
          <h1>근거를 알고, 꾸준하게.</h1>
          <p>이곳은 나의 수행을 관찰하는 실험실입니다.</p>
        </div>
      </div>
      <div className="research-intro panel">
        <FlaskConical size={32} />
        <h2>점수가 오른다는 것의 의미</h2>
        <p>
          반복하면서 이 훈련에 더 익숙해질 수 있습니다. 다만 그것이 곧 지능이나
          일상 전반의 능력이 향상되었다는 뜻은 아닙니다. 이 앱은 의료·진단
          도구나 표준화된 인지 검사가 아닙니다.
        </p>
      </div>
      <div className="research-concepts">
        {[
          {
            icon: Focus,
            title: "가까운 전이",
            english: "NEAR TRANSFER",
            body: "연습한 과제와 비슷한 과제에서의 수행 변화입니다. 동일 설정의 기록을 비교하되 단순한 익숙함의 효과도 고려하세요.",
          },
          {
            icon: FlaskConical,
            title: "먼 전이",
            english: "FAR TRANSFER",
            body: "훈련과 다른 능력이나 실생활로의 변화입니다. 이 앱의 점수만으로 지능·학업·업무 능력 향상을 판단할 수 없습니다.",
          },
          {
            icon: Lightbulb,
            title: "기억 전략",
            english: "MEMORY TECHNIQUES",
            body: "인출 연습, 간격 반복, 장소 연상은 특정 정보를 기억하는 전략입니다. 보편적인 기억 용량 증가와 구분합니다.",
          },
        ].map(({ icon: Icon, title, english, body }) => (
          <section className="panel" key={title}>
            <Icon size={24} />
            <span className="eyebrow">{english}</span>
            <h3>{title}</h3>
            <p>{body}</p>
          </section>
       …5090 tokens truncated…              >
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
                  {data.cards.length
                    ? "오늘 예정된 복습이 없습니다. 먼저 연습해 보기로 전체 카드를 복습하거나 아래에서 카드를 추가하세요."
                    : "아직 학습 카드가 없습니다. 아래에서 한 장씩 만들거나 여러 카드를 한 번에 붙여넣으세요."}
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
