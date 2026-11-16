import { useState } from "react";
import { Link } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { Trash2, ChartNoAxesCombined } from "lucide-react";
import { registry } from "../core/training/registry";
import { accuracy, pct, conditionKey } from "../core/training/scoring";
import { useData } from "../app/DataProvider";
import { repository } from "../infrastructure/storage/repository";
import { MetricDetails } from "../shared/components/MetricDetails";
export function Statistics() {
  const { data, act } = useData();
  const [id, setId] = useState("nback");
  const [condition, setCondition] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const t = registry.find((t) => t.id === id)!;
  const records = data.sessions
    .filter((s) => s.trainingId === id)
    .sort((a, b) => b.completedAt.localeCompare(a.completedAt));
  const valid = records.filter(
    (s) =>
      s.status === "completed" && s.metrics && s.config.mode === "training",
  );
  const keys = [
    ...new Set(
      valid.map(
        (s) =>
          `${conditionKey(s.config)}|${s.inputMethod}|${s.algorithmVersion}`,
      ),
    ),
  ];
  const chosen = keys.includes(condition) ? condition : keys[0];
  const same = valid
    .filter(
      (s) =>
        `${conditionKey(s.config)}|${s.inputMethod}|${s.algorithmVersion}` ===
        chosen,
    )
    .reverse();
  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">YOUR PROGRESS</span>
          <h1>나의 기록</h1>
          <p>다른 사람 대신, 같은 조건에서의 지난 나와 비교하세요.</p>
        </div>
      </div>
      <div className="filter-tabs">
        {registry.map((t) => (
          <button
            key={t.id}
            className={id === t.id ? "selected" : ""}
            onClick={() => {
              setId(t.id);
              setCondition("");
            }}
          >
            {t.name}
          </button>
        ))}
      </div>
      <section className="panel">
        <div className="section-title">
          <div>
            <h2>{t.name}의 변화</h2>
            <p>
              완료한 정식 훈련 {valid.length}회 · 중단 기록{" "}
              {records.length - valid.length}회
            </p>
          </div>
          {keys.length > 0 && (
            <label className="compact-label">
              비교 조건
              <select
                value={chosen}
                onChange={(e) => setCondition(e.target.value)}
              >
                {keys.map((key) => {
                  const s = valid.find(
                    (s) =>
                      `${conditionKey(s.config)}|${s.inputMethod}|${s.algorithmVersion}` ===
                      key,
                  )!;
                  return (
                    <option key={key} value={key}>
                      Lv.{s.config.level} · {s.config.interval / 1000}초 ·{" "}
                      {s.config.rounds}회 · {s.config.variant} ·{" "}
                      {s.trainingId === "spaced-repetition"
                        ? `${s.config.deck ?? "전체 묶음"} · `
                        : ""}
                      {s.inputMethod} · 규칙 {s.algorithmVersion}
                    </option>
                  );
                })}
              </select>
            </label>
          )}
        </div>
        {same.length ? (
          <>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={280}>
                <LineChart
                  data={same.map((s, i) => ({
                    name: `${i + 1}회`,
                    date: new Date(s.completedAt).toLocaleString("ko-KR"),
                    score: Math.round(accuracy(s.metrics!) * 100),
                  }))}
                >
                  <CartesianGrid strokeDasharray="4 4" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} unit="%" width={48} />
                  <Tooltip
                    formatter={(value) => [`${value}%`, t.metricsLabel]}
                  />
                  <Line
                    type="linear"
                    dataKey="score"
                    stroke="#237b68"
                    strokeWidth={3}
                    dot={{ r: 5 }}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className="hint">
              난이도·속도·시행 수·방식·입력 수단·알고리즘 버전이 같은 기록만
              연결합니다. 수면과 환경 차이는 반영하지 못합니다.
            </p>
          </>
        ) : (
          <div className="empty-state">
            <ChartNoAxesCombined size={36} />
            <h3>첫 기록을 기다리고 있어요</h3>
            <p>훈련을 완료하면 이곳에서 나의 변화를 볼 수 있습니다.</p>
            <Link className="primary" to={`/training/${id}`}>
              훈련 시작하기
            </Link>
          </div>
        )}
      </section>
      <section className="panel history-panel">
        <h2>훈련 기록</h2>
        {records.length === 0 ? (
          <p className="muted">아직 기록이 없습니다.</p>
        ) : (
          records.map((s) => (
            <div className="history-item" key={s.id}>
              <div className="history-row">
                <button
                  className="history-toggle"
                  onClick={() => setExpanded(expanded === s.id ? null : s.id)}
                  aria-expanded={expanded === s.id}
                >
                  <span>
                    <strong>
                      {new Date(s.startedAt).toLocaleDateString("ko-KR")}
                    </strong>
                    <small>
                      {new Date(s.startedAt).toLocaleTimeString("ko-KR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}{" "}
                      · Level {s.config.level} · {s.config.variant}
                      {s.trainingId === "spaced-repetition"
                        ? ` · ${s.config.deck ?? "전체 묶음"}`
                        : ""}
                    </small>
                  </span>
                  <b>{s.metrics ? pct(accuracy(s.metrics)) : "중단"}</b>
                </button>
                <button
                  className="icon-button"
                  aria-label="이 기록 삭제"
                  onClick={() => {
                    if (confirm("이 훈련 기록을 삭제할까요?"))
                      void act(() => repository.deleteSession(s.id));
                  }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
              {expanded === s.id &&
                (s.metrics ? (
                  <MetricDetails metrics={s.metrics} />
                ) : (
                  <p className="hint">
                    완료되지 않은 기록입니다. 새로고침·탭 전환·중단된 훈련은
                    통계와 자동 난이도에서 제외합니다.
                  </p>
                ))}
            </div>
          ))
        )}
      </section>
    </div>
  );
}
