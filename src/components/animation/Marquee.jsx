import useMediaQuery from "../../hooks/useMediaQuery";
import useReducedMotion from "../../hooks/useReducedMotion";
import { mq } from "../../utils/responsive";
import { animationConfig } from "../../utils/animation";

export default function Marquee({
  items,
  renderItem,
  speed = animationConfig.marquee.course,
  direction = "left",
  gap = 24,
  pauseOnHover = true,
  label = "Carousel",
  className = "",
  paused = false
}) {
  const reduced = useReducedMotion();
  const small = useMediaQuery(mq.belowTablet);
  const manual = reduced || small;

  const row = (copy, hidden) => (
    <ul className="inv-marquee__group" aria-hidden={hidden || undefined}>
      {items.map((item, i) => (
        <li className="inv-marquee__item" key={`${copy}-${item.id ?? i}`}>
          {renderItem(item, i, hidden)}
        </li>
      ))}
    </ul>
  );

  return (
    <div
      className={`inv-marquee ${manual ? "is-manual" : ""} ${pauseOnHover ? "pause-on-hover" : ""}${paused ? "is-paused" : ""} ${className}`.trim()}
      style={{ "--inv-gap": `${gap}px`, "--inv-speed": `${speed}s` }}
      role="region"
      aria-label={label}
      tabIndex={manual ? 0 : undefined}
    >
      <div className={`inv-marquee__track dir-${direction}`}>
        {row("a", false)}
        {!manual && row("b", true)}
      </div>
    </div>
  );
}