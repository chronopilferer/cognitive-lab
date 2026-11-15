# 오픈소스 조사 및 라이선스

2026-11-15에 실제 소스·패키지·LICENSE를 확인했습니다. 아래 프로젝트 코드를 복사하지 않았으며 일반 원리와 설계상 아이디어를 참고해 독립 구현했습니다. 실행/UI를 별도로 검증한 것은 아닙니다. 마지막 커밋 날짜는 유지보수 품질의 보증이 아닙니다.

| 저장소                                             | 확인 버전·라이선스                      | 실제 코드 관찰 및 결정                                                                                                                                                    |
| -------------------------------------------------- | --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| https://github.com/jonathanleane/rebuildyourfocus  | 5bc07f5 (2026-06-10), MIT               | apps/dual-n-back/src의 engine/state/screens/storage 분리, blockGenerator의 seeded RNG·우발 일치 차단, scoring의 준비 구간 제외. 저장 실패 무시는 따라하지 않고 오류 표시. |
| https://github.com/mentasuave01/brainworkshop      | 795a771 (2026-03-07), CC BY-NC 4.0      | Solid.js·TS, src/utils/gameEngine.ts의 채널별 처리와 gameEngine.test.ts의 점수식 차이 확인. 코드 재사용 안 함.                                                            |
| https://github.com/nyman-i/cerevana                | 6cef945 (2026-09-15), CC BY-NC 3.0      | js/rrt/generators 분리, quadbox IndexedDB와 설정 localStorage의 이원화. 앱에서는 단일 Repository로 일관화.                                                                |
| https://github.com/mahiluthra/working_memory_tests | c4700e7 (2022-11-24), 루트 LICENSE 없음 | operation_span_task.html의 문자·계산·결합 연습 흐름 참고. 번들 jsPsych license는 전체 앱 사용권이 아님. PHP·CDN 구조 미채택.                                              |
| https://github.com/loethen/freefocusgames          | 5f82e12 (2026-11-12), 루트 LICENSE 없음 | Next 15/React 19/Tailwind/Radix, GameHeader와 게임별 분리 확인. 서버 리더보드·AI·분석은 미채택.                                                                           |

사용자 저장소는 docs/decisions.md에 별도 기술했습니다. 공개 배포 전에 추가로 코드를 가져올 경우 정확한 LICENSE 파일을 다시 확인하세요. 의존 라이브러리의 고지는 각각 npm 패키지에 포함됩니다.
