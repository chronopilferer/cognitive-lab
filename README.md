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

이번 실행에서 별도 미리보기 호스트 배포를 제공합니다. **사용자 GitHub 새 저장소 생성/Pages 활성화는 인증이 필요하여 아직 수행하지 않았습니다.** 워크플로 파일 준비를 실제 Pages 배포 완료로 해석하지 마세요.

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
