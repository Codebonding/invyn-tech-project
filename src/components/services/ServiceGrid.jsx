import ScrollReveal from "../animation/ScrollReveal";
import ServiceCard from "./ServiceCard";
import { staggerDelay } from "../../utils/animation";

/** Responsive grid of service cards. Used by the home section, the listing page and related services. */
export default function ServiceGrid({ items }) {
  return (
    <div className="row g-4 mt-2">
      {items.map((s, i) => (
        <div className="col-12 col-md-6 col-lg-4" key={s.id}>
          <ScrollReveal delay={staggerDelay(i)} className="h-100">
            <ServiceCard {...s} />
          </ScrollReveal>
        </div>
      ))}
    </div>
  );
}