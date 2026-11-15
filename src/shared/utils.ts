export function seeded(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export const randomInt = (
  min: number,
  max: number,
  rng: () => number = Math.random,
) => Math.floor(rng() * (max - min + 1)) + min;
export function shuffle<T>(list: T[], rng: () => number = Math.random) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = randomInt(0, i, rng);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
export function localDay(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
export function addDays(day: string, days: number) {
  const d = new Date(`${day}T12:00:00`);
  d.setDate(d.getDate() + days);
  return localDay(d);
}
export const uniqueId = () => crypto.randomUUID();
