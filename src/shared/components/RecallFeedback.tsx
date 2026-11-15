export function RecallFeedback({
  answer,
  expected,
  labels,
  onContinue,
}: {
  answer: string[];
  expected: string[];
  labels?: string[];
  onContinue: () => void;
}) {
  return (
    <section className="feedback">
      <h2>회상한 내용을 확인하세요</h2>
      <ol className="recall-review">
        {expected.map((word, i) => (
          <li key={i}>
            <span>{labels?.[i] ?? `${i + 1}번째`}</span>
            <span>내 답: {answer[i]?.trim() || "모름"}</span>
            <strong>
              {answer[i]?.trim() === word ? "✓ 정답" : `✕ 정답: ${word}`}
            </strong>
          </li>
        ))}
      </ol>
      <button className="primary" onClick={onContinue}>
        결과 보기
      </button>
    </section>
  );
}
