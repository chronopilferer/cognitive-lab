import { useState } from "react";
import { Plus, Trash2, Pencil } from "lucide-react";
import { useData } from "../../app/DataProvider";
import { repository } from "../../infrastructure/storage/repository";
import { localDay, uniqueId } from "../../shared/utils";
export function CardManager() {
  const { data, act, setNotice } = useData();
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  return (
    <section className="panel card-manager">
      <div className="section-title">
        <h2>나의 학습 카드</h2>
        <span className="muted">
          {data.cards.length}장 · 오늘 복습{" "}
          {data.cards.filter((c) => c.due <= localDay()).length}장
        </span>
      </div>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const previous = data.cards.find((c) => c.id === editing);
          if (
            await act(() =>
              repository.saveCard({
                id: editing ?? uniqueId(),
                question: question.trim(),
                answer: answer.trim(),
                due: previous?.due ?? localDay(),
                stage: previous?.stage ?? 0,
                updatedAt: new Date().toISOString(),
              }),
            )
          ) {
            setQuestion("");
            setAnswer("");
            setEditing(null);
            setNotice("학습 카드를 저장했습니다.");
          }
        }}
      >
        <div className="form-grid">
          <label>
            질문
            <input
              required
              maxLength={1000}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="예: BFS에서 큐를 사용하는 이유는?"
            />
          </label>
          <label>
            정답
            <textarea
              required
              maxLength={2000}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="스스로 떠올리고 싶은 답을 적어주세요."
            />
          </label>
        </div>
        <button
          className="primary"
          type="submit"
          disabled={!question.trim() || !answer.trim()}
        >
          <Plus size={16} />
          {editing ? "수정 저장" : "카드 추가"}
        </button>
        {editing && (
          <button
            type="button"
            className="ghost"
            onClick={() => {
              setEditing(null);
              setQuestion("");
              setAnswer("");
            }}
          >
            취소
          </button>
        )}
      </form>
      <div className="card-library">
        {data.cards.map((card) => (
          <div className="library-row" key={card.id}>
            <div>
              <strong>{card.question}</strong>
              <small>
                다음 복습 {card.due} · {card.stage}단계
              </small>
            </div>
            <button
              className="icon-button"
              aria-label={`${card.question} 수정`}
              onClick={() => {
                setEditing(card.id);
                setQuestion(card.question);
                setAnswer(card.answer);
              }}
            >
              <Pencil size={16} />
            </button>
            <button
              className="icon-button"
              aria-label={`${card.question} 삭제`}
              onClick={() => {
                if (confirm("이 학습 카드를 삭제할까요?"))
                  void act(() => repository.deleteCard(card.id));
              }}
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
      {!data.cards.length && (
        <p className="hint">
          외우고 싶은 개념이나 표현으로 첫 카드를 만들어 보세요.
        </p>
      )}
    </section>
  );
}
