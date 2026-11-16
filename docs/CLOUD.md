# 온라인 저장 운영

프로젝트: cognitive-lab (`zkfuaydidrhrniewaxqt`), 서울 ap-northeast-2, 기존 Free 조직.
공개 클라이언트에는 publishable key만 포함합니다. 관리자 키는 사용하지 않습니다.

## 인증 설정 (관리자가 1회 설정)

Supabase Authentication → URL Configuration:
- Site URL: https://chronopilferer.github.io/cognitive-lab/
- Redirect URLs: 위 주소 및 https://cognitive-lab-hyunwoo.serenechameleon3.chatgpt.site/

Authentication → Sign In / Providers → Email에서 이메일 가입/확인이 활성화되어 있어야 합니다.
기본 SMTP는 조직 팀원 이메일에만 보낼 수 있고 전송 제한이 있으므로 개인 사용 시 Supabase 조직에 등록한 이메일로 가입합니다. 다른 사람에게 개방하려면 별도 SMTP 설정이 필요합니다. 유료 서비스나 업그레이드를 자동 추가하지 않습니다.
PKCE 메일 확인/비밀번호 재설정 링크는 요청한 브라우저에서 엽니다.
확인 메일을 받지 못하면 서버 제한/스팸함/SMTP 설정을 확인합니다. 앱은 전송 오류를 표시합니다.

## 저장 규칙

로그아웃 상태는 기존 `cognitive-lab:v1` 브라우저 저장소를 그대로 사용합니다.
로그인은 브라우저 데이터를 자동 업로드하지 않습니다. 설정의 ‘이 브라우저 기록 가져오기’로 명시적으로 병합합니다.
계정별 카드·일정·세션·설정은 user_workspaces의 검증된 schemaVersion 1 JSON 문서에 저장합니다.
각 쓰기는 최신 문서를 읽고 revision 비교 후 원자적으로 갱신합니다. 충돌 시 최대 3회 재시도하며 카드 수정 시 updatedAt도 확인합니다.
RLS는 auth.uid()와 user_id가 일치하는 행만 허용하며 익명 접근은 차단합니다.
서버 함수는 SECURITY INVOKER, 빈 search_path이며 authenticated만 실행할 수 있습니다.

다른 기기의 변경은 새로고침/온라인 기록 새로 불러오기에 반영됩니다. 실시간 구독과 오프라인 업로드 대기열은 없습니다.
네트워크 오류 시 저장 실패를 표시하며 브라우저 데이터로 몰래 대체하지 않습니다.
로그아웃하면 계정 데이터를 화면에서 제거하고 원래 브라우저 데이터로 돌아갑니다.
초기화/JSON 교체는 현재 저장 대상 전체에 적용되므로 백업을 권장합니다.
카드 2,000장, 세션 5,000개, 서버 문서 5MiB 제한입니다. 대규모 확장 시 카드/세션별 테이블로 분리합니다.

## 검증

Vitest: 병합·원본 보존·충돌 재시도·통신 오류·계정 변경·오래된 카드 수정 방지.
Playwright CI: Auth/REST HTTP 계약 fixture로 로그인→카드 저장→새로고침→로그아웃 격리와 모바일 접근성.
실제 DB: 두 임시 사용자로 insert/update/CAS/RLS 읽기·쓰기 격리 검증 후 전체 rollback. Security advisor 0건.
실제 이메일 수신과 사용자 계정 로그인은 인증 설정을 완료한 뒤 별도로 확인해야 합니다.

현재 migration은 원격에 적용된 account_workspaces DDL의 소스 사본입니다. 기존 프로젝트에 재실행하지 마세요. 새 환경 생성에 사용합니다.
