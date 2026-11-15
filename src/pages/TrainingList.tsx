import { useState } from "react";
import { registry } from "../core/training/registry";
import { TrainingCard } from "../shared/components/TrainingCard";
import { useData } from "../app/DataProvider";
import { validSessions } from "../features/statistics/selectors";
export function TrainingList() {
  const [filter, setFilter] = useState("전체");
  const { data } = useData();
  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <div className="eyebrow">EXPLORE YOUR MIND</div>
          <h1>전체 훈련</h1>
          <p>가벼운 연습부터 차분한 도전까지. 오늘의 훈련을 선택하세요.</p>
        </div>
      </div>
      <div className="filter-tabs" aria-label="훈련 분류">
        {["전체", "작업기억", "주의 조절", "논리 추론", "기억 전략"].map(
          (f) => (
            <button
              className={filter === f ? "selected" : ""}
              key={f}
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ),
        )}
      </div>
      <div className="training-grid">
        {registry
          .filter((t) => filter === "전체" || t.category === filter)
          .map((t) => (
            <TrainingCard
              training={t}
              key={t.id}
              count={
                validSessions(data.sessions).filter(
                  (s) => s.trainingId === t.id,
                ).length
              }
            />
          ))}
      </div>
      <div className="quiet-note">
        처음이라면 연습 모드로 시작하세요. 시간 압박 없이 조작에 익숙해질 수
        있고, 정식 기록에는 포함되지 않습니다.
      </div>
    </div>
  );
}
