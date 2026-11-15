import { randomInt, shuffle } from "../../shared/utils";
export function generateNback(
  n: number,
  rounds: number,
  alphabet = 9,
  rng: () => number = Math.random,
) {
  const targets = new Set(
    shuffle(
      Array.from({ length: rounds }, (_, i) => i + n),
      rng,
    ).slice(0, Math.max(1, Math.round(rounds * 0.3))),
  );
  const stimuli: number[] = [];
  for (let i = 0; i < rounds + n; i++) {
    if (i >= n && targets.has(i)) stimuli.push(stimuli[i - n]);
    else {
      const options = Array.from({ length: alphabet }, (_, j) => j).filter(
        (j) => i < n || j !== stimuli[i - n],
      );
      stimuli.push(options[randomInt(0, options.length - 1, rng)]);
    }
  }
  return stimuli;
}
export function scoreTrial(
  stimuli: number[],
  i: number,
  n: number,
  responded: boolean,
) {
  if (i < n) return null;
  const match = stimuli[i] === stimuli[i - n];
  return match
    ? responded
      ? "hit"
      : "miss"
    : responded
      ? "falseAlarm"
      : "correctRejection";
}
