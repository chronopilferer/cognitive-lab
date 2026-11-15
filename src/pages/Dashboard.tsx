import { Link } from "react-router-dom";
import {
  ArrowRight,
  Flame,
  Timer,
  CalendarDays,
  Sparkles,
  ArrowUpRight,
  Check,
  BrainCircuit,
} from "lucide-react";
import { useData } from "../app/DataProvider";
import { registry } from "../core/training/registry";
import {
  overview,
  activity,
  validSessions,
} from "../features/statistics/selectors";
import { TrainingCard } from "../shared/components/TrainingCard";
import { localDay } from "../shared/utils";
export function Dashboard() {
  const { data } = useData();
  const stats = overview(data.sessions);
  const valid = validSessions(data.sessions);
  const due = data.cards.filter((c) => c.due <= localDay()).length;
  const recent = [...valid].sort((a, b) =>
    b.completedAt.localeCompare(a.completedAt),
  )[0];
  const next = due
    ? registry.find((t) => t.id === "spaced-repetition")!
    : recent
      ? registry.find((t) => t.id === recent.trainingId)!
      : registry[0];
  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <div className="eyebrow">YOUR DAILY SPACE</div>
          <h1>오늘도, 나만의 속도로.</h1>
          <p>기억하고, 집중하고, 다시 도전하는 작은 시간을 만들어 보세요.</p>
        </div>
        <span className="date-pill">
          <CalendarDays size={16} />
          {new Date().toLocaleDateString("ko-KR", {
            month: "long",
            day: "numeric",
            weekday: "long",
          })}
        </span>
      </div>
      <section className="hero">
        <div className="hero-copy">
          <span className="hero-tag">
            <span /> 매일의 작은 실험
          </span>
          <h2>
            기억과 집중을 위한
            <br />
            <em>나만의 훈련 공간</em>
          </h2>
          <p>
            정해진 기간도, 경쟁도 없어요.
            <br />
            가볍게 시작하고, 나의 변화를 관찰해 보세요.
          </p>
          <Link className="primary hero-button" to={`/training/${next.id}`}>
            {due
              ? `오늘 복습 ${due}장 확인하기`
              : recent
                ? "최근 훈련 이어가기"
                : "지금 훈련 시작하기"}{" "}
            <ArrowRight size={18} />
          </Link>
          <span className="hero-caption">
            {next.name}부터 시작 · 언제든 다른 훈련을 선택할 수 있어요
          </span>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <div className="brain-tile">
            <BrainCircuit size={82} strokeWidth={1.2} />
            <span>ONE STEP AT A TIME</span>
          </div>
          <div className="float-tile number-tile">2</div>
          <div className="float-tile check-tile">
            <Check size={26} />
          </div>
          <div className="float-tile dots-tile">
            {Array.from({ length: 9 }, (_, i) => (
              <i key={i} className={i === 4 ? "dot-active" : ""} />
            ))}
          </div>
          <span className="sparkle sparkle-one">✦</span>
          <span className="sparkle sparkle-two">✦</span>
        </div>
      </section>
      <div className="stat-row">
        {[
          {
            icon: Flame,
            label: "완료한 훈련",
            value: stats.count,
            unit: "회",
            caption: stats.count
              ? "쌓여가는 나의 연습"
              : "첫 번째 기록을 만들어 보세요",
            color: "mint",
          },
          {
            icon: Timer,
            label: "누적 훈련 시간",
            value: stats.minutes,
            unit: "분",
            caption: "나에게 집중한 시간",
            color: "blue",
          },
          {
            icon: CalendarDays,
            label: "함께한 날",
            value: stats.days,
            unit: "일",
            caption: "쉬어 가도 기록은 그대로",
            color: "peach",
          },
        ].map(({ icon: Icon, label, value, unit, caption, color }) => (
          <div className="stat-card" key={label}>
            <span className={`stat-icon ${color}`}>
              <Icon size={21} />
            </span>
            <div>
              <span className="stat-label">{label}</span>
              <div className="stat-value">
                {value}
                <small>{unit}</small>
              </div>
              <p>{caption}</p>
            </div>
          </div>
        ))}
      </div>
      <section>
        <div className="section-title">
          <div>
            <h2>어떤 훈련을 해볼까요?</h2>
            <p>지금 필요한 훈련을 골라보세요.</p>
          </div>
          <Link to="/training">
            전체 훈련 보기 <ArrowRight size={16} />
          </Link>
        </div>
        <div className="training-grid">
          {registry.map((t) => (
            <TrainingCard
              key={t.id}
              training={t}
              count={valid.filter((s) => s.trainingId === t.id).length}
            />
          ))}
        </div>
      </section>
      <div className="bottom-grid">
        <section className="panel activity-panel">
          <div className="section-title">
            <h2>작은 습관의 발자국</h2>
            <span className="muted">최근 28일 활동</span>
          </div>
          <div className="activity-grid">
            {activity(data.sessions, 28).map((a) => (
              <span
                key={a.day}
                role="img"
                className={`activity-cell intensity-${Math.min(3, a.count)}`}
                title={`${a.day}: ${a.count}회`}
                aria-label={`${a.day} ${a.count}회`}
              />
            ))}
          </div>
          <div className="activity-caption">
            <span>기간 제한 없이 기록이 쌓여요.</span>
            <span>
              적음 <i />
              <i />
              <i />
              <i /> 많음
            </span>
          </div>
        </section>
        <Link
          to={due ? "/training/spaced-repetition" : "/research"}
          className="panel insight-panel"
        >
          <span className="insight-icon">
            <Sparkles size={22} />
          </span>
          <div>
            <span className="eyebrow">
              {due ? "READY TO RECALL" : "LAB NOTE"}
            </span>
            <h3>
              {due ? `${due}장의 카드가 기다려요` : "잘하는 것과 달라지는 것"}
            </h3>
            <p>
              {due
                ? "답을 보기 전에 떠올려 보세요. 오늘의 복습을 시작할 수 있어요."
                : "훈련 점수의 상승이 곧 지능의 향상은 아니에요. 근거를 알고 연습해요."}
            </p>
          </div>
          <ArrowUpRight size={20} />
        </Link>
      </div>
    </div>
  );
}
