import { useState, type FormEvent } from "react";
import { useAuth } from "../../app/AuthProvider";
import { useData } from "../../app/DataProvider";
import { supabase, authRedirect } from "../../infrastructure/cloud/client";
import {
  localRepository,
  repository,
} from "../../infrastructure/storage/repository";
export function AccountPanel() {
  const { user, recovery } = useAuth();
  const { act, setNotice } = useData();
  const [mode, setMode] = useState<"login" | "signup" | "reset">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  async function run(fn: () => Promise<void>) {
    if (busy) return;
    setBusy(true);
    setMessage("");
    try {
      await fn();
    } catch (e) {
      setMessage(
        e instanceof Error
          ? e.message
          : "요청에 실패했습니다. 다시 시도해 주세요.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function submit(e: FormEvent) {
    e.preventDefault();
    await run(async () => {
      if (recovery && user) {
        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw error;
        setPassword("");
        setMessage("비밀번호를 변경했습니다.");
        return;
      }
      if (mode === "reset") {
        const { error } = await supabase.auth.resetPasswordForEmail(
          email.trim(),
          { redirectTo: authRedirect() },
        );
        if (error) throw error;
        setMessage(
          "등록된 주소라면 재설정 메일이 도착합니다. 메일의 링크를 열어 주세요.",
        );
        return;
      }
      const { error } =
        mode === "signup"
          ? await supabase.auth.signUp({
              email: email.trim(),
              password,
              options: { emailRedirectTo: authRedirect() },
            })
          : await supabase.auth.signInWithPassword({
              email: email.trim(),
              password,
            });
      if (error) throw error;
      setPassword("");
      if (mode === "signup")
        setMessage(
          "가입 요청을 처리했습니다. 확인 메일이 도착하면 링크를 누른 후 로그인하세요.",
        );
    });
  }
  return (
    <section className="panel account-panel">
      <h2>계정 및 온라인 저장</h2>
      {user && !recovery ? (
        <>
          <p className="account-email">
            <strong>{user.email}</strong>
          </p>
          <p>
            카드·복습 일정·훈련 기록·설정을 이 계정에 저장합니다. 다른
            기기에서도 같은 계정으로 로그인하세요.
          </p>
          <p className="hint">
            저장에는 인터넷 연결이 필요합니다. 다른 기기에서 수정한 내용은 아래
            새로 불러오기를 누르거나 페이지를 다시 열면 반영됩니다.
          </p>
          <div className="button-row wrap">
            <button
              className="secondary"
              disabled={busy}
              onClick={() =>
                void run(async () => {
                  if (await act(() => repository.read()))
                    setNotice("온라인 기록을 다시 불러왔습니다.");
                })
              }
            >
              온라인 기록 새로 불러오기
            </button>
            <button
              className="primary"
              disabled={busy}
              onClick={() =>
                void run(async () => {
                  const local = await localRepository.read();
                  if (
                    !confirm(
                      `이 브라우저의 카드 ${local.cards.length}장과 기록 ${local.sessions.length}개를 현재 계정에 병합할까요? 브라우저 원본은 유지됩니다.`,
                    )
                  )
                    return;
                  if (await act(() => repository.importData(local, "merge")))
                    setNotice(
                      "브라우저 기록을 계정에 병합했습니다. 원본도 유지됩니다.",
                    );
                })
              }
            >
              이 브라우저 기록 가져오기
            </button>
            <button
              className="secondary"
              disabled={busy}
              onClick={() =>
                void run(async () => {
                  const { error } = await supabase.auth.signOut({
                    scope: "local",
                  });
                  if (error) throw error;
                })
              }
            >
              로그아웃
            </button>
          </div>
        </>
      ) : (
        <>
          <p>
            {recovery
              ? "새 비밀번호를 입력하세요."
              : "로그인하면 여러 기기에서 나의 카드를 이어서 공부할 수 있어요. 로그인 없이도 이 브라우저에서 계속 사용할 수 있습니다."}
          </p>
          {!recovery && (
            <div className="button-row wrap">
              {(
                [
                  ["login", "로그인"],
                  ["signup", "회원가입"],
                  ["reset", "비밀번호 찾기"],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  disabled={busy}
                  className={mode === value ? "primary" : "secondary"}
                  onClick={() => {
                    setMode(value);
                    setMessage("");
                    setPassword("");
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
          <form className="account-form" onSubmit={submit}>
            {!recovery && (
              <label>
                이메일
                <input
                  type="email"
                  autoComplete="email"
                  required
                  maxLength={254}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={busy}
                />
              </label>
            )}
            {(mode !== "reset" || recovery) && (
              <label>
                비밀번호
                <input
                  type="password"
                  autoComplete={
                    mode === "login" && !recovery
                      ? "current-password"
                      : "new-password"
                  }
                  required
                  minLength={mode === "login" && !recovery ? 1 : 8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={busy}
                />
              </label>
            )}
            {(mode === "signup" || recovery) && (
              <p className="hint">8자 이상으로 입력하세요.</p>
            )}
            <button className="primary" disabled={busy} type="submit">
              {busy
                ? "처리 중…"
                : recovery
                  ? "새 비밀번호 저장"
                  : mode === "signup"
                    ? "이메일로 가입하기"
                    : mode === "reset"
                      ? "재설정 메일 받기"
                      : "계정으로 로그인"}
            </button>
          </form>
          {!recovery && (
            <p className="hint">
              브라우저 기록은 자동 전송되지 않습니다. 로그인 후 ‘이 브라우저
              기록 가져오기’로 옮길 수 있습니다.
            </p>
          )}
        </>
      )}
      {message && (
        <p role="status" className="alert">
          {message}
        </p>
      )}
    </section>
  );
}
