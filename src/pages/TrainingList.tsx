import { optionalTraining } from "../core/training/registry";
import { TrainingCard } from "../shared/components/TrainingCard";
import { useData } from "../app/DataProvider";
import { validSessions } from "../features/statistics/selectors";
export function TrainingList() {
  const { data } = useData();
  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <h1>선택 훈련</h1>
        </div>
      </div>
      <div className="training-grid">
        {optionalTraining.map((t) => (
          <TrainingCard
            training={t}
            key={t.id}
            count={
              validSessions(data.sessions).filter((s) => s.trainingId === t.id)
                .length
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
