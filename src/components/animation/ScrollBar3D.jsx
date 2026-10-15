import { useEffect, useRef, useState } from "react";
import useReducedMotion from "../../hooks/useReducedMotion";
import "./ScrollBar3D.css";

const FINE_POINTER = "(hover: hover) and (pointer: fine)"; // mouse / trackpad devices only
const MIN_THUMB = 80;

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

/**
 * Full-length "flow" scrollbar: a slim glass rail with a flowing gradient fill, a glass handle and a
 * circular progress ring that pops out on hover. Drag the handle, press anywhere on the rail to jump and
 * keep dragging, or use the keyboard (Arrow / Page / Home / End). Wheel, touch and keys still scroll natively.
 */
export default function ScrollBar3D() {
  const reduced = useReducedMotion();
  const [enabled] = useState(
    () =>
      typeof window !== "undefined" && window.matchMedia(FINE_POINTER).matches,
  );

  const railRef = useRef(null);
  const trackRef = useRef(null);
  const thumbRef = useRef(null);
  const pctRef = useRef(null);
  const st = useRef({ raf: 0, drag: null, metrics: null, paint: null });

  const reducedRef = useRef(reduced);
  useEffect(() => {
    reducedRef.current = reduced;
  }, [reduced]);

  useEffect(() => {
    if (!enabled) return undefined;
    const root = document.documentElement;
    const rail = railRef.current;
    const track = trackRef.current;
    const thumb = thumbRef.current;
    const pctEl = pctRef.current;
    if (!rail || !track || !thumb) return undefined;
    const s = st.current;
    root.classList.add("inv-has-sb3d");

    const metrics = () => {
      const total = root.scrollHeight;
      const view = window.innerHeight;
      const trackH = track.clientHeight;
      return {
        doc: Math.max(1, total - view),
        trackH,
        thumbH: clamp(
          (trackH * view) / Math.max(1, total),
          MIN_THUMB,
          Math.max(MIN_THUMB, trackH),
        ),
        scrollable: total - view > 2,
      };
    };

    const paint = () => {
      const m = metrics();
      rail.classList.toggle("is-unscrollable", !m.scrollable);
      const p = clamp(window.scrollY / m.doc, 0, 1);
      const y = p * (m.trackH - m.thumbH);
      const pct = Math.round(p * 100);
      track.style.setProperty("--fill", `${y + m.thumbH}px`);
      thumb.style.height = `${m.thumbH}px`;
      thumb.style.setProperty("--y", `${y}px`);
      thumb.style.setProperty("--pct", String(pct));
      if (pctEl && pctEl.textContent !== String(pct))
        pctEl.textContent = String(pct);
      if (thumb.getAttribute("aria-valuenow") !== String(pct))
        thumb.setAttribute("aria-valuenow", String(pct));
    };

    const kick = () => {
      if (s.raf) return;
      s.raf = requestAnimationFrame(() => {
        s.raf = 0;
        paint();
      });
    };

    // The fill flows faster while the page is moving.
    let timer = 0;
    const onScroll = () => {
      rail.classList.add("is-scrolling");
      clearTimeout(timer);
      timer = setTimeout(() => rail.classList.remove("is-scrolling"), 220);
      paint();
    };

    s.metrics = metrics;
    s.paint = paint;
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", kick);
    const ro =
      typeof ResizeObserver === "undefined" ? null : new ResizeObserver(kick);
    ro?.observe(document.body);
    kick();

    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(s.raf);
      s.raf = 0;
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", kick);
      ro?.disconnect();
      root.classList.remove("inv-has-sb3d");
    };
  }, [enabled]);

  if (!enabled) return null;

  // "instant" is required: Bootstrap sets scroll-behavior: smooth on :root, which would animate "auto" scrolls
  // and make the handle trail behind the mouse. Painting right after keeps the handle glued to the pointer.
  const jumpTo = (top) => {
    window.scrollTo({ top, behavior: "instant" });
    st.current.paint?.();
  };
  const startDrag = (e, top) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    st.current.drag = { y: e.clientY, top };
    railRef.current?.classList.add("is-dragging");
  };

  const onDown = (e) => {
    if (e.button !== 0) return;
    const m = st.current.metrics?.();
    if (!m) return;
    e.preventDefault();
    if (e.target.closest(".sb3d__thumb")) {
      startDrag(e, window.scrollY);
      return;
    }
    // Pressing the rail jumps there at once, and you can keep dragging from the same press.
    const rect = trackRef.current.getBoundingClientRect();
    const ratio = clamp(
      (e.clientY - rect.top - m.thumbH / 2) / Math.max(1, m.trackH - m.thumbH),
      0,
      1,
    );
    const top = ratio * m.doc;
    jumpTo(top);
    startDrag(e, top);
  };
  const onMove = (e) => {
    const d = st.current.drag;
    const m = st.current.metrics?.();
    if (!d || !m) return;
    jumpTo(
      d.top + (e.clientY - d.y) * (m.doc / Math.max(1, m.trackH - m.thumbH)),
    );
  };
  const endDrag = () => {
    st.current.drag = null;
    railRef.current?.classList.remove("is-dragging");
  };

  const onKey = (e) => {
    const steps = {
      ArrowDown: 60,
      ArrowUp: -60,
      PageDown: window.innerHeight * 0.9,
      PageUp: -window.innerHeight * 0.9,
    };
    if (e.key in steps) {
      e.preventDefault();
      window.scrollBy({ top: steps[e.key], behavior: "instant" });
    } else if (e.key === "Home") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "instant" });
    } else if (e.key === "End") {
      e.preventDefault();
      window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: "instant",
      });
    }
  };

  return (
    <div
      ref={railRef}
      className="sb3d position-fixed top-0 end-0 bottom-0 d-none d-md-block user-select-none"
    >
      <div
        ref={trackRef}
        className="sb3d__track"
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <div className="sb3d__fill" aria-hidden="true" />
        <div
          ref={thumbRef}
          className="sb3d__thumb"
          role="scrollbar"
          tabIndex={0}
          aria-label="Page scroll"
          aria-controls="root"
          aria-orientation="vertical"
          aria-valuemin={0}
          aria-valuemax={100}
          onKeyDown={onKey}
        >
          <span className="sb3d__grip" aria-hidden="true" />
          <output className="sb3d__badge" aria-hidden="true">
            <span className="sb3d__pct">
              <span ref={pctRef}>0</span>%
            </span>
          </output>
        </div>
      </div>
    </div>
  );
}
