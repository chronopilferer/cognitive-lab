import { randomInt } from "../../shared/utils";
export function generateSpan(k: number, rng: () => number = Math.random) {
  return Array.from({ length: randomInt(k + 3, k + 8, rng) }, () =>
    String(randomInt(0, 9, rng)),
  );
}
