import { randomInt, shuffle } from "../../shared/utils";
export function generateComplex(
  count: number,
  rng: () => number = Math.random,
) {
  const extraTrue = rng() < 0.5;
  const truths = shuffle(
    Array.from({ length: count }, (_, i) => (i % 2 === 0) === extraTrue),
    rng,
  );
  const letters = shuffle("ABCDEFGH".split(""), rng).slice(0, count);
  return letters.map((letter, i) => {
    const a = randomInt(2, 9, rng),
      b = randomInt(1, 9, rng);
    const multiply = count >= 5 && i % 2 === 0;
    const actual = multiply ? a * b : a + b;
    const shown =
      actual + (truths[i] ? 0 : randomInt(1, 3, rng) * (rng() < 0.5 ? -1 : 1));
    return {
      letter,
      a,
      b,
      operator: multiply ? "×" : "+",
      shown,
      truth: actual === shown,
    };
  });
}
