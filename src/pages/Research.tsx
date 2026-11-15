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
        ))}
      </div>
      <section className="panel evidence-guide">
        <h2>어떤 목적으로 쓰면 좋을까요?</h2>
        <p className="muted">
          연구가 뒷받침하는 범위와 이 앱에서 관찰할 수 있는 것을 구분합니다.
        </p>
        {[
          {
            title: "배운 내용을 오래 기억하기",
            body: "인출·간격 반복: 답을 먼저 떠올린 뒤 확인하고, 다른 날 다시 복습합니다. 업무 개념·전공·외국어 등 내가 학습한 자료로 활용하세요.",
            limit:
              "이 앱의 기억함 비율은 자기평가입니다. 실제 시험 성적이나 지능 점수가 아닙니다.",
            to: "spaced-repetition",
            source: "https://pubmed.ncbi.nlm.nih.gov/33683913/",
          },
          {
            title: "기억 전략 연습하기",
            body: "기억의 궁전: 익숙한 장소와 항목을 생생한 장면으로 연결합니다. 먼저 고정된 장소 순서를 익히고 한 장소에 한 항목을 놓아보세요.",
            limit:
              "즉시 회상과 장기 기억은 다릅니다. 오늘 외운 정보를 며칠 뒤에도 기억하는지는 별도로 확인해야 합니다.",
            to: "memory-palace",
            source: "https://pubmed.ncbi.nlm.nih.gov/33658191/",
          },
          {
            title: "작업기억 과제 수행 관찰하기",
            body: "N-back·Running Span·Complex Span: 같은 난이도·속도·입력 방식으로 반복해 수행 변화를 비교하세요.",
            limit:
              "유사 과제의 개선과 일상·지능으로의 전이는 다릅니다. 게임 점수만으로 후자를 판단하지 않습니다.",
            to: "nback",
            source: "https://pubmed.ncbi.nlm.nih.gov/27474138/",
          },
          {
            title: "조건을 연결하는 풀이 연습",
            body: "조건 누적 추론: 각 조건이 왜 필요한지 확인하고, 틀린 조건을 다시 설명해 보세요.",
            limit:
              "이 앱의 독립 구현 과제입니다. 일반 추론 능력 향상에 대한 앱 자체의 검증은 없습니다.",
            to: "reasoning",
            source: null,
          },
        ].map((item) => (
          <article className="evidence-row" key={item.to}>
            <h3>{item.title}</h3>
            <p>{item.body}</p>
            <p className="hint">해석의 한계: {item.limit}</p>
            <div className="button-row wrap">
              <Link className="secondary" to={`/training/${item.to}`}>
                훈련 열기
              </Link>
              {item.source && (
                <a
                  className="ghost"
                  href={item.source}
                  target="_blank"
                  rel="noreferrer"
                >
                  관련 연구 ↗
                </a>
              )}
            </div>
          </article>
        ))}
      </section>
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
        문헌 추가 확인: 2026-11-16 · 연구의 효과를 개인의 예상 향상률로 환산하지
        않습니다.
      </p>
    </div>
  );
}
