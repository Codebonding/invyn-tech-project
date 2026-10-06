import { useCallback, useEffect, useRef, useState } from "react";
import { courseTimeline as T } from "../utils/animation";

/**
 * phase: idle -> approach -> touch -> push -> switching -> success -> idle
 * The card index changes at "push", i.e. after the hand has touched the card.
 */
export default function useCourseInteraction({ count, reduced }) {
  const [s, setS] = useState({ index: 0, outgoing: null, phase: "idle", dir: 1 });
  const indexRef = useRef(0);
  const busy = useRef(false);
  const timers = useRef([]);

  const set = useCallback((patch) => setS((p) => ({ ...p, ...patch })), []);
  const clear = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);

  useEffect(() => { indexRef.current = s.index; }, [s.index]);
  useEffect(() => clear, [clear]);

  const goTo = useCallback(
    (target, dir = 1) => {
      const from = indexRef.current;
      if (busy.current || count < 2 || target === from) return;

      if (reduced) {
        set({ index: target, outgoing: null, phase: "idle", dir });
        return;
      }

      busy.current = true;
      const at = (ms, fn) => timers.current.push(setTimeout(fn, ms));
      const finish = () => { set({ outgoing: null, phase: "idle" }); busy.current = false; };

      if (dir > 0) {
        set({ phase: "approach", dir });
        at(T.touch, () => set({ phase: "touch" }));
        at(T.push, () => set({ index: target, outgoing: from, phase: "push" }));
        at(T.switching, () => set({ phase: "switching" }));
        at(T.success, () => set({ phase: "success" }));
        at(T.idle, finish);
      } else {
        set({ index: target, outgoing: from, phase: "switching", dir });
        at(T.backSuccess, () => set({ phase: "success" }));
        at(T.backIdle, finish);
      }
    },
    [count, reduced, set]
  );

  const next = useCallback(() => goTo((indexRef.current + 1) % count, 1), [count, goTo]);
  const prev = useCallback(() => goTo((indexRef.current - 1 + count) % count, -1), [count, goTo]);

  const reset = useCallback(() => {
    clear();
    busy.current = false;
    indexRef.current = 0;
    setS({ index: 0, outgoing: null, phase: "idle", dir: 1 });
  }, [clear]);

  return { ...s, next, prev, goTo, reset };
}