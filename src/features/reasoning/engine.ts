import { shuffle } from "../../shared/utils";
export type Clue = { before: string; after: string };
export function permutations<T>(items: T[]): T[][] {
  if (items.length <= 1) return [items];
  return items.flatMap((x, i) =>
    permutations(items.filter((_, j) => i !== j)).map((rest) => [x, ...rest]),
  );
}
export const satisfies = (order: string[], clue: Clue) =>
  order.includes(clue.before) &&
  order.includes(clue.after) &&
  order.indexOf(clue.before) < order.indexOf(clue.after);
export const solve = (people: string[], clues: Clue[]) =>
  permutations(people).filter((p) => clues.every((c) => satisfies(p, c)));
export function generateReasoning(
  level: number,
  rng: () => number = Math.random,
) {
  const people = ["가람", "나래", "다온", "라온", "마루"].slice(
    0,
    Math.min(5, level + 2),
  );
  const order = shuffle(people, rng);
  const candidates = shuffle(
    order.flatMap((before, i) =>
      order.slice(i + 1).map((after) => ({ before, after })),
    ),
    rng,
  );
  const clues: Clue[] = [];
  for (const c of candidates) {
    clues.push(c);
    if (solve(people, clues).length === 1) break;
  }
  if (solve(people, clues).length !== 1) throw Error("유일해 생성 실패");
  return { people, order, clues: shuffle(clues, rng) };
}
