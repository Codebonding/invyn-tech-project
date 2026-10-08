import { Component, Suspense, useEffect, useRef, useState } from "react";
import useReducedMotion from "../../../hooks/useReducedMotion";
import useMediaQuery from "../../../hooks/useMediaQuery";
import { mq } from "../../../utils/responsive";

class Boundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { if (this.props.onFail) this.props.onFail(); }
  render() { return this.state.failed ? null : this.props.children; }
}

const webglOk = () => {
  try {
    const c = document.createElement("canvas");
    return Boolean(c.getContext("webgl2") || c.getContext("webgl"));
  } catch { return false; }
};

export default function SceneHost({
  scene: Scene, sceneProps, fallback, mobile = "lite", eventSourceRef, className = "", label,
}) {
  const reduced = useReducedMotion();
  const small = useMediaQuery(mq.belowTablet);
  const tablet = useMediaQuery(mq.belowLaptop);
  const rootRef = useRef(null);
  const [near, setNear] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [gl, setGl] = useState(true);
  const [pageVisible, setPageVisible] = useState(true);

  useEffect(() => { setGl(webglOk()); }, []);
  useEffect(() => {
    const on = () => setPageVisible(!document.hidden);
    document.addEventListener("visibilitychange", on);
    return () => document.removeEventListener("visibilitychange", on);
  }, []);

  useEffect(() => {
    const el = rootRef.current;
    if (!el || typeof IntersectionObserver === "undefined") { setNear(true); return undefined; }
    const io = new IntersectionObserver(([e]) => setNear(e.isIntersecting), { rootMargin: "120px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const disabled = reduced || failed || !gl || (small && mobile === "static");

  useEffect(() => {
    if (disabled) { setMounted(false); setReady(false); return undefined; }
    if (near) { setMounted(true); return undefined; }
    const t = setTimeout(() => { setMounted(false); setReady(false); }, 3000); // free the GL context
    return () => clearTimeout(t);
  }, [near, disabled]);

  const quality = small ? "low" : tablet ? "lite" : "high";

  return (
    <div ref={rootRef} className={`inv-scene ${ready ? "is-live" : ""} ${className}`.trim()} data-quality={quality}>
      <div className="inv-scene__fallback">{fallback}</div>
      {mounted && !disabled && (
        <div className="inv-scene__canvas" role="presentation" aria-hidden="true" data-label={label}>
          <Boundary onFail={() => setFailed(true)}>
            <Suspense fallback={null}>
              <Scene
                {...sceneProps}
                quality={quality}
                active={near && pageVisible}
                eventSource={eventSourceRef || rootRef}
                onReady={() => setReady(true)}
              />
            </Suspense>
          </Boundary>
        </div>
      )}
    </div>
  );
}