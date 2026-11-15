import { useRef, useState } from "react";
import { Plus, Trash2, Pencil } from "lucide-react";
import { useData } from "../../app/DataProvider";
import { repository } from "../../infrastructure/storage/repository";
import { localDay, uniqueId } from "../../shared/utils";
import { parseCardText, uniqueDrafts, type CardDraft } from "../../core/training/cardImport";
export function CardManager() {
  const { data, act, setNotice } = useData();
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [dueOnly, setDueOnly] = useState(false);
  const [bulk, setBulk] = useState("");
  const [drafts, setDrafts] = useState<CardDraft[] | null>(null);
  const [bulkError, setBulkError] = useState("");
  const [adding, setAdding] = useState(false);
  const addLock = useRef(false);
  const fresh = drafts ? uniqueDrafts(drafts, data.cards) : [];
  const matches = data.cards.filter(
    (c) =>
      (!dueOnly || c.due <= localDay()) &&
      `${c.question} ${c.answer}`
        .toLocaleLowerCase()
        .includes(search.trim().toLocaleLowerCase()),
  );
  return (
    <section className="panel card-manager">
      <div className="section-title">
        <h2>나의 학습 카드</h2>
        <span className="muted">
          {data.cards.length}장 · 오늘 복습{" "}
          {data.cards.filter((c) => c.due <= localDay()).length}장
        </span>
      </div>
      <details className="bulk-cards">
        <summary>여러 카드 한 번에 추가</summary>
        <p className="hint">
          스프레드시트의 질문·정답 두 열을 복사해 붙여넣으세요. 한 줄에 한 장,
          두 칸은 탭으로 구분합니다. 최대 200장.
        </p>
        <label>
          카드 붙여넣기
          <textarea
            rows={6}
            value={bulk}
            maxLength={650000}
            onChange={(e) => {
              setBulk(e.target.value);
              setDrafts(null);
              setBulkError("");
            }}
            placeholder={"질문\t정답"}
          />
        </label>
        <div className="button-row wrap">
          <button
            className="secondary"
            disabled={adding}
            onClick={() => {
              try {
                setDrafts(parseCardText(bulk));
                setBulkError("");
              } catch (e) {
                setDrafts(null);
                setBulkError((e as Error).message);
              }
            }}
          >
            미리보기
          </button>
          <button
            className="ghost"
            disabled={adding}
            onClick={() => {
              setBulk("나만의 질문을 적으세요\t기억하고 싶은 정답을 적으세요");
              setDrafts(null);
              setBulkError("");
            }}
          >
            입력 형식 예시
          </button>
        </div>
        {bulkError && <p role="alert">{bulkError}</p>}
        {drafts && (
          <div className="bulk-preview">
            <p role="status">
              새 카드 {fresh.length}장 · 동일한 질문·정답{" "}
              {drafts.length - fresh.length}장 제외
            </p>
            <ul>
              {fresh.slice(0, 5).map((c, i) => (
                <li key={i}>
                  <strong>{c.question}</strong>
                  <p>{c.answer}</p>
                </li>
              ))}
            </ul>
            {fresh.length > 5 && <p className="hint">앞의 5장만 표시합니다.</p>}
            <button
              className="primary"
              disabled={adding || !fresh.length}
              onClick={async () => {
                if (addLock.current) return;
                addLock.current = true;
                setAdding(true);
                try {
                  if (await act(() => repository.addCards(fresh))) {
                    setBulk("");
                    setDrafts(null);
                    setNotice("중복을 제외한 새 카드를 추가했습니다.");
                  }
                } finally {
                  addLock.current = false;
                  setAdding(false);
                }
              }}
            >
              확인하고 추가
            </button>
          </div>
        )}
      </details>
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
      <div className="card-filters">
        <label>
          카드 검색
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="질문 또는 정답 검색"
          />
        </label>
        <label className="check-label">
          <input
            type="checkbox"
            checked={dueOnly}
            onChange={(e) => setDueOnly(e.target.checked)}
          />
          오늘 복습할 카드만
        </label>
        <p className="hint" aria-live="polite">
          {matches.length}장 표시
        </p>
      </div>
      <div className="card-library">
        {matches.map((card) => (
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
      {!!data.cards.length && !matches.length && (
        <p className="hint">검색 조건에 맞는 카드가 없습니다.</p>
      )}
      {!data.cards.length && (
        <p className="hint">
          외우고 싶은 개념이나 표현으로 첫 카드를 만들어 보세요.
        </p>
      )}
    </section>
  );
}
