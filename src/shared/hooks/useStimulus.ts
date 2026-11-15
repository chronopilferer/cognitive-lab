import { useState } from "react";
import { useDeadline } from "./useDeadline";
/** Keep the response interval intact; show an explicit blank between stimuli. */
export function useStimulus(
  key: number | string,
  interval: number,
  timed: boolean,
) {
  const [hiddenKey, setHiddenKey] = useState<number | string | null>(null);
  useDeadline(
    key,
    timed ? Math.max(200, interval - Math.min(300, interval * 0.25)) : null,
    () => setHiddenKey(key),
  );
  return hiddenKey !== key;
}
