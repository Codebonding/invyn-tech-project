import { useEffect } from "react";

const PROPS = ["--rx", "--ry", "--mx", "--my", "--sx", "--sy"];
const POINTER_OK = "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)";

/**
 * 3D tilt + glare for any element that has the data-tilt attribute.
 * One delegated listener for the whole page, no per-card handlers; mouse only.
 * Usage: add data-tilt to a GlassCard, e.g. <GlassCard data-tilt>.
 */
export default function useTilt3D({ max = 9 } = {}) {
  useEffect(() => {
    if (!window.matchMedia(POINTER_OK).matches) return undefined;

    let el = null;
    let last = null;
    let raf = 0;

    const reset = (node) => {
      if (!node) return;
      node.classList.remove("is-tilting");
      PROPS.forEach((p) => node.style.removeProperty(p));
    };

    const apply = () => {
      raf = 0;
      if (!el || !last) return;
      const r = el.getBoundingClientRect();
      const px = Math.min(1, Math.max(0, (last.clientX - r.left) / r.width));
      const py = Math.min(1, Math.max(0, (last.clientY - r.top) / r.height));
      el.classList.add("is-tilting");
      el.style.setProperty("--ry", `${((px - 0.5) * 2 * max).toFixed(2)}deg`);
      el.style.setProperty("--rx", `${(-(py - 0.5) * 2 * max).toFixed(2)}deg`);
      el.style.setProperty("--mx", `${(px * 100).toFixed(1)}%`);
      el.style.setProperty("--my", `${(py * 100).toFixed(1)}%`);
      el.style.setProperty("--sx", `${((0.5 - px) * 28).toFixed(1)}px`);
      el.style.setProperty("--sy", `${(22 + (0.5 - py) * 14).toFixed(1)}px`);
    };

    const onMove = (e) => {
      if (e.pointerType !== "mouse") return;
      const target = e.target.closest?.("[data-tilt]") || null;
      if (target !== el) {
        reset(el);
        el = target;
      }
      if (!el) return;
      last = e;
      if (!raf) raf = requestAnimationFrame(apply);
    };
    const onLeave = () => { reset(el); el = null; };

    document.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    window.addEventListener("blur", onLeave);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("blur", onLeave);
      reset(el);
    };
  }, [max]);
}