import type { Card } from "../../infrastructure/storage/schema";
import { addDays, localDay } from "../../shared/utils";
export function scheduleCard(
  card: Card,
  rating: "again" | "hard" | "good",
  today = localDay(),
): Card {
  const stage =
    rating === "again"
      ? 0
      : rating === "hard"
        ? 0
        : Math.min(8, card.stage + 1);
  const intervals = [1, 1, 3, 7, 14, 30, 60, 90, 180];
  const interval =
    rating === "again" ? 1 : rating === "hard" ? 1 : intervals[stage];
  return {
    ...card,
    stage,
    due: addDays(today, interval),
    updatedAt: new Date().toISOString(),
  };
}
