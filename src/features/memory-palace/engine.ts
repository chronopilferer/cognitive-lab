import { shuffle } from "../../shared/utils";
export const WORDS = [
  "사과",
  "우산",
  "기차",
  "고양이",
  "피아노",
  "풍선",
  "시계",
  "바나나",
  "자전거",
  "안경",
  "나무",
  "카메라",
  "강아지",
  "책",
  "달",
  "구름",
  "연필",
  "딸기",
  "모자",
  "열쇠",
];
export const palaceWords = (n: number, rng: () => number = Math.random) =>
  shuffle(WORDS, rng).slice(0, n);
