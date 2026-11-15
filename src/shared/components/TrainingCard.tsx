import { Link } from "react-router-dom";
import { ArrowUpRight, Clock3, ArrowRight } from "lucide-react";
import type { TrainingDefinition } from "../../core/training/types";
import { TrainingIcon } from "./Icon";
export function TrainingCard({
  training: t,
  count = 0,
}: {
  training: TrainingDefinition;
  count?: number;
}) {
  return (
    <Link className={`training-card ${t.accent}`} to={`/training/${t.id}`}>
      <div className="card-top">
        <div className="training-icon">
          <TrainingIcon name={t.icon} />
        </div>
        <span className="category-tag">{t.category}</span>
        <ArrowUpRight size={19} className="card-arrow" />
      </div>
      <span className="english-label">{t.english}</span>
      <h3>{t.name}</h3>
      <p>{t.description}</p>
      <div className="card-bottom">
        <span>
          <Clock3 size={14} />
          {t.minutes}
        </span>
        <span>
          {count ? `${count}회 훈련` : "시작해 보기"} <ArrowRight size={15} />
        </span>
      </div>
    </Link>
  );
}
