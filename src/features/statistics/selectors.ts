import type { Session } from "../../core/training/types";
import { localDay, addDays } from "../../shared/utils";
export const validSessions = (sessions: Session[]) =>
  sessions.filter(
    (s) =>
      s.status === "completed" && s.config.mode === "training" && s.metrics,
  );
export function overview(sessions: Session[]) {
  const valid = validSessions(sessions);
  return {
    count: valid.length,
    minutes: Math.round(valid.reduce((n, s) => n + s.durationSeconds, 0) / 60),
    days: new Set(valid.map((s) => localDay(new Date(s.completedAt)))).size,
  };
}
export function activity(sessions: Session[], days = 56) {
  const valid = validSessions(sessions);
  return Array.from({ length: days }, (_, i) => {
    const day = addDays(localDay(), i - days + 1);
    return {
      day,
      count: valid.filter((s) => localDay(new Date(s.completedAt)) === day)
        .length,
    };
  });
}
