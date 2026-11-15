# 데이터 스키마 v1

최상위는 `schemaVersion`, `sessions`, `cards`, `settings`입니다. 런타임의 정확한 계약은 `src/infrastructure/storage/schema.ts`가 기준입니다.

Session: id, trainingId, startedAt, completedAt, status(completed/aborted), config, algorithmVersion(1 또는 2), durationSeconds, metrics, inputMethod.

Config: level, interval(ms), rounds, variant, mode(practice/training), auto, locations. 훈련별 허용 난이도·모드를 검증합니다. 각 설정은 결과에 스냅샷으로 보관합니다.

Metrics는 kind로 판별합니다. N-back은 네 혼동 행렬 카운트와 반응시간; Running Span은 순서·완전정답; Complex Span은 기억·계산; 추론은 문제·풀이 시간; 궁전은 회상·지연; 인출은 주관적 기억함·복습 수를 저장합니다.

Card: id, question, answer, due(현지 YYYY-MM-DD), stage, updatedAt.

통계는 완료된 정식 세션만 사용합니다. 차트는 config(난이도, 속도, 시행, 방식, 모드, 장소), 입력수단, 알고리즘 버전을 일치시킵니다. 다른 점수의 종합 IQ/뇌 나이로 환산하지 않습니다. 장소 목록은 궁전 이외에도 비교 키에 포함되는 보수적 정책입니다.
