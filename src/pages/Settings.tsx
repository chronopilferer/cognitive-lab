import { Link } from "react-router-dom";
import { AccountPanel } from "../shared/components/AccountPanel";
import { useAuth } from "../app/AuthProvider";
import { Button } from "../shared/components/Button";
import { useState } from "react";
import { Download, Upload, ShieldCheck, Sun, Moon } from "lucide-react";
import { useData } from "../app/DataProvider";
import { repository } from "../infrastructure/storage/repository";
import { validateData, type Data } from "../infrastructure/storage/schema";
function download(content: string, name: string) {
  const url = URL.createObjectURL(
    new Blob([content], { type: "application/json" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function Settings() {
  const { user } = useAuth();
  const { data, error, act, setNotice } = useData();
  const [pending, setPending] = useState<Data | null>(null);
  const [mode, setMode] = useState<"merge" | "replace">("merge");
  const [confirmText, setConfirmText] = useState("");
  return (
    <div className="page narrow-page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">MAKE IT YOURS</span>
          <h1>설정 및 데이터</h1>
          <p>나의 기록을 안전하게 보관하고, 편한 환경을 선택하세요.</p>
        </div>
      </div>
      <AccountPanel />
      <Link to="/research">학습 효과와 한계 · 연구 가이드</Link>
      <section className="panel">
        <h2>개발 소스</h2>
        <p className="muted">
          GitHub Pages 배포 설정과 테스트·개발 문서를 포함한 소스입니다. 실행
          방법은 README에서 확인하세요.
        </p>
        <Button asChild variant="secondary">
          <a
            href={`${import.meta.env.BASE_URL}cognitive-lab-source.zip`}
            download
          >
            <Download size={17} />
            소스 ZIP 다운로드
          </a>
        </Button>
      </section>
      <section className="panel">
        <h2>화면 테마</h2>
        <div className="button-row">
          <button
            className={
              data.settings.theme === "light" ? "primary" : "secondary"
            }
            onClick={() => void act(() => repository.setTheme("light"))}
          >
            <Sun size={18} />
            라이트
          </button>
          <button
            className={data.settings.theme === "dark" ? "primary" : "secondary"}
            onClick={() => void act(() => repository.setTheme("dark"))}
          >
            <Moon size={18} />
            다크
          </button>
        </div>
      </section>
      <section className="panel">
        <div className="section-title">
          <h2>백업과 복원</h2>
          <ShieldCheck size={22} />
        </div>
        <p>
          훈련 기록 {data.sessions.length}개 · 학습 카드 {data.cards.length}장
        </p>
        <p className="muted">
          {user
            ? "현재 계정의 온라인 기록입니다. 중요한 기록은 JSON으로 따로 백업할 수 있습니다."
            : "기록은 이 브라우저에 저장됩니다. 로그인 후 브라우저 기록 가져오기로 온라인에 보관하거나 JSON으로 백업하세요."}
        </p>
        <div className="button-row wrap">
          <button
            className="primary"
            onClick={() =>
              void act(async () => {
                download(
                  await repository.exportData(),
                  `cognitive-lab-${new Date().toISOString().slice(0, 10)}.json`,
                );
                setNotice("백업 파일을 다운로드했습니다.");
              })
            }
          >
            <Download size={17} />
            JSON 내보내기
          </button>
          <label className="secondary file-button">
            <Upload size={17} />
            JSON 가져오기
            <input
              type="file"
              accept=".json,application/json"
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                if (f.size > 5 * 1024 * 1024) {
                  setNotice("5MB 이하의 JSON 파일을 선택하세요.");
                  return;
                }
                try {
                  setPending(validateData(JSON.parse(await f.text())));
                  setConfirmText("");
                } catch {
                  setNotice(
                    "파일 형식이나 데이터 버전이 올바르지 않습니다. 현재 기록은 변경하지 않았습니다.",
                  );
                }
                e.target.value = "";
              }}
            />
          </label>
        </div>
        {error && !user && (
          <button
            className="secondary"
            onClick={() =>
              download(repository.rawBackup(), "cognitive-lab-original.json")
            }
          >
            읽기 오류가 난 원본 다운로드
          </button>
        )}
        {pending && (
          <div className="restore-box">
            <h3>복원할 데이터 확인</h3>
            <p>
              세션 {pending.sessions.length}개 · 카드 {pending.cards.length}장
            </p>
            <label>
              복원 방식
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value as "merge" | "replace")}
              >
                <option value="merge">현재 기록에 병합</option>
                <option value="replace">현재 기록 전체 교체</option>
              </select>
            </label>
            <p className="hint">
              병합은 동일 기록을 한 번만 남기며, 같은 ID의 다른 세션은 충돌로
              거절합니다. 카드는 최신 수정본을 사용합니다. 교체는 현재 기록과
              설정을 덮어씁니다.
            </p>
            {mode === "replace" && (
              <label>
                교체하려면 ‘교체’를 입력하세요
                <input
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                />
              </label>
            )}
            <div className="button-row">
              <button
                className="primary"
                disabled={mode === "replace" && confirmText !== "교체"}
                onClick={async () => {
                  if (await act(() => repository.importData(pending, mode))) {
                    setPending(null);
                    setNotice("데이터를 복원했습니다.");
                  }
                }}
              >
                확인하고 복원
              </button>
              <button className="secondary" onClick={() => setPending(null)}>
                취소
              </button>
            </div>
          </div>
        )}
      </section>
      <section className="panel">
        <h2>데이터 초기화</h2>
        <p className="muted">
          {user
            ? "현재 계정의 온라인 기록·카드·설정을 모두 삭제합니다. 다른 기기에도 반영되며 브라우저 원본은 유지됩니다."
            : "이 브라우저의 기록·카드·설정을 모두 삭제합니다."}{" "}
          먼저 백업을 권장합니다.
        </p>
        <button
          className="danger-button"
          onClick={() => {
            if (
              prompt("모든 데이터를 삭제하려면 ‘초기화’를 입력하세요.") ===
              "초기화"
            )
              void act(async () => {
                await repository.clear();
                setNotice("데이터를 초기화했습니다.");
              });
          }}
        >
          모든 데이터 초기화
        </button>
      </section>
      <p className="hint">
        스키마 v1 · {user ? "계정에 온라인 저장" : "브라우저에 저장"} · 최대
        세션 5,000개 / 카드 2,000장. 한도에 도달하면 백업 후 오래된 기록을
        삭제해 주세요. 기록을 자동 삭제하지 않습니다.
      </p>
    </div>
  );
}
