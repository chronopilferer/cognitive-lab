import {
  ExternalLink,
  BookOpen,
  FlaskConical,
  Focus,
  Lightbulb,
} from "lucide-react";
const sources = [
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
        ))}
      </div>
      <section className="panel">
        <h2>지속 가능한 사용법</h2>
        <ul className="guide-list">
          <li>
            정해진 종료일 없이, 필요한 훈련을 원하는 만큼 선택하세요. 피로하면
            쉬어도 기록은 유지됩니다.
          </li>
          <li>
            처음에는 연습 모드로 규칙을 익히고, 정확히 이해한 후 정식 훈련을
            진행하세요.
          </li>
          <li>
            자동 난이도는 같은 조건에서 두 번의 수행을 보고 조절합니다. 80%·60%
            기준은 이 앱의 운영 규칙입니다.
          </li>
          <li>
            N-back은 적중률과 오경보율, Complex Span은 계산과 기억을 함께
            고려합니다.
          </li>
          <li>
            탭 전환이나 일시정지는 기억·반응 측정 조건을 바꿉니다. 중단 기록으로
            남기고 새로운 세션으로 시작합니다.
          </li>
          <li>
            연구 과제의 원리를 바탕으로 독립 구현했습니다. 실험실 장비·원본
            프로토콜·표준화 검사와 동등하지 않습니다.
          </li>
          <li>
            시각 자극 과제는 시각적 제시가 규칙의 일부입니다. 보조기술을 사용한
            결과는 다른 조건과 동일하게 해석하지 마세요.
          </li>
        </ul>
      </section>
      <section>
        <div className="section-title">
          <h2>
            <BookOpen size={22} /> 확인한 참고 문헌
          </h2>
        </div>
        {sources.map((s) => (
          <a
            className="panel source-card"
            href={s.url}
            target="_blank"
            rel="noreferrer"
            key={s.url}
          >
            <div>
              <h3>{s.title}</h3>
              <p className="source-subtitle">{s.subtitle}</p>
              <p>{s.note}</p>
            </div>
            <ExternalLink size={18} />
          </a>
        ))}
      </section>
      <p className="hint">
        문헌 확인: 2026-11-15 · 연구의 효과를 개인의 예상 향상률로 환산하지
        않습니다.
      </p>
    </div>
  );
}
