# 아키텍처

`pages → registry → features` 흐름이며, 게임 엔진은 React를 import하지 않는 순수 함수입니다. 게임은 `GameProps { config, onComplete }` 계약만 사용합니다. 저장은 페이지와 데이터 컨텍스트가 담당합니다. 카드 일정 갱신만 카드 기능의 저장 계약을 사용합니다.

- `src/core/training`: 설정/세션/결과 계약, 등록표, 공통 회상 채점, 난이도 정책
- `src/features/<id>`: 독립 문제 생성·채점·게임 화면. 다른 기능의 내부 구현을 import하지 않음
- `src/infrastructure/storage`: Zod 스키마, Promise 기반 Repository, localStorage 어댑터, 백업 병합
- `src/shared`: UI/타이머/RNG/현지 날짜
- `src/app`: 라우팅, 저장 컨텍스트, 레이아웃
- `src/pages`: 기능 조합

게임 상태는 게임의 React state/ref로 관리합니다. 복잡한 통합 reducer나 전역 상태 라이브러리는 추가하지 않았습니다. 세션은 setup→running→result 또는 stopped로 진행합니다. 시작 시 aborted 상태를 기록하고 성공 시 동일 ID를 completed로 교체하므로 새로고침으로 미완료 기록이 완료로 취급되지 않습니다.

난이도·채점과 UI를 분리했습니다. 새 저장 방식은 Repository 구현 교체로 접근할 수 있습니다. 스키마 마이그레이션은 새 버전 도입 시 추가하며 존재하지 않는 구버전을 임의로 만들지 않습니다. 데이터/채점 버전과 비교 조건은 명시적으로 저장합니다.

실행 기록은 영속 요약만 저장하며 자극 전체·입력 이벤트 전체를 저장하지 않습니다. N-back은 응답 시간 목록(최대 시행 수 수준)만 보관합니다.

## 확장 점검

Stroop을 추가할 때 기존 N-back/Running Span 파일은 변경하지 않고 새 기능과 등록표·타입·스키마를 추가합니다. 결과 스키마는 정적인 판별 유니언이므로 타입 안전성을 위해 명시적 확장이 필요합니다. IndexedDB로 바꾸면 Repository 교체와 마이그레이션을 담당하며 채점 엔진은 변경하지 않습니다. 통계는 결과 표시와 해당 지표 셀렉터를 확장합니다.
