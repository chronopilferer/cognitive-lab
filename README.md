# Cognitive Lab · 인지훈련 실험실

기간을 정하지 않고 원하는 훈련을 반복하는 한국어 인지훈련 SPA입니다. 8주 프로그램·주차별 평가는 포함하지 않습니다. 기록의 의미를 과장하지 않고, 동일 조건에서 수행 변화를 관찰합니다.

## 실행

Node.js 22 이상 권장.

```bash
npm ci
npm run dev
npm test
npm run typecheck
npm run lint
npm run build
```

- React 19 / TypeScript strict / Vite / HashRouter
- Tailwind CSS v4 + CSS 변수 기반 디자인 / Radix·CVA 버튼 기반 / Lucide / Recharts
- Zod 검증 / Promise Repository / localStorage
- Vitest + Testing Library / Playwright + axe (CI)
- 서버, 로그인, 유료 API 없음

## 기능

1. 위치·문자 N-back: 준비 구간 제외, 목표 비율 제어, 적중·누락·오경보·올바른 거절
2. Running Span: 무작위 길이의 숫자열, 마지막 K개 순서 회상, 부분·완전 정답
3. Complex Span: 문자 기억과 계산 판단, 계산/기억 별도 채점
4. 조건 누적 추론: 순서 관계, 독립 전수 탐색 유일해 검증, 조건별 피드백
5. 기억의 궁전: 사용자 장소 경로, 단어 연상, 즉시·30초 지연 회상
6. 인출 연습: 사용자 카드 CRUD, 기억 평가, 1·3·7일 이후 간격 확대

모든 훈련은 설명/예시/연습/정식/결과를 제공합니다. 자동 난이도, 훈련별 기록, 같은 조건 차트, JSON 백업/병합/교체, 다크 모드, 터치·키보드 조작을 지원합니다.

## 배포

`.github/workflows/pages.yml`은 main에서 검사·빌드·E2E 후 Pages에 배포합니다. 저장소 이름은 `cognitive-lab`, Pages Source는 GitHub Actions로 지정합니다. Vite base는 GitHub Actions 빌드 시 `/cognitive-lab/`, 다른 정적 호스트에서는 상대 경로입니다.

GitHub 저장소에는 소스와 워크플로가 등록되어 있습니다. Pages 게시에는 Settings → Pages에서 GitHub Actions를 활성화해야 합니다. 워크플로 파일 존재만으로 배포 성공을 의미하지 않으며 Actions 실행 결과를 확인하세요.

## 문서

- [아키텍처](docs/architecture.md)
- [새 훈련 추가](docs/adding-training.md)
- [저장과 복원](docs/storage.md), [스키마](docs/data-schema.md)
- [테스트와 검증 범위](docs/testing.md)
- [배포](docs/deployment.md)
- [과학적 근거](docs/research.md), [참고 코드 조사](docs/references.md)
- [요구사항 개선 및 범위](docs/decisions.md)

## 제한

이 앱은 표준화·임상 검사가 아닙니다. Dual N-back/청각, 추론의 속성·공간·수량 유형, 장기 지연 회상 알림, 기기 간 동기화는 현재 구현하지 않았습니다. 실제 iOS/Android 기기 검증은 별도로 필요합니다. 로컬 기록은 브라우저·도메인별로 분리됩니다.

## 내 자료로 인출 연습

카드 화면에서 스프레드시트의 질문·정답 두 열을 붙여넣어 최대 200장을 미리보기 후 추가할 수 있습니다. 같은 질문·정답은 중복 제외하고 기존 복습 일정은 보존합니다. 목록 검색과 오늘 복습 필터를 제공하며, 훈련 중에는 답을 직접 적어 정답과 비교할 수 있습니다. 작성 내용은 저장하거나 자동 채점하지 않습니다.

### 과목별 카드 묶음
인출·간격 반복 화면에서 `저장할 묶음`에 과목 이름을 입력하고 카드를 추가합니다. 기존 카드는 수정 버튼으로 묶음을 옮기며 복습 일정은 유지됩니다. `훈련할 카드 묶음`은 실제 정식 훈련·연습에 적용됩니다. 검색 필터는 목록에만 적용됩니다. 묶음은 카드에서 자동으로 구성되며 빈 묶음은 저장하지 않습니다. 기존 v1 백업의 묶음 없는 카드는 기본 묶음으로 표시합니다. 새 백업은 최신 버전에서 복원하세요.

## 계정과 온라인 저장

설정에서 이메일 로그인 후 카드·복습 일정·훈련 기록을 Supabase에 저장합니다. 기존 브라우저 기록은 직접 가져오기를 선택할 때만 병합합니다. 인증 URL/메일 설정과 저장·보안·검증 범위는 [온라인 저장 운영 문서](docs/CLOUD.md)를 참고하세요.
