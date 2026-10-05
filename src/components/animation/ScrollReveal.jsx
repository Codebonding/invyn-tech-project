import useIntersectionObserver from "../../hooks/useIntersectionObserver";
import useReducedMotion from "../../hooks/useReducedMotion";
import { animationConfig } from "../../utils/animation";

const AXIS = { up: [0, 1], down: [0, -1], left: [1, 0], right: [-1, 0] };

export default function ScrollReveal({
  children,
  delay = 0,
  duration = animationConfig.duration.slow,
  distance = animationConfig.distance.medium,
  direction = "up",
  once = true,
  className = "",
  as: Tag = "div",
}) {
  const reduced = useReducedMotion();
  const [ref, visible] = useIntersectionObserver({ once });
  const [x, y] = AXIS[direction] || AXIS.up;
  const show = reduced || visible;

  return (
    <Tag
      ref={ref}
      className={`inv-reveal ${show ? "is-visible" : ""} ${className}`.trim()}
      style={{
        "--inv-rx": `${x * distance}px`,
        "--inv-ry": `${y * distance}px`,
        "--inv-rd": `${duration}ms`,
        "--inv-rdelay": `${delay}ms`,
      }}
    >
      {children}
    </Tag>
  );
}