import { useEffect, useState } from "react";
import Icon from "../common/Icon";
import useIntersectionObserver from "../../hooks/useIntersectionObserver";
import useReducedMotion from "../../hooks/useReducedMotion";
import { animationConfig } from "../../utils/animation";
import { pad2 } from "../../utils/helpers";

export default function InternshipJourney({ steps }) {
  const reduced = useReducedMotion();
  const [ref, visible] = useIntersectionObserver({ threshold: 0.3 });
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (reduced) { setActive(steps.length); return undefined; }
    if (!visible) return undefined;
    let n = 0;
    const timer = setInterval(() => {
      n += 1;
      setActive(n);
      if (n >= steps.length) clearInterval(timer);
    }, animationConfig.journey.stepDelay);
    return () => clearInterval(timer);
  }, [visible, reduced, steps.length]);

  const progress = steps.length > 1 ? Math.max(0, active - 1) / (steps.length - 1) : 0;

  return (
    <div ref={ref} className="inv-journey" style={{ "--inv-progress": progress }}>
      <div className="inv-journey__line" aria-hidden="true"><span /></div>
      <ol className="inv-journey__steps">
        {steps.map((s, i) => (
          <li key={s.id} className={`inv-journey__step ${i < active ? "is-active" : ""}`}>
            <span className="inv-journey__node">
              <Icon name={s.icon} size={20} />
              <span className="inv-journey__num">{pad2(s.id)}</span>
            </span>
            <h3 className="inv-journey__title">{s.title}</h3>
            <p className="inv-journey__desc">{s.description}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}