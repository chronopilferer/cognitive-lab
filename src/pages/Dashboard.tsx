import { Link } from "react-router-dom";
import { useData } from "../app/DataProvider";
import { optionalTraining } from "../core/training/registry";
import {
  StudyProgress,
  studyProgress,
} from "../features/spaced-repetition/StudyProgress";
export function DashboardContent({
  start,
  busy,
}: {
  start: () => void;
  busy: boolean;
}) {
  const { data } = useData();
  const progress = studyProgress(data.cards);
  return (
    <>
      <section className="panel study-today">
        <h1>오늘의 복습</h1>
        <h2>
          {progress.due
            ? `복습할 카드 ${progress.due}장`
            : data.cards.length
              ? "오늘 예정된 복습을 마쳤습니다"
              : "첫 학습 카드를 추가하세요"}
        </h2>
        <div className="button-row wrap">
          {progress.due > 0 && (
            <button className="primary" disabled={busy} onClick={start}>
              복습 시작
            </button>
          )}
          <Link
            className={progress.due ? "secondary" : "primary"}
            to="/cards?view=add"
          >
            새 카드 추가
          </Link>
          <Link className="secondary" to="/cards?view=list">
            내 카드 관리
          </Link>
        </div>
      </section>
      <StudyProgress progress={progress} />
      <section className="panel">
        <h2>선택 훈련</h2>
        <div className="button-row wrap">
          {optionalTraining.map((t) => (
            <Link className="secondary" key={t.id} to={`/training/${t.id}`}>
              {t.name}
            </Link>
          ))}
        </div>
        <details>
          <summary>추가 학습 도구</summary>
          <Link to="/training/memory-palace">
            기억의 궁전 · 장소와 단어 연결하기
          </Link>
        </details>
      </section>
    </>
  );
}
