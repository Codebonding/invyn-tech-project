import { lazy, useRef } from "react";
import { Link } from "react-router-dom";
import GradientText from "../common/GradientText";
import Icon from "../common/Icon";
import ScrollReveal from "../animation/ScrollReveal";
import SceneHost from "../animation/3d/SceneHost";
import { StaticPortal } from "../animation/3d/fallbacks";
import { ROUTES } from "../../utils/constant";
import { homeContent } from "../../utils/content";

const c = homeContent.cta;
const CTAPortal3D = lazy(() => import("../animation/3d/CTAPortal3D"));

export default function CTASection() {
  const sectionRef = useRef(null);
  const hotRef = useRef(false); // read every frame by the portal: no React re-render on hover
  const hot = {
    onMouseEnter: () => { hotRef.current = true; },
    onMouseLeave: () => { hotRef.current = false; },
    onFocus: () => { hotRef.current = true; },
    onBlur: () => { hotRef.current = false; },
  };
  const paths = c.paths.filter((p) => ROUTES[p.route]); // never render a link without a real route

  return (
    <section ref={sectionRef} id="get-started" className="inv-cta3d" aria-labelledby="cta-title">
      {c.image && <img className="inv-cta3d__img" src={c.image} alt={c.imageAlt} loading="lazy" decoding="async" />}
      <div className="inv-cta3d__bg" aria-hidden="true">
        <SceneHost scene={CTAPortal3D} sceneProps={{ hotRef }} fallback={<StaticPortal />} eventSourceRef={sectionRef} label="Digital portal" />
      </div>

      <div className="inv-cta3d__panel">
        <ScrollReveal delay={900}>
          <p className="inv-eyebrow">{c.eyebrow}</p>
          <h2 id="cta-title" className="inv-section-title">{c.title[0]}<GradientText>{c.title[1]}</GradientText>{c.title[2]}</h2>
          <p className="inv-section-desc">{c.description}</p>
        </ScrollReveal>

        <ScrollReveal delay={1300}>
          <div className="inv-cta3d__actions">
            <Link className="inv-btn inv-btn--primary" to={ROUTES.courses} {...hot}>
              {c.primary} <Icon name="arrow" size={18} className="inv-btn__arrow" />
            </Link>
            <Link className="inv-btn inv-btn--outline" to={ROUTES.contact} {...hot}>{c.secondary}</Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}