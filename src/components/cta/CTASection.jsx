import { lazy, useRef } from "react";
import { Link } from "react-router-dom";
import GradientText from "../common/GradientText";
import Icon from "../common/Icon";
import ScrollReveal from "../animation/ScrollReveal";
import SceneHost from "../../components/animation/3d/SceneHost";
import { StaticPortal } from "../animation/3d/fallbacks";
import { ROUTES } from "../../utils/constant";
const CTAPortal3D = lazy(() => import("../animation/3d/CTAPortal3D"));

export default function CTASection() {
  const sectionRef = useRef(null);
  const hotRef = useRef(false); // read every frame by the portal: no React re-render on hover
  const hot = (v) => ({
    onMouseEnter: () => { hotRef.current = v; },
    onMouseLeave: () => { hotRef.current = false; },
    onFocus: () => { hotRef.current = v; },
    onBlur: () => { hotRef.current = false; },
  });

  return (
    <section ref={sectionRef} id="get-started" className="inv-cta3d" aria-labelledby="cta-title">
      <div className="inv-cta3d__bg" aria-hidden="true">
        <SceneHost scene={CTAPortal3D} sceneProps={{ hotRef }} fallback={<StaticPortal />} eventSourceRef={sectionRef} label="Digital portal" />
      </div>
      <div className="inv-cta3d__content">
        <ScrollReveal delay={900}>
          <p className="inv-eyebrow">GET STARTED</p>
          <h2 id="cta-title" className="inv-section-title">
            Ready to Build, Learn and <GradientText>Grow With INVYN TECH?</GradientText>
          </h2>
          <p className="inv-section-desc">
            Start a technology course or internship, or talk to us about web, software and AI solutions for your business.
          </p>
        </ScrollReveal>
        <ScrollReveal delay={1300}>
          <div className="inv-cta3d__actions">
            <Link className="inv-btn inv-btn--primary" to={ROUTES.courses} {...hot(true)}>
              Explore Courses <Icon name="arrow" size={18} className="inv-btn__arrow" />
            </Link>
            <Link className="inv-btn inv-btn--outline" to={ROUTES.contact} {...hot(true)}>Talk to INVYN TECH</Link>
          </div>
          <p className="inv-cta3d__more"><Link className="inv-flink inv-flink--inline" to={ROUTES.services} {...hot(true)}>Explore Services</Link></p>
        </ScrollReveal>
      </div>
    </section>
  );
}