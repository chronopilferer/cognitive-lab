# 새 훈련 추가

1. `src/features/stroop/engine.ts`: 시드 RNG를 받는 문제 생성과 순수 채점 함수 작성.
2. `Game.tsx`: `GameProps`에 맞춰 화면을 만들고 완료 시 `onComplete(metrics)` 한 번 호출.
3. 타입의 TrainingId와 Metrics 판별 유니언, 저장 스키마/설정 허용 범위를 확장.
4. `index.ts`에서 외부 계약만 export.
5. registry에 TrainingDefinition 등록.
6. `MetricDetails`, `accuracy`, `performance`에서 새 결과 타입을 명시적으로 처리.
7. 기존 세션 의미가 바뀌면 algorithmVersion을 증가시키고 스키마 마이그레이션 작성.
8. 생성·채점·중복 입력·중단에 대한 테스트 작성 후 전체 검사 실행.

```tsx
export function StroopGame({ config, onComplete }: GameProps) {
  // 문제 생성 / 응답 / 피드백은 feature 내부에서 관리
  // onComplete({kind:'stroop', correct, total})
  return <section>새로운 과제 UI</section>;
}
```

이 예시는 추가 위치를 설명하는 골격이며 바로 등록 가능한 완성 게임 코드는 아닙니다. 등록표 추가 후 목록 카드와 설정·결과 저장 흐름은 공통 페이지에서 연결됩니다. 기존 게임의 내부 파일은 수정할 필요가 없습니다. 새로운 기능에 의미 없는 난이도나 속도 필드를 통계에 합산하지 마세요.
