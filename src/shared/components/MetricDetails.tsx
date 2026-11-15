import type { Metrics } from "../../core/training/types";
import { pct } from "../../core/training/scoring";
export function MetricDetails({ metrics: m }: { metrics: Metrics }) {
  const rate = (a: number, b: number) => (b ? pct(a / b) : "계산 불가");
  let rows: [string, string][] = [];
  switch (m.kind) {
    case "nback":
      rows = [
        ["적중 / 누락", `${m.hit} / ${m.miss}`],
        ["오경보 / 올바른 거절", `${m.falseAlarm} / ${m.correctRejection}`],
        ["적중률", rate(m.hit, m.hit + m.miss)],
        ["오경보율", rate(m.falseAlarm, m.falseAlarm + m.correctRejection)],
        [
          "응답 평균 시간",
          m.reactionMs.length
            ? `${Math.round(m.reactionMs.reduce((a, b) => a + b, 0) / m.reactionMs.length)}ms`
            : "응답 없음",
        ],
      ];
      break;
    case "complex-span":
      rows = [
        ["기억 정답", `${m.correct} / ${m.total}`],
        ["계산 정확도", rate(m.mathCorrect, m.mathTotal)],
        ["계산 정답", `${m.mathCorrect} / ${m.mathTotal}`],
      ];
      break;
    case "running-span":
      rows = [
        ["순서 정답", `${m.correct} / ${m.total}`],
        ["완전 정답 라운드", `${m.perfect} / ${m.rounds}`],
      ];
      break;
    case "reasoning":
      rows = [
        ["정답 문제", `${m.correct} / ${m.total}`],
        ["풀이 시간", `${Math.round(m.seconds)}초`],
      ];
      break;
    case "memory-palace":
      rows = [
        ["회상한 단어", `${m.correct} / ${m.total}`],
        ["회상 조건", m.delaySeconds ? `${m.delaySeconds}초 지연` : "즉시"],
      ];
      break;
    case "spaced-repetition":
      rows = [
        ["복습한 카드", `${m.reviewed}장`],
        ["기억함으로 평가", `${m.remembered}장`],
      ];
  }
  return (
    <dl className="metrics-details">
      {rows.map(([label, value]) => (
        <div key={label}>
          <dt>{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  );
}
