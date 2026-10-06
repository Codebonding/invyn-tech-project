import { useCallback, useEffect, useRef } from "react";

/**
 * Writes CSS variables straight to the element (no React re-renders).
 * Mouse only. Touch and pen are ignored.
 */
export default function useCardTilt({ enabled = true, intensity = 1, maxX = 6, maxY = 8 } = {}) {
  const ref = useRef(null);
  const raf = useRef(0);

  const reset = useCallback(() => {
    const el = ref.current;
    cancelAnimationFrame(raf.current);
    if (!el) return;
    ["--tilt-rx", "--tilt-ry", "--par-x", "--par-y"].forEach((p) => el.style.removeProperty(p));
  }, []);

  const onPointerMove = useCallback(
    (e) => {
      if (!enabled || e.pointerType !== "mouse") return;
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width - 0.5;
      const ny = (e.clientY - r.top) / r.height - 0.5;
      cancelAnimationFrame(raf.current);
      raf.current = requestAnimationFrame(() => {
        el.style.setProperty("--tilt-rx", `${(-ny * 2 * maxX * intensity).toFixed(2)}deg`);
        el.style.setProperty("--tilt-ry", `${(nx * 2 * maxY * intensity).toFixed(2)}deg`);
        el.style.setProperty("--par-x", (nx * 2 * intensity).toFixed(3));
        el.style.setProperty("--par-y", (ny * 2 * intensity).toFixed(3));
      });
    },
    [enabled, intensity, maxX, maxY]
  );

  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  return { ref, onPointerMove, onPointerLeave: reset };
}