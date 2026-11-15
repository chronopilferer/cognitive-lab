import { useEffect, useRef } from "react";
/** One timer per phase. Parent invalidates timed sessions on tab hiding. */
export function useDeadline(
  key: string | number,
  ms: number | null,
  callback: () => void,
) {
  const fn = useRef(callback);
  fn.current = callback;
  useEffect(() => {
    if (ms === null) return;
    const target = performance.now() + ms;
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      const left = target - performance.now();
      if (left <= 0) fn.current();
      else timer = setTimeout(tick, left);
    };
    timer = setTimeout(tick, ms);
    return () => clearTimeout(timer);
  }, [key, ms]);
}
